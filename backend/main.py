from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import spacy
import json
import os
from typing import List, Dict, Any, Optional
import uvicorn
from chat_helper import chat_helper
from local_chat_helper import local_chat_helper
from transformers import AutoTokenizer, AutoModelForTokenClassification
import torch


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
    model: str = "spacy"  # Default to spaCy model

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

# Global variables to store the loaded models
models = {
    "spacy": None,
    "bert": None,
    "spacy_bert": None
}

# Model configurations
MODEL_CONFIGS = {
    "spacy": {
        "path": "lease_ner_model",
        "type": "spacy"
    },
    "bert": {
        "path": "legalbert-ner-model-100",
        "type": "bert"
    },
    "spacy_bert": {
        "path": "custom_legal_ner_spacy_100",
        "type": "spacy_bert"
    }
}

def load_spacy_model(model_path: str):
    """Load a spaCy model"""
    if os.path.exists(model_path):
        print(f"Loading spaCy model from {model_path}...")
        return spacy.load(model_path)
    else:
        raise Exception(f"spaCy model not found at {model_path}")

def load_bert_model(model_path: str):
    """Load a BERT model"""
    if os.path.exists(model_path):
        print(f"Loading BERT model from {model_path}...")
        tokenizer = AutoTokenizer.from_pretrained(model_path)
        model = AutoModelForTokenClassification.from_pretrained(model_path)
        return {"tokenizer": tokenizer, "model": model}
    else:
        raise Exception(f"BERT model not found at {model_path}")

def load_spacy_bert_model(model_path: str):
    """Load a spaCy BERT model"""
    if os.path.exists(model_path):
        print(f"Loading spaCy BERT model from {model_path}...")
        return spacy.load(model_path)
    else:
        raise Exception(f"spaCy BERT model not found at {model_path}")

def load_models():
    """Load all available models"""
    global models
    
    for model_name, config in MODEL_CONFIGS.items():
        try:
            if config["type"] == "spacy":
                models[model_name] = load_spacy_model(config["path"])
            elif config["type"] == "bert":
                models[model_name] = load_bert_model(config["path"])
            elif config["type"] == "spacy_bert":
                models[model_name] = load_spacy_bert_model(config["path"])
            print(f"Model {model_name} loaded successfully!")
        except Exception as e:
            print(f"Failed to load model {model_name}: {str(e)}")
            models[model_name] = None

def extract_entities_spacy(text: str, model) -> List[Entity]:
    """Extract entities using spaCy model"""
    doc = model(text)
    entities = []
    for ent in doc.ents:
        entity = Entity(
            text=ent.text,
            label=ent.label_,
            start=ent.start_char,
            end=ent.end_char
        )
        entities.append(entity)
    return entities

def extract_entities_bert(text: str, model_dict) -> List[Entity]:
    """Extract entities using BERT model"""
    tokenizer = model_dict["tokenizer"]
    model = model_dict["model"]
    
    # Tokenize the text
    inputs = tokenizer(text, return_tensors="pt", truncation=True, max_length=512)
    
    # Get predictions
    with torch.no_grad():
        outputs = model(**inputs)
        predictions = torch.argmax(outputs.logits, dim=2)
    
    # Convert predictions to entities
    entities = []
    tokens = tokenizer.convert_ids_to_tokens(inputs["input_ids"][0])
    
    current_entity = None
    current_start = 0
    
    for i, (token, pred) in enumerate(zip(tokens, predictions[0])):
        if token.startswith("##"):
            continue
            
        pred_label = model.config.id2label[pred.item()]
        
        if pred_label != "O":
            if current_entity is None:
                current_entity = pred_label
                current_start = i
        else:
            if current_entity is not None:
                # Create entity from accumulated tokens
                entity_text = " ".join(tokens[current_start:i]).replace(" ##", "")
                entity = Entity(
                    text=entity_text,
                    label=current_entity,
                    start=current_start,
                    end=i
                )
                entities.append(entity)
                current_entity = None
    
    return entities

def extract_entities_spacy_bert(text: str, model) -> List[Entity]:
    """Extract entities using spaCy BERT model"""
    doc = model(text)
    entities = []
    for ent in doc.ents:
        entity = Entity(
            text=ent.text,
            label=ent.label_,
            start=ent.start_char,
            end=ent.end_char
        )
        entities.append(entity)
    return entities

@app.on_event("startup")
async def startup_event():
    """Initialize all models on startup"""
    load_models()

@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "Lease Buddy NER API is running"}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    loaded_models = {name: model is not None for name, model in models.items()}
    return {"status": "healthy", "models_loaded": loaded_models}

@app.get("/models")
async def get_available_models():
    """Get list of available models"""
    available_models = []
    for model_name, model in models.items():
        if model is not None:
            available_models.append({
                "name": model_name,
                "display_name": get_model_display_name(model_name),
                "type": MODEL_CONFIGS[model_name]["type"]
            })
    return {"models": available_models}

def get_model_display_name(model_name: str) -> str:
    """Get display name for model"""
    display_names = {
        "spacy": "Fine-tuned spaCy NER Model",
        "bert": "BERT-based NER Model", 
        "spacy_bert": "spaCy + BERT NER Model"
    }
    return display_names.get(model_name, model_name)

@app.post("/extract-entities", response_model=NERResponse)
async def extract_entities(request: TextRequest):
    """Extract NER entities from the provided text using the specified model"""
    model_name = request.model
    text = request.text
    
    if model_name not in models:
        raise HTTPException(status_code=400, detail=f"Model '{model_name}' not available")
    
    model = models[model_name]
    if model is None:
        raise HTTPException(status_code=500, detail=f"Model '{model_name}' not loaded")
    
    try:
        if MODEL_CONFIGS[model_name]["type"] == "spacy":
            entities = extract_entities_spacy(text, model)
        elif MODEL_CONFIGS[model_name]["type"] == "bert":
            entities = extract_entities_bert(text, model)
        elif MODEL_CONFIGS[model_name]["type"] == "spacy_bert":
            entities = extract_entities_spacy_bert(text, model)
        else:
            raise HTTPException(status_code=500, detail=f"Unknown model type for {model_name}")
        
        return NERResponse(
            entities=entities,
            text=text
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing text with {model_name}: {str(e)}")

@app.get("/entity-types")
async def get_entity_types(model: str = "spacy"):
    """Get the list of entity types the specified model can recognize"""
    if model not in models:
        raise HTTPException(status_code=400, detail=f"Model '{model}' not available")
    
    model_obj = models[model]
    if model_obj is None:
        raise HTTPException(status_code=500, detail=f"Model '{model}' not loaded")
    
    try:
        if MODEL_CONFIGS[model]["type"] == "spacy":
            ner = model_obj.get_pipe("ner")
            return {"entity_types": list(ner.labels)}
        elif MODEL_CONFIGS[model]["type"] == "bert":
            # For BERT models, return the label2id mapping
            label2id = model_obj["model"].config.label2id
            return {"entity_types": list(label2id.keys())}
        else:
            return {"entity_types": []}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting entity types: {str(e)}")

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
