import { useEffect, useState } from 'react';
import { deviceService } from '@/services/mockService';
import { Device, DeviceType, mockClients } from '@/services/mockData';
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

  const openCreate = () => { setEditing(null); setForm(EMPTY); setDialogOpen(true); };
  const openEdit = (d: Device) => {
    setEditing(d);
    const { id, ...rest } = d;
    setForm(rest);
    setDialogOpen(true);
  };

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
          <p className="text-sm text-muted-foreground mt-0.5">Всего: {filtered.length}</p>
        </div>
        <Button onClick={openCreate} size="sm" className="gap-1.5">
          <Icon name="Plus" size={15} /> Добавить устройство
        </Button>
      </div>

      <Card className="border shadow-sm">
        <CardHeader className="pb-3 pt-4 px-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск по бренду, модели, серийному номеру..." className="pl-9 h-9" />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-44 h-9">
                <SelectValue placeholder="Тип" />
              </SelectTrigger>
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
                <TableHead className="w-20 text-right pr-4">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(d => {
                const client = mockClients.find(c => c.id === d.clientId);
                return (
                  <TableRow key={d.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="pl-4">
                      <Badge className={`gap-1.5 border-0 text-xs ${TYPE_COLORS[d.type]}`}>
                        <Icon name={TYPE_ICONS[d.type]} size={12} />
                        {d.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-semibold">{d.brand} {d.model}</p>
                      <p className="text-xs text-muted-foreground">добавлено {d.createdAt}</p>
                    </TableCell>
                    <TableCell className="hidden md:table-cell font-mono text-xs text-muted-foreground">{d.serial}</TableCell>
                    <TableCell className="hidden lg:table-cell text-sm">{client?.name ?? '—'}</TableCell>
                    <TableCell className="hidden xl:table-cell text-xs text-muted-foreground max-w-[180px] truncate">{d.condition}</TableCell>
                    <TableCell className="text-right pr-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => openEdit(d)}>
                          <Icon name="Pencil" size={13} />
                        </Button>
                        <Button variant="ghost" size="icon" className="w-7 h-7 text-destructive hover:text-destructive" onClick={() => setDeleteId(d.id)}>
                          <Icon name="Trash2" size={13} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-sm">Устройства не найдены</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? 'Редактировать устройство' : 'Новое устройство'}</DialogTitle></DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="space-y-1.5">
              <Label>Клиент</Label>
              <Select value={form.clientId} onValueChange={v => setForm(f => ({ ...f, clientId: v }))}>
                <SelectTrigger className="h-9"><SelectValue placeholder="Выберите клиента..." /></SelectTrigger>
                <SelectContent>{mockClients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Тип устройства</Label>
              <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v as DeviceType }))}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>{DEVICE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Бренд</Label>
                <Input value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} placeholder="ASUS, Lenovo..." className="h-9" />
              </div>
              <div className="space-y-1.5">
                <Label>Модель</Label>
                <Input value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))} placeholder="VivoBook 15..." className="h-9" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Серийный номер</Label>
              <Input value={form.serial} onChange={e => setForm(f => ({ ...f, serial: e.target.value }))} className="h-9 font-mono" />
            </div>
            <div className="space-y-1.5">
              <Label>Состояние / Описание дефекта</Label>
              <Textarea value={form.condition} onChange={e => setForm(f => ({ ...f, condition: e.target.value }))} className="h-20 resize-none" />
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
            <AlertDialogTitle>Удалить устройство?</AlertDialogTitle>
            <AlertDialogDescription>Устройство будет удалено из базы данных системы.</AlertDialogDescription>
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
