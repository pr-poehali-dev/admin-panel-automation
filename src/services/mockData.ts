// ===================== ТИПЫ =====================

export type OrderStatus = 'новая' | 'в работе' | 'ожидание запчастей' | 'готова' | 'выдана' | 'отменена';
export type PaymentStatus = 'не оплачено' | 'частично' | 'оплачено' | 'возврат';
export type DeviceType = 'ноутбук' | 'ПК' | 'моноблок' | 'планшет' | 'принтер' | 'МФУ' | 'сервер' | 'другое';
export type EmployeeRole = 'мастер' | 'менеджер' | 'администратор' | 'бухгалтер' | 'курьер';

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  createdAt: string;
  totalOrders: number;
  notes: string;
}

export interface Device {
  id: string;
  clientId: string;
  type: DeviceType;
  brand: string;
  model: string;
  serial: string;
  condition: string;
  createdAt: string;
}

export interface Order {
  id: string;
  number: string;
  clientId: string;
  deviceId: string;
  status: OrderStatus;
  description: string;
  diagnosis: string;
  masterNotes: string;
  masterId: string;
  createdAt: string;
  updatedAt: string;
  deadline: string;
  estimatedCost: number;
  finalCost: number;
  paymentStatus: PaymentStatus;
}

export interface Employee {
  id: string;
  name: string;
  role: EmployeeRole;
  phone: string;
  email: string;
  hireDate: string;
  salary: number;
  activeOrders: number;
  rating: number;
  isActive: boolean;
}

export interface Part {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  minQuantity: number;
  purchasePrice: number;
  salePrice: number;
  supplierId: string;
  location: string;
  lastUpdated: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  inn: string;
  paymentTerms: string;
  rating: number;
  isActive: boolean;
  createdAt: string;
}

export interface Service {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  duration: number;
  isActive: boolean;
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  method: 'наличные' | 'карта' | 'перевод' | 'онлайн';
  status: PaymentStatus;
  date: string;
  notes: string;
}

export interface Warranty {
  id: string;
  orderId: string;
  clientId: string;
  deviceId: string;
  startDate: string;
  endDate: string;
  description: string;
  status: 'активна' | 'истекла' | 'использована';
}

export interface Report {
  id: string;
  name: string;
  type: 'доходы' | 'заявки' | 'сотрудники' | 'склад';
  period: string;
  createdAt: string;
  createdBy: string;
  data: Record<string, unknown>;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  usersCount: number;
}

export interface Setting {
  id: string;
  key: string;
  label: string;
  value: string;
  type: 'text' | 'number' | 'boolean' | 'select';
  category: string;
  options?: string[];
}

// ===================== MOCK ДАННЫЕ =====================

export const mockClients: Client[] = [
  { id: 'c1', name: 'Иванов Алексей Петрович', phone: '+7 (495) 123-45-67', email: 'ivanov@mail.ru', address: 'Москва, ул. Ленина, 15, кв. 42', createdAt: '2024-01-10', totalOrders: 5, notes: 'Постоянный клиент, VIP' },
  { id: 'c2', name: 'Смирнова Ольга Николаевна', phone: '+7 (495) 234-56-78', email: 'smirnova@gmail.com', address: 'Москва, пр. Мира, 88, кв. 12', createdAt: '2024-02-15', totalOrders: 2, notes: '' },
  { id: 'c3', name: 'Козлов Дмитрий Сергеевич', phone: '+7 (495) 345-67-89', email: 'kozlov@yandex.ru', address: 'Москва, ул. Садовая, 7, кв. 3', createdAt: '2024-03-20', totalOrders: 8, notes: 'Корпоративный клиент, ООО "Техком"' },
  { id: 'c4', name: 'Попова Марина Викторовна', phone: '+7 (495) 456-78-90', email: 'popova@mail.ru', address: 'Москва, ул. Центральная, 22', createdAt: '2024-04-05', totalOrders: 1, notes: '' },
  { id: 'c5', name: 'Новиков Игорь Александрович', phone: '+7 (495) 567-89-01', email: 'novikov@bk.ru', address: 'Москва, ул. Парковая, 45, кв. 7', createdAt: '2024-05-12', totalOrders: 3, notes: 'Предпочитает SMS-уведомления' },
  { id: 'c6', name: 'Федорова Екатерина Андреевна', phone: '+7 (495) 678-90-12', email: 'fedorova@gmail.com', address: 'Москва, ул. Зеленая, 3', createdAt: '2024-06-01', totalOrders: 4, notes: '' },
  { id: 'c7', name: 'Морозов Владимир Иванович', phone: '+7 (495) 789-01-23', email: 'morozov@yandex.ru', address: 'Подмосковье, г. Видное, ул. Советская, 18', createdAt: '2024-07-14', totalOrders: 2, notes: '' },
];

