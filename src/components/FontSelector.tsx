'use client'

import { useState, useRef, useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { useSound } from '@/hooks/useSound'
import { Type, Check } from 'lucide-react'

export const FONT_OPTIONS = [
  { id: 'font-bebas', name: 'Netflix Cinema', font: 'Bebas Neue', sample: 'Birthday Special' },
  { id: 'font-anton', name: 'Netflix Blockbuster', font: 'Anton', sample: 'Birthday Special' },
  { id: 'font-montserrat', name: 'Cinematic Poster', font: 'Montserrat', sample: 'Birthday Special' },
  { id: 'font-oswald', name: 'Netflix Series', font: 'Oswald', sample: 'Birthday Special' },
  { id: 'font-righteous', name: 'Birthday Festive', font: 'Righteous', sample: 'Birthday Special' },
  { id: 'font-playfair', name: 'Luxury Elegance', font: 'Playfair Display', sample: 'Birthday Special' },
  { id: 'font-inter', name: 'Netflix Modern', font: 'Inter', sample: 'Birthday Special' },
]

export default function FontSelector() {
  const [isOpen, setIsOpen] = useState(false)
  const fontFamily = useAppStore((state) => state.fontFamily)
  const setFontFamily = useAppStore((state) => state.setFontFamily)
  const { playPop } = useSound()
  const dropdownRef = useRef<HTMLDivElement>(null)

  const activeFont = FONT_OPTIONS.find(f => f.id === fontFamily) || FONT_OPTIONS[0]

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => { playPop(); setIsOpen(!isOpen); }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-all shadow-sm"
        title="Change Title & Heading Font"
      >
        <Type className="w-3.5 h-3.5 text-yellow-400" />
        <span className="hidden sm:inline text-gray-300">Font:</span>
        <span className="text-white font-bold">{activeFont.font}</span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-10 mt-2 w-72 bg-[#181818]/95 backdrop-blur-md border border-gray-700/80 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-4 py-2 border-b border-gray-800">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Choose Heading Font</p>
            <p className="text-[11px] text-gray-500">Changes titles across all pages instantly</p>
          </div>

          <div className="py-1 max-h-80 overflow-y-auto no-scrollbar">
            {FONT_OPTIONS.map((f) => {
              const isSelected = f.id === fontFamily
              return (
                <button
                  key={f.id}
                  onClick={() => {
                    playPop()
                    setFontFamily(f.id)
                    setIsOpen(false)
                  }}
                  className={`w-full text-left px-4 py-2.5 flex items-center justify-between transition-colors ${
                    isSelected ? 'bg-[#E50914]/20 text-white' : 'hover:bg-white/10 text-gray-300'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400 font-medium">{f.name}</span>
                    <span className={`text-xl text-white ${f.id}`}>
                      {f.sample}
                    </span>
                  </div>

                  {isSelected && (
                    <Check className="w-4 h-4 text-[#E50914] shrink-0" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
