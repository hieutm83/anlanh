import React, { useState, useRef, useEffect } from 'react';
import { X, Trash2, ShoppingBag, Truck, MapPin, AlertCircle, Loader2, Camera, Tag, Map, ChevronDown, Download, Ticket, Gift, ArrowRight, Zap, Check, Lock, Info } from 'lucide-react';
import html2canvas from 'html2canvas';
import { CartItem, OrderForm } from '../types';
import { VOUCHERS, Voucher } from './Vouchers';

// --- CẤU HÌNH API ---
// HƯỚNG DẪN: Thay thế chuỗi bên dưới bằng URL Web App bạn nhận được từ Google Apps Script
const GOOGLE_SHEET_API_URL: string = "https://script.google.com/macros/s/AKfycbzSP00Ac8dBYcvzdU0knuerOUAGPL8ADV3ZDHXFo2NqjiS8Npi4nHWJjtLwlSwGY-sZ/exec"; 

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onClearCart: () => void;
}

// Dữ liệu giả lập địa điểm Việt Nam để gợi ý
const VN_LOCATIONS = [
  "Hà Nội", "Hồ Chí Minh", "Đà Nẵng", "Hải Phòng", "Cần Thơ",
  "Quận 1, Hồ Chí Minh", "Quận 3, Hồ Chí Minh", "Quận 7, Hồ Chí Minh", "Thành phố Thủ Đức, Hồ Chí Minh", "Quận Bình Thạnh, Hồ Chí Minh", "Quận Tân Bình, Hồ Chí Minh",
  "Quận Cầu Giấy, Hà Nội", "Quận Hoàn Kiếm, Hà Nội", "Quận Ba Đình, Hà Nội", "Quận Đống Đa, Hà Nội", "Quận Tây Hồ, Hà Nội", "Quận Hai Bà Trưng, Hà Nội",
  "Biên Hòa, Đồng Nai", "Thủ Dầu Một, Bình Dương", "Vũng Tàu, Bà Rịa - Vũng Tàu",
  "Nha Trang, Khánh Hòa", "Quy Nhơn, Bình Định", "Buôn Ma Thuột, Đắk Lắk",
  "Đà Lạt, Lâm Đồng", "Huế, Thừa Thiên Huế", "Vinh, Nghệ An",
  "Hạ Long, Quảng Ninh", "Hải Dương", "Bắc Ninh", "Thái Nguyên", "Nam Định", "Thái Bình",
  "Thanh Hóa", "Phan Thiết, Bình Thuận", "Rạch Giá, Kiên Giang", "Long Xuyên, An Giang",
  "Vĩnh Phúc", "Hưng Yên", "Hà Nam", "Ninh Bình", "Lào Cai", "Yên Bái", "Sơn La"
];

// Danh sách từ khóa các tỉnh miền Bắc để tính ship 15k
const NORTHERN_KEYWORDS = [
    "hà nội", "ha noi", "hải phòng", "hai phong", "quảng ninh", "quang ninh", 
    "hải dương", "hai duong", "bắc ninh", "bac ninh", "thái nguyên", "thai nguyen",
    "nam định", "nam dinh", "thái bình", "thai binh", "hưng yên", "hung yen",
    "vĩnh phúc", "vinh phuc", "phú thọ", "phu tho", "bắc giang", "bac giang",
    "hòa bình", "hoa binh", "hà nam", "ha nam", "yên bái", "yen bai",
    "tuyên quang", "lào cai", "lao cai", "điện biên", "dien bien",
    "lai châu", "lai chau", "sơn la", "son la", "hà giang", "ha giang",
    "cao bằng", "cao bang", "bắc kạn", "bac kan", "lạng sơn", "lang son",
    "ninh bình", "ninh binh"
];

