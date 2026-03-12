import { useUI } from '../hooks/useUI';
import { X, Bell, CheckCircle, WarningCircle, Info, Warning } from '@phosphor-icons/react';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const icons = { info: Info, success: CheckCircle, warning: Warning, error: WarningCircle };

const colors = {
  info: 'bg-blue-500/6 border-blue-500/10 text-blue-400',
  success: 'bg-emerald-500/6 border-emerald-500/10 text-emerald-400',
  warning: 'bg-amber-500/6 border-amber-500/10 text-amber-400',
  error: 'bg-red-500/6 border-red-500/10 text-red-400',
};

export function NotificationCenter() {
  const { notifications, dismissNotification } = useUI();
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => Date.now() - n.timestamp < 60000).length;

  useEffect(() => {
    const timers = notifications.map(n => setTimeout(() => dismissNotification(n.id), 5000));
    return () => timers.forEach(clearTimeout);
  }, [notifications, dismissNotification]);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative touch-target p-2 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-colors"
      >
        <Bell className="w-4 h-4 text-zinc-500" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF4D00] rounded-full text-[9px] font-bold text-white flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="absolute right-0 top-full mt-2 w-72 bg-[#0A0A0C] rounded-xl border border-zinc-800/60 shadow-2xl shadow-black/50 z-50 overflow-hidden"
            >
              <div className="flex items-center justify-between p-3 border-b border-zinc-800/50">
                <h3 className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-zinc-500" />
                  Notifications
                </h3>
                {notifications.length > 0 && (
                  <button onClick={() => notifications.forEach(n => dismissNotification(n.id))} className="text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors">
                    Clear all
                  </button>
                )}
              </div>

              <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-zinc-700 text-xs">No notifications</div>
                ) : (
                  <div className="p-1.5 space-y-0.5">
                    {notifications.map((n) => {
                      const NIcon = icons[n.type];
                      return (
                        <div key={n.id} className={`p-2.5 rounded-lg border ${colors[n.type]} group relative`}>
                          <button
                            onClick={() => dismissNotification(n.id)}
                            className="absolute top-2 right-2 p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-white/5 transition-all"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          <div className="flex items-start gap-2.5 pr-5">
                            <NIcon className="w-4 h-4 shrink-0 mt-0.5" />
                            <div className="min-w-0">
                              <p className="font-medium text-xs">{n.title}</p>
                              {n.message && <p className="text-[11px] opacity-70 mt-0.5 line-clamp-2">{n.message}</p>}
                              <p className="text-[10px] opacity-40 mt-1 tabular-nums">{new Date(n.timestamp).toLocaleTimeString()}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
