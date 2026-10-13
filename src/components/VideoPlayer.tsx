'use client'

import React from 'react'

export function getYouTubeId(url: string): string | null {
  if (!url) return null
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
  const match = url.match(regExp)
  return match && match[2].length === 11 ? match[2] : null
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
  const youtubeId = getYouTubeId(url)

  if (youtubeId) {
    return (
      <iframe
        src={`https://www.youtube.com/embed/${youtubeId}?autoplay=${autoPlay ? 1 : 0}&rel=0&modestbranding=1&playsinline=1`}
        title={title || "Video Player"}
        className={className}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
      />
    )
  }

  return (
    <video
      src={url}
      title={title}
      controls
      autoPlay={autoPlay}
      playsInline
      className={`${className} object-contain bg-black`}
    />
  )
}
