const pdpProductId = new URLSearchParams(location.search).get('id') || 'p1';

function renderPdpProduct() {
  const product = PRODUCTS[pdpProductId];
  const img = document.getElementById('pdpImg');
  img.src = product.img;
  img.alt = product.name;
  document.getElementById('pdpName').textContent = product.name;
  document.getElementById('pdpPrice').textContent = product.price;
  document.getElementById('pdpPriceOld').textContent = product.priceOld;
  document.getElementById('pdpUnitPrice').textContent = product.price + ' / ' + (product.unit === 'kg' ? 'Kg' : 'Pza');
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
}

function pdpAddToCart(btn) {
  const product = PRODUCTS[pdpProductId];
  if (isSubstituteEligible(product)) {
    openSubstituteModal(pdpProductId);
    return;
  }
  const alreadyInCart = (plpQty[pdpProductId] || 0) > 0;
  if (alreadyInCart) {
    changeQty(pdpProductId, 1);
  } else {
    addNormally(pdpProductId);
  }
  btn.classList.add('added');
  setTimeout(() => btn.classList.remove('added'), 150);
}

function renderPdpNotice() {
  const label = substituteLabel(savedSubstitutes[pdpProductId]);
  const media = document.getElementById('pdpSubNoticeMedia');
  const title = document.getElementById('pdpSubNoticeTitle');
  const desc = document.getElementById('pdpSubNoticeDesc');

  if (!label) {
    media.innerHTML = PDP_ICON_CACHED;
    title.textContent = '¿Qué enviamos si se agota?';
    desc.textContent = 'Si no contesto, que el picker elija por mi';
    desc.hidden = false;
    return;
  }

  if (label.title === 'No reemplazar') {
    media.innerHTML = PDP_ICON_BLOCK;
    title.textContent = '¿Qué enviamos si se agota?';
    desc.textContent = label.desc;
    desc.hidden = false;
    return;
  }

  if (label.title === 'Que me contacten') {
    media.innerHTML = PDP_ICON_CONTACT;
    title.textContent = '¿Qué enviamos si se agota?';
    desc.textContent = label.desc;
    desc.hidden = false;
    return;
  }

  media.innerHTML = `<img src="${label.img}" alt="${label.title}">`;
  title.textContent = 'Se sustituye por el siguiente:';
  desc.innerHTML = `${label.title} · <s>${label.priceOld}</s> <b>${label.price}</b>`;
  desc.hidden = false;
}

const PDP_ICON_CACHED = '<span class="msi" aria-hidden="true" style="font-size:24px; color:#221f19">cached</span>';
const PDP_ICON_BLOCK = '<span class="msi" aria-hidden="true" style="font-size:24px; color:#221f19">block</span>';
const PDP_ICON_CONTACT = '<span class="msi" aria-hidden="true" style="font-size:24px; color:#221f19">chat</span>';

document.addEventListener('DOMContentLoaded', () => {
  renderPdpProduct();
  renderPdpNotice();
});
