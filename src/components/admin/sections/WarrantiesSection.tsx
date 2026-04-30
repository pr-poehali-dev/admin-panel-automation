import { useEffect, useState } from 'react';
import { warrantyService } from '@/services/mockService';
import { Warranty, mockOrders, mockClients, mockDevices } from '@/services/mockData';
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
import { KPIRow, MiniChart, Timeline, ActivityFeed, AlertsList, InfoCard, KeyValueList, ProgressGoal, TagBadges } from '../widgets/Widgets';
import ViewSheet, { ViewGrid } from '../widgets/ViewSheet';

type WStatus = 'активна' | 'истекла' | 'использована';
const W_STATUSES: WStatus[] = ['активна', 'истекла', 'использована'];
const W_STATUS_COLORS: Record<WStatus, string> = {
  'активна': 'bg-emerald-100 text-emerald-700', 'истекла': 'bg-slate-100 text-slate-600', 'использована': 'bg-amber-100 text-amber-700',
};

const EMPTY: Omit<Warranty, 'id'> = {
  orderId: '', clientId: '', deviceId: '', startDate: new Date().toISOString().slice(0, 10),
  endDate: '', description: '', status: 'активна'
};

export default function WarrantiesSection() {
  const [warranties, setWarranties] = useState<Warranty[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewW, setViewW] = useState<Warranty | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Warranty | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const load = async () => setWarranties(await warrantyService.getAll());
  useEffect(() => { load(); }, []);

  const filtered = warranties.filter(w => {
    const client = mockClients.find(c => c.id === w.clientId);
    const matchSearch = (client?.name ?? '').toLowerCase().includes(search.toLowerCase()) || w.description.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || w.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const active = warranties.filter(w => w.status === 'активна');

  const openCreate = () => { setEditing(null); setForm(EMPTY); setDialogOpen(true); };
  const openEdit = (w: Warranty) => { setEditing(w); const { id, ...rest } = w; setForm(rest); setDialogOpen(true); };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (editing) { await warrantyService.update(editing.id, form); toast({ title: 'Гарантия обновлена' }); }
      else { await warrantyService.create(form); toast({ title: 'Гарантия добавлена' }); }
      await load(); setDialogOpen(false);
    } finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await warrantyService.delete(deleteId);
    setDeleteId(null);
    toast({ title: 'Удалено', variant: 'destructive' });
    await load();
  };

  const daysLeft = (endDate: string) => Math.ceil((new Date(endDate).getTime() - Date.now()) / 86400000);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h2 className="text-xl font-bold">Гарантии</h2><p className="text-sm text-muted-foreground mt-0.5">Гарантийные обязательства, рекламации</p></div>
        <Button onClick={openCreate} size="sm" className="gap-1.5"><Icon name="Plus" size={15} /> Новая гарантия</Button>
      </div>

      <KPIRow items={[
        { label: 'Активных', value: active.length, delta: 'действуют', icon: 'ShieldCheck', accent: 'emerald' },
        { label: 'Истекают (мес.)', value: active.filter(w => daysLeft(w.endDate) < 30).length, delta: 'до 30 дней', icon: 'Clock', accent: 'amber' },
        { label: 'Использовано', value: warranties.filter(w => w.status === 'использована').length, delta: 'рекламаций', icon: 'AlertCircle', accent: 'red' },
        { label: 'Всего выдано', value: warranties.length, delta: 'за всё время', icon: 'FileBadge', accent: 'blue' },
      ]} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <InfoCard title="Истекающие гарантии" icon="CalendarClock">
          <div className="space-y-1.5">
            {active.slice(0, 4).map(w => {
              const d = daysLeft(w.endDate);
              return (
                <div key={w.id} className="flex items-center gap-2 text-xs">
                  <Icon name="Shield" size={11} className={d < 30 ? 'text-amber-500' : 'text-emerald-500'} />
                  <span className="flex-1 truncate">{w.description.slice(0, 28)}...</span>
                  <span className={`font-semibold ${d < 30 ? 'text-amber-600' : 'text-muted-foreground'}`}>{d > 0 ? `${d} дн.` : 'истекла'}</span>
                </div>
              );
            })}
          </div>
        </InfoCard>
        <InfoCard title="Гарантии (6 мес.)" icon="LineChart">
          <MiniChart values={[2, 4, 3, 5, 4, 6]} labels={['Я','Ф','М','А','М','Ин']} color="bg-emerald-500" />
        </InfoCard>
        <InfoCard title="Алерты по гарантиям" icon="Bell">
          <AlertsList items={[
            { type: 'warning', title: '1 гарантия истекает', description: 'В течение 7 дней' },
            { type: 'info', title: 'Рекламация обработана', description: 'Замена клавиатуры — успешно' },
            { type: 'success', title: 'Все рекламации закрыты', description: 'За текущий месяц' },
          ]} />
        </InfoCard>
      </div>

      <Card className="border shadow-sm">
        <CardHeader className="pb-3 pt-4 px-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск по клиенту..." className="pl-9 h-9" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40 h-9"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="all">Все</SelectItem>{W_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="pl-4">Заявка</TableHead>
                <TableHead>Клиент</TableHead>
                <TableHead className="hidden md:table-cell">Устройство</TableHead>
                <TableHead className="hidden lg:table-cell">Период</TableHead>
                <TableHead className="hidden xl:table-cell">Осталось</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="w-28 text-right pr-4">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(w => {
                const order = mockOrders.find(o => o.id === w.orderId);
                const client = mockClients.find(c => c.id === w.clientId);
                const device = mockDevices.find(d => d.id === w.deviceId);
                const days = w.endDate ? daysLeft(w.endDate) : null;
                return (
                  <TableRow key={w.id} className="hover:bg-muted/30 cursor-pointer" onClick={() => setViewW(w)}>
                    <TableCell className="pl-4 font-mono text-xs font-semibold text-primary">{order?.number ?? '—'}</TableCell>
                    <TableCell className="text-sm">{client?.name?.split(' ').slice(0, 2).join(' ') ?? '—'}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{device ? `${device.brand} ${device.model}` : '—'}</TableCell>
                    <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">{w.startDate} — {w.endDate}</TableCell>
                    <TableCell className="hidden xl:table-cell text-sm">
                      {days !== null && w.status === 'активна' ? (
                        <span className={days > 30 ? 'text-emerald-600' : days > 0 ? 'text-amber-600 font-medium' : 'text-red-600 font-medium'}>{days > 0 ? `${days} дн.` : 'Истекает'}</span>
                      ) : '—'}
                    </TableCell>
                    <TableCell><Badge className={`border-0 text-xs ${W_STATUS_COLORS[w.status]}`}>{w.status}</Badge></TableCell>
                    <TableCell className="text-right pr-4" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => setViewW(w)}><Icon name="Eye" size={13} /></Button>
                        <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => openEdit(w)}><Icon name="Pencil" size={13} /></Button>
                        <Button variant="ghost" size="icon" className="w-7 h-7 text-destructive hover:text-destructive" onClick={() => setDeleteId(w.id)}><Icon name="Trash2" size={13} /></Button>
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

      {viewW && (() => {
        const order = mockOrders.find(o => o.id === viewW.orderId);
        const client = mockClients.find(c => c.id === viewW.clientId);
        const device = mockDevices.find(d => d.id === viewW.deviceId);
        const days = viewW.endDate ? daysLeft(viewW.endDate) : 0;
        const totalDays = viewW.startDate && viewW.endDate ? Math.ceil((new Date(viewW.endDate).getTime() - new Date(viewW.startDate).getTime()) / 86400000) : 90;
        return (
          <ViewSheet
            open={!!viewW} onClose={() => setViewW(null)}
            title="Гарантийные обязательства"
            subtitle={`${order?.number ?? '—'} · ${client?.name ?? ''}`}
            badge={{ text: viewW.status, color: W_STATUS_COLORS[viewW.status] }}
            icon="ShieldCheck" iconBg="bg-emerald-500"
            onEdit={() => { setViewW(null); openEdit(viewW); }}
          >
            <ViewGrid cols={3}>
              <InfoCard title="Осталось" icon="Clock"><p className="text-xl font-bold">{days > 0 ? `${days} дн.` : 'истекла'}</p></InfoCard>
              <InfoCard title="Действует с" icon="CalendarPlus"><p className="text-base font-bold">{viewW.startDate}</p></InfoCard>
              <InfoCard title="Действует до" icon="CalendarMinus"><p className="text-base font-bold">{viewW.endDate}</p></InfoCard>
            </ViewGrid>

            <InfoCard title="Прогресс срока гарантии" icon="Gauge">
              <ProgressGoal label="Использовано срока" current={Math.max(0, totalDays - Math.max(0, days))} target={totalDays} unit=" дн" />
              <p className="text-[10px] text-muted-foreground mt-2">Осталось ~ {Math.max(0, days)} из {totalDays} дней</p>
            </InfoCard>

            <InfoCard title="Информация о гарантии" icon="Info">
              <KeyValueList rows={[
                { label: 'Заявка', value: order?.number ?? '—', mono: true },
                { label: 'Клиент', value: client?.name ?? '—' },
                { label: 'Устройство', value: device ? `${device.brand} ${device.model}` : '—' },
                { label: 'Серийный', value: device?.serial ?? '—', mono: true },
                { label: 'Начало', value: viewW.startDate },
                { label: 'Окончание', value: viewW.endDate },
                { label: 'Статус', value: viewW.status },
              ]} />
            </InfoCard>

            <InfoCard title="Условия гарантии" icon="FileText">
              <p className="text-xs leading-relaxed bg-muted/40 p-2.5 rounded">{viewW.description}</p>
            </InfoCard>

            <InfoCard title="Метки" icon="Tags">
              <TagBadges tags={[viewW.status, days < 30 && days > 0 ? 'Скоро истекает' : '', `${totalDays} дн.`, 'Стандартная'].filter(Boolean) as string[]} />
            </InfoCard>

            <InfoCard title="Лента событий" icon="Activity">
              <ActivityFeed items={[
                { user: 'Захарова Лидия', action: 'оформила гарантию', target: order?.number, time: viewW.startDate },
                { user: 'Система', action: 'отправила копию клиенту', time: viewW.startDate },
                ...(viewW.status === 'использована' ? [{ user: client?.name ?? 'Клиент', action: 'обратился по гарантии', time: 'неделю назад' }] : []),
              ]} />
            </InfoCard>

            <InfoCard title="Таймлайн гарантии" icon="GitBranch">
              <Timeline events={[
                { date: viewW.startDate, title: 'Гарантия выдана', icon: 'ShieldCheck', color: 'emerald' },
                { date: viewW.startDate, title: 'Документ отправлен клиенту', icon: 'Mail', color: 'blue' },
                ...(viewW.status === 'использована' ? [{ date: 'недавно', title: 'Использована', description: 'Бесплатный ремонт', icon: 'Wrench', color: 'amber' as const }] : []),
                { date: viewW.endDate, title: viewW.status === 'истекла' ? 'Истекла' : 'Истечёт', icon: 'CalendarX', color: viewW.status === 'истекла' ? 'slate' : 'amber' },
              ]} />
            </InfoCard>

            <InfoCard title="Рекомендации" icon="Sparkles">
              <AlertsList items={[
                ...(days < 30 && days > 0 ? [{ type: 'warning' as const, title: 'Гарантия скоро истекает', description: 'Предложить продление' }] : []),
                { type: 'info', title: 'Условия в договоре', description: 'Применяется при заводском браке' },
                { type: 'success', title: 'Расширенная гарантия', description: 'Доступна за +15% к стоимости' },
              ]} />
            </InfoCard>
          </ViewSheet>
        );
      })()}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? 'Редактировать гарантию' : 'Новая гарантия'}</DialogTitle></DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="space-y-1.5"><Label>Заявка</Label>
              <Select value={form.orderId} onValueChange={v => setForm(f => ({ ...f, orderId: v }))}>
                <SelectTrigger className="h-9"><SelectValue placeholder="..." /></SelectTrigger>
                <SelectContent>{mockOrders.map(o => <SelectItem key={o.id} value={o.id}>{o.number}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Клиент</Label>
                <Select value={form.clientId} onValueChange={v => setForm(f => ({ ...f, clientId: v }))}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="..." /></SelectTrigger>
                  <SelectContent>{mockClients.map(c => <SelectItem key={c.id} value={c.id}>{c.name.split(' ').slice(0, 2).join(' ')}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Устройство</Label>
                <Select value={form.deviceId} onValueChange={v => setForm(f => ({ ...f, deviceId: v }))}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="..." /></SelectTrigger>
                  <SelectContent>{mockDevices.map(d => <SelectItem key={d.id} value={d.id}>{d.brand} {d.model}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Начало</Label><Input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} className="h-9" /></div>
              <div className="space-y-1.5"><Label>Окончание</Label><Input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} className="h-9" /></div>
            </div>
            <div className="space-y-1.5"><Label>Описание</Label><Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="h-9" /></div>
            <div className="space-y-1.5"><Label>Статус</Label>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as WStatus }))}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>{W_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Отмена</Button><Button onClick={handleSave} disabled={loading}>{loading ? '...' : 'Сохранить'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={open => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Удалить гарантию?</AlertDialogTitle><AlertDialogDescription>Будет удалена.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Отмена</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive text-white hover:bg-destructive/90">Удалить</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
