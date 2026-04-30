import { useEffect, useState } from 'react';
import { deviceService } from '@/services/mockService';
import { Device, DeviceType, mockClients, mockOrders } from '@/services/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { KPIRow, MiniChart, Timeline, ActivityFeed, AlertsList, InfoCard, KeyValueList, TopList, TagBadges } from '../widgets/Widgets';
import ViewSheet, { ViewGrid } from '../widgets/ViewSheet';

const DEVICE_TYPES: DeviceType[] = ['ноутбук', 'ПК', 'моноблок', 'планшет', 'принтер', 'МФУ', 'сервер', 'другое'];

const TYPE_ICONS: Record<DeviceType, string> = {
  'ноутбук': 'Laptop', 'ПК': 'Monitor', 'моноблок': 'MonitorSmartphone',
  'планшет': 'Tablet', 'принтер': 'Printer', 'МФУ': 'Printer',
  'сервер': 'Server', 'другое': 'HardDrive'
};
const TYPE_COLORS: Record<DeviceType, string> = {
  'ноутбук': 'bg-blue-50 text-blue-700', 'ПК': 'bg-indigo-50 text-indigo-700',
  'моноблок': 'bg-cyan-50 text-cyan-700', 'планшет': 'bg-purple-50 text-purple-700',
  'принтер': 'bg-orange-50 text-orange-700', 'МФУ': 'bg-orange-50 text-orange-700',
  'сервер': 'bg-red-50 text-red-700', 'другое': 'bg-slate-50 text-slate-700'
};

const EMPTY: Omit<Device, 'id'> = {
  clientId: '', type: 'ноутбук', brand: '', model: '', serial: '', condition: '', createdAt: new Date().toISOString().slice(0, 10)
};

