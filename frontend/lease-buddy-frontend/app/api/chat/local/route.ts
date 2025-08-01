import { readFile } from "fs/promises"
import { join } from "path"

// FastAPI backend URL
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000"

export const maxDuration = 60 // Longer timeout for local LLM

export async function POST(req: Request) {
  try {
    const { messages, filename, documentContent } = await req.json()

    // Get the last user message
    const lastUserMessage = messages
      .filter((msg: any) => msg.role === "user")
      .pop()?.content || ""

    let documentContext = documentContent || ""
    if (!documentContext && filename) {
      try {
        const filepath = join(process.cwd(), "uploads", filename)
        const fileContent = await readFile(filepath, "utf-8")
        documentContext = fileContent
      } catch (error) {
        console.error("Error reading document:", error)
      }
    }

    // Call FastAPI backend for local LLM chat
    const chatResponse = await fetch(`${BACKEND_URL}/chat/local`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: lastUserMessage,
        document_content: documentContext,
      }),
    })

    if (!chatResponse.ok) {
      throw new Error(`Local chat request failed: ${chatResponse.statusText}`)
    }

    const chatData = await chatResponse.json()
    
    // Create a streaming response to match the expected format
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      start(controller) {
        // Send the response as a single chunk
        const response = {
          id: Date.now().toString(),
          role: "assistant",
          content: chatData.response,
        }
        
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(response)}\n\n`))
        controller.enqueue(encoder.encode("data: [DONE]\n\n"))
        controller.close()
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    })
  } catch (error) {
    console.error("Local chat API error:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
} 