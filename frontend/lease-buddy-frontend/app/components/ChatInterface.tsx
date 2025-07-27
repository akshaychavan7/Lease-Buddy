"use client"

import { useRef, useEffect } from "react"
import { Box, Paper, TextField, IconButton, Typography, Avatar, Divider, Chip } from "@mui/material"
import { Send, Person, SmartToy, Chat } from "@mui/icons-material"
import { useChat } from "ai/react"

interface ChatInterfaceProps {
  filename: string
}

export default function ChatInterface({ filename }: ChatInterfaceProps) {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    body: { filename },
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <Paper elevation={3} sx={{ borderRadius: 2, overflow: "hidden" }}>
      {/* Header */}
      <Box
        sx={{
          p: 3,
          borderBottom: 1,
          borderColor: "divider",
          background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
          color: "white",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Chat sx={{ fontSize: 28 }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Document Chat Assistant
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Ask questions about your document content • {filename}
            </Typography>
          </Box>
          <Chip
            label={`${messages.length} messages`}
            variant="outlined"
            size="small"
            sx={{
              ml: "auto",
              color: "white",
              borderColor: "rgba(255,255,255,0.3)",
              backgroundColor: "rgba(255,255,255,0.1)",
            }}
          />
        </Box>
      </Box>

      {/* Messages Area */}
      <Box
        sx={{
          height: 500,
          overflowY: "auto",
          p: 3,
          display: "flex",
          flexDirection: "column",
          gap: 3,
          backgroundColor: "#fafafa",
        }}
      >
        {messages.length === 0 && (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <SmartToy sx={{ fontSize: 64, color: "primary.main", mb: 3, opacity: 0.7 }} />
            <Typography variant="h6" color="text.primary" gutterBottom>
              Ready to answer your questions!
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              I can help you understand and analyze your document content
            </Typography>
            <Box sx={{ display: "flex", gap: 1, justifyContent: "center", flexWrap: "wrap" }}>
              <Chip label="What is this document about?" variant="outlined" size="small" />
              <Chip label="Summarize the key points" variant="outlined" size="small" />
              <Chip label="Who are the main people mentioned?" variant="outlined" size="small" />
            </Box>
          </Box>
        )}

        {messages.map((message) => (
          <Box
            key={message.id}
            sx={{
              display: "flex",
              alignItems: "flex-start",
              gap: 2,
              flexDirection: message.role === "user" ? "row-reverse" : "row",
            }}
          >
            <Avatar
              sx={{
                bgcolor: message.role === "user" ? "primary.main" : "secondary.main",
                width: 40,
                height: 40,
                boxShadow: 2,
              }}
            >
              {message.role === "user" ? <Person /> : <SmartToy />}
            </Avatar>

            <Paper
              elevation={2}
              sx={{
                p: 3,
                maxWidth: "80%",
                bgcolor: message.role === "user" ? "primary.main" : "white",
                color: message.role === "user" ? "white" : "text.primary",
                borderRadius: 3,
                position: "relative",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 12,
                  [message.role === "user" ? "right" : "left"]: -8,
                  width: 0,
                  height: 0,
                  borderTop: "8px solid transparent",
                  borderBottom: "8px solid transparent",
                  [message.role === "user" ? "borderLeft" : "borderRight"]:
                    `8px solid ${message.role === "user" ? "#1976d2" : "white"}`,
                },
              }}
            >
              <Typography variant="body1" sx={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
                {message.content}
              </Typography>
            </Paper>
          </Box>
        ))}

        {isLoading && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar sx={{ bgcolor: "secondary.main", width: 40, height: 40 }}>
              <SmartToy />
            </Avatar>
            <Paper elevation={2} sx={{ p: 3, bgcolor: "white", borderRadius: 3 }}>
              <Typography variant="body1" color="text.secondary">
                <Box
                  component="span"
                  sx={{
                    "&::after": {
                      content: '"..."',
                      animation: "dots 1.5s steps(5, end) infinite",
                    },
                  }}
                >
                  Thinking
                </Box>
              </Typography>
            </Paper>
          </Box>
        )}

        <div ref={messagesEndRef} />
      </Box>

      <Divider />

      {/* Input Area */}
      <Box sx={{ p: 3, backgroundColor: "white" }}>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: "flex", gap: 2, alignItems: "flex-end" }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Ask me anything about your document..."
              value={input}
              onChange={handleInputChange}
              disabled={isLoading}
              multiline
              maxRows={4}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                  backgroundColor: "#f8f9fa",
                },
              }}
            />
            <IconButton
              type="submit"
              color="primary"
              disabled={!input.trim() || isLoading}
              sx={{
                bgcolor: "primary.main",
                color: "white",
                width: 48,
                height: 48,
                "&:hover": {
                  bgcolor: "primary.dark",
                },
                "&:disabled": {
                  bgcolor: "grey.300",
                },
              }}
            >
              <Send />
            </IconButton>
          </Box>
        </form>
      </Box>

      <style jsx>{`
        @keyframes dots {
          0%, 20% { content: '.'; }
          40% { content: '..'; }
          60% { content: '...'; }
          90%, 100% { content: ''; }
        }
      `}</style>
    </Paper>
  )
}