export default function DevicesSection() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDevice, setViewDevice] = useState<Device | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Device | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const load = async () => setDevices(await deviceService.getAll());
  useEffect(() => { load(); }, []);

  const filtered = devices.filter(d => {
    const matchSearch = `${d.brand} ${d.model} ${d.serial}`.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || d.type === typeFilter;
    return matchSearch && matchType;
  });

  const typeStats = DEVICE_TYPES.map(t => ({ type: t, count: devices.filter(d => d.type === t).length })).filter(x => x.count > 0).sort((a, b) => b.count - a.count);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setDialogOpen(true); };
  const openEdit = (d: Device) => { setEditing(d); const { id, ...rest } = d; setForm(rest); setDialogOpen(true); };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (editing) { await deviceService.update(editing.id, form); toast({ title: 'Устройство обновлено' }); }
      else { await deviceService.create(form); toast({ title: 'Устройство добавлено' }); }
      await load(); setDialogOpen(false);
    } finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deviceService.delete(deleteId);
    setDeleteId(null);
    toast({ title: 'Устройство удалено', variant: 'destructive' });
    await load();
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Устройства</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Реестр клиентских устройств с историей ремонта</p>
        </div>
        <Button onClick={openCreate} size="sm" className="gap-1.5"><Icon name="Plus" size={15} /> Добавить устройство</Button>
      </div>

      <KPIRow items={[
        { label: 'Всего устройств', value: devices.length, delta: 'в реестре', icon: 'Cpu', accent: 'blue' },
        { label: 'Ноутбуки', value: devices.filter(d => d.type === 'ноутбук').length, delta: 'самый частый тип', icon: 'Laptop', accent: 'cyan' },
        { label: 'Серверы / ПК', value: devices.filter(d => d.type === 'ПК' || d.type === 'сервер').length, delta: 'B2B сегмент', icon: 'Server', accent: 'violet' },
        { label: 'Печать', value: devices.filter(d => d.type === 'принтер' || d.type === 'МФУ').length, delta: 'офисная техника', icon: 'Printer', accent: 'amber' },
      ]} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <InfoCard title="Распределение по типам" icon="PieChart">
          <div className="space-y-1.5">
            {typeStats.slice(0, 5).map(s => (
              <div key={s.type} className="flex items-center gap-2 text-xs">
                <span className={`w-1.5 h-1.5 rounded-full ${TYPE_COLORS[s.type].replace('bg-', 'bg-').replace('text-', '').split(' ')[0]}`} />
                <Icon name={TYPE_ICONS[s.type]} size={11} className="text-muted-foreground" />
                <span className="flex-1 capitalize">{s.type}</span>
                <span className="font-semibold">{s.count}</span>
              </div>
            ))}
          </div>
        </InfoCard>
        <InfoCard title="Популярные бренды" icon="Award">
          <TopList items={[
            { rank: 1, label: 'ASUS', value: '2 устр.', sub: 'ноутбуки' },
            { rank: 2, label: 'Apple', value: '1 устр.', sub: 'моноблок' },
            { rank: 3, label: 'HP', value: '1 устр.', sub: 'принтер' },
            { rank: 4, label: 'Dell', value: '1 устр.', sub: 'сервер' },
          ]} />
        </InfoCard>
        <InfoCard title="Статус сервисов диагностики" icon="ServerCog">
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_2px] shadow-emerald-500/40" /><span className="flex-1">База серийных номеров</span><span className="text-muted-foreground">12ms</span></div>
            <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_2px] shadow-emerald-500/40" /><span className="flex-1">Auto-detect драйверов</span><span className="text-muted-foreground">88ms</span></div>
            <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" /><span className="flex-1">Внешний каталог HP</span><span className="text-muted-foreground">312ms</span></div>
            <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_2px] shadow-emerald-500/40" /><span className="flex-1">QR-сканер устройств</span><span className="text-muted-foreground">ok</span></div>
          </div>
        </InfoCard>
      </div>

      <Card className="border shadow-sm">
        <CardHeader className="pb-3 pt-4 px-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск по бренду, модели, серийному номеру..." className="pl-9 h-9" />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-44 h-9"><SelectValue placeholder="Тип" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все типы</SelectItem>
                {DEVICE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="pl-4">Тип</TableHead>
                <TableHead>Устройство</TableHead>
                <TableHead className="hidden md:table-cell font-mono">Серийный №</TableHead>
                <TableHead className="hidden lg:table-cell">Клиент</TableHead>
                <TableHead className="hidden xl:table-cell">Состояние</TableHead>
                <TableHead className="w-28 text-right pr-4">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(d => {
                const client = mockClients.find(c => c.id === d.clientId);
                return (
                  <TableRow key={d.id} className="hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => setViewDevice(d)}>
                    <TableCell className="pl-4">
                      <Badge className={`gap-1.5 border-0 text-xs ${TYPE_COLORS[d.type]}`}>
                        <Icon name={TYPE_ICONS[d.type]} size={12} />{d.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-semibold">{d.brand} {d.model}</p>
                      <p className="text-xs text-muted-foreground">добавлено {d.createdAt}</p>
                    </TableCell>
                    <TableCell className="hidden md:table-cell font-mono text-xs text-muted-foreground">{d.serial}</TableCell>
                    <TableCell className="hidden lg:table-cell text-sm">{client?.name ?? '—'}</TableCell>
                    <TableCell className="hidden xl:table-cell text-xs text-muted-foreground max-w-[180px] truncate">{d.condition}</TableCell>
                    <TableCell className="text-right pr-4" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => setViewDevice(d)}><Icon name="Eye" size={13} /></Button>
                        <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => openEdit(d)}><Icon name="Pencil" size={13} /></Button>
                        <Button variant="ghost" size="icon" className="w-7 h-7 text-destructive hover:text-destructive" onClick={() => setDeleteId(d.id)}><Icon name="Trash2" size={13} /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (<TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-sm">Устройства не найдены</TableCell></TableRow>)}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {viewDevice && (() => {
        const client = mockClients.find(c => c.id === viewDevice.clientId);
        const orders = mockOrders.filter(o => o.deviceId === viewDevice.id);
        return (
          <ViewSheet
            open={!!viewDevice} onClose={() => setViewDevice(null)}
            title={`${viewDevice.brand} ${viewDevice.model}`}
            subtitle={`${viewDevice.type} · S/N: ${viewDevice.serial}`}
            badge={{ text: viewDevice.type, color: TYPE_COLORS[viewDevice.type] + ' border-0' }}
            icon={TYPE_ICONS[viewDevice.type]} iconBg="bg-slate-700"
            onEdit={() => { setViewDevice(null); openEdit(viewDevice); }}
          >
            <ViewGrid cols={3}>
              <InfoCard title="Заявок по этому устр." icon="ClipboardList"><p className="text-xl font-bold">{orders.length}</p><p className="text-[10px] text-muted-foreground mt-0.5">в истории</p></InfoCard>
              <InfoCard title="Возраст в базе" icon="Calendar"><p className="text-xl font-bold">~ {Math.max(1, Math.floor((Date.now() - new Date(viewDevice.createdAt).getTime()) / 86400000 / 30))} мес</p><p className="text-[10px] text-muted-foreground mt-0.5">с {viewDevice.createdAt}</p></InfoCard>
              <InfoCard title="Гарантия производителя" icon="ShieldCheck"><p className="text-base font-bold">истекла</p><p className="text-[10px] text-muted-foreground mt-0.5">по умолчанию</p></InfoCard>
            </ViewGrid>

            <InfoCard title="Спецификация устройства" icon="Cpu">
              <KeyValueList rows={[
                { label: 'Тип', value: viewDevice.type },
                { label: 'Бренд', value: viewDevice.brand },
                { label: 'Модель', value: viewDevice.model },
                { label: 'Серийный №', value: viewDevice.serial, mono: true },
                { label: 'Владелец', value: client?.name ?? '—' },
                { label: 'Принято в реестр', value: viewDevice.createdAt },
              ]} />
            </InfoCard>

            <InfoCard title="Текущее состояние" icon="Activity">
              <p className="text-xs leading-relaxed bg-muted/40 p-2.5 rounded">{viewDevice.condition || 'Состояние не описано'}</p>
            </InfoCard>

            <InfoCard title="Метки и категории" icon="Tags">
              <TagBadges tags={[viewDevice.type, viewDevice.brand, 'Гарантия истекла', 'B2C', 'Был в ремонте']} />
            </InfoCard>

            <InfoCard title="История ремонтов" icon="History">
              {orders.length === 0 ? <p className="text-xs text-muted-foreground">Заявок не было</p> : (
                <div className="space-y-1.5">
                  {orders.map(o => (
                    <div key={o.id} className="flex items-center gap-2 p-2 rounded bg-muted/40 text-xs">
                      <span className="font-mono font-semibold text-primary">{o.number}</span>
                      <span className="flex-1 truncate text-muted-foreground">{o.description}</span>
                      <Badge variant="outline" className="text-[10px]">{o.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </InfoCard>

            <InfoCard title="Таймлайн обслуживания" icon="GitBranch">
              <Timeline events={[
                { date: viewDevice.createdAt, title: 'Зарегистрировано', icon: 'Plus', color: 'blue' },
                ...(orders[0] ? [{ date: orders[0].createdAt, title: 'Первая заявка', description: orders[0].description.slice(0, 40), icon: 'Wrench', color: 'amber' as const }] : []),
                ...(orders.length > 1 ? [{ date: orders[orders.length - 1].createdAt, title: 'Последний ремонт', description: orders[orders.length - 1].status, icon: 'CheckCircle2', color: 'emerald' as const }] : []),
                { date: 'сегодня', title: 'Запись актуальна', icon: 'RefreshCw', color: 'slate' },
              ]} />
            </InfoCard>

            <InfoCard title="Лента событий" icon="Activity">
              <ActivityFeed items={[
                { user: 'Кириллов Максим', action: 'провёл диагностику', target: viewDevice.serial, time: 'неделю назад' },
                { user: 'Захарова Лидия', action: 'обновила состояние', time: '2 недели назад' },
                { user: 'Система', action: 'связала устройство с клиентом', target: client?.name ?? '—', time: '1 мес. назад' },
              ]} />
            </InfoCard>

            <InfoCard title="Рекомендации" icon="Sparkles">
              <AlertsList items={[
                { type: 'info', title: 'Сделать профилактику', description: 'Прошло 6 мес. с последней чистки' },
                { type: 'warning', title: 'Гарантия истекла', description: 'Предложить расширенную гарантию сервиса' },
                { type: 'success', title: 'Совместимая запчасть на складе', description: 'Доступна термопаста, SSD' },
              ]} />
            </InfoCard>
          </ViewSheet>
        );
      })()}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? 'Редактировать устройство' : 'Новое устройство'}</DialogTitle></DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="space-y-1.5"><Label>Клиент</Label>
              <Select value={form.clientId} onValueChange={v => setForm(f => ({ ...f, clientId: v }))}>
                <SelectTrigger className="h-9"><SelectValue placeholder="Выберите клиента..." /></SelectTrigger>
                <SelectContent>{mockClients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Тип устройства</Label>
              <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v as DeviceType }))}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>{DEVICE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Бренд</Label><Input value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} className="h-9" /></div>
              <div className="space-y-1.5"><Label>Модель</Label><Input value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))} className="h-9" /></div>
            </div>
            <div className="space-y-1.5"><Label>Серийный №</Label><Input value={form.serial} onChange={e => setForm(f => ({ ...f, serial: e.target.value }))} className="h-9 font-mono" /></div>
            <div className="space-y-1.5"><Label>Состояние</Label><Textarea value={form.condition} onChange={e => setForm(f => ({ ...f, condition: e.target.value }))} className="h-20 resize-none" /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Отмена</Button><Button onClick={handleSave} disabled={loading}>{loading ? 'Сохранение...' : 'Сохранить'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={open => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Удалить устройство?</AlertDialogTitle><AlertDialogDescription>Запись будет удалена.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Отмена</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive text-white hover:bg-destructive/90">Удалить</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
