import { cn } from '@/lib/utils';
import Icon from '@/components/ui/icon';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

export type SectionKey =
  | 'dashboard' | 'orders' | 'clients' | 'devices'
  | 'employees' | 'parts' | 'suppliers' | 'services'
  | 'payments' | 'warranties' | 'reports' | 'roles' | 'settings';

interface NavItem {
  key: SectionKey;
  label: string;
  icon: string;
  badge?: string;
  group?: string;
}

const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', label: 'Главная', icon: 'LayoutDashboard', group: 'Обзор' },
  { key: 'orders', label: 'Заявки', icon: 'ClipboardList', badge: '6', group: 'Основное' },
  { key: 'clients', label: 'Клиенты', icon: 'Users', group: 'Основное' },
  { key: 'devices', label: 'Устройства', icon: 'Cpu', group: 'Основное' },
  { key: 'employees', label: 'Сотрудники', icon: 'UserCog', group: 'Основное' },
  { key: 'services', label: 'Услуги', icon: 'Wrench', group: 'Основное' },
  { key: 'parts', label: 'Склад (запчасти)', icon: 'Package', group: 'Склад и финансы' },
  { key: 'suppliers', label: 'Поставщики', icon: 'Truck', group: 'Склад и финансы' },
  { key: 'payments', label: 'Оплаты', icon: 'CreditCard', group: 'Склад и финансы' },
  { key: 'warranties', label: 'Гарантии', icon: 'ShieldCheck', group: 'Склад и финансы' },
  { key: 'reports', label: 'Отчёты', icon: 'BarChart2', group: 'Аналитика' },
  { key: 'roles', label: 'Роли и права', icon: 'KeyRound', group: 'Система' },
  { key: 'settings', label: 'Настройки', icon: 'Settings', group: 'Система' },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  activeSection: SectionKey;
  onSelect: (key: SectionKey) => void;
  user: { name: string; role: string };
  onLogout: () => void;
}

function NavLink({
  item, active, collapsed, onClick
}: {
  item: NavItem; active: boolean; collapsed: boolean; onClick: () => void;
}) {
  const btn = (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group relative',
        active
          ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
          : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
      )}
    >
      <Icon
        name={item.icon}
        size={18}
        className={cn('shrink-0', active ? 'text-white' : 'text-sidebar-foreground/60 group-hover:text-sidebar-accent-foreground')}
      />
      {!collapsed && (
        <>
          <span className="truncate">{item.label}</span>
          {item.badge && (
            <Badge className="ml-auto bg-primary/20 text-primary text-[10px] px-1.5 py-0 h-4 font-semibold border-0">
              {item.badge}
            </Badge>
          )}
        </>
      )}
      {collapsed && item.badge && (
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary rounded-full" />
      )}
    </button>
  );

  if (collapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{btn}</TooltipTrigger>
        <TooltipContent side="right" className="font-medium text-xs">
          {item.label}
          {item.badge && <span className="ml-1 text-primary">({item.badge})</span>}
        </TooltipContent>
      </Tooltip>
    );
  }
  return btn;
}

export default function Sidebar({ collapsed, onToggle, activeSection, onSelect, user, onLogout }: SidebarProps) {
  const groups = [...new Set(NAV_ITEMS.map(i => i.group).filter(Boolean))];

  return (
    <aside
      className={cn(
        'sidebar-transition flex flex-col h-screen bg-sidebar border-r border-sidebar-border',
        collapsed ? 'w-[60px]' : 'w-[240px]'
      )}
    >
      {/* Header */}
      <div className={cn('flex items-center h-16 px-3 shrink-0', collapsed ? 'justify-center' : 'justify-between gap-2')}>
        {!collapsed && (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center shrink-0">
              <Icon name="Cpu" size={16} className="text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-sidebar-foreground truncate leading-none">АИС Ремонт</p>
              <p className="text-[10px] text-sidebar-foreground/50 truncate mt-0.5">v2.0</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <Icon name="Cpu" size={16} className="text-white" />
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className={cn('w-7 h-7 text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent shrink-0', collapsed && 'hidden')}
        >
          <Icon name="PanelLeftClose" size={15} />
        </Button>
      </div>

      {collapsed && (
        <div className="px-3 pb-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="w-full h-7 text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <Icon name="PanelLeftOpen" size={15} />
          </Button>
        </div>
      )}

      <Separator className="bg-sidebar-border" />

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {groups.map(group => {
          const items = NAV_ITEMS.filter(i => i.group === group);
          return (
            <div key={group}>
              {!collapsed && (
                <p className="text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/30 px-3 mb-1.5">
                  {group}
                </p>
              )}
              <div className="space-y-0.5">
                {items.map(item => (
                  <NavLink
                    key={item.key}
                    item={item}
                    active={activeSection === item.key}
                    collapsed={collapsed}
                    onClick={() => onSelect(item.key)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      <Separator className="bg-sidebar-border" />

      {/* User block */}
      <div className={cn('p-3 shrink-0', collapsed ? 'flex justify-center' : '')}>
        {collapsed ? (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <button
                onClick={onLogout}
                className="w-8 h-8 rounded-lg bg-sidebar-accent flex items-center justify-center hover:bg-destructive/20 transition-colors"
              >
                <Icon name="LogOut" size={15} className="text-sidebar-foreground/60" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p className="font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.role}</p>
              <p className="text-xs text-destructive mt-1">Выйти</p>
            </TooltipContent>
          </Tooltip>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-sidebar-primary/20 flex items-center justify-center shrink-0">
              <Icon name="UserCircle" size={16} className="text-sidebar-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-sidebar-foreground truncate leading-none">{user.name.split(' ')[0]} {user.name.split(' ')[1]}</p>
              <p className="text-[10px] text-sidebar-foreground/50 truncate mt-0.5">{user.role}</p>
            </div>
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onLogout}
                  className="w-7 h-7 text-sidebar-foreground/40 hover:text-destructive hover:bg-destructive/10 shrink-0"
                >
                  <Icon name="LogOut" size={14} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Выйти</TooltipContent>
            </Tooltip>
          </div>
        )}
      </div>
    </aside>
  );
}
