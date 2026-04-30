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
import { KPIRow, Timeline, ActivityFeed, AlertsList, InfoCard, KeyValueList, ServiceStatusList, TagBadges } from '../widgets/Widgets';
import ViewSheet, { ViewGrid } from '../widgets/ViewSheet';

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
  { key: 'settings', label: 'Настройки' },
];

const EMPTY: Omit<Role, 'id' | 'usersCount'> = { name: '', description: '', permissions: [] };

export default function RolesSection() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewRole, setViewRole] = useState<Role | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Role | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const load = async () => setRoles(await roleService.getAll());
  useEffect(() => { load(); }, []);

  const totalUsers = roles.reduce((s, r) => s + r.usersCount, 0);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setDialogOpen(true); };
  const openEdit = (r: Role) => { setEditing(r); const { id, usersCount, ...rest } = r; setForm(rest); setDialogOpen(true); };

  const togglePerm = (key: string) => {
    setForm(f => ({ ...f, permissions: f.permissions.includes(key) ? f.permissions.filter(p => p !== key) : [...f.permissions, key] }));
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
    toast({ title: 'Удалено', variant: 'destructive' });
    await load();
  };

  const ROLE_COLORS = ['bg-red-50 text-red-700', 'bg-blue-50 text-blue-700', 'bg-emerald-50 text-emerald-700', 'bg-violet-50 text-violet-700', 'bg-orange-50 text-orange-700'];

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h2 className="text-xl font-bold">Роли и права</h2><p className="text-sm text-muted-foreground mt-0.5">Управление доступом и привилегиями</p></div>
        <Button onClick={openCreate} size="sm" className="gap-1.5"><Icon name="Plus" size={15} /> Создать роль</Button>
      </div>

      <KPIRow items={[
        { label: 'Ролей в системе', value: roles.length, delta: 'настроено', icon: 'KeyRound', accent: 'blue' },
        { label: 'Пользователей', value: totalUsers, delta: 'имеют доступ', icon: 'Users', accent: 'emerald' },
        { label: 'Прав в каталоге', value: ALL_PERMISSIONS.length, delta: 'возможностей', icon: 'ShieldCheck', accent: 'violet' },
        { label: 'Аудит-событий', value: '142', delta: 'за неделю', icon: 'FileSearch', accent: 'amber' },
      ]} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <InfoCard title="Распределение пользователей" icon="PieChart">
          <div className="space-y-1.5">
            {roles.map((r, i) => (
              <div key={r.id} className="flex items-center gap-2 text-xs">
                <span className={`w-1.5 h-1.5 rounded-full ${['bg-red-500','bg-blue-500','bg-emerald-500','bg-violet-500','bg-orange-500'][i % 5]}`} />
                <span className="flex-1">{r.name}</span>
                <span className="font-semibold">{r.usersCount}</span>
              </div>
            ))}
          </div>
        </InfoCard>
        <InfoCard title="Безопасность системы" icon="Lock">
          <ServiceStatusList items={[
            { name: 'Двухфакторка (2FA)', status: 'ok', latency: 'вкл.' },
            { name: 'Сессии активные', status: 'ok', latency: '5' },
            { name: 'Журнал аудита', status: 'ok', latency: 'on' },
            { name: 'Подозрительные входы', status: 'warn', latency: '0' },
          ]} />
        </InfoCard>
        <InfoCard title="Алерты безопасности" icon="ShieldAlert">
          <AlertsList items={[
            { type: 'success', title: 'Все пользователи активны', description: 'Без подозрительных событий' },
            { type: 'info', title: 'Обновлены права', description: 'Менеджеру добавлен доступ к отчётам' },
            { type: 'warning', title: '2FA отключена у 1 пользователя', description: 'Рекомендуется включить' },
          ]} />
        </InfoCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {roles.map((r, i) => (
          <Card key={r.id} className="border shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => setViewRole(r)}>
            <CardHeader className="pb-2 pt-4 px-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${ROLE_COLORS[i % ROLE_COLORS.length]}`}><Icon name="KeyRound" size={16} /></div>
                  <div><p className="font-semibold text-sm">{r.name}</p><p className="text-xs text-muted-foreground">{r.usersCount} пользователей</p></div>
                </div>
                <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => setViewRole(r)}><Icon name="Eye" size={12} /></Button>
                  <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => openEdit(r)}><Icon name="Pencil" size={12} /></Button>
                  <Button variant="ghost" size="icon" className="w-7 h-7 text-destructive hover:text-destructive" onClick={() => setDeleteId(r.id)}><Icon name="Trash2" size={12} /></Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="text-xs text-muted-foreground mb-3">{r.description}</p>
              <div className="flex flex-wrap gap-1">
                {r.permissions.slice(0, 4).map(p => {
                  const perm = ALL_PERMISSIONS.find(ap => ap.key === p);
                  return <Badge key={p} variant="secondary" className="text-[10px] px-1.5 py-0 h-5">{perm?.label ?? p}</Badge>;
                })}
                {r.permissions.length > 4 && <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">+{r.permissions.length - 4}</Badge>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {viewRole && (
        <ViewSheet
          open={!!viewRole} onClose={() => setViewRole(null)}
          title={viewRole.name} subtitle={viewRole.description}
          badge={{ text: `${viewRole.usersCount} пользователей`, color: 'bg-blue-100 text-blue-700' }}
          icon="KeyRound" iconBg="bg-violet-500"
          onEdit={() => { setViewRole(null); openEdit(viewRole); }}
        >
          <ViewGrid cols={3}>
            <InfoCard title="Пользователей" icon="Users"><p className="text-xl font-bold">{viewRole.usersCount}</p></InfoCard>
            <InfoCard title="Прав" icon="ShieldCheck"><p className="text-xl font-bold">{viewRole.permissions.length}</p></InfoCard>
            <InfoCard title="Уровень" icon="TrendingUp"><p className="text-base font-bold">{viewRole.permissions.includes('all') ? 'Высший' : viewRole.permissions.length > 5 ? 'Высокий' : 'Средний'}</p></InfoCard>
          </ViewGrid>

          <InfoCard title="Описание роли" icon="Info">
            <p className="text-xs leading-relaxed bg-muted/40 p-2.5 rounded">{viewRole.description}</p>
          </InfoCard>

          <InfoCard title="Полный список прав" icon="ListChecks">
            <div className="grid grid-cols-2 gap-1.5">
              {ALL_PERMISSIONS.map(p => {
                const has = viewRole.permissions.includes(p.key);
                return (
                  <div key={p.key} className="flex items-center gap-1.5 text-xs">
                    <Icon name={has ? 'CheckCircle2' : 'XCircle'} size={11} className={has ? 'text-emerald-500' : 'text-slate-300'} />
                    <span className={has ? '' : 'text-muted-foreground'}>{p.label}</span>
                  </div>
                );
              })}
            </div>
          </InfoCard>

          <InfoCard title="Метки" icon="Tags">
            <TagBadges tags={[
              viewRole.permissions.includes('all') ? 'Admin' : 'User',
              viewRole.usersCount > 1 ? 'Распределённая' : 'Уникальная',
              'Активна', 'Системная',
            ]} />
          </InfoCard>

          <InfoCard title="Базовые сведения" icon="FileText">
            <KeyValueList rows={[
              { label: 'Название', value: viewRole.name },
              { label: 'ID', value: viewRole.id, mono: true },
              { label: 'Прав', value: viewRole.permissions.length },
              { label: 'Пользователей', value: viewRole.usersCount },
              { label: 'Статус', value: 'Активна' },
            ]} />
          </InfoCard>

          <InfoCard title="Лента событий" icon="Activity">
            <ActivityFeed items={[
              { user: 'Петров Андрей', action: 'обновил права роли', target: viewRole.name, time: 'вчера' },
              { user: 'Система', action: 'назначила роль', target: 'новому пользователю', time: 'неделю назад' },
              { user: 'Петров Андрей', action: 'создал роль', time: 'месяц назад' },
            ]} />
          </InfoCard>

          <InfoCard title="История изменений" icon="History">
            <Timeline events={[
              { date: 'месяц назад', title: 'Роль создана', icon: 'Plus', color: 'blue' },
              { date: '2 нед. назад', title: 'Добавлено право', description: '"Просмотр отчётов"', icon: 'ShieldCheck', color: 'emerald' },
              { date: 'вчера', title: 'Изменено описание', icon: 'FileEdit', color: 'violet' },
              { date: 'сегодня', title: 'Активна', icon: 'CheckCircle2', color: 'emerald' },
            ]} />
          </InfoCard>

          <InfoCard title="Рекомендации" icon="Sparkles">
            <AlertsList items={[
              { type: viewRole.permissions.includes('all') ? 'warning' : 'info', title: viewRole.permissions.includes('all') ? 'Полный доступ' : 'Ограниченный доступ', description: viewRole.permissions.includes('all') ? 'Применять только для админов' : 'Можно расширить при необходимости' },
              { type: 'success', title: 'Соответствие политике', description: 'Все права в рамках стандарта' },
            ]} />
          </InfoCard>
        </ViewSheet>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? 'Редактировать роль' : 'Новая роль'}</DialogTitle></DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="space-y-1.5"><Label>Название</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="h-9" /></div>
            <div className="space-y-1.5"><Label>Описание</Label><Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="h-9" /></div>
            <div className="space-y-2">
              <Label>Права доступа</Label>
              <div className="grid grid-cols-2 gap-1.5 p-3 bg-muted/40 rounded-lg max-h-52 overflow-y-auto">
                {ALL_PERMISSIONS.map(p => (
                  <div key={p.key} className="flex items-center gap-2">
                    <Checkbox id={p.key} checked={form.permissions.includes(p.key)} onCheckedChange={() => togglePerm(p.key)} />
                    <label htmlFor={p.key} className="text-xs cursor-pointer">{p.label}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Отмена</Button><Button onClick={handleSave} disabled={loading}>{loading ? '...' : 'Сохранить'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={open => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Удалить роль?</AlertDialogTitle><AlertDialogDescription>Будет удалена.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Отмена</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive text-white hover:bg-destructive/90">Удалить</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
