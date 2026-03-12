import { useEffect, useState } from 'react';
import { Wrench, Heart, Calendar, Envelope, Cloud, Code, Terminal } from '@phosphor-icons/react';

interface Skill {
  name: string;
  description: string;
  location: 'workspace' | 'system';
}

const iconMap: Record<string, React.ElementType> = {
  todoist: Calendar,
  gmail: Envelope,
  gws: Cloud,
  github: Code,
  'git-crypt-backup': Terminal,
  default: Wrench,
};

function getSkillIcon(name: string): React.ElementType {
  const lower = name.toLowerCase();
  for (const [key, icon] of Object.entries(iconMap)) {
    if (lower.includes(key)) return icon;
  }
  return Heart;
}

export function SkillsList() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/skills')
      .then(res => res.json())
      .then(data => {
        setSkills(data.skills || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load skills');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="card p-4">
        <h3 className="text-sm font-medium text-zinc-400 mb-3">Skills</h3>
        <div className="animate-pulse space-y-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-12 bg-zinc-800 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-4">
        <h3 className="text-sm font-medium text-zinc-400 mb-3">Skills</h3>
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="card p-4">
      <h3 className="text-sm font-medium text-zinc-400 mb-3">Skills ({skills.length})</h3>
      
      {skills.length === 0 ? (
        <p className="text-zinc-500 text-sm">No skills found</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
          {skills.map((skill, index) => {
            const Icon = getSkillIcon(skill.name);
            return (
              <div
                key={index}
                className="flex items-start gap-2 p-2 rounded-lg bg-zinc-800/50 border border-zinc-700/50 hover:border-zinc-600 transition-colors"
              >
                <Icon className="w-4 h-4 text-[#FF4D00] mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-zinc-200 truncate">{skill.name}</p>
                  <p className="text-xs text-zinc-500 line-clamp-2">{skill.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
