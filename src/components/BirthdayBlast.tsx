'use client'

import { useEffect, useRef, useState } from 'react'
import { Sparkles, X, Heart } from 'lucide-react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  color: string
  size: number
  shape: 'rect' | 'circle' | 'star' | 'heart'
  rotation: number
  rotationSpeed: number
  wobble: number
  wobbleSpeed: number
  alpha: number
  decay: number
}

const LUXURY_COLORS = [
  '#FFD700', // Gold
  '#FFB800', // Amber Gold
  '#FFE680', // Champagne Gold
  '#E50914', // Netflix Ruby Red
  '#FF2E63', // Hot Pink
  '#FF6584', // Rose Gold
  '#FFB6C1', // Light Pink
  '#FFFFFF', // Diamond White
  '#C77DFF', // Soft Purple
  '#E0AAFF', // Lilac
]

function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) {
  let rot = (Math.PI / 2) * 3
  let x = cx
  let y = cy
  const step = Math.PI / spikes

  ctx.beginPath()
  ctx.moveTo(cx, cy - outerRadius)
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius
    y = cy + Math.sin(rot) * outerRadius
    ctx.lineTo(x, y)
    rot += step

    x = cx + Math.cos(rot) * innerRadius
    y = cy + Math.sin(rot) * innerRadius
    ctx.lineTo(x, y)
    rot += step
  }
  ctx.lineTo(cx, cy - outerRadius)
  ctx.closePath()
  ctx.fill()
}

function drawHeart(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.beginPath()
  const topCurveHeight = size * 0.3
  ctx.moveTo(x, y + topCurveHeight)
  ctx.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, y + topCurveHeight)
  ctx.bezierCurveTo(x - size / 2, y + (size + topCurveHeight) / 2, x, y + (size + topCurveHeight) / 1.4, x, y + size)
  ctx.bezierCurveTo(x, y + (size + topCurveHeight) / 1.4, x + size / 2, y + (size + topCurveHeight) / 2, x + size / 2, y + topCurveHeight)
  ctx.bezierCurveTo(x + size / 2, y, x, y, x, y + topCurveHeight)
  ctx.closePath()
  ctx.fill()
}

