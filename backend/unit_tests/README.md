# Lease Buddy Backend Unit Tests

This directory contains unit tests for the Lease Buddy backend components.

## Test Files

- `test_tagger_script.py` - Tests for the tagger script functionality
- `test_main.py` - Tests for the main FastAPI application
- `test_chat_helper.py` - Tests for the OpenAI chat helper
- `test_local_chat_helper.py` - Tests for the local Ollama chat helper
- `run_tests.py` - Test runner script
- `requirements_test.txt` - Test dependencies

## Setup

1. Install test dependencies:
```bash
pip install -r requirements_test.txt
```

2. Make sure you're in the backend directory:
```bash
cd /path/to/Lease-Buddy/backend
```

## Running Tests

### Run All Tests
```bash
python unit_tests/run_tests.py
```

### Run Specific Test File
```bash
python unit_tests/run_tests.py test_chat_helper
```

### Run Tests with Coverage
```bash
pytest unit_tests/ --cov=. --cov-report=html
```

### Run Individual Test Files
```bash
python -m unittest unit_tests.test_tagger_script
python -m unittest unit_tests.test_main
python -m unittest unit_tests.test_chat_helper
python -m unittest unit_tests.test_local_chat_helper
```

## Test Coverage

The tests cover the following areas:

### Tagger Script Tests
- Text extraction from DOCX files
- Entity position extraction
- Date extraction logic
- Error handling for missing entities
- Multiple entity occurrences

### Main API Tests
- FastAPI endpoint testing
- Model loading functionality
- Entity extraction with different models
- Error handling for invalid requests
- Health check and model status endpoints

### Chat Helper Tests
- OpenAI API integration
- Conversation history management
- System prompt generation
- Error handling for API failures
- Document context management

### Local Chat Helper Tests
- Ollama API integration
- Connection testing
- Model information retrieval
- Timeout and network error handling
- Conversation management

## Environment Variables

Some tests may require environment variables:

```bash
export OPENAI_API_KEY="your-openai-api-key"
export OLLAMA_URL="http://localhost:11434"
export OLLAMA_MODEL="phi3:mini"
```
