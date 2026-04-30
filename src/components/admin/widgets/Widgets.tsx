import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import Icon from '@/components/ui/icon';
import { ReactNode } from 'react';

// =================== KPI BLOCK ===================
export interface KPIItem {
  label: string;
  value: string | number;
  delta?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: string;
  accent?: 'blue' | 'emerald' | 'amber' | 'violet' | 'red' | 'cyan';
}

const ACCENT_BG: Record<string, string> = {
  blue: 'bg-blue-50 text-blue-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  violet: 'bg-violet-50 text-violet-600',
  red: 'bg-red-50 text-red-600',
  cyan: 'bg-cyan-50 text-cyan-600',
};

export function KPIRow({ items }: { items: KPIItem[] }) {
  return (
    <div className={cn('grid gap-3', items.length === 4 ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-2 lg:grid-cols-3')}>
      {items.map((it, i) => (
        <Card key={i} className="border shadow-sm hover:shadow-md transition-shadow animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
          <CardContent className="p-3.5">
            <div className="flex items-start gap-3">
              <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', ACCENT_BG[it.accent ?? 'blue'])}>
                <Icon name={it.icon} size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] text-muted-foreground font-medium truncate">{it.label}</p>
                <p className="text-lg font-bold leading-tight">{it.value}</p>
                {it.delta && (
                  <p className={cn('text-[10px] flex items-center gap-0.5 mt-0.5',
                    it.trend === 'up' && 'text-emerald-600',
                    it.trend === 'down' && 'text-red-600',
                    (!it.trend || it.trend === 'neutral') && 'text-muted-foreground'
                  )}>
                    {it.trend === 'up' && <Icon name="ArrowUp" size={10} />}
                    {it.trend === 'down' && <Icon name="ArrowDown" size={10} />}
                    {it.delta}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// =================== MINI CHART (CSS-bars) ===================
export function MiniChart({ values, labels, color = 'bg-primary' }: { values: number[]; labels?: string[]; color?: string }) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex items-end gap-1 h-16 w-full">
      {values.map((v, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className={cn('w-full rounded-t transition-all duration-500', color, 'opacity-80 hover:opacity-100')}
            style={{ height: `${(v / max) * 100}%`, minHeight: '4px' }}
          />
          {labels && <span className="text-[9px] text-muted-foreground">{labels[i]}</span>}
        </div>
      ))}
    </div>
  );
}

// =================== TIMELINE ===================
export interface TimelineEvent {
  date: string;
  title: string;
  description?: string;
  icon: string;
  color?: 'blue' | 'emerald' | 'amber' | 'violet' | 'red' | 'slate';
}

const TL_COLORS: Record<string, string> = {
  blue: 'bg-blue-100 text-blue-600 border-blue-200',
  emerald: 'bg-emerald-100 text-emerald-600 border-emerald-200',
  amber: 'bg-amber-100 text-amber-600 border-amber-200',
  violet: 'bg-violet-100 text-violet-600 border-violet-200',
  red: 'bg-red-100 text-red-600 border-red-200',
  slate: 'bg-slate-100 text-slate-600 border-slate-200',
};

export function Timeline({ events }: { events: TimelineEvent[] }) {
  return (
    <div className="space-y-0">
      {events.map((e, i) => (
        <div key={i} className="relative flex gap-3 pb-3 last:pb-0">
          {i < events.length - 1 && (
            <div className="absolute left-[14px] top-7 bottom-0 w-px bg-border" />
          )}
          <div className={cn('w-7 h-7 rounded-full border flex items-center justify-center shrink-0 z-10', TL_COLORS[e.color ?? 'slate'])}>
            <Icon name={e.icon} size={12} />
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold">{e.title}</p>
              <span className="text-[10px] text-muted-foreground shrink-0">{e.date}</span>
            </div>
            {e.description && <p className="text-[11px] text-muted-foreground mt-0.5">{e.description}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

// =================== ACTIVITY FEED ===================
export interface ActivityItem {
  user: string;
  action: string;
  target?: string;
  time: string;
}

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <div className="space-y-2">
      {items.map((a, i) => {
        const initials = a.user.split(' ').slice(0, 2).map(w => w[0]).join('');
        return (
          <div key={i} className="flex items-start gap-2.5 text-xs">
            <Avatar className="w-6 h-6 shrink-0">
              <AvatarFallback className="text-[9px] bg-primary/10 text-primary font-semibold">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="leading-tight">
                <span className="font-semibold">{a.user.split(' ').slice(0, 2).join(' ')}</span>{' '}
                <span className="text-muted-foreground">{a.action}</span>
                {a.target && <span className="font-medium"> {a.target}</span>}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{a.time}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// =================== ALERTS ===================
export interface AlertItem {
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  description?: string;
  icon?: string;
}

const ALERT_STYLES: Record<string, string> = {
  info: 'bg-blue-50 border-blue-200 text-blue-900',
  warning: 'bg-amber-50 border-amber-200 text-amber-900',
  error: 'bg-red-50 border-red-200 text-red-900',
  success: 'bg-emerald-50 border-emerald-200 text-emerald-900',
};
const ALERT_ICONS: Record<string, string> = {
  info: 'Info', warning: 'AlertTriangle', error: 'XCircle', success: 'CheckCircle2'
};

export function AlertsList({ items }: { items: AlertItem[] }) {
  return (
    <div className="space-y-1.5">
      {items.map((a, i) => (
        <div key={i} className={cn('flex items-start gap-2 px-2.5 py-2 rounded-md border text-xs', ALERT_STYLES[a.type])}>
          <Icon name={a.icon ?? ALERT_ICONS[a.type]} size={13} className="shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold leading-tight">{a.title}</p>
            {a.description && <p className="text-[11px] opacity-80 mt-0.5">{a.description}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

// =================== INFO ROWS ===================
export function InfoCard({ title, icon, children, action }: { title: string; icon: string; children: ReactNode; action?: ReactNode }) {
  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2 pt-3 px-3.5 flex-row items-center justify-between space-y-0">
        <CardTitle className="text-xs font-semibold flex items-center gap-1.5 uppercase tracking-wider text-muted-foreground">
          <Icon name={icon} size={12} className="text-primary" />
          {title}
        </CardTitle>
        {action}
      </CardHeader>
      <CardContent className="px-3.5 pb-3">{children}</CardContent>
    </Card>
  );
}

// =================== STAT TILE (small) ===================
export function StatTile({ label, value, sub, icon, accent = 'blue' }: { label: string; value: string | number; sub?: string; icon: string; accent?: KPIItem['accent'] }) {
  return (
    <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-muted/40">
      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', ACCENT_BG[accent ?? 'blue'])}>
        <Icon name={icon} size={14} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-muted-foreground">{label}</p>
        <p className="text-sm font-bold leading-tight">{value}</p>
        {sub && <p className="text-[9px] text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
}

// =================== PROGRESS GOAL ===================
export function ProgressGoal({ label, current, target, unit = '' }: { label: string; current: number; target: number; unit?: string }) {
  const pct = Math.min(100, (current / target) * 100);
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-xs font-semibold">{current.toLocaleString()}{unit} <span className="text-muted-foreground font-normal">/ {target.toLocaleString()}{unit}</span></span>
      </div>
      <Progress value={pct} className="h-1.5" />
    </div>
  );
}

// =================== TOP LIST ===================
export function TopList({ items }: { items: { rank: number; label: string; value: string; sub?: string }[] }) {
  const COLORS = ['text-amber-500', 'text-slate-400', 'text-orange-700', 'text-muted-foreground'];
  return (
    <div className="space-y-1.5">
      {items.map(it => (
        <div key={it.rank} className="flex items-center gap-2.5 text-xs">
          <span className={cn('font-bold w-5', COLORS[Math.min(it.rank - 1, 3)])}>#{it.rank}</span>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{it.label}</p>
            {it.sub && <p className="text-[10px] text-muted-foreground">{it.sub}</p>}
          </div>
          <span className="font-semibold shrink-0">{it.value}</span>
        </div>
      ))}
    </div>
  );
}

// =================== KEY-VALUE LIST ===================
export function KeyValueList({ rows }: { rows: { label: string; value: ReactNode; mono?: boolean }[] }) {
  return (
    <dl className="space-y-1.5">
      {rows.map((r, i) => (
        <div key={i} className="flex items-start justify-between gap-3 text-xs">
          <dt className="text-muted-foreground shrink-0">{r.label}</dt>
          <dd className={cn('text-right font-medium', r.mono && 'font-mono')}>{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}

// =================== TAGS ===================
export function TagBadges({ tags, variant = 'secondary' }: { tags: string[]; variant?: 'secondary' | 'outline' }) {
  return (
    <div className="flex flex-wrap gap-1">
      {tags.map((t, i) => <Badge key={i} variant={variant} className="text-[10px] px-1.5 py-0 h-5">{t}</Badge>)}
    </div>
  );
}

// =================== STATUS DOTS ===================
export function ServiceStatusList({ items }: { items: { name: string; status: 'ok' | 'warn' | 'down'; latency?: string }[] }) {
  return (
    <div className="space-y-1.5">
      {items.map((s, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <span className={cn('w-1.5 h-1.5 rounded-full',
            s.status === 'ok' ? 'bg-emerald-500' : s.status === 'warn' ? 'bg-amber-500' : 'bg-red-500',
            s.status === 'ok' && 'shadow-[0_0_8px_2px] shadow-emerald-500/40'
          )} />
          <span className="flex-1 truncate">{s.name}</span>
          {s.latency && <span className="text-muted-foreground text-[10px] font-mono">{s.latency}</span>}
        </div>
      ))}
    </div>
  );
}

// =================== SEPARATOR ALIAS ===================
export { Separator };
