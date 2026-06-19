let detailProduct = null;
let detailQty = 1;

document.addEventListener("DOMContentLoaded", () => {
  if (!requireTable()) return;
  renderBottomNav("menu");

  const params = new URLSearchParams(window.location.search);
  detailProduct = findProduct(params.get("id"));

  if (!detailProduct) {
    renderMissingProduct();
    return;
  }

  renderDetail();
  bindDetailEvents();
});

function renderMissingProduct() {
  const target = document.querySelector("[data-detail-root]");
  target.innerHTML = `
    <div class="container page-section">
      <div class="empty-card">
        <div class="empty-icon">☕</div>
        <h1>Produk tidak ditemukan</h1>
        <p class="muted">Menu ini tidak tersedia. Silakan kembali ke halaman menu untuk memilih produk lain.</p>
        <a class="primary-btn" href="menu.html">Kembali ke Menu</a>
      </div>
    </div>
  `;
}

function renderDetail() {
  const target = document.querySelector("[data-detail-root]");
  target.innerHTML = `
    <div class="container detail-layout">
      <section class="product-detail-card">
        <div class="detail-image">
          <img src="${detailProduct.image}" alt="${escapeAttr(detailProduct.name)}">
        </div>
      </section>
      <section class="product-info">
        <div class="eyebrow">${detailProduct.category} · ${detailProduct.subCategory}</div>
        <h1>${detailProduct.name}</h1>
        <p>${detailProduct.description}</p>
        <div class="stat-row">
          <div class="stat-card"><strong>${formatMoney(detailProduct.price)}</strong><span>Harga mulai</span></div>
          <div class="stat-card"><strong>${detailProduct.sold}x</strong><span>Dipesan</span></div>
          <div class="stat-card"><strong>${detailProduct.recommended ? "Ya" : "-"}</strong><span>Rekomendasi</span></div>
        </div>
        <div class="panel option-panel" data-detail-form>
          ${renderOptionFields(detailProduct, "detail")}
          <div class="option-group">
            <div class="option-title">Jumlah</div>
            <div class="quantity-row">
              <button class="qty-btn" type="button" data-detail-minus>-</button>
              <span class="qty-value" data-detail-qty>${detailQty}</span>
              <button class="qty-btn" type="button" data-detail-plus>+</button>
            </div>
          </div>
          <button class="primary-btn" type="button" data-detail-add>Tambah ke Keranjang</button>
          <a class="secondary-btn" href="menu.html">Kembali ke Menu</a>
        </div>
      </section>
    </div>
  `;

  updateDetailPrice();
}

function bindDetailEvents() {
  const root = document.querySelector("[data-detail-root]");

  root.addEventListener("change", updateDetailPrice);
  root.addEventListener("click", (event) => {
    if (event.target.closest("[data-detail-minus]")) {
      detailQty = Math.max(1, detailQty - 1);
      updateDetailPrice();
    }

    if (event.target.closest("[data-detail-plus]")) {
      detailQty += 1;
      updateDetailPrice();
    }

    if (event.target.closest("[data-detail-add]")) {
      const form = document.querySelector("[data-detail-form]");
      const options = collectOptions(form, "detail");
      addToCart(detailProduct.id, options, detailQty);
      window.location.href = "cart.html";
    }
  });
}

function updateDetailPrice() {
  if (!detailProduct) return;
  const form = document.querySelector("[data-detail-form]");
  const qtyNode = document.querySelector("[data-detail-qty]");
  const addButton = document.querySelector("[data-detail-add]");
  if (!form || !qtyNode || !addButton) return;

  const options = collectOptions(form, "detail");
  const total = calculateItemPrice(detailProduct, options) * detailQty;

  qtyNode.textContent = detailQty;
  addButton.textContent = `Tambah ${detailQty} · ${formatMoney(total)}`;
}
