let successCountdown = null;

document.addEventListener("DOMContentLoaded", () => {
  renderBottomNav("order");
  renderSuccessPage();
});

function renderSuccessPage() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  const order = findOrder(code);
  const root = document.querySelector("[data-success-root]");

  if (!order) {
    root.innerHTML = `
      <div class="container page-section">
        <div class="empty-card">
          <div class="empty-icon">📦</div>
          <h1>Kode pesanan tidak ditemukan</h1>
          <p class="muted">Kode ini belum tersimpan di perangkat. Silakan cek halaman pesanan atau buat pesanan baru.</p>
          <a class="primary-btn" href="order.html">Cek Pesanan</a>
        </div>
      </div>
    `;
    return;
  }

  const status = getOrderStatus(order);
  root.innerHTML = `
    <div class="container page-section">
      <div class="status-layout">
        <main class="status-card">
          <div class="eyebrow">Pesanan Berhasil Dibuat</div>
          <h1 style="font-size: clamp(34px, 5vw, 56px); margin: 12px 0; letter-spacing: -0.05em;">Simpan kode pesanan kamu</h1>
          <p class="muted">Kode ini dipakai untuk mengecek status pesanan. Simpan kode sampai pesanan selesai.</p>
          <div style="height: 16px;"></div>
          <div class="order-code-big">${order.code}</div>
          <div style="height: 16px;"></div>
          <div class="summary-line"><span>Nomor meja</span><strong>Meja ${order.table}</strong></div>
          <div class="summary-line"><span>Pembayaran</span><strong>${order.paymentChannel}</strong></div>
          ${order.paymentReference ? `<div class="summary-line"><span>Referensi</span><strong>${order.paymentReference}</strong></div>` : ""}
          <div class="summary-line"><span>Total</span><strong>${formatMoney(order.total)}</strong></div>
          <div class="summary-line"><span>Status</span><strong>${status.title}</strong></div>
          ${order.paymentMethod === "cash" ? renderCashBlock(order) : ""}
          <div class="summary-actions">
            <a class="primary-btn" href="order.html?code=${order.code}">Cek Status Pesanan</a>
            <a class="secondary-btn" href="menu.html">Pesan Lagi</a>
          </div>
        </main>
        <aside class="summary-card">
          <h2>Ringkasan Item</h2>
          <div class="checkout-list">
            ${order.items.map((item) => renderSuccessItem(item)).join("")}
          </div>
        </aside>
      </div>
    </div>
  `;

  refreshHeaderState();
  if (order.paymentMethod === "cash") startSuccessCashCountdown(order.expiresAt);
}

function renderCashBlock(order) {
  return `
    <div class="payment-detail active" style="margin-top: 16px;">
      <h3>QR Verifikasi Tunai</h3>
      <div class="qr-card">
        <div class="fake-qr" aria-label="QR tunai ${order.code}"></div>
        <div>
          <p class="muted">Scan QR ini di kasir dan bayar tunai agar pesanan diproses.</p>
          <div class="code-box">${order.code}</div>
          <p class="helper">Sisa waktu: <span class="timer" data-success-cash-timer>10:00</span></p>
        </div>
      </div>
    </div>
  `;
}

function renderSuccessItem(item) {
  const product = findProduct(item.productId);
  if (!product) return "";
  return `
    <article class="checkout-item">
      <img class="checkout-thumb" src="${product.image}" alt="${escapeAttr(product.name)}">
      <div class="item-copy">
        <div class="item-title">${product.name}</div>
        <div class="item-meta">${optionText(item.options)}</div>
        <div class="helper">${item.qty} × ${formatMoney(item.unitPrice)}</div>
      </div>
      <strong>${formatMoney(item.qty * item.unitPrice)}</strong>
    </article>
  `;
}

function startSuccessCashCountdown(expiresAt) {
  const timer = document.querySelector("[data-success-cash-timer]");
  if (!timer || !expiresAt) return;

  const tick = () => {
    const remaining = Math.max(0, expiresAt - Date.now());
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    timer.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    if (remaining <= 0) window.clearInterval(successCountdown);
  };

  tick();
  successCountdown = window.setInterval(tick, 1000);
}
