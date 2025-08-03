"use client"

import { Box, Typography, Paper, LinearProgress, Button, Chip, Fade, Zoom } from "@mui/material"
import { RestartAlt, AutoAwesome, Psychology, Storage } from "@mui/icons-material"

interface ProcessingLoaderProps {
  currentStep: string
  onReset: () => void
}

export default function ProcessingLoader({ currentStep, onReset }: ProcessingLoaderProps) {
  const steps = [
    { icon: Storage, label: "Uploading document", color: "primary" },
    { icon: Psychology, label: "Analyzing content", color: "info" },
    { icon: AutoAwesome, label: "Extracting entities", color: "success" },
    { icon: AutoAwesome, label: "Finalizing results", color: "warning" },
  ]

  const currentStepIndex = steps.findIndex(step => 
    currentStep.toLowerCase().includes(step.label.toLowerCase())
  )

  return (
    <Box sx={{ maxWidth: 700, mx: "auto", textAlign: "center" }}>
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
        <Box sx={{ position: "relative", zIndex: 1 }}>
          {/* Header */}
          <Fade in={true} timeout={600}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" sx={{ 
                fontWeight: 700, 
                mb: 2,
                background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
                Processing Your Document
              </Typography>
              
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Our model is analyzing your lease document and extracting key information
              </Typography>

              {/* Status Chip */}
              <Chip
                icon={<AutoAwesome />}
                label="AI Processing"
                color="primary"
                variant="filled"
                sx={{
                  px: 2,
                  py: 1,
                  fontWeight: 600,
                  "& .MuiChip-icon": {
                    fontSize: 20,
                  },
                }}
              />
            </Box>
          </Fade>

          {/* Progress Steps */}
          <Fade in={true} timeout={800}>
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
                {steps.map((step, index) => {
                  const isActive = index === currentStepIndex
                  const isCompleted = index < currentStepIndex
                  const IconComponent = step.icon
                  
                  return (
                    <Zoom in={true} timeout={600 + index * 200} key={index}>
                      <Box sx={{ 
                        display: "flex", 
                        flexDirection: "column", 
                        alignItems: "center",
                        flex: 1,
                        position: "relative",
                      }}>
                        <Box
                          sx={{
                            width: 50,
                            height: 50,
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            mb: 1,
                            backgroundColor: isCompleted 
                              ? "success.main" 
                              : isActive 
                              ? `${step.color}.main` 
                              : "grey.300",
                            color: isCompleted || isActive ? "white" : "grey.500",
                            transition: "all 0.3s ease",
                            transform: isActive ? "scale(1.1)" : "scale(1)",
                            boxShadow: isActive 
                              ? `0 4px 12px rgba(37, 99, 235, 0.3)` 
                              : "none",
                          }}
                        >
                          <IconComponent sx={{ fontSize: 24 }} />
                        </Box>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            fontWeight: isActive ? 600 : 400,
                            color: isActive ? "primary.main" : "text.secondary",
                            textAlign: "center",
                            maxWidth: 80,
                          }}
                        >
                          {step.label}
                        </Typography>
                      </Box>
                    </Zoom>
                  )
                })}
              </Box>

              {/* Progress Bar */}
              <Box sx={{ px: 4, mb: 3 }}>
                <LinearProgress
                  variant="determinate"
                  value={((currentStepIndex + 1) / steps.length) * 100}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: "rgba(37, 99, 235, 0.1)",
                    "& .MuiLinearProgress-bar": {
                      bgcolor: "primary.main",
                      backgroundImage: "linear-gradient(45deg, rgba(255,255,255,0.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 75%, transparent 75%, transparent)",
                      backgroundSize: "1rem 1rem",
                      animation: "progress-stripes 1s linear infinite",
                      "@keyframes progress-stripes": {
                        "0%": {
                          backgroundPosition: "1rem 0"
                        },
                        "100%": {
                          backgroundPosition: "0 0"
                        }
                      }
                    },
                  }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                  {Math.round(((currentStepIndex + 1) / steps.length) * 100)}% Complete
                </Typography>
              </Box>
            </Box>
          </Fade>

          {/* Current Step Display */}
          <Fade in={true} timeout={1000}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                {currentStep || "Initializing..."}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Please wait while we process your document
              </Typography>
            </Box>
          </Fade>

          {/* Cancel Button */}
          <Fade in={true} timeout={1200}>
            <Button
              startIcon={<RestartAlt />}
              onClick={onReset}
              variant="outlined"
              size="large"
              sx={{
                borderRadius: 3,
                textTransform: "none",
                px: 4,
                py: 1.5,
                fontWeight: 600,
                borderColor: "error.main",
                color: "error.main",
                "&:hover": {
                  borderColor: "error.dark",
                  backgroundColor: "error.lighter",
                },
              }}
            >
              Cancel Processing
            </Button>
          </Fade>
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
            background: "radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, rgba(16, 185, 129, 0) 70%)",
            zIndex: 0,
            animation: "float 8s ease-in-out infinite reverse",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            top: "30%",
            right: "10%",
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(219, 39, 119, 0.1) 0%, rgba(219, 39, 119, 0) 70%)",
            zIndex: 0,
            animation: "float 4s ease-in-out infinite",
          }}
        />
      </Paper>
    </Box>
  )
}
