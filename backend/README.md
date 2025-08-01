# Lease Document NER Models Analysis

This project implements three different Named Entity Recognition (NER) approaches for extracting key information from lease documents. Each model uses a different technique to achieve the same goal of identifying entities like lessor names, lessee names, property addresses, dates, and amounts.

## 🚀 Quick Start

### Environment Setup

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Set up environment variables:**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit .env and add your OpenAI API key
   OPENAI_API_KEY=your_openai_api_key_here
   ```

3. **Run the backend server:**
   ```bash
   python main.py
   ```

The server will start on http://localhost:8000

### Environment Variables

- `OPENAI_API_KEY`: Your OpenAI API key (required for cloud chat functionality)
- `OLLAMA_URL`: Ollama server URL (default: http://localhost:11434)
- `OLLAMA_MODEL`: Ollama model name (default: phi3:mini)
- `BACKEND_HOST`: Server host (default: 0.0.0.0)
- `BACKEND_PORT`: Server port (default: 8000)

### Local LLM Setup (Optional)

To use the local LLM feature with Ollama:

1. **Install Ollama:**
   ```bash
   # macOS
   brew install ollama
   
   # Linux
   curl -fsSL https://ollama.ai/install.sh | sh
   ```

2. **Pull the Phi-3 Mini model:**
   ```bash
   ollama pull phi3:mini
   ```

3. **Start Ollama server:**
   ```bash
   ollama serve
   ```

4. **Configure environment variables:**
   ```bash
   # In your .env file
   OLLAMA_URL=http://localhost:11434
   OLLAMA_MODEL=phi3:mini
   ```

**⚠️ Security Note:** Never commit your `.env` file to version control. The `.env` file is already added to `.gitignore`.

## 📊 Model Overview

### 1. **spaCy Fine-tuned Model** (`fine_tuned_NER.ipynb`)
- **Technique**: Transfer Learning with spaCy
- **Base Model**: `en_core_web_md` (pre-trained English model)
- **Approach**: Fine-tunes existing spaCy pipeline on lease-specific data
- **Architecture**: CNN-based token-to-vector encoding with transition-based parsing

### 2. **BERT-based Model** (`bert_based_ner.ipynb`)
- **Technique**: Transformer-based Transfer Learning
- **Base Model**: `bert-base-uncased`
- **Approach**: Uses BERT embeddings with token classification head
- **Architecture**: Bidirectional Transformer with CRF layer

### 3. **BiLSTM-CRF Model** (`bi_lstm_crf_ner.ipynb`)
- **Technique**: Deep Learning with Sequential Modeling
- **Base Model**: Custom PyTorch implementation
- **Approach**: Character-level + word-level embeddings with BiLSTM and CRF
- **Architecture**: Bidirectional LSTM with Conditional Random Fields

## 🔍 Detailed Comparison

### **spaCy Fine-tuned Model**

**Advantages:**
-  Fast training and inference
-  Built-in tokenization and preprocessing
-  Easy to use and deploy
-  Good for domain adaptation
-  Lightweight and efficient

**Disadvantages:**
- ❌ Limited to spaCy's architecture
- ❌ Less flexible for custom modifications
- ❌ May not capture complex contextual relationships
- ❌ Dependent on spaCy's pre-trained weights

**Best Use Cases:**
- Quick prototyping
- Production deployment with limited resources
- When you need fast inference times
- Domain adaptation from general to specific text

### **BERT-based Model**

**Advantages:**
-  State-of-the-art performance on many NLP tasks
-  Excellent contextual understanding
-  Pre-trained on massive amounts of text
-  Handles out-of-vocabulary words well
-  Strong transfer learning capabilities

**Disadvantages:**
- ❌ Large model size (110M+ parameters)
- ❌ Slower inference compared to lighter models
- ❌ Higher computational requirements
- ❌ Requires more training data for optimal performance

**Best Use Cases:**
- When accuracy is the primary concern
- When you have sufficient training data
- Complex document understanding tasks
- When you need robust handling of various text formats

### **BiLSTM-CRF Model**

**Advantages:**
-  Customizable architecture
-  Good at capturing sequential dependencies
-  CRF layer optimizes label transitions
-  Character-level features handle spelling variations
-  Interpretable and controllable

**Disadvantages:**
- ❌ Requires more manual feature engineering
- ❌ Training from scratch (no pre-trained weights)
- ❌ May need more data to achieve good performance
- ❌ More complex to implement and debug

**Best Use Cases:**
- When you need full control over the model architecture
- Research and experimentation
- When you have domain-specific requirements
- When interpretability is important

## 📈 Performance Comparison

| Aspect | spaCy Fine-tuned | BERT-based | BiLSTM-CRF |
|--------|------------------|------------|-------------|
| **Training Speed** | Fast | Medium | Slow |
| **Inference Speed** | Very Fast | Medium | Fast |
| **Model Size** | Small (~50MB) | Large (~400MB) | Medium (~100MB) |
| **Accuracy** | Good | Excellent | Very Good |
| **Memory Usage** | Low | High | Medium |
| **Customization** | Limited | Medium | High |
| **Deployment** | Easy | Medium | Medium |

## 🏗️ Technical Architecture Differences

### **spaCy Model Architecture:**
```
Input Text → Tokenization → CNN Encoder → Transition-based Parser → NER Labels
```

### **BERT Model Architecture:**
```
Input Text → BERT Tokenizer → BERT Encoder → Token Classification Head → CRF → NER Labels
```

### **BiLSTM-CRF Model Architecture:**
```
Input Text → Word Embeddings + Char LSTM → BiLSTM → Linear Layer → CRF → NER Labels
```

## 🎯 Entity Types Supported

All three models are trained to recognize the following entity types:
- `LESSOR_NAME`: Landlord/Property owner names
- `LESSEE_NAME`: Tenant/Renter names
- `PROPERTY_ADDRESS`: Property addresses
- `LEASE_START_DATE`: Lease start dates
- `LEASE_END_DATE`: Lease end dates
- `RENT_AMOUNT`: Monthly rent amounts
- `SECURITY_DEPOSIT_AMOUNT`: Security deposit amounts

## 🚀 Usage Instructions

### Running the Models

1. **spaCy Model:**
   ```bash
   cd backend
   jupyter notebook fine_tuned_NER.ipynb
   ```

2. **BERT Model:**
   ```bash
   cd backend
   jupyter notebook bert_based_ner.ipynb
   ```

3. **BiLSTM-CRF Model:**
   ```bash
   cd backend
   jupyter notebook bi_lstm_crf_ner.ipynb
   ```

### Model Outputs

Each model saves its trained weights in different formats:
- **spaCy**: `lease_ner_model/` directory
- **BERT**: `bert_lease_ner_model/` directory
- **BiLSTM-CRF**: `bilstm_crf_lease_ner_model.pth` and `bilstm_crf_vocab.pkl`

## 📊 Analysis Report

### **Training Data Analysis**
- **Dataset Size**: [Number] lease documents
- **Entity Distribution**: [Statistics on entity types]
- **Text Length**: Average document length and distribution
- **Entity Patterns**: Common patterns in lease documents

### **Model Performance Metrics**
- **Precision**: How many predicted entities are correct
- **Recall**: How many actual entities are found
- **F1-Score**: Harmonic mean of precision and recall
- **Accuracy**: Overall correctness of predictions

### **Computational Requirements**
- **Training Time**: Time required to train each model
- **Memory Usage**: RAM and GPU memory requirements
- **Inference Speed**: Time to process new documents
- **Model Size**: Storage requirements for each model

### **Error Analysis**
- **Common Errors**: Types of mistakes each model makes
- **Edge Cases**: Challenging scenarios for each approach
- **Improvement Areas**: Where each model could be enhanced

## 🔧 Integration with Frontend

The current FastAPI backend uses the spaCy model by default. To switch to other models:

1. **For BERT Model:**
   - Install transformers library: `pip install transformers`
   - Modify `main.py` to load BERT model

2. **For BiLSTM-CRF Model:**
   - Install PyTorch: `pip install torch`
   - Modify `main.py` to load BiLSTM-CRF model

## 📝 Recommendations

### **For Production Use:**
- **High Accuracy Required**: Use BERT-based model
- **Fast Inference Needed**: Use spaCy fine-tuned model
- **Custom Requirements**: Use BiLSTM-CRF model

### **For Research/Development:**
- **Experiment with Architecture**: BiLSTM-CRF
- **Baseline Comparison**: spaCy fine-tuned
- **State-of-the-art**: BERT-based

### **For Resource-Constrained Environments:**
- **Limited GPU**: spaCy fine-tuned
- **Limited Memory**: spaCy fine-tuned
- **Limited Storage**: spaCy fine-tuned

## 🔮 Future Improvements

1. **Ensemble Methods**: Combine predictions from all three models
2. **Active Learning**: Continuously improve models with new data
3. **Domain Adaptation**: Adapt models for different lease types
4. **Multi-language Support**: Extend to other languages
5. **Real-time Processing**: Optimize for streaming document processing

## 📚 References

- spaCy Documentation: https://spacy.io/
- Hugging Face Transformers: https://huggingface.co/transformers/
- PyTorch CRF Implementation: https://pytorch.org/
- NER Best Practices: https://arxiv.org/abs/1812.06202

---

**Note**: This analysis provides a comprehensive comparison of three different NER approaches for lease document processing. Each model has its strengths and is suitable for different use cases depending on requirements for accuracy, speed, and resource constraints. 