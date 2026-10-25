import React from 'react';
import { assets } from '../../assets/assets';
import toast from 'react-hot-toast';
import { useAppContext } from '../../context/AppContext';

const amenityList = ['Free Wi-Fi', 'Free Breakfast', 'Room Service', 'Mountain View', 'Pool Access'];
const roomCategories = ['Budget', 'Premium', 'Luxury', 'Villa', 'Business'];
const roomTypes = ['Single Bed', 'Double Bed', 'Family Suite', 'Luxury Suite', 'Mountain View Cottage', 'Heritage Suite', 'Business Suite'];

const AddRoom = () => {
  const { axios, getToken } = useAppContext();

  const [images, setImages] = React.useState({ 1: null, 2: null, 3: null, 4: null, 5: null });
  const [previews, setPreviews] = React.useState({ 1: null, 2: null, 3: null, 4: null, 5: null });

  // Revoke old object URLs on unmount to prevent memory leaks
  React.useEffect(() => {
    return () => { Object.values(previews).forEach(url => url && URL.revokeObjectURL(url)); };
  }, []);
  const [inputs, setInputs] = React.useState({
    roomType: '',
    pricePerNight: '',
    category: 'Budget',
    amenities: Object.fromEntries(amenityList.map(a => [a, false])),
  });
  const [loading, setLoading] = React.useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!inputs.roomType || !inputs.pricePerNight || !Object.values(images).some(Boolean)) {
      toast.error('Please fill all details and upload at least one image');
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('roomType',      inputs.roomType);
      fd.append('pricePerNight', inputs.pricePerNight);
      fd.append('category',      inputs.category);
      fd.append('amenities',     JSON.stringify(Object.keys(inputs.amenities).filter(k => inputs.amenities[k])));
      Object.values(images).filter(Boolean).forEach(img => fd.append('images', img));

      const { data } = await axios.post('/api/rooms/', fd, {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });

      if (data?.success) {
        toast.success(data.message);
        setInputs({ roomType: '', pricePerNight: '', category: 'Budget', amenities: Object.fromEntries(amenityList.map(a => [a, false])) });
        setImages({ 1: null, 2: null, 3: null, 4: null, 5: null });
          setPreviews({ 1: null, 2: null, 3: null, 4: null, 5: null });
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputCls = `w-full rounded-xl border px-3 py-2.5 text-sm font-medium outline-none transition-all duration-200 focus:ring-2`;
  const inputStyle = { background: "var(--color-surface)", borderColor: "var(--color-border)", color: "var(--color-text-primary)" };

  return (
    <form onSubmit={onSubmit} className="max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#E8003D" }}>Hotel Owner</p>
        <h1 className="font-display text-2xl md:text-3xl font-extrabold" style={{ color: "var(--color-text-primary)" }}>
          Add New Room
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
          Fill in accurate details, pricing, and amenities to enhance the booking experience.
        </p>
      </div>

      {/* Image upload grid */}
      <div className="mb-7">
        <label className="block text-sm font-bold mb-3" style={{ color: "var(--color-text-primary)" }}>
          Room Photos <span className="text-[11px] font-normal ml-1" style={{ color: "var(--color-text-muted)" }}>(up to 5)</span><span style={{ color: "#E8003D" }}>*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {Object.keys(images).map((key) => (
            <label
              key={key}
              htmlFor={`roomImg${key}`}
              className="relative flex items-center justify-center rounded-xl border-2 border-dashed aspect-square cursor-pointer transition-all duration-200 group overflow-hidden"
              style={{ borderColor: images[key] ? "#E8003D" : "var(--color-border)", background: "var(--color-surface-3)" }}
            >
              {previews[key] ? (
                <img src={previews[key]} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-1 text-center p-2">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6" style={{ color: "var(--color-text-muted)" }}>
                    <path d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/>
                  </svg>
                  <span className="text-[10px]" style={{ color: "var(--color-text-muted)" }}>Upload</span>
                </div>
              )}
              <input type="file" accept="image/*" id={`roomImg${key}`} hidden
                onChange={e => {
                  const file = e.target.files[0];
                  if (!file) return;
                  // Revoke previous URL for this slot
                  if (previews[key]) URL.revokeObjectURL(previews[key]);
                  const url = URL.createObjectURL(file);
                  setImages(prev => ({ ...prev, [key]: file }));
                  setPreviews(prev => ({ ...prev, [key]: url }));
                }} />
            </label>
          ))}
        </div>
      </div>

      {/* Room type + category + price */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-bold mb-1.5" style={{ color: "var(--color-text-primary)" }}>Room Type</label>
          <select value={inputs.roomType} onChange={e => setInputs({ ...inputs, roomType: e.target.value })}
            className={inputCls} style={inputStyle}>
            <option value="">Select type</option>
            {roomTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold mb-1.5" style={{ color: "var(--color-text-primary)" }}>Category</label>
          <select value={inputs.category} onChange={e => setInputs({ ...inputs, category: e.target.value })}
            className={inputCls} style={inputStyle}>
            {roomCategories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold mb-1.5" style={{ color: "var(--color-text-primary)" }}>Price / Night (₹)</label>
          <input type="number" min={0} placeholder="e.g. 2499"
            value={inputs.pricePerNight}
            onChange={e => setInputs({ ...inputs, pricePerNight: e.target.value })}
            className={inputCls} style={inputStyle} />
        </div>
      </div>

      {/* Amenities */}
      <div className="mb-8">
        <label className="block text-sm font-bold mb-3" style={{ color: "var(--color-text-primary)" }}>Amenities</label>
        <div className="flex flex-wrap gap-3">
          {amenityList.map((amenity) => {
            const checked = inputs.amenities[amenity];
            return (
              <button
                key={amenity}
                type="button"
                onClick={() => setInputs({ ...inputs, amenities: { ...inputs.amenities, [amenity]: !checked } })}
                className="px-3 py-1.5 rounded-full text-sm font-semibold border transition-all duration-200"
                style={checked
                  ? { background: "#E8003D", borderColor: "#E8003D", color: "white" }
                  : { background: "var(--color-surface)", borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }
                }
              >
                {amenity}
              </button>
            );
          })}
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="flex items-center gap-2 px-7 py-3 rounded-xl font-bold text-sm text-white transition-all duration-200 disabled:opacity-60 hover:-translate-y-0.5"
        style={{ background: "linear-gradient(135deg,#E8003D 0%,#C0002E 100%)", boxShadow: "0 6px 20px rgba(232,0,61,0.40)" }}
      >
        {loading ? (
          <>
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
              <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
            </svg>
            Uploading…
          </>
        ) : 'Add Room →'}
      </button>
    </form>
  );
};

export default AddRoom;
