(function () {
  // ===== Helpers =====
  function getCart(){ return JSON.parse(localStorage.getItem('cart') || '[]'); }
  function saveCart(c){
    localStorage.setItem('cart', JSON.stringify(c));
    emitUpdated();
  }
  function moneyToNumber(str){ return parseInt((str||'0').toString().replace(/\D/g,''))||0; }
  function numberToMoney(n){ return n.toLocaleString('vi-VN'); }

  // ===== Pub/Sub giỏ hàng =====
  function emitUpdated(){ window.dispatchEvent(new CustomEvent('cart:updated')); }

  // ===== Badge số lượng trên header =====
  function renderCartBadge() {
    var el = document.getElementById('cartCount');
    if (!el) return;
    var totalQty = getCart().reduce((s, p) => s + (p.qty||0), 0);
    el.textContent = totalQty;
  }

  // ===== Mini-cart dropdown (hover ở header) =====
  function renderCartPreview() {
    var wrap = document.querySelector('.header__cart-wrap');
    if (!wrap) return;

    var cart = getCart();
    if (!cart.length) {
      wrap.classList.add('empty');
      wrap.innerHTML = '';
      return;
    }

    wrap.classList.remove('empty');
    var html = '';
    var max = Math.min(5, cart.length);
    for (var i=0; i<max; i++) {
      var p = cart[i];
      var img = (p.images && p.images[0]) || p.image || '';
      var priceStr = p.priceMin || p.price || '0';
      var sub = moneyToNumber(priceStr) * (p.qty||1);
      html += `
        <div class="mini-cart-item">
          <img class="mini-cart-thumb" src="${img}" alt="">
          <div>
            <div class="mini-cart-name">${p.name}</div>
            <div class="mini-cart-sub">SL: ${p.qty||1} × ${priceStr}</div>
          </div>
          <div class="mini-cart-price">${numberToMoney(sub)} đ</div>
        </div>`;
    }
    if (cart.length > max) {
      html += `<div style="font-size:12px;color:#666;margin-top:6px;">… còn ${cart.length - max} sản phẩm nữa</div>`;
    }
    html += `
      <div class="mini-cart-actions">
        <a class="mini-btn mini-btn--outline" href="cart.html">Xem giỏ hàng</a>
        <a class="mini-btn mini-btn--primary" href="pay.html">Thanh toán</a>
      </div>`;
    wrap.innerHTML = html;
  }

  // ===== API thêm vào giỏ (tương thích cách gọi cũ) =====
  // Hỗ trợ: addToCart(P, true/false) hoặc addToCart(P, qty, buyNow)
  function addToCart(product, qtyOrBuyNow, buyNowMaybe) {
    if (!product) return;

    var qty = 1, buyNow = false;
    if (typeof qtyOrBuyNow === 'number') {
      qty = Math.max(1, qtyOrBuyNow|0);
      buyNow = !!buyNowMaybe;
    } else {
      buyNow = !!qtyOrBuyNow;
    }

    var cart = getCart();
    var exist = cart.find(x => x.id === product.id);
    if (exist) exist.qty = (exist.qty || 1) + qty;
    else cart.push({
      id: product.id, name: product.name, qty: qty,
      images: product.images, image: product.image,
      price: product.priceMin || product.price || '',
      priceMin: product.priceMin || product.price || ''
    });
    saveCart(cart);
    renderCartBadge();
    renderCartPreview();
    if (buyNow) location.href = 'cart.html';
  }

  // ===== Public API =====
  window.__CART__ = { getCart, saveCart, addToCart, renderCartBadge, renderCartPreview };

  // Khởi tạo & lắng nghe đồng bộ giữa các trang/tab
  function refreshHeader(){ renderCartBadge(); renderCartPreview(); }
  document.addEventListener('DOMContentLoaded', refreshHeader);
  window.addEventListener('cart:updated', refreshHeader);
  window.addEventListener('storage', function(e){
    if (e.key === 'cart') refreshHeader();
  });
})();

