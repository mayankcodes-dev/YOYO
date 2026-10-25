import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { GoogleOAuthProvider } from '@react-oauth/google';

// H-1 FIX: VITE_ prefix removed — env vars are now injected at runtime via
// Vercel environment variables (not baked into the bundle at build time).
// VITE_GOOGLE_CLIENT_ID → GOOGLE_CLIENT_ID in Vercel project settings.
createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId={import.meta.env.GOOGLE_CLIENT_ID || ''}>
    <BrowserRouter>
      <AppProvider>
        <App />
      </AppProvider>
    </BrowserRouter>
  </GoogleOAuthProvider>
);
