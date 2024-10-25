'use client'

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  ChevronRight,
  Home,
  Image as ImageIcon,
  Video,
  Scissors,
  FolderOpen,
  Settings,
  Sparkles,
  Zap,
  Smile,
  MessageSquare,
  Heart,
} from 'lucide-react';
import Link from 'next/link';
import * as THREE from 'three';
import CELLS from 'vanta/dist/vanta.cells.min';
import Image from 'next/image';
import { Runware, IImageInference } from '@runware/sdk-js';

// Replace with your actual API key
const RUNWARE_API_KEY = 'NJcnXimLw8zmPcLgBsbLJ1qhWQKMuvro';
const runware = new Runware({ apiKey: RUNWARE_API_KEY });

// LMStudio API endpoint (replace with actual endpoint if different)
const LMSTUDIO_API_URL = "http://localhost:1234/v1";

export default function MemeExtremePage() {
  const [memePrompt, setMemePrompt] = useState('');
  const [generatedQuotes, setGeneratedQuotes] = useState('');
  const [generatedMemes, setGeneratedMemes] = useState<Array<{ text: string, imageUrl: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Vanta.js Effects:
  const vantaRef = useRef<HTMLDivElement>(null);
  const [vantaEffect, setVantaEffect] = useState<any>(null);

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

  const generateMemeQuotes = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(LMSTUDIO_API_URL + '/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer lm-studio'
        },
        body: JSON.stringify({
          model: "lmstudio-community/openchat-3.6-8b-20240522-GGUF/openchat-3.6-8b-20240522-Q8_0.gguf",
          messages: [
            {
              role: "system",
              content: `You are the Meme Extreme Master 3000, a cutting-edge AI designed to generate hilarious memes.

Follow this format for each meme:
Narrator: "[Witty or sarcastic phrase]"
[Detailed description of a funny, relatable image that matches the text]

Examples:
Narrator: "When you realize it's Monday and you haven't accomplished anything from last week." 
[A cat lying flat on its back on a couch, staring blankly at the ceiling with a look of existential dread.]

Narrator: "Me trying to act surprised when the workload I procrastinated on is suddenly due tomorrow." 
[A close-up of a dog with wide, guilty eyes, sitting in front of a pile of shredded papers.]

Narrator: "When you say 'just one more episode' but Netflix knows you're lying." 
[A clock showing 3 AM in the background, while a person in pajamas is slumped over on a couch, eyes half-open, with the TV still playing.]

Generate 20 unique, funny, and relatable memes following this format and dont use numbers to list them must be like the Examples.`
            },
            {
              role: "user",
              content: `Generate 20 meme quotes with image descriptions following this prompt: ${memePrompt}. Follow the format as specified in the examples.`
            }
          ],
          temperature: 0.7,
        })
      });

      const data = await response.json();
      setGeneratedQuotes(data.choices[0].message.content);
    } catch (error) {
      console.error('Error generating meme quotes:', error);
      setGeneratedQuotes('Error: Unable to generate meme quotes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateMemeImages = async () => {
    setIsLoading(true);
    try {
      const memes = generatedQuotes.split('\n\n');
      const imagePromises = memes.map(async (meme) => {
        const match = meme.match(/^Narrator:\s*["](.*?)["]\s*\[(.*?)\]$/);
        if (match) {
          const [, text, description] = match;
          const request: IImageInference = {
            positivePrompt: description,
            model: "runware:100@1",
            numberResults: 1,
            negativePrompt: "",
            useCache: false,
            height: 512,
            width: 512,
          };
          const images = await runware.imageInference(request);
          if (images && images.length > 0) {
            return { text: text.trim(), imageUrl: images[0].imageURL };
          }
        }
        return null;
      });
      const generatedImages = (await Promise.all(imagePromises)).filter((meme): meme is { text: string; imageUrl: string } => meme !== null);
      setGeneratedMemes(generatedImages);
    } catch (error) {
      console.error('Error generating meme images:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#211059] text-white overflow-hidden">
      {/* Vanta.js Background */}
      <div ref={vantaRef} className="fixed inset-0 pointer-events-none" />

      {/* Main Content */}
      <div className="relative z-10 flex w-full">
        {/* Sidebar */}
        <aside className="w-64 bg-[#161b22] bg-opacity-60 backdrop-blur-md p-4 flex flex-col rounded-tr-lg rounded-br-lg">
          <div className="flex items-center mb-8">
            <svg
              className="w-8 h-8 mr-2"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M50 0L93.3 25V75L50 100L6.7 75V25L50 0Z"
                fill="url(#gradient)"
              />
              <defs>
                <linearGradient
                  id="gradient"
                  x1="0"
                  y1="0"
                  x2="100"
                  y2="100"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#4B0082" />
                  <stop offset="1" stopColor="#0000FF" />
                </linearGradient>
              </defs>
            </svg>
            <h1 className="text-xl font-bold bg-gradient-to-r from-[#4B0082] to-[#0000FF] text-transparent bg-clip-text">
              PIXIFY AI
            </h1>
          </div>
          <nav className="flex-1">
            <Link
              href="#"
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
                href="#"
                className="flex items-center p-2 hover:bg-[#21262d] hover:bg-opacity-60 hover:backdrop-blur-md rounded-lg mb-1"
              >
                <Video className="mr-2" size={20} />
                AI Videos
              </Link>
              <Link
                href="#"
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
              <h2 className="text-sm text-gray-400 mb-2">AI tools</h2>
              <Link
                href="https://216.230.232.229:7860/"
                className="flex items-center p-2 hover:bg-[#21262d] hover:bg-opacity-60 hover:backdrop-blur-md rounded-lg"
              >
                <Scissors className="mr-2" size={20} />
                Pixify Webui
              </Link>
            </div>
            <Link
              href="#"
              className="flex items-center p-2 hover:bg-[#21262d] hover:bg-opacity-60 hover:backdrop-blur-md rounded-lg"
            >
              <FolderOpen className="mr-2" size={20} />
              My Assets
            </Link>
            <Link
              href="https://www.pixifyai.art/"
              className="flex items-center p-2 hover:bg-[#21262d] hover:bg-opacity-60 hover:backdrop-blur-md rounded-lg mb-1"
            >
              <MessageSquare className="mr-2" size={20} />
              AI Social
            </Link>
          </nav>
          <div className="mt-auto">
            <Button variant="outline" size="sm" className="w-full rounded-lg">
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
              <Button
                variant="outline"
                size="sm"
                className="text-[#8A2BE2] border-[#8A2BE2] hover:bg-[#8A2BE2]/10 rounded-md"
              >
                Purchase a membership plan to get credits
              </Button>
              <Button variant="ghost" size="icon" className="ml-2">
                <Settings className="text-gray-400" />
              </Button>
              <div className="w-8 h-8 bg-gradient-to-r from-[#4B0082] to-[#0000FF] rounded-full ml-2"></div>
            </div>
          </header>

          <section className="mb-12 relative overflow-hidden">
            <h2 className="text-[#8A2BE2] mb-2">
              PIXIFY AI, UNLEASH YOUR CREATIVITY
            </h2>
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-[#4B0082] to-[#0000FF] text-transparent bg-clip-text">
              MemeExtreme
            </h1>
            <div className="absolute top-0 right-0 w-96 h-96">
              <div className="relative w-full h-full">
                <div
                  className="absolute inset-0 bg-gradient-to-r from-[#4B0082] to-[#0000FF] rounded-full opacity-20 animate-pulse"
                  style={{ animationDuration: '4s' }}
                ></div>
                <div className="absolute inset-0 border-2 border-[#8A2BE2] rounded-full"></div>
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-[#8A2BE2] transform -rotate-45"></div>
              </div>
            </div>
          </section>

          {/* Meme Generation Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {/* Meme Prompt Card */}
            <Card className="bg-[#21262d] bg-opacity-60 backdrop-blur-md p-6 hover:bg-opacity-80 transition-colors duration-300 rounded-lg border border-gray-600/30">
              <h3 className="text-xl font-semibold mb-2 text-[#8A2BE2]">
                Meme Theme/Prompt
              </h3>
              <textarea
                className="w-full bg-gray-800 rounded-md p-2 focus:outline-none mb-4"
                rows={3}
                placeholder="Enter your meme theme or prompt here..."
                value={memePrompt}
                onChange={(e) =>
 setMemePrompt(e.target.value)}
              ></textarea>
              <Button
                onClick={generateMemeQuotes}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#4B0082] to-[#0000FF] text-white font-bold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity duration-300"
              >
                {isLoading ? 'Generating...' : 'Generate Meme Quotes'}
              </Button>
            </Card>

            {/* Generated Quotes Card */}
            <Card className="bg-[#21262d] bg-opacity-60 backdrop-blur-md p-6 hover:bg-opacity-80 transition-colors duration-300 rounded-lg border border-gray-600/30">
              <h3 className="text-xl font-semibold mb-2 text-[#8A2BE2]">
                Generated Meme Quotes
              </h3>
              <textarea
                className="w-full bg-gray-800 rounded-md p-2 focus:outline-none mb-4"
                rows={10}
                value={generatedQuotes}
                onChange={(e) => setGeneratedQuotes(e.target.value)}
                placeholder="Generated meme quotes will appear here..."
              ></textarea>
              <Button
                onClick={generateMemeImages}
                disabled={isLoading || !generatedQuotes}
                className="w-full bg-gradient-to-r from-[#4B0082] to-[#0000FF] text-white font-bold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity duration-300"
              >
                {isLoading ? 'Generating...' : 'Generate Meme Images'}
              </Button>
            </Card>
          </div>

          {/* Generated Memes Section */}
          {generatedMemes.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4 text-[#8A2BE2]">
                Generated Memes
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {generatedMemes.map((meme, index) => (
                  <div
                    key={index}
                    className="bg-[#21262d] bg-opacity-60 backdrop-blur-md p-4 rounded-lg"
                  >
                    <Image
                      src={meme.imageUrl}
                      alt={`Generated Meme ${index + 1}`}
                      width={300}
                      height={300}
                      className="w-full h-auto rounded-lg mb-2"
                    />
                    <p className="text-sm text-center">{meme.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}