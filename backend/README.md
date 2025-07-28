# Lease Buddy NER API Backend

This is a FastAPI backend that provides Named Entity Recognition (NER) functionality for lease documents using a fine-tuned spaCy model.

## Features

- **Entity Extraction**: Extract named entities from lease document text
- **Multiple Entity Types**: Recognizes entities like LESSOR_NAME, LESSEE_NAME, PROPERTY_ADDRESS, RENT_AMOUNT, etc.
- **RESTful API**: Clean REST API with proper request/response models
- **CORS Support**: Configured for frontend integration
- **Health Checks**: Built-in health monitoring endpoints

## Setup

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Download spaCy Model** (if not already installed):
   ```bash
   python -m spacy download en_core_web_md
   ```

3. **Ensure Trained Model Exists**:
   The backend expects a trained model in the `lease_ner_model` directory. This model should be created using the `fine_tuned_NER.ipynb` notebook.

4. **Run the Server**:
   ```bash
   python main.py
   ```
   
   Or using uvicorn directly:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

## API Endpoints

### Health Check
- **GET** `/health`
- Returns server status and model loading status

### Entity Types
- **GET** `/entity-types`
- Returns list of entity types the model can recognize

### Extract Entities
- **POST** `/extract-entities`
- **Request Body**: `{"text": "your lease document text here"}`
- **Response**: JSON with extracted entities and their positions

## Example Usage

```python
import requests

# Extract entities from lease text
response = requests.post("http://localhost:8000/extract-entities", 
                        json={"text": "Your lease document text here"})

entities = response.json()["entities"]
for entity in entities:
    print(f"{entity['text']} ({entity['label']})")
```

## Model Loading

The backend automatically:
1. Looks for an existing trained model in the `lease_ner_model` directory
2. Loads the model on startup
3. Provides entity extraction services using the loaded model

## Testing

Run the test script to verify the API:
```bash
python test_api.py
```

## Entity Types

The model recognizes the following entity types:
- `LESSOR_NAME`: Landlord's name
- `LESSEE_NAME`: Tenant's name  
- `PROPERTY_ADDRESS`: Property address
- `LEASE_START_DATE`: Lease start date
- `LEASE_END_DATE`: Lease end date
- `RENT_AMOUNT`: Monthly rent amount
- `SECURITY_DEPOSIT_AMOUNT`: Security deposit amount

## API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc 