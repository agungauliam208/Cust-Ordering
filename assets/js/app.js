const STORAGE_KEYS = {
  table: "cafe1994_table",
  cart: "cafe1994_cart",
  orders: "cafe1994_orders",
  noncashDraft: "cafe1994_noncash_draft"
};

const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0
});

function formatMoney(value) {
  return rupiah.format(Number(value || 0));
}

function parseStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    return fallback;
  }
}

function getTableNumber() {
  return localStorage.getItem(STORAGE_KEYS.table) || "";
}

function setTableNumber(value) {
  const cleanValue = String(value || "").replace(/[^0-9A-Za-z-]/g, "").trim();
  const previousTable = getTableNumber();
  if (previousTable && cleanValue && previousTable !== cleanValue) {
    localStorage.removeItem(STORAGE_KEYS.cart);
  }
  localStorage.setItem(STORAGE_KEYS.table, cleanValue);
  return cleanValue;
}

function requireTable() {
  const table = getTableNumber();
  if (!table) {
    window.location.href = "index.html";
    return false;
  }
  return true;
}

function findProduct(productId) {
  return CAFE_PRODUCTS.find((product) => product.id === productId);
}

function getCart() {
  return parseStorage(STORAGE_KEYS.cart, []);
}

function saveCart(cart) {
  localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(cart));
  refreshHeaderState();
}

function clearCart() {
  saveCart([]);
}

function getCartCount() {
  return getCart().reduce((total, item) => total + Number(item.qty || 0), 0);
}

function normalizeOptions(options) {
  const clean = { ...(options || {}) };
  if (Array.isArray(clean.extras)) {
    clean.extras = clean.extras.slice().sort((a, b) => a.label.localeCompare(b.label));
  }
  return clean;
}

function optionSignature(options) {
  return JSON.stringify(normalizeOptions(options));
}

