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
import { KPIRow, MiniChart, Timeline, ActivityFeed, AlertsList, InfoCard, KeyValueList, ProgressGoal, TopList, TagBadges } from '../widgets/Widgets';
import ViewSheet, { ViewGrid } from '../widgets/ViewSheet';

const CATEGORIES = ['Блоки питания', 'Накопители', 'Расходники', 'Память', 'Матрицы', 'Запчасти принтеров', 'Охлаждение', 'Другое'];

const EMPTY: Omit<Part, 'id' | 'lastUpdated'> = {
  name: '', sku: '', category: 'Другое', quantity: 0, minQuantity: 1, purchasePrice: 0, salePrice: 0, supplierId: '', location: ''
};

export default function PartsSection() {
  const [parts, setParts] = useState<Part[]>([]);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewPart, setViewPart] = useState<Part | null>(null);
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

  const totalValue = parts.reduce((s, p) => s + p.quantity * p.purchasePrice, 0);
  const lowStock = parts.filter(p => p.quantity <= p.minQuantity);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setDialogOpen(true); };
  const openEdit = (p: Part) => { setEditing(p); const { id, lastUpdated, ...rest } = p; setForm(rest); setDialogOpen(true); };

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
        <div><h2 className="text-xl font-bold">Склад — Запчасти</h2><p className="text-sm text-muted-foreground mt-0.5">Учёт остатков, закупки, движение</p></div>
        <Button onClick={openCreate} size="sm" className="gap-1.5"><Icon name="Plus" size={15} /> Добавить запчасть</Button>
      </div>

      <KPIRow items={[
        { label: 'Позиций на складе', value: parts.length, delta: 'SKU', icon: 'Package', accent: 'blue' },
        { label: 'Всего единиц', value: parts.reduce((s, p) => s + p.quantity, 0), delta: 'штук', icon: 'Boxes', accent: 'cyan' },
        { label: 'Стоимость склада', value: `₽ ${totalValue.toLocaleString()}`, delta: 'по закупке', icon: 'Wallet', accent: 'emerald' },
        { label: 'Мало запасов', value: lowStock.length, delta: 'требуют закупки', trend: lowStock.length > 0 ? 'down' : 'neutral', icon: 'AlertTriangle', accent: 'amber' },
      ]} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <InfoCard title="Топ позиций по обороту" icon="TrendingUp">
          <TopList items={[...parts].sort((a, b) => b.salePrice - a.salePrice).slice(0, 4).map((p, i) => ({
            rank: i + 1, label: p.name, value: `₽ ${p.salePrice.toLocaleString()}`, sub: p.category,
          }))} />
        </InfoCard>
        <InfoCard title="Лимиты и остатки" icon="Gauge">
          <div className="space-y-2.5">
            {lowStock.slice(0, 4).map(p => (
              <ProgressGoal key={p.id} label={p.name.slice(0, 30)} current={p.quantity} target={p.minQuantity * 2} unit=" шт" />
            ))}
            {lowStock.length === 0 && <p className="text-xs text-muted-foreground">Все запасы в норме</p>}
          </div>
        </InfoCard>
        <InfoCard title="Алерты склада" icon="Bell">
          <AlertsList items={[
            { type: lowStock.length > 0 ? 'warning' : 'success', title: lowStock.length > 0 ? `${lowStock.length} позиций ниже минимума` : 'Все запасы в норме', description: lowStock.length > 0 ? 'Нужна срочная закупка' : 'Можно работать' },
            { type: 'info', title: 'Поступление завтра', description: 'Ожидается партия от ТехноПарт' },
            { type: 'info', title: 'Инвентаризация', description: 'Запланирована на 30.06' },
          ]} />
        </InfoCard>
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
              <SelectContent><SelectItem value="all">Все категории</SelectItem>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
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
                <TableHead className="w-28 text-right pr-4">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(p => (
                <TableRow key={p.id} className="hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => setViewPart(p)}>
                  <TableCell className="pl-4">
                    <div className="flex items-start gap-2">
                      {isLow(p) && <Icon name="AlertTriangle" size={14} className="text-amber-500 mt-0.5 shrink-0" />}
                      <div><p className="text-sm font-medium">{p.name}</p><Badge variant="outline" className="text-[10px] mt-0.5">{p.category}</Badge></div>
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
                  <TableCell className="text-right pr-4" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => setViewPart(p)}><Icon name="Eye" size={13} /></Button>
                      <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => openEdit(p)}><Icon name="Pencil" size={13} /></Button>
                      <Button variant="ghost" size="icon" className="w-7 h-7 text-destructive hover:text-destructive" onClick={() => setDeleteId(p.id)}><Icon name="Trash2" size={13} /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (<TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-sm">Запчасти не найдены</TableCell></TableRow>)}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {viewPart && (() => {
        const supplier = mockSuppliers.find(s => s.id === viewPart.supplierId);
        const margin = viewPart.purchasePrice > 0 ? Math.round(((viewPart.salePrice - viewPart.purchasePrice) / viewPart.purchasePrice) * 100) : 0;
        return (
          <ViewSheet
            open={!!viewPart} onClose={() => setViewPart(null)}
            title={viewPart.name} subtitle={`SKU: ${viewPart.sku} · ${viewPart.category}`}
            badge={isLow(viewPart) ? { text: 'Мало', color: 'bg-amber-100 text-amber-700' } : { text: 'В наличии', color: 'bg-emerald-100 text-emerald-700' }}
            icon="Package" iconBg="bg-amber-500"
            onEdit={() => { setViewPart(null); openEdit(viewPart); }}
          >
            <ViewGrid cols={4}>
              <InfoCard title="Остаток" icon="Boxes"><p className="text-xl font-bold">{viewPart.quantity}</p><p className="text-[10px] text-muted-foreground mt-0.5">шт.</p></InfoCard>
              <InfoCard title="Закупка" icon="ShoppingCart"><p className="text-xl font-bold">₽ {viewPart.purchasePrice.toLocaleString()}</p><p className="text-[10px] text-muted-foreground mt-0.5">за ед.</p></InfoCard>
              <InfoCard title="Продажа" icon="Tag"><p className="text-xl font-bold text-emerald-700">₽ {viewPart.salePrice.toLocaleString()}</p><p className="text-[10px] text-muted-foreground mt-0.5">за ед.</p></InfoCard>
              <InfoCard title="Маржа" icon="Percent"><p className="text-xl font-bold text-violet-600">+{margin}%</p><p className="text-[10px] text-muted-foreground mt-0.5">наценка</p></InfoCard>
            </ViewGrid>

            <InfoCard title="Карточка позиции" icon="Info">
              <KeyValueList rows={[
                { label: 'Название', value: viewPart.name },
                { label: 'Артикул (SKU)', value: viewPart.sku, mono: true },
                { label: 'Категория', value: viewPart.category },
                { label: 'Поставщик', value: supplier?.name ?? '—' },
                { label: 'Место хранения', value: viewPart.location, mono: true },
                { label: 'Минимум на складе', value: `${viewPart.minQuantity} шт.` },
                { label: 'Обновлено', value: viewPart.lastUpdated },
              ]} />
            </InfoCard>

            <InfoCard title="Уровень остатков" icon="Gauge">
              <ProgressGoal label="Текущий запас" current={viewPart.quantity} target={viewPart.minQuantity * 2} unit=" шт" />
              <p className="text-[10px] text-muted-foreground mt-2">Рекомендуемый запас: {viewPart.minQuantity * 2} шт. (2x от минимума)</p>
            </InfoCard>

            <InfoCard title="Движение за 7 дней" icon="LineChart">
              <MiniChart values={[1, 0, 2, 1, 3, 0, 1]} labels={['П','В','С','Ч','П','С','В']} color="bg-amber-500" />
              <p className="text-[10px] text-muted-foreground mt-2">Использовано: 8 шт. · Поступило: 5 шт.</p>
            </InfoCard>

            <InfoCard title="Метки" icon="Tags">
              <TagBadges tags={[viewPart.category, isLow(viewPart) ? 'Срочно закупить' : 'В норме', 'Активная позиция', `Локация ${viewPart.location}`]} />
            </InfoCard>

            <InfoCard title="История движений" icon="History">
              <Timeline events={[
                { date: viewPart.lastUpdated, title: 'Списание', description: '−1 шт. на ЗА-2024-002', icon: 'Minus', color: 'red' },
                { date: '12.06', title: 'Поступление', description: '+5 шт. от ' + (supplier?.name ?? '—'), icon: 'Plus', color: 'emerald' },
                { date: '08.06', title: 'Инвентаризация', description: 'Расхождений нет', icon: 'CheckCircle2', color: 'blue' },
                { date: '01.06', title: 'Заведена позиция', icon: 'FilePlus2', color: 'slate' },
              ]} />
            </InfoCard>

            <InfoCard title="Алерты и рекомендации" icon="Sparkles">
              <AlertsList items={[
                ...(isLow(viewPart) ? [{ type: 'warning' as const, title: 'Запас ниже минимума', description: `Заказать у ${supplier?.name ?? 'поставщика'}` }] : [{ type: 'success' as const, title: 'Уровень в норме' }]),
                { type: 'info', title: 'Часто используется', description: 'Эта позиция в топ-10 расходников' },
                { type: 'info', title: 'Альтернатива на складе', description: 'Совместимый аналог: SKU-AC-2103' },
              ]} />
            </InfoCard>
          </ViewSheet>
        );
      })()}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? 'Редактировать запчасть' : 'Новая запчасть'}</DialogTitle></DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="space-y-1.5"><Label>Название</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="h-9" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>SKU</Label><Input value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} className="h-9 font-mono" /></div>
              <div className="space-y-1.5"><Label>Категория</Label>
                <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5"><Label>Кол-во</Label><Input type="number" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: +e.target.value }))} className="h-9" /></div>
              <div className="space-y-1.5"><Label>Минимум</Label><Input type="number" value={form.minQuantity} onChange={e => setForm(f => ({ ...f, minQuantity: +e.target.value }))} className="h-9" /></div>
              <div className="space-y-1.5"><Label>Место</Label><Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} className="h-9 font-mono" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Закупка ₽</Label><Input type="number" value={form.purchasePrice} onChange={e => setForm(f => ({ ...f, purchasePrice: +e.target.value }))} className="h-9" /></div>
              <div className="space-y-1.5"><Label>Продажа ₽</Label><Input type="number" value={form.salePrice} onChange={e => setForm(f => ({ ...f, salePrice: +e.target.value }))} className="h-9" /></div>
            </div>
            <div className="space-y-1.5"><Label>Поставщик</Label>
              <Select value={form.supplierId} onValueChange={v => setForm(f => ({ ...f, supplierId: v }))}>
                <SelectTrigger className="h-9"><SelectValue placeholder="Выберите..." /></SelectTrigger>
                <SelectContent>{mockSuppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Отмена</Button><Button onClick={handleSave} disabled={loading}>{loading ? 'Сохранение...' : 'Сохранить'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={open => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Удалить запчасть?</AlertDialogTitle><AlertDialogDescription>Позиция будет удалена.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Отмена</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive text-white hover:bg-destructive/90">Удалить</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