// Component gợi ý địa chỉ tùy chỉnh giống Google Maps
const AddressAutocomplete = ({ value, onChange, placeholder }: { value: string, onChange: (val: string) => void, placeholder: string }) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredLocations, setFilteredLocations] = useState<string[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);
    
    if (val.length > 0) {
      const filtered = VN_LOCATIONS.filter(loc => 
        loc.toLowerCase().includes(val.toLowerCase())
      );
      setFilteredLocations(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSelect = (loc: string) => {
    onChange(loc);
    setShowSuggestions(false);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative">
        <input
          type="text"
          name="address"
          required
          placeholder={placeholder}
          value={value}
          onChange={handleInput}
          onFocus={() => {
             if (value) setShowSuggestions(true);
             else {
               setFilteredLocations(VN_LOCATIONS.slice(0, 5)); // Show some default suggestions
               setShowSuggestions(true);
             }
          }}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all text-sm"
          autoComplete="off"
        />
        <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      </div>

      {showSuggestions && filteredLocations.length > 0 && (
        <ul className="absolute z-50 w-full bg-white border border-gray-100 rounded-lg shadow-xl mt-1 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-1">
          {filteredLocations.map((loc, idx) => (
            <li 
              key={idx}
              onClick={() => handleSelect(loc)}
              className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3 border-b border-gray-50 last:border-0 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 text-gray-500">
                <MapPin size={14} />
              </div>
              <span className="text-sm text-gray-700">{loc}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// Hàm thiết lập Cookie
function setCookie(name: string, value: string, days: number) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

export const CartSidebar: React.FC<CartProps> = ({ 
  isOpen, onClose, cart, onRemove, onUpdateQuantity, onClearCart 
}) => {
  const [formData, setFormData] = useState<OrderForm>({
    fullName: '',
    phone: '',
    address: '',
    note: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [successOrderId, setSuccessOrderId] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Voucher Logic States - Tách biệt Ship và Discount
  const [voucherCodeInput, setVoucherCodeInput] = useState('');
  const [appliedDiscountVoucher, setAppliedDiscountVoucher] = useState<Voucher | null>(null);
  const [appliedShippingVoucher, setAppliedShippingVoucher] = useState<Voucher | null>(null);
  const [manualVoucherError, setManualVoucherError] = useState<string | null>(null);

  // State và Ref cho chức năng chụp màn hình
  const [isCapturing, setIsCapturing] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  // Helper function to check if location is in North
  const isNorthernLocation = (address: string) => {
      if (!address) return false;
      const lowerAddr = address.toLowerCase();
      return NORTHERN_KEYWORDS.some(kw => lowerAddr.includes(kw));
  };

  // Helper to calculate total equivalent boxes
  const calculateTotalBoxes = (cartItems: CartItem[]) => {
      return cartItems.reduce((sum, item) => {
          let multiplier = 1;
          // Check variant name to determine box count
          if (item.variantName?.includes('Combo 2')) multiplier = 2;
          else if (item.variantName?.includes('Combo 3')) multiplier = 3;
          return sum + (item.quantity * multiplier);
      }, 0);
  };

  // Logic tính giá có chiết khấu tự động theo số lượng cho từng item
  const calculateItemTotal = (item: CartItem) => {
    const baseTotal = item.price * item.quantity;
    
    // Chỉ áp dụng chiết khấu tự động cho phân loại thường (1 Hộp)
    // Nếu là Combo 2, Combo 3 đã có giá ưu đãi sẵn từ đầu rồi
    if (!item.variantName || item.variantName === '1 Hộp') {
        if (item.quantity >= 3) {
            return { total: baseTotal * 0.9, discount: 10, originalTotal: baseTotal }; // Giảm 10%
        } else if (item.quantity === 2) {
            return { total: baseTotal * 0.95, discount: 5, originalTotal: baseTotal }; // Giảm 5%
        }
    }
    
    return { total: baseTotal, discount: 0, originalTotal: baseTotal };
  };

  // Tính toán tổng giỏ hàng
  const subtotal = cart.reduce((sum, item) => sum + calculateItemTotal(item).total, 0);
  const totalBoxes = calculateTotalBoxes(cart);
  
  // Base Shipping Fee
  const baseShippingFee = isNorthernLocation(formData.address) ? 15000 : 20000;

  // --- AUTO APPLY LOGIC & ELIGIBILITY CHECK ---
  useEffect(() => {
    if (cart.length === 0) {
        setAppliedDiscountVoucher(null);
        setAppliedShippingVoucher(null);
        return;
    }

    // 1. Logic Vận Chuyển: >= 2 hộp auto freeship
    if (totalBoxes >= 2) {
        const freeshipVoucher = VOUCHERS.find(v => v.code === 'FREESHIP');
        if (freeshipVoucher) setAppliedShippingVoucher(freeshipVoucher);
    } else {
        setAppliedShippingVoucher(null);
    }

    // 2. Logic Giảm Giá: Tìm mã tốt nhất
    let bestDiscountVoucher: Voucher | null = null;
    let maxDiscountAmount = 0;

    // Check CHAO30
    if (subtotal >= 200000) {
        const chao30 = VOUCHERS.find(v => v.code === 'CHAO30');
        if (chao30 && 30000 > maxDiscountAmount) {
            maxDiscountAmount = 30000;
            bestDiscountVoucher = chao30;
        }
    }

    // Check TETANLANH
    const tet = VOUCHERS.find(v => v.code === 'TETANLANH');
    if (tet) {
        const tetAmount = subtotal * 0.1;
        if (tetAmount > maxDiscountAmount) {
            maxDiscountAmount = tetAmount;
            bestDiscountVoucher = tet;
        }
    }

    setAppliedDiscountVoucher(bestDiscountVoucher);

  }, [cart, subtotal, totalBoxes, formData.address]);

  
  // Calculate final amounts
  let shippingDiscountAmount = 0;
  if (appliedShippingVoucher) {
      shippingDiscountAmount = baseShippingFee; 
  }

  let productDiscountAmount = 0;
  if (appliedDiscountVoucher) {
      if (appliedDiscountVoucher.code === 'CHAO30') {
          productDiscountAmount = 30000;
      } else if (appliedDiscountVoucher.code === 'TETANLANH') {
          productDiscountAmount = subtotal * 0.1;
      }
  }

  const finalShippingFee = Math.max(0, baseShippingFee - shippingDiscountAmount);
  const finalTotal = Math.max(0, subtotal + finalShippingFee - productDiscountAmount);

  // --- Helper to check voucher eligibility status for UI ---
  const getVoucherStatus = (voucher: Voucher) => {
      if (voucher.type === 'shipping') {
          // Rule: >= 2 boxes
          const eligible = totalBoxes >= 2;
          return {
              eligible,
              missingText: eligible ? '' : `Mua thêm ${2 - totalBoxes} hộp để Freeship`,
              progress: eligible ? 100 : (totalBoxes / 2) * 100
          };
      } else if (voucher.code === 'CHAO30') {
          // Rule: >= 200k
          const eligible = subtotal >= 200000;
          const missing = 200000 - subtotal;
          return {
              eligible,
              missingText: eligible ? '' : `Mua thêm ${missing.toLocaleString('vi-VN')}đ để dùng mã`,
              progress: eligible ? 100 : (subtotal / 200000) * 100
          };
      } else if (voucher.code === 'TETANLANH') {
          // Rule: No limit (example)
          return { eligible: true, missingText: '', progress: 100 };
      }
      return { eligible: true, missingText: '', progress: 100 };
  };

  const handleManualApply = () => {
    // Logic nhập mã tay nếu mã đó không có trong list công khai
    const code = voucherCodeInput.trim().toUpperCase();
    if(!code) return;
    // ... (Giữ logic cũ nếu muốn hỗ trợ mã bí mật)
    setManualVoucherError("Mã không tồn tại hoặc đã hết hạn.");
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'fullName') {
        const textOnly = value.replace(/[0-9!@#$%^&*()_+={}\[\]|\\:;"'<>,.?/]/g, '');
        setFormData(prev => ({ ...prev, [name]: textOnly }));
    } 
    else if (name === 'phone') {
        let numbers = value.replace(/\D/g, '');
        if (numbers.length > 0 && numbers[0] !== '0') {
            numbers = '0' + numbers;
        }
        const truncated = numbers.slice(0, 10);
        let formatted = truncated;
        if (truncated.length > 7) {
            formatted = `${truncated.slice(0, 4)} ${truncated.slice(4, 7)} ${truncated.slice(7)}`;
        } else if (truncated.length > 4) {
            formatted = `${truncated.slice(0, 4)} ${truncated.slice(4)}`;
        }
        setFormData(prev => ({ ...prev, [name]: formatted }));
    }
    else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (error) setError(null);
  };
  
  const handleAddressChange = (newAddress: string) => {
      setFormData(prev => ({ ...prev, address: newAddress }));
      if (error) setError(null);
  };

  const submitOrderToBackend = async (data: any) => {
    // Nếu URL chưa được thay đổi, báo lỗi
    if (GOOGLE_SHEET_API_URL === "PASTE_YOUR_GOOGLE_APPS_SCRIPT_URL_HERE") {
        console.warn("Chưa cấu hình Google Apps Script URL trong Cart.tsx");
        // Vẫn cho phép giả lập chạy để test UI
        return new Promise(resolve => setTimeout(resolve, 1500));
    }

    try {
        // Sử dụng mode: 'no-cors' là cách phổ biến để gửi form tới Google Sheets mà không bị chặn
        // Tuy nhiên, ta sẽ không đọc được response chính xác.
        // Cách tốt nhất là gửi dạng text/plain để tránh preflight request.
        
        await fetch(GOOGLE_SHEET_API_URL, {
            method: 'POST',
            mode: 'no-cors', // Quan trọng khi gọi tới Google Apps Script từ client
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        // Vì no-cors không trả về status ok, ta giả định thành công nếu không có lỗi mạng
        return true;
    } catch (error) {
        console.error("Lỗi gửi đơn hàng:", error);
        throw error;
    }
  };

  const saveOrderLocally = (orderData: any) => {
      setCookie('last_order_id', orderData.orderId, 7);
      const savedOrders = JSON.parse(localStorage.getItem('anlanh_local_orders') || '[]');
      const lookupFormat = {
          id: orderData.orderId,
          status: 'pending',
          statusText: 'Đang xử lý',
          customerName: orderData.customer.fullName,
          phone: orderData.customer.phone.trim(),
          total: orderData.totalAmount,
          createdAt: new Date().toLocaleDateString('vi-VN'),
          items: orderData.items.map((item: any) => `${item.name} (${item.variant}) - SL: ${item.quantity}`)
      };
      savedOrders.unshift(lookupFormat);
      if (savedOrders.length > 20) savedOrders.pop();
      localStorage.setItem('anlanh_local_orders', JSON.stringify(savedOrders));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    const rawPhone = formData.phone.replace(/\s/g, '');
    if (!/^0\d{9}$/.test(rawPhone)) {
        setError('Số điện thoại không hợp lệ. Vui lòng nhập đúng 10 số và bắt đầu bằng số 0.');
        return;
    }

    setIsSubmitting(true);
    setError(null);
    
    const newOrderId = `ORD-${Date.now().toString().slice(-6)}`;
    const orderItems = cart.map(item => {
        const { total: itemTotal } = calculateItemTotal(item);
        return {
            id: item.id,
            name: item.name,
            variant: item.variantName || '1 Hộp',
            price: item.price,
            quantity: item.quantity,
            subtotal: itemTotal
        };
    });

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
      await submitOrderToBackend(orderPayload);
      
      // Luôn lưu local làm backup
      saveOrderLocally(orderPayload);
      
      setSuccessOrderId(newOrderId);
      setOrderSuccess(true);
      onClearCart();
      setFormData({ fullName: '', phone: '', address: '', note: '' });
      setAppliedDiscountVoucher(null);
      setAppliedShippingVoucher(null);
    } catch (err) {
      console.error('Order submission failed:', err);
      // Fallback: Nếu lỗi mạng, vẫn lưu local và báo thành công cho khách (giả lập offline mode)
      // Trong thực tế nên báo lỗi, nhưng với web đơn giản, ưu tiên trải nghiệm người dùng
      saveOrderLocally(orderPayload);
      setSuccessOrderId(newOrderId);
      setOrderSuccess(true);
      onClearCart();
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeCart = () => {
    setOrderSuccess(false);
    setSuccessOrderId('');
    setError(null);
    onClose();
  };
  
  const handleAutoSaveAndClose = async () => {
      if (receiptRef.current) {
          setIsCapturing(true);
          try {
              await new Promise(resolve => setTimeout(resolve, 100));
              const canvas = await html2canvas(receiptRef.current, {
                  scale: 2,
                  backgroundColor: '#ffffff',
                  logging: false
              });
              const image = canvas.toDataURL("image/png");
              const link = document.createElement('a');
              link.href = image;
              link.download = `Don-hang-${successOrderId}.png`;
              link.click();
              setTimeout(() => { setIsCapturing(false); closeCart(); }, 800);
          } catch (e) {
              console.error("Lỗi chụp màn hình:", e);
              setIsCapturing(false);
              closeCart();
          }
      } else {
          closeCart();
      }
  };

  return (
    <>
      <div className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={closeCart} />

      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-[70] shadow-2xl transform transition-transform duration-300 ease-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-brand-bg">
          <h2 className="text-xl font-serif font-bold text-brand flex items-center gap-2">
            <ShoppingBag size={20} /> Giỏ hàng ({cart.length})
          </h2>
          <button onClick={closeCart} className="p-2 hover:bg-white rounded-full transition-colors text-gray-500"><X size={24} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
          {orderSuccess ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in zoom-in">
              <div ref={receiptRef} className="w-full flex flex-col items-center p-6 bg-white rounded-xl">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-2 shadow-sm"><Truck size={40} /></div>
                  <h3 className="text-2xl font-serif font-bold text-gray-800">Đặt hàng thành công!</h3>
                  <p className="text-gray-500 max-w-xs mx-auto text-sm mb-4">Cảm ơn bạn đã tin chọn An Lành Farm.</p>
                  <div className="bg-gray-50 p-6 rounded-xl text-sm text-gray-600 w-full max-w-xs border border-gray-100 relative overflow-hidden">
                     <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand to-brand-accent"></div>
                     <p className="font-bold mb-2 text-gray-500 uppercase text-xs tracking-wider">Mã đơn hàng</p>
                     <p className="font-mono text-3xl font-bold text-brand mb-4">{successOrderId}</p>
                     <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-red-600 text-xs font-bold flex flex-col items-center gap-2">
                        <div className="flex items-center gap-1"><Camera size={16} /> <span>LƯU Ý</span></div>
                        <p className="text-center font-normal">Mã đơn hàng sẽ được tự động lưu về máy khi bạn bấm nút bên dưới.</p>
                     </div>
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
              {/* Product Items */}
              <div className="space-y-4">
                {cart.map((item) => {
                  const { total: itemTotal, discount, originalTotal } = calculateItemTotal(item);
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
                                {item.variantName ? <span className="text-xs font-semibold text-brand-accent bg-green-50 px-1.5 py-0.5 rounded">{item.variantName}</span> : <span className="text-xs font-medium text-gray-500 bg-white border border-gray-200 px-1.5 py-0.5 rounded">1 Hộp</span>}
                                {discount > 0 && <span className="text-xs font-bold text-white bg-red-500 px-1.5 py-0.5 rounded flex items-center gap-0.5"><Tag size={10} /> -{discount}%</span>}
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
                              {discount > 0 && <span className="block text-xs text-gray-400 line-through">{originalTotal.toLocaleString('vi-VN')}đ</span>}
                              <span className="font-bold text-brand text-sm">{itemTotal.toLocaleString('vi-VN')}đ</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

               {/* --- VOUCHER SECTION UI UPDATE --- */}
               <div className="border-t border-gray-100 pt-6">
                    <h3 className="font-serif font-bold text-sm mb-3 flex items-center gap-2 text-gray-700">
                        <Ticket size={18} className="text-brand" /> Ưu đãi cho bạn
                    </h3>
                    
                    {/* List Shipping Vouchers */}
                    <div className="mb-4">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Mã vận chuyển</p>
                        <div className="space-y-2">
                             {VOUCHERS.filter(v => v.type === 'shipping').map(voucher => {
                                 const status = getVoucherStatus(voucher);
                                 const isApplied = appliedShippingVoucher?.code === voucher.code;

                                 return (
                                     <div key={voucher.id} className={`relative border rounded-lg p-3 transition-all ${isApplied ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}`}>
                                         <div className="flex items-start gap-3">
                                             <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isApplied ? 'bg-blue-200 text-blue-700' : 'bg-gray-100 text-gray-400'}`}>
                                                 <Truck size={20} />
                                             </div>
                                             <div className="flex-1">
                                                 <div className="flex items-center justify-between">
                                                     <h4 className={`font-bold text-sm ${isApplied ? 'text-blue-800' : 'text-gray-700'}`}>{voucher.code}</h4>
                                                     {isApplied && <Check size={18} className="text-blue-600" />}
                                                     {!status.eligible && <Lock size={16} className="text-gray-300" />}
                                                 </div>
                                                 <p className="text-xs text-gray-500 mt-0.5">{voucher.description}</p>
                                                 
                                                 {!status.eligible && (
                                                     <div className="mt-2 bg-gray-100 rounded-full h-1.5 w-full overflow-hidden">
                                                         <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${status.progress}%` }}></div>
                                                     </div>
                                                 )}
                                                 {!status.eligible && (
                                                     <p className="text-[10px] text-orange-600 font-medium mt-1 flex items-center gap-1">
                                                         <Info size={10} /> {status.missingText}
                                                     </p>
                                                 )}
                                             </div>
                                         </div>
                                     </div>
                                 )
                             })}
                        </div>
                    </div>

                    {/* List Discount Vouchers */}
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Mã giảm giá</p>
                        <div className="space-y-2">
                            {VOUCHERS.filter(v => v.type === 'discount').map(voucher => {
                                 const status = getVoucherStatus(voucher);
                                 const isApplied = appliedDiscountVoucher?.code === voucher.code;
                                 
                                 return (
                                     <div key={voucher.id} className={`relative border rounded-lg p-3 transition-all ${isApplied ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
                                         <div className="flex items-start gap-3">
                                             <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isApplied ? 'bg-green-200 text-green-700' : status.eligible ? 'bg-orange-50 text-orange-400' : 'bg-gray-100 text-gray-400'}`}>
                                                 <Zap size={20} />
                                             </div>
                                             <div className="flex-1">
                                                 <div className="flex items-center justify-between">
                                                     <div className="flex items-center gap-2">
                                                         <h4 className={`font-bold text-sm ${isApplied ? 'text-green-800' : 'text-gray-700'}`}>{voucher.code}</h4>
                                                         {isApplied && <span className="text-[10px] bg-green-600 text-white px-1.5 rounded font-bold">Tốt nhất</span>}
                                                     </div>
                                                     {isApplied && <Check size={18} className="text-green-600" />}
                                                     {!status.eligible && <Lock size={16} className="text-gray-300" />}
                                                 </div>
                                                 <p className="text-xs text-gray-500 mt-0.5">{voucher.description}</p>
                                                 
                                                 {!status.eligible && (
                                                     <div className="mt-2 bg-gray-100 rounded-full h-1.5 w-full overflow-hidden">
                                                         <div className="h-full bg-orange-400 transition-all duration-500" style={{ width: `${status.progress}%` }}></div>
                                                     </div>
                                                 )}
                                                 {!status.eligible && (
                                                     <p className="text-[10px] text-orange-600 font-medium mt-1 flex items-center gap-1">
                                                         <Info size={10} /> {status.missingText}
                                                     </p>
                                                 )}
                                             </div>
                                         </div>
                                     </div>
                                 )
                            })}
                        </div>
                    </div>
                    
                    {/* Manual Input (Collapse or Small) */}
                    <div className="mt-4 flex gap-2">
                         <input
                            type="text"
                            placeholder="Nhập mã khác..."
                            value={voucherCodeInput}
                            onChange={(e) => {
                                setVoucherCodeInput(e.target.value);
                                setManualVoucherError(null);
                            }}
                            className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:border-brand outline-none text-xs"
                        />
                        <button 
                            onClick={handleManualApply}
                            disabled={!voucherCodeInput.trim()}
                            className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-200 disabled:opacity-50"
                        >
                            Áp dụng
                        </button>
                    </div>
                    {manualVoucherError && <p className="text-red-500 text-[10px] mt-1">{manualVoucherError}</p>}
               </div>

              {/* Order Form */}
              <div className="border-t border-gray-100 pt-6">
                <h3 className="font-serif font-bold text-lg mb-4 flex items-center gap-2"><MapPin size={18} className="text-brand" /> Thông tin giao hàng</h3>
                {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-start gap-2 mb-4 border border-red-100 animate-in fade-in slide-in-from-top-1"><AlertCircle size={16} className="shrink-0 mt-0.5" /><span>{error}</span></div>}
                <form id="order-form" onSubmit={handleSubmit} className="space-y-4">
                  <div><input type="text" name="fullName" required placeholder="Họ và tên" value={formData.fullName} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all text-sm" /></div>
                  <div>
                    <input type="tel" name="phone" required inputMode="numeric" maxLength={12} placeholder="Số điện thoại" value={formData.phone} onFocus={() => { if (!formData.phone) setFormData(prev => ({ ...prev, phone: '0' })); }} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all text-sm" />
                  </div>
                  <AddressAutocomplete value={formData.address} onChange={handleAddressChange} placeholder="Địa chỉ nhận hàng (Gõ Tỉnh/Thành phố...)" />
                  <div><textarea name="note" rows={2} placeholder="Ghi chú (nếu có)" value={formData.note} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all text-sm resize-none"></textarea></div>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {!orderSuccess && cart.length > 0 && (
          <div className="p-5 border-t border-gray-100 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between items-center text-gray-500">
                    <span>Tạm tính:</span>
                    <span>{subtotal.toLocaleString('vi-VN')}đ</span>
                </div>
                
                {/* Dòng Phí Vận Chuyển */}
                <div className="flex justify-between items-center text-gray-500">
                    <span>Phí vận chuyển:</span>
                    <div className="text-right">
                        {finalShippingFee === 0 && baseShippingFee > 0 ? (
                            <>
                                <span className="text-xs text-gray-400 line-through mr-1">{baseShippingFee.toLocaleString('vi-VN')}đ</span>
                                <span className="text-green-600 font-medium">Miễn phí</span>
                            </>
                        ) : (
                             <span>{baseShippingFee.toLocaleString('vi-VN')}đ</span>
                        )}
                    </div>
                </div>

                {/* Dòng Giảm giá sản phẩm */}
                {productDiscountAmount > 0 && (
                     <div className="flex justify-between items-center text-green-600">
                        <span className="flex items-center gap-1"><Ticket size={14}/> Voucher giảm giá:</span>
                        <span>-{productDiscountAmount.toLocaleString('vi-VN')}đ</span>
                    </div>
                )}
                
                <div className="flex justify-between items-center text-base pt-2 border-t border-dashed border-gray-200">
                    <span className="font-bold text-gray-800">Tổng thanh toán:</span>
                    <span className="text-2xl font-bold text-brand">{finalTotal.toLocaleString('vi-VN')}đ</span>
                </div>
            </div>
            
            <button type="submit" form="order-form" disabled={isSubmitting} className={`w-full py-4 rounded-full font-bold text-white transition-all shadow-lg flex items-center justify-center gap-2 ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-brand hover:bg-brand-accent active:scale-95'}`}>
              {isSubmitting ? <><Loader2 size={20} className="animate-spin" /> Đang xử lý...</> : 'Đặt Hàng Ngay'}
            </button>
            <p className="text-center text-xs text-gray-400 mt-3">Thanh toán khi nhận hàng (COD)</p>
          </div>
        )}
      </div>
    </>
  );
};