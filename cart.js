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
  const badge = document.getElementById('cartNoticeBadge-' + id);
  const productTitle = document.getElementById('cartNoticeProductTitle-' + id);
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
      title.textContent = '¿Qué enviamos si se agota?';
      badge.innerHTML = selection.badgePink ? `${selection.badgePink}` : '';
      productTitle.textContent = label.title;
      desc.innerHTML = `${label.qty} pza · <s>${money(label.totalPriceOld)}</s> <b>${money(label.totalPrice)}</b>`;
      return;
    }
    media.innerHTML = `<div class="sub-notice-icon-wrap">${CART_NOTICE_ICONS[selection.type]}</div>`;
    title.textContent = '¿Qué enviamos si se agota?';
    badge.textContent = '';
    productTitle.textContent = '';
    desc.textContent = label.desc;
    return;
  }

  if (allowSubstitutes === false) {
    media.innerHTML = `<div class="sub-notice-icon-wrap">${CART_ICON_BLOCK}</div>`;
    title.textContent = '¿Qué enviamos si se agota?';
    badge.textContent = '';
    productTitle.textContent = '';
    desc.textContent = 'No quiero sustituto';
    return;
  }

  media.innerHTML = `<div class="sub-notice-icon-wrap">${CART_ICON_CACHED}</div>`;
  title.textContent = '¿Qué enviamos si se agota?';
  badge.textContent = '';
  productTitle.textContent = '';
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

function showUnselectedSubstitutesConfirmation() {
  const overlay = document.getElementById('unselectedSubsOverlay');
  const dialog = document.getElementById('unselectedSubsDialog');
  overlay.hidden = false;
  dialog.hidden = false;
  void overlay.offsetHeight;
  overlay.classList.add('open');
}

function closeUnselectedSubstitutesConfirmation() {
  const overlay = document.getElementById('unselectedSubsOverlay');
  const dialog = document.getElementById('unselectedSubsDialog');
  overlay.classList.remove('open');
  overlay.hidden = true;
  dialog.hidden = true;
}

function proceedToCheckout() {
  closeUnselectedSubstitutesConfirmation();
  // Redirigir al checkout (por ahora solo cerramos el dialog)
  console.log('Proceeding to checkout');
}

