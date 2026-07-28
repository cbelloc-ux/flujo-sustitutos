function addToCart(btn) {
  btn.classList.add('added');
  setTimeout(() => btn.classList.remove('added'), 150);
}

/* ══ Desktop filters sidebar (siempre visible en ≥1200px) ══ */
function toggleFilterDesc() {
  const desc = document.getElementById('filterDesc');
  const label = document.getElementById('filterDescLabel');
  const icon = document.getElementById('filterDescIcon');
  const expanded = desc.classList.toggle('expanded');
  label.textContent = expanded ? 'Leer menos' : 'Leer más';
  icon.textContent = expanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down';
}

function toggleFilterSection(headerBtn) {
  const body = headerBtn.nextElementSibling;
  const icon = headerBtn.querySelector('.msi');
  const isHidden = body.hidden;
  body.hidden = !isHidden;
  if (icon) icon.textContent = isHidden ? 'keyboard_arrow_up' : 'keyboard_arrow_down';
}

function toggleCheckbox(row) {
  row.classList.toggle('checked');
}

function selectSort(row) {
  row.parentElement.querySelectorAll('.plp-sort-row').forEach(r => r.classList.remove('checked'));
  row.classList.add('checked');
}

// Catálogo del PLP (128 productos = 4 páginas de 32), reutilizado por el PDP (pdp.html?id=p1).
const PLP_CATALOG = (() => {
  const items = [
    { id: 'p1', name: 'Manzana Red Delicious Importada Suprema', price: '$44.95', priceOld: '$54.95', unit: 'pza', img: 'assets/product-manzana-red.png', badgePink: 'Llévate producto Gratis', badgeGray: null },
    { id: 'p2', name: 'Manzana Verde Granny Smith', price: '$37.50', priceOld: '$45.50', unit: 'pza', img: 'assets/product-manzana-verde.png', badgePink: 'Llévate producto Gratis', badgeGray: null },
    { id: 'p3', name: 'Manzana Gala Nacional', price: '$34.90', priceOld: '$42.90', unit: 'pza', img: 'assets/product-manzana-3.png', badgePink: 'Llévate producto Gratis', badgeGray: null },
    { id: 'p4', name: 'Bolsa Manzanas Mixtas 1 kg', price: '$46.00', priceOld: '$56.00', unit: 'pza', img: 'assets/product-manzana-4.png', badgePink: 'Llévate producto Gratis', badgeGray: null },
    // Única piña del catálogo: es el único producto con la etiqueta "Quedan pocos".
    { id: 'p5', name: 'Piña', price: '$35.00', priceOld: '$42.00', unit: 'pza', img: 'assets/512260_01.webp', badgePink: null, badgeGray: 'Quedan pocos' },
  ];
  const templates = [
    { name: 'Manojo de Plátano Tabasco', img: 'assets/platano.webp', unit: 'pza', base: 22 },
    { name: 'Mango Ataulfo', img: 'assets/mango.webp', unit: 'pza', base: 30 },
    { name: 'Coco Entero', img: 'assets/301841_01.webp', unit: 'pza', base: 30 },
    { name: 'Papaya Maradol', img: 'assets/301918_01.webp', unit: 'pza', base: 20 },
    { name: 'Kiwi Zespri SunGold', img: 'assets/323977_01.webp', unit: 'pza', base: 15 },
    { name: 'Pitahaya', img: 'assets/427906_01.webp', unit: 'pza', base: 38 },
  ];
  const fmt = n => '$' + n.toFixed(2);
  for (let i = 6; i <= 128; i++) {
    const t = templates[(i - 6) % templates.length];
    const price = t.base + ((i * 7) % 30);
    items.push({
      id: 'p' + i,
      name: t.name,
      price: fmt(price),
      priceOld: fmt(price + 10 + (i % 20)),
      unit: t.unit,
      img: t.img,
      badgePink: i % 3 === 0 ? 'Llévate producto Gratis' : null,
      badgeGray: null,
    });
  }
  return items;
})();

