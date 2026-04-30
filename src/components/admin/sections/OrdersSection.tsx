import { useEffect, useState } from 'react';
import { orderService } from '@/services/mockService';
import { Order, OrderStatus, mockClients, mockDevices, mockEmployees, mockPayments, mockWarranties } from '@/services/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { KPIRow, MiniChart, Timeline, ActivityFeed, AlertsList, InfoCard, KeyValueList, ProgressGoal, TopList } from '../widgets/Widgets';
import ViewSheet, { ViewGrid } from '../widgets/ViewSheet';

const STATUS_COLORS: Record<OrderStatus, string> = {
  'новая': 'bg-slate-100 text-slate-700 border-slate-200',
  'в работе': 'bg-blue-100 text-blue-700 border-blue-200',
  'ожидание запчастей': 'bg-amber-100 text-amber-700 border-amber-200',
  'готова': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'выдана': 'bg-purple-100 text-purple-700 border-purple-200',
  'отменена': 'bg-red-100 text-red-700 border-red-200',
};
const ALL_STATUSES: OrderStatus[] = ['новая', 'в работе', 'ожидание запчастей', 'готова', 'выдана', 'отменена'];

const EMPTY: Omit<Order, 'id' | 'number' | 'createdAt' | 'updatedAt'> = {
  clientId: '', deviceId: '', status: 'новая', description: '', diagnosis: '',
  masterNotes: '', masterId: '', deadline: '', estimatedCost: 0, finalCost: 0, paymentStatus: 'не оплачено'
};

