import { type NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

// FastAPI backend URL
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000"

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData()
    const file: File | null = data.get("file") as unknown as File
    const model: string = (data.get("model") as string) || "spacy" // Default to spaCy model

    if (!file) {
      return NextResponse.json({ success: false, message: "No file uploaded" })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "uploads")
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Save file
    const filename = `${Date.now()}-${file.name}`
    const filepath = join(uploadsDir, filename)
    await writeFile(filepath, buffer)

    // Extract text content from the file
    let documentContent = ""
    
    if (file.type === "text/plain") {
      documentContent = buffer.toString("utf-8")
    } else if (file.type === "application/pdf") {
      // For PDF files, you might need a PDF parser library
      // For now, we'll use a simple text extraction
      documentContent = buffer.toString("utf-8")
    } else {
      // For other file types, try to extract text
      documentContent = buffer.toString("utf-8")
    }

    // Call FastAPI backend for NER extraction with model parameter
    const nerResponse = await fetch(`${BACKEND_URL}/extract-entities`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: documentContent,
        model: model,
      }),
    })

    if (!nerResponse.ok) {
      throw new Error(`NER extraction failed: ${nerResponse.statusText}`)
    }

    const nerData = await nerResponse.json()
    
    // Transform the entities to match the expected format
    const entities = transformEntities(nerData.entities)

    return NextResponse.json({
      success: true,
      filename,
      entities,
      content: documentContent.substring(0, 1000) + "...", // Preview
      fullContent: documentContent, // Full content for chat
      model: model, // Return the model used
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ 
      success: false, 
      message: error instanceof Error ? error.message : "Upload failed" 
    })
  }
}

function transformEntities(entities: any[]) {
  // Transform the FastAPI response entities to match the expected frontend format
  const transformed: Record<string, string[]> = {
    LESSOR_NAME: [],
    LESSEE_NAME: [],
    PROPERTY_ADDRESS: [],
    LEASE_START_DATE: [],
    LEASE_END_DATE: [],
    RENT_AMOUNT: [],
    SECURITY_DEPOSIT_AMOUNT: [],
    // Add other entity types as needed
  }

  entities.forEach((entity) => {
    const label = entity.label
    const text = entity.text

    if (transformed[label]) {
      if (!transformed[label].includes(text)) {
        transformed[label].push(text)
      }
    } else {
      // If the entity type is not in our predefined list, create a new category
      if (!transformed[label]) {
        transformed[label] = []
      }
      if (!transformed[label].includes(text)) {
        transformed[label].push(text)
      }
    }
  })

  return transformed
}
