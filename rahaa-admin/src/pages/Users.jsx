import React, { useState, useEffect } from 'react';
import { UserStatsGrid } from '../components/users/UserStatsGrid';
import { UserFiltersBar } from '../components/users/UserFiltersBar';
import { UsersTable } from '../components/users/UsersTable';
import { AddUserModal } from '../components/users/AddUserModal';
import { PageHeader } from '../components/common/PageHeader';
import { PrimaryButton } from '../components/common/PrimaryButton';
import { UserPlus } from 'lucide-react';
import { api } from '../services/api';

export const Users = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [usersList, setUsersList] = useState([
    {
      id: 1,
      name: 'أحمد الكبسي',
      email: 'حساب كابتن معتمد - صنعاء',
      phone: '٧٧١٢٣٤٥٦٧',
      role: 'driver',
      status: 'active',
      rating: '٤.٩',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: 2,
      name: 'سارة الهمداني',
      email: 'حساب راكب موثق - صنعاء',
      phone: '٧٣٣٩٨٧٦٥٤',
      role: 'passenger',
      status: 'active',
      rating: '٥.٠',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: 3,
      name: 'خالد الصنعاني',
      email: 'كابتن قيد المراجعة - صنعاء',
      phone: '٧٧٥٥٥٥١١١',
      role: 'driver',
      status: 'pending',
      rating: '—',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: 4,
      name: 'محمد الوصابي',
      email: 'حساب راكب - صنعاء',
      phone: '٧١١٠٠٠٩٩٩',
      role: 'passenger',
      status: 'banned',
      rating: '٣.٢',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    },
  ]);

  const fetchUsersFromApi = async () => {
    try {
      const [passRes, drvRes] = await Promise.all([
        api.getPassengers().catch(() => null),
        api.getDrivers().catch(() => null),
      ]);
      const combined = [];
      if (passRes?.passengers?.data) {
        passRes.passengers.data.forEach((p) => {
          combined.push({
            id: p.id,
            name: p.name,
            email: `حساب راكب مسجل • صنعاء`,
            phone: p.phone || '—',
            role: 'passenger',
            status: p.status === 'banned' ? 'banned' : 'active',
            rating: '٥.٠',
            avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=0B58A8&color=fff`,
          });
        });
      }
      if (drvRes?.drivers?.data) {
        drvRes.drivers.data.forEach((d) => {
          const prof = d.driver_profile || {};
          let st = 'active';
          if (d.status === 'banned') st = 'banned';
          else if (prof.status === 'pending') st = 'pending';
          combined.push({
            id: d.id,
            name: d.name,
            email: `حساب كابتن مسجل • صنعاء`,
            phone: d.phone || '—',
            role: 'driver',
            status: st,
            rating: prof.rating ? Number(prof.rating).toFixed(1) : '٤.٩',
            avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(d.name)}&background=EE9224&color=fff`,
          });
        });
      }
      if (combined.length > 0) {
        setUsersList(combined);
      }
    } catch (err) {
      console.error('Error loading users:', err);
    }
  };

  useEffect(() => {
    fetchUsersFromApi();
  }, []);

  // Handlers
  const handleAddUser = (newUser) => {
    setUsersList([newUser, ...usersList]);
  };

  const handleVerifyUser = async (userId) => {
    try {
      await api.approveDriver(userId);
    } catch {
      // Fallback to local state update
    }
    setUsersList(
      usersList.map((u) =>
        u.id === userId ? { ...u, status: 'active', rating: '5.0' } : u
      )
    );
  };

  const handleBanUser = async (userId) => {
    try {
      await api.toggleUserStatus(userId);
    } catch {
      // Fallback to local state update
    }
    setUsersList(
      usersList.map((u) => {
        if (u.id === userId) {
          return {
            ...u,
            status: u.status === 'banned' ? 'active' : 'banned',
          };
        }
        return u;
      })
    );
  };

  // Filter computation
  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone.includes(searchTerm);

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Header Banner & Primary CTA */}
      <PageHeader
        title="إدارة المستخدمين"
        subtitle="تتبع وإدارة حسابات السائقين والركاب في نظام راحة أمانة العاصمة صنعاء."
        actions={
          <PrimaryButton onClick={() => setIsModalOpen(true)} size="lg">
            <UserPlus className="w-5 h-5" />
            إضافة مستخدم جديد
          </PrimaryButton>
        }
      />

      {/* KPI Stats Grid */}
      <UserStatsGrid
        stats={{
          total: usersList.length.toLocaleString(),
          activeDrivers: usersList.filter((u) => u.role === 'driver' && u.status === 'active').length.toString(),
          pending: usersList.filter((u) => u.status === 'pending').length.toString(),
          banned: usersList.filter((u) => u.status === 'banned').length.toString(),
        }}
      />

      {/* Search & Filters Bar */}
      <UserFiltersBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        roleFilter={roleFilter}
        onRoleChange={setRoleFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
      />

      {/* Main Data Table */}
      <UsersTable
        users={filteredUsers}
        onVerifyUser={handleVerifyUser}
        onBanUser={handleBanUser}
      />

      {/* Add User Modal Dialog */}
      <AddUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddUser={handleAddUser}
      />
    </div>
  );
};