const PRODUCTS = Object.fromEntries(PLP_CATALOG.map(p => [p.id, p]));

const SIMILAR_PRODUCTS = [
  { id: 's1', name: 'Manzana Red Delicious Importada Suprema', price: '$44.95', priceOld: '$54.95', img: 'assets/product-manzana-red.png' },
  { id: 's2', name: 'Manzana Verde Granny Smith', price: '$37.50', priceOld: '$45.50', img: 'assets/product-manzana-verde.png' },
  { id: 's3', name: 'Manojo de Plátano Tabasco', price: '$28.00', priceOld: '$34.00', img: 'assets/platano.webp' },
  { id: 's4', name: 'Mango Ataulfo', price: '$32.90', priceOld: '$39.90', img: 'assets/mango.webp' },
  { id: 's6', name: 'Coco Entero', price: '$33.00', priceOld: '$40.00', img: 'assets/301841_01.webp' },
  { id: 's7', name: 'Kiwi Zespri SunGold', price: '$19.00', priceOld: '$23.00', img: 'assets/323977_01.webp' },
];

// Cualquier tipo de producto puede elegirse como sustituto, no solo productos similares.
const OTHER_PRODUCTS = [
  { id: 'o1', name: 'Kiwi Zespri SunGold', price: '$18.00', priceOld: '$22.00', img: 'assets/323977_01.webp' },
  { id: 'o2', name: 'Pitahaya', price: '$45.00', priceOld: '$54.00', img: 'assets/427906_01.webp' },
  { id: 'o3', name: 'Coco Entero', price: '$32.00', priceOld: '$39.00', img: 'assets/301841_01.webp' },
  { id: 'o4', name: 'Manzana Gala Nacional', price: '$34.90', priceOld: '$42.90', img: 'assets/product-manzana-3.png' },
  { id: 'o5', name: 'Bolsa Manzanas Mixtas 1 kg', price: '$46.00', priceOld: '$56.00', img: 'assets/product-manzana-4.png' },
  { id: 'o6', name: 'Mango Ataulfo', price: '$32.90', priceOld: '$39.90', img: 'assets/mango.webp' },
  { id: 'o7', name: 'Papaya Maradol', price: '$22.50', priceOld: '$27.50', img: 'assets/301918_01.webp' },
];

const ALL_PRODUCTS = SIMILAR_PRODUCTS.concat(OTHER_PRODUCTS);

let currentProductId = null;
let tempSelection = null; // {type:'picker'} | {type:'none'} | {type:'product', id}
let activeSegment = 'product'; // 'product' | 'picker' | 'none' — segment control activo en la vista principal
let toastTimeout = null;

function loadSubstitutes() {
  try { return JSON.parse(localStorage.getItem('heb-substitutes')) || {}; }
  catch (e) { return {}; }
}
function persistSubstitutes() {
  localStorage.setItem('heb-substitutes', JSON.stringify(savedSubstitutes));
}
const savedSubstitutes = loadSubstitutes();

function substituteLabel(selection) {
  if (!selection || selection.type === 'picker') return null;
  if (selection.type === 'none') return { title: 'No reemplazar', desc: 'Eliminar producto del pedido.' };
  const product = getAnyProduct(selection.id);
  if (!product) return null;
  // La cantidad del sustituto es informativa (se reemplaza el producto original por N piezas
  // de este); no se agrega como línea aparte al carrito.
  const qty = selection.qty > 0 ? selection.qty : 1;
  return {
    title: product.name,
    price: product.price,
    priceOld: product.priceOld,
    img: product.img,
    qty,
    totalPrice: parsePrice(product.price) * qty,
    totalPriceOld: parsePrice(product.priceOld) * qty,
  };
}

