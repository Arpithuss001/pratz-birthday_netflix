'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/lib/store'
import { useSound } from '@/hooks/useSound'
import { Volume2, VolumeX, Search, Bell, Shield, ChevronDown } from 'lucide-react'

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const currentProfile = useAppStore((state) => state.currentProfile)
  const isMuted = useAppStore((state) => state.isMuted)
  const toggleMute = useAppStore((state) => state.toggleMute)
  const router = useRouter()
  const { playPop } = useSound()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <nav className={`fixed top-0 w-full z-50 transition-colors duration-300 h-16 md:h-18 flex items-center px-4 md:px-12 ${isScrolled ? 'bg-[#141414]' : 'bg-gradient-to-b from-black/80 to-transparent'}`}>
      <div className="flex items-center gap-8">
        {/* Netflix Logo */}
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
        <div className="hidden md:flex gap-5 text-sm font-medium text-gray-300 items-center">
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
          
          {/* Direct Admin Link in Nav */}
          <span 
            className="text-gray-400 hover:text-white cursor-pointer transition flex items-center gap-1 hover:text-[#E50914]"
            onClick={() => { playPop(); router.push('/admin'); }}
          >
            Admin
          </span>
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center ml-auto gap-4 md:gap-6 text-white">
        <Search className="w-5 h-5 cursor-pointer hover:text-gray-300 transition hidden sm:block" />
        <Bell className="w-5 h-5 cursor-pointer hover:text-gray-300 transition hidden sm:block" />
        
        {/* Mute Button */}
        <button 
          onClick={() => { playPop(); toggleMute(); }} 
          className="focus:outline-none p-1" 
          title={isMuted ? "Unmute sounds" : "Mute sounds"}
        >
          {isMuted ? <VolumeX className="w-5 h-5 text-gray-400" /> : <Volume2 className="w-5 h-5 text-white" />}
        </button>

        {/* Dedicated Admin Button */}
        <button
          onClick={() => { playPop(); router.push('/admin'); }}
          className="bg-[#E50914] hover:bg-[#c10710] text-white px-3 py-1.5 rounded text-xs font-bold transition flex items-center gap-1.5 shadow-md active:scale-95"
          title="Open Admin Panel"
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Admin</span>
        </button>

        {/* Profile Dropdown */}
        <div 
          ref={dropdownRef}
          className="relative cursor-pointer"
          onMouseEnter={() => setDropdownOpen(true)}
          onMouseLeave={() => setDropdownOpen(false)}
        >
          <div 
            className="flex items-center gap-1.5 py-2"
            onClick={() => { playPop(); setDropdownOpen(prev => !prev); }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={currentProfile?.avatarUrl || '/placeholder.png'} 
              alt="Profile" 
              onError={(e) => {
                const target = e.target as HTMLImageElement
                if (!target.src.endsWith('/placeholder.png')) {
                  target.src = '/placeholder.png'
                }
              }}
              className="w-8 h-8 rounded object-cover ring-1 ring-white/20 hover:ring-white transition"
            />
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </div>
          
          {dropdownOpen && (
            <div className="absolute right-0 top-full pt-1 w-48 z-50">
              <div className="bg-black/95 border border-gray-800 rounded shadow-2xl py-2 flex flex-col backdrop-blur-sm">
                <div 
                  className="px-4 py-2 hover:bg-white/10 text-sm cursor-pointer transition flex items-center gap-2" 
                  onClick={() => { playPop(); setDropdownOpen(false); router.push('/profiles'); }}
                >
                  Switch Profiles
                </div>
                <div 
                  className="px-4 py-2 hover:bg-[#E50914]/20 text-sm cursor-pointer transition flex items-center gap-2 text-white font-medium" 
                  onClick={() => { playPop(); setDropdownOpen(false); router.push('/admin'); }}
                >
                  <Shield className="w-4 h-4 text-[#E50914]" />
                  Admin Panel
                </div>
                <div 
                  className="px-4 py-2 hover:bg-white/10 text-sm border-t border-gray-800 mt-2 pt-2 text-red-400 cursor-pointer transition" 
                  onClick={() => { playPop(); setDropdownOpen(false); router.push('/'); }}
                >
                  Sign out of Netflix
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
