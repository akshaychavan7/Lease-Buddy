import { type NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData()
    const file: File | null = data.get("file") as unknown as File

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

    // Simulate document processing and NER extraction
    const documentContent = buffer.toString("utf-8")

    // Simple NER simulation - in a real app, you'd use a proper NER model
    const entities = extractNamedEntities(documentContent)

    return NextResponse.json({
      success: true,
      filename,
      entities,
      content: documentContent.substring(0, 1000) + "...", // Preview
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ success: false, message: "Upload failed" })
  }
}

function extractNamedEntities(text: string) {
  // Simple regex-based NER simulation
  const entities = {
    PERSON: [],
    ORGANIZATION: [],
    LOCATION: [],
    DATE: [],
    EMAIL: [],
    PHONE: [],
  }

  // Extract emails
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g
  entities.EMAIL = [...new Set(text.match(emailRegex) || [])]

  // Extract phone numbers
  const phoneRegex = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g
  entities.PHONE = [...new Set(text.match(phoneRegex) || [])]

  // Extract dates
  const dateRegex = /\b\d{1,2}\/\d{1,2}\/\d{4}\b|\b\d{4}-\d{2}-\d{2}\b/g
  entities.DATE = [...new Set(text.match(dateRegex) || [])]

  // Extract potential names (capitalized words)
  const nameRegex = /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g
  entities.PERSON = [...new Set(text.match(nameRegex) || [])].slice(0, 10)

  // Extract potential organizations (words with Inc, Corp, LLC, etc.)
  const orgRegex = /\b[A-Z][a-zA-Z\s]+(Inc|Corp|LLC|Ltd|Company|Corporation)\b/g
  entities.ORGANIZATION = [...new Set(text.match(orgRegex) || [])]

  // Extract potential locations (capitalized words followed by state abbreviations or common location words)
  const locationRegex = /\b[A-Z][a-zA-Z\s]+(Street|St|Avenue|Ave|Road|Rd|City|State|County)\b/g
  entities.LOCATION = [...new Set(text.match(locationRegex) || [])]

  return entities
}
