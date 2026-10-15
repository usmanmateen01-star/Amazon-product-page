const products = [
  { id: 'p1', title: 'Wireless Bluetooth Headphones', category: 'Mobiles', rating: 4.6, reviews: 12490, price: 39.99, oldPrice: 59.99, badge: 'Top deal', emoji: '🎧' },
  { id: 'p2', title: 'Smart LED Light Strip (16.4ft)', category: 'Home', rating: 4.4, reviews: 8020, price: 19.99, oldPrice: 29.99, badge: 'Best value', emoji: '💡' },
  { id: 'p3', title: 'Fitness Tracker with Heart Rate', category: 'Fashion', rating: 4.5, reviews: 5310, price: 24.5, oldPrice: 39.99, badge: 'New', emoji: '⌚' },
  { id: 'p4', title: 'Mechanical Keyboard - Blue Switch', category: 'Home', rating: 4.7, reviews: 2210, price: 49.0, oldPrice: 79.0, badge: 'Hot', emoji: '⌨️' },
  { id: 'p5', title: 'USB-C Fast Charger (30W)', category: 'Mobiles', rating: 4.3, reviews: 6100, price: 14.99, oldPrice: 22.99, badge: 'Quick ship', emoji: '⚡' },
  { id: 'p6', title: 'Cotton Casual T-Shirt (Pack of 3)', category: 'Fashion', rating: 4.2, reviews: 3305, price: 18.75, oldPrice: 27.5, badge: 'Popular', emoji: '👕' },
  { id: 'p7', title: 'Stainless Steel Water Bottle 1L', category: 'Home', rating: 4.6, reviews: 9800, price: 15.99, oldPrice: 24.99, badge: 'Deal', emoji: '🚰' },
  { id: 'p8', title: 'Portable Mini Fan - USB Recharge', category: 'Mobiles', rating: 4.1, reviews: 4100, price: 12.5, oldPrice: 19.99, badge: 'Lightweight', emoji: '🌀' },
  { id: 'p9', title: 'Sleek Minimalist Wallet', category: 'Fashion', rating: 4.4, reviews: 2500, price: 21.99, oldPrice: 34.99, badge: 'Limited', emoji: '👛' }
];

const state = {
  selectedCategory: 'All',
  sort: 'featured',
  minPrice: null,
  maxPrice: null,
  cart: new Map() // productId -> qty
};

const el = {
  grid: document.getElementById('productGrid'),
  searchInput: document.getElementById('searchInput'),
  searchBtn: document.getElementById('searchBtn'),
  resultsMeta: document.getElementById('resultsMeta'),

  categoryChips: document.getElementById('categoryChips'),
  sortSelect: document.getElementById('sortSelect'),
  minPrice: document.getElementById('minPrice'),
  maxPrice: document.getElementById('maxPrice'),
  applyFilters: document.getElementById('applyFilters'),
  clearFilters: document.getElementById('clearFilters'),

  cartToggle: document.getElementById('cartToggle'),
  cartClose: document.getElementById('cartClose'),
  cartOverlay: document.getElementById('cartOverlay'),
  cartDrawer: document.getElementById('cartDrawer'),
  cartCount: document.getElementById('cartCount'),
  cartItems: document.getElementById('cartItems'),
  cartSub: document.getElementById('cartSub'),
  cartTotal: document.getElementById('cartTotal'),
  checkoutBtn: document.getElementById('checkoutBtn')
};

function formatMoney(n){
  return new Intl.NumberFormat('en-US', { style:'currency', currency:'USD' }).format(n);
}

function getFilteredProducts(){
  const q = (el.searchInput.value || '').trim().toLowerCase();
  let out = products.slice();

  if (state.selectedCategory !== 'All'){
    out = out.filter(p => p.category === state.selectedCategory);
  }

  if (q){
    out = out.filter(p => p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
  }

  if (state.minPrice !== null){
    out = out.filter(p => p.price >= state.minPrice);
  }
  if (state.maxPrice !== null){
    out = out.filter(p => p.price <= state.maxPrice);
  }

  if (state.sort === 'priceAsc') out.sort((a,b) => a.price - b.price);
  if (state.sort === 'priceDesc') out.sort((a,b) => b.price - a.price);
  if (state.sort === 'ratingDesc') out.sort((a,b) => b.rating - a.rating);
  return out;
}

function renderCategoryChips(){
  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];
  el.categoryChips.innerHTML = '';
  for (const c of categories){
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'chip' + (c === state.selectedCategory ? ' chip--active' : '');
    btn.textContent = c;
    btn.addEventListener('click', () => {
      state.selectedCategory = c;
      renderCategoryChips();
      renderProducts();
    });
    el.categoryChips.appendChild(btn);
  }
}

function stars(r){
  return '★'.repeat(Math.round(r)) + '☆'.repeat(5 - Math.round(r));
}

