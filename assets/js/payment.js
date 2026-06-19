let noncashCountdownTimer = null;

const CHANNEL_QUERY_MAP = {
  QRIS: "QRIS",
  "VA BCA": "VA BCA",
  "VA Mandiri": "VA Mandiri",
  "VA BNI": "VA BNI"
};

document.addEventListener("DOMContentLoaded", () => {
  if (!requireTable()) return;
  renderBottomNav("cart");
  renderPaymentVerificationPage();
  bindPaymentVerificationEvents();
});

function bindPaymentVerificationEvents() {
  document.addEventListener("click", (event) => {
    const verify = event.target.closest("[data-confirm-noncash]");
    const copy = event.target.closest("[data-copy-payment]");
    const refresh = event.target.closest("[data-refresh-payment]");

    if (verify) {
      confirmNoncashPayment();
    }

    if (copy) {
      copyPaymentValue(copy.dataset.copyPayment);
    }

    if (refresh) {
      const draft = createNoncashPaymentDraft(refresh.dataset.refreshPayment || "QRIS");
      showToast("Data pembayaran baru sudah dibuat.");
      renderPaymentVerificationPage(draft.channel);
    }
  });
}

function renderPaymentVerificationPage(preferredChannel = "") {
  const root = document.querySelector("[data-payment-root]");
  const summary = getCartSummary();
  window.clearInterval(noncashCountdownTimer);

  if (!summary.items.length) {
    root.innerHTML = `
      <div class="container page-section">
        <div class="empty-card">
          <div class="empty-icon">🧺</div>
          <h1>Keranjang kosong</h1>
          <p class="muted">Verifikasi pembayaran membutuhkan item pesanan yang belum diselesaikan.</p>
          <a class="primary-btn" href="menu.html">Pilih Menu</a>
        </div>
      </div>
    `;
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const queryChannel = CHANNEL_QUERY_MAP[params.get("channel")] || "";
  const savedDraft = getNoncashPaymentDraft();
  const selectedChannel = preferredChannel || queryChannel || savedDraft?.channel || "QRIS";
  const draft = savedDraft && savedDraft.channel === selectedChannel && Number(savedDraft.amount) === Number(summary.total)
    ? savedDraft
    : createNoncashPaymentDraft(selectedChannel);

  if (isPaymentDraftExpired(draft)) {
    root.innerHTML = renderExpiredPaymentHtml(draft);
    refreshHeaderState();
    return;
  }

  const config = getNoncashChannelConfig(draft.channel);
  root.innerHTML = `
    <div class="container page-section">
      <div class="page-title">
        <div>
          <h1>Verifikasi Pembayaran</h1>
          <p>Selesaikan pembayaran ${config.label}, lalu konfirmasi dengan tombol “Saya sudah bayar”.</p>
        </div>
        <span class="badge dark" data-table-badge>Meja</span>
      </div>
      <div class="checkout-layout">
        <main class="panel">
          <div class="payment-verification-head">
            <span class="badge success">Non Tunai</span>
            <h2>${config.title}</h2>
            <p class="muted">${config.description}</p>
          </div>
          ${config.type === "qris" ? renderQrisPaymentBlock(draft) : renderVirtualAccountPaymentBlock(draft, config)}
          ${renderPaymentInstructions(draft, config)}
          <section class="payment-detail active">
            <h3>Verifikasi Pembayaran</h3>
            <p class="muted">Setelah transaksi berhasil dari aplikasi bank/e-wallet, tekan tombol di bawah. Pada prototype frontend ini, tombol tersebut mensimulasikan pembayaran sudah valid dan pesanan langsung masuk antrean.</p>
            <button class="primary-btn" type="button" data-confirm-noncash>Saya sudah bayar</button>
            <a class="secondary-btn" href="checkout.html">Ubah metode pembayaran</a>
          </section>
        </main>
        <aside class="summary-card">
          ${renderPaymentSummary(summary, draft)}
        </aside>
      </div>
    </div>
  `;

  refreshHeaderState();
  startNoncashCountdown(draft.expiresAt);
}

function renderQrisPaymentBlock(draft) {
  return `
    <section class="payment-detail active">
      <h3>Scan QRIS</h3>
      <div class="qr-card payment-qr-card">
        <div class="fake-qr" aria-label="QRIS ${draft.reference}"></div>
        <div>
          <p class="muted">Buka aplikasi e-wallet atau mobile banking, pilih QRIS, lalu scan kode ini.</p>
          <div class="code-box">${draft.reference}</div>
          <p class="helper">Nominal wajib sesuai: <strong>${formatMoney(draft.amount)}</strong></p>
          <p class="helper">Berlaku sampai: <span class="timer" data-noncash-timer>15:00</span></p>
        </div>
      </div>
    </section>
  `;
}

function renderVirtualAccountPaymentBlock(draft, config) {
  return `
    <section class="payment-detail active">
      <h3>Transfer Virtual Account</h3>
      <p class="muted">Masukkan nomor berikut sebagai tujuan pembayaran ${config.label}.</p>
      <div class="copy-row">
        <div class="va-box">${draft.virtualAccount}</div>
        <button class="secondary-btn" type="button" data-copy-payment="${draft.virtualAccount}">Salin Nomor</button>
      </div>
      <div class="summary-line"><span>Nominal transfer</span><strong>${formatMoney(draft.amount)}</strong></div>
      <div class="summary-line"><span>Kode referensi</span><strong>${draft.reference}</strong></div>
      <p class="helper">Berlaku sampai: <span class="timer" data-noncash-timer>15:00</span></p>
    </section>
  `;
}

function renderPaymentInstructions(draft, config) {
  const methodText = config.type === "qris" ? "Scan QRIS yang muncul di halaman ini." : "Masukkan nomor virtual account sebagai tujuan pembayaran.";
  return `
    <section class="instruction-card">
      <h3>Instruksi</h3>
      <ol class="instruction-list">
        <li>${methodText}</li>
        <li>Pastikan nominal pembayaran sama persis dengan <strong>${formatMoney(draft.amount)}</strong>.</li>
        <li>Selesaikan transaksi di aplikasi bank/e-wallet.</li>
        <li>Tekan <strong>Saya sudah bayar</strong> untuk membuat pesanan dan masuk ke halaman status.</li>
      </ol>
    </section>
  `;
}

function renderPaymentSummary(summary, draft) {
  return `
    <h2>Ringkasan Bayar</h2>
    <div class="summary-line"><span>Metode</span><strong>${draft.channelLabel || draft.channel}</strong></div>
    <div class="summary-line"><span>Subtotal</span><strong>${formatMoney(summary.subtotal)}</strong></div>
    <div class="summary-line"><span>Biaya layanan</span><strong>${formatMoney(summary.service)}</strong></div>
    <div class="summary-line"><span>Total</span><strong class="summary-total">${formatMoney(summary.total)}</strong></div>
    <div class="checkout-list" style="margin-top: 14px;">
      ${summary.items.map(renderPaymentItem).join("")}
    </div>
    <div class="summary-actions">
      <a class="secondary-btn" href="checkout.html">Kembali ke Checkout</a>
    </div>
  `;
}

function renderPaymentItem(item) {
  const product = findProduct(item.productId);
  if (!product) return "";
  return `
    <article class="checkout-item compact-item">
      <img class="checkout-thumb" src="${product.image}" alt="${escapeAttr(product.name)}">
      <div class="item-copy">
        <div class="item-title">${product.name}</div>
        <div class="item-meta">${item.qty} × ${formatMoney(item.unitPrice)}</div>
      </div>
      <strong>${formatMoney(item.qty * item.unitPrice)}</strong>
    </article>
  `;
}

function renderExpiredPaymentHtml(draft) {
  const channel = draft?.channel || "QRIS";
  return `
    <div class="container page-section">
      <div class="empty-card">
        <div class="empty-icon">⏱️</div>
        <h1>Waktu pembayaran habis</h1>
        <p class="muted">Data pembayaran non-tunai sudah kedaluwarsa. Buat ulang nomor pembayaran sebelum melanjutkan.</p>
        <button class="primary-btn" type="button" data-refresh-payment="${escapeAttr(channel)}">Buat Ulang Pembayaran</button>
        <a class="secondary-btn" href="checkout.html">Kembali ke Checkout</a>
      </div>
    </div>
  `;
}

function startNoncashCountdown(expiresAt) {
  const timerNode = document.querySelector("[data-noncash-timer]");
  const confirmButton = document.querySelector("[data-confirm-noncash]");

  const tick = () => {
    const remaining = Math.max(0, Number(expiresAt) - Date.now());
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);

    if (timerNode) {
      timerNode.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }

    if (remaining <= 0) {
      window.clearInterval(noncashCountdownTimer);
      if (confirmButton) {
        confirmButton.disabled = true;
        confirmButton.textContent = "Waktu Pembayaran Habis";
      }
    }
  };

  tick();
  noncashCountdownTimer = window.setInterval(tick, 1000);
}

