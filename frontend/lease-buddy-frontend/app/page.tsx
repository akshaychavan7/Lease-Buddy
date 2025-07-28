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
      main: "#2563eb",
      light: "#60a5fa",
      dark: "#1d4ed8",
      contrastText: "#ffffff",
      // @ts-ignore
      lighter: "#eff6ff"
    },
    secondary: {
      main: "#db2777",
      light: "#f472b6",
      dark: "#be185d",
      contrastText: "#ffffff",
      // @ts-ignore
      lighter: "#fdf2f8"
    },
    success: {
      main: "#16a34a",
      light: "#4ade80",
      dark: "#15803d",
      contrastText: "#ffffff",
      // @ts-ignore
      lighter: "#f0fdf4"
    },
    info: {
      main: "#0891b2",
      light: "#22d3ee",
      dark: "#0e7490",
      contrastText: "#ffffff",
      // @ts-ignore
      lighter: "#ecfeff"
    },
    warning: {
      main: "#d97706",
      light: "#fbbf24",
      dark: "#b45309",
      contrastText: "#ffffff",
      // @ts-ignore
      lighter: "#fffbeb"
    },
    error: {
      main: "#dc2626",
      light: "#f87171",
      dark: "#b91c1c",
      contrastText: "#ffffff",
      // @ts-ignore
      lighter: "#fef2f2"
    },
    background: {
      default: "#f8fafc",
      paper: "#ffffff"
    }
  },
  typography: {
    fontFamily: '"Geist", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h1: {
      fontSize: "2.5rem",
      fontWeight: 600,
      lineHeight: 1.2,
    },
    h3: {
      fontSize: "2rem",
      fontWeight: 600,
      lineHeight: 1.3,
    },
    subtitle1: {
      fontSize: "1.1rem",
      lineHeight: 1.5,
    },
    body1: {
      lineHeight: 1.6,
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
          fontWeight: 500,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
      },
    },
  },
  shape: {
    borderRadius: 12,
  },
})

type ProcessingState = "upload" | "processing" | "complete" | "error"

interface UploadResponse {
  filename: string
  entities: Record<string, string[]>
}

export default function Home() {
  const [processingState, setProcessingState] = useState<ProcessingState>("upload")
  const [uploadedFile, setUploadedFile] = useState<UploadResponse | null>(null)
  const [entities, setEntities] = useState<Record<string, string[]> | null>(null)
  const [error, setError] = useState("")
  const [processingStep, setProcessingStep] = useState("")

  const handleUploadStart = () => {
    setProcessingState("processing")
    setError("")
  }

  const handleUploadSuccess = (data: UploadResponse) => {
    setUploadedFile(data)
    setEntities(data.entities)
    setProcessingState("complete")
  }

  const handleUploadError = (errorMessage: string) => {
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

  const handleProcessingStep = (step: string) => {
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
              <Box sx={{ mb: 5 }}>
                <EntityDisplay entities={entities} filename={uploadedFile.filename} onReset={handleReset} />
              </Box>
              <Box 
                sx={{ 
                  position: "relative",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: -32,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 100,
                    height: 1,
                    bgcolor: "divider",
                  }
                }}
              >
                <ChatInterface filename={uploadedFile.filename} />
              </Box>
            </Box>
          )}
        </Paper>
      </Container>
    </ThemeProvider>
  )
}
