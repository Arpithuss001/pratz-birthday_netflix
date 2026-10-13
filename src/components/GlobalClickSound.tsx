'use client'

import { useEffect, useRef } from 'react'
import { useAppStore } from '@/lib/store'

export default function GlobalClickSound() {
  const isMuted = useAppStore((state) => state.isMuted)
  const isMutedRef = useRef(isMuted)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const trimmedBufferRef = useRef<AudioBuffer | null>(null)

  useEffect(() => {
    isMutedRef.current = isMuted
  }, [isMuted])

  useEffect(() => {
    // Initialize Web Audio Context for ultra-low latency playback
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioContextClass) return
    const ctx = new AudioContextClass()
    audioCtxRef.current = ctx

    // Pre-decode and remove ANY leading silence from the click sound
    fetch('/click.mp3')
      .then(res => res.arrayBuffer())
      .then(data => ctx.decodeAudioData(data))
      .then(decoded => {
        // Find exact start of audible sound (strip silence)
        const channelData = decoded.getChannelData(0)
        let startSample = 0
        const threshold = 0.015

        for (let i = 0; i < channelData.length; i++) {
          if (Math.abs(channelData[i]) > threshold) {
            // Keep a tiny 15-sample lead-in to prevent digital click artifact
            startSample = Math.max(0, i - 15)
            break
          }
        }

        // Create buffer trimmed right at the impact of the sound
        const trimmedLength = Math.max(1, decoded.length - startSample)
        const trimmed = ctx.createBuffer(
          decoded.numberOfChannels,
          trimmedLength,
          decoded.sampleRate
        )

        for (let ch = 0; ch < decoded.numberOfChannels; ch++) {
          const oldData = decoded.getChannelData(ch)
          const newData = trimmed.getChannelData(ch)
          for (let i = 0; i < trimmedLength; i++) {
            newData[i] = oldData[i + startSample]
          }
        }

        trimmedBufferRef.current = trimmed
      })
      .catch(() => {})

    // Play instantly on the exact moment the button/mouse goes down
    let lastPlayTime = 0
    const triggerInstantSound = () => {
      if (isMutedRef.current) return
      if (!audioCtxRef.current || !trimmedBufferRef.current) return

      // Throttle double-firing if both pointerdown and mousedown fire (within 30ms)
      const now = performance.now()
      if (now - lastPlayTime < 30) return
      lastPlayTime = now

      // Resume context if suspended
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume()
      }

      const source = audioCtxRef.current.createBufferSource()
      source.buffer = trimmedBufferRef.current

      const gain = audioCtxRef.current.createGain()
      gain.gain.value = 0.65

      source.connect(gain)
      gain.connect(audioCtxRef.current.destination)
      source.start(0)
    }

    // pointerdown fires immediately on touch/mouse contact
    document.addEventListener('pointerdown', triggerInstantSound, { capture: true, passive: true })

    return () => {
      document.removeEventListener('pointerdown', triggerInstantSound, { capture: true })
    }
  }, [])

  return null
}
