let currentOrderCode = "";
let orderRefreshTimer = null;

document.addEventListener("DOMContentLoaded", () => {
  renderBottomNav("order");
  renderRecentOrders();
  bindOrderEvents();

  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  if (code) {
    const input = document.querySelector("[data-order-code-input]");
    input.value = code;
    renderOrderResult(code);
  }
});

function bindOrderEvents() {
  const form = document.querySelector("[data-order-form]");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const code = document.querySelector("[data-order-code-input]").value.trim();
    renderOrderResult(code);
  });

  document.addEventListener("click", (event) => {
    const recent = event.target.closest("[data-open-recent]");
    const verify = event.target.closest("[data-verify-cash]");

    if (recent) {
      const code = recent.dataset.openRecent;
      document.querySelector("[data-order-code-input]").value = code;
      renderOrderResult(code);
    }

    if (verify) {
      const updated = verifyCashOrder(verify.dataset.verifyCash);
      if (updated) {
        showToast("Pembayaran tunai berhasil diverifikasi dalam mode demo.");
        renderOrderResult(updated.code);
        renderRecentOrders();
      }
    }
  });
}

function renderRecentOrders() {
  const target = document.querySelector("[data-recent-orders]");
  const orders = getOrders().slice(0, 4);

  if (!orders.length) {
    target.innerHTML = `<p class="muted">Belum ada pesanan tersimpan di perangkat ini.</p>`;
    return;
  }

  target.innerHTML = orders.map((order) => {
    const status = getOrderStatus(order);
    return `
      <button class="payment-body" type="button" data-open-recent="${order.code}">
        <strong>${order.code} · Meja ${order.table}</strong>
        <span>${status.title} · ${formatMoney(order.total)}</span>
      </button>
    `;
  }).join("");
}

function renderOrderResult(code) {
  const target = document.querySelector("[data-order-result]");
  const order = findOrder(code);
  currentOrderCode = code;
  window.clearInterval(orderRefreshTimer);

  if (!code) {
    target.innerHTML = `
      <div class="empty-card">
        <div class="empty-icon">⌨️</div>
        <h2>Masukkan kode pesanan</h2>
        <p class="muted">Kode muncul setelah checkout selesai.</p>
      </div>
    `;
    return;
  }

  if (!order) {
    target.innerHTML = `
      <div class="empty-card">
        <div class="empty-icon">🧐</div>
        <h2>Kode tidak ditemukan</h2>
        <p class="muted">Periksa kembali kode pesanan yang kamu masukkan.</p>
      </div>
    `;
    return;
  }

  target.innerHTML = buildOrderResultHtml(order);
  orderRefreshTimer = window.setInterval(() => {
    const freshOrder = findOrder(currentOrderCode);
    if (freshOrder) target.innerHTML = buildOrderResultHtml(freshOrder);
  }, 30000);
}

function buildOrderResultHtml(order) {
  const status = getOrderStatus(order);
  const timeline = statusTimeline(order);
  const cashAction = order.status === "waiting_cash" && status.key !== "expired" ? `
    <div class="payment-detail active">
      <h3>Verifikasi Tunai</h3>
      <div class="qr-card">
        <div class="fake-qr" aria-label="QR tunai ${order.code}"></div>
        <div>
          <p class="muted">Untuk prototipe frontend, tombol ini mensimulasikan kasir sudah menerima pembayaran.</p>
          <div class="code-box">${order.code}</div>
          <button class="primary-btn" type="button" data-verify-cash="${order.code}" style="margin-top: 12px;">Verifikasi Kasir Demo</button>
        </div>
      </div>
    </div>
  ` : "";

  return `
    <section class="status-card">
      <div class="eyebrow">Status Pesanan</div>
      <h2 style="font-size: clamp(28px, 4vw, 42px); margin: 12px 0 6px; letter-spacing: -0.04em;">${status.title}</h2>
      <p class="muted">${status.description}</p>
      <div style="height: 14px;"></div>
      <div class="summary-line"><span>Kode</span><strong>${order.code}</strong></div>
      <div class="summary-line"><span>Meja</span><strong>${order.table}</strong></div>
      <div class="summary-line"><span>Pembayaran</span><strong>${order.paymentChannel}</strong></div>
      ${order.paymentReference ? `<div class="summary-line"><span>Referensi</span><strong>${order.paymentReference}</strong></div>` : ""}
      <div class="summary-line"><span>Total</span><strong>${formatMoney(order.total)}</strong></div>
      ${cashAction}
      <h3 style="margin-top: 18px;">Alur Pesanan</h3>
      <div class="timeline">
        ${timeline.map((step, index) => `
          <div class="timeline-item ${step.state}">
            <div class="timeline-dot">${index + 1}</div>
            <div class="timeline-copy">
              <strong>${step.title}</strong>
              <span>${step.desc}</span>
            </div>
          </div>
        `).join("")}
      </div>
    </section>
    <section class="summary-card">
      <h2>Item Pesanan</h2>
      <div class="checkout-list">
        ${order.items.map(renderOrderItem).join("")}
      </div>
    </section>
  `;
}

function renderOrderItem(item) {
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
