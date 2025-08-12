import unittest
import sys
import os
from unittest.mock import patch, MagicMock, Mock
import json
import requests

# Add the parent directory to the path to import the modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import the local chat helper
from local_chat_helper import LocalChatHelper

class TestLocalChatHelper(unittest.TestCase):
    """Test cases for the LocalChatHelper class"""
    
    def setUp(self):
        """Set up test fixtures"""
        self.sample_document = "This is a sample lease agreement. The rent is $1000 per month."
        self.sample_message = "What is the rent amount?"
    
    @patch('local_chat_helper.requests.get')
    def test_initialization_success(self, mock_get):
        """Test successful LocalChatHelper initialization"""
        # Mock successful connection to Ollama
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_get.return_value = mock_response
        
        chat_helper = LocalChatHelper()
        
        self.assertEqual(chat_helper.conversation_history, [])
        self.assertIsNone(chat_helper.document_context)
        self.assertEqual(chat_helper.model_name, "phi3:mini")
        self.assertEqual(chat_helper.ollama_url, "http://localhost:11434")
    
    @patch('local_chat_helper.requests.get')
    def test_initialization_with_custom_params(self, mock_get):
        """Test LocalChatHelper initialization with custom parameters"""
        # Mock successful connection to Ollama
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_get.return_value = mock_response
        
        chat_helper = LocalChatHelper(
            model_name="llama2:7b",
            ollama_url="http://localhost:8080"
        )
        
        self.assertEqual(chat_helper.model_name, "llama2:7b")
        self.assertEqual(chat_helper.ollama_url, "http://localhost:8080")
    
    @patch('local_chat_helper.requests.get')
    def test_initialization_connection_failure(self, mock_get):
        """Test LocalChatHelper initialization with connection failure"""
        # Mock connection failure
        mock_get.side_effect = requests.exceptions.RequestException("Connection failed")
        
        with self.assertRaises(ConnectionError) as context:
            LocalChatHelper()
        
        self.assertIn("Failed to connect to Ollama server", str(context.exception))
    
    @patch('local_chat_helper.requests.get')
    def test_initialization_server_error(self, mock_get):
        """Test LocalChatHelper initialization with server error"""
        # Mock server error response
        mock_response = MagicMock()
        mock_response.status_code = 500
        mock_get.return_value = mock_response
        
        with self.assertRaises(ConnectionError) as context:
            LocalChatHelper()
        
        self.assertIn("Ollama server not responding", str(context.exception))
    
    @patch('local_chat_helper.requests.get')
    def test_set_document_context(self, mock_get):
        """Test setting document context"""
        # Mock successful connection
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_get.return_value = mock_response
        
        chat_helper = LocalChatHelper()
        chat_helper.set_document_context(self.sample_document)
        
        self.assertEqual(chat_helper.document_context, self.sample_document)
    
    @patch('local_chat_helper.requests.get')
    def test_add_message(self, mock_get):
        """Test adding messages to conversation history"""
        # Mock successful connection
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_get.return_value = mock_response
        
        chat_helper = LocalChatHelper()
        chat_helper.add_message("user", "Hello")
        chat_helper.add_message("assistant", "Hi there!")
        
        self.assertEqual(len(chat_helper.conversation_history), 2)
        self.assertEqual(chat_helper.conversation_history[0]["role"], "user")
        self.assertEqual(chat_helper.conversation_history[0]["content"], "Hello")
        self.assertEqual(chat_helper.conversation_history[1]["role"], "assistant")
        self.assertEqual(chat_helper.conversation_history[1]["content"], "Hi there!")
    
    @patch('local_chat_helper.requests.get')
    def test_get_system_prompt_without_context(self, mock_get):
        """Test system prompt generation without document context"""
        # Mock successful connection
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_get.return_value = mock_response
        
        chat_helper = LocalChatHelper()
        prompt = chat_helper.get_system_prompt()
        
        # Check that the base prompt is included
        self.assertIn("You are a helpful AI assistant specialized in analyzing lease agreements", prompt)
        self.assertIn("No document has been uploaded yet", prompt)
        self.assertNotIn(self.sample_document, prompt)
    
    @patch('local_chat_helper.requests.get')
    def test_get_system_prompt_with_context(self, mock_get):
        """Test system prompt generation with document context"""
        # Mock successful connection
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_get.return_value = mock_response
        
        chat_helper = LocalChatHelper()
        chat_helper.set_document_context(self.sample_document)
        prompt = chat_helper.get_system_prompt()
        
        # Check that the document context is included
        self.assertIn("You are a helpful AI assistant specialized in analyzing lease agreements", prompt)
        self.assertIn(self.sample_document, prompt)
        self.assertNotIn("No document has been uploaded yet", prompt)
    
    @patch('local_chat_helper.requests.get')
    @patch('local_chat_helper.requests.post')
    def test_get_chat_response_success(self, mock_post, mock_get):
        """Test successful chat response generation"""
        # Mock successful connection
        mock_get_response = MagicMock()
        mock_get_response.status_code = 200
        mock_get.return_value = mock_get_response
        
        # Mock successful chat response
        mock_post_response = MagicMock()
        mock_post_response.status_code = 200
        mock_post_response.json.return_value = {
            "message": {
                "content": "The rent amount is $1000 per month."
            }
        }
        mock_post.return_value = mock_post_response
        
        chat_helper = LocalChatHelper()
        chat_helper.set_document_context(self.sample_document)
        
        # Get response
        response = chat_helper.get_chat_response(self.sample_message)
        
        # Verify response
        self.assertEqual(response, "The rent amount is $1000 per month.")
        
        # Verify conversation history was updated
        self.assertEqual(len(chat_helper.conversation_history), 2)
        self.assertEqual(chat_helper.conversation_history[0]["role"], "user")
        self.assertEqual(chat_helper.conversation_history[0]["content"], self.sample_message)
        self.assertEqual(chat_helper.conversation_history[1]["role"], "assistant")
        self.assertEqual(chat_helper.conversation_history[1]["content"], "The rent amount is $1000 per month.")
        
        # Verify Ollama was called with correct parameters
        mock_post.assert_called_once()
        call_args = mock_post.call_args
        self.assertEqual(call_args[0][0], "http://localhost:11434/api/chat")
        
        # Verify payload structure
        payload = call_args[1]["json"]
        self.assertEqual(payload["model"], "phi3:mini")
        self.assertFalse(payload["stream"])
        self.assertEqual(payload["options"]["temperature"], 0.7)
        self.assertEqual(payload["options"]["top_p"], 0.9)
        self.assertEqual(payload["options"]["max_tokens"], 1000)
        
        # Verify messages structure
        messages = payload["messages"]
        self.assertEqual(len(messages), 2)  # system + user (assistant message not added yet)
        self.assertEqual(messages[0]["role"], "system")
        self.assertIn(self.sample_document, messages[0]["content"])
        self.assertEqual(messages[1]["role"], "user")
        self.assertEqual(messages[1]["content"], self.sample_message)
    
    @patch('local_chat_helper.requests.get')
    @patch('local_chat_helper.requests.post')
    def test_get_chat_response_api_error(self, mock_post, mock_get):
        """Test chat response generation with API error"""
        # Mock successful connection
        mock_get_response = MagicMock()
        mock_get_response.status_code = 200
        mock_get.return_value = mock_get_response
        
        # Mock API error
        mock_post_response = MagicMock()
        mock_post_response.status_code = 500
        mock_post_response.text = "Internal Server Error"
        mock_post.return_value = mock_post_response
        
        chat_helper = LocalChatHelper()
        
        # Get response
        response = chat_helper.get_chat_response(self.sample_message)
        
        # Verify error response
        self.assertIn("I apologize, but I encountered an error", response)
        
        # Verify conversation history was still updated with user message
        self.assertEqual(len(chat_helper.conversation_history), 1)
        self.assertEqual(chat_helper.conversation_history[0]["role"], "user")
        self.assertEqual(chat_helper.conversation_history[0]["content"], self.sample_message)
    
    @patch('local_chat_helper.requests.get')
    @patch('local_chat_helper.requests.post')
    def test_get_chat_response_timeout(self, mock_post, mock_get):
        """Test chat response generation with timeout"""
        # Mock successful connection
        mock_get_response = MagicMock()
        mock_get_response.status_code = 200
        mock_get.return_value = mock_get_response
        
        # Mock timeout
        mock_post.side_effect = requests.exceptions.Timeout("Request timed out")
        
        chat_helper = LocalChatHelper()
        
        # Get response
        response = chat_helper.get_chat_response(self.sample_message)
        
        # Verify timeout response
        self.assertIn("request timed out", response.lower())
        self.assertIn("try again with a shorter question", response)
    
    @patch('local_chat_helper.requests.get')
    @patch('local_chat_helper.requests.post')
    def test_get_chat_response_network_error(self, mock_post, mock_get):
        """Test chat response generation with network error"""
        # Mock successful connection
        mock_get_response = MagicMock()
        mock_get_response.status_code = 200
        mock_get.return_value = mock_get_response
        
        # Mock network error
        mock_post.side_effect = requests.exceptions.RequestException("Network error")
        
        chat_helper = LocalChatHelper()
        
        # Get response
        response = chat_helper.get_chat_response(self.sample_message)
        
        # Verify network error response
        self.assertIn("network error", response.lower())
        self.assertIn("check your connection", response)
    
    @patch('local_chat_helper.requests.get')
    def test_clear_conversation(self, mock_get):
        """Test clearing conversation history"""
        # Mock successful connection
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_get.return_value = mock_response
        
        chat_helper = LocalChatHelper()
        
        # Add some messages
        chat_helper.add_message("user", "Hello")
        chat_helper.add_message("assistant", "Hi!")
        chat_helper.set_document_context(self.sample_document)
        
        # Clear conversation
        chat_helper.clear_conversation()
        
        # Verify conversation is cleared but document context remains
        self.assertEqual(chat_helper.conversation_history, [])
        self.assertEqual(chat_helper.document_context, self.sample_document)
    
    @patch('local_chat_helper.requests.get')
    def test_get_conversation_history(self, mock_get):
        """Test getting conversation history"""
        # Mock successful connection
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_get.return_value = mock_response
        
        chat_helper = LocalChatHelper()
        
        # Add some messages
        chat_helper.add_message("user", "Hello")
        chat_helper.add_message("assistant", "Hi!")
        
        # Get history
        history = chat_helper.get_conversation_history()
        
        # Verify history is returned as a copy
        self.assertEqual(history, chat_helper.conversation_history)
        self.assertIsNot(history, chat_helper.conversation_history)  # Should be a copy
        
        # Verify content
        self.assertEqual(len(history), 2)
        self.assertEqual(history[0]["role"], "user")
        self.assertEqual(history[0]["content"], "Hello")
        self.assertEqual(history[1]["role"], "assistant")
        self.assertEqual(history[1]["content"], "Hi!")
    
    @patch('local_chat_helper.requests.get')
    def test_get_model_info_success(self, mock_get):
        """Test getting model information successfully"""
        # Mock successful connection
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "models": [
                {
                    "name": "phi3:mini",
                    "size": 1234567890,
                    "modified_at": "2024-01-01T00:00:00Z",
                    "digest": "sha256:abc123"
                }
            ]
        }
        mock_get.return_value = mock_response
        
        chat_helper = LocalChatHelper()
        model_info = chat_helper.get_model_info()
        
        # Verify model info
        self.assertEqual(model_info["name"], "phi3:mini")
        self.assertEqual(model_info["size"], 1234567890)
        self.assertEqual(model_info["modified_at"], "2024-01-01T00:00:00Z")
        self.assertEqual(model_info["digest"], "sha256:abc123")
    
    @patch('local_chat_helper.requests.get')
    def test_get_model_info_model_not_found(self, mock_get):
        """Test getting model information when model is not found"""
        # Mock successful connection but model not in list
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "models": [
                {
                    "name": "llama2:7b",
                    "size": 9876543210,
                    "modified_at": "2024-01-01T00:00:00Z",
                    "digest": "sha256:def456"
                }
            ]
        }
        mock_get.return_value = mock_response
        
        chat_helper = LocalChatHelper()
        model_info = chat_helper.get_model_info()
        
        # Verify model info shows unknown status
        self.assertEqual(model_info["name"], "phi3:mini")
        self.assertEqual(model_info["status"], "unknown")
    
    @patch('local_chat_helper.requests.get')
    def test_get_model_info_error(self, mock_get):
        """Test getting model information with error"""
        # Mock successful initial connection
        mock_get_response = MagicMock()
        mock_get_response.status_code = 200
        mock_get.return_value = mock_get_response
        
        chat_helper = LocalChatHelper()
        
        # Now mock the model info request to fail
        mock_get.side_effect = Exception("Connection error")
        model_info = chat_helper.get_model_info()
        
        # Verify error is captured
        self.assertEqual(model_info["name"], "phi3:mini")
        self.assertIn("error", model_info)
        self.assertEqual(model_info["error"], "Connection error")
    
    @patch('local_chat_helper.requests.get')
    def test_system_prompt_guidelines(self, mock_get):
        """Test that system prompt includes all guidelines"""
        # Mock successful connection
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_get.return_value = mock_response
        
        chat_helper = LocalChatHelper()
        prompt = chat_helper.get_system_prompt()
        
        # Check for key guidelines
        guidelines = [
            "Always base your answers on the document content provided",
            "If a question cannot be answered from the document, clearly state that",
            "Provide accurate and helpful information about lease terms, dates, amounts, and obligations",
            "Use clear, professional language",
            "If you're unsure about something, say so rather than guessing",
            "Be concise but thorough in your responses",
            "Format your responses with proper markdown when appropriate"
        ]
        
        for guideline in guidelines:
            self.assertIn(guideline, prompt)
    
    @patch('local_chat_helper.requests.get')
    @patch('local_chat_helper.requests.post')
    def test_chat_response_without_document_context(self, mock_post, mock_get):
        """Test chat response when no document context is set"""
        # Mock successful connection
        mock_get_response = MagicMock()
        mock_get_response.status_code = 200
        mock_get.return_value = mock_get_response
        
        # Mock successful chat response
        mock_post_response = MagicMock()
        mock_post_response.status_code = 200
        mock_post_response.json.return_value = {
            "message": {
                "content": "Please upload a document first."
            }
        }
        mock_post.return_value = mock_post_response
        
        chat_helper = LocalChatHelper()
        
        # Get response without setting document context
        response = chat_helper.get_chat_response("What is the rent?")
        
        # Verify response
        self.assertEqual(response, "Please upload a document first.")
        
        # Verify system prompt includes no document message
        call_args = mock_post.call_args
        payload = call_args[1]["json"]
        messages = payload["messages"]
        system_message = messages[0]["content"]
        self.assertIn("No document has been uploaded yet", system_message)
    
    @patch('local_chat_helper.requests.get')
    @patch('local_chat_helper.requests.post')
    def test_empty_response_handling(self, mock_post, mock_get):
        """Test handling of empty response from Ollama"""
        # Mock successful connection
        mock_get_response = MagicMock()
        mock_get_response.status_code = 200
        mock_get.return_value = mock_get_response
        
        # Mock empty response
        mock_post_response = MagicMock()
        mock_post_response.status_code = 200
        mock_post_response.json.return_value = {
            "message": {
                "content": ""
            }
        }
        mock_post.return_value = mock_post_response
        
        chat_helper = LocalChatHelper()
        
        # Get response
        response = chat_helper.get_chat_response(self.sample_message)
        
        # Verify error response for empty content
        self.assertIn("I apologize, but I encountered an error", response)

class TestLocalChatHelperIntegration(unittest.TestCase):
    """Integration tests for LocalChatHelper with real Ollama (if available)"""
    
    def setUp(self):
        """Set up test fixtures"""
        self.sample_document = """
        LEASE AGREEMENT
        
        This lease agreement is between John Doe (Lessor) and Jane Smith (Lessee).
        The property is located at 123 Main Street, Anytown, USA.
        The monthly rent is $1,500.
        The lease term is 12 months, starting January 1, 2024.
        The security deposit is $1,500.
        """
    
    @unittest.skip("Skipping integration test - requires Ollama server")
    def test_real_ollama_integration(self):
        """Test with real Ollama server (skipped by default)"""
        # This test would require a running Ollama server
        # It's skipped by default to avoid dependency on external service
        chat_helper = LocalChatHelper()
        chat_helper.set_document_context(self.sample_document)
        response = chat_helper.get_chat_response("What is the rent amount?")
        self.assertIsInstance(response, str)
        self.assertGreater(len(response), 0)

if __name__ == '__main__':
    unittest.main() 