export const mockDevices: Device[] = [
  { id: 'd1', clientId: 'c1', type: 'ноутбук', brand: 'ASUS', model: 'VivoBook 15 X512DA', serial: 'SN-AS-2024-001', condition: 'Трещина на корпусе, залит жидкостью', createdAt: '2024-01-10' },
  { id: 'd2', clientId: 'c2', type: 'ПК', brand: 'DNS', model: 'Custom Build', serial: 'SN-DNS-2023-445', condition: 'Не включается', createdAt: '2024-02-15' },
  { id: 'd3', clientId: 'c3', type: 'принтер', brand: 'HP', model: 'LaserJet Pro M404dn', serial: 'VNB3Q08732', condition: 'Замятие бумаги, ошибка картриджа', createdAt: '2024-03-20' },
  { id: 'd4', clientId: 'c1', type: 'ноутбук', brand: 'Lenovo', model: 'ThinkPad X1 Carbon', serial: 'SN-LEN-2022-889', condition: 'Сломана клавиша, плохой контакт', createdAt: '2024-04-01' },
  { id: 'd5', clientId: 'c4', type: 'планшет', brand: 'Samsung', model: 'Galaxy Tab S8', serial: 'R5CT301XXXX', condition: 'Разбит экран', createdAt: '2024-04-05' },
  { id: 'd6', clientId: 'c5', type: 'моноблок', brand: 'Apple', model: 'iMac 24" M1', serial: 'C02G7XXXMD6N', condition: 'Артефакты на экране', createdAt: '2024-05-12' },
  { id: 'd7', clientId: 'c3', type: 'сервер', brand: 'Dell', model: 'PowerEdge R740', serial: 'DELL-R740-2023-01', condition: 'Отказ RAID-массива', createdAt: '2024-06-10' },
];

export const mockEmployees: Employee[] = [
  { id: 'e1', name: 'Петров Андрей Владимирович', role: 'администратор', phone: '+7 (495) 100-00-01', email: 'petrov@company.ru', hireDate: '2020-03-01', salary: 75000, activeOrders: 0, rating: 5.0, isActive: true },
  { id: 'e2', name: 'Кириллов Максим Юрьевич', role: 'мастер', phone: '+7 (495) 100-00-02', email: 'kirillov@company.ru', hireDate: '2021-06-15', salary: 65000, activeOrders: 7, rating: 4.8, isActive: true },
  { id: 'e3', name: 'Захарова Лидия Ивановна', role: 'менеджер', phone: '+7 (495) 100-00-03', email: 'zaharova@company.ru', hireDate: '2022-01-10', salary: 55000, activeOrders: 0, rating: 4.9, isActive: true },
  { id: 'e4', name: 'Воронов Сергей Олегович', role: 'мастер', phone: '+7 (495) 100-00-04', email: 'voronov@company.ru', hireDate: '2022-08-20', salary: 60000, activeOrders: 5, rating: 4.6, isActive: true },
  { id: 'e5', name: 'Белова Наталья Дмитриевна', role: 'бухгалтер', phone: '+7 (495) 100-00-05', email: 'belova@company.ru', hireDate: '2023-02-01', salary: 58000, activeOrders: 0, rating: 4.7, isActive: true },
  { id: 'e6', name: 'Соколов Роман Александрович', role: 'курьер', phone: '+7 (495) 100-00-06', email: 'sokolov@company.ru', hireDate: '2023-09-01', salary: 42000, activeOrders: 0, rating: 4.5, isActive: false },
];

