import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

export interface UploadedFile {
  filename: string
  originalName: string
  filePath: string
  fileUrl: string
  fileSize: number
  mimeType: string
}

export interface FileValidation {
  valid: boolean
  error?: string
}

/**
 * Validate uploaded file
 */
export function validateFile(file: File): FileValidation {
  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 10MB' }
  }

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Only image files are allowed (JPEG, PNG, GIF, WebP)' }
  }

  return { valid: true }
}

/**
 * Save uploaded file to disk
 */
export async function saveFile(
  file: File, 
  userId: string, 
  tradeId: string, 
  screenshotType: 'entry' | 'exit'
): Promise<UploadedFile> {
  try {
    // Create upload directory structure
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'screenshots', userId, tradeId, screenshotType)
    
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomSuffix = Math.random().toString(36).substring(2, 6)
    const extension = path.extname(file.name)
    const filename = `screenshot_${timestamp}_${randomSuffix}${extension}`
    
    // Full file path
    const filePath = path.join(uploadDir, filename)
    
    // Convert file to buffer and save
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)
    
    // Generate public URL
    const fileUrl = `/uploads/screenshots/${userId}/${tradeId}/${screenshotType}/${filename}`
    
    return {
      filename,
      originalName: file.name,
      filePath,
      fileUrl,
      fileSize: file.size,
      mimeType: file.type
    }
  } catch (error) {
    console.error('Error saving file:', error)
    throw new Error('Failed to save file')
  }
}

/**
 * Delete file from disk
 */
export async function deleteFile(filePath: string): Promise<void> {
  try {
    const { unlink } = await import('fs/promises')
    await unlink(filePath)
  } catch (error) {
    console.error('Error deleting file:', error)
    // Don't throw error if file doesn't exist
  }
}
