import { useEffect, useState } from 'react';
import { serviceService } from '@/services/mockService';
import { Service } from '@/services/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const CATEGORIES = ['Диагностика', 'Чистка', 'Дисплеи', 'Данные', 'Программное обеспечение', 'Пайка', 'Сеть', 'Другое'];

const EMPTY: Omit<Service, 'id'> = {
  name: '', category: 'Другое', description: '', price: 0, duration: 60, isActive: true
};

export default function ServicesSection() {
  const [services, setServices] = useState<Service[]>([]);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const load = async () => setServices(await serviceService.getAll());
  useEffect(() => { load(); }, []);

  const filtered = services.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === 'all' || s.category === catFilter;
    return matchSearch && matchCat;
  });

  const openCreate = () => { setEditing(null); setForm(EMPTY); setDialogOpen(true); };
  const openEdit = (s: Service) => {
    setEditing(s);
    const { id, ...rest } = s;
    setForm(rest);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (editing) { await serviceService.update(editing.id, form); toast({ title: 'Услуга обновлена' }); }
      else { await serviceService.create(form); toast({ title: 'Услуга добавлена' }); }
      await load(); setDialogOpen(false);
    } finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await serviceService.delete(deleteId);
    setDeleteId(null);
    toast({ title: 'Услуга удалена', variant: 'destructive' });
    await load();
  };

  const fmtDuration = (min: number) => min >= 60 ? `${Math.floor(min / 60)} ч ${min % 60 > 0 ? `${min % 60} мин` : ''}`.trim() : `${min} мин`;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Прайс-лист услуг</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Позиций: {filtered.length}</p>
        </div>
        <Button onClick={openCreate} size="sm" className="gap-1.5">
          <Icon name="Plus" size={15} /> Добавить услугу
        </Button>
      </div>

      <Card className="border shadow-sm">
        <CardHeader className="pb-3 pt-4 px-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск по названию..." className="pl-9 h-9" />
            </div>
            <Select value={catFilter} onValueChange={setCatFilter}>
              <SelectTrigger className="w-full sm:w-48 h-9"><SelectValue placeholder="Категория" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все категории</SelectItem>
                {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="pl-4">Название услуги</TableHead>
                <TableHead>Категория</TableHead>
                <TableHead className="hidden md:table-cell">Описание</TableHead>
                <TableHead className="text-right">Цена</TableHead>
                <TableHead className="hidden lg:table-cell text-right">Длительность</TableHead>
                <TableHead className="hidden sm:table-cell text-center">Статус</TableHead>
                <TableHead className="w-20 text-right pr-4">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(s => (
                <TableRow key={s.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="pl-4 text-sm font-medium">{s.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">{s.category}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-xs text-muted-foreground max-w-[200px] truncate">{s.description}</TableCell>
                  <TableCell className="text-right text-sm font-semibold text-primary">₽ {s.price.toLocaleString()}</TableCell>
                  <TableCell className="hidden lg:table-cell text-right text-xs text-muted-foreground">{fmtDuration(s.duration)}</TableCell>
                  <TableCell className="hidden sm:table-cell text-center">
                    <Badge className={s.isActive ? 'bg-emerald-50 text-emerald-700 border-0 text-xs' : 'bg-slate-100 text-slate-500 border-0 text-xs'}>
                      {s.isActive ? 'Активна' : 'Скрыта'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-4">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => openEdit(s)}>
                        <Icon name="Pencil" size={13} />
                      </Button>
                      <Button variant="ghost" size="icon" className="w-7 h-7 text-destructive hover:text-destructive" onClick={() => setDeleteId(s.id)}>
                        <Icon name="Trash2" size={13} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-sm">Услуги не найдены</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? 'Редактировать услугу' : 'Новая услуга'}</DialogTitle></DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="space-y-1.5">
              <Label>Название</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="h-9" />
            </div>
            <div className="space-y-1.5">
              <Label>Категория</Label>
              <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Описание</Label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="h-20 resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Цена (₽)</Label>
                <Input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: +e.target.value }))} className="h-9" />
              </div>
              <div className="space-y-1.5">
                <Label>Длительность (мин.)</Label>
                <Input type="number" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: +e.target.value }))} className="h-9" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.isActive} onCheckedChange={v => setForm(f => ({ ...f, isActive: v }))} />
              <Label>Услуга активна</Label>
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
            <AlertDialogTitle>Удалить услугу?</AlertDialogTitle>
            <AlertDialogDescription>Услуга будет удалена из прайс-листа.</AlertDialogDescription>
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
