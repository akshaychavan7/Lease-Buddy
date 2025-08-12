import unittest
import sys
import os
from unittest.mock import patch, MagicMock, Mock
import json

# Add the parent directory to the path to import the modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import the chat helper
from chat_helper import ChatHelper

class TestChatHelper(unittest.TestCase):
    """Test cases for the ChatHelper class"""
    
    def setUp(self):
        """Set up test fixtures"""
        self.chat_helper = ChatHelper()
        self.sample_document = "This is a sample lease agreement. The rent is $1000 per month."
        self.sample_message = "What is the rent amount?"
    
    def test_initialization(self):
        """Test ChatHelper initialization"""
        self.assertEqual(self.chat_helper.conversation_history, [])
        self.assertIsNone(self.chat_helper.document_context)
    
    def test_set_document_context(self):
        """Test setting document context"""
        self.chat_helper.set_document_context(self.sample_document)
        self.assertEqual(self.chat_helper.document_context, self.sample_document)
    
    def test_add_message(self):
        """Test adding messages to conversation history"""
        self.chat_helper.add_message("user", "Hello")
        self.chat_helper.add_message("assistant", "Hi there!")
        
        self.assertEqual(len(self.chat_helper.conversation_history), 2)
        self.assertEqual(self.chat_helper.conversation_history[0]["role"], "user")
        self.assertEqual(self.chat_helper.conversation_history[0]["content"], "Hello")
        self.assertEqual(self.chat_helper.conversation_history[1]["role"], "assistant")
        self.assertEqual(self.chat_helper.conversation_history[1]["content"], "Hi there!")
    
    def test_get_system_prompt_without_context(self):
        """Test system prompt generation without document context"""
        prompt = self.chat_helper.get_system_prompt()
        
        # Check that the base prompt is included
        self.assertIn("You are a helpful AI assistant specialized in analyzing lease agreements", prompt)
        self.assertIn("No document has been uploaded yet", prompt)
        self.assertNotIn(self.sample_document, prompt)
    
    def test_get_system_prompt_with_context(self):
        """Test system prompt generation with document context"""
        self.chat_helper.set_document_context(self.sample_document)
        prompt = self.chat_helper.get_system_prompt()
        
        # Check that the document context is included
        self.assertIn("You are a helpful AI assistant specialized in analyzing lease agreements", prompt)
        self.assertIn(self.sample_document, prompt)
        self.assertNotIn("No document has been uploaded yet", prompt)
    
    @patch('chat_helper.openai')
    def test_get_chat_response_success(self, mock_openai):
        """Test successful chat response generation"""
        # Mock OpenAI response
        mock_response = MagicMock()
        mock_response.choices = [MagicMock()]
        mock_response.choices[0].message.content = "The rent amount is $1000 per month."
        mock_openai.chat.completions.create.return_value = mock_response
        
        # Set document context
        self.chat_helper.set_document_context(self.sample_document)
        
        # Get response
        response = self.chat_helper.get_chat_response(self.sample_message)
        
        # Verify response
        self.assertEqual(response, "The rent amount is $1000 per month.")
        
        # Verify conversation history was updated
        self.assertEqual(len(self.chat_helper.conversation_history), 2)
        self.assertEqual(self.chat_helper.conversation_history[0]["role"], "user")
        self.assertEqual(self.chat_helper.conversation_history[0]["content"], self.sample_message)
        self.assertEqual(self.chat_helper.conversation_history[1]["role"], "assistant")
        self.assertEqual(self.chat_helper.conversation_history[1]["content"], "The rent amount is $1000 per month.")
        
        # Verify OpenAI was called with correct parameters
        mock_openai.chat.completions.create.assert_called_once()
        call_args = mock_openai.chat.completions.create.call_args
        self.assertEqual(call_args[1]["model"], "gpt-4o")
        self.assertEqual(call_args[1]["max_tokens"], 1000)
        self.assertEqual(call_args[1]["temperature"], 0.7)
        self.assertFalse(call_args[1]["stream"])
        
        # Verify messages structure
        messages = call_args[1]["messages"]
        self.assertEqual(len(messages), 2)  # system + user (assistant message not added yet)
        self.assertEqual(messages[0]["role"], "system")
        self.assertIn(self.sample_document, messages[0]["content"])
        self.assertEqual(messages[1]["role"], "user")
        self.assertEqual(messages[1]["content"], self.sample_message)
    
    @patch('chat_helper.openai')
    def test_get_chat_response_error(self, mock_openai):
        """Test chat response generation with error"""
        # Mock OpenAI to raise an exception
        mock_openai.chat.completions.create.side_effect = Exception("API Error")
        
        # Get response
        response = self.chat_helper.get_chat_response(self.sample_message)
        
        # Verify error response
        self.assertIn("I apologize, but I encountered an error", response)
        
        # Verify conversation history was still updated with user message
        self.assertEqual(len(self.chat_helper.conversation_history), 1)
        self.assertEqual(self.chat_helper.conversation_history[0]["role"], "user")
        self.assertEqual(self.chat_helper.conversation_history[0]["content"], self.sample_message)
    
    def test_clear_conversation(self):
        """Test clearing conversation history"""
        # Add some messages
        self.chat_helper.add_message("user", "Hello")
        self.chat_helper.add_message("assistant", "Hi!")
        self.chat_helper.set_document_context(self.sample_document)
        
        # Clear conversation
        self.chat_helper.clear_conversation()
        
        # Verify conversation is cleared but document context remains
        self.assertEqual(self.chat_helper.conversation_history, [])
        self.assertEqual(self.chat_helper.document_context, self.sample_document)
    
    def test_get_conversation_history(self):
        """Test getting conversation history"""
        # Add some messages
        self.chat_helper.add_message("user", "Hello")
        self.chat_helper.add_message("assistant", "Hi!")
        
        # Get history
        history = self.chat_helper.get_conversation_history()
        
        # Verify history is returned as a copy
        self.assertEqual(history, self.chat_helper.conversation_history)
        self.assertIsNot(history, self.chat_helper.conversation_history)  # Should be a copy
        
        # Verify content
        self.assertEqual(len(history), 2)
        self.assertEqual(history[0]["role"], "user")
        self.assertEqual(history[0]["content"], "Hello")
        self.assertEqual(history[1]["role"], "assistant")
        self.assertEqual(history[1]["content"], "Hi!")
    
    def test_multiple_conversation_turns(self):
        """Test multiple conversation turns"""
        # First turn
        with patch('chat_helper.openai') as mock_openai:
            mock_response = MagicMock()
            mock_response.choices = [MagicMock()]
            mock_response.choices[0].message.content = "The rent is $1000."
            mock_openai.chat.completions.create.return_value = mock_response
            
            response1 = self.chat_helper.get_chat_response("What is the rent?")
            self.assertEqual(response1, "The rent is $1000.")
        
        # Second turn
        with patch('chat_helper.openai') as mock_openai:
            mock_response = MagicMock()
            mock_response.choices = [MagicMock()]
            mock_response.choices[0].message.content = "The lease term is 12 months."
            mock_openai.chat.completions.create.return_value = mock_response
            
            response2 = self.chat_helper.get_chat_response("What is the lease term?")
            self.assertEqual(response2, "The lease term is 12 months.")
        
        # Verify conversation history has all messages
        self.assertEqual(len(self.chat_helper.conversation_history), 4)
        self.assertEqual(self.chat_helper.conversation_history[0]["role"], "user")
        self.assertEqual(self.chat_helper.conversation_history[0]["content"], "What is the rent?")
        self.assertEqual(self.chat_helper.conversation_history[1]["role"], "assistant")
        self.assertEqual(self.chat_helper.conversation_history[1]["content"], "The rent is $1000.")
        self.assertEqual(self.chat_helper.conversation_history[2]["role"], "user")
        self.assertEqual(self.chat_helper.conversation_history[2]["content"], "What is the lease term?")
        self.assertEqual(self.chat_helper.conversation_history[3]["role"], "assistant")
        self.assertEqual(self.chat_helper.conversation_history[3]["content"], "The lease term is 12 months.")
    
    def test_system_prompt_guidelines(self):
        """Test that system prompt includes all guidelines"""
        prompt = self.chat_helper.get_system_prompt()
        
        # Check for key guidelines
        guidelines = [
            "Always base your answers on the document content provided",
            "If a question cannot be answered from the document, clearly state that",
            "Provide accurate and helpful information about lease terms, dates, amounts, and obligations",
            "Use clear, professional language",
            "If you're unsure about something, say so rather than guessing",
            "Be concise but thorough in your responses",
            "Make important information bold and arrange them in a list"
        ]
        
        for guideline in guidelines:
            self.assertIn(guideline, prompt)
    
    @patch('chat_helper.openai')
    def test_chat_response_without_document_context(self, mock_openai):
        """Test chat response when no document context is set"""
        # Mock OpenAI response
        mock_response = MagicMock()
        mock_response.choices = [MagicMock()]
        mock_response.choices[0].message.content = "Please upload a document first."
        mock_openai.chat.completions.create.return_value = mock_response
        
        # Get response without setting document context
        response = self.chat_helper.get_chat_response("What is the rent?")
        
        # Verify response
        self.assertEqual(response, "Please upload a document first.")
        
        # Verify system prompt includes no document message
        call_args = mock_openai.chat.completions.create.call_args
        messages = call_args[1]["messages"]
        system_message = messages[0]["content"]
        self.assertIn("No document has been uploaded yet", system_message)

class TestChatHelperIntegration(unittest.TestCase):
    """Integration tests for ChatHelper with real OpenAI API (if available)"""
    
    def setUp(self):
        """Set up test fixtures"""
        self.chat_helper = ChatHelper()
        self.sample_document = """
        LEASE AGREEMENT
        
        This lease agreement is between John Doe (Lessor) and Jane Smith (Lessee).
        The property is located at 123 Main Street, Anytown, USA.
        The monthly rent is $1,500.
        The lease term is 12 months, starting January 1, 2024.
        The security deposit is $1,500.
        """
    
    @unittest.skip("Skipping integration test - requires OpenAI API key")
    def test_real_openai_integration(self):
        """Test with real OpenAI API (skipped by default)"""
        # This test would require a valid OpenAI API key
        # It's skipped by default to avoid API costs during testing
        self.chat_helper.set_document_context(self.sample_document)
        response = self.chat_helper.get_chat_response("What is the rent amount?")
        self.assertIsInstance(response, str)
        self.assertGreater(len(response), 0)

if __name__ == '__main__':
    unittest.main() 