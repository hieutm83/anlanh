import React, { useState, useRef, useEffect } from 'react';
import { X, Trash2, ShoppingBag, Truck, MapPin, AlertCircle, Loader2, Camera, Tag, Ticket, Zap, Check, Lock, Info, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import { CartItem, OrderForm } from '../types';

// --- CẤU HÌNH API ---
const GOOGLE_SHEET_API_URL: string = "https://script.google.com/macros/s/AKfycbzCzJ2SQ3iPmiJZNKg5k6Ti_9Y6EI79bLmVyhhQmBkPbSfFVga2f4hva_3-_2H-7h3k/exec";

interface Voucher {
  code: string;
  type: 'shipping' | 'discount';
  value: number;
  minCondition: number; 
  description: string;
}

// Interface giá sản phẩm
interface ProductPrice {
    id: string;
    originalPrice: number;
    salePrice: number;
    combo2Price: number;
    combo3Price: number;
    combo3Label: string;
}

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onClearCart: () => void;
}

const NORTHERN_KEYWORDS = ["hà nội", "ha noi", "hải phòng", "hai phong", "quảng ninh", "quang ninh", "hải dương", "hai duong", "bắc ninh", "bac ninh", "thái nguyên", "thai nguyen", "nam định", "nam dinh", "thái bình", "thai binh", "hưng yên", "hung yen", "vĩnh phúc", "vinh phuc", "phú thọ", "phu tho", "bắc giang", "bac giang", "hòa bình", "hoa binh", "hà nam", "ha nam", "yên bái", "yen bai", "tuyên quang", "lào cai", "lao cai", "điện biên", "dien bien", "lai châu", "lai chau", "sơn la", "son la", "hà giang", "ha giang", "cao bằng", "cao bang", "bắc kạn", "bac kan", "lạng sơn", "lang son", "ninh bình", "ninh binh"];

function setCookie(name: string, value: string, days: number) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

