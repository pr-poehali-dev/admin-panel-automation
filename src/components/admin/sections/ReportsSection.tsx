import { useEffect, useState } from 'react';
import { reportService } from '@/services/mockService';
import { Report } from '@/services/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { KPIRow, MiniChart, Timeline, ActivityFeed, AlertsList, InfoCard, KeyValueList, TopList, ProgressGoal } from '../widgets/Widgets';
import ViewSheet, { ViewGrid } from '../widgets/ViewSheet';

const REPORT_TYPES = ['доходы', 'заявки', 'сотрудники', 'склад'] as const;
const TYPE_ICONS: Record<string, string> = { 'доходы': 'TrendingUp', 'заявки': 'ClipboardList', 'сотрудники': 'Users', 'склад': 'Package' };
const TYPE_COLORS: Record<string, string> = {
  'доходы': 'bg-emerald-100 text-emerald-700', 'заявки': 'bg-blue-100 text-blue-700',
  'сотрудники': 'bg-violet-100 text-violet-700', 'склад': 'bg-amber-100 text-amber-700'
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
    toast({ title: 'Удалено', variant: 'destructive' });
    await load();
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h2 className="text-xl font-bold">Отчёты и аналитика</h2><p className="text-sm text-muted-foreground mt-0.5">Бизнес-показатели в одном месте</p></div>
        <Button onClick={() => { setForm(EMPTY); setDialogOpen(true); }} size="sm" className="gap-1.5"><Icon name="Plus" size={15} /> Сформировать отчёт</Button>
      </div>

      <KPIRow items={[
        { label: 'Выручка июнь', value: '₽ 38 900', delta: '+12% к маю', trend: 'up', icon: 'TrendingUp', accent: 'emerald' },
        { label: 'Заявок выполнено', value: '54', delta: 'Q2 2024', icon: 'CheckCircle2', accent: 'blue' },
        { label: 'Средний чек', value: '₽ 6 450', delta: '+5%', trend: 'up', icon: 'Receipt', accent: 'amber' },
        { label: 'NPS', value: '78', delta: 'отличный', icon: 'Heart', accent: 'violet' },
      ]} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <InfoCard title="Динамика выручки (6 мес.)" icon="LineChart">
          <MiniChart values={[28, 32, 31, 35, 34, 39]} labels={['Я','Ф','М','А','М','Ин']} color="bg-emerald-500" />
          <div className="flex items-center justify-between mt-2 text-xs">
            <span className="text-muted-foreground">Среднее</span>
            <span className="font-bold">₽ 33 100</span>
          </div>
        </InfoCard>
        <InfoCard title="Прогресс целей квартала" icon="Target">
          <div className="space-y-2.5">
            <ProgressGoal label="Выручка квартала" current={185} target={250} unit=" тыс. ₽" />
            <ProgressGoal label="Заявок выполнить" current={54} target={75} unit=" шт" />
            <ProgressGoal label="NPS" current={78} target={85} unit="" />
            <ProgressGoal label="Удержание клиентов" current={82} target={90} unit="%" />
          </div>
        </InfoCard>
        <InfoCard title="Уведомления" icon="Bell">
          <AlertsList items={[
            { type: 'success', title: 'Отчёт по июню готов', description: 'Превышен план на 12%' },
            { type: 'info', title: 'Подготовлено к экспорту', description: '3 отчёта в Excel' },
            { type: 'warning', title: 'Анализ запланирован', description: 'Q2 — на 30 июня' },
          ]} />
        </InfoCard>
      </div>

      <Card className="border shadow-sm">
        <CardHeader className="pb-3 pt-4 px-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск..." className="pl-9 h-9" />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-40 h-9"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="all">Все</SelectItem>{REPORT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="grid gap-2">
            {filtered.map(r => (
              <div key={r.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/30 cursor-pointer" onClick={() => setViewReport(r)}>
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${TYPE_COLORS[r.type]}`}><Icon name={TYPE_ICONS[r.type]} size={16} /></div>
                <div className="flex-1 min-w-0"><p className="text-sm font-semibold truncate">{r.name}</p><p className="text-xs text-muted-foreground">{r.period} · {r.createdAt} · {r.createdBy}</p></div>
                <Badge className={`border-0 text-xs shrink-0 ${TYPE_COLORS[r.type]}`}>{r.type}</Badge>
                <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => setViewReport(r)}><Icon name="Eye" size={13} /></Button>
                  <Button variant="ghost" size="icon" className="w-7 h-7 text-destructive hover:text-destructive" onClick={() => setDeleteId(r.id)}><Icon name="Trash2" size={13} /></Button>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (<p className="text-center py-6 text-muted-foreground text-sm">Не найдено</p>)}
          </div>
        </CardContent>
      </Card>

      {viewReport && (
        <ViewSheet
          open={!!viewReport} onClose={() => setViewReport(null)}
          title={viewReport.name} subtitle={`${viewReport.period} · ${viewReport.createdBy}`}
          badge={{ text: viewReport.type, color: TYPE_COLORS[viewReport.type] }}
          icon={TYPE_ICONS[viewReport.type]} iconBg="bg-violet-500"
        >
          <ViewGrid cols={3}>
            <InfoCard title="Период" icon="Calendar"><p className="text-base font-bold">{viewReport.period}</p></InfoCard>
            <InfoCard title="Создан" icon="Clock"><p className="text-base font-bold">{viewReport.createdAt}</p></InfoCard>
            <InfoCard title="Тип" icon="FileText"><p className="text-base font-bold capitalize">{viewReport.type}</p></InfoCard>
          </ViewGrid>

          <InfoCard title="Ключевые показатели" icon="BarChart3">
            <KeyValueList rows={Object.entries(viewReport.data).map(([key, val]) => ({
              label: key, value: typeof val === 'number' && val > 1000 ? val.toLocaleString() : String(val)
            }))} />
          </InfoCard>

          <InfoCard title="График трендов" icon="LineChart">
            <MiniChart values={[28, 32, 31, 35, 34, 39, 42]} labels={['Я','Ф','М','А','М','Ин','Ил']} color="bg-violet-500" />
          </InfoCard>

          <InfoCard title="Топ записи" icon="Trophy">
            <TopList items={[
              { rank: 1, label: 'Лидер периода', value: 'Кириллов М.Ю.', sub: '12 заявок' },
              { rank: 2, label: 'Самая дорогая услуга', value: '₽ 25 000', sub: 'RAID recovery' },
              { rank: 3, label: 'Топ клиент', value: 'Козлов Д.С.', sub: '8 обращений' },
            ]} />
          </InfoCard>

          <InfoCard title="Метаданные" icon="Info">
            <KeyValueList rows={[
              { label: 'ID отчёта', value: viewReport.id, mono: true },
              { label: 'Создал', value: viewReport.createdBy },
              { label: 'Дата создания', value: viewReport.createdAt },
              { label: 'Источник', value: 'АИС Ремонт v2.0' },
              { label: 'Формат', value: 'Внутренний' },
            ]} />
          </InfoCard>

          <InfoCard title="Лента активности отчёта" icon="Activity">
            <ActivityFeed items={[
              { user: viewReport.createdBy, action: 'сформировал отчёт', time: viewReport.createdAt },
              { user: 'Петров Андрей', action: 'просмотрел', time: 'вчера' },
              { user: 'Система', action: 'отправила копию на email', time: viewReport.createdAt },
            ]} />
          </InfoCard>

          <InfoCard title="Версии отчёта" icon="GitBranch">
            <Timeline events={[
              { date: viewReport.createdAt, title: 'v1.0 — текущая', description: 'Финальная версия', icon: 'CheckCircle2', color: 'emerald' },
              { date: 'до этого', title: 'v0.2 — черновик', description: 'Промежуточные данные', icon: 'FileEdit', color: 'amber' },
              { date: 'до этого', title: 'v0.1 — инициация', description: 'Запрошены данные из БД', icon: 'FilePlus2', color: 'slate' },
            ]} />
          </InfoCard>
        </ViewSheet>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Сформировать отчёт</DialogTitle></DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="space-y-1.5"><Label>Название</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="h-9" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Тип</Label>
                <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v as Report['type'] }))}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>{REPORT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Период</Label><Input value={form.period} onChange={e => setForm(f => ({ ...f, period: e.target.value }))} className="h-9" /></div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Отмена</Button><Button onClick={handleCreate} disabled={loading}>{loading ? '...' : 'Сформировать'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={open => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Удалить отчёт?</AlertDialogTitle><AlertDialogDescription>Будет удалён.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Отмена</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive text-white hover:bg-destructive/90">Удалить</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
