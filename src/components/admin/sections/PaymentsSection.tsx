import { useEffect, useState } from 'react';
import { paymentService } from '@/services/mockService';
import { Payment, PaymentStatus, mockOrders, mockClients } from '@/services/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { KPIRow, MiniChart, Timeline, ActivityFeed, AlertsList, InfoCard, KeyValueList, TopList, ServiceStatusList } from '../widgets/Widgets';
import ViewSheet, { ViewGrid } from '../widgets/ViewSheet';

const METHODS = ['наличные', 'карта', 'перевод', 'онлайн'] as const;
const STATUSES: PaymentStatus[] = ['не оплачено', 'частично', 'оплачено', 'возврат'];
const STATUS_COLORS: Record<PaymentStatus, string> = {
  'не оплачено': 'bg-slate-100 text-slate-600', 'частично': 'bg-amber-100 text-amber-700',
  'оплачено': 'bg-emerald-100 text-emerald-700', 'возврат': 'bg-red-100 text-red-700',
};
const METHOD_ICONS: Record<string, string> = { 'наличные': 'Banknote', 'карта': 'CreditCard', 'перевод': 'ArrowRightLeft', 'онлайн': 'Globe' };

const EMPTY: Omit<Payment, 'id'> = {
  orderId: '', amount: 0, method: 'карта', status: 'не оплачено', date: new Date().toISOString().slice(0, 10), notes: ''
};

