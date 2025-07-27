import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"
import { readFile } from "fs/promises"
import { join } from "path"

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { messages, filename } = await req.json()

    let documentContext = ""
    if (filename) {
      try {
        const filepath = join(process.cwd(), "uploads", filename)
        const fileContent = await readFile(filepath, "utf-8")
        documentContext = `Document content: ${fileContent}`
      } catch (error) {
        console.error("Error reading document:", error)
      }
    }

    const systemPrompt = `You are a helpful assistant that answers questions about uploaded documents. 
    ${documentContext ? `Here is the document content to reference: ${documentContext}` : "No document has been uploaded yet."}
    
    Please provide accurate answers based on the document content. If the question cannot be answered from the document, let the user know.`

    const result = streamText({
      model: openai("gpt-4o"),
      system: systemPrompt,
      messages,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Chat API error:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}
