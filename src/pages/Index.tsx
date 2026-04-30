import { useState } from 'react';
import LoginPage from './LoginPage';
import AdminLayout from '@/components/admin/AdminLayout';

interface AuthUser {
  name: string;
  role: string;
}

export default function Index() {
  const [user, setUser] = useState<AuthUser | null>(null);

  if (!user) {
    return <LoginPage onLogin={setUser} />;
  }

  return <AdminLayout user={user} onLogout={() => setUser(null)} />;
}
