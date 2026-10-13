import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AppState {
  isMuted: boolean
  toggleMute: () => void
  currentProfile: { id: string; name: string; avatarUrl: string } | null
  setCurrentProfile: (profile: { id: string; name: string; avatarUrl: string } | null) => void
  fontFamily: string
  setFontFamily: (font: string) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isMuted: false,
      toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
      currentProfile: null,
      setCurrentProfile: (profile) => set({ currentProfile: profile }),
      fontFamily: 'font-bebas',
      setFontFamily: (font: string) => set({ fontFamily: font }),
    }),
    {
      name: 'netflix-clone-storage',
    }
  )
)
