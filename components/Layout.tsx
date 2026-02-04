import React, { useState, useEffect } from 'react';
import { ShoppingBag, Menu, X, Leaf, Phone, Mail, MapPin, Facebook, Search, FileText, Truck, ShieldCheck, RefreshCw } from 'lucide-react';
import { CartSidebar } from './Cart';
import { OrderLookup } from './OrderLookup';
import { Product } from '../types';

// --- PHẦN HEADER ---
interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenLookup: () => void;
}

export const Header: React.FC<HeaderProps> = ({ cartCount, onOpenCart, onOpenLookup }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header 
      // SỬA: Luôn set nền trắng (bg-white), chỉ thay đổi độ cao (padding) khi cuộn
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white/95 backdrop-blur-md shadow-sm ${
        isScrolled ? 'py-2' : 'py-4'
      }`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => scrollToSection('home')}>
            {/* Khung logo hình tròn */}
            <div className="h-12 w-12 rounded-full overflow-hidden bg-white border border-gray-100 shadow-sm flex items-center justify-center shrink-0">
               <img 
                 src="/image/logo.png" 
                 alt="An Lành Farm" 
                 className="w-full h-full rounded-full p-0.5"
                 onError={(e) => {
                   e.currentTarget.style.display = 'none';
                   if (e.currentTarget.parentElement) {
                       e.currentTarget.parentElement.innerText = "AL";
                       e.currentTarget.parentElement.className += " font-bold text-brand font-serif text-xl flex items-center justify-center";
                   }
                 }} 
               />
            </div>
            
            {/* Text Logo - Luôn màu đen/xám */}
            <div className="hidden md:block">
                <h1 className="text-xl md:text-2xl font-serif font-bold tracking-wide text-gray-800">An Lành Farm</h1>
                <p className="text-[10px] md:text-xs uppercase tracking-widest opacity-80 hidden sm:block text-gray-500">Dưỡng thân từ thảo mộc Việt</p>
            </div>
        </div>

        {/* Desktop Nav - Luôn màu xám */}
        <nav className="hidden md:flex items-center gap-8">
          {['home', 'brand', 'products', 'footer'].map((section) => (
             <button 
                key={section}
                onClick={() => scrollToSection(section)} 
                className="font-medium transition-colors text-gray-600 hover:text-brand capitalize"
             >
                {section === 'home' ? 'Trang chủ' : section === 'brand' ? 'Câu chuyện' : section === 'products' ? 'Sản phẩm' : 'Liên hệ'}
             </button>
          ))}
          
          {/* Lookup Button */}
          <button 
            onClick={onOpenLookup} 
            className="flex items-center gap-1 font-medium text-sm pl-4 border-l border-gray-300 transition-colors text-gray-500 hover:text-brand"
          >
            <Search size={16} /> Tra cứu
          </button>
        </nav>

        {/* Cart & Mobile Toggle */}
        <div className="flex items-center gap-3 md:gap-4">
          <button 
            onClick={onOpenLookup}
            className="md:hidden p-2 rounded-full transition-colors text-gray-600 hover:bg-gray-100"
          >
            <Search size={24} />
          </button>

          <button 
            onClick={onOpenCart}
            className="relative p-2 rounded-full transition-colors text-gray-600 hover:bg-gray-100"
          >
            <ShoppingBag size={24} />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold shadow-sm animate-bounce">
                {cartCount}
              </span>
            )}
          </button>
          
          <button 
            className="md:hidden p-2 rounded-full text-gray-600 hover:bg-gray-100"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-100 shadow-lg p-4 flex flex-col gap-4 animate-in slide-in-from-top-5">
           <button onClick={() => scrollToSection('home')} className="text-left py-2 px-4 hover:bg-brand-bg text-brand rounded-lg">Trang chủ</button>
           <button onClick={() => scrollToSection('brand')} className="text-left py-2 px-4 hover:bg-brand-bg text-brand rounded-lg">Câu chuyện</button>
           <button onClick={() => scrollToSection('products')} className="text-left py-2 px-4 hover:bg-brand-bg text-brand rounded-lg">Sản phẩm</button>
           <button onClick={() => scrollToSection('footer')} className="text-left py-2 px-4 hover:bg-brand-bg text-brand rounded-lg">Liên hệ</button>
           <button 
             onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenLookup();
             }} 
             className="text-left py-2 px-4 hover:bg-brand-bg text-brand rounded-lg flex items-center gap-2"
           >
                <Search size={18} /> Tra cứu đơn hàng
           </button>
        </div>
      )}
    </header>
  );
};

// --- NỘI DUNG CHÍNH SÁCH (POLICY) ---
const POLICY_CONTENT = {
    shipping: {
        title: "Chính sách vận chuyển",
        icon: <Truck size={32} className="text-brand" />,
        content: (
            <div className="space-y-4 text-gray-600 text-sm leading-relaxed">
                <div className="bg-brand-bg p-4 rounded-xl border border-brand/10">
                    <h4 className="font-bold text-brand mb-2">1. Phí vận chuyển ưu đãi</h4>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Miễn phí vận chuyển (Freeship)</strong> khi mua từ <strong>2 hộp</strong> trở lên (hoặc Combo 2/Combo 3).</li>
                        <li>
                            Với đơn dưới 2 hộp, phí ship được tính theo vùng:
                            <ul className="list-circle pl-5 mt-1 text-gray-500">
                                <li><strong>Miền Bắc:</strong> 15.000đ</li>
                                <li><strong>Miền Nam & Trung:</strong> 20.000đ</li>
                            </ul>
                        </li>
                    </ul>
                </div>
                
                <div>
                    <h4 className="font-bold text-gray-800 mb-2">2. Thời gian giao hàng</h4>
                    <p>Thời gian giao hàng tiêu chuẩn từ <strong>2 - 4 ngày làm việc</strong>:</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>Hà Nội & Miền Bắc: 1 - 2 ngày.</li>
                        <li>TP.HCM & Các tỉnh khác: 3 - 4 ngày.</li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold text-gray-800 mb-2">3. Quy định kiểm tra hàng</h4>
                    <p>An Lành Farm khuyến khích quý khách <strong>kiểm tra hàng trước khi thanh toán</strong> (đồng kiểm với shipper).</p>
                    <p className="mt-1">Nếu sản phẩm bị lỗi, vỡ, hoặc không đúng đơn đặt hàng, quý khách vui lòng từ chối nhận và liên hệ hotline để được hỗ trợ gửi lại đơn mới ngay lập tức.</p>
                </div>
            </div>
        )
    },
    terms: {
        title: "Điều khoản & Bảo hành",
        icon: <ShieldCheck size={32} className="text-brand" />,
        content: (
            <div className="space-y-4 text-gray-600 text-sm leading-relaxed">
                 <div className="bg-brand-bg p-4 rounded-xl border border-brand/10">
                    <h4 className="font-bold text-brand mb-2 flex items-center gap-2"><RefreshCw size={16}/> Chính sách đổi trả</h4>
                    <p>Hỗ trợ đổi trả trong vòng <strong>07 ngày</strong> kể từ khi nhận hàng trong các trường hợp:</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>Sản phẩm bị lỗi do nhà sản xuất (bao bì rách, ẩm mốc...).</li>
                        <li>Sản phẩm bị hư hại trong quá trình vận chuyển.</li>
                        <li>Giao sai sản phẩm so với đơn đặt hàng.</li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold text-gray-800 mb-2">Cam kết chất lượng</h4>
                    <p>Sản phẩm của An Lành Farm cam kết:</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>100% nguyên liệu thảo mộc tự nhiên, nguồn gốc rõ ràng.</li>
                        <li>Không sử dụng hương liệu hóa học, không chất bảo quản độc hại.</li>
                        <li>Quy trình sản xuất đạt tiêu chuẩn VSATTP.</li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold text-gray-800 mb-2">Bảo mật thông tin</h4>
                    <p>Mọi thông tin cá nhân của khách hàng (Tên, SĐT, Địa chỉ) chỉ được sử dụng cho mục đích giao hàng và chăm sóc khách hàng. Chúng tôi cam kết không chia sẻ thông tin cho bên thứ ba.</p>
                </div>
            </div>
        )
    }
}

// --- PHẦN FOOTER ---
export const Footer: React.FC = () => {
  const [activePolicy, setActivePolicy] = useState<'shipping' | 'terms' | null>(null);

  const scrollTo = (id: string) => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
        <footer id="footer" className="bg-brand text-white pt-16 pb-8">
        <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
                <div>
                    <div className="flex items-center gap-3 mb-6">
                        {/* Logo Footer - Hình tròn */}
                        <div className="bg-white p-0.2 rounded-full w-12 h-12 flex items-center justify-center shrink-0">
                            <img src="/image/logo.png" alt="An Lành" className="w-full h-full rounded-full p-0.5" />
                        </div>
                        <h3 className="text-2xl font-serif font-bold">An Lành Farm</h3>
                    </div>
                    <p className="text-white/80 leading-relaxed mb-6 text-sm">
                        "Chúng tôi không chỉ bán trà, mà gửi vào đó tinh thần dưỡng thân của người Việt – để mỗi người uống trà, là một người đang trở về."
                    </p>
                    <div className="flex gap-4">
                        {/* Facebook */}
                        <a 
                          href="https://www.facebook.com/anlanhfarmvn" 
                          target="_blank" 
                          rel="noreferrer" 
                          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#1877F2] hover:text-white transition-all duration-300"
                        >
                            <Facebook size={20} />
                        </a>
                        
                        {/* Zalo */}
                        <a 
                          href="https://zalo.me/0582110110" 
                          target="_blank" 
                          rel="noreferrer"
                          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#0068FF] hover:text-white transition-all duration-300 group"
                        >
                             <svg viewBox="0 0 100 100" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                                <path d="M14.6 15.8c0-2.8 2.3-5 5.2-5h60.4c2.9 0 5.2 2.3 5.2 5v51.3c0 2.8-2.3 5-5.2 5H64l-14.1 11.2c-1.3 1-3.2 0.1-3.2-1.6v-9.6H19.8c-2.9 0-5.2-2.3-5.2-5V15.8z" />
                                <text x="50" y="65" fontSize="35" fontWeight="bold" textAnchor="middle" fill="currentColor" className="opacity-0 group-hover:opacity-100">Z</text>
                                <text x="50" y="60" fontSize="26" fontWeight="900" textAnchor="middle" fill="currentColor" style={{fontFamily: 'sans-serif'}}>Zalo</text>
                             </svg>
                        </a>

                        {/* Tiktok */}
                        <a 
                          href="https://www.tiktok.com/@anlanh.farm" 
                          target="_blank" 
                          rel="noreferrer"
                          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-black hover:text-white transition-all duration-300"
                        >
                            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                                <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692 6.33 6.33 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.773 1.526V6.79a4.831 4.831 0 0 1-1.003-.104z"/>
                            </svg>
                        </a>

                        {/* Shopee */}
                        <a 
                          href="https://shopee.vn/anlanhfarm" 
                          target="_blank" 
                          rel="noreferrer"
                          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#EE4D2D] hover:text-white transition-all duration-300"
                        >
                            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                                <path d="M18.8 7.3h-3.3C15.2 3.8 13.9 3 11.9 3c-2 0-3.3.8-3.6 4.3H5c-1 0-1.8.9-1.7 2l1.6 10.3c.1 1 .9 1.8 1.9 1.8h10.4c1 0 1.8-.8 1.9-1.8l1.6-10.3c.1-1.1-.7-2-1.9-2zM12 4.6c1.1 0 1.9.5 2.1 2.7h-4.2c.2-2.2 1-2.7 2.1-2.7zM16.5 12c0 .3-.2.5-.5.5s-.5-.2-.5-.5V9.4h-1v2.6c0 .3-.2.5-.5.5s-.5-.2-.5-.5V9.4h-3v2.6c0 .3-.2.5-.5.5s-.5-.2-.5-.5V9.4h-1v2.6c0 .3-.2.5-.5.5s-.5-.2-.5-.5V9.4h-1v2.1c0 2.2 4.5 2.2 4.5 0v-2.1h1V12z"/>
                            </svg>
                        </a>
                    </div>
                </div>

                <div>
                    <h4 className="text-lg font-serif font-bold mb-6 border-b border-white/20 pb-2 inline-block">Liên hệ</h4>
                    <ul className="space-y-4">
                        <li className="flex items-start gap-3 text-white/80">
                            <MapPin size={20} className="shrink-0 mt-1" />
                            <span>Tầng 4, căn B15 khu nhà ở Hoàng Cầu, phường Đống Đa, Hà Nội</span>
                        </li>
                        <li className="flex items-center gap-3 text-white/80">
                            <Phone size={20} className="shrink-0" />
                            <span>0582 110 110</span>
                        </li>
                        <li className="flex items-center gap-3 text-white/80">
                            <Mail size={20} className="shrink-0" />
                            <span>cskh@anlanhfarm.com</span>
                        </li>
                    </ul>
                </div>

                <div>
                    <h4 className="text-lg font-serif font-bold mb-6 border-b border-white/20 pb-2 inline-block">Về Chúng Tôi</h4>
                    <ul className="space-y-3">
                        <li>
                            <button onClick={() => scrollTo('brand')} className="text-white/80 hover:text-white transition-colors text-left">
                                Câu chuyện thương hiệu
                            </button>
                        </li>
                        <li>
                             <button onClick={() => scrollTo('brand')} className="text-white/80 hover:text-white transition-colors text-left">
                                Triết lý ngũ hành
                            </button>
                        </li>
                        <li>
                            <button onClick={() => setActivePolicy('shipping')} className="text-white/80 hover:text-white transition-colors text-left">
                                Chính sách vận chuyển
                            </button>
                        </li>
                        <li>
                            <button onClick={() => setActivePolicy('terms')} className="text-white/80 hover:text-white transition-colors text-left">
                                Điều khoản dịch vụ
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
            
            <div className="border-t border-white/10 pt-8 text-center text-white/60 text-sm">
                <p>&copy; {new Date().getFullYear()} An Lành Farm.MinhHieu designed with ❤️ for health.</p>
            </div>
        </div>
        </footer>

        {/* Policy Modal */}
        {activePolicy && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <div 
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
                    onClick={() => setActivePolicy(null)}
                ></div>
                <div className="relative bg-white rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95">
                    <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50 rounded-t-2xl">
                        <div className="flex items-center gap-3">
                            {POLICY_CONTENT[activePolicy].icon}
                            <h3 className="text-xl font-serif font-bold text-gray-800">{POLICY_CONTENT[activePolicy].title}</h3>
                        </div>
                        <button onClick={() => setActivePolicy(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"><X size={24} /></button>
                    </div>
                    <div className="p-6 overflow-y-auto custom-scrollbar">
                        {POLICY_CONTENT[activePolicy].content}
                    </div>
                </div>
            </div>
        )}
    </>
  );
};

// --- LAYOUT CHÍNH (Kết nối tất cả) ---
interface LayoutProps {
  children: React.ReactNode;
  cart: any[];
  onRemoveFromCart: (id: string) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onClearCart: () => void;
  products: Product[];
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, cart, onRemoveFromCart, onUpdateQuantity, onClearCart
}) => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLookupOpen, setIsLookupOpen] = useState(false);

  // Tính tổng số lượng item trong giỏ
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 flex flex-col">
      {/* 1. Header */}
      <Header 
        cartCount={cartCount} 
        onOpenCart={() => setIsCartOpen(true)}
        onOpenLookup={() => setIsLookupOpen(true)}
      />

      {/* 2. Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* 3. Footer */}
      <Footer />

      {/* 4. Cart Sidebar (Ẩn/Hiện) */}
      <CartSidebar 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        cart={cart} 
        onRemove={onRemoveFromCart}
        onUpdateQuantity={onUpdateQuantity}
        onClearCart={onClearCart}
      />

      {/* 5. Order Lookup Modal (Ẩn/Hiện) */}
      {isLookupOpen && (
         <OrderLookup onClose={() => setIsLookupOpen(false)} />
      )}
    </div>
  );
};
