"use client"

import { useCallback } from "react"
import { Box, Typography, Paper } from "@mui/material"
import { useDropzone } from "react-dropzone"
import { CloudUpload } from "@mui/icons-material"

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
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return

      const file = acceptedFiles[0]
      const formData = new FormData()
      formData.append("file", file)

      try {
        onUploadStart()
        onProcessingStep("Uploading document...")

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          throw new Error("Upload failed")
        }

        const data = await response.json()
        onUploadSuccess(data)
      } catch (error) {
        onUploadError("Failed to upload and process the document. Please try again.")
      }
    },
    [onUploadStart, onUploadSuccess, onUploadError, onProcessingStep]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc']
    },
    maxFiles: 1,
  })

  return (
    <Box sx={{ maxWidth: 600, mx: "auto" }}>
      <Paper
        elevation={2}
        sx={{
          p: 4,
          borderRadius: 3,
          background: "linear-gradient(to bottom, #ffffff, #f8fafc)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          {...getRootProps()}
          sx={{
            position: "relative",
            zIndex: 1,
            border: "2px dashed",
            borderColor: isDragActive ? "primary.main" : "divider",
            borderRadius: 3,
            p: 8,
            textAlign: "center",
            cursor: "pointer",
            transition: "all 0.2s ease",
            backgroundColor: isDragActive ? "action.hover" : "transparent",
            "&:hover": {
              borderColor: "primary.main",
              backgroundColor: "action.hover",
            },
          }}
        >
          <input {...getInputProps()} />
          <CloudUpload
            sx={{
              fontSize: 48,
              color: isDragActive ? "primary.main" : "text.secondary",
              mb: 2,
              transition: "color 0.2s ease",
            }}
          />
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            {isDragActive ? "Drop your document here" : "Upload your document"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Drag and drop your file here, or click to select
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
            Supported formats: PDF, DOC, DOCX, TXT
          </Typography>
        </Box>

        {/* Background decoration */}
        <Box
          sx={{
            position: "absolute",
            top: -100,
            right: -100,
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(37, 99, 235, 0.1) 0%, rgba(37, 99, 235, 0) 70%)",
            zIndex: 0,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: -60,
            left: -60,
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(219, 39, 119, 0.1) 0%, rgba(219, 39, 119, 0) 70%)",
            zIndex: 0,
          }}
        />
      </Paper>
    </Box>
  )
}
