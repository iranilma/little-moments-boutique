/**
 * ============================================================================
 * LITTLE MOMENTS KIDS BOUTIQUE — APPLICATION CONTROLLER & ROUTER (V2)
 * ============================================================================
 * Coordinates the 14 Boutique Views, Navigation, Drawers, Modals, and
 * reactive state interactions using window.LittleMomentsStore.
 * ============================================================================
 */

(function () {
  'use strict';

  const store = window.LittleMomentsStore;
  if (!store) {
    console.error('[LittleMoments] Store not loaded!');
    return;
  }

  // DOM Elements
  const viewport = document.getElementById('mainViewport');
  const cartBadge = document.getElementById('cartCountBadge');
  const wishlistBadge = document.getElementById('wishlistCountBadge');
  const toast = document.getElementById('toastNotification');
  const toastMsg = document.getElementById('toastMessage');

  // Drawers & Modals
  const cartDrawer = document.getElementById('cartDrawer');
  const cartDrawerBackdrop = document.getElementById('cartDrawerBackdrop');
  const cartDrawerItems = document.getElementById('cartDrawerItems');
  const cartDrawerCount = document.getElementById('cartDrawerCount');
  const cartDrawerSubtotal = document.getElementById('cartDrawerSubtotal');
  const cartDrawerTotal = document.getElementById('cartDrawerTotal');

  const wishlistDrawer = document.getElementById('wishlistDrawer');
  const wishlistDrawerBackdrop = document.getElementById('wishlistDrawerBackdrop');
  const wishlistDrawerItems = document.getElementById('wishlistDrawerItems');
  const wishlistDrawerCount = document.getElementById('wishlistDrawerCount');

  const quickViewModal = document.getElementById('quickViewModal');
  const quickViewBackdrop = document.getElementById('quickViewBackdrop');
  const quickViewContent = document.getElementById('quickViewContent');

  const mobileDrawer = document.getElementById('mobileDrawer');
  const mobileDrawerBackdrop = document.getElementById('mobileDrawerBackdrop');

  // Search input
  const headerSearchInput = document.getElementById('headerSearchInput');

  /* ==========================================================================
     NOTIFICATION TOAST HELPER
     ========================================================================== */
  function showToast(message) {
    if (!toast) return;
    toastMsg.textContent = message;
    toast.classList.remove('translate-y-24', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');
    setTimeout(() => {
      toast.classList.remove('translate-y-0', 'opacity-100');
      toast.classList.add('translate-y-24', 'opacity-0');
    }, 2800);
  }

  /* ==========================================================================
     BADGE & DRAWER SYNCS
     ========================================================================== */
  function updateBadges() {
    const cartTotals = store.cart.getTotals();
    const wishlistSnapshot = store.wishlist.getSnapshot();

    if (cartBadge) {
      cartBadge.textContent = cartTotals.totalCount;
      cartBadge.style.display = cartTotals.totalCount > 0 ? 'flex' : 'none';
    }
    if (cartDrawerCount) cartDrawerCount.textContent = cartTotals.totalCount;
    if (cartDrawerSubtotal) cartDrawerSubtotal.textContent = `$${cartTotals.subtotal.toFixed(2)}`;
    if (cartDrawerTotal) cartDrawerTotal.textContent = `$${cartTotals.total.toFixed(2)}`;

    if (wishlistBadge) {
      wishlistBadge.textContent = wishlistSnapshot.count;
      wishlistBadge.style.display = wishlistSnapshot.count > 0 ? 'flex' : 'none';
    }
    if (wishlistDrawerCount) wishlistDrawerCount.textContent = wishlistSnapshot.count;
  }

  function renderCartDrawer() {
    const items = store.cart.getItems();
    if (!cartDrawerItems) return;

    if (items.length === 0) {
      cartDrawerItems.innerHTML = `
        <div class="py-12 text-center text-[#8B6B55]">
          <div class="text-4xl mb-3">🧺</div>
          <p class="font-serif text-lg text-[#3D5A45] mb-1">Your cart is empty</p>
          <p class="text-xs max-w-xs mx-auto mb-5 leading-relaxed">Explore our Montessori-aligned early learning and activity printables!</p>
          <a href="#shop" onclick="closeCart()" class="inline-block px-5 py-2 rounded-full bg-[#D9A6A0] text-white text-xs font-semibold hover:bg-[#CF948D] transition-colors">Browse Printables →</a>
        </div>
      `;
      return;
    }

    cartDrawerItems.innerHTML = items.map(({ product, quantity }) => `
      <div class="flex items-center gap-3.5 py-3 border-b border-[#EEDFCF]/60 last:border-0">
        <div class="w-16 h-16 bg-[#FFF8EE] border border-[#EEDFCF] rounded-xl p-1 flex-shrink-0 flex items-center justify-center">
          <img src="${product.iconImage}" alt="${product.title}" class="max-h-full max-w-full object-contain watercolor-blend" />
        </div>
        <div class="flex-1 min-w-0">
          <h4 class="font-serif text-xs font-medium text-[#3D5A45] truncate">${product.title}</h4>
          <p class="text-[11px] text-[#8B6B55]">$${product.price.toFixed(2)} · Instant PDF</p>
          <div class="flex items-center gap-2 mt-1.5">
            <div class="inline-flex items-center border border-[#EEDFCF] rounded-full bg-[#FFFDF9] text-xs">
              <button onclick="window.LittleMomentsStore.cart.updateQuantity('${product.id}', ${quantity - 1})" class="px-2 py-0.5 text-[#586345] hover:text-[#D9A6A0] cursor-pointer">−</button>
              <span class="px-1.5 text-xs font-medium">${quantity}</span>
              <button onclick="window.LittleMomentsStore.cart.updateQuantity('${product.id}', ${quantity + 1})" class="px-2 py-0.5 text-[#586345] hover:text-[#D9A6A0] cursor-pointer">+</button>
            </div>
            <button onclick="window.LittleMomentsStore.cart.removeItem('${product.id}') class="text-[11px] text-[#A09587] hover:text-[#D9A6A0] transition-colors cursor-pointer ml-auto">Remove</button>
          </div>
        </div>
      </div>
    `).join('');
  }

  function renderWishlistDrawer() {
    const products = store.wishlist.getProducts();
    if (!wishlistDrawerItems) return;

    if (products.length === 0) {
      wishlistDrawerItems.innerHTML = `
        <div class="py-12 text-center text-[#8B6B55]">
          <div class="text-4xl mb-3">♡</div>
          <p class="font-serif text-lg text-[#3D5A45] mb-1">Your wishlist is empty</p>
          <p class="text-xs max-w-xs mx-auto mb-5 leading-relaxed">Save your favorite printables and routine charts for future learning moments!</p>
          <a href="#shop" onclick="closeWishlist()" class="inline-block px-5 py-2 rounded-full bg-[#D9A6A0] text-white text-xs font-semibold hover:bg-[#CF948D] transition-colors">Explore Collections →</a>
        </div>
      `;
      return;
    }

    wishlistDrawerItems.innerHTML = products.map(product => `
      <div class="flex items-center gap-3.5 py-3 border-b border-[#EEDFCF]/60 last:border-0">
        <div class="w-16 h-16 bg-[#FFF8EE] border border-[#EEDFCF] rounded-xl p-1 flex-shrink-0 flex items-center justify-center">
          <img src="${product.iconImage}" alt="${product.title}" class="max-h-full max-w-full object-contain watercolor-blend" />
        </div>
        <div class="flex-1 min-w-0">
          <h4 class="font-serif text-xs font-medium text-[#3D5A45] truncate">${product.title}</h4>
          <p class="text-[11px] text-[#8B6B55]">$${product.price.toFixed(2)}</p>
          <div class="flex items-center gap-2 mt-1.5">
            <button onclick="window.LittleMomentsStore.wishlist.moveToCart('${product.id}'); showToast('Moved to cart!');" class="px-3 py-1 rounded-full bg-[#D9A6A0] hover:bg-[#CF948D] text-white text-[11px] font-semibold transition-colors cursor-pointer">
              Add to Basket
            </button>
            <button onclick="window.LittleMomentsStore.wishlist.remove('${product.id}')" class="text-[11px] text-[#A09587] hover:text-[#D9A6A0] transition-colors cursor-pointer ml-auto">
              Remove
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }

  // Open/Close Drawers
  function openCart() {
    renderCartDrawer();
    if (cartDrawer) cartDrawer.classList.remove('hidden');
  }
  window.openCart = openCart;

  function closeCart() {
    if (cartDrawer) cartDrawer.classList.add('hidden');
  }
  window.closeCart = closeCart;

  function openWishlist() {
    renderWishlistDrawer();
    if (wishlistDrawer) wishlistDrawer.classList.remove('hidden');
  }
  window.openWishlist = openWishlist;

  function closeWishlist() {
    if (wishlistDrawer) wishlistDrawer.classList.add('hidden');
  }
  window.closeWishlist = closeWishlist;

  function closeQuickViewModal() {
    if (quickViewModal) quickViewModal.classList.add('hidden');
  }
  window.closeQuickViewModal = closeQuickViewModal;

  window.openQuickView = function (productId) {
    const product = store.getProductById(productId);
    if (!product || !quickViewContent) return;

    quickViewContent.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div class="bg-[#FFF8EE] border border-[#EEDFCF] rounded-2xl p-6 flex items-center justify-center min-h-[260px]">
          <img src="${product.iconImage}" alt="${product.title}" class="max-h-56 max-w-full object-contain drop-shadow-sm" />
        </div>
        <div class="space-y-4">
          <div>
            <span class="inline-block text-[11px] uppercase tracking-wider font-bold text-[#A8B59A] mb-1 font-sans">
              Instant Printable Pack · ${product.ageRange}
            </span>
            <h3 class="font-serif text-2xl font-medium text-[#3D5A45] leading-tight">${product.title}</h3>
            <p class="text-xs text-[#8B6B55] mt-1 italic font-serif">${product.subtitle}</p>
          </div>

          <div class="flex items-center gap-3">
            <span class="font-serif text-2xl font-semibold text-[#3D5A45]">$${product.price.toFixed(2)}</span>
            ${product.comparePrice ? `<span class="text-sm text-[#A09587] line-through font-sans">$${product.comparePrice.toFixed(2)}</span>` : ''}
            <span class="text-[10px] text-[#D9A6A0] font-bold bg-[#F9ECE9] px-2 py-0.5 rounded-full font-sans">300 DPI High-Res PDF</span>
          </div>

          <p class="text-xs text-[#4A573A] leading-relaxed">${product.description}</p>

          <div class="pt-2 flex items-center gap-3">
            <button onclick="window.LittleMomentsStore.cart.addItem('${product.id}', 1); showToast('Added to cart!'); closeQuickViewModal();" class="flex-1 py-3 px-6 rounded-full bg-[#D9A6A0] hover:bg-[#CF948D] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer">
              Add to Basket — $${product.price.toFixed(2)}
            </button>
            <button onclick="window.LittleMomentsStore.wishlist.toggle('${product.id}'); showToast('Wishlist updated!');" class="p-2.5 rounded-full border border-[#EEDFCF] hover:border-[#D9A6A0] text-[#586345] transition-colors cursor-pointer">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
            </button>
          </div>

          <div class="pt-2 border-t border-[#EEDFCF]/60 text-[11px] text-[#8B6B55] space-y-1">
            <p>✔ Instant download access after checkout</p>
            <p>✔ Standard US Letter & A4 sizes included</p>
          </div>
        </div>
      </div>
    `;
    if (quickViewModal) quickViewModal.classList.remove('hidden');
  };

  // Event Listeners for Store Events
  store.events.on('cart:updated', () => {
    updateBadges();
    renderCartDrawer();
  });
  store.events.on('cart:item-added', (data) => {
    showToast(`Added "${data.product.title}" to cart!`);
    updateBadges();
    renderCartDrawer();
  });
  store.events.on('wishlist:updated', () => {
    updateBadges();
    renderWishlistDrawer();
  });

  // UI Event Bindings
  document.getElementById('navCartBtn')?.addEventListener('click', openCart);
  document.getElementById('closeCartDrawer')?.addEventListener('click', closeCart);
  cartDrawerBackdrop?.addEventListener('click', closeCart);

  document.getElementById('navWishlistBtn')?.addEventListener('click', openWishlist);
  document.getElementById('closeWishlistDrawer')?.addEventListener('click', closeWishlist);
  wishlistDrawerBackdrop?.addEventListener('click', closeWishlist);

  document.getElementById('closeQuickView')?.addEventListener('click', closeQuickViewModal);
  quickViewBackdrop?.addEventListener('click', closeQuickViewModal);

  document.getElementById('wishlistMoveAllBtn')?.addEventListener('click', () => {
    const moved = store.wishlist.moveAllToCart();
    if (moved > 0) {
      showToast(`Moved ${moved} items to cart!`);
      closeWishlist();
      openCart();
    }
  });

  document.getElementById('checkoutDrawerBtn')?.addEventListener('click', () => {
    closeCart();
    window.location.hash = '#cart';
  });

  // Mobile menu drawer
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const closeMobileDrawer = document.getElementById('closeMobileDrawer');
  mobileMenuBtn?.addEventListener('click', () => mobileDrawer?.classList.remove('hidden'));
  closeMobileDrawer?.addEventListener('click', () => mobileDrawer?.classList.add('hidden'));
  mobileDrawerBackdrop?.addEventListener('click', () => mobileDrawer?.classList.add('hidden'));
  document.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', () => mobileDrawer?.classList.add('hidden'));
  });

  // Global search trigger
  headerSearchInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const q = headerSearchInput.value.trim();
      if (q) window.location.hash = `#shop?q=${encodeURIComponent(q)}`;
    }
  });

  /* ==========================================================================
     ROUTE RENDERERS FOR ALL 14 PAGES
     ========================================================================== */

  // Helper for active navigation highlight
  function setActiveNavTab(tabName) {
    document.querySelectorAll('.nav-tab').forEach(tab => {
      const navKey = tab.getAttribute('data-nav');
      const hasDropdown = tab.closest('.group') !== null;
      const baseClasses = `nav-tab inline-flex items-center justify-center h-8 px-4 rounded-full transition-all leading-none ${hasDropdown ? 'gap-1' : ''}`;
      if (navKey === tabName) {
        tab.className = `${baseClasses} font-semibold bg-[#F9ECE9] text-[#D9A6A0]`;
      } else {
        tab.className = `${baseClasses} font-medium text-[#4A573A] hover:bg-[#F9ECE9]/60 hover:text-[#D9A6A0]`;
      }
    });
  }

  /* --------------------------------------------------------------------------
     1. HOME VIEW (EXACT WIREFRAME ORDER)
     -------------------------------------------------------------------------- */
  function renderHomeView() {
    setActiveNavTab('home');

    const featured = store.getFeaturedProducts();

    viewport.innerHTML = `
      <!-- HERO SECTION -->
      <section class="relative bg-[#FFF8EE] pt-8 sm:pt-12 pb-12 sm:pb-16 px-4 sm:px-8 overflow-hidden">
        <div class="relative z-10 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          <!-- Left: Hero Illustration (Oliver Bear & Rosie Bunny with flowers) -->
          <div class="md:col-span-6 flex items-center justify-center order-2 md:order-1">
            <div class="relative w-full max-w-md lg:max-w-lg aspect-[4/3] flex items-center justify-center">
              <img
                src="assets/images/hero_mascots_transparent.png"
                alt="Oliver Bear and Rosie Bunny"
                class="w-full h-auto max-h-[380px] object-contain watercolor-blend drop-shadow-sm mascot-bob"
              />
            </div>
          </div>

          <!-- Right: Hero Messaging & CTAs -->
          <div class="md:col-span-6 text-center md:text-left space-y-5 order-1 md:order-2">
            <div>
              <h1 class="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-[#3D5A45] leading-[1.18] tracking-tight">
                Printable Resources<br />for Little Learners
              </h1>
              <div class="flex items-center justify-center md:justify-start gap-2 text-[#D9A6A0] text-sm mt-3">
                <span>♥</span>
              </div>
            </div>

            <p class="text-sm sm:text-base text-[#586345] leading-relaxed max-w-lg mx-auto md:mx-0">
              Educational, creative and fun digital products to support your child’s development.
            </p>

            <div class="pt-2 flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3.5">
              <a
                href="#shop"
                class="btn-primary w-full sm:w-auto px-8 py-3.5 text-center text-sm font-semibold tracking-wide inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Shop Now</span>
                <span>→</span>
              </a>
              <a
                href="#collections"
                class="btn-secondary w-full sm:w-auto px-7 py-3 text-center text-sm font-medium inline-flex items-center justify-center transition-all"
              >
                Explore Collections
              </a>
            </div>
          </div>

        </div>
      </section>

      <!-- 4-BENEFIT STRIP (MATCHES WIREFRAME STRIP) -->
      <section class="w-full bg-[#FFFBF5] border-y border-[#EEDFCF]/60 py-4 sm:py-5 px-4">
        <div class="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          
          <div class="flex items-center justify-center gap-2.5 py-1">
            <svg class="w-5 h-5 text-[#3D5A45]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
            <span class="font-serif text-xs sm:text-sm font-semibold text-[#3D5A45]">Instant Download</span>
          </div>

          <div class="flex items-center justify-center gap-2.5 py-1 md:border-l md:border-[#EEDFCF]/80">
            <svg class="w-5 h-5 text-[#3D5A45]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
            <span class="font-serif text-xs sm:text-sm font-semibold text-[#3D5A45]">Print at Home</span>
          </div>

          <div class="flex items-center justify-center gap-2.5 py-1 border-t md:border-t-0 md:border-l md:border-[#EEDFCF]/80 pt-2 md:pt-1">
            <svg class="w-5 h-5 text-[#3D5A45]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
            <span class="font-serif text-xs sm:text-sm font-semibold text-[#3D5A45]">Kid-Friendly Designs</span>
          </div>

          <div class="flex items-center justify-center gap-2.5 py-1 border-t md:border-t-0 md:border-l md:border-[#EEDFCF]/80 pt-2 md:pt-1">
            <img src="assets/images/botanical/leafy-sprig-small.png" alt="botanical" class="h-4 w-auto watercolor-blend opacity-85" />
            <span class="font-serif text-xs sm:text-sm font-semibold text-[#3D5A45]">Thoughtfully Created</span>
          </div>

        </div>
      </section>

      <!-- SHOP BY COLLECTION (6 CATEGORY CARDS) -->
      <section class="relative py-12 sm:py-16 px-4 sm:px-8 bg-[#FFF8EE] overflow-hidden">
        <!-- Subtle Botanical Boundary Accents (New Original Watercolor Collection) -->
        <img
          src="assets/images/botanical/leafy-sprig-left.png"
          alt=""
          class="botanical-frame absolute top-1/2 -translate-y-1/2 left-0 w-12 sm:w-16 lg:w-20 h-auto object-contain opacity-80 hidden sm:block"
        />
        <img
          src="assets/images/botanical/leafy-sprig-right.png"
          alt=""
          class="botanical-frame absolute top-1/2 -translate-y-1/2 right-0 w-12 sm:w-16 lg:w-20 h-auto object-contain opacity-80 hidden sm:block"
        />

        <div class="relative z-10 max-w-7xl mx-auto">
          
          <div class="text-center mb-10">
            <div class="botanical-title-wrap">
              <img src="assets/images/botanical/leafy-sprig-left.png" alt="botanical branch" class="h-4 sm:h-5 w-auto object-contain watercolor-blend" />
              <h2 class="font-serif text-2xl sm:text-3xl font-medium text-[#3D5A45]">Shop by Collection</h2>
              <img src="assets/images/botanical/leafy-sprig-right.png" alt="botanical branch" class="h-4 sm:h-5 w-auto object-contain watercolor-blend" />
            </div>
            <div class="flex justify-center text-[#D9A6A0] text-xs mt-1"><span>♥</span></div>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
            
            <!-- 1. Learning & Education -->
            <a href="#category?id=learning" class="card-hover-lift bg-[#FFFDF9] border border-[#EEDFCF] rounded-2xl p-4 sm:p-5 text-center flex flex-col items-center justify-between group shadow-subtle min-h-[140px]">
              <div class="w-16 h-14 flex items-center justify-center mb-2">
                <img src="assets/images/learning_rainbow.png" alt="Learning & Education" class="max-h-full max-w-full object-contain watercolor-blend transition-transform duration-300 group-hover:scale-110" />
              </div>
              <h3 class="font-serif text-xs sm:text-sm font-semibold text-[#3D5A45] leading-tight">Learning<br />& Education</h3>
            </a>

            <!-- 2. Kids Activities -->
            <a href="#category?id=activities" class="card-hover-lift bg-[#FFFDF9] border border-[#EEDFCF] rounded-2xl p-4 sm:p-5 text-center flex flex-col items-center justify-between group shadow-subtle min-h-[140px]">
              <div class="w-16 h-14 flex items-center justify-center mb-2">
                <img src="assets/images/kids_activities.png" alt="Kids Activities" class="max-h-full max-w-full object-contain watercolor-blend transition-transform duration-300 group-hover:scale-110" />
              </div>
              <h3 class="font-serif text-xs sm:text-sm font-semibold text-[#3D5A45] leading-tight">Kids<br />Activities</h3>
            </a>

            <!-- 3. Routines & Planners -->
            <a href="#category?id=routines" class="card-hover-lift bg-[#FFFDF9] border border-[#EEDFCF] rounded-2xl p-4 sm:p-5 text-center flex flex-col items-center justify-between group shadow-subtle min-h-[140px]">
              <div class="w-16 h-14 flex items-center justify-center mb-2">
                <img src="assets/images/routines_planners.png" alt="Routines & Planners" class="max-h-full max-w-full object-contain watercolor-blend transition-transform duration-300 group-hover:scale-110" />
              </div>
              <h3 class="font-serif text-xs sm:text-sm font-semibold text-[#3D5A45] leading-tight">Routines<br />& Planners</h3>
            </a>

            <!-- 4. Family & Memories -->
            <a href="#category?id=family" class="card-hover-lift bg-[#FFFDF9] border border-[#EEDFCF] rounded-2xl p-4 sm:p-5 text-center flex flex-col items-center justify-between group shadow-subtle min-h-[140px]">
              <div class="w-16 h-14 flex items-center justify-center mb-2">
                <img src="assets/images/family_memories.png" alt="Family & Memories" class="max-h-full max-w-full object-contain watercolor-blend transition-transform duration-300 group-hover:scale-110" />
              </div>
              <h3 class="font-serif text-xs sm:text-sm font-semibold text-[#3D5A45] leading-tight">Family<br />& Memories</h3>
            </a>

            <!-- 5. Celebrations & Holidays -->
            <a href="#category?id=celebrations" class="card-hover-lift bg-[#FFFDF9] border border-[#EEDFCF] rounded-2xl p-4 sm:p-5 text-center flex flex-col items-center justify-between group shadow-subtle min-h-[140px]">
              <div class="w-16 h-14 flex items-center justify-center mb-2">
                <img src="assets/images/celebrations_holidays.png" alt="Celebrations & Holidays" class="max-h-full max-w-full object-contain watercolor-blend transition-transform duration-300 group-hover:scale-110" />
              </div>
              <h3 class="font-serif text-xs sm:text-sm font-semibold text-[#3D5A45] leading-tight">Celebrations<br />& Holidays</h3>
            </a>

            <!-- 6. Christian Kids -->
            <a href="#category?id=christian" class="card-hover-lift bg-[#FFFDF9] border border-[#EEDFCF] rounded-2xl p-4 sm:p-5 text-center flex flex-col items-center justify-between group shadow-subtle min-h-[140px]">
              <div class="w-16 h-14 flex items-center justify-center mb-2">
                <img src="assets/images/christian_kids.png" alt="Christian Kids" class="max-h-full max-w-full object-contain watercolor-blend transition-transform duration-300 group-hover:scale-110" />
              </div>
              <h3 class="font-serif text-xs sm:text-sm font-semibold text-[#3D5A45] leading-tight">Christian<br />Kids</h3>
            </a>

          </div>

        </div>
      </section>

      <!-- FEATURED PRODUCTS (EXACT 4 PRODUCTS FROM HOMEPAGE COMPOSITE) -->
      <section class="relative py-12 sm:py-16 px-4 sm:px-8 bg-[#FFF8EE] border-t border-[#EEDFCF]/60 overflow-hidden">
        <!-- Subtle Botanical Boundary Accents (New Original Watercolor Collection) -->
        <img
          src="assets/images/botanical/leafy-sprig-left.png"
          alt=""
          class="botanical-frame absolute top-1/2 -translate-y-1/2 left-0 w-12 sm:w-16 lg:w-20 h-auto object-contain opacity-80 hidden sm:block"
        />
        <img
          src="assets/images/botanical/leafy-sprig-right.png"
          alt=""
          class="botanical-frame absolute top-1/2 -translate-y-1/2 right-0 w-12 sm:w-16 lg:w-20 h-auto object-contain opacity-80 hidden sm:block"
        />

        <div class="relative z-10 max-w-7xl mx-auto">
          
          <div class="text-center mb-10">
            <div class="botanical-title-wrap">
              <img src="assets/images/botanical/leafy-sprig-left.png" alt="botanical branch" class="h-4 sm:h-5 w-auto object-contain watercolor-blend" />
              <h2 class="font-serif text-2xl sm:text-3xl font-medium text-[#3D5A45]">Featured Products</h2>
              <img src="assets/images/botanical/leafy-sprig-right.png" alt="botanical branch" class="h-4 sm:h-5 w-auto object-contain watercolor-blend" />
            </div>
            <div class="flex justify-center text-[#D9A6A0] text-xs mt-1"><span>♥</span></div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            ${featured.map(product => `
              <div class="card-hover-lift bg-[#FFFDF9] border border-[#EEDFCF] rounded-2xl p-4 flex flex-col justify-between shadow-subtle group">
                <div>
                  <div class="relative w-full aspect-[4/3] bg-[#FFF8EE] rounded-xl overflow-hidden mb-3.5 flex items-center justify-center p-2 cursor-pointer" onclick="window.location.hash='#product?id=${product.id}'">
                    <img
                      src="${product.iconImage}"
                      alt="${product.title}"
                      class="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                    <button
                      onclick="event.stopPropagation(); window.LittleMomentsStore.wishlist.toggle('${product.id}'); showToast('Wishlist updated!');"
                      class="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 text-[#8B6B55] hover:text-[#D9A6A0] shadow-xs transition-colors"
                      title="Save to Wishlist"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                    </button>
                  </div>

                  <h3 class="font-serif text-sm font-semibold text-[#3D5A45] leading-snug cursor-pointer hover:text-[#D9A6A0] transition-colors" onclick="window.location.hash='#product?id=${product.id}'">
                    ${product.title}
                  </h3>

                  <div class="flex items-center gap-1.5 text-xs text-[#8B6B55] mt-1 mb-2">
                    <span class="text-[#D9A6A0]">★★★★★</span>
                    <span class="text-[11px] font-medium">(${product.reviewCount})</span>
                  </div>
                </div>

                <div class="pt-3 border-t border-[#EEDFCF]/60 flex items-center justify-between gap-2">
                  <span class="font-serif text-base font-semibold text-[#3D5A45]">$${product.price.toFixed(2)}</span>
                  <button
                    onclick="window.LittleMomentsStore.cart.addItem('${product.id}', 1); showToast('Added to cart!');"
                    class="px-4 py-1.5 rounded-full bg-[#D9A6A0] hover:bg-[#CF948D] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            `).join('')}
          </div>

          <div class="text-center mt-10">
            <a href="#shop" class="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-[#A8B59A] text-[#3D5A45] hover:bg-[#E2E9DC] text-xs font-semibold transition-all">
              <span>View All 18 Printables</span>
              <span>→</span>
            </a>
          </div>

        </div>
      </section>

      <!-- NEWSLETTER CTA (SCALLOPED RIBBON WITH ENVELOPE) -->
      <section class="relative py-12 sm:py-16 px-4 sm:px-8 bg-[#FFF8EE] overflow-hidden">
        <!-- Delicate Botanical Detail Complementing Envelope (New Original Watercolor Collection) -->
        <img
          src="assets/images/botanical/floral-cluster-rose.png"
          alt=""
          class="botanical-frame absolute top-1/2 -translate-y-1/2 right-0 w-24 sm:w-32 lg:w-40 h-auto object-contain opacity-90 hidden sm:block"
        />

        <div class="relative z-10 max-w-5xl mx-auto">
          <div class="scalloped-ribbon p-6 sm:p-10 shadow-card">
            <div class="flex flex-col md:flex-row items-center justify-between gap-6">
              
              <!-- Left: Envelope Icon with floral seal -->
              <div class="flex-shrink-0 flex items-center justify-center">
                <img
                  src="assets/images/newsletter_envelope.png"
                  alt="Join our little community"
                  class="w-20 sm:w-24 h-auto object-contain watercolor-blend drop-shadow-xs"
                />
              </div>

              <!-- Center: Text -->
              <div class="flex-1 text-center md:text-left space-y-1">
                <h3 class="font-serif text-2xl sm:text-3xl font-medium text-[#3D5A45]">
                  Join Our Little Community
                </h3>
                <p class="text-xs sm:text-sm text-[#586345] leading-relaxed">
                  Get new releases, special offers and free printables!
                </p>
              </div>

              <!-- Right: Form -->
              <div class="w-full md:w-auto flex-shrink-0">
                <form id="newsletterForm" class="flex flex-col sm:flex-row items-center gap-2" onsubmit="event.preventDefault(); const em=document.getElementById('nlEmail').value; if(em){ showToast('Thank you for subscribing! Check your inbox soon ♥'); document.getElementById('nlEmail').value=''; }">
                  <input
                    id="nlEmail"
                    type="email"
                    required
                    placeholder="Your email address"
                    class="w-full sm:w-64 px-4 py-2.5 text-xs text-[#2D2824] placeholder-[#A09587] bg-white border border-[#EEDFCF] rounded-full focus:outline-none focus:border-[#D9A6A0] shadow-xs font-sans"
                  />
                  <button
                    type="submit"
                    class="w-full sm:w-auto px-6 py-2.5 bg-[#D9A6A0] hover:bg-[#CF948D] text-white text-xs font-semibold rounded-full shadow-xs transition-colors cursor-pointer"
                  >
                    Subscribe
                  </button>
                </form>
              </div>

            </div>
          </div>
        </div>
      </section>
    `;
  }

  /* --------------------------------------------------------------------------
     2. SHOP ALL PRODUCTS VIEW
     -------------------------------------------------------------------------- */
  function renderShopView(params = {}) {
    setActiveNavTab('shop');

    const searchFilter = params.q || '';
    const initialSort = params.sort || 'featured';
    const initialBadge = params.badge || 'all';

    viewport.innerHTML = `
      <section class="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
        <!-- Breadcrumbs -->
        <nav class="text-xs text-[#8B6B55] mb-4">
          <a href="#home" class="hover:underline">Home</a> &gt; <span>Shop All Products</span>
        </nav>

        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 class="font-serif text-3xl font-medium text-[#3D5A45]">Shop All Products</h1>
            <p class="text-xs text-[#8B6B55] mt-1">Showing high-resolution digital printable resources for children & families</p>
          </div>

          <!-- Sort Dropdown -->
          <div class="flex items-center gap-2 text-xs text-[#4A573A]">
            <span class="font-medium">Sort by:</span>
            <select id="shopSortSelect" class="bg-[#FFFDF9] border border-[#EEDFCF] rounded-full px-3 py-1.5 text-xs focus:outline-none focus:border-[#D9A6A0]">
              <option value="featured" ${initialSort === 'featured' ? 'selected' : ''}>Newest & Featured</option>
              <option value="best-sellers" ${initialSort === 'best-sellers' ? 'selected' : ''}>Best Sellers</option>
              <option value="price-asc" ${initialSort === 'price-asc' ? 'selected' : ''}>Price: Low to High</option>
              <option value="price-desc" ${initialSort === 'price-desc' ? 'selected' : ''}>Price: High to Low</option>
              <option value="rating" ${initialSort === 'rating' ? 'selected' : ''}>Highest Rated</option>
              <option value="name-asc">Alphabetical</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <!-- Left: Filter By Sidebar -->
          <aside class="lg:col-span-3 bg-[#FFFDF9] border border-[#EEDFCF] rounded-2xl p-5 shadow-subtle space-y-6">
            <div>
              <h4 class="font-serif text-sm font-semibold text-[#3D5A45] mb-3 pb-2 border-b border-[#EEDFCF]">Filter By</h4>
            </div>

            <!-- Category -->
            <div class="space-y-2">
              <label class="text-xs font-bold text-[#586345] uppercase tracking-wider block">Category</label>
              <div class="space-y-1.5 text-xs text-[#4A573A]">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="shopCat" value="all" checked class="text-[#D9A6A0] focus:ring-0" />
                  <span>All Collections</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="shopCat" value="learning" class="text-[#D9A6A0] focus:ring-0" />
                  <span>Learning & Education</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="shopCat" value="activities" class="text-[#D9A6A0] focus:ring-0" />
                  <span>Kids Activities</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="shopCat" value="routines" class="text-[#D9A6A0] focus:ring-0" />
                  <span>Routines & Planners</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="shopCat" value="family" class="text-[#D9A6A0] focus:ring-0" />
                  <span>Family & Memories</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="shopCat" value="celebrations" class="text-[#D9A6A0] focus:ring-0" />
                  <span>Celebrations & Holidays</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="shopCat" value="christian" class="text-[#D9A6A0] focus:ring-0" />
                  <span>Christian Kids</span>
                </label>
              </div>
            </div>

            <!-- Age Range -->
            <div class="space-y-2">
              <label class="text-xs font-bold text-[#586345] uppercase tracking-wider block">Age Range</label>
              <div class="space-y-1.5 text-xs text-[#4A573A]">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="shopAge" value="all" checked class="text-[#D9A6A0] focus:ring-0" />
                  <span>All Ages</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="shopAge" value="toddler" class="text-[#D9A6A0] focus:ring-0" />
                  <span>Toddler (Ages 2–4)</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="shopAge" value="early" class="text-[#D9A6A0] focus:ring-0" />
                  <span>Early Primary (Ages 4–7)</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="shopAge" value="elementary" class="text-[#D9A6A0] focus:ring-0" />
                  <span>Elementary (Ages 7–12)</span>
                </label>
              </div>
            </div>

            <!-- Format -->
            <div class="space-y-2">
              <label class="text-xs font-bold text-[#586345] uppercase tracking-wider block">Format</label>
              <div class="space-y-1.5 text-xs text-[#4A573A]">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="shopFmt" value="all" checked class="text-[#D9A6A0] focus:ring-0" />
                  <span>All Formats</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="shopFmt" value="pack" class="text-[#D9A6A0] focus:ring-0" />
                  <span>Printable Pack</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="shopFmt" value="book" class="text-[#D9A6A0] focus:ring-0" />
                  <span>Journal / Activity Book</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="shopFmt" value="cards" class="text-[#D9A6A0] focus:ring-0" />
                  <span>Flashcard Decks</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="shopFmt" value="chart" class="text-[#D9A6A0] focus:ring-0" />
                  <span>Routine Charts & Mats</span>
                </label>
              </div>
            </div>

            <!-- Reset Button -->
            <button id="resetFiltersBtn" class="w-full py-2 rounded-full border border-[#A8B59A] text-xs font-semibold text-[#3D5A45] hover:bg-[#E2E9DC] transition-colors cursor-pointer">
              Reset Filters
            </button>
          </aside>

          <!-- Right: Product Grid -->
          <div class="lg:col-span-9">
            <div id="shopProductGrid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <!-- Rendered via JS -->
            </div>
            
            <div class="mt-12 flex justify-center items-center gap-2 text-xs font-sans text-[#586345]">
              <span class="w-8 h-8 rounded-full bg-[#D9A6A0] text-white flex items-center justify-center font-bold">1</span>
              <span class="w-8 h-8 rounded-full hover:bg-[#E2E9DC] flex items-center justify-center cursor-pointer">2</span>
              <span class="w-8 h-8 rounded-full hover:bg-[#E2E9DC] flex items-center justify-center cursor-pointer">3</span>
              <span class="px-2">...</span>
              <span class="w-8 h-8 rounded-full hover:bg-[#E2E9DC] flex items-center justify-center cursor-pointer">&gt;</span>
            </div>
          </div>

        </div>
      </section>
    `;

    function updateCatalogDisplay() {
      const selectedCat = document.querySelector('input[name="shopCat"]:checked')?.value || 'all';
      const selectedAge = document.querySelector('input[name="shopAge"]:checked')?.value || 'all';
      const selectedFmt = document.querySelector('input[name="shopFmt"]:checked')?.value || 'all';
      const sortBy = document.getElementById('shopSortSelect')?.value || 'featured';

      const results = store.queryCatalog({
        collectionId: selectedCat,
        ageTag: selectedAge,
        formatType: selectedFmt,
        sortBy: sortBy,
        search: searchFilter
      });

      const grid = document.getElementById('shopProductGrid');
      if (!grid) return;

      if (results.length === 0) {
        grid.innerHTML = `
          <div class="col-span-full py-16 text-center text-[#8B6B55]">
            <p class="font-serif text-lg text-[#3D5A45]">No printables found matching your filter</p>
            <p class="text-xs mt-1">Try resetting the filters to view all products.</p>
          </div>
        `;
        return;
      }

      grid.innerHTML = results.map(product => `
        <div class="card-hover-lift bg-[#FFFDF9] border border-[#EEDFCF] rounded-2xl p-4 flex flex-col justify-between shadow-subtle group">
          <div>
            <div class="relative w-full aspect-[4/3] bg-[#FFF8EE] rounded-xl overflow-hidden mb-3.5 flex items-center justify-center p-2 cursor-pointer" onclick="window.location.hash='#product?id=${product.id}'">
              <img
                src="${product.iconImage}"
                alt="${product.title}"
                class="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
              />
              ${product.badge ? `<span class="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F9ECE9] text-[#D9A6A0] font-sans">${product.badge}</span>` : ''}
              <button
                onclick="event.stopPropagation(); window.LittleMomentsStore.wishlist.toggle('${product.id}'); showToast('Wishlist updated!');"
                class="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 text-[#8B6B55] hover:text-[#D9A6A0] shadow-xs transition-colors"
                title="Save to Wishlist"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
              </button>
            </div>

            <h3 class="font-serif text-sm font-semibold text-[#3D5A45] leading-snug cursor-pointer hover:text-[#D9A6A0] transition-colors" onclick="window.location.hash='#product?id=${product.id}'">
              ${product.title}
            </h3>

            <div class="flex items-center gap-1.5 text-xs text-[#8B6B55] mt-1 mb-2">
              <span class="text-[#D9A6A0]">★★★★★</span>
              <span class="text-[11px] font-medium">(${product.reviewCount})</span>
            </div>
          </div>

          <div class="pt-3 border-t border-[#EEDFCF]/60 flex items-center justify-between gap-2">
            <div>
              <span class="font-serif text-base font-semibold text-[#3D5A45]">$${product.price.toFixed(2)}</span>
              ${product.comparePrice ? `<span class="text-xs text-[#A09587] line-through ml-1">$${product.comparePrice.toFixed(2)}</span>` : ''}
            </div>
            <button
              onclick="window.LittleMomentsStore.cart.addItem('${product.id}', 1); showToast('Added to cart!');"
              class="px-4 py-1.5 rounded-full bg-[#D9A6A0] hover:bg-[#CF948D] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              Add to Cart
            </button>
          </div>
        </div>
      `).join('');
    }

    // Attach filter listeners
    document.querySelectorAll('input[name="shopCat"], input[name="shopAge"], input[name="shopFmt"]').forEach(input => {
      input.addEventListener('change', updateCatalogDisplay);
    });
    document.getElementById('shopSortSelect')?.addEventListener('change', updateCatalogDisplay);
    document.getElementById('resetFiltersBtn')?.addEventListener('click', () => {
      document.querySelector('input[name="shopCat"][value="all"]').checked = true;
      document.querySelector('input[name="shopAge"][value="all"]').checked = true;
      document.querySelector('input[name="shopFmt"][value="all"]').checked = true;
      updateCatalogDisplay();
    });

    updateCatalogDisplay();
  }

  /* --------------------------------------------------------------------------
     3. PRODUCT DETAIL VIEW (PDP)
     -------------------------------------------------------------------------- */
  function renderProductDetailView(productId) {
    const product = store.getProductById(productId) || store.products[0];
    const collection = store.collections[product.collectionId] || store.collections.learning;

    viewport.innerHTML = `
      <section class="max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
        <!-- Breadcrumbs -->
        <nav class="text-xs text-[#8B6B55] mb-6">
          <a href="#home" class="hover:underline">Home</a> &gt; 
          <a href="#shop" class="hover:underline">Shop</a> &gt; 
          <a href="#category?id=${product.collectionId}" class="hover:underline">${collection.title}</a> &gt; 
          <span class="text-[#3D5A45] font-medium">${product.title}</span>
        </nav>

        <div class="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-start mb-16">
          
          <!-- Left: Big Product Image Preview Gallery -->
          <div class="md:col-span-6 space-y-4">
            <div class="w-full aspect-[4/3] bg-[#FFFDF9] border border-[#EEDFCF] rounded-3xl p-8 flex items-center justify-center shadow-card relative overflow-hidden">
              <img
                src="${product.iconImage}"
                alt="${product.title}"
                class="max-h-72 max-w-full object-contain drop-shadow-md"
              />
              <span class="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold bg-[#F9ECE9] text-[#D9A6A0] font-sans">
                300 DPI High-Res PDF
              </span>
            </div>

            <!-- Thumbnail Selector Strip -->
            <div class="grid grid-cols-4 gap-3">
              <div class="border-2 border-[#D9A6A0] rounded-xl p-2 bg-[#FFF8EE] flex items-center justify-center aspect-square cursor-pointer">
                <img src="${product.iconImage}" alt="thumb" class="max-h-full object-contain" />
              </div>
              <div class="border border-[#EEDFCF] rounded-xl p-2 bg-[#FFFDF9] flex items-center justify-center aspect-square opacity-70">
                <img src="assets/images/botanical/floral-cluster-peach.png" alt="thumb" class="max-h-6 object-contain" />
              </div>
              <div class="border border-[#EEDFCF] rounded-xl p-2 bg-[#FFFDF9] flex items-center justify-center aspect-square opacity-70">
                <img src="assets/images/brand_logo_circle.png" alt="thumb" class="max-h-full object-contain" />
              </div>
              <div class="border border-[#EEDFCF] rounded-xl p-2 bg-[#FFFDF9] flex items-center justify-center aspect-square opacity-70">
                <img src="assets/images/newsletter_envelope.png" alt="thumb" class="max-h-full object-contain" />
              </div>
            </div>
          </div>

          <!-- Right: Product Title, Stepper, Actions & Highlights -->
          <div class="md:col-span-6 space-y-5">
            <div>
              <div class="flex items-center justify-between">
                <span class="text-xs uppercase tracking-widest font-bold text-[#A8B59A] font-sans">
                  ${collection.title} · ${product.ageRange}
                </span>
                <button
                  onclick="window.LittleMomentsStore.wishlist.toggle('${product.id}'); showToast('Wishlist updated!');"
                  class="p-2 text-[#8B6B55] hover:text-[#D9A6A0] transition-colors cursor-pointer"
                  title="Save to Wishlist"
                >
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                </button>
              </div>

              <h1 class="font-serif text-3xl sm:text-4xl font-medium text-[#3D5A45] mt-1 leading-tight">
                ${product.title}
              </h1>

              <div class="flex items-center gap-2 mt-2">
                <span class="text-[#D9A6A0] text-sm">★★★★★</span>
                <span class="text-xs font-semibold text-[#586345]">5.0 (${product.reviewCount} parent reviews)</span>
              </div>
            </div>

            <!-- Price -->
            <div class="flex items-baseline gap-3 pt-2 border-t border-[#EEDFCF]/60">
              <span class="font-serif text-3xl font-semibold text-[#3D5A45]">$${product.price.toFixed(2)}</span>
              ${product.comparePrice ? `<span class="text-sm text-[#A09587] line-through">$${product.comparePrice.toFixed(2)}</span>` : ''}
              <span class="text-xs text-[#D9A6A0] font-bold bg-[#F9ECE9] px-2.5 py-0.5 rounded-full font-sans">Instant PDF Download</span>
            </div>

            <p class="text-xs sm:text-sm text-[#4A573A] leading-relaxed">
              ${product.description}
            </p>

            ${product.id === 'prod-kids-prayer-journal' ? `
              <!-- Special Interactive Flipbook Callout -->
              <div class="p-4 bg-[#EAF2E4] rounded-2xl border border-[#CAD8C1] flex items-center justify-between gap-4">
                <div class="text-xs text-[#3D5A45]">
                  <strong class="block font-serif text-sm">Interactive 110-Page Flipbook Included!</strong>
                  Preview the 110-page journal online or print at home.
                </div>
                <a href="kids-prayer-journal.html" target="_blank" class="px-4 py-2 rounded-full bg-[#3D5A45] hover:bg-[#4A573A] text-white text-xs font-semibold whitespace-nowrap transition-colors">
                  Open Studio ↗
                </a>
              </div>
            ` : ''}

            <!-- Stepper & Add to Cart -->
            <div class="flex items-center gap-3 pt-2">
              <div class="inline-flex items-center border border-[#EEDFCF] rounded-full bg-[#FFFDF9] text-sm font-semibold">
                <button id="pdpQtyDec" class="px-3 py-2 text-[#586345] hover:text-[#D9A6A0] cursor-pointer">−</button>
                <span id="pdpQtyVal" class="px-3 text-sm">1</span>
                <button id="pdpQtyInc" class="px-3 py-2 text-[#586345] hover:text-[#D9A6A0] cursor-pointer">+</button>
              </div>

              <button
                id="pdpAddToCartBtn"
                class="flex-1 py-3 px-6 rounded-full bg-[#D9A6A0] hover:bg-[#CF948D] text-white text-sm font-semibold shadow-xs hover:shadow transition-all cursor-pointer"
              >
                Add to Cart — $${product.price.toFixed(2)}
              </button>
            </div>

            <!-- Bulleted Value Checkmarks (Matches Wireframe) -->
            <div class="pt-4 border-t border-[#EEDFCF]/60 text-xs text-[#4A573A] space-y-2">
              <p class="flex items-center gap-2">
                <svg class="w-4 h-4 text-[#A8B59A]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                <span>Instant Download — Link sent directly to your email</span>
              </p>
              <p class="flex items-center gap-2">
                <svg class="w-4 h-4 text-[#A8B59A]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                <span>Printable at Home — Formatted for US Letter & A4 paper</span>
              </p>
              <p class="flex items-center gap-2">
                <svg class="w-4 h-4 text-[#A8B59A]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                <span>High-Quality PDF — Crisp 300 DPI vector typography & watercolor</span>
              </p>
            </div>

          </div>

        </div>

        <!-- TABS UNDERNEATH: DESCRIPTION | WHAT'S INCLUDED | HOW IT WORKS -->
        <div class="bg-[#FFFDF9] border border-[#EEDFCF] rounded-3xl p-6 sm:p-10 shadow-card">
          <div class="flex items-center gap-6 border-b border-[#EEDFCF] pb-3 mb-6 text-sm font-serif">
            <button id="tabBtnDesc" onclick="switchPdpTab('desc')" class="font-semibold text-[#3D5A45] border-b-2 border-[#D9A6A0] pb-2 cursor-pointer">Description</button>
            <button id="tabBtnInc" onclick="switchPdpTab('inc')" class="text-[#8B6B55] hover:text-[#3D5A45] pb-2 cursor-pointer">What's Included</button>
            <button id="tabBtnHow" onclick="switchPdpTab('how')" class="text-[#8B6B55] hover:text-[#3D5A45] pb-2 cursor-pointer">How It Works</button>
          </div>

          <div id="pdpTabContentDesc" class="text-xs sm:text-sm text-[#4A573A] leading-relaxed space-y-3">
            <p>${product.description}</p>
            <p>Designed with care for gentle childhood learning. Our activities respect young attention spans with soft watercolor tones that encourage independent engagement and calm focus.</p>
          </div>

          <div id="pdpTabContentInc" class="hidden text-xs sm:text-sm text-[#4A573A] leading-relaxed space-y-2">
            <h4 class="font-serif text-base font-semibold text-[#3D5A45] mb-2">Package Checklist:</h4>
            <ul class="space-y-1.5 list-disc pl-5">
              ${(product.includes || []).map(item => `<li>${item}</li>`).join('')}
              <li>Standard US Letter (8.5 x 11 in) Printable PDF file</li>
              <li>International A4 Printable PDF file</li>
              <li>Paper stock recommendations and printing instruction card</li>
            </ul>
          </div>

          <div id="pdpTabContentHow" class="hidden text-xs sm:text-sm text-[#4A573A] leading-relaxed space-y-3">
            <h4 class="font-serif text-base font-semibold text-[#3D5A45] mb-2">Simple 3-Step Process:</h4>
            <p><strong>1. Download:</strong> Click the instant download link on your order receipt screen or from your email confirmation.</p>
            <p><strong>2. Print:</strong> Print at home on heavy cardstock (80–110lb recommended) or send to your favorite local print shop.</p>
            <p><strong>3. Enjoy:</strong> Cut along the guide lines, round the corners if desired, and enjoy meaningful learning moments with your little one!</p>
          </div>
        </div>
      </section>
    `;

    // Quantity selector logic
    let qty = 1;
    const qtyVal = document.getElementById('pdpQtyVal');
    document.getElementById('pdpQtyDec')?.addEventListener('click', () => {
      if (qty > 1) {
        qty--;
        if (qtyVal) qtyVal.textContent = qty;
      }
    });
    document.getElementById('pdpQtyInc')?.addEventListener('click', () => {
      qty++;
      if (qtyVal) qtyVal.textContent = qty;
    });

    document.getElementById('pdpAddToCartBtn')?.addEventListener('click', () => {
      store.cart.addItem(product.id, qty);
      showToast(`Added ${qty} item(s) to cart!`);
    });

    window.switchPdpTab = function (tab) {
      const cDesc = document.getElementById('pdpTabContentDesc');
      const cInc = document.getElementById('pdpTabContentInc');
      const cHow = document.getElementById('pdpTabContentHow');
      const bDesc = document.getElementById('tabBtnDesc');
      const bInc = document.getElementById('tabBtnInc');
      const bHow = document.getElementById('tabBtnHow');

      cDesc.classList.add('hidden');
      cInc.classList.add('hidden');
      cHow.classList.add('hidden');
      bDesc.className = 'text-[#8B6B55] hover:text-[#3D5A45] pb-2 cursor-pointer';
      bInc.className = 'text-[#8B6B55] hover:text-[#3D5A45] pb-2 cursor-pointer';
      bHow.className = 'text-[#8B6B55] hover:text-[#3D5A45] pb-2 cursor-pointer';

      if (tab === 'desc') {
        cDesc.classList.remove('hidden');
        bDesc.className = 'font-semibold text-[#3D5A45] border-b-2 border-[#D9A6A0] pb-2 cursor-pointer';
      } else if (tab === 'inc') {
        cInc.classList.remove('hidden');
        bInc.className = 'font-semibold text-[#3D5A45] border-b-2 border-[#D9A6A0] pb-2 cursor-pointer';
      } else if (tab === 'how') {
        cHow.classList.remove('hidden');
        bHow.className = 'font-semibold text-[#3D5A45] border-b-2 border-[#D9A6A0] pb-2 cursor-pointer';
      }
    };
  }

  /* --------------------------------------------------------------------------
     4. COLLECTIONS HUB VIEW
     -------------------------------------------------------------------------- */
  function renderCollectionsView() {
    setActiveNavTab('collections');

    const collections = Object.values(store.collections);

    viewport.innerHTML = `
      <section class="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
        <nav class="text-xs text-[#8B6B55] mb-4">
          <a href="#home" class="hover:underline">Home</a> &gt; <span>Collections</span>
        </nav>

        <div class="text-center mb-12">
          <div class="flex items-center justify-center gap-3 mb-1">
            <img src="assets/images/botanical/leafy-sprig-left.png" alt="" class="h-4 sm:h-5 w-auto object-contain watercolor-blend hidden sm:inline-block" />
            <h1 class="font-serif text-3xl sm:text-4xl font-medium text-[#3D5A45]">Collections</h1>
            <img src="assets/images/botanical/leafy-sprig-right.png" alt="" class="h-4 sm:h-5 w-auto object-contain watercolor-blend hidden sm:inline-block" />
          </div>
          <div class="flex justify-center text-[#D9A6A0] text-xs"><span>♥</span></div>
          <p class="text-xs sm:text-sm text-[#8B6B55] mt-1.5 font-serif italic">Nurturing early childhood discovery, family connection, and daily peace</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${collections.map(col => `
            <div class="card-hover-lift bg-[#FFFDF9] border border-[#EEDFCF] rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-subtle group">
              <div>
                <div class="w-20 h-20 bg-[#FFF8EE] border border-[#EEDFCF] rounded-2xl p-3 mb-5 flex items-center justify-center">
                  <img src="${col.iconImage}" alt="${col.title}" class="max-h-full max-w-full object-contain watercolor-blend transition-transform duration-300 group-hover:scale-110" />
                </div>
                <h3 class="font-serif text-xl font-medium text-[#3D5A45] mb-1.5">${col.title}</h3>
                <p class="text-xs text-[#8B6B55] font-serif italic mb-3">${col.subtitle}</p>
                <p class="text-xs text-[#4A573A] leading-relaxed mb-4">${col.description}</p>
              </div>

              <div class="pt-4 border-t border-[#EEDFCF]/60 flex items-center justify-between">
                <span class="text-xs font-semibold text-[#A8B59A]">${col.targetAges}</span>
                <a href="#category?id=${col.id}" class="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#F9ECE9] text-[#D9A6A0] hover:bg-[#D9A6A0] hover:text-white text-xs font-semibold transition-all">
                  <span>Explore</span>
                  <span>→</span>
                </a>
              </div>
            </div>
          `).join('')}
        </div>
      </section>
    `;
  }

  /* --------------------------------------------------------------------------
     5. CATEGORY DETAIL VIEW
     -------------------------------------------------------------------------- */
  function renderCategoryView(categoryId) {
    const col = store.collections[categoryId] || store.collections.learning;
    const products = store.getCollectionProducts(col.id);

    viewport.innerHTML = `
      <section class="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
        <nav class="text-xs text-[#8B6B55] mb-4">
          <a href="#home" class="hover:underline">Home</a> &gt; 
          <a href="#collections" class="hover:underline">Collections</a> &gt; 
          <span class="text-[#3D5A45] font-medium">${col.title}</span>
        </nav>

        <!-- Category Banner -->
        <div class="bg-[#FFFDF9] border border-[#EEDFCF] rounded-3xl p-6 sm:p-10 shadow-card mb-10 flex flex-col md:flex-row items-center gap-6">
          <div class="w-24 h-24 bg-[#FFF8EE] border border-[#EEDFCF] rounded-2xl p-4 flex-shrink-0 flex items-center justify-center">
            <img src="${col.iconImage}" alt="${col.title}" class="max-h-full max-w-full object-contain watercolor-blend" />
          </div>
          <div class="flex-1 text-center md:text-left space-y-2">
            <span class="text-xs font-bold uppercase tracking-wider text-[#A8B59A] font-sans">${col.targetAges}</span>
            <h1 class="font-serif text-3xl sm:text-4xl font-medium text-[#3D5A45]">${col.title}</h1>
            <p class="text-xs sm:text-sm text-[#4A573A] max-w-2xl leading-relaxed">${col.description}</p>
            <div class="flex flex-wrap items-center justify-center md:justify-start gap-1.5 pt-1">
              ${col.focusAreas.map(area => `
                <span class="text-[11px] bg-[#FFF8EE] border border-[#EEDFCF] text-[#586345] px-2.5 py-0.5 rounded-full font-sans">• ${area}</span>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Products in Category -->
        <div class="mb-6 flex items-center justify-between text-xs text-[#8B6B55]">
          <span>Showing ${products.length} printable resources in this collection</span>
          <a href="#shop" class="text-[#D9A6A0] hover:underline">View All Printables →</a>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          ${products.map(product => `
            <div class="card-hover-lift bg-[#FFFDF9] border border-[#EEDFCF] rounded-2xl p-4 flex flex-col justify-between shadow-subtle group">
              <div>
                <div class="relative w-full aspect-[4/3] bg-[#FFF8EE] rounded-xl overflow-hidden mb-3.5 flex items-center justify-center p-2 cursor-pointer" onclick="window.location.hash='#product?id=${product.id}'">
                  <img
                    src="${product.iconImage}"
                    alt="${product.title}"
                    class="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                  ${product.badge ? `<span class="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F9ECE9] text-[#D9A6A0] font-sans">${product.badge}</span>` : ''}
                </div>

                <h3 class="font-serif text-sm font-semibold text-[#3D5A45] leading-snug cursor-pointer hover:text-[#D9A6A0] transition-colors" onclick="window.location.hash='#product?id=${product.id}'">
                  ${product.title}
                </h3>

                <div class="flex items-center gap-1.5 text-xs text-[#8B6B55] mt-1 mb-2">
                  <span class="text-[#D9A6A0]">★★★★★</span>
                  <span class="text-[11px] font-medium">(${product.reviewCount})</span>
                </div>
              </div>

              <div class="pt-3 border-t border-[#EEDFCF]/60 flex items-center justify-between gap-2">
                <span class="font-serif text-base font-semibold text-[#3D5A45]">$${product.price.toFixed(2)}</span>
                <button
                  onclick="window.LittleMomentsStore.cart.addItem('${product.id}', 1); showToast('Added to cart!');"
                  class="px-4 py-1.5 rounded-full bg-[#D9A6A0] hover:bg-[#CF948D] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          `).join('')}
        </div>

      </section>
    `;
  }

  /* --------------------------------------------------------------------------
     6. ABOUT US / OUR STORY VIEW
     -------------------------------------------------------------------------- */
  function renderAboutView() {
    setActiveNavTab('about');

    viewport.innerHTML = `
      <section class="max-w-5xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
        <nav class="text-xs text-[#8B6B55] mb-6">
          <a href="#home" class="hover:underline">Home</a> &gt; <span>About Us</span>
        </nav>

        <!-- Story Hero Banner -->
        <div class="bg-[#FFFDF9] border border-[#EEDFCF] rounded-3xl p-6 sm:p-10 shadow-card mb-12 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div class="md:col-span-5 flex items-center justify-center">
            <img src="assets/images/mascot_reading_bear.png" alt="Bear Reading Book" class="max-h-60 w-auto object-contain watercolor-blend drop-shadow-sm" />
          </div>
          <div class="md:col-span-7 space-y-3">
            <span class="text-xs uppercase tracking-widest font-bold text-[#A8B59A] font-sans">Our Heart & Philosophy</span>
            <h1 class="font-serif text-3xl sm:text-4xl font-medium text-[#3D5A45]">About Little Moments</h1>
            <p class="font-accent text-2xl text-[#D9A6A0]">Making early learning gentle and screen-free.</p>
            <p class="text-xs sm:text-sm text-[#4A573A] leading-relaxed">
              Little Moments Boutique was founded out of a deep love for intentional parenting and the belief that childhood should be filled with wholesome curiosity, tactile discovery, and cozy family connection.
            </p>
            <p class="text-xs sm:text-sm text-[#4A573A] leading-relaxed">
              In a world flooded with digital screens and overwhelming plastic toys, we create timeless watercolor printable resources that you can easily print at home. From soothing morning routine charts to Montessori alphabet cards, each piece is designed to be gentle on little eyes and rich in childhood joy.
            </p>
          </div>
        </div>

        <!-- 3 Core Values Boxes (Matches Wireframe) -->
        <div class="text-center mb-6">
          <h2 class="font-serif text-2xl font-medium text-[#3D5A45]">Our Foundational Pillars</h2>
          <div class="flex justify-center text-[#D9A6A0] text-xs mt-1"><span>♥</span></div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- 1. Purpose -->
          <div class="bg-[#FFFDF9] border border-[#EEDFCF] rounded-2xl p-6 text-center shadow-subtle space-y-2.5">
            <div class="w-12 h-12 mx-auto rounded-full bg-[#F9ECE9] text-[#D9A6A0] flex items-center justify-center text-xl">♥</div>
            <h3 class="font-serif text-lg font-medium text-[#3D5A45]">Our Purpose</h3>
            <p class="text-xs text-[#586345] leading-relaxed">
              Empowering parents and educators with beautiful, affordable, screen-free learning tools that make daily routines peaceful and joyful.
            </p>
          </div>

          <!-- 2. Values -->
          <div class="bg-[#FFFDF9] border border-[#EEDFCF] rounded-2xl p-6 text-center shadow-subtle space-y-2.5">
            <div class="w-12 h-12 mx-auto rounded-full bg-[#EAF2E4] text-[#586345] flex items-center justify-center text-xl">🌱</div>
            <h3 class="font-serif text-lg font-medium text-[#3D5A45]">Our Values</h3>
            <p class="text-xs text-[#586345] leading-relaxed">
              Simplicity, warmth, child-led exploration, and heirloom artistic care in every watercolor illustration we create.
            </p>
          </div>

          <!-- 3. Mission -->
          <div class="bg-[#FFFDF9] border border-[#EEDFCF] rounded-2xl p-6 text-center shadow-subtle space-y-2.5">
            <div class="w-12 h-12 mx-auto rounded-full bg-[#FFF8EE] text-[#D9A6A0] flex items-center justify-center text-xl border border-[#EEDFCF]">★</div>
            <h3 class="font-serif text-lg font-medium text-[#3D5A45]">Our Mission</h3>
            <p class="text-xs text-[#586345] leading-relaxed">
              To turn small everyday moments—from breakfast tracing to bedtime prayers—into lasting childhood memories that nourish the heart.
            </p>
          </div>
        </div>
      </section>
    `;
  }

  /* --------------------------------------------------------------------------
     7. HOW IT WORKS VIEW
     -------------------------------------------------------------------------- */
  function renderHowItWorksView() {
    viewport.innerHTML = `
      <section class="max-w-5xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
        <nav class="text-xs text-[#8B6B55] mb-6">
          <a href="#home" class="hover:underline">Home</a> &gt; <span>How It Works</span>
        </nav>

        <div class="text-center mb-12">
          <h1 class="font-serif text-3xl sm:text-4xl font-medium text-[#3D5A45]">How It Works</h1>
          <p class="text-xs sm:text-sm text-[#8B6B55] mt-1.5 font-serif italic">Instant access to heirloom digital printables in 3 simple steps</p>
          <div class="flex justify-center text-[#D9A6A0] text-xs mt-2"><span>♥</span></div>
        </div>

        <!-- 3 Step Sequence (Matches Wireframe) -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          
          <div class="bg-[#FFFDF9] border border-[#EEDFCF] rounded-3xl p-6 text-center shadow-subtle space-y-3">
            <div class="w-14 h-14 mx-auto rounded-full bg-[#F9ECE9] text-[#D9A6A0] flex items-center justify-center">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
            </div>
            <h3 class="font-serif text-lg font-medium text-[#3D5A45]">1. Choose Your Product</h3>
            <p class="text-xs text-[#586345] leading-relaxed">
              Browse our curated collections of Montessori flashcards, daily routine charts, and activity kits. Add your favorites to cart.
            </p>
          </div>

          <div class="bg-[#FFFDF9] border border-[#EEDFCF] rounded-3xl p-6 text-center shadow-subtle space-y-3">
            <div class="w-14 h-14 mx-auto rounded-full bg-[#EAF2E4] text-[#3D5A45] flex items-center justify-center">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
            </div>
            <h3 class="font-serif text-lg font-medium text-[#3D5A45]">2. Download Instantly</h3>
            <p class="text-xs text-[#586345] leading-relaxed">
              Immediately upon checkout, you receive instant access to download your high-resolution 300 DPI PDF files. Links are also emailed for perpetual access.
            </p>
          </div>

          <div class="bg-[#FFFDF9] border border-[#EEDFCF] rounded-3xl p-6 text-center shadow-subtle space-y-3">
            <div class="w-14 h-14 mx-auto rounded-full bg-[#FFF8EE] text-[#D9A6A0] border border-[#EEDFCF] flex items-center justify-center">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
            </div>
            <h3 class="font-serif text-lg font-medium text-[#3D5A45]">3. Print and Enjoy</h3>
            <p class="text-xs text-[#586345] leading-relaxed">
              Print at home or your favorite local print shop on US Letter or A4 paper. Cut, laminate for reuse, and begin learning right away!
            </p>
          </div>

        </div>

        <!-- Sleeping Bear Illustration & Printing Tips -->
        <div class="bg-[#FFFDF9] border border-[#EEDFCF] rounded-3xl p-6 sm:p-10 shadow-card flex flex-col md:flex-row items-center gap-8">
          <div class="w-48 flex-shrink-0 flex items-center justify-center">
            <img src="assets/images/how_it_works_sleeping_bear.png" alt="Sleeping Bear" class="max-h-36 w-auto object-contain watercolor-blend drop-shadow-xs" />
          </div>
          <div class="space-y-3 text-xs sm:text-sm text-[#4A573A]">
            <h3 class="font-serif text-xl font-medium text-[#3D5A45]">Home Printing Recommendations</h3>
            <p><strong>Paper Choice:</strong> For flashcards, routine charts, and math mats, we recommend heavy white cardstock (80lb to 110lb / 200–300 gsm). For coloring sheets, standard copy paper works wonderfully.</p>
            <p><strong>Lamination Tip:</strong> Laminating your cards with standard 3mil or 5mil laminating pouches gives them waterproof durability and allows children to use dry-erase markers again and again.</p>
            <p><strong>Corner Rounding:</strong> Use a small corner-round punch tool on flashcards for a gentle, child-safe heirloom finish.</p>
          </div>
        </div>
      </section>
    `;
  }

  /* --------------------------------------------------------------------------
     8. FAQ VIEW (ACCORDION)
     -------------------------------------------------------------------------- */
  function renderFAQView() {
    const faqs = [
      { q: "What format do the printable files come in?", a: "All of our printables are delivered as high-resolution (300 DPI), print-ready PDF files formatted for both standard US Letter (8.5 x 11 in) and International A4 paper sizes." },
      { q: "How do I receive my download after purchasing?", a: "Immediately upon completing checkout, an instant download button appears on your confirmation screen. You also receive an automatic email containing your lifetime download links." },
      { q: "What paper do you recommend for printing?", a: "For flashcards, game mats, and daily routine charts, we recommend 80lb to 110lb white cardstock. For coloring books and worksheets, standard 20–24lb copy paper is ideal." },
      { q: "Can I print these at a local print shop?", a: "Yes, absolutely! You can upload your PDF to Staples, Office Depot, Walgreens, or your local print shop for professional printing." },
      { q: "Are these printables for personal or classroom use?", a: "Our standard license covers personal home use for your entire family, or use in a single classroom by one educator. Commercial redistribution or reselling is strictly prohibited." },
      { q: "What if I lose my download files in the future?", a: "No worries at all! You have lifetime access. Simply log into your Little Moments account or email us with your order number, and we will happily refresh your links." }
    ];

    viewport.innerHTML = `
      <section class="max-w-4xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
        <nav class="text-xs text-[#8B6B55] mb-6">
          <a href="#home" class="hover:underline">Home</a> &gt; <span>FAQ</span>
        </nav>

        <div class="text-center mb-10">
          <h1 class="font-serif text-3xl sm:text-4xl font-medium text-[#3D5A45]">Frequently Asked Questions</h1>
          <p class="text-xs sm:text-sm text-[#8B6B55] mt-1.5 font-serif italic">Helpful answers about our digital printables, printing, and accounts</p>
          <div class="flex justify-center text-[#D9A6A0] text-xs mt-2"><span>♥</span></div>
        </div>

        <div class="space-y-3.5">
          ${faqs.map((item, idx) => `
            <div class="bg-[#FFFDF9] border border-[#EEDFCF] rounded-2xl p-5 shadow-subtle">
              <button onclick="toggleFaq(${idx})" class="w-full text-left font-serif text-sm sm:text-base font-semibold text-[#3D5A45] flex items-center justify-between gap-4 cursor-pointer">
                <span>${item.q}</span>
                <span id="faqIcon-${idx}" class="text-[#D9A6A0] font-sans text-xl font-light">+</span>
              </button>
              <div id="faqAns-${idx}" class="hidden pt-3 text-xs sm:text-sm text-[#586345] leading-relaxed border-t border-[#EEDFCF]/60 mt-3">
                ${item.a}
              </div>
            </div>
          `).join('')}
        </div>

        <div class="mt-12 text-center p-6 bg-[#FFFDF9] border border-[#EEDFCF] rounded-2xl">
          <h3 class="font-serif text-lg text-[#3D5A45]">Have a question that isn't answered here?</h3>
          <p class="text-xs text-[#8B6B55] mt-1 mb-4">We are always happy to help you with printing advice or custom inquiries.</p>
          <a href="#contact" class="inline-block px-6 py-2.5 rounded-full bg-[#D9A6A0] text-white text-xs font-semibold hover:bg-[#CF948D] transition-colors">Contact Our Team →</a>
        </div>
      </section>
    `;

    window.toggleFaq = function (idx) {
      const ans = document.getElementById(`faqAns-${idx}`);
      const icon = document.getElementById(`faqIcon-${idx}`);
      if (!ans) return;

      const isHidden = ans.classList.contains('hidden');
      if (isHidden) {
        ans.classList.remove('hidden');
        icon.textContent = '−';
      } else {
        ans.classList.add('hidden');
        icon.textContent = '+';
      }
    };
  }

  /* --------------------------------------------------------------------------
     9. CONTACT US VIEW
     -------------------------------------------------------------------------- */
  function renderContactView() {
    setActiveNavTab('contact');

    viewport.innerHTML = `
      <section class="max-w-5xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
        <nav class="text-xs text-[#8B6B55] mb-6">
          <a href="#home" class="hover:underline">Home</a> &gt; <span>Contact Us</span>
        </nav>

        <div class="text-center mb-10">
          <h1 class="font-serif text-3xl sm:text-4xl font-medium text-[#3D5A45]">Contact Us</h1>
          <p class="text-xs sm:text-sm text-[#8B6B55] mt-1.5 font-serif italic">We'd love to hear from you! Have a question or custom request?</p>
          <div class="flex justify-center text-[#D9A6A0] text-xs mt-2"><span>♥</span></div>
        </div>

        <div class="bg-[#FFFDF9] border border-[#EEDFCF] rounded-3xl p-6 sm:p-10 shadow-card grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          
          <!-- Left: Contact Form -->
          <div class="md:col-span-7 space-y-4">
            <form onsubmit="event.preventDefault(); showToast('Your message has been sent! We will reply within 24 hours ♥'); this.reset();" class="space-y-4">
              <div>
                <label class="block text-xs font-semibold text-[#586345] mb-1">Your Name</label>
                <input type="text" required placeholder="Sarah Jenkins" class="w-full px-4 py-2 text-xs bg-[#FFF8EE] border border-[#EEDFCF] rounded-xl focus:outline-none focus:border-[#D9A6A0]" />
              </div>

              <div>
                <label class="block text-xs font-semibold text-[#586345] mb-1">Your Email</label>
                <input type="email" required placeholder="sarah@example.com" class="w-full px-4 py-2 text-xs bg-[#FFF8EE] border border-[#EEDFCF] rounded-xl focus:outline-none focus:border-[#D9A6A0]" />
              </div>

              <div>
                <label class="block text-xs font-semibold text-[#586345] mb-1">Subject</label>
                <input type="text" required placeholder="Question about routine chart" class="w-full px-4 py-2 text-xs bg-[#FFF8EE] border border-[#EEDFCF] rounded-xl focus:outline-none focus:border-[#D9A6A0]" />
              </div>

              <div>
                <label class="block text-xs font-semibold text-[#586345] mb-1">Your Message</label>
                <textarea rows="4" required placeholder="How can we help your family?" class="w-full px-4 py-2 text-xs bg-[#FFF8EE] border border-[#EEDFCF] rounded-xl focus:outline-none focus:border-[#D9A6A0]"></textarea>
              </div>

              <button type="submit" class="w-full py-3 rounded-full bg-[#D9A6A0] hover:bg-[#CF948D] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer">
                Send Message →
              </button>
            </form>
          </div>

          <!-- Right: Daisy Rabbit popping out of envelope -->
          <div class="md:col-span-5 text-center space-y-4 p-4 border-t md:border-t-0 md:border-l border-[#EEDFCF]/60">
            <div class="w-32 h-32 mx-auto flex items-center justify-center">
              <img src="assets/images/contact_bunny_envelope.png" alt="Daisy Bunny in Envelope" class="max-h-full max-w-full object-contain drop-shadow-xs" />
            </div>

            <div class="text-xs text-[#586345] space-y-1">
              <h4 class="font-serif text-base font-semibold text-[#3D5A45]">Customer Support</h4>
              <p>Email: <a href="mailto:hello@littlemomentskids.com" class="text-[#D9A6A0] font-semibold hover:underline">hello@littlemomentskids.com</a></p>
              <p>Response time: Monday–Friday within 24 hours</p>
            </div>

            <p class="text-[11px] text-[#8B6B55] italic">"We treat every family with kindness, prompt attention, and care."</p>
          </div>

        </div>
      </section>
    `;
  }

  /* --------------------------------------------------------------------------
     10. CART VIEW
     -------------------------------------------------------------------------- */
  function renderCartView() {
    const items = store.cart.getItems();
    const totals = store.cart.getTotals();

    if (items.length === 0) {
      viewport.innerHTML = `
        <section class="max-w-4xl mx-auto px-4 sm:px-8 py-16 text-center">
          <div class="text-5xl mb-4">🧺</div>
          <h1 class="font-serif text-3xl font-medium text-[#3D5A45] mb-2">Your Cart is Empty</h1>
          <p class="text-xs sm:text-sm text-[#8B6B55] max-w-sm mx-auto mb-6">
            You haven’t added any educational printables or routine charts yet.
          </p>
          <a href="#shop" class="inline-block px-8 py-3 rounded-full bg-[#D9A6A0] text-white text-xs font-semibold hover:bg-[#CF948D] transition-all">
            Explore All Printables →
          </a>
        </section>
      `;
      return;
    }

    viewport.innerHTML = `
      <section class="max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
        <nav class="text-xs text-[#8B6B55] mb-6">
          <a href="#home" class="hover:underline">Home</a> &gt; <span>Your Cart</span>
        </nav>

        <h1 class="font-serif text-3xl font-medium text-[#3D5A45] mb-8">Your Cart (${totals.totalCount} items)</h1>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <!-- Left: Items Table -->
          <div class="lg:col-span-8 bg-[#FFFDF9] border border-[#EEDFCF] rounded-3xl p-6 sm:p-8 shadow-card space-y-4">
            <div class="divide-y divide-[#EEDFCF]/60">
              ${items.map(({ product, quantity }) => `
                <div class="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div class="flex items-center gap-4">
                    <div class="w-16 h-16 bg-[#FFF8EE] border border-[#EEDFCF] rounded-2xl p-1.5 flex-shrink-0 flex items-center justify-center">
                      <img src="${product.iconImage}" alt="${product.title}" class="max-h-full max-w-full object-contain watercolor-blend" />
                    </div>
                    <div>
                      <h4 class="font-serif text-sm font-semibold text-[#3D5A45]">${product.title}</h4>
                      <p class="text-xs text-[#8B6B55]">$${product.price.toFixed(2)} each · Instant PDF</p>
                    </div>
                  </div>

                  <div class="flex items-center gap-4 self-end sm:self-auto">
                    <div class="inline-flex items-center border border-[#EEDFCF] rounded-full bg-[#FFF8EE] text-xs">
                      <button onclick="window.LittleMomentsStore.cart.updateQuantity('${product.id}', ${quantity - 1}); window.location.hash='#cart';" class="px-2.5 py-1 text-[#586345] hover:text-[#D9A6A0] cursor-pointer">−</button>
                      <span class="px-2 font-semibold text-[#3D5A45]">${quantity}</span>
                      <button onclick="window.LittleMomentsStore.cart.updateQuantity('${product.id}', ${quantity + 1}); window.location.hash='#cart';" class="px-2.5 py-1 text-[#586345] hover:text-[#D9A6A0] cursor-pointer">+</button>
                    </div>
                    <span class="font-serif text-sm font-semibold text-[#3D5A45] w-16 text-right">$${(product.price * quantity).toFixed(2)}</span>
                    <button onclick="window.LittleMomentsStore.cart.removeItem('${product.id}'); window.location.hash='#cart';" class="text-[#A09587] hover:text-[#D9A6A0] cursor-pointer p-1" title="Remove">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>

            <div class="pt-6 border-t border-[#EEDFCF] flex items-center justify-between">
              <a href="#shop" class="text-xs font-semibold text-[#586345] hover:text-[#D9A6A0]">← Continue Shopping</a>
              <button onclick="window.LittleMomentsStore.cart.clearCart(); window.location.hash='#cart';" class="text-xs text-[#8B6B55] hover:underline cursor-pointer">Clear Cart</button>
            </div>
          </div>

          <!-- Right: Order Summary Card -->
          <div class="lg:col-span-4 bg-[#FFFDF9] border border-[#EEDFCF] rounded-3xl p-6 sm:p-8 shadow-card space-y-4">
            <h3 class="font-serif text-xl font-medium text-[#3D5A45] pb-3 border-b border-[#EEDFCF]">Order Summary</h3>

            <div class="space-y-2 text-xs text-[#586345]">
              <div class="flex justify-between">
                <span>Subtotal</span>
                <span class="font-semibold text-[#3D5A45]">$${totals.subtotal.toFixed(2)}</span>
              </div>
              ${totals.discountAmount > 0 ? `
                <div class="flex justify-between text-[#D9A6A0] font-semibold">
                  <span>Discount (${totals.discountLabel})</span>
                  <span>−$${totals.discountAmount.toFixed(2)}</span>
                </div>
              ` : ''}
              <div class="flex justify-between text-[#8B6B55]">
                <span>Instant Digital Delivery</span>
                <span class="text-[#3D5A45] font-medium">FREE</span>
              </div>
            </div>

            <!-- Coupon Input -->
            <div class="pt-2">
              <form onsubmit="event.preventDefault(); const c=document.getElementById('cartCouponCode').value; const res=window.LittleMomentsStore.cart.applyDiscount(c); showToast(res.message); window.location.hash='#cart';" class="flex gap-2">
                <input id="cartCouponCode" type="text" placeholder="Coupon (e.g. MOMENTS10)" class="flex-1 px-3 py-1.5 text-xs bg-[#FFF8EE] border border-[#EEDFCF] rounded-full focus:outline-none focus:border-[#D9A6A0]" />
                <button type="submit" class="px-4 py-1.5 rounded-full border border-[#A8B59A] text-xs font-semibold text-[#3D5A45] hover:bg-[#E2E9DC] cursor-pointer">Apply</button>
              </form>
            </div>

            <!-- Total -->
            <div class="pt-4 border-t border-[#EEDFCF] flex justify-between items-baseline">
              <span class="font-serif text-lg font-bold text-[#3D5A45]">Total</span>
              <span class="font-serif text-2xl font-bold text-[#3D5A45]">$${totals.total.toFixed(2)}</span>
            </div>

            <!-- Checkout Button Simulator -->
            <button
              onclick="simulateCheckout()"
              class="w-full py-3.5 rounded-full bg-[#D9A6A0] hover:bg-[#CF948D] text-white text-xs font-bold shadow-xs hover:shadow transition-all cursor-pointer text-center"
            >
              Proceed to Checkout 🔒
            </button>

            <p class="text-[11px] text-center text-[#8B6B55]">100% Kid-Safe & Instant Secure PDF Delivery</p>
          </div>

        </div>
      </section>
    `;

    window.simulateCheckout = function () {
      const snap = store.cart.getSnapshot();
      if (snap.items.length === 0) return;

      const order = store.account.addOrderFromCart(snap);
      store.cart.clearCart();

      // Show fulfillment screen
      viewport.innerHTML = `
        <section class="max-w-3xl mx-auto px-4 sm:px-8 py-16 text-center">
          <div class="w-20 h-20 mx-auto rounded-full bg-[#EAF2E4] text-[#3D5A45] flex items-center justify-center text-3xl mb-4">
            ✔
          </div>
          <span class="text-xs uppercase tracking-widest font-bold text-[#A8B59A] font-sans">Order Confirmed!</span>
          <h1 class="font-serif text-3xl sm:text-4xl font-medium text-[#3D5A45] mt-1 mb-2">Thank you, Sarah!</h1>
          <p class="text-xs sm:text-sm text-[#586345] mb-6">Order Reference: <strong>${order.orderId}</strong> · Instant PDF Delivery</p>

          <div class="bg-[#FFFDF9] border border-[#EEDFCF] rounded-3xl p-6 sm:p-8 shadow-card text-left mb-8 space-y-4">
            <h3 class="font-serif text-lg font-semibold text-[#3D5A45] pb-2 border-b border-[#EEDFCF]">Your Download Files Are Ready:</h3>
            <div class="space-y-3">
              ${order.items.map(item => `
                <div class="flex items-center justify-between p-3 bg-[#FFF8EE] border border-[#EEDFCF] rounded-xl text-xs">
                  <div>
                    <strong class="font-serif text-sm text-[#3D5A45] block">${item.title}</strong>
                    <span class="text-[#8B6B55]">Instant 300 DPI Vector PDF</span>
                  </div>
                  <a href="${item.file.includes('.pdf') ? item.file : 'little_moments_kids_prayer_journal.pdf'}" download class="px-4 py-2 rounded-full bg-[#D9A6A0] hover:bg-[#CF948D] text-white font-semibold transition-colors">
                    Download PDF ⬇
                  </a>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="flex justify-center gap-4">
            <a href="#account" class="px-6 py-2.5 rounded-full border border-[#A8B59A] text-xs font-semibold text-[#3D5A45] hover:bg-[#E2E9DC]">View Account Library</a>
            <a href="#shop" class="px-6 py-2.5 rounded-full bg-[#3D5A45] text-white text-xs font-semibold hover:bg-[#586345]">Continue Shopping</a>
          </div>
        </section>
      `;
    };
  }

  /* --------------------------------------------------------------------------
     11. WISHLIST VIEW
     -------------------------------------------------------------------------- */
  function renderWishlistView() {
    const products = store.wishlist.getProducts();

    if (products.length === 0) {
      viewport.innerHTML = `
        <section class="max-w-4xl mx-auto px-4 sm:px-8 py-16 text-center">
          <div class="text-5xl mb-4">♡</div>
          <h1 class="font-serif text-3xl font-medium text-[#3D5A45] mb-2">Your Wishlist is Empty</h1>
          <p class="text-xs sm:text-sm text-[#8B6B55] max-w-sm mx-auto mb-6">
            Save your favorite printables and routine charts for future learning moments.
          </p>
          <a href="#shop" class="inline-block px-8 py-3 rounded-full bg-[#D9A6A0] text-white text-xs font-semibold hover:bg-[#CF948D] transition-all">
            Browse All Printables →
          </a>
        </section>
      `;
      return;
    }

    viewport.innerHTML = `
      <section class="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
        <nav class="text-xs text-[#8B6B55] mb-6">
          <a href="#home" class="hover:underline">Home</a> &gt; <span>My Wishlist</span>
        </nav>

        <div class="flex items-center justify-between mb-8">
          <div>
            <h1 class="font-serif text-3xl font-medium text-[#3D5A45]">My Wishlist (${products.length})</h1>
            <p class="text-xs text-[#8B6B55] mt-1">Saved items for future creative and learning projects</p>
          </div>
          <button onclick="const m=window.LittleMomentsStore.wishlist.moveAllToCart(); if(m){ showToast('Moved all items to cart!'); window.location.hash='#cart'; }" class="px-5 py-2 rounded-full bg-[#D9A6A0] hover:bg-[#CF948D] text-white text-xs font-semibold transition-all cursor-pointer">
            Move All to Cart →
          </button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          ${products.map(product => `
            <div class="card-hover-lift bg-[#FFFDF9] border border-[#EEDFCF] rounded-2xl p-4 flex flex-col justify-between shadow-subtle group">
              <div>
                <div class="relative w-full aspect-[4/3] bg-[#FFF8EE] rounded-xl overflow-hidden mb-3.5 flex items-center justify-center p-2 cursor-pointer" onclick="window.location.hash='#product?id=${product.id}'">
                  <img
                    src="${product.iconImage}"
                    alt="${product.title}"
                    class="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                  <button
                    onclick="event.stopPropagation(); window.LittleMomentsStore.wishlist.remove('${product.id}'); renderWishlistView();"
                    class="absolute top-2 right-2 p-1.5 rounded-full bg-white text-[#D9A6A0] hover:text-[#C95D53] shadow-xs cursor-pointer"
                    title="Remove from wishlist"
                  >
                    <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                  </button>
                </div>

                <h3 class="font-serif text-sm font-semibold text-[#3D5A45] leading-snug cursor-pointer hover:text-[#D9A6A0]" onclick="window.location.hash='#product?id=${product.id}'">
                  ${product.title}
                </h3>
                <p class="text-xs text-[#8B6B55] mt-1">$${product.price.toFixed(2)}</p>
              </div>

              <div class="pt-3 border-t border-[#EEDFCF]/60 flex items-center justify-between gap-2">
                <button
                  onclick="window.LittleMomentsStore.wishlist.moveToCart('${product.id}'); showToast('Moved to cart!'); renderWishlistView();"
                  class="w-full py-1.5 rounded-full bg-[#D9A6A0] hover:bg-[#CF948D] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                >
                  Move to Cart
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </section>
    `;
  }

  /* --------------------------------------------------------------------------
     12. ACCOUNT VIEW (MY ACCOUNT / ORDERS & PERPETUAL DOWNLOADS)
     -------------------------------------------------------------------------- */
  function renderAccountView() {
    const profile = store.account.getProfile();
    const orders = store.account.getOrders();
    const downloads = store.account.getDownloads();

    viewport.innerHTML = `
      <section class="max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
        <nav class="text-xs text-[#8B6B55] mb-6">
          <a href="#home" class="hover:underline">Home</a> &gt; <span>My Account</span>
        </nav>

        <h1 class="font-serif text-3xl font-medium text-[#3D5A45] mb-8">My Account</h1>

        <div class="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          <!-- Left Nav Sidebar -->
          <div class="md:col-span-4 bg-[#FFFDF9] border border-[#EEDFCF] rounded-3xl p-6 shadow-subtle space-y-4">
            <div class="flex items-center gap-3 pb-4 border-b border-[#EEDFCF]">
              <div class="w-12 h-12 rounded-full bg-[#F9ECE9] text-[#D9A6A0] font-serif font-bold text-lg flex items-center justify-center">
                SJ
              </div>
              <div>
                <h3 class="font-serif text-base font-medium text-[#3D5A45]">${profile.name}</h3>
                <p class="text-xs text-[#8B6B55]">${profile.email}</p>
              </div>
            </div>

            <nav class="space-y-1 text-xs font-semibold text-[#586345]">
              <button onclick="switchAccountTab('dashboard')" id="accTabDash" class="w-full text-left px-3.5 py-2 rounded-xl bg-[#F9ECE9] text-[#D9A6A0]">Dashboard</button>
              <button onclick="switchAccountTab('orders')" id="accTabOrders" class="w-full text-left px-3.5 py-2 rounded-xl hover:bg-[#F9ECE9]/60">My Orders & Receipts</button>
              <button onclick="switchAccountTab('downloads')" id="accTabDownloads" class="w-full text-left px-3.5 py-2 rounded-xl hover:bg-[#F9ECE9]/60">Permanent Download Library</button>
              <button onclick="switchAccountTab('profile')" id="accTabProfile" class="w-full text-left px-3.5 py-2 rounded-xl hover:bg-[#F9ECE9]/60">Account Details</button>
            </nav>

            <div class="pt-4 border-t border-[#EEDFCF] flex items-center justify-center">
              <img src="assets/images/account_reading_bear.png" alt="Bear Reading" class="h-20 w-auto watercolor-blend" />
            </div>
          </div>

          <!-- Right Content Area -->
          <div class="md:col-span-8 bg-[#FFFDF9] border border-[#EEDFCF] rounded-3xl p-6 sm:p-8 shadow-card">
            
            <!-- Tab 1: Dashboard -->
            <div id="accPaneDash" class="space-y-6">
              <div>
                <h2 class="font-serif text-2xl font-medium text-[#3D5A45]">Welcome back, ${profile.name.split(' ')[0]}!</h2>
                <p class="text-xs text-[#8B6B55] mt-1">Manage your digital purchases, download printables, and update your account details.</p>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div class="bg-[#FFF8EE] border border-[#EEDFCF] rounded-2xl p-4 text-center">
                  <span class="block text-2xl font-serif font-bold text-[#3D5A45]">${orders.length}</span>
                  <span class="text-xs text-[#8B6B55]">Total Orders</span>
                </div>
                <div class="bg-[#FFF8EE] border border-[#EEDFCF] rounded-2xl p-4 text-center">
                  <span class="block text-2xl font-serif font-bold text-[#3D5A45]">${downloads.length}</span>
                  <span class="text-xs text-[#8B6B55]">Ready Downloads</span>
                </div>
                <div class="bg-[#FFF8EE] border border-[#EEDFCF] rounded-2xl p-4 text-center">
                  <span class="block text-2xl font-serif font-bold text-[#3D5A45]">${store.wishlist.getIds().length}</span>
                  <span class="text-xs text-[#8B6B55]">Wishlist Items</span>
                </div>
              </div>

              <div>
                <h3 class="font-serif text-lg font-medium text-[#3D5A45] mb-3">Recent Downloads</h3>
                <div class="space-y-2.5">
                  ${downloads.slice(0, 3).map(dl => `
                    <div class="flex items-center justify-between p-3 bg-[#FFF8EE] border border-[#EEDFCF] rounded-xl text-xs">
                      <div>
                        <strong class="font-serif text-[#3D5A45] block">${dl.title}</strong>
                        <span class="text-[#8B6B55]">${dl.size}</span>
                      </div>
                      <a href="${dl.url}" download class="px-3.5 py-1.5 rounded-full bg-[#D9A6A0] hover:bg-[#CF948D] text-white text-xs font-semibold transition-colors">
                        Download PDF
                      </a>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>

            <!-- Tab 2: Orders -->
            <div id="accPaneOrders" class="hidden space-y-4">
              <h2 class="font-serif text-2xl font-medium text-[#3D5A45]">Order History</h2>
              <div class="space-y-4">
                ${orders.map(o => `
                  <div class="border border-[#EEDFCF] rounded-2xl p-4 bg-[#FFF8EE] space-y-2 text-xs">
                    <div class="flex items-center justify-between border-b border-[#EEDFCF]/60 pb-2">
                      <span class="font-serif font-semibold text-[#3D5A45]">Order #${o.orderId}</span>
                      <span class="text-[#8B6B55]">${o.date} · $${o.total.toFixed(2)}</span>
                    </div>
                    <ul class="space-y-1 text-[#4A573A]">
                      ${o.items.map(it => `<li>• ${it.title} ($${it.price.toFixed(2)})</li>`).join('')}
                    </ul>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Tab 3: Downloads -->
            <div id="accPaneDownloads" class="hidden space-y-4">
              <h2 class="font-serif text-2xl font-medium text-[#3D5A45]">Permanent Download Library</h2>
              <p class="text-xs text-[#8B6B55]">You have lifetime unlimited download access to all purchased digital products.</p>
              <div class="space-y-3">
                ${downloads.map(dl => `
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-[#FFF8EE] border border-[#EEDFCF] rounded-2xl text-xs">
                    <div>
                      <h4 class="font-serif font-semibold text-sm text-[#3D5A45]">${dl.title}</h4>
                      <p class="text-[#8B6B55]">Order: ${dl.orderId} · ${dl.size}</p>
                    </div>
                    <div class="flex items-center gap-2">
                      ${dl.flipbookUrl ? `
                        <a href="${dl.flipbookUrl}" target="_blank" class="px-3.5 py-1.5 rounded-full border border-[#A8B59A] text-[#3D5A45] hover:bg-[#E2E9DC] text-xs font-semibold">
                          Open Flipbook ↗
                        </a>
                      ` : ''}
                      <a href="${dl.url}" download class="px-4 py-1.5 rounded-full bg-[#D9A6A0] hover:bg-[#CF948D] text-white text-xs font-semibold">
                        Download PDF ⬇
                      </a>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Tab 4: Profile Details Form -->
            <div id="accPaneProfile" class="hidden space-y-4">
              <h2 class="font-serif text-2xl font-medium text-[#3D5A45]">Account Details</h2>
              <form onsubmit="event.preventDefault(); showToast('Account details updated successfully!');" class="space-y-4 text-xs">
                <div>
                  <label class="block font-semibold text-[#586345] mb-1">Full Name</label>
                  <input type="text" value="${profile.name}" class="w-full px-4 py-2 bg-[#FFF8EE] border border-[#EEDFCF] rounded-xl focus:outline-none focus:border-[#D9A6A0]" />
                </div>
                <div>
                  <label class="block font-semibold text-[#586345] mb-1">Email Address</label>
                  <input type="email" value="${profile.email}" class="w-full px-4 py-2 bg-[#FFF8EE] border border-[#EEDFCF] rounded-xl focus:outline-none focus:border-[#D9A6A0]" />
                </div>
                <button type="submit" class="px-6 py-2.5 rounded-full bg-[#D9A6A0] text-white font-semibold hover:bg-[#CF948D]">
                  Save Changes
                </button>
              </form>
            </div>

          </div>

        </div>
      </section>
    `;

    window.switchAccountTab = function (tab) {
      const pDash = document.getElementById('accPaneDash');
      const pOrders = document.getElementById('accPaneOrders');
      const pDownloads = document.getElementById('accPaneDownloads');
      const pProfile = document.getElementById('accPaneProfile');

      const tDash = document.getElementById('accTabDash');
      const tOrders = document.getElementById('accTabOrders');
      const tDownloads = document.getElementById('accTabDownloads');
      const tProfile = document.getElementById('accTabProfile');

      [pDash, pOrders, pDownloads, pProfile].forEach(p => p.classList.add('hidden'));
      [tDash, tOrders, tDownloads, tProfile].forEach(t => t.className = 'w-full text-left px-3.5 py-2 rounded-xl hover:bg-[#F9ECE9]/60');

      if (tab === 'dashboard') {
        pDash.classList.remove('hidden');
        tDash.className = 'w-full text-left px-3.5 py-2 rounded-xl bg-[#F9ECE9] text-[#D9A6A0] font-semibold';
      } else if (tab === 'orders') {
        pOrders.classList.remove('hidden');
        tOrders.className = 'w-full text-left px-3.5 py-2 rounded-xl bg-[#F9ECE9] text-[#D9A6A0] font-semibold';
      } else if (tab === 'downloads') {
        pDownloads.classList.remove('hidden');
        tDownloads.className = 'w-full text-left px-3.5 py-2 rounded-xl bg-[#F9ECE9] text-[#D9A6A0] font-semibold';
      } else if (tab === 'profile') {
        pProfile.classList.remove('hidden');
        tProfile.className = 'w-full text-left px-3.5 py-2 rounded-xl bg-[#F9ECE9] text-[#D9A6A0] font-semibold';
      }
    };
  }

  /* --------------------------------------------------------------------------
     13, 14, 15. LEGAL PAGES (TERMS, PRIVACY, REFUND)
     -------------------------------------------------------------------------- */
  function renderTermsView() {
    viewport.innerHTML = `
      <section class="max-w-4xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
        <nav class="text-xs text-[#8B6B55] mb-6">
          <a href="#home" class="hover:underline">Home</a> &gt; <span>Terms & Conditions</span>
        </nav>
        <div class="bg-[#FFFDF9] border border-[#EEDFCF] rounded-3xl p-6 sm:p-10 shadow-card space-y-5 text-xs sm:text-sm text-[#4A573A] leading-relaxed">
          <span class="text-xs uppercase tracking-widest font-bold text-[#A8B59A] font-sans">Legal Agreement</span>
          <h1 class="font-serif text-3xl font-medium text-[#3D5A45]">Terms & Conditions</h1>
          <p>Welcome to Little Moments Kids Boutique. By purchasing and downloading our digital products, you agree to these Terms and Conditions.</p>
          <h4 class="font-serif text-base font-semibold text-[#3D5A45]">1. Personal & Classroom License</h4>
          <p>All printables are intended solely for personal family use or single classroom use by an individual teacher. You may print as many copies as needed for your household or students.</p>
          <h4 class="font-serif text-base font-semibold text-[#3D5A45]">2. Copyright & Intellectual Property</h4>
          <p>All original watercolor illustrations, layouts, characters (Barnaby Bear & Daisy Rabbit), and copy are the copyrighted property of Little Moments Kids Boutique. Reselling, sublicensing, or distributing the digital files is strictly prohibited.</p>
        </div>
      </section>
    `;
  }

  function renderPrivacyView() {
    viewport.innerHTML = `
      <section class="max-w-4xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
        <nav class="text-xs text-[#8B6B55] mb-6">
          <a href="#home" class="hover:underline">Home</a> &gt; <span>Privacy Policy</span>
        </nav>
        <div class="bg-[#FFFDF9] border border-[#EEDFCF] rounded-3xl p-6 sm:p-10 shadow-card space-y-5 text-xs sm:text-sm text-[#4A573A] leading-relaxed">
          <span class="text-xs uppercase tracking-widest font-bold text-[#A8B59A] font-sans">Privacy Protection</span>
          <h1 class="font-serif text-3xl font-medium text-[#3D5A45]">Privacy Policy</h1>
          <p>At Little Moments Kids Boutique, we hold your family's privacy sacred. We never sell, rent, or share personal information with third parties.</p>
          <h4 class="font-serif text-base font-semibold text-[#3D5A45]">1. Information We Collect</h4>
          <p>We collect only the essential information needed to fulfill your digital orders: your name, email address, and order history.</p>
          <h4 class="font-serif text-base font-semibold text-[#3D5A45]">2. Payment Security</h4>
          <p>All payments are processed through encrypted 256-bit SSL gateways. We do not store or process raw credit card numbers on our servers.</p>
        </div>
      </section>
    `;
  }

  function renderRefundView() {
    viewport.innerHTML = `
      <section class="max-w-4xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
        <nav class="text-xs text-[#8B6B55] mb-6">
          <a href="#home" class="hover:underline">Home</a> &gt; <span>Refund & Happiness Policy</span>
        </nav>
        <div class="bg-[#FFFDF9] border border-[#EEDFCF] rounded-3xl p-6 sm:p-10 shadow-card space-y-5 text-xs sm:text-sm text-[#4A573A] leading-relaxed">
          <span class="text-xs uppercase tracking-widest font-bold text-[#A8B59A] font-sans">Our Guarantee</span>
          <h1 class="font-serif text-3xl font-medium text-[#3D5A45]">Refund & Happiness Guarantee</h1>
          <p>Because digital printables are delivered instantly, traditional physical product returns cannot be accepted. However, we stand behind our work with our <strong>100% Happiness Guarantee</strong>.</p>
          <h4 class="font-serif text-base font-semibold text-[#3D5A45]">File Assistance & Exchanges</h4>
          <p>If you experience any issues opening, printing, or sizing your files, our friendly support team will personally assist you within 24 hours. If an accidental duplicate purchase occurs, we will immediately issue a prompt refund.</p>
        </div>
      </section>
    `;
  }

  /* ==========================================================================
     MAIN CLIENT-SIDE ROUTER DISPATCHER
     ========================================================================== */
  function route() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const hash = window.location.hash || '#home';
    const [path, queryString] = hash.split('?');
    const params = new URLSearchParams(queryString || '');

    switch (path) {
      case '#home':
      case '#':
      case '':
        renderHomeView();
        break;
      case '#shop':
        renderShopView({
          q: params.get('q') || '',
          sort: params.get('sort') || 'featured',
          badge: params.get('badge') || 'all'
        });
        break;
      case '#product':
        renderProductDetailView(params.get('id') || 'prod-daily-routine');
        break;
      case '#collections':
        renderCollectionsView();
        break;
      case '#category':
        renderCategoryView(params.get('id') || 'learning');
        break;
      case '#about':
        renderAboutView();
        break;
      case '#how-it-works':
        renderHowItWorksView();
        break;
      case '#faq':
        renderFAQView();
        break;
      case '#contact':
        renderContactView();
        break;
      case '#cart':
        renderCartView();
        break;
      case '#wishlist':
        renderWishlistView();
        break;
      case '#account':
        renderAccountView();
        break;
      case '#terms':
        renderTermsView();
        break;
      case '#privacy':
        renderPrivacyView();
        break;
      case '#refund':
        renderRefundView();
        break;
      default:
        renderHomeView();
    }

    updateBadges();
  }

  // Bind popstate / hashchange
  window.addEventListener('hashchange', route);
  window.addEventListener('DOMContentLoaded', () => {
    updateBadges();
    route();
  });

})();
