import Order, { ORDER_STATUSES } from '../models/Order.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { generateOrderId, generateItemId } from '../utils/generateId.js';
import { notify, notifyAdmins } from '../utils/notify.js';

const rupiah = (n) => `Rp ${Number(n || 0).toLocaleString('id-ID')}`;

// @route POST /api/orders   (customer)
export const createOrder = asyncHandler(async (req, res) => {
  const { country, items, shippingAddress, npwp, estimatedCost } = req.body;

  if (!country || !Array.isArray(items) || items.length === 0 || !shippingAddress) {
    res.status(400);
    throw new Error('country, items (minimal 1), dan shippingAddress wajib diisi');
  }

  const preparedItems = items.map((item) => ({
    id: item.id || generateItemId(),
    name: item.name,
    url: item.url || '',
    variant: item.variant || '',
    quantity: item.quantity || 1,
    priceOriginal: item.priceOriginal,
    currency: item.currency,
    weight: item.weight || 0,
    notes: item.notes || '',
    imageUrl: item.imageUrl || null,
  }));

  const order = await Order.create({
    _id: generateOrderId(),
    userId: req.user._id,
    country,
    status: 'pending_quote',
    items: preparedItems,
    shippingAddress,
    npwp: npwp || req.user.npwp || '',
    estimatedCost: estimatedCost || null,
    finalCost: null,
    paymentStage1: null,
    paymentStage2: null,
    statusHistory: [{ status: 'pending_quote', date: new Date(), note: 'Pesanan dibuat oleh pelanggan' }],
    notes: [],
  });

  await notify(req.user._id, 'Pesanan Dibuat', `Pesanan ${order._id} berhasil dibuat. Menunggu konfirmasi harga.`);
  await notifyAdmins('Pesanan Baru', `Ada pesanan baru ${order._id} dari ${req.user.name} yang perlu dihitung harganya.`);

  res.status(201).json({ status: 'success', data: { order } });
});

// @route GET /api/orders
// @desc  Customer: hanya order miliknya. Admin: semua order (bisa difilter).
export const getOrders = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.user.role === 'customer') {
    filter.userId = req.user._id;
  } else if (req.query.userId) {
    filter.userId = req.query.userId;
  }

  if (req.query.status) filter.status = req.query.status;
  if (req.query.country) filter.country = req.query.country;

  const orders = await Order.find(filter).sort({ createdAt: -1 });
  res.status(200).json({ status: 'success', results: orders.length, data: { orders } });
});

// @route GET /api/orders/:id
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order tidak ditemukan');
  }

  if (req.user.role !== 'admin' && order.userId !== req.user._id) {
    res.status(403);
    throw new Error('Akses ditolak: bukan pemilik order ini');
  }

  res.status(200).json({ status: 'success', data: { order } });
});

// @route PUT /api/orders/:id/quote   (admin)
// @desc  Admin menghitung & memasukkan estimasi biaya, status -> awaiting_payment
export const setQuote = asyncHandler(async (req, res) => {
  const { estimatedCost, note } = req.body;
  if (!estimatedCost) {
    res.status(400);
    throw new Error('estimatedCost wajib diisi');
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order tidak ditemukan');
  }

  order.estimatedCost = estimatedCost;
  order.status = 'awaiting_payment';
  order.paymentStage1 = { amount: estimatedCost.total, status: 'unpaid', paidAt: null, method: null };
  order.statusHistory.push({
    status: 'awaiting_payment',
    date: new Date(),
    note: note || 'Harga sudah dihitung, menunggu pembayaran',
  });

  await order.save();
  await notify(order.userId, 'Harga Sudah Ditetapkan', `Pesanan ${order._id} total ${rupiah(estimatedCost.total)}. Silakan lakukan pembayaran.`);
  res.status(200).json({ status: 'success', data: { order } });
});

// @route PUT /api/orders/:id/status   (admin)
// @desc  Update status order secara umum (purchased, at_warehouse, customs, shipped, completed, cancelled)
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note, warehouseLocation, finalCost, paymentStage1, paymentStage2 } = req.body;

  if (!status || !ORDER_STATUSES.includes(status)) {
    res.status(400);
    throw new Error(`status wajib salah satu dari: ${ORDER_STATUSES.join(', ')}`);
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order tidak ditemukan');
  }

  order.status = status;
  if (warehouseLocation !== undefined) order.warehouseLocation = warehouseLocation;
  if (finalCost !== undefined) order.finalCost = finalCost;
  if (paymentStage1 !== undefined) order.paymentStage1 = paymentStage1;
  if (paymentStage2 !== undefined) order.paymentStage2 = paymentStage2;

  order.statusHistory.push({ status, date: new Date(), note: note || '' });

  await order.save();
  await notify(order.userId, 'Status Pesanan Diperbarui', `Status pesanan ${order._id} kini: ${status}.`);
  res.status(200).json({ status: 'success', data: { order } });
});

