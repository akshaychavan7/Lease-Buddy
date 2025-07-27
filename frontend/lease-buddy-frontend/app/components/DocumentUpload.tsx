"use client"

import { useState, useCallback } from "react"
import { Box, Typography, Button, Paper } from "@mui/material"
import { CloudUpload, Description } from "@mui/icons-material"
import { useDropzone } from "react-dropzone"

interface DocumentUploadProps {
  onUploadStart: () => void
  onUploadSuccess: (data: any) => void
  onUploadError: (error: string) => void
  onProcessingStep: (step: string) => void
}

export default function DocumentUpload({
  onUploadStart,
  onUploadSuccess,
  onUploadError,
  onProcessingStep,
}: DocumentUploadProps) {
  const [uploading, setUploading] = useState(false)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
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

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        const result = await response.json()

        if (result.success) {
          onProcessingStep("Processing complete!")
          setTimeout(() => onUploadSuccess(result), 500)
        } else {
          onUploadError(result.message || "Upload failed")
        }
      } catch (error) {
        console.error("Upload error:", error)
        onUploadError("Upload failed. Please try again.")
      } finally {
        setUploading(false)
      }
    },
    [onUploadStart, onUploadSuccess, onUploadError, onProcessingStep],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/plain": [".txt"],
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    multiple: false,
    disabled: uploading,
  })

  return (
    <Box sx={{ textAlign: "center" }}>
      <Paper
        {...getRootProps()}
        sx={{
          p: 6,
          border: "2px dashed",
          borderColor: isDragActive ? "primary.main" : "grey.300",
          backgroundColor: isDragActive ? "action.hover" : "background.paper",
          cursor: uploading ? "not-allowed" : "pointer",
          transition: "all 0.3s ease",
          "&:hover": {
            borderColor: "primary.main",
            backgroundColor: "action.hover",
          },
        }}
      >
        <input {...getInputProps()} />

        <CloudUpload sx={{ fontSize: 80, color: "primary.main", mb: 3 }} />

        <Typography variant="h5" gutterBottom>
          {isDragActive ? "Drop the file here" : "Upload Your Document"}
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {isDragActive ? "Release to upload" : "Drag & drop a document here or click to browse"}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Supported formats: TXT, PDF, DOC, DOCX (Max 10MB)
        </Typography>

        <Button variant="contained" startIcon={<Description />} size="large" disabled={uploading}>
          Choose File
        </Button>
      </Paper>
    </Box>
  )
}
