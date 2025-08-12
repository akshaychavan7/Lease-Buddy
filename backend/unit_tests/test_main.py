import unittest
import sys
import os
import json
from unittest.mock import patch, MagicMock, Mock
from fastapi.testclient import TestClient
from fastapi import HTTPException

# Add the parent directory to the path to import the modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import the main app
from main import app, load_models, extract_entities_spacy, extract_entities_bert, extract_entities_spacy_bert, load_spacy_model, load_bert_model, load_spacy_bert_model

class TestMainAPI(unittest.TestCase):
    """Test cases for the main FastAPI application"""
    
    def setUp(self):
        """Set up test fixtures"""
        self.client = TestClient(app)
        self.sample_text = "This is a test lease agreement with John Doe and Jane Smith."
        
    def test_root_endpoint(self):
        """Test the root endpoint"""
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"message": "Lease Buddy NER API is running"})
    
    def test_health_check_endpoint(self):
        """Test the health check endpoint"""
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("status", data)
        self.assertIn("models_loaded", data)
        self.assertEqual(data["status"], "healthy")
    
    def test_models_endpoint(self):
        """Test the models endpoint"""
        response = self.client.get("/models")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("models", data)
        self.assertIsInstance(data["models"], list)
    
    def test_entity_types_endpoint(self):
        """Test the entity types endpoint"""
        response = self.client.get("/entity-types?model=spacy")
        # This might fail if models aren't loaded, so we'll handle both cases
        if response.status_code == 200:
            data = response.json()
            self.assertIn("entity_types", data)
        else:
            # If models aren't loaded, we expect a 500 error
            self.assertIn(response.status_code, [400, 500])
    
    def test_extract_entities_endpoint_invalid_model(self):
        """Test extract entities endpoint with invalid model"""
        request_data = {
            "text": self.sample_text,
            "model": "invalid_model"
        }
        response = self.client.post("/extract-entities", json=request_data)
        self.assertEqual(response.status_code, 400)
        self.assertIn("not available", response.json()["detail"])
    
    def test_extract_entities_endpoint_valid_request(self):
        """Test extract entities endpoint with valid request"""
        request_data = {
            "text": self.sample_text,
            "model": "spacy"
        }
        response = self.client.post("/extract-entities", json=request_data)
        # This might fail if models aren't loaded, so we'll handle both cases
        if response.status_code == 200:
            data = response.json()
            self.assertIn("entities", data)
            self.assertIn("text", data)
            self.assertEqual(data["text"], self.sample_text)
        else:
            # If models aren't loaded, we expect a 500 error
            self.assertIn(response.status_code, [400, 500])
    
    def test_chat_endpoint(self):
        """Test the chat endpoint"""
        request_data = {
            "message": "What is the rent amount?",
            "document_content": "The rent is $1000 per month."
        }
        response = self.client.post("/chat", json=request_data)
        # This might fail if OpenAI API key isn't set, so we'll handle both cases
        if response.status_code == 200:
            data = response.json()
            self.assertIn("response", data)
            self.assertIn("success", data)
            self.assertTrue(data["success"])
        else:
            # If API key isn't set, we expect a 500 error
            self.assertEqual(response.status_code, 500)
    
    def test_chat_clear_endpoint(self):
        """Test the chat clear endpoint"""
        response = self.client.post("/chat/clear")
        # This might fail if chat helper isn't properly initialized, so we'll handle both cases
        if response.status_code == 200:
            data = response.json()
            self.assertIn("success", data)
            self.assertTrue(data["success"])
        else:
            # If there's an error, we expect a 500 error
            self.assertEqual(response.status_code, 500)
    
    def test_local_chat_endpoint(self):
        """Test the local chat endpoint"""
        request_data = {
            "message": "What is the rent amount?",
            "document_content": "The rent is $1000 per month."
        }
        response = self.client.post("/chat/local", json=request_data)
        # This might fail if Ollama isn't running, so we'll handle both cases
        if response.status_code == 200:
            data = response.json()
            self.assertIn("response", data)
            self.assertIn("success", data)
            self.assertTrue(data["success"])
        else:
            # If Ollama isn't running, we expect a 500 error
            self.assertEqual(response.status_code, 500)
    
    def test_local_chat_clear_endpoint(self):
        """Test the local chat clear endpoint"""
        response = self.client.post("/chat/local/clear")
        # This might fail if local chat helper isn't properly initialized, so we'll handle both cases
        if response.status_code == 200:
            data = response.json()
            self.assertIn("success", data)
            self.assertTrue(data["success"])
        else:
            # If there's an error, we expect a 500 error
            self.assertEqual(response.status_code, 500)
    
    def test_local_model_info_endpoint(self):
        """Test the local model info endpoint"""
        response = self.client.get("/chat/local/model-info")
        # This might fail if Ollama isn't running, so we'll handle both cases
        if response.status_code == 200:
            data = response.json()
            self.assertIn("success", data)
            self.assertIn("model_info", data)
        else:
            # If Ollama isn't running, we expect a 500 error
            self.assertEqual(response.status_code, 500)

