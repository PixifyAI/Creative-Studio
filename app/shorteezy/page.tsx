'use client';

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
  Zap,
  Smile,
  MessageSquare,
  Heart,
  RefreshCw,
  Mic,
} from 'lucide-react';
import Link from 'next/link';
import * as THREE from 'three';
import CELLS from 'vanta/dist/vanta.cells.min';
import Image from 'next/image';
import axios from 'axios';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

// Replace with your actual API keys (or fetch from environment variables)
const RUNWARE_API_KEY = process.env.NEXT_PUBLIC_RUNWARE_API_KEY || 'NJcnXimLw8zmPcLgBsbLJ1qhWQKMuvro'; 
const FISH_AUDIO_API_KEY = process.env.NEXT_PUBLIC_FISH_AUDIO_API_KEY || 'b7b786af1bae44238e9841c86ca793fd';

// LMStudio API endpoint (replace if different)
const LMSTUDIO_API_URL = 'http://localhost:1234/v1';

// Runware API endpoint
const RUNWARE_API_ENDPOINT = 'https://api.runwayml.com/v1/generations'; 

// Define available narration voices 
const NARRATION_VOICES = {
  "e58b0d7efca34eb38d5c4985e378abcb": "Trump",
  "ad0cc2e2afb84cb4a6750d2488988520": "Joe Rogan",
  "fc8b93539e8247808ba1d159f2f8a019": "Adam (Elevenlabs)",
  "e4cdbe7d6c174d26b1401f64142d3636": "Deadpool Ryan Reynolds",
  "95b3a15d996a4fbe833924467fc0ff00": "Morgan Freeman",
  "1c3ea70a7b0b44639b1f97a16b4ef659": "Sky/Her OpenAI",
  "193f7f8f649b418382885c5fb4fb7109": "Elmo",
  "9845e056f37b470d9a1005e41c864e25": "Spongebob",
  "5efbfee274a24a90bc3523585803940a": "Tallahassee Woody Harrelson",
  "9a3448b109c64b53bf46806429817ca7": "Optimus Prime",
  "0b3b6b9727504dd98b2ae6111ee92091": "Maximus Russle Crowe",
  "d2e75a3e3fd6419893057c02a375a113": "Rick Sanchez",
  "d75c270eaee14c8aa1e9e980cc37cf1b": "Peter Griffin",
  "03397b4c4be74759b72533b663fbd001": "Elon Musk",
  "76b0d729c2cd4f2288426b300ddcd78a": "Krusty the Clown",
  "10ed7bad64ca41d9814c027932138358": "Schwarzenegger",
  "1c3ea70a7b0b44639b1f97a16b4ef659": "Her/Sky",
};

// Define available image generation models
const IMAGE_MODELS = {
  "runware:100@1": "Flux.Schnell",
  "runware:101@1": "Flux.Dev",
  "civitai:4201@501240": "Realistic Vision V6.0 B1",
  "civitai:133005@782002": "Juggernaut XL",
  "civitai:215418@273102": "TurboVisionXL",
  "civitai:312530@709456": "CyberRealistic XL",
  "civitai:25694@143906": "epiCRealism Natural Sin",
  "civitai:101055@128078": "SD XL",
};

