'use client'

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Home,
  Image as ImageIcon,
  Video,
  FolderOpen,
  Settings,
  Zap,
  Smile,
  MessageSquare,
  Heart,
  Terminal,
} from 'lucide-react';
import Link from 'next/link';
import * as THREE from 'three';
import CELLS from 'vanta/dist/vanta.cells.min';

export default function AgentCoderPage() {
  const [browserURL] = useState('https://pixifyai.art/4g3ntc0d3r');  // Added trailing slash
  const browserRef = useRef<HTMLIFrameElement>(null);

  const vantaRef = useRef<HTMLDivElement>(null);
  const [vantaEffect, setVantaEffect] = useState<any>(null);

  // Vanta.js effects
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
        minHeight: 200.0,
        minWidth: 200.0,
      });
      setVantaEffect(effect);
    }
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);

  useEffect(() => {
    const handleResize = () => {
      if (vantaEffect) {
        vantaEffect.resize();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [vantaEffect]);

  return (
    <div className="flex h-screen bg-[#211059] text-white overflow-hidden">
      {/* Vanta.js Background */}
      <div ref={vantaRef} className="fixed inset-0 pointer-events-none" />

      {/* Main Content */}
      <div className="relative z-10 flex w-full">
        {/* Sidebar */}
        <aside className="w-64 bg-[#161b22] bg-opacity-60 backdrop-blur-md p-4 flex flex-col rounded-tr-lg rounded-br-lg">
          <div className="flex items-center mb-8">
            <div className="flex items-center mb-8">
              <img
                src="/pixify.svg"
                alt="Pixify AI Logo"
                className="w-8 h-8 mr-2"
                style={{ backgroundColor: 'transparent' }}
              />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-[#4B0082] to-[#0000FF] text-transparent bg-clip-text">4g3nt c0d3r</h1>
          </div>
          <nav className="flex-1">
            <Link
              href="http://localhost:3000/"
              className="flex items-center p-2 bg-[#21262d] bg-opacity-60 backdrop-blur-md rounded-lg mb-2 text-[#8A2BE2]"
            >
              <Home className="mr-2" size={20} />
              Home
            </Link>
            <div className="mb-4">
              <h2 className="text-sm text-gray-400 mb-2">AI Generation</h2>
              <Link
                href="/ai-images"
                className="flex items-center p-2 hover:bg-[#21262d] hover:bg-opacity-60 hover:backdrop-blur-md rounded-lg mb-1"
              >
                <ImageIcon className="mr-2" size={20} />
                AI Images
              </Link>
              <Link
                href="/ai-videos"
                className="flex items-center p-2 hover:bg-[#21262d] hover:bg-opacity-60 hover:backdrop-blur-md rounded-lg mb-1"
              >
                <Video className="mr-2" size={20} />
                AI Videos
              </Link>
              <Link
                href="/shorteezy"
                className="flex items-center p-2 hover:bg-[#21262d] hover:bg-opacity-60 hover:backdrop-blur-md rounded-lg mb-1"
              >
                <Zap className="mr-2" size={20} />
                Shorteezy
              </Link>
              <Link
                href="/meme-extreme"
                className="flex items-center p-2 hover:bg-[#21262d] hover:bg-opacity-60 hover:backdrop-blur-md rounded-lg mb-1"
              >
                <Smile className="mr-2" size={20} />
                MemeExtreme
              </Link>
              <Link
                href="https://pixify-chat.vercel.app/"
                className="flex items-center p-2 hover:bg-[#21262d] hover:bg-opacity-60 hover:backdrop-blur-md rounded-lg mb-1"
              >
                <MessageSquare className="mr-2" size={20} />
                LLM Chat
              </Link>
            </div>
            <div className="mb-4">
              <h2 className="text-sm text-gray-400 mb-2">AI Tools</h2>
              <Link
                href="https://216.230.232.229:7860/"
                className="flex items-center p-2 hover:bg-[#21262d] hover:bg-opacity-60 hover:backdrop-blur-md rounded-lg"
              >
                <Settings className="mr-2" size={20} />
                Pixify Webui
              </Link>
            </div>
            <Link
              href="/4g3nt-c0d3r"
              className="flex items-center p-2 hover:bg-[#21262d] hover:bg-opacity-60 hover:backdrop-blur-md rounded-lg mb-1"
            >
              <Terminal className="mr-2" size={20} />
              4g3nt c0d3r
            </Link>
            <Link
              href="https://www.pixifyai.art/"
              className="flex items-center p-2 hover:bg-[#21262d] hover:bg-opacity-60 hover:backdrop-blur-md rounded-lg mb-1"
            >
              <Heart className="mr-2" size={20} />
              AI Social
            </Link>
            <Link
              href="/my-assets"
              className="flex items-center p-2 hover:bg-[#21262d] hover:bg-opacity-60 hover:backdrop-blur-md rounded-lg"
            >
              <FolderOpen className="mr-2" size={20} />
              My Assets
            </Link>
          </nav>
          <div className="mt-auto">
            <Button variant="outline" size="sm" className="w-full rounded-lg">
              Apply for API
            </Button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 flex flex-col">
          <header className="flex justify-between items-center p-4 bg-[#161b22] bg-opacity-60 backdrop-blur-md">
            <h2 className="text-2xl font-bold">>_</h2>
            <div className="flex items-center">
              <div className="mr-4 flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span>Internet: Connected</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">Token Usage: 2631</span>
              </div>
            </div>
          </header>

          {/* Webview */}
          <div className="flex-1 bg-[#21262d] bg-opacity-60 backdrop-blur-md p-4">
            <iframe
              ref={browserRef}
              src={browserURL}
              className="w-full h-full rounded-lg"
              style={{ minHeight: '600px' }}
              allow="fullscreen"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              title="Embedded Web Content"
            />
          </div>
        </main>
      </div>
    </div>
  );
}