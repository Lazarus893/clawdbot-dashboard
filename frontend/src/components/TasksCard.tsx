import { useEffect, useState } from 'react';
import { CheckCircle, Circle, Play } from '@phosphor-icons/react';

interface Todo {
  content: string;
  status: 'in_progress' | 'pending' | 'completed';
  source: string;
}

export function TasksCard() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/todos')
      .then(res => res.json())
      .then(data => {
        setTodos(data.todos || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load todos');
        setLoading(false);
      });
  }, []);

  const getStatusIcon = (status: Todo['status']) => {
    switch (status) {
      case 'in_progress':
        return <Play className="w-4 h-4 text-amber-400" weight="fill" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-emerald-400" weight="fill" />;
      default:
        return <Circle className="w-4 h-4 text-zinc-500" />;
    }
  };

  const getStatusColor = (status: Todo['status']) => {
    switch (status) {
      case 'in_progress':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'completed':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      default:
        return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
    }
  };

  if (loading) {
    return (
      <div className="card p-4">
        <h3 className="text-sm font-medium text-zinc-400 mb-3">Tasks</h3>
        <div className="animate-pulse space-y-2">
          <div className="h-8 bg-zinc-800 rounded"></div>
          <div className="h-8 bg-zinc-800 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-4">
        <h3 className="text-sm font-medium text-zinc-400 mb-3">Tasks</h3>
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="card p-4">
      <h3 className="text-sm font-medium text-zinc-400 mb-3">Tasks</h3>
      
      {todos.length === 0 ? (
        <p className="text-zinc-500 text-sm">No active tasks</p>
      ) : (
        <div className="space-y-2">
          {todos.map((todo, index) => (
            <div
              key={index}
              className={`flex items-start gap-2 p-2 rounded-lg border ${getStatusColor(todo.status)}`}
            >
              {getStatusIcon(todo.status)}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-zinc-200 truncate">{todo.content}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{todo.source}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
