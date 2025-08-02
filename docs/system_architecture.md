# Lease-Buddy System Architecture

## Overall System Architecture

```mermaid
graph TB
    subgraph "Frontend Layer"
        UI[Next.js Frontend<br/>React + TypeScript]
        UP[Document Upload<br/>Component]
        CI[Chat Interface<br/>Component]
        ED[Entity Display<br/>Component]
    end

    subgraph "Backend API Layer"
        API[FastAPI Server<br/>Port 8000]
        CH[Chat Helper<br/>OpenAI Integration]
        LCH[Local Chat Helper<br/>Ollama Integration]
        NER[Entity Recognition<br/>Pipeline]
    end

    subgraph "NLP Models Layer"
        SPA[spaCy Fine-tuned<br/>NER Model]
        BERT[BERT-based<br/>NER Model]
        LSTM[BiLSTM-CRF<br/>NER Model]
    end

    subgraph "External Services"
        OLL[Ollama Server<br/>Local LLM]
        OAI[OpenAI API<br/>Cloud LLM]
    end

    subgraph "Data Layer"
        DOCS[Document Storage<br/>Uploaded Files]
        HIST[Conversation<br/>History]
        ENT[Extracted<br/>Entities]
    end

    %% Frontend connections
    UI --> API
    UP --> API
    CI --> API
    ED --> API

    %% Backend connections
    API --> CH
    API --> LCH
    API --> NER

    %% Model connections
    NER --> SPA
    NER --> BERT
    NER --> LSTM

    %% External service connections
    LCH --> OLL
    CH --> OAI

    %% Data connections
    API --> DOCS
    API --> HIST
    API --> ENT

    %% Styling
    classDef frontend fill:#e1f5fe
    classDef backend fill:#f3e5f5
    classDef models fill:#e8f5e8
    classDef external fill:#fff3e0
    classDef data fill:#fce4ec

    class UI,UP,CI,ED frontend
    class API,CH,LCH,NER backend
    class SPA,BERT,LSTM models
    class OLL,OAI external
    class DOCS,HIST,ENT data
```

## Data Flow Architecture

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend API
    participant N as NLP Models
    participant L as Local LLM
    participant C as Cloud LLM

    %% Document Upload Flow
    U->>F: Upload Lease Document
    F->>B: POST /extract-entities
    B->>N: Process Document
    N->>B: Return Entities
    B->>F: Send Entity Data
    F->>U: Display Extracted Entities

    %% Chat Flow (Local)
    U->>F: Ask Question
    F->>B: POST /chat/local
    B->>L: Send Query + Context
    L->>B: Return Response
    B->>F: Send Chat Response
    F->>U: Display Answer

    %% Chat Flow (Cloud)
    U->>F: Ask Question
    F->>B: POST /chat
    B->>C: Send Query + Context
    C->>B: Return Response
    B->>F: Send Chat Response
    F->>U: Display Answer
```

## spaCy NER Model Architecture

```mermaid
graph TB
    subgraph "Input Processing"
        TEXT[Raw Text Input]
        TOK[Tokenization]
        PREP[Preprocessing<br/>Normalization]
    end

    subgraph "Embedding Layer"
        EMB[MultiHashEmbed<br/>Character-level features]
        ATTR[NORM, PREFIX, SUFFIX<br/>SHAPE, SPACY]
        VEC[Static Vectors<br/>Word Embeddings]
    end

    subgraph "Encoding Layer"
        ENC[MaxoutWindowEncoder<br/>CNN-based encoding]
        WIND[Window Size: 1<br/>Depth: 4]
        MAX[Maxout Pieces: 3<br/>Width: 96]
    end

    subgraph "NER Component"
        PARSER[TransitionBasedParser<br/>NER State Type]
        HID[Hidden Width: 64<br/>Maxout Pieces: 2]
        UPPER[Use Upper: True]
    end

    subgraph "Output Layer"
        LABELS[Entity Labels<br/>DATE, AMOUNT, PARTY, etc.]
        SPANS[Entity Spans<br/>Start/End Positions]
        SCORES[Confidence Scores]
    end

    %% Flow connections
    TEXT --> TOK
    TOK --> PREP
    PREP --> EMB
    EMB --> ATTR
    EMB --> VEC
    ATTR --> ENC
    VEC --> ENC
    ENC --> PARSER
    PARSER --> LABELS
    PARSER --> SPANS
    PARSER --> SCORES

    %% Styling
    classDef input fill:#e3f2fd
    classDef embed fill:#f1f8e9
    classDef encode fill:#fff8e1
    classDef ner fill:#fce4ec
    classDef output fill:#e8eaf6

    class TEXT,TOK,PREP input
    class EMB,ATTR,VEC embed
    class ENC,WIND,MAX encode
    class PARSER,HID,UPPER ner
    class LABELS,SPANS,SCORES output
