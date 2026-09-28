import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Store from '../../data/store';
import { formatCurrency } from '../../utils/helpers';
import { animate } from 'animejs';
import './Customer.css';

export default function Warehouse() {
  const { user, isAdmin } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);

  // Fetch orders on load
  const loadWarehouseOrders = async () => {
    if (!user) return;
    try {
      // Backend otomatis membatasi: customer hanya order miliknya, admin semua order
      const allOrders = await Store.getOrders();
      // Only show items that are currently "at_warehouse" status
      setOrders(allOrders.filter(o => o.status === 'at_warehouse'));
    } catch (e) {
      toast.error('Gagal memuat data', e.message);
    }
  };

  useEffect(() => {
    loadWarehouseOrders();
  }, [user, isAdmin]);

  // Staggered entry animation on load
  useEffect(() => {
    if (orders.length > 0) {
      animate('.warehouse-card-animate', {
        opacity: [0, 1],
        scale: [0.95, 1],
        y: [15, 0],
        delay: (el, i) => i * 45,
        duration: 400,
        easing: 'easeOutQuad'
      });
      animate('.stat-card', {
        opacity: [0, 1],
        y: [20, 0],
        delay: (el, i) => i * 80,
        duration: 500,
        easing: 'easeOutQuad'
      });
    }
  }, [orders]);

  // Group orders by their warehouse location
  const groupedOrders = useMemo(() => {
    const groups = {};
    orders.forEach(order => {
      const location = order.warehouseLocation || (order.country === 'US' ? 'Gudang Oregon, US' : 'Gudang Guangzhou, CN');
      if (!groups[location]) {
        groups[location] = [];
      }
      groups[location].push(order);
    });
    return groups;
  }, [orders]);

  // Compute selection stats
  const selectedStats = useMemo(() => {
    let count = 0;
    let weight = 0;
    orders.forEach(o => {
      if (selectedOrderIds.includes(o.id)) {
        count++;
        // Sum weights of all items in this order
        const orderWeight = o.items.reduce((sum, item) => sum + (parseFloat(item.weight) || 0) * (parseInt(item.quantity) || 1), 0);
        weight += orderWeight;
      }
    });
    return { count, weight: parseFloat(weight.toFixed(1)) };
  }, [selectedOrderIds, orders]);

  // Toggle single item selection
  const handleToggleSelect = (orderId) => {
    setSelectedOrderIds(prev => 
      prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
    );
  };

  // Toggle group selection
  const handleToggleGroup = (groupOrders, checked) => {
    const ids = groupOrders.map(o => o.id);
    if (checked) {
      // Add all ids of this group if not already present
      setSelectedOrderIds(prev => [...new Set([...prev, ...ids])]);
    } else {
      // Remove all ids of this group
      setSelectedOrderIds(prev => prev.filter(id => !ids.includes(id)));
    }
  };

  // Check if all items in a group are selected
  const isGroupAllSelected = (groupOrders) => {
    return groupOrders.every(o => selectedOrderIds.includes(o.id));
  };

  const handleClearSelection = () => {
    setSelectedOrderIds([]);
  };

  // Consolidation workflow execution
  const handleConsolidate = () => {
    if (selectedOrderIds.length === 0) return;

    const selector = selectedOrderIds.map(id => `[data-order-id="${id}"]`).join(', ');

    // Animate the selected elements out fluidly
    animate(selector, {
      scale: 0.8,
      opacity: 0,
      y: -30,
      duration: 350,
      easing: 'easeInQuad',
      complete: async () => {
        try {
          // Server mengubah status tiap order menjadi "customs" + mencatat riwayat & notifikasi
          await Store.consolidateOrders(selectedOrderIds);
          toast.success(
            'Konsolidasi Sukses!',
            `${selectedOrderIds.length} item diproses menuju Customs Indonesia`
          );
          setSelectedOrderIds([]);
        } catch (e) {
          toast.error('Konsolidasi Gagal', e.message);
          animate(selector, { scale: 1, opacity: 1, y: 0, duration: 200 });
        }
        loadWarehouseOrders();
      }
    });
  };

  return (
    <div className="animate-fade-in-up" style={{ paddingBottom: selectedOrderIds.length > 0 ? '120px' : '40px' }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 'var(--space-8)' }}>
        <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: '800', color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
          Gudang Virtual
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-base)', maxWidth: '700px' }}>
          Kelola barang Anda di gudang luar negeri sebelum dikirim ke Indonesia. Konsolidasikan beberapa item untuk menghemat biaya pengiriman global.
        </p>
      </div>

      {/* Stats Bento Grid Row */}
      <div className="stats-grid" style={{ marginBottom: 'var(--space-8)' }}>
        <div className="stat-card" style={{ height: '140px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div className="stat-card-header">
            <span className="stat-card-label">Total Barang</span>
            <span className="material-symbols-outlined" style={{ color: 'var(--primary-start)' }}>inventory_2</span>
          </div>
          <div>
            <div className="stat-card-value" style={{ fontSize: 'var(--text-3xl)' }}>{orders.length}</div>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: '4px' }}>Item dalam antrean gudang</p>
          </div>
        </div>

        <div className="stat-card" style={{ height: '140px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div className="stat-card-header">
            <span className="stat-card-label">Estimasi Berat</span>
            <span className="material-symbols-outlined" style={{ color: 'var(--accent-cyan)' }}>weight</span>
          </div>
          <div>
            <div className="stat-card-value" style={{ fontSize: 'var(--text-3xl)' }}>
              {orders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + (i.weight * i.quantity), 0), 0).toFixed(1)} <span style={{ fontSize: 'var(--text-lg)', fontWeight: '600', color: 'var(--text-secondary)' }}>kg</span>
            </div>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: '4px' }}>Volume metrik mungkin berlaku</p>
          </div>
        </div>

        <div className="stat-card" style={{ height: '140px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div className="stat-card-header">
            <span className="stat-card-label">Status Gudang</span>
            <span className="material-symbols-outlined" style={{ color: 'var(--accent-gold)' }}>location_on</span>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <div style={{ flex: 1, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', padding: 'var(--space-2) var(--space-3)', border: '1px solid var(--glass-border)' }}>
              <div style={{ fontSize: 'var(--text-lg)', fontWeight: '700' }}>
                {orders.filter(o => o.country === 'US').length}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>di US</div>
            </div>
            <div style={{ flex: 1, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', padding: 'var(--space-2) var(--space-3)', border: '1px solid var(--glass-border)' }}>
              <div style={{ fontSize: 'var(--text-lg)', fontWeight: '700' }}>
                {orders.filter(o => o.country === 'CN').length}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>di China</div>
            </div>
          </div>
        </div>
      </div>

      {/* Warehouse Locations */}
      {orders.length === 0 ? (
        <div className="glass-card" style={{ padding: 'var(--space-12) var(--space-6)', textAlign: 'center' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '64px', color: 'var(--text-tertiary)', marginBottom: 'var(--space-4)' }}>
            warehouse
          </span>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>Tidak Ada Barang di Gudang</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto' }}>
            Saat ini tidak ada barang Anda yang tersimpan di gudang luar negeri kami. Pesan barang baru untuk mulai memantau.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-10)' }}>
          {Object.entries(groupedOrders).map(([location, groupItems]) => (
            <section key={location} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {/* Location Group Title */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', paddingBottom: 'var(--space-3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--glass-border)' }}>
                    <span style={{ fontSize: 'var(--text-lg)' }}>{location.includes('US') ? '🇺🇸' : '🇨🇳'}</span>
                  </div>
                  <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: '700', color: 'var(--text-primary)' }}>{location}</h3>
                  <span style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', fontSize: 'var(--text-xs)', fontWeight: '600', padding: 'var(--space-1) var(--space-3)', borderRadius: 'var(--radius-full)' }}>
                    {groupItems.length} Item
                  </span>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer' }} className="group">
                  <span style={{ fontSize: 'var(--text-sm)', fontWeight: '600', color: 'var(--primary-start)' }}>
                    Pilih Semua di {location.includes('US') ? 'US' : 'CN'}
                  </span>
                  <input
                    type="checkbox"
                    checked={isGroupAllSelected(groupItems)}
                    onChange={(e) => handleToggleGroup(groupItems, e.target.checked)}
                    style={{ width: '18px', height: '18px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)', accentColor: 'var(--primary-start)', cursor: 'pointer' }}
                  />
                </label>
              </div>

              {/* Product Cards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-5)' }}>
                {groupItems.map(order => {
                  const firstItem = order.items[0] || {};
                  const orderWeight = order.items.reduce((sum, item) => sum + (parseFloat(item.weight) || 0) * (parseInt(item.quantity) || 1), 0);
                  
                  return (
                    <div
                      key={order.id}
                      data-order-id={order.id}
                      className="glass-card warehouse-card-animate"
                      style={{ padding: 'var(--space-4)', display: 'flex', gap: 'var(--space-4)', position: 'relative', overflow: 'hidden' }}
                    >
                      {/* Checkbox Selector */}
                      <div style={{ position: 'absolute', top: 'var(--space-3)', right: 'var(--space-3)', zIndex: 10 }}>
                        <input
                          type="checkbox"
                          checked={selectedOrderIds.includes(order.id)}
                          onChange={() => handleToggleSelect(order.id)}
                          style={{ width: '22px', height: '22px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)', accentColor: 'var(--primary-start)', cursor: 'pointer' }}
                        />
                      </div>

                      {/* Item Image / Fallback Icon */}
                      <div style={{ width: '80px', height: '80px', borderRadius: 'var(--radius-md)', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                        {firstItem.imageUrl ? (
                          <img src={firstItem.imageUrl} alt={firstItem.name} style={{ width: '100%', height: '100%', objectCover: 'cover' }} />
                        ) : (
                          <span className="material-symbols-outlined" style={{ fontSize: '32px', color: 'var(--text-tertiary)' }}>
                            {firstItem.name?.toLowerCase().includes('keyboard') ? 'keyboard' : firstItem.name?.toLowerCase().includes('watch') ? 'watch' : firstItem.name?.toLowerCase().includes('headphones') ? 'headphones' : 'inventory_2'}
                          </span>
                        )}
                      </div>

                      {/* Item Details */}
                      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1, minWidth: 0, paddingRight: 'var(--space-6)' }}>
                        <div>
                          <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: '700', color: 'var(--text-primary)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {firstItem.name || 'Untitled Product'}
                          </h4>
                          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: '2px', display: 'block' }}>
                            ID: {order.id}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 'var(--space-2)' }}>
                          <div>
                            <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', display: 'block', marginBottom: '2px' }}>
                              Tiba di Gudang
                            </span>
                            <span style={{ fontSize: 'var(--text-xs)', fontWeight: '600', color: 'var(--text-primary)' }}>
                              {new Date(order.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </div>

                          <div style={{ background: 'var(--bg-tertiary)', padding: 'var(--space-1) var(--space-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>scale</span>
                            <span style={{ fontSize: 'var(--text-xs)', fontWeight: '700', color: 'var(--text-primary)' }}>
                              {orderWeight.toFixed(1)} kg
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Sticky Bottom Glassmorphic Action Bar */}
      {selectedOrderIds.length > 0 && (
        <div style={{ position: 'fixed', bottom: '0', left: '0', right: '0', zIndex: 100, padding: 'var(--space-4) var(--space-6)' }} className="animate-fade-in-up">
          <div
            className="glass-card"
            style={{
              maxWidth: '1200px',
              margin: '0 auto',
              padding: 'var(--space-4) var(--space-6)',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 'var(--space-4)',
              boxShadow: '0 -8px 30px rgba(0, 105, 84, 0.12)',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(12px)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--success-bg)', display: 'flex', alignItems: 'center', justify: 'center', color: 'var(--primary-start)' }}>
                <span className="material-symbols-outlined fill" style={{ fontSize: '24px' }}>local_shipping</span>
              </div>
              <div>
                <h4 style={{ fontSize: 'var(--text-base)', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>Siap Dikirim</h4>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', margin: 0 }}>
                  Terpilih: <strong style={{ color: 'var(--primary-start)' }}>{selectedStats.count} Item</strong> ({selectedStats.weight} kg)
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <button
                className="btn btn-outline"
                onClick={handleClearSelection}
                style={{ padding: 'var(--space-2) var(--space-5)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', fontWeight: '600', color: 'var(--text-secondary)' }}
              >
                Batal
              </button>
              <button
                className="btn btn-primary"
                onClick={handleConsolidate}
                style={{ padding: 'var(--space-2) var(--space-6)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', fontWeight: '600', color: 'white', display: 'flex', alignItems: 'center', gap: 'var(--space-2)', background: 'var(--primary-gradient)', boxShadow: 'var(--shadow-glow)' }}
              >
                <span>Konsolidasi &amp; Kirim</span>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
