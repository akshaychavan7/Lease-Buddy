from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import spacy
import json
import os
from typing import List, Dict, Any
import uvicorn
from chat_helper import chat_helper
from local_chat_helper import local_chat_helper


app = FastAPI(title="Lease Buddy NER API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request/response
class TextRequest(BaseModel):
    text: str

class Entity(BaseModel):
    text: str
    label: str
    start: int
    end: int

class NERResponse(BaseModel):
    entities: List[Entity]
    text: str

class ChatRequest(BaseModel):
    message: str
    document_content: str = None

class ChatResponse(BaseModel):
    response: str
    success: bool

# Global variable to store the loaded model
nlp_model = None

def load_model():
    """Load the existing trained NER model"""
    global nlp_model
    
    model_path = "lease_ner_model"
    
    if os.path.exists(model_path):
        print("Loading existing trained model...")
        nlp_model = spacy.load(model_path)
        print("Model loaded successfully!")
    else:
        raise Exception(f"Model not found at {model_path}. Please ensure the model is trained and saved.")
    
    return nlp_model

@app.on_event("startup")
async def startup_event():
    """Initialize the model on startup"""
    global nlp_model
    nlp_model = load_model()

@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "Lease Buddy NER API is running"}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "model_loaded": nlp_model is not None}

@app.post("/extract-entities", response_model=NERResponse)
async def extract_entities(request: TextRequest):
    """Extract NER entities from the provided text"""
    global nlp_model
    
    if nlp_model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    try:
        # Process the text with the NER model
        doc = nlp_model(request.text)
        
        # Extract entities
        entities = []
        for ent in doc.ents:
            entity = Entity(
                text=ent.text,
                label=ent.label_,
                start=ent.start_char,
                end=ent.end_char
            )
            entities.append(entity)
        
        return NERResponse(
            entities=entities,
            text=request.text
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing text: {str(e)}")
@app.get("/entity-types")
async def get_entity_types():
    """Get the list of entity types the model can recognize"""
    global nlp_model
    
    if nlp_model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    ner = nlp_model.get_pipe("ner")
    return {"entity_types": list(ner.labels)}

@app.post("/chat", response_model=ChatResponse)
async def chat_with_document(request: ChatRequest):
    """Chat with the document using OpenAI API"""
    try:
        # Set document context if provided
        if request.document_content:
            chat_helper.set_document_context(request.document_content)
        
        # Get response from OpenAI
        response = chat_helper.get_chat_response(request.message)
        
        return ChatResponse(
            response=response,
            success=True
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")

@app.post("/chat/clear")
async def clear_chat_history():
    """Clear the chat conversation history"""
    try:
        chat_helper.clear_conversation()
        return {"success": True, "message": "Chat history cleared"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error clearing chat history: {str(e)}")

# Local LLM Chat Endpoints
@app.post("/chat/local", response_model=ChatResponse)
async def chat_with_document_local(request: ChatRequest):
    """Chat with the document using local LLM (Ollama)"""
    try:
        # Set document context if provided
        if request.document_content:
            local_chat_helper.set_document_context(request.document_content)
        
        # Get response from local LLM
        response = local_chat_helper.get_chat_response(request.message)
        
        return ChatResponse(
            response=response,
            success=True
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Local chat error: {str(e)}")

@app.post("/chat/local/clear")
async def clear_local_chat_history():
    """Clear the local chat conversation history"""
    try:
        local_chat_helper.clear_conversation()
        return {"success": True, "message": "Local chat history cleared"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error clearing local chat history: {str(e)}")

@app.get("/chat/local/model-info")
async def get_local_model_info():
    """Get information about the local LLM model"""
    try:
        model_info = local_chat_helper.get_model_info()
        return {"success": True, "model_info": model_info}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting model info: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
