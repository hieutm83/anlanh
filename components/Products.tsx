import React, { useState, useEffect, useMemo } from 'react';
import { Plus, X, Check, Package, ChevronRight, ChevronLeft, ShoppingBag, Clock, ArrowLeft, Gift } from 'lucide-react';
import { Product } from '../types';
import { PRODUCTS } from '../constants';

// --- CẤU HÌNH API ---
const API_URL = "https://script.google.com/macros/s/AKfycbzCzJ2SQ3iPmiJZNKg5k6Ti_9Y6EI79bLmVyhhQmBkPbSfFVga2f4hva_3-_2H-7h3k/exec";

interface ProductsProps {
  // Cho phép truyền thêm pricingRules (any) để bypass type check tạm thời
  onAddToCart: (product: Product, quantity?: number, variant?: string, priceOverride?: number, pricingRules?: any) => void;
}

interface ProductPrice {
    id: string;
    originalPrice: number;
    salePrice: number;
    combo2Price?: number;
    combo3Price?: number;
    combo3Label?: string;
}

type ComboOption = 'single' | 'combo2' | 'combo3';

// --- Countdown Timer ---
const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState(12 * 60 * 60); 
  useEffect(() => {
    const key = 'anlanh_sale_start';
    let startTime = parseInt(localStorage.getItem(key) || '0');
    const now = Date.now();
    if (!startTime || (now - startTime > 12 * 60 * 60 * 1000)) {
        startTime = now;
        localStorage.setItem(key, startTime.toString());
    }
    const interval = setInterval(() => {
        const current = Date.now();
        const remaining = (12 * 60 * 60) - Math.floor((current - startTime) / 1000);
        if (remaining <= 0) { localStorage.setItem(key, Date.now().toString()); setTimeLeft(12 * 60 * 60); } 
        else { setTimeLeft(remaining); }
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  const format = (n: number) => n.toString().padStart(2, '0');
  return (
    <div className="flex items-center justify-center gap-2 bg-red-50 border border-red-100 text-red-600 px-6 py-2 rounded-full shadow-sm animate-pulse mx-auto max-w-fit mb-8">
        <Clock size={18} className="animate-spin-slow" />
        <span className="font-bold text-xs md:text-sm uppercase tracking-wide mr-1">Ưu đãi kết thúc sau:</span>
        <div className="flex gap-1 font-mono text-base md:text-lg font-bold">
            <span className="bg-white px-1.5 rounded shadow-sm min-w-[24px] text-center">{format(Math.floor(timeLeft / 3600))}</span>:
            <span className="bg-white px-1.5 rounded shadow-sm min-w-[24px] text-center">{format(Math.floor((timeLeft % 3600) / 60))}</span>:
            <span className="bg-white px-1.5 rounded shadow-sm min-w-[24px] text-center">{format(timeLeft % 60)}</span>
        </div>
    </div>
  );
};

export const ProductList: React.FC<ProductsProps> = ({ onAddToCart }) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCombo, setSelectedCombo] = useState<ComboOption>('single');
  const [quantity, setQuantity] = useState(1);
  const [mediaIndex, setMediaIndex] = useState(0);
  const [pricingMap, setPricingMap] = useState<Record<string, ProductPrice>>({});

  useEffect(() => {
      const fetchPrices = async () => {
          try {
              const response = await fetch(`${API_URL}?action=get_products`);
              const json = await response.json();
              if (json.success && Array.isArray(json.data)) {
                  const map: Record<string, ProductPrice> = {};
                  json.data.forEach((p: ProductPrice) => map[p.id] = p);
                  setPricingMap(map);
              }
          } catch (error) { console.error("Lỗi lấy giá:", error); }
      };
      fetchPrices();
  }, []);

  const mediaList = useMemo(() => {
    if (!selectedProduct) return [];
    const list = [];
    if (selectedProduct.video) list.push({ type: 'video', src: selectedProduct.video });
    list.push({ type: 'image', src: selectedProduct.image });
    if (selectedProduct.gallery) selectedProduct.gallery.forEach(img => list.push({ type: 'image', src: img }));
    return list;
  }, [selectedProduct]);

  const openModal = (product: Product) => {
    setSelectedProduct(product);
    setSelectedCombo('single');
    setQuantity(1);
    setMediaIndex(0); 
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setSelectedProduct(null);
    document.body.style.overflow = 'unset';
  }

  const nextMedia = () => setMediaIndex((prev) => (prev + 1) % mediaList.length);
  const prevMedia = () => setMediaIndex((prev) => (prev - 1 + mediaList.length) % mediaList.length);

  // Chỉ cập nhật số lượng hiển thị trong modal
  const updateQuantity = (newQty: number) => {
      setQuantity(newQty);
  };

  const handleComboSelect = (option: ComboOption) => {
      setSelectedCombo(option);
      // Reset số lượng về 1 khi chuyển loại
      setQuantity(1);
  };

  // --- LOGIC HIỂN THỊ GIÁ TRONG MODAL ---
  const getPriceDetails = (product: Product, option: ComboOption, qty: number = 1) => {
    const sheetData = pricingMap[product.id];
    
    const basePrice = sheetData ? sheetData.salePrice : product.price;
    const originalBase = sheetData ? sheetData.originalPrice : product.price * 1.4;
    
    const combo2Price = (sheetData && sheetData.combo2Price) ? sheetData.combo2Price : (basePrice * 2 * 0.95);
    const combo3Price = (sheetData && sheetData.combo3Price) ? sheetData.combo3Price : (basePrice * 3 * 0.90);
    const combo3Label = (sheetData && sheetData.combo3Label) ? sheetData.combo3Label : "";

    let totalPrice = 0;
    let originalTotal = 0;
    let label = "";
    let discountTag = "";
    let specialLabel = "";

    // Logic tính giá hiển thị (Display only)
    if (option === 'single') {
        label = "1 Hộp";
        if (qty === 1) {
            totalPrice = basePrice;
            originalTotal = originalBase;
        } else if (qty === 2) {
            totalPrice = combo2Price;
            originalTotal = originalBase * 2;
        } else if (qty === 3) {
            totalPrice = combo3Price;
            originalTotal = originalBase * 3;
            if (combo3Label) specialLabel = combo3Label;
        } else {
            // > 3: Giá Combo 3 + (Số dư * Giá lẻ)
            const extra = qty - 3;
            totalPrice = combo3Price + (extra * basePrice);
            originalTotal = originalBase * qty;
            if (combo3Label) specialLabel = combo3Label;
        }
    } 
    else if (option === 'combo2') {
        label = "Combo 2 Hộp";
        totalPrice = combo2Price * qty; // qty là số set
        originalTotal = (originalBase * 2) * qty;
    }
    else if (option === 'combo3') {
        label = "Combo 3 Hộp";
        totalPrice = combo3Price * qty; // qty là số set
        originalTotal = (originalBase * 3) * qty;
        if (combo3Label) specialLabel = combo3Label;
    }

    const savedPercent = Math.round(((originalTotal - totalPrice) / originalTotal) * 100);
    if (option === 'single' && qty >= 2) discountTag = specialLabel ? 'HOT' : (savedPercent > 0 ? `-${savedPercent}%` : '');
    else if (option !== 'single') discountTag = specialLabel ? 'HOT' : (savedPercent > 0 ? `-${savedPercent}%` : '');
    else {
         const singleSaved = Math.round(((originalBase - basePrice) / originalBase) * 100);
         discountTag = singleSaved > 0 ? `-${singleSaved}%` : '';
    }

    return { totalPrice, label, discount: discountTag, originalTotal, specialLabel };
  };

const handleAddToCart = () => {
    if (!selectedProduct) return;
    
    // Lấy tên hiển thị
    let variantName = "";
    if (selectedCombo === 'single') variantName = "1 Hộp";
    else if (selectedCombo === 'combo2') variantName = "Combo 2 Hộp";
    else if (selectedCombo === 'combo3') variantName = "Combo 3 Hộp";

    // Lấy ảnh hiển thị
    let cartImage = selectedProduct.image;
    if (selectedCombo === 'combo2' && selectedProduct.skuImages?.combo2) cartImage = selectedProduct.skuImages.combo2;
    if (selectedCombo === 'combo3' && selectedProduct.skuImages?.combo3) cartImage = selectedProduct.skuImages.combo3;

    // Giá: Truyền giá cơ bản (basePrice) cho Single, và giá trọn gói cho Combo
    // Lưu ý: Giá này chỉ dùng để hiển thị ban đầu, Cart sẽ tự tính lại giá chuẩn từ Sheet
    const sheetData = pricingMap[selectedProduct.id];
    let initialPrice = selectedProduct.price;

    if (sheetData) {
        if (selectedCombo === 'single') initialPrice = sheetData.salePrice;
        else if (selectedCombo === 'combo2') initialPrice = sheetData.combo2Price || (sheetData.salePrice * 2);
        else if (selectedCombo === 'combo3') initialPrice = sheetData.combo3Price || (sheetData.salePrice * 3);
    }

    onAddToCart(
        { ...selectedProduct, image: cartImage }, 
        quantity, 
        variantName, 
        initialPrice 
    );
    closeModal();
  };

  return (
    <section id="products" className="py-16 bg-[#F3F0E9]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <span className="text-brand font-bold uppercase tracking-widest text-xs mb-2 block">Bộ Sưu Tập</span>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand mb-4">Ngũ Hành Dưỡng Thân</h2>
          <p className="text-gray-500 max-w-xl mx-auto mb-6 text-sm md:text-base">
            Mỗi tách trà là một hơi thở của ngũ hành, giúp cơ thể tìm lại sự cân bằng tự nhiên.
          </p>
          <CountdownTimer />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {PRODUCTS.map((product) => {
            const prices = getPriceDetails(product, 'single', 1);
            return (
                <div 
                key={product.id} 
                className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer border border-gray-100 flex flex-col h-full"
                onClick={() => openModal(product)}
                >
                <div className="relative h-64 overflow-hidden bg-gray-50">
                    <img src={product.image} alt={product.name} className="w-full h-full object-contain p-4 transition-transform duration-700 group-hover:scale-105" />
                    <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/90 backdrop-blur shadow-sm text-brand border border-gray-100`}>
                        {product.element} • {product.time}
                    </div>
                    {prices.discount && (
                        <div className="absolute top-3 right-3 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-md animate-pulse">
                            {prices.discount}
                        </div>
                    )}
                </div>

                <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-lg font-serif font-bold text-gray-800 mb-1 group-hover:text-brand transition-colors">{product.name}</h3>
                    <p className="text-xs font-medium text-gray-400 mb-3 italic">"{product.slogan}"</p>
                    <p className="text-gray-600 mb-4 line-clamp-2 flex-1 text-xs leading-relaxed">{product.description}</p>

                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                    <div className="flex flex-col">
                        {prices.originalTotal > prices.totalPrice && (<span className="text-[10px] text-gray-400 line-through">{prices.originalTotal.toLocaleString('vi-VN')}đ</span>)}
                        <span className="text-lg font-bold text-brand">{prices.totalPrice.toLocaleString('vi-VN')}đ</span>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); openModal(product); }} className="bg-brand text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-brand-light transition-colors shadow-sm">
                        <Plus size={16} />
                    </button>
                    </div>
                </div>
                </div>
            );
          })}
        </div>
      </div>

      {selectedProduct && (
        <>
            <div className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm hidden md:block animate-in fade-in duration-300" onClick={closeModal}></div>
            <div className={`fixed z-[100] bg-white flex flex-col md:flex-row animate-in slide-in-from-bottom-5 duration-300 inset-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[1000px] md:max-w-[95vw] md:h-[650px] md:max-h-[90vh] md:rounded-2xl md:shadow-2xl md:overflow-hidden`}>
                <button onClick={closeModal} className="absolute top-4 left-4 z-30 p-2.5 bg-black/20 hover:bg-black/40 md:bg-white md:shadow-md md:hover:bg-gray-100 rounded-full transition-all text-white md:text-gray-800 backdrop-blur-md">
                  <ArrowLeft size={24} className="md:hidden" /><X size={24} className="hidden md:block" />
                </button>

                <div className="w-full md:w-1/2 h-[40vh] md:h-full bg-black relative shrink-0 flex items-center justify-center group overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center bg-gray-900">
                        {mediaList[mediaIndex].type === 'video' ? (
                            <video src={mediaList[mediaIndex].src} className="w-full h-full object-contain" controls autoPlay muted loop playsInline />
                        ) : (
                            <img src={mediaList[mediaIndex].src} alt={selectedProduct.name} className="w-full h-full object-contain" />
                        )}
                    </div>
                    {mediaList.length > 1 && (
                        <>
                            <button onClick={prevMedia} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-sm transition-all active:scale-95"><ChevronLeft size={24} /></button>
                            <button onClick={nextMedia} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-sm transition-all active:scale-95"><ChevronRight size={24} /></button>
                        </>
                    )}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-xs backdrop-blur-sm font-mono">{mediaIndex + 1} / {mediaList.length}</div>
                </div>

                <div className="w-full md:w-1/2 h-full flex flex-col bg-white relative overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-5 md:p-10 pb-32 md:pb-32 custom-scrollbar">
                        <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-4 ${selectedProduct.colorClass.replace('text-', 'bg-').replace('800', '100')} text-brand`}>
                          {selectedProduct.element} • {selectedProduct.time}
                        </div>
                        <h2 className="text-2xl md:text-4xl font-serif font-bold text-gray-800 mb-2">{selectedProduct.name}</h2>
                        <p className="text-base md:text-lg text-gray-500 italic mb-6">"{selectedProduct.slogan}"</p>

                        <div className="mb-6 border-b border-gray-100 pb-6">
                            <h3 className="font-bold text-brand mb-3 flex items-center gap-2 text-sm uppercase tracking-wide"><Package size={18} /> Chọn gói ưu đãi</h3>
                            <div className="space-y-3">
                                {(['single', 'combo2', 'combo3'] as const).map(sku => {
                                    // Hiển thị giá tham khảo 1 Set
                                    const details = getPriceDetails(selectedProduct, sku, 1); 
                                    const isSelected = selectedCombo === sku;
                                    
                                    return (
                                        <div 
                                            key={sku} 
                                            className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all 
                                                ${isSelected 
                                                    ? (details.specialLabel ? 'border-purple-500 bg-purple-50 shadow-sm' : 'border-brand bg-brand-bg/20 shadow-sm') 
                                                    : 'border-gray-100 hover:bg-gray-50'
                                                }`} 
                                            onClick={() => handleComboSelect(sku)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center 
                                                    ${isSelected 
                                                        ? (details.specialLabel ? 'border-purple-500' : 'border-brand') 
                                                        : 'border-gray-300'}`
                                                }>
                                                    {isSelected && <div className={`w-2.5 h-2.5 rounded-full ${details.specialLabel ? 'bg-purple-500' : 'bg-brand'}`}></div>}
                                                </div>
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`font-medium text-sm ${details.specialLabel ? 'text-purple-700 font-bold' : 'text-gray-700'}`}>
                                                            {details.label}
                                                        </span>
                                                        {details.discount && (
                                                            <span className={`text-[10px] text-white font-bold px-1.5 py-0.5 rounded shadow-sm flex items-center gap-1 ${details.specialLabel ? 'bg-purple-500' : (sku === 'combo3' ? 'bg-red-500' : 'bg-green-600')}`}>
                                                                {details.specialLabel && <Gift size={10} />}
                                                                {details.discount}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {details.specialLabel && (
                                                        <span className="text-[10px] text-purple-600 font-medium italic mt-0.5 flex items-center gap-1"><Gift size={10} /> {details.specialLabel}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="block font-bold text-gray-900">
                                                    {details.totalPrice.toLocaleString('vi-VN')}đ
                                                </span>
                                                {details.originalTotal > details.totalPrice && (
                                                    <span className="text-xs text-gray-400 line-through">
                                                        {details.originalTotal.toLocaleString('vi-VN')}đ
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                        
                        <div className="mb-8">
                            <p className="text-gray-600 mb-4 leading-relaxed text-sm md:text-base">{selectedProduct.description}</p>
                            <div className="flex flex-wrap gap-2 mb-4">
                              {selectedProduct.ingredients.map((ing, idx) => (<span key={idx} className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md text-xs font-medium border border-gray-200">{ing}</span>))}
                            </div>
                            <ul className="space-y-2 bg-brand-bg/30 p-4 rounded-xl">
                              {selectedProduct.benefits.map((benefit, idx) => (<li key={idx} className="flex items-start gap-2 text-gray-700 text-sm"><Check size={16} className="text-brand shrink-0 mt-0.5" /><span>{benefit}</span></li>))}
                            </ul>
                        </div>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-white border-t border-gray-100 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-20 flex flex-col md:flex-row items-center gap-3">
                          <div className="w-full md:w-auto flex items-center justify-between md:justify-start gap-4 md:mr-auto bg-gray-50 rounded-full px-4 py-2">
                             <div className="flex items-center gap-3">
                                <button onClick={() => updateQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-brand bg-white rounded-full shadow-sm disabled:opacity-50" disabled={quantity <= 1}><ArrowLeft size={16} /></button>
                                <span className="font-bold text-lg w-6 text-center">{quantity}</span>
                                <button onClick={() => updateQuantity(quantity + 1)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-brand bg-white rounded-full shadow-sm"><Plus size={16} /></button>
                             </div>
                             <div className="flex flex-col items-end md:items-start">
                                 <span className="text-xs text-gray-400">Tạm tính:</span>
                                 <span className="text-xl font-bold text-brand">
                                    {getPriceDetails(selectedProduct, selectedCombo, quantity).totalPrice.toLocaleString('vi-VN')}đ
                                 </span>
                             </div>
                          </div>
                          <button onClick={handleAddToCart} className="w-full md:w-auto md:min-w-[200px] bg-brand hover:bg-brand-accent text-white py-3.5 rounded-full font-bold text-lg transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2">
                             <ShoppingBag size={20} /> Thêm Vào Giỏ
                          </button>
                    </div>
                </div>
            </div>
        </>
      )}
    </section>
  );
};