function renderProducts(){
  const list = getFilteredProducts();
  el.grid.innerHTML = '';
  el.resultsMeta.textContent = `${list.length} product${list.length === 1 ? '' : 's'} found`;

  for (const p of list){
    const card = document.createElement('article');
    card.className = 'productCard';
    card.innerHTML = `
      <div class="productMedia">
        <div class="productMedia__badge">${p.badge}</div>
      <div class="productMedia__img" aria-hidden="true">
        <div class="productMedia__glyph">${p.emoji}</div>
      </div>

      </div>

      <div class="productBody">
        <div class="productTitle">${p.title}</div>
        <div class="productMeta">
          <div class="stars" title="Rating">${stars(p.rating).slice(0,5)}</div>
          <div>${p.rating.toFixed(1)} • ${p.reviews.toLocaleString()} reviews</div>
        </div>

        <div class="productPriceRow">
          <div>
            <div class="productPrice">${formatMoney(p.price)}</div>
            <div class="productOld">${formatMoney(p.oldPrice)}</div>
          </div>
        </div>

        <div class="productActions">
          <div class="qty">
            <button type="button" data-minus="${p.id}" aria-label="Decrease quantity">-</button>
            <span id="qty-${p.id}">1</span>
            <button type="button" data-plus="${p.id}" aria-label="Increase quantity">+</button>
          </div>
          <button class="addBtn" type="button" data-add="${p.id}">Add to cart</button>
        </div>
      </div>
    `;

    card.querySelector(`[data-add="${p.id}"]`).addEventListener('click', () => {
      const qtyEl = document.getElementById(`qty-${p.id}`);
      const qty = Math.max(1, parseInt(qtyEl.textContent, 10) || 1);
      addToCart(p.id, qty);
    });

    const minusBtn = card.querySelector(`[data-minus="${p.id}"]`);
    const plusBtn = card.querySelector(`[data-plus="${p.id}"]`);

    minusBtn.addEventListener('click', () => {
      const qtyEl = document.getElementById(`qty-${p.id}`);
      let q = parseInt(qtyEl.textContent, 10) || 1;
      q = Math.max(1, q - 1);
      qtyEl.textContent = String(q);
    });

    plusBtn.addEventListener('click', () => {
      const qtyEl = document.getElementById(`qty-${p.id}`);
      let q = parseInt(qtyEl.textContent, 10) || 1;
      q = Math.min(99, q + 1);
      qtyEl.textContent = String(q);
    });

    el.grid.appendChild(card);
  }
}

function cartCount(){
  let n = 0;
  for (const qty of state.cart.values()) n += qty;
  return n;
}

function addToCart(productId, qty){
  const cur = state.cart.get(productId) || 0;
  state.cart.set(productId, cur + qty);
  updateCartUI();
  openCart();
}

function updateCartUI(){
  el.cartCount.textContent = cartCount();
  renderCartItems();
}

function openCart(){
  el.cartDrawer.classList.add('isOpen');
  el.cartDrawer.setAttribute('aria-hidden', 'false');
}

function closeCart(){
  el.cartDrawer.classList.remove('isOpen');
  el.cartDrawer.setAttribute('aria-hidden', 'true');
}

function renderCartItems(){
  const entries = Array.from(state.cart.entries());

  if (entries.length === 0){
    el.cartSub.textContent = 'No items yet';
    el.cartItems.innerHTML = `<div class="resultsMeta" style="padding:10px 0">Add products to see them here.</div>`;
    el.cartTotal.textContent = formatMoney(0);
    return;
  }

  el.cartSub.textContent = `${entries.length} item type${entries.length === 1 ? '' : 's'}`;
  el.cartItems.innerHTML = '';

  let total = 0;

  for (const [id, qty] of entries){
    const p = products.find(x => x.id === id);
    if (!p) continue;
    total += p.price * qty;

    const row = document.createElement('div');
    row.className = 'cartItem';
    row.innerHTML = `
      <div class="cartItem__thumb" aria-hidden="true">${p.emoji}</div>
      <div>
        <div class="cartItem__name">${p.title}</div>
        <div class="cartItem__small">${formatMoney(p.price)} each</div>
      </div>
      <div class="cartItem__right">
        <div class="cartItem__price">${formatMoney(p.price * qty)}</div>
        <div class="cartItem__qty">
          <button type="button" data-dec="${id}" aria-label="Decrease">-</button>
          <span>${qty}</span>
          <button type="button" data-inc="${id}" aria-label="Increase">+</button>
        </div>
        <button class="cartItem__remove" type="button" data-remove="${id}">Remove</button>
      </div>
    `;

    row.querySelector(`[data-dec="${id}"]`).addEventListener('click', () => {
      const cur = state.cart.get(id) || 0;
      if (cur <= 1) state.cart.delete(id);
      else state.cart.set(id, cur - 1);
      updateCartUI();
    });

    row.querySelector(`[data-inc="${id}"]`).addEventListener('click', () => {
      const cur = state.cart.get(id) || 0;
      state.cart.set(id, Math.min(99, cur + 1));
      updateCartUI();
    });

    row.querySelector(`[data-remove="${id}"]`).addEventListener('click', () => {
      state.cart.delete(id);
      updateCartUI();
    });

    el.cartItems.appendChild(row);
  }

  el.cartTotal.textContent = formatMoney(total);
}

// Events
el.searchBtn.addEventListener('click', renderProducts);
el.searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') renderProducts();
});

el.sortSelect.addEventListener('change', () => {
  state.sort = el.sortSelect.value;
  renderProducts();
});

el.applyFilters.addEventListener('click', () => {
  const min = el.minPrice.value.trim();
  const max = el.maxPrice.value.trim();
  state.minPrice = min === '' ? null : Math.max(0, Number(min));
  state.maxPrice = max === '' ? null : Math.max(0, Number(max));
  renderProducts();
});

el.clearFilters.addEventListener('click', () => {
  state.selectedCategory = 'All';
  state.sort = 'featured';
  state.minPrice = null;
  state.maxPrice = null;
  el.sortSelect.value = 'featured';
  el.minPrice.value = '';
  el.maxPrice.value = '';
  el.searchInput.value = '';
  renderCategoryChips();
  renderProducts();
});

el.cartToggle.addEventListener('click', openCart);
el.cartClose.addEventListener('click', closeCart);
el.cartOverlay.addEventListener('click', closeCart);

el.checkoutBtn.addEventListener('click', () => {
  if (state.cart.size === 0) return;
  alert('Checkout is UI-only in this demo.');
});

// Init
renderCategoryChips();
renderProducts();
updateCartUI();

