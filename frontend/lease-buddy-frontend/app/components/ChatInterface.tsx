"use client"

import { useRef, useEffect, useState } from "react"
import { Box, Paper, TextField, IconButton, Typography, Avatar, Divider, Chip, useTheme, Fade, Zoom, Button } from "@mui/material"
import { Send, Person, SmartToy, Chat, AutoAwesome, Lightbulb, Help } from "@mui/icons-material"
import { useChat } from "ai/react"

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ChatInterfaceProps {
  filename: string;
}

const suggestedQuestions = [
  "What is this document about?",
  "Summarize the key points",
  "Who are the main people mentioned?",
  "What are the important dates?",
  "What are the financial terms?",
  "What are my obligations as a tenant?"
]

export default function ChatInterface({ filename }: ChatInterfaceProps) {
  const theme = useTheme();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    body: { filename },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSuggestionClick = (question: string) => {
    handleInputChange({ target: { value: question } } as any);
    setShowSuggestions(false);
  }

  return (
    <Paper
      elevation={3}
      sx={{
        borderRadius: 4,
        overflow: "hidden",
        background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      {/* Enhanced Header */}
      <Box
        sx={{
          p: 3,
          borderBottom: 1,
          borderColor: "divider",
          background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background decoration */}
        <Box
          sx={{
            position: "absolute",
            top: -50,
            right: -50,
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.1)",
            zIndex: 0,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: -30,
            left: -30,
            width: 60,
            height: 60,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.05)",
            zIndex: 0,
          }}
        />

        <Box sx={{ display: "flex", alignItems: "center", gap: 2, position: "relative", zIndex: 1 }}>
          <Avatar
            sx={{
              bgcolor: "rgba(255,255,255,0.2)",
              width: 48,
              height: 48,
              border: "2px solid rgba(255,255,255,0.3)",
            }}
          >
            <Chat sx={{ fontSize: 24 }} />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
              Document Chat Assistant
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, display: "flex", alignItems: "center", gap: 1 }}>
              <AutoAwesome sx={{ fontSize: 16 }} />
              Ask questions about your document • {filename}
            </Typography>
          </Box>
          <Chip
            icon={<SmartToy />}
            label={`${messages.length} messages`}
            variant="outlined"
            size="small"
            sx={{
              color: "white",
              borderColor: "rgba(255,255,255,0.3)",
              backgroundColor: "rgba(255,255,255,0.1)",
              "& .MuiChip-label": {
                px: 2,
                fontWeight: 600,
              },
              "& .MuiChip-icon": {
                color: "white",
              },
            }}
          />
        </Box>
      </Box>

      {/* Messages Area */}
      <Box
        sx={{
          height: "calc(100vh - 450px)",
          minHeight: 400,
          overflowY: "auto",
          p: 3,
          display: "flex",
          flexDirection: "column",
          gap: 3,
          backgroundColor: "#f8fafc",
          position: "relative",
        }}
      >
        {messages.length === 0 && (
          <Fade in={true} timeout={800}>
            <Box sx={{ textAlign: "center", py: 8 }}>
              <Zoom in={true} timeout={1000}>
                <SmartToy sx={{ 
                  fontSize: 80, 
                  color: "primary.main", 
                  mb: 3, 
                  opacity: 0.8,
                  filter: "drop-shadow(0 4px 8px rgba(37, 99, 235, 0.2))",
                }} />
              </Zoom>
              <Typography variant="h5" color="text.primary" gutterBottom sx={{ fontWeight: 600 }}>
                Ready to answer your questions!
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: "auto" }}>
                I can help you understand and analyze your document content. Ask me anything about the lease agreement.
              </Typography>

              {/* Suggested Questions */}
              {showSuggestions && (
                <Fade in={true} timeout={1200}>
                  <Box sx={{ maxWidth: 600, mx: "auto" }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                      <Lightbulb sx={{ fontSize: 18 }} />
                      Try asking:
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, justifyContent: "center", flexWrap: "wrap" }}>
                      {suggestedQuestions.map((question, index) => (
                        <Zoom in={true} timeout={1400 + index * 100} key={index}>
                          <Chip
                            label={question}
                            variant="outlined"
                            size="medium"
                            onClick={() => handleSuggestionClick(question)}
                            sx={{
                              px: 2,
                              cursor: "pointer",
                              transition: "all 0.2s ease",
                              "&:hover": {
                                backgroundColor: "primary.lighter",
                                borderColor: "primary.main",
                                transform: "translateY(-2px)",
                              },
                            }}
                          />
                        </Zoom>
                      ))}
                    </Box>
                  </Box>
                </Fade>
              )}
            </Box>
          </Fade>
        )}

        {messages.map((message, index) => (
          <Fade in={true} timeout={400} key={message.id}>
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: 2,
                flexDirection: message.role === "user" ? "row-reverse" : "row",
                maxWidth: "85%",
                alignSelf: message.role === "user" ? "flex-end" : "flex-start",
              }}
            >
              <Avatar
                sx={{
                  bgcolor: message.role === "user" ? "primary.main" : "secondary.main",
                  width: 44,
                  height: 44,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  border: "2px solid white",
                }}
              >
                {message.role === "user" ? <Person /> : <SmartToy />}
              </Avatar>

              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  bgcolor: message.role === "user" ? "primary.main" : "white",
                  color: message.role === "user" ? "white" : "text.primary",
                  borderRadius: 3,
                  position: "relative",
                  maxWidth: "100%",
                  boxShadow: message.role === "user" 
                    ? "0 4px 12px rgba(37, 99, 235, 0.3)" 
                    : "0 2px 8px rgba(0,0,0,0.1)",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 16,
                    [message.role === "user" ? "right" : "left"]: -10,
                    width: 0,
                    height: 0,
                    borderTop: "10px solid transparent",
                    borderBottom: "10px solid transparent",
                    [message.role === "user" ? "borderLeft" : "borderRight"]:
                      `10px solid ${message.role === "user" ? theme.palette.primary.main : "#fff"}`,
                  },
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    whiteSpace: "pre-wrap",
                    lineHeight: 1.7,
                    letterSpacing: 0.2,
                    fontWeight: message.role === "user" ? 500 : 400,
                  }}
                >
                  {message.content}
                </Typography>
              </Paper>
            </Box>
          </Fade>
        ))}

        {isLoading && (
          <Fade in={true} timeout={300}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar sx={{ 
                bgcolor: "secondary.main", 
                width: 44, 
                height: 44,
                boxShadow: "0 4px 12px rgba(219, 39, 119, 0.3)",
              }}>
                <SmartToy />
              </Avatar>
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  bgcolor: "white",
                  borderRadius: 3,
                  minWidth: 120,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
              >
                <Typography variant="body1" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
          </Fade>
        )}

        <div ref={messagesEndRef} />
      </Box>

      <Divider />

      {/* Enhanced Input Area */}
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
                  backgroundColor: "#f8fafc",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    backgroundColor: "#f1f5f9",
                    transform: "translateY(-1px)",
                  },
                  "&.Mui-focused": {
                    backgroundColor: "#ffffff",
                    boxShadow: "0 4px 12px rgba(37, 99, 235, 0.15)",
                  },
                },
                "& .MuiOutlinedInput-input": {
                  fontSize: "1rem",
                  fontWeight: 500,
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
                width: 52,
                height: 52,
                borderRadius: 3,
                boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)",
                "&:hover": {
                  bgcolor: "primary.dark",
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 20px rgba(37, 99, 235, 0.4)",
                },
                "&:disabled": {
                  bgcolor: "grey.300",
                  transform: "none",
                  boxShadow: "none",
                },
                transition: "all 0.3s ease",
              }}
            >
              <Send />
            </IconButton>
          </Box>
        </form>
      </Box>

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes dots {
            0%, 20% { content: '.'; }
            40% { content: '..'; }
            60% { content: '...'; }
            90%, 100% { content: ''; }
          }
        `
      }} />
    </Paper>
  )
}