function openSubstitutesFromConfirmation() {
  closeUnselectedSubstitutesConfirmation();
  const firstEligible = cartItems().find(item => isSubstituteEligible(item.product));
  if (firstEligible) {
    openSubstituteModal(firstEligible.id);
  }
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
            <span class="sub-notice-badge" id="cartNoticeBadge-${id}"></span>
            <span class="sub-notice-product-title" id="cartNoticeProductTitle-${id}"></span>
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
    return `<span class="sub-notice-badge">${selection.badgePink}</span>`;
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

/* ══ Tutorial Onboarding ══ */
let tutorialCurrentStep = 1;
let tutorialTargetProductId = null;
let tutorialInProgress = false;

const TUTORIAL_STEPS = [
  {
    title: 'Aquí eliges qué pasa si este producto se agota',
    desc: 'Los productos con este aviso pueden quedarse sin stock antes de armar tu pedido. Toca "Cambiar" para decidir tu preferencia.',
    target: 'product-card',
    btnText: 'Siguiente'
  },
  {
    title: 'Elige tu sustituto favorito',
    desc: 'Busca un producto específico o indica que nuestro picker te contacte al momento de recolectar tus productos.',
    target: 'modal',
    btnText: 'Siguiente'
  },
  {
    title: 'Controla todos tus sustitutos a la vez',
    desc: 'Aplica una misma preferencia a todos los productos elegibles de tu carrito de un solo tap. Tus elecciones individuales no se pierden a menos que confirmes el cambio.',
    target: 'toggle-card',
    btnText: 'Entendido'
  }
];

function maybeShowTutorial() {
  const hasEligibleProducts = cartItems().some(item => isSubstituteEligible(item.product));

  if (hasEligibleProducts && !tutorialInProgress) {
    tutorialInProgress = true;
    tutorialCurrentStep = 1;
    showTutorialStep();
  }
}

function showTutorialStep() {
  const step = TUTORIAL_STEPS[tutorialCurrentStep - 1];
  console.log('showTutorialStep: step', tutorialCurrentStep, 'target:', step.target);

  const overlay = document.getElementById('tutorialOverlay');
  const spotlight = document.getElementById('tutorialSpotlight');
  const tipCard = document.getElementById('tutorialTipCard');
  const nextBtn = document.getElementById('tutorialNextBtn');

  overlay.hidden = false;
  spotlight.hidden = false;
  tipCard.hidden = false;

  // Bloquear scroll al mostrar el tutorial
  document.body.style.overflow = 'hidden';

  document.getElementById('tutorialStep').textContent = `Paso ${tutorialCurrentStep} de 3`;
  document.getElementById('tutorialTitle').textContent = step.title;
  document.getElementById('tutorialDesc').textContent = step.desc;
  nextBtn.textContent = step.btnText;

  const dotsContainer = document.getElementById('tutorialDots');
  dotsContainer.innerHTML = '';
  for (let i = 1; i <= 3; i++) {
    const dot = document.createElement('div');
    dot.className = 'tutorial-dot' + (i === tutorialCurrentStep ? ' active' : '');
    dotsContainer.appendChild(dot);
  }

  // Mantener overlay visible en TODOS los pasos para bloquear clicks
  overlay.hidden = false;

  if (step.target === 'product-card') {
    highlightFirstEligibleProduct();
    positionTipCard(step.target);
  } else if (step.target === 'modal') {
    const firstEligible = cartItems().find(item => isSubstituteEligible(item.product));
    if (firstEligible) {
      tutorialTargetProductId = firstEligible.id;
      openSubstituteModal(firstEligible.id);
      setTimeout(() => {
        highlightModalContent();
        positionTipCard(step.target);
        // Bloquear interacción en el modal durante el tutorial (sin oscurecerlo: el spotlight ya lo deja visible)
        const modal = document.getElementById('subModal');
        if (modal) {
          modal.style.pointerEvents = 'none';
        }
      }, 300);
    }
  } else if (step.target === 'toggle-card') {
    highlightToggleCard();
    if (window.innerWidth < 768) {
      scrollToElement('.toggle-card');
    }
    positionTipCard(step.target);
  }
}

function setSpotlightRect(el, padding = 4) {
  const rect = el.getBoundingClientRect();
  const spotlight = document.getElementById('tutorialSpotlight');
  const radius = window.getComputedStyle(el).borderRadius || '14px';

  spotlight.style.left = (rect.left - padding) + 'px';
  spotlight.style.top = (rect.top - padding) + 'px';
  spotlight.style.width = (rect.width + padding * 2) + 'px';
  spotlight.style.height = (rect.height + padding * 2) + 'px';
  spotlight.style.borderRadius = radius;

  return rect;
}

function highlightFirstEligibleProduct() {
  const items = cartItems().filter(item => isSubstituteEligible(item.product));
  if (items.length === 0) return;

  const productCard = document.querySelector(`.product-card[data-product-id="${items[0].id}"]`);
  if (productCard) {
    setSpotlightRect(productCard);
  }
}

function highlightModalContent() {
  const modal = document.getElementById('subModal');
  if (modal && !modal.hidden) {
    const contentArea = modal.querySelector('.sub-modal-content') || modal;
    if (contentArea) {
      setSpotlightRect(contentArea);
    }
  }
}

function highlightToggleCard() {
  let toggleCard;
  if (window.innerWidth >= 768) {
    toggleCard = document.querySelector('.toggle-card--desktop');
  } else {
    toggleCard = document.querySelector('.toggle-card--mobile');
  }

  if (toggleCard) {
    setSpotlightRect(toggleCard);
  }
}

function scrollToElement(selector) {
  const element = document.querySelector(selector);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

function positionTipCard(target) {
  const tipCard = document.getElementById('tutorialTipCard');
  console.log('positionTipCard called with target:', target);

  if (target === 'product-card') {
    console.log('Positioning for product-card');
    const items = cartItems().filter(item => isSubstituteEligible(item.product));
    if (items.length > 0) {
      const productCard = document.querySelector(`.product-card[data-product-id="${items[0].id}"]`);
      if (productCard) {
        const rect = productCard.getBoundingClientRect();
        tipCard.style.top = (rect.bottom + 16) + 'px';
        tipCard.style.left = '50%';
        tipCard.style.transform = 'translateX(-50%)';
        tipCard.style.right = 'auto';
        tipCard.style.bottom = 'auto';
        tipCard.style.width = 'auto';
        tipCard.style.maxWidth = '360px';
      }
    }
  } else if (target === 'modal') {
    const modal = document.getElementById('subModal');
    if (modal) {
      const rect = modal.getBoundingClientRect();
      const tipCardHeight = 180; // altura aproximada del tip-card
      let topValue;

      // Verificar si hay espacio debajo del modal
      const spaceBelow = window.innerHeight - rect.bottom;

      if (window.innerWidth < 768) {
        // Mobile: posicionar más abajo pero dentro del viewport
        if (spaceBelow > tipCardHeight + 20) {
          topValue = rect.bottom + 20;
        } else {
          // Si no hay espacio abajo, posicionar arriba del modal
          topValue = Math.max(20, rect.top - tipCardHeight - 20);
        }
      } else {
        // Desktop: posicionar debajo si hay espacio, si no, arriba
        if (spaceBelow > tipCardHeight + 20) {
          topValue = rect.bottom + 20;
        } else {
          topValue = Math.max(20, rect.top - tipCardHeight - 20);
        }
      }

      tipCard.style.top = topValue + 'px';
      tipCard.style.left = '50%';
      tipCard.style.transform = 'translateX(-50%)';
      tipCard.style.right = 'auto';
      tipCard.style.bottom = 'auto';
      tipCard.style.width = 'auto';
      tipCard.style.maxWidth = '360px';
    }
  } else if (target === 'toggle-card') {
    // Select visible toggle-card based on viewport
    let toggleCard;
    if (window.innerWidth >= 768) {
      toggleCard = document.querySelector('.toggle-card--desktop');
    } else {
      toggleCard = document.querySelector('.toggle-card--mobile');
    }

    if (!toggleCard) return;

    const rect = toggleCard.getBoundingClientRect();

    // Reset inset constraints
    tipCard.style.inset = 'auto';
    tipCard.style.top = '';
    tipCard.style.left = '';
    tipCard.style.right = '';
    tipCard.style.bottom = '';

    // Set positioning
    tipCard.style.position = 'fixed';
    tipCard.style.width = 'auto';
    tipCard.style.maxWidth = '360px';
    tipCard.style.left = '50%';
    tipCard.style.transform = 'translateX(-50%)';

    let topValue;
    const tipCardHeight = 180;

    if (window.innerWidth >= 768) {
      // Desktop: posicionar encima pero permitiendo visibilidad del componente
      topValue = Math.max(20, rect.top - tipCardHeight - 80);
    } else {
      // Mobile: posicionar encima permitiendo visibilidad del componente
      topValue = Math.max(20, rect.top - tipCardHeight - 70);
    }

    tipCard.style.top = topValue + 'px';
  }
}

function nextTutorialStep() {
  if (tutorialCurrentStep === 2) {
    closeSubstituteModal();
  }

  tutorialCurrentStep++;
  if (tutorialCurrentStep > 3) {
    completeTutorial();
  } else {
    showTutorialStep();
  }
}

function skipTutorial() {
  completeTutorial();
}

function completeTutorial() {
  const overlay = document.getElementById('tutorialOverlay');
  const spotlight = document.getElementById('tutorialSpotlight');
  const tipCard = document.getElementById('tutorialTipCard');
  const modal = document.getElementById('subModal');

  overlay.hidden = true;
  spotlight.hidden = true;
  tipCard.hidden = true;

  tutorialInProgress = false;
  tutorialCurrentStep = 1;
  tutorialTargetProductId = null;

  // Desbloquear scroll al completar el tutorial
  document.body.style.overflow = '';

  // Restaurar interacción en el modal
  if (modal) {
    modal.style.pointerEvents = '';
  }

  if (!modal.hidden) {
    closeSubstituteModal();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  syncToggleUI();
  renderCartPage();
  maybeShowTutorial();

  // Si hay productos elegibles para sustitutos, establecer "Contactarme" como default
  const eligibleItems = cartItems().filter(item => isSubstituteEligible(item.product));
  if (eligibleItems.length > 0 && allowSubstitutes === null) {
    setAllowSubstitutes(true);  // true = "Contactarme"
  }

  // Agregar listener al ícono de información para mostrar el tutorial
  const infoIcons = document.querySelectorAll('.info-icon');
  infoIcons.forEach(icon => {
    // Remover el onclick original
    icon.removeAttribute('onclick');

    // Agregar listener para mostrar solo el tutorial (con capture phase)
    icon.addEventListener('click', function(e) {
      console.log('Info icon clicked');
      e.preventDefault();
      e.stopPropagation();
      maybeShowTutorial();
    }, true);  // capture phase
  });

  // Event delegation para botones de pago
  document.addEventListener('click', (e) => {
    if (e.target.closest('.pago-btn')) {
      const eligibleItems = cartItems().filter(item => isSubstituteEligible(item.product));

      if (eligibleItems.length > 0) {
        // Mostrar dialog si hay productos elegibles con el tipo 'contact' (sin modificación individual)
        const hasUnmodifiedItems = eligibleItems.some(item =>
          savedSubstitutes[item.id] && savedSubstitutes[item.id].type === 'contact'
        );

        if (hasUnmodifiedItems) {
          e.preventDefault();
          e.stopPropagation();
          showUnselectedSubstitutesConfirmation();
          return false;
        }
      }
    }
  }, true);  // Usar capture phase para ejecutar antes que otros listeners
});
