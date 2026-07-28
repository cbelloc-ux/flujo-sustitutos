function loadAllowSubstitutes() {
  return localStorage.getItem('heb-allow-substitutes') !== 'false';
}
let allowSubstitutes = loadAllowSubstitutes();

function toggleAllowSubstitutes() {
  allowSubstitutes = !allowSubstitutes;
  localStorage.setItem('heb-allow-substitutes', String(allowSubstitutes));
  syncToggleUI();
  cartItems().filter(item => isSubstituteEligible(item.product)).forEach(item => renderCartNotice(item.id));
}

function syncToggleUI() {
  // Dos instancias en el DOM (mobile inline / desktop en el sidebar); se mantienen sincronizadas.
  document.querySelectorAll('.toggle-switch').forEach(toggle => {
    toggle.classList.toggle('off', !allowSubstitutes);
    toggle.setAttribute('aria-pressed', String(allowSubstitutes));
  });
}

function openCartSubstitute(id) {
  if (!allowSubstitutes) return;
  openSubstituteModal(id);
}

function renderCartNotice(id) {
  const media = document.getElementById('cartNoticeMedia-' + id);
  const title = document.getElementById('cartNoticeTitle-' + id);
  const desc = document.getElementById('cartNoticeDesc-' + id);
  const cta = document.getElementById('cartNoticeCta-' + id);
  const notice = document.getElementById('cartNotice-' + id);
  if (!notice) return;

  notice.classList.toggle('disabled', !allowSubstitutes);
  cta.classList.toggle('disabled', !allowSubstitutes);

  if (!allowSubstitutes) {
    media.innerHTML = `<div class="sub-notice-icon-wrap">${CART_ICON_BLOCK}</div>`;
    title.textContent = '¿Qué enviamos si se agota?';
    desc.textContent = 'No quiero sustituto';
    return;
  }

  const label = substituteLabel(savedSubstitutes[id]);
  if (!label) {
    media.innerHTML = `<div class="sub-notice-icon-wrap">${CART_ICON_CACHED}</div>`;
    title.textContent = '¿Qué enviamos si se agota?';
    desc.textContent = 'Si no contesto, que el recolector elija por mi un producto similar en precio y características.';
    return;
  }

  if (label.title === 'No reemplazar') {
    media.innerHTML = `<div class="sub-notice-icon-wrap">${CART_ICON_BLOCK}</div>`;
    title.textContent = '¿Qué enviamos si se agota?';
    desc.textContent = label.desc;
    return;
  }

  media.innerHTML = `<img src="${label.img}" alt="${label.title}">`;
  title.textContent = '¿Qué enviamos si se agota?';
  desc.innerHTML = `${label.title} · ${label.qty} pza · <s>${money(label.totalPriceOld)}</s> <b>${money(label.totalPrice)}</b>`;
}

const CART_ICON_CACHED = '<span class="msi" aria-hidden="true" style="font-size:20px; color:#655f52">cached</span>';
const CART_ICON_BLOCK = '<span class="msi" aria-hidden="true" style="font-size:20px; color:#655f52">block</span>';

function openSavingsSheet() {
  document.getElementById('savingsOverlay').hidden = false;
  document.getElementById('savingsSheet').hidden = false;
}

function closeSavingsSheet() {
  document.getElementById('savingsOverlay').hidden = true;
  document.getElementById('savingsSheet').hidden = true;
}

function positionInfoTooltip(btn, tooltip) {
  const card = btn.closest('.toggle-card');
  const arrow = tooltip.querySelector('.info-tooltip-arrow');
  const cardRect = card.getBoundingClientRect();
  const iconRect = btn.getBoundingClientRect();
  const iconCenter = iconRect.left + iconRect.width / 2 - cardRect.left;
  const tooltipLeft = tooltip.offsetLeft;
  const tooltipWidth = tooltip.offsetWidth;
  const arrowLeft = Math.min(Math.max(iconCenter - tooltipLeft - 8, 12), tooltipWidth - 28);
  arrow.style.left = arrowLeft + 'px';
}

function toggleInfoTooltip(btn) {
  const tooltip = btn.nextElementSibling;
  const willOpen = tooltip.hidden;
  document.querySelectorAll('.info-tooltip').forEach(t => {
    t.hidden = true;
    t.previousElementSibling.setAttribute('aria-expanded', 'false');
  });
  if (willOpen) {
    tooltip.hidden = false;
    positionInfoTooltip(btn, tooltip);
  }
  btn.setAttribute('aria-expanded', String(willOpen));
}

function closeInfoTooltip(btn) {
  const wrap = btn.closest('.info-tooltip-wrap');
  wrap.querySelector('.info-tooltip').hidden = true;
  wrap.querySelector('.info-icon').setAttribute('aria-expanded', 'false');
}

document.addEventListener('click', (e) => {
  if (e.target.closest('.info-tooltip-wrap')) return;
  document.querySelectorAll('.info-tooltip:not([hidden])').forEach(t => {
    t.hidden = true;
    t.previousElementSibling.setAttribute('aria-expanded', 'false');
  });
});

window.addEventListener('resize', () => {
  const openTooltip = document.querySelector('.info-tooltip:not([hidden])');
  if (openTooltip) positionInfoTooltip(openTooltip.previousElementSibling, openTooltip);
});