function refreshProductUI(productId) {
  const sel = savedSubstitutes[productId];
  const badge = document.getElementById('subBadge-' + productId);
  // "No reemplazar" no es un sustituto real: no se marca la tarjeta con "Con sustituto".
  if (badge) badge.hidden = !sel || sel.type === 'none';
  renderCardCta(productId);
  if (typeof pdpProductId !== 'undefined' && productId === pdpProductId) renderPdpNotice();
  if (typeof renderCartNotice === 'function' && document.getElementById('cartNotice-' + productId)) renderCartNotice(productId);
}

function initSubstituteUI() {
  Object.keys(savedSubstitutes).forEach(refreshProductUI);
}

// Duración de la animación de cierre del modal (debe igualar la transición en CSS)
// para no ocultar el modal (hidden) antes de que termine de deslizarse hacia fuera.
const MODAL_ANIM_MS = 200;

function openSubstituteModal(productId) {
  currentProductId = productId;
  tempSelection = savedSubstitutes[productId] || null;
  // Por defecto se abre en el segmento "Productos"; si ya había una elección de
  // "HEB Sugiere" o "No reemplazar" guardada, se respeta ese segmento al reabrir.
  activeSegment = (tempSelection && (tempSelection.type === 'picker' || tempSelection.type === 'none'))
    ? tempSelection.type
    : 'product';
  closeSearchScreen();
  syncSegmentUI();
  renderCarousel();
  updateSaveButton();
  const overlay = document.getElementById('subOverlay');
  const modal = document.getElementById('subModal');
  overlay.hidden = false;
  modal.hidden = false;
  // Forzar reflow para que el navegador registre el estado "cerrado" antes de animar a "open".
  void modal.offsetHeight;
  overlay.classList.add('open');
  modal.classList.add('open');
  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
}

function closeSubstituteModal() {
  const overlay = document.getElementById('subOverlay');
  const modal = document.getElementById('subModal');
  overlay.classList.remove('open');
  modal.classList.remove('open');
  document.documentElement.style.overflow = '';
  document.body.style.overflow = '';
  currentProductId = null;
  tempSelection = null;
  activeSegment = 'product';
  setTimeout(() => {
    overlay.hidden = true;
    modal.hidden = true;
  }, MODAL_ANIM_MS);
}

// El buscador es una pantalla independiente dentro del modal (no un filtro en línea):
// se abre con su propio botón "Regresar" en el header y su propia grilla de resultados.
function openSearchScreen() {
  document.getElementById('subMainScreen').hidden = true;
  document.getElementById('subSearchScreen').hidden = false;
  document.getElementById('subBack').hidden = false;
  document.getElementById('subSearchInput').value = '';
  renderSearchGrid();
  document.getElementById('subSearchInput').focus();
}

function closeSearchScreen() {
  document.getElementById('subSearchScreen').hidden = true;
  document.getElementById('subMainScreen').hidden = false;
  document.getElementById('subBack').hidden = true;
}

function clearSubSearch() {
  document.getElementById('subSearchInput').value = '';
  document.getElementById('subSearchInput').focus();
  renderSearchGrid();
}

// Contenido del segmento activo cuando no es "Productos" (no hay nada más que elegir:
// el propio segmento ES la elección).
const CHOICE_PANEL_DEFS = {
  picker: { icon: 'emoji_people', title: 'HEB Sugiere', desc: 'Si no contesto, que el recolector elija por mi un producto similar en precio y características.' },
  none: { icon: 'delete', title: 'No reemplazar', desc: 'Eliminar producto del pedido.' },
};

function selectSegment(segment) {
  activeSegment = segment;
  if (segment === 'picker' || segment === 'none') {
    tempSelection = { type: segment };
  } else if (!(tempSelection && tempSelection.type === 'product')) {
    // Volver al segmento "Productos" sin un producto ya elegido no deja ninguna
    // elección a medias (picker/no reemplazar) seleccionada por accidente.
    tempSelection = null;
  }
  syncSegmentUI();
  renderCarousel();
  updateSaveButton();
}

