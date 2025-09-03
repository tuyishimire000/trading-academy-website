import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Create test upload directory
    const uploadDir = join(process.cwd(), 'public', 'test-uploads')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Save test file
    const filename = `test_${Date.now()}_${file.name}`
    const filePath = join(uploadDir, filename)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    const url = `/test-uploads/${filename}`
    
    console.log('Test file saved:', {
      filePath,
      url,
      fullUrl: `http://localhost:3000${url}`
    })

    return NextResponse.json({
      message: 'Test file uploaded successfully',
      filename,
      url,
      fullUrl: `http://localhost:3000${url}`
    })

  } catch (error) {
    console.error('Error in test upload:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