export default function ShorteezyPage() {
  const [sourceMaterial, setSourceMaterial] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [generatedScript, setGeneratedScript] = useState('');
  const [narrations, setNarrations] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState(Object.keys(NARRATION_VOICES)[0]);
  const [selectedImageModel, setSelectedImageModel] = useState(Object.keys(IMAGE_MODELS)[0]);
  const [imageTexts, setImageTexts] = useState('');
  const [narrationTexts, setNarrationTexts] = useState('');
  const [ffmpeg, setFfmpeg] = useState<FFmpeg | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    const loadFFmpeg = async () => {
      const ffmpegInstance = new FFmpeg();
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.2/dist/umd';
      await ffmpegInstance.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });
      setFfmpeg(ffmpegInstance);
    };
    loadFFmpeg();
  }, []);

  const generateScript = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const payload = {
        model: 'lmstudio-community/Meta-Llama-3.1-8B-Instruct-GGUF',
        messages: [
          {
            role: 'system',
            content: `You are a YouTube Shorts content creator, specifically a narration and image prompt generator.

Your task: Generate a 45-second to 1-minute YouTube Shorts script, including both the narration and image prompts for an AI image generator.

Instructions:

Provide a sequence of image descriptions in square brackets. Each description should represent a visual cue for a single sentence or short phrase in your narration.
Below each image description, provide the corresponding narration.
The narration should be suitable for a text-to-speech engine, meaning no special characters or complex formatting.
Feel free to use any content, including real names and references, as long as it is appropriate and adheres to YouTube's community guidelines.
The images should transition smoothly, creating a dynamic visual backdrop for the narration.
Example Output Format:

###

[Description of a background image]

Narrator: "One sentence of narration"

[Description of a background image]

Narrator: "One sentence of narration"

[Description of a background image]

Narrator: "One sentence of narration"

###

Example Output:

###

[A vibrant sunset over a bustling city skyline.]
Narrator: "The city never sleeps, and neither does our team."

[A close-up shot of a smiling scientist looking at a microscope.]
Narrator: "Dr. Emily Carter has been working tirelessly on a breakthrough."

###

By following this format, you'll provide a complete script for a YouTube Shorts video, ready to be used with an AI image generator and a text-to-speech engine.

The short should be 10 sentences maximum.

Add a description of a fitting background image in between all of the narrations. It will later be used to generate an image with AI.`,
          },
          {
            role: 'user',
            content: `Create a YouTube short narration based on the following source material:\n\n${
              sourceMaterial || urlInput
            }`,
          },
        ],
        temperature: 0.7,
      };

      console.log('Sending payload:', JSON.stringify(payload, null, 2));

      const response = await axios.post(LMSTUDIO_API_URL + '/chat/completions', payload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer lm-studio',
        },
      });

      console.log('Received response:', JSON.stringify(response.data, null, 2));

      if (response.data.choices && response.data.choices.length > 0 && response.data.choices[0].message) {
        setGeneratedScript(response.data.choices[0].message.content);
        parseScript(response.data.choices[0].message.content);
      } else {
        throw new Error('Unexpected response structure from LMStudio API');
      }
    } catch (error) {
      console.error('Error generating script:', error);
      setGeneratedScript('');
      setError('Unable to generate script. Please check the console for more details.');
    } finally {
      setIsLoading(false);
    }
  };

  const parseScript = (script: string) => {
    const lines = script.split('\n');
    const parsedNarrations: string[] = [];
    const parsedImages: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('[')) {
        parsedImages.push(lines[i].slice(1, -1));
      } else if (lines[i].startsWith('Narrator:')) {
        parsedNarrations.push(lines[i].slice(10).trim());
      }
    }

    setNarrations(parsedNarrations);
    setImageTexts(parsedImages.join('\n'));
    setNarrationTexts(parsedNarrations.join('\n'));
    return { parsedNarrations, parsedImages };
  };

  const generateNarrations = async (narrations: string[]) => {
    const audioUrls: string[] = [];
    for (const text of narrations) {
      try {
        const response = await fetch('https://api.fish.audio/v1/text-to-speech', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${FISH_AUDIO_API_KEY}`,
          },
          body: JSON.stringify({
            voice: selectedVoice,
            text: text,
          }),
        });

        const data = await response.json();
        audioUrls.push(data.audio);
      } catch (error) {
        console.error('Error generating narration:', error);
      }
    }
    return audioUrls;
  };

  const generateImages = async (imagePrompts: string[]) => {
    const generatedImages: string[] = [];
    for (const prompt of imagePrompts) {
      const requestBody = {
        positivePrompt: prompt,
        model: selectedImageModel,
        numberResults: 1,
        negativePrompt: '',
        useCache: false,
        height: 1792,
        width: 1024,
      };
      try {
        const headers = {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${RUNWARE_API_KEY}`,
        };

        const response = await axios.post(RUNWARE_API_ENDPOINT, requestBody, { headers });

        if (response.status === 200) {
          const data = response.data;
          if (data.images && data.images.length > 0) {
            generatedImages.push(data.images[0].imageUrl);
          } else {
            console.error('Runway API did not return an image URL.');
          }
        } else {
          console.error(`Runway API request failed with status: ${response.status}`);
        }
      } catch (error) {
        console.error('Error generating image:', error);
      }
    }
    return generatedImages;
  };

  const generateVideo = async (narrations: string[], images: string[]) => {
    if (!ffmpeg) {
      console.error('FFmpeg is not loaded');
      return;
    }

    try {
      // Download and write narration files
      for (let i = 0; i < narrations.length; i++) {
        const narrationData = await fetchFile(narrations[i]);
        await ffmpeg.writeFile(`narration_${i}.mp3`, narrationData);
      }

      // Download and write image files
      for (let i = 0; i < images.length; i++) {
        const imageData = await fetchFile(images[i]);
        await ffmpeg.writeFile(`image_${i}.jpg`, imageData);
      }

      // Create video from images and narrations
      const commands = ['-framerate', '1/5'];
      
      for (let i = 0; i < images.length; i++) {
        commands.push('-loop', '1', '-t', '5', '-i', `image_${i}.jpg`);
      }
      
      commands.push(
        '-filter_complex',
        `concat=n=${images.length}:v=1:a=0,format=yuv420p[v]`,
        '-map', '[v]',
        '-c:v', 'libx264',
        '-preset', 'ultrafast',
        '-crf', '23'
      );

      for (let i = 0; i < narrations.length; i++) {
        commands.push('-i', `narration_${i}.mp3`);
      }

      commands.push(
        '-filter_complex',
        `concat=n=${narrations.length}:v=0:a=1[a]`,
        '-map', '[a]',
        '-c:a', 'aac',
        '-b:a', '192k',
        'output.mp4'
      );

      await ffmpeg.exec(commands);

      // Read the output file
      const data = await ffmpeg.readFile('output.mp4');

      // Create a URL for the video
      const videoBlob = new Blob([data], { type: 'video/mp4' });
      const videoUrl = URL.createObjectURL(videoBlob);

      return videoUrl;
    } catch (error) {
      console.error('Error generating video:', error);
      throw error;
    }
  };

  const handleGenerateShorteezy = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await generateScript();
      const { parsedNarrations, parsedImages } = parseScript(generatedScript);
      const generatedNarrations = await generateNarrations(parsedNarrations);
      const generatedImages = await generateImages(parsedImages);
      setImages(generatedImages);
      const videoUrl = await generateVideo(generatedNarrations, generatedImages);
      setVideoUrl(videoUrl);
    } catch (error) {
      console.error('Error generating Shorteezy:', error);
      setError('An error occurred while generating the Shorteezy. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateImage = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const imagePrompts = imageTexts.split('\n');
      const newImages = await generateImages(imagePrompts);
      setImages(newImages);
    } catch (error) {
      console.error('Error regenerating image:', error);
      setError('An error occurred while regenerating images. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateNarration = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const narrationList = narrationTexts.split('\n');
      const newNarrations = await generateNarrations(narrationList);
      setNarrations(newNarrations);
    } catch (error) {
      console.error('Error regenerating narration:', error);
      setError('An error occurred while regenerating narrations. Please try again.');
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
              Shorteezy
            </h1>
            <div className="absolute top-0 right-0 w-96 h-96">
              <div className="relative w-full h-full">
                <div className="absolute inset-0 bg-gradient-to-r from-[#4B0082] to-[#0000FF] rounded-full opacity-20 animate-pulse" style={{ animationDuration: '4s' }}></div>
                <div className="absolute inset-0 border-2 border-[#8A2BE2] rounded-full"></div>
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-[#8A2BE2] transform -rotate-45"></div>
              </div>
            </div>
          </section>

          {error && (
            <div className="bg-red-500 text-white p-4 rounded-md mb-4">
              {error}
            </div>
          )}

          {/* Shorteezy Generation Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {/* Source Material Card */}
            <Card className="bg-[#21262d] bg-opacity-60 backdrop-blur-md hover:bg-opacity-80 transition-colors duration-300 rounded-lg border border-gray-600/30">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2 text-[#8A2BE2]">
                  Source Material
                </h3>
                <textarea
                  className="w-full bg-gray-800 rounded-md p-2 focus:outline-none mb-4"
                  rows={5}
                  placeholder="Enter your source material here..."
                  value={sourceMaterial}
                  onChange={(e) => setSourceMaterial(e.target.value)}
                ></textarea>
                <input
                  type="text"
                  className="w-full bg-gray-800 rounded-md p-2 focus:outline-none mb-4"
                  placeholder="Or enter a URL..."
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                />
                <div className="flex space-x-2 mb-4">
                  <select
                    value={selectedVoice}
                    onChange={(e) => setSelectedVoice(e.target.value)}
                    className="w-full bg-gray-800 rounded-md p-2 focus:outline-none"
                  >
                    {Object.entries(NARRATION_VOICES).map(([id, name]) => (
                      <option key={id} value={id}>
                        {name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedImageModel}
                    onChange={(e) => setSelectedImageModel(e.target.value)}
                    className="w-full bg-gray-800 rounded-md p-2 focus:outline-none"
                  >
                    {Object.entries(IMAGE_MODELS).map(([id, name]) => (
                      <option key={id} value={id}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
                <Button
                  onClick={handleGenerateShorteezy}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-[#4B0082] to-[#0000FF] text-white font-bold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity duration-300"
                >
                  {isLoading ? 'Generating...' : 'Generate Shorteezy'}
                </Button>
              </div>
            </Card>

            {/* Generated Script Card */}
            <Card className="bg-[#21262d] bg-opacity-60 backdrop-blur-md hover:bg-opacity-80 transition-colors duration-300 rounded-lg border border-gray-600/30">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2 text-[#8A2BE2]">
                  Generated Script
                </h3>
                <pre className="whitespace-pre-wrap bg-gray-800 rounded-md p-2 h-[400px] overflow-auto">
                  {generatedScript}
                </pre>
              </div>
            </Card>
          </div>

          {/* Generated Content Section */}
          {generatedScript && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4 text-[#8A2BE2]">
                Generated Shorteezy Content
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Image Descriptions Card */}
                <Card className="bg-[#21262d] bg-opacity-60 backdrop-blur-md hover:bg-opacity-80 transition-colors duration-300 rounded-lg border border-gray-600/30">
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2 text-[#8A2BE2]">
                      Image Descriptions
                    </h3>
                    <textarea
                      className="w-full bg-gray-800 rounded-md p-2 focus:outline-none mb-4"
                      rows={5}
                      value={imageTexts}
                      onChange={(e) => setImageTexts(e.target.value)}
                    ></textarea>
                    <Button
                      onClick={handleRegenerateImage}
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-[#4B0082] to-[#0000FF] text-white font-bold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity duration-300"
                    >
                      <RefreshCw className="mr-2" size={20} />
                      Regenerate Images
                    </Button>
                  </div>
                </Card>

                {/* Narration Texts Card */}
                <Card className="bg-[#21262d] bg-opacity-60 backdrop-blur-md hover:bg-opacity-80 transition-colors duration-300 rounded-lg border border-gray-600/30">
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2 text-[#8A2BE2]">
                      Narration Texts
                    </h3>
                    <textarea
                      className="w-full bg-gray-800 rounded-md p-2 focus:outline-none mb-4"
                      rows={5}
                      value={narrationTexts}
                      onChange={(e) => setNarrationTexts(e.target.value)}
                    ></textarea>
                    <Button
                      onClick={handleRegenerateNarration}
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-[#4B0082] to-[#0000FF] text-white font-bold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity duration-300"
                    >
                      <Mic className="mr-2" size={20} />
                      Regenerate Narrations
                    </Button>
                  </div>
                </Card>
              </div>

              {/* Generated Images Card */}
              <Card className="mt-6 bg-[#21262d] bg-opacity-60 backdrop-blur-md hover:bg-opacity-80 transition-colors duration-300 rounded-lg border border-gray-600/30">
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 text-[#8A2BE2]">
                    Generated Images
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {images.map((image, index) => (
                      <Image
                        key={index}
                        src={image}
                        alt={`Generated Image ${index + 1}`}
                        width={200}
                        height={200}
                        className="rounded-md"
                      />
                    ))}
                  </div>
                </div>
              </Card>

              {/* Generated Video Card */}
              {videoUrl && (
                <Card className="mt-6 bg-[#21262d] bg-opacity-60 backdrop-blur-md hover:bg-opacity-80 transition-colors duration-300 rounded-lg border border-gray-600/30">
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2 text-[#8A2BE2]">
                      Generated Video
                    </h3>
                    <video
                      controls
                      className="w-full rounded-md"
                      src={videoUrl}
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </Card>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}