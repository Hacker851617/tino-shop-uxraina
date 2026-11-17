import React, { useState, useEffect } from 'react';
import {
  Search, ShoppingCart, Home, Package, Plus, Trash2, Flame,
  CheckCircle2, X, ShieldCheck, Store, TrendingUp, Box, ClipboardList,
  MapPin, Smartphone, Wallet, Copy, Check, ExternalLink, Navigation,
  User, Lock, Mail, LogOut, Eye, EyeOff, MessageSquare, Send
} from 'lucide-react';

const API_URL = const API_URL = import.meta.env.VITE_API_URL || "https://tino-shop-uxraina-1.onrender.com";

const TinoLogo = ({ size = "w-10 h-10" }) => (
  <div className="flex items-center gap-2.5 select-none">
    <div className={`${size} rounded-xl bg-gradient-to-br from-rose-500 to-red-800 p-1.5 shadow-md flex items-center justify-center border border-rose-300/40 shrink-0`}>
      <svg viewBox="0 0 64 64" className="w-full h-full">
        <path
          d="M18 36c0-9 7-16 16-16 7 0 13 4 15 10h4c2 0 3 2 3 4v6c0 2-2 3-4 3h-2v7h-6v-6H28v6h-6v-7c-3-1-4-4-4-7z"
          fill="#38BDF8"
        />
        <circle cx="39" cy="27" r="2" fill="#0F172A" />
        <path
          d="M12 46 L28 32 L36 38 L52 18 M52 18 L41 19 M52 18 L51 29"
          stroke="#FB923C"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    </div>
    <div className="leading-tight">
      <h1 className="font-extrabold text-lg tracking-tight text-white">
        TINO <span className="text-rose-200">SHOP</span>
      </h1>
      <p className="text-[11px] font-medium text-rose-200/90 -mt-0.5 tracking-wider">
        UXraina
      </p>
    </div>
  </div>
);

const CATEGORIES = ['Rehetra', 'Finday', 'Hatsaran-tarehy', 'Solosaina', 'Feo sy Mozika', 'Kojakoja'];

const maskName = (fullName) => {
  return fullName
    .split(' ')
    .map((part) => {
      if (part.length <= 2) return part;
      return part[0] + '*'.repeat(part.length - 2) + part[part.length - 1];
    })
    .join(' ');
};

