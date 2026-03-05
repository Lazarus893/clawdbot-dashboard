import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cpu,
  CheckCircle,
  CircleNotch,
  ArrowsClockwise,
  CaretDown,
  Lightning,
  Star,
  Shield,
  Eye,
  Sparkle,
} from '@phosphor-icons/react';
import { useModels, useModelStatus, setModelAndRestart, type ModelInfo, type ModelStatus } from '../hooks/useOpenClawAPI';

function formatContextWindow(tokens: number): string {
  if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(0)}M`;
  return `${(tokens / 1000).toFixed(0)}K`;
}

function getProviderColor(key: string): { bg: string; text: string; border: string } {
  const provider = key.split('/')[0];
  const map: Record<string, { bg: string; text: string; border: string }> = {
    zai: { bg: 'bg-blue-500/8', text: 'text-blue-400', border: 'border-blue-500/15' },
    moonshot: { bg: 'bg-violet-500/8', text: 'text-violet-400', border: 'border-violet-500/15' },
    'minimax-cn': { bg: 'bg-emerald-500/8', text: 'text-emerald-400', border: 'border-emerald-500/15' },
    anthropic: { bg: 'bg-amber-500/8', text: 'text-amber-400', border: 'border-amber-500/15' },
    openai: { bg: 'bg-green-500/8', text: 'text-green-400', border: 'border-green-500/15' },
  };
  return map[provider] || { bg: 'bg-zinc-500/8', text: 'text-zinc-400', border: 'border-zinc-500/15' };
}

export function ModelSwitcher() {
  const { models, loading: modelsLoading, refetch: refetchModels } = useModels();
  const { status: remoteStatus, loading: statusLoading, refetch: refetchStatus } = useModelStatus();
  const [localOverride, setLocalOverride] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [switching, setSwitching] = useState<string | null>(null);
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const activeModel = localOverride || remoteStatus?.defaultModel;
  const status: ModelStatus | null = remoteStatus
    ? { ...remoteStatus, defaultModel: activeModel || remoteStatus.defaultModel }
    : null;

  useEffect(() => {
    if (localOverride && remoteStatus?.defaultModel === localOverride) setLocalOverride(null);
  }, [remoteStatus?.defaultModel, localOverride]);

  useEffect(() => {
    if (isOpen && models.length === 0) { refetchModels(); refetchStatus(); }
  }, [isOpen, models.length, refetchModels, refetchStatus]);

  useEffect(() => {
    if (result) { const t = setTimeout(() => setResult(null), 4000); return () => clearTimeout(t); }
  }, [result]);

  const handleSwitch = async (model: ModelInfo) => {
    if (model.key === activeModel) return;
    setSwitching(model.key);
    setResult(null);
    try {
      const res = await setModelAndRestart(model.key);
      if (res.success) {
        setLocalOverride(model.key);
        setResult({ type: 'success', message: `Switched to ${model.name}${res.gatewayRestarted ? ', gateway restarted' : ''}` });
        setIsOpen(false);
        setTimeout(() => refetchStatus(), 5000);
      } else {
        setResult({ type: 'error', message: res.error || 'Failed to switch' });
      }
    } catch (err: any) {
      setResult({ type: 'error', message: err.message || 'Network error' });
    } finally {
      setSwitching(null);
    }
  };

  const currentModel = models.find(m => m.key === activeModel);
  const loading = modelsLoading || statusLoading;

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-3 px-4 py-3 rounded-xl card w-full transition-colors
          ${isOpen ? 'border-[#FF4D00]/20' : ''}
        `}
      >
        <div className="w-8 h-8 rounded-lg bg-[#FF4D00]/8 flex items-center justify-center">
          <Cpu className="w-4 h-4 text-[#FF4D00]" />
        </div>
        <div className="flex-1 text-left min-w-0">
          <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-medium">Active Model</p>
          {loading && !currentModel ? (
            <div className="h-4 w-28 bg-zinc-800/50 rounded animate-pulse mt-0.5" />
          ) : (
            <p className="text-sm font-medium text-zinc-200 truncate">
              {currentModel?.name || status?.defaultModel || 'Unknown'}
            </p>
          )}
        </div>
        <CaretDown className={`w-4 h-4 text-zinc-600 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Toast */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className={`absolute -top-11 left-0 right-0 px-3 py-1.5 rounded-lg text-xs font-medium text-center border
              ${result.type === 'success' ? 'bg-emerald-500/8 text-emerald-400 border-emerald-500/15' : 'bg-red-500/8 text-red-400 border-red-500/15'}
            `}
          >
            {result.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="absolute top-full left-0 right-0 mt-2 z-50 bg-[#0A0A0C] rounded-xl border border-zinc-800/60 shadow-2xl shadow-black/50 overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800/50">
              <div className="flex items-center gap-1.5">
                <Sparkle className="w-3.5 h-3.5 text-[#FF4D00]" />
                <h3 className="text-xs font-medium text-zinc-300">Switch Model</h3>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); refetchModels(); refetchStatus(); }}
                className="p-1 rounded-lg hover:bg-zinc-800/50 text-zinc-600 hover:text-zinc-400 transition-colors"
              >
                <ArrowsClockwise className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="max-h-[360px] overflow-y-auto p-1.5 space-y-0.5">
              {models.length === 0 && loading ? (
                <div className="space-y-1.5 p-2">
                  {[1, 2, 3].map(i => <div key={i} className="h-14 bg-zinc-800/30 rounded-lg animate-pulse" />)}
                </div>
              ) : (
                models.map((model) => {
                  const isCurrent = model.key === activeModel;
                  const isSwitching = switching === model.key;
                  const isFallback = status?.fallbacks?.includes(model.key);
                  const color = getProviderColor(model.key);
                  const provider = model.key.split('/')[0];

                  return (
                    <button
                      key={model.key}
                      onClick={() => handleSwitch(model)}
                      disabled={isCurrent || !!switching}
                      className={`
                        w-full flex items-center gap-3 p-2.5 rounded-lg transition-colors duration-100 text-left
                        ${isCurrent ? 'bg-[#FF4D00]/5 border border-[#FF4D00]/15' : 'hover:bg-zinc-800/40 border border-transparent'}
                        ${switching && !isSwitching ? 'opacity-30 pointer-events-none' : ''}
                      `}
                    >
                      <div className={`w-9 h-9 rounded-lg ${color.bg} border ${color.border} flex items-center justify-center shrink-0`}>
                        <span className={`text-[10px] font-bold ${color.text} uppercase`}>{provider.slice(0, 3)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-medium text-sm ${isCurrent ? 'text-[#FF4D00]' : 'text-zinc-200'}`}>{model.name}</span>
                          {isCurrent && (
                            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[#FF4D00]/10 text-[#FF4D00] text-[9px] font-bold">
                              <Star weight="fill" className="w-2 h-2" /> ACTIVE
                            </span>
                          )}
                          {isFallback && !isCurrent && (
                            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-zinc-800/60 text-zinc-600 text-[9px]">
                              <Shield className="w-2 h-2" /> fallback
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2.5 mt-0.5 text-[10px] text-zinc-600">
                          <span className="font-mono">{model.key}</span>
                          <span className="flex items-center gap-0.5">
                            <Lightning className="w-2.5 h-2.5" /> {formatContextWindow(model.contextWindow)} ctx
                          </span>
                          {model.input.includes('image') && (
                            <span className="flex items-center gap-0.5 text-violet-400">
                              <Eye className="w-2.5 h-2.5" /> vision
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="shrink-0">
                        {isSwitching ? <CircleNotch className="w-4 h-4 text-[#FF4D00] animate-spin" /> :
                         isCurrent ? <CheckCircle weight="fill" className="w-4 h-4 text-[#FF4D00]" /> :
                         <div className="w-4 h-4 rounded-full border-2 border-zinc-800" />}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            <div className="px-4 py-2 border-t border-zinc-800/50 text-[10px] text-zinc-700 flex items-center justify-between">
              <span>Switching restarts the gateway</span>
              <span className="tabular-nums">{models.length} models</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}
    </div>
  );
}