function syncSegmentUI() {
  document.querySelectorAll('.plp-segment-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.segment === activeSegment);
  });
  const isProduct = activeSegment === 'product';
  document.getElementById('subProductView').hidden = !isProduct;
  document.getElementById('subChoiceView').hidden = isProduct;
  if (!isProduct) {
    const def = CHOICE_PANEL_DEFS[activeSegment];
    document.getElementById('subChoicePanel').innerHTML = `
      <span class="plp-choice-icon">
        <span class="msi" aria-hidden="true" style="font-size:34px; color:white">${def.icon}</span>
      </span>
      <span class="plp-choice-title">${def.title}</span>
      <span class="plp-choice-desc">${def.desc}</span>
    `;
  }
}

function selectChoice(choice) {
  // La cantidad de un sustituto elegido es informativa (para mostrar "se sustituye por N piezas
  // de X" en el carrito); nunca se agrega como línea aparte al carrito real.
  if (choice && choice.type === 'product') {
    const prevQty = (tempSelection && tempSelection.type === 'product' && tempSelection.id === choice.id) ? tempSelection.qty : 0;
    choice.qty = prevQty > 0 ? prevQty : 1;
  }
  tempSelection = choice;
  renderCarousel();
  renderSearchGrid();
  updateSaveButton();
}

function updateSaveButton() {
  document.getElementById('subSave').disabled = !tempSelection;
}

function miniCtaHtml(product) {
  const selected = tempSelection && tempSelection.type === 'product' && tempSelection.id === product.id;
  const qty = selected ? (tempSelection.qty || 1) : 0;
  if (qty <= 0) {
    return `<button type="button" class="plp-add-btn" onclick="addMiniQty('${product.id}')" aria-label="Agregar ${product.name}">${CTA_PLUS_SVG}</button>`;
  }
  const leftIcon = qty === 1 ? CTA_TRASH_SVG : CTA_MINUS_SVG;
  return `
    <div class="plp-stepper-inline">
      <button onclick="changeMiniQty('${product.id}',-1)" aria-label="${qty === 1 ? 'Quitar' : 'Disminuir'}">${leftIcon}</button>
      <span>${qty} ${unitLabel(product)}</span>
      <button onclick="changeMiniQty('${product.id}',1)" aria-label="Aumentar">${CTA_PLUS_SVG}</button>
    </div>
  `;
}

function addMiniQty(id) {
  // Agregar cantidad desde la mini-card también lo marca como sustituto elegido.
  selectChoice({ type: 'product', id });
}

function changeMiniQty(id, delta) {
  // Solo aplica al producto que ya está elegido como sustituto (es el único con stepper visible).
  if (!(tempSelection && tempSelection.type === 'product' && tempSelection.id === id)) return;
  tempSelection.qty = (tempSelection.qty || 1) + delta;
  // Si se quita la última pieza, deja de ser el sustituto elegido.
  if (tempSelection.qty <= 0) {
    tempSelection = null;
  }
  renderCarousel();
  renderSearchGrid();
  updateSaveButton();
}

function miniCardHtml(product) {
  const selected = tempSelection && tempSelection.type === 'product' && tempSelection.id === product.id;
  const qty = selected ? (tempSelection.qty || 1) : 0;
  return `
    <div class="plp-mini-card">
      <div class="plp-mini-media" onclick="selectChoice({type:'product', id:'${product.id}'})">
        <img src="${product.img}" alt="${product.name}">
        <button type="button" class="plp-radio${selected ? ' checked' : ''}" aria-label="Elegir ${product.name} como sustituto" onclick="event.stopPropagation(); selectChoice({type:'product', id:'${product.id}'})"></button>
        <div class="plp-cta${qty > 0 ? ' plp-cta-center' : ''}" onclick="event.stopPropagation()">${miniCtaHtml(product)}</div>
      </div>
      <button type="button" class="plp-mini-info" onclick="selectChoice({type:'product', id:'${product.id}'})">
        <span class="plp-mini-old">${product.priceOld}</span>
        <span class="plp-mini-new">${product.price}</span>
        <span class="plp-mini-name">${product.name}</span>
      </button>
    </div>
  `;
}