export default function App() {
  const [activeView, setActiveView] = useState('shop');

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [comments, setComments] = useState({}); // { productId: [...] }
  const [cart, setCart] = useState([]);

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('tino_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Fakana ny entana avy ao amin'ny SQL Backend
  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/products`);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Tsy afaka naka ny entana:", err);
    }
  };

  // Fakana ny kaomandy avy ao amin'ny SQL Backend
  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/orders`);
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error("Tsy afaka naka ny kaomandy:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, []);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('tino_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('tino_current_user');
    }
  }, [currentUser]);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authForm, setAuthForm] = useState({ fullName: '', contact: '', password: '' });

  const [selectedCategory, setSelectedCategory] = useState('Rehetra');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  const [selectedProductForDetails, setSelectedProductForDetails] = useState(null);
  const [newCommentText, setNewCommentText] = useState('');

  const ADMIN_MVOLA_NUMBER = '038 49 100 20';
  const ADMIN_FULL_NAME = 'Mioratiana Lydia';

  const [checkoutForm, setCheckoutForm] = useState({
    customerName: '',
    customerPhone: '',
    address: '',
    paymentMethod: 'mvola',
    mvolaRef: '',
    gpsCoords: null,
  });
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState('');

  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'Finday',
    price: '',
    oldPrice: '',
    stock: '',
    badge: 'Vaovao',
    image: '',
  });

  const formatAr = (price) => Number(price).toLocaleString('fr-FR') + ' Ar';

  // Fidirana sy Famoronana Kaonty mivantana amin'ny SQL
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    const cleanContact = authForm.contact.trim();

    try {
      if (authMode === 'register') {
        const res = await fetch(`${API_URL}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            full_name: authForm.fullName,
            contact: cleanContact,
            password: authForm.password
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Tsy nahomby ny fisoratana anarana.");
        setCurrentUser(data);
        setIsAuthModalOpen(false);
        setAuthForm({ fullName: '', contact: '', password: '' });
      } else {
        // Login (Mpanjifa na Admin)
        const res = await fetch(`${API_URL}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contact: cleanContact,
            password: authForm.password
          })
        }); 
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Diso ny fidirana.");
        setCurrentUser(data);
        setIsAuthModalOpen(false);
        if (data.role === 'admin') setActiveView('admin');
        setAuthForm({ fullName: '', contact: '', password: '' });
      }
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const handleFacebookLogin = () => {
    const fbUser = { id: Date.now(), fullName: 'Mpanjifa Facebook', contact: 'Facebook', role: 'client' };
    setCurrentUser(fbUser);
    setIsAuthModalOpen(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveView('shop');
  };

  const openAdminSection = () => {
    if (currentUser && currentUser.role === 'admin') {
      setActiveView('admin');
    } else {
      setAuthMode('admin_login');
      setAuthError('');
      setIsAuthModalOpen(true);
    }
  };

  const proceedToCheckout = () => {
    setIsMobileCartOpen(false);
    if (!currentUser) {
      setAuthMode('login');
      setAuthError('Midira amin\'ny kaontinao aloha vao manafatra entana.');
      setIsAuthModalOpen(true);
      return;
    }
    if (currentUser.role === 'admin') {
      alert('Tsy afaka manao kaomandy ny Mpitantana.');
      return;
    }
    setCheckoutForm((prev) => ({
      ...prev,
      customerName: prev.customerName || currentUser.fullName,
      customerPhone: prev.customerPhone || (!currentUser.contact.includes('@') ? currentUser.contact : ''),
    }));
    setIsCheckoutModalOpen(true);
  };

  // Fakana sy fametrahana Commentaire avy amin'ny SQL
  const fetchComments = async (productId) => {
    try {
      const res = await fetch(`${API_URL}/comments/${productId}`);
      const data = await res.json();
      setComments((prev) => ({ ...prev, [productId]: data }));
    } catch (err) {
      console.error("Tsy afaka naka hevitra:", err);
    }
  };

  const handleOpenProductDetails = (product) => {
    setSelectedProductForDetails(product);
    fetchComments(product.id);
  };

  const handleAddComment = async (e, productId) => {
    e.preventDefault();
    if (!currentUser || currentUser.role === 'admin') return;
    if (!newCommentText.trim()) return;

    try {
      const res = await fetch(`${API_URL}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: productId,
          user_name: currentUser.fullName,
          text: newCommentText.trim()
        })
      });
      if (res.ok) {
        setNewCommentText('');
        fetchComments(productId);
      }
    } catch (err) {
      console.error("Tsy afaka nandefa hevitra:", err);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchCat = selectedCategory === 'Rehetra' || p.category === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const addToCart = (product) => {
    if (currentUser && currentUser.role === 'admin') return;
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, qty: item.qty + delta } : item))
        .filter((item) => item.qty > 0)
    );
  };

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const deliveryFee = subtotal > 0 ? 5000 : 0;
  const total = subtotal + deliveryFee;

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setGpsError('Tsy manana GPS ity fitaovana ity.');
      return;
    }
    setGpsLoading(true);
    setGpsError('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCheckoutForm((prev) => ({
          ...prev,
          gpsCoords: {
            lat: position.coords.latitude.toFixed(6),
            lng: position.coords.longitude.toFixed(6),
          },
        }));
        setGpsLoading(false);
      },
      () => {
        setGpsError('Tsy afaka naka ny toerana.');
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const copyMvolaNumber = () => {
    navigator.clipboard.writeText('0384910020');
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2500);
  };

  // Fandefasana kaomandy any amin'ny SQL Backend
  const handleConfirmOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    const newOrderData = {
      id: 'KMD-' + Math.floor(1000 + Math.random() * 9000),
      customer: checkoutForm.customerName,
      phone: checkoutForm.customerPhone,
      address: checkoutForm.address,
      gps_lat: checkoutForm.gpsCoords ? checkoutForm.gpsCoords.lat : null,
      gps_lng: checkoutForm.gpsCoords ? checkoutForm.gpsCoords.lng : null,
      payment_method: checkoutForm.paymentMethod === 'mvola' ? 'MVola' : 'Aloa rehefa tonga',
      mvola_ref: checkoutForm.paymentMethod === 'mvola' ? checkoutForm.mvolaRef : '-',
      items: cart.map((i) => `${i.name} (x${i.qty})`).join(', '),
      total: total,
    };

    try {
      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrderData)
      });
      if (res.ok) {
        setCart([]);
        setIsCheckoutModalOpen(false);
        setOrderSuccess(true);
        fetchOrders();
        setCheckoutForm({ customerName: '', customerPhone: '', address: '', paymentMethod: 'mvola', mvolaRef: '', gpsCoords: null });
        setTimeout(() => setOrderSuccess(false), 5000);
      }
    } catch (err) {
      console.error("Tsy afaka nandefa kaomandy:", err);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewProduct((prev) => ({ ...prev, image: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  // Fampidirana entana vaovao any amin'ny SQL Backend
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) return;

    try {
      const res = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProduct.name,
          category: newProduct.category,
          price: Number(newProduct.price),
          old_price: Number(newProduct.oldPrice) || 0,
          stock: Number(newProduct.stock) || 10,
          badge: newProduct.badge || 'Vaovao',
          image: newProduct.image
        })
      });
      if (res.ok) {
        setNewProduct({ name: '', category: 'Finday', price: '', oldPrice: '', stock: '', badge: 'Vaovao', image: '' });
        fetchProducts();
      }
    } catch (err) {
      console.error("Tsy afaka nampiditra entana:", err);
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      await fetch(`${API_URL}/products/${id}`, { method: 'DELETE' });
      fetchProducts();
    } catch (err) {
      console.error("Tsy afaka namafa entana:", err);
    }
  };

  const cycleOrderStatus = async (id, currentStatus) => {
    const statuses = ['Miandry', 'Efa lasa', 'Voaray'];
    const nextStatus = statuses[(statuses.indexOf(currentStatus) + 1) % statuses.length];
    try {
      await fetch(`${API_URL}/orders/${id}/status?status=${nextStatus}`, { method: 'PUT' });
      fetchOrders();
    } catch (err) {
      console.error("Tsy afaka nanova ny toetry ny kaomandy:", err);
    }
  };

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-950 via-rose-900 to-rose-700 text-slate-900 pb-20 lg:pb-8">
      {/* HEADER */}
      <header className="sticky top-0 z-30 bg-gradient-to-r from-red-950 via-red-900 to-rose-800 border-b border-rose-400/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div onClick={() => setActiveView('shop')} className="cursor-pointer">
            <TinoLogo />
          </div>

          <div className="flex-1 max-w-lg hidden md:block">
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Hitady entana ao amin'ny Tino Shop UXraina..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-12 py-2 rounded-xl bg-rose-50/95 text-slate-900 placeholder-rose-900/50 text-sm focus:outline-none shadow-inner"
              />
              <button className="absolute right-1.5 p-1.5 rounded-lg bg-gradient-to-r from-rose-600 to-red-700 text-white">
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentUser ? (
              <div className="flex items-center gap-2 bg-white/10 px-2.5 py-1.5 rounded-xl border border-rose-300/20 text-white">
                <div className="w-6 h-6 rounded-full bg-amber-400 text-red-950 font-extrabold text-xs flex items-center justify-center">
                  {currentUser.fullName.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-bold hidden sm:inline max-w-[110px] truncate">
                  {currentUser.fullName} {currentUser.role === 'admin' ? '(Mpitantana)' : ''}
                </span>
                <button
                  onClick={handleLogout}
                  title="Hivoaka"
                  className="p-1 rounded-lg hover:bg-red-800 text-rose-200 hover:text-white transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setAuthMode('login');
                  setAuthError('');
                  setIsAuthModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-white text-red-950 hover:bg-rose-50 font-extrabold text-xs flex items-center gap-1.5 shadow transition"
              >
                <User className="w-3.5 h-3.5 text-rose-600" />
                <span>Hiditra / Kaonty</span>
              </button>
            )}

            <div className="bg-red-950/70 p-1 rounded-xl border border-rose-400/20 flex items-center">
              <button
                onClick={() => setActiveView('shop')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                  activeView === 'shop'
                    ? 'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow'
                    : 'text-rose-200 hover:text-white'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Fivarotana</span>
              </button>
              <button
                onClick={openAdminSection}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                  activeView === 'admin'
                    ? 'bg-amber-400 text-red-950 shadow'
                    : 'text-rose-200 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mpitantana</span>
              </button>
            </div>

            {activeView === 'shop' && (!currentUser || currentUser.role !== 'admin') && (
              <button
                onClick={() => setIsMobileCartOpen(true)}
                className="lg:hidden relative p-2 rounded-xl bg-white/10 text-white"
              >
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-400 text-red-950">
                    {totalItems}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* SHOP VIEW */}
      {activeView === 'shop' ? (
        <main className="max-w-7xl mx-auto px-4 pt-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
          <aside className="hidden lg:block lg:col-span-2">
            <div className="bg-rose-50/95 backdrop-blur-md rounded-2xl p-3.5 shadow-xl border border-rose-200/60 sticky top-20">
              <h2 className="text-xs font-bold uppercase tracking-wider text-red-900 mb-3 px-2">
                Sokajy rehetra
              </h2>
              <nav className="space-y-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition ${
                      selectedCategory === cat
                        ? 'bg-gradient-to-r from-red-800 to-rose-600 text-white shadow-md'
                        : 'text-slate-700 hover:bg-rose-200/60'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          <section className="lg:col-span-7 space-y-5">
            <div className="flex lg:hidden gap-2 overflow-x-auto pb-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                    selectedCategory === cat
                      ? 'bg-amber-400 text-red-950 shadow'
                      : 'bg-white/15 text-rose-100 hover:bg-white/25'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-600 via-red-700 to-red-950 p-6 text-white shadow-xl border border-rose-300/30">
              <div className="relative z-10 max-w-md space-y-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-400 text-red-950">
                  <Flame className="w-3.5 h-3.5" /> TINO SHOP UXRAINA
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight">
                  {currentUser ? `Tongasoa, ${currentUser.fullName}!` : 'Fivarotana miorina amin\'ny Database SQL'}
                </h2>
                <p className="text-xs sm:text-sm text-rose-100">
                  Voatahiry tsara ao anaty SQLite ny entana sy kaomandinao rehetra.
                </p>
              </div>
            </div>

            {orderSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-600 text-white font-medium text-sm flex items-center gap-3 shadow-lg">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>Voaray soa aman-tsara ny kaomandinao!</span>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-white">
                  Entana amidy ({filteredProducts.length})
                </h3>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="bg-rose-50/95 rounded-2xl p-10 text-center space-y-3 shadow-lg">
                  <p className="text-sm font-bold text-red-950">Mbola tsy misy entana ao amin'ny Database.</p>
                  <p className="text-xs text-slate-600">Midira ao amin'ny Mpitantana mba hampidirana entana vaovao.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="bg-rose-50/95 rounded-2xl overflow-hidden shadow-lg border border-rose-200/70 flex flex-col justify-between"
                    >
                      <div onClick={() => handleOpenProductDetails(product)} className="cursor-pointer">
                        <div className="relative h-36 bg-white overflow-hidden">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-lg text-[10px] font-extrabold bg-red-700 text-white shadow">
                            {product.badge}
                          </span>
                        </div>

                        <div className="p-3">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-rose-600">
                            {product.category}
                          </p>
                          <h4 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-1 mt-0.5 hover:text-rose-700">
                            {product.name}
                          </h4>

                          <div className="mt-2">
                            <p className="text-sm sm:text-base font-extrabold text-red-900">
                              {formatAr(product.price)}
                            </p>
                            <p className="text-[11px] text-slate-400 line-through">
                              {formatAr(product.oldPrice)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="px-3 pb-3 space-y-1.5">
                        <button
                          onClick={() => handleOpenProductDetails(product)}
                          className="w-full py-1.5 rounded-xl bg-rose-200/70 hover:bg-rose-300 text-red-950 font-bold text-[11px] flex items-center justify-center gap-1 transition"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>Hevitra ({comments[product.id]?.length || 0})</span>
                        </button>

                        {(!currentUser || currentUser.role !== 'admin') && (
                          <button
                            onClick={() => addToCart(product)}
                            className="w-full py-2 rounded-xl bg-gradient-to-r from-red-800 to-rose-600 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            <span>Hividy</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {(!currentUser || currentUser.role !== 'admin') && (
            <aside className="hidden lg:block lg:col-span-3">
              <div className="bg-rose-50/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-rose-200/60 sticky top-20">
                <div className="flex items-center justify-between border-b border-rose-200 pb-3 mb-3">
                  <h2 className="font-bold text-red-950 flex items-center gap-2 text-sm">
                    <ShoppingCart className="w-4 h-4 text-rose-600" />
                    Harona ({totalItems})
                  </h2>
                  {cart.length > 0 && (
                    <button onClick={() => setCart([])} className="text-xs text-rose-600 hover:underline">
                      Fafana
                    </button>
                  )}
                </div>

                {cart.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-8">Mbola tsy misy entana ao anaty harona.</p>
                ) : (
                  <>
                    <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                      {cart.map((item) => (
                        <div key={item.id} className="flex items-center gap-2.5 bg-white p-2 rounded-xl border border-rose-100">
                          <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-800 truncate">{item.name}</p>
                            <p className="text-xs font-semibold text-red-800">{formatAr(item.price * item.qty)}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <button onClick={() => updateQty(item.id, -1)} className="w-5 h-5 rounded bg-rose-100 text-red-900 flex items-center justify-center">-</button>
                              <span className="text-xs font-bold">{item.qty}</span>
                              <button onClick={() => updateQty(item.id, 1)} className="w-5 h-5 rounded bg-rose-100 text-red-900 flex items-center justify-center">+</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-rose-200 mt-4 pt-3 space-y-1.5 text-xs">
                      <div className="flex justify-between text-slate-600">
                        <span>Vidin'ny entana:</span>
                        <span>{formatAr(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Saram-pitaterana:</span>
                        <span>{formatAr(deliveryFee)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-extrabold text-red-950 pt-1 border-t border-rose-200">
                        <span>Fitambarany:</span>
                        <span>{formatAr(total)}</span>
                      </div>
                      <button
                        onClick={proceedToCheckout}
                        className="w-full mt-3 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-red-950 font-extrabold text-xs shadow-md"
                      >
                        Hanohy ny fividianana
                      </button>
                    </div>
                  </>
                )}
              </div>
            </aside>
          )}
        </main>
      ) : (
        /* ADMIN VIEW */
        <main className="max-w-7xl mx-auto px-4 pt-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-red-950/60 border border-rose-400/20 p-4 rounded-2xl text-white">
            <div>
              <h2 className="text-xl font-extrabold flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-amber-400" />
                Efitrano Fitantanana — Tino Shop UXraina
              </h2>
              <p className="text-xs text-rose-200 mt-0.5">
                Mpitantana : <span className="font-bold text-amber-300">{currentUser?.fullName}</span>
              </p>
            </div>
            <button
              onClick={() => setActiveView('shop')}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white self-start sm:self-auto"
            >
              Hiverina any amin'ny Fivarotana
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-rose-50/95 rounded-2xl p-4 shadow-lg border border-rose-200 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500">Vola miditra rehetra</p>
                <p className="text-lg font-extrabold text-red-950">{formatAr(totalRevenue)}</p>
              </div>
            </div>

            <div className="bg-rose-50/95 rounded-2xl p-4 shadow-lg border border-rose-200 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <ClipboardList className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500">Isan'ny kaomandy</p>
                <p className="text-lg font-extrabold text-red-950">{orders.length} kaomandy</p>
              </div>
            </div>

            <div className="bg-rose-50/95 rounded-2xl p-4 shadow-lg border border-rose-200 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-200 text-rose-800 flex items-center justify-center">
                <Box className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500">Karazana entana</p>
                <p className="text-lg font-extrabold text-red-950">{products.length} entana</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 bg-rose-50/95 rounded-2xl p-5 shadow-xl border border-rose-200">
              <h3 className="font-extrabold text-red-950 text-base mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-rose-600" />
                Hampiditra entana vaovao
              </h3>

              <form onSubmit={handleAddProduct} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Anaran'ny entana *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ohatra: Finday Samsung..."
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-rose-200 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Sokajy</label>
                    <select
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-rose-200 focus:outline-none"
                    >
                      {CATEGORIES.filter((c) => c !== 'Rehetra').map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tahiry</label>
                    <input
                      type="number"
                      placeholder="10"
                      value={newProduct.stock}
                      onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-rose-200 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Vidiny (Ar) *</label>
                    <input
                      type="number"
                      required
                      placeholder="100000"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-rose-200 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Vidiny taloha (Ar)</label>
                    <input
                      type="number"
                      placeholder="120000"
                      value={newProduct.oldPrice}
                      onChange={(e) => setNewProduct({ ...newProduct, oldPrice: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-rose-200 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sarin'ny entana</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full px-3 py-1.5 rounded-xl bg-white border border-rose-200 text-xs"
                  />
                  {newProduct.image && (
                    <img src={newProduct.image} alt="Topi-maso" className="mt-2 h-20 w-20 object-cover rounded-xl border border-rose-300" />
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 mt-2 rounded-xl bg-gradient-to-r from-red-800 to-rose-600 text-white font-extrabold text-xs shadow-md"
                >
                  Hitahiry sy hamoaka ny entana
                </button>
              </form>
            </div>

            <div className="lg:col-span-7 space-y-5">
              <div className="bg-rose-50/95 rounded-2xl p-5 shadow-xl border border-rose-200">
                <h3 className="font-extrabold text-red-950 text-base mb-3 flex items-center gap-2">
                  <Package className="w-5 h-5 text-rose-600" />
                  Kaomandy voaray ({orders.length})
                </h3>

                {orders.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4">Mbola tsy misy kaomandy voaray.</p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                    {orders.map((ord) => (
                      <div key={ord.id} className="bg-white p-3.5 rounded-xl border border-rose-200 text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-extrabold text-red-900 mr-2">{ord.id}</span>
                            <span className="font-bold text-slate-800">{ord.customer}</span>
                            <span className="text-slate-500 ml-2">({ord.phone})</span>
                          </div>
                          <button
                            onClick={() => cycleOrderStatus(ord.id, ord.status)}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              ord.status === 'Miandry'
                                ? 'bg-amber-200 text-amber-900'
                                : ord.status === 'Efa lasa'
                                ? 'bg-sky-200 text-sky-900'
                                : 'bg-emerald-200 text-emerald-900'
                            }`}
                          >
                            {ord.status}
                          </button>
                        </div>

                        <p className="text-slate-600"><span className="font-bold">Entana :</span> {ord.items}</p>

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-rose-100">
                          <div>
                            <span className="font-bold text-slate-700">Fandoavam-bola : </span>
                            <span className="font-extrabold text-rose-700">{ord.paymentMethod}</span>
                            {ord.mvolaRef && ord.mvolaRef !== '-' && (
                              <span className="ml-1.5 px-2 py-0.5 bg-amber-100 text-amber-900 rounded font-mono">
                                Réf: {ord.mvolaRef}
                              </span>
                            )}
                          </div>
                          <span className="font-extrabold text-sm text-red-950">{formatAr(ord.total)}</span>
                        </div>

                        <div className="bg-rose-50 p-2 rounded-lg flex flex-wrap items-center justify-between gap-2">
                          <span className="text-slate-700 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-red-700 shrink-0" />
                            {ord.address || 'Tsy nisy adiresy voasoratra'}
                          </span>
                          {ord.gps ? (
                            <a
                              href={`https://www.google.com/maps?q=${ord.gps.lat},${ord.gps.lng}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700"
                            >
                              <Navigation className="w-3 h-3" />
                              <span>Sokafy amin'ny Sarintany (GPS)</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">Tsy nisy GPS</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-rose-50/95 rounded-2xl p-5 shadow-xl border border-rose-200">
                <h3 className="font-extrabold text-red-950 text-base mb-3">
                  Lisitry ny entana ao anaty tahiry ({products.length})
                </h3>
                {products.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4">Mbola tsy misy entana ao amin'ny tahiry.</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {products.map((prod) => (
                      <div key={prod.id} className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-rose-100 text-xs">
                        <div className="flex items-center gap-3 min-w-0">
                          <img src={prod.image} alt={prod.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate">{prod.name}</p>
                            <p className="text-[11px] text-slate-500">{prod.category} • Tahiry : {prod.stock}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="font-extrabold text-red-900">{formatAr(prod.price)}</span>
                          <button
                            onClick={() => handleDeleteProduct(prod.id)}
                            className="p-1.5 rounded-lg bg-rose-100 text-red-700 hover:bg-red-700 hover:text-white"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      )}

      {/* PRODUCT DETAILS & COMMENTS MODAL */}
      {selectedProductForDetails && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-rose-50 w-full max-w-xl rounded-2xl p-6 shadow-2xl border border-rose-200 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-rose-200 pb-3">
              <h3 className="font-extrabold text-base text-red-950 flex items-center gap-2">
                <Store className="w-5 h-5 text-rose-600" />
                Antsipirian'ny entana sy Hevitra
              </h3>
              <button onClick={() => setSelectedProductForDetails(null)} className="text-slate-500 hover:text-red-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="h-48 bg-white rounded-xl overflow-hidden border border-rose-200">
                <img src={selectedProductForDetails.image} alt={selectedProductForDetails.name} className="w-full h-full object-cover" />
              </div>
              <div className="space-y-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-700 text-white">
                  {selectedProductForDetails.badge}
                </span>
                <p className="text-xs font-semibold uppercase text-rose-600">{selectedProductForDetails.category}</p>
                <h4 className="font-extrabold text-base text-slate-900">{selectedProductForDetails.name}</h4>
                <p className="text-lg font-extrabold text-red-900">{formatAr(selectedProductForDetails.price)}</p>
                <p className="text-xs text-slate-500">Tahiry : <span className="font-bold text-slate-800">{selectedProductForDetails.stock}</span></p>

                {(!currentUser || currentUser.role !== 'admin') && (
                  <button
                    onClick={() => {
                      addToCart(selectedProductForDetails);
                      setSelectedProductForDetails(null);
                    }}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-800 to-rose-600 text-white font-extrabold text-xs shadow-md mt-2"
                  >
                    Ampiana ao anaty harona
                  </button>
                )}
              </div>
            </div>

            <div className="border-t border-rose-200 pt-4 space-y-3">
              <h4 className="font-bold text-sm text-red-950 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-rose-600" />
                Hevitry ny mpanjifa ({comments[selectedProductForDetails.id]?.length || 0})
              </h4>

              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {(!comments[selectedProductForDetails.id] || comments[selectedProductForDetails.id].length === 0) ? (
                  <p className="text-xs text-slate-500 italic">Mbola tsy misy naneho hevitra tamin'ity entana ity.</p>
                ) : (
                  comments[selectedProductForDetails.id].map((comm) => (
                    <div key={comm.id} className="bg-white p-2.5 rounded-xl border border-rose-100 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-red-900">{comm.user}</span>
                        <span className="text-[10px] text-slate-400">{comm.date}</span>
                      </div>
                      <p className="text-slate-700">{comm.text}</p>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={(e) => handleAddComment(e, selectedProductForDetails.id)} className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  placeholder={currentUser ? "Soraty eto ny hevitrao..." : "Hiditra aloha vao afaka m-commenter..."}
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  disabled={!currentUser || currentUser.role === 'admin'}
                  className="flex-1 px-3 py-2 rounded-xl bg-white border border-rose-200 text-xs focus:outline-none disabled:bg-slate-100"
                />
                <button
                  type="submit"
                  disabled={!currentUser || currentUser.role === 'admin'}
                  className="px-4 py-2 rounded-xl bg-red-900 hover:bg-red-800 text-white font-bold text-xs flex items-center gap-1 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Handefa</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* AUTH MODAL */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-rose-50 w-full max-w-md rounded-2xl p-6 shadow-2xl border border-rose-200 space-y-4">
            <div className="flex items-center justify-between border-b border-rose-200 pb-3">
              <div className="flex items-center gap-3">
                <TinoLogo size="w-9 h-9" />
                <h3 className="font-extrabold text-base text-red-950">
                  {authMode === 'admin_login'
                    ? 'Fidirana Mpitantana Voaaro'
                    : authMode === 'register'
                    ? 'Mamorona Kaonty Tino Shop'
                    : 'Fidirana Mpanjifa'}
                </h3>
              </div>
              <button onClick={() => setIsAuthModalOpen(false)} className="text-slate-500 hover:text-red-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-red-100 border border-red-300 text-red-900 text-xs font-semibold">
                {authError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-3 text-xs">
              {authMode === 'register' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Anarana feno *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ohatra: Mioratiana Lydia"
                    value={authForm.fullName}
                    onChange={(e) => setAuthForm({ ...authForm, fullName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-rose-200 focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {authMode === 'admin_login' ? 'Laharana na Mailaka Mpitantana *' : 'Mailaka na Laharana Finday *'}
                </label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-rose-500 absolute left-3" />
                  <input
                    type="text"
                    required
                    placeholder={authMode === 'admin_login' ? '038 49 100 20' : 'mailaka@ohatra.mg na 034...'}
                    value={authForm.contact}
                    onChange={(e) => setAuthForm({ ...authForm, contact: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-rose-200 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Teny miafina *</label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-rose-500 absolute left-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={authForm.password}
                    onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-white border border-rose-200 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-slate-400 hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-red-800 to-rose-600 text-white font-extrabold text-xs shadow-md hover:opacity-95 transition"
              >
                {authMode === 'admin_login'
                  ? 'Hiditra ao amin\'ny Fitantanana'
                  : authMode === 'register'
                  ? 'Hamorona ny kaontiko'
                  : 'Hiditra'}
              </button>
            </form>

            {authMode !== 'admin_login' && (
              <>
                <div className="relative flex py-1 items-center">
                  <div className="grow border-t border-rose-200"></div>
                  <span className="shrink mx-3 text-[11px] text-slate-400 font-semibold">NA</span>
                  <div className="grow border-t border-rose-200"></div>
                </div>

                <button
                  type="button"
                  onClick={handleFacebookLogin}
                  className="w-full py-2.5 rounded-xl bg-[#1877F2] hover:bg-[#166FE5] text-white font-bold text-xs flex items-center justify-center gap-2 shadow transition"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span>Hanohy amin'ny Facebook</span>
                </button>

                <div className="text-center pt-1 text-xs text-slate-600">
                  {authMode === 'login' ? (
                    <p>
                      Mbola tsy manana kaonty?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('register');
                          setAuthError('');
                        }}
                        className="font-extrabold text-rose-700 hover:underline"
                      >
                        Mamorona eto
                      </button>
                    </p>
                  ) : (
                    <p>
                      Efa manana kaonty?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('login');
                          setAuthError('');
                        }}
                        className="font-extrabold text-rose-700 hover:underline"
                      >
                        Hiditra eto
                      </button>
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* CHECKOUT MODAL */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-rose-50 w-full max-w-lg rounded-2xl p-5 shadow-2xl border border-rose-200 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-rose-200 pb-3">
              <h3 className="font-extrabold text-base text-red-950">
                Famaranana ny kaomandy sy Fandoavam-bola
              </h3>
              <button onClick={() => setIsCheckoutModalOpen(false)} className="text-slate-500 hover:text-red-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmOrder} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Anaranao feno *</label>
                  <input
                    type="text"
                    required
                    placeholder="Anarana sy fanampiny"
                    value={checkoutForm.customerName}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, customerName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-rose-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Laharana finday *</label>
                  <input
                    type="tel"
                    required
                    placeholder="034 / 032 / 033..."
                    value={checkoutForm.customerPhone}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, customerPhone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-rose-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-rose-200 space-y-2.5">
                <label className="block font-bold text-slate-800">Toerana fanaterana ny entana *</label>
                <input
                  type="text"
                  required
                  placeholder="Fokontany, Tanàna..."
                  value={checkoutForm.address}
                  onChange={(e) => setCheckoutForm({ ...checkoutForm, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-rose-50/60 border border-rose-200 focus:outline-none"
                />

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={gpsLoading}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition"
                  >
                    <MapPin className="w-4 h-4" />
                    <span>{gpsLoading ? 'Eo am-pikarohana GPS...' : 'Haka ny toerana misy ahy (GPS)'}</span>
                  </button>

                  {checkoutForm.gpsCoords && (
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg">
                      GPS voaray : {checkoutForm.gpsCoords.lat}, {checkoutForm.gpsCoords.lng}
                    </span>
                  )}
                </div>
                {gpsError && <p className="text-[11px] text-red-600 font-medium">{gpsError}</p>}
              </div>

              <div className="space-y-2">
                <label className="block font-bold text-slate-800">Fomba fandoavam-bola *</label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setCheckoutForm({ ...checkoutForm, paymentMethod: 'mvola' })}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition ${
                      checkoutForm.paymentMethod === 'mvola'
                        ? 'bg-amber-100 border-amber-500 text-red-950 font-extrabold shadow-xs'
                        : 'bg-white border-rose-200 text-slate-600'
                    }`}
                  >
                    <Smartphone className="w-5 h-5 text-amber-600 shrink-0" />
                    <span>MVola</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCheckoutForm({ ...checkoutForm, paymentMethod: 'cash' })}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition ${
                      checkoutForm.paymentMethod === 'cash'
                        ? 'bg-amber-100 border-amber-500 text-red-950 font-extrabold shadow-xs'
                        : 'bg-white border-rose-200 text-slate-600'
                    }`}
                  >
                    <Wallet className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>Aloa rehefa tonga</span>
                  </button>
                </div>
              </div>

              {checkoutForm.paymentMethod === 'mvola' && (
                <div className="bg-amber-50 border border-amber-300 rounded-xl p-3.5 space-y-2.5">
                  <p className="text-slate-700 font-medium">
                    Alefaso amin'ity kaonty MVola ity ny vola <span className="font-extrabold text-red-900">{formatAr(total)}</span> :
                  </p>
                  <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-amber-200">
                    <div>
                      <p className="text-sm font-extrabold text-red-950 tracking-wide">{ADMIN_MVOLA_NUMBER}</p>
                      <p className="text-[11px] font-bold text-slate-500">
                        Anarana : <span className="text-slate-800 font-mono">{maskName(ADMIN_FULL_NAME)}</span>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={copyMvolaNumber}
                      className="px-2.5 py-1.5 rounded-lg bg-amber-400 text-red-950 font-bold text-[11px] flex items-center gap-1"
                    >
                      {copiedPhone ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedPhone ? 'Voaray' : 'Handika'}</span>
                    </button>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Laharana fanamarinana (Référence SMS MVola) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ohatra: 984512365..."
                      value={checkoutForm.mvolaRef}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, mvolaRef: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-amber-300 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="border-t border-rose-200 pt-3 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 block">Fitambarany aloa :</span>
                  <span className="text-base font-extrabold text-red-950">{formatAr(total)}</span>
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-800 to-rose-600 text-white font-extrabold text-xs shadow-lg"
                >
                  Hanamafy ny kaomandy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MOBILE CART */}
      {isMobileCartOpen && (!currentUser || currentUser.role !== 'admin') && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end lg:hidden">
          <div className="w-80 max-w-full bg-rose-50 h-full p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-rose-200 pb-3 mb-3">
                <h2 className="font-bold text-red-950">Harona ({totalItems})</h2>
                <button onClick={() => setIsMobileCartOpen(false)}>
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>
              <div className="space-y-2.5 max-h-[60vh] overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 bg-white p-2 rounded-xl">
                    <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate">{item.name}</p>
                      <p className="text-xs text-red-800 font-semibold">{formatAr(item.price * item.qty)}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <button onClick={() => updateQty(item.id, -1)} className="px-1.5 bg-rose-100 rounded">-</button>
                        <span className="text-xs font-bold">{item.qty}</span>
                        <button onClick={() => updateQty(item.id, 1)} className="px-1.5 bg-rose-100 rounded">+</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {cart.length > 0 && (
              <div className="border-t border-rose-200 pt-3">
                <div className="flex justify-between font-extrabold text-red-950 mb-3">
                  <span>Fitambarany:</span>
                  <span>{formatAr(total)}</span>
                </div>
                <button
                  onClick={proceedToCheckout}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-red-800 to-rose-600 text-white font-bold text-sm"
                >
                  Hanohy ny fividianana
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MOBILE BOTTOM NAV */}
      <nav className="fixed bottom-0 inset-x-0 z-30 lg:hidden bg-red-950/95 backdrop-blur-md border-t border-rose-400/20 px-4 py-2 flex justify-around items-center text-rose-200">
        <button
          onClick={() => {
            setActiveView('shop');
            setSelectedCategory('Rehetra');
          }}
          className={`flex flex-col items-center gap-0.5 ${activeView === 'shop' ? 'text-amber-400' : ''}`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-medium">Fandraisana</span>
        </button>

        {(!currentUser || currentUser.role !== 'admin') && (
          <button
            onClick={() => setIsMobileCartOpen(true)}
            className="relative flex flex-col items-center gap-0.5 hover:text-white"
          >
            <ShoppingCart className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 right-1 px-1.5 text-[9px] font-bold rounded-full bg-amber-400 text-red-950">
                {totalItems}
              </span>
            )}
            <span className="text-[10px]">Harona</span>
          </button>
        )}

        <button
          onClick={openAdminSection}
          className={`flex flex-col items-center gap-0.5 ${activeView === 'admin' ? 'text-amber-400' : ''}`}
        >
          <ShieldCheck className="w-5 h-5" />
          <span className="text-[10px]">Mpitantana</span>
        </button>
      </nav>
    </div>
  );
}
