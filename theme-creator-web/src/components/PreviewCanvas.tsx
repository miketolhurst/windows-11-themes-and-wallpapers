import { useThemeStore } from '../store/useThemeStore';

export default function PreviewCanvas() {
  const { 
    accentColor, 
    taskbarBlur, 
    startMenuBlur, 
    notificationBlur, 
    activePane, 
    setActivePane 
  } = useThemeStore();

  return (
    <div className="flex-1 h-full bg-gradient-to-tr from-slate-950 via-indigo-950 to-slate-900 flex flex-col justify-end relative select-none overflow-hidden font-sans">
      {/* Subtle wallpaper lighting / accent glow */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none transition-all duration-700"
        style={{
          background: `radial-gradient(circle at 50% 60%, ${accentColor} 0%, transparent 60%)`
        }}
      />

      {/* Floating Canvas Area (Start Menu or Notification Center) */}
      <div className="z-20 w-full h-[calc(100%-48px)] relative flex items-end justify-center pointer-events-none pb-3">
        {activePane === 'start' ? (
          <div 
            className="w-[580px] h-[640px] rounded-xl border border-white/10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)] flex flex-col pointer-events-auto transition-all duration-200 overflow-hidden text-white"
            style={{ 
              backgroundColor: 'rgba(24, 24, 27, 0.72)',
              backdropFilter: `blur(${startMenuBlur}px)`,
              WebkitBackdropFilter: `blur(${startMenuBlur}px)`
            }}
          >
            {/* Search Bar */}
            <div className="p-7 pb-4">
              <div className="w-full bg-neutral-900/60 border border-white/10 rounded-full py-2.5 px-4 flex items-center gap-3 text-sm text-neutral-300 shadow-inner">
                <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Search for apps, settings, and documents</span>
              </div>
            </div>

            {/* Pinned Section */}
            <div className="px-7 flex-1 flex flex-col">
              <div className="flex justify-between items-center text-xs font-semibold text-neutral-300 mb-4">
                <span>Pinned</span>
                <button className="bg-white/5 hover:bg-white/10 text-neutral-300 px-2 py-1 rounded text-[11px] border border-white/5">All apps &gt;</button>
              </div>

              <div className="grid grid-cols-6 gap-y-4 gap-x-2 text-center text-[11px] text-neutral-200">
                {[
                  { name: 'Edge', icon: '🌐' },
                  { name: 'Word', icon: '📝' },
                  { name: 'Excel', icon: '📊' },
                  { name: 'PowerPoint', icon: '📑' },
                  { name: 'Store', icon: '🛍️' },
                  { name: 'Photos', icon: '🖼️' },
                  { name: 'Settings', icon: '⚙️' },
                  { name: 'Xbox', icon: '🎮' },
                  { name: 'Spotify', icon: '🎵' },
                  { name: 'VS Code', icon: '💻' },
                  { name: 'Terminal', icon: '⌨️' },
                  { name: 'Windhawk', icon: '🦅' },
                ].map((app, i) => (
                  <div key={i} className="flex flex-col items-center gap-1.5 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                    <span className="text-2xl drop-shadow">{app.icon}</span>
                    <span className="truncate w-full">{app.name}</span>
                  </div>
                ))}
              </div>

              {/* Recommended Section */}
              <div className="mt-6 flex justify-between items-center text-xs font-semibold text-neutral-300 mb-3">
                <span>Recommended</span>
                <button className="bg-white/5 hover:bg-white/10 text-neutral-300 px-2 py-1 rounded text-[11px] border border-white/5">More &gt;</button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[12px] text-neutral-300">
                <div className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                  <span className="text-lg">📄</span>
                  <div className="flex flex-col text-left">
                    <span className="font-medium text-white text-xs truncate">Windhawk_Theme_Spec.pdf</span>
                    <span className="text-[10px] text-neutral-400">12m ago</span>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                  <span className="text-lg">🎨</span>
                  <div className="flex flex-col text-left">
                    <span className="font-medium text-white text-xs truncate">Cyberpunk_Neon.xaml</span>
                    <span className="text-[10px] text-neutral-400">Yesterday at 4:20 PM</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Profile Bar */}
            <div 
              className="mt-auto px-7 py-3.5 border-t border-white/5 flex items-center justify-between"
              style={{ backgroundColor: 'rgba(15, 15, 18, 0.85)' }}
            >
              <div className="flex items-center gap-3 cursor-pointer hover:bg-white/5 p-1.5 px-2.5 rounded-lg transition-colors">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow"
                  style={{ backgroundColor: accentColor }}
                >
                  U
                </div>
                <span className="text-xs font-medium text-white">Windows User</span>
              </div>

              <button className="p-2 rounded-lg hover:bg-white/10 transition-colors text-neutral-300">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <div 
            className="w-[380px] h-[580px] absolute right-3 bottom-0 rounded-xl border border-white/10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)] flex flex-col pointer-events-auto transition-all duration-200 overflow-hidden text-white"
            style={{ 
              backgroundColor: 'rgba(24, 24, 27, 0.72)',
              backdropFilter: `blur(${notificationBlur}px)`,
              WebkitBackdropFilter: `blur(${notificationBlur}px)`
            }}
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-white/5 flex justify-between items-center text-xs text-neutral-300 font-semibold">
              <span>Notifications</span>
              <button className="text-[11px] text-neutral-400 hover:text-white transition-colors">Clear all</button>
            </div>

            {/* Notifications List */}
            <div className="p-4 flex-1 flex flex-col gap-2.5 overflow-y-auto">
              <div className="bg-neutral-900/60 border border-white/10 rounded-lg p-3 text-left shadow-sm">
                <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-1">
                  <span className="font-semibold text-white flex items-center gap-1.5">🦅 Windhawk Engine</span>
                  <span>Just now</span>
                </div>
                <p className="text-xs text-neutral-200">New Styler mod configuration applied smoothly.</p>
              </div>

              <div className="bg-neutral-900/60 border border-white/10 rounded-lg p-3 text-left shadow-sm">
                <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-1">
                  <span className="font-semibold text-white flex items-center gap-1.5">⚡ Windows 11</span>
                  <span>10m ago</span>
                </div>
                <p className="text-xs text-neutral-200">Custom AccentPalette loaded into HKCU.</p>
              </div>

              {/* Calendar Snippet */}
              <div className="mt-auto pt-3 border-t border-white/5">
                <div className="text-xs font-semibold text-neutral-300 mb-2 flex justify-between items-center">
                  <span>September 2026</span>
                  <div className="flex gap-2 text-neutral-400 text-xs">
                    <button className="hover:text-white">&lt;</button>
                    <button className="hover:text-white">&gt;</button>
                  </div>
                </div>
                <div className="grid grid-cols-7 text-center text-[10px] text-neutral-400 gap-y-1">
                  <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                    <span 
                      key={d} 
                      className={`py-1 rounded-full text-[10px] ${
                        d === 7 
                          ? 'text-white font-bold' 
                          : 'text-neutral-300 hover:bg-white/5 cursor-pointer'
                      }`}
                      style={d === 7 ? { backgroundColor: accentColor } : {}}
                    >
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Windows 11 Taskbar */}
      <div 
        className="h-12 w-full z-30 border-t border-white/10 flex items-center justify-between px-4 transition-all duration-300"
        style={{ 
          backgroundColor: 'rgba(20, 20, 24, 0.65)',
          backdropFilter: `blur(${taskbarBlur}px)`,
          WebkitBackdropFilter: `blur(${taskbarBlur}px)`
        }}
      >
        {/* Left Weather Widget Area */}
        <div className="flex items-center gap-2 cursor-pointer hover:bg-white/5 px-2.5 py-1.5 rounded text-neutral-300 text-xs transition-colors">
          <span>🌤️</span>
          <div className="flex flex-col text-[11px] leading-tight">
            <span className="font-semibold text-white">22°C</span>
            <span className="text-neutral-400 text-[9px]">Mostly Sunny</span>
          </div>
        </div>

        {/* Center App Icons & Start Button */}
        <div className="flex items-center gap-1.5">
          {/* Start Button */}
          <button 
            onClick={() => setActivePane(activePane === 'start' ? 'notifications' : 'start')}
            className={`w-10 h-10 rounded-md flex items-center justify-center transition-all ${
              activePane === 'start' ? 'bg-white/15' : 'hover:bg-white/10'
            }`}
            title="Start"
          >
            <div 
              className="w-5 h-5 grid grid-cols-2 gap-0.5 rounded-sm p-0.5 transition-colors"
              style={{ backgroundColor: accentColor }}
            >
              <div className="bg-white rounded-xs"></div>
              <div className="bg-white rounded-xs"></div>
              <div className="bg-white rounded-xs"></div>
              <div className="bg-white rounded-xs"></div>
            </div>
          </button>

          {/* Taskbar Icons */}
          {['🔍', '📂', '🌐', '💬', '🎵'].map((icon, idx) => (
            <div 
              key={idx}
              className="w-10 h-10 rounded-md flex items-center justify-center text-lg hover:bg-white/10 cursor-pointer transition-colors"
            >
              {icon}
            </div>
          ))}
        </div>

        {/* Right System Tray */}
        <div className="flex items-center gap-1 text-neutral-200">
          <div className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/5 cursor-pointer text-xs transition-colors">
            <span>🔊</span>
            <span>📶</span>
            <span>🔋</span>
          </div>

          <button 
            onClick={() => setActivePane(activePane === 'notifications' ? 'start' : 'notifications')}
            className={`flex flex-col items-end px-2 py-1 rounded text-right transition-colors ${
              activePane === 'notifications' ? 'bg-white/15' : 'hover:bg-white/5'
            }`}
            title="Notification Center & Calendar"
          >
            <span className="text-[11px] font-medium leading-none">9:41 AM</span>
            <span className="text-[10px] text-neutral-400 leading-none mt-1">9/7/2026</span>
          </button>
        </div>
      </div>
    </div>
  );
}