// El segmento "Productos" solo muestra productos similares; "HEB Sugiere" y
// "No reemplazar" ahora son segmentos propios (ver CHOICE_PANEL_DEFS), no tarjetas del carrusel.
function renderCarousel() {
  document.getElementById('subCarousel').innerHTML = SIMILAR_PRODUCTS.slice(0, 7).map(miniCardHtml).join('');
}

function renderSearchGrid() {
  const query = document.getElementById('subSearchInput').value.trim().toLowerCase();
  const grid = document.getElementById('subSearchGrid');
  const results = ALL_PRODUCTS.filter(p => p.name.toLowerCase().includes(query));
  grid.innerHTML = results.length
    ? results.map(miniCardHtml).join('')
    : '<p class="plp-search-empty">No encontramos productos que coincidan.</p>';
}

function saveSelection() {
  if (!tempSelection || !currentProductId) return;
  const id = currentProductId;
  const type = tempSelection.type;
  savedSubstitutes[id] = tempSelection;
  persistSubstitutes();
  // Guardar la elección siempre agrega 1 pieza del producto al carrito.
  plpQty[id] = (plpQty[id] || 0) + 1;
  persistCartQty();
  closeSubstituteModal();
  refreshProductUI(id);
  // "No reemplazar" no es un sustituto guardado: no se notifica como tal.
  if (type !== 'none') showToast();
}

function showToast() {
  const toast = document.getElementById('subToast');
  clearTimeout(toastTimeout);
  toast.classList.add('show');
  toastTimeout = setTimeout(() => toast.classList.remove('show'), 5000);
}

/* ══ Menú "Pasillos" (mega menú de categorías) ══
   Mismo drawer y misma animación en todos los breakpoints: en mobile/tablet se abre desde
   el ícono de menú (hamburguesa) del header; en desktop desde el botón "Pasillos" de la pleca. */
function openPasillosMenu() {
  const overlay = document.getElementById('pasillosOverlay');
  const panel = document.getElementById('pasillosPanel');
  if (!overlay || !panel) return;
  showPasillosLevel1();
  overlay.hidden = false;
  panel.hidden = false;
  // Forzar reflow para que el navegador registre el estado "cerrado" antes de animar a "open".
  void panel.offsetHeight;
  overlay.classList.add('open');
  panel.classList.add('open');
  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
}

function closePasillosMenu() {
  const overlay = document.getElementById('pasillosOverlay');
  const panel = document.getElementById('pasillosPanel');
  if (!overlay || !panel) return;
  overlay.classList.remove('open');
  panel.classList.remove('open');
  document.documentElement.style.overflow = '';
  document.body.style.overflow = '';
  setTimeout(() => {
    overlay.hidden = true;
    panel.hidden = true;
  }, MODAL_ANIM_MS);
}

function showPasillosLevel1() {
  document.getElementById('pasillosLevel1').hidden = false;
  document.getElementById('pasillosLevel2').hidden = true;
}

function showPasillosLevel2() {
  document.getElementById('pasillosLevel1').hidden = true;
  document.getElementById('pasillosLevel2').hidden = false;
}

function togglePasillosGroup(headerBtn) {
  const items = headerBtn.nextElementSibling;
  const chevron = headerBtn.querySelector('.pasillos-group-chevron');
  const isHidden = items.hidden;
  items.hidden = !isHidden;
  if (chevron) chevron.textContent = isHidden ? 'keyboard_arrow_up' : 'keyboard_arrow_down';
}

/* ══ PLP grid + pagination ══ */
const PLP_PAGE_SIZE = 32;
let plpCurrentPage = 1;

// Solo los productos con "Quedan pocos" abren el modal de sustitutos; el resto se agrega normal.
function isSubstituteEligible(p) {
  return p.badgeGray === 'Quedan pocos';
}

