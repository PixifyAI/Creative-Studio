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
  Terminal,
  Globe,
} from 'lucide-react';
import Link from 'next/link';
import * as THREE from 'three';
import CELLS from 'vanta/dist/vanta.cells.min';
import axios from 'axios';
import BrowserFS from 'browserfs';
import * as path from 'path';
import { Terminal as XTermComponent } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';

// --- GPT-Pilot Code Adaptation (More Complete Example - BrowserFS) ---

// Project Manager (adapted from core/agents/project_manager.py)
class ProjectManager {
  async initializeProject(projectName: string) {
    // Initialize BrowserFS (if not already initialized)
    if (!BrowserFS.BFSRequire('fs')) {
      await new Promise((resolve, reject) => {
        BrowserFS.install(window);
        BrowserFS.configure({
          fs: "InMemory",
          options: {}
        }, (e) => {
          if (e) {
            reject(e);
          } else {
            resolve(null);
          }
        });
      });
    }

    const fs = BrowserFS.BFSRequire('fs');
    const projectPath = path.join('/', projectName);

    if (!fs.existsSync(projectPath)) {
      fs.mkdirSync(projectPath);
      console.log(`Project directory "${projectName}" created (in BrowserFS).`);
    } else {
      console.log(`Project directory "${projectName}" already exists (in BrowserFS).`);
    }
    // ... Add more initialization logic as needed from GPT-Pilot ...
  }
}

// Coding Agent (adapted from core/agents/coding_agent.py)
class CodingAgent {
  generateCodePrompt(projectName: string, codeDescription: string) {
    return `
    Project: ${projectName}

    Task: ${codeDescription}

    Generate the code to achieve the task.
    `;
  }
}

// File Manager (adapted from core/agents/file_manager.py)
class FileManager {
  async writeCodeToFile(projectName: string, generatedCode: string) {
    const fs = BrowserFS.BFSRequire('fs');
    const filePath = path.join('/', projectName, 'generated_code.txt');

    try {
      fs.writeFileSync(filePath, generatedCode);
      console.log(`Code written to file (in BrowserFS): ${filePath}`);
    } catch (error) {
      console.error(`Error writing code to file (in BrowserFS):`, error);
      // Handle the error (e.g., display an error message)
    }
  }
}
// --- End of GPT-Pilot Code Adaptation ---

