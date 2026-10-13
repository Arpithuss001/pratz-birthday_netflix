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

    // 1. If Vercel Blob token is configured, use Vercel Blob
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const blob = await put(file.name, file, { access: 'public' })
        return NextResponse.json({ success: true, url: blob.url })
      } catch (blobErr) {
        console.warn('Vercel Blob upload failed, falling back...', blobErr)
      }
    }

    // 2. If running locally on development server, save to public/uploads
    if (process.env.NODE_ENV === 'development') {
      try {
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
        const ext = file.name.split('.').pop()
        const filename = `${uniqueSuffix}.${ext}`
        
        const uploadDir = join(process.cwd(), 'public', 'uploads')
        if (!existsSync(uploadDir)) {
          await mkdir(uploadDir, { recursive: true })
        }
        const path = join(uploadDir, filename)
        await writeFile(path, buffer)

        return NextResponse.json({ success: true, url: `/uploads/${filename}` })
      } catch (localErr) {
        console.warn('Local disk write failed, falling back to cloud upload...', localErr)
      }
    }

    // 3. Cloud fallback for Vercel production (Catbox - permanent free hosting)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const blob = new Blob([buffer], { type: file.type || 'application/octet-stream' })

    const form = new FormData()
    form.append('reqtype', 'fileupload')
    form.append('fileToUpload', blob, file.name)

    const cloudRes = await fetch('https://catbox.moe/user/api.php', {
      method: 'POST',
      body: form,
    })

    if (!cloudRes.ok) {
      throw new Error(`Cloud upload server error (${cloudRes.status})`)
    }

    const uploadedUrl = (await cloudRes.text()).trim()

    if (!uploadedUrl.startsWith('http')) {
      throw new Error(`Upload failed: ${uploadedUrl}`)
    }

    return NextResponse.json({
      success: true,
      url: uploadedUrl,
    })
  } catch (error: any) {
    console.error('Error uploading file:', error)
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
