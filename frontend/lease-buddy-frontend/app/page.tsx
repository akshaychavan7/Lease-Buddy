"use client"

import { useState } from "react"
import { Container, Paper, Typography, Box, Alert } from "@mui/material"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import DocumentUpload from "./components/DocumentUpload"
import EntityDisplay from "./components/EntityDisplay"
import ChatInterface from "./components/ChatInterface"
import ProcessingLoader from "./components/ProcessingLoader"

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
    background: {
      default: "#f5f5f5",
    },
  },
})

type ProcessingState = "upload" | "processing" | "complete" | "error"

export default function Home() {
  const [processingState, setProcessingState] = useState<ProcessingState>("upload")
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
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom align="center">
            Document NER & Chat Assistant
          </Typography>

          <Typography variant="subtitle1" align="center" color="text.secondary" sx={{ mb: 4 }}>
            Upload a document to extract named entities and chat about its content
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

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
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="h6" color="error" gutterBottom>
                Processing Failed
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                {error}
              </Typography>
              <DocumentUpload
                onUploadStart={handleUploadStart}
                onUploadSuccess={handleUploadSuccess}
                onUploadError={handleUploadError}
                onProcessingStep={handleProcessingStep}
              />
            </Box>
          )}

          {processingState === "complete" && entities && uploadedFile && (
            <Box sx={{ maxWidth: 1200, mx: "auto" }}>
              <Box sx={{ mb: 4 }}>
                <EntityDisplay entities={entities} filename={uploadedFile.filename} onReset={handleReset} />
              </Box>
              <Box>
                <ChatInterface filename={uploadedFile.filename} />
              </Box>
            </Box>
          )}
        </Paper>
      </Container>
    </ThemeProvider>
  )
}
