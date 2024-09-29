
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
import { Runware, IControlNet, ILora, ETaskType } from '@runware/sdk-js';

// **REPLACE THIS WITH YOUR ACTUAL API KEY:**
const RUNWARE_API_KEY = 'YOUR_RUNWARE_API_KEY';
const runware = new Runware({ apiKey: RUNWARE_API_KEY });

// Example LoRA Model Data (replace with your actual LoRA data)
const availableLoraModels = [
  { id: 'lora-model-1', name: 'LoRA Model A' },
  { id: 'lora-model-2', name: 'LoRA Model B' },
  // ... add more LoRA models
];

export default function AIAgesPage() {
  // Basic State Variables:
  const [prompt, setPrompt] = useState('');
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Runware API Settings:
  const [negativePrompt, setNegativePrompt] = useState('');
  const [width, setWidth] = useState(512);
  const [height, setHeight] = useState(512);
  const [selectedModel, setSelectedModel] = useState('stable-diffusion');
  const [numberOfImages, setNumberOfImages] = useState(1);
  const [outputType, setOutputType] = useState<'URL' | 'base64Data' | 'dataURI'>(
    'URL'
  );
  const [outputFormat, setOutputFormat] = useState<'JPG' | 'PNG' | 'WEBP'>(
    'JPG'
  );
  const [uploadEndpoint, setUploadEndpoint] = useState('');
  const [checkNSFW, setCheckNSFW] = useState(false);
  const [strength, setStrength] = useState(0.75);
  const [steps, setSteps] = useState(50);
  const [scheduler, setScheduler] = useState('DDIM');
  const [seed, setSeed] = useState<number | null>(null);
  const [cfgScale, setCfgScale] = useState(7);
  const [clipSkip, setClipSkip] = useState(2);
  const [usePromptWeighting, setUsePromptWeighting] = useState(false);
  const [useCache, setUseCache] = useState(false);
  const [returnBase64Image, setReturnBase64Image] = useState(false);

  // ControlNet Settings:
  const [controlNetModel, setControlNetModel] = useState<string | null>(null);
  const [controlNetImage, setControlNetImage] = useState<File | null>(null);
  const [controlNetWeight, setControlNetWeight] = useState(1);
  const [controlNetStartStep, setControlNetStartStep] = useState(0);
  const [controlNetEndStep, setControlNetEndStep] = useState(100);
  const [controlNetControlMode, setControlNetControlMode] =
    useState<'prompt' | 'controlnet' | 'balanced'>('balanced');
  // LoRA Settings:
  const [loraModels, setLoraModels] = useState<ILora[]>([]);

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
  // Handle Image Upload
  const handleImageUpload = (event) => {
    if (event.target.files && event.target.files[0]) {
      setReferenceImage(event.target.files[0]);
    }
  };

  // Handle ControlNet Image Upload
  const handleControlNetImageUpload = (event) => {
    if (event.target.files && event.target.files[0]) {
      setControlNetImage(event.target.files[0]);
    }
  };

  // Handle LoRA Model Addition
  const handleAddLora = () => {
    setLoraModels([...loraModels, { model: '', weight: 1 }]);
  };
  // Handle LoRA Model Removal
  const handleRemoveLora = (index) => {
    const updatedLoras = [...loraModels];
    updatedLoras.splice(index, 1);
    setLoraModels(updatedLoras);
  };
  // Handle LoRA Model Change
  const handleLoraModelChange = (index, value) => {
    const updatedLoras = [...loraModels];
    updatedLoras[index].model = value;
    setLoraModels(updatedLoras);
  };
  // Handle LoRA Weight Change
  const handleLoraWeightChange = (index, value) => {
    const updatedLoras = [...loraModels];
    updatedLoras[index].weight = value;
    setLoraModels(updatedLoras);
  };

  // Handle Generate Image
  const handleGenerateImage = async () => {
    setIsLoading(true);
    try {
      const controlNetParams = [];
      if (controlNetModel && controlNetImage) {
        controlNetParams.push({
          model: controlNetModel,
          guideImage: controlNetImage,
          weight: controlNetWeight,
          startStep: controlNetStartStep,
          endStep: controlNetEndStep,
          controlMode: controlNetControlMode,
        });
      }

      const images = await runware.requestImages({
        positivePrompt: prompt,
        negativePrompt: negativePrompt,
        width: width,
        height: height,
        model: selectedModel,
        numberResults: numberOfImages,
        outputType: outputType,
        outputFormat: outputFormat,
        uploadEndpoint: uploadEndpoint,
        checkNSFW: checkNSFW,
        seedImage: referenceImage,
        strength: strength,
        steps: steps,
        scheduler: scheduler,
        seed: seed,
        CFGScale: cfgScale,
        clipSkip: clipSkip,
        usePromptWeighting: usePromptWeighting,
        lora: loraModels,
        controlNet: controlNetParams,
        useCache: useCache,
        returnBase64Image: returnBase64Image,
      });

      // Handle different output types:
      if (outputType === 'URL') {
        setGeneratedImages(images.map((image) => image.imageURL || ''));
      } else if (outputType === 'base64Data') {
        setGeneratedImages(images.map((image) => image.imageBase64Data || ''));
      } else if (outputType === 'dataURI') {
        setGeneratedImages(images.map((image) => image.imageDataURI || ''));
      }
    } catch (error) {
      console.error('Error during image generation:', error);
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
                href="#"
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
                href="#"
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
              Next-Generation AI Creative Studio
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {/* AI Images Card */}
            <Card className="bg-[#21262d] bg-opacity-60 backdrop-blur-md p-6 hover:bg-opacity-80 transition-colors duration-300 rounded-lg border border-gray-600/30 group">
              <h3 className="text-xl font-semibold mb-2 text-[#8A2BE2]">
                AI Images
              </h3>
              <p className="text-gray-400 mb-4">
                InstaFlux Powered by Runware.io
              </p>
              <Button
                variant="ghost"
                className="w-full justify-between text-[#8A2BE2] hover:text-[#9370DB] rounded-md group-hover:bg-gray-800"
              >
                Get started
                <ChevronRight size={20} />
              </Button>
            </Card>

            {/* AI Videos Card */}
            <Card className="bg-[#21262d] bg-opacity-60 backdrop-blur-md p-6 hover:bg-opacity-80 transition-colors duration-300 rounded-lg border border-gray-600/30 group">
              <h3 className="text-xl font-semibold mb-2 text-[#8A2BE2]">
                AI Videos
              </h3>
              <p className="text-gray-400 mb-4">Powered by Klingai.com</p>
              <Button
                variant="ghost"
                className="w-full justify-between text-[#8A2BE2] hover:text-[#9370DB] rounded-md group-hover:bg-gray-800"
              >
                Get started
                <ChevronRight size={20} />
              </Button>
            </Card>

            {/* Shorteezy Card */}
            <Card className="bg-[#21262d] bg-opacity-60 backdrop-blur-md p-6 hover:bg-opacity-80 transition-colors duration-300 rounded-lg border border-gray-600/30 group">
              <h3 className="text-xl font-semibold mb-2 text-[#8A2BE2]">
                Shorteezy
              </h3>
              <p className="text-gray-400 mb-4">
                Quick AI-powered Flux shorts with custom voices
              </p>
              <Button
                variant="ghost"
                className="w-full justify-between text-[#8A2BE2] hover:text-[#9370DB] rounded-md group-hover:bg-gray-800"
              >
                Create now
                <ChevronRight size={20} />
              </Button>
            </Card>

            {/* MemeExtreme Card */}
            <Card className="bg-[#21262d] bg-opacity-60 backdrop-blur-md p-6 hover:bg-opacity-80 transition-colors duration-300 rounded-lg border border-gray-600/30 group">
              <h3 className="text-xl font-semibold mb-2 text-[#8A2BE2]">
                MemeExtreme
              </h3>
              <p className="text-gray-400 mb-4">
                AI meme generation 20 per min
              </p>
              <Button
                variant="ghost"
                className="w-full justify-between text-[#8A2BE2] hover:text-[#9370DB] rounded-md group-hover:bg-gray-800"
              >
                Generate memes
                <ChevronRight size={20} />
              </Button>
            </Card>

            {/* LLM Chat Card */}
            <Card className="bg-[#21262d] bg-opacity-60 backdrop-blur-md p-6 hover:bg-opacity-80 transition-colors duration-300 rounded-lg border border-gray-600/30 group">
              <h3 className="text-xl font-semibold mb-2 text-[#8A2BE2]">
                LLM Chat
              </h3>
              <p className="text-gray-400 mb-4">
                AI-powered conversations, 100+ models
              </p>
              <a
                href="https://pixify-chat.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="ghost"
                  className="w-full justify-between text-[#8A2BE2] hover:text-[#9370DB] rounded-md group-hover:bg-gray-800"
                >
                  Start chatting
                  <ChevronRight size={20} />
                </Button>
              </a>
            </Card>

            {/* Pixify Webui Card */}
            <Card className="bg-[#21262d] bg-opacity-60 backdrop-blur-md p-6 rounded-lg border border-gray-600/30 group">
              <h3 className="text-xl font-semibold mb-2 text-[#8A2BE2]">
                Pixify Webui
              </h3>
              <p className="text-gray-400 mb-4">Multi tool webui</p>
              <a
                href="https://216.230.232.229:7860/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="ghost"
                  className="w-full justify-between text-[#8A2BE2] hover:text-[#9370DB] rounded-md group-hover:bg-gray-800"
                >
                  Start Webui
                  <ChevronRight size={20} />
                </Button>
              </a>
            </Card>
          </div>

          <main className="flex-1 p-8 overflow-auto">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-[#4B0082] to-[#0000FF] text-transparent bg-clip-text">
              AI Images
            </h1>

            {/* Input and Settings Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {/* Prompt Card */}
              <Card className="bg-[#21262d] bg-opacity-60 backdrop-blur-md p-6 hover:bg-opacity-80 transition-colors duration-300 rounded-lg border border-gray-600/30">
                <h3 className="text-xl font-semibold mb-2 text-[#8A2BE2]">
                  Prompt
                </h3>
                <textarea
                  className="w-full bg-gray-800 rounded-md p-2 focus:outline-none"
                  rows={5}
                  placeholder="Enter your creative vision here..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                ></textarea>
              </Card>

              {/* Reference Image Card */}
              <Card className="bg-[#21262d] bg-opacity-60 backdrop-blur-md p-6 hover:bg-opacity-80 transition-colors duration-300 rounded-lg border border-gray-600/30">
                <h3 className="text-xl font-semibold mb-2 text-[#8A2BE2]">
                  Reference Image (Optional)
                </h3>
                <input
                  type="file"
                  accept="image/jpeg, image/png"
                  onChange={handleImageUpload}
                />
              </Card>

              {/* Settings Card */}
              <Card className="bg-[#21262d] bg-opacity-60 backdrop-blur-md p-6 hover:bg-opacity-80 transition-colors duration-300 rounded-lg border border-gray-600/30">
                <h3 className="text-xl font-semibold mb-2 text-[#8A2BE2]">
                  Settings
                </h3>
                <div className="mb-4">
                  <label
                    htmlFor="model"
                    className="block text-gray-400 text-sm font-bold mb-2"
                  >
                    Model:
                  </label>
                  <select
                    id="model"
                    className="bg-gray-800 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                  >
                    <option value="stable-diffusion">Stable Diffusion</option>
                    {/* ... Add more model options if needed ... */}
                  </select>
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="numImages"
                    className="block text-gray-400 text-sm font-bold mb-2"
                  >
                    Number of Images:
                  </label>
                  <input
                    type="number"
                    id="numImages"
                    min="1"
                    max="4"
                    className="bg-gray-800 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    value={numberOfImages}
                    onChange={(e) =>
                      setNumberOfImages(parseInt(e.target.value, 10))
                    }
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="negativePrompt"
                    className="block text-gray-400 text-sm font-bold mb-2"
                  >
                    Negative Prompt:
                  </label>
                  <textarea
                    id="negativePrompt"
                    className="w-full bg-gray-800 rounded-md p-2 focus:outline-none"
                    rows={3}
                    placeholder="Enter elements you want to exclude..."
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                  ></textarea>
                </div>
                {/* Width and Height */}
                <div className="mb-4 grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="width"
                      className="block text-gray-400 text-sm font-bold mb-2"
                    >
                      Width:
                    </label>
                    <input
                      type="number"
                      id="width"
                      min="64"
                      max="2048"
                      step="64"
                      className="bg-gray-800 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      value={width}
                      onChange={(e) => setWidth(parseInt(e.target.value, 10))}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="height"
                      className="block text-gray-400 text-sm font-bold mb-2"
                    >
                      Height:
                    </label>
                    <input
                      type="number"
                      id="height"
                      min="64"
                      max="2048"
                      step="64"
                      className="bg-gray-800 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      value={height}
                      onChange={(e) => setHeight(parseInt(e.target.value, 10))}
                    />
                  </div>
                </div>
                {/* Output Type */}
                <div className="mb-4">
                  <label
                    htmlFor="outputType"
                    className="block text-gray-400 text-sm font-bold mb-2"
                  >
                    Output Type:
                  </label>
                  <select
                    id="outputType"
                    className="bg-gray-800 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    value={outputType}
                    onChange={(e) =>
                      setOutputType(
                        e.target.value
                      )
                    }
                  >
                    <option value="URL">URL</option>
                    <option value="base64Data">Base64 Data</option>
                    <option value="dataURI">Data URI</option>
                  </select>
                </div>
                {/* Output Format */}
                <div className="mb-4">
                  <label
                    htmlFor="outputFormat"
                    className="block text-gray-400 text-sm font-bold mb-2"
                  >
                    Output Format:
                  </label>
                  <select
                    id="outputFormat"
                    className="bg-gray-800 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    value={outputFormat}
                    onChange={(e) =>
                      setOutputFormat(e.target.value)
                    }
                  >
                    <option value="JPG">JPG</option>
                    <option value="PNG">PNG</option>
                    <option value="WEBP">WEBP</option>
                  </select>
                </div>
                {/* Upload Endpoint */}
                <div className="mb-4">
                  <label
                    htmlFor="uploadEndpoint"
                    className="block text-gray-400 text-sm font-bold mb-2"
                  >
                    Upload Endpoint (Optional):
                  </label>
                  <input
                    type="text"
                    id="uploadEndpoint"
                    className="bg-gray-800 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="e.g., https://your-bucket.s3.amazonaws.com/images/"
                    value={uploadEndpoint}
                    onChange={(e) => setUploadEndpoint(e.target.value)}
                  />
                </div>
                {/* NSFW Check */}
                <div className="mb-4">
                  <label
                    htmlFor="checkNSFW"
                    className="block text-gray-400 text-sm font-bold mb-2"
                  >
                    NSFW Check:
                  </label>
                  <input
                    type="checkbox"
                    id="checkNSFW"
                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    checked={checkNSFW}
                    onChange={(e) => setCheckNSFW(e.target.checked)}
                  />
                </div>
                {/* Strength (for image-to-image) */}
                <div className="mb-4">
                  <label
                    htmlFor="strength"
                    className="block text-gray-400 text-sm font-bold mb-2"
                  >
                    Strength (Img2Img):
                  </label>
                  <input
                    type="number"
                    id="strength"
                    min="0"
                    max="1"
                    step="0.05"
                    className="bg-gray-800 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    value={strength}
                    onChange={(e) => setStrength(parseFloat(e.target.value))}
                  />
                </div>
                {/* Steps */}
                <div className="mb-4">
                  <label
                    htmlFor="steps"
                    className="block text-gray-400 text-sm font-bold mb-2"
                  >
                    Steps:
                  </label>
                  <input
                    type="number"
                    id="steps"
                    min="1"
                    max="150"
                    className="bg-gray-800 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    value={steps}
                    onChange={(e) => setSteps(parseInt(e.target.value, 10))}
                  />
                </div>
                {/* Scheduler */}
                <div className="mb-4">
                  <label
                    htmlFor="scheduler"
                    className="block text-gray-400 text-sm font-bold mb-2"
                  >
                    Scheduler:
                  </label>
                  <select
                    id="scheduler"
                    className="bg-gray-800 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    value={scheduler}
                    onChange={(e) => setScheduler(e.target.value)}
                  >
                    <option value="DDIM">DDIM</option>
                    <option value="DPMSolverMultistep">
                      DPMSolverMultistep
                    </option>
                    <option value="Euler">Euler</option>
                    <option value="EulerAncestral">EulerAncestral</option>
                    <option value="Heun">Heun</option>
                    <option value="K_DPM_2">K_DPM_2</option>
                    <option value="K_DPM_2_ANCESTRAL">
                      K_DPM_2_ANCESTRAL
                    </option>
                    <option value="K_EULER">K_EULER</option>
                    <option value="K_EULER_ANCESTRAL">
                      K_EULER_ANCESTRAL
                    </option>
                    <option value="K_HEUN">K_HEUN</option>
                    <option value="LMSDiscrete">LMSDiscrete</option>
                    <option value="PNDM">PNDM</option>
                  </select>
                </div>
                {/* Seed */}
                <div className="mb-4">
                  <label
                    htmlFor="seed"
                    className="block text-gray-400 text-sm font-bold mb-2"
                  >
                    Seed (Optional):
                  </label>
                  <input
                    type="number"
                    id="seed"
                    className="bg-gray-800 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    value={seed ?? ''}
                    onChange={(e) =>
                      setSeed(
                        e.target.value ? parseInt(e.target.value, 10) : null
                      )
                    }
                  />
                </div>
                {/* CFG Scale */}
                <div className="mb-4">
                  <label
                    htmlFor="cfgScale"
                    className="block text-gray-400 text-sm font-bold mb-2"
                  >
                    CFG Scale:
                  </label>
                  <input
                    type="number"
                    id="cfgScale"
                    min="1"
                    max="30"
                    className="bg-gray-800 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    value={cfgScale}
                    onChange={(e) => setCfgScale(parseInt(e.target.value, 10))}
                  />
                </div>
                {/* Clip Skip */}
                <div className="mb-4">
                  <label
                    htmlFor="clipSkip"
                    className="block text-gray-400 text-sm font-bold mb-2"
                  >
                    Clip Skip:
                  </label>
                  <input
                    type="number"
                    id="clipSkip"
                    min="1"
                    max="10"
                    className="bg-gray-800 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    value={clipSkip}
                    onChange={(e) => setClipSkip(parseInt(e.target.value, 10))}
                  />
                </div>
                {/* Prompt Weighting */}
                <div className="mb-4">
                  <label
                    htmlFor="usePromptWeighting"
                    className="block text-gray-400 text-sm font-bold mb-2"
                  >
                    Use Prompt Weighting:
                  </label>
                  <input
                    type="checkbox"
                    id="usePromptWeighting"
                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    checked={usePromptWeighting}
                    onChange={(e) => setUsePromptWeighting(e.target.checked)}
                  />
                </div>
                {/* LoRA Models */}
                <div className="mb-4">
                  <h4 className="text-base font-semibold mb-2 text-[#8A2BE2]">
                    LoRA Models
                  </h4>
                  {loraModels.map((lora, index) => (
                    <div key={index} className="mb-2 flex items-center">
                      {/* Model Selection */}
                      <select
                        className="bg-gray-800 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        value={lora.model}
                        onChange={(e) =>
                          handleLoraModelChange(index, e.target.value)
                        }
                      >
                        <option value="">Select LoRA Model</option>
                        {availableLoraModels.map((model) => (
                          <option key={model.id} value={model.id}>
                            {model.name}
                          </option>
                        ))}
                      </select>
                      {/* Weight */}
                      <input
                        type="number"
                        min="0"
                        max="1"
                        step="0.1"
                        className="ml-2 bg-gray-800 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-20 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        value={lora.weight}
                        onChange={(e) =>
                          handleLoraWeightChange(
                            index,
                            parseFloat(e.target.value)
                          )
                        }
                      />
                      {/* Remove Button */}
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="ml-2"
                        onClick={() => handleRemoveLora(index)}
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  {/* Add LoRA Button */}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddLora}
                  >
                    Add LoRA
                  </Button>
                </div>
                {/* ControlNet Section */}
                <div className="mb-4">
                  <h4 className="text-base font-semibold mb-2 text-[#8A2BE2]">
                    ControlNet (Optional)
                  </h4>
                  {/* Model Selection */}
                  <div className="mb-2">
                    <label
                      htmlFor="controlNetModel"
                      className="block text-gray-400 text-sm font-bold mb-1"
                    >
                      Model:
                    </label>
                    <select
                      id="controlNetModel"
                      className="bg-gray-800 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      value={controlNetModel || ''}
                      onChange={(e) => setControlNetModel(e.target.value)}
                    >
                      <option value="">None</option>
                      <option value="canny">Canny</option>
                      <option value="depth">Depth</option>
                      <option value="hed">HED</option>
                      <option value="mlsd">MLSD</option>
                      <option value="normal">Normal</option>
                      <option value="openpose">Openpose</option>
                      <option value="scribble">Scribble</option>
                      <option value="segmentation">Segmentation</option>
                    </select>
                  </div>
                  {/* Guide Image Upload */}
                  <div>
                    <label
                      htmlFor="controlNetImage"
                      className="block text-gray-400 text-sm font-bold mb-1"
                    >
                      Guide Image:
                    </label>
                    <input
                      type="file"
                      id="controlNetImage"
                      accept="image/*"
                      onChange={handleControlNetImageUpload}
                    />
                  </div>
                  {/* Weight */}
                  <div className="mt-2">
                    <label
                      htmlFor="controlNetWeight"
                      className="block text-gray-400 text-sm font-bold mb-1"
                    >
                      Weight:
                    </label>
                    <input
                      type="number"
                      id="controlNetWeight"
                      min="0"
                      max="1"
                      step="0.1"
                      className="bg-gray-800 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      value={controlNetWeight}
                      onChange={(e) =>
                        setControlNetWeight(parseFloat(e.target.value))
                      }
                    />
                  </div>
                  {/* Start Step */}
                  <div className="mt-2">
                    <label
                      htmlFor="controlNetStartStep"
                      className="block text-gray-400 text-sm font-bold mb-1"
                    >
                      Start Step:
                    </label>
                    <input
                      type="number"
                      id="controlNetStartStep"
                      min="0"
                      max={steps}
                      className="bg-gray-800 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      value={controlNetStartStep}
                      onChange={(e) =>
                        setControlNetStartStep(parseInt(e.target.value, 10))
                      }
                    />
                  </div>
                  {/* End Step */}
                  <div className="mt-2">
                    <label
                      htmlFor="controlNetEndStep"
                      className="block text-gray-400 text-sm font-bold mb-1"
                    >
                      End Step:
                    </label>
                    <input
                      type="number"
                      id="controlNetEndStep"
                      min="0"
                      max={steps}
                      className="bg-gray-800 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      value={controlNetEndStep}
                      onChange={(e) =>
                        setControlNetEndStep(parseInt(e.target.value, 10))
                      }
                    />
                  </div>
                  {/* Control Mode */}
                  <div className="mt-2">
                    <label
                      htmlFor="controlNetControlMode"
                      className="block text-gray-400 text-sm font-bold mb-1"
                    >
                      Control Mode:
                    </label>
                    <select
                      id="controlNetControlMode"
                      className="bg-gray-800 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      value={controlNetControlMode}
                      onChange={(e) =>
                        setControlNetControlMode(
                          e.target.value
                        )
                      }
                    >
                      <option value="prompt">Prompt</option>
                      <option value="controlnet">ControlNet</option>
                      <option value="balanced">Balanced</option>
                    </select>
                  </div>
                </div>
                {/* Image Cache */}
                <div className="mb-4">
                  <label
                    htmlFor="useCache"
                    className="block text-gray-400 text-sm font-bold mb-2"
                  >
                    Use Image Cache:
                  </label>
                  <input
                    type="checkbox"
                    id="useCache"
                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    checked={useCache}
                    onChange={(e) => setUseCache(e.target.checked)}
                  />
                </div>
                {/* Return Base64 Image */}
                <div className="mb-4">
                  <label
                    htmlFor="returnBase64Image"
                    className="block text-gray-400 text-sm font-bold mb-2"
                  >
                    Return Base64 Image:
                  </label>
                  <input
                    type="checkbox"
                    id="returnBase64Image"
                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    checked={returnBase64Image}
                    onChange={(e) => setReturnBase64Image(e.target.checked)}
                  />
                </div>
              </Card>
            </div>

            {/* Generate Button */}
            <Button
              variant="ghost"
              className="w-full justify-between text-[#8A2BE2] hover:text-[#9370DB] rounded-md group-hover:bg-gray-800 mb-8"
              onClick={handleGenerateImage}
              disabled={isLoading}
            >
              {isLoading ? 'Generating...' : 'Generate'}
              <Sparkles size={20} />
            </Button>

            {/* Image Generation Results */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {generatedImages.map((image, index) => (
                <div
                  key={index}
                  className="relative bg-[#21262d] bg-opacity-60 backdrop-blur-md rounded-lg overflow-hidden group transition-transform duration-300 hover:scale-105"
                  style={{ aspectRatio: '3 / 4' }}
                >
                  {outputType === 'URL' ? (
                    <Image
                      src={image}
                      alt={`Generated image ${index + 1}`}
                      fill
                      className="object-cover w-full h-full rounded-lg"
                    />
                  ) : outputType === 'base64Data' ? (
                    <Image
                      src={`data:image/${outputFormat.toLowerCase()};base64,${image}`}
                      alt={`Generated image ${index + 1}`}
                      fill
                      className="object-cover w-full h-full rounded-lg"
                    />
                  ) : (
                    <Image
                      src={image}
                      alt={`Generated image ${index + 1}`}
                      fill
                      className="object-cover w-full h-full rounded-lg"
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Runware.ai API Information */}
            <div className="mt-12 bg-[#21262d] bg-opacity-60 backdrop-blur-md p-6 rounded-lg border border-gray-600/30">
              <h2 className="text-xl font-semibold mb-2 text-[#8A2BE2]">
                Powered by Runware.ai
              </h2>
              <p className="text-gray-400 mb-4">
                This AI Images tool leverages the powerful Runware.ai API to
                generate stunning visuals from your text prompts.
              </p>
              <a
                href="https://docs.runware.ai/en/libraries/javascript"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="text-[#8A2BE2] border-[#8A2BE2] hover:bg-[#8A2BE2]/10 rounded-md"
                >
                  Learn more about the API
                </Button>
              </a>
            </div>
          </main>
        </main>
      </div>
    </div>
  );
}