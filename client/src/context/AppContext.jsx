import axios from "axios";
import { createContext, useState, useContext, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

const AppContext = createContext();

const TOKEN_KEY = 'yoyo_token';
const USER_KEY  = 'yoyo_user';

export const AppProvider = ({ children }) => {
  const currency = import.meta.env.VITE_CURRENCY || "₹";
  const navigate  = useNavigate();

  // ── Auth state ──────────────────────────────────────────────
  const [user,  setUser]  = useState(() => {
    try { return JSON.parse(localStorage.getItem(USER_KEY)) || null; } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || null);

  const [isOwner,       setIsOwner]       = useState(false);
  const [showHotelReg,  setShowHotelReg]  = useState(false);
  const [searchedCities,setSearchedCities]= useState([]);
  const [rooms,         setRooms]         = useState([]);

  // ── Axios auth header ───────────────────────────────────────
  useEffect(() => {
    if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    else delete axios.defaults.headers.common['Authorization'];
  }, [token]);

  // ── Dark mode ───────────────────────────────────────────────
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("yoyo-theme");
    if (saved) return saved === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) { root.classList.add("dark");    localStorage.setItem("yoyo-theme", "dark"); }
    else          { root.classList.remove("dark"); localStorage.setItem("yoyo-theme", "light"); }
  }, [darkMode]);

  const toggleDarkMode = useCallback(() => setDarkMode(d => !d), []);

  // ── Auth helpers ─────────────────────────────────────────────
  const saveSession = (newToken, newUser) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY,  JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    setIsOwner(newUser.role === 'hotelOwner');
  };

  const register = async (username, email, password) => {
    const { data } = await axios.post('/api/auth/register', { username, email, password });
    if (data.success) { saveSession(data.token, data.user); return data; }
    throw new Error(data.message);
  };

  const login = async (email, password) => {
    const { data } = await axios.post('/api/auth/login', { email, password });
    if (data.success) { saveSession(data.token, data.user); return data; }
    throw new Error(data.message);
  };

  const googleLogin = async (credential, prefetchedData = null) => {
    // If we already have the server response (implicit flow), just save it
    if (prefetchedData) {
      saveSession(prefetchedData.token, prefetchedData.user);
      return prefetchedData;
    }
    // ID token flow
    const { data } = await axios.post('/api/auth/google', { credential });
    if (data.success) { saveSession(data.token, data.user); return data; }
    throw new Error(data.message);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
    setIsOwner(false);
    delete axios.defaults.headers.common['Authorization'];
    navigate('/');
    toast.success('Signed out');
  };

  // ── Sync user data from server ───────────────────────────────
  const fetchUser = useCallback(async () => {
    if (!token) return;
    try {
      const { data } = await axios.get('/api/user');
      if (data.success) {
        setIsOwner(data.role === 'hotelOwner');
        setSearchedCities(data.recentSearchedCities || []);
      }
    } catch { /* silent */ }
  }, [token]);

  useEffect(() => { if (user) fetchUser(); }, [user?.id]);

  // ── Rooms ───────────────────────────────────────────────────
  const fetchRooms = async () => {
    try {
      const { data } = await axios.get('/api/rooms');
      if (data.success) setRooms(data.rooms);
      else toast.error(data.message);
    } catch (err) { toast.error(err.message); }
  };

  useEffect(() => { fetchRooms(); }, []);

  const value = {
    currency, navigate,
    user, token, isOwner, setIsOwner,
    login, logout, register, googleLogin,
    showHotelReg, setShowHotelReg,
    searchedCities, setSearchedCities,
    rooms, setRooms, fetchRooms,
    darkMode, toggleDarkMode,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);