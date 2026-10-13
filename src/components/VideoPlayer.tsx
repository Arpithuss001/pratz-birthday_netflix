'use client'

import React, { useState } from 'react'
import { ExternalLink, AlertCircle } from 'lucide-react'

export function getYouTubeId(url: string): string | null {
  if (!url) return null
  const regExp = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/
  const match = url.match(regExp)
  return match && match[1] ? match[1] : null
}

export function getGoogleDriveId(url: string): string | null {
  if (!url) return null
  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/)
  return match ? match[1] : null
}

export default function VideoPlayer({ 
  url, 
  title, 
  autoPlay = true,
  className = "w-full h-full"
}: { 
  url: string
  title?: string
  autoPlay?: boolean
  className?: string 
}) {
  const [hasError, setHasError] = useState(false)
  const cleanUrl = (url || '').trim()

  const youtubeId = getYouTubeId(cleanUrl)
  if (youtubeId) {
    return (
      <iframe
        src={`https://www.youtube.com/embed/${youtubeId}?autoplay=${autoPlay ? 1 : 0}&rel=0&modestbranding=1&playsinline=1`}
        title={title || "YouTube Player"}
        className={className}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
      />
    )
  }

  const driveId = getGoogleDriveId(cleanUrl)
  if (driveId) {
    return (
      <iframe
        src={`https://drive.google.com/file/d/${driveId}/preview`}
        title={title || "Google Drive Video Player"}
        className={`${className} border-none bg-black`}
        allow="autoplay; fullscreen"
        allowFullScreen
      />
    )
  }

  if (hasError) {
    return (
      <div className={`${className} bg-[#181818] flex flex-col items-center justify-center p-6 text-center text-white`}>
        <AlertCircle className="w-12 h-12 text-[#E50914] mb-3" />
        <p className="font-bold text-lg mb-1">{title || 'Video Player'}</p>
        <p className="text-sm text-gray-400 mb-4 max-w-md">
          This video could not be played directly in the browser player.
        </p>
        <a 
          href={cleanUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="bg-white text-black px-5 py-2 rounded font-bold text-sm hover:bg-gray-200 transition flex items-center gap-2"
        >
          <ExternalLink className="w-4 h-4" />
          Open Video Link
        </a>
      </div>
    )
  }

  return (
    <video
      src={cleanUrl}
      title={title}
      controls
      autoPlay={autoPlay}
      playsInline
      onError={() => setHasError(true)}
      className={`${className} object-contain bg-black`}
    />
  )
}
