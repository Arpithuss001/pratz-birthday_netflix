'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import VideoPlayer from '@/components/VideoPlayer'
import { Play, Info, ChevronLeft, ChevronRight, X, Maximize2, Sparkles, Volume2, VolumeX, RotateCcw } from 'lucide-react'
import { useSound } from '@/hooks/useSound'
import { useAppStore } from '@/lib/store'

type Video = {
  id: string
  title: string
  description: string
  thumbnailUrl: string
  videoUrl: string
  genre?: string | null
}

type Category = {
  id: string
  name: string
  videos: { video: Video }[]
}

function getGoogleDriveId(url: string): string | null {
  if (!url) return null
  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/)
  return match ? match[1] : null
}

function getGoogleDriveStreamUrl(url: string): string | null {
  const driveId = getGoogleDriveId(url)
  if (!driveId) return null
  return `https://drive.usercontent.google.com/download?id=${driveId}&export=download&confirm=t`
}

function CategoryRow({ 
  category, 
  onPlayVideo 
}: { 
  category: Category
  onPlayVideo: (video: Video) => void 
}) {
  const rowRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)
  const { playPop } = useSound()
  const fontFamily = useAppStore((state) => state.fontFamily)

  const checkScroll = () => {
    if (!rowRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = rowRef.current
    setShowLeftArrow(scrollLeft > 20)
    setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 20)
  }

  useEffect(() => {
    checkScroll()
    const handleResize = () => checkScroll()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [category.videos])

  const scroll = (direction: 'left' | 'right') => {
    playPop()
    if (!rowRef.current) return
    const scrollAmount = rowRef.current.clientWidth * 0.75
    rowRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    })
    setTimeout(checkScroll, 400)
  }

  if (category.videos.length === 0) return null

  return (
    <div className="space-y-2 group/row relative">
      <div className="flex items-center justify-between px-4 md:px-14">
        <h2 className={`text-2xl md:text-3xl font-bold text-white tracking-wide flex items-center gap-2 ${fontFamily}`}>
          {category.name}
          <span className="text-xs font-sans font-normal text-gray-400 bg-white/10 px-2.5 py-0.5 rounded-full tracking-normal">
            {category.videos.length} {category.videos.length === 1 ? 'video' : 'videos'}
          </span>
        </h2>
      </div>

      <div className="relative">
        {/* Left Arrow */}
        {showLeftArrow && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-0 bottom-0 z-30 w-12 bg-black/60 hover:bg-black/90 text-white flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity duration-300"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-8 h-8 hover:scale-125 transition-transform" />
          </button>
        )}

        {/* Horizontal Row */}
        <div
          ref={rowRef}
          onScroll={checkScroll}
          className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth px-4 md:px-12 py-4"
        >
          {category.videos.map(({ video }) => (
            <div
              key={video.id}
              onClick={() => { playPop(); onPlayVideo(video); }}
              className="flex-none w-[260px] sm:w-[290px] md:w-[330px] aspect-video relative rounded-md overflow-hidden cursor-pointer group bg-[#1f1f1f] shadow-lg transition-all duration-300 hover:scale-105 hover:z-20 hover:shadow-2xl hover:ring-2 hover:ring-[#E50914]"
            >
              {/* Thumbnail */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={video.thumbnailUrl || '/placeholder.png'}
                alt={video.title}
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  if (!target.src.endsWith('/placeholder.png')) {
                    target.src = '/placeholder.png'
                  }
                }}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />

              {/* Hover Overlay with Netflix details */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 fill-black ml-0.5" />
                  </div>
                  <span className="text-xs uppercase tracking-wider font-semibold bg-[#E50914] text-white px-2 py-0.5 rounded">
                    Watch Now
                  </span>
                </div>
                <h3 className="text-white font-bold text-base md:text-lg line-clamp-1 drop-shadow">
                  {video.title}
                </h3>
                {video.description && (
                  <p className="text-gray-300 text-xs line-clamp-2 mt-1 drop-shadow">
                    {video.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Right Arrow */}
        {showRightArrow && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-0 bottom-0 z-30 w-12 bg-black/60 hover:bg-black/90 text-white flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity duration-300"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-8 h-8 hover:scale-125 transition-transform" />
          </button>
        )}
      </div>
    </div>
  )
}

export default function BrowseClient({ 
  categories, 
  allVideos 
}: { 
  categories: Category[]
  allVideos: Video[] 
}) {
  const router = useRouter()
  const { playPop } = useSound()
  const fontFamily = useAppStore((state) => state.fontFamily)
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const heroVideoRef = useRef<HTMLVideoElement>(null)
  const [isHeroMuted, setIsHeroMuted] = useState(true)
  const [isHeroVideoPlaying, setIsHeroVideoPlaying] = useState(false)
  const [heroVideoError, setHeroVideoError] = useState(false)

  // Only use a video as hero if it is explicitly marked as 'featured'
  const explicitFeaturedVideo = allVideos.find(v => v.genre === 'featured')

  // Identify featured video URL
  const featuredVideoUrl = explicitFeaturedVideo?.videoUrl?.trim() || 'https://drive.google.com/file/d/11DLG-eMqQk7Pfh-E44mpZkLqJIWEx7nK/view?usp=sharing'
  const featuredDriveId = getGoogleDriveId(featuredVideoUrl)
  const isTargetPratzVideo = featuredDriveId === '11DLG-eMqQk7Pfh-E44mpZkLqJIWEx7nK' || featuredVideoUrl.includes('11DLG-eMqQk7Pfh-E44mpZkLqJIWEx7nK')
  const directDriveStream = featuredDriveId ? getGoogleDriveStreamUrl(featuredVideoUrl) : null

  // Ensure autoplay on mount & video updates
  useEffect(() => {
    if (heroVideoRef.current) {
      heroVideoRef.current.defaultMuted = true
      heroVideoRef.current.muted = isHeroMuted
      const playPromise = heroVideoRef.current.play()
      if (playPromise !== undefined) {
        playPromise.catch(() => {})
      }
    }
  }, [explicitFeaturedVideo, isHeroMuted])

  // Resume background video when modal closes, pause when modal opens
  useEffect(() => {
    if (heroVideoRef.current) {
      if (selectedVideo) {
        heroVideoRef.current.pause()
      } else {
        heroVideoRef.current.play().catch(() => {})
      }
    }
  }, [selectedVideo])

  const toggleHeroMute = () => {
    playPop()
    if (heroVideoRef.current) {
      const nextMuted = !isHeroMuted
      heroVideoRef.current.muted = nextMuted
      setIsHeroMuted(nextMuted)
      if (!nextMuted) {
        heroVideoRef.current.play().catch(() => {})
      }
    }
  }

  const handleHeroReplay = () => {
    playPop()
    if (heroVideoRef.current) {
      heroVideoRef.current.currentTime = 0
      heroVideoRef.current.play().catch(() => {})
    }
  }

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedVideo(null)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  if (allVideos.length === 0) {
    return (
      <div className="min-h-screen bg-[#141414] text-white">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-screen px-4 text-center">
          <Sparkles className="w-16 h-16 text-[#E50914] mb-4 animate-bounce" />
          <h1 className="text-4xl font-bold mb-4">No content yet</h1>
          <p className="text-lg text-gray-400 mb-8 max-w-md">
            Add Birthday videos and categories from the Admin Panel to populate your Netflix stream!
          </p>
          <button 
            onClick={() => { playPop(); router.push('/admin'); }}
            className="bg-[#E50914] text-white px-8 py-3 rounded text-lg font-bold hover:bg-[#c10710] transition-colors"
          >
            Go to Admin Panel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#141414] text-white overflow-x-hidden pb-24">
      <Navbar />

      {/* Hero Banner Section */}
      {explicitFeaturedVideo ? (
        <div className="relative w-full h-[70vh] md:h-[85vh] overflow-hidden bg-black select-none">
          {/* Base Poster Photo (Always renders as initial/fallback layer) */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={explicitFeaturedVideo.thumbnailUrl || '/placeholder.png'} 
            alt={explicitFeaturedVideo.title}
            onError={(e) => {
              const target = e.target as HTMLImageElement
              if (!target.src.endsWith('/placeholder.png')) {
                target.src = '/placeholder.png'
              }
            }}
            className="w-full h-full object-cover absolute inset-0 z-0"
          />

          {/* Background Video Player */}
          {!heroVideoError && (
            <video
              ref={heroVideoRef}
              autoPlay
              loop
              muted={isHeroMuted}
              playsInline
              preload="auto"
              onPlaying={() => setIsHeroVideoPlaying(true)}
              onLoadedData={() => setIsHeroVideoPlaying(true)}
              onError={() => setHeroVideoError(true)}
              className={`w-full h-full object-cover absolute inset-0 z-0 transition-opacity duration-1000 ${
                isHeroVideoPlaying ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {/* If target video is the birthday girl's video, prioritize local optimized 6MB 1080p stream */}
              {isTargetPratzVideo && <source src="/hero-video.mp4" type="video/mp4" />}
              {directDriveStream && <source src={directDriveStream} type="video/mp4" />}
              {featuredVideoUrl && !directDriveStream && <source src={featuredVideoUrl} type="video/mp4" />}
              <source src="/hero-video.mp4" type="video/mp4" />
            </video>
          )}

          {/* Cinematic Netflix Gradients */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/40 to-transparent z-[1] pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/20 to-transparent z-[1] pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-transparent z-[1] pointer-events-none" />

          {/* Hero Meta Content */}
          <div className="absolute top-[25%] md:top-[35%] left-4 md:left-12 max-w-2xl z-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs md:text-sm uppercase tracking-widest text-[#E50914] font-extrabold bg-black/60 px-3 py-1 rounded-sm border border-[#E50914]/30 inline-block shadow">
                FEATURED
              </span>
              {isHeroVideoPlaying && (
                <span className="text-[11px] font-bold text-white bg-red-600/80 px-2 py-0.5 rounded flex items-center gap-1.5 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  PLAYING VIDEO
                </span>
              )}
            </div>

            <h1 className={`text-4xl md:text-7xl font-extrabold mb-4 drop-shadow-2xl ${fontFamily}`}>
              {explicitFeaturedVideo.title}
            </h1>
            <p className="text-base md:text-lg text-white/90 drop-shadow-md mb-6 line-clamp-3 leading-relaxed">
              {explicitFeaturedVideo.description}
            </p>
            <div className="flex gap-4 items-center flex-wrap">
              <button 
                onClick={() => { 
                  playPop(); 
                  heroVideoRef.current?.pause();
                  setSelectedVideo(explicitFeaturedVideo); 
                }}
                className="flex items-center gap-2 bg-white text-black px-6 py-2.5 md:px-8 md:py-3 rounded font-bold hover:bg-white/80 transition-all shadow-lg hover:scale-105 cursor-pointer"
              >
                <Play className="fill-black w-5 h-5" /> Play Full Video
              </button>
              <button 
                onClick={() => { playPop(); router.push(`/watch/${explicitFeaturedVideo.id}`); }}
                className="flex items-center gap-2 bg-gray-600/70 text-white px-6 py-2.5 md:px-8 md:py-3 rounded font-bold hover:bg-gray-600/50 transition-all backdrop-blur-sm shadow-md hover:scale-105 cursor-pointer"
              >
                <Maximize2 className="w-5 h-5" /> Fullscreen
              </button>
            </div>
          </div>

          {/* Sound, Replay & Quality Badges (Bottom Right like Netflix) */}
          <div className="absolute right-4 md:right-12 bottom-8 md:bottom-12 z-20 flex items-center gap-2.5 sm:gap-3">
            <button
              onClick={handleHeroReplay}
              className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 hover:border-white text-white flex items-center justify-center transition-all backdrop-blur-md shadow-xl hover:scale-110 active:scale-95 cursor-pointer"
              title="Replay Video"
            >
              <RotateCcw className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <button
              onClick={toggleHeroMute}
              className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 hover:border-white text-white flex items-center justify-center transition-all backdrop-blur-md shadow-xl hover:scale-110 active:scale-95 cursor-pointer"
              title={isHeroMuted ? "Unmute Background Sound" : "Mute Sound"}
            >
              {isHeroMuted ? (
                <VolumeX className="w-5 h-5 text-gray-300" />
              ) : (
                <Volume2 className="w-5 h-5 text-red-500 animate-pulse" />
              )}
            </button>
            <div className="hidden sm:flex bg-black/60 border-l-2 border-[#E50914] px-3 py-1.5 text-xs font-bold tracking-wider text-white backdrop-blur-md rounded-r">
              BIRTHDAY SPECIAL
            </div>
          </div>
        </div>
      ) : (
        /* Default Netflix-style Birthday Special Hero Banner */
        <div className="relative w-full h-[60vh] md:h-[70vh] flex items-center bg-gradient-to-b from-[#1f0d0e] via-[#141414] to-[#141414] border-b border-gray-900">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(229,9,20,0.15),transparent_50%)]" />
          <div className="px-4 md:px-14 max-w-3xl z-10 pt-24 md:pt-28">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs uppercase tracking-widest text-red-500 font-extrabold bg-red-950/60 border border-red-800/40 px-3 py-1 rounded">
                SPECIAL EDITION
              </span>
              <span className="text-xs text-gray-400">Exclusive Stream</span>
            </div>
            <h1 className={`text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-extrabold tracking-tight mb-4 text-white drop-shadow-md ${fontFamily}`}>
              Birthday Special
            </h1>
            <p className="text-base md:text-xl text-gray-300 mb-8 leading-relaxed max-w-xl">
              Stream all your birthday videos, wishes, and memories right here. Explore the playlist below!
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="#category-rows"
                onClick={() => playPop()}
                className="flex items-center gap-2 bg-[#E50914] text-white px-6 py-3 rounded font-bold hover:bg-[#c10710] transition-colors shadow-lg"
              >
                <Play className="fill-white w-5 h-5" /> Explore Videos Below
              </a>
              {allVideos.length > 0 && (
                <button
                  onClick={() => { playPop(); setSelectedVideo(allVideos[0]); }}
                  className="flex items-center gap-2 bg-white/20 text-white px-6 py-3 rounded font-bold hover:bg-white/30 transition-colors backdrop-blur-sm"
                >
                  <Sparkles className="w-5 h-5 text-yellow-400" /> Play First Video
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Categories / Video Rows */}
      <div id="category-rows" className="mt-8 space-y-10 relative z-10">
        {categories.map(category => (
          <CategoryRow
            key={category.id}
            category={category}
            onPlayVideo={(video) => setSelectedVideo(video)}
          />
        ))}

        {/* Any videos not yet assigned to a specific category */}
        {(() => {
          const unassignedVideos = allVideos.filter(v => 
            !categories.some(cat => cat.videos?.some(cv => cv.video.id === v.id))
          )
          if (unassignedVideos.length === 0) return null
          return (
            <CategoryRow
              category={{
                id: 'all-videos-row',
                name: categories.length === 0 ? 'Birthday Videos' : 'More Birthday Videos',
                videos: unassignedVideos.map(v => ({ video: v }))
              }}
              onPlayVideo={(video) => setSelectedVideo(video)}
            />
          )
        })()}
      </div>

      {/* Netflix-style In-Page Video Modal */}
      {selectedVideo && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedVideo(null)}
        >
          <div 
            className="relative w-full max-w-4xl bg-[#181818] rounded-xl overflow-hidden shadow-2xl border border-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => { playPop(); setSelectedVideo(null); }}
              className="absolute top-4 right-4 z-30 bg-black/70 hover:bg-black text-white p-2 rounded-full transition-transform hover:scale-110"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Video Player */}
            <div className="aspect-video w-full bg-black relative">
              <VideoPlayer 
                url={selectedVideo.videoUrl} 
                title={selectedVideo.title}
                autoPlay={true}
                className="w-full h-full"
              />
            </div>

            {/* Video Meta & Actions */}
            <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 justify-between items-start">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-green-400 bg-green-950/60 border border-green-800/40 px-2 py-0.5 rounded">
                    Now Playing
                  </span>
                  <span className="text-xs text-gray-400">HD</span>
                </div>
                <h2 className={`text-2xl md:text-4xl font-bold text-white ${fontFamily}`}>
                  {selectedVideo.title}
                </h2>
                <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                  {selectedVideo.description}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
                <button
                  onClick={() => {
                    playPop()
                    router.push(`/watch/${selectedVideo.id}`)
                  }}
                  className="flex items-center justify-center gap-2 bg-white text-black px-6 py-2.5 rounded font-bold hover:bg-gray-200 transition"
                >
                  <Maximize2 className="w-5 h-5" /> Fullscreen Mode
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
