import { useEffect, useState } from 'react';
import { settingService } from '@/services/mockService';
import { Setting } from '@/services/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { KPIRow, MiniChart, Timeline, ActivityFeed, AlertsList, InfoCard, KeyValueList, ServiceStatusList, TagBadges } from '../widgets/Widgets';
import ViewSheet, { ViewGrid } from '../widgets/ViewSheet';

export default function SettingsSection() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [viewSetting, setViewSetting] = useState<Setting | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const load = async () => {
    const data = await settingService.getAll();
    setSettings(data);
    const vals: Record<string, string> = {};
    data.forEach(s => { vals[s.id] = s.value; });
    setEditValues(vals);
  };
  useEffect(() => { load(); }, []);

  const handleSave = async (setting: Setting) => {
    setLoading(true);
    try {
      await settingService.update(setting.id, editValues[setting.id]);
      toast({ title: `«${setting.label}» сохранена` });
      await load();
    } finally { setLoading(false); }
  };

  const categories = [...new Set(settings.map(s => s.category))];

  return (
    <div className="space-y-4 animate-fade-in">
      <div><h2 className="text-xl font-bold">Настройки системы</h2><p className="text-sm text-muted-foreground mt-0.5">Конфигурация АИС, интеграции, безопасность</p></div>

      <Card className="border-0 bg-gradient-to-r from-primary/5 to-blue-50 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center"><Icon name="Cpu" size={20} className="text-white" /></div>
            <div>
              <p className="font-bold text-sm">АИС Ремонт v2.0</p>
              <p className="text-xs text-muted-foreground">Сборка #147 · база PostgreSQL · uptime 99.98%</p>
            </div>
            <div className="ml-auto flex gap-2">
              <Badge variant="secondary" className="text-xs">Сборка #147</Badge>
              <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs">Онлайн</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <KPIRow items={[
        { label: 'Параметров', value: settings.length, delta: 'настроек', icon: 'Settings', accent: 'blue' },
        { label: 'Категорий', value: categories.length, delta: 'разделов', icon: 'FolderTree', accent: 'violet' },
        { label: 'Интеграций', value: 5, delta: 'активных', icon: 'Plug', accent: 'emerald' },
        { label: 'Изменений', value: 12, delta: 'за неделю', icon: 'History', accent: 'amber' },
      ]} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <InfoCard title="Статус сервисов" icon="ServerCog">
          <ServiceStatusList items={[
            { name: 'API сервер', status: 'ok', latency: '24ms' },
            { name: 'PostgreSQL', status: 'ok', latency: '8ms' },
            { name: 'S3 хранилище', status: 'ok', latency: '142ms' },
            { name: 'SMS-шлюз', status: 'warn', latency: '480ms' },
            { name: 'Email-сервис', status: 'ok', latency: '32ms' },
          ]} />
        </InfoCard>
        <InfoCard title="Нагрузка системы (24ч)" icon="Activity">
          <MiniChart values={[12, 18, 25, 32, 28, 35, 42, 38, 30, 22, 15, 8]} color="bg-cyan-500" />
          <p className="text-[10px] text-muted-foreground mt-2">Пик нагрузки: 14:00 — 42 RPS</p>
        </InfoCard>
        <InfoCard title="Алерты системы" icon="Bell">
          <AlertsList items={[
            { type: 'success', title: 'Все сервисы в норме', description: 'Uptime 99.98%' },
            { type: 'warning', title: 'SMS-шлюз медленный', description: 'Latency > 400ms' },
            { type: 'info', title: 'Резервная копия создана', description: 'Сегодня в 03:00' },
          ]} />
        </InfoCard>
      </div>

      {categories.map(cat => {
        const catSettings = settings.filter(s => s.category === cat);
        return (
          <Card key={cat} className="border shadow-sm">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Icon name={cat === 'Общие' ? 'Building2' : cat === 'Заявки' ? 'ClipboardList' : cat === 'Уведомления' ? 'Bell' : 'Banknote'} size={14} className="text-primary" />
                {cat}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="space-y-0">
                {catSettings.map((s, i) => (
                  <div key={s.id}>
                    {i > 0 && <Separator className="my-3" />}
                    <div className="flex items-center justify-between gap-4 py-1">
                      <div className="min-w-0 flex-1 cursor-pointer" onClick={() => setViewSetting(s)}>
                        <p className="text-sm font-medium hover:text-primary transition-colors">{s.label}</p>
                        <p className="text-xs text-muted-foreground font-mono">{s.key}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {s.type === 'boolean' ? (
                          <Switch checked={editValues[s.id] === 'true'} onCheckedChange={v => {
                            setEditValues(ev => ({ ...ev, [s.id]: String(v) }));
                            settingService.update(s.id, String(v)).then(() => toast({ title: `${s.label}: ${v ? 'вкл' : 'выкл'}` }));
                          }} />
                        ) : s.type === 'select' && s.options ? (
                          <div className="flex items-center gap-2">
                            <Select value={editValues[s.id]} onValueChange={v => setEditValues(ev => ({ ...ev, [s.id]: v }))}>
                              <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
                              <SelectContent>{s.options.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                            </Select>
                            <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => handleSave(s)} disabled={loading}>OK</Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Input value={editValues[s.id] ?? ''} onChange={e => setEditValues(ev => ({ ...ev, [s.id]: e.target.value }))} type={s.type === 'number' ? 'number' : 'text'} className="h-8 w-52 text-xs" />
                            <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => handleSave(s)} disabled={loading}>OK</Button>
                          </div>
                        )}
                        <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => setViewSetting(s)}><Icon name="Eye" size={13} /></Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {viewSetting && (
        <ViewSheet
          open={!!viewSetting} onClose={() => setViewSetting(null)}
          title={viewSetting.label} subtitle={viewSetting.category}
          badge={{ text: viewSetting.type, color: 'bg-blue-100 text-blue-700' }}
          icon="Settings" iconBg="bg-slate-700"
        >
          <ViewGrid cols={2}>
            <InfoCard title="Текущее значение" icon="Tag">
              <p className="text-base font-bold font-mono break-all">{viewSetting.value}</p>
            </InfoCard>
            <InfoCard title="Тип параметра" icon="FileType">
              <p className="text-base font-bold capitalize">{viewSetting.type}</p>
            </InfoCard>
          </ViewGrid>

          <InfoCard title="Описание параметра" icon="Info">
            <KeyValueList rows={[
              { label: 'Название', value: viewSetting.label },
              { label: 'Ключ', value: viewSetting.key, mono: true },
              { label: 'Категория', value: viewSetting.category },
              { label: 'Тип', value: viewSetting.type },
              { label: 'Текущее значение', value: viewSetting.value, mono: true },
              ...(viewSetting.options ? [{ label: 'Варианты', value: viewSetting.options.join(', ') }] : []),
            ]} />
          </InfoCard>

          <InfoCard title="Метки" icon="Tags">
            <TagBadges tags={[viewSetting.category, viewSetting.type, 'Системный', 'Можно менять']} />
          </InfoCard>

          <InfoCard title="История изменений" icon="History">
            <Timeline events={[
              { date: 'сегодня', title: `Установлено: «${viewSetting.value}»`, icon: 'CheckCircle2', color: 'emerald' },
              { date: 'неделю назад', title: 'Изменено значение', description: 'Петров Андрей', icon: 'FileEdit', color: 'amber' },
              { date: 'месяц назад', title: 'Параметр создан', description: 'При установке системы', icon: 'Plus', color: 'blue' },
            ]} />
          </InfoCard>

          <InfoCard title="Лента событий" icon="Activity">
            <ActivityFeed items={[
              { user: 'Петров Андрей', action: 'изменил значение', target: viewSetting.value, time: 'сегодня' },
              { user: 'Система', action: 'применила изменения', time: 'сегодня' },
              { user: 'Белова Наталья', action: 'просмотрела параметр', time: 'вчера' },
            ]} />
          </InfoCard>

          <InfoCard title="Где используется" icon="Network">
            <ServiceStatusList items={[
              { name: 'Модуль уведомлений', status: 'ok' },
              { name: 'Модуль печати', status: 'ok' },
              { name: 'Email-шаблоны', status: 'ok' },
              { name: 'Бухгалтерия', status: 'warn', latency: 'sync' },
            ]} />
          </InfoCard>

          <InfoCard title="Рекомендации" icon="Sparkles">
            <AlertsList items={[
              { type: 'info', title: 'Безопасное значение', description: 'Текущая настройка соответствует best practices' },
              { type: 'warning', title: 'Изменение влияет на 4 модуля', description: 'Рекомендуется перезапуск' },
            ]} />
          </InfoCard>
        </ViewSheet>
      )}
    </div>
  );
}
