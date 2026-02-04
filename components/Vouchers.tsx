import React, { useState, useEffect } from 'react';
import { Ticket, Truck, Gift, Copy, Check, Sparkles, Loader2, Zap } from 'lucide-react';

// --- CẤU HÌNH API ---
const API_URL = "https://script.google.com/macros/s/AKfycbzCzJ2SQ3iPmiJZNKg5k6Ti_9Y6EI79bLmVyhhQmBkPbSfFVga2f4hva_3-_2H-7h3k/exec";

// Interface khớp với dữ liệu từ API Google Sheet trả về
export interface Voucher {
  code: string;
  type: 'shipping' | 'discount' | 'product';
  value: number;
  minCondition: number;
  description: string;
}

// Giữ mảng rỗng để không gãy import ở file khác (nếu có)
export const VOUCHERS: Voucher[] = [];

export const VoucherSection: React.FC = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // 1. Fetch dữ liệu từ API
  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const response = await fetch(`${API_URL}?action=get_vouchers`);
        const json = await response.json();
        if (json.success && Array.isArray(json.data)) {
          setVouchers(json.data);
        }
      } catch (error) {
        console.error("Lỗi tải voucher:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVouchers();
  }, []);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Helper: Định dạng giá trị hiển thị (VD: 30000 -> 30K, 10 -> 10%)
  const formatValueDisplay = (val: number, type: string) => {
      if (type === 'shipping') return 'Freeship';
      // Nếu giá trị nhỏ hơn 100, coi là phần trăm
      if (val <= 100) return `-${val}%`;
      // Nếu lớn hơn, coi là số tiền (chia 1000 lấy K)
      return `-${val / 1000}K`;
  };

  // Helper: Định dạng điều kiện (VD: 200000 -> Đơn 200k, 2 -> 2 hộp)
  const formatConditionDisplay = (val: number) => {
      if (val === 0) return 'Không giới hạn';
      // Nếu < 1000, coi là số lượng hộp
      if (val < 1000) return `Đơn từ ${val} hộp`;
      // Nếu >= 1000, coi là số tiền
      return `Đơn từ ${val / 1000}k`;
  };

  // Helper: Chọn màu sắc theo loại
  const getStyleByType = (type: string) => {
      switch (type) {
          case 'shipping':
              return {
                  bg: 'from-blue-500 to-blue-600',
                  text: 'text-blue-600',
                  icon: <Truck size={24} className="mb-1 relative z-10" />,
                  title: 'Mã Vận Chuyển'
              };
          case 'discount':
              return {
                  bg: 'from-green-500 to-green-600', // Hoặc red tùy thích
                  text: 'text-green-600',
                  icon: <Ticket size={24} className="mb-1 relative z-10" />,
                  title: 'Mã Giảm Giá'
              };
          default:
              return {
                  bg: 'from-purple-500 to-purple-600',
                  text: 'text-purple-600',
                  icon: <Gift size={24} className="mb-1 relative z-10" />,
                  title: 'Quà Tặng'
              };
      }
  };

  if (loading) {
      return (
        <section className="py-12 bg-gray-50 border-b border-gray-100 flex justify-center">
            <div className="flex flex-col items-center gap-3">
                <Loader2 className="animate-spin text-brand" size={30} />
                <span className="text-gray-400 text-sm">Đang tải ưu đãi mới nhất...</span>
            </div>
        </section>
      );
  }

  if (vouchers.length === 0) return null;

  return (
    <section className="py-12 bg-gray-50 border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-white px-4 py-1.5 rounded-full shadow-sm border border-gray-100 mb-3">
                <Sparkles size={16} className="text-yellow-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Quà tặng từ An Lành</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand">Kho Voucher Ưu Đãi</h2>
            <p className="text-gray-500 mt-2">Lưu mã ngay để áp dụng giảm giá khi đặt hàng</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {vouchers.map((voucher, index) => {
            const style = getStyleByType(voucher.type);
            
            return (
                <div key={index} className="relative flex h-32 bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
                {/* Left Side: Decor & Value */}
                <div className={`w-1/3 bg-gradient-to-br ${style.bg} flex flex-col items-center justify-center text-white p-2 relative overflow-hidden`}>
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute -top-4 -left-4 w-16 h-16 bg-white rounded-full blur-xl"></div>
                        <div className="absolute top-full -right-4 w-20 h-20 bg-black rounded-full blur-xl"></div>
                    </div>
                    
                    {style.icon}
                    
                    <span className="font-bold text-xl md:text-2xl relative z-10 text-center leading-tight">
                        {formatValueDisplay(voucher.value, voucher.type)}
                    </span>
                    <span className="text-[10px] opacity-90 relative z-10 text-center mt-1 font-mono">Mã: {voucher.code}</span>

                    {/* Perforated Line Effect */}
                    <div className="absolute right-0 top-0 bottom-0 w-[4px] h-full flex flex-col justify-between items-center translate-x-1/2 z-20">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="w-3 h-3 bg-gray-50 rounded-full my-0.5"></div>
                        ))}
                    </div>
                </div>

                {/* Right Side: Info & Action */}
                <div className="w-2/3 p-4 flex flex-col justify-between pl-6">
                    <div>
                        <h3 className={`font-bold text-sm md:text-base mb-1 ${style.text}`}>{style.title}</h3>
                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed" title={voucher.description}>
                            {voucher.description}
                        </p>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                        <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full font-medium">
                            {formatConditionDisplay(voucher.minCondition)}
                        </span>
                        
                        <button 
                            onClick={() => handleCopy(voucher.code)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition-all ${
                                copiedCode === voucher.code 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-brand text-white hover:bg-brand-accent'
                            }`}
                        >
                            {copiedCode === voucher.code ? (
                                <>
                                    <Check size={14} /> Đã lưu
                                </>
                            ) : (
                                <>
                                    <Copy size={14} /> Lưu mã
                                </>
                            )}
                        </button>
                    </div>
                </div>
                </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
