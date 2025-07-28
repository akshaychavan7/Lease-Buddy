# Lease Buddy Frontend

A Next.js frontend application that integrates with the FastAPI backend for lease document NER extraction and chat functionality.

## Features

- **Document Upload**: Drag and drop interface for uploading lease documents
- **NER Extraction**: Automatic extraction of lease-specific entities using the FastAPI backend
- **Entity Display**: Beautiful visualization of extracted entities with proper categorization
- **Chat Interface**: AI-powered chat about the uploaded document
- **Responsive Design**: Modern UI with Material-UI components

## Entity Types Extracted

The application extracts the following lease-specific entities:

- **LESSOR_NAME**: Landlord's name
- **LESSEE_NAME**: Tenant's name  
- **PROPERTY_ADDRESS**: Property address
- **LEASE_START_DATE**: Lease start date
- **LEASE_END_DATE**: Lease end date
- **RENT_AMOUNT**: Monthly rent amount
- **SECURITY_DEPOSIT_AMOUNT**: Security deposit amount

## Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start the Backend** (in a separate terminal):
   ```bash
   cd backend
   python3 main.py
   ```

3. **Start the Frontend**:
   ```bash
   npm run dev
   ```

4. **Access the Application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## Backend Integration

The frontend communicates with the FastAPI backend through the following endpoints:

- **Health Check**: `GET /health`
- **Entity Types**: `GET /entity-types`
- **NER Extraction**: `POST /extract-entities`

The upload process:
1. User uploads a document through the frontend
2. Frontend extracts text content from the document
3. Frontend sends text to FastAPI backend for NER extraction
4. Backend returns extracted entities
5. Frontend displays entities in a user-friendly format

## Testing

Run the integration test to verify everything works:

```bash
node test_integration.js
```

## File Structure

```
app/
├── components/
│   ├── DocumentUpload.tsx    # File upload interface
│   ├── EntityDisplay.tsx     # Entity visualization
│   ├── ChatInterface.tsx     # AI chat interface
│   └── ProcessingLoader.tsx  # Loading states
├── api/
│   ├── upload/route.ts       # File upload API
│   └── chat/route.ts         # Chat API
└── page.tsx                  # Main application page
```

## Environment Variables

The frontend uses the following environment variables:

- `BACKEND_URL`: URL of the FastAPI backend (default: http://localhost:8000)

## Supported File Types

- PDF files
- DOC/DOCX files
- TXT files

## Technologies Used

- **Next.js 15**: React framework
- **Material-UI**: UI components
- **React Dropzone**: File upload
- **OpenAI**: Chat functionality
- **TypeScript**: Type safety 