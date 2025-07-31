"use client"

import { useState } from "react"
import { Container, Paper, Typography, Box, Alert, Fade } from "@mui/material"
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
  fullContent: string
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
      <Container maxWidth="xl" sx={{ py: 6 }}>
        <Fade in={true} timeout={800}>
          <Paper elevation={4} sx={{ 
            p: 5, 
            borderRadius: 4,
            background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
            border: "1px solid",
            borderColor: "divider",
            position: "relative",
            overflow: "hidden",
          }}>
            {/* Background decoration */}
            <Box
              sx={{
                position: "absolute",
                top: -200,
                right: -200,
                width: 400,
                height: 400,
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(37, 99, 235, 0.05) 0%, rgba(37, 99, 235, 0) 70%)",
                zIndex: 0,
                animation: "float 8s ease-in-out infinite",
                "@keyframes float": {
                  "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
                  "50%": { transform: "translateY(-30px) rotate(180deg)" },
                }
              }}
            />
            <Box
              sx={{
                position: "absolute",
                bottom: -150,
                left: -150,
                width: 300,
                height: 300,
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(219, 39, 119, 0.05) 0%, rgba(219, 39, 119, 0) 70%)",
                zIndex: 0,
                animation: "float 10s ease-in-out infinite reverse",
              }}
            />

            <Box sx={{ position: "relative", zIndex: 1 }}>
              {/* Header */}
              <Box sx={{ textAlign: "center", mb: 6 }}>
                <Typography variant="h2" component="h1" gutterBottom sx={{ 
                  fontWeight: 700,
                  background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  mb: 2,
                }}>
                  Lease Buddy
                </Typography>

                <Typography variant="h5" color="text.secondary" sx={{ 
                  mb: 3,
                  fontWeight: 400,
                  maxWidth: 600,
                  mx: "auto",
                  lineHeight: 1.5,
                }}>
                  Upload your lease document to extract key information and chat with an AI assistant
                </Typography>

                <Typography variant="body1" color="text.secondary" sx={{ 
                  opacity: 0.8,
                  maxWidth: 500,
                  mx: "auto",
                }}>
                  Our AI-powered system automatically identifies important lease details like parties, dates, amounts, and more
                </Typography>
              </Box>

              {error && (
                <Fade in={true} timeout={400}>
                  <Alert severity="error" sx={{ mb: 4, borderRadius: 3 }}>
                    {error}
                  </Alert>
                </Fade>
              )}

              {processingState === "upload" && (
                <Fade in={true} timeout={600}>
                  <Box>
                    <DocumentUpload
                      onUploadStart={handleUploadStart}
                      onUploadSuccess={handleUploadSuccess}
                      onUploadError={handleUploadError}
                      onProcessingStep={handleProcessingStep}
                    />
                  </Box>
                </Fade>
              )}

              {processingState === "processing" && (
                <Fade in={true} timeout={600}>
                  <Box>
                    <ProcessingLoader currentStep={processingStep} onReset={handleReset} />
                  </Box>
                </Fade>
              )}

              {processingState === "error" && (
                <Fade in={true} timeout={600}>
                  <Box sx={{ textAlign: "center", py: 6 }}>
                    <Typography variant="h5" color="error" gutterBottom sx={{ fontWeight: 600 }}>
                      Processing Failed
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: "auto" }}>
                      {error}
                    </Typography>
                    <Fade in={true} timeout={800}>
                      <Box>
                        <DocumentUpload
                          onUploadStart={handleUploadStart}
                          onUploadSuccess={handleUploadSuccess}
                          onUploadError={handleUploadError}
                          onProcessingStep={handleProcessingStep}
                        />
                      </Box>
                    </Fade>
                  </Box>
                </Fade>
              )}

              {processingState === "complete" && entities && uploadedFile && (
                <Fade in={true} timeout={800}>
                  <Box sx={{ maxWidth: 1400, mx: "auto" }}>
                    <Box sx={{ mb: 6 }}>
                      <EntityDisplay entities={entities} filename={uploadedFile.filename} onReset={handleReset} />
                    </Box>
                    
                    {/* Divider with enhanced styling */}
                    <Box 
                      sx={{ 
                        position: "relative",
                        my: 8,
                        "&::before": {
                          content: '""',
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          transform: "translate(-50%, -50%)",
                          width: "100%",
                          height: 1,
                          background: "linear-gradient(90deg, transparent 0%, rgba(37, 99, 235, 0.2) 20%, rgba(37, 99, 235, 0.4) 50%, rgba(37, 99, 235, 0.2) 80%, transparent 100%)",
                        },
                        "&::after": {
                          content: '""',
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          transform: "translate(-50%, -50%)",
                          width: 60,
                          height: 60,
                          borderRadius: "50%",
                          background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)",
                          zIndex: 1,
                        }
                      }}
                    >
                      <Box
                        sx={{
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          transform: "translate(-50%, -50%)",
                          zIndex: 2,
                          color: "white",
                          fontSize: 24,
                        }}
                      >
                        💬
                      </Box>
                    </Box>
                    
                    <Fade in={true} timeout={1000}>
                      <Box>
                        <ChatInterface filename={uploadedFile.filename} documentContent={uploadedFile.fullContent} />
                      </Box>
                    </Fade>
                  </Box>
                </Fade>
              )}
            </Box>
          </Paper>
        </Fade>
      </Container>
    </ThemeProvider>
  )
}