export default function AgentCoderPage() {
  const [activeTab, setActiveTab] = useState('gallery');
  const [projectName, setProjectName] = useState('');
  const [codeDescription, setCodeDescription] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('Claude 3 Opus (claude-3-opus-20240229)');
  const [terminalOutput, setTerminalOutput] = useState('');
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTermComponent | null>(null); 
  const fitAddonRef = useRef<FitAddon | null>(null);

  const vantaRef = useRef<HTMLDivElement>(null);
  const [vantaEffect, setVantaEffect] = useState<any>(null);

  const [browserURL, setBrowserURL] = useState('https://docs.perplexity.ai/docs/getting-started'); // Initial URL
  const browserRef = useRef<HTMLIFrameElement>(null);


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

  // Initialize xterm.js only once 
  useEffect(() => {
    if (terminalRef.current && !xtermRef.current) {
      const term = new XTermComponent();
      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);

      term.open(terminalRef.current);
      fitAddon.fit();

      xtermRef.current = term;
      fitAddonRef.current = fitAddon;

      term.write('$ ls -la\r\n-rw-r--r-- 1 user group 2.4k Mar 18 15:06 benchmark_llama2.py\r\n$ ');
    }

    // Window resize listener
    const handleResize = () => {
      if (fitAddonRef.current) {
        fitAddonRef.current.fit(); 
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const projectManager = new ProjectManager();
  const codingAgent = new CodingAgent();
  const fileManager = new FileManager();

  const handleGenerateCode = async () => {
    setIsLoading(true);
    try {
      await projectManager.initializeProject(projectName);
      const prompt = codingAgent.generateCodePrompt(projectName, codeDescription);

      // --- LLM Inference (using LM Studio API) ---
      const response = await axios.post('http://127.0.0.1:1234/v1/chat/completions', {
        model: "lmstudio-community/Meta-Llama-3.1-8B-Instruct-GGUF/Meta-Llama-3.1-8B-Instruct-Q8_0.gguf",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: -1,
        stream: false,
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const code = response.data.choices[0].message.content;
      // --- End of LLM Inference ---

      setGeneratedCode(code);
      await fileManager.writeCodeToFile(projectName, code);
      // Update terminal output (append to existing content) - Use xtermRef 
      if (xtermRef.current) {
        xtermRef.current.write(`\r\n$ Created file: ${projectName}.py\r\n$ `);
      }
    } catch (error) {
      console.error("Error generating code:", error);
      // Update terminal output (append to existing content) - Use xtermRef
      if (xtermRef.current) {
        xtermRef.current.write(`\r\n$ Error: Failed to generate code\r\n$ `);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle URL changes in the browser
  const handleURLChange = (e: any) => {
    setBrowserURL(e.target.value);
  };

  // Function to load a new URL in the iframe
  const loadURL = () => {
    if (browserRef.current) {
      browserRef.current.src = browserURL;
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
        <main className="flex-1 p-8 overflow-auto">
          <header className="flex justify-between items-center mb-8">
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

          {/* 4g3nt c0d3r Section */}
          <section className="mb-12 relative overflow-hidden">
            <h2 className="text-[#8A2BE2] mb-2">4g3nt c0d3r: Your AI Coding Partner</h2>
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-[#4B0082] to-[#0000FF] text-transparent bg-clip-text">
              Generate Code with AI
            </h1>
          </section>

          {/* Code Generation Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {/* Project Name & Description Card */}
            <Card className="bg-[#21262d] bg-opacity-60 backdrop-blur-md p-6 hover:bg-opacity-80 transition-colors duration-300 rounded-lg border border-gray-600/30">
              <h3 className="text-xl font-semibold mb-2 text-[#8A2BE2]">
                Model Selection
              </h3>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full bg-gray-800 rounded-md p-2 focus:outline-none mb-4"
              >
                <option>Claude 3 Opus (claude-3-opus-20240229)</option>
                <option>GPT-4</option>
                <option>Llama 2</option>
              </select>

              <h3 className="text-xl font-semibold mb-2 text-[#8A2BE2]">
                Project Name
              </h3>
              <input
                type="text"
                className="w-full bg-gray-800 rounded-md p-2 focus:outline-none mb-4"
                placeholder="Enter your project name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />

              <h3 className="text-xl font-semibold mb-2 text-[#8A2BE2]">
                Code Description
              </h3>
              <textarea
                className="w-full bg-gray-800 rounded-md p-2 focus:outline-none mb-4"
                rows={5}
                placeholder="Describe the code you want to generate"
                value={codeDescription}
                onChange={(e) => setCodeDescription(e.target.value)}
              />

              <Button
                onClick={handleGenerateCode}
                disabled={isLoading || !projectName || !codeDescription}
                className="w-full bg-gradient-to-r from-[#4B0082] to-[#0000FF] text-white font-bold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity duration-300"
              >
                {isLoading ? 'Generating...' : 'Generate Code'}
              </Button>
            </Card>

            {/* Browser and Terminal Card */}
            <Card className="bg-[#21262d] bg-opacity-60 backdrop-blur-md p-6 hover:bg-opacity-80 transition-colors duration-300 rounded-lg border border-gray-600/30">
              {/* Browser Section (with iframe) */}
              <div className="mb-4">
                <h3 className="text-xl font-semibold mb-2 text-[#8A2BE2] flex items-center">
                  <Globe className="mr-2" size={20} />
                  Browser
                </h3>
                <div className="flex items-center mb-2">
                  <input
                    type="text"
                    className="w-full bg-gray-800 rounded-md p-2 focus:outline-none mr-2"
                    placeholder="Enter URL"
                    value={browserURL}
                    onChange={handleURLChange}
                  />
                  <Button onClick={loadURL}>Go</Button>
                </div>
                <iframe
                  ref={browserRef}
                  src={browserURL}
                  className="w-full h-48 border rounded-md"
                />
              </div>

              {/* Terminal Section (xterm.js) */}
              <div>
                <h3 className="text-xl font-semibold mb-2 text-[#8A2BE2] flex items-center">
                  <Terminal className="mr-2" size={20} />
                  Terminal
                </h3>
                <div
                  ref={terminalRef}
                  className="bg-black text-green-400 p-4 rounded-md h-48 overflow-auto font-mono text-sm"
                />
              </div>
            </Card>
          </div>

          {/* Generated Code Card */}
          <Card className="bg-[#21262d] bg-opacity-60 backdrop-blur-md p-6 hover:bg-opacity-80 transition-colors duration-300 rounded-lg border border-gray-600/30">
            <h3 className="text-xl font-semibold mb-2 text-[#8A2BE2]">
              Generated Code
            </h3>
            <textarea
              className="w-full bg-gray-800 rounded-md p-2 focus:outline-none mb-4 font-mono"
              rows={10}
              value={generatedCode}
              readOnly
            />
          </Card>
        </main>
      </div>
    </div>
  );
}