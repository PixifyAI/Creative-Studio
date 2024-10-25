'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Home,
  Mic,
  MessageSquare,
  ImageIcon,
  Video,
  Scissors,
  FolderOpen,
  Zap,
  Smile,
  Terminal,
  Settings,
  Download,
  PlusCircle,
  XCircle as XCircleIcon,
  Menu
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as THREE from 'three';
import CELLS from 'vanta/dist/vanta.cells.min';
import { motion, AnimatePresence } from 'framer-motion';
import msgpack from 'msgpack-lite';

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
  );
};

const sidebarClasses =
  'bg-[#161b22] bg-opacity-60 backdrop-blur-md p-4 flex flex-col rounded-tr-lg rounded-br-lg z-50 fixed top-0 left-0 h-full transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static';

export default function PixifyAIFrontend() {
  const [activeTab, setActiveTab] = useState('voice-cloning');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const vantaRef = useRef<HTMLDivElement>(null);
  const [vantaEffect, setVantaEffect] = useState<any>(null);

  // Voice Cloning States
  const [audioFiles, setAudioFiles] = useState<File[]>([]);
  const [textInputsVC, setTextInputsVC] = useState<string[]>(['']); // Separate VC inputs
  const [modelId, setModelId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Text to Speech States
  const [ttsInput, setTtsInput] = useState('');
  const [ttsModelId, setTtsModelId] = useState('');
  const [textInputsTTS, setTextInputsTTS] = useState<string[]>(['']); // Separate TTS inputs
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAudio, setGeneratedAudio] = useState<Blob | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const router = useRouter();

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
        speak('Hey, how are you today? Are you ready to clone some voices?');
        hasSpoken = true;
      }
    }, 6000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  const startRecording = async () => {
    try {
      console.log('Starting recording...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);

      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = event => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        console.log('Recording stopped, processing audio...');
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
      console.log('Stopping recording...');
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    try {
      console.log('Processing audio...');
      const form = new FormData();
      form.append('language', 'en-US');
      form.append('ignore_timestamps', 'true');
      form.append('audio', audioBlob, 'audio.wav');

      const options = {
        method: 'POST',
        headers: {
          Authorization: 'Bearer sk-yMb8P****', // Replace with your Fish.audio API key
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

      console.log('Transcribed Text:', transcribedText);

      console.log('Transcribed Text (to use in app):', transcribedText);
    } catch (error) {
      console.error('Error processing audio:', error);
    }
  };

  const sendMessageToLLM = async (text: string) => {
    try {
      // ... (Your logic to send 'text' to your LLM API)
      const responseText = 'This is an example LLM response text';
      speak(responseText);
    } catch (error) {
      console.error('Error processing message:', error);
    }
  };

  const speak = async (text: string) => {
    try {
      setIsSpeaking(true);

      const ttsRequest = {
        text: text,
        chunk_length: 200,
        format: 'mp3',
        mp3_bitrate: 128,
        references: [],
        reference_id: ttsModelId,
        normalize: true,
        latency: 'normal'
      };

      const response = await fetch('https://api.fish.audio/v1/tts', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer sk-yMb8P****', // Replace with your Fish.audio API key
          'Content-Type': 'application/msgpack'
        },
        body: msgpack.encode(ttsRequest)
      });

      if (!response.ok) {
        throw new Error(`Fish Audio TTS request failed with status ${response.status}`);
      }

      const audioBlob = await response.blob();
      setGeneratedAudio(audioBlob);
      setIsSpeaking(false);
    } catch (error) {
      console.error('Error speaking text:', error);
      setIsSpeaking(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setAudioFiles(Array.from(event.target.files));
    }
  };

  const handleVCInputChange = (index: number, value: string) => {
    const updatedInputs = [...textInputsVC];
    updatedInputs[index] = value;
    setTextInputsVC(updatedInputs);
  };

  const addVCInput = () => {
    setTextInputsVC([...textInputsVC, '']);
  };

  const handleTTSInputChange = (index: number, value: string) => {
    const updatedInputs = [...textInputsTTS];
    updatedInputs[index] = value;
    setTextInputsTTS(updatedInputs);
  };

  const addTTSInput = () => {
    setTextInputsTTS([...textInputsTTS, '']);
  };

  const createVoiceModel = async () => {
    try {
      setUploadError(null);
      setIsUploading(true);

      const formData = new FormData();

      audioFiles.forEach(file => {
        formData.append('voices', file);
      });

      textInputsVC.forEach(text => {
        formData.append('texts', text);
      });

      formData.append('visibility', 'private');
      formData.append('type', 'tts');
      formData.append('title', 'My Voice Model');
      formData.append('train_mode', 'fast');
      formData.append('enhance_audio_quality', 'true');

      const response = await fetch('https://api.fish.audio/model', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer sk-yMb8P****' // Replace with your Fish.audio API key
        },
        body: formData
      });

      setIsUploading(false);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Voice model creation failed: ${errorData.detail || response.status}`);
      }

      const data = await response.json();
      setModelId(data.model_id);
      console.log('Voice model created successfully:', data.model_id);
    } catch (error) {
      console.error('Error creating voice model:', error);
      setUploadError(error.message);
    }
  };

  const handleTTSModelIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTtsModelId(e.target.value);
  };

  const generateTTS = async () => {
    setIsGenerating(true);
    speak(ttsInput);
    setIsGenerating(false);
  };

  const downloadAudio = () => {
    if (generatedAudio) {
      const url = URL.createObjectURL(generatedAudio);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'generated_audio.mp3';
      link.click();
    }
  };

  return (
    <div className="flex h-screen bg-[#211059] text-white overflow-hidden relative">
      <div ref={vantaRef} className="fixed inset-0 pointer-events-none z-0" />

      <aside className={sidebarClasses}>
        <Button
          onClick={() => setIsSidebarOpen(false)}
          className="md:hidden absolute top-4 right-4 z-50 bg-[#8A2BE2] hover:bg-[#9370DB] text-white font-medium rounded-md px-3 py-2"
        >
          <XCircleIcon size={20} />
        </Button>

        <div className="flex items-center mb-8">
          <img
            src="/pixify.svg"
            alt="Pixify AI Logo"
            className="w-8 h-8 mr-2"
            style={{ backgroundColor: 'transparent' }}
          />
          <h1 className="text-xl font-bold bg-gradient-to-r from-[#4B0082] to-[#0000FF] text-transparent bg-clip-text">
            PIXIFY AI
          </h1>
        </div>

        <nav className="flex-1">
          <Link
            href="/"
            className={`flex items-center p-2 hover:bg-[#21262d] hover:bg-opacity-60 hover:backdrop-blur-md rounded-lg mb-1 text-[#8A2BE2] ${
              router.pathname === '/' ? 'bg-[#21262d] bg-opacity-60 backdrop-blur-md' : ''
            }`}
          >
            <Home className="mr-2" size={20} />
            Home
          </Link>
          <div className="mb-4">
            <h2 className="text-sm text-gray-400 mb-2">AI Generation</h2>
            <Link
              href="https://pixify-chat.vercel.app/"
              className={`flex items-center p-2 hover:bg-[#21262d] hover:bg-opacity-60 hover:backdrop-blur-md rounded-lg mb-1 text-[#8A2BE2] ${
                router.pathname === '/ai-chat' ? 'bg-[#21262d] bg-opacity-60 backdrop-blur-md' : ''
              }`}
            >
              <MessageSquare className="mr-2" size={20} />
              LLM Chat
            </Link>
            <Link
              href="/ai-images"
              className={`flex items-center p-2 hover:bg-[#21262d] hover:bg-opacity-60 hover:backdrop-blur-md rounded-lg mb-1 text-[#8A2BE2] ${
                router.pathname === '/ai-images' ? 'bg-[#21262d] bg-opacity-60 backdrop-blur-md' : ''
              }`}
            >
              <ImageIcon className="mr-2" size={20} />
              AI Images
            </Link>
            <Link
              href="/ai-videos"
              className={`flex items-center p-2 hover:bg-[#21262d] hover:bg-opacity-60 hover:backdrop-blur-md rounded-lg mb-1 text-[#8A2BE2] ${
                router.pathname === '/ai-videos' ? 'bg-[#21262d] bg-opacity-60 backdrop-blur-md' : ''
              }`}
            >
              <Video className="mr-2" size={20} />
              AI Videos
            </Link>
          </div>
          <div className="mb-4">
            <h2 className="text-sm text-gray-400 mb-2">AI Tools</h2>
            <Link
              href="/shorteezy"
              className={`flex items-center p-2 hover:bg-[#21262d] hover:bg-opacity-60 hover:backdrop-blur-md rounded-lg mb-1 text-[#8A2BE2] ${
                router.pathname === '/shorteezy' ? 'bg-[#21262d] bg-opacity-60 backdrop-blur-md' : ''
              }`}
            >
              <Zap className="mr-2" size={20} />
              Shorteezy
            </Link>
            <Link
              href="/meme-extreme"
              className={`flex items-center p-2 hover:bg-[#21262d] hover:bg-opacity-60 hover:backdrop-blur-md rounded-lg mb-1 text-[#8A2BE2] ${
                router.pathname === '/meme-extreme' ? 'bg-[#21262d] bg-opacity-60 backdrop-blur-md' : ''
              }`}
            >
              <Smile className="mr-2" size={20} />
              MemeExtreme
            </Link>
            <Link
              href="https://216.230.232.229:7860/"
              className={`flex items-center p-2 hover:bg-[#21262d] hover:bg-opacity-60 hover:backdrop-blur-md rounded-lg text-[#8A2BE2] ${
                router.pathname === '/pixify-webui' ? 'bg-[#21262d] bg-opacity-60 backdrop-blur-md' : ''
              }`}
            >
              <Scissors className="mr-2" size={20} />
              Pixify Webui
            </Link>
            <Link
              href="/4g3nt-c0d3r"
              className={`flex items-center p-2 hover:bg-[#21262d] hover:bg-opacity-60 hover:backdrop-blur-md rounded-lg text-[#8A2BE2] ${
                router.pathname === '/4g3nt-c0d3r' ? 'bg-[#21262d] bg-opacity-60 backdrop-blur-md' : ''
              }`}
            >
              <Terminal className="mr-2" size={20} />
              4g3nt c0d3r
            </Link>
          </div>
          <Link
            href="/my-assets"
            className={`flex items-center p-2 hover:bg-[#21262d] hover:bg-opacity-60 hover:backdrop-blur-md rounded-lg text-[#8A2BE2] ${
              router.pathname === '/my-assets' ? 'bg-[#21262d] bg-opacity-60 backdrop-blur-md' : ''
            }`}
          >
            <FolderOpen className="mr-2" size={20} />
            My Assets
          </Link>
          <Link
            href="https://pixify-app-bs-projects-5791d096.vercel.app/"
            className={`flex items-center p-2 hover:bg-[#21262d] hover:bg-opacity-60 hover:backdrop-blur-md rounded-lg mb-1 text-[#8A2BE2] ${
              router.pathname === '/ai-social' ? 'bg-[#21262d] bg-opacity-60 backdrop-blur-md' : ''
            }`}
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

      <div className="flex flex-col flex-1 md:pl-0 relative z-10">
        <header className="relative flex justify-between items-center p-4">
          <Button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden z-20 bg-[#8A2BE2] hover:bg-[#9370DB] text-white font-medium rounded-md px-3 py-2">
            <Menu size={20} />
          </Button>

          <div className="flex items-center ml-auto z-20">
            <span className="mr-4 text-[#8A2BE2]">🟣 66</span>
            <Button
              variant="outline"
              size="sm"
              className="text-[#8A2BE2] border-[#8A2BE2] hover:bg-[#8A2BE2]/10 rounded-md hidden md:block"
            >
              Purchase a membership plan to get credits
            </Button>
            <Button variant="ghost" size="icon" className="ml-2">
              <Settings className="text-gray-400" />
            </Button>
            <div className="w-8 h-8 bg-gradient-to-r from-[#4B0082] to-[#0000FF] rounded-full ml-2"></div>
          </div>
        </header>

        <main className="p-8 overflow-y-auto w-full mx-auto" style={{ scrollbarColor: '#161b22 transparent' }}>
          {/* Voice Cloning Section */}
          <section className="mb-12 flex flex-col items-center w-full md:w-3/4">
            <Card className="bg-[#21262d] bg-opacity-60 backdrop-blur-md border border-gray-600/30 w-full">
              <CardHeader>
                <CardTitle className="text-[#8A2BE2] text-2xl">Voice Cloning</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-gray-400">
                    <strong className="text-white">How to Use:</strong>
                  </p>
                  <ol className="list-decimal list-inside ml-4 text-gray-400">
                    <li>Upload one or more audio files (MP3, WAV) of the voice you want to clone.</li>
                    <li>Optionally provide text that matches the content of the audio for better accuracy.</li>
                    <li>Click "Create Voice Model".</li>
                    <li>Once the model is created, you will get a Model ID.</li>
                  </ol>
                </div>

                <div>
                  <label htmlFor="audio-files" className="block text-sm font-medium text-gray-400 mb-1">
                    Upload Audio Files
                  </label>
                  <input
                    id="audio-files"
                    type="file"
                    multiple
                    accept="audio/*"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-400
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-[#8A2BE2] file:text-white
                    hover:file:bg-[#9370DB]"
                  />
                </div>

                <div>
                  <label htmlFor="text-inputsVC" className="block text-sm font-medium text-gray-400 mb-1">
                    Text Inputs (Optional)
                  </label>
                  {textInputsVC.map((text, index) => (
                    <div key={index} className="mb-2 flex">
                      <textarea
                        id="text-inputsVC" // Make sure the id is unique
                        className="w-full px-3 py-2 rounded-md bg-[#21262d] bg-opacity-60 backdrop-blur-md text-white border border-gray-600/30 focus:border-[#8A2BE2] focus:ring-[#8A2BE2]"
                        placeholder={`Text Input ${index + 1}`}
                        value={text}
                        onChange={e => handleVCInputChange(index, e.target.value)}
                      />
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-[#8A2BE2] hover:bg-[#8A2BE2]/10"
                    onClick={addVCInput}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Text Input
                  </Button>
                </div>

                <div>
                  <Button
                    onClick={createVoiceModel}
                    className="bg-[#8A2BE2] hover:bg-[#9370DB] text-white font-medium rounded-md px-4 py-2"
                    disabled={isUploading}
                  >
                    {isUploading ? 'Creating...' : 'Create Voice Model'}
                  </Button>

                  {uploadError && <p className="mt-2 text-red-500">{uploadError}</p>}
                  {modelId && (
                    <p className="mt-2 text-green-500">Voice model created with ID: {modelId}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Text-to-Speech Section (Same width as Voice Cloning) */}
          <section className="mb-12 flex flex-col items-center w-full md:w-3/4">
            <Card className="bg-[#21262d] bg-opacity-60 backdrop-blur-md border border-gray-600/30 w-full">
              <CardHeader>
                <CardTitle className="text-[#8A2BE2] text-2xl">Text to Speech (with Cloned Voice)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label htmlFor="tts-model-id" className="block text-sm font-medium text-gray-400 mb-1">
                    Model ID:
                  </label>
                  <input
                    id="tts-model-id"
                    type="text"
                    value={ttsModelId}
                    onChange={handleTTSModelIdChange}
                    className="w-full px-3 py-2 rounded-md bg-[#21262d] bg-opacity-60 backdrop-blur-md text-white border border-gray-600/30 focus:border-[#8A2BE2] focus:ring-[#8A2BE2]"
                  />
                </div>

                <div>
                  <label htmlFor="text-inputsTTS" className="block text-sm font-medium text-gray-400 mb-1">
                    Text Inputs 
                  </label>
                  {textInputsTTS.map((text, index) => (
                    <div key={index} className="mb-2 flex">
                      <textarea
                        id="text-inputsTTS" // Make sure the id is unique
                        className="w-full px-3 py-2 rounded-md bg-[#21262d] bg-opacity-60 backdrop-blur-md text-white border border-gray-600/30 focus:border-[#8A2BE2] focus:ring-[#8A2BE2]"
                        placeholder={`Text Input ${index + 1}`}
                        value={text}
                        onChange={e => handleTTSInputChange(index, e.target.value)}
                      />
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-[#8A2BE2] hover:bg-[#8A2BE2]/10"
                    onClick={addTTSInput}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Text Input
                  </Button>
                </div>

                <div>
                  <Button
                    onClick={generateTTS}
                    className="bg-[#8A2BE2] hover:bg-[#9370DB] text-white font-medium rounded-md px-4 py-2"
                    disabled={isGenerating}
                  >
                    {isGenerating ? 'Generating...' : 'Generate Speech'}
                  </Button>

                  {generatedAudio && (
                    <div className="mt-2 flex items-center">
                      <Button
                        onClick={downloadAudio}
                        variant="outline"
                        className="text-[#8A2BE2] hover:bg-[#8A2BE2]/10"
                      >
                        <Download className="mr-2 h-4 w-4" /> Download Audio
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </section>
        </main>

        <div className="fixed top-24 right-16 z-20">
          <VoiceAuroraAI isSpeaking={isSpeaking} />
        </div>
      </div>

      <Button
        onClick={isRecording ? stopRecording : startRecording}
        className={`microphone-button fixed bottom-4 right-4 ${
          isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-[#8A2BE2] hover:bg-[#9370DB]'
        } text-white font-medium rounded-md px-4 py-2 z-10`}
      >
        {isRecording ? 'Stop' : <Mic />}
      </Button>
    </div>
  );
}