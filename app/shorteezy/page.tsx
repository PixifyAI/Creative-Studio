'use client'

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  Upload,
  Play,
  RefreshCw,
  Mic,
} from 'lucide-react';
import Link from 'next/link';
import * as THREE from 'three';
import CELLS from 'vanta/dist/vanta.cells.min';
import Image from 'next/image';
import { Runware, IImageInference } from '@runware/sdk-js';

// Replace with your actual API key
const RUNWARE_API_KEY = process.env.NEXT_PUBLIC_RUNWARE_API_KEY || 'YOUR_RUNWARE_API_KEY';
const runware = new Runware({ apiKey: RUNWARE_API_KEY });

// LMStudio API endpoint (replace with actual endpoint if different)
const LMSTUDIO_API_URL = "http://localhost:1234/v1";

// Define available narration voices and image generation models
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
};

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

  const generateScript = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(LMSTUDIO_API_URL + '/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer lm-studio'
        },
        body: JSON.stringify({
          model: "lmstudio-community/Meta-Llama-3.1-8B-Instruct-GGUF",
          messages: [
            {
              role: "system",
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

Add a description of a fitting background image in between all of the narrations. It will later be used to generate an image with AI.`
            },
            {
              role: "user",
              content: `Create a YouTube short narration based on the following source material:\n\n${sourceMaterial || urlInput}`
            }
          ],
          temperature: 0.7,
        })
      });

      const data = await response.json();
      setGeneratedScript(data.choices[0].message.content);
      parseScript(data.choices[0].message.content);
    } catch (error) {
      console.error('Error generating script:', error);
      setGeneratedScript('Error: Unable to generate script. Please try again.');
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
    // Implement text-to-speech functionality here
    // For now, we'll just return the text as if it were audio files
    return narrations.map((text, index) => `narration_${index + 1}.mp3`);
  };

  const generateImages = async (imagePrompts: string[]) => {
    const generatedImages: string[] = [];
    for (const prompt of imagePrompts) {
      const request: IImageInference = {
        positivePrompt: prompt,
        model: selectedImageModel,
        numberResults: 1,
        negativePrompt: "",
        useCache: false,
        height: 1792,
        width: 1024,
      };
      try {
        const images = await runware.imageInference(request);
        if (images && images.length > 0) {
          generatedImages.push(images[0].imageURL);
        }
      } catch (error) {
        console.error('Error generating image:', error);
        generatedImages.push('');
      }
    }
    return generatedImages;
  };

  const generateVideo = async (narrations: string[], images: string[]) => {
    // Implement video compilation functionality here
    // For now, we'll just return a dummy video URL
    return 'https://example.com/generated_video.mp4';
  };

  const handleGenerateShorteezy = async () => {
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateImage = async () => {
    setIsLoading(true);
    try {
      const imagePrompts = imageTexts.split('\n');
      const newImages = await generateImages(imagePrompts);
      setImages(newImages);
    } catch (error) {
      console.error('Error regenerating image:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateNarration = async () => {
    setIsLoading(true);
    try {
      const narrationList = narrationTexts.split('\n');
      const newNarrations = await generateNarrations(narrationList);
      setNarrations(newNarrations);
    } catch (error) {
      console.error('Error regenerating narration:', error);
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
              Shorteezy
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

          {/* Shorteezy Generation Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {/* Source Material Card */}
            <Card className="bg-[#21262d] bg-opacity-60 backdrop-blur-md hover:bg-opacity-80 transition-colors duration-300 rounded-lg border border-gray-600/30">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-2 text-[#8A2BE2]">
                  Source Material
                </h3>
                <Textarea
                  className="w-full bg-gray-800 rounded-md p-2 focus:outline-none mb-4"
                  placeholder="Enter your source material here..."
                  value={sourceMaterial}
                  onChange={(e) => setSourceMaterial(e.target.value)}
                />
                <Input
                  type="text"
                  className="w-full bg-gray-800 rounded-md p-2 focus:outline-none mb-4"
                  placeholder="Or enter a URL..."
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                />
                <div className="flex space-x-2 mb-4">
                  <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a voice" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(NARRATION_VOICES).map(([id, name]) => (
                        <SelectItem key={id} value={id}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedImageModel} onValueChange={setSelectedImageModel}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select an image model" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(IMAGE_MODELS).map(([id, name]) => (
                        <SelectItem key={id} value={id}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleGenerateShorteezy}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-[#4B0082] to-[#0000FF] text-white font-bold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity duration-300"
                >
                  {isLoading ? 'Generating...' : 'Generate Shorteezy'}
                </Button>
              </CardContent>
            </Card>

            {/* Generated Script Card */}
            <Card className="bg-[#21262d] bg-opacity-60 backdrop-blur-md hover:bg-opacity-80 transition-colors duration-300 rounded-lg border border-gray-600/30">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-2 text-[#8A2BE2]">
                  Generated Script
                </h3>
                <pre className="whitespace-pre-wrap bg-gray-800 rounded-md p-2 h-[400px] overflow-auto">
                  {generatedScript}
                </pre>
              </CardContent>
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
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-2 text-[#8A2BE2]">
                      Image Descriptions
                    </h3>
                    <Textarea
                      className="w-full bg-gray-800 rounded-md p-2 focus:outline-none mb-4"
                      value={imageTexts}
                      onChange={(e) => setImageTexts(e.target.value)}
                    />
                    <Button
                      onClick={handleRegenerateImage}
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-[#4B0082] to-[#0000FF] text-white font-bold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity duration-300"
                    >
                      <RefreshCw className="mr-2" size={20} />
                      Regenerate Images
                    </Button>
                  </CardContent>
                </Card>

                {/* Narration Texts Card */}
                <Card className="bg-[#21262d] bg-opacity-60 backdrop-blur-md hover:bg-opacity-80 transition-colors duration-300 rounded-lg border border-gray-600/30">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-2 text-[#8A2BE2]">
                      Narration Texts
                    </h3>
                    <Textarea
                      className="w-full bg-gray-800 rounded-md p-2 focus:outline-none mb-4"
                      value={narrationTexts}
                      onChange={(e) => setNarrationTexts(e.target.value)}
                    />
                    <Button
                      onClick={handleRegenerateNarration}
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-[#4B0082] to-[#0000FF] text-white font-bold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity duration-300"
                    >
                      <Mic className="mr-2" size={20} />
                      Regenerate Narrations
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Generated Images Card */}
              <Card className="mt-6 bg-[#21262d] bg-opacity-60 backdrop-blur-md hover:bg-opacity-80 transition-colors duration-300 rounded-lg border border-gray-600/30">
                <CardContent className="p-6">
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
                </CardContent>
              </Card>

              {/* Generated Video Card */}
              {videoUrl && (
                <Card className="mt-6 bg-[#21262d] bg-opacity-60 backdrop-blur-md hover:bg-opacity-80 transition-colors duration-300 rounded-lg border border-gray-600/30">
                  <CardContent className="p-6">
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
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}