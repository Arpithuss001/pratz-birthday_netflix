'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/lib/store'
import { useSound } from '@/hooks/useSound'
import { enterFullscreen } from '@/lib/fullscreen'
import { PlusCircle } from 'lucide-react'

type Profile = {
  id: string
  name: string
  avatarUrl: string
}

export default function ProfilesClient({ initialProfiles }: { initialProfiles: Profile[] }) {
  const router = useRouter()
  const { playPop } = useSound()
  const setCurrentProfile = useAppStore((state) => state.setCurrentProfile)

  useEffect(() => {
    enterFullscreen()
    const handleGesture = () => {
      enterFullscreen()
    }
    window.addEventListener('click', handleGesture, { once: true })
    window.addEventListener('touchstart', handleGesture, { once: true })
    return () => {
      window.removeEventListener('click', handleGesture)
      window.removeEventListener('touchstart', handleGesture)
    }
  }, [])

  const handleSelect = (profile: Profile) => {
    playPop()
    setCurrentProfile(profile)
    enterFullscreen()
    router.push('/browse')
  }

  const handleAddProfile = () => {
    playPop()
    router.push('/admin') // Redirect to admin to add profile if empty
  }

  if (initialProfiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center">
        <p className="text-xl text-gray-400 mb-8">No profiles found.</p>
        <button 
          onClick={handleAddProfile}
          className="flex items-center gap-2 text-gray-400 hover:text-white border border-gray-400 hover:border-white px-6 py-2 transition-all group"
        >
          <PlusCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
          <span>Add Profile in Admin</span>
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-wrap justify-center gap-8 mb-12">
        {initialProfiles.map((profile) => (
          <div 
            key={profile.id} 
            className="flex flex-col items-center group cursor-pointer"
            onClick={() => handleSelect(profile)}
          >
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-md overflow-hidden border-[3px] border-transparent group-hover:border-white transition-all">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={profile.avatarUrl || '/placeholder.png'} 
                alt={profile.name} 
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  if (!target.src.endsWith('/placeholder.png')) {
                    target.src = '/placeholder.png'
                  }
                }}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="mt-4 text-gray-400 group-hover:text-white transition-colors text-xl">
              {profile.name}
            </span>
          </div>
        ))}
        <div 
          className="flex flex-col items-center group cursor-pointer"
          onClick={handleAddProfile}
        >
          <div className="w-32 h-32 md:w-40 md:h-40 flex items-center justify-center rounded-md border-[3px] border-transparent group-hover:border-white transition-all bg-[#333]">
            <PlusCircle className="w-16 h-16 text-gray-400 group-hover:text-white transition-colors" />
          </div>
          <span className="mt-4 text-gray-400 group-hover:text-white transition-colors text-xl">
            Add Profile
          </span>
        </div>
      </div>

      <button
        onClick={handleAddProfile}
        className="border border-gray-600 text-gray-400 hover:text-white hover:border-white px-8 py-2 text-sm tracking-widest uppercase transition-all duration-200 cursor-pointer hover:bg-white/5"
      >
        Manage Profiles (Admin)
      </button>
    </div>
  )
}