/* ══ Carrito dinámico — refleja lo agregado desde PLP/PDP/sustitutos (plpQty) ══ */
function money(n) {
  return '$' + n.toFixed(2);
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

// Productos realmente en el carrito, en cualquier lista (catálogo o sustitutos/similares).
function cartItems() {
  return Object.keys(plpQty)
    .filter(id => plpQty[id] > 0)
    .map(id => ({ id, qty: plpQty[id], product: getAnyProduct(id) }))
    .filter(item => item.product);
}

function clearCart() {
  Object.keys(plpQty).forEach(id => { plpQty[id] = 0; });
  Object.keys(savedSubstitutes).forEach(id => { delete savedSubstitutes[id]; });
  persistSubstitutes();
  persistCartQty();
}

function cartLineHtml(item) {
  const { id, qty, product } = item;
  const eligible = isSubstituteEligible(product);
  const lineTotal = parsePrice(product.price) * qty;
  const leftIcon = qty === 1
    ? '<span class="msi" aria-hidden="true" style="font-size:18px">delete</span>'
    : '−';
  return `
    <div class="product-card" data-product-id="${id}">
      <div class="product-img-wrap">
        <img src="${product.img}" alt="${product.name}">
      </div>
      <div class="product-info">
        <div class="product-name">${product.name}</div>
        <div class="stepper">
          <button class="st-btn" onclick="changeQty('${id}',-1)" aria-label="${qty === 1 ? 'Quitar del carrito' : 'Disminuir'}">${leftIcon}</button>
          <span class="st-val" data-unit="${product.unit}">${qty} ${unitLabel(product)}</span>
          <button class="st-btn" onclick="changeQty('${id}',1)" aria-label="Aumentar">+</button>
        </div>
      </div>
      <div class="price-col">
        <span class="price-main">${money(lineTotal)}</span>
        <span class="price-unit">${product.price} / Pza</span>
      </div>
      <button class="dots-btn" aria-label="Más opciones">
        <span class="msi" aria-hidden="true">more_horiz</span>
      </button>
      ${eligible ? `
        <button type="button" class="sub-notice" id="cartNotice-${id}" onclick="openCartSubstitute('${id}')">
          <div class="sub-notice-media" id="cartNoticeMedia-${id}"></div>
          <div class="sub-notice-text">
            <span class="sub-notice-label" id="cartNoticeTitle-${id}"></span>
            <span class="sub-notice-desc" id="cartNoticeDesc-${id}"></span>
          </div>
          <span class="cambiar-btn" id="cartNoticeCta-${id}">Cambiar</span>
        </button>
      ` : ''}
    </div>
  `;
}

function renderSavingsBreakdown(items) {
  const container = document.getElementById('savingsBreakdown');
  if (!container) return;
  const rows = items
    .map(({ product, qty }) => ({ product, saved: Math.max(0, parsePrice(product.priceOld) - parsePrice(product.price)) * qty }))
    .filter(row => row.saved > 0);

  if (!rows.length) {
    container.innerHTML = '<p class="savings-row-title">Aún no tienes ahorros en tu carrito.</p>';
    return;
  }
  container.innerHTML = rows.map(row => `
    <div class="savings-row savings-row-line">
      <div class="savings-row-main">
        <span class="savings-row-title">${row.product.name}</span>
        <span class="savings-row-amount">-${money(row.saved)}</span>
      </div>
    </div>
  `).join('');
}

function renderCartPage() {
  const list = document.getElementById('cartItemsList');
  if (!list) return; // no estamos en cart.html

  const items = cartItems();
  const empty = document.getElementById('cartEmptyState');
  list.innerHTML = items.map(cartLineHtml).join('');
  if (empty) empty.hidden = items.length > 0;

  items.filter(item => isSubstituteEligible(item.product)).forEach(item => renderCartNotice(item.id));

  const subtotal = items.reduce((sum, { product, qty }) => sum + parsePrice(product.price) * qty, 0);
  const savings = items.reduce((sum, { product, qty }) => sum + Math.max(0, parsePrice(product.priceOld) - parsePrice(product.price)) * qty, 0);
  const eligibleCount = items.filter(item => isSubstituteEligible(item.product)).length;

  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = `(${items.length} producto${items.length === 1 ? '' : 's'})`;
  });
  setText('cartSavingsValue', money(savings));
  setText('cartSubtotalValue', money(subtotal));
  setText('cartPromoSavings', money(savings));
  setText('cartTotalValue', money(subtotal));
  setText('cartAhorroBar', money(savings));
  setText('cartSubtotalBar', money(subtotal));
  setText('cartAhorroSheetTitle', money(savings));

  document.querySelectorAll('.toggle-desc').forEach(el => {
    el.textContent = eligibleCount > 0
      ? `${eligibleCount} de sus productos admite${eligibleCount === 1 ? '' : 'n'} sustitutos.`
      : 'Ninguno de sus productos admite sustitutos por ahora.';
  });

  renderSavingsBreakdown(items);
}

document.addEventListener('DOMContentLoaded', () => {
  syncToggleUI();
  renderCartPage();
});