function addToCart(productId, options = {}, qty = 1) {
  const product = findProduct(productId);
  if (!product) return;

  const quantity = Math.max(1, Number(qty || 1));
  const cleanOptions = normalizeOptions(options);
  const unitPrice = calculateItemPrice(product, cleanOptions);
  const signature = `${productId}:${optionSignature(cleanOptions)}`;
  const cart = getCart();
  const existing = cart.find((item) => item.signature === signature);

  if (existing) {
    existing.qty += quantity;
    existing.unitPrice = unitPrice;
  } else {
    cart.push({
      id: `cart-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      signature,
      productId,
      qty: quantity,
      options: cleanOptions,
      unitPrice
    });
  }

  saveCart(cart);
  showToast(`${product.name} berhasil masuk keranjang.`);
}

function updateCartItem(cartItemId, qty) {
  const cart = getCart();
  const target = cart.find((item) => item.id === cartItemId);
  if (!target) return;

  target.qty = Math.max(1, Number(qty || 1));
  saveCart(cart);
}

function removeCartItem(cartItemId) {
  saveCart(getCart().filter((item) => item.id !== cartItemId));
}

function getCartSummary() {
  const items = getCart();
  const subtotal = items.reduce((total, item) => total + (Number(item.unitPrice || 0) * Number(item.qty || 0)), 0);
  const service = subtotal > 0 ? 2000 : 0;
  const total = subtotal + service;

  return { items, subtotal, service, total };
}

function calculateItemPrice(product, options = {}) {
  let price = Number(product.price || 0);

  if (options.size === "Large") price += 5000;
  if (options.portion === "Nasi Jumbo" || options.portion === "Porsi Besar") price += 5000;
  if (Array.isArray(options.extras)) {
    price += options.extras.reduce((sum, extra) => sum + Number(extra.price || 0), 0);
  }
  if (options.packageDrink === "2 Kopi Susu" && product.type === "package") price += 0;

  return price;
}

function optionText(options = {}) {
  const parts = [];

  if (options.size) parts.push(options.size);
  if (options.temp) parts.push(options.temp);
  if (options.sugar) parts.push(options.sugar);
  if (options.spicyLevel) parts.push(options.spicyLevel);
  if (options.portion) parts.push(options.portion);
  if (options.sauce) parts.push(options.sauce);
  if (options.topping) parts.push(options.topping);
  if (options.packageDrink) parts.push(options.packageDrink);
  if (options.packageSnack) parts.push(options.packageSnack);
  if (Array.isArray(options.extras) && options.extras.length) {
    parts.push(options.extras.map((extra) => `${extra.label} +${formatMoney(extra.price)}`).join(", "));
  }

  return parts.length ? parts.join(" · ") : "Tanpa pilihan tambahan";
}

function renderOptionFields(product, prefix = "option") {
  const options = product.options || {};
  let html = "";

  const radioGroup = (title, name, values, defaultIndex = 0) => {
    if (!values || !values.length) return "";
    return `
      <div class="option-group">
        <div class="option-title">${title}</div>
        <div class="option-grid">
          ${values.map((value, index) => `
            <label class="choice">
              <input type="radio" name="${prefix}-${name}" value="${escapeAttr(value)}" ${index === defaultIndex ? "checked" : ""}>
              <span>${value}</span>
            </label>
          `).join("")}
        </div>
      </div>
    `;
  };

  html += radioGroup("Ukuran", "size", options.sizes);
  html += radioGroup("Suhu", "temp", options.temps);
  html += radioGroup("Gula", "sugar", options.sugars);
  html += radioGroup("Level pedas", "spicyLevel", options.spicyLevels);
  html += radioGroup("Porsi", "portion", options.portions);
  html += radioGroup("Saus", "sauce", options.sauces);
  html += radioGroup("Topping", "topping", options.toppings);
  html += radioGroup("Pilihan minuman paket", "packageDrink", options.packageDrinks);
  html += radioGroup("Pilihan cemilan paket", "packageSnack", options.packageSnacks);

  if (options.extras && options.extras.length) {
    html += `
      <div class="option-group">
        <div class="option-title">Tambahan</div>
        <div class="option-grid">
          ${options.extras.map((extra) => `
            <label class="choice">
              <input type="checkbox" name="${prefix}-extras" value="${escapeAttr(extra.label)}" data-price="${Number(extra.price || 0)}">
              <span>${extra.label} +${formatMoney(extra.price)}</span>
            </label>
          `).join("")}
        </div>
      </div>
    `;
  }

  html += `
    <div class="option-group">
      <label class="label">
        Catatan untuk dapur atau barista
        <textarea class="textarea" name="${prefix}-note" placeholder="Contoh: es sedikit, tanpa bawang, sambal dipisah."></textarea>
      </label>
    </div>
  `;

  return html;
}

function collectOptions(scope, prefix = "option") {
  const readRadio = (name) => {
    const selected = scope.querySelector(`input[name="${prefix}-${name}"]:checked`);
    return selected ? selected.value : "";
  };

  const extras = Array.from(scope.querySelectorAll(`input[name="${prefix}-extras"]:checked`)).map((input) => ({
    label: input.value,
    price: Number(input.dataset.price || 0)
  }));

  const noteInput = scope.querySelector(`[name="${prefix}-note"]`);
  const options = {
    size: readRadio("size"),
    temp: readRadio("temp"),
    sugar: readRadio("sugar"),
    spicyLevel: readRadio("spicyLevel"),
    portion: readRadio("portion"),
    sauce: readRadio("sauce"),
    topping: readRadio("topping"),
    packageDrink: readRadio("packageDrink"),
    packageSnack: readRadio("packageSnack"),
    extras,
    note: noteInput ? noteInput.value.trim() : ""
  };

  Object.keys(options).forEach((key) => {
    if (options[key] === "" || (Array.isArray(options[key]) && options[key].length === 0)) delete options[key];
  });

  return options;
}

function escapeAttr(value) {
  return String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function refreshHeaderState() {
  const table = getTableNumber();
  document.querySelectorAll("[data-table-badge]").forEach((node) => {
    node.textContent = table ? `Meja ${table}` : "Pilih meja";
  });
  document.querySelectorAll("[data-cart-count]").forEach((node) => {
    node.textContent = getCartCount();
  });
}

function showToast(message) {
  let toast = document.querySelector(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2200);
}

function getOrders() {
  return parseStorage(STORAGE_KEYS.orders, []);
}

function saveOrders(orders) {
  localStorage.setItem(STORAGE_KEYS.orders, JSON.stringify(orders));
}

function makeOrderCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 5; i += 1) {
    suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `C94-${suffix}`;
}


const NONCASH_CHANNELS = {
  QRIS: {
    label: "QRIS",
    type: "qris",
    title: "QRIS Cafe 1994",
    description: "Scan QRIS dari aplikasi e-wallet atau mobile banking, lalu lakukan konfirmasi di halaman verifikasi.",
    codePrefix: "QR"
  },
  "VA BCA": {
    label: "Virtual Account BCA",
    type: "va",
    title: "BCA Virtual Account",
    description: "Bayar melalui m-BCA, myBCA, ATM BCA, atau kanal BCA lain yang mendukung virtual account.",
    bankCode: "014"
  },
  "VA Mandiri": {
    label: "Virtual Account Mandiri",
    type: "va",
    title: "Mandiri Virtual Account",
    description: "Bayar melalui Livin' by Mandiri, ATM Mandiri, atau kanal Mandiri lain yang mendukung virtual account.",
    bankCode: "008"
  },
  "VA BNI": {
    label: "Virtual Account BNI",
    type: "va",
    title: "BNI Virtual Account",
    description: "Bayar melalui BNI Mobile Banking, ATM BNI, atau kanal BNI lain yang mendukung virtual account.",
    bankCode: "009"
  }
};

function getNoncashChannelConfig(channel) {
  return NONCASH_CHANNELS[channel] || NONCASH_CHANNELS.QRIS;
}

function makePaymentReference(prefix = "PAY") {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 6; i += 1) {
    suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `C94-${prefix}-${suffix}`;
}

function makeVirtualAccount(channel) {
  const config = getNoncashChannelConfig(channel);
  const bankCode = config.bankCode || "000";
  const table = String(getTableNumber() || "00").replace(/\D/g, "").padStart(2, "0").slice(-2);
  const random = String(Math.floor(100000 + Math.random() * 899999));
  return `${bankCode}1994${table}${random}`;
}

function getNoncashPaymentDraft() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEYS.noncashDraft);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

function saveNoncashPaymentDraft(draft) {
  sessionStorage.setItem(STORAGE_KEYS.noncashDraft, JSON.stringify(draft));
  return draft;
}

function clearNoncashPaymentDraft() {
  sessionStorage.removeItem(STORAGE_KEYS.noncashDraft);
}

function createNoncashPaymentDraft(channel = "QRIS") {
  const cleanChannel = NONCASH_CHANNELS[channel] ? channel : "QRIS";
  const summary = getCartSummary();
  const current = getNoncashPaymentDraft();
  const now = Date.now();

  if (
    current &&
    current.channel === cleanChannel &&
    Number(current.amount) === Number(summary.total) &&
    current.expiresAt &&
    now < current.expiresAt
  ) {
    return current;
  }

  const config = getNoncashChannelConfig(cleanChannel);
  const draft = {
    id: `pay-${now}-${Math.random().toString(16).slice(2)}`,
    channel: cleanChannel,
    channelLabel: config.label,
    type: config.type,
    amount: summary.total,
    createdAt: now,
    expiresAt: now + (15 * 60 * 1000),
    reference: makePaymentReference(config.codePrefix || "VA"),
    virtualAccount: config.type === "va" ? makeVirtualAccount(cleanChannel) : "",
    merchant: "Cafe 1994"
  };

  return saveNoncashPaymentDraft(draft);
}

function isPaymentDraftExpired(draft) {
  return !draft || !draft.expiresAt || Date.now() > Number(draft.expiresAt);
}

function createOrder({ paymentMethod, paymentChannel, paymentStatus, code: requestedCode, expiresAt: requestedExpiresAt, paymentReference = "" }) {
  const summary = getCartSummary();
  const table = getTableNumber();
  const code = requestedCode || makeOrderCode();
  const now = Date.now();
  const order = {
    code,
    table,
    items: summary.items,
    subtotal: summary.subtotal,
    service: summary.service,
    total: summary.total,
    paymentMethod,
    paymentChannel,
    paymentStatus,
    paymentReference,
    status: paymentMethod === "cash" ? "waiting_cash" : "paid",
    createdAt: now,
    verifiedAt: paymentMethod === "cash" ? null : now,
    expiresAt: paymentMethod === "cash" ? (requestedExpiresAt || now + (10 * 60 * 1000)) : null
  };

  const orders = getOrders();
  orders.unshift(order);
  saveOrders(orders);
  clearCart();
  return order;
}

function findOrder(code) {
  if (!code) return null;
  const normalized = String(code).trim().toUpperCase();
  return getOrders().find((order) => order.code.toUpperCase() === normalized) || null;
}

function updateOrder(code, changes) {
  const orders = getOrders();
  const index = orders.findIndex((order) => order.code === code);
  if (index === -1) return null;
  orders[index] = { ...orders[index], ...changes };
  saveOrders(orders);
  return orders[index];
}

function verifyCashOrder(code) {
  return updateOrder(code, {
    status: "paid",
    paymentStatus: "Terverifikasi kasir",
    verifiedAt: Date.now()
  });
}

function getOrderStatus(order) {
  if (!order) return null;

  const now = Date.now();
  if (order.status === "waiting_cash") {
    if (order.expiresAt && now > order.expiresAt) {
      return {
        key: "expired",
        title: "Waktu verifikasi habis",
        description: "Pesanan tunai belum diverifikasi dalam 10 menit. Buat pesanan baru di menu.",
        activeIndex: 0
      };
    }
    return {
      key: "waiting_cash",
      title: "Menunggu verifikasi kasir",
      description: "Tunjukkan QR pesanan di kasir, lalu bayar tunai agar dapur mulai memproses.",
      activeIndex: 0
    };
  }

  const start = order.verifiedAt || order.createdAt || Date.now();
  const elapsedMinutes = Math.floor((now - start) / 60000);

  if (elapsedMinutes < 1) {
    return {
      key: "paid",
      title: "Pembayaran terverifikasi",
      description: "Pesanan sudah masuk antrean. Dapur mulai menyiapkan pesanan kamu.",
      activeIndex: 1
    };
  }

  if (elapsedMinutes < 4) {
    return {
      key: "preparing",
      title: "Sedang diproses",
      description: "Barista dan dapur sedang menyiapkan pesanan untuk meja kamu.",
      activeIndex: 2
    };
  }

  if (elapsedMinutes < 8) {
    return {
      key: "almost_ready",
      title: "Hampir siap",
      description: "Pesanan sedang masuk tahap akhir sebelum diantar ke meja kamu.",
      activeIndex: 3
    };
  }

  return {
    key: "ready",
    title: "Siap diantar",
    description: "Pesanan siap. Staff akan mengantar ke meja sesuai nomor yang kamu masukkan.",
    activeIndex: 4
  };
}

function statusTimeline(order) {
  const current = getOrderStatus(order);
  const steps = [
    {
      title: order.status === "waiting_cash" ? "Menunggu pembayaran" : "Pesanan dibuat",
      desc: order.status === "waiting_cash" ? "Scan QR di kasir dan bayar tunai." : "Kode pesanan berhasil dibuat."
    },
    { title: "Pembayaran terverifikasi", desc: "Kasir atau sistem pembayaran mengonfirmasi transaksi." },
    { title: "Diproses dapur", desc: "Menu mulai disiapkan oleh tim Cafe 1994." },
    { title: "Hampir siap", desc: "Pesanan masuk tahap akhir sebelum dikirim ke meja." },
    { title: "Siap diantar", desc: "Staff mengantar pesanan ke nomor meja kamu." }
  ];

  return steps.map((step, index) => ({
    ...step,
    state: current.key === "expired" ? (index === 0 ? "current" : "") : index < current.activeIndex ? "done" : index === current.activeIndex ? "current" : ""
  }));
}

function renderBottomNav(active = "menu") {
  const holder = document.querySelector("[data-bottom-nav]");
  if (!holder) return;

  const count = getCartCount();
  holder.innerHTML = `
    <nav class="bottom-mobile-nav" aria-label="Navigasi bawah">
      <a class="mobile-nav-item ${active === "menu" ? "active" : ""}" href="menu.html"><span>☕</span><span>Menu</span></a>
      <a class="mobile-nav-item ${active === "cart" ? "active" : ""}" href="cart.html"><span>🧺</span><span>Keranjang ${count}</span></a>
      <a class="mobile-nav-item ${active === "order" ? "active" : ""}" href="order.html"><span>📦</span><span>Pesanan</span></a>
    </nav>
  `;
}

document.addEventListener("DOMContentLoaded", refreshHeaderState);