export default function PaymentsSection() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewPay, setViewPay] = useState<Payment | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Payment | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const load = async () => setPayments(await paymentService.getAll());
  useEffect(() => { load(); }, []);

  const filtered = payments.filter(p => {
    const order = mockOrders.find(o => o.id === p.orderId);
    const matchSearch = (order?.number ?? '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPaid = payments.filter(p => p.status === 'оплачено').reduce((s, p) => s + p.amount, 0);
  const totalPending = payments.filter(p => p.status !== 'оплачено' && p.status !== 'возврат').reduce((s, p) => s + p.amount, 0);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setDialogOpen(true); };
  const openEdit = (p: Payment) => { setEditing(p); const { id, ...rest } = p; setForm(rest); setDialogOpen(true); };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (editing) { await paymentService.update(editing.id, form); toast({ title: 'Оплата обновлена' }); }
      else { await paymentService.create(form); toast({ title: 'Оплата добавлена' }); }
      await load(); setDialogOpen(false);
    } finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await paymentService.delete(deleteId);
    setDeleteId(null);
    toast({ title: 'Запись удалена', variant: 'destructive' });
    await load();
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h2 className="text-xl font-bold">Оплаты</h2><p className="text-sm text-muted-foreground mt-0.5">Финансовые операции, транзакции, дебиторка</p></div>
        <Button onClick={openCreate} size="sm" className="gap-1.5"><Icon name="Plus" size={15} /> Добавить оплату</Button>
      </div>

      <KPIRow items={[
        { label: 'Оплачено', value: `₽ ${totalPaid.toLocaleString()}`, delta: 'за период', trend: 'up', icon: 'CheckCircle2', accent: 'emerald' },
        { label: 'Дебиторка', value: `₽ ${totalPending.toLocaleString()}`, delta: 'ожидается', icon: 'Clock', accent: 'amber' },
        { label: 'Транзакций', value: payments.length, delta: 'всего', icon: 'Receipt', accent: 'blue' },
        { label: 'Средний чек', value: `₽ ${Math.round(totalPaid / Math.max(payments.filter(p => p.status === 'оплачено').length, 1)).toLocaleString()}`, delta: 'по оплаченным', icon: 'Tag', accent: 'violet' },
      ]} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <InfoCard title="Поступления (7 дней)" icon="LineChart">
          <MiniChart values={[5200, 0, 11500, 0, 10000, 0, 5200]} labels={['П','В','С','Ч','П','С','В']} color="bg-emerald-500" />
        </InfoCard>
        <InfoCard title="По методам оплаты" icon="PieChart">
          <div className="space-y-1.5 text-xs">
            {METHODS.map(m => {
              const cnt = payments.filter(p => p.method === m).length;
              return (
                <div key={m} className="flex items-center gap-2">
                  <Icon name={METHOD_ICONS[m]} size={12} className="text-muted-foreground" />
                  <span className="flex-1 capitalize">{m}</span>
                  <span className="font-semibold">{cnt}</span>
                </div>
              );
            })}
          </div>
        </InfoCard>
        <InfoCard title="Алерты по финансам" icon="Bell">
          <AlertsList items={[
            { type: 'warning', title: '1 заявка не оплачена', description: 'ЗА-2024-001 — оплата при получении' },
            { type: 'success', title: 'Поступило сегодня', description: '₽ 5 200' },
            { type: 'info', title: 'Сверка с банком', description: 'Запланирована на 30.06' },
          ]} />
        </InfoCard>
      </div>

      <Card className="border shadow-sm">
        <CardHeader className="pb-3 pt-4 px-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск по номеру заявки..." className="pl-9 h-9" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-44 h-9"><SelectValue placeholder="Статус" /></SelectTrigger>
              <SelectContent><SelectItem value="all">Все</SelectItem>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="pl-4">Заявка</TableHead>
                <TableHead className="text-right">Сумма</TableHead>
                <TableHead>Метод</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="hidden md:table-cell">Дата</TableHead>
                <TableHead className="hidden lg:table-cell">Заметки</TableHead>
                <TableHead className="w-28 text-right pr-4">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(p => {
                const order = mockOrders.find(o => o.id === p.orderId);
                return (
                  <TableRow key={p.id} className="hover:bg-muted/30 cursor-pointer" onClick={() => setViewPay(p)}>
                    <TableCell className="pl-4 font-mono text-xs font-semibold text-primary">{order?.number ?? '—'}</TableCell>
                    <TableCell className="text-right font-semibold text-sm">{p.amount > 0 ? `₽ ${p.amount.toLocaleString()}` : '—'}</TableCell>
                    <TableCell><span className="flex items-center gap-1.5 text-sm"><Icon name={METHOD_ICONS[p.method]} size={13} className="text-muted-foreground" />{p.method}</span></TableCell>
                    <TableCell><Badge className={`border-0 text-xs ${STATUS_COLORS[p.status]}`}>{p.status}</Badge></TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{p.date || '—'}</TableCell>
                    <TableCell className="hidden lg:table-cell text-xs text-muted-foreground max-w-[160px] truncate">{p.notes || '—'}</TableCell>
                    <TableCell className="text-right pr-4" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => setViewPay(p)}><Icon name="Eye" size={13} /></Button>
                        <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => openEdit(p)}><Icon name="Pencil" size={13} /></Button>
                        <Button variant="ghost" size="icon" className="w-7 h-7 text-destructive hover:text-destructive" onClick={() => setDeleteId(p.id)}><Icon name="Trash2" size={13} /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (<TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-sm">Не найдено</TableCell></TableRow>)}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {viewPay && (() => {
        const order = mockOrders.find(o => o.id === viewPay.orderId);
        const client = order ? mockClients.find(c => c.id === order.clientId) : null;
        return (
          <ViewSheet
            open={!!viewPay} onClose={() => setViewPay(null)}
            title={`Платёж ₽ ${viewPay.amount.toLocaleString()}`}
            subtitle={`${order?.number ?? '—'} · ${client?.name ?? ''}`}
            badge={{ text: viewPay.status, color: STATUS_COLORS[viewPay.status] }}
            icon={METHOD_ICONS[viewPay.method]} iconBg="bg-emerald-500"
            onEdit={() => { setViewPay(null); openEdit(viewPay); }}
          >
            <ViewGrid cols={3}>
              <InfoCard title="Сумма" icon="Wallet"><p className="text-xl font-bold text-emerald-700">₽ {viewPay.amount.toLocaleString()}</p></InfoCard>
              <InfoCard title="Метод" icon={METHOD_ICONS[viewPay.method]}><p className="text-base font-bold capitalize">{viewPay.method}</p></InfoCard>
              <InfoCard title="Дата" icon="Calendar"><p className="text-base font-bold">{viewPay.date || '—'}</p></InfoCard>
            </ViewGrid>

            <InfoCard title="Реквизиты транзакции" icon="Info">
              <KeyValueList rows={[
                { label: 'Заявка', value: order?.number ?? '—', mono: true },
                { label: 'Клиент', value: client?.name ?? '—' },
                { label: 'Сумма', value: `₽ ${viewPay.amount.toLocaleString()}` },
                { label: 'Метод', value: viewPay.method },
                { label: 'Статус', value: viewPay.status },
                { label: 'Дата', value: viewPay.date || '—' },
                { label: 'ID платежа', value: viewPay.id, mono: true },
              ]} />
            </InfoCard>

            <InfoCard title="Заметки" icon="StickyNote">
              <p className="text-xs italic bg-muted/40 p-2.5 rounded">{viewPay.notes || 'Без заметок'}</p>
            </InfoCard>

            <InfoCard title="Статус интеграций" icon="Plug">
              <ServiceStatusList items={[
                { name: 'Эквайринг банка', status: 'ok', latency: '124ms' },
                { name: 'Онлайн-касса', status: 'ok', latency: '88ms' },
                { name: 'Налоговая (ОФД)', status: 'ok', latency: '212ms' },
                { name: '1С Бухгалтерия', status: 'warn', latency: 'sync' },
              ]} />
            </InfoCard>

            <InfoCard title="Лента событий" icon="Activity">
              <ActivityFeed items={[
                { user: 'Белова Наталья', action: 'подтвердила платёж', target: `₽ ${viewPay.amount}`, time: viewPay.date },
                { user: 'Система', action: 'создала транзакцию', time: viewPay.date },
                { user: client?.name ?? 'Клиент', action: 'оплатил услугу', time: viewPay.date },
              ]} />
            </InfoCard>

            <InfoCard title="Таймлайн платежа" icon="GitBranch">
              <Timeline events={[
                { date: viewPay.date, title: 'Создана транзакция', icon: 'Plus', color: 'blue' },
                { date: viewPay.date, title: 'Передан в банк', icon: 'Send', color: 'violet' },
                { date: viewPay.date, title: viewPay.status === 'оплачено' ? 'Подтверждено банком' : 'Ожидание', icon: viewPay.status === 'оплачено' ? 'CheckCircle2' : 'Clock', color: viewPay.status === 'оплачено' ? 'emerald' : 'amber' },
                ...(viewPay.status === 'оплачено' ? [{ date: viewPay.date, title: 'Чек отправлен в ОФД', icon: 'Receipt', color: 'emerald' as const }] : []),
              ]} />
            </InfoCard>

            <InfoCard title="Рекомендации" icon="Sparkles">
              <AlertsList items={[
                { type: viewPay.status === 'оплачено' ? 'success' : 'warning', title: viewPay.status === 'оплачено' ? 'Платёж подтверждён' : 'Требует внимания' },
                { type: 'info', title: 'Чек доступен клиенту', description: 'Отправлен на email' },
              ]} />
            </InfoCard>
          </ViewSheet>
        );
      })()}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? 'Редактировать оплату' : 'Новая оплата'}</DialogTitle></DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="space-y-1.5"><Label>Заявка</Label>
              <Select value={form.orderId} onValueChange={v => setForm(f => ({ ...f, orderId: v }))}>
                <SelectTrigger className="h-9"><SelectValue placeholder="Выберите..." /></SelectTrigger>
                <SelectContent>{mockOrders.map(o => <SelectItem key={o.id} value={o.id}>{o.number}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Сумма ₽</Label><Input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: +e.target.value }))} className="h-9" /></div>
              <div className="space-y-1.5"><Label>Дата</Label><Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="h-9" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Метод</Label>
                <Select value={form.method} onValueChange={v => setForm(f => ({ ...f, method: v as Payment['method'] }))}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>{METHODS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Статус</Label>
                <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as PaymentStatus }))}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5"><Label>Заметки</Label><Input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="h-9" /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Отмена</Button><Button onClick={handleSave} disabled={loading}>{loading ? '...' : 'Сохранить'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={open => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Удалить запись?</AlertDialogTitle><AlertDialogDescription>Будет удалена.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Отмена</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive text-white hover:bg-destructive/90">Удалить</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