const CTA_PLUS_SVG = '<span class="msi msi-fill" aria-hidden="true" style="font-size:20px; color:white">add</span>';
const CTA_MINUS_SVG = '<span class="msi msi-fill" aria-hidden="true" style="font-size:20px; color:white">remove</span>';
const CTA_TRASH_SVG = '<span class="msi" aria-hidden="true" style="font-size:18px; color:white">delete</span>';

// Ícono "Agregar a lista" — asset original de Figma (no es parte de Material Symbols).
const ICON_ADD_TO_LIST = '<svg width="16" height="20" viewBox="0 0 16.0664 19.999" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M12.0303 11.9229C12.5845 11.9231 13.0339 12.3725 13.0342 12.9268V14.957H15.0615C15.6164 14.957 16.0664 15.407 16.0664 15.9619C16.0662 16.5166 15.6163 16.9658 15.0615 16.9658H13.0342V18.9951C13.0341 19.5495 12.5846 19.9988 12.0303 19.999C11.4757 19.999 11.0254 19.5497 11.0254 18.9951V16.9658H8.99707C8.44234 16.9658 7.99243 16.5166 7.99219 15.9619C7.99219 15.407 8.44219 14.9571 8.99707 14.957H11.0254V12.9268C11.0256 12.3724 11.4758 11.9229 12.0303 11.9229ZM12.0586 0C13.6258 0.000141112 14.8787 1.28319 14.8789 2.84473V10.4219C14.8789 10.8821 14.5061 11.2559 14.0459 11.2559C13.5858 11.2557 13.2129 10.882 13.2129 10.4219V2.84473C13.2127 2.18468 12.6865 1.66616 12.0586 1.66602H2.82031C2.19264 1.66636 1.66619 2.18482 1.66602 2.84473V16.082C1.66605 16.7421 2.19255 17.2604 2.82031 17.2607H6.66797C7.1281 17.2607 7.50178 17.6337 7.50195 18.0938C7.50191 18.5539 7.12818 18.9268 6.66797 18.9268H2.82031C1.25324 18.9264 3.27789e-05 17.6436 0 16.082V2.84473C0.000174103 1.28331 1.25332 0.000345799 2.82031 0H12.0586ZM7.24023 8.0293C7.78507 8.0293 8.22656 8.47176 8.22656 9.0166C8.22636 9.56127 7.78495 10.0029 7.24023 10.0029H4.43262C3.8881 10.0027 3.44649 9.56112 3.44629 9.0166C3.44629 8.47191 3.88798 8.02953 4.43262 8.0293H7.24023ZM10.5752 4.16602C11.1198 4.16623 11.5615 4.60765 11.5615 5.15234C11.5615 5.69705 11.1199 6.13846 10.5752 6.13867H4.43262C3.88798 6.13843 3.44629 5.69703 3.44629 5.15234C3.4463 4.60766 3.88799 4.16625 4.43262 4.16602H10.5752Z" fill="#4A4741"/></svg>';

// Cantidades del carrito, persistidas para que PLP, PDP y Carrito siempre reflejen el mismo estado.
function loadCartQty() {
  try { return JSON.parse(localStorage.getItem('heb-cart-qty')) || {}; }
  catch (e) { return {}; }
}
const plpQty = loadCartQty(); // productId -> cantidad agregada

function parsePrice(str) {
  return parseFloat(String(str).replace(/[^0-9.]/g, '')) || 0;
}

// Busca el producto tanto en el catálogo del PLP como en las listas de sustitutos.
function getAnyProduct(id) {
  return PRODUCTS[id] || ALL_PRODUCTS.find(p => p.id === id) || null;
}

