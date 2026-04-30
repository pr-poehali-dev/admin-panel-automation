import { useEffect, useState } from 'react';
import { partService } from '@/services/mockService';
import { Part, mockSuppliers } from '@/services/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const CATEGORIES = ['Блоки питания', 'Накопители', 'Расходники', 'Память', 'Матрицы', 'Запчасти принтеров', 'Охлаждение', 'Другое'];

const EMPTY: Omit<Part, 'id' | 'lastUpdated'> = {
  name: '', sku: '', category: 'Другое', quantity: 0, minQuantity: 1, purchasePrice: 0, salePrice: 0, supplierId: '', location: ''
};

export default function PartsSection() {
  const [parts, setParts] = useState<Part[]>([]);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Part | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const load = async () => setParts(await partService.getAll());
  useEffect(() => { load(); }, []);

  const filtered = parts.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === 'all' || p.category === catFilter;
    return matchSearch && matchCat;
  });

  const openCreate = () => { setEditing(null); setForm(EMPTY); setDialogOpen(true); };
  const openEdit = (p: Part) => {
    setEditing(p);
    const { id, lastUpdated, ...rest } = p;
    setForm(rest);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (editing) { await partService.update(editing.id, form); toast({ title: 'Запчасть обновлена' }); }
      else { await partService.create(form); toast({ title: 'Запчасть добавлена' }); }
      await load(); setDialogOpen(false);
    } finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await partService.delete(deleteId);
    setDeleteId(null);
    toast({ title: 'Запчасть удалена', variant: 'destructive' });
    await load();
  };

  const stockLevel = (p: Part) => Math.min(100, (p.quantity / Math.max(p.minQuantity * 2, 1)) * 100);
  const isLow = (p: Part) => p.quantity <= p.minQuantity;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Склад — Запчасти</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Позиций: {filtered.length} · Мало запасов: {parts.filter(isLow).length}</p>
        </div>
        <Button onClick={openCreate} size="sm" className="gap-1.5">
          <Icon name="Plus" size={15} /> Добавить запчасть
        </Button>
      </div>

      <Card className="border shadow-sm">
        <CardHeader className="pb-3 pt-4 px-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск по названию, артикулу..." className="pl-9 h-9" />
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
                <TableHead className="pl-4">Название</TableHead>
                <TableHead className="hidden md:table-cell font-mono">Артикул</TableHead>
                <TableHead className="hidden sm:table-cell">Остаток</TableHead>
                <TableHead className="hidden lg:table-cell">Закупка</TableHead>
                <TableHead className="hidden lg:table-cell">Продажа</TableHead>
                <TableHead className="hidden xl:table-cell">Место</TableHead>
                <TableHead className="w-20 text-right pr-4">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(p => (
                <TableRow key={p.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="pl-4">
                    <div className="flex items-start gap-2">
                      {isLow(p) && <Icon name="AlertTriangle" size={14} className="text-amber-500 mt-0.5 shrink-0" />}
                      <div>
                        <p className="text-sm font-medium">{p.name}</p>
                        <Badge variant="outline" className="text-[10px] mt-0.5">{p.category}</Badge>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell font-mono text-xs text-muted-foreground">{p.sku}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <div className="space-y-1 min-w-[80px]">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-sm font-semibold ${isLow(p) ? 'text-amber-600' : 'text-foreground'}`}>{p.quantity}</span>
                        <span className="text-xs text-muted-foreground">/ мин {p.minQuantity}</span>
                      </div>
                      <Progress value={stockLevel(p)} className="h-1.5" />
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm">₽ {p.purchasePrice.toLocaleString()}</TableCell>
                  <TableCell className="hidden lg:table-cell text-sm font-medium text-emerald-700">₽ {p.salePrice.toLocaleString()}</TableCell>
                  <TableCell className="hidden xl:table-cell font-mono text-xs text-muted-foreground">{p.location}</TableCell>
                  <TableCell className="text-right pr-4">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => openEdit(p)}>
                        <Icon name="Pencil" size={13} />
                      </Button>
                      <Button variant="ghost" size="icon" className="w-7 h-7 text-destructive hover:text-destructive" onClick={() => setDeleteId(p.id)}>
                        <Icon name="Trash2" size={13} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-sm">Запчасти не найдены</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? 'Редактировать запчасть' : 'Новая запчасть'}</DialogTitle></DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="space-y-1.5">
              <Label>Название</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="h-9" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Артикул (SKU)</Label>
                <Input value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} className="h-9 font-mono" />
              </div>
              <div className="space-y-1.5">
                <Label>Категория</Label>
                <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>Количество</Label>
                <Input type="number" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: +e.target.value }))} className="h-9" />
              </div>
              <div className="space-y-1.5">
                <Label>Минимум</Label>
                <Input type="number" value={form.minQuantity} onChange={e => setForm(f => ({ ...f, minQuantity: +e.target.value }))} className="h-9" />
              </div>
              <div className="space-y-1.5">
                <Label>Место хранения</Label>
                <Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} className="h-9 font-mono" placeholder="A1-01" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Закупочная цена (₽)</Label>
                <Input type="number" value={form.purchasePrice} onChange={e => setForm(f => ({ ...f, purchasePrice: +e.target.value }))} className="h-9" />
              </div>
              <div className="space-y-1.5">
                <Label>Цена продажи (₽)</Label>
                <Input type="number" value={form.salePrice} onChange={e => setForm(f => ({ ...f, salePrice: +e.target.value }))} className="h-9" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Поставщик</Label>
              <Select value={form.supplierId} onValueChange={v => setForm(f => ({ ...f, supplierId: v }))}>
                <SelectTrigger className="h-9"><SelectValue placeholder="Выберите поставщика..." /></SelectTrigger>
                <SelectContent>{mockSuppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
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
            <AlertDialogTitle>Удалить запчасть?</AlertDialogTitle>
            <AlertDialogDescription>Позиция будет удалена из склада.</AlertDialogDescription>
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
