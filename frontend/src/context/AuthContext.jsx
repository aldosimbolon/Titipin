import { createContext, useContext, useState, useEffect } from 'react';
import { request, getToken, setToken, clearToken } from '../data/api';
import Store from '../data/store';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Saat app dibuka: kalau ada token tersimpan, validasi ke server (GET /auth/me)
  useEffect(() => {
    const restore = async () => {
      if (getToken()) {
        try {
          const data = await request('/auth/me');
          setUser(data.user);
        } catch {
          clearToken();
        }
      }
      setLoading(false);
    };
    restore();
  }, []);

  const login = async (email, password) => {
    try {
      const data = await request('/auth/login', { method: 'POST', body: { email, password } });
      setToken(data.token);
      setUser(data.user);
      return { success: true, user: data.user };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  const register = async (form) => {
    try {
      const data = await request('/auth/register', {
        method: 'POST',
        body: { name: form.name, email: form.email, password: form.password, phone: form.phone || '' },
      });
      setToken(data.token);

      // Alamat awal (kalau diisi saat registrasi) disimpan sebagai alamat default
      let finalUser = data.user;
      if (form.address) {
        finalUser = await Store.updateUserProfile(data.user.id, {
          addresses: [{
            label: 'Utama',
            recipient: form.name,
            phone: form.phone || '',
            address: form.address,
            city: form.city || '',
            province: form.province || '',
            postalCode: form.postalCode || '',
            isDefault: true,
          }],
        });
      }
      setUser(finalUser);
      return { success: true, user: finalUser };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  const logout = () => {
    clearToken();
    setUser(null);
  };

  // updates: { name, phone, npwp, addresses, password, currentPassword }
  const updateProfile = async (updates) => {
    if (!user) return null;
    const updated = await Store.updateUserProfile(user.id, updates);
    setUser(updated);
    return updated;
  };

  const refreshUser = async () => {
    if (!user) return;
    try {
      const data = await request('/auth/me');
      setUser(data.user);
    } catch { /* abaikan */ }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        updateProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthContext;
