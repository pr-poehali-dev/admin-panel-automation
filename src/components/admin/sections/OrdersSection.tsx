import { useEffect, useState } from 'react';
import { orderService } from '@/services/mockService';
import { Order, OrderStatus, mockClients, mockDevices, mockEmployees } from '@/services/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

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
      if (editing) {
        await orderService.update(editing.id, form);
        toast({ title: 'Заявка обновлена' });
      } else {
        await orderService.create(form);
        toast({ title: 'Заявка создана' });
      }
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Заявки на ремонт</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Всего: {filtered.length}</p>
        </div>
        <Button onClick={openCreate} size="sm" className="gap-1.5">
          <Icon name="Plus" size={15} /> Новая заявка
        </Button>
      </div>

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
                <TableHead className="w-20 text-right pr-4">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(o => {
                const client = mockClients.find(c => c.id === o.clientId);
                return (
                  <TableRow key={o.id} className="hover:bg-muted/30 transition-colors">
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
                    <TableCell className="text-right pr-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => openEdit(o)}>
                          <Icon name="Pencil" size={13} />
                        </Button>
                        <Button variant="ghost" size="icon" className="w-7 h-7 text-destructive hover:text-destructive" onClick={() => setDeleteId(o.id)}>
                          <Icon name="Trash2" size={13} />
                        </Button>
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Редактировать заявку' : 'Новая заявка'}</DialogTitle>
          </DialogHeader>
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
              <div className="space-y-1.5">
                <Label>Срок (дата)</Label>
                <Input type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} className="h-9" />
              </div>
              <div className="space-y-1.5">
                <Label>Оценка (₽)</Label>
                <Input type="number" value={form.estimatedCost} onChange={e => setForm(f => ({ ...f, estimatedCost: +e.target.value }))} className="h-9" />
              </div>
              <div className="space-y-1.5">
                <Label>Итого (₽)</Label>
                <Input type="number" value={form.finalCost} onChange={e => setForm(f => ({ ...f, finalCost: +e.target.value }))} className="h-9" />
              </div>
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
            <AlertDialogDescription>Это действие необратимо. Заявка будет удалена из системы.</AlertDialogDescription>
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
