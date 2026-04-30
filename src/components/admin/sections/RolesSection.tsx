import { useEffect, useState } from 'react';
import { roleService } from '@/services/mockService';
import { Role } from '@/services/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const ALL_PERMISSIONS = [
  { key: 'all', label: 'Полный доступ' },
  { key: 'orders', label: 'Заявки (CRUD)' },
  { key: 'orders_read', label: 'Заявки (просмотр)' },
  { key: 'clients', label: 'Клиенты (CRUD)' },
  { key: 'clients_read', label: 'Клиенты (просмотр)' },
  { key: 'devices', label: 'Устройства (CRUD)' },
  { key: 'employees', label: 'Сотрудники (CRUD)' },
  { key: 'parts', label: 'Склад (CRUD)' },
  { key: 'payments', label: 'Оплаты (CRUD)' },
  { key: 'reports', label: 'Отчёты (CRUD)' },
  { key: 'reports_read', label: 'Отчёты (просмотр)' },
  { key: 'settings', label: 'Настройки системы' },
];

const EMPTY: Omit<Role, 'id' | 'usersCount'> = { name: '', description: '', permissions: [] };

export default function RolesSection() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Role | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const load = async () => setRoles(await roleService.getAll());
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setDialogOpen(true); };
  const openEdit = (r: Role) => {
    setEditing(r);
    const { id, usersCount, ...rest } = r;
    setForm(rest);
    setDialogOpen(true);
  };

  const togglePerm = (key: string) => {
    setForm(f => ({
      ...f,
      permissions: f.permissions.includes(key)
        ? f.permissions.filter(p => p !== key)
        : [...f.permissions, key]
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (editing) { await roleService.update(editing.id, form); toast({ title: 'Роль обновлена' }); }
      else { await roleService.create(form); toast({ title: 'Роль создана' }); }
      await load(); setDialogOpen(false);
    } finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await roleService.delete(deleteId);
    setDeleteId(null);
    toast({ title: 'Роль удалена', variant: 'destructive' });
    await load();
  };

  const ROLE_COLORS = ['bg-red-50 text-red-700', 'bg-blue-50 text-blue-700', 'bg-emerald-50 text-emerald-700', 'bg-violet-50 text-violet-700', 'bg-orange-50 text-orange-700'];

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Роли и права доступа</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Управление доступом сотрудников к разделам системы</p>
        </div>
        <Button onClick={openCreate} size="sm" className="gap-1.5">
          <Icon name="Plus" size={15} /> Создать роль
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {roles.map((r, i) => (
          <Card key={r.id} className="border shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2 pt-4 px-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${ROLE_COLORS[i % ROLE_COLORS.length]}`}>
                    <Icon name="KeyRound" size={16} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{r.name}</p>
                    <p className="text-xs text-muted-foreground">{r.usersCount} пользователей</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => openEdit(r)}>
                    <Icon name="Pencil" size={12} />
                  </Button>
                  <Button variant="ghost" size="icon" className="w-7 h-7 text-destructive hover:text-destructive" onClick={() => setDeleteId(r.id)}>
                    <Icon name="Trash2" size={12} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="text-xs text-muted-foreground mb-3">{r.description}</p>
              <div className="flex flex-wrap gap-1">
                {r.permissions.map(p => {
                  const perm = ALL_PERMISSIONS.find(ap => ap.key === p);
                  return (
                    <Badge key={p} variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
                      {perm?.label ?? p}
                    </Badge>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? 'Редактировать роль' : 'Новая роль'}</DialogTitle></DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="space-y-1.5">
              <Label>Название роли</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="h-9" placeholder="Диспетчер" />
            </div>
            <div className="space-y-1.5">
              <Label>Описание</Label>
              <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="h-9" />
            </div>
            <div className="space-y-2">
              <Label>Права доступа</Label>
              <div className="grid grid-cols-2 gap-1.5 p-3 bg-muted/40 rounded-lg max-h-52 overflow-y-auto">
                {ALL_PERMISSIONS.map(p => (
                  <div key={p.key} className="flex items-center gap-2">
                    <Checkbox
                      id={p.key}
                      checked={form.permissions.includes(p.key)}
                      onCheckedChange={() => togglePerm(p.key)}
                    />
                    <label htmlFor={p.key} className="text-xs cursor-pointer">{p.label}</label>
                  </div>
                ))}
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
            <AlertDialogTitle>Удалить роль?</AlertDialogTitle>
            <AlertDialogDescription>Роль будет удалена. Пользователи с этой ролью потеряют доступ.</AlertDialogDescription>
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
