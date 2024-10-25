'use client'

import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronRight, Home, Image as ImageIcon, Video, Scissors, FolderOpen, Settings, Zap, Smile, MessageSquare, Heart, Mic } from "lucide-react";
import Link from "next/link";
import * as THREE from 'three';
import CELLS from 'vanta/dist/vanta.cells.min';

// **Replace with your actual LMStudio API key:**
const LMSTUDIO_API_KEY = 'lm-studio'; 

export default function PixifyAIFrontend() {
  const [activeTab, setActiveTab] = useState('gallery');
  const vantaRef = useRef<HTMLDivElement>(null);
  const [vantaEffect, setVantaEffect] = useState<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Move isTalking outside the useEffect so it's in the component's scope
  let isTalking = false;

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

  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true });
    renderer.setSize(180, 180);

    // Custom Head Shape
    const headGeometry = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      -0.5, -0.5, 0.5, 
      0.5, -0.5, 0.5,
      0.5, 0.5, 0.5, 
      -0.5, 0.5, 0.5, 
      -0.5, -0.5, -0.5, 
      0.5, -0.5, -0.5,
      0.5, 0.5, -0.5, 
      -0.5, 0.5, -0.5, 
      0, 1.0, 0    
    ]);
    const indices = new Uint16Array([
      0, 1, 2, 2, 3, 0,  // Front
      1, 5, 6, 6, 2, 1,  // Right
      7, 6, 5, 5, 4, 7,  // Back
      4, 0, 3, 3, 7, 4,  // Left
      4, 5, 1, 1, 0, 4,  // Bottom
      0, 8, 3, 3, 8, 7, 7, 8, 6, 6, 8, 2, 2, 8, 1, 1, 8, 0 // Top
    ]);
    headGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    headGeometry.setIndex(new THREE.BufferAttribute(indices, 1));
    headGeometry.computeVertexNormals();

    // Gradient Material
    const headMaterial = new THREE.ShaderMaterial({
      uniforms: {
        color1: { value: new THREE.Color(0x6e40c9) },
        color2: { value: new THREE.Color(0x431f8d) },
      },
      vertexShader: `
        varying vec3 vUv; 
        void main() {
          vUv = position; 
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 color1;
        uniform vec3 color2;
        varying vec3 vUv;
        void main() {
          float mixValue = smoothstep(-0.5, 0.5, vUv.y); 
          vec3 color = mix(color1, color2, mixValue);
          gl_FragColor = vec4(color, 1.0);
        }
      `,
    });

    const head = new THREE.Mesh(headGeometry, headMaterial);
    scene.add(head);

    // Eyes (Pink)
    const eyeGeometry = new THREE.SphereGeometry(0.12, 32, 32);
    const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0xFF69B4 }); 
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.25, 0.1, 0.55); 
    head.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.25, 0.1, 0.55);
    head.add(rightEye);

    // Pupils
    const pupilGeometry = new THREE.SphereGeometry(0.06, 32, 32);
    const pupilMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
    leftPupil.position.set(0, 0, 0.08);
    leftEye.add(leftPupil);

    const rightPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
    rightPupil.position.set(0, 0, 0.08);
    rightEye.add(rightPupil);

    // Mouth
    const mouthGeometry = new THREE.PlaneGeometry(0.3, 0.05);
    const mouthMaterial = new THREE.MeshBasicMaterial({ color: 0xFF69B4 }); 
    const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
    mouth.position.set(0, -0.2, 0.55);
    head.add(mouth);

    camera.position.z = 3;

    const light = new THREE.PointLight(0xffffff, 1, 100);
    light.position.set(0, 5, 10);
    scene.add(light);

    let isBlinking = false;
    let blinkStartTime = 0;

    function animate() {
      requestAnimationFrame(animate);

      const currentTime = performance.now();
      if (!isBlinking && currentTime - blinkStartTime > 10000) {
        isBlinking = true;
        blinkStartTime = currentTime;
      }

      if (isBlinking) {
        const blinkDuration = 200;
        const timeSinceBlinkStart = currentTime - blinkStartTime;
        let blinkScale = 1;

        if (timeSinceBlinkStart < blinkDuration / 2) {
          blinkScale = 1 - (timeSinceBlinkStart / (blinkDuration / 2));
        } else if (timeSinceBlinkStart < blinkDuration) {
          blinkScale = (timeSinceBlinkStart - (blinkDuration / 2)) / (blinkDuration / 2);
        } else {
          isBlinking = false;
          blinkScale = 1;
        }

        leftEye.scale.set(blinkScale, blinkScale, blinkScale);
        rightEye.scale.set(blinkScale, blinkScale, blinkScale);
      }

      // Mouth movement when talking
      if (isTalking) {
        mouth.scale.y = 0.5 + Math.sin(performance.now() * 0.01) * 0.9; 
      } else {
        mouth.scale.y = 0.5; 
      }

      renderer.render(scene, camera);
    }

    function handleMouseMove(event: MouseEvent) {
      const rect = canvasRef.current!.getBoundingClientRect();
      const mouseX = (event.clientX - rect.left) / rect.width - 0.5;
      const mouseY = (event.clientY - rect.top) / rect.height - 0.5;

      const angle = Math.atan2(mouseY, mouseX);

      head.rotation.y = -angle * 0.3;

      leftPupil.position.x = mouseX * 0.04;
      leftPupil.position.y = -mouseY * 0.04;
      rightPupil.position.x = mouseX * 0.04;
      rightPupil.position.y = -mouseY * 0.04;
    }

    let hasSpoken = false; 

    const timeoutId = setTimeout(() => {
      if (!hasSpoken) {
        speak('Hey, how are you today? Are you ready to create some A, I, awesomeness?, click the audio button to have an interactive chat where i can help you with anything pertaining to Pixify');
        hasSpoken = true;
      }
    }, 3000);

    window.addEventListener('mousemove', handleMouseMove);
    animate();

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        processAudio(audioBlob);
        audioChunksRef.current = []; 
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio.wav');
      formData.append('language', 'en-US'); 
      formData.append('ignore_timestamps', 'true');

      const sttResponse = await fetch('https://api.fish.audio/v1/asr', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer b7b786af1bae44238e9841c86ca793fd`, 
        },
        body: formData
      });

      if (!sttResponse.ok) {
        throw new Error(`Fish Audio STT request failed with status ${sttResponse.status}`);
      }

      const sttData = await sttResponse.json();
      const transcribedText = sttData.text;

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

  // speak function (now outside the useEffect)
  const speak = async (text: string) => {
    try {
      isTalking = true; 

      const fishAudioResponse = await fetch('https://api.fish.audio/v1/tts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer b7b786af1bae44238e9841c86ca793fd`, 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: text,
          reference_id: '1c3ea70a7b0b44639b1f97a16b4ef659', 
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
        isTalking = false;
      };

    } catch (error) {
      console.error('Error speaking text:', error);
      isTalking = false;
    }
  };

  return (
    <div className="flex h-screen bg-[#211059] text-white overflow-hidden">
      <div ref={vantaRef} className="fixed inset-0 pointer-events-none" />

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
            <h1 className="text-xl font-bold bg-gradient-to-r from-[#4B0082] to-[#0000FF] text-transparent bg-clip-text">PIXIFY AI</h1>
          </div>
          <nav className="flex-1">
            <Link href="http://localhost:3000/" className="flex items-center p-2 bg-[#21262d] bg-opacity-60 backdrop-blur-md rounded-lg mb-2 text-[#8A2BE2]">
              <Home className="mr-2" size={20} />
              Home
            </Link>
            <div className="mb-4">
              <h2 className="text-sm text-gray-400 mb-2">AI Generation</h2>
              <Link href="/ai-images" className="flex items-center p-2 hover:bg-[#21262d] hover:bg-opacity-60 hover:backdrop-blur-md rounded-lg mb-1">
                <ImageIcon className="mr-2" size={20} />
                AI Images
              </Link>
              <Link href="/ai-videos" className="flex items-center p-2 hover:bg-[#21262d] hover:bg-opacity-60 hover:backdrop-blur-md rounded-lg mb-1">
                <Video className="mr-2" size={20} />
                AI Videos
              </Link>
              <Link href="/shorteezy" className="flex items-center p-2 hover:bg-[#21262d] hover:bg-opacity-60 hover:backdrop-blur-md rounded-lg mb-1">
                <Zap className="mr-2" size={20} />
                Shorteezy
              </Link>
              <Link href="/meme-extreme" className="flex items-center p-2 hover:bg-[#21262d] hover:bg-opacity-60 hover:backdrop-blur-md rounded-lg mb-1">
                <Smile className="mr-2" size={20} />
                MemeExtreme
              </Link>
              <Link href="https://pixify-chat.vercel.app/" className="flex items-center p-2 hover:bg-[#21262d] hover:bg-opacity-60 hover:backdrop-blur-md rounded-lg mb-1">
                <MessageSquare className="mr-2" size={20} />
                LLM Chat
              </Link>
            </div>
            <div className="mb-4">
              <h2 className="text-sm text-gray-400 mb-2">AI tools</h2>
              <Link href="https://216.230.232.229:7860/" className="flex items-center p-2 hover:bg-[#21262d] hover:bg-opacity-60 hover:backdrop-blur-md rounded-lg">
                <Scissors className="mr-2" size={20} />
                Pixify Webui
              </Link>
            </div>
            <Link href="/my-assets" className="flex items-center p-2 hover:bg-[#21262d] hover:bg-opacity-60 hover:backdrop-blur-md rounded-lg">
              <FolderOpen className="mr-2" size={20} />
              My Assets
            </Link>
              <Link href="https://www.pixifyai.art/" className="flex items-center p-2 hover:bg-[#21262d] hover:bg-opacity-60 hover:backdrop-blur-md rounded-lg mb-1">
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
              <Button variant="outline" size="sm" className="text-[#8A2BE2] border-[#8A2BE2] hover:bg-[#8A2BE2]/10 rounded-md">
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
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
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
            <div className="flex justify-between items-center mb-4">
              <div>
                <Button
                  variant="link"
                  className={activeTab === 'gallery' ? "text-[#8A2BE2] rounded-md px-3 py-2" : "text-gray-400 rounded-md px-3 py-2"}
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
              <select className="bg-[#21262d] bg-opacity-60 backdrop-blur-md text-white px-2 py-1 rounded-md border border-gray-600">
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

                  {/* Overlay with details */}
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

          {/* 3D Character Canvas */}
          <div className="relative" style={{ position: 'relative' }}> 
            <canvas 
              ref={canvasRef}
              style={{ 
                position: 'fixed', 
                top: '2rem',
                right: '1rem',
                width: '180px',
                height: '180px' 
              }}
            />
            <p className="absolute top-full right-0 text-sm text-gray-400 mt-1">Click the audio button for voice chat</p> 
          </div>

          <Button 
            onClick={isRecording ? stopRecording : startRecording} 
            className={`microphone-button fixed bottom-4 right-4 ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-[#8A2BE2] hover:bg-[#9370DB]'} text-white font-medium rounded-md px-4 py-2`} 
          >
            {isRecording ? 'Stop' : <Mic />}
          </Button>

        </main> 
      </div>
    </div>
  );
}