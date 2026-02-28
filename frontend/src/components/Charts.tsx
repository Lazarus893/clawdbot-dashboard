import { useMemo } from 'react';

interface LineChartProps {
  data: { label: string; value: number }[];
  color?: string;
  height?: number;
  showDots?: boolean;
}

export function LineChart({ data, color = '#f97316', height = 120, showDots = true }: LineChartProps) {
  const { path, dots, max, min } = useMemo(() => {
    if (data.length === 0) return { path: '', dots: [], max: 0, min: 0 };
    
    const max = Math.max(...data.map(d => d.value));
    const min = Math.min(...data.map(d => d.value));
    const range = max - min || 1;
    
    const padding = 10;
    const width = 100;
    const chartHeight = height - padding * 2;
    
    const points = data.map((d, i) => ({
      x: (i / (data.length - 1)) * width,
      y: chartHeight - ((d.value - min) / range) * chartHeight + padding,
      value: d.value,
      label: d.label,
    }));
    
    // Create smooth line path
    const path = points.reduce((acc, point, i) => {
      if (i === 0) return `M ${point.x} ${point.y}`;
      
      const prev = points[i - 1];
      const cp1x = prev.x + (point.x - prev.x) / 3;
      const cp1y = prev.y;
      const cp2x = point.x - (point.x - prev.x) / 3;
      const cp2y = point.y;
      
      return `${acc} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${point.x} ${point.y}`;
    }, '');
    
    return { path, dots: points, max, min };
  }, [data, height]);

  if (data.length === 0) return null;

  return (
    <div className="relative" style={{ height }}>
      <svg viewBox={`0 0 100 ${height}`} className="w-full h-full" preserveAspectRatio="none">
        {/* Gradient area under line */}
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Area fill */}
        {path && (
          <path
            d={`${path} L 100 ${height} L 0 ${height} Z`}
            fill="url(#chartGradient)"
          />
        )}
        
        {/* Line */}
        {path && (
          <path
            d={path}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
          />
        )}
        
        {/* Dots */}
        {showDots && dots.map((dot, i) => (
          <g key={i}>
            <circle
              cx={dot.x}
              cy={dot.y}
              r="3"
              fill={color}
              className="hover:r-4 transition-all"
            />
            <circle
              cx={dot.x}
              cy={dot.y}
              r="6"
              fill="transparent"
              className="cursor-pointer"
            >
              <title>{`${dot.label}: ${dot.value}`}</title>
            </circle>
          </g>
        ))}
      </svg>
      
      {/* Labels */}
      <div className="absolute top-0 left-0 text-[10px] text-zinc-500">{max}</div>
      <div className="absolute bottom-0 left-0 text-[10px] text-zinc-500">{min}</div>
    </div>
  );
}

interface BarChartProps {
  data: { label: string; value: number; color?: string }[];
  height?: number;
  showLabels?: boolean;
}

export function BarChart({ data, height = 120, showLabels = true }: BarChartProps) {
  const max = Math.max(...data.map(d => d.value)) || 1;
  
  return (
    <div className="flex items-end justify-between gap-2" style={{ height }}>
      {data.map((item, i) => {
        const heightPercent = (item.value / max) * 100;
        const color = item.color || '#f97316';
        
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full relative group">
              <div
                className="w-full rounded-t-lg transition-all duration-500 opacity-80 group-hover:opacity-100"
                style={{ 
                  height: `${heightPercent}%`, 
                  backgroundColor: color,
                  minHeight: '4px'
                }}
              />
              {/* Tooltip */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-zinc-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {item.value}
              </div>
            </div>
            {showLabels && (
              <span className="text-[10px] text-zinc-500 truncate w-full text-center">
                {item.label}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

interface PieChartProps {
  data: { label: string; value: number; color: string }[];
  size?: number;
}

export function PieChart({ data, size = 100 }: PieChartProps) {
  const total = data.reduce((acc, d) => acc + d.value, 0);
  let currentAngle = 0;
  
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className="transform -rotate-90">
      {data.map((item, i) => {
        const angle = (item.value / total) * 360;
        const startAngle = currentAngle;
        const endAngle = currentAngle + angle;
        currentAngle = endAngle;
        
        const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
        const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
        const x2 = 50 + 40 * Math.cos((endAngle * Math.PI) / 180);
        const y2 = 50 + 40 * Math.sin((endAngle * Math.PI) / 180);
        
        const largeArc = angle > 180 ? 1 : 0;
        
        return (
          <path
            key={i}
            d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
            fill={item.color}
            stroke="#1a1a1a"
            strokeWidth="2"
          >
            <title>{`${item.label}: ${item.value} (${((item.value / total) * 100).toFixed(1)}%)`}</title>
          </path>
        );
      })}
      
      {/* Center hole for donut effect */}
      <circle cx="50" cy="50" r="25" fill="#0a0a0a" />
      
      {/* Center text */}
      <text
        x="50"
        y="50"
        textAnchor="middle"
        dominantBaseline="middle"
        className="text-[10px] fill-white font-medium"
        transform="rotate(90 50 50)"
      >
        {total}
      </text>
    </svg>
  );
}

// Activity heatmap like GitHub contributions
interface HeatmapProps {
  data: { date: string; value: number }[];
}

export function ActivityHeatmap({ data }: HeatmapProps) {
  // const levels = [0, 1, 2, 3, 4];
  const colors = ['#1f1f1f', '#f9731620', '#f9731640', '#f9731680', '#f97316'];
  
  const getLevel = (value: number) => {
    if (value === 0) return 0;
    if (value < 10) return 1;
    if (value < 50) return 2;
    if (value < 100) return 3;
    return 4;
  };
  
  // Group by weeks
  const weeks: typeof data[] = [];
  for (let i = 0; i < data.length; i += 7) {
    weeks.push(data.slice(i, i + 7));
  }
  
  return (
    <div className="flex gap-1">
      {weeks.map((week, weekIdx) => (
        <div key={weekIdx} className="flex flex-col gap-1">
          {week.map((day, dayIdx) => {
            const level = getLevel(day.value);
            return (
              <div
                key={dayIdx}
                className="w-3 h-3 rounded-sm transition-all hover:scale-125"
                style={{ backgroundColor: colors[level] }}
                title={`${day.date}: ${day.value} events`}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
