const CASH_DRAFT_KEY = "cafe1994_cash_draft";
let countdownTimer = null;

document.addEventListener("DOMContentLoaded", () => {
  if (!requireTable()) return;
  renderBottomNav("cart");
  renderCheckoutPage();
  bindCheckoutEvents();
});

function bindCheckoutEvents() {
  document.addEventListener("change", (event) => {
    if (event.target.matches("input[name='payment-method']")) {
      renderPaymentDetail();
    }

    if (event.target.matches("input[name='noncash-channel']")) {
      renderNoncashInfo();
    }
  });

  document.addEventListener("click", (event) => {
    const submit = event.target.closest("[data-create-order]");
    if (!submit) return;
    createOrderFromCheckout();
  });
}

function renderCheckoutPage() {
  const page = document.querySelector("[data-checkout-page]");
  const data = getCartSummary();

  if (!data.items.length) {
    page.innerHTML = `
      <div class="container page-section">
        <div class="empty-card">
          <div class="empty-icon">🧺</div>
          <h1>Keranjang kosong</h1>
          <p class="muted">Checkout membutuhkan minimal satu item di keranjang.</p>
          <a class="primary-btn" href="menu.html">Pilih Menu</a>
        </div>
      </div>
    `;
    return;
  }

  page.innerHTML = `
    <div class="container page-section">
      <div class="page-title">
        <div>
          <h1>Checkout</h1>
          <p>Periksa pesanan, pilih metode pembayaran, lalu buat kode pesanan.</p>
        </div>
        <span class="badge dark" data-table-badge>Meja</span>
      </div>
      <div class="checkout-layout">
        <main class="panel">
          <h2>Pesanan Kamu</h2>
          <div class="checkout-list">
            ${data.items.map(renderCheckoutItem).join("")}
          </div>
          <div style="height: 18px;"></div>
          <h2>Pilih Pembayaran</h2>
          <div class="payment-methods">
            <label class="payment-card">
              <input type="radio" name="payment-method" value="cash" checked>
              <div class="payment-body">
                <strong>Tunai di Kasir</strong>
                <span>Dapatkan QR verifikasi, scan di kasir, lalu bayar dalam 10 menit.</span>
              </div>
            </label>
            <label class="payment-card">
              <input type="radio" name="payment-method" value="noncash">
              <div class="payment-body">
                <strong>Non Tunai</strong>
                <span>Pilih QRIS atau virtual account, lalu lanjut ke halaman verifikasi pembayaran.</span>
              </div>
            </label>
          </div>
          <div data-payment-detail></div>
        </main>
        <aside class="summary-card" data-summary-card>
          ${renderCheckoutSummary(data)}
        </aside>
      </div>
    </div>
  `;

  refreshHeaderState();
  renderPaymentDetail();
}

function renderCheckoutItem(item) {
  const product = findProduct(item.productId);
  if (!product) return "";
  return `
    <article class="checkout-item">
      <img class="checkout-thumb" src="${product.image}" alt="${escapeAttr(product.name)}">
      <div class="item-copy">
        <div class="item-title">${product.name}</div>
        <div class="item-meta">${optionText(item.options)}</div>
        ${item.options?.note ? `<div class="item-note">Catatan: ${escapeHtml(item.options.note)}</div>` : ""}
        <div class="helper">${item.qty} × ${formatMoney(item.unitPrice)}</div>
      </div>
      <strong>${formatMoney(item.qty * item.unitPrice)}</strong>
    </article>
  `;
}

function renderCheckoutSummary(data) {
  return `
    <h2>Total Bayar</h2>
    <div class="summary-line"><span>Subtotal</span><strong>${formatMoney(data.subtotal)}</strong></div>
    <div class="summary-line"><span>Biaya layanan</span><strong>${formatMoney(data.service)}</strong></div>
    <div class="summary-line"><span>Total</span><strong class="summary-total">${formatMoney(data.total)}</strong></div>
    <div class="summary-actions">
      <button class="primary-btn" type="button" data-create-order>Buat Pesanan</button>
      <a class="secondary-btn" href="cart.html">Kembali ke Keranjang</a>
    </div>
  `;
}

