import React, { useState, useEffect, useMemo } from 'react';
import { Plus, X, Check, Star, Package, ChevronRight, ChevronLeft, ShoppingBag, Clock, ArrowLeft } from 'lucide-react';
import { Product } from '../types';
import { PRODUCTS } from '../constants';

interface ProductsProps {
  onAddToCart: (product: Product, quantity?: number, variant?: string, priceOverride?: number) => void;
}

type ComboOption = 'single' | 'combo2' | 'combo3';

const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState(12 * 60 * 60); // 12 hours in seconds

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
        const elapsedSecs = Math.floor((current - startTime) / 1000);
        const remaining = (12 * 60 * 60) - elapsedSecs;
        
        if (remaining <= 0) {
             localStorage.setItem(key, Date.now().toString()); // Auto-reset for demo purposes
             setTimeLeft(12 * 60 * 60);
        } else {
             setTimeLeft(remaining);
        }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  const format = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className="flex items-center justify-center gap-2 bg-red-50 border border-red-100 text-red-600 px-6 py-3 rounded-full shadow-sm animate-pulse-slow mx-auto max-w-fit mb-8">
        <Clock size={20} className="animate-spin-slow" />
        <span className="font-bold text-sm uppercase tracking-wide mr-2">Ưu đãi kết thúc sau:</span>
        <div className="flex gap-1 font-mono text-lg font-bold">
            <span className="bg-white px-2 rounded shadow-sm">{format(hours)}</span>
            <span>:</span>
            <span className="bg-white px-2 rounded shadow-sm">{format(minutes)}</span>
            <span>:</span>
            <span className="bg-white px-2 rounded shadow-sm">{format(seconds)}</span>
        </div>
    </div>
  );
};

