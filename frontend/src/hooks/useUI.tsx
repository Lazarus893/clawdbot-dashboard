import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message?: string;
  timestamp: number;
}

interface UIState {
  // Theme
  isDarkMode: boolean;
  toggleTheme: () => void;
  
  // Notifications
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  dismissNotification: (id: string) => void;
  
  // Command Palette
  isCommandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  
  // Session Drawer
  selectedSession: string | null;
  setSelectedSession: (key: string | null) => void;
  
  // Logs Panel
  isLogsPanelOpen: boolean;
  setLogsPanelOpen: (open: boolean) => void;
  logs: LogEntry[];
  addLog: (entry: Omit<LogEntry, 'id' | 'timestamp'>) => void;
}

interface LogEntry {
  id: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  source: string;
  timestamp: number;
}

const UIContext = createContext<UIState | null>(null);

export function UIProvider({ children }: { children: ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [isLogsPanelOpen, setLogsPanelOpen] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const toggleTheme = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const id = Math.random().toString(36).substring(7);
    setNotifications(prev => [{ ...notification, id, timestamp: Date.now() }, ...prev].slice(0, 50));
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const addLog = useCallback((entry: Omit<LogEntry, 'id' | 'timestamp'>) => {
    const id = Math.random().toString(36).substring(7);
    setLogs(prev => [{ ...entry, id, timestamp: Date.now() }, ...prev].slice(0, 1000));
  }, []);

  return (
    <UIContext.Provider value={{
      isDarkMode,
      toggleTheme,
      notifications,
      addNotification,
      dismissNotification,
      isCommandPaletteOpen,
      setCommandPaletteOpen,
      selectedSession,
      setSelectedSession,
      isLogsPanelOpen,
      setLogsPanelOpen,
      logs,
      addLog,
    }}>
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (!context) throw new Error('useUI must be used within UIProvider');
  return context;
}
