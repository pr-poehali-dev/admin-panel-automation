import {
  mockClients, mockDevices, mockEmployees, mockOrders,
  mockParts, mockSuppliers, mockServices, mockPayments,
  mockWarranties, mockReports, mockRoles, mockSettings,
  Client, Device, Employee, Order, Part, Supplier, Service,
  Payment, Warranty, Report, Role, Setting
} from './mockData';

// Хранилища в памяти (имитация БД)
let clients = [...mockClients];
let devices = [...mockDevices];
let employees = [...mockEmployees];
let orders = [...mockOrders];
let parts = [...mockParts];
let suppliers = [...mockSuppliers];
let services = [...mockServices];
let payments = [...mockPayments];
let warranties = [...mockWarranties];
let reports = [...mockReports];
let roles = [...mockRoles];
let settings = [...mockSettings];

const delay = (ms = 200) => new Promise(res => setTimeout(res, ms));
const genId = () => Math.random().toString(36).slice(2, 10);

// ===== CLIENTS =====
export const clientService = {
  getAll: async () => { await delay(); return [...clients]; },
  getById: async (id: string) => { await delay(); return clients.find(c => c.id === id) ?? null; },
  create: async (data: Omit<Client, 'id' | 'totalOrders'>) => {
    await delay();
    const item: Client = { ...data, id: genId(), totalOrders: 0 };
    clients = [...clients, item]; return item;
  },
  update: async (id: string, data: Partial<Client>) => {
    await delay();
    clients = clients.map(c => c.id === id ? { ...c, ...data } : c);
    return clients.find(c => c.id === id)!;
  },
  delete: async (id: string) => { await delay(); clients = clients.filter(c => c.id !== id); },
};

// ===== DEVICES =====
export const deviceService = {
  getAll: async () => { await delay(); return [...devices]; },
  getById: async (id: string) => { await delay(); return devices.find(d => d.id === id) ?? null; },
  create: async (data: Omit<Device, 'id'>) => {
    await delay();
    const item: Device = { ...data, id: genId() };
    devices = [...devices, item]; return item;
  },
  update: async (id: string, data: Partial<Device>) => {
    await delay();
    devices = devices.map(d => d.id === id ? { ...d, ...data } : d);
    return devices.find(d => d.id === id)!;
  },
  delete: async (id: string) => { await delay(); devices = devices.filter(d => d.id !== id); },
};

// ===== EMPLOYEES =====
export const employeeService = {
  getAll: async () => { await delay(); return [...employees]; },
  getById: async (id: string) => { await delay(); return employees.find(e => e.id === id) ?? null; },
  create: async (data: Omit<Employee, 'id' | 'activeOrders' | 'rating'>) => {
    await delay();
    const item: Employee = { ...data, id: genId(), activeOrders: 0, rating: 5.0 };
    employees = [...employees, item]; return item;
  },
  update: async (id: string, data: Partial<Employee>) => {
    await delay();
    employees = employees.map(e => e.id === id ? { ...e, ...data } : e);
    return employees.find(e => e.id === id)!;
  },
  delete: async (id: string) => { await delay(); employees = employees.filter(e => e.id !== id); },
};

// ===== ORDERS =====
export const orderService = {
  getAll: async () => { await delay(); return [...orders]; },
  getById: async (id: string) => { await delay(); return orders.find(o => o.id === id) ?? null; },
  create: async (data: Omit<Order, 'id' | 'number' | 'createdAt' | 'updatedAt'>) => {
    await delay();
    const num = `ЗА-2024-${String(orders.length + 1).padStart(3, '0')}`;
    const now = new Date().toISOString().slice(0, 10);
    const item: Order = { ...data, id: genId(), number: num, createdAt: now, updatedAt: now };
    orders = [...orders, item]; return item;
  },
  update: async (id: string, data: Partial<Order>) => {
    await delay();
    const now = new Date().toISOString().slice(0, 10);
    orders = orders.map(o => o.id === id ? { ...o, ...data, updatedAt: now } : o);
    return orders.find(o => o.id === id)!;
  },
  delete: async (id: string) => { await delay(); orders = orders.filter(o => o.id !== id); },
};

// ===== PARTS =====
export const partService = {
  getAll: async () => { await delay(); return [...parts]; },
  getById: async (id: string) => { await delay(); return parts.find(p => p.id === id) ?? null; },
  create: async (data: Omit<Part, 'id' | 'lastUpdated'>) => {
    await delay();
    const item: Part = { ...data, id: genId(), lastUpdated: new Date().toISOString().slice(0, 10) };
    parts = [...parts, item]; return item;
  },
  update: async (id: string, data: Partial<Part>) => {
    await delay();
    parts = parts.map(p => p.id === id ? { ...p, ...data, lastUpdated: new Date().toISOString().slice(0, 10) } : p);
    return parts.find(p => p.id === id)!;
  },
  delete: async (id: string) => { await delay(); parts = parts.filter(p => p.id !== id); },
};

