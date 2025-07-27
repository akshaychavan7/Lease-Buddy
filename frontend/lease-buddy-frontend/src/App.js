"use client"

import { useState } from "react"
import "./App.css"
import DocumentUpload from "./components/DocumentUpload"
import EntityDisplay from "./components/EntityDisplay"
import ChatInterface from "./components/ChatInterface"
import ProcessingLoader from "./components/ProcessingLoader"

function App() {
  const [processingState, setProcessingState] = useState("upload") // 'upload' | 'processing' | 'complete' | 'error'
  const [uploadedFile, setUploadedFile] = useState(null)
  const [entities, setEntities] = useState(null)
  const [error, setError] = useState("")
  const [processingStep, setProcessingStep] = useState("")

  const handleUploadStart = () => {
    setProcessingState("processing")
    setError("")
  }

  const handleUploadSuccess = (data) => {
    setUploadedFile(data)
    setEntities(data.entities)
    setProcessingState("complete")
  }

  const handleUploadError = (errorMessage) => {
    setError(errorMessage)
    setProcessingState("error")
  }

  const handleReset = () => {
    setProcessingState("upload")
    setUploadedFile(null)
    setEntities(null)
    setError("")
    setProcessingStep("")
  }

  const handleProcessingStep = (step) => {
    setProcessingStep(step)
  }

  return (
    <div className="app">
      <div className="container">
        <div className="main-paper">
          <h1 className="main-title">Document NER & Chat Assistant</h1>
          <p className="main-subtitle">Upload a document to extract named entities and chat about its content</p>

          {error && <div className="error-alert">{error}</div>}

          {processingState === "upload" && (
            <DocumentUpload
              onUploadStart={handleUploadStart}
              onUploadSuccess={handleUploadSuccess}
              onUploadError={handleUploadError}
              onProcessingStep={handleProcessingStep}
            />
          )}

          {processingState === "processing" && <ProcessingLoader currentStep={processingStep} onReset={handleReset} />}

          {processingState === "error" && (
            <div className="error-container">
              <h3 className="error-title">Processing Failed</h3>
              <p className="error-message">{error}</p>
              <DocumentUpload
                onUploadStart={handleUploadStart}
                onUploadSuccess={handleUploadSuccess}
                onUploadError={handleUploadError}
                onProcessingStep={handleProcessingStep}
              />
            </div>
          )}

          {processingState === "complete" && entities && uploadedFile && (
            <div className="results-container">
              <div className="entities-section">
                <EntityDisplay entities={entities} filename={uploadedFile.filename} onReset={handleReset} />
              </div>
              <div className="chat-section">
                <ChatInterface filename={uploadedFile.filename} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
