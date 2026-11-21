/**
 * LITTLE MOMENTS KIDS BOUTIQUE — E-COMMERCE CORE DATA & STATE STORE (V2)
 * Pure JavaScript, zero external dependencies.
 * Reactive state management, persistent LocalStorage sync, product catalog,
 * collections metadata, cart manager, wishlist manager, customer account,
 * search & filter reactive query engine.
 * 
 * Exposed globally as window.LittleMomentsStore.
 */

(function (global) {
  'use strict';

  // Safe localStorage helper with in-memory fallback
  const MemoryStorage = {
    _data: {},
    getItem(k) { return Object.prototype.hasOwnProperty.call(this._data, k) ? this._data[k] : null; },
    setItem(k, v) { this._data[k] = String(v); },
    removeItem(k) { delete this._data[k]; },
    clear() { this._data = {}; }
  };

  const storage = (() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const testKey = '__lm_storage_test__';
        window.localStorage.setItem(testKey, '1');
        window.localStorage.removeItem(testKey);
        return window.localStorage;
      }
    } catch (e) {
      // Storage restricted
    }
    return MemoryStorage;
  })();

  function safeStorageGet(key, fallback) {
    try {
      const item = storage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function safeStorageSet(key, value) {
    try {
      storage.setItem(key, JSON.stringify(value));
    } catch (e) {
      // Quota exceeded
    }
  }

  // PubSub Event Bus
  const eventBus = {
    _listeners: {},
    on(event, callback) {
      if (!this._listeners[event]) this._listeners[event] = [];
      this._listeners[event].push(callback);
      return () => this.off(event, callback);
    },
    off(event, callback) {
      if (!this._listeners[event]) return;
      this._listeners[event] = this._listeners[event].filter(cb => cb !== callback);
    },
    emit(event, data) {
      if (!this._listeners[event]) return;
      this._listeners[event].forEach(cb => {
        try { cb(data); } catch (err) { console.error(`[LittleMomentsStore] Listener error on "${event}":`, err); }
      });
    }
  };

  /* ==========================================================================
     1. COLLECTIONS METADATA
     ========================================================================== */

  const COLLECTIONS_META = {
    learning: {
      id: 'learning',
      slug: 'learning-education',
      title: 'Learning & Education',
      label: 'Learning & Education',
      subtitle: 'Montessori-Aligned Early Literacy, Math & Sensory Tracing',
      description: 'Nurture curious young minds with gentle, vintage-inspired early learning printables. Designed to respect natural child development with soothing watercolor visuals, self-correcting activities, and tactile tracing that makes learning feel like storybook play.',
      icon: '🌈',
      iconImage: 'assets/images/learning_rainbow.png',
      targetAges: 'Ages 2–7',
      focusAreas: ['Alphabet Recognition', 'Phonics & CVC Words', 'Ten-Frame Math', 'Fine Motor Tracing', 'Montessori Shelf Work'],
      printingTip: 'We recommend printing flashcards and math mats on 80–110lb white cardstock. Round the corners with a small corner-punch for a smooth, child-safe boutique feel.',
      featuredProductId: 'prod-alphabet-flashcards'
    },
    activities: {
      id: 'activities',
      slug: 'kids-activities',
      title: 'Kids Activities',
      label: 'Kids Activities',
      subtitle: 'Cozy Offline Play, Scissor Crafts & Storybook Coloring',
      description: 'Delightful offline activities designed for quiet afternoons, kitchen table bonding, and gentle independent play. Hand-painted woodland characters bring wonder to paper crafts, seasonal nature scavenger walks, and storybook coloring books.',
      icon: '📚',
      iconImage: 'assets/images/kids_activities.png',
      targetAges: 'Ages 3–8',
      focusAreas: ['Scissor Cutting Skills', 'Screen-Free Creativity', 'Nature Observation', 'Fine Motor Dexterity', 'Family Game Nights'],
      printingTip: 'Standard 20–24lb copy paper is ideal for coloring and paper crafts. For matching games and scavenger checklists, laminate with 3mil sheets for wipe-clean dry-erase use!',
      featuredProductId: 'prod-woodland-coloring'
    },
    routines: {
      id: 'routines',
      slug: 'routines-planners',
      title: 'Routines & Planners',
      label: 'Routines & Planners',
      subtitle: 'Visual Rhythms, Gentle Habit Trackers & Calming Corner Tools',
      description: 'Replace daily power struggles with peaceful, predictable rhythms. Our visual routine charts and emotion regulation tools give young children autonomy, emotional security, and confidence in their daily self-care transitions.',
      icon: '📅',
      iconImage: 'assets/images/routines_planners.png',
      targetAges: 'Ages 2–9',
      focusAreas: ['Visual Independence', 'Smooth Bedtime Transitions', 'Morning Calm', 'Emotional Regulation', 'Helpful Contribution'],
      printingTip: 'Print routine charts on heavy cardstock and attach adhesive velcro dots to the cards. Children love the tactile satisfaction of sticking completed routine cards onto their board!',
      featuredProductId: 'prod-visual-routine'
    },
    family: {
      id: 'family',
      slug: 'family-memories',
      title: 'Family & Memories',
      label: 'Family & Memories',
      subtitle: 'Childhood Keepsakes, Dinner Conversation Starters & Memory Books',
      description: 'Childhood moves fast. Our nostalgic milestone pages, annual birthday interviews, and dinner table question cards are designed to spark heartfelt laughter, preserve sweet memories, and strengthen family bonds.',
      icon: '💖',
      iconImage: 'assets/images/family_memories.png',
      targetAges: 'All Ages / Whole Family',
      focusAreas: ['Family Storytelling', 'Annual Birthday Keepsakes', 'Milestone Memory Books', 'Dinner Connection', 'Gratitude Rituals'],
      printingTip: 'Keep your completed milestone pages and annual birthday questionnaires inside a dedicated linen three-ring binder. It becomes a priceless heirloom gift for their 18th birthday.',
      featuredProductId: 'prod-keepsake-journal'
    },
    celebrations: {
      id: 'celebrations',
      slug: 'celebrations-holidays',
      title: 'Celebrations & Holidays',
      label: 'Celebrations & Holidays',
      subtitle: 'Vintage-Inspired Party Bunting, Seasonal Countdowns & Holiday Kits',
      description: 'Make every celebration magical and timeless. Coordinated watercolor printable banners, gift basket tags, countdown advent cards, and festive table runners that bring vintage storybook charm to Easter, birthdays, Thanksgiving, and Christmas.',
      icon: '🎉',
      iconImage: 'assets/images/celebrations_holidays.png',
      targetAges: 'All Ages / Whole Family',
      focusAreas: ['Easter Morning Traditions', 'Christmas Advent Garland', 'Birthday Party Decor', 'Holiday Scavenger Hunts', 'Gratitude Activities'],
      printingTip: 'Punch two small holes in the top corners of banner pennants and string with natural jute twine or soft velvet ribbon for an authentic heirloom boutique look.',
      featuredProductId: 'prod-birthday-decor'
    },
    christian: {
      id: 'christian',
      slug: 'christian-kids',
      title: 'Christian Kids',
      label: 'Christian Kids',
      subtitle: 'Botanical Scripture Memory Verses, Bedtime Prayers & Bible Lessons',
      description: 'Surround your home with God’s comforting word. Tender watercolor Bible verse cards, bedtime prayers, and hands-on Scripture activity sheets designed to help children feel secure, loved by Christ, and grounded in faith.',
      icon: '✝️',
      iconImage: 'assets/images/christian_kids.png',
      targetAges: 'Ages 2–12',
      focusAreas: ['Scripture Memorization', 'Bedtime Blessings & Prayer', 'Fruit of the Spirit', 'Character Building', 'Hands-on Bible Lessons'],
      printingTip: 'Display memory verse cards on a small wooden desktop stand on your breakfast table or child’s nightstand for effortless daily Scripture contemplation.',
      featuredProductId: 'prod-kids-prayer-journal'
    }
  };

  /* ==========================================================================
     2. PRODUCTS CATALOG
     ========================================================================== */

  const PRODUCTS = [
    // --- 1. LEARNING & EDUCATION ---
    {
      id: 'prod-alphabet-flashcards',
      title: 'Watercolor Alphabet & Phonics Flashcard Set',
      subtitle: '26 Illustrated Cards with Tracing & Phonics Guides',
      collectionId: 'learning',
      price: 8.50,
      comparePrice: 12.00,
      rating: 5.0,
      reviewCount: 42,
      ageRange: 'Ages 3–6',
      ageTag: 'toddler',
      formatType: 'cards',
      theme: 'montessori',
      pageCount: 28,
      badge: 'Best Seller',
      iconImage: 'assets/images/learning_rainbow.png',
      description: 'A soothing Montessori-aligned alphabet flashcard deck featuring tender watercolor illustrations for every letter from A to Z. Includes upper and lower case letters, phonetic picture cues, and stroke-guided tracing lines.',
      includes: [
        '26 A–Z Watercolor Flashcards (4 cards per page)',
        'Large Format Alphabet Posters (8.5x11 and A4)',
        'Phonics Sound Matching Practice Guide',
        'Printing & Laminating Recommendations Sheet'
      ],
      format: 'Instant High-Res PDF (US Letter & A4)',
      isFeatured: false
    },
    {
      id: 'prod-number-mats',
      title: 'Botanical Number Counting & Tracing Mats (1–20)',
      subtitle: 'Hands-on Math Mats with Ten-Frames & Nature Counting',
      collectionId: 'learning',
      price: 7.00,
      comparePrice: 10.00,
      rating: 4.9,
      reviewCount: 29,
      ageRange: 'Ages 3–7',
      ageTag: 'toddler',
      formatType: 'chart',
      theme: 'botanical',
      pageCount: 20,
      badge: 'Popular',
      iconImage: 'assets/images/learning_rainbow.png',
      description: 'Transform early number sense into a joyful ritual. Each mat combines gentle botanical illustrations, ten-frame dot counting, number word tracing, and finger-tracing paths for numbers 1 through 20.',
      includes: [
        '20 Full-Color Math & Tracing Mats (1 to 20)',
        'Printable Counting Leaf Counters & Acorn Tokens',
        'Ten-Frame Counting Worksheets with Answer Keys'
      ],
      format: 'Instant High-Res PDF (US Letter & A4)',
      isFeatured: false
    },
    {
      id: 'prod-shapes-colors',
      title: 'Preschool Shapes & Colors Botanical Sorting Pack',
      subtitle: 'Hands-on Visual Sorting, Matching & Pattern Cards',
      collectionId: 'learning',
      price: 6.50,
      comparePrice: 9.00,
      rating: 4.8,
      reviewCount: 18,
      ageRange: 'Ages 2–5',
      ageTag: 'toddler',
      formatType: 'pack',
      theme: 'botanical',
      pageCount: 16,
      badge: 'Popular',
      iconImage: 'assets/images/learning_rainbow.png',
      description: 'Introduce geometric shapes and warm pastel colors through nature-inspired visuals. Perfect for Montessori shelf work, sensory bins, and quiet corner exploration.',
      includes: [
        '12 Geometric Shape Visual Mats',
        '36 Sorting Object Cutout Cards with Botanical Art',
        'Color Wheel Matching Wheel with Clothespeg Prompts'
      ],
      format: 'Instant High-Res PDF (US Letter & A4)',
      isFeatured: false
    },

    // --- 2. KIDS ACTIVITIES ---
    {
      id: 'prod-woodland-coloring',
      title: 'Woodland Storybook Animal Coloring & Activity Book',
      subtitle: '30 Delicate Hand-Drawn Pages for Quiet Offline Creativity',
      collectionId: 'activities',
      price: 6.00,
      comparePrice: 9.00,
      rating: 5.0,
      reviewCount: 56,
      ageRange: 'Ages 3–8',
      ageTag: 'early',
      formatType: 'book',
      theme: 'woodland',
      pageCount: 30,
      badge: 'Best Seller',
      iconImage: 'assets/images/kids_activities.png',
      description: 'Delightful woodland storybook scenes featuring Barnaby Bear, Daisy Rabbit, and forest ducklings exploring cozy treehouses, baking blackberry pies, and reading under oak trees.',
      includes: [
        '30 Unique Printable Coloring Pages',
        '4 Woodland Maze Pages & Word Search Puzzles',
        'Printable Storybook Book Cover to bind at home'
      ],
      format: 'Instant High-Res PDF (US Letter & A4)',
      isFeatured: false
    },
    {
      id: 'prod-seasonal-bundle',
      title: 'Seasonal Activity Bundle',
      subtitle: 'Four Seasons Nature Scavenger Hunt, Crafts & Coloring',
      collectionId: 'activities',
      price: 8.50,
      comparePrice: 14.00,
      rating: 5.0,
      reviewCount: 48,
      ageRange: 'Ages 3–9',
      ageTag: 'early',
      formatType: 'pack',
      theme: 'seasonal',
      pageCount: 36,
      badge: 'Featured',
      iconImage: 'assets/images/mockup_seasonal_bundle.png',
      description: 'A comprehensive seasonal learning bundle covering Spring, Summer, Autumn and Winter. Includes scavenger hunts, seasonal vocabulary cards, tree lifecycle wheels, and holiday crafts.',
      includes: [
        'Four Seasons Nature Scavenger Hunt Cards',
        'Autumn Harvest & Pumpkin Counting Mats',
        'Winter Wonderland & Christmas Tree Garland Craft',
        'Spring Blossom Watercolor Coloring Pages'
      ],
      format: 'Instant High-Res PDF (US Letter & A4)',
      isFeatured: true // FEATURED PRODUCT #4 ON HOMEPAGE
    },
    {
      id: 'prod-scissor-skills',
      title: 'Preschool Scissor Skills & Paper Craft Activity Pack',
      subtitle: 'Progressive Cutting Practice Lines, Puzzles & Puppets',
      collectionId: 'activities',
      price: 5.00,
      comparePrice: 8.00,
      rating: 4.8,
      reviewCount: 22,
      ageRange: 'Ages 3–6',
      ageTag: 'toddler',
      formatType: 'pack',
      theme: 'woodland',
      pageCount: 22,
      badge: 'Popular',
      iconImage: 'assets/images/kids_activities.png',
      description: 'Build fine motor confidence safely. Starts with straight and wavy cutting paths and progresses to woodland animal jigsaw puzzles and finger puppet crafts.',
      includes: [
        '8 Progressive Line & Curve Cutting Practice Sheets',
        '6 Cut-and-Paste Animal Assembly Puzzles',
        '4 Finger Puppet Characters with Story Backdrops'
      ],
      format: 'Instant High-Res PDF (US Letter & A4)',
      isFeatured: false
    },

    // --- 3. ROUTINES & PLANNERS ---
    {
      id: 'prod-daily-routine',
      title: 'My Daily Routine Planner',
      subtitle: 'Visual Morning, Afternoon & Bedtime Rhythm Chart',
      collectionId: 'routines',
      price: 7.50,
      comparePrice: 11.00,
      rating: 5.0,
      reviewCount: 72,
      ageRange: 'Ages 2–8',
      ageTag: 'toddler',
      formatType: 'chart',
      theme: 'routine',
      pageCount: 18,
      badge: 'Best Seller',
      iconImage: 'assets/images/mockup_daily_routine.png',
      description: 'Bring calm predictability to your home routines. Features 48 beautifully illustrated visual cards with little Barnaby Bear that children can check off independently every morning and night.',
      includes: [
        'Morning & Bedtime Visual Checklist Boards',
        '48 Illustrated Activity & Self-Care Cards with Barnaby Bear',
        'Weekly Chore & Habit Chart with Star Stickers',
        'Printing & Velcro Assembly Guide'
      ],
      format: 'Instant High-Res PDF (US Letter & A4)',
      isFeatured: true // FEATURED PRODUCT #1 ON HOMEPAGE
    },
    {
      id: 'prod-emotions-pack',
      title: 'Emotions Activity Pack',
      subtitle: 'Gentle Feelings Wheel, Breathing Cards & Calming Corner Tools',
      collectionId: 'routines',
      price: 8.00,
      comparePrice: 12.00,
      rating: 5.0,
      reviewCount: 45,
      ageRange: 'Ages 3–9',
      ageTag: 'early',
      formatType: 'pack',
      theme: 'feelings',
      pageCount: 18,
      badge: 'Popular',
      iconImage: 'assets/images/mockup_emotions_pack.png',
      description: 'Help your child name, understand, and regulate big emotions gently. Features colorful feeling faces, interactive breathing trace boards, calm corner posters, and parent conversation cards.',
      includes: [
        '12 Feelings Identification Cards with Warm Watercolor Art',
        '4 Traceable Deep Breathing Posters (Rainbow, Leaf, Star)',
        'Calm-Down Corner Visual Wall Guide',
        'Parent Companion Guide on Gentle Regulation'
      ],
      format: 'Instant High-Res PDF (US Letter & A4)',
      isFeatured: true // FEATURED PRODUCT #3 ON HOMEPAGE
    },
    {
      id: 'prod-chore-wheel',
      title: 'Family Responsibility & Kindness Chore Wheel',
      subtitle: 'Positive Contribution & Daily Helper Charts for Kids',
      collectionId: 'routines',
      price: 6.00,
      comparePrice: 9.00,
      rating: 4.8,
      reviewCount: 25,
      ageRange: 'Ages 4–10',
      ageTag: 'elementary',
      formatType: 'chart',
      theme: 'routine',
      pageCount: 12,
      badge: 'Popular',
      iconImage: 'assets/images/routines_planners.png',
      description: 'Fosters team spirit and helpfulness within the family. Frame daily tasks as acts of love and mutual care for our shared home.',
      includes: [
        'Printable Rotating Chore Wheel with Fastener Guide',
        'Weekly Helper Checklist Pad Templates',
        'Acts of Family Kindness Prompt Cards'
      ],
      format: 'Instant High-Res PDF (US Letter & A4)',
      isFeatured: false
    },

    // --- 4. FAMILY & MEMORIES ---
    {
      id: 'prod-keepsake-journal',
      title: 'Childhood Milestones & Keepsake Memory Scrapbook',
      subtitle: 'Nostalgic Yearly Memory Book from Toddlerhood to Grade School',
      collectionId: 'family',
      price: 9.50,
      comparePrice: 15.00,
      rating: 5.0,
      reviewCount: 47,
      ageRange: 'Family',
      ageTag: 'family',
      formatType: 'book',
      theme: 'botanical',
      pageCount: 42,
      badge: 'Bundle & Save',
      iconImage: 'assets/images/family_memories.png',
      description: 'Preserve the sweetest fleeting memories of childhood before they slip away. Includes guided prompts for first words, funny quotes, handprint art, and heartfelt reflections.',
      includes: [
        '42 Illustrated Memory Pages with Delicate Floral Borders',
        'Annual "All About Me" Interview Sheets (Ages 1 through 10)',
        'Handprint & Footprint Keepsake Frame Pages',
        'Printable Binder Covers & Spine Labels'
      ],
      format: 'Instant High-Res PDF (US Letter & A4)',
      isFeatured: false
    },
    {
      id: 'prod-dinner-questions',
      title: 'Dinner Table Conversation & Storytelling Question Cards',
      subtitle: '54 Heartwarming Prompts for Meaningful Family Connection',
      collectionId: 'family',
      price: 6.00,
      comparePrice: 9.00,
      rating: 4.9,
      reviewCount: 31,
      ageRange: 'Family',
      ageTag: 'family',
      formatType: 'cards',
      theme: 'family',
      pageCount: 10,
      badge: 'Popular',
      iconImage: 'assets/images/family_memories.png',
      description: 'Transform dinnertime into an oasis of connection. 54 tender, whimsical, and thought-provoking questions that invite children and parents to share stories.',
      includes: [
        '54 Printable Conversation Cards (6 per page)',
        'Printable Tabletop Box & Sleeve',
        'Special "Weekend Storyteller" Expansion Pack'
      ],
      format: 'Instant High-Res PDF (US Letter & A4)',
      isFeatured: false
    },

    // --- 5. CELEBRATIONS & HOLIDAYS ---
    {
      id: 'prod-birthday-decor',
      title: 'Watercolor Meadow Birthday Party Decor & Bunting Set',
      subtitle: 'Printable Party Banner, Cupcake Toppers, Invitations & Placemats',
      collectionId: 'celebrations',
      price: 9.00,
      comparePrice: 14.00,
      rating: 4.9,
      reviewCount: 27,
      ageRange: 'All Ages',
      ageTag: 'family',
      formatType: 'pack',
      theme: 'party',
      pageCount: 26,
      badge: 'Popular',
      iconImage: 'assets/images/celebrations_holidays.png',
      description: 'Host a dreamy, vintage-inspired children’s birthday party with delicate watercolor florals, teddy bears, and joyful pastel banners.',
      includes: [
        'A–Z Customizable Birthday Pennant Bunting',
        'Cupcake Toppers & Bottle Wrappers',
        'Party Welcome Sign (8x10 & 16x20)',
        'Editable Fill-in Invitations & Thank You Cards'
      ],
      format: 'Instant High-Res PDF (US Letter & A4)',
      isFeatured: false
    },
    {
      id: 'prod-christmas-advent',
      title: 'Cozy Christmas Advent Countdown & Kindness Cards',
      subtitle: '25 Daily Family Connection Cards & Festive Activity Garland',
      collectionId: 'celebrations',
      price: 8.00,
      comparePrice: 12.00,
      rating: 5.0,
      reviewCount: 63,
      ageRange: 'Family',
      ageTag: 'family',
      formatType: 'cards',
      theme: 'holiday',
      pageCount: 20,
      badge: 'Seasonal',
      iconImage: 'assets/images/celebrations_holidays.png',
      description: 'Slow down during the holiday rush with 25 heartwarming daily family prompts focused on generosity, baking, Christmas carols, and cozy bedtime stories.',
      includes: [
        '25 Advent Number Cards with Daily Family Prompts',
        'Numbered Envelopes & Garland Clip Art',
        'Acts of Kindness Holiday Bingo Sheet'
      ],
      format: 'Instant High-Res PDF (US Letter & A4)',
      isFeatured: false
    },

    // --- 6. CHRISTIAN KIDS ---
    {
      id: 'prod-bible-activities',
      title: 'Bible Activities for Kids',
      subtitle: 'Botanical Scripture Memory, Bedtime Prayers & Bible Coloring',
      collectionId: 'christian',
      price: 8.50,
      comparePrice: 12.00,
      rating: 5.0,
      reviewCount: 64,
      ageRange: 'Ages 3–10',
      ageTag: 'early',
      formatType: 'book',
      theme: 'faith',
      pageCount: 32,
      badge: 'Best Seller',
      iconImage: 'assets/images/mockup_bible_activities.png',
      description: 'Surround your home with God’s comforting word. Tender watercolor Bible verse cards, bedtime prayers, and hands-on Scripture activity sheets designed to help children feel secure, loved by Christ, and grounded in faith.',
      includes: [
        '32 Illustrated Scripture Verse Cards & Tracing Mats',
        'Stories of Jesus Picture Coloring Pages',
        'Lord’s Prayer & 23rd Psalm Illustrated Posters',
        'Fruit of the Spirit Character Activity Tree'
      ],
      format: 'Instant High-Res PDF (US Letter & A4)',
      isFeatured: true // FEATURED PRODUCT #2 ON HOMEPAGE
    },
    {
      id: 'prod-kids-prayer-journal',
      title: 'Kids Watercolor Prayer Journal (110-Page Guided Printable)',
      subtitle: 'Daily Scripture, Gratitude Lists, Guided Prayers & Reflection Spreads',
      collectionId: 'christian',
      price: 9.00,
      comparePrice: 16.00,
      rating: 5.0,
      reviewCount: 68,
      ageRange: 'Ages 4–12',
      ageTag: 'elementary',
      formatType: 'book',
      theme: 'faith',
      pageCount: 110,
      badge: '110-Page Studio',
      iconImage: 'assets/images/christian_kids.png',
      downloadUrl: 'kids-prayer-journal.html',
      pdfUrl: 'little_moments_kids_prayer_journal.pdf',
      description: 'A charming 110-page guided prayer journal designed to help children build lifelong rhythms of faith, gratitude, and personal conversation with God. Features charming watercolor botanical borders, Barnaby Bear & Daisy Rabbit, weekly scripture memory verses, gratitude checklists, and "Dear God" reflection spreads. Includes an online interactive flipbook!',
      includes: [
        'Full 110-Page Printable PDF Journal (US Letter & A4 Ready)',
        'Delicate Watercolor Cover & "Belongs To" Dedication Page',
        '54 Two-Page Daily Spreads (Daily Prayer Grid + Dear God Writing Lines)',
        '54 Curated Memory Verses from Psalms, Proverbs & the Gospels',
        'Interactive Digital Flipbook & Custom Print Studio'
      ],
      format: 'Instant High-Res 110-Page PDF + Interactive Print Studio',
      isFeatured: false
    },
    {
      id: 'prod-scripture-cards',
      title: 'Botanical Scripture Memory Verse Cards (Set of 32)',
      subtitle: 'Comforting, Gentle Verses for Children with Watercolor Florals',
      collectionId: 'christian',
      price: 7.50,
      comparePrice: 11.00,
      rating: 5.0,
      reviewCount: 38,
      ageRange: 'Ages 3–12',
      ageTag: 'early',
      formatType: 'cards',
      theme: 'faith',
      pageCount: 16,
      badge: 'Popular',
      iconImage: 'assets/images/christian_kids.png',
      description: 'Surround your child with God’s word. 32 calming Bible verses selected specifically for children to bring comfort when scared and gratitude in daily prayer.',
      includes: [
        '32 Botanical Scripture Verse Cards (4 per page)',
        'Wooden Stand Display Cutout Guide',
        'Weekly Scripture Memory Tracker Sheet'
      ],
      format: 'Instant High-Res PDF (US Letter & A4)',
      isFeatured: false
    }
  ];

  /* ==========================================================================
     3. DISCOUNT COUPONS & CART MANAGER
     ========================================================================== */

  const DISCOUNT_COUPONS = {
    'MOMENTS10': { code: 'MOMENTS10', rate: 0.10, label: '10% Family Discount' },
    'WELCOME': { code: 'WELCOME', rate: 0.15, label: '15% Welcome Subscriber Discount' },
    'BUNDLE20': { code: 'BUNDLE20', rate: 0.20, label: '20% Bundle Savings' }
  };

  const CART_STORAGE_KEY = 'lmb_cart_v2';

  class CartManager {
    constructor() {
      this._items = safeStorageGet(CART_STORAGE_KEY, []);
      this._discountCode = safeStorageGet('lmb_discount_code_v2', null);
    }

    _persist() {
      safeStorageSet(CART_STORAGE_KEY, this._items);
      safeStorageSet('lmb_discount_code_v2', this._discountCode);
      eventBus.emit('cart:updated', this.getSnapshot());
    }

    getItems() {
      return [...this._items];
    }

    addItem(productOrId, quantity = 1) {
      const product = typeof productOrId === 'string'
        ? PRODUCTS.find(p => p.id === productOrId)
        : productOrId;

      if (!product) return false;

      const qty = Math.max(1, parseInt(quantity, 10) || 1);
      const existing = this._items.find(item => item.product.id === product.id);

      if (existing) {
        existing.quantity += qty;
      } else {
        this._items.push({
          product: { ...product },
          quantity: qty,
          addedAt: new Date().toISOString()
        });
      }

      this._persist();
      eventBus.emit('cart:item-added', { product, quantity: qty });
      return true;
    }

    updateQuantity(productId, quantity) {
      const qty = parseInt(quantity, 10);
      if (isNaN(qty) || qty <= 0) {
        return this.removeItem(productId);
      }

      const item = this._items.find(i => i.product.id === productId);
      if (item) {
        item.quantity = qty;
        this._persist();
        return true;
      }
      return false;
    }

    removeItem(productId) {
      const idx = this._items.findIndex(i => i.product.id === productId);
      if (idx !== -1) {
        const removed = this._items.splice(idx, 1)[0];
        this._persist();
        eventBus.emit('cart:item-removed', removed);
        return true;
      }
      return false;
    }

    clearCart() {
      this._items = [];
      this._persist();
      eventBus.emit('cart:cleared');
    }

    applyDiscount(code) {
      if (!code || typeof code !== 'string') {
        return { success: false, message: 'Please enter a coupon code.' };
      }
      const upper = code.trim().toUpperCase();
      const coupon = DISCOUNT_COUPONS[upper];

      if (coupon) {
        this._discountCode = upper;
        this._persist();
        return { success: true, message: `Applied ${coupon.label}!`, coupon };
      }
      return { success: false, message: 'Coupon not valid. Try MOMENTS10 or WELCOME.' };
    }

    removeDiscount() {
      this._discountCode = null;
      this._persist();
    }

    getTotals() {
      const totalCount = this._items.reduce((sum, item) => sum + item.quantity, 0);
      const subtotal = this._items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

      let discountAmount = 0;
      let couponInfo = null;

      if (this._discountCode && DISCOUNT_COUPONS[this._discountCode]) {
        couponInfo = DISCOUNT_COUPONS[this._discountCode];
        discountAmount = subtotal * couponInfo.rate;
      }

      const tax = 0.00; // Digital tax included
      const total = Math.max(0, subtotal - discountAmount + tax);

      return {
        totalCount,
        subtotal: parseFloat(subtotal.toFixed(2)),
        discountAmount: parseFloat(discountAmount.toFixed(2)),
        discountCode: this._discountCode,
        discountLabel: couponInfo ? couponInfo.label : null,
        tax: 0.00,
        total: parseFloat(total.toFixed(2))
      };
    }

    getSnapshot() {
      return {
        items: this.getItems(),
        ...this.getTotals()
      };
    }
  }

  /* ==========================================================================
     4. WISHLIST MANAGER
     ========================================================================== */

  const WISHLIST_STORAGE_KEY = 'lmb_wishlist_v2';
  const DEFAULT_WISHLIST_SEEDS = ['prod-daily-routine', 'prod-bible-activities'];

  class WishlistManager {
    constructor(cartManager) {
      this._cart = cartManager;
      this._ids = safeStorageGet(WISHLIST_STORAGE_KEY, DEFAULT_WISHLIST_SEEDS);
    }

    _persist() {
      safeStorageSet(WISHLIST_STORAGE_KEY, this._ids);
      eventBus.emit('wishlist:updated', this.getSnapshot());
    }

    getIds() {
      return [...this._ids];
    }

    getProducts() {
      return PRODUCTS.filter(p => this._ids.includes(p.id));
    }

    has(productId) {
      return this._ids.includes(productId);
    }

    toggle(productOrId) {
      const id = typeof productOrId === 'object' ? productOrId.id : productOrId;
      if (this.has(id)) {
        this._ids = this._ids.filter(i => i !== id);
      } else {
        this._ids.push(id);
      }
      this._persist();
      return this.has(id);
    }

    remove(productId) {
      this._ids = this._ids.filter(i => i !== productId);
      this._persist();
    }

    moveToCart(productId) {
      const prod = PRODUCTS.find(p => p.id === productId);
      if (prod) {
        this._cart.addItem(prod, 1);
        this.remove(productId);
        return true;
      }
      return false;
    }

    moveAllToCart() {
      const prods = this.getProducts();
      prods.forEach(p => this._cart.addItem(p, 1));
      this._ids = [];
      this._persist();
      return prods.length;
    }

    getSnapshot() {
      return {
        ids: this.getIds(),
        count: this._ids.length,
        products: this.getProducts()
      };
    }
  }

  /* ==========================================================================
     5. CUSTOMER ACCOUNT & ORDERS MANAGER
     ========================================================================== */

  const ACCOUNT_STORAGE_KEY = 'lmb_account_v2';

  const DEFAULT_CUSTOMER_ACCOUNT = {
    profile: {
      name: 'Sarah Jenkins',
      email: 'sarah.jenkins@example.com',
      memberSince: 'March 2024',
      downloadsCount: 5
    },
    orders: [
      {
        orderId: 'LMB-72841',
        date: '2024-04-12',
        total: 16.50,
        status: 'Completed',
        items: [
          { productId: 'prod-kids-prayer-journal', title: 'Kids Watercolor Prayer Journal (110-Page Guided Printable)', price: 9.00, file: 'little_moments_kids_prayer_journal.pdf' },
          { productId: 'prod-daily-routine', title: 'My Daily Routine Planner', price: 7.50, file: 'sample_daily_routine_planner.pdf' }
        ]
      },
      {
        orderId: 'LMB-61904',
        date: '2024-02-18',
        total: 8.50,
        status: 'Completed',
        items: [
          { productId: 'prod-alphabet-flashcards', title: 'Watercolor Alphabet & Phonics Flashcard Set', price: 8.50, file: 'sample_alphabet_flashcards.pdf' }
        ]
      }
    ],
    downloads: [
      { id: 'dl-1', title: 'Kids Watercolor Prayer Journal (110-Page PDF)', orderId: 'LMB-72841', size: '48.5 MB', url: 'little_moments_kids_prayer_journal.pdf', flipbookUrl: 'kids-prayer-journal.html' },
      { id: 'dl-2', title: 'My Daily Routine Planner (US Letter & A4)', orderId: 'LMB-72841', size: '15.4 MB', url: '#' },
      { id: 'dl-3', title: 'Watercolor Alphabet Flashcard Set (26 Cards)', orderId: 'LMB-61904', size: '14.2 MB', url: '#' }
    ]
  };

  class AccountManager {
    constructor() {
      this._account = safeStorageGet(ACCOUNT_STORAGE_KEY, DEFAULT_CUSTOMER_ACCOUNT);
    }

    _persist() {
      safeStorageSet(ACCOUNT_STORAGE_KEY, this._account);
      eventBus.emit('account:updated', this._account);
    }

    getProfile() {
      return { ...this._account.profile };
    }

    updateProfile(updates) {
      this._account.profile = { ...this._account.profile, ...updates };
      this._persist();
    }

    getOrders() {
      return [...this._account.orders];
    }

    getDownloads() {
      return [...this._account.downloads];
    }

    addOrderFromCart(cartSnapshot) {
      const newOrderId = 'LMB-' + Math.floor(10000 + Math.random() * 90000);
      const today = new Date().toISOString().split('T')[0];

      const newOrder = {
        orderId: newOrderId,
        date: today,
        total: cartSnapshot.total,
        status: 'Completed',
        items: cartSnapshot.items.map(item => ({
          productId: item.product.id,
          title: item.product.title,
          price: item.product.price,
          file: item.product.pdfUrl || `${item.product.id}.pdf`
        }))
      };

      this._account.orders.unshift(newOrder);

      // Add to permanent downloads
      cartSnapshot.items.forEach(item => {
        this._account.downloads.unshift({
          id: 'dl-' + Math.floor(1000 + Math.random() * 9000),
          title: item.product.title + ' (PDF)',
          orderId: newOrderId,
          size: item.product.pageCount ? `${item.product.pageCount} Pages` : '12 MB',
          url: item.product.pdfUrl || 'little_moments_kids_prayer_journal.pdf',
          flipbookUrl: item.product.downloadUrl || null
        });
      });

      this._account.profile.downloadsCount = this._account.downloads.length;
      this._persist();
      return newOrder;
    }
  }

  /* ==========================================================================
     6. SEARCH & FILTER ENGINE
     ========================================================================== */

  function queryCatalog({
    collectionId = 'all',
    search = '',
    ageTag = 'all',
    formatType = 'all',
    theme = 'all',
    sortBy = 'featured'
  } = {}) {
    let result = [...PRODUCTS];

    // Filter by Collection
    if (collectionId && collectionId !== 'all') {
      result = result.filter(p => p.collectionId === collectionId);
    }

    // Filter by Search
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.subtitle.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }

    // Filter by Age
    if (ageTag && ageTag !== 'all') {
      result = result.filter(p => p.ageTag === ageTag);
    }

    // Filter by Format
    if (formatType && formatType !== 'all') {
      result = result.filter(p => p.formatType === formatType);
    }

    // Filter by Theme
    if (theme && theme !== 'all') {
      result = result.filter(p => p.theme === theme);
    }

    // Sort
    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'best-sellers') {
      result.sort((a, b) => (b.badge === 'Best Seller' ? 1 : 0) - (a.badge === 'Best Seller' ? 1 : 0));
    } else if (sortBy === 'name-asc') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }

  /* ==========================================================================
     INITIALIZE GLOBAL STORE
     ========================================================================== */

  const cart = new CartManager();
  const wishlist = new WishlistManager(cart);
  const account = new AccountManager();

  const store = {
    collections: COLLECTIONS_META,
    products: PRODUCTS,
    cart,
    wishlist,
    account,
    events: eventBus,
    queryCatalog,
    getProductById(id) {
      return PRODUCTS.find(p => p.id === id) || null;
    },
    getFeaturedProducts() {
      return PRODUCTS.filter(p => p.isFeatured);
    },
    getCollectionProducts(colId) {
      return PRODUCTS.filter(p => p.collectionId === colId);
    }
  };

  global.LittleMomentsStore = store;

})(typeof window !== 'undefined' ? window : this);