export const mockOrders: Order[] = [
  { id: 'o1', number: 'ЗА-2024-001', clientId: 'c1', deviceId: 'd1', status: 'в работе', description: 'Ноутбук не включается после залива', diagnosis: 'Окисление на материнской плате, требуется чистка и замена конденсаторов', masterNotes: 'Разобрал, провожу чистку ультразвуком', masterId: 'e2', createdAt: '2024-06-01', updatedAt: '2024-06-03', deadline: '2024-06-08', estimatedCost: 4500, finalCost: 0, paymentStatus: 'не оплачено' },
  { id: 'o2', number: 'ЗА-2024-002', clientId: 'c2', deviceId: 'd2', status: 'готова', description: 'ПК не запускается, нет изображения', diagnosis: 'Сгорел блок питания', masterNotes: 'Заменил БП на Seasonic 550W', masterId: 'e4', createdAt: '2024-06-02', updatedAt: '2024-06-05', deadline: '2024-06-07', estimatedCost: 5500, finalCost: 5200, paymentStatus: 'оплачено' },
  { id: 'o3', number: 'ЗА-2024-003', clientId: 'c3', deviceId: 'd3', status: 'ожидание запчастей', description: 'Замятие бумаги постоянное', diagnosis: 'Износ подающего ролика', masterNotes: 'Заказан ролик у поставщика', masterId: 'e2', createdAt: '2024-06-03', updatedAt: '2024-06-04', deadline: '2024-06-12', estimatedCost: 2800, finalCost: 0, paymentStatus: 'не оплачено' },
  { id: 'o4', number: 'ЗА-2024-004', clientId: 'c4', deviceId: 'd5', status: 'выдана', description: 'Разбит экран планшета', diagnosis: 'Замена дисплейного модуля', masterNotes: 'Установлен оригинальный модуль', masterId: 'e4', createdAt: '2024-05-28', updatedAt: '2024-06-01', deadline: '2024-06-04', estimatedCost: 12000, finalCost: 11500, paymentStatus: 'оплачено' },
  { id: 'o5', number: 'ЗА-2024-005', clientId: 'c5', deviceId: 'd6', status: 'новая', description: 'Артефакты и полосы на экране iMac', diagnosis: '', masterNotes: '', masterId: 'e2', createdAt: '2024-06-05', updatedAt: '2024-06-05', deadline: '2024-06-15', estimatedCost: 0, finalCost: 0, paymentStatus: 'не оплачено' },
  { id: 'o6', number: 'ЗА-2024-006', clientId: 'c3', deviceId: 'd7', status: 'в работе', description: 'Отказ RAID 5, нет доступа к данным', diagnosis: 'Вышел из строя один диск из массива', masterNotes: 'Заказываем HDD, пробуем recovery', masterId: 'e2', createdAt: '2024-06-04', updatedAt: '2024-06-05', deadline: '2024-06-20', estimatedCost: 25000, finalCost: 0, paymentStatus: 'частично' },
];

export const mockParts: Part[] = [
  { id: 'p1', name: 'Блок питания Seasonic 550W', sku: 'SSR-550FM', category: 'Блоки питания', quantity: 3, minQuantity: 2, purchasePrice: 4200, salePrice: 5500, supplierId: 's1', location: 'A1-01', lastUpdated: '2024-06-01' },
  { id: 'p2', name: 'SSD Samsung 870 EVO 500GB', sku: 'MZ-77E500BW', category: 'Накопители', quantity: 8, minQuantity: 3, purchasePrice: 3800, salePrice: 5200, supplierId: 's2', location: 'A2-05', lastUpdated: '2024-06-02' },
  { id: 'p3', name: 'Термопаста Arctic MX-4', sku: 'ACTCP00002B', category: 'Расходники', quantity: 15, minQuantity: 5, purchasePrice: 450, salePrice: 800, supplierId: 's1', location: 'C3-01', lastUpdated: '2024-05-20' },
  { id: 'p4', name: 'DDR4 8GB Kingston 3200MHz', sku: 'KVR32N22S8/8', category: 'Память', quantity: 12, minQuantity: 4, purchasePrice: 2100, salePrice: 3000, supplierId: 's2', location: 'A3-02', lastUpdated: '2024-05-25' },
  { id: 'p5', name: 'Дисплей ASUS VivoBook 15.6"', sku: 'B156XTN07.1', category: 'Матрицы', quantity: 2, minQuantity: 1, purchasePrice: 5500, salePrice: 8000, supplierId: 's3', location: 'B1-03', lastUpdated: '2024-06-03' },
  { id: 'p6', name: 'Ролик подачи бумаги HP', sku: 'RL1-2412-000CN', category: 'Запчасти принтеров', quantity: 4, minQuantity: 2, purchasePrice: 850, salePrice: 1400, supplierId: 's3', location: 'D2-01', lastUpdated: '2024-06-04' },
  { id: 'p7', name: 'Кулер для ноутбука 60x60x10', sku: 'FAN-60-5V', category: 'Охлаждение', quantity: 1, minQuantity: 3, purchasePrice: 600, salePrice: 1100, supplierId: 's1', location: 'B2-07', lastUpdated: '2024-05-15' },
];

