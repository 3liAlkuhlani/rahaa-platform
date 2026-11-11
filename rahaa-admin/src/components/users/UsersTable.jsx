import React from 'react';
import { Star, ShieldCheck, CheckCircle2, Ban, Edit3, Trash2, MoreVertical } from 'lucide-react';

export const UsersTable = ({ users, onVerifyUser, onBanUser }) => {
  return (
    <div className="bg-white rounded-2xl border border-rahaa-border/80 shadow-rahaa-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-rahaa-blue-soft border-b border-rahaa-border/60 text-xs font-cairo font-semibold text-rahaa-text-muted">
              <th className="py-4 px-5">المستخدم</th>
              <th className="py-4 px-4">النوع</th>
              <th className="py-4 px-4">رقم الهاتف</th>
              <th className="py-4 px-4">التقييم</th>
              <th className="py-4 px-4">الحالة</th>
              <th className="py-4 px-5 text-center">الإجراءات</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-rahaa-border/40 font-tajawal text-sm">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-rahaa-bg/80 transition-colors group">
                {/* User Info (Avatar, Name, Email) */}
                <td className="py-4 px-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full border border-rahaa-border/80 bg-rahaa-blue-light text-rahaa-blue font-cairo font-bold flex items-center justify-center text-sm shadow-sm overflow-hidden flex-shrink-0">
                      {u.avatarUrl ? (
                        <img src={u.avatarUrl} alt={u.name} className="w-full h-full object-cover" />
                      ) : (
                        <span>{u.name.charAt(0)}</span>
                      )}
                    </div>

                    <div className="flex flex-col">
                      <span className="font-cairo font-semibold text-rahaa-navy text-sm">
                        {u.name}
                      </span>
                      <span className="font-tajawal text-xs text-rahaa-text-muted">
                        {u.email}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Role Pill */}
                <td className="py-4 px-4">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-tajawal font-bold ${
                      u.role === 'driver'
                        ? 'bg-emerald-100/80 text-rahaa-emerald border border-emerald-200'
                        : 'bg-rahaa-blue-light text-rahaa-blue border border-rahaa-blue/20'
                    }`}
                  >
                    {u.role === 'driver' ? 'سائق' : 'راكب'}
                  </span>
                </td>

                {/* Phone Number */}
                <td className="py-4 px-4 font-tajawal text-rahaa-navy font-medium text-right">
                  {u.phone}
                </td>

                {/* Rating */}
                <td className="py-4 px-4">
                  <div className="flex items-center gap-1.5 font-cairo font-semibold text-xs text-rahaa-navy">
                    {u.rating !== '-.-' ? (
                      <>
                        <Star className="w-4 h-4 fill-rahaa-amber text-rahaa-amber" />
                        <span>{u.rating}</span>
                      </>
                    ) : (
                      <span className="text-rahaa-text-subtle">{u.rating}</span>
                    )}
                  </div>
                </td>

                {/* Status Indicator */}
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2 font-cairo font-semibold text-xs">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        u.status === 'active'
                          ? 'bg-rahaa-emerald'
                          : u.status === 'pending'
                          ? 'bg-rahaa-amber animate-pulse'
                          : 'bg-rahaa-rose'
                      }`}
                    />
                    <span
                      className={
                        u.status === 'active'
                          ? 'text-rahaa-emerald'
                          : u.status === 'pending'
                          ? 'text-rahaa-amber'
                          : 'text-rahaa-rose'
                      }
                    >
                      {u.status === 'active'
                        ? 'نشط'
                        : u.status === 'pending'
                        ? 'قيد التحقق'
                        : 'محظور'}
                    </span>
                  </div>
                </td>

                {/* Actions Cell */}
                <td className="py-4 px-5 text-center">
                  <div className="flex items-center justify-center gap-2">
                    {u.status === 'pending' && (
                      <button
                        onClick={() => onVerifyUser(u.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rahaa-blue text-white text-xs font-cairo font-semibold hover:bg-rahaa-blue-hover shadow-sm transition-colors"
                        title="الموافقة والتحقق"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>تحقق</span>
                      </button>
                    )}

                    <button
                      className="p-1.5 rounded-lg text-rahaa-text-subtle hover:text-rahaa-blue hover:bg-rahaa-blue-light transition-colors"
                      title="تعديل الحساب"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onBanUser(u.id)}
                      className="p-1.5 rounded-lg text-rahaa-text-subtle hover:text-rahaa-rose hover:bg-rose-50 transition-colors"
                      title={u.status === 'banned' ? 'إلغاء الحظر' : 'حظر المستخدم'}
                    >
                      <Ban className="w-4 h-4" />
                    </button>

                    <button
                      className="p-1.5 rounded-lg text-rahaa-text-subtle hover:text-rahaa-navy hover:bg-rahaa-bg transition-colors"
                      title="خيارات إضافية"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Table Pagination Footer */}
      <div className="p-4 border-t border-rahaa-border/60 bg-rahaa-bg/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-tajawal text-rahaa-text-subtle">
        <span>عرض 1-{users.length} من أصل 12,480 مستخدم في صنعاء</span>

        <div className="flex items-center gap-1.5">
          <button className="w-8 h-8 rounded-lg bg-rahaa-blue text-white font-cairo font-bold flex items-center justify-center shadow-sm">
            1
          </button>
          <button className="w-8 h-8 rounded-lg bg-white border border-rahaa-border text-rahaa-navy hover:bg-rahaa-blue-light font-cairo font-medium flex items-center justify-center">
            2
          </button>
          <button className="w-8 h-8 rounded-lg bg-white border border-rahaa-border text-rahaa-navy hover:bg-rahaa-blue-light font-cairo font-medium flex items-center justify-center">
            3
          </button>
          <span className="px-1 text-rahaa-text-subtle font-cairo">...</span>
          <button className="w-8 h-8 rounded-lg bg-white border border-rahaa-border text-rahaa-navy hover:bg-rahaa-blue-light font-cairo font-medium flex items-center justify-center">
            25
          </button>
        </div>
      </div>
    </div>
  );
};
