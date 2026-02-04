import React, { useState } from 'react';
import { Search, X, Package, Truck, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { OrderLookupResult } from '../types';

interface OrderLookupProps {
  isOpen: boolean;
  onClose: () => void;
}

// ✅ Link API của bạn đã được cập nhật
const API_URL = "https://script.google.com/macros/s/AKfycbzy0_bld3XYKk1136lT46CDYM4D3jhs-zxUrMf8R5wfsEOLKvzBI5m0dnQkS5o02zDG/exec";

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
    const cleanPhone = phone.trim().replace(/\s/g, ''); // Xóa khoảng trắng trong SĐT

    if (!cleanOrderId || !cleanPhone) {
        setError('Vui lòng nhập đầy đủ Mã đơn hàng và Số điện thoại');
        return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
        // Gọi API Google Apps Script
        const response = await fetch(`${API_URL}?action=lookup&orderId=${cleanOrderId}&phone=${cleanPhone}`);
        const data = await response.json();

        if (data.success && data.order) {
            setResult({
                id: data.order.id,
                status: data.order.status, 
                statusText: getStatusText(data.order.status),
                customerName: data.order.fullName,
                total: Number(data.order.total),
                createdAt: new Date(data.order.createdAt).toLocaleDateString('vi-VN'),
                // Xử lý chuỗi items từ Sheet thành mảng để hiển thị
                items: typeof data.order.items === 'string' 
                    ? data.order.items.split('\n') 
                    : [data.order.items]
            });
        } else {
            setError('Không tìm thấy đơn hàng. Vui lòng kiểm tra lại Mã đơn và SĐT.');
        }
    } catch (err) {
        console.error("Lỗi tra cứu:", err);
        setError('Lỗi kết nối đến hệ thống. Vui lòng thử lại sau.');
    } finally {
        setLoading(false);
    }
  };

  const getStatusText = (status: string) => {
      const map: Record<string, string> = {
          'pending': 'Chờ xác nhận',
          'confirmed': 'Đã xác nhận',
          'shipping': 'Đang giao hàng',
          'completed': 'Giao thành công',
          'cancelled': 'Đã hủy'
      };
      return map[status] || 'Không xác định';
  };

  const getStatusStep = (status: string) => {
      const steps = ['pending', 'confirmed', 'shipping', 'completed'];
      if (status === 'cancelled') return -1;
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
                Nhập mã đơn hàng (ví dụ: ORD-123456) và số điện thoại đã đặt để kiểm tra trạng thái vận chuyển.
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
                            <div className={`text-xs font-bold mt-1 ${result.status === 'cancelled' ? 'text-red-500' : 'text-green-600'}`}>
                                {result.statusText}
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-xs text-gray-400 block mb-1">Tổng tiền</span>
                            <span className="font-bold text-gray-800">{result.total.toLocaleString('vi-VN')}đ</span>
                        </div>
                    </div>

                    {/* Timeline - Ẩn nếu đơn hàng bị hủy */}
                    {result.status !== 'cancelled' ? (
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
                    ) : (
                        <div className="bg-red-50 p-4 rounded-xl text-center mb-6 border border-red-100">
                             <span className="text-red-600 font-bold text-sm">Đơn hàng này đã bị hủy.</span>
                        </div>
                    )}

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
