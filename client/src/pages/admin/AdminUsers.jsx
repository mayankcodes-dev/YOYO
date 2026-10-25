import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const { axios } = useAppContext();
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = () => {
    axios.get('/api/admin/users')
      .then(({ data }) => { if (data.success) setUsers(data.users); })
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  };

  const changeRole = async (userId, role) => {
    try {
      const { data } = await axios.patch(`/api/admin/users/${userId}`, { role });
      if (data.success) { toast.success('Role updated'); fetchUsers(); }
      else toast.error(data.message);
    } catch { toast.error('Failed to update role'); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const roleColor = r => r === 'admin' ? '#DC2626' : r === 'hotelOwner' ? '#7C3AED' : '#4A4A6A';
  const roleBg    = r => r === 'admin' ? '#FEE2E2' : r === 'hotelOwner' ? '#EDE9FE' : 'var(--color-surface-3)';

  return (
    <div>
      <Helmet><title>Manage Users — YoYo Admin</title></Helmet>
      <h1 className="text-2xl font-bold font-display mb-6" style={{ color: 'var(--color-text-primary)' }}>Users ({users.length})</h1>

      {loading ? (
        <div className="flex flex-col gap-3">{[1,2,3].map(i => <div key={i} className="skeleton h-14 rounded-xl" />)}</div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--color-surface-2)', boxShadow: 'var(--shadow-md)' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--color-surface-3)' }}>
                  {['User', 'Email', 'Role', 'Joined', 'Change Role'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u._id} className="border-t" style={{ borderColor: 'var(--color-border)', background: i % 2 ? 'var(--color-surface-3)' : 'transparent' }}>
                    <td className="px-4 py-3 flex items-center gap-2">
                      <img src={u.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.username)}&size=32&background=E8003D&color=fff`} alt="" className="w-8 h-8 rounded-full object-cover" />
                      <span style={{ color: 'var(--color-text-primary)' }}>{u.username}</span>
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--color-text-secondary)' }}>{u.email}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-bold px-2 py-1 rounded-full capitalize" style={{ background: roleBg(u.role), color: roleColor(u.role) }}>{u.role}</span>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--color-text-muted)' }}>{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                    <td className="px-4 py-3">
                      <select className="text-xs px-2 py-1 rounded-lg border outline-none"
                        style={{ background: 'var(--color-surface-3)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                        value={u.role}
                        onChange={e => changeRole(u._id, e.target.value)}>
                        <option value="user">user</option>
                        <option value="hotelOwner">hotelOwner</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
