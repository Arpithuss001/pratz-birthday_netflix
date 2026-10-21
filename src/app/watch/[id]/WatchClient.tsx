'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import VideoPlayer from '@/components/VideoPlayer'
import { enterFullscreen, exitFullscreen } from '@/lib/fullscreen'

type Video = {
  id: string
  title: string
  videoUrl: string
}

export default function WatchClient({ video }: { video: Video }) {
  const router = useRouter()

  useEffect(() => {
    // Attempt fullscreen immediately
    enterFullscreen()

    // Listen for Escape key to exit watch mode back to browse
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        exitFullscreen()
        router.push('/browse')
      }
    }

    const handleFirstClick = () => {
      enterFullscreen()
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('click', handleFirstClick, { once: true })
    window.addEventListener('touchstart', handleFirstClick, { once: true })

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('click', handleFirstClick)
      window.removeEventListener('touchstart', handleFirstClick)
    }
  }, [router])

  const handleBack = () => {
    exitFullscreen()
    router.back()
  }

  return (
    <div className="h-screen w-screen bg-black relative flex flex-col justify-center items-center overflow-hidden">
      <nav className="absolute top-0 w-full p-6 z-20 flex items-center gap-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent transition-opacity duration-300 opacity-90 hover:opacity-100">
        <button 
          onClick={handleBack}
          className="text-white p-2 rounded-full hover:bg-white/20 transition cursor-pointer flex items-center gap-2"
          title="Back to Browse (Esc)"
        >
          <ArrowLeft className="w-8 h-8" />
          <span className="font-semibold text-lg hidden sm:inline">Back</span>
        </button>
        <p className="text-white text-xl md:text-2xl font-bold truncate">{video.title}</p>
      </nav>
      
      <div className="w-full h-full flex items-center justify-center">
        <VideoPlayer 
          url={video.videoUrl} 
          title={video.title} 
          autoPlay={true}
          className="w-full h-full"
        />
      </div>
    </div>
  )
}
