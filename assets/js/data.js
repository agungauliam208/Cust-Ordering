const CAFE_CATEGORIES = [
  { id: "all", label: "Semua" },
  { id: "recommended", label: "Rekomendasi" },
  { id: "promo", label: "Promo" },
  { id: "food", label: "Makanan" },
  { id: "coffee", label: "Coffee" },
  { id: "non-coffee", label: "Non Coffee" },
  { id: "snack", label: "Cemilan" },
  { id: "dessert", label: "Dessert" }
];

const CAFE_PRODUCTS = [
  {
    id: "kopi-susu-1994",
    name: "Kopi Susu 1994",
    category: "Minuman",
    subCategory: "Coffee",
    filter: ["coffee", "recommended"],
    price: 22000,
    image: "assets/img/kopi-susu.svg",
    type: "drink",
    recommended: true,
    sold: 184,
    description: "Espresso, susu segar, dan gula aren dengan rasa creamy. Cocok untuk teman kerja, belajar, atau santai di sore hari.",
    options: {
      sizes: ["Regular", "Large"],
      temps: ["Ice", "Hot"],
      sugars: ["Normal", "Less Sugar", "No Sugar"],
      extras: [
        { label: "Extra Shot", price: 6000 },
        { label: "Oat Milk", price: 8000 },
        { label: "Caramel Syrup", price: 4000 }
      ]
    }
  },
  {
    id: "americano",
    name: "Americano",
    category: "Minuman",
    subCategory: "Coffee",
    filter: ["coffee"],
    price: 18000,
    image: "assets/img/americano.svg",
    type: "drink",
    recommended: false,
    sold: 96,
    description: "Espresso dan air panas atau dingin dengan karakter clean dan bold. Cocok untuk penikmat kopi tanpa susu.",
    options: {
      sizes: ["Regular", "Large"],
      temps: ["Ice", "Hot"],
      sugars: ["No Sugar", "Less Sugar", "Normal"],
      extras: [
        { label: "Extra Shot", price: 6000 },
        { label: "Vanilla Syrup", price: 4000 }
      ]
    }
  },
  {
    id: "caramel-latte",
    name: "Caramel Latte",
    category: "Minuman",
    subCategory: "Coffee",
    filter: ["coffee", "recommended"],
    price: 26000,
    image: "assets/img/caramel-latte.svg",
    type: "drink",
    recommended: true,
    sold: 141,
    description: "Latte lembut dengan sentuhan caramel. Cocok untuk kamu yang ingin rasa kopi lebih manis dan creamy.",
    options: {
      sizes: ["Regular", "Large"],
      temps: ["Ice", "Hot"],
      sugars: ["Normal", "Less Sugar", "No Sugar"],
      extras: [
        { label: "Extra Shot", price: 6000 },
        { label: "Oat Milk", price: 8000 },
        { label: "Caramel Syrup", price: 4000 }
      ]
    }
  },
  {
    id: "es-kopi-pandan",
    name: "Es Kopi Pandan",
    category: "Minuman",
    subCategory: "Promo",
    filter: ["coffee", "promo", "recommended"],
    price: 24000,
    image: "assets/img/es-kopi-pandan.svg",
    type: "drink",
    recommended: true,
    promo: true,
    sold: 210,
    description: "Espresso, susu, dan aroma pandan yang wangi. Menu promo dengan rasa lokal yang ringan dan creamy.",
    options: {
      sizes: ["Regular", "Large"],
      temps: ["Ice"],
      sugars: ["Normal", "Less Sugar", "No Sugar"],
      extras: [
        { label: "Extra Shot", price: 6000 },
        { label: "Oat Milk", price: 8000 }
      ]
    }
  },
  {
    id: "matcha-latte",
    name: "Matcha Latte",
    category: "Minuman",
    subCategory: "Non Coffee",
    filter: ["non-coffee", "recommended"],
    price: 25000,
    image: "assets/img/matcha.svg",
    type: "drink",
    recommended: true,
    sold: 137,
    description: "Matcha dan susu dengan rasa earthy yang lembut. Cocok untuk pilihan non coffee yang tetap creamy.",
    options: {
      sizes: ["Regular", "Large"],
      temps: ["Ice", "Hot"],
      sugars: ["Normal", "Less Sugar", "No Sugar"],
      extras: [
        { label: "Oat Milk", price: 8000 },
        { label: "Vanilla Syrup", price: 4000 }
      ]
    }
  },
  {
    id: "chocolate",
    name: "Signature Chocolate",
    category: "Minuman",
    subCategory: "Non Coffee",
    filter: ["non-coffee"],
    price: 23000,
    image: "assets/img/chocolate.svg",
    type: "drink",
    recommended: false,
    sold: 88,
    description: "Cokelat pekat dengan susu. Pilihan aman untuk pelanggan yang ingin minuman manis tanpa kopi.",
    options: {
      sizes: ["Regular", "Large"],
      temps: ["Ice", "Hot"],
      sugars: ["Normal", "Less Sugar"],
      extras: [
        { label: "Whipped Cream", price: 5000 },
        { label: "Caramel Syrup", price: 4000 }
      ]
    }
  },
  {
    id: "lemon-tea",
    name: "Lemon Tea",
    category: "Minuman",
    subCategory: "Non Coffee",
    filter: ["non-coffee"],
    price: 16000,
    image: "assets/img/lemon-tea.svg",
    type: "drink",
    recommended: false,
    sold: 72,
    description: "Teh dengan lemon segar. Cocok untuk pelanggan yang ingin minuman ringan dan tidak terlalu creamy.",
    options: {
      sizes: ["Regular", "Large"],
      temps: ["Ice", "Hot"],
      sugars: ["Normal", "Less Sugar", "No Sugar"],
      extras: [
        { label: "Lemon Slice", price: 3000 }
      ]
    }
  },
  {
    id: "nasi-ayam-matah",
    name: "Nasi Ayam Sambal Matah",
    category: "Makanan",
    subCategory: "Rice Bowl",
    filter: ["food", "recommended"],
    price: 32000,
    image: "assets/img/nasi-ayam.svg",
    type: "food",
    recommended: true,
    sold: 166,
    description: "Nasi hangat, ayam crispy, sambal matah, dan telur. Pilihan mengenyangkan untuk makan siang atau malam.",
    options: {
      spicyLevels: ["Tidak Pedas", "Sedang", "Pedas"],
      portions: ["Normal", "Nasi Jumbo"],
      extras: [
        { label: "Telur", price: 5000 },
        { label: "Sambal Extra", price: 3000 },
        { label: "Ayam Extra", price: 10000 }
      ]
    }
  },
  {
    id: "rice-bowl-teriyaki",
    name: "Rice Bowl Teriyaki",
    category: "Makanan",
    subCategory: "Rice Bowl",
    filter: ["food"],
    price: 30000,
    image: "assets/img/rice-bowl.svg",
    type: "food",
    recommended: false,
    sold: 104,
    description: "Ayam teriyaki, nasi, sayur, dan saus gurih manis. Praktis, seimbang, dan cocok untuk makan cepat.",
    options: {
      spicyLevels: ["Tidak Pedas", "Sedang", "Pedas"],
      portions: ["Normal", "Nasi Jumbo"],
      extras: [
        { label: "Telur", price: 5000 },
        { label: "Ayam Extra", price: 10000 }
      ]
    }
  },
  {
    id: "mie-goreng-1994",
    name: "Mie Goreng 1994",
    category: "Makanan",
    subCategory: "Mie",
    filter: ["food", "recommended"],
    price: 28000,
    image: "assets/img/mie-goreng.svg",
    type: "food",
    recommended: true,
    sold: 152,
    description: "Mie goreng dengan telur dan ayam suwir. Menu cepat dengan rasa gurih dan porsi yang cukup mengenyangkan.",
    options: {
      spicyLevels: ["Tidak Pedas", "Sedang", "Pedas"],
      portions: ["Normal", "Porsi Besar"],
      extras: [
        { label: "Telur", price: 5000 },
        { label: "Bakso", price: 6000 },
        { label: "Ayam Extra", price: 10000 }
      ]
    }
  },
  {
    id: "kentang-goreng",
    name: "Kentang Goreng",
    category: "Cemilan",
    subCategory: "Snack",
    filter: ["snack"],
    price: 20000,
    image: "assets/img/kentang.svg",
    type: "snack",
    recommended: false,
    sold: 119,
    description: "Kentang goreng renyah dengan pilihan saus. Cocok untuk cemilan sendiri atau berbagi di meja.",
    options: {
      sauces: ["Saus Tomat", "Saus Sambal", "Mayo"],
      extras: [
        { label: "Keju Bubuk", price: 4000 },
        { label: "BBQ Powder", price: 4000 }
      ]
    }
  },
  {
    id: "chicken-wings",
    name: "Chicken Wings",
    category: "Cemilan",
    subCategory: "Snack",
    filter: ["snack", "recommended"],
    price: 29000,
    image: "assets/img/wings.svg",
    type: "snack",
    recommended: true,
    sold: 133,
    description: "Sayap ayam dengan pilihan saus. Cocok untuk cemilan gurih dengan rasa yang lebih kuat.",
    options: {
      sauces: ["Original", "BBQ", "Spicy"],
      extras: [
        { label: "Saus Extra", price: 3000 },
        { label: "Kentang Mini", price: 7000 }
      ]
    }
  },
  {
    id: "croffle",
    name: "Croffle Caramel",
    category: "Dessert",
    subCategory: "Dessert",
    filter: ["dessert", "recommended"],
    price: 24000,
    image: "assets/img/croffle.svg",
    type: "dessert",
    recommended: true,
    sold: 125,
    description: "Croffle renyah dengan caramel. Cocok sebagai dessert setelah makan atau teman minuman.",
    options: {
      toppings: ["Caramel", "Chocolate", "Strawberry"],
      extras: [
        { label: "Ice Cream", price: 8000 },
        { label: "Almond", price: 5000 }
      ]
    }
  },
  {
    id: "paket-berdua",
    name: "Paket Berdua 1994",
    category: "Promo",
    subCategory: "Paket",
    filter: ["promo", "recommended"],
    price: 59000,
    image: "assets/img/paket-berdua.svg",
    type: "package",
    recommended: true,
    promo: true,
    sold: 178,
    description: "Dua minuman dan satu cemilan dalam satu paket. Cocok untuk dua orang yang ingin pesan lebih hemat.",
    options: {
      packageDrinks: ["2 Kopi Susu", "Kopi Susu + Lemon Tea", "Matcha + Chocolate"],
      packageSnacks: ["Kentang Goreng", "Croffle Caramel", "Chicken Wings"],
      extras: [
        { label: "Upsize Minuman", price: 8000 },
        { label: "Saus Extra", price: 3000 }
      ]
    }
  }
];