// ===== SUPPLIERS =====
export const supplierService = {
  getAll: async () => { await delay(); return [...suppliers]; },
  getById: async (id: string) => { await delay(); return suppliers.find(s => s.id === id) ?? null; },
  create: async (data: Omit<Supplier, 'id' | 'createdAt'>) => {
    await delay();
    const item: Supplier = { ...data, id: genId(), createdAt: new Date().toISOString().slice(0, 10) };
    suppliers = [...suppliers, item]; return item;
  },
  update: async (id: string, data: Partial<Supplier>) => {
    await delay();
    suppliers = suppliers.map(s => s.id === id ? { ...s, ...data } : s);
    return suppliers.find(s => s.id === id)!;
  },
  delete: async (id: string) => { await delay(); suppliers = suppliers.filter(s => s.id !== id); },
};

// ===== SERVICES =====
export const serviceService = {
  getAll: async () => { await delay(); return [...services]; },
  getById: async (id: string) => { await delay(); return services.find(s => s.id === id) ?? null; },
  create: async (data: Omit<Service, 'id'>) => {
    await delay();
    const item: Service = { ...data, id: genId() };
    services = [...services, item]; return item;
  },
  update: async (id: string, data: Partial<Service>) => {
    await delay();
    services = services.map(s => s.id === id ? { ...s, ...data } : s);
    return services.find(s => s.id === id)!;
  },
  delete: async (id: string) => { await delay(); services = services.filter(s => s.id !== id); },
};

// ===== PAYMENTS =====
export const paymentService = {
  getAll: async () => { await delay(); return [...payments]; },
  getById: async (id: string) => { await delay(); return payments.find(p => p.id === id) ?? null; },
  create: async (data: Omit<Payment, 'id'>) => {
    await delay();
    const item: Payment = { ...data, id: genId() };
    payments = [...payments, item]; return item;
  },
  update: async (id: string, data: Partial<Payment>) => {
    await delay();
    payments = payments.map(p => p.id === id ? { ...p, ...data } : p);
    return payments.find(p => p.id === id)!;
  },
  delete: async (id: string) => { await delay(); payments = payments.filter(p => p.id !== id); },
};

// ===== WARRANTIES =====
export const warrantyService = {
  getAll: async () => { await delay(); return [...warranties]; },
  getById: async (id: string) => { await delay(); return warranties.find(w => w.id === id) ?? null; },
  create: async (data: Omit<Warranty, 'id'>) => {
    await delay();
    const item: Warranty = { ...data, id: genId() };
    warranties = [...warranties, item]; return item;
  },
  update: async (id: string, data: Partial<Warranty>) => {
    await delay();
    warranties = warranties.map(w => w.id === id ? { ...w, ...data } : w);
    return warranties.find(w => w.id === id)!;
  },
  delete: async (id: string) => { await delay(); warranties = warranties.filter(w => w.id !== id); },
};

// ===== REPORTS =====
export const reportService = {
  getAll: async () => { await delay(); return [...reports]; },
  getById: async (id: string) => { await delay(); return reports.find(r => r.id === id) ?? null; },
  create: async (data: Omit<Report, 'id' | 'createdAt'>) => {
    await delay();
    const item: Report = { ...data, id: genId(), createdAt: new Date().toISOString().slice(0, 10) };
    reports = [...reports, item]; return item;
  },
  update: async (id: string, data: Partial<Report>) => {
    await delay();
    reports = reports.map(r => r.id === id ? { ...r, ...data } : r);
    return reports.find(r => r.id === id)!;
  },
  delete: async (id: string) => { await delay(); reports = reports.filter(r => r.id !== id); },
};

// ===== ROLES =====
export const roleService = {
  getAll: async () => { await delay(); return [...roles]; },
  getById: async (id: string) => { await delay(); return roles.find(r => r.id === id) ?? null; },
  create: async (data: Omit<Role, 'id' | 'usersCount'>) => {
    await delay();
    const item: Role = { ...data, id: genId(), usersCount: 0 };
    roles = [...roles, item]; return item;
  },
  update: async (id: string, data: Partial<Role>) => {
    await delay();
    roles = roles.map(r => r.id === id ? { ...r, ...data } : r);
    return roles.find(r => r.id === id)!;
  },
  delete: async (id: string) => { await delay(); roles = roles.filter(r => r.id !== id); },
};

// ===== SETTINGS =====
export const settingService = {
  getAll: async () => { await delay(); return [...settings]; },
  update: async (id: string, value: string) => {
    await delay();
    settings = settings.map(s => s.id === id ? { ...s, value } : s);
    return settings.find(s => s.id === id)!;
  },
};
