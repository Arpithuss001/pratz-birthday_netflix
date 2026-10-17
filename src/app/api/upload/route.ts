import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 })
    }

    const isImage = file.type?.startsWith('image/') || /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(file.name)

    // 1. If Vercel Blob is configured (BLOB_READ_WRITE_TOKEN in Vercel project), use Vercel Blob
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const blob = await put(file.name, file, { access: 'public' })
        if (blob?.url) {
          return NextResponse.json({ success: true, url: blob.url })
        }
      } catch (blobErr: any) {
        console.warn('Vercel Blob upload failed, attempting fallback...', blobErr?.message)
      }
    }

    // 2. If running locally on localhost dev server, write to public/uploads
    if (process.env.NODE_ENV === 'development') {
      try {
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
        const ext = file.name.split('.').pop() || (isImage ? 'jpg' : 'mp4')
        const filename = `${uniqueSuffix}.${ext}`

        const uploadDir = join(process.cwd(), 'public', 'uploads')
        if (!existsSync(uploadDir)) {
          await mkdir(uploadDir, { recursive: true })
        }
        const path = join(uploadDir, filename)
        await writeFile(path, buffer)

        return NextResponse.json({ success: true, url: `/uploads/${filename}` })
      } catch (localErr: any) {
        console.warn('Local disk write failed, attempting fallback...', localErr?.message)
      }
    }

    // 3. For ALL IMAGES (thumbnails, avatars): Convert to permanent Base64 Data URI!
    // 100% reliable, zero external dependencies, never gives 400 Bad Request, never expires
    if (isImage) {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const mime = file.type || 'image/jpeg'
      const base64Url = `data:${mime};base64,${buffer.toString('base64')}`
      return NextResponse.json({ success: true, url: base64Url })
    }

    // 4. For Videos under 4MB: Base64 data URI fallback
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    if (buffer.length <= 4 * 1024 * 1024) {
      const mime = file.type || 'video/mp4'
      const base64Url = `data:${mime};base64,${buffer.toString('base64')}`
      return NextResponse.json({ success: true, url: base64Url })
    }

    return NextResponse.json({
      success: false,
      error: 'Video exceeds 4.5MB limit. Please paste a video URL (YouTube, Google Drive, or CDN link).'
    }, { status: 400 })

  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
