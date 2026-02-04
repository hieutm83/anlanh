import React, { useState, useEffect, useMemo } from 'react';
import { Plus, X, Check, Package, ChevronRight, ChevronLeft, ShoppingBag, Clock, ArrowLeft, Gift } from 'lucide-react';
import { Product } from '../types';
import { PRODUCTS } from '../constants';

// --- CẤU HÌNH API ---
const API_URL = "https://script.google.com/macros/s/AKfycbzCzJ2SQ3iPmiJZNKg5k6Ti_9Y6EI79bLmVyhhQmBkPbSfFVga2f4hva_3-_2H-7h3k/exec";

interface ProductsProps {
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

  const getPriceDetails = (product: Product, option: ComboOption, qty: number = 1) => {
    const sheetData = pricingMap[product.id];
    const basePrice = sheetData ? sheetData.salePrice : product.price;
    const originalBase = sheetData ? sheetData.originalPrice : product.price * 1.4;
    const combo2Price = (sheetData && sheetData.combo2Price) ? sheetData.combo2Price : (basePrice * 2 * 0.95);
    const combo3Price = (sheetData && sheetData.combo3Price) ? sheetData.combo3Price : (basePrice * 3 * 0.90);
    const combo3Label = (sheetData && sheetData.combo3Label) ? sheetData.combo3Label : "";

    let totalPrice = 0, originalTotal = 0, label = "", discountTag = "", specialLabel = "";

    if (option === 'single') {
        label = "1 Hộp";
        if (qty === 1) { totalPrice = basePrice; originalTotal = originalBase; }
        else if (qty === 2) { totalPrice = combo2Price; originalTotal = originalBase * 2; }
        else if (qty === 3) { totalPrice = combo3Price; originalTotal = originalBase * 3; if (combo3Label) specialLabel = combo3Label; }
        else {
            const extra = qty - 3;
            totalPrice = combo3Price + (extra * basePrice);
            originalTotal = originalBase * qty;
            if (combo3Label) specialLabel = combo3Label;
        }
    } else if (option === 'combo2') {
        label = "Combo 2 Hộp"; totalPrice = combo2Price * qty; originalTotal = (originalBase * 2) * qty;
    } else if (option === 'combo3') {
        label = "Combo 3 Hộp"; totalPrice = combo3Price * qty; originalTotal = (originalBase * 3) * qty;
        if (combo3Label) specialLabel = combo3Label;
    }

    const savedPercent = Math.round(((originalTotal - totalPrice) / originalTotal) * 100);
    discountTag = specialLabel ? 'HOT' : (savedPercent > 0 ? `-${savedPercent}%` : '');
    return { totalPrice, label, discount: discountTag, originalTotal, specialLabel };
  };

  const currentModalPrice = useMemo(() => {
    if (!selectedProduct) return null;
    return getPriceDetails(selectedProduct, selectedCombo, quantity);
  }, [selectedProduct, selectedCombo, quantity, pricingMap]);

