document.addEventListener("DOMContentLoaded", () => {
  if (!requireTable()) return;
  renderBottomNav("cart");
  renderCartPage();
  bindCartEvents();
});

function bindCartEvents() {
  document.addEventListener("click", (event) => {
    const plus = event.target.closest("[data-cart-plus]");
    const minus = event.target.closest("[data-cart-minus]");
    const remove = event.target.closest("[data-cart-remove]");

    if (plus) {
      const item = getCart().find((cartItem) => cartItem.id === plus.dataset.cartPlus);
      if (item) updateCartItem(item.id, item.qty + 1);
      renderCartPage();
      renderBottomNav("cart");
    }

    if (minus) {
      const item = getCart().find((cartItem) => cartItem.id === minus.dataset.cartMinus);
      if (item) updateCartItem(item.id, item.qty - 1);
      renderCartPage();
      renderBottomNav("cart");
    }

    if (remove) {
      removeCartItem(remove.dataset.cartRemove);
      renderCartPage();
      renderBottomNav("cart");
      showToast("Item berhasil dihapus dari keranjang.");
    }
  });
}

function renderCartPage() {
  const list = document.querySelector("[data-cart-list]");
  const summary = document.querySelector("[data-cart-summary]");
  const page = document.querySelector("[data-cart-page]");
  const data = getCartSummary();

  if (!data.items.length) {
    page.innerHTML = `
      <div class="container page-section">
        <div class="empty-card">
          <div class="empty-icon">🧺</div>
          <h1>Keranjang masih kosong</h1>
          <p class="muted">Silakan pilih menu dulu sebelum melanjutkan ke checkout.</p>
          <a class="primary-btn" href="menu.html">Lihat Menu</a>
        </div>
      </div>
    `;
    return;
  }

  list.innerHTML = data.items.map((item) => {
    const product = findProduct(item.productId);
    if (!product) return "";

    return `
      <article class="cart-item">
        <img class="cart-thumb" src="${product.image}" alt="${escapeAttr(product.name)}">
        <div class="item-copy">
          <div class="item-title">${product.name}</div>
          <div class="item-meta">${optionText(item.options)}</div>
          ${item.options?.note ? `<div class="item-note">Catatan: ${escapeHtml(item.options.note)}</div>` : ""}
          <div class="price">${formatMoney(item.unitPrice)} / item</div>
        </div>
        <div class="item-actions">
          <div class="quantity-row">
            <button class="qty-btn" type="button" data-cart-minus="${item.id}">-</button>
            <span class="qty-value">${item.qty}</span>
            <button class="qty-btn" type="button" data-cart-plus="${item.id}">+</button>
          </div>
          <button class="danger-btn" type="button" data-cart-remove="${item.id}">Hapus</button>
        </div>
      </article>
    `;
  }).join("");

  summary.innerHTML = renderSummaryCard(data, true);
}

function renderSummaryCard(data, showCheckout) {
  return `
    <h2>Ringkasan</h2>
    <div class="summary-line"><span>Subtotal</span><strong>${formatMoney(data.subtotal)}</strong></div>
    <div class="summary-line"><span>Biaya layanan</span><strong>${formatMoney(data.service)}</strong></div>
    <div class="summary-line"><span>Total</span><strong class="summary-total">${formatMoney(data.total)}</strong></div>
    <div class="summary-actions">
      <a class="secondary-btn" href="menu.html">Tambah Menu</a>
      ${showCheckout ? `<a class="primary-btn" href="checkout.html">Lanjut Bayar</a>` : ""}
    </div>
  `;
}
