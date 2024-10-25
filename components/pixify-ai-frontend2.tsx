'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronRight, Home, Image as ImageIcon, Video, Scissors, FolderOpen, Settings, Zap, Smile, MessageSquare, Heart, Mic, Terminal, Menu } from "lucide-react";
import Link from "next/link";
import * as THREE from 'three';
import CELLS from 'vanta/dist/vanta.cells.min';
import { motion, AnimatePresence } from 'framer-motion';

// **Replace with your actual LMStudio API key (example key used here, replace with your own):**
const LMSTUDIO_API_KEY = 'lm-studio'; 

// Replace with your actual Fish Audio API key (example key used here, replace with your own): 
const FISH_AUDIO_API_KEY = 'b7b786af1bae44238e9841c86ca793fd'; 

// Voice Aurora AI Component 
const VoiceAuroraAI = ({ isSpeaking }: { isSpeaking: boolean }) => {
  return (
    <div className="fixed top-24 right-16 w-[100px] h-[100px] flex items-center justify-center overflow-hidden"> 
      <div className="absolute inset-0 bg-gradient-radial from-purple-900 to-gray-900"></div>
      <svg className="w-full h-full" viewBox="0 0 100 100">
        {[...Array(20)].map((_, i) => (
          <motion.circle
            key={`neuron-${i}`}
            cx={Math.random() * 100}
            cy={Math.random() * 100}
            r="2"
            fill="#8B5CF6"
            initial={{ opacity: 0.2 }}
            animate={isSpeaking ? {
              opacity: [0.2, 0.4, 0.2],
              r: [2, 3, 2]
            } : {}}
            transition={{ duration: 1, repeat: Infinity, delay: Math.random() }}
          />
        ))}
        <AnimatePresence>
          {isSpeaking && [...Array(30)].map((_, i) => (
            <motion.path
              key={`synapse-${i}`}
              d={`M${Math.random() * 100},${Math.random() * 100} Q${Math.random() * 100},${Math.random() * 100} ${Math.random() * 100},${Math.random() * 100}`}
              stroke="#F472B6"
              strokeWidth="0.5"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.4 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
            />
          ))}
        </AnimatePresence>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {[...Array(16)].map((_, i) => ( 
          <motion.div
            key={`bar-${i}`}
            className="w-1 mx-0.5 bg-gradient-to-b from-pink-400 to-purple-600"
            initial={{ height: 2 }}
            animate={isSpeaking ? {
              height: [
                2,
                Math.random() * 40 + 20,
                Math.random() * 40 + 20,
                Math.random() * 40 + 20,
                2
              ],
            } : {
              height: [
                2,
                Math.random() * 10 + 5,
                2
              ],
            }}
            transition={{
              duration: isSpeaking ? 1.5 : 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.05,
            }}
            style={{
              transformOrigin: 'center',
            }}
          />
        ))}
      </div>
    </div>
  )
};

