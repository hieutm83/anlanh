import React, { useState } from 'react';
import { Ticket, Truck, Gift, Copy, Check, Sparkles } from 'lucide-react';

export interface Voucher {
  id: string;
  code: string;
  type: 'shipping' | 'discount' | 'product';
  value: string; // e.g., "Miễn phí", "10%", "20k"
  title: string;
  description: string;
  minOrder?: string;
  colorClass: string;
  bgClass: string;
}

export const VOUCHERS: Voucher[] = [
  {
    id: 'v1',
    code: 'FREESHIP',
    type: 'shipping',
    value: 'Freeship',
    title: 'Mã Vận Chuyển',
    description: 'Miễn phí vận chuyển cho đơn hàng từ 2 hộp trở lên.',
    minOrder: 'Đơn từ 2 hộp',
    colorClass: 'text-blue-600',
    bgClass: 'from-blue-500 to-blue-600',
  },
  {
    id: 'v2',
    code: 'CHAO30',
    type: 'discount',
    value: '-30K',
    title: 'Voucher Chào Bạn Mới',
    description: 'Giảm ngay 30k cho đơn hàng đầu tiên (đơn từ 200k).',
    minOrder: 'Đơn từ 200k',
    colorClass: 'text-brand-accent',
    bgClass: 'from-green-500 to-green-600',
  },
  {
    id: 'v3',
    code: 'TETANLANH',
    type: 'discount',
    value: '10%',
    title: 'Ưu Đãi Mùa Lễ Hội',
    description: 'Giảm 10% tổng hóa đơn.',
    minOrder: 'Không giới hạn',
    colorClass: 'text-red-500',
    bgClass: 'from-red-500 to-red-600',
  }
];

export const VoucherSection: React.FC = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

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
          {VOUCHERS.map((voucher) => (
            <div key={voucher.id} className="relative flex h-32 bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
              {/* Left Side: Decor & Value */}
              <div className={`w-1/3 bg-gradient-to-br ${voucher.bgClass} flex flex-col items-center justify-center text-white p-2 relative overflow-hidden`}>
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute -top-4 -left-4 w-16 h-16 bg-white rounded-full blur-xl"></div>
                    <div className="absolute top-full -right-4 w-20 h-20 bg-black rounded-full blur-xl"></div>
                </div>
                
                {voucher.type === 'shipping' && <Truck size={24} className="mb-1 relative z-10" />}
                {voucher.type === 'discount' && <Ticket size={24} className="mb-1 relative z-10" />}
                {voucher.type === 'product' && <Gift size={24} className="mb-1 relative z-10" />}
                
                <span className="font-bold text-xl md:text-2xl relative z-10 text-center leading-tight">{voucher.value}</span>
                <span className="text-[10px] opacity-90 relative z-10 text-center mt-1">Mã: {voucher.code}</span>

                {/* Perforated Line Effect (CSS trick using radial gradient or border) */}
                <div className="absolute right-0 top-0 bottom-0 w-[4px] h-full flex flex-col justify-between items-center translate-x-1/2 z-20">
                     {[...Array(8)].map((_, i) => (
                         <div key={i} className="w-3 h-3 bg-gray-50 rounded-full my-0.5"></div>
                     ))}
                </div>
              </div>

              {/* Right Side: Info & Action */}
              <div className="w-2/3 p-4 flex flex-col justify-between pl-6">
                <div>
                    <h3 className={`font-bold text-sm md:text-base mb-1 ${voucher.colorClass}`}>{voucher.title}</h3>
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{voucher.description}</p>
                </div>
                
                <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                        {voucher.minOrder}
                    </span>
                    
                    <button 
                        onClick={() => handleCopy(voucher.code, voucher.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition-all ${
                            copiedId === voucher.id 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-brand text-white hover:bg-brand-accent'
                        }`}
                    >
                        {copiedId === voucher.id ? (
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
          ))}
        </div>
      </div>
    </section>
  );
};