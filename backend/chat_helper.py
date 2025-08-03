import openai
import os
from typing import List, Dict, Any, Optional
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure OpenAI API
openai.api_key = os.getenv("OPENAI_API_KEY")
if not openai.api_key:
    raise ValueError("OPENAI_API_KEY environment variable is not set")

class ChatHelper:
    def __init__(self):
        self.conversation_history: List[Dict[str, str]] = []
        self.document_context: Optional[str] = None
        
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
        7. Make important information bold and arrange them in a list"""
        
        if self.document_context:
            base_prompt += f"\n\nDocument Context:\n{self.document_context}"
        else:
            base_prompt += "\n\nNo document has been uploaded yet. Please upload a document first."
            
        return base_prompt
        
    def get_chat_response(self, user_message: str) -> str:
        """Get a response from OpenAI based on the conversation history and document context"""
        try:
            # Add user message to history
            self.add_message("user", user_message)
            
            # Prepare messages for OpenAI
            messages = [{"role": "system", "content": self.get_system_prompt()}]
            messages.extend(self.conversation_history)
            
            # Call OpenAI API using the new format
            response = openai.chat.completions.create(
                model="gpt-4o",
                messages=messages,
                max_tokens=1000,
                temperature=0.7,
                stream=False
            )
            
            # Extract assistant response
            assistant_response = response.choices[0].message.content
            
            # Add assistant response to history
            self.add_message("assistant", assistant_response)
            
            return assistant_response
            
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

# Global chat helper instance
chat_helper = ChatHelper() 