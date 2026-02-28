import { useUI } from '../hooks/useUI';
import { X, Bell, CheckCircle, WarningCircle, Info, Warning } from '@phosphor-icons/react';
import { useEffect, useState } from 'react';

const icons = {
  info: Info,
  success: CheckCircle,
  warning: Warning,
  error: WarningCircle,
};

const colors = {
  info: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
  success: 'bg-green-500/10 border-green-500/20 text-green-400',
  warning: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
  error: 'bg-red-500/10 border-red-500/20 text-red-400',
};

export function NotificationCenter() {
  const { notifications, dismissNotification } = useUI();
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => Date.now() - n.timestamp < 60000).length;

  // Auto-dismiss notifications after 5 seconds
  useEffect(() => {
    const timers = notifications.map(n => 
      setTimeout(() => dismissNotification(n.id), 5000)
    );
    return () => timers.forEach(clearTimeout);
  }, [notifications, dismissNotification]);

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl glass-card hover:border-orange-500/30 transition-all duration-300 group"
      >
        <Bell className="w-5 h-5 text-zinc-400 group-hover:text-orange-400 transition-colors" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center animate-pulse shadow-lg shadow-orange-500/30">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 glass-card-strong rounded-2xl border border-zinc-800/50 shadow-2xl shadow-black/50 z-50 animate-slide-in-up">
            <div className="flex items-center justify-between p-4 border-b border-zinc-800/50">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-orange-400" />
                Notifications
              </h3>
              {notifications.length > 0 && (
                <button
                  onClick={() => notifications.forEach(n => dismissNotification(n.id))}
                  className="text-xs text-zinc-500 hover:text-orange-400 transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>
            
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-zinc-500">
                  <Bell className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No notifications</p>
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {notifications.map((notification) => {
                    const Icon = icons[notification.type];
                    return (
                      <div
                        key={notification.id}
                        className={`p-3 rounded-xl border ${colors[notification.type]} animate-fadeIn group relative`}
                      >
                        <button
                          onClick={() => dismissNotification(notification.id)}
                          className="absolute top-2 right-2 p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-all"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <div className="flex items-start gap-3 pr-6">
                          <Icon className="w-5 h-5 shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <p className="font-medium text-sm">{notification.title}</p>
                            {notification.message && (
                              <p className="text-xs opacity-80 mt-0.5 line-clamp-2">{notification.message}</p>
                            )}
                            <p className="text-[10px] opacity-50 mt-1">
                              {new Date(notification.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