export default function BirthdayBlast() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [visible, setVisible] = useState(true)
  const [animatingOut, setAnimatingOut] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    const particles: Particle[] = []

    // Helper to spawn a blast of particles
    const spawnCannon = (originX: number, originY: number, angleDeg: number, count: number, speedMultiplier = 1) => {
      const angleRad = (angleDeg * Math.PI) / 180
      for (let i = 0; i < count; i++) {
        const spread = ((Math.random() - 0.5) * 55 * Math.PI) / 180
        const finalAngle = angleRad + spread
        const speed = (Math.random() * 18 + 14) * speedMultiplier
        const shapes: ('rect' | 'circle' | 'star' | 'heart')[] = ['rect', 'rect', 'circle', 'star', 'heart']

        particles.push({
          x: originX,
          y: originY,
          vx: Math.cos(finalAngle) * speed,
          vy: Math.sin(finalAngle) * speed,
          color: LUXURY_COLORS[Math.floor(Math.random() * LUXURY_COLORS.length)],
          size: Math.random() * 8 + 6,
          shape: shapes[Math.floor(Math.random() * shapes.length)],
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 12,
          wobble: Math.random() * Math.PI * 2,
          wobbleSpeed: Math.random() * 0.1 + 0.05,
          alpha: 1,
          decay: Math.random() * 0.003 + 0.003,
        })
      }
    }

    // Wave 1: Immediate Left & Right Cannons
    spawnCannon(width * 0.05, height * 0.95, -60, 65, 1.1)
    spawnCannon(width * 0.95, height * 0.95, -120, 65, 1.1)
    // Center sparkling pop
    spawnCannon(width * 0.5, height * 0.65, -90, 45, 0.8)

    // Wave 2: Follow-up celebratory bursts at 300ms
    const timer1 = setTimeout(() => {
      spawnCannon(width * 0.15, height * 0.9, -50, 45, 1.0)
      spawnCannon(width * 0.85, height * 0.9, -130, 45, 1.0)
    }, 300)

    // Wave 3: Final golden shimmer burst at 650ms
    const timer2 = setTimeout(() => {
      spawnCannon(width * 0.5, height * 0.5, -90, 50, 0.7)
    }, 650)

    let animId: number
    const gravity = 0.38
    const drag = 0.982

    const render = () => {
      ctx.clearRect(0, 0, width, height)

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.vx *= drag
        p.vy *= drag
        p.vy += gravity
        p.x += p.vx
        p.y += p.vy
        p.rotation += p.rotationSpeed
        p.wobble += p.wobbleSpeed
        p.alpha -= p.decay

        if (p.alpha <= 0 || p.y > height + 50) {
          particles.splice(i, 1)
          continue
        }

        ctx.save()
        ctx.globalAlpha = Math.max(0, p.alpha)
        ctx.fillStyle = p.color
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rotation * Math.PI) / 180)
        // 3D perspective flip illusion via wobble
        const scaleX = Math.cos(p.wobble)

        if (p.shape === 'rect') {
          ctx.scale(scaleX, 1)
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2)
        } else if (p.shape === 'circle') {
          ctx.beginPath()
          ctx.arc(0, 0, p.size / 2.5, 0, Math.PI * 2)
          ctx.fill()
        } else if (p.shape === 'star') {
          ctx.scale(scaleX, 1)
          drawStar(ctx, 0, 0, 5, p.size, p.size / 2)
        } else if (p.shape === 'heart') {
          ctx.scale(scaleX, 1)
          drawHeart(ctx, -p.size / 2, -p.size / 2, p.size)
        }

        ctx.restore()
      }

      if (particles.length > 0) {
        animId = requestAnimationFrame(render)
      } else {
        ctx.clearRect(0, 0, width, height)
      }
    }

    animId = requestAnimationFrame(render)

    // Auto-dismiss the greeting banner after 4.5 seconds
    const timerOut = setTimeout(() => {
      setAnimatingOut(true)
      setTimeout(() => setVisible(false), 800)
    }, 4500)

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animId)
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timerOut)
    }
  }, [])

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex flex-col items-center justify-start pt-16 sm:pt-20 px-4">
      {/* Fullscreen particle canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-10" />

      {/* Classy Glassmorphic Birthday Banner */}
      <div
        className={`pointer-events-auto relative z-20 transition-all duration-700 ease-out transform ${
          animatingOut
            ? 'opacity-0 -translate-y-8 scale-95'
            : 'opacity-100 translate-y-0 scale-100 animate-in fade-in zoom-in-95 duration-500'
        }`}
      >
        <div className="relative bg-gradient-to-r from-black/85 via-[#1a0a10]/90 to-black/85 backdrop-blur-xl border border-pink-500/30 hover:border-pink-500/60 rounded-3xl px-6 py-4 sm:px-10 sm:py-5 shadow-[0_0_50px_rgba(255,46,99,0.35)] text-center max-w-lg mx-auto flex items-center gap-4">
          
          {/* Close Button */}
          <button
            onClick={() => {
              setAnimatingOut(true)
              setTimeout(() => setVisible(false), 500)
            }}
            className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 text-white/50 hover:text-white bg-white/5 hover:bg-white/15 p-1 rounded-full transition-colors cursor-pointer"
            aria-label="Dismiss greeting"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Left Icon Badge */}
          <div className="shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-[#E50914] via-[#FF2E63] to-[#FFB800] p-[1px] shadow-lg flex items-center justify-center">
            <div className="w-full h-full bg-black/60 rounded-2xl flex items-center justify-center">
              <span className="text-2xl sm:text-3xl select-none">🎉</span>
            </div>
          </div>

          {/* Text Content */}
          <div className="text-left pr-4">
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold tracking-wider uppercase text-pink-400">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-spin" style={{ animationDuration: '3s' }} />
              <span>Birthday Celebration</span>
              <Heart className="w-3.5 h-3.5 fill-pink-500 text-pink-500 inline ml-0.5" />
            </div>
            
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-pink-100 to-yellow-200 tracking-tight drop-shadow-sm mt-0.5">
              Happy Birthday Cutiee! 🎀
            </h2>
            
            <p className="text-xs sm:text-sm text-gray-300 mt-0.5 line-clamp-1">
              May your day be filled with magic, love & endless smiles ✨
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