function renderPaymentDetail() {
  const holder = document.querySelector("[data-payment-detail]");
  if (!holder) return;

  const method = document.querySelector("input[name='payment-method']:checked")?.value || "cash";
  window.clearInterval(countdownTimer);

  if (method === "cash") {
    const draft = getCashDraft();
    holder.innerHTML = `
      <section class="payment-detail active">
        <h3>QR Tunai untuk Kasir</h3>
        <div class="qr-card">
          <div class="fake-qr" aria-label="QR verifikasi tunai"></div>
          <div>
            <p class="muted">Tunjukkan QR ini ke kasir. Setelah kasir memverifikasi pembayaran, pesanan masuk antrean dapur.</p>
            <div class="code-box">${draft.code}</div>
            <p class="helper">Sisa waktu verifikasi: <span class="timer" data-cash-timer>10:00</span></p>
          </div>
        </div>
      </section>
    `;
    startCashCountdown(draft.expiresAt);
    return;
  }

  const submitButton = document.querySelector("[data-create-order]");
  if (submitButton) {
    submitButton.disabled = false;
    submitButton.textContent = "Lanjut ke Verifikasi Pembayaran";
  }

  holder.innerHTML = `
    <section class="payment-detail active">
      <h3>Metode Non Tunai</h3>
      <p class="muted">Pilih metode pembayaran. Detail lengkap, nomor tujuan, timer, dan tombol konfirmasi ada di halaman verifikasi pembayaran.</p>
      <div class="bank-options">
        <label class="payment-card">
          <input type="radio" name="noncash-channel" value="QRIS" checked>
          <div class="payment-body"><strong>QRIS</strong><span>Scan kode QR di halaman verifikasi.</span></div>
        </label>
        <label class="payment-card">
          <input type="radio" name="noncash-channel" value="VA BCA">
          <div class="payment-body"><strong>Virtual Account BCA</strong><span>Nomor VA dibuat otomatis dan berlaku 15 menit.</span></div>
        </label>
        <label class="payment-card">
          <input type="radio" name="noncash-channel" value="VA Mandiri">
          <div class="payment-body"><strong>Virtual Account Mandiri</strong><span>Gunakan mobile banking atau ATM.</span></div>
        </label>
        <label class="payment-card">
          <input type="radio" name="noncash-channel" value="VA BNI">
          <div class="payment-body"><strong>Virtual Account BNI</strong><span>Gunakan mobile banking atau ATM.</span></div>
        </label>
      </div>
      <div data-noncash-info style="margin-top: 14px;"></div>
    </section>
  `;
  renderNoncashInfo();
}

function renderNoncashInfo() {
  const target = document.querySelector("[data-noncash-info]");
  if (!target) return;
  const channel = document.querySelector("input[name='noncash-channel']:checked")?.value || "QRIS";
  const total = getCartSummary().total;

  const draft = createNoncashPaymentDraft(channel);
  const config = getNoncashChannelConfig(channel);

  if (config.type === "qris") {
    target.innerHTML = `
      <div class="qr-card">
        <div class="fake-qr" aria-label="QRIS Cafe 1994"></div>
        <div>
          <strong>${config.title}</strong>
          <p class="muted">Total ${formatMoney(total)} akan dibayar lewat QRIS. Tekan lanjut untuk membuka halaman verifikasi pembayaran.</p>
          <p class="helper">Referensi pembayaran: <strong>${draft.reference}</strong></p>
        </div>
      </div>
    `;
    return;
  }

  target.innerHTML = `
    <p class="muted">Nomor virtual account akan dipakai di halaman verifikasi pembayaran.</p>
    <div class="va-box">${draft.virtualAccount}</div>
    <p class="helper">Total tagihan: <strong>${formatMoney(total)}</strong></p>
  `;
}

function getCashDraft() {
  let current = null;
  try {
    const raw = sessionStorage.getItem(CASH_DRAFT_KEY);
    current = raw ? JSON.parse(raw) : null;
  } catch (error) {
    current = null;
  }

  if (current && current.expiresAt && Date.now() < current.expiresAt) return current;

  const draft = {
    code: makeOrderCode(),
    expiresAt: Date.now() + (10 * 60 * 1000)
  };
  sessionStorage.setItem(CASH_DRAFT_KEY, JSON.stringify(draft));
  return draft;
}

function startCashCountdown(expiresAt) {
  const timerNode = document.querySelector("[data-cash-timer]");
  const submitButton = document.querySelector("[data-create-order]");

  const tick = () => {
    const remaining = Math.max(0, expiresAt - Date.now());
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    if (timerNode) timerNode.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

    if (remaining <= 0) {
      window.clearInterval(countdownTimer);
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Waktu QR Habis";
      }
    } else if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = "Buat Pesanan Tunai";
    }
  };

  tick();
  countdownTimer = window.setInterval(tick, 1000);
}

function createOrderFromCheckout() {
  const method = document.querySelector("input[name='payment-method']:checked")?.value || "cash";
  const summary = getCartSummary();

  if (!summary.items.length) {
    window.location.href = "cart.html";
    return;
  }

  if (method === "cash") {
    const draft = getCashDraft();
    if (Date.now() > draft.expiresAt) {
      sessionStorage.removeItem(CASH_DRAFT_KEY);
      showToast("QR tunai sudah kedaluwarsa. Muat ulang checkout untuk membuat kode baru.");
      renderPaymentDetail();
      return;
    }

    const order = createOrder({
      paymentMethod: "cash",
      paymentChannel: "Tunai di Kasir",
      paymentStatus: "Menunggu verifikasi kasir",
      code: draft.code,
      expiresAt: draft.expiresAt
    });
    sessionStorage.removeItem(CASH_DRAFT_KEY);
    window.location.href = `success.html?code=${order.code}`;
    return;
  }

  const channel = document.querySelector("input[name='noncash-channel']:checked")?.value || "QRIS";
  createNoncashPaymentDraft(channel);
  window.location.href = `payment.html?channel=${encodeURIComponent(channel)}`;
}
