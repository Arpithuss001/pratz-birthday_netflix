'use client'

import { useState } from 'react'
import { createProfile, deleteProfile } from '@/actions/profile'
import { createCategory, deleteCategory } from '@/actions/category'
import { createVideo, deleteVideo, updateVideo, toggleVideoCategory } from '@/actions/video'
import { Trash2, Star, Check, Type, Upload } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { useSound } from '@/hooks/useSound'
import { FONT_OPTIONS } from '@/components/FontSelector'

export default function AdminDashboard({ profiles, videos, categories }: any) {
  const [activeTab, setActiveTab] = useState<'profiles'|'videos'|'categories'|'fonts'>('videos')

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex gap-4 mb-8 border-b border-gray-800 pb-4 flex-wrap">
        <button 
          className={`px-4 py-2 font-bold transition ${activeTab === 'videos' ? 'text-[#E50914] border-b-2 border-[#E50914]' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setActiveTab('videos')}
        >
          Videos
        </button>
        <button 
          className={`px-4 py-2 font-bold transition ${activeTab === 'categories' ? 'text-[#E50914] border-b-2 border-[#E50914]' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setActiveTab('categories')}
        >
          Categories (Rows)
        </button>
        <button 
          className={`px-4 py-2 font-bold transition ${activeTab === 'profiles' ? 'text-[#E50914] border-b-2 border-[#E50914]' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setActiveTab('profiles')}
        >
          Profiles
        </button>
        <button 
          className={`px-4 py-2 font-bold transition flex items-center gap-1.5 ${activeTab === 'fonts' ? 'text-[#E50914] border-b-2 border-[#E50914]' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setActiveTab('fonts')}
        >
          <Type className="w-4 h-4" />
          Fonts & Styling
        </button>
      </div>

      <div className="mt-8">
        {activeTab === 'videos' && <VideosTab videos={videos} categories={categories} />}
        {activeTab === 'categories' && <CategoriesTab categories={categories} />}
        {activeTab === 'profiles' && <ProfilesTab profiles={profiles} />}
        {activeTab === 'fonts' && <FontsTab />}
      </div>
    </div>
  )
}

function ProfilesTab({ profiles }: { profiles: any[] }) {
  const [name, setName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      if (data.success) {
        setAvatarUrl(data.url)
      } else {
        alert('Upload failed: ' + data.error)
      }
    } catch (error) {
      alert('Upload error')
    } finally {
      setUploading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    await createProfile({ name, avatarUrl })
    setName('')
    setAvatarUrl('')
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Add Profile</h2>
      <form onSubmit={handleCreate} className="flex flex-col gap-4 mb-8 bg-[#222] p-4 rounded">
        <div className="flex gap-4">
          <input 
            required placeholder="Name" className="p-2 bg-[#333] rounded flex-1 text-white border-none"
            value={name} onChange={e => setName(e.target.value)}
          />
          <div className="flex flex-1 gap-2">
            <input 
              placeholder="Avatar URL" className="p-2 bg-[#333] rounded flex-1 text-white border-none"
              value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)}
            />
            <input type="file" accept="image/*" className="hidden" id="avatar-upload" onChange={handleUpload} />
            <label htmlFor="avatar-upload" className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded cursor-pointer whitespace-nowrap text-sm flex items-center gap-1.5 transition">
              <Upload className="w-4 h-4" />
              {uploading ? 'Uploading...' : 'Upload Photo'}
            </label>
          </div>
        </div>
        <button type="submit" className="bg-[#E50914] px-4 py-2 rounded font-bold text-white w-full max-w-xs self-end hover:bg-[#c10710] transition">Add Profile</button>
      </form>

      <h2 className="text-xl font-bold mb-4">Existing Profiles</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {profiles.map(p => (
          <div key={p.id} className="bg-[#222] p-4 rounded flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.avatarUrl || '/placeholder.png'} alt={p.name} className="w-10 h-10 rounded object-cover" />
              <span>{p.name}</span>
            </div>
            <button onClick={() => deleteProfile(p.id)} className="text-red-500 hover:text-red-400">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

function CategoriesTab({ categories }: { categories: any[] }) {
  const [name, setName] = useState('')

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    await createCategory({ name })
    setName('')
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Add Category (Row)</h2>
      <form onSubmit={handleCreate} className="flex gap-4 mb-8 bg-[#222] p-4 rounded">
        <input 
          required placeholder="Category Name (e.g. Birthday Special)" className="p-2 bg-[#333] rounded flex-1 text-white border-none"
          value={name} onChange={e => setName(e.target.value)}
        />
        <button type="submit" className="bg-[#E50914] px-4 py-2 rounded font-bold text-white hover:bg-[#c10710] transition">Add</button>
      </form>

      <h2 className="text-xl font-bold mb-4">Existing Categories</h2>
      <div className="space-y-2">
        {categories.map(c => (
          <div key={c.id} className="bg-[#222] p-4 rounded flex justify-between">
            <span>{c.name}</span>
            <button onClick={() => deleteCategory(c.id)} className="text-red-500 hover:text-red-400">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

function VideosTab({ videos, categories }: { videos: any[], categories: any[] }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [thumbnailUrl, setThumbnailUrl] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [selectedCats, setSelectedCats] = useState<string[]>(() => categories.map((c: any) => c.id))
  const [isFeatured, setIsFeatured] = useState(false)
  
  const [uploadingThumb, setUploadingThumb] = useState(false)
  const [uploadingVideo, setUploadingVideo] = useState(false)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'thumbnail'|'video') => {
    const file = e.target.files?.[0]
    if (!file) return

    if (type === 'thumbnail') setUploadingThumb(true)
    if (type === 'video') setUploadingVideo(true)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      if (data.success) {
        if (type === 'thumbnail') setThumbnailUrl(data.url)
        if (type === 'video') setVideoUrl(data.url)
      } else {
        alert('Upload failed: ' + data.error)
      }
    } catch (error) {
      alert('Upload error')
    } finally {
      if (type === 'thumbnail') setUploadingThumb(false)
      if (type === 'video') setUploadingVideo(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    await createVideo({
      title, 
      description, 
      thumbnailUrl, 
      videoUrl, 
      genre: isFeatured ? 'featured' : undefined,
      categoryIds: selectedCats.length > 0 ? selectedCats : categories.map((c: any) => c.id)
    })
    setTitle(''); setDescription(''); setThumbnailUrl(''); setVideoUrl(''); setSelectedCats(categories.map((c: any) => c.id)); setIsFeatured(false)
  }

  const handleToggleFeatured = async (v: any) => {
    const newGenre = v.genre === 'featured' ? '' : 'featured'
    await updateVideo(v.id, { genre: newGenre })
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Add Video</h2>
      <form onSubmit={handleCreate} className="bg-[#222] p-4 rounded flex flex-col gap-4 mb-8">
        <input 
          required placeholder="Title" className="p-2 bg-[#333] rounded text-white border-none"
          value={title} onChange={e => setTitle(e.target.value)}
        />
        <textarea 
          required placeholder="Description" className="p-2 bg-[#333] rounded text-white border-none min-h-[100px]"
          value={description} onChange={e => setDescription(e.target.value)}
        />
        
        <div className="flex gap-4 flex-col md:flex-row">
          <div className="flex-1">
            <label className="block text-sm mb-1 text-gray-400">Thumbnail (URL or Upload Image)</label>
            <div className="flex gap-2">
              <input 
                required placeholder="Thumbnail URL or click Upload" className="p-2 bg-[#333] rounded flex-1 text-white border-none"
                value={thumbnailUrl} onChange={e => setThumbnailUrl(e.target.value)}
              />
              <input type="file" accept="image/*" className="hidden" id="thumb-upload" onChange={e => handleUpload(e, 'thumbnail')} />
              <label htmlFor="thumb-upload" className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded cursor-pointer whitespace-nowrap text-sm flex items-center gap-1.5 transition">
                <Upload className="w-4 h-4" />
                {uploadingThumb ? 'Uploading...' : 'Upload Photo'}
              </label>
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-sm mb-1 text-gray-400">Video (URL, YouTube or Upload Video)</label>
            <div className="flex gap-2">
              <input 
                required placeholder="Video URL or click Upload" className="p-2 bg-[#333] rounded flex-1 text-white border-none"
                value={videoUrl} onChange={e => setVideoUrl(e.target.value)}
              />
              <input type="file" accept="video/*" className="hidden" id="video-upload" onChange={e => handleUpload(e, 'video')} />
              <label htmlFor="video-upload" className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded cursor-pointer whitespace-nowrap text-sm flex items-center gap-1.5 transition">
                <Upload className="w-4 h-4" />
                {uploadingVideo ? 'Uploading...' : 'Upload Video'}
              </label>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm mb-2 text-gray-400">Categories (Rows where this video appears)</label>
          <div className="flex gap-4 flex-wrap">
            {categories.map(c => (
              <label key={c.id} className="flex items-center gap-2 cursor-pointer bg-[#333] px-3 py-1.5 rounded text-sm">
                <input 
                  type="checkbox" 
                  checked={selectedCats.includes(c.id)}
                  onChange={e => {
                    if(e.target.checked) setSelectedCats([...selectedCats, c.id])
                    else setSelectedCats(selectedCats.filter(id => id !== c.id))
                  }}
                />
                {c.name}
              </label>
            ))}
          </div>
        </div>

        <div className="pt-2 border-t border-gray-700/60 flex items-center justify-between flex-wrap gap-4">
          <label className="flex items-center gap-2 cursor-pointer bg-[#2a2a2a] hover:bg-[#333] px-3 py-2 rounded text-sm transition">
            <input 
              type="checkbox" 
              checked={isFeatured}
              onChange={e => setIsFeatured(e.target.checked)}
            />
            <span className="text-yellow-400 font-semibold">★ Feature in Top Hero Banner</span>
            <span className="text-xs text-gray-400">(Leave unchecked to show only in row)</span>
          </label>

          <button type="submit" className="bg-[#E50914] px-6 py-2.5 rounded font-bold text-white hover:bg-[#c10710] transition">
            Save Video
          </button>
        </div>
      </form>

      <h2 className="text-xl font-bold mb-4">Existing Videos</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {videos.map(v => (
          <div key={v.id} className="bg-[#222] p-4 rounded flex gap-4 items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={v.thumbnailUrl || '/placeholder.png'} alt={v.title} className="w-32 aspect-video object-cover rounded bg-black shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold truncate">{v.title}</h3>
                {v.genre === 'featured' && (
                  <span className="text-[10px] bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 px-1.5 py-0.5 rounded font-bold shrink-0">
                    FEATURED
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 line-clamp-2 mt-1">{v.description}</p>
              
              {/* Category tags */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className="text-[11px] text-gray-400">Category:</span>
                {categories.map((c: any) => {
                  const isInCat = v.categories?.some((cv: any) => cv.categoryId === c.id)
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => toggleVideoCategory(v.id, c.id)}
                      className={`text-[11px] px-2 py-0.5 rounded border transition flex items-center gap-1 ${
                        isInCat 
                          ? 'bg-red-950/80 text-red-300 border-red-700/80 hover:bg-red-900' 
                          : 'bg-[#2a2a2a] text-gray-500 border-gray-700 hover:text-gray-300'
                      }`}
                      title={isInCat ? `Remove from ${c.name}` : `Add to ${c.name}`}
                    >
                      {isInCat && '✓ '}
                      {c.name}
                    </button>
                  )
                })}
              </div>

              <button 
                type="button"
                onClick={() => handleToggleFeatured(v)}
                className={`mt-2 text-xs flex items-center gap-1 px-2 py-1 rounded transition ${
                  v.genre === 'featured' 
                    ? 'bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30' 
                    : 'bg-[#333] text-gray-400 hover:text-white'
                }`}
              >
                <Star className="w-3.5 h-3.5" />
                {v.genre === 'featured' ? 'Remove from Hero' : 'Feature on Hero'}
              </button>
            </div>
            <button onClick={() => deleteVideo(v.id)} className="text-red-500 hover:text-red-400 p-2 shrink-0" title="Delete video">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

function FontsTab() {
  const fontFamily = useAppStore((state) => state.fontFamily)
  const setFontFamily = useAppStore((state) => state.setFontFamily)
  const { playPop } = useSound()
  const [justSaved, setJustSaved] = useState(false)

  const handleSelectFont = (id: string) => {
    playPop()
    setFontFamily(id)
    setJustSaved(true)
    setTimeout(() => setJustSaved(false), 2500)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Type className="w-6 h-6 text-[#E50914]" />
            Website Heading & Title Fonts
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Select the typography style for hero titles ("Birthday Special"), row headers, and video modals across the website.
          </p>
        </div>

        {justSaved && (
          <div className="bg-green-950/80 border border-green-700/80 text-green-300 text-xs px-3.5 py-1.5 rounded-full flex items-center gap-1.5 animate-in fade-in">
            <Check className="w-4 h-4 text-green-400" />
            <span className="font-semibold">Font updated across website!</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {FONT_OPTIONS.map((f) => {
          const isSelected = f.id === fontFamily
          return (
            <div
              key={f.id}
              onClick={() => handleSelectFont(f.id)}
              className={`p-5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected 
                  ? 'bg-[#E50914]/10 border-[#E50914] shadow-lg shadow-[#E50914]/10 ring-1 ring-[#E50914]' 
                  : 'bg-[#222] border-gray-800 hover:border-gray-600 hover:bg-[#282828]'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-bold text-white text-base">{f.name}</h3>
                  <span className="text-xs text-gray-400">Font Family: {f.font}</span>
                </div>
                {isSelected ? (
                  <span className="text-xs font-bold bg-[#E50914] text-white px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Active Font
                  </span>
                ) : (
                  <button 
                    type="button" 
                    className="text-xs text-gray-400 hover:text-white bg-[#333] px-3 py-1 rounded-full transition"
                  >
                    Apply Font
                  </button>
                )}
              </div>

              {/* Live Preview Box */}
              <div className="bg-black/70 p-4 rounded-lg border border-gray-800/80 mt-2">
                <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">Live Preview</p>
                <p className={`text-3xl text-white ${f.id}`}>
                  {f.sample}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Celebrating Special Moments • Stream Live
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