export default function PixifyAIFrontend() {
  const [activeTab, setActiveTab] = useState('gallery');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Default to closed on mobile
  const vantaRef = useRef<HTMLDivElement>(null);
  const [vantaEffect, setVantaEffect] = useState<any>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

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

  let hasSpoken = false;

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!hasSpoken) {
        speak('Hey, how are you today? Are you ready to create some A, I, awesomeness?, click the audio button to have an interactive chat where I can help you with anything pertaining to Pixify');
        hasSpoken = true;
      }
    }, 6000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  const startRecording = async () => {
    try {
      console.log("Starting recording...");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);

      audioChunksRef.current = []; // Reset audio chunks

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        console.log("Recording stopped, processing audio...");
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await processAudio(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      console.log("Stopping recording...");
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    try {
      console.log("Processing audio...");
      const form = new FormData();
      form.append("language", "en-US");
      form.append("ignore_timestamps", "true");
      form.append('audio', audioBlob, 'audio.wav');

      const options = {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${FISH_AUDIO_API_KEY}`,
          'Content-Type': 'multipart/form-data'
        },
        body: form
      };

      const sttResponse = await fetch('https://api.fish.audio/v1/asr', options);

      if (!sttResponse.ok) {
        throw new Error(`Fish Audio STT request failed with status ${sttResponse.status}`);
      }

      const sttData = await sttResponse.json();
      const transcribedText = sttData.text;

      console.log("Transcribed Text:", transcribedText);

      await sendMessageToLLM(transcribedText);

    } catch (error) {
      console.error('Error processing audio:', error);
    }
  };

  const sendMessageToLLM = async (text: string) => {
    try {
      const lmStudioResponse = await fetch('http://localhost:1234/v1/chat/completions', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${LMSTUDIO_API_KEY}` 
        },
        body: JSON.stringify({
          model: 'lmstudio-community/Meta-Llama-3.1-8B-Instruct-GGUF/Meta-Llama-3.1-8B-Instruct-Q8_0.gguf', 
          messages: [
            { role: 'system', content: 'You are a helpful AI assistant.' },
            { role: 'user', content: text }
          ],
          temperature: 0.7
        })
      });

      if (!lmStudioResponse.ok) {
        throw new Error(`LMStudio API request failed with status ${lmStudioResponse.status}`);
      }

      const lmStudioData = await lmStudioResponse.json();
      const botText = lmStudioData.choices[0].message.content;
      speak(botText);

    } catch (error) {
      console.error('Error processing message:', error);
    }
  };

  const speak = async (text: string) => {
    try {
      setIsSpeaking(true);

      const fishAudioResponse = await fetch('https://api.fish.audio/v1/tts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${FISH_AUDIO_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: text,
          reference_id: '1c3ea70a7b0b44639b1f97a16b4ef659', // Example ID, feel free to change
          audio_format: 'mp3' 
        })
      });

      if (!fishAudioResponse.ok) {
        throw new Error(`Fish Audio TTS request failed with status ${fishAudioResponse.status}`);
      }

      const audioBlob = await fishAudioResponse.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();

      audio.onended = () => {
        setIsSpeaking(false);
      };

    } catch (error) {
      console.error('Error speaking text:', error);
      setIsSpeaking(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#211059] text-white overflow-hidden relative">
      {/* Vanta.js Background  */}
      <div ref={vantaRef} className="fixed inset-0 pointer-events-none z-0" /> 

      {/* Sidebar  */}
      <aside
        className={`bg-[#161b22] bg-opacity-60 backdrop-blur-md p-4 flex flex-col rounded-tr-lg rounded-br-lg z-50 fixed top-0 left-0 h-full transform transition-transform duration-300 ease-in-out
           ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
           md:translate-x-0 md:static
           w-64
        `}
      >
        <div className="flex items-center mb-8">
          <div className="flex items-center mb-8">
            <img
              src="/pixify.svg" 
              alt="Pixify AI Logo"
              className="w-8 h-8 mr-2"
              style={{ backgroundColor: 'transparent' }}
            />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-[#4B0082] to-[#0000FF] text-transparent bg-clip-text">PIXIFY AI</h1>
        </div>
        <nav className="flex-1">
          <Link href="http://localhost:3000/" className="flex items-center p-2 bg-[#21262d] bg-opacity-60 backdrop-blur-md rounded-lg mb-2 text-[#8A2BE2]">
            <Home className="mr-2" size={20} />
            Home
          </Link>
          <div className="mb-4">
            <h2 className="text-sm text-gray-400 mb-2">AI Generation</h2>
            <Link href="https://pixify-chat.vercel.app/" className="flex items-center p-2 hover:bg-[#21262d] hover:bg-opacity-60 hover:backdrop-blur-md rounded-lg mb-1">
              <MessageSquare className="mr-2" size={20} />
              LLM Chat
            </Link>
            <Link href="/ai-images" className="flex items-center p-2 hover:bg-[#21262d] hover:bg-opacity-60 hover:backdrop-blur-md rounded-lg mb-1">
              <ImageIcon className="mr-2" size={20} />
              AI Images
            </Link>
            <Link href="/ai-videos" className="flex items-center p-2 hover:bg-[#21262d] hover:bg-opacity-60 hover:backdrop-blur-md rounded-lg mb-1">
              <Video className="mr-2" size={20} />
              AI Videos
            </Link>
          </div>
          <div className="mb-4">
            <h2 className="text-sm text-gray-400 mb-2">AI tools</h2>
            <Link href="/shorteezy" className="flex items-center p-2 hover:bg-[#21262d] hover:bg-opacity-60 hover:backdrop-blur-md rounded-lg mb-1">
              <Zap className="mr-2" size={20} />
              Shorteezy
            </Link>
            <Link href="/meme-extreme" className="flex items-center p-2 hover:bg-[#21262d] hover:bg-opacity-60 hover:backdrop-blur-md rounded-lg mb-1">
              <Smile className="mr-2" size={20} />
              MemeExtreme
            </Link>
            <Link href="https://216.230.232.229:7860/" className="flex items-center p-2 hover:bg-[#21262d] hover:bg-opacity-60 hover:backdrop-blur-md rounded-lg">
              <Scissors className="mr-2" size={20} />
              Pixify Webui
            </Link>
            <Link href="/4g3nt-c0d3r" className="flex items-center p-2 hover:bg-[#21262d] hover:bg-opacity-60 hover:backdrop-blur-md rounded-lg">
              <Terminal className="mr-2" size={20} />
              4g3nt c0d3r
            </Link>
          </div>  
          <Link href="/my-assets" className="flex items-center p-2 hover:bg-[#21262d] hover:bg-opacity-60 hover:backdrop-blur-md rounded-lg">
            <FolderOpen className="mr-2" size={20} />
            My Assets
          </Link>
          <Link href="https://pixify-app-bs-projects-5791d096.vercel.app/" className="flex items-center p-2 hover:bg-[#21262d] hover:bg-opacity-60 hover:backdrop-blur-md rounded-lg mb-1">
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

      {/* Main Content Area  */}
      <div className="flex flex-col flex-1 relative z-10"> 

        {/* Header (with Vanta.js background behind)  */}
        <header className="relative flex justify-between items-center p-4 md:pl-[18rem]">

          {/* Sidebar Toggle Button  */}
          <Button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden z-20"> 
            <Menu size={20} />
          </Button>

          {/* Right-Aligned Header Icons  */}
          <div className="flex items-center ml-auto z-20">  {/* z-index added */}
            <span className="mr-4 text-[#8A2BE2]">🟣 66</span>
            <Button variant="outline" size="sm" className="text-[#8A2BE2] border-[#8A2BE2] hover:bg-[#8A2BE2]/10 rounded-md hidden md:block">
              Purchase a membership plan to get credits
            </Button>
            <Button variant="ghost" size="icon" className="ml-2">
              <Settings className="text-gray-400" />
            </Button>
            <div className="w-8 h-8 bg-gradient-to-r from-[#4B0082] to-[#0000FF] rounded-full ml-2"></div>
          </div>
        </header>

        {/* Main Content  */}
        <main className="p-4 md:pl-[18rem] overflow-auto">
          {/* ... (Your main content - unchanged)  */}
          <section className="mb-12 relative overflow-hidden">
            <h2 className="text-[#8A2BE2] text-2xl md:text-4xl font-bold mb-2">PIXIFY AI, UNLEASH YOUR CREATIVITY</h2>
            <h1 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[#4B0082] to-[#0000FF] text-transparent bg-clip-text">
              Next-Generation AI Creative Studio
            </h1>
          </section>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-12">
            {/* LLM Chat Card */}
            <Card className="bg-[#21262d] bg-opacity-60 backdrop-blur-md p-6 hover:bg-opacity-80 transition-colors duration-300 rounded-lg border border-gray-600/30 group">
              <h3 className="text-xl font-semibold mb-2 text-[#8A2BE2]">LLM Chat</h3>
              <p className="text-gray-400 mb-4">AI-powered conversations, 100+ models</p>
              <a
                href="https://pixify-chat.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="ghost" className="w-full justify-between text-[#8A2BE2] hover:text-[#9370DB] rounded-md group-hover:bg-gray-800">
                  Start chatting
                  <ChevronRight size={20} />
                </Button>
              </a>
            </Card>

            {/* AI Images Card */}
            <Card className="bg-[#21262d] bg-opacity-60 backdrop-blur-md p-6 hover:bg-opacity-80 transition-colors duration-300 rounded-lg border border-gray-600/30 group">
              <h3 className="text-xl font-semibold mb-2 text-[#8A2BE2]">AI Images</h3>
              <p className="text-gray-400 mb-4">InstaFlux Powered by Runware.io</p>
              <Link href="/ai-images">
                <Button variant="ghost" className="w-full justify-between text-[#8A2BE2] hover:text-[#9370DB] rounded-md group-hover:bg-gray-800">
                  Get started
                  <ChevronRight size={20} />
                </Button>
              </Link>
            </Card>

            {/* AI Videos Card */}
            <Card className="bg-[#21262d] bg-opacity-60 backdrop-blur-md p-6 hover:bg-opacity-80 transition-colors duration-300 rounded-lg border border-gray-600/30 group">
              <h3 className="text-xl font-semibold mb-2 text-[#8A2BE2]">AI Videos</h3>
              <p className="text-gray-400 mb-4">Powered by Klingai.com</p>
              <Link href="/ai-videos">
                <Button variant="ghost" className="w-full justify-between text-[#8A2BE2] hover:text-[#9370DB] rounded-md group-hover:bg-gray-800">
                  Get started
                  <ChevronRight size={20} />
                </Button>
              </Link>
            </Card>

            {/* Shorteezy Card */}
            <Card className="bg-[#21262d] bg-opacity-60 backdrop-blur-md p-6 hover:bg-opacity-80 transition-colors duration-300 rounded-lg border border-gray-600/30 group">
              <h3 className="text-xl font-semibold mb-2 text-[#8A2BE2]">Shorteezy</h3>
              <p className="text-gray-400 mb-4">Quick AI-powered Flux shorts with custom voices</p>
              <Link href="/shorteezy">
                <Button variant="ghost" className="w-full justify-between text-[#8A2BE2] hover:text-[#9370DB] rounded-md group-hover:bg-gray-800">
                  Create now
                  <ChevronRight size={20} />
                </Button>
              </Link>
            </Card>

            {/* MemeExtreme Card */}
            <Card className="bg-[#21262d] bg-opacity-60 backdrop-blur-md p-6 hover:bg-opacity-80 transition-colors duration-300 rounded-lg border border-gray-600/30 group">
              <h3 className="text-xl font-semibold mb-2 text-[#8A2BE2]">MemeExtreme</h3>
              <p className="text-gray-400 mb-4">AI meme generation 20 per min</p>
              <Link href="/meme-extreme">
                <Button variant="ghost" className="w-full justify-between text-[#8A2BE2] hover:text-[#9370DB] rounded-md group-hover:bg-gray-800">
                  Generate memes
                  <ChevronRight size={20} />
                </Button>
              </Link>
            </Card>

            {/* Pixify Webui Card */}
            <Card className="bg-[#21262d] bg-opacity-60 backdrop-blur-md p-6 rounded-lg border border-gray-600/30 group">
              <h3 className="text-xl font-semibold mb-2 text-[#8A2BE2]">Pixify Webui</h3>
              <p className="text-gray-400 mb-4">Multi tool webui</p>
              <a
                href="https://216.230.232.229:7860/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="ghost" className="w-full justify-between text-[#8A2BE2] hover:text-[#9370DB] rounded-md group-hover:bg-gray-800">
                  Start Webui
                  <ChevronRight size={20} />
                </Button>
              </a>
            </Card>
          </div>

          <section>
            <div className="flex flex-col md:flex-row justify-between items-center mb-4">
              <div>
                <Button
                  variant="link"
                  className={activeTab === 'gallery' ? "text-[#8A2BE2] rounded-md px-3 py-2 mr-2" : "text-gray-400 rounded-md px-3 py-2 mr-2"}
                  onClick={() => setActiveTab('gallery')}
                >
                  Gallery
                </Button>
                <Button
                  variant="link"
                  className={activeTab === 'latest' ? "text-[#8A2BE2] rounded-md px-3 py-2" : "text-gray-400 rounded-md px-3 py-2"}
                  onClick={() => setActiveTab('latest')}
                >
                  Latest
                </Button>
              </div>
              <select className="bg-[#21262d] bg-opacity-60 backdrop-blur-md text-white px-2 py-1 rounded-md border border-gray-600 mt-2 md:mt-0"> 
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
                { src: '/videos/gray.mp4', type: 'video', creator: 'Creator9', likes: 2829 },
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
                      className="object-cover w-full h-full rounded-lg"
                      autoPlay
                      loop
                      muted
                    />
                  ) : (
                    <img
                      src={item.src}
                      alt={`Gallery image ${i + 1}`}
                      className="object-cover w-full h-full rounded-lg"
                    />
                  )}

                  <div className="absolute bottom-0 left-0 w-full p-2 bg-black bg-opacity-50 text-white rounded-bl-lg rounded-br-lg">
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

        {/* Voice AI Component  */}
        <div className="fixed top-24 right-16 z-20">  {/* z-index adjusted */}
          <VoiceAuroraAI isSpeaking={isSpeaking} />
        </div>

      </div>

      {/* Microphone Button  */}
      <Button
        onClick={isRecording ? stopRecording : startRecording}
        className={`microphone-button fixed bottom-4 right-4 ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-[#8A2BE2] hover:bg-[#9370DB]'} text-white font-medium rounded-md px-4 py-2 z-10`}
      >
        {isRecording ? 'Stop' : <Mic />}
      </Button>
    </div>
  );
}