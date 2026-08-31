// Tri-estado: null = sin preferencia general elegida todavía (ningún botón se ve
// seleccionado); true = "Contactarme"; false = "No reemplazar". No se persiste entre
// cargas: es una acción rápida de "aplicar a todos", no una preferencia guardada (lo que
// sí persiste es el ajuste individual de cada producto, en savedSubstitutes).
let allowSubstitutes = null;
let pendingAllowSubstitutesValue = null;

// El toggle es un reset general: sobreescribe el ajuste individual de TODOS los productos
// elegibles del carrito con la opción recién elegida. Si alguno ya tenía uno definido,
// se advierte antes de aplicarlo (se puede volver a personalizar después con "Cambiar").
// Volver a hacer clic en la opción ya activa la deselecciona (sin tocar los productos).
function requestAllowSubstitutes(value) {
  if (allowSubstitutes === value) {
    allowSubstitutes = null;
    syncToggleUI();
    return;
  }
  // "No reemplazar" no es un sustituto que se pierda: si ya es lo que el producto tiene
  // definido, sobreescribirlo con la misma idea no amerita la advertencia.
  const hasIndividualChoices = cartItems()
    .filter(item => isSubstituteEligible(item.product))
    .some(item => savedSubstitutes[item.id] && savedSubstitutes[item.id].type !== 'none');
  if (hasIndividualChoices) {
    pendingAllowSubstitutesValue = value;
    const overlay = document.getElementById('allowSubOverlay');
    overlay.hidden = false;
    document.getElementById('allowSubDialog').hidden = false;
    void overlay.offsetHeight;
    overlay.classList.add('open');
    return;
  }
  setAllowSubstitutes(value);
}

function confirmAllowSubstitutesChange() {
  if (pendingAllowSubstitutesValue !== null) setAllowSubstitutes(pendingAllowSubstitutesValue);
  closeAllowSubstitutesWarning();
}

function closeAllowSubstitutesWarning() {
  document.getElementById('allowSubOverlay').classList.remove('open');
  document.getElementById('allowSubOverlay').hidden = true;
  document.getElementById('allowSubDialog').hidden = true;
  pendingAllowSubstitutesValue = null;
}

function setAllowSubstitutes(value) {
  allowSubstitutes = value;
  const eligibleItems = cartItems().filter(item => isSubstituteEligible(item.product));
  eligibleItems.forEach(item => {
    savedSubstitutes[item.id] = { type: value ? 'contact' : 'none' };
  });
  persistSubstitutes();
  syncToggleUI();
  eligibleItems.forEach(item => refreshProductUI(item.id));
}

function syncToggleUI() {
  // Dos instancias en el DOM (mobile inline / desktop en el sidebar); se mantienen sincronizadas.
  // allowSubstitutes null (sin elegir todavía) no marca ninguno de los dos como activo.
  document.querySelectorAll('.toggle-segment-btn').forEach(btn => {
    const isContact = btn.dataset.choice === 'contact';
    const active = allowSubstitutes !== null && isContact === allowSubstitutes;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', String(active));
  });
}

function openCartSubstitute(id) {
  openSubstituteModal(id);
}

function renderCartNotice(id) {
  const media = document.getElementById('cartNoticeMedia-' + id);
  const title = document.getElementById('cartNoticeTitle-' + id);
  const desc = document.getElementById('cartNoticeDesc-' + id);
  const notice = document.getElementById('cartNotice-' + id);
  if (!notice) return;

  // "Cambiar" siempre queda habilitado: aunque la preferencia general sea "No reemplazar",
  // el ajuste individual por producto (savedSubstitutes[id]) tiene prioridad sobre ella.
  const selection = savedSubstitutes[id];
  const label = substituteLabel(selection);
  if (label) {
    if (selection.type === 'product') {
      media.innerHTML = `<img src="${label.img}" alt="${label.title}">`;
      title.innerHTML = renderSubstituteNoticeHeader(id) + '¿Qué enviamos si se agota?';
      desc.innerHTML = `${label.title} · ${label.qty} pza · <s>${money(label.totalPriceOld)}</s> <b>${money(label.totalPrice)}</b>`;
      return;
    }
    media.innerHTML = `<div class="sub-notice-icon-wrap">${CART_NOTICE_ICONS[selection.type]}</div>`;
    title.textContent = '¿Qué enviamos si se agota?';
    desc.textContent = label.desc;
    return;
  }

  if (allowSubstitutes === false) {
    media.innerHTML = `<div class="sub-notice-icon-wrap">${CART_ICON_BLOCK}</div>`;
    title.textContent = '¿Qué enviamos si se agota?';
    desc.textContent = 'No quiero sustituto';
    return;
  }

  media.innerHTML = `<div class="sub-notice-icon-wrap">${CART_ICON_CACHED}</div>`;
  title.textContent = '¿Qué enviamos si se agota?';
  desc.textContent = 'Si no contesto, que el recolector elija por mi un producto similar en precio y características.';
}

const CART_ICON_CACHED = '<span class="msi" aria-hidden="true" style="font-size:20px; color:#655f52">cached</span>';
const CART_ICON_BLOCK = '<span class="msi" aria-hidden="true" style="font-size:20px; color:#655f52">block</span>';
const CART_NOTICE_ICONS = {
  none: CART_ICON_BLOCK,
  contact: '<span class="msi msi-fill" aria-hidden="true" style="font-size:20px; color:#655f52">chat</span>',
  picker: '<span class="msi" aria-hidden="true" style="font-size:20px; color:#655f52">emoji_people</span>',
};

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
  const promotionBadge = product.badgePink ? `<span class="cart-item-badge">${product.badgePink}</span>` : '';
  const combolocoLabel = product.badgePink ? `<div class="cart-product-status">Comboloco aplicado <span class="msi" style="font-size:16px;">done</span></div>` : '';
  return `
    <div class="product-card" data-product-id="${id}" data-promotion="${product.badgePink ? 'promoted' : 'regular'}">
      ${combolocoLabel}
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

function renderSubstituteNoticeHeader(id) {
  const selection = savedSubstitutes[id];
  if (selection && selection.type === 'product' && selection.badgePink) {
    return `<div class="sub-notice-badge">${selection.badgePink}</div>`;
  }
  return '';
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

  if (items.length === 0) {
    list.innerHTML = '';
    if (empty) empty.hidden = false;
  } else {
    const promotedItems = items.filter(item => item.product.badgePink);
    const regularItems = items.filter(item => !item.product.badgePink);

    let html = '';

    if (promotedItems.length > 0) {
      html += '<div class="cart-section">';
      html += '<h3 class="cart-section-title">Ahorro en promociones</h3>';
      html += promotedItems.map(cartLineHtml).join('');
      html += '</div>';
    }

    if (regularItems.length > 0) {
      html += '<div class="cart-section">';
      html += regularItems.map(cartLineHtml).join('');
      html += '</div>';
    }

    list.innerHTML = html;
    if (empty) empty.hidden = true;
  }

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
