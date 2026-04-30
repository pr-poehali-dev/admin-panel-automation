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

export default function SettingsSection() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
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
      toast({ title: `Настройка "${setting.label}" сохранена` });
      await load();
    } finally { setLoading(false); }
  };

  const categories = [...new Set(settings.map(s => s.category))];

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold">Настройки системы</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Общие параметры АИС Ремонт</p>
      </div>

      {/* System info */}
      <Card className="border shadow-sm bg-gradient-to-r from-primary/5 to-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Icon name="Cpu" size={20} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-sm">АИС Ремонт v2.0</p>
              <p className="text-xs text-muted-foreground">Автоматизированная информационная система по ремонту компьютерной техники</p>
            </div>
            <div className="ml-auto flex gap-2">
              <Badge variant="secondary" className="text-xs">Сборка #147</Badge>
              <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs">Онлайн</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

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
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{s.label}</p>
                        <p className="text-xs text-muted-foreground font-mono">{s.key}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {s.type === 'boolean' ? (
                          <Switch
                            checked={editValues[s.id] === 'true'}
                            onCheckedChange={v => {
                              setEditValues(ev => ({ ...ev, [s.id]: String(v) }));
                              settingService.update(s.id, String(v)).then(() =>
                                toast({ title: `${s.label}: ${v ? 'включено' : 'выключено'}` })
                              );
                            }}
                          />
                        ) : s.type === 'select' && s.options ? (
                          <div className="flex items-center gap-2">
                            <Select
                              value={editValues[s.id]}
                              onValueChange={v => setEditValues(ev => ({ ...ev, [s.id]: v }))}
                            >
                              <SelectTrigger className="w-28 h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {s.options.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                              </SelectContent>
                            </Select>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 text-xs"
                              onClick={() => handleSave(s)}
                              disabled={loading}
                            >
                              Сохранить
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Input
                              value={editValues[s.id] ?? ''}
                              onChange={e => setEditValues(ev => ({ ...ev, [s.id]: e.target.value }))}
                              type={s.type === 'number' ? 'number' : 'text'}
                              className="h-8 w-52 text-xs"
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 text-xs"
                              onClick={() => handleSave(s)}
                              disabled={loading}
                            >
                              Сохранить
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
