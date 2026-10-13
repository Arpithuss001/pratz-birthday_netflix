'use client'

import { useState, useEffect } from 'react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')

  useEffect(() => {
    const auth = localStorage.getItem('admin_auth')
    if (auth === 'true') {
      setIsAuthenticated(true)
    }
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === 'PratzBday@2610') {
      localStorage.setItem('admin_auth', 'true')
      setIsAuthenticated(true)
    } else {
      alert('Incorrect password')
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center text-white p-4">
        <form onSubmit={handleLogin} className="bg-[#222] p-8 rounded-md w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6">Admin Access</h2>
          <input 
            type="password" 
            placeholder="Enter Admin Password" 
            className="w-full p-3 bg-[#333] rounded border-none mb-4 text-white focus:outline-none focus:ring-2 focus:ring-[#E50914]"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="w-full bg-[#E50914] text-white p-3 rounded font-bold hover:bg-[#c10710]">
            Enter
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#141414] text-white flex flex-col">
      <header className="bg-black p-4 flex justify-between items-center border-b border-gray-800">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/netflix-logo.png" alt="Netflix" className="h-7 object-contain" />
          <span className="text-xs uppercase tracking-widest text-gray-400 font-bold border-l border-gray-700 pl-3">Admin</span>
        </div>
        <div className="flex items-center space-x-4">
          <a href="/browse" className="hover:underline text-gray-400 hover:text-white text-sm">Back to Site</a>
          <button 
            onClick={() => {
              localStorage.removeItem('admin_auth')
              setIsAuthenticated(false)
            }}
            className="text-sm bg-gray-800 px-3 py-1 rounded hover:bg-gray-700"
          >
            Logout
          </button>
        </div>
      </header>
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  )
}
