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

type WStatus = 'активна' | 'истекла' | 'использована';
const W_STATUSES: WStatus[] = ['активна', 'истекла', 'использована'];
const W_STATUS_COLORS: Record<WStatus, string> = {
  'активна': 'bg-emerald-100 text-emerald-700',
  'истекла': 'bg-slate-100 text-slate-600',
  'использована': 'bg-amber-100 text-amber-700',
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

  const openCreate = () => { setEditing(null); setForm(EMPTY); setDialogOpen(true); };
  const openEdit = (w: Warranty) => {
    setEditing(w);
    const { id, ...rest } = w;
    setForm(rest);
    setDialogOpen(true);
  };

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
    toast({ title: 'Гарантия удалена', variant: 'destructive' });
    await load();
  };

  const daysLeft = (endDate: string) => {
    const diff = Math.ceil((new Date(endDate).getTime() - Date.now()) / 86400000);
    return diff;
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Гарантийные случаи</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Всего: {filtered.length} · Активных: {warranties.filter(w => w.status === 'активна').length}</p>
        </div>
        <Button onClick={openCreate} size="sm" className="gap-1.5">
          <Icon name="Plus" size={15} /> Добавить гарантию
        </Button>
      </div>

      <Card className="border shadow-sm">
        <CardHeader className="pb-3 pt-4 px-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск по клиенту, описанию..." className="pl-9 h-9" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40 h-9"><SelectValue placeholder="Статус" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все</SelectItem>
                {W_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
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
                <TableHead className="w-20 text-right pr-4">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(w => {
                const order = mockOrders.find(o => o.id === w.orderId);
                const client = mockClients.find(c => c.id === w.clientId);
                const device = mockDevices.find(d => d.id === w.deviceId);
                const days = w.endDate ? daysLeft(w.endDate) : null;
                return (
                  <TableRow key={w.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="pl-4 font-mono text-xs font-semibold text-primary">{order?.number ?? '—'}</TableCell>
                    <TableCell className="text-sm">{client?.name?.split(' ').slice(0, 2).join(' ') ?? '—'}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {device ? `${device.brand} ${device.model}` : '—'}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                      {w.startDate} — {w.endDate}
                    </TableCell>
                    <TableCell className="hidden xl:table-cell text-sm">
                      {days !== null && w.status === 'активна' ? (
                        <span className={days > 30 ? 'text-emerald-600' : days > 0 ? 'text-amber-600 font-medium' : 'text-red-600 font-medium'}>
                          {days > 0 ? `${days} дн.` : 'Истекает'}
                        </span>
                      ) : '—'}
                    </TableCell>
                    <TableCell>
                      <Badge className={`border-0 text-xs ${W_STATUS_COLORS[w.status]}`}>{w.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right pr-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => openEdit(w)}>
                          <Icon name="Pencil" size={13} />
                        </Button>
                        <Button variant="ghost" size="icon" className="w-7 h-7 text-destructive hover:text-destructive" onClick={() => setDeleteId(w.id)}>
                          <Icon name="Trash2" size={13} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-sm">Гарантии не найдены</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? 'Редактировать гарантию' : 'Новая гарантия'}</DialogTitle></DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="space-y-1.5">
              <Label>Заявка</Label>
              <Select value={form.orderId} onValueChange={v => setForm(f => ({ ...f, orderId: v }))}>
                <SelectTrigger className="h-9"><SelectValue placeholder="Выберите заявку..." /></SelectTrigger>
                <SelectContent>{mockOrders.map(o => <SelectItem key={o.id} value={o.id}>{o.number}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Клиент</Label>
                <Select value={form.clientId} onValueChange={v => setForm(f => ({ ...f, clientId: v }))}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Выберите..." /></SelectTrigger>
                  <SelectContent>{mockClients.map(c => <SelectItem key={c.id} value={c.id}>{c.name.split(' ')[0]} {c.name.split(' ')[1]}</SelectItem>)}</SelectContent>
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
                <Label>Начало</Label>
                <Input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} className="h-9" />
              </div>
              <div className="space-y-1.5">
                <Label>Окончание</Label>
                <Input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} className="h-9" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Описание гарантии</Label>
              <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="h-9" />
            </div>
            <div className="space-y-1.5">
              <Label>Статус</Label>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as WStatus }))}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>{W_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
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
            <AlertDialogTitle>Удалить гарантию?</AlertDialogTitle>
            <AlertDialogDescription>Гарантийная запись будет удалена из системы.</AlertDialogDescription>
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
