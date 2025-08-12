#!/usr/bin/env python3
"""
Demo script for Lease Buddy NER Models

This script loads all three NER models and processes a specific lease document,
printing the identified entities for each model.
"""

import os
from typing import List, Dict, Any, Optional

import spacy
import torch
from transformers import AutoTokenizer, AutoModelForTokenClassification
from docx import Document


class Entity:
    """Simple entity class for NER results"""
    def __init__(self, text: str, label: str, start: int, end: int):
        self.text = text
        self.label = label
        self.start = start
        self.end = end


# Model configurations
MODEL_CONFIGS = {
    "spacy": {
        "path": "./spacy/lease_ner_model",
        "type": "spacy"
    },
    "bert": {
        "path": "./legalBert/legalbert-ner-model-100",
        "type": "bert"
    },
    "spacy_bert": {
        "path": "./spacy_legalBert/custom_legal_ner_spacy_100",
        "type": "spacy_bert"
    }
}

# Global model storage
models = {
    "spacy": None,
    "bert": None,
    "spacy_bert": None
}


def load_spacy_model(model_path: str):
    """Load a spaCy model"""
    if not os.path.exists(model_path):
        print(f"spaCy model not found at {model_path}")
        return None
    
    try:
        print(f"Loading spaCy model from {model_path}...")
        return spacy.load(model_path)
    except Exception as e:
        print(f"Error loading spaCy model: {e}")
        return None


def load_bert_model(model_path: str):
    """Load a BERT model"""
    if not os.path.exists(model_path):
        print(f"BERT model not found at {model_path}")
        return None
    
    try:
        print(f"Loading BERT model from {model_path}...")
        tokenizer = AutoTokenizer.from_pretrained(model_path)
        model = AutoModelForTokenClassification.from_pretrained(model_path)
        return {"tokenizer": tokenizer, "model": model}
    except Exception as e:
        print(f"Error loading BERT model: {e}")
        return None


def load_spacy_bert_model(model_path: str):
    """Load a spaCy BERT model"""
    if not os.path.exists(model_path):
        print(f"spaCy BERT model not found at {model_path}")
        return None
    
    try:
        print(f"Loading spaCy BERT model from {model_path}...")
        return spacy.load(model_path)
    except Exception as e:
        print(f"Error loading spaCy BERT model: {e}")
        return None


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
            
            if models[model_name] is not None:
                print(f"Model {model_name} loaded successfully")
            else:
                print(f"Model {model_name} failed to load")
        except Exception as e:
            print(f"Failed to load model {model_name}: {str(e)}")
            models[model_name] = None


def extract_entities_spacy(text: str, model) -> List[Entity]:
    """Extract entities using spaCy model"""
    try:
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
    except Exception as e:
        print(f"Error extracting entities with spaCy: {e}")
        return []


def extract_entities_bert(text: str, model_dict) -> List[Entity]:
    """Extract entities using BERT model"""
    try:
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
    except Exception as e:
        print(f"Error extracting entities with BERT: {e}")
        return []


def extract_entities_spacy_bert(text: str, model) -> List[Entity]:
    """Extract entities using spaCy BERT model"""
    return extract_entities_spacy(text, model)


def read_docx_file(file_path: str) -> str:
    """Read text from a .docx file"""
    if not os.path.exists(file_path):
        raise Exception(f"File not found: {file_path}")
    
    doc = Document(file_path)
    text = ""
    for paragraph in doc.paragraphs:
        text += paragraph.text + "\n"
    return text


def get_model_display_name(model_name: str) -> str:
    """Get display name for model"""
    display_names = {
        "spacy": "Fine-tuned spaCy NER Model",
        "bert": "BERT-based NER Model", 
        "spacy_bert": "spaCy + BERT NER Model"
    }
    return display_names.get(model_name, model_name)


def main():
    """Main function to run the demo"""
    print("=" * 80)
    print("LEASE BUDDY NER MODELS DEMO")
    print("=" * 80)
    
    # File path to process
    file_path = "./datasets/dataset-master/Lease_Agreement_43.docx"
    
    print(f"\nProcessing file: {file_path}")
    print("-" * 80)
    
    # Check if file exists
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return
    
    # Load the document text
    try:
        print("Reading document...")
        document_text = read_docx_file(file_path)
        print(f"Document loaded ({len(document_text)} characters)")
        print(f"First 200 characters: {document_text[:200]}...")
    except Exception as e:
        print(f"Error reading document: {str(e)}")
        return
    
    # Load all models
    print("\nLoading models...")
    print("-" * 40)
    load_models()
    
    # Check which models are available
    available_models = {name: model for name, model in models.items() if model is not None}
    if not available_models:
        print("No models loaded successfully!")
        print("\nTo fix this:")
        print("1. Install dependencies: pip install spacy torch transformers python-docx")
        print("2. Train the models using the provided notebooks")
        print("3. Ensure model files are in the correct directories")
        return
    
    print(f"\n{len(available_models)} models loaded successfully")
    
    # Process document with each model
    print("\n" + "=" * 80)
    print("ENTITY EXTRACTION RESULTS")
    print("=" * 80)
    
    for model_name, model in available_models.items():
        print(f"\n{get_model_display_name(model_name)}:")
        print("-" * 50)
        
        try:
            if MODEL_CONFIGS[model_name]["type"] == "spacy":
                entities = extract_entities_spacy(document_text, model)
            elif MODEL_CONFIGS[model_name]["type"] == "bert":
                entities = extract_entities_bert(document_text, model)
            elif MODEL_CONFIGS[model_name]["type"] == "spacy_bert":
                entities = extract_entities_spacy_bert(document_text, model)
            else:
                print("  Unknown model type")
                continue
            
            if entities:
                print(f"  Found {len(entities)} entities:")
                for entity in entities:
                    print(f"    {entity.label}: '{entity.text}'")
            else:
                print("  No entities found")
                
        except Exception as e:
            print(f"  Error processing with {model_name}: {str(e)}")
    
    print("\n" + "=" * 80)
    print("DEMO COMPLETED")
    print("=" * 80)
    
    # Expected entities for reference
    print("\nExpected entity types:")
    print("- LESSOR_NAME (Landlord name)")
    print("- LESSEE_NAME (Tenant name)")
    print("- PROPERTY_ADDRESS (Property location)")
    print("- LEASE_START_DATE (Lease start date)")
    print("- LEASE_END_DATE (Lease end date)")
    print("- RENT_AMOUNT (Monthly rent)")
    print("- SECURITY_DEPOSIT_AMOUNT (Security deposit)")


if __name__ == "__main__":
    main()