"use client"

import { useState, useRef, useEffect } from "react"
import "./ChatInterface.css"

const ChatInterface = ({ filename }) => {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = { id: Date.now(), role: "user", content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        role: "assistant",
        content: `I understand you're asking about "${input}". Based on the document "${filename}", I can help you analyze its content. This is a simulated response - in a real implementation, this would be connected to an AI service that processes your document content.`,
      }
      setMessages((prev) => [...prev, aiResponse])
      setIsLoading(false)
    }, 2000)
  }

  const handleInputChange = (e) => {
    setInput(e.target.value)
  }

  return (
    <div className="chat-interface">
      <div className="chat-header">
        <div className="chat-header-content">
          <span className="chat-icon">💬</span>
          <div className="chat-header-text">
            <h2 className="chat-title">Document Chat Assistant</h2>
            <p className="chat-subtitle">Ask questions about your document content • {filename}</p>
          </div>
          <span className="message-count">{messages.length} messages</span>
        </div>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-empty">
            <div className="chat-empty-icon">🤖</div>
            <h3 className="chat-empty-title">Ready to answer your questions!</h3>
            <p className="chat-empty-description">I can help you understand and analyze your document content</p>
            <div className="suggested-questions">
              <span className="suggestion-chip">What is this document about?</span>
              <span className="suggestion-chip">Summarize the key points</span>
              <span className="suggestion-chip">Who are the main people mentioned?</span>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div key={message.id} className={`message ${message.role}`}>
            <div className="message-avatar">{message.role === "user" ? "👤" : "🤖"}</div>
            <div className="message-content">{message.content}</div>
          </div>
        ))}

        {isLoading && (
          <div className="message assistant">
            <div className="message-avatar">🤖</div>
            <div className="message-content loading">
              <span className="typing-indicator">Thinking</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="chat-divider"></div>

      <div className="chat-input-area">
        <form onSubmit={handleSubmit} className="chat-form">
          <div className="input-container">
            <textarea
              className="chat-input"
              placeholder="Ask me anything about your document..."
              value={input}
              onChange={handleInputChange}
              disabled={isLoading}
              rows="1"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit(e)
                }
              }}
            />
            <button type="submit" className="send-button" disabled={!input.trim() || isLoading}>
              ➤
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ChatInterface
