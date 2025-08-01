"use client"

import { useRef, useEffect, useState } from "react"
import { Box, Paper, TextField, IconButton, Typography, Avatar, Divider, Chip, useTheme, Fade, Zoom, Button, Switch, FormControlLabel } from "@mui/material"
import { Send, Person, SmartToy, Chat, AutoAwesome, Lightbulb, Help, Cloud, Computer } from "@mui/icons-material"
import ReactMarkdown from "react-markdown"

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ChatInterfaceProps {
  filename: string;
  documentContent?: string;
}

const suggestedQuestions = [
  "What is this document about?",
  "Summarize the key points",
  "Who are the main people mentioned?",
  "What are the important dates?",
  "What are the financial terms?",
  "What are my obligations as a tenant?"
]

export default function ChatInterface({ filename, documentContent }: ChatInterfaceProps) {
  const theme = useTheme();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [useLocalLLM, setUseLocalLLM] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const apiEndpoint = useLocalLLM ? "/api/chat/local" : "/api/chat";
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          filename,
          documentContent,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body");
      }

      let assistantMessage = "";
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") {
              break;
            }
            try {
              const parsed = JSON.parse(data);
              if (parsed.role === "assistant") {
                assistantMessage = parsed.content;
              }
            } catch (e) {
              // Ignore parsing errors
            }
          }
        }
      }

      if (assistantMessage) {
        const assistantMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: assistantMessage,
        };
        setMessages(prev => [...prev, assistantMsg]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSuggestionClick = (question: string) => {
    setInput(question);
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
          
          {/* LLM Toggle */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={useLocalLLM}
                  onChange={(e) => setUseLocalLLM(e.target.checked)}
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": {
                      color: "white",
                      "&:hover": {
                        backgroundColor: "rgba(255,255,255,0.1)",
                      },
                    },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                      backgroundColor: "rgba(255,255,255,0.3)",
                    },
                  }}
                />
              }
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "white" }}>
                  {useLocalLLM ? <Computer sx={{ fontSize: 16 }} /> : <Cloud sx={{ fontSize: 16 }} />}
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    {useLocalLLM ? "Local" : "Cloud"}
                  </Typography>
                </Box>
              }
              sx={{ margin: 0 }}
            />
          </Box>
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
                {useLocalLLM && (
                  <Box sx={{ mt: 1, display: "flex", alignItems: "center", gap: 1, justifyContent: "center" }}>
                    <Computer sx={{ fontSize: 16, color: "primary.main" }} />
                    <Typography variant="caption" color="primary.main" sx={{ fontWeight: 600 }}>
                      Using Local LLM (Phi-3 Mini)
                    </Typography>
                  </Box>
                )}
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
                {message.role === "assistant" ? (
                  <Box
                    sx={{
                      "& h1, & h2, & h3, & h4, & h5, & h6": {
                        fontWeight: 600,
                        marginTop: 2,
                        marginBottom: 1,
                        color: "text.primary",
                      },
                      "& h1": { fontSize: "1.5rem" },
                      "& h2": { fontSize: "1.3rem" },
                      "& h3": { fontSize: "1.1rem" },
                      "& p": {
                        marginBottom: 1,
                        lineHeight: 1.7,
                      },
                      "& ul, & ol": {
                        marginBottom: 1,
                        paddingLeft: 2,
                      },
                      "& li": {
                        marginBottom: 0.5,
                        lineHeight: 1.6,
                      },
                      "& strong, & b": {
                        fontWeight: 600,
                        color: "text.primary",
                      },
                      "& em, & i": {
                        fontStyle: "italic",
                      },
                      "& code": {
                        backgroundColor: "#f1f5f9",
                        padding: "2px 4px",
                        borderRadius: "4px",
                        fontSize: "0.9em",
                        fontFamily: "monospace",
                      },
                      "& pre": {
                        backgroundColor: "#f8fafc",
                        padding: 2,
                        borderRadius: 1,
                        overflow: "auto",
                        marginBottom: 1,
                      },
                      "& blockquote": {
                        borderLeft: "4px solid",
                        borderColor: "primary.main",
                        paddingLeft: 2,
                        marginLeft: 0,
                        fontStyle: "italic",
                        color: "text.secondary",
                      },
                    }}
                  >
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </Box>
                ) : (
                  <Typography
                    variant="body1"
                    sx={{
                      whiteSpace: "pre-wrap",
                      lineHeight: 1.7,
                      letterSpacing: 0.2,
                      fontWeight: 500,
                    }}
                  >
                    {message.content}
                  </Typography>
                )}
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
