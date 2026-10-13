'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/lib/store'
import { useSound } from '@/hooks/useSound'
import { Volume2, VolumeX, Search, Bell } from 'lucide-react'

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const currentProfile = useAppStore((state) => state.currentProfile)
  const isMuted = useAppStore((state) => state.isMuted)
  const toggleMute = useAppStore((state) => state.toggleMute)
  const router = useRouter()
  const { playPop } = useSound()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`fixed top-0 w-full z-50 transition-colors duration-300 h-16 md:h-18 flex items-center px-4 md:px-12 ${isScrolled ? 'bg-[#141414]' : 'bg-gradient-to-b from-black/80 to-transparent'}`}>
      <div className="flex items-center gap-8">
        {/* Netflix Logo (Bigger) */}
        <div 
          className="cursor-pointer flex items-center shrink-0" 
          onClick={() => { playPop(); router.push('/browse'); }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="/netflix-logo.png" 
            alt="Netflix" 
            className="h-8 sm:h-9 md:h-10 lg:h-11 w-auto object-contain transition-transform duration-200 hover:scale-105"
          />
        </div>

        {/* Clean Standard Netflix Nav Links */}
        <div className="hidden md:flex gap-5 text-sm font-medium text-gray-300">
          <span 
            className="text-white font-semibold cursor-pointer" 
            onClick={() => { playPop(); router.push('/browse'); }}
          >
            Home
          </span>
          <span className="hover:text-gray-400 cursor-pointer transition">TV Shows</span>
          <span className="hover:text-gray-400 cursor-pointer transition">Movies</span>
          <span className="hover:text-gray-400 cursor-pointer transition">New & Popular</span>
          <span className="hover:text-gray-400 cursor-pointer transition">My List</span>
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center ml-auto gap-6 text-white">
        <Search className="w-5 h-5 cursor-pointer hover:text-gray-300 transition" />
        <Bell className="w-5 h-5 cursor-pointer hover:text-gray-300 transition" />
        
        <button 
          onClick={() => { playPop(); toggleMute(); }} 
          className="focus:outline-none p-1" 
          title={isMuted ? "Unmute sounds" : "Mute sounds"}
        >
          {isMuted ? <VolumeX className="w-5 h-5 text-gray-400" /> : <Volume2 className="w-5 h-5 text-white" />}
        </button>

        {/* Profile Dropdown */}
        <div className="relative group cursor-pointer">
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={currentProfile?.avatarUrl || '/placeholder.png'} 
              alt="Profile" 
              className="w-8 h-8 rounded object-cover"
            />
            <span className="hidden md:block text-xs">▼</span>
          </div>
          
          <div className="absolute right-0 top-8 mt-2 w-48 bg-black/95 border border-gray-800 rounded hidden group-hover:flex flex-col py-2 z-50">
            <div className="px-4 py-2 hover:bg-white/10 text-sm cursor-pointer" onClick={() => { playPop(); router.push('/profiles'); }}>
              Switch Profiles
            </div>
            <div className="px-4 py-2 hover:bg-white/10 text-sm cursor-pointer" onClick={() => { playPop(); router.push('/admin'); }}>
              Admin Panel
            </div>
            <div className="px-4 py-2 hover:bg-white/10 text-sm border-t border-gray-800 mt-2 pt-2 text-red-400 cursor-pointer" onClick={() => { playPop(); router.push('/'); }}>
              Sign out of Netflix
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
