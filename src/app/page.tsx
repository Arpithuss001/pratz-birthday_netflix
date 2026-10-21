'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSound } from '@/hooks/useSound'
import { enterFullscreen } from '@/lib/fullscreen'

export default function LandingPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showIntro, setShowIntro] = useState(false)
  const router = useRouter()
  const { playPop } = useSound()
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    playPop()
    enterFullscreen()
    setShowIntro(true)
    
    if (audioRef.current) {
      audioRef.current.play().catch(console.error)
    }

    // Wait for the ~4s video to finish before redirecting
    setTimeout(() => {
      router.push('/profiles')
    }, 4500)
  }

  return (
    <div className="min-h-screen bg-black/90 flex flex-col items-center justify-center bg-[url('https://assets.nflxext.com/ffe/siteui/vlv3/f841d4c7-10e1-40af-bcae-07a3f8dc141a/f6d7434e-d6de-4185-a6d4-c77a2d08737b/US-en-20220502-popsignuptwoweeks-perspective_alpha_website_small.jpg')] bg-cover bg-center">
      <audio ref={audioRef} src="/netflix-tudum.mp3" preload="auto" />
      
      {showIntro && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center overflow-hidden pointer-events-none">
          <video 
            src="/netflix-intro.mp4"
            className="w-full h-full object-cover"
            autoPlay
            playsInline
          />
        </div>
      )}

      <div className="absolute inset-0 bg-black/60 z-0"></div>
      
      {/* Top Left Netflix Logo */}
      <div className="absolute top-6 left-6 md:left-12 z-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/netflix-logo.png" alt="Netflix" className="h-11 md:h-14 object-contain drop-shadow-md" />
      </div>

      {/* Top Right Admin Button */}
      <div className="absolute top-6 right-6 md:right-12 z-10">
        <button
          onClick={() => { playPop(); router.push('/admin'); }}
          className="bg-[#E50914] hover:bg-[#c10710] text-white px-4 py-2 rounded font-bold text-sm transition-colors shadow-lg flex items-center gap-1.5 cursor-pointer"
        >
          Admin Access
        </button>
      </div>

      <div className="z-10 w-full max-w-md p-10 bg-black/80 rounded-md mt-10">
        <h1 className="text-3xl font-bold mb-8 text-white">Sign In</h1>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email or phone number"
            className="p-4 rounded bg-[#333] text-white border-none focus:outline-none focus:ring-2 focus:ring-white"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="p-4 rounded bg-[#333] text-white border-none focus:outline-none focus:ring-2 focus:ring-white"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button 
            type="submit"
            className="mt-6 bg-[#E50914] text-white p-4 rounded font-bold hover:bg-[#c10710] transition-colors"
          >
            Sign In
          </button>
        </form>
        <p className="text-[#737373] mt-8">
          New to Netflix? <span className="text-white hover:underline cursor-pointer">Sign up now</span>.
        </p>
      </div>
    </div>
  )
}
