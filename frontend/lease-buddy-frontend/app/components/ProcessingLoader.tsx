"use client"

import { Box, Typography, Paper, LinearProgress, Button } from "@mui/material"
import { RestartAlt } from "@mui/icons-material"

interface ProcessingLoaderProps {
  currentStep: string
  onReset: () => void
}

export default function ProcessingLoader({ currentStep, onReset }: ProcessingLoaderProps) {
  return (
    <Box sx={{ maxWidth: 600, mx: "auto", textAlign: "center" }}>
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
        <Box sx={{ position: "relative", zIndex: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
            Processing Document
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            {currentStep || "Initializing..."}
          </Typography>

          <Box sx={{ px: 4 }}>
            <LinearProgress
              sx={{
                height: 6,
                borderRadius: 3,
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
          </Box>

          <Button
            startIcon={<RestartAlt />}
            onClick={onReset}
            variant="outlined"
            size="small"
            sx={{
              mt: 4,
              borderRadius: 2,
              textTransform: "none",
              px: 2,
            }}
          >
            Cancel Processing
          </Button>
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
