import { useEffect, useState } from 'react';
import { supplierService } from '@/services/mockService';
import { Supplier } from '@/services/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const EMPTY: Omit<Supplier, 'id' | 'createdAt'> = {
  name: '', contactPerson: '', phone: '', email: '', address: '', inn: '', paymentTerms: '', rating: 5.0, isActive: true
};

export default function SuppliersSection() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const load = async () => setSuppliers(await supplierService.getAll());
  useEffect(() => { load(); }, []);

  const filtered = suppliers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.contactPerson.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => { setEditing(null); setForm(EMPTY); setDialogOpen(true); };
  const openEdit = (s: Supplier) => {
    setEditing(s);
    const { id, createdAt, ...rest } = s;
    setForm(rest);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (editing) { await supplierService.update(editing.id, form); toast({ title: 'Поставщик обновлён' }); }
      else { await supplierService.create(form); toast({ title: 'Поставщик добавлен' }); }
      await load(); setDialogOpen(false);
    } finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await supplierService.delete(deleteId);
    setDeleteId(null);
    toast({ title: 'Поставщик удалён', variant: 'destructive' });
    await load();
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Поставщики</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Всего: {filtered.length}</p>
        </div>
        <Button onClick={openCreate} size="sm" className="gap-1.5">
          <Icon name="Plus" size={15} /> Добавить поставщика
        </Button>
      </div>

      <Card className="border shadow-sm">
        <CardHeader className="pb-3 pt-4 px-4">
          <div className="relative max-w-sm">
            <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск по названию, контакту..." className="pl-9 h-9" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="pl-4">Компания</TableHead>
                <TableHead className="hidden md:table-cell">Контакт</TableHead>
                <TableHead className="hidden lg:table-cell">Телефон</TableHead>
                <TableHead className="hidden xl:table-cell font-mono">ИНН</TableHead>
                <TableHead className="hidden lg:table-cell text-center">Рейтинг</TableHead>
                <TableHead className="hidden sm:table-cell">Условия</TableHead>
                <TableHead className="hidden sm:table-cell text-center">Статус</TableHead>
                <TableHead className="w-20 text-right pr-4">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(s => (
                <TableRow key={s.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="pl-4">
                    <p className="text-sm font-semibold">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.email}</p>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm">{s.contactPerson}</TableCell>
                  <TableCell className="hidden lg:table-cell text-sm">{s.phone}</TableCell>
                  <TableCell className="hidden xl:table-cell font-mono text-xs text-muted-foreground">{s.inn}</TableCell>
                  <TableCell className="hidden lg:table-cell text-center">
                    <span className="flex items-center justify-center gap-1 text-sm">
                      <Icon name="Star" size={12} className="text-amber-400 fill-amber-400" />
                      {s.rating.toFixed(1)}
                    </span>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">{s.paymentTerms}</TableCell>
                  <TableCell className="hidden sm:table-cell text-center">
                    <Badge className={s.isActive ? 'bg-emerald-50 text-emerald-700 border-0 text-xs' : 'bg-slate-100 text-slate-500 border-0 text-xs'}>
                      {s.isActive ? 'Активен' : 'Неактивен'}
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
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground text-sm">Поставщики не найдены</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? 'Редактировать поставщика' : 'Новый поставщик'}</DialogTitle></DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="space-y-1.5">
              <Label>Название компании</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="h-9" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Контактное лицо</Label>
                <Input value={form.contactPerson} onChange={e => setForm(f => ({ ...f, contactPerson: e.target.value }))} className="h-9" />
              </div>
              <div className="space-y-1.5">
                <Label>ИНН</Label>
                <Input value={form.inn} onChange={e => setForm(f => ({ ...f, inn: e.target.value }))} className="h-9 font-mono" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Телефон</Label>
                <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="h-9" />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="h-9" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Адрес</Label>
              <Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className="h-9" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Условия оплаты</Label>
                <Input value={form.paymentTerms} onChange={e => setForm(f => ({ ...f, paymentTerms: e.target.value }))} placeholder="Отсрочка 14 дней" className="h-9" />
              </div>
              <div className="space-y-1.5">
                <Label>Рейтинг</Label>
                <Input type="number" min="1" max="5" step="0.1" value={form.rating} onChange={e => setForm(f => ({ ...f, rating: +e.target.value }))} className="h-9" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.isActive} onCheckedChange={v => setForm(f => ({ ...f, isActive: v }))} />
              <Label>Активный поставщик</Label>
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
            <AlertDialogTitle>Удалить поставщика?</AlertDialogTitle>
            <AlertDialogDescription>Поставщик будет удалён из базы данных.</AlertDialogDescription>
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