export const CartSidebar: React.FC<CartProps> = ({ isOpen, onClose, cart, onRemove, onUpdateQuantity, onClearCart }) => {
  // Fix lỗi cuộn trang
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const [formData, setFormData] = useState<OrderForm>({ fullName: '', phone: '', address: '', note: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [successOrderId, setSuccessOrderId] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  // Thêm state lưu bảng giá
  const [productPrices, setProductPrices] = useState<Record<string, ProductPrice>>({}); 
  const [isLoadingData, setIsLoadingData] = useState(false);

  const [voucherCodeInput, setVoucherCodeInput] = useState('');
  const [appliedDiscountVoucher, setAppliedDiscountVoucher] = useState<Voucher | null>(null);
  const [appliedShippingVoucher, setAppliedShippingVoucher] = useState<Voucher | null>(null);
  const [manualVoucherError, setManualVoucherError] = useState<string | null>(null);

  const [isCapturing, setIsCapturing] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  // FETCH DỮ LIỆU (Voucher + Products)
  useEffect(() => {
      const fetchData = async () => {
          setIsLoadingData(true);
          try {
              // 1. Lấy Voucher
              const voucherRes = await fetch(`${GOOGLE_SHEET_API_URL}?action=get_vouchers`);
              const voucherJson = await voucherRes.json();
              if (voucherJson.success && Array.isArray(voucherJson.data)) {
                  setVouchers(voucherJson.data);
              }

              // 2. Lấy Bảng Giá Sản Phẩm (để tính tiền cho đúng)
              const productRes = await fetch(`${GOOGLE_SHEET_API_URL}?action=get_products`);
              const productJson = await productRes.json();
              if (productJson.success && Array.isArray(productJson.data)) {
                  const map: Record<string, ProductPrice> = {};
                  productJson.data.forEach((p: ProductPrice) => {
                      map[p.id] = p;
                  });
                  setProductPrices(map);
              }

          } catch (e) {
              console.error("Lỗi tải dữ liệu:", e);
          } finally {
              setIsLoadingData(false);
          }
      };
      
      if (isOpen) fetchData();
  }, [isOpen]);

  const isNorthernLocation = (address: string) => {
      if (!address) return false;
      return NORTHERN_KEYWORDS.some(kw => address.toLowerCase().includes(kw));
  };

  const calculateTotalBoxes = (cartItems: CartItem[]) => {
      return cartItems.reduce((sum, item) => {
          let multiplier = 1;
          if (item.variantName?.includes('Combo 2')) multiplier = 2;
          else if (item.variantName?.includes('Combo 3')) multiplier = 3;
          return sum + (item.quantity * multiplier);
      }, 0);
  };

  // --- LOGIC TÍNH GIÁ CHUẨN XÁC TỪ GOOGLE SHEET ---
  const calculateItemTotal = (item: CartItem) => {
    // Lấy thông tin giá chuẩn từ Sheet (nếu đã tải xong)
    const priceInfo = productPrices[item.id];
    const qty = item.quantity;
    
    // Nếu là phân loại "1 Hộp" (hoặc tên có chữ "1 Hộp") VÀ có dữ liệu giá từ Sheet
    if (item.variantName?.includes('1 Hộp') && priceInfo) {
        let total = 0;
        
        // Logic 1: Mua 1 -> Giá lẻ
        if (qty === 1) {
            total = priceInfo.salePrice;
        } 
        // Logic 2: Mua 2 -> Giá Combo 2
        else if (qty === 2) {
            total = priceInfo.combo2Price || (priceInfo.salePrice * 2);
        }
        // Logic 3: Mua 3 -> Giá Combo 3
        else if (qty === 3) {
            total = priceInfo.combo3Price || (priceInfo.salePrice * 3);
        }
        // Logic 4: Mua > 3 -> Giá Combo 3 + (Số lượng thừa * Giá lẻ)
        else {
            const combo3 = priceInfo.combo3Price || (priceInfo.salePrice * 3);
            const extra = qty - 3;
            total = combo3 + (extra * priceInfo.salePrice);
        }
        
        return { total: total, discount: 0 };
    }

    // Trường hợp còn lại: Combo 2, Combo 3 hoặc chưa tải được giá Sheet -> Nhân đơn giá thường
    // (Lưu ý: Bên Products.tsx đã truyền giá trọn gói của set vào item.price)
    return { total: item.price * qty, discount: 0 };
  };

  const subtotal = Math.round(cart.reduce((sum, item) => sum + calculateItemTotal(item).total, 0));
  const totalBoxes = calculateTotalBoxes(cart);
  const baseShippingFee = isNorthernLocation(formData.address) ? 15000 : 20000;

  // --- LOGIC VOUCHER ---
  useEffect(() => {
    if (cart.length === 0 || vouchers.length === 0) {
        setAppliedDiscountVoucher(null);
        setAppliedShippingVoucher(null);
        return;
    }

    const shippingCandidates = vouchers.filter(v => {
        if (v.type !== 'shipping') return false;
        if (v.minCondition > 1000) return subtotal >= v.minCondition;
        return totalBoxes >= v.minCondition;
    }).sort((a, b) => b.value - a.value);

    setAppliedShippingVoucher(shippingCandidates.length > 0 ? shippingCandidates[0] : null);

    const discountCandidates = vouchers.filter(v => 
        v.type === 'discount' && subtotal >= v.minCondition
    ).sort((a, b) => b.value - a.value);

    setAppliedDiscountVoucher(discountCandidates.length > 0 ? discountCandidates[0] : null);

  }, [cart, subtotal, totalBoxes, formData.address, vouchers]);

  
  let shippingDiscountAmount = 0;
  if (appliedShippingVoucher) {
      shippingDiscountAmount = Math.min(baseShippingFee, appliedShippingVoucher.value); 
  }

  let productDiscountAmount = 0;
  if (appliedDiscountVoucher) {
      productDiscountAmount = appliedDiscountVoucher.value;
  }

  const finalShippingFee = Math.max(0, baseShippingFee - shippingDiscountAmount);
  const finalTotal = Math.max(0, subtotal + finalShippingFee - productDiscountAmount);

  // --- UI Helper ---
  const getVoucherStatus = (voucher: Voucher) => {
      if (voucher.type === 'shipping') {
          const isMonetary = voucher.minCondition > 1000;
          if (isMonetary) {
              const eligible = subtotal >= voucher.minCondition;
              return { eligible, missingText: eligible ? '' : `Mua thêm ${(voucher.minCondition - subtotal).toLocaleString('vi-VN')}đ`, progress: eligible ? 100 : (subtotal / voucher.minCondition) * 100 };
          }
          const eligible = totalBoxes >= voucher.minCondition;
          return { eligible, missingText: eligible ? '' : `Mua thêm ${voucher.minCondition - totalBoxes} hộp`, progress: eligible ? 100 : (totalBoxes / voucher.minCondition) * 100 };
      }
      const eligible = subtotal >= voucher.minCondition;
      return { eligible, missingText: eligible ? '' : `Mua thêm ${(voucher.minCondition - subtotal).toLocaleString('vi-VN')}đ`, progress: eligible ? 100 : (subtotal / voucher.minCondition) * 100 };
  };

  const handleManualApply = () => {
    const code = voucherCodeInput.trim().toUpperCase();
    if(!code) return;
    const found = vouchers.find(v => v.code === code);
    if (!found) { setManualVoucherError("Mã không tồn tại."); return; }
    const status = getVoucherStatus(found);
    if (!status.eligible) { setManualVoucherError(`Chưa đủ điều kiện: ${status.missingText}`); return; }
    if (found.type === 'shipping') setAppliedShippingVoucher(found);
    else setAppliedDiscountVoucher(found);
    setVoucherCodeInput('');
    setManualVoucherError(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'fullName') setFormData(prev => ({ ...prev, [name]: value.replace(/[0-9!@#$%^&*()_+={}\[\]|\\:;"'<>,.?/]/g, '') }));
    else if (name === 'phone') setFormData(prev => ({ ...prev, [name]: value.replace(/\D/g, '').slice(0, 12) }));
    else setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    const rawPhone = formData.phone.replace(/\s/g, '');
    if (!/^0\d{9}$/.test(rawPhone)) { setError('Số điện thoại không hợp lệ (cần 10 số, bắt đầu bằng 0).'); return; }

    setIsSubmitting(true);
    const newOrderId = `ORD-${Date.now().toString().slice(-6)}`;
    const orderItems = cart.map(item => ({
        id: item.id,
        name: item.name,
        variant: item.variantName || '1 Hộp',
        price: item.price,
        quantity: item.quantity,
        subtotal: calculateItemTotal(item).total // Sử dụng giá đã tính toán chuẩn
    }));

    const voucherCodes = [];
    if (appliedShippingVoucher) voucherCodes.push(appliedShippingVoucher.code);
    if (appliedDiscountVoucher) voucherCodes.push(appliedDiscountVoucher.code);

    const orderPayload = {
        orderId: newOrderId,
        customer: { ...formData, phone: rawPhone, userAgent: navigator.userAgent },
        items: orderItems,
        totalAmount: finalTotal,
        subtotal: subtotal,
        shippingFee: finalShippingFee,
        discount: productDiscountAmount + shippingDiscountAmount,
        voucher: voucherCodes.join(', '),
        status: 'pending',
        createdAt: new Date().toISOString()
    };

    try {
        await fetch(GOOGLE_SHEET_API_URL, {
            method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderPayload)
        });
        setCookie('last_order_id', newOrderId, 7);
        
        // Save Local
        const savedOrders = JSON.parse(localStorage.getItem('anlanh_local_orders') || '[]');
        savedOrders.unshift({
             id: newOrderId, status: 'pending', statusText: 'Đang xử lý',
             customerName: formData.fullName, phone: rawPhone, total: finalTotal,
             createdAt: new Date().toLocaleDateString('vi-VN'),
             items: orderItems.map((i:any) => `${i.name} (${i.variant}) x${i.quantity}`)
        });
        localStorage.setItem('anlanh_local_orders', JSON.stringify(savedOrders));

        setSuccessOrderId(newOrderId);
        setOrderSuccess(true);
        onClearCart();
        setFormData({ fullName: '', phone: '', address: '', note: '' });
        setAppliedDiscountVoucher(null);
        setAppliedShippingVoucher(null);
    } catch (err) { console.error(err); setSuccessOrderId(newOrderId); setOrderSuccess(true); onClearCart(); } 
    finally { setIsSubmitting(false); }
  };

  const closeCart = () => { setOrderSuccess(false); setSuccessOrderId(''); setError(null); onClose(); };
  
  const handleAutoSaveAndClose = async () => {
      if (receiptRef.current) {
          setIsCapturing(true);
          try {
              await new Promise(resolve => setTimeout(resolve, 100));
              const canvas = await html2canvas(receiptRef.current, { scale: 2, backgroundColor: '#ffffff', logging: false });
              const link = document.createElement('a'); link.href = canvas.toDataURL("image/png"); link.download = `Don-hang-${successOrderId}.png`; link.click();
              setTimeout(() => { setIsCapturing(false); closeCart(); }, 800);
          } catch (e) { setIsCapturing(false); closeCart(); }
      } else { closeCart(); }
  };

  return (
    <>
      <div className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={closeCart} />
      <div className={`fixed top-0 right-0 h-[100dvh] w-full max-w-md bg-white z-[70] shadow-2xl transform transition-transform duration-300 ease-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-brand-bg shrink-0">
          <h2 className="text-xl font-serif font-bold text-brand flex items-center gap-2"><ShoppingBag size={20} /> Giỏ hàng ({cart.length})</h2>
          <button onClick={closeCart} className="p-2 hover:bg-white rounded-full transition-colors text-gray-500"><X size={24} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar overscroll-contain">
          {orderSuccess ? (
            <div className="h-full flex flex-col items-center justify-center text-center animate-in fade-in zoom-in">
               <div ref={receiptRef} className="w-full flex flex-col items-center p-6 bg-white rounded-xl">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-2 shadow-sm"><Truck size={40} /></div>
                  <h3 className="text-2xl font-serif font-bold text-gray-800">Đặt hàng thành công!</h3>
                  <p className="text-gray-500 max-w-xs mx-auto text-sm mb-4">Cảm ơn bạn đã tin chọn An Lành Farm.</p>
                  <div className="bg-gray-50 p-6 rounded-xl text-sm text-gray-600 w-full max-w-xs border border-gray-100 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand to-brand-accent"></div>
                      <p className="font-bold mb-2 text-gray-500 uppercase text-xs tracking-wider">Mã đơn hàng</p>
                      <p className="font-mono text-3xl font-bold text-brand mb-4">{successOrderId}</p>
                      <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-red-600 text-xs font-bold flex flex-col items-center gap-2"><div className="flex items-center gap-1"><Camera size={16} /> <span>LƯU Ý</span></div><p className="text-center font-normal">Mã đơn hàng sẽ được tự động lưu về máy khi bạn bấm nút bên dưới.</p></div>
                  </div>
              </div>
              <button onClick={handleAutoSaveAndClose} disabled={isCapturing} className="mt-2 bg-brand text-white px-8 py-3 rounded-full font-bold hover:bg-brand-accent transition-colors shadow-lg active:scale-95 flex items-center gap-2">
                {isCapturing ? <><Loader2 size={18} className="animate-spin" /> Đang lưu ảnh...</> : <><Download size={18} /> Lưu ảnh & Tiếp tục mua sắm</>}
              </button>
            </div>
          ) : cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-gray-400">
              <ShoppingBag size={64} className="opacity-20" />
              <p>Giỏ hàng của bạn đang trống</p>
              <button onClick={closeCart} className="text-brand font-medium hover:underline">Khám phá sản phẩm ngay</button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-4">
                {cart.map((item) => {
                  const { total: itemTotal } = calculateItemTotal(item);
                  return (
                    <div key={item.id} className="flex gap-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="w-20 h-20 bg-white rounded-lg overflow-hidden shrink-0 border border-gray-100">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <div>
                              <h4 className="font-bold text-gray-800 text-sm">{item.name}</h4>
                              <div className="flex flex-wrap gap-1 mt-1">
                                <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${item.variantName?.includes('Combo') ? 'text-brand-accent bg-green-50' : 'text-gray-500 bg-gray-100'}`}>
                                    {item.variantName}
                                </span>
                              </div>
                          </div>
                          <button onClick={() => onRemove(item.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                        </div>
                        <div className="flex justify-between items-end mt-2">
                          <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 px-2 py-1">
                              <button onClick={() => onUpdateQuantity(item.id, -1)} className="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-brand disabled:opacity-30" disabled={item.quantity <= 1}>-</button>
                              <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                              <button onClick={() => onUpdateQuantity(item.id, 1)} className="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-brand">+</button>
                          </div>
                          <div className="text-right">
                              <span className="font-bold text-brand text-sm">{itemTotal.toLocaleString('vi-VN')}đ</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

               <div className="border-t border-gray-100 pt-6">
                    <h3 className="font-serif font-bold text-sm mb-3 flex items-center gap-2 text-gray-700"><Ticket size={18} className="text-brand" /> Ưu đãi cho bạn</h3>
                    {isLoadingData ? (
                        <div className="text-center py-4 text-gray-400 text-xs flex justify-center items-center gap-2"><Loader2 size={16} className="animate-spin" /> Đang kiểm tra ưu đãi...</div>
                    ) : (
                        <>
                            <div className="mb-4">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Mã vận chuyển</p>
                                <div className="space-y-2">
                                    {vouchers.filter(v => v.type === 'shipping').map(voucher => {
                                        const status = getVoucherStatus(voucher);
                                        const isApplied = appliedShippingVoucher?.code === voucher.code;
                                        return (
                                            <div key={voucher.code} className={`relative border rounded-lg p-3 transition-all ${isApplied ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}`}>
                                                <div className="flex items-start gap-3">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isApplied ? 'bg-blue-200 text-blue-700' : 'bg-gray-100 text-gray-400'}`}><Truck size={20} /></div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between">
                                                            <h4 className={`font-bold text-sm ${isApplied ? 'text-blue-800' : 'text-gray-700'}`}>{voucher.code}</h4>
                                                            {isApplied && <Check size={18} className="text-blue-600" />}
                                                            {!status.eligible && <Lock size={16} className="text-gray-300" />}
                                                        </div>
                                                        <p className="text-xs text-gray-500 mt-0.5">{voucher.description}</p>
                                                        {!status.eligible && <p className="text-[10px] text-orange-600 font-medium mt-1 flex items-center gap-1"><Info size={10} /> {status.missingText}</p>}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                    {vouchers.filter(v => v.type === 'shipping').length === 0 && <p className="text-xs text-gray-400 italic">Không có mã vận chuyển.</p>}
                                </div>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Mã giảm giá</p>
                                <div className="space-y-2">
                                    {vouchers.filter(v => v.type === 'discount').map(voucher => {
                                        const status = getVoucherStatus(voucher);
                                        const isApplied = appliedDiscountVoucher?.code === voucher.code;
                                        return (
                                            <div key={voucher.code} className={`relative border rounded-lg p-3 transition-all ${isApplied ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
                                                <div className="flex items-start gap-3">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isApplied ? 'bg-green-200 text-green-700' : status.eligible ? 'bg-orange-50 text-orange-400' : 'bg-gray-100 text-gray-400'}`}><Zap size={20} /></div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2"><h4 className={`font-bold text-sm ${isApplied ? 'text-green-800' : 'text-gray-700'}`}>{voucher.code}</h4>{isApplied && <span className="text-[10px] bg-green-600 text-white px-1.5 rounded font-bold">Tốt nhất</span>}</div>
                                                            {isApplied && <Check size={18} className="text-green-600" />}
                                                            {!status.eligible && <Lock size={16} className="text-gray-300" />}
                                                        </div>
                                                        <p className="text-xs text-gray-500 mt-0.5">{voucher.description}</p>
                                                        {!status.eligible && <p className="text-[10px] text-orange-600 font-medium mt-1 flex items-center gap-1"><Info size={10} /> {status.missingText}</p>}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                    {vouchers.filter(v => v.type === 'discount').length === 0 && <p className="text-xs text-gray-400 italic">Không có mã giảm giá.</p>}
                                </div>
                            </div>
                        </>
                    )}
                    <div className="mt-4 flex gap-2"><input type="text" placeholder="Nhập mã khác..." value={voucherCodeInput} onChange={(e) => { setVoucherCodeInput(e.target.value); setManualVoucherError(null); }} className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:border-brand outline-none text-xs" /><button onClick={handleManualApply} disabled={!voucherCodeInput.trim()} className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-200 disabled:opacity-50">Áp dụng</button></div>
                    {manualVoucherError && <p className="text-red-500 text-[10px] mt-1">{manualVoucherError}</p>}
               </div>

              <div className="border-t border-gray-100 pt-6">
                <h3 className="font-serif font-bold text-lg mb-4 flex items-center gap-2"><MapPin size={18} className="text-brand" /> Thông tin giao hàng</h3>
                {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-start gap-2 mb-4 border border-red-100 animate-in fade-in slide-in-from-top-1"><AlertCircle size={16} className="shrink-0 mt-0.5" /><span>{error}</span></div>}
                <form id="order-form" onSubmit={handleSubmit} className="space-y-4">
                  <div><input type="text" name="fullName" required placeholder="Họ và tên" value={formData.fullName} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all text-sm" /></div>
                  <div><input type="tel" name="phone" required inputMode="numeric" maxLength={12} placeholder="Số điện thoại" value={formData.phone} onFocus={() => { if (!formData.phone) setFormData(prev => ({ ...prev, phone: '0' })); }} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all text-sm" /></div>
                  <div><input type="text" name="address" required placeholder="Địa chỉ nhận hàng (Số nhà, Phường/Xã, Quận/Huyện, Tỉnh/Thành...)" value={formData.address} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all text-sm" /></div>
                  <div><textarea name="note" rows={2} placeholder="Ghi chú (nếu có)" value={formData.note} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all text-sm resize-none"></textarea></div>
                </form>
              </div>
            </div>
          )}
        </div>

        {!orderSuccess && cart.length > 0 && (
          <div className="p-5 border-t border-gray-100 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] shrink-0">
            <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between items-center text-gray-500"><span>Tạm tính:</span><span>{subtotal.toLocaleString('vi-VN')}đ</span></div>
                <div className="flex justify-between items-center text-gray-500"><span>Phí vận chuyển:</span><div className="text-right">{finalShippingFee === 0 && baseShippingFee > 0 ? <><span className="text-xs text-gray-400 line-through mr-1">{baseShippingFee.toLocaleString('vi-VN')}đ</span><span className="text-green-600 font-medium">Miễn phí</span></> : <span>{baseShippingFee.toLocaleString('vi-VN')}đ</span>}</div></div>
                {productDiscountAmount > 0 && (<div className="flex justify-between items-center text-green-600"><span className="flex items-center gap-1"><Ticket size={14}/> Voucher giảm giá:</span><span>-{productDiscountAmount.toLocaleString('vi-VN')}đ</span></div>)}
                <div className="flex justify-between items-center text-base pt-2 border-t border-dashed border-gray-200"><span className="font-bold text-gray-800">Tổng thanh toán:</span><span className="text-2xl font-bold text-brand">{finalTotal.toLocaleString('vi-VN')}đ</span></div>
            </div>
            <button type="submit" form="order-form" disabled={isSubmitting} className={`w-full py-4 rounded-full font-bold text-white transition-all shadow-lg flex items-center justify-center gap-2 ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-brand hover:bg-brand-accent active:scale-95'}`}>{isSubmitting ? <><Loader2 size={20} className="animate-spin" /> Đang xử lý...</> : 'Đặt Hàng Ngay'}</button>
            <p className="text-center text-xs text-gray-400 mt-3">Thanh toán khi nhận hàng (COD)</p>
          </div>
        )}
      </div>
    </>
  );
};
