import { useEffect, useState } from 'react';
import { reportService } from '@/services/mockService';
import { Report } from '@/services/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const REPORT_TYPES = ['доходы', 'заявки', 'сотрудники', 'склад'] as const;
const TYPE_ICONS: Record<string, string> = { 'доходы': 'TrendingUp', 'заявки': 'ClipboardList', 'сотрудники': 'Users', 'склад': 'Package' };
const TYPE_COLORS: Record<string, string> = {
  'доходы': 'bg-emerald-50 text-emerald-700', 'заявки': 'bg-blue-50 text-blue-700',
  'сотрудники': 'bg-violet-50 text-violet-700', 'склад': 'bg-amber-50 text-amber-700'
};

const EMPTY: Omit<Report, 'id' | 'createdAt' | 'data'> = {
  name: '', type: 'доходы', period: '', createdBy: 'Текущий пользователь'
};

export default function ReportsSection() {
  const [reports, setReports] = useState<Report[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewReport, setViewReport] = useState<Report | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const load = async () => setReports(await reportService.getAll());
  useEffect(() => { load(); }, []);

  const filtered = reports.filter(r => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || r.type === typeFilter;
    return matchSearch && matchType;
  });

  const handleCreate = async () => {
    setLoading(true);
    try {
      await reportService.create({ ...form, data: { generated: true } });
      toast({ title: 'Отчёт сформирован' });
      await load(); setDialogOpen(false);
    } finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await reportService.delete(deleteId);
    setDeleteId(null);
    toast({ title: 'Отчёт удалён', variant: 'destructive' });
    await load();
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Отчёты и аналитика</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Всего: {filtered.length}</p>
        </div>
        <Button onClick={() => { setForm(EMPTY); setDialogOpen(true); }} size="sm" className="gap-1.5">
          <Icon name="Plus" size={15} /> Сформировать отчёт
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Выручка за июнь', value: '₽ 38 900', sub: '+12% к маю', icon: 'TrendingUp', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Выполнено заявок', value: '54', sub: 'за Q2 2024', icon: 'CheckCircle', color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Средний чек', value: '₽ 6 450', sub: 'текущий период', icon: 'Receipt', color: 'text-violet-600', bg: 'bg-violet-50' },
          { label: 'Запасов на складе', value: '₽ 142 300', sub: 'по закупочным ценам', icon: 'Package', color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map(s => (
          <Card key={s.label} className="border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center shrink-0`}>
                  <Icon name={s.icon} size={17} className={s.color} />
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">{s.label}</p>
                  <p className="text-base font-bold text-foreground">{s.value}</p>
                  <p className="text-[10px] text-muted-foreground">{s.sub}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Reports list */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3 pt-4 px-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск отчёта..." className="pl-9 h-9" />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-40 h-9"><SelectValue placeholder="Тип" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все типы</SelectItem>
                {REPORT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="grid gap-2">
            {filtered.map(r => (
              <div key={r.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${TYPE_COLORS[r.type]}`}>
                  <Icon name={TYPE_ICONS[r.type]} size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{r.name}</p>
                  <p className="text-xs text-muted-foreground">{r.period} · {r.createdAt} · {r.createdBy}</p>
                </div>
                <Badge className={`border-0 text-xs shrink-0 ${TYPE_COLORS[r.type]}`}>{r.type}</Badge>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => setViewReport(r)}>
                    <Icon name="Eye" size={13} />
                  </Button>
                  <Button variant="ghost" size="icon" className="w-7 h-7 text-destructive hover:text-destructive" onClick={() => setDeleteId(r.id)}>
                    <Icon name="Trash2" size={13} />
                  </Button>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="text-center py-6 text-muted-foreground text-sm">Отчёты не найдены</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Сформировать отчёт</DialogTitle></DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="space-y-1.5">
              <Label>Название отчёта</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="h-9" placeholder="Выручка за июль 2024" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Тип</Label>
                <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v as Report['type'] }))}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>{REPORT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Период</Label>
                <Input value={form.period} onChange={e => setForm(f => ({ ...f, period: e.target.value }))} className="h-9" placeholder="Июль 2024" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Отмена</Button>
            <Button onClick={handleCreate} disabled={loading}>{loading ? 'Формирование...' : 'Сформировать'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View dialog */}
      <Dialog open={!!viewReport} onOpenChange={open => !open && setViewReport(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {viewReport && <Icon name={TYPE_ICONS[viewReport.type]} size={16} />}
              {viewReport?.name}
            </DialogTitle>
          </DialogHeader>
          {viewReport && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge className={`border-0 text-xs ${TYPE_COLORS[viewReport.type]}`}>{viewReport.type}</Badge>
                <span>{viewReport.period}</span>
              </div>
              <Separator />
              <div className="space-y-2">
                {Object.entries(viewReport.data).map(([key, val]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{key}</span>
                    <span className="font-semibold">{String(val)}</span>
                  </div>
                ))}
              </div>
              <Separator />
              <p className="text-xs text-muted-foreground">Создан: {viewReport.createdAt} · {viewReport.createdBy}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewReport(null)}>Закрыть</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={open => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить отчёт?</AlertDialogTitle>
            <AlertDialogDescription>Отчёт будет удалён без возможности восстановления.</AlertDialogDescription>
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
