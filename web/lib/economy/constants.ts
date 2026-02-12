import { AgentCategory } from '@/types/economy';

export const ECONOMY_COLORS = {
  primary: '#FF0420',
  background: '#0F111A',
  surface: '#1a1a2e',
  border: 'rgba(255, 255, 255, 0.1)',
  text: '#ffffff',
  textMuted: 'rgba(255, 255, 255, 0.6)',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
};

export const CATEGORY_COLORS: Record<AgentCategory, string> = {
  defi: '#FF0420',
  data: '#3B82F6',
  compute: '#8B5CF6',
  oracle: '#F59E0B',
  security: '#10B981',
  analytics: '#EC4899',
  trading: '#06B6D4',
  infrastructure: '#6366F1',
};

export const CATEGORY_LABELS: Record<AgentCategory, string> = {
  defi: 'DeFi',
  data: 'Data',
  compute: 'Compute',
  oracle: 'Oracle',
  security: 'Security',
  analytics: 'Analytics',
  trading: 'Trading',
  infrastructure: 'Infrastructure',
};

export const STATUS_COLORS = {
  online: '#10B981',
  busy: '#F59E0B',
  offline: '#6B7280',
};

export const ANIMATION_DURATION = {
  fast: 0.15,
  normal: 0.3,
  slow: 0.5,
};

export const REFRESH_INTERVALS = {
  stats: 5000,
  transactions: 2000,
  network: 3000,
  taskChains: 1000,
};