function updateHeaderCartSummary() {
  let total = 0;
  let count = 0;
  Object.keys(plpQty).forEach(id => {
    const qty = plpQty[id];
    const product = qty > 0 ? getAnyProduct(id) : null;
    if (!product) return;
    total += parsePrice(product.price) * qty;
    count += qty;
  });
  document.querySelectorAll('.plp-cart-price').forEach(el => { el.textContent = '$' + total.toFixed(2); });
  document.querySelectorAll('.plp-cart-badge').forEach(el => { el.textContent = String(count); });
}

// Único punto de guardado del carrito: persiste, refresca el precio/badge del header
// y, si estamos en cart.html, vuelve a dibujar la lista de productos.
function persistCartQty() {
  localStorage.setItem('heb-cart-qty', JSON.stringify(plpQty));
  updateHeaderCartSummary();
  if (typeof renderCartPage === 'function') renderCartPage();
}

updateHeaderCartSummary();

function unitLabel() {
  return 'pza';
}

function ctaWrapClass(p) {
  const qty = plpQty[p.id] || 0;
  return qty > 0 ? 'plp-cta plp-cta-center' : 'plp-cta';
}

function ctaHtml(p) {
  const qty = plpQty[p.id] || 0;
  if (qty <= 0) {
    if (isSubstituteEligible(p)) {
      return `<button class="plp-add-btn" onclick="openSubstituteModal('${p.id}')" aria-label="Agregar al carrito">${CTA_PLUS_SVG}</button>`;
    }
    return `<button class="plp-add-btn" onclick="addNormally('${p.id}')" aria-label="Agregar al carrito">${CTA_PLUS_SVG}</button>`;
  }
  const leftIcon = qty === 1 ? CTA_TRASH_SVG : CTA_MINUS_SVG;
  return `
    <div class="plp-stepper-inline">
      <button onclick="changeQty('${p.id}',-1)" aria-label="${qty === 1 ? 'Quitar del carrito' : 'Disminuir'}">${leftIcon}</button>
      <span>${qty} ${unitLabel(p)}</span>
      <button onclick="changeQty('${p.id}',1)" aria-label="Aumentar">${CTA_PLUS_SVG}</button>
    </div>
  `;
}

function addNormally(id) {
  plpQty[id] = 1;
  persistCartQty();
  renderCardCta(id);
}

function changeQty(id, delta) {
  plpQty[id] = (plpQty[id] || 0) + delta;
  if (plpQty[id] < 0) plpQty[id] = 0;
  // Sin unidades en el carrito, ya no aplica ningún sustituto guardado.
  if (plpQty[id] === 0 && savedSubstitutes[id]) {
    delete savedSubstitutes[id];
    persistSubstitutes();
    const badge = document.getElementById('subBadge-' + id);
    if (badge) badge.hidden = true;
  }
  persistCartQty();
  renderCardCta(id);
}

function renderCardCta(id) {
  const wrap = document.getElementById('cta-' + id);
  const product = PRODUCTS[id];
  if (!wrap || !product) return;
  wrap.className = ctaWrapClass(product);
  wrap.innerHTML = ctaHtml(product);
}

function plpCardHtml(p) {
  const eligible = isSubstituteEligible(p);
  return `
    <article class="plp-card" data-product-id="${p.id}">
      <div class="plp-card-media">
        <a href="pdp.html?id=${p.id}" aria-label="Ver detalle de ${p.name}"><img class="plp-card-img" src="${p.img}" alt="${p.name}"></a>
        <button class="plp-addlist-btn" aria-label="Agregar a lista">
          ${ICON_ADD_TO_LIST}
        </button>
        <div class="${ctaWrapClass(p)}" id="cta-${p.id}">${ctaHtml(p)}</div>
      </div>
      <div class="plp-card-body">
        <div class="plp-price-block">
          <span class="plp-price-old">${p.priceOld}</span>
          <span class="plp-price-new">${p.price}</span>
        </div>
        ${p.badgePink ? `<span class="plp-badge plp-badge-pink">${p.badgePink}</span>` : ''}
        <p class="plp-card-name">${p.name}</p>
        ${p.badgeGray ? `<span class="plp-badge plp-badge-gray">${p.badgeGray}</span>` : ''}
        ${eligible ? `<button type="button" class="plp-badge plp-badge-blue plp-sub-badge" id="subBadge-${p.id}" onclick="openSubstituteModal('${p.id}')" hidden>
          <span class="msi" aria-hidden="true" style="font-size:14px; color:#007db3">cached</span>
          Con sustituto
        </button>` : ''}
      </div>
    </article>
  `;
}

