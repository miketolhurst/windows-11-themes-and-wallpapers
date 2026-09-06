import { useThemeStore } from '../store/useThemeStore';

export default function Sidebar() {
  const { 
    accentColor, 
    setAccentColor, 
    taskbarBlur, 
    setTaskbarBlur, 
    startMenuBlur, 
    setStartMenuBlur,
    notificationBlur,
    setNotificationBlur,
    activePane, 
    setActivePane 
  } = useThemeStore();

  return (
    <div className="w-80 h-full bg-neutral-900 text-white p-6 flex flex-col gap-6 relative z-50 border-r border-neutral-800 overflow-y-auto">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Theme Inspector</h2>
        <p className="text-xs text-neutral-400 mt-1">Windows 11 Windhawk Styler Studio</p>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <label htmlFor="activePane" className="block text-sm font-medium mb-1.5 text-neutral-300">View Pane</label>
          <select 
            id="activePane"
            value={activePane} 
            onChange={(e) => setActivePane(e.target.value as 'start' | 'notifications')}
            className="w-full bg-neutral-800 p-2.5 rounded text-white border border-neutral-700 focus:outline-none focus:border-blue-500 text-sm"
          >
            <option value="start">Start Menu</option>
            <option value="notifications">Notification Center</option>
          </select>
        </div>

        <div>
          <label htmlFor="accentColor" className="block text-sm font-medium mb-1.5 text-neutral-300">Accent Color</label>
          <div className="flex items-center gap-3">
            <input 
              id="accentColor"
              type="color" 
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
              className="w-10 h-10 rounded cursor-pointer border border-neutral-700 bg-neutral-800"
            />
            <span className="text-xs font-mono text-neutral-400 uppercase">{accentColor}</span>
          </div>
        </div>

        <div>
          <label htmlFor="taskbarBlur" className="block text-sm font-medium mb-1 text-neutral-300">
            Taskbar Blur: <span className="text-blue-400 font-mono">{taskbarBlur}px</span>
          </label>
          <input 
            id="taskbarBlur"
            type="range" 
            min="0" max="30" 
            value={taskbarBlur}
            onChange={(e) => setTaskbarBlur(parseInt(e.target.value))}
            className="w-full accent-blue-500"
          />
        </div>

        <div>
          <label htmlFor="startMenuBlur" className="block text-sm font-medium mb-1 text-neutral-300">
            Start Menu Blur: <span className="text-blue-400 font-mono">{startMenuBlur}px</span>
          </label>
          <input 
            id="startMenuBlur"
            type="range" 
            min="0" max="30" 
            value={startMenuBlur}
            onChange={(e) => setStartMenuBlur(parseInt(e.target.value))}
            className="w-full accent-blue-500"
          />
        </div>

        <div>
          <label htmlFor="notificationBlur" className="block text-sm font-medium mb-1 text-neutral-300">
            Notification Blur: <span className="text-blue-400 font-mono">{notificationBlur}px</span>
          </label>
          <input 
            id="notificationBlur"
            type="range" 
            min="0" max="30" 
            value={notificationBlur}
            onChange={(e) => setNotificationBlur(parseInt(e.target.value))}
            className="w-full accent-blue-500"
          />
        </div>
      </div>
    </div>
  );
}
