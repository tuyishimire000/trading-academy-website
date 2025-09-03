import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyJwt } from '@/lib/auth/jwt'
import { TradingJournalTrade, Screenshot } from '@/lib/sequelize/models'
import { saveFile, deleteFile, validateFile } from '@/lib/utils/file-upload'

// POST /api/trading-journal/trades/[id]/screenshots - Add screenshots to a trade
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const payload = verifyJwt<{ sub: string; email: string; is_admin?: boolean }>(token)
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const tradeId = parseInt(params.id)
    const formData = await request.formData()
    const files = formData.getAll('screenshots') as File[]
    const type = (formData.get('type') as 'entry' | 'exit') || 'entry'

    // Find the trade and ensure it belongs to the user
    const trade = await TradingJournalTrade.findOne({
      where: { id: tradeId, user_id: payload.sub }
    })

    if (!trade) {
      return NextResponse.json({ error: 'Trade not found' }, { status: 404 })
    }

    // Handle new screenshots
    const savedScreenshots = []
    for (const file of files) {
      if (file instanceof File) {
        // Validate file
        const validation = validateFile(file)
        if (!validation.valid) {
          continue // Skip invalid files
        }
        
        try {
          // Save file
          const savedFile = await saveFile(file, payload.sub, trade.trade_id, type)
          
          // Save to database
          const screenshot = await Screenshot.create({
            trade_id: tradeId,
            user_id: payload.sub,
            filename: savedFile.filename,
            original_name: savedFile.originalName,
            file_path: savedFile.filePath,
            file_url: savedFile.fileUrl,
            file_size: savedFile.fileSize,
            mime_type: savedFile.mimeType,
            screenshot_type: type
          })
          
          savedScreenshots.push(screenshot)
        } catch (error) {
          console.error('Error saving screenshot:', error)
          continue
        }
      }
    }

    return NextResponse.json({
      message: 'Screenshots added successfully',
      screenshots: savedScreenshots
    })

  } catch (error) {
    console.error('Error adding screenshots:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/trading-journal/trades/[id]/screenshots - Get screenshots for a trade
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const payload = verifyJwt<{ sub: string; email: string; is_admin?: boolean }>(token)
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const tradeId = parseInt(params.id)

    // Find the trade and ensure it belongs to the user
    const trade = await TradingJournalTrade.findOne({
      where: { id: tradeId, user_id: payload.sub }
    })

    if (!trade) {
      return NextResponse.json({ error: 'Trade not found' }, { status: 404 })
    }

    // Get screenshots for this trade
    const screenshots = await Screenshot.findAll({
      where: { trade_id: tradeId },
      order: [['created_at', 'ASC']]
    })

    return NextResponse.json({ screenshots })

  } catch (error) {
    console.error('Error fetching screenshots:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/trading-journal/trades/[id]/screenshots - Remove a screenshot from a trade
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const payload = verifyJwt<{ sub: string; email: string; is_admin?: boolean }>(token)
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const tradeId = parseInt(params.id)
    const { searchParams } = new URL(request.url)
    const screenshotId = parseInt(searchParams.get('id') || '0')

    if (!screenshotId) {
      return NextResponse.json({ error: 'Screenshot ID is required' }, { status: 400 })
    }

    // Find the screenshot and ensure it belongs to the user
    const screenshot = await Screenshot.findOne({
      where: { id: screenshotId, user_id: payload.sub },
      include: [{
        model: TradingJournalTrade,
        as: 'trade',
        where: { id: tradeId }
      }]
    })

    if (!screenshot) {
      return NextResponse.json({ error: 'Screenshot not found' }, { status: 404 })
    }

    // Delete file from filesystem
    try {
      await deleteFile(screenshot.file_path)
    } catch (error) {
      console.error('Error deleting file:', error)
    }

    // Delete from database
    await screenshot.destroy()

    return NextResponse.json({
      message: 'Screenshot removed successfully'
    })

  } catch (error) {
    console.error('Error removing screenshot:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
