'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronRight, Home, Image as ImageIcon, Video, Scissors, FolderOpen, Settings, Sparkles, Zap, Smile, MessageSquare, Heart } from "lucide-react"
import Link from "next/link"
import * as THREE from 'three'
import CELLS from 'vanta/dist/vanta.cells.min'

export default function PixifyAIFrontend() {
  const [activeTab, setActiveTab] = useState('gallery')
  const vantaRef = useRef<HTMLDivElement>(null)
  const [vantaEffect, setVantaEffect] = useState<any>(null)

  useEffect(() => {
    if (!vantaEffect && vantaRef.current) {
      const effect = CELLS({
        el: vantaRef.current,
        THREE: THREE,
        color1: 0x2c1674,
        color2: 0x070985,
        size: 1.5,
        speed: 1,
        scale: 1,
        minHeight: 200.00,
        minWidth: 200.00,
      })
      setVantaEffect(effect)
    }
    return () => {
      if (vantaEffect) vantaEffect.destroy()
    }
  }, [vantaEffect])

  useEffect(() => {
    const handleResize = () => {
      if (vantaEffect) {
        vantaEffect.resize()
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [vantaEffect])

  return (
    <div className="flex h-screen bg-[#211059] text-white overflow-hidden">
      {/* Vanta.js Background */}
      <div ref={vantaRef} className="fixed inset-0 pointer-events-none" />

      {/* Main Content */}
      <div className="relative z-10 flex w-full">
        {/* Sidebar */}
        <aside className="w-64 bg-[#161b22] bg-opacity-60 backdrop-blur-md p-4 flex flex-col">
          <div className="flex items-center mb-8">
            <svg className="w-8 h-8 mr-2" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M50 0L93.3 25V75L50 100L6.7 75V25L50 0Z" fill="url(#gradient)" />
              <defs>
                <linearGradient id="gradient" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#4B0082" />
                  <stop offset="1" stopColor="#0000FF" />
                </linearGradient>
              </defs>
            </svg>
            <h1 className="text-xl font-bold bg-gradient-to-r from-[#4B0082] to-[#0000FF] text-transparent bg-clip-text">PIXIFY AI</h1>
          </div>
          <nav className="flex-1">
            <Link href="#" className="flex items-center p-2 bg-[#21262d] bg-opacity-60 backdrop-blur-md rounded-lg mb-2 text-[#8A2BE2]">
              <Home className="mr-2" size={20} />
              Home
            </Link>
            <div className="mb-4">
              <h2 className="text-sm text-gray-400 mb-2">AI Generation</h2>
              <Link href="#" className="flex items-center p-2 hover:bg-[#21262d] hover:bg-opacity-60 hover:backdrop-blur-md rounded-lg mb-1">
                <ImageIcon className="mr-2" size={20} />
                AI Images
              </Link>
              <Link href="#" className="flex items-center p-2 hover:bg-[#21262d] hover:bg-opacity-60 hover:backdrop-blur-md rounded-lg mb-1">
                <Video className="mr-2" size={20} />
                AI Videos
              </Link>
              <Link href="#" className="flex items-center p-2 hover:bg-[#21262d] hover:bg-opacity-60 hover:backdrop-blur-md rounded-lg mb-1">
                <Zap className="mr-2" size={20} />
                Shorteezy
              </Link>
              <Link href="#" className="flex items-center p-2 hover:bg-[#21262d] hover:bg-opacity-60 hover:backdrop-blur-md rounded-lg mb-1">
                <Smile className="mr-2" size={20} />
                MemeExtreme
              </Link>
              <Link href="#" className="flex items-center p-2 hover:bg-[#21262d] hover:bg-opacity-60 hover:backdrop-blur-md rounded-lg mb-1">
                <MessageSquare className="mr-2" size={20} />
                LLM Chat
              </Link>
            </div>
            <div className="mb-4">
              <h2 className="text-sm text-gray-400 mb-2">AI Editing</h2>
              <Link href="#" className="flex items-center p-2 hover:bg-[#21262d] hover:bg-opacity-60 hover:backdrop-blur-md rounded-lg">
                <Scissors className="mr-2" size={20} />
                Video Editor
              </Link>
            </div>
            <Link href="#" className="flex items-center p-2 hover:bg-[#21262d] hover:bg-opacity-60 hover:backdrop-blur-md rounded-lg">
              <FolderOpen className="mr-2" size={20} />
              My Assets
            </Link>
          </nav>
          <div className="mt-auto">
            <Button variant="outline" size="sm" className="w-full">
              Apply for API
            </Button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-8 overflow-auto">
          <header className="flex justify-between items-center mb-8">
            <div></div>
            <div className="flex items-center">
              <span className="mr-4 text-[#8A2BE2]">🟣 66</span>
              <Button variant="outline" size="sm" className="text-[#8A2BE2] border-[#8A2BE2] hover:bg-[#8A2BE2]/10">
                Purchase a membership plan to get credits
              </Button>
              <Button variant="ghost" size="icon" className="ml-2">
                <Settings className="text-gray-400" />
              </Button>
              <div className="w-8 h-8 bg-gradient-to-r from-[#4B0082] to-[#0000FF] rounded-full ml-2"></div>
            </div>
          </header>

          <section className="mb-12 relative overflow-hidden">
            <h2 className="text-[#8A2BE2] mb-2">PIXIFY AI, UNLEASH YOUR CREATIVITY</h2>
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-[#4B0082] to-[#0000FF] text-transparent bg-clip-text">
              Next-Generation AI Creative Studio
            </h1>
            <div className="absolute top-0 right-0 w-96 h-96">
              <div className="relative w-full h-full">
                <div className="absolute inset-0 bg-gradient-to-r from-[#4B0082] to-[#0000FF] rounded-full opacity-20 animate-pulse" style={{ animationDuration: '4s' }}></div>
                <div className="absolute inset-0 border-2 border-[#8A2BE2] rounded-full"></div>
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-[#8A2BE2] transform -rotate-45"></div>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <Card className="bg-[#21262d] bg-opacity-60 backdrop-blur-md p-6 hover:bg-opacity-80 transition-colors duration-300 rounded-lg">
              <h3 className="text-xl font-semibold mb-2 text-[#8A2BE2]">AI Images</h3>
              <p className="text-gray-400 mb-4">Powered by PIXIFY®</p>
              <Button variant="ghost" className="w-full justify-between text-[#8A2BE2] hover:text-[#9370DB] rounded-md">
                Get started
                <ChevronRight size={20} />
              </Button>
            </Card>
            <Card className="bg-[#21262d] bg-opacity-60 backdrop-blur-md p-6 hover:bg-opacity-80 transition-colors duration-300 rounded-lg">
              <h3 className="text-xl font-semibold mb-2 text-[#8A2BE2]">AI Videos</h3>
              <p className="text-gray-400 mb-4">Powered by PIXIFY®</p>
              <Button variant="ghost" className="w-full justify-between text-[#8A2BE2] hover:text-[#9370DB] rounded-md">
                Get started
                <ChevronRight size={20} />
              </Button>
            </Card>
            <Card className="bg-[#21262d] bg-opacity-60 backdrop-blur-md p-6 hover:bg-opacity-80 transition-colors duration-300 rounded-lg">
              <h3 className="text-xl font-semibold mb-2 text-[#8A2BE2]">Shorteezy</h3>
              <p className="text-gray-400 mb-4">Quick AI-powered shorts</p>
              <Button variant="ghost" className="w-full justify-between text-[#8A2BE2] hover:text-[#9370DB] rounded-md">
                Create now
                <ChevronRight size={20} />
              </Button>
            </Card>
            <Card className="bg-[#21262d] bg-opacity-60 backdrop-blur-md p-6 hover:bg-opacity-80 transition-colors duration-300 rounded-lg">
              <h3 className="text-xl font-semibold mb-2 text-[#8A2BE2]">MemeExtreme</h3>
              <p className="text-gray-400 mb-4">AI meme generation</p>
              <Button variant="ghost" className="w-full justify-between text-[#8A2BE2] hover:text-[#9370DB] rounded-md">
                Generate memes
                <ChevronRight size={20} />
              </Button>
            </Card>
            <Card className="bg-[#21262d] bg-opacity-60 backdrop-blur-md p-6 hover:bg-opacity-80 transition-colors duration-300 rounded-lg">
              <h3 className="text-xl font-semibold mb-2 text-[#8A2BE2]">LLM Chat</h3>
              <p className="text-gray-400 mb-4">AI-powered conversation</p>
              <a
                href="https://pixify-chat.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="ghost" className="w-full justify-between text-[#8A2BE2] hover:text-[#9370DB] rounded-md">
                  Start chatting
                  <ChevronRight size={20} />
                </Button>
              </a>
            </Card>
            <Card className="bg-[#21262d] bg-opacity-60 backdrop-blur-md p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-2 text-[#8A2BE2]">Video Editor</h3>
              <p className="text-gray-400 mb-4">This feature is coming! We'll share with you soon.</p>
            </Card>
          </div>

          <section>
            <div className="flex justify-between items-center mb-4">
              <div>
                <Button
                  variant="link"
                  className={activeTab === 'gallery' ? "text-[#8A2BE2]" : "text-gray-400"}
                  onClick={() => setActiveTab('gallery')}
                >
                  Gallery
                </Button>
                <Button
                  variant="link"
                  className={activeTab === 'latest' ? "text-[#8A2BE2]" : "text-gray-400"}
                  onClick={() => setActiveTab('latest')}
                >
                  Latest
                </Button>
              </div>
              <select className="bg-[#21262d] bg-opacity-60 backdrop-blur-md text-white px-2 py-1 rounded border border-gray-600">
                <option>All</option>
              </select>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* Replace these with your actual image/video URLs and details */}
              {[
                { src: '/videos/hulk.mp4', type: 'video', creator: 'Creator1', likes: 1234 },
                { src: '/videos/eye.mp4', type: 'video', creator: 'Creator2', likes: 5678 },
                { src: '/images/fluxfrog.webp', type: 'image', creator: 'Creator3', likes: 9012 },
                { src: '/videos/darth.mp4', type: 'video', creator: 'Creator4', likes: 1314 },
                { src: '/videos/chucky.mp4', type: 'video', creator: 'Creator5', likes: 1617 },
                { src: '/images/hades.webp', type: 'image', creator: 'Creator6', likes: 1920 },
                { src: '/videos/smile.mp4', type: 'video', creator: 'Creator7', likes: 2223 },
                { src: '/videos/will.mp4', type: 'video', creator: 'Creator8', likes: 2526 },
                { src: '/videos/HulkCWalk.mp4', type: 'video', creator: 'Creator9', likes: 2829 },
                { src: '/videos/darkbunny.mp4', type: 'video', creator: 'Creator10', likes: 3132 },
                { src: '/images/canncreature.webp', type: 'image', creator: 'Creator11', likes: 3435 },
                { src: '/videos/minipuff.mp4', type: 'video', creator: 'Creator12', likes: 3738 }
              ].map((item, i) => (
                <div
                  key={i}
                  className="relative bg-[#21262d] bg-opacity-60 backdrop-blur-md rounded-lg overflow-hidden group transition-transform duration-300 hover:scale-105"
                  style={{ aspectRatio: '3 / 4' }}
                >
                  {/* Render image or video based on type */}
                  {item.type === 'video' ? (
                    <video
                      src={item.src}
                      alt={`Gallery video ${i + 1}`}
                      className="object-cover w-full h-full"
                      autoPlay
                      loop
                      muted
                    />
                  ) : (
                    <img
                      src={item.src}
                      alt={`Gallery image ${i + 1}`}
                      className="object-cover w-full h-full"
                    />
                  )}

                  {/* Overlay with details */}
                  <div className="absolute bottom-0 left-0 w-full p-2 bg-black bg-opacity-50 text-white">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">{item.creator}</span>
                      <div className="flex items-center">
                        <Heart className="mr-1" size={16} />
                        <span className="text-sm">{item.likes}</span>
                      </div>
                    </div>
                    {item.description && (
                      <p className="text-xs mt-1 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* Video icon (if it's a video) */}
                  {item.type === 'video' && (
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <Video className="text-white" size={32} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}