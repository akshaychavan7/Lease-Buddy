"use client"

import { useState, useCallback } from "react"
import "./DocumentUpload.css"

const DocumentUpload = ({ onUploadStart, onUploadSuccess, onUploadError, onProcessingStep }) => {
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const handleFiles = useCallback(
    async (files) => {
      const file = files[0]
      if (!file) return

      setUploading(true)
      onUploadStart()

      try {
        onProcessingStep("Uploading document...")

        const formData = new FormData()
        formData.append("file", file)

        // Simulate processing steps
        setTimeout(() => onProcessingStep("Extracting text content..."), 1000)
        setTimeout(() => onProcessingStep("Running NER analysis..."), 2000)
        setTimeout(() => onProcessingStep("Identifying named entities..."), 3000)
        setTimeout(() => onProcessingStep("Finalizing results..."), 4000)

        // Simulate API call with mock data
        setTimeout(() => {
          const mockEntities = {
            PERSON: ["John Smith", "Mary Johnson", "David Wilson"],
            ORGANIZATION: ["Microsoft Corp", "Google Inc", "Apple Inc"],
            LOCATION: ["New York", "California", "London"],
            DATE: ["2024-01-15", "2023-12-01"],
            EMAIL: ["john@example.com", "mary@company.com"],
            PHONE: ["555-123-4567", "555-987-6543"],
          }

          const result = {
            success: true,
            filename: file.name,
            entities: mockEntities,
            content: "Document content preview...",
          }

          onProcessingStep("Processing complete!")
          setTimeout(() => onUploadSuccess(result), 500)
        }, 5000)
      } catch (error) {
        console.error("Upload error:", error)
        onUploadError("Upload failed. Please try again.")
      } finally {
        setUploading(false)
      }
    },
    [onUploadStart, onUploadSuccess, onUploadError, onProcessingStep],
  )

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFiles(e.dataTransfer.files)
      }
    },
    [handleFiles],
  )

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }, [])

  const handleChange = useCallback(
    (e) => {
      e.preventDefault()
      if (e.target.files && e.target.files[0]) {
        handleFiles(e.target.files)
      }
    },
    [handleFiles],
  )

  return (
    <div className="upload-container">
      <div
        className={`upload-dropzone ${dragActive ? "drag-active" : ""} ${uploading ? "uploading" : ""}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !uploading && document.getElementById("file-input").click()}
      >
        <input
          id="file-input"
          type="file"
          accept=".txt,.pdf,.doc,.docx"
          onChange={handleChange}
          disabled={uploading}
          style={{ display: "none" }}
        />

        <div className="upload-icon">📄</div>

        <h3 className="upload-title">{dragActive ? "Drop the file here" : "Upload Your Document"}</h3>

        <p className="upload-description">
          {dragActive ? "Release to upload" : "Drag & drop a document here or click to browse"}
        </p>

        <p className="upload-formats">Supported formats: TXT, PDF, DOC, DOCX (Max 10MB)</p>

        <button className="upload-button" disabled={uploading}>
          📋 Choose File
        </button>
      </div>
    </div>
  )
}

export default DocumentUpload
