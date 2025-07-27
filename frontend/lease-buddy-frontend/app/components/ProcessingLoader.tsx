"use client"

import { Box, Typography, CircularProgress, Paper, Button, LinearProgress } from "@mui/material"
import { Refresh } from "@mui/icons-material"
import { useState, useEffect } from "react"

interface ProcessingLoaderProps {
  currentStep: string
  onReset: () => void
}

const processingSteps = [
  "Uploading document...",
  "Extracting text content...",
  "Running NER analysis...",
  "Identifying named entities...",
  "Finalizing results...",
  "Processing complete!",
]

export default function ProcessingLoader({ currentStep, onReset }: ProcessingLoaderProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const stepIndex = processingSteps.indexOf(currentStep)
    if (stepIndex !== -1) {
      setProgress((stepIndex / (processingSteps.length - 1)) * 100)
    }
  }, [currentStep])

  return (
    <Box sx={{ textAlign: "center", py: 6 }}>
      <Paper elevation={2} sx={{ p: 6, maxWidth: 600, mx: "auto" }}>
        <CircularProgress size={80} sx={{ mb: 4, color: "primary.main" }} />

        <Typography variant="h5" gutterBottom>
          Processing Your Document
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Please wait while we analyze your document and extract named entities...
        </Typography>

        <Box sx={{ mb: 4 }}>
          <Typography variant="body2" color="primary.main" sx={{ mb: 2, fontWeight: 500 }}>
            {currentStep}
          </Typography>
          <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 3 }}>
          This may take a few moments depending on document size
        </Typography>

        <Button variant="outlined" startIcon={<Refresh />} onClick={onReset} size="small">
          Cancel & Upload New Document
        </Button>
      </Paper>
    </Box>
  )
}
