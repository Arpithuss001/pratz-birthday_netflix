'use client'

import { useRouter } from 'next/navigation'
import { useAppStore } from '@/lib/store'
import { useSound } from '@/hooks/useSound'
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

  const handleSelect = (profile: Profile) => {
    playPop()
    setCurrentProfile(profile)
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
    <div className="flex flex-wrap justify-center gap-8">
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
  )
}