export const mockSuppliers: Supplier[] = [
  { id: 's1', name: 'ТехноПарт Оптовик', contactPerson: 'Громов Илья Сергеевич', phone: '+7 (495) 500-10-20', email: 'gromov@technopart.ru', address: 'Москва, ул. Складская, 12', inn: '7701234567', paymentTerms: 'Отсрочка 14 дней', rating: 4.8, isActive: true, createdAt: '2023-01-15' },
  { id: 's2', name: 'DigiComp Wholesale', contactPerson: 'Антонова Светлана', phone: '+7 (495) 600-20-30', email: 'antonova@digicomp.ru', address: 'Москва, Варшавское шоссе, 125', inn: '7709876543', paymentTerms: 'Предоплата 100%', rating: 4.5, isActive: true, createdAt: '2023-03-10' },
  { id: 's3', name: 'РемКомплект', contactPerson: 'Тихонов Борис', phone: '+7 (495) 700-30-40', email: 'tihonov@remkomp.ru', address: 'Москва, ул. Промышленная, 7', inn: '7712345678', paymentTerms: 'Отсрочка 30 дней', rating: 4.2, isActive: true, createdAt: '2023-06-01' },
  { id: 's4', name: 'ЧипСнаб', contactPerson: 'Орлова Юлия', phone: '+7 (495) 800-40-50', email: 'orlova@chipsnab.ru', address: 'Подмосковье, г. Химки', inn: '5047123456', paymentTerms: 'Отсрочка 7 дней', rating: 3.9, isActive: false, createdAt: '2022-11-20' },
];

export const mockServices: Service[] = [
  { id: 'sv1', name: 'Диагностика устройства', category: 'Диагностика', description: 'Полная аппаратная и программная диагностика устройства', price: 500, duration: 60, isActive: true },
  { id: 'sv2', name: 'Чистка от пыли (ноутбук)', category: 'Чистка', description: 'Разборка, очистка системы охлаждения, замена термопасты', price: 1500, duration: 90, isActive: true },
  { id: 'sv3', name: 'Замена матрицы ноутбука', category: 'Дисплеи', description: 'Замена дисплейного модуля с тестированием', price: 2000, duration: 120, isActive: true },
  { id: 'sv4', name: 'Восстановление данных (HDD)', category: 'Данные', description: 'Восстановление данных с жёсткого диска при программных ошибках', price: 5000, duration: 480, isActive: true },
  { id: 'sv5', name: 'Установка ОС Windows 11', category: 'Программное обеспечение', description: 'Чистая установка Windows 11, драйверов и базового ПО', price: 2500, duration: 180, isActive: true },
  { id: 'sv6', name: 'Пайка разъёма зарядки', category: 'Пайка', description: 'Замена или восстановление разъёма питания', price: 1800, duration: 60, isActive: true },
  { id: 'sv7', name: 'Настройка роутера', category: 'Сеть', description: 'Настройка домашней / офисной сети, Wi-Fi', price: 1200, duration: 60, isActive: true },
  { id: 'sv8', name: 'Удаление вирусов', category: 'Программное обеспечение', description: 'Полное сканирование и очистка от вредоносного ПО', price: 1500, duration: 120, isActive: true },
];

export const mockPayments: Payment[] = [
  { id: 'pay1', orderId: 'o2', amount: 5200, method: 'карта', status: 'оплачено', date: '2024-06-05', notes: 'Оплата при выдаче' },
  { id: 'pay2', orderId: 'o4', amount: 11500, method: 'наличные', status: 'оплачено', date: '2024-06-01', notes: '' },
  { id: 'pay3', orderId: 'o6', amount: 10000, method: 'перевод', status: 'частично', date: '2024-06-04', notes: 'Аванс 10 000 руб., остаток при получении' },
  { id: 'pay4', orderId: 'o1', amount: 0, method: 'карта', status: 'не оплачено', date: '', notes: '' },
];

