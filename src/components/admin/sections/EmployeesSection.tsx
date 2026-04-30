import { useEffect, useState } from 'react';
import { employeeService } from '@/services/mockService';
import { Employee, EmployeeRole } from '@/services/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const ROLES: EmployeeRole[] = ['мастер', 'менеджер', 'администратор', 'бухгалтер', 'курьер'];
const ROLE_COLORS: Record<EmployeeRole, string> = {
  'администратор': 'bg-red-50 text-red-700',
  'мастер': 'bg-blue-50 text-blue-700',
  'менеджер': 'bg-emerald-50 text-emerald-700',
  'бухгалтер': 'bg-violet-50 text-violet-700',
  'курьер': 'bg-orange-50 text-orange-700',
};

const EMPTY: Omit<Employee, 'id' | 'activeOrders' | 'rating'> = {
  name: '', role: 'мастер', phone: '', email: '', hireDate: new Date().toISOString().slice(0, 10), salary: 0, isActive: true
};

export default function EmployeesSection() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const load = async () => setEmployees(await employeeService.getAll());
  useEffect(() => { load(); }, []);

  const filtered = employees.filter(e => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) || e.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || e.role === roleFilter;
    return matchSearch && matchRole;
  });

  const openCreate = () => { setEditing(null); setForm(EMPTY); setDialogOpen(true); };
  const openEdit = (e: Employee) => {
    setEditing(e);
    const { id, activeOrders, rating, ...rest } = e;
    setForm(rest);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (editing) { await employeeService.update(editing.id, form); toast({ title: 'Сотрудник обновлён' }); }
      else { await employeeService.create(form); toast({ title: 'Сотрудник добавлен' }); }
      await load(); setDialogOpen(false);
    } finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await employeeService.delete(deleteId);
    setDeleteId(null);
    toast({ title: 'Сотрудник удалён', variant: 'destructive' });
    await load();
  };

  const initials = (name: string) => name.split(' ').slice(0, 2).map(w => w[0]).join('');

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Сотрудники</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Всего: {filtered.length}</p>
        </div>
        <Button onClick={openCreate} size="sm" className="gap-1.5">
          <Icon name="UserPlus" size={15} /> Добавить сотрудника
        </Button>
      </div>

      <Card className="border shadow-sm">
        <CardHeader className="pb-3 pt-4 px-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск по имени или email..." className="pl-9 h-9" />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-40 h-9"><SelectValue placeholder="Должность" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все должности</SelectItem>
                {ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="pl-4">Сотрудник</TableHead>
                <TableHead>Должность</TableHead>
                <TableHead className="hidden md:table-cell">Телефон</TableHead>
                <TableHead className="hidden lg:table-cell text-center">Заявок</TableHead>
                <TableHead className="hidden xl:table-cell text-center">Рейтинг</TableHead>
                <TableHead className="hidden lg:table-cell text-right">Зарплата</TableHead>
                <TableHead className="hidden sm:table-cell text-center">Статус</TableHead>
                <TableHead className="w-20 text-right pr-4">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(e => (
                <TableRow key={e.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="pl-4">
                    <div className="flex items-center gap-2.5">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">{initials(e.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{e.name}</p>
                        <p className="text-xs text-muted-foreground">{e.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`border-0 text-xs ${ROLE_COLORS[e.role]}`}>{e.role}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm">{e.phone}</TableCell>
                  <TableCell className="hidden lg:table-cell text-center text-sm font-semibold">{e.activeOrders}</TableCell>
                  <TableCell className="hidden xl:table-cell text-center">
                    <span className="flex items-center justify-center gap-1 text-sm">
                      <Icon name="Star" size={12} className="text-amber-400 fill-amber-400" />
                      {e.rating.toFixed(1)}
                    </span>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-right text-sm font-medium">₽ {e.salary.toLocaleString()}</TableCell>
                  <TableCell className="hidden sm:table-cell text-center">
                    <Badge className={e.isActive ? 'bg-emerald-50 text-emerald-700 border-0 text-xs' : 'bg-slate-100 text-slate-500 border-0 text-xs'}>
                      {e.isActive ? 'Работает' : 'Уволен'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-4">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => openEdit(e)}>
                        <Icon name="Pencil" size={13} />
                      </Button>
                      <Button variant="ghost" size="icon" className="w-7 h-7 text-destructive hover:text-destructive" onClick={() => setDeleteId(e.id)}>
                        <Icon name="Trash2" size={13} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground text-sm">Сотрудники не найдены</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? 'Редактировать сотрудника' : 'Новый сотрудник'}</DialogTitle></DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="space-y-1.5">
              <Label>ФИО</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Иванов Иван Иванович" className="h-9" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Должность</Label>
                <Select value={form.role} onValueChange={v => setForm(f => ({ ...f, role: v as EmployeeRole }))}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>{ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Зарплата (₽)</Label>
                <Input type="number" value={form.salary} onChange={e => setForm(f => ({ ...f, salary: +e.target.value }))} className="h-9" />
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
              <Label>Дата приёма</Label>
              <Input type="date" value={form.hireDate} onChange={e => setForm(f => ({ ...f, hireDate: e.target.value }))} className="h-9" />
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.isActive} onCheckedChange={v => setForm(f => ({ ...f, isActive: v }))} />
              <Label>Работает в компании</Label>
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
            <AlertDialogTitle>Удалить сотрудника?</AlertDialogTitle>
            <AlertDialogDescription>Профиль сотрудника будет удалён из системы.</AlertDialogDescription>
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