function confirmNoncashPayment() {
  const draft = getNoncashPaymentDraft();
  const summary = getCartSummary();

  if (!summary.items.length) {
    window.location.href = "cart.html";
    return;
  }

  if (isPaymentDraftExpired(draft)) {
    showToast("Waktu pembayaran sudah habis. Buat ulang data pembayaran.");
    renderPaymentVerificationPage(draft?.channel || "QRIS");
    return;
  }

  if (Number(draft.amount) !== Number(summary.total)) {
    showToast("Total keranjang berubah. Silakan ulangi dari checkout.");
    clearNoncashPaymentDraft();
    window.location.href = "checkout.html";
    return;
  }

  const order = createOrder({
    paymentMethod: "noncash",
    paymentChannel: draft.channelLabel || draft.channel,
    paymentStatus: "Dikonfirmasi pelanggan",
    paymentReference: draft.reference
  });

  clearNoncashPaymentDraft();
  window.location.href = `success.html?code=${order.code}`;
}

function copyPaymentValue(value) {
  if (!value) return;

  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(value).then(() => {
      showToast("Nomor pembayaran disalin.");
    }).catch(() => {
      showToast("Salin manual nomor pembayaran yang tampil.");
    });
    return;
  }

  showToast("Salin manual nomor pembayaran yang tampil.");
}
