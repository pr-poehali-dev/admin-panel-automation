import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';

interface LoginPageProps {
  onLogin: (user: { name: string; role: string }) => void;
}

const DEMO_USERS = [
  { login: 'admin', password: 'admin123', name: 'Петров Андрей Владимирович', role: 'Администратор' },
  { login: 'master', password: 'master123', name: 'Кириллов Максим Юрьевич', role: 'Мастер' },
  { login: 'manager', password: 'manager123', name: 'Захарова Лидия Ивановна', role: 'Менеджер' },
];

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const user = DEMO_USERS.find(u => u.login === login && u.password === password);
    if (user) {
      onLogin({ name: user.name, role: user.role });
    } else {
      setError('Неверный логин или пароль');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-100 rounded-full opacity-40 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-100 rounded-full opacity-40 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary shadow-lg shadow-primary/20 mb-4">
            <Icon name="Cpu" size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">АИС Ремонт</h1>
          <p className="text-muted-foreground text-sm mt-1">Автоматизированная информационная система</p>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4 pt-6 px-6">
            <h2 className="text-lg font-semibold text-center text-foreground">Вход в систему</h2>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login" className="text-sm font-medium">Логин</Label>
                <div className="relative">
                  <Icon name="User" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="login"
                    value={login}
                    onChange={e => setLogin(e.target.value)}
                    placeholder="Введите логин"
                    className="pl-9 h-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Пароль</Label>
                <div className="relative">
                  <Icon name="Lock" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Введите пароль"
                    className="pl-9 pr-10 h-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Icon name={showPass ? 'EyeOff' : 'Eye'} size={16} />
                  </button>
                </div>
              </div>

              {error && (
                <Alert variant="destructive" className="py-2">
                  <AlertDescription className="text-sm flex items-center gap-2">
                    <Icon name="AlertCircle" size={14} />
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full h-10 font-semibold" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Icon name="Loader2" size={16} className="animate-spin" />
                    Вход...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Icon name="LogIn" size={16} />
                    Войти
                  </span>
                )}
              </Button>
            </form>

            {/* Demo credentials */}
            <div className="mt-5 p-3 bg-muted/60 rounded-lg">
              <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                <Icon name="Info" size={12} />
                Демо-доступ:
              </p>
              <div className="space-y-1">
                {DEMO_USERS.map(u => (
                  <button
                    key={u.login}
                    type="button"
                    onClick={() => { setLogin(u.login); setPassword(u.password); setError(''); }}
                    className="w-full text-left text-xs px-2 py-1 rounded hover:bg-background transition-colors"
                  >
                    <span className="font-mono font-medium text-primary">{u.login}</span>
                    <span className="text-muted-foreground"> / {u.password}</span>
                    <span className="text-muted-foreground ml-2">— {u.role}</span>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-4">
          © 2024 ТехСервис Про. Все права защищены.
        </p>
      </div>
    </div>
  );
}
