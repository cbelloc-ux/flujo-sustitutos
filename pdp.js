const pdpProductId = new URLSearchParams(location.search).get('id') || 'p1';

function renderPdpProduct() {
  const product = PRODUCTS[pdpProductId];
  const img = document.getElementById('pdpImg');
  img.src = product.img;
  img.alt = product.name;
  document.getElementById('pdpName').textContent = product.name;
  document.getElementById('pdpPrice').textContent = product.price;
  document.getElementById('pdpPriceOld').textContent = product.priceOld;
  document.getElementById('pdpUnitPrice').textContent = product.price + ' / Pza';
  document.getElementById('pdpFooterTotal').textContent = product.price;
  const grayBadge = document.getElementById('pdpBadgeGray');
  if (product.badgeGray) {
    grayBadge.textContent = product.badgeGray;
    grayBadge.hidden = false;
  } else {
    grayBadge.hidden = true;
  }
  // Solo los productos con "Quedan pocos" muestran el aviso de sustituto.
  document.getElementById('pdpSubNotice').hidden = !isSubstituteEligible(product);
  renderPdpDescription(product);
  renderPdpRecommended(product);
}

// ══ Descripción (acordeón) ══
function renderPdpDescription(product) {
  const values = [
    'Fruta fresca',
    'H-E-B',
    product.name,
    'A granel / Pieza',
    'México',
    'Consérvese en refrigeración y consuma preferentemente en los primeros días después de su compra',
    'Producto natural, no contiene ingredientes añadidos',
    '1 pieza mediana',
    '1',
  ];
  document.getElementById('pdpDescValues').innerHTML = values.map(v => `<p>${v}</p>`).join('');
}

// ══ Acordeones (Descripción / Especificaciones) ══
function toggleAccordion(header) {
  const body = document.getElementById(header.getAttribute('aria-controls'));
  const chevron = header.querySelector('.pdp-accordion-chevron');
  const isHidden = body.hidden;
  body.hidden = !isHidden;
  header.setAttribute('aria-expanded', String(isHidden));
  if (chevron) chevron.textContent = isHidden ? 'keyboard_arrow_up' : 'keyboard_arrow_down';
}

// ══ Productos recomendados ══
function renderPdpRecommended(product) {
  const row = document.getElementById('pdpRecommended');
  if (!row) return;
  const items = PLP_CATALOG.filter(p => p.id !== product.id).slice(0, 8);
  row.innerHTML = items.map(plpCardHtml).join('');
  initSubstituteUI();
}

function pdpAddToCart(btn) {
  const product = PRODUCTS[pdpProductId];
  const alreadyInCart = (plpQty[pdpProductId] || 0) > 0;
  if (alreadyInCart) {
    changeQty(pdpProductId, 1);
  } else {
    addNormally(pdpProductId);
  }
  // Igual que en el PLP: agregar varias piezas seguidas no abre el modal en cada clic,
  // solo cuando el usuario deja de hacer clic (pierde el ritmo).
  if (isSubstituteEligible(product)) {
    armSubstituteModal(pdpProductId);
  }
  btn.classList.add('added');
  setTimeout(() => btn.classList.remove('added'), 150);
}

function renderPdpNotice() {
  const selection = savedSubstitutes[pdpProductId];
  const label = substituteLabel(selection);
  const media = document.getElementById('pdpSubNoticeMedia');
  const title = document.getElementById('pdpSubNoticeTitle');
  const desc = document.getElementById('pdpSubNoticeDesc');

  if (!label) {
    media.innerHTML = PDP_ICON_CACHED;
    title.textContent = '¿Qué enviamos si se agota?';
    desc.textContent = 'Si no contesto, que el recolector elija por mi un producto similar en precio y características.';
    desc.hidden = false;
    return;
  }

  if (selection.type !== 'product') {
    media.innerHTML = PDP_NOTICE_ICONS[selection.type];
    title.textContent = '¿Qué enviamos si se agota?';
    desc.textContent = label.desc;
    desc.hidden = false;
    return;
  }

  media.innerHTML = `<img src="${label.img}" alt="${label.title}">`;
  title.textContent = 'Se sustituye por el siguiente:';
  desc.innerHTML = `${label.title} · ${label.qty} pza · <s>$${label.totalPriceOld.toFixed(2)}</s> <b>$${label.totalPrice.toFixed(2)}</b>`;
  desc.hidden = false;
}

const PDP_ICON_CACHED = '<span class="msi" aria-hidden="true" style="font-size:24px; color:#221f19">cached</span>';
const PDP_ICON_BLOCK = '<span class="msi" aria-hidden="true" style="font-size:24px; color:#221f19">block</span>';
const PDP_NOTICE_ICONS = {
  none: PDP_ICON_BLOCK,
  contact: '<span class="msi msi-fill" aria-hidden="true" style="font-size:24px; color:#221f19">chat</span>',
  picker: '<span class="msi" aria-hidden="true" style="font-size:24px; color:#221f19">emoji_people</span>',
};

document.addEventListener('DOMContentLoaded', () => {
  renderPdpProduct();
  renderPdpNotice();
});
