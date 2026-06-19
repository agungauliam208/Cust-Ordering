let activeCategory = "all";
let activeSearch = "";
let modalProduct = null;
let modalQty = 1;

document.addEventListener("DOMContentLoaded", () => {
  if (!requireTable()) return;
  renderBottomNav("menu");
  renderCategories();
  renderProducts();
  bindMenuEvents();
});

function bindMenuEvents() {
  const searchInput = document.querySelector("[data-search]");
  const resetButton = document.querySelector("[data-reset-filter]");
  const modal = document.querySelector("[data-custom-modal]");

  searchInput.addEventListener("input", (event) => {
    activeSearch = event.target.value.trim().toLowerCase();
    renderProducts();
  });

  resetButton.addEventListener("click", () => {
    activeCategory = "all";
    activeSearch = "";
    searchInput.value = "";
    renderCategories();
    renderProducts();
  });

  modal.addEventListener("click", (event) => {
    if (event.target === modal || event.target.matches("[data-close-modal]")) closeModal();
  });

  modal.addEventListener("change", updateModalPrice);
  modal.addEventListener("click", (event) => {
    const minus = event.target.closest("[data-modal-minus]");
    const plus = event.target.closest("[data-modal-plus]");
    const add = event.target.closest("[data-modal-add]");

    if (minus) {
      modalQty = Math.max(1, modalQty - 1);
      updateModalPrice();
    }
    if (plus) {
      modalQty += 1;
      updateModalPrice();
    }
    if (add && modalProduct) {
      const options = collectOptions(modal, "modal");
      addToCart(modalProduct.id, options, modalQty);
      closeModal();
      renderProducts();
      renderBottomNav("menu");
    }
  });
}

function renderCategories() {
  const target = document.querySelector("[data-categories]");
  target.innerHTML = CAFE_CATEGORIES.map((category) => `
    <button class="category-btn ${activeCategory === category.id ? "active" : ""}" type="button" data-category="${category.id}">
      ${category.label}
    </button>
  `).join("");

  target.querySelectorAll("[data-category]").forEach((button) => {
    button.addEventListener("click", () => {
      activeCategory = button.dataset.category;
      renderCategories();
      renderProducts();
    });
  });
}

function getFilteredProducts() {
  return CAFE_PRODUCTS
    .filter((product) => activeCategory === "all" || product.filter.includes(activeCategory))
    .filter((product) => {
      if (!activeSearch) return true;
      const haystack = `${product.name} ${product.category} ${product.subCategory} ${product.description}`.toLowerCase();
      return haystack.includes(activeSearch);
    })
    .sort((a, b) => {
      if (activeCategory === "recommended") return Number(b.sold || 0) - Number(a.sold || 0);
      return Number(b.recommended || 0) - Number(a.recommended || 0) || Number(b.sold || 0) - Number(a.sold || 0);
    });
}

function renderProducts() {
  const grid = document.querySelector("[data-product-grid]");
  const count = document.querySelector("[data-product-count]");
  const products = getFilteredProducts();

  count.textContent = `${products.length} menu tersedia`;

  if (!products.length) {
    grid.innerHTML = `
      <div class="empty-card" style="grid-column: 1 / -1;">
        <div class="empty-icon">🔎</div>
        <h2>Menu tidak ditemukan</h2>
        <p class="muted">Coba pakai kata kunci lain atau pilih kategori yang berbeda.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = products.map((product) => `
    <article class="product-card" data-product-card="${product.id}" tabindex="0" role="button" aria-label="Lihat detail ${escapeAttr(product.name)}">
      <div class="product-image-wrap">
        <img src="${product.image}" alt="${escapeAttr(product.name)}">
      </div>
      <div class="product-tags">
        ${product.recommended ? `<span class="badge dark">Favorit</span>` : ""}
        ${product.promo ? `<span class="badge">Promo</span>` : ""}
      </div>
      <div class="product-copy">
        <div class="product-name-row">
          <div>
            <div class="product-name">${product.name}</div>
            <div class="product-category">${product.category} · ${product.subCategory}</div>
          </div>
        </div>
        <p class="product-desc">${product.description}</p>
      </div>
      <div class="product-bottom">
        <div>
          <div class="price">${formatMoney(product.price)}</div>
          <div class="helper">${product.sold}x dipesan</div>
        </div>
        <button class="add-btn" type="button" data-quick-add="${product.id}" aria-label="Tambah ${escapeAttr(product.name)}">+</button>
      </div>
    </article>
  `).join("");

  grid.querySelectorAll("[data-product-card]").forEach((card) => {
    card.addEventListener("click", () => {
      window.location.href = `detail.html?id=${card.dataset.productCard}`;
    });

    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter") window.location.href = `detail.html?id=${card.dataset.productCard}`;
    });
  });

  grid.querySelectorAll("[data-quick-add]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const product = findProduct(button.dataset.quickAdd);
      openModal(product);
    });
  });
}

function openModal(product) {
  modalProduct = product;
  modalQty = 1;
  const modal = document.querySelector("[data-custom-modal]");
  const body = modal.querySelector("[data-modal-body]");

  body.innerHTML = `
    <div class="modal-head">
      <div>
        <div class="modal-title">${product.name}</div>
        <p class="muted">Pilih detail pesanan sebelum masuk ke keranjang.</p>
      </div>
      <button class="close-btn" type="button" data-close-modal aria-label="Tutup">×</button>
    </div>
    <div class="option-panel">
      ${renderOptionFields(product, "modal")}
      <div class="option-group">
        <div class="option-title">Jumlah</div>
        <div class="quantity-row">
          <button class="qty-btn" type="button" data-modal-minus>-</button>
          <span class="qty-value" data-modal-qty>${modalQty}</span>
          <button class="qty-btn" type="button" data-modal-plus>+</button>
        </div>
      </div>
      <button class="primary-btn" type="button" data-modal-add data-modal-total>Tambah ke Keranjang</button>
    </div>
  `;

  modal.classList.add("active");
  updateModalPrice();
}

function closeModal() {
  document.querySelector("[data-custom-modal]").classList.remove("active");
  modalProduct = null;
}

function updateModalPrice() {
  const modal = document.querySelector("[data-custom-modal]");
  if (!modalProduct || !modal.classList.contains("active")) return;

  const qtyNode = modal.querySelector("[data-modal-qty]");
  const totalButton = modal.querySelector("[data-modal-total]");
  const options = collectOptions(modal, "modal");
  const total = calculateItemPrice(modalProduct, options) * modalQty;

  qtyNode.textContent = modalQty;
  totalButton.textContent = `Tambah ${modalQty} · ${formatMoney(total)}`;
}