```

## spaCy Model Configuration Details

```mermaid
graph LR
    subgraph "Model Components"
        TOK2VEC[tok2vec<br/>Token to Vector]
        TAGGER[tagger<br/>Part of Speech]
        PARSER[parser<br/>Dependency Parsing]
        NER[ner<br/>Named Entity Recognition]
        LEMMA[lemmatizer<br/>Word Lemmatization]
        ATTR[attribute_ruler<br/>Rule-based Features]
    end

    subgraph "Pipeline Flow"
        INPUT[Text Input]
        OUTPUT[Processed Document]
    end

    subgraph "NER Architecture"
        EMBED[MultiHashEmbed<br/>Width: 96]
        ENCODE[MaxoutWindowEncoder<br/>Depth: 4]
        TRANS[TransitionBasedParser<br/>State: ner]
    end

    %% Pipeline connections
    INPUT --> TOK2VEC
    TOK2VEC --> TAGGER
    TOK2VEC --> PARSER
    TOK2VEC --> NER
    TAGGER --> LEMMA
    PARSER --> ATTR
    NER --> OUTPUT
    LEMMA --> OUTPUT
    ATTR --> OUTPUT

    %% NER internal connections
    NER --> EMBED
    EMBED --> ENCODE
    ENCODE --> TRANS

    %% Styling
    classDef component fill:#e1f5fe
    classDef flow fill:#f3e5f5
    classDef arch fill:#e8f5e8

    class TOK2VEC,TAGGER,PARSER,NER,LEMMA,ATTR component
    class INPUT,OUTPUT flow
    class EMBED,ENCODE,TRANS arch
```

## Model Training Pipeline

```mermaid
graph TB
    subgraph "Data Preparation"
        RAW[Raw Lease Documents]
        ANNO[Manual Annotation<br/>Entity Labels]
        SPLIT[Train/Dev Split]
    end

    subgraph "Training Process"
        INIT[Initialize spaCy Model<br/>en_core_web_md]
        CONFIG[Configure NER Component<br/>Add Custom Labels]
        TRAIN[Training Loop<br/>100 Iterations]
        OPT[Optimizer<br/>SGD with Dropout]
    end

    subgraph "Model Output"
        SAVE[Save Trained Model<br/>lease_ner_model/]
        TEST[Test Model<br/>Entity Extraction]
        EVAL[Evaluate Performance<br/>Precision/Recall]
    end

    %% Training flow
    RAW --> ANNO
    ANNO --> SPLIT
    SPLIT --> INIT
    INIT --> CONFIG
    CONFIG --> TRAIN
    TRAIN --> OPT
    OPT --> SAVE
    SAVE --> TEST
    TEST --> EVAL

    %% Styling
    classDef data fill:#e3f2fd
    classDef train fill:#f1f8e9
    classDef output fill:#fff8e1

    class RAW,ANNO,SPLIT data
    class INIT,CONFIG,TRAIN,OPT train
    class SAVE,TEST,EVAL output
```

## Entity Recognition Process

```mermaid
flowchart TD
    A[Document Upload] --> B[Text Extraction]
    B --> C[Tokenization]
    C --> D[Feature Extraction]
    D --> E[NER Model Processing]
    E --> F[Entity Detection]
    F --> G[Entity Classification]
    G --> H[Entity Validation]
    H --> I[Entity Output]

    subgraph "Entity Types"
        DATE[Date Entities<br/>Lease start/end dates]
        AMOUNT[Amount Entities<br/>Rent, deposits, fees]
        PARTY[Party Entities<br/>Landlord, tenant names]
        ADDRESS[Address Entities<br/>Property addresses]
        TERM[Term Entities<br/>Lease duration, conditions]
    end

    I --> DATE
    I --> AMOUNT
    I --> PARTY
    I --> ADDRESS
    I --> TERM

    %% Styling
    classDef process fill:#e1f5fe
    classDef entity fill:#f3e5f5

    class A,B,C,D,E,F,G,H,I process
    class DATE,AMOUNT,PARTY,ADDRESS,TERM entity
```

## Technology Stack Architecture

```mermaid
graph TB
    subgraph "Frontend Stack"
        NEXT[Next.js 14]
        REACT[React 18]
        TS[TypeScript]
        TAIL[Tailwind CSS]
        SHAD[Shadcn/ui]
    end

    subgraph "Backend Stack"
        FAST[FastAPI]
        PYTH[Python 3.9+]
        SPACY[spaCy 3.x]
        TORCH[PyTorch]
        TRANS[Transformers]
    end

    subgraph "AI/ML Stack"
        BERT[BERT-base-uncased]
        LSTM[BiLSTM-CRF]
        OLL[Ollama]
        OAI[OpenAI API]
    end

    subgraph "Infrastructure"
        DOCK[Docker]
        VENV[Python Virtual Environment]
        NODE[Node.js Environment]
        ENV[Environment Variables]
    end

    %% Stack connections
    NEXT --> REACT
    REACT --> TS
    TS --> TAIL
    TAIL --> SHAD

    FAST --> PYTH
    PYTH --> SPACY
    SPACY --> TORCH
    TORCH --> TRANS

    BERT --> OAI
    LSTM --> OLL
    OLL --> OAI

    %% Styling
    classDef frontend fill:#e3f2fd
    classDef backend fill:#f1f8e9
    classDef ai fill:#fff8e1
    classDef infra fill:#fce4ec

    class NEXT,REACT,TS,TAIL,SHAD frontend
    class FAST,PYTH,SPACY,TORCH,TRANS backend
    class BERT,LSTM,OLL,OAI ai
    class DOCK,VENV,NODE,ENV infra
``` 