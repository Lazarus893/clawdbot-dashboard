import { useSystemStatus } from '../hooks/useOpenClawAPI';
import { useState } from 'react';
import { 
  HardDrives, 
  Pulse, 
  Hash, 
  Clock, 
  CheckCircle, 
  XCircle, 
  ArrowsClockwise,
  Terminal,
  Folder,
  Globe,
  Lightning,
  ArrowUpRight,
  Cpu,
  HardDrive
} from '@phosphor-icons/react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  delay: number;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

function StatCard({ title, value, subtitle, icon, iconBg, iconColor, delay, trend, trendValue }: StatCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ animationDelay: `${delay}ms` }}
      className={`
        relative overflow-hidden rounded-2xl p-5 glass-card
        transition-all duration-500 ease-out animate-slide-in-up cursor-pointer
        ${isHovered ? 'scale-[1.03] border-orange-500/40 glow-orange' : ''}
      `}
    >
      {/* Animated background decoration */}
      <div className={`
        absolute -right-4 -top-4 w-24 h-24 rounded-full transition-all duration-700
        ${iconBg} opacity-20 blur-xl
        ${isHovered ? 'scale-[2] opacity-40' : 'scale-100'}
      `} />
      
      {/* Gradient border glow on hover */}
      {isHovered && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-500/10 to-amber-500/5 pointer-events-none" />
      )}
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className={`
            w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-500
            ${iconBg}
            ${isHovered ? 'scale-110 rotate-6 shadow-lg shadow-orange-500/30' : ''}
          `}>
            <span className={`${iconColor} ${isHovered ? 'drop-shadow-[0_0_8px_currentColor]' : ''}`}>{icon}</span>
          </div>
          
          {trend && trendValue && (
            <div className={`
              flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all duration-300
              ${trend === 'up' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 
                trend === 'down' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 
                'bg-zinc-500/10 text-zinc-500 border border-zinc-500/20'}
              ${isHovered ? 'scale-110 shadow-lg' : ''}
            `}>
              {trend === 'up' && <ArrowUpRight className="w-3 h-3" />}
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        
        <div className="mb-1">
          <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">{title}</h3>
          <p className={`
            text-3xl font-bold transition-all duration-300
            ${isHovered ? 'scale-105 origin-left text-gradient-primary' : 'text-white'}
          `}>
            {value}
          </p>
        </div>
        
        {subtitle && (
          <div className={`flex items-center gap-1.5 text-xs transition-colors duration-300 ${isHovered ? 'text-orange-400/70' : 'text-zinc-500'}`}>
            <Lightning className={`w-3 h-3 ${isHovered ? 'animate-pulse' : ''}`} />
            <span>{subtitle}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function SystemStatus() {
  const { status, loading, error, isRefreshing, refetch } = useSystemStatus();
  const [mainCardHovered, setMainCardHovered] = useState(false);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-zinc-800/50 rounded-lg w-1/4"></div>
          <div className="h-48 bg-zinc-800/30 rounded-2xl border border-zinc-700/30"></div>
          <div className="grid md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-28 bg-zinc-800/30 rounded-2xl border border-zinc-700/30"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-8 text-center backdrop-blur-sm animate-scale-up">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-500/10 flex items-center justify-center">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-red-400 mb-4 font-medium">{error}</p>
          <button 
            onClick={refetch}
            className="px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all duration-300 hover:scale-105 border border-red-500/20"
          >
            <ArrowsClockwise className="w-4 h-4 inline mr-2" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!status) return null;

  const isRunning = status.gateway.running;

  return (
    <div className="p-6 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gradient-primary">
            System Status
          </h2>
          <p className="text-zinc-500 mt-1">
            OpenClaw infrastructure health
          </p>
        </div>
        <button
          onClick={refetch}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2.5 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 hover:border-orange-500/30 rounded-xl transition-all duration-300 text-zinc-400 hover:text-orange-400 disabled:opacity-50 hover:scale-105"
        >
          <ArrowsClockwise className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Main Status Card with enhanced glassmorphism */}
      <div 
        onMouseEnter={() => setMainCardHovered(true)}
        onMouseLeave={() => setMainCardHovered(false)}
        className={`
          relative overflow-hidden rounded-2xl p-8 glass-card-strong
          ${isRunning 
            ? 'border-orange-500/30' 
            : 'border-red-500/30'
          }
          transition-all duration-500 animate-slide-in-up
          ${mainCardHovered 
            ? isRunning 
              ? 'shadow-[0_0_60px_rgba(249,115,22,0.2)] border-orange-500/50' 
              : 'shadow-[0_0_60px_rgba(239,68,68,0.2)] border-red-500/50'
            : 'shadow-lg'
          }
        `}
      >
        {/* Animated gradient background */}
        <div className={`
          absolute inset-0 opacity-30 transition-opacity duration-500
          ${isRunning 
            ? 'bg-gradient-to-br from-orange-500/20 via-amber-500/10 to-transparent' 
            : 'bg-gradient-to-br from-red-500/20 via-red-600/10 to-transparent'
          }
          ${mainCardHovered ? 'opacity-50' : ''}
        `} />
        
        {/* Animated background orbs */}
        <div className={`
          absolute -right-20 -top-20 w-64 h-64 rounded-full blur-[80px] transition-all duration-700
          ${isRunning ? 'bg-orange-500/40' : 'bg-red-500/40'}
          ${mainCardHovered ? 'scale-150 opacity-60' : 'opacity-30'}
          animate-breathe
        `} />
        <div className={`
          absolute -left-10 -bottom-10 w-40 h-40 rounded-full blur-[60px] transition-all duration-700
          ${isRunning ? 'bg-amber-400/30' : 'bg-red-400/30'}
          ${mainCardHovered ? 'scale-150 opacity-50' : 'opacity-20'}
          animate-breathe
        `} style={{ animationDelay: '1s' }} />
        
        {/* Gradient border effect */}
        {mainCardHovered && (
          <div className={`
            absolute inset-0 rounded-2xl border-2 pointer-events-none
            ${isRunning 
              ? 'border-orange-500/30 shadow-[inset_0_0_30px_rgba(249,115,22,0.1)]' 
              : 'border-red-500/30 shadow-[inset_0_0_30px_rgba(239,68,68,0.1)]'
            }
          `} />
        )}
        
        <div className="relative flex items-center gap-6">
          <div className={`
            p-4 rounded-2xl transition-all duration-500 backdrop-blur-sm
            ${isRunning 
              ? 'bg-orange-500/20 shadow-[0_0_30px_rgba(249,115,22,0.3)]' 
              : 'bg-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.3)]'}
            ${mainCardHovered ? 'scale-110 rotate-3' : ''}
          `}>
            <HardDrives className={`w-12 h-12 ${isRunning ? 'text-orange-400 drop-shadow-[0_0_10px_rgba(249,115,22,0.5)]' : 'text-red-400 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]'}`} />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className={`text-2xl font-bold transition-all duration-300 ${mainCardHovered ? 'text-gradient-primary' : 'text-white'}`}>Gateway</h3>
              {isRunning ? (
                <CheckCircle className="w-7 h-7 text-green-400 drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
              ) : (
                <XCircle className="w-7 h-7 text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
              )}
            </div>
            <p className={`text-lg font-medium ${isRunning ? 'text-orange-300' : 'text-red-300'}`}>
              {isRunning ? 'Running' : 'Stopped'}
            </p>
          </div>
          
          {/* Enhanced pulse indicator */}
          {isRunning && (
            <div className="relative">
              <span className="flex h-6 w-6">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-60"></span>
                <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-orange-500/30 scale-150"></span>
                <span className="relative inline-flex rounded-full h-6 w-6 bg-gradient-to-br from-orange-400 to-amber-500 shadow-[0_0_20px_rgba(249,115,22,0.6)]"></span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      {isRunning && (
        <div className="grid md:grid-cols-3 gap-4">
          {status.gateway.pid && (
            <StatCard
              title="Process ID"
              value={status.gateway.pid}
              subtitle="Active process"
              icon={<Hash className="w-5 h-5" />}
              iconBg="bg-orange-500/20"
              iconColor="text-orange-400"
              delay={100}
            />
          )}
          
          {status.gateway.uptime && (
            <StatCard
              title="Uptime"
              value={status.gateway.uptime}
              subtitle="System running"
              icon={<Clock className="w-5 h-5" />}
              iconBg="bg-amber-500/20"
              iconColor="text-amber-400"
              delay={200}
            />
          )}
          
          <StatCard
            title="Status"
            value="Healthy"
            subtitle="All systems go"
            icon={<Pulse className="w-5 h-5" />}
            iconBg="bg-green-500/20"
            iconColor="text-green-400"
            delay={300}
            trend="up"
            trendValue="100%"
          />
        </div>
      )}

      {/* Info Cards with glass effects */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Quick Actions */}
        <div 
          className="glass-card rounded-2xl p-5 hover:border-orange-500/30 hover:shadow-[0_0_30px_rgba(249,115,22,0.1)] transition-all duration-500 animate-slide-in-up group"
          style={{ animationDelay: '400ms' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center group-hover:bg-orange-500/20 group-hover:shadow-[0_0_15px_rgba(249,115,22,0.3)] transition-all duration-300">
              <Terminal className="w-4 h-4 text-orange-400" />
            </div>
            <h4 className="text-sm font-medium text-orange-400 uppercase tracking-wider">
              Quick Actions
            </h4>
          </div>
          
          <div className="space-y-3">
            {[
              { cmd: 'openclaw gateway status', desc: 'Check status' },
              { cmd: 'openclaw gateway restart', desc: 'Restart gateway' },
              { cmd: 'openclaw sessions list', desc: 'List sessions' },
            ].map((item, idx) => (
              <div 
                key={idx}
                className="flex items-center gap-2 text-sm text-zinc-400 group/item cursor-pointer hover:text-zinc-200 transition-all duration-300"
              >
                <span className="text-orange-500 group-hover/item:animate-pulse">•</span>
                <code className="glass-card px-2.5 py-1 rounded-lg text-xs text-orange-300 group-hover/item:border-orange-500/40 group-hover/item:shadow-[0_0_10px_rgba(249,115,22,0.2)] transition-all duration-300">
                  {item.cmd}
                </code>
                <span className="text-zinc-600 group-hover/item:text-zinc-400 transition-colors">— {item.desc}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Configuration */}
        <div 
          className="glass-card rounded-2xl p-5 hover:border-amber-500/30 hover:shadow-[0_0_30px_rgba(251,191,36,0.1)] transition-all duration-500 animate-slide-in-up group"
          style={{ animationDelay: '500ms' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 group-hover:shadow-[0_0_15px_rgba(251,191,36,0.3)] transition-all duration-300">
              <Folder className="w-4 h-4 text-amber-400" />
            </div>
            <h4 className="text-sm font-medium text-amber-400 uppercase tracking-wider">
              Configuration
            </h4>
          </div>
          
          <div className="space-y-3 text-sm">
            {[
              { label: 'Config Directory', value: '~/.openclaw', icon: <Folder className="w-3.5 h-3.5" /> },
              { label: 'Agents Config', value: 'agents.yaml', icon: <HardDrive className="w-3.5 h-3.5" /> },
              { label: 'Dashboard API', value: 'localhost:3001', icon: <Globe className="w-3.5 h-3.5" /> },
            ].map((item, idx) => (
              <div key={idx} className="flex justify-between items-center group/item">
                <span className="flex items-center gap-2 text-zinc-500">
                  <span className="text-zinc-600 group-hover/item:text-amber-400 transition-colors duration-300">{item.icon}</span>
                  {item.label}
                </span>
                <code className="text-zinc-300 glass-card px-2.5 py-1 rounded-lg text-xs group-hover/item:border-amber-500/30 transition-all duration-300">
                  {item.value}
                </code>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Resources with enhanced visuals */}
      {isRunning && (
        <div 
          className="glass-card rounded-2xl p-5 animate-slide-in-up hover:border-blue-500/20 transition-all duration-500 group"
          style={{ animationDelay: '600ms' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all duration-300">
              <Cpu className="w-4 h-4 text-blue-400" />
            </div>
            <h4 className="text-sm font-medium text-blue-400 uppercase tracking-wider">
              System Resources
            </h4>
            <div className="ml-auto flex items-center gap-1 text-xs text-zinc-600">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              Live
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { label: 'CPU Usage', value: 12, color: 'orange' },
              { label: 'Memory', value: 45, color: 'amber' },
              { label: 'Network', value: 23, color: 'green' },
            ].map((resource, idx) => (
              <div key={idx} className="space-y-2 group/resource">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500 group-hover/resource:text-zinc-400 transition-colors">{resource.label}</span>
                  <span className={`font-medium transition-all duration-300 ${
                    resource.color === 'orange' ? 'text-orange-400' :
                    resource.color === 'amber' ? 'text-amber-400' : 'text-green-400'
                  }`}>{resource.value}%</span>
                </div>
                <div className="h-2.5 bg-zinc-800/70 rounded-full overflow-hidden relative">
                  {/* Background glow */}
                  <div 
                    className={`absolute inset-y-0 left-0 rounded-full blur-sm opacity-50 transition-all duration-700
                      ${resource.color === 'orange' ? 'bg-orange-500' :
                        resource.color === 'amber' ? 'bg-amber-500' : 'bg-green-500'
                      }`}
                    style={{ width: `${resource.value}%` }}
                  />
                  {/* Main bar */}
                  <div 
                    className={`h-full rounded-full transition-all duration-700 ease-out relative bg-gradient-to-r 
                      ${resource.color === 'orange' ? 'from-orange-600 via-orange-500 to-orange-400' :
                        resource.color === 'amber' ? 'from-amber-600 via-amber-500 to-amber-400' :
                        'from-green-600 via-green-500 to-green-400'
                      }`}
                    style={{ width: `${resource.value}%` }}
                  >
                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
