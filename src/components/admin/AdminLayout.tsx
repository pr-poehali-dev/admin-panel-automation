import { useState } from 'react';
import Sidebar, { SectionKey } from './Sidebar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

import Dashboard from './sections/Dashboard';
import OrdersSection from './sections/OrdersSection';
import ClientsSection from './sections/ClientsSection';
import DevicesSection from './sections/DevicesSection';
import EmployeesSection from './sections/EmployeesSection';
import PartsSection from './sections/PartsSection';
import SuppliersSection from './sections/SuppliersSection';
import ServicesSection from './sections/ServicesSection';
import PaymentsSection from './sections/PaymentsSection';
import WarrantiesSection from './sections/WarrantiesSection';
import ReportsSection from './sections/ReportsSection';
import RolesSection from './sections/RolesSection';
import SettingsSection from './sections/SettingsSection';

const SECTION_LABELS: Record<SectionKey, string> = {
  dashboard: 'Главная', orders: 'Заявки', clients: 'Клиенты', devices: 'Устройства',
  employees: 'Сотрудники', parts: 'Склад', suppliers: 'Поставщики', services: 'Услуги',
  payments: 'Оплаты', warranties: 'Гарантии', reports: 'Отчёты', roles: 'Роли и права', settings: 'Настройки'
};

const SECTION_ICONS: Record<SectionKey, string> = {
  dashboard: 'LayoutDashboard', orders: 'ClipboardList', clients: 'Users', devices: 'Cpu',
  employees: 'UserCog', parts: 'Package', suppliers: 'Truck', services: 'Wrench',
  payments: 'CreditCard', warranties: 'ShieldCheck', reports: 'BarChart2', roles: 'KeyRound', settings: 'Settings'
};

interface AdminLayoutProps {
  user: { name: string; role: string };
  onLogout: () => void;
}

export default function AdminLayout({ user, onLogout }: AdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionKey>('dashboard');

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard': return <Dashboard />;
      case 'orders': return <OrdersSection />;
      case 'clients': return <ClientsSection />;
      case 'devices': return <DevicesSection />;
      case 'employees': return <EmployeesSection />;
      case 'parts': return <PartsSection />;
      case 'suppliers': return <SuppliersSection />;
      case 'services': return <ServicesSection />;
      case 'payments': return <PaymentsSection />;
      case 'warranties': return <WarrantiesSection />;
      case 'reports': return <ReportsSection />;
      case 'roles': return <RolesSection />;
      case 'settings': return <SettingsSection />;
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        activeSection={activeSection}
        onSelect={setActiveSection}
        user={user}
        onLogout={onLogout}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-14 shrink-0 border-b bg-white flex items-center px-4 gap-3">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Icon name="LayoutDashboard" size={13} />
            <span>АИС Ремонт</span>
            <Icon name="ChevronRight" size={13} />
            <Icon name={SECTION_ICONS[activeSection]} size={13} className="text-foreground" />
            <span className="font-medium text-foreground">{SECTION_LABELS[activeSection]}</span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-foreground relative">
              <Icon name="Bell" size={16} />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary rounded-full" />
            </Button>
            <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-foreground">
              <Icon name="HelpCircle" size={16} />
            </Button>
            <div className="flex items-center gap-2 pl-2 border-l ml-1">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                <Icon name="UserCircle" size={16} className="text-primary" />
              </div>
              <div className="hidden md:block">
                <p className="text-xs font-semibold leading-none">{user.name.split(' ').slice(0, 2).join(' ')}</p>
                <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4 mt-0.5">{user.role}</Badge>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <ScrollArea className="flex-1">
          <main className="p-5 max-w-[1400px]">
            {renderSection()}
          </main>
        </ScrollArea>
      </div>
    </div>
  );
}
