import { createContext, useContext, useState, useEffect } from 'react';
import Store from '../data/store';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = Store.getSession();
    if (session) {
      const userData = Store.getUserById(session.userId);
      if (userData) {
        setUser(userData);
      } else {
        Store.clearSession();
      }
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    const userData = Store.getUserByEmail(email);
    if (!userData) return { success: false, error: 'Email tidak ditemukan' };
    if (userData.password !== password) return { success: false, error: 'Password salah' };
    if (!userData.isActive) return { success: false, error: 'Akun tidak aktif' };

    Store.setSession({ userId: userData.id, role: userData.role });
    setUser(userData);
    return { success: true, user: userData };
  };

  const register = (data) => {
    if (Store.getUserByEmail(data.email)) {
      return { success: false, error: 'Email sudah terdaftar' };
    }

    const newUser = {
      id: 'user' + Date.now().toString(36),
      name: data.name,
      email: data.email,
      password: data.password,
      phone: data.phone || '',
      role: 'customer',
      avatar: null,
      npwp: '',
      addresses: data.address
        ? [
            {
              id: 'addr' + Date.now().toString(36),
              label: 'Utama',
              recipient: data.name,
              phone: data.phone || '',
              address: data.address,
              city: data.city || '',
              province: data.province || '',
              postalCode: data.postalCode || '',
              isDefault: true,
            },
          ]
        : [],
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    Store.addUser(newUser);
    Store.setSession({ userId: newUser.id, role: newUser.role });
    setUser(newUser);
    return { success: true, user: newUser };
  };

  const logout = () => {
    Store.clearSession();
    setUser(null);
  };

  const updateProfile = (updates) => {
    if (!user) return;
    const updated = Store.updateUser(user.id, updates);
    if (updated) setUser(updated);
    return updated;
  };

  const refreshUser = () => {
    if (!user) return;
    const updated = Store.getUserById(user.id);
    if (updated) setUser(updated);
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
