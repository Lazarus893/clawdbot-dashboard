import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCcpsProviders, switchCcpsProvider, type CcProvider } from '../hooks/useOpenClawAPI';
import {
  ArrowsClockwise,
  CheckCircle,
  CircleNotch,
  Globe,
  Lightning,
  ShieldCheck,
} from '@phosphor-icons/react';

function ProviderCard({
  provider,
  isSwitching,
  onSwitch,
}: {
  provider: CcProvider;
  isSwitching: boolean;
  onSwitch: (p: CcProvider) => void;
}) {
  const isOfficial = provider.name.toLowerCase().includes('official') || provider.baseUrl.includes('anthropic.com');

  return (
    <motion.button
      layout
      onClick={() => !provider.isCurrent && !isSwitching && onSwitch(provider)}
      disabled={provider.isCurrent || isSwitching}
      className={`
        w-full text-left card p-4 transition-all
        ${provider.isCurrent
          ? 'border-[#FF4D00]/30 bg-[#FF4D00]/[0.03]'
          : 'hover:border-zinc-600 cursor-pointer'
        }
        ${isSwitching ? 'opacity-60' : ''}
      `}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`
            w-10 h-10 rounded-lg flex items-center justify-center shrink-0
            ${provider.isCurrent ? 'bg-[#FF4D00]/10' : 'bg-zinc-800/60'}
          `}>
            {isOfficial
              ? <ShieldCheck className={`w-5 h-5 ${provider.isCurrent ? 'text-[#FF4D00]' : 'text-zinc-400'}`} />
              : <Lightning className={`w-5 h-5 ${provider.isCurrent ? 'text-[#FF4D00]' : 'text-zinc-400'}`} />
            }
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm text-zinc-200 truncate">{provider.name}</span>
              {provider.isCurrent && (
                <span className="shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 bg-[#FF4D00]/10 text-[#FF4D00] rounded text-[10px] font-semibold uppercase tracking-wider border border-[#FF4D00]/15">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF4D00] status-dot-active" />
                  Active
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-zinc-500">
              <Globe className="w-3 h-3 shrink-0" />
              <span className="truncate font-mono">{provider.baseUrl || 'N/A'}</span>
            </div>
          </div>
        </div>

        {!provider.isCurrent && (
          <div className="shrink-0">
            {isSwitching ? (
              <CircleNotch className="w-5 h-5 text-zinc-500 animate-spin" />
            ) : (
              <span className="text-xs text-zinc-600 group-hover:text-zinc-400 whitespace-nowrap">
                Switch
              </span>
            )}
          </div>
        )}

        {provider.isCurrent && (
          <CheckCircle weight="fill" className="w-5 h-5 text-[#FF4D00] shrink-0" />
        )}
      </div>
    </motion.button>
  );
}

export function ClaudeCodeSwitcher() {
  const { providers, loading, error, refetch } = useCcpsProviders();
  const [switching, setSwitching] = useState<string | null>(null);
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSwitch = async (provider: CcProvider) => {
    setSwitching(provider.id);
    setResult(null);

    try {
      const res = await switchCcpsProvider(provider.name);
      if (res.success) {
        setResult({ type: 'success', message: `Switched to ${res.name || provider.name}` });
        refetch();
      } else {
        setResult({ type: 'error', message: res.error || 'Switch failed' });
      }
    } catch {
      setResult({ type: 'error', message: 'Network error' });
    } finally {
      setSwitching(null);
      setTimeout(() => setResult(null), 4000);
    }
  };

  if (loading) {
    return (
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="skeleton skeleton-circle w-4 h-4" />
          <div className="skeleton skeleton-text w-48" />
        </div>
        <div className="space-y-2">
          {[1, 2].map(i => (
            <div key={i} className="skeleton-card p-4">
              <div className="flex items-center gap-3">
                <div className="skeleton w-10 h-10 rounded-lg" />
                <div className="space-y-1.5 flex-1">
                  <div className="skeleton skeleton-text w-28" />
                  <div className="skeleton skeleton-text w-48" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-5 text-center">
        <p className="text-sm text-red-400 mb-2">Failed to load providers</p>
        <button onClick={refetch} className="btn btn-ghost text-xs">
          <ArrowsClockwise className="w-3.5 h-3.5" /> Retry
        </button>
      </div>
    );
  }

  if (providers.length === 0) return null;

  const currentProvider = providers.find(p => p.isCurrent);

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Lightning className="w-4 h-4 text-[#FF4D00]" />
          <h4 className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
            Claude Code Provider
          </h4>
        </div>
        <button
          onClick={refetch}
          className="p-1.5 text-zinc-600 hover:text-zinc-400 rounded-lg hover:bg-zinc-800/50 transition-colors"
        >
          <ArrowsClockwise className="w-3.5 h-3.5" />
        </button>
      </div>

      {currentProvider && (
        <p className="text-[11px] text-zinc-600 mb-3">
          Current: <span className="text-zinc-400 font-medium">{currentProvider.name}</span>
        </p>
      )}

      <div className="space-y-2">
        {providers.map((provider) => (
          <ProviderCard
            key={provider.id}
            provider={provider}
            isSwitching={switching === provider.id}
            onSwitch={handleSwitch}
          />
        ))}
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className={`mt-3 px-3 py-2 rounded-lg text-xs font-medium ${
              result.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15'
                : 'bg-red-500/10 text-red-400 border border-red-500/15'
            }`}
          >
            {result.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
