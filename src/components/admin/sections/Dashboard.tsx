import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import { mockOrders, mockClients, mockEmployees, mockParts } from '@/services/mockData';

const stats = [
  { label: 'Активных заявок', value: '4', icon: 'ClipboardList', color: 'text-blue-600', bg: 'bg-blue-50', delta: '+2 за неделю' },
  { label: 'Клиентов', value: String(mockClients.length), icon: 'Users', color: 'text-emerald-600', bg: 'bg-emerald-50', delta: '+1 за неделю' },
  { label: 'Выручка (июнь)', value: '₽ 38 900', icon: 'TrendingUp', color: 'text-violet-600', bg: 'bg-violet-50', delta: '+12% к маю' },
  { label: 'Запчастей мало', value: String(mockParts.filter(p => p.quantity <= p.minQuantity).length), icon: 'AlertTriangle', color: 'text-amber-600', bg: 'bg-amber-50', delta: 'Требуют пополнения' },
];

const statusColors: Record<string, string> = {
  'новая': 'bg-slate-100 text-slate-700',
  'в работе': 'bg-blue-100 text-blue-700',
  'ожидание запчастей': 'bg-amber-100 text-amber-700',
  'готова': 'bg-emerald-100 text-emerald-700',
  'выдана': 'bg-purple-100 text-purple-700',
  'отменена': 'bg-red-100 text-red-700',
};

export default function Dashboard() {
  const lowStock = mockParts.filter(p => p.quantity <= p.minQuantity);
  const activeOrders = mockOrders.filter(o => !['выдана', 'отменена'].includes(o.status));
  const masters = mockEmployees.filter(e => e.role === 'мастер' && e.isActive);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-foreground">Главная панель</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Обзор системы на сегодня</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map(s => (
          <Card key={s.label} className="border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
                  <p className="text-2xl font-bold mt-1 text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{s.delta}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                  <Icon name={s.icon} size={20} className={s.color} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Active orders */}
        <div className="lg:col-span-2">
          <Card className="border shadow-sm h-full">
            <CardHeader className="pb-3 pt-4 px-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Icon name="ClipboardList" size={15} className="text-primary" />
                Активные заявки
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="space-y-2">
                {activeOrders.map(order => {
                  const client = mockClients.find(c => c.id === order.clientId);
                  return (
                    <div key={order.id} className="flex items-center gap-3 p-2.5 bg-muted/40 rounded-lg hover:bg-muted/70 transition-colors">
                      <div className="shrink-0">
                        <p className="text-xs font-semibold text-primary font-mono">{order.number}</p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{client?.name ?? '—'}</p>
                        <p className="text-xs text-muted-foreground truncate">{order.description}</p>
                      </div>
                      <Badge className={`text-[10px] px-2 py-0 h-5 border-0 shrink-0 ${statusColors[order.status]}`}>
                        {order.status}
                      </Badge>
                      <div className="text-xs text-muted-foreground shrink-0 hidden sm:block">
                        до {order.deadline}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Masters workload */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Icon name="UserCog" size={15} className="text-primary" />
                Нагрузка мастеров
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-3">
              {masters.map(m => (
                <div key={m.id}>
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-xs font-medium truncate">{m.name.split(' ').slice(0, 2).join(' ')}</p>
                    <span className="text-xs text-muted-foreground">{m.activeOrders} заявок</span>
                  </div>
                  <Progress value={(m.activeOrders / 10) * 100} className="h-1.5" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Low stock */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Icon name="Package" size={15} className="text-amber-500" />
                Заканчиваются запчасти
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              {lowStock.length === 0 ? (
                <p className="text-xs text-muted-foreground">Склад в порядке</p>
              ) : (
                <div className="space-y-2">
                  {lowStock.map(p => (
                    <div key={p.id} className="flex items-center justify-between gap-2">
                      <p className="text-xs truncate">{p.name}</p>
                      <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-300 shrink-0">
                        {p.quantity}/{p.minQuantity}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick stats */}
      <Card className="border shadow-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Заявок завершено (июнь)', value: '12' },
              { label: 'Средний чек', value: '₽ 6 450' },
              { label: 'Удовлетворённость', value: '4.7 / 5.0' },
              { label: 'Среднее время ремонта', value: '3.5 дня' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                {i > 0 && <Separator orientation="vertical" className="hidden sm:block" />}
                <p className="text-lg font-bold text-primary">{item.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
