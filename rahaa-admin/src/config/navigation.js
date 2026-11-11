import {
  LayoutDashboard,
  Car,
  Users,
  UserCheck,
  BarChart3,
  Settings,
  HelpCircle,
  ShieldCheck,
  Truck,
} from 'lucide-react';

export const navItems = [
  {
    id: 'dashboard',
    title: 'الرئيسية',
    path: '/admin',
    icon: LayoutDashboard,
    badge: null,
  },
  {
    id: 'transport',
    title: 'منظومة النقل والتأجير',
    path: '/admin/transport',
    icon: Truck,
    badge: 'جديد',
  },
  {
    id: 'trips',
    title: 'إدارة الرحلات',
    path: '/admin/trips',
    icon: Car,
    badge: null,
  },
  {
    id: 'drivers',
    title: 'إدارة السائقين',
    path: '/admin/drivers',
    icon: UserCheck,
    badge: null,
  },
  {
    id: 'users',
    title: 'المستخدمين',
    path: '/admin/users',
    icon: Users,
    badge: null,
  },
  {
    id: 'analytics',
    title: 'المالية والتقارير',
    path: '/admin/analytics',
    icon: BarChart3,
    badge: null,
  },
  {
    id: 'settings',
    title: 'إعدادات النظام',
    path: '/admin/settings',
    icon: Settings,
    badge: null,
  },
];

export const secondaryNavItems = [
  {
    id: 'help',
    title: 'الدعم والمساعدة',
    path: '/admin/help',
    icon: HelpCircle,
  },
  {
    id: 'security',
    title: 'الأمان والخصوصية',
    path: '/admin/security',
    icon: ShieldCheck,
  },
];
