import { useEffect, useState } from 'react';
import { supplierService } from '@/services/mockService';
import { Supplier, mockParts } from '@/services/mockData';
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
import { KPIRow, MiniChart, Timeline, ActivityFeed, AlertsList, InfoCard, KeyValueList, TopList, TagBadges } from '../widgets/Widgets';
import ViewSheet, { ViewGrid } from '../widgets/ViewSheet';

const EMPTY: Omit<Supplier, 'id' | 'createdAt'> = {
  name: '', contactPerson: '', phone: '', email: '', address: '', inn: '', paymentTerms: '', rating: 5.0, isActive: true
};

export default function SuppliersSection() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewSupplier, setViewSupplier] = useState<Supplier | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const load = async () => setSuppliers(await supplierService.getAll());
  useEffect(() => { load(); }, []);

  const filtered = suppliers.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.contactPerson.toLowerCase().includes(search.toLowerCase()));
  const activeCount = suppliers.filter(s => s.isActive).length;

  const openCreate = () => { setEditing(null); setForm(EMPTY); setDialogOpen(true); };
  const openEdit = (s: Supplier) => { setEditing(s); const { id, createdAt, ...rest } = s; setForm(rest); setDialogOpen(true); };

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
        <div><h2 className="text-xl font-bold">Поставщики</h2><p className="text-sm text-muted-foreground mt-0.5">Партнёры по поставкам, рейтинги, условия</p></div>
        <Button onClick={openCreate} size="sm" className="gap-1.5"><Icon name="Plus" size={15} /> Добавить поставщика</Button>
      </div>

      <KPIRow items={[
        { label: 'Всего поставщиков', value: suppliers.length, delta: 'в базе', icon: 'Truck', accent: 'blue' },
        { label: 'Активные', value: activeCount, delta: 'работаем сейчас', icon: 'CheckCircle2', accent: 'emerald' },
        { label: 'Средний рейтинг', value: (suppliers.reduce((s, x) => s + x.rating, 0) / Math.max(suppliers.length, 1)).toFixed(1), delta: 'из 5.0', icon: 'Star', accent: 'amber' },
        { label: 'Закупка / месяц', value: '₽ 124 800', delta: 'оборот', icon: 'TrendingUp', accent: 'violet' },
      ]} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <InfoCard title="Топ поставщики по обороту" icon="Trophy">
          <TopList items={[...suppliers].sort((a, b) => b.rating - a.rating).slice(0, 4).map((s, i) => ({
            rank: i + 1, label: s.name, value: `★ ${s.rating.toFixed(1)}`, sub: s.paymentTerms,
          }))} />
        </InfoCard>
        <InfoCard title="Закупки за 6 мес." icon="LineChart">
          <MiniChart values={[18, 24, 22, 28, 31, 29]} labels={['Я','Ф','М','А','М','Ин']} color="bg-violet-500" />
          <p className="text-[10px] text-muted-foreground mt-2">Средний месячный оборот: ₽ 124 800</p>
        </InfoCard>
        <InfoCard title="Алерты и события" icon="Bell">
          <AlertsList items={[
            { type: 'success', title: 'Поступление сегодня', description: 'ТехноПарт — 12 позиций' },
            { type: 'warning', title: 'Просроченный счёт', description: 'РемКомплект — оплатить до 18.06' },
            { type: 'info', title: 'Новые условия', description: 'DigiComp снизил цены на SSD' },
          ]} />
        </InfoCard>
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
                <TableHead className="w-28 text-right pr-4">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(s => (
                <TableRow key={s.id} className="hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => setViewSupplier(s)}>
                  <TableCell className="pl-4"><p className="text-sm font-semibold">{s.name}</p><p className="text-xs text-muted-foreground">{s.email}</p></TableCell>
                  <TableCell className="hidden md:table-cell text-sm">{s.contactPerson}</TableCell>
                  <TableCell className="hidden lg:table-cell text-sm">{s.phone}</TableCell>
                  <TableCell className="hidden xl:table-cell font-mono text-xs text-muted-foreground">{s.inn}</TableCell>
                  <TableCell className="hidden lg:table-cell text-center">
                    <span className="flex items-center justify-center gap-1 text-sm"><Icon name="Star" size={12} className="text-amber-400 fill-amber-400" />{s.rating.toFixed(1)}</span>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">{s.paymentTerms}</TableCell>
                  <TableCell className="hidden sm:table-cell text-center">
                    <Badge className={s.isActive ? 'bg-emerald-50 text-emerald-700 border-0 text-xs' : 'bg-slate-100 text-slate-500 border-0 text-xs'}>
                      {s.isActive ? 'Активен' : 'Неактивен'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-4" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => setViewSupplier(s)}><Icon name="Eye" size={13} /></Button>
                      <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => openEdit(s)}><Icon name="Pencil" size={13} /></Button>
                      <Button variant="ghost" size="icon" className="w-7 h-7 text-destructive hover:text-destructive" onClick={() => setDeleteId(s.id)}><Icon name="Trash2" size={13} /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (<TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground text-sm">Поставщики не найдены</TableCell></TableRow>)}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {viewSupplier && (() => {
        const supplierParts = mockParts.filter(p => p.supplierId === viewSupplier.id);
        return (
          <ViewSheet
            open={!!viewSupplier} onClose={() => setViewSupplier(null)}
            title={viewSupplier.name} subtitle={`${viewSupplier.contactPerson} · ${viewSupplier.phone}`}
            badge={{ text: viewSupplier.isActive ? 'Активен' : 'Неактивен', color: viewSupplier.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500' }}
            icon="Truck" iconBg="bg-violet-500"
            onEdit={() => { setViewSupplier(null); openEdit(viewSupplier); }}
          >
            <ViewGrid cols={4}>
              <InfoCard title="Рейтинг" icon="Star"><p className="text-xl font-bold text-amber-600">★ {viewSupplier.rating.toFixed(1)}</p></InfoCard>
              <InfoCard title="Позиций" icon="Package"><p className="text-xl font-bold">{supplierParts.length}</p><p className="text-[10px] text-muted-foreground mt-0.5">SKU</p></InfoCard>
              <InfoCard title="Оборот" icon="TrendingUp"><p className="text-base font-bold">₽ 48 200</p><p className="text-[10px] text-muted-foreground mt-0.5">мес.</p></InfoCard>
              <InfoCard title="Сотрудничаем" icon="Calendar"><p className="text-xl font-bold">~ {Math.max(1, Math.floor((Date.now() - new Date(viewSupplier.createdAt).getTime()) / 86400000 / 30))} мес</p></InfoCard>
            </ViewGrid>

            <InfoCard title="Реквизиты компании" icon="Building2">
              <KeyValueList rows={[
                { label: 'Название', value: viewSupplier.name },
                { label: 'ИНН', value: viewSupplier.inn, mono: true },
                { label: 'Контактное лицо', value: viewSupplier.contactPerson },
                { label: 'Телефон', value: viewSupplier.phone, mono: true },
                { label: 'Email', value: viewSupplier.email },
                { label: 'Адрес', value: viewSupplier.address },
                { label: 'Условия оплаты', value: viewSupplier.paymentTerms },
                { label: 'Сотрудничаем с', value: viewSupplier.createdAt },
              ]} />
            </InfoCard>

            <InfoCard title="Поставляемые позиции" icon="Boxes">
              {supplierParts.length === 0 ? <p className="text-xs text-muted-foreground">Позиций нет</p> : (
                <div className="space-y-1.5">
                  {supplierParts.slice(0, 5).map(p => (
                    <div key={p.id} className="flex items-center gap-2 p-2 rounded bg-muted/40 text-xs">
                      <span className="font-mono text-muted-foreground">{p.sku}</span>
                      <span className="flex-1 truncate">{p.name}</span>
                      <Badge variant="outline" className="text-[10px]">{p.quantity} шт.</Badge>
                    </div>
                  ))}
                </div>
              )}
            </InfoCard>

            <InfoCard title="Динамика поставок" icon="LineChart">
              <MiniChart values={[3, 5, 4, 6, 8, 7, 5]} labels={['Я','Ф','М','А','М','Ин','Ил']} color="bg-violet-500" />
            </InfoCard>

            <InfoCard title="Метки" icon="Tags">
              <TagBadges tags={[viewSupplier.paymentTerms, 'Надёжный', 'Доставка по Москве', 'Безналичная оплата', 'Документы вовремя']} />
            </InfoCard>

            <InfoCard title="Лента событий" icon="Activity">
              <ActivityFeed items={[
                { user: viewSupplier.contactPerson, action: 'отправил счёт', time: '2 дня назад' },
                { user: 'Белова Наталья', action: 'оплатила счёт', target: '№ 247', time: '5 дней назад' },
                { user: viewSupplier.contactPerson, action: 'прислал прайс', time: 'неделю назад' },
                { user: 'Система', action: 'обновила рейтинг', target: `★ ${viewSupplier.rating}`, time: '2 недели назад' },
              ]} />
            </InfoCard>

            <InfoCard title="Таймлайн отношений" icon="GitBranch">
              <Timeline events={[
                { date: viewSupplier.createdAt, title: 'Начало сотрудничества', icon: 'Handshake', color: 'blue' },
                { date: '2024-01-15', title: 'Первая поставка', description: '12 позиций', icon: 'Truck', color: 'violet' },
                { date: '2024-04-01', title: 'Подняли рейтинг', description: `до ★ ${viewSupplier.rating}`, icon: 'TrendingUp', color: 'emerald' },
                { date: 'сегодня', title: viewSupplier.isActive ? 'Активный партнёр' : 'Неактивен', icon: viewSupplier.isActive ? 'CheckCircle2' : 'XCircle', color: viewSupplier.isActive ? 'emerald' : 'slate' },
              ]} />
            </InfoCard>

            <InfoCard title="Рекомендации" icon="Sparkles">
              <AlertsList items={[
                { type: viewSupplier.rating >= 4.5 ? 'success' : 'warning', title: viewSupplier.rating >= 4.5 ? 'Топ-партнёр' : 'Средний рейтинг', description: viewSupplier.rating >= 4.5 ? 'Обсудить эксклюзив' : 'Требует контроля' },
                { type: 'info', title: 'Просрочена сверка', description: 'Запланировать на эту неделю' },
                { type: 'info', title: 'Доступна скидка за объём', description: 'При заказе > 50 000 ₽' },
              ]} />
            </InfoCard>
          </ViewSheet>
        );
      })()}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? 'Редактировать поставщика' : 'Новый поставщик'}</DialogTitle></DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="space-y-1.5"><Label>Название</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="h-9" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Контакт</Label><Input value={form.contactPerson} onChange={e => setForm(f => ({ ...f, contactPerson: e.target.value }))} className="h-9" /></div>
              <div className="space-y-1.5"><Label>ИНН</Label><Input value={form.inn} onChange={e => setForm(f => ({ ...f, inn: e.target.value }))} className="h-9 font-mono" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Телефон</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="h-9" /></div>
              <div className="space-y-1.5"><Label>Email</Label><Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="h-9" /></div>
            </div>
            <div className="space-y-1.5"><Label>Адрес</Label><Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className="h-9" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Условия</Label><Input value={form.paymentTerms} onChange={e => setForm(f => ({ ...f, paymentTerms: e.target.value }))} className="h-9" /></div>
              <div className="space-y-1.5"><Label>Рейтинг</Label><Input type="number" min="1" max="5" step="0.1" value={form.rating} onChange={e => setForm(f => ({ ...f, rating: +e.target.value }))} className="h-9" /></div>
            </div>
            <div className="flex items-center gap-3"><Switch checked={form.isActive} onCheckedChange={v => setForm(f => ({ ...f, isActive: v }))} /><Label>Активный</Label></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Отмена</Button><Button onClick={handleSave} disabled={loading}>{loading ? 'Сохранение...' : 'Сохранить'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={open => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Удалить поставщика?</AlertDialogTitle><AlertDialogDescription>Будет удалён.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Отмена</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive text-white hover:bg-destructive/90">Удалить</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
