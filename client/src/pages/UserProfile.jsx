import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

const TabBtn = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className="px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200"
    style={{
      background: active ? 'var(--color-primary)' : 'transparent',
      color: active ? '#fff' : 'var(--color-text-secondary)',
      border: active ? 'none' : '1px solid var(--color-border)',
    }}
  >
    {children}
  </button>
);

const InputField = ({ label, type = 'text', value, onChange, placeholder, readOnly }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      readOnly={readOnly}
      className="px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200 border"
      style={{
        background: readOnly ? 'var(--color-surface-3)' : 'var(--color-surface-2)',
        borderColor: 'var(--color-border)',
        color: 'var(--color-text-primary)',
        cursor: readOnly ? 'not-allowed' : 'text',
      }}
      onFocus={e => { if (!readOnly) e.target.style.borderColor = 'var(--color-primary)'; }}
      onBlur={e => { e.target.style.borderColor = 'var(--color-border)'; }}
    />
  </div>
);

const UserProfile = () => {
  const { user, axios, updateUser, navigate, wishlist } = useAppContext();
  const [tab, setTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    username: user?.username || '',
    phone:    user?.phone    || '',
  });
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [preview, setPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const fileRef = useRef();

  const location = useLocation();

  if (!user) { navigate('/login', { state: { from: location.pathname } }); return null; }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('username', form.username);
      fd.append('phone', form.phone);
      if (avatarFile) fd.append('image', avatarFile);

      const { data } = await axios.patch('/api/user/profile', fd);
      if (data.success) {
        updateUser(data.user);
        toast.success('✅ Profile updated');
        setPreview(null); setAvatarFile(null);
      } else toast.error(data.message);
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const avatarSrc = preview || user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=E8003D&color=fff&size=128`;

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 md:px-16 lg:px-32" style={{ background: 'var(--color-surface)' }}>
      <Helmet>
        <title>My Profile — YoYo Rooms</title>
        <meta name="description" content="Manage your YoYo Rooms profile, wishlist, and account settings." />
      </Helmet>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="relative group cursor-pointer" onClick={() => fileRef.current?.click()}>
            <img src={avatarSrc} alt="avatar" className="w-20 h-20 rounded-full object-cover border-4" style={{ borderColor: 'var(--color-primary)' }} />
            <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-display" style={{ color: 'var(--color-text-primary)' }}>{user.username}</h1>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{user.email}</p>
            <span className="inline-block mt-1 text-xs font-bold px-2.5 py-0.5 rounded-full capitalize"
              style={{ background: user.role === 'hotelOwner' ? '#DCFCE7' : '#EDE9FE', color: user.role === 'hotelOwner' ? '#16A34A' : '#7C3AED' }}>
              {user.role}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 flex-wrap">
          <TabBtn active={tab === 'profile'} onClick={() => setTab('profile')}>Profile</TabBtn>
          <TabBtn active={tab === 'wishlist'} onClick={() => setTab('wishlist')}>Saved ({wishlist.length})</TabBtn>
        </div>

        {/* Profile Tab */}
        {tab === 'profile' && (
          <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleSaveProfile}
            className="rounded-2xl p-6 flex flex-col gap-5"
            style={{ background: 'var(--color-surface-2)', boxShadow: 'var(--shadow-md)' }}>
            <h2 className="font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>Personal Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField label="Full Name" value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value }))} placeholder="Your name" />
              <InputField label="Phone Number" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+91 9876543210" />
              <InputField label="Email" value={user.email} readOnly />
              <InputField label="Account Type" value={user.role} readOnly />
            </div>
            {avatarFile && (
              <p className="text-xs" style={{ color: 'var(--color-primary)' }}>📷 New photo selected — save to upload</p>
            )}
            <button type="submit" disabled={saving}
              className="btn-primary self-start mt-2 disabled:opacity-60 disabled:cursor-not-allowed">
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </motion.form>
        )}

        {/* Wishlist Tab */}
        {tab === 'wishlist' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {wishlist.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-4xl mb-3">🤍</p>
                <p className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>No saved rooms yet</p>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Tap the ♥ on any hotel card to save it here</p>
                <button onClick={() => navigate('/rooms')} className="btn-primary mt-4">Browse Hotels</button>
              </div>
            ) : (
              <div>
                <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>{wishlist.length} saved room{wishlist.length > 1 ? 's' : ''}</p>
                <p style={{ color: 'var(--color-text-muted)' }} className="text-sm">Saved room IDs: view them by browsing hotels and clicking the heart.</p>
                <button onClick={() => navigate('/rooms')} className="btn-primary mt-4">Browse Hotels</button>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default UserProfile;
