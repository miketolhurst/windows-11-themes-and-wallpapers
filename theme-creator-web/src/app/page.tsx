'use client';

import Sidebar from '../components/Sidebar';
import PreviewCanvas from '../components/PreviewCanvas';
import { useThemeStore } from '../store/useThemeStore';
import { generateZipPayload } from '../lib/exportEngine';

export default function Home() {
  const state = useThemeStore();

  const handleDownload = async () => {
    const blob = await generateZipPayload(state);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const slug = (state.themeName || 'Theme').replace(/[^a-zA-Z0-9_-]/g, '_');
    a.download = `Windhawk_${slug}_Theme.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="flex h-screen w-screen overflow-hidden bg-black font-sans relative">
      <Sidebar />
      <PreviewCanvas />
      
      <div className="absolute top-4 right-4 z-50 flex items-center gap-3">
        <button 
          onClick={handleDownload}
          className="bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-sm px-5 py-2.5 rounded-lg shadow-xl font-semibold tracking-wide flex items-center gap-2 transition-all cursor-pointer border border-blue-400/30"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span>Download Theme (.zip)</span>
        </button>
      </div>
    </main>
  );
}
