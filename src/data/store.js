// localStorage CRUD wrapper for TitipIn

const PREFIX = 'titipin_';

const Store = {
  get(key) {
    try {
      const data = localStorage.getItem(PREFIX + key);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },

  remove(key) {
    localStorage.removeItem(PREFIX + key);
  },

  // Users
  getUsers() {
    return this.get('users') || [];
  },

  setUsers(users) {
    this.set('users', users);
  },

  getUserById(id) {
    return this.getUsers().find(u => u.id === id);
  },

  getUserByEmail(email) {
    return this.getUsers().find(u => u.email === email);
  },

  addUser(user) {
    const users = this.getUsers();
    users.push(user);
    this.setUsers(users);
    return user;
  },

  updateUser(id, updates) {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === id);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...updates };
      this.setUsers(users);
      return users[idx];
    }
    return null;
  },

  // Orders
  getOrders() {
    return this.get('orders') || [];
  },

  setOrders(orders) {
    this.set('orders', orders);
  },

  getOrderById(id) {
    return this.getOrders().find(o => o.id === id);
  },

  getOrdersByUserId(userId) {
    return this.getOrders().filter(o => o.userId === userId);
  },

  addOrder(order) {
    const orders = this.getOrders();
    orders.unshift(order);
    this.setOrders(orders);
    return order;
  },

  updateOrder(id, updates) {
    const orders = this.getOrders();
    const idx = orders.findIndex(o => o.id === id);
    if (idx !== -1) {
      orders[idx] = { ...orders[idx], ...updates, updatedAt: new Date().toISOString() };
      this.setOrders(orders);
      return orders[idx];
    }
    return null;
  },

  deleteOrder(id) {
    const orders = this.getOrders().filter(o => o.id !== id);
    this.setOrders(orders);
  },

  // Session
  getSession() {
    return this.get('session');
  },

  setSession(session) {
    this.set('session', session);
  },

  clearSession() {
    this.remove('session');
  },

  // Settings (admin)
  getSettings() {
    return this.get('settings') || {};
  },

  setSettings(settings) {
    this.set('settings', settings);
  },

  updateSettings(updates) {
    const settings = this.getSettings();
    this.set('settings', { ...settings, ...updates });
  },

  // Notifications
  getNotifications(userId) {
    const all = this.get('notifications') || [];
    return all.filter(n => n.userId === userId);
  },

  addNotification(notification) {
    const all = this.get('notifications') || [];
    all.unshift(notification);
    this.set('notifications', all);
  },

  markNotificationRead(id) {
    const all = this.get('notifications') || [];
    const idx = all.findIndex(n => n.id === id);
    if (idx !== -1) {
      all[idx].read = true;
      this.set('notifications', all);
    }
  },

  // Check if seeded
  isSeeded() {
    return this.get('seeded') === true;
  },

  markSeeded() {
    this.set('seeded', true);
  },

  // Clear all data
  clearAll() {
    Object.keys(localStorage)
      .filter(k => k.startsWith(PREFIX))
      .forEach(k => localStorage.removeItem(k));
  },
};

export default Store;