export const mockWarranties: Warranty[] = [
  { id: 'w1', orderId: 'o2', clientId: 'c2', deviceId: 'd2', startDate: '2024-06-05', endDate: '2024-09-05', description: 'Гарантия на замену блока питания 3 месяца', status: 'активна' },
  { id: 'w2', orderId: 'o4', clientId: 'c4', deviceId: 'd5', startDate: '2024-06-01', endDate: '2025-06-01', description: 'Гарантия на замену дисплея 12 месяцев', status: 'активна' },
  { id: 'w3', orderId: 'o4', clientId: 'c1', deviceId: 'd4', startDate: '2023-10-01', endDate: '2024-04-01', description: 'Гарантия на замену клавиатуры 6 месяцев', status: 'истекла' },
];

export const mockReports: Report[] = [
  { id: 'r1', name: 'Выручка за май 2024', type: 'доходы', period: 'Май 2024', createdAt: '2024-06-01', createdBy: 'Белова Наталья Дмитриевна', data: { total: 185000, orders: 24, avgCheck: 7708 } },
  { id: 'r2', name: 'Статистика заявок Q2 2024', type: 'заявки', period: 'Q2 2024', createdAt: '2024-06-03', createdBy: 'Захарова Лидия Ивановна', data: { total: 67, completed: 54, cancelled: 3, avgTime: 4.2 } },
  { id: 'r3', name: 'Нагрузка сотрудников май', type: 'сотрудники', period: 'Май 2024', createdAt: '2024-06-01', createdBy: 'Петров Андрей Владимирович', data: { masters: 2, avgOrders: 12, topMaster: 'Кириллов М.Ю.' } },
];

export const mockRoles: Role[] = [
  { id: 'rol1', name: 'Администратор', description: 'Полный доступ ко всем функциям системы', permissions: ['all'], usersCount: 1 },
  { id: 'rol2', name: 'Мастер', description: 'Работа с заявками, устройствами, складом', permissions: ['orders', 'devices', 'parts', 'clients_read'], usersCount: 2 },
  { id: 'rol3', name: 'Менеджер', description: 'Управление клиентами, заявками, отчётами', permissions: ['orders', 'clients', 'reports_read'], usersCount: 1 },
  { id: 'rol4', name: 'Бухгалтер', description: 'Доступ к оплатам, отчётам', permissions: ['payments', 'reports'], usersCount: 1 },
  { id: 'rol5', name: 'Курьер', description: 'Просмотр заявок на доставку', permissions: ['orders_read'], usersCount: 1 },
];

export const mockSettings: Setting[] = [
  { id: 'set1', key: 'company_name', label: 'Название компании', value: 'ТехСервис Про', type: 'text', category: 'Общие' },
  { id: 'set2', key: 'company_phone', label: 'Телефон компании', value: '+7 (495) 999-88-77', type: 'text', category: 'Общие' },
  { id: 'set3', key: 'company_email', label: 'Email компании', value: 'info@techservice.ru', type: 'text', category: 'Общие' },
  { id: 'set4', key: 'warranty_default_days', label: 'Гарантия по умолчанию (дней)', value: '90', type: 'number', category: 'Заявки' },
  { id: 'set5', key: 'order_prefix', label: 'Префикс номера заявки', value: 'ЗА', type: 'text', category: 'Заявки' },
  { id: 'set6', key: 'sms_notifications', label: 'SMS-уведомления клиентам', value: 'true', type: 'boolean', category: 'Уведомления' },
  { id: 'set7', key: 'email_notifications', label: 'Email-уведомления клиентам', value: 'true', type: 'boolean', category: 'Уведомления' },
  { id: 'set8', key: 'currency', label: 'Валюта', value: 'RUB', type: 'select', category: 'Финансы', options: ['RUB', 'USD', 'EUR'] },
  { id: 'set9', key: 'tax_rate', label: 'Ставка НДС (%)', value: '20', type: 'number', category: 'Финансы' },
  { id: 'set10', key: 'working_hours', label: 'Часы работы', value: '09:00–20:00', type: 'text', category: 'Общие' },
];
