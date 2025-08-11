# Fine-tuned spaCy NER Model for Lease Document Analysis

This directory contains a fine-tuned spaCy Named Entity Recognition (NER) model specifically designed for extracting key entities from lease agreements and rental contracts.

## Model Overview

- **Base Model**: `en_core_web_md` (English pipeline optimized for CPU)
- **Version**: 3.7.1
- **Architecture**: Transition-based parser with tok2vec embeddings
- **Purpose**: Extract lease-specific entities from legal documents

## Supported Entity Types

The model is trained to recognize the following lease-related entities:

| Entity Type | Description | Performance |
|-------------|-------------|-------------|
| `LESSOR_NAME` | Name of the property owner/landlord | F1: 0.762 |
| `LESSEE_NAME` | Name of the tenant/renter | F1: 0.762 |
| `PROPERTY_ADDRESS` | Physical address of the leased property | F1: 0.476 |
| `LEASE_START_DATE` | Start date of the lease agreement | F1: 0.095 |
| `LEASE_END_DATE` | End date of the lease agreement | F1: 1.000 |
| `SECURITY_DEPOSIT_AMOUNT` | Security deposit amount specified | F1: 0.714 |

## Model Performance

### Overall Metrics
- **Total Training Samples**: 21 documents
- **Best Performing Entity**: `LEASE_END_DATE` (100% precision/recall)
- **Most Challenging Entity**: `LEASE_START_DATE` (9.5% precision/recall)

### Detailed Performance Breakdown
```json
{
    "LESSOR_NAME": {"precision": 0.762, "recall": 0.762, "f1_score": 0.762},
    "LESSEE_NAME": {"precision": 0.762, "recall": 0.762, "f1_score": 0.762},
    "PROPERTY_ADDRESS": {"precision": 0.476, "recall": 0.476, "f1_score": 0.476},
    "LEASE_START_DATE": {"precision": 0.095, "recall": 0.095, "f1_score": 0.095},
    "LEASE_END_DATE": {"precision": 1.0, "recall": 1.0, "f1_score": 1.0},
    "SECURITY_DEPOSIT_AMOUNT": {"precision": 0.714, "recall": 0.714, "f1_score": 0.714}
}
```

## Model Architecture

### Pipeline Components
1. **tok2vec**: Multi-hash embeddings with character-level features
2. **tagger**: Part-of-speech tagging
3. **parser**: Dependency parsing
4. **ner**: Named entity recognition (main component)
5. **attribute_ruler**: Rule-based attribute setting
6. **lemmatizer**: Rule-based lemmatization

### NER Model Configuration
- **Architecture**: `spacy.TransitionBasedParser.v2`
- **Hidden Width**: 64
- **Maxout Pieces**: 2
- **Embedding Width**: 96
- **Encoder Depth**: 4 layers
- **Window Size**: 1


## Usage

### Loading the Model
```python
import spacy

# Load the fine-tuned model
nlp = spacy.load("path/to/lease_ner_model")

# Process a lease document
text = "Your lease document text here..."
doc = nlp(text)

# Extract entities
for ent in doc.ents:
    print(f"{ent.text} - {ent.label_}")
```

### Example Output
```python
# Input: "John Smith agrees to lease 123 Main St from January 1, 2024 to December 31, 2024"
# Output:
# John Smith - LESSEE_NAME
# 123 Main St - PROPERTY_ADDRESS
# January 1, 2024 - LEASE_START_DATE
# December 31, 2024 - LEASE_END_DATE
```

## Training Data

The model was fine-tuned on a dataset of lease agreements and rental contracts, including:
- Residential lease agreements
- Commercial lease contracts
- Rental agreements
- Various document formats (PDF, DOCX, HTML)

## Evaluation Results

Detailed evaluation results are available in:
- `fine_tuned_spacy_evaluation_results.json` - Overall performance metrics
- `fine_tuned_spacy_exact_result.csv` - Exact match results
- `fine_tuned_spacy_partial_result.csv` - Partial match results
- `fine_tuned_spacy_testing_results.csv` - Testing dataset results

## Model Limitations

1. **Date Recognition**: The model struggles with lease start dates, likely due to varied date formats
2. **Address Extraction**: Property addresses show moderate performance, possibly due to complex formatting
3. **Training Data Size**: Limited to 21 training samples, which may affect generalization
4. **Domain Specificity**: Optimized for lease documents, may not perform well on other legal documents

## Recommendations for Improvement

1. **Increase Training Data**: Collect more diverse lease documents for training
2. **Date Format Standardization**: Preprocess dates to consistent formats
3. **Address Normalization**: Implement address parsing and standardization
4. **Data Augmentation**: Use techniques to expand the training dataset
5. **Hyperparameter Tuning**: Optimize model architecture for lease-specific entities

## Dependencies

- spaCy >= 3.7.2, < 3.8.0
- Python 3.8+
- English language vectors (`en_vectors`)

## License

This model is based on spaCy's MIT license and follows the same terms.
 