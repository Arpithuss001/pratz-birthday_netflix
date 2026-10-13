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

    // 1. If Vercel Blob is configured (BLOB_READ_WRITE_TOKEN in Vercel project), use Vercel Blob
    // This is the official storage solution for Vercel production (supports videos up to 500MB)
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
        const ext = file.name.split('.').pop() || 'dat'
        const filename = `${uniqueSuffix}.${ext}`

        const uploadDir = join(process.cwd(), 'public', 'uploads')
        if (!existsSync(uploadDir)) {
          await mkdir(uploadDir, { recursive: true })
        }
        const path = join(uploadDir, filename)
        await writeFile(path, buffer)

        return NextResponse.json({ success: true, url: `/uploads/${filename}` })
      } catch (localErr: any) {
        console.warn('Local disk write failed, attempting cloud fallback...', localErr?.message)
      }
    }

    // 3. Cloud Fallback for Images (freeimage.host - permanent, zero-config free image CDN)
    const isImage = file.type?.startsWith('image/') || /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(file.name)
    if (isImage) {
      try {
        const bytes = await file.arrayBuffer()
        const imageBlob = new Blob([bytes], { type: file.type || 'image/png' })
        const imageForm = new FormData()
        imageForm.append('key', '6d207e02198a847aa98d0a2a901485a5')
        imageForm.append('action', 'upload')
        imageForm.append('source', imageBlob, file.name)
        imageForm.append('format', 'json')

        const imgRes = await fetch('https://freeimage.host/api/1/upload', {
          method: 'POST',
          body: imageForm
        })

        if (imgRes.ok) {
          const imgData = await imgRes.json()
          if (imgData?.image?.url) {
            return NextResponse.json({ success: true, url: imgData.image.url })
          }
        }
      } catch (imgErr: any) {
        console.warn('freeimage.host fallback failed...', imgErr?.message)
      }
    }

    // 4. Cloud Fallback for Videos (tmpfiles.org - direct streaming link)
    try {
      const bytes = await file.arrayBuffer()
      const vidBlob = new Blob([bytes], { type: file.type || 'video/mp4' })
      const vidForm = new FormData()
      vidForm.append('file', vidBlob, file.name)

      const vidRes = await fetch('https://tmpfiles.org/api/v1/upload', {
        method: 'POST',
        body: vidForm
      })

      if (vidRes.ok) {
        const vidData = await vidRes.json()
        if (vidData?.status === 'success' && vidData?.data?.url) {
          // Convert https://tmpfiles.org/123/name.mp4 to direct streaming link: https://tmpfiles.org/dl/123/name.mp4
          const directUrl = vidData.data.url.replace('tmpfiles.org/', 'tmpfiles.org/dl/')
          return NextResponse.json({ success: true, url: directUrl })
        }
      }
    } catch (vidErr: any) {
      console.warn('tmpfiles.org fallback failed...', vidErr?.message)
    }

    // 5. Ultimate Fallback: Base64 data URI (for files < 4MB so upload NEVER fails)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    if (buffer.length <= 4 * 1024 * 1024) {
      const mime = file.type || 'application/octet-stream'
      const base64Url = `data:${mime};base64,${buffer.toString('base64')}`
      return NextResponse.json({ success: true, url: base64Url })
    }

    return NextResponse.json({
      success: false,
      error: 'Upload failed: Cloud storage unavailable. Please paste a direct URL or upload a smaller file.'
    }, { status: 500 })

  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