export const ProductList: React.FC<ProductsProps> = ({ onAddToCart }) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCombo, setSelectedCombo] = useState<ComboOption>('single');
  const [mediaIndex, setMediaIndex] = useState(0);

  // Construct media list: Video (if exists) -> Image (Thumbnail) -> Gallery
  const mediaList = useMemo(() => {
    if (!selectedProduct) return [];
    const list = [];
    if (selectedProduct.video) list.push({ type: 'video', src: selectedProduct.video });
    list.push({ type: 'image', src: selectedProduct.image });
    selectedProduct.gallery.forEach(img => list.push({ type: 'image', src: img }));
    return list;
  }, [selectedProduct]);

  const openModal = (product: Product) => {
    setSelectedProduct(product);
    setSelectedCombo('single');
    setMediaIndex(0); // Start with the first item (video)
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setSelectedProduct(null);
    document.body.style.overflow = 'unset';
  }

  const nextMedia = () => {
    setMediaIndex((prev) => (prev + 1) % mediaList.length);
  };

  const prevMedia = () => {
    setMediaIndex((prev) => (prev - 1 + mediaList.length) % mediaList.length);
  };

  const handleComboChange = (option: ComboOption, product: Product) => {
    setSelectedCombo(option);
  };

  const getPriceDetails = (product: Product, option: ComboOption) => {
    const basePrice = product.price;
    if (option === 'combo2') {
      const discount = 0.05; // 5% off
      const total = basePrice * 2 * (1 - discount);
      return { price: total, label: 'Combo 2 Hộp', discount: '-5%', original: basePrice * 2 };
    }
    if (option === 'combo3') {
      const discount = 0.10; // 10% off
      const total = basePrice * 3 * (1 - discount);
      return { price: total, label: 'Combo 3 Hộp', discount: '-10%', original: basePrice * 3 };
    }
    return { price: basePrice, label: '1 Hộp', discount: '', original: basePrice };
  };

  const handleAddToCart = () => {
    if (!selectedProduct) return;
    const details = getPriceDetails(selectedProduct, selectedCombo);
    
    // Determine thumbnail for cart: use main image or sku image if combo selected
    let cartImage = selectedProduct.image;
    if (selectedCombo === 'combo2') cartImage = selectedProduct.skuImages.combo2;
    if (selectedCombo === 'combo3') cartImage = selectedProduct.skuImages.combo3;

    onAddToCart(
        { ...selectedProduct, image: cartImage }, 
        1, 
        selectedCombo === 'single' ? undefined : details.label, 
        details.price
    );
    closeModal();
  };

  return (
    <section id="products" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <span className="text-brand-accent font-bold tracking-wider uppercase text-sm">Bộ Sưu Tập</span>
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-brand mt-2 mb-4">Ngũ Hành Dưỡng Thân</h2>
          <p className="text-gray-500 max-w-xl mx-auto mb-6">
            Mỗi tách trà là một hơi thở của ngũ hành, giúp cơ thể tìm lại sự cân bằng tự nhiên.
          </p>
          <CountdownTimer />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> {/* Giảm gap-8 -> gap-6 */}
          {PRODUCTS.map((product) => (
            <div key={product.id} className="group relative bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 flex flex-col h-full">
              {/* 1. Image: Giảm chiều cao từ h-72 xuống h-56 */}
              <div className="relative h-56 overflow-hidden bg-gray-100 cursor-pointer" onClick={() => openModal(product)}>
                <img 
                  src={product.image} 
                  alt={product.name} 
                  // Nếu bạn muốn ảnh vuông full không bị cắt thì dùng: object-contain p-2
                  // Nếu muốn ảnh tràn viền (đẹp hơn nhưng có thể bị cắt nhẹ): object-cover
                  className="w-full h-full object-contain p-2 transition-transform duration-700 group-hover:scale-110"
                />
                <div className={`absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/90 backdrop-blur ${product.colorClass.split(' ')[0]}`}>
                  {product.element} - {product.time}
                </div>
                {/* Sale Badge */}
                <div className="absolute top-3 right-3 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-md animate-pulse">
                    Đang giảm giá
                </div>
              </div>

              {/* 2. Content: Giảm padding p-6 -> p-4 */}
              <div className="p-4 flex-1 flex flex-col">
                {/* Title: Giảm text-2xl -> text-lg */}
                <h3 className="text-lg font-serif font-bold text-gray-800 mb-1 cursor-pointer hover:text-brand-accent transition-colors" onClick={() => openModal(product)}>
                    {product.name}
                </h3>
                <p className="text-xs font-medium text-gray-400 mb-3 italic">"{product.slogan}"</p>
                
                <p className="text-gray-600 mb-4 line-clamp-2 flex-1 text-sm leading-relaxed">
                  {product.description}
                </p>

                <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 line-through">195.000đ</span>
                    <span className="text-lg font-bold text-red-600">{product.price.toLocaleString('vi-VN')}đ</span>
                  </div>
                  <button 
                    onClick={() => openModal(product)}
                    className="bg-brand text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-brand-accent transition-colors shadow-md active:scale-95 text-xs font-medium"
                  >
                    Xem & Mua <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Product Detail Full Screen Overlay (Acts like a Page) */}
{selectedProduct && (
    <>
        {/* 1. Lớp nền mờ (Backdrop) - Chỉ hiện trên Desktop để làm tối web phía sau */}
        <div 
            className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm hidden md:block animate-in fade-in duration-300"
            onClick={closeModal}
        ></div>

        {/* 2. Modal chính */}
        <div className={`
            fixed z-[100] bg-white flex flex-col md:flex-row 
            animate-in slide-in-from-bottom-5 duration-300
            
            /* --- MOBILE: Giữ nguyên Full màn hình --- */
            inset-0 

            /* --- DESKTOP (md): Thu nhỏ, căn giữa, bo góc --- */
            md:inset-auto 
            md:top-1/2 md:left-1/2 
            md:-translate-x-1/2 md:-translate-y-1/2
            md:w-[1000px] md:max-w-[95vw] 
            md:h-[650px] md:max-h-[90vh] 
            md:rounded-2xl md:shadow-2xl md:overflow-hidden
        `}>
            
            {/* Close Button - Acts like Back Button */}
            <button 
              onClick={closeModal}
              className="absolute top-4 left-4 z-30 p-2.5 bg-black/20 hover:bg-black/40 md:bg-white md:shadow-md md:hover:bg-gray-100 rounded-full transition-all text-white md:text-gray-800 backdrop-blur-md"
            >
              <ArrowLeft size={24} className="md:hidden" /> {/* Arrow on mobile */}
              <X size={24} className="hidden md:block" />   {/* X on desktop */}
            </button>

            {/* Left: Media Section (Top on mobile, Left on desktop) */}
            <div className="w-full md:w-1/2 h-[40vh] md:h-full bg-black relative shrink-0 flex items-center justify-center group overflow-hidden">
                <div className="w-full h-full flex items-center justify-center">
                    {mediaList[mediaIndex].type === 'video' ? (
                        <video 
                            src={mediaList[mediaIndex].src} 
                            className="w-full h-full object-contain" 
                            controls 
                            autoPlay 
                            muted
                            loop
                        />
                    ) : (
                        <img 
                            src={mediaList[mediaIndex].src} 
                            alt={selectedProduct.name} 
                            className="w-full h-full object-contain"
                        />
                    )}
                </div>

                {/* Navigation Arrows */}
                <button 
                    onClick={prevMedia}
                    // CŨ: bg-white/20 hover:bg-white/40 text-white ...
                    // MỚI: bg-white/50 hover:bg-white text-gray-900 (Nền trắng mờ, mũi tên đen)
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/50 hover:bg-white text-gray-900 backdrop-blur-sm transition-all active:scale-95 shadow-sm"
                >
                    <ChevronLeft size={28} />
                </button>
                <button 
                    onClick={nextMedia}
                    // Tương tự cho nút Next
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/50 hover:bg-white text-gray-900 backdrop-blur-sm transition-all active:scale-95 shadow-sm"
                >
                    <ChevronRight size={28} />
                </button>

                {/* Counter Badge */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-xs backdrop-blur-sm">
                    {mediaIndex + 1} / {mediaList.length}
                </div>
            </div>

            {/* Right: Info Section (Bottom on mobile, Right on desktop) */}
            <div className="w-full md:w-1/2 h-full flex flex-col bg-white relative overflow-hidden">
                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-5 md:p-12 pb-32 md:pb-32 custom-scrollbar">
                    {/* Header Info */}
                    <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-4 ${selectedProduct.colorClass}`}>
                      {selectedProduct.element} • {selectedProduct.time}
                    </div>
                    
                    <h2 className="text-2xl md:text-4xl font-serif font-bold text-gray-800 mb-2">{selectedProduct.name}</h2>
                    <p className="text-base md:text-lg text-gray-500 italic mb-6">"{selectedProduct.slogan}"</p>

                    {/* Combo Selection */}
                    <div className="mb-6 border-b border-gray-100 pb-6">
                        <h3 className="font-bold text-brand mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
                            <Package size={18} /> Chọn gói ưu đãi
                        </h3>
                        <div className="space-y-3">
                            {/* Single */}
                            <label 
                                className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${selectedCombo === 'single' ? 'border-brand bg-brand-bg/20 shadow-sm' : 'border-gray-100 hover:bg-gray-50'}`}
                                onClick={() => handleComboChange('single', selectedProduct)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedCombo === 'single' ? 'border-brand' : 'border-gray-300'}`}>
                                        {selectedCombo === 'single' && <div className="w-3 h-3 bg-brand rounded-full"></div>}
                                    </div>
                                    <span className="font-medium text-gray-700 text-sm md:text-base">1 Hộp (Dùng thử)</span>
                                </div>
                                <span className="font-bold text-red-600">{selectedProduct.price.toLocaleString('vi-VN')}đ</span>
                            </label>

                            {/* Combo 2 */}
                            <label 
                                className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${selectedCombo === 'combo2' ? 'border-brand bg-brand-bg/20 shadow-sm' : 'border-gray-100 hover:bg-gray-50'}`}
                                onClick={() => handleComboChange('combo2', selectedProduct)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedCombo === 'combo2' ? 'border-brand' : 'border-gray-300'}`}>
                                        {selectedCombo === 'combo2' && <div className="w-3 h-3 bg-brand rounded-full"></div>}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-gray-700 text-sm md:text-base">Combo 2 Hộp</span>
                                            <span className="text-[10px] text-green-700 font-bold bg-green-100 px-1.5 py-0.5 rounded border border-green-200">Giảm 5%</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="block font-bold text-gray-800">{getPriceDetails(selectedProduct, 'combo2').price.toLocaleString('vi-VN')}đ</span>
                                    <span className="text-xs text-gray-400 line-through">{getPriceDetails(selectedProduct, 'combo2').original.toLocaleString('vi-VN')}đ</span>
                                </div>
                            </label>

                             {/* Combo 3 */}
                             <label 
                                className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${selectedCombo === 'combo3' ? 'border-brand bg-brand-bg/20 shadow-sm' : 'border-gray-100 hover:bg-gray-50'}`}
                                onClick={() => handleComboChange('combo3', selectedProduct)}
                             >
                                <div className="flex items-center gap-3">
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedCombo === 'combo3' ? 'border-brand' : 'border-gray-300'}`}>
                                        {selectedCombo === 'combo3' && <div className="w-3 h-3 bg-brand rounded-full"></div>}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-gray-700 text-sm md:text-base">Combo 3 Hộp</span>
                                            <span className="text-[10px] text-white font-bold bg-red-500 px-1.5 py-0.5 rounded shadow-sm">Giảm 10%</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="block font-bold text-gray-800">{getPriceDetails(selectedProduct, 'combo3').price.toLocaleString('vi-VN')}đ</span>
                                    <span className="text-xs text-gray-400 line-through">{getPriceDetails(selectedProduct, 'combo3').original.toLocaleString('vi-VN')}đ</span>
                                </div>
                            </label>
                        </div>
                    </div>
                    
                    {/* Benefits & Description */}
                    <div className="mb-8">
                        <p className="text-gray-600 mb-4 leading-relaxed">{selectedProduct.description}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {selectedProduct.ingredients.map((ing, idx) => (
                            <span key={idx} className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md text-xs font-medium border border-gray-200">
                              {ing}
                            </span>
                          ))}
                        </div>
                        
                        <ul className="space-y-2 bg-brand-bg/30 p-4 rounded-xl">
                          {selectedProduct.benefits.map((benefit, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-gray-700 text-sm">
                              <Check size={16} className="text-brand-accent shrink-0 mt-0.5" />
                              <span>{benefit}</span>
                            </li>
                          ))}
                        </ul>
                    </div>
                </div>

                {/* Sticky Footer */}
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-white border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-20 flex flex-col md:flex-row items-center gap-3">
                     <div className="w-full md:w-auto flex justify-between md:block md:mr-auto">
                        <span className="text-xs text-gray-500 block md:hidden">Tổng cộng:</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-brand">{getPriceDetails(selectedProduct, selectedCombo).price.toLocaleString('vi-VN')}đ</span>
                            {selectedCombo !== 'single' && (
                                <span className="text-sm text-gray-400 line-through">{getPriceDetails(selectedProduct, selectedCombo).original.toLocaleString('vi-VN')}đ</span>
                            )}
                        </div>
                     </div>
                     <button 
                        onClick={handleAddToCart}
                        className="w-full md:w-auto md:min-w-[200px] bg-brand hover:bg-brand-accent text-white py-3.5 rounded-full font-bold text-lg transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
                     >
                        <ShoppingBag size={20} /> 
                        Thêm Vào Giỏ
                     </button>
                </div>
            </div>
        </div>
    </>
)}
    </section>
  );
};