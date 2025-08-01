"use client"

import { useState } from "react"
import { Container, Paper, Typography, Box, Alert, Fade } from "@mui/material"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import { Description, AutoAwesome, Security, Chat, Upload } from "@mui/icons-material"
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
      <Box sx={{ minHeight: "100vh" }}>
        <Fade in={true} timeout={800}>
          <Box>
              {/* Adobe-style Navbar Header */}
              <Box sx={{ 
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1000,
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(10px)",
                borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
              }}>
                <Container maxWidth="xl">
                  <Box sx={{ 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "space-between",
                    py: 2,
                    px: 3,
                  }}>
                    {/* Logo and Brand */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: "8px",
                          background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 2px 8px rgba(37, 99, 235, 0.3)",
                        }}
                      >
                        <Description sx={{ fontSize: 24, color: "white" }} />
                      </Box>
                      <Typography variant="h6" sx={{ 
                        fontWeight: 700,
                        color: "text.primary",
                        letterSpacing: "-0.02em",
                      }}>
                        LeaseBuddy
                      </Typography>
                    </Box>

                    {/* Navigation Items - Only show when details are loaded */}
                    {processingState === "complete" && entities && uploadedFile && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            px: 3,
                            py: 1.5,
                            borderRadius: "8px",
                            backgroundColor: "rgba(37, 99, 235, 0.08)",
                            border: "1px solid rgba(37, 99, 235, 0.15)",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            "&:hover": {
                              backgroundColor: "rgba(37, 99, 235, 0.12)",
                              borderColor: "rgba(37, 99, 235, 0.25)",
                              transform: "translateY(-1px)",
                              boxShadow: "0 4px 12px rgba(37, 99, 235, 0.15)",
                            },
                          }}
                          onClick={() => {
                            document.getElementById('lease-details')?.scrollIntoView({ 
                              behavior: 'smooth' 
                            });
                          }}
                        >
                          <Description sx={{ fontSize: 16, color: "primary.main" }} />
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: "primary.main",
                              fontWeight: 600,
                              fontSize: "0.875rem",
                            }}
                          >
                            Lease Details
                          </Typography>
                        </Box>
                        
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            px: 3,
                            py: 1.5,
                            borderRadius: "8px",
                            backgroundColor: "rgba(219, 39, 119, 0.08)",
                            border: "1px solid rgba(219, 39, 119, 0.15)",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            "&:hover": {
                              backgroundColor: "rgba(219, 39, 119, 0.12)",
                              borderColor: "rgba(219, 39, 119, 0.25)",
                              transform: "translateY(-1px)",
                              boxShadow: "0 4px 12px rgba(219, 39, 119, 0.15)",
                            },
                          }}
                          onClick={() => {
                            document.getElementById('chat-section')?.scrollIntoView({ 
                              behavior: 'smooth' 
                            });
                          }}
                        >
                          <Chat sx={{ fontSize: 16, color: "secondary.main" }} />
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: "secondary.main",
                              fontWeight: 600,
                              fontSize: "0.875rem",
                            }}
                          >
                            Chat
                          </Typography>
                        </Box>
                      </Box>
                    )}


                  </Box>
                </Container>
              </Box>

              {/* Main Content with Top Spacing */}
              <Box sx={{ pt: 12, pb: 6 }}>
                {/* Hero Section - Only show on upload state */}
                {processingState === "upload" && (
                  <Box sx={{ textAlign: "center", mb: 8 }}>
                    <Typography variant="h1" sx={{ 
                      fontWeight: 800,
                      fontSize: "3.5rem",
                      lineHeight: 1.1,
                      color: "text.primary",
                      mb: 3,
                      letterSpacing: "-0.03em",
                    }}>
                      Intelligent Lease
                      <br />
                      <Box component="span" sx={{ 
                        background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                        backgroundClip: "text",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}>
                        Document Analysis
                      </Box>
                    </Typography>

                    <Typography variant="h5" sx={{ 
                      fontWeight: 400,
                      color: "text.secondary",
                      maxWidth: 600,
                      mx: "auto",
                      lineHeight: 1.5,
                      mb: 4,
                    }}>
                      Extract key information from lease documents with AI-powered precision and chat with intelligent insights
                    </Typography>
                  </Box>
                )}
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
                  <Box sx={{ px: 3, py: 4 }}>
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
                  <Box sx={{ px: 3, py: 4 }}>
                    <ProcessingLoader currentStep={processingStep} onReset={handleReset} />
                  </Box>
                </Fade>
              )}

              {processingState === "error" && (
                <Fade in={true} timeout={600}>
                  <Box sx={{ textAlign: "center", py: 6, px: 3 }}>
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
                  <Box sx={{ maxWidth: 1400, mx: "auto", px: 3, py: 4 }}>
                    <Box id="lease-details" sx={{ mb: 6 }}>
                      <EntityDisplay entities={entities} filename={uploadedFile.filename} onReset={handleReset} />
                    </Box>
                    
                    
                    <Fade in={true} timeout={1000}>
                      <Box id="chat-section" sx={{ mt: 4 }}>
                        <ChatInterface filename={uploadedFile.filename} documentContent={uploadedFile.fullContent} />
                      </Box>
                    </Fade>
                  </Box>
                </Fade>
              )}
            </Box>
          </Fade>
        </Box>
      </ThemeProvider>
    )
  }