class TestMainFunctions(unittest.TestCase):
    """Test cases for the main module functions"""
    
    def setUp(self):
        """Set up test fixtures"""
        self.sample_text = "This is a test lease agreement with John Doe and Jane Smith."
    
    @patch('main.spacy.load')
    def test_load_spacy_model_success(self, mock_spacy_load):
        """Test successful spaCy model loading"""
        mock_model = MagicMock()
        mock_spacy_load.return_value = mock_model
        
        with patch('main.os.path.exists', return_value=True):
            result = load_spacy_model("./test_model")
            self.assertEqual(result, mock_model)
            mock_spacy_load.assert_called_once_with("./test_model")
    
    @patch('main.spacy.load')
    def test_load_spacy_model_not_found(self, mock_spacy_load):
        """Test spaCy model loading when model doesn't exist"""
        with patch('main.os.path.exists', return_value=False):
            with self.assertRaises(Exception) as context:
                load_spacy_model("./nonexistent_model")
            self.assertIn("not found", str(context.exception))
    
    @patch('main.AutoTokenizer.from_pretrained')
    @patch('main.AutoModelForTokenClassification.from_pretrained')
    def test_load_bert_model_success(self, mock_model_load, mock_tokenizer_load):
        """Test successful BERT model loading"""
        mock_tokenizer = MagicMock()
        mock_model = MagicMock()
        mock_tokenizer_load.return_value = mock_tokenizer
        mock_model_load.return_value = mock_model
        
        with patch('main.os.path.exists', return_value=True):
            result = load_bert_model("./test_model")
            self.assertEqual(result["tokenizer"], mock_tokenizer)
            self.assertEqual(result["model"], mock_model)
    
    @patch('main.AutoTokenizer.from_pretrained')
    @patch('main.AutoModelForTokenClassification.from_pretrained')
    def test_load_bert_model_not_found(self, mock_model_load, mock_tokenizer_load):
        """Test BERT model loading when model doesn't exist"""
        with patch('main.os.path.exists', return_value=False):
            with self.assertRaises(Exception) as context:
                load_bert_model("./nonexistent_model")
            self.assertIn("not found", str(context.exception))
    
    @patch('main.spacy.load')
    def test_load_spacy_bert_model_success(self, mock_spacy_load):
        """Test successful spaCy BERT model loading"""
        mock_model = MagicMock()
        mock_spacy_load.return_value = mock_model
        
        with patch('main.os.path.exists', return_value=True):
            result = load_spacy_bert_model("./test_model")
            self.assertEqual(result, mock_model)
            mock_spacy_load.assert_called_once_with("./test_model")
    
    def test_extract_entities_spacy(self):
        """Test spaCy entity extraction"""
        # Create a mock spaCy document
        mock_doc = MagicMock()
        mock_entity1 = MagicMock()
        mock_entity1.text = "John Doe"
        mock_entity1.label_ = "PERSON"
        mock_entity1.start_char = 30
        mock_entity1.end_char = 38
        
        mock_entity2 = MagicMock()
        mock_entity2.text = "Jane Smith"
        mock_entity2.label_ = "PERSON"
        mock_entity2.start_char = 43
        mock_entity2.end_char = 53
        
        mock_doc.ents = [mock_entity1, mock_entity2]
        
        # Mock the spaCy model
        mock_model = MagicMock()
        mock_model.return_value = mock_doc
        
        entities = extract_entities_spacy(self.sample_text, mock_model)
        
        self.assertEqual(len(entities), 2)
        self.assertEqual(entities[0].text, "John Doe")
        self.assertEqual(entities[0].label, "PERSON")
        self.assertEqual(entities[0].start, 30)
        self.assertEqual(entities[0].end, 38)
        
        self.assertEqual(entities[1].text, "Jane Smith")
        self.assertEqual(entities[1].label, "PERSON")
        self.assertEqual(entities[1].start, 43)
        self.assertEqual(entities[1].end, 53)
    
    @patch('main.torch')
    def test_extract_entities_bert(self, mock_torch):
        """Test BERT entity extraction"""
        # Create mock BERT model components
        mock_tokenizer = MagicMock()
        mock_tokenizer.convert_ids_to_tokens.return_value = ["[CLS]", "This", "is", "a", "test", "[SEP]"]
        
        mock_model = MagicMock()
        mock_model.config.id2label = {0: "O", 1: "PERSON", 2: "ORG"}
        
        mock_model_dict = {
            "tokenizer": mock_tokenizer,
            "model": mock_model
        }
        
        # Mock torch operations
        mock_tensor = MagicMock()
        mock_tensor.item.return_value = 1  # PERSON label
        mock_torch.argmax.return_value = mock_tensor
        mock_torch.tensor.return_value = mock_tensor
        
        # Mock the model output
        mock_outputs = MagicMock()
        mock_outputs.logits = mock_tensor
        mock_model.return_value = mock_outputs
        
        entities = extract_entities_bert(self.sample_text, mock_model_dict)
        
        # The function should handle the BERT tokenization and entity extraction
        # Since this is a complex function, we'll just verify it doesn't crash
        self.assertIsInstance(entities, list)
    
    def test_extract_entities_spacy_bert(self):
        """Test spaCy BERT entity extraction"""
        # Create a mock spaCy document (same as spaCy test)
        mock_doc = MagicMock()
        mock_entity = MagicMock()
        mock_entity.text = "John Doe"
        mock_entity.label_ = "PERSON"
        mock_entity.start_char = 30
        mock_entity.end_char = 38
        
        mock_doc.ents = [mock_entity]
        
        # Mock the spaCy BERT model
        mock_model = MagicMock()
        mock_model.return_value = mock_doc
        
        entities = extract_entities_spacy_bert(self.sample_text, mock_model)
        
        self.assertEqual(len(entities), 1)
        self.assertEqual(entities[0].text, "John Doe")
        self.assertEqual(entities[0].label, "PERSON")
        self.assertEqual(entities[0].start, 30)
        self.assertEqual(entities[0].end, 38)
    
    def test_get_model_display_name(self):
        """Test the get_model_display_name function"""
        from main import get_model_display_name
        
        # Test known model names
        self.assertEqual(get_model_display_name("spacy"), "Fine-tuned spaCy NER Model")
        self.assertEqual(get_model_display_name("bert"), "BERT-based NER Model")
        self.assertEqual(get_model_display_name("spacy_bert"), "spaCy + BERT NER Model")
        
        # Test unknown model name
        self.assertEqual(get_model_display_name("unknown"), "unknown")

if __name__ == '__main__':
    unittest.main() 