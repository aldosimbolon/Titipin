// Data layer Titipin. Dulu berbasis localStorage, sekarang memanggil REST API backend (MongoDB).
// Semua method bersifat async -> gunakan `await` saat memanggilnya.
import { request } from './api';

const Store = {
  // ---------- Users ----------
  async getUsers() {
    return (await request('/users')).users;
  },

  async getUserById(id) {
    try {
      return (await request(`/users/${id}`)).user;
    } catch (e) {
      if (e.status === 404) return null;
      throw e;
    }
  },

  async setUserActive(id, isActive) {
    return (await request(`/users/${id}/status`, { method: 'PATCH', body: { isActive } })).user;
  },

  async updateUserProfile(id, updates) {
    return (await request(`/users/${id}`, { method: 'PUT', body: updates })).user;
  },

  // ---------- Orders ----------
  // Backend otomatis membatasi: customer hanya melihat order miliknya, admin melihat semua.
  async getOrders() {
    return (await request('/orders')).orders;
  },

  async getOrdersByUserId() {
    return this.getOrders();
  },

  async getOrderById(id) {
    try {
      return (await request(`/orders/${id}`)).order;
    } catch (e) {
      if (e.status === 404 || e.status === 403) return null;
      throw e;
    }
  },

  async addOrder({ country, items, shippingAddress, npwp, estimatedCost }) {
    return (await request('/orders', {
      method: 'POST',
      body: { country, items, shippingAddress, npwp, estimatedCost },
    })).order;
  },

  async setOrderQuote(id, { estimatedCost, note }) {
    return (await request(`/orders/${id}/quote`, { method: 'PUT', body: { estimatedCost, note } })).order;
  },

  async updateOrderStatus(id, { status, note, warehouseLocation }) {
    return (await request(`/orders/${id}/status`, {
      method: 'PUT',
      body: { status, note, warehouseLocation },
    })).order;
  },

  async payOrder(id, { stage, method }) {
    return (await request(`/orders/${id}/pay`, { method: 'POST', body: { stage, method } })).order;
  },

  async consolidateOrders(orderIds) {
    return (await request('/orders/consolidate', { method: 'POST', body: { orderIds } })).orders;
  },

  async addOrderNote(id, message) {
    return (await request(`/orders/${id}/notes`, { method: 'POST', body: { message } })).notes;
  },

  async deleteOrder(id) {
    await request(`/orders/${id}`, { method: 'DELETE' });
  },

  // ---------- Settings ----------
  async getSettings() {
    return (await request('/settings')).settings;
  },

  async updateSettings(updates) {
    return (await request('/settings', { method: 'PUT', body: updates })).settings;
  },

  // ---------- Notifications ----------
  async getNotifications() {
    return (await request('/notifications')).notifications;
  },

  async markNotificationRead(id) {
    return (await request(`/notifications/${id}/read`, { method: 'PATCH' })).notification;
  },
};

export default Store;
