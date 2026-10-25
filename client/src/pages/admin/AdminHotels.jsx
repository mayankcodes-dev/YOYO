import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const AdminHotels = () => {
  const { axios } = useAppContext();
  const [hotels,  setHotels]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/admin/hotels')
      .then(({ data }) => { if (data.success) setHotels(data.hotels); })
      .catch(() => toast.error('Failed to load hotels'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <Helmet><title>Manage Hotels — YoYo Admin</title></Helmet>
      <h1 className="text-2xl font-bold font-display mb-6" style={{ color: 'var(--color-text-primary)' }}>Hotels ({hotels.length})</h1>

      {loading ? (
        <div className="flex flex-col gap-3">{[1,2,3].map(i => <div key={i} className="skeleton h-14 rounded-xl" />)}</div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--color-surface-2)', boxShadow: 'var(--shadow-md)' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--color-surface-3)' }}>
                  {['Hotel Name', 'City', 'Address', 'Contact', 'Owner ID', 'Registered'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {hotels.map((h, i) => (
                  <tr key={h._id} className="border-t" style={{ borderColor: 'var(--color-border)', background: i % 2 ? 'var(--color-surface-3)' : 'transparent' }}>
                    <td className="px-4 py-3 font-semibold" style={{ color: 'var(--color-text-primary)' }}>{h.name}</td>
                    <td className="px-4 py-3" style={{ color: 'var(--color-text-secondary)' }}>{h.city}</td>
                    <td className="px-4 py-3 text-xs max-w-[180px] truncate" style={{ color: 'var(--color-text-muted)' }}>{h.address}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--color-text-muted)' }}>{h.contact}</td>
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--color-text-muted)' }}>{h.owner?.slice(0,10)}…</td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--color-text-muted)' }}>{new Date(h.createdAt).toLocaleDateString('en-IN')}</td>
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

export default AdminHotels;
