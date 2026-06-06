import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAppContext } from '../../context/AppContext';
import { optimiseImage } from '../../utils/cloudinary';

const ListRoom = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const { axios, getToken, user, currency } = useAppContext();

  const fetchRooms = async () => {
    try {
      const { data } = await axios.get('/api/rooms/owner', {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });
      if (data.success) setRooms(data.rooms);
      else toast.error(data.message);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async (roomId) => {
    try {
      const { data } = await axios.post('/api/rooms/toggle-availability', { roomId }, {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });
      if (data.success) { toast.success(data.message); fetchRooms(); }
      else toast.error(data.message);
    } catch (e) {
      toast.error(e.message);
    }
  };

  useEffect(() => { user && fetchRooms(); }, [user]);

  const categoryColors = {
    Budget:   { bg: "rgba(59,130,246,0.10)", text: "#3B82F6" },
    Premium:  { bg: "rgba(139,92,246,0.10)", text: "#8B5CF6" },
    Luxury:   { bg: "rgba(245,158,11,0.12)", text: "#F59E0B" },
    Villa:    { bg: "rgba(16,185,129,0.10)", text: "#10B981" },
    Business: { bg: "rgba(232,0,61,0.10)",   text: "#E8003D" },
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#E8003D" }}>Hotel Owner</p>
        <h1 className="font-display text-2xl md:text-3xl font-extrabold" style={{ color: "var(--color-text-primary)" }}>
          Room Listings
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
          Manage all your listed rooms — toggle availability, view pricing and amenities.
        </p>
      </div>

      {/* Room count badge */}
      <div className="flex items-center gap-3 mb-5">
        <span className="text-sm font-semibold" style={{ color: "var(--color-text-secondary)" }}>
          {rooms.length} room{rooms.length !== 1 ? 's' : ''} listed
        </span>
        <span
          className="px-2.5 py-0.5 rounded-full text-xs font-bold"
          style={{ background: "rgba(232,0,61,0.10)", color: "#E8003D" }}
        >
          {rooms.filter(r => r.isAvailable).length} Available
        </span>
      </div>

      {/* Table */}
      <div
        className="rounded-2xl overflow-hidden border"
        style={{ borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr style={{ background: "var(--color-surface-3)" }}>
                {["Room", "Category", "Amenities", "Price/Night", "Available"].map(h => (
                  <th key={h} className="py-3 px-4 text-left text-xs font-bold uppercase tracking-wider"
                    style={{ color: "var(--color-text-muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="border-t" style={{ borderColor: "var(--color-border)" }}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <td key={j} className="py-3 px-4">
                          <div className="skeleton h-4 w-20 rounded" />
                        </td>
                      ))}
                    </tr>
                  ))
                : rooms.length === 0
                  ? (
                      <tr>
                        <td colSpan={5} className="py-14 text-center" style={{ color: "var(--color-text-muted)" }}>
                          <div className="text-3xl mb-2">🏨</div>
                          <p className="font-semibold">No rooms added yet</p>
                          <p className="text-xs mt-1">Go to Add Room to get started.</p>
                        </td>
                      </tr>
                    )
                  : rooms.map((room, i) => {
                      const cat = categoryColors[room.category] || categoryColors.Budget;
                      return (
                        <tr key={i} className="border-t group transition-colors"
                          style={{ borderColor: "var(--color-border)" }}>

                          {/* Room name + thumbnail */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={optimiseImage(room.images?.[0], 80)}
                                alt={room.roomType}
                                className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                              />
                              <span className="font-semibold" style={{ color: "var(--color-text-primary)" }}>
                                {room.roomType}
                              </span>
                            </div>
                          </td>

                          {/* Category badge */}
                          <td className="py-3 px-4">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold"
                              style={{ background: cat.bg, color: cat.text }}>
                              {room.category || 'Budget'}
                            </span>
                          </td>

                          {/* Amenities */}
                          <td className="py-3 px-4 max-w-[200px]">
                            <p className="truncate text-xs" style={{ color: "var(--color-text-secondary)" }}>
                              {(room.amenities || []).join(' · ') || '—'}
                            </p>
                          </td>

                          {/* Price */}
                          <td className="py-3 px-4 font-bold" style={{ color: "var(--color-primary)" }}>
                            {currency}{room.pricePerNight?.toLocaleString('en-IN')}
                          </td>

                          {/* Toggle switch */}
                          <td className="py-3 px-4">
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={room.isAvailable}
                                onChange={() => toggleAvailability(room._id)}
                              />
                              <div
                                className="w-11 h-6 rounded-full peer transition-colors duration-200 peer-checked:bg-[#E8003D]"
                                style={{ background: room.isAvailable ? "#E8003D" : "var(--color-surface-3)" }}
                              />
                              <span
                                className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 peer-checked:translate-x-5"
                                style={{ transform: room.isAvailable ? 'translateX(20px)' : 'translateX(0)' }}
                              />
                            </label>
                          </td>
                        </tr>
                      );
                    })
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ListRoom;
