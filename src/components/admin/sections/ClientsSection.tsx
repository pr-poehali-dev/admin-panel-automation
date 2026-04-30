import { useEffect, useState } from 'react';
import { clientService } from '@/services/mockService';
import { Client } from '@/services/mockData';
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

const EMPTY: Omit<Client, 'id' | 'totalOrders'> = {
  name: '', phone: '', email: '', address: '', createdAt: new Date().toISOString().slice(0, 10), notes: ''
};

export default function ClientsSection() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
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
          <p className="text-sm text-muted-foreground mt-0.5">Всего: {filtered.length}</p>
        </div>
        <Button onClick={openCreate} size="sm" className="gap-1.5">
          <Icon name="UserPlus" size={15} /> Добавить клиента
        </Button>
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
                <TableHead className="w-20 text-right pr-4">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(c => (
                <TableRow key={c.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="pl-4">
                    <div className="flex items-center gap-2.5">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">{initials(c.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{c.name}</p>
                        <p className="text-xs text-muted-foreground">с {c.createdAt}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{c.phone}</TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{c.email}</TableCell>
                  <TableCell className="hidden lg:table-cell text-xs text-muted-foreground max-w-[160px] truncate">{c.address}</TableCell>
                  <TableCell className="hidden sm:table-cell text-center">
                    <Badge variant="secondary" className="text-xs">{c.totalOrders}</Badge>
                  </TableCell>
                  <TableCell className="hidden xl:table-cell text-xs text-muted-foreground max-w-[140px] truncate">{c.notes || '—'}</TableCell>
                  <TableCell className="text-right pr-4">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => openEdit(c)}>
                        <Icon name="Pencil" size={13} />
                      </Button>
                      <Button variant="ghost" size="icon" className="w-7 h-7 text-destructive hover:text-destructive" onClick={() => setDeleteId(c.id)}>
                        <Icon name="Trash2" size={13} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-sm">Клиенты не найдены</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? 'Редактировать клиента' : 'Новый клиент'}</DialogTitle></DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="space-y-1.5">
              <Label>ФИО</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Иванов Иван Иванович" className="h-9" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Телефон</Label>
                <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+7 (___) ___-__-__" className="h-9" />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@mail.ru" className="h-9" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Адрес</Label>
              <Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className="h-9" />
            </div>
            <div className="space-y-1.5">
              <Label>Заметки</Label>
              <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="h-16 resize-none" placeholder="VIP, корпоративный клиент и т.д." />
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
            <AlertDialogTitle>Удалить клиента?</AlertDialogTitle>
            <AlertDialogDescription>История заявок клиента сохранится, но профиль будет удалён.</AlertDialogDescription>
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