  const openModal = (product: Product) => {
    setSelectedProduct(product);
    setSelectedCombo('single');
    setQuantity(1);
    setMediaIndex(0); 
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${scrollBarWidth}px`;
  };

  const closeModal = () => {
    setSelectedProduct(null);
    document.body.style.overflow = 'unset';
    document.body.style.paddingRight = '0px';
  };

  const mediaList = useMemo(() => {
    if (!selectedProduct) return [];
    const list = [];
    if (selectedProduct.video) list.push({ type: 'video', src: selectedProduct.video });
    list.push({ type: 'image', src: selectedProduct.image });
    if (selectedProduct.gallery) selectedProduct.gallery.forEach(img => list.push({ type: 'image', src: img }));
    return list;
  }, [selectedProduct]);

  const handleAddToCart = () => {
    if (!selectedProduct || !currentModalPrice) return;
    let variantName = selectedCombo === 'single' ? "1 Hộp" : (selectedCombo === 'combo2' ? "Combo 2 Hộp" : "Combo 3 Hộp");
    let cartImage = selectedProduct.image;
    if (selectedCombo === 'combo2' && selectedProduct.skuImages?.combo2) cartImage = selectedProduct.skuImages.combo2;
    if (selectedCombo === 'combo3' && selectedProduct.skuImages?.combo3) cartImage = selectedProduct.skuImages.combo3;

    onAddToCart({ ...selectedProduct, image: cartImage }, quantity, variantName, currentModalPrice.totalPrice / quantity);
    closeModal();
  };

  return (
    <section id="products" className="py-16 bg-[#FDFBF7] overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <span className="text-brand font-bold uppercase tracking-widest text-xs mb-2 block">Bộ Sưu Tập</span>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand mb-4">Ngũ Hành Dưỡng Thân</h2>
          <CountdownTimer />
        </div>

        <div className="relative mx-auto w-full max-w-[320px] sm:max-w-[500px] md:max-w-[650px] aspect-square mb-20 mt-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 text-center">
            <div className="w-20 h-20 md:w-32 md:h-32 bg-white/80 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center border border-brand/10">
              <span className="text-brand font-serif font-bold text-[10px] md:text-sm tracking-widest uppercase">An Lành</span>
            </div>
          </div>
          <div className="absolute inset-0 border border-dashed border-brand/10 rounded-full scale-90"></div>

          {PRODUCTS.map((product, index) => {
            const prices = getPriceDetails(product, 'single', 1);
            const angle = (index * 72) - 90;
            const radius = 40;
            return (
              <div key={product.id} className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer transition-all duration-500 w-[110px] sm:w-[160px] md:w-[200px]"
                style={{ left: `${50 + radius * Math.cos(angle * Math.PI / 180)}%`, top: `${50 + radius * Math.sin(angle * Math.PI / 180)}%` }}
                onClick={() => openModal(product)}>
                <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 p-2 md:p-4 flex flex-col items-center text-center transition-all duration-300 group-hover:-translate-y-2">
                  <div className="relative w-14 h-14 sm:w-20 sm:h-20 md:w-28 md:h-28 mb-2">
                    <img src={product.image} alt={product.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                    {prices.discount && <div className="absolute -top-1 -right-1 bg-red-600 text-white text-[7px] md:text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-md animate-pulse">{prices.discount}</div>}
                  </div>
                  <h3 className="text-[9px] sm:text-xs md:text-sm font-serif font-bold text-gray-800 line-clamp-1 mb-1">{product.name}</h3>
                  <div className={`text-[7px] md:text-[9px] px-2 py-0.5 rounded-full ${product.colorClass.replace('text-', 'bg-').replace('800', '100')} text-brand font-bold uppercase`}>{product.element}</div>
                  <div className="mt-1 md:mt-2 font-bold text-brand text-[10px] md:text-sm">{prices.totalPrice.toLocaleString('vi-VN')}đ</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedProduct && currentModalPrice && (
        <>
          <div className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={closeModal}></div>
          <div className="fixed z-[100] bg-white flex flex-col md:flex-row animate-in slide-in-from-bottom-5 duration-300 inset-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[1000px] md:max-w-[95vw] md:h-[650px] md:max-h-[90vh] md:rounded-2xl md:shadow-2xl md:overflow-hidden">
            <button onClick={closeModal} className="absolute top-4 left-4 z-30 p-2.5 bg-black/20 hover:bg-black/40 md:bg-white md:shadow-md md:hover:bg-gray-100 rounded-full text-white md:text-gray-800 backdrop-blur-md">
              <ArrowLeft size={24} className="md:hidden" /><X size={24} className="hidden md:block" />
            </button>
            <div className="w-full md:w-1/2 h-[40vh] md:h-full bg-black relative shrink-0 flex items-center justify-center overflow-hidden">
              <div className="w-full h-full flex items-center justify-center bg-gray-900">
                {mediaList[mediaIndex].type === 'video' ? <video src={mediaList[mediaIndex].src} className="w-full h-full object-contain" controls autoPlay muted loop playsInline /> : <img src={mediaList[mediaIndex].src} alt={selectedProduct.name} className="w-full h-full object-contain" />}
              </div>
              {mediaList.length > 1 && (
                <>
                  <button onClick={() => setMediaIndex((prev) => (prev - 1 + mediaList.length) % mediaList.length)} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 text-white backdrop-blur-sm"><ChevronLeft size={24} /></button>
                  <button onClick={() => setMediaIndex((prev) => (prev + 1) % mediaList.length)} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 text-white backdrop-blur-sm"><ChevronRight size={24} /></button>
                </>
              )}
            </div>
            <div className="w-full md:w-1/2 h-full flex flex-col bg-white relative overflow-hidden">
              <div className="flex-1 overflow-y-auto p-5 md:p-10 pb-32 md:pb-32 custom-scrollbar" style={{ WebkitOverflowScrolling: 'touch' }}>
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-4 ${selectedProduct.colorClass.replace('text-', 'bg-').replace('800', '100')} text-brand`}>{selectedProduct.element} • {selectedProduct.time}</div>
                <h2 className="text-2xl md:text-4xl font-serif font-bold text-gray-800 mb-2">{selectedProduct.name}</h2>
                <p className="text-base md:text-lg text-gray-500 italic mb-6">"{selectedProduct.slogan}"</p>
                <div className="mb-6 border-b border-gray-100 pb-6">
                  <h3 className="font-bold text-brand mb-3 flex items-center gap-2 text-sm uppercase tracking-wide"><Package size={18} /> Chọn gói ưu đãi</h3>
                  <div className="space-y-3">
                    {(['single', 'combo2', 'combo3'] as const).map(sku => {
                      const details = getPriceDetails(selectedProduct, sku, 1);
                      const isSelected = selectedCombo === sku;
                      return (
                        <div key={sku} className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${isSelected ? (details.specialLabel ? 'border-purple-500 bg-purple-50' : 'border-brand bg-brand-bg/20') : 'border-gray-100 hover:bg-gray-50'}`} onClick={() => { setSelectedCombo(sku); setQuantity(1); }}>
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? (details.specialLabel ? 'border-purple-500' : 'border-brand') : 'border-gray-300'}`}>{isSelected && <div className={`w-2.5 h-2.5 rounded-full ${details.specialLabel ? 'bg-purple-500' : 'bg-brand'}`}></div>}</div>
                            <div className="flex flex-col"><span className={`font-medium text-sm ${details.specialLabel ? 'text-purple-700 font-bold' : 'text-gray-700'}`}>{details.label}</span>
                            {details.discount && <span className={`text-[10px] text-white font-bold px-1.5 py-0.5 rounded w-fit ${details.specialLabel ? 'bg-purple-500' : (sku === 'combo3' ? 'bg-red-500' : 'bg-green-600')}`}>{details.discount}</span>}</div>
                          </div>
                          <div className="text-right"><span className="block font-bold text-gray-900">{details.totalPrice.toLocaleString('vi-VN')}đ</span>
                          {details.originalTotal > details.totalPrice && <span className="text-xs text-gray-400 line-through">{details.originalTotal.toLocaleString('vi-VN')}đ</span>}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>
                <div className="mb-8"><p className="text-gray-600 mb-4 text-sm leading-relaxed">{selectedProduct.description}</p>
                <ul className="space-y-2 bg-brand-bg/30 p-4 rounded-xl">{selectedProduct.benefits.map((benefit, idx) => (<li key={idx} className="flex items-start gap-2 text-gray-700 text-sm"><Check size={16} className="text-brand shrink-0 mt-0.5" /><span>{benefit}</span></li>))}</ul></div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-white border-t border-gray-100 shadow-lg z-20 flex flex-col md:flex-row items-center gap-3">
                <div className="w-full md:w-auto flex items-center justify-between md:justify-start gap-4 md:mr-auto bg-gray-50 rounded-full px-4 py-2">
                  <div className="flex items-center gap-3"><button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm" disabled={quantity <= 1}><ArrowLeft size={16} /></button>
                  <span className="font-bold text-lg w-6 text-center">{quantity}</span><button onClick={() => setQuantity(quantity + 1)} className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm"><Plus size={16} /></button></div>
                  <div className="text-right md:text-left"><span className="text-xs text-gray-400 block">Tạm tính:</span><span className="text-xl font-bold text-brand">{currentModalPrice.totalPrice.toLocaleString('vi-VN')}đ</span></div>
                </div>
                <button onClick={handleAddToCart} className="w-full md:w-auto md:min-w-[200px] bg-brand text-white py-3.5 rounded-full font-bold text-lg shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform"><ShoppingBag size={20} /> Thêm Vào Giỏ</button>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
};
