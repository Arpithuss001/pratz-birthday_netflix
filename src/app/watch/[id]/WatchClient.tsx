'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import VideoPlayer from '@/components/VideoPlayer'

type Video = {
  id: string
  title: string
  videoUrl: string
}

export default function WatchClient({ video }: { video: Video }) {
  const router = useRouter()

  return (
    <div className="h-screen w-screen bg-black relative flex flex-col justify-center items-center overflow-hidden">
      <nav className="absolute top-0 w-full p-6 z-20 flex items-center gap-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent transition-opacity duration-300 opacity-90 hover:opacity-100">
        <button 
          onClick={() => router.back()}
          className="text-white p-2 rounded-full hover:bg-white/20 transition cursor-pointer flex items-center gap-2"
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
