import React, { useState } from 'react';
import { Search, X, Package, Truck, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { OrderLookupResult } from '../types';

interface OrderLookupProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OrderLookup: React.FC<OrderLookupProps> = ({ isOpen, onClose }) => {
  const [orderId, setOrderId] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OrderLookupResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Chuẩn hóa input
    const cleanOrderId = orderId.trim().toUpperCase();
    const cleanPhone = phone.trim();

    if (!cleanOrderId || !cleanPhone) {
        setError('Vui lòng nhập đầy đủ Mã đơn hàng và Số điện thoại');
        return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    // 1. Kiểm tra localStorage (Database giả lập local) trước
    // Cần đảm bảo dữ liệu mới nhất được đọc ra
    const savedOrders = JSON.parse(localStorage.getItem('anlanh_local_orders') || '[]');
    
    const localOrder = savedOrders.find((o: any) => {
        // So sánh mã đơn (không phân biệt hoa thường) và sđt
        return o.id.toUpperCase() === cleanOrderId && o.phone === cleanPhone;
    });

    if (localOrder) {
        // Nếu tìm thấy trong local, hiển thị ngay
        setTimeout(() => {
            setResult(localOrder);
            setLoading(false);
        }, 600);
        return;
    }

    // 2. Fallback API giả lập
    setTimeout(() => {
        setLoading(false);
        // Demo logic: Nếu mã bắt đầu bằng "ORD-TEST"
        if (cleanOrderId.startsWith('ORD-TEST')) {
            setResult({
                id: cleanOrderId,
                status: 'confirmed', 
                statusText: 'Đã xác nhận',
                customerName: 'Khách hàng Demo',
                total: 278000,
                createdAt: new Date().toLocaleDateString('vi-VN'),
                items: ['Trà Thư Dạ (x1)', 'Trà Khởi An (x1)']
            });
        } else {
            setError('Không tìm thấy đơn hàng. Vui lòng kiểm tra lại Mã đơn và SĐT.');
        }
    }, 1000);
  };

  const getStatusStep = (status: string) => {
      const steps = ['pending', 'confirmed', 'shipping', 'completed'];
      return steps.indexOf(status);
  };

  const currentStep = result ? getStatusStep(result.status) : 0;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        
        {/* Header */}
        <div className="bg-brand text-white p-4 flex justify-between items-center">
            <h3 className="font-serif font-bold text-lg flex items-center gap-2">
                <Search size={20} /> Tra Cứu Đơn Hàng
            </h3>
            <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
                <X size={24} />
            </button>
        </div>

        {/* Body */}
        <div className="p-6">
            <p className="text-sm text-gray-500 mb-6 text-center">
                Nhập mã đơn hàng (ví dụ: ORD-123456) và số điện thoại đã đặt để kiểm tra.
            </p>

            <form onSubmit={handleLookup} className="space-y-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input 
                        type="text" 
                        placeholder="Mã đơn hàng" 
                        value={orderId}
                        onChange={(e) => setOrderId(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand focus:ring-1 focus:ring-brand outline-none uppercase"
                    />
                    <input 
                        type="tel" 
                        placeholder="Số điện thoại" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand focus:ring-1 focus:ring-brand outline-none"
                    />
                </div>
                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-brand hover:bg-brand-accent text-white py-3 rounded-xl font-bold transition-all shadow-md active:scale-95 disabled:opacity-70 flex justify-center items-center gap-2"
                >
                    {loading ? 'Đang tìm kiếm...' : 'Kiểm tra ngay'}
                </button>
            </form>

            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2 mb-4 animate-in fade-in">
                    <AlertCircle size={16} /> {error}
                </div>
            )}

            {result && (
                <div className="border-t border-gray-100 pt-6 animate-in slide-in-from-bottom-2">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <span className="text-xs text-gray-400 block mb-1">Đơn hàng</span>
                            <span className="font-bold text-lg text-brand">{result.id}</span>
                        </div>
                        <div className="text-right">
                            <span className="text-xs text-gray-400 block mb-1">Tổng tiền</span>
                            <span className="font-bold text-gray-800">{result.total.toLocaleString('vi-VN')}đ</span>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="relative flex justify-between mb-8 px-2">
                        {/* Connecting Line */}
                        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -z-10 -translate-y-1/2 rounded-full"></div>
                        <div className="absolute top-1/2 left-0 h-1 bg-green-500 -z-10 -translate-y-1/2 rounded-full transition-all duration-1000" style={{ width: `${(currentStep / 3) * 100}%` }}></div>

                        {/* Step 1: Pending */}
                        <div className="flex flex-col items-center gap-2 bg-white px-1">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep >= 0 ? 'border-green-500 bg-green-50 text-green-600' : 'border-gray-200 text-gray-300'}`}>
                                <Clock size={16} />
                            </div>
                            <span className="text-[10px] font-bold text-gray-500">Chờ duyệt</span>
                        </div>

                        {/* Step 2: Confirmed */}
                        <div className="flex flex-col items-center gap-2 bg-white px-1">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep >= 1 ? 'border-green-500 bg-green-50 text-green-600' : 'border-gray-200 text-gray-300'}`}>
                                <Package size={16} />
                            </div>
                            <span className="text-[10px] font-bold text-gray-500">Đóng gói</span>
                        </div>

                        {/* Step 3: Shipping */}
                        <div className="flex flex-col items-center gap-2 bg-white px-1">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep >= 2 ? 'border-green-500 bg-green-50 text-green-600' : 'border-gray-200 text-gray-300'}`}>
                                <Truck size={16} />
                            </div>
                            <span className="text-[10px] font-bold text-gray-500">Đang giao</span>
                        </div>

                        {/* Step 4: Completed */}
                        <div className="flex flex-col items-center gap-2 bg-white px-1">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep >= 3 ? 'border-green-500 bg-green-50 text-green-600' : 'border-gray-200 text-gray-300'}`}>
                                <CheckCircle size={16} />
                            </div>
                            <span className="text-[10px] font-bold text-gray-500">Hoàn thành</span>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl">
                        <p className="text-sm font-bold text-gray-700 mb-2">Sản phẩm:</p>
                        <ul className="text-sm text-gray-600 space-y-1">
                            {result.items.map((item, idx) => (
                                <li key={idx} className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-brand-accent"></div>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};