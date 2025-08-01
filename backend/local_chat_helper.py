import requests
import json
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

class LocalChatHelper:
    def __init__(self, model_name: str = None, ollama_url: str = None):
        """
        Initialize the local chat helper with Ollama
        
        Args:
            model_name: The name of the Ollama model to use (defaults to env var)
            ollama_url: The URL of the Ollama server (defaults to env var)
        """
        self.model_name = model_name or os.getenv("OLLAMA_MODEL", "phi3:mini")
        self.ollama_url = ollama_url or os.getenv("OLLAMA_URL", "http://localhost:11434")
        self.conversation_history: List[Dict[str, str]] = []
        self.document_context: Optional[str] = None
        
        # Test connection to Ollama
        self._test_connection()
    
    def _test_connection(self):
        """Test the connection to Ollama server"""
        try:
            response = requests.get(f"{self.ollama_url}/api/tags")
            if response.status_code != 200:
                raise ConnectionError(f"Ollama server not responding: {response.status_code}")
            print(f" Connected to Ollama server at {self.ollama_url}")
        except requests.exceptions.RequestException as e:
            raise ConnectionError(f"Failed to connect to Ollama server: {str(e)}")
    
    def set_document_context(self, document_content: str):
        """Set the document content as context for the chat"""
        self.document_context = document_content
    
    def add_message(self, role: str, content: str):
        """Add a message to the conversation history"""
        self.conversation_history.append({
            "role": role,
            "content": content
        })
    
    def get_system_prompt(self) -> str:
        """Generate the system prompt with document context"""
        base_prompt = """You are a helpful AI assistant specialized in analyzing lease agreements and legal documents.
Your role is to help users understand their documents by answering questions based on the provided content.

Guidelines:
1. Always base your answers on the document content provided
2. If a question cannot be answered from the document, clearly state that
3. Provide accurate and helpful information about lease terms, dates, amounts, and obligations
4. Use clear, professional language
5. If you're unsure about something, say so rather than guessing
6. Be concise but thorough in your responses
7. Format your responses with proper markdown when appropriate (use **bold** for emphasis, lists, etc.)"""

        if self.document_context:
            base_prompt += f"\n\nDocument Context:\n{self.document_context}"
        else:
            base_prompt += "\n\nNo document has been uploaded yet. Please upload a document first."

        return base_prompt
    
    def get_chat_response(self, user_message: str) -> str:
        """Get a response from Ollama based on the conversation history and document context"""
        try:
            self.add_message("user", user_message)
            
            # Prepare messages for Ollama
            messages = [{"role": "system", "content": self.get_system_prompt()}]
            messages.extend(self.conversation_history)
            
            # Prepare the request payload for Ollama
            payload = {
                "model": self.model_name,
                "messages": messages,
                "stream": False,
                "options": {
                    "temperature": 0.7,
                    "top_p": 0.9,
                    "max_tokens": 1000
                }
            }
            
            # Make request to Ollama
            response = requests.post(
                f"{self.ollama_url}/api/chat",
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=60  # 60 second timeout
            )
            
            if response.status_code != 200:
                raise Exception(f"Ollama API error: {response.status_code} - {response.text}")
            
            response_data = response.json()
            assistant_response = response_data.get("message", {}).get("content", "")
            
            if not assistant_response:
                raise Exception("Empty response from Ollama")
            
            self.add_message("assistant", assistant_response)
            return assistant_response
            
        except requests.exceptions.Timeout:
            error_message = "Request timed out. The model is taking too long to respond."
            print(error_message)
            return f"I apologize, but the request timed out. Please try again with a shorter question."
            
        except requests.exceptions.RequestException as e:
            error_message = f"Network error: {str(e)}"
            print(error_message)
            return f"I apologize, but I encountered a network error. Please check your connection and try again."
            
        except Exception as e:
            error_message = f"Error getting chat response: {str(e)}"
            print(error_message)
            return f"I apologize, but I encountered an error while processing your request. Please try again."
    
    def clear_conversation(self):
        """Clear the conversation history"""
        self.conversation_history = []
    
    def get_conversation_history(self) -> List[Dict[str, str]]:
        """Get the current conversation history"""
        return self.conversation_history.copy()
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get information about the current model"""
        try:
            response = requests.get(f"{self.ollama_url}/api/tags")
            if response.status_code == 200:
                models = response.json().get("models", [])
                for model in models:
                    if model.get("name") == self.model_name:
                        return {
                            "name": model.get("name"),
                            "size": model.get("size"),
                            "modified_at": model.get("modified_at"),
                            "digest": model.get("digest")
                        }
            return {"name": self.model_name, "status": "unknown"}
        except Exception as e:
            return {"name": self.model_name, "error": str(e)}

# Create a global instance
local_chat_helper = LocalChatHelper() 