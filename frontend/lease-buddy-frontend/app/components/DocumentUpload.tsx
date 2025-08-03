"use client"

import { useCallback, useState, useEffect } from "react"
import { Box, Typography, Paper, Button, Chip, Fade, Zoom, FormControl, InputLabel, Select, MenuItem, Alert } from "@mui/material"
import { useDropzone } from "react-dropzone"
import { CloudUpload, Description, CheckCircle, Error, Psychology } from "@mui/icons-material"

interface Model {
  name: string
  display_name: string
  type: string
}

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
  const [dragState, setDragState] = useState<'idle' | 'drag' | 'error'>('idle')
  const [selectedModel, setSelectedModel] = useState<string>("spacy")
  const [availableModels, setAvailableModels] = useState<Model[]>([])
  const [modelsLoading, setModelsLoading] = useState(true)
  const [modelsError, setModelsError] = useState<string>("")

  // Fetch available models on component mount
  useEffect(() => {
    const fetchModels = async () => {
      try {
        setModelsLoading(true)
        const response = await fetch("/api/models")
        if (!response.ok) {
          throw new Error("Failed to fetch models")
        }
        const data = await response.json()
        setAvailableModels(data.models || [])
        if (data.models && data.models.length > 0) {
          setSelectedModel(data.models[0].name)
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to load available models"
        setModelsError(errorMessage)
        console.error("Error fetching models:", error)
      } finally {
        setModelsLoading(false)
      }
    }

    fetchModels()
  }, [])

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return

      const file = acceptedFiles[0]
      const formData = new FormData()
      formData.append("file", file)
      formData.append("model", selectedModel)

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
        const errorMessage = error instanceof Error ? error.message : "Failed to upload and process the document. Please try again."
        onUploadError(errorMessage)
      }
    },
    [onUploadStart, onUploadSuccess, onUploadError, onProcessingStep, selectedModel]
  )

  const onDropRejected = useCallback(() => {
    setDragState('error')
    setTimeout(() => setDragState('idle'), 2000)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc']
    },
    maxFiles: 1,
  })

  const isError = dragState === 'error'

  return (
    <Box sx={{ maxWidth: 700, mx: "auto" }}>
      <Paper
        elevation={3}
        sx={{
          p: 5,
          borderRadius: 4,
          background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
          position: "relative",
          overflow: "hidden",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        {/* Header Section */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography variant="h4" sx={{ 
            fontWeight: 700, 
            mb: 4,
            background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            Upload Your Lease Document
          </Typography>

          
          {/* Model Selection */}
          <Box sx={{ mb: 3 }}>
            {modelsError && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                {modelsError}
              </Alert>
            )}
            
            <FormControl fullWidth sx={{ maxWidth: 400 }}>
              <InputLabel id="model-select-label">Choose NER Model</InputLabel>
              <Select
                labelId="model-select-label"
                id="model-select"
                value={selectedModel}
                label="Choose AI Model"
                onChange={(e) => setSelectedModel(e.target.value)}
                disabled={modelsLoading}
                startAdornment={
                  <Psychology sx={{ mr: 1, color: "text.secondary" }} />
                }
              >
                {availableModels.map((model) => (
                  <MenuItem key={model.name} value={model.name}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {model.display_name}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          
          {/* Feature Chips */}
          <Box sx={{ display: "flex", gap: 1, justifyContent: "center", flexWrap: "wrap" }}>
            <Chip 
              icon={<Description />} 
              label="Chat Support" 
              size="small" 
              color="primary" 
              variant="outlined"
            />
            <Chip 
              icon={<Psychology />} 
              label="Multiple AI Models" 
              size="small" 
              color="info" 
              variant="outlined"
            />
            <Chip 
              icon={<CheckCircle />} 
              label="Instant Results" 
              size="small" 
              color="success" 
              variant="outlined"
            />
          </Box>
        </Box>

        {/* Upload Area */}
        <Fade in={true} timeout={800}>
          <Box
            {...getRootProps()}
            sx={{
              position: "relative",
              zIndex: 1,
              border: "3px dashed",
              borderColor: isDragActive ? "primary.main" : isError ? "error.main" : "divider",
              borderRadius: 4,
              p: 8,
              textAlign: "center",
              cursor: "pointer",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              backgroundColor: isDragActive 
                ? "primary.lighter" 
                : isError 
                ? "error.lighter" 
                : "transparent",
              transform: isDragActive ? "scale(1.02)" : "scale(1)",
              "&:hover": {
                borderColor: "primary.main",
                backgroundColor: "primary.lighter",
                transform: "scale(1.01)",
              },
            }}
          >
            <input {...getInputProps()} />
            
            <Zoom in={true} timeout={600}>
              <Box>
                {isError ? (
                  <Error sx={{
                    fontSize: 64,
                    color: "error.main",
                    mb: 3,
                    animation: "shake 0.5s ease-in-out",
                    "@keyframes shake": {
                      "0%, 100%": { transform: "translateX(0)" },
                      "25%": { transform: "translateX(-5px)" },
                      "75%": { transform: "translateX(5px)" },
                    }
                  }} />
                ) : (
                  <CloudUpload sx={{
                    fontSize: 64,
                    color: isDragActive ? "primary.main" : "text.secondary",
                    mb: 3,
                    transition: "all 0.3s ease",
                    transform: isDragActive ? "translateY(-10px)" : "translateY(0)",
                  }} />
                )}
              </Box>
            </Zoom>

            <Typography variant="h5" sx={{ 
              fontWeight: 600, 
              mb: 2,
              color: isError ? "error.main" : "text.primary"
            }}>
              {isError 
                ? "Invalid file type" 
                : isDragActive 
                ? "Drop your document here" 
                : "Upload your document"
              }
            </Typography>
            
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              {isError 
                ? "Please select a supported file type"
                : "Drag and drop your file here, or click to select"
              }
            </Typography>

            {!isError && (
              <Button
                variant="contained"
                size="large"
                sx={{
                  mt: 2,
                  borderRadius: 3,
                  px: 4,
                  py: 1.5,
                  textTransform: "none",
                  fontWeight: 600,
                  boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)",
                  "&:hover": {
                    boxShadow: "0 6px 20px rgba(37, 99, 235, 0.4)",
                    transform: "translateY(-2px)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                Choose File
              </Button>
            )}

            <Typography variant="caption" color="text.secondary" sx={{ 
              display: "block", 
              mt: 3,
              opacity: 0.7
            }}>
              Supported formats: TXT
            </Typography>
          </Box>
        </Fade>

        {/* Info Section */}
        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.8 }}>
            Team: Akshay Chavan, Vaishali Murugavel, Ishan Aggarwal
          </Typography>
        </Box>

        {/* Enhanced Background decoration */}
        <Box
          sx={{
            position: "absolute",
            top: -150,
            right: -150,
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(37, 99, 235, 0.08) 0%, rgba(37, 99, 235, 0) 70%)",
            zIndex: 0,
            animation: "float 6s ease-in-out infinite",
            "@keyframes float": {
              "0%, 100%": { transform: "translateY(0px)" },
              "50%": { transform: "translateY(-20px)" },
            }
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: -100,
            left: -100,
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(219, 39, 119, 0.08) 0%, rgba(219, 39, 119, 0) 70%)",
            zIndex: 0,
            animation: "float 8s ease-in-out infinite reverse",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            right: "10%",
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0) 70%)",
            zIndex: 0,
            animation: "float 4s ease-in-out infinite",
          }}
        />
      </Paper>
    </Box>
  )
}
