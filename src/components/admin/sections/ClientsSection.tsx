import { useEffect, useState } from 'react';
import { clientService } from '@/services/mockService';
import { Client, mockOrders, mockDevices } from '@/services/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { KPIRow, MiniChart, Timeline, ActivityFeed, AlertsList, InfoCard, KeyValueList, TopList, TagBadges } from '../widgets/Widgets';
import ViewSheet, { ViewGrid } from '../widgets/ViewSheet';

const EMPTY: Omit<Client, 'id' | 'totalOrders'> = {
  name: '', phone: '', email: '', address: '', createdAt: new Date().toISOString().slice(0, 10), notes: ''
};

export default function ClientsSection() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewClient, setViewClient] = useState<Client | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Client | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const load = async () => setClients(await clientService.getAll());
  useEffect(() => { load(); }, []);

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search) || c.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalOrders = clients.reduce((s, c) => s + c.totalOrders, 0);
  const vipCount = clients.filter(c => c.totalOrders >= 5).length;

  const openCreate = () => { setEditing(null); setForm(EMPTY); setDialogOpen(true); };
  const openEdit = (c: Client) => {
    setEditing(c);
    const { id, totalOrders, ...rest } = c;
    setForm(rest);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (editing) { await clientService.update(editing.id, form); toast({ title: 'Клиент обновлён' }); }
      else { await clientService.create(form); toast({ title: 'Клиент добавлен' }); }
      await load(); setDialogOpen(false);
    } finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await clientService.delete(deleteId);
    setDeleteId(null);
    toast({ title: 'Клиент удалён', variant: 'destructive' });
    await load();
  };

  const initials = (name: string) => name.split(' ').slice(0, 2).map(w => w[0]).join('');

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Клиенты</h2>
          <p className="text-sm text-muted-foreground mt-0.5">База клиентов, история обращений, сегментация</p>
        </div>
        <Button onClick={openCreate} size="sm" className="gap-1.5"><Icon name="UserPlus" size={15} /> Добавить клиента</Button>
      </div>

      <KPIRow items={[
        { label: 'Всего клиентов', value: clients.length, delta: '+1 за неделю', trend: 'up', icon: 'Users', accent: 'blue' },
        { label: 'VIP-клиенты', value: vipCount, delta: '> 5 заявок', icon: 'Crown', accent: 'amber' },
        { label: 'Всего заявок', value: totalOrders, delta: 'история', icon: 'ClipboardList', accent: 'violet' },
        { label: 'Средний LTV', value: '₽ 24 800', delta: '+8% к прошл. кв.', trend: 'up', icon: 'TrendingUp', accent: 'emerald' },
      ]} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <InfoCard title="Прирост клиентов (6 мес.)" icon="LineChart">
          <MiniChart values={[2, 3, 5, 4, 7, 6]} labels={['Я','Ф','М','А','М','Ин']} color="bg-emerald-500" />
        </InfoCard>
        <InfoCard title="Топ клиенты по заявкам" icon="Trophy">
          <TopList items={[...clients].sort((a, b) => b.totalOrders - a.totalOrders).slice(0, 4).map((c, i) => ({
            rank: i + 1, label: c.name.split(' ').slice(0, 2).join(' '), value: `${c.totalOrders} заявок`,
            sub: c.totalOrders >= 5 ? 'VIP' : 'Постоянный',
          }))} />
        </InfoCard>
        <InfoCard title="Алерты по базе" icon="Bell">
          <AlertsList items={[
            { type: 'warning', title: '3 клиента без активности', description: 'Более 6 месяцев' },
            { type: 'success', title: 'Новые VIP', description: 'Козлов Д.С. перешёл в VIP' },
            { type: 'info', title: 'Дни рождения на этой неделе', description: '2 клиента' },
          ]} />
        </InfoCard>
      </div>

      <Card className="border shadow-sm">
        <CardHeader className="pb-3 pt-4 px-4">
          <div className="relative max-w-sm">
            <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск по имени, телефону, email..." className="pl-9 h-9" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="pl-4">Клиент</TableHead>
                <TableHead>Телефон</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead className="hidden lg:table-cell">Адрес</TableHead>
                <TableHead className="hidden sm:table-cell text-center">Заявки</TableHead>
                <TableHead className="hidden xl:table-cell">Заметки</TableHead>
                <TableHead className="w-28 text-right pr-4">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(c => (
                <TableRow key={c.id} className="hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => setViewClient(c)}>
                  <TableCell className="pl-4">
                    <div className="flex items-center gap-2.5">
                      <Avatar className="w-8 h-8"><AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">{initials(c.name)}</AvatarFallback></Avatar>
                      <div><p className="text-sm font-medium">{c.name}</p><p className="text-xs text-muted-foreground">с {c.createdAt}</p></div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{c.phone}</TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{c.email}</TableCell>
                  <TableCell className="hidden lg:table-cell text-xs text-muted-foreground max-w-[160px] truncate">{c.address}</TableCell>
                  <TableCell className="hidden sm:table-cell text-center"><Badge variant="secondary" className="text-xs">{c.totalOrders}</Badge></TableCell>
                  <TableCell className="hidden xl:table-cell text-xs text-muted-foreground max-w-[140px] truncate">{c.notes || '—'}</TableCell>
                  <TableCell className="text-right pr-4" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => setViewClient(c)}><Icon name="Eye" size={13} /></Button>
                      <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => openEdit(c)}><Icon name="Pencil" size={13} /></Button>
                      <Button variant="ghost" size="icon" className="w-7 h-7 text-destructive hover:text-destructive" onClick={() => setDeleteId(c.id)}><Icon name="Trash2" size={13} /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (<TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-sm">Клиенты не найдены</TableCell></TableRow>)}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {viewClient && (() => {
        const orders = mockOrders.filter(o => o.clientId === viewClient.id);
        const devices = mockDevices.filter(d => d.clientId === viewClient.id);
        const isVip = viewClient.totalOrders >= 5;
        return (
          <ViewSheet
            open={!!viewClient} onClose={() => setViewClient(null)}
            title={viewClient.name} subtitle={`${viewClient.phone} · ${viewClient.email}`}
            badge={isVip ? { text: 'VIP клиент', color: 'bg-amber-100 text-amber-700' } : { text: 'Постоянный', color: 'bg-blue-100 text-blue-700' }}
            initials={initials(viewClient.name)}
            onEdit={() => { setViewClient(null); openEdit(viewClient); }}
          >
            <ViewGrid cols={3}>
              <InfoCard title="Заявок всего" icon="ClipboardList"><p className="text-xl font-bold">{viewClient.totalOrders}</p><p className="text-[10px] text-muted-foreground mt-0.5">за всё время</p></InfoCard>
              <InfoCard title="Сумма" icon="Wallet"><p className="text-xl font-bold text-emerald-700">₽ {(viewClient.totalOrders * 6450).toLocaleString()}</p><p className="text-[10px] text-muted-foreground mt-0.5">оборот</p></InfoCard>
              <InfoCard title="Устройств" icon="Cpu"><p className="text-xl font-bold">{devices.length}</p><p className="text-[10px] text-muted-foreground mt-0.5">в базе</p></InfoCard>
            </ViewGrid>

            <InfoCard title="Контактные данные" icon="Contact">
              <KeyValueList rows={[
                { label: 'ФИО', value: viewClient.name },
                { label: 'Телефон', value: viewClient.phone, mono: true },
                { label: 'Email', value: viewClient.email },
                { label: 'Адрес', value: viewClient.address },
                { label: 'Клиент с', value: viewClient.createdAt },
                { label: 'Сегмент', value: isVip ? 'VIP' : viewClient.totalOrders > 1 ? 'Постоянный' : 'Новый' },
              ]} />
            </InfoCard>

            <InfoCard title="Сегменты и теги" icon="Tags">
              <TagBadges tags={[
                isVip ? 'VIP' : 'Постоянный',
                viewClient.notes.includes('Корпоративный') ? 'B2B' : 'B2C',
                'Активен', viewClient.totalOrders > 3 ? 'Лояльный' : 'Развивающийся', 'Email-рассылка',
              ]} />
            </InfoCard>

            <InfoCard title="История заявок" icon="History">
              {orders.length === 0 ? <p className="text-xs text-muted-foreground">Заявок пока нет</p> : (
                <div className="space-y-1.5">
                  {orders.slice(0, 5).map(o => (
                    <div key={o.id} className="flex items-center gap-2 p-2 rounded bg-muted/40 text-xs">
                      <span className="font-mono font-semibold text-primary">{o.number}</span>
                      <span className="flex-1 truncate text-muted-foreground">{o.description}</span>
                      <Badge variant="outline" className="text-[10px]">{o.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </InfoCard>

            <InfoCard title="Лента активности" icon="Activity">
              <ActivityFeed items={[
                { user: viewClient.name, action: 'оставил заявку', target: orders[0]?.number ?? '—', time: '3 дня назад' },
                { user: 'Захарова Лидия', action: 'обновила контакт', time: 'неделю назад' },
                { user: viewClient.name, action: 'забрал устройство', time: '2 недели назад' },
                { user: 'Система', action: 'отправила SMS', time: 'месяц назад' },
              ]} />
            </InfoCard>

            <InfoCard title="Таймлайн отношений" icon="GitBranch">
              <Timeline events={[
                { date: viewClient.createdAt, title: 'Регистрация', icon: 'UserPlus', color: 'blue' },
                { date: '2024-02-01', title: 'Первая заявка', description: 'Ремонт устройства', icon: 'ClipboardList', color: 'violet' },
                { date: '2024-04-15', title: 'Перешёл в постоянные', description: '3-я заявка завершена', icon: 'Award', color: 'emerald' },
                ...(isVip ? [{ date: '2024-06-01', title: 'VIP-статус', description: '5+ успешных заявок', icon: 'Crown', color: 'amber' as const }] : []),
              ]} />
            </InfoCard>

            <InfoCard title="Заметки CRM" icon="StickyNote">
              <p className="text-xs italic text-muted-foreground bg-muted/30 p-2.5 rounded">{viewClient.notes || 'Нет заметок'}</p>
            </InfoCard>

            <InfoCard title="Рекомендации" icon="Sparkles">
              <AlertsList items={[
                ...(isVip ? [{ type: 'success' as const, title: 'Предложить расширенную гарантию', description: 'VIP — приоритет в обслуживании' }] : []),
                { type: 'info', title: 'Не общались > 30 дней', description: 'Подходит для re-engagement' },
                { type: 'warning', title: 'Адрес не подтверждён', description: 'Уточнить при контакте' },
              ]} />
            </InfoCard>
          </ViewSheet>
        );
      })()}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? 'Редактировать клиента' : 'Новый клиент'}</DialogTitle></DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="space-y-1.5"><Label>ФИО</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="h-9" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Телефон</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="h-9" /></div>
              <div className="space-y-1.5"><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="h-9" /></div>
            </div>
            <div className="space-y-1.5"><Label>Адрес</Label><Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className="h-9" /></div>
            <div className="space-y-1.5"><Label>Заметки</Label><Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="h-16 resize-none" /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Отмена</Button><Button onClick={handleSave} disabled={loading}>{loading ? 'Сохранение...' : 'Сохранить'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={open => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Удалить клиента?</AlertDialogTitle><AlertDialogDescription>История сохранится, но профиль будет удалён.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Отмена</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive text-white hover:bg-destructive/90">Удалить</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