// @route POST /api/orders/:id/notes   (pemilik order atau admin)
export const addOrderNote = asyncHandler(async (req, res) => {
  const { message } = req.body;
  if (!message) {
    res.status(400);
    throw new Error('message wajib diisi');
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order tidak ditemukan');
  }

  if (req.user.role !== 'admin' && order.userId !== req.user._id) {
    res.status(403);
    throw new Error('Akses ditolak: bukan pemilik order ini');
  }

  order.notes.push({
    from: req.user.role === 'admin' ? 'admin' : 'user',
    message,
    date: new Date(),
  });

  await order.save();
  res.status(201).json({ status: 'success', data: { notes: order.notes } });
});

// @route DELETE /api/orders/:id   (admin)
export const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findByIdAndDelete(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order tidak ditemukan');
  }
  res.status(200).json({ status: 'success', data: null });
});

// @route POST /api/orders/:id/pay   (pemilik order)
// @desc  Simulasi pembayaran tahap 1 / tahap 2. Nominal diambil dari data order di server.
export const payOrder = asyncHandler(async (req, res) => {
  const stage = Number(req.body.stage);
  const method = req.body.method;

  if (![1, 2].includes(stage) || !method) {
    res.status(400);
    throw new Error('stage (1 atau 2) dan method wajib diisi');
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order tidak ditemukan');
  }
  if (req.user.role !== 'admin' && order.userId !== req.user._id) {
    res.status(403);
    throw new Error('Akses ditolak: bukan pemilik order ini');
  }

  const key = stage === 1 ? 'paymentStage1' : 'paymentStage2';
  const payment = order[key];

  if (!payment || !(payment.amount > 0)) {
    res.status(400);
    throw new Error(`Pembayaran tahap ${stage} belum tersedia untuk order ini`);
  }
  if (payment.status === 'paid') {
    res.status(400);
    throw new Error(`Pembayaran tahap ${stage} sudah lunas`);
  }
  if (stage === 1 && order.status !== 'awaiting_payment') {
    res.status(400);
    throw new Error('Order belum/tidak dalam status menunggu pembayaran');
  }
  if (stage === 2 && order.paymentStage1?.status !== 'paid') {
    res.status(400);
    throw new Error('Selesaikan pembayaran tahap 1 terlebih dahulu');
  }

  const now = new Date();
  order[key] = { amount: payment.amount, status: 'paid', paidAt: now, method };

  if (stage === 1) {
    order.status = 'purchased';
    order.statusHistory.push({
      status: 'purchased',
      date: now,
      note: `Pembayaran Tahap 1 sebesar ${rupiah(payment.amount)} berhasil diverifikasi via ${String(method).toUpperCase()}.`,
    });
  } else {
    order.statusHistory.push({
      status: order.status,
      date: now,
      note: `Pembayaran Tahap 2 (Ongkos Kirim Domestik) sebesar ${rupiah(payment.amount)} berhasil diverifikasi via ${String(method).toUpperCase()}.`,
    });
  }

  await order.save();
  await notify(order.userId, `Pembayaran Tahap ${stage} Berhasil`, `Pembayaran sebesar ${rupiah(payment.amount)} untuk pesanan ${order._id} berhasil terverifikasi.`);
  res.status(200).json({ status: 'success', data: { order } });
});

// @route POST /api/orders/consolidate   (pemilik order)
// @desc  Konsolidasi beberapa order yang berstatus at_warehouse -> customs
export const consolidateOrders = asyncHandler(async (req, res) => {
  const { orderIds } = req.body;
  if (!Array.isArray(orderIds) || orderIds.length === 0) {
    res.status(400);
    throw new Error('orderIds (minimal 1) wajib diisi');
  }

  const orders = await Order.find({ _id: { $in: orderIds } });
  if (orders.length !== orderIds.length) {
    res.status(404);
    throw new Error('Sebagian order tidak ditemukan');
  }

  for (const order of orders) {
    if (req.user.role !== 'admin' && order.userId !== req.user._id) {
      res.status(403);
      throw new Error(`Akses ditolak: order ${order._id} bukan milik kamu`);
    }
    if (order.status !== 'at_warehouse') {
      res.status(400);
      throw new Error(`Order ${order._id} tidak berada di gudang`);
    }
  }

  for (const order of orders) {
    order.status = 'customs';
    order.statusHistory.push({
      status: 'customs',
      date: new Date(),
      note: 'Barang dikonsolidasi oleh pelanggan dan masuk proses customs bea cukai Indonesia',
    });
    await order.save();
  }

  await notify(req.user._id, 'Konsolidasi Berhasil', `${orders.length} item berhasil dikonsolidasi untuk pengiriman ke Indonesia.`);
  res.status(200).json({ status: 'success', data: { orders } });
});