export default function OrdersSection() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Order | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const load = async () => { setOrders(await orderService.getAll()); };
  useEffect(() => { load(); }, []);

  const filtered = orders.filter(o => {
    const client = mockClients.find(c => c.id === o.clientId);
    const matchSearch = o.number.toLowerCase().includes(search.toLowerCase()) ||
      (client?.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
      o.description.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: orders.length,
    inWork: orders.filter(o => o.status === 'в работе').length,
    waiting: orders.filter(o => o.status === 'ожидание запчастей').length,
    ready: orders.filter(o => o.status === 'готова').length,
  };

  const openCreate = () => { setEditing(null); setForm(EMPTY); setDialogOpen(true); };
  const openEdit = (o: Order) => {
    setEditing(o);
    const { id, number, createdAt, updatedAt, ...rest } = o;
    setForm(rest);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (editing) { await orderService.update(editing.id, form); toast({ title: 'Заявка обновлена' }); }
      else { await orderService.create(form); toast({ title: 'Заявка создана' }); }
      await load(); setDialogOpen(false);
    } finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await orderService.delete(deleteId);
    setDeleteId(null);
    toast({ title: 'Заявка удалена', variant: 'destructive' });
    await load();
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Заявки на ремонт</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Управление заявками, диагностика, сроки</p>
        </div>
        <Button onClick={openCreate} size="sm" className="gap-1.5">
          <Icon name="Plus" size={15} /> Новая заявка
        </Button>
      </div>

      {/* KPI BLOCK */}
      <KPIRow items={[
        { label: 'Всего заявок', value: stats.total, delta: '+2 за неделю', trend: 'up', icon: 'ClipboardList', accent: 'blue' },
        { label: 'В работе', value: stats.inWork, delta: 'активные', icon: 'Wrench', accent: 'amber' },
        { label: 'Ожидают запчасти', value: stats.waiting, delta: 'требуют внимания', icon: 'Clock', accent: 'red' },
        { label: 'Готовы к выдаче', value: stats.ready, delta: 'позвонить клиенту', icon: 'CheckCircle2', accent: 'emerald' },
      ]} />

      {/* TWO-COLUMN: chart + alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InfoCard title="Динамика заявок (7 дней)" icon="TrendingUp">
            <MiniChart values={[3, 5, 4, 7, 6, 8, 6]} labels={['П','В','С','Ч','П','С','В']} color="bg-primary" />
            <div className="flex items-center justify-between mt-3 pt-2 border-t text-xs">
              <span className="text-muted-foreground">Среднее в день</span>
              <span className="font-bold">5.6</span>
            </div>
          </InfoCard>
          <InfoCard title="Сравнение с прошлой неделей" icon="GitCompare">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Эта неделя</span>
                <span className="font-bold text-base">39</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Прошлая неделя</span>
                <span className="font-medium text-muted-foreground">31</span>
              </div>
              <div className="pt-2 border-t flex items-center gap-1.5">
                <Icon name="ArrowUp" size={13} className="text-emerald-600" />
                <span className="text-xs font-semibold text-emerald-600">+25.8%</span>
                <span className="text-[10px] text-muted-foreground">рост</span>
              </div>
            </div>
          </InfoCard>
        </div>
        <InfoCard title="Уведомления и алерты" icon="Bell">
          <AlertsList items={[
            { type: 'warning', title: '2 заявки просрочены', description: 'ЗА-2024-001, ЗА-2024-006' },
            { type: 'info', title: 'Запчасть прибыла', description: 'Ролик HP — для ЗА-2024-003' },
            { type: 'success', title: 'Готова к выдаче', description: 'ЗА-2024-002 — позвонить клиенту' },
          ]} />
        </InfoCard>
      </div>

      {/* Quick actions */}
      <Card className="border-0 bg-gradient-to-r from-primary/5 via-blue-50 to-violet-50 shadow-sm">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-muted-foreground mr-2">Быстрые действия:</span>
            {[
              { icon: 'Plus', label: 'Новая заявка', onClick: openCreate },
              { icon: 'Filter', label: 'Просрочки' },
              { icon: 'Phone', label: 'Готовые — звонок' },
              { icon: 'Printer', label: 'Печать актов' },
              { icon: 'Download', label: 'Экспорт в Excel' },
            ].map((a, i) => (
              <Button key={i} size="sm" variant="outline" className="h-7 text-xs gap-1.5 bg-white" onClick={a.onClick}>
                <Icon name={a.icon} size={12} />{a.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* TABLE */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3 pt-4 px-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск по номеру, клиенту..." className="pl-9 h-9" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-52 h-9">
                <SelectValue placeholder="Все статусы" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                {ALL_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="pl-4 w-32">Номер</TableHead>
                <TableHead>Клиент</TableHead>
                <TableHead className="hidden md:table-cell">Описание</TableHead>
                <TableHead className="hidden lg:table-cell">Статус</TableHead>
                <TableHead className="hidden xl:table-cell text-right">Стоимость</TableHead>
                <TableHead className="hidden lg:table-cell">Срок</TableHead>
                <TableHead className="w-28 text-right pr-4">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(o => {
                const client = mockClients.find(c => c.id === o.clientId);
                return (
                  <TableRow key={o.id} className="hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => setViewOrder(o)}>
                    <TableCell className="pl-4 font-mono text-xs font-semibold text-primary">{o.number}</TableCell>
                    <TableCell className="text-sm font-medium">{client?.name ?? '—'}</TableCell>
                    <TableCell className="hidden md:table-cell text-xs text-muted-foreground max-w-[200px] truncate">{o.description}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Badge className={`text-[10px] border ${STATUS_COLORS[o.status]}`}>{o.status}</Badge>
                    </TableCell>
                    <TableCell className="hidden xl:table-cell text-right text-sm">
                      {o.finalCost > 0 ? `₽ ${o.finalCost.toLocaleString()}` : o.estimatedCost > 0 ? `~₽ ${o.estimatedCost.toLocaleString()}` : '—'}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">{o.deadline}</TableCell>
                    <TableCell className="text-right pr-4" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => setViewOrder(o)}><Icon name="Eye" size={13} /></Button>
                        <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => openEdit(o)}><Icon name="Pencil" size={13} /></Button>
                        <Button variant="ghost" size="icon" className="w-7 h-7 text-destructive hover:text-destructive" onClick={() => setDeleteId(o.id)}><Icon name="Trash2" size={13} /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-sm">Заявок не найдено</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* VIEW SHEET — order detail */}
      {viewOrder && (() => {
        const client = mockClients.find(c => c.id === viewOrder.clientId);
        const device = mockDevices.find(d => d.id === viewOrder.deviceId);
        const master = mockEmployees.find(e => e.id === viewOrder.masterId);
        const payment = mockPayments.find(p => p.orderId === viewOrder.id);
        const warranty = mockWarranties.find(w => w.orderId === viewOrder.id);

        return (
          <ViewSheet
            open={!!viewOrder}
            onClose={() => setViewOrder(null)}
            title={viewOrder.number}
            subtitle={`${client?.name ?? ''} · ${device?.brand ?? ''} ${device?.model ?? ''}`}
            badge={{ text: viewOrder.status, color: STATUS_COLORS[viewOrder.status].replace('border-', 'border ') }}
            icon="ClipboardList"
            iconBg="bg-primary"
            onEdit={() => { setViewOrder(null); openEdit(viewOrder); }}
          >
            {/* 1. KPI оплата/срок */}
            <ViewGrid cols={3}>
              <InfoCard title="Стоимость" icon="Wallet">
                <p className="text-xl font-bold text-primary">₽ {(viewOrder.finalCost || viewOrder.estimatedCost).toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{viewOrder.finalCost ? 'итоговая' : 'оценка'}</p>
              </InfoCard>
              <InfoCard title="Срок" icon="Calendar">
                <p className="text-xl font-bold">{viewOrder.deadline || '—'}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">обновлено {viewOrder.updatedAt}</p>
              </InfoCard>
              <InfoCard title="Оплата" icon="CreditCard">
                <p className="text-base font-bold capitalize">{viewOrder.paymentStatus}</p>
                {payment && <p className="text-[10px] text-muted-foreground mt-0.5">{payment.method} · {payment.date}</p>}
              </InfoCard>
            </ViewGrid>

            {/* 2. Информационная карточка сущности */}
            <InfoCard title="Информационная карточка" icon="Info">
              <KeyValueList rows={[
                { label: 'Номер заявки', value: viewOrder.number, mono: true },
                { label: 'Клиент', value: client?.name ?? '—' },
                { label: 'Телефон', value: client?.phone ?? '—' },
                { label: 'Устройство', value: device ? `${device.brand} ${device.model}` : '—' },
                { label: 'Серийный №', value: device?.serial ?? '—', mono: true },
                { label: 'Мастер', value: master?.name ?? '—' },
                { label: 'Создана', value: viewOrder.createdAt },
                { label: 'Гарантия', value: warranty ? `${warranty.status}, до ${warranty.endDate}` : 'не оформлена' },
              ]} />
            </InfoCard>

            {/* 3. Описание + диагноз */}
            <ViewGrid cols={1}>
              <InfoCard title="Описание проблемы" icon="MessageSquare">
                <p className="text-xs leading-relaxed">{viewOrder.description || 'Не указано'}</p>
              </InfoCard>
              <InfoCard title="Диагноз и заметки мастера" icon="Stethoscope">
                <p className="text-xs leading-relaxed">{viewOrder.diagnosis || 'Диагностика не проведена'}</p>
                {viewOrder.masterNotes && (
                  <div className="mt-2 pt-2 border-t">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Заметки мастера</p>
                    <p className="text-xs italic text-muted-foreground">{viewOrder.masterNotes}</p>
                  </div>
                )}
              </InfoCard>
            </ViewGrid>

            {/* 4. Таймлайн заявки */}
            <InfoCard title="Таймлайн заявки" icon="GitBranch">
              <Timeline events={[
                { date: viewOrder.createdAt, title: 'Заявка создана', description: 'Принята менеджером', icon: 'Plus', color: 'blue' },
                { date: viewOrder.createdAt, title: 'Назначен мастер', description: master?.name ?? '—', icon: 'UserCheck', color: 'violet' },
                { date: viewOrder.updatedAt, title: 'Диагностика проведена', description: viewOrder.diagnosis ? 'Диагноз установлен' : 'В процессе', icon: 'Stethoscope', color: 'amber' },
                ...(viewOrder.status === 'готова' || viewOrder.status === 'выдана' ? [{ date: viewOrder.updatedAt, title: 'Ремонт завершён', description: 'Готов к выдаче', icon: 'CheckCircle2', color: 'emerald' as const }] : []),
                ...(viewOrder.status === 'выдана' ? [{ date: viewOrder.updatedAt, title: 'Выдана клиенту', description: 'Закрыта успешно', icon: 'PackageCheck', color: 'violet' as const }] : []),
              ]} />
            </InfoCard>

            {/* 5. Прогресс работ */}
            <InfoCard title="Прогресс работ" icon="ListChecks">
              <div className="space-y-2.5">
                <ProgressGoal label="Диагностика" current={viewOrder.diagnosis ? 100 : 30} target={100} unit="%" />
                <ProgressGoal label="Закупка запчастей" current={viewOrder.status === 'ожидание запчастей' ? 50 : viewOrder.status === 'новая' ? 0 : 100} target={100} unit="%" />
                <ProgressGoal label="Ремонтные работы" current={['готова','выдана'].includes(viewOrder.status) ? 100 : viewOrder.status === 'в работе' ? 60 : 0} target={100} unit="%" />
                <ProgressGoal label="Тестирование и QA" current={['готова','выдана'].includes(viewOrder.status) ? 100 : 0} target={100} unit="%" />
              </div>
            </InfoCard>

            {/* 6. Лента событий */}
            <InfoCard title="Лента событий" icon="Activity">
              <ActivityFeed items={[
                { user: master?.name ?? 'Мастер', action: 'обновил статус →', target: viewOrder.status, time: 'сегодня, 14:32' },
                { user: 'Захарова Лидия', action: 'оставила комментарий', time: 'сегодня, 12:18' },
                { user: master?.name ?? 'Мастер', action: 'добавил диагноз', time: 'вчера, 18:04' },
                { user: 'Петров Андрей', action: 'создал заявку', time: viewOrder.createdAt + ', 09:15' },
              ]} />
            </InfoCard>

            {/* 7. Рекомендации */}
            <InfoCard title="Рекомендации системы" icon="Sparkles">
              <AlertsList items={[
                { type: 'info', title: 'Похожая заявка в архиве', description: 'ЗА-2023-441 — тот же дефект, решён за 2 дня' },
                { type: 'warning', title: 'Близок дедлайн', description: `До ${viewOrder.deadline} осталось 2 дня` },
                { type: 'success', title: 'Доступна скидка постоянного клиента', description: '5% — клиент с историей > 3 заявок' },
              ]} />
            </InfoCard>

            {/* 8. Лог изменений */}
            <InfoCard title="Лог изменений" icon="History">
              <Timeline events={[
                { date: 'сегодня', title: 'Статус', description: '«в работе» → «' + viewOrder.status + '»', icon: 'RefreshCw', color: 'blue' },
                { date: 'вчера', title: 'Стоимость', description: 'Установлена оценка ₽ ' + viewOrder.estimatedCost.toLocaleString(), icon: 'DollarSign', color: 'emerald' },
                { date: viewOrder.createdAt, title: 'Создание', description: 'Заявка зарегистрирована', icon: 'FilePlus2', color: 'slate' },
              ]} />
            </InfoCard>
          </ViewSheet>
        );
      })()}

      {/* CREATE/EDIT DIALOG */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? 'Редактировать заявку' : 'Новая заявка'}</DialogTitle></DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Клиент</Label>
                <Select value={form.clientId} onValueChange={v => setForm(f => ({ ...f, clientId: v }))}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Выберите..." /></SelectTrigger>
                  <SelectContent>{mockClients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Устройство</Label>
                <Select value={form.deviceId} onValueChange={v => setForm(f => ({ ...f, deviceId: v }))}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Выберите..." /></SelectTrigger>
                  <SelectContent>{mockDevices.map(d => <SelectItem key={d.id} value={d.id}>{d.brand} {d.model}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Статус</Label>
                <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as OrderStatus }))}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>{ALL_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Мастер</Label>
                <Select value={form.masterId} onValueChange={v => setForm(f => ({ ...f, masterId: v }))}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Выберите..." /></SelectTrigger>
                  <SelectContent>{mockEmployees.filter(e => e.role === 'мастер').map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Описание проблемы</Label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="h-20 resize-none" />
            </div>
            <div className="space-y-1.5">
              <Label>Диагноз</Label>
              <Textarea value={form.diagnosis} onChange={e => setForm(f => ({ ...f, diagnosis: e.target.value }))} className="h-16 resize-none" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5"><Label>Срок</Label><Input type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} className="h-9" /></div>
              <div className="space-y-1.5"><Label>Оценка (₽)</Label><Input type="number" value={form.estimatedCost} onChange={e => setForm(f => ({ ...f, estimatedCost: +e.target.value }))} className="h-9" /></div>
              <div className="space-y-1.5"><Label>Итого (₽)</Label><Input type="number" value={form.finalCost} onChange={e => setForm(f => ({ ...f, finalCost: +e.target.value }))} className="h-9" /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Отмена</Button>
            <Button onClick={handleSave} disabled={loading}>{loading ? 'Сохранение...' : 'Сохранить'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={open => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить заявку?</AlertDialogTitle>
            <AlertDialogDescription>Это действие необратимо.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-white hover:bg-destructive/90">Удалить</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