function renderPlpGrid() {
  const grid = document.getElementById('plpGrid');
  if (!grid) return;
  const start = (plpCurrentPage - 1) * PLP_PAGE_SIZE;
  grid.innerHTML = PLP_CATALOG.slice(start, start + PLP_PAGE_SIZE).map(plpCardHtml).join('');
  renderPlpPagination();
  initSubstituteUI();
}

function renderPlpPagination() {
  const nav = document.getElementById('plpPagination');
  if (!nav) return;
  const totalPages = Math.ceil(PLP_CATALOG.length / PLP_PAGE_SIZE);
  let html = `
    <button type="button" class="plp-page-btn plp-page-arrow" onclick="goToPlpPage(${plpCurrentPage - 1})" ${plpCurrentPage === 1 ? 'disabled' : ''} aria-label="Página anterior">
      <span class="msi" aria-hidden="true" style="font-size:16px">chevron_left</span>
    </button>
  `;
  for (let i = 1; i <= totalPages; i++) {
    html += `<button type="button" class="plp-page-btn${i === plpCurrentPage ? ' active' : ''}" onclick="goToPlpPage(${i})" ${i === plpCurrentPage ? 'aria-current="page"' : ''}>${i}</button>`;
  }
  html += `
    <button type="button" class="plp-page-btn plp-page-arrow" onclick="goToPlpPage(${plpCurrentPage + 1})" ${plpCurrentPage === totalPages ? 'disabled' : ''} aria-label="Página siguiente">
      <span class="msi" aria-hidden="true" style="font-size:16px">chevron_right</span>
    </button>
  `;
  nav.innerHTML = html;
}

function goToPlpPage(page) {
  const totalPages = Math.ceil(PLP_CATALOG.length / PLP_PAGE_SIZE);
  if (page < 1 || page > totalPages || page === plpCurrentPage) return;
  plpCurrentPage = page;
  renderPlpGrid();
  document.querySelector('.plp-results-row').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ══ Homepage — carruseles de producto (reutilizan plpCardHtml del catálogo) ══
   Cada carrusel usa un rango de ids disjunto de los demás para evitar ids duplicados
   ("cta-<id>") cuando conviven varios carruseles en la misma página. */
function renderHomeCarousel(containerId, ids) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = ids.map(id => PRODUCTS[id]).filter(Boolean).map(plpCardHtml).join('');
}

const HOME_PROMO_TABS = {
  ofertas: ['p10', 'p11', 'p12', 'p13', 'p14'],
  nuevos: ['p16', 'p17', 'p18', 'p19', 'p20'],
  populares: ['p21', 'p22', 'p23', 'p24', 'p25'],
};

function selectHomePromoTab(tab) {
  document.querySelectorAll('#homePromoSegment .plp-segment-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });
  renderHomeCarousel('homePromoCarousel', HOME_PROMO_TABS[tab]);
}

function initHomepage() {
  if (!document.getElementById('homeCarousel1')) return;
  renderHomeCarousel('homeCarousel1', ['p1', 'p2', 'p3', 'p4', 'p6', 'p7', 'p8', 'p9']);
  renderHomeCarousel('homeCarousel2', ['p26', 'p27', 'p28', 'p29', 'p30', 'p31', 'p32', 'p33']);
  selectHomePromoTab('ofertas');
}

document.addEventListener('DOMContentLoaded', () => {
  renderPlpGrid();
  initSubstituteUI();
  initHomepage();
});
