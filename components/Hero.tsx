import React from 'react';
import { 
  ArrowDown, Wind, Droplets, Sun, Hexagon, Mountain, 
  Sprout, Heart, Leaf, ShieldCheck, Package 
} from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: 'url("https://vwu.vn/documents/1809139/0/chauthilan+thuoctam+1.jpg/61ef63ed-9d84-4590-bece-0b39fde524b5?q=80&w=2069&auto=format&fit=crop")',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-brand-bg/70"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10 text-center pt-20">
        <div className="mb-6 inline-block animate-fade-in-up">
          <span className="bg-white/90 text-brand px-4 py-1 rounded-full text-sm font-semibold tracking-wider uppercase backdrop-blur-sm">
            Tinh hoa thảo mộc Việt
          </span>
        </div>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-6 leading-tight drop-shadow-lg">
          Sống An Nhiên <br/> Giữa Đời Hiện Đại
        </h1>
        <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-10 font-light leading-relaxed drop-shadow-md">
          Dưỡng thân từ những chiếc lá Việt quen thuộc. Mỗi tách trà là một nhịp thở chậm, 
          giúp bạn lắng nghe cơ thể và tìm về sự cân bằng.
        </p>
        
        <button 
          onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
          className="bg-brand-accent hover:bg-green-600 text-white px-8 py-3 rounded-full text-lg font-medium transition-all transform hover:scale-105 shadow-lg"
        >
          Khám Phá Ngay
        </button>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-white/70">
          <ArrowDown size={32} />
        </div>
      </div>
    </section>
  );
};

export const BrandStory: React.FC = () => {
  // Cấu trúc Ngũ Hành sắp xếp theo vòng tròn tương sinh (Mộc - Hỏa - Thổ - Kim - Thủy)
  const philosophies = [
    { icon: <Wind />, title: 'Mộc', desc: 'Khơi sinh', colorClass: 'group-hover:bg-green-600', angle: -90 }, // Đỉnh trên
    { icon: <Sun />, title: 'Hỏa', desc: 'Ấm lành', colorClass: 'group-hover:bg-red-600', angle: -18 },
    { icon: <Mountain />, title: 'Thổ', desc: 'Cân bằng', colorClass: 'group-hover:bg-amber-700', angle: 54 },
    { icon: <Hexagon />, title: 'Kim', desc: 'Ổn định', colorClass: 'group-hover:bg-gray-500', angle: 126 },
    { icon: <Droplets />, title: 'Thủy', desc: 'Lắng dịu', colorClass: 'group-hover:bg-blue-600', angle: 198 },
  ];

  return (
    <section id="brand" className="py-20 bg-brand-bg relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Intro */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <span className="text-brand-accent font-bold tracking-wider uppercase text-sm mb-3 block">Triết Lý Của Chúng Tôi</span>
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-brand mb-6">Ngũ Hành Dưỡng Thân</h2>
          <div className="w-24 h-1 bg-brand-accent mx-auto mb-8 rounded-full"></div>
          <p className="text-gray-600 text-lg leading-relaxed">
            Chúng tôi tin rằng, trà không chỉ để uống, mà là một cách sống. 
            Mỗi yếu tố trong tự nhiên đều tương ứng với một phần của cơ thể, nuôi dưỡng và chữa lành từ sâu bên trong.
          </p>
        </div>

        {/* 5 Elements Pentagon Layout */}
        <div className="relative w-full max-w-[320px] sm:max-w-[450px] md:max-w-[550px] aspect-square mx-auto mb-32">
          {/* Central Decoration */}
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-white shadow-inner flex items-center justify-center border border-brand/10 z-0">
                <div className="text-center">
                  <span className="text-brand font-serif font-bold text-sm md:text-base leading-tight block">AN LÀNH</span>
                  <span className="text-brand-accent font-serif italic text-xs">Farm</span>
                </div>
             </div>
          </div>

          {/* Pentagon Items */}
          {philosophies.map((item, index) => {
            // Radius 40-42% để nội dung không bị tràn mép container
            const radius = 40; 
            const x = 50 + radius * Math.cos((item.angle * Math.PI) / 180);
            const y = 50 + radius * Math.sin((item.angle * Math.PI) / 180);

            return (
              <div 
                key={index} 
                className="absolute transform -translate-x-1/2 -translate-y-1/2 w-28 sm:w-36 md:w-44 z-10"
                style={{ left: `${x}%`, top: `${y}%` }}
              >
                <div className="bg-white p-3 md:p-5 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 text-center group border border-gray-100 hover:-translate-y-2">
                  <div className={`w-10 h-10 md:w-14 md:h-14 bg-brand-bg rounded-full flex items-center justify-center mx-auto mb-2 md:mb-3 text-brand group-hover:text-white transition-all duration-300 ${item.colorClass}`}>
                    {React.cloneElement(item.icon as React.ReactElement, { size: 24 })}
                  </div>
                  <h3 className="text-base md:text-xl font-serif font-bold text-brand mb-1">{item.title}</h3>
                  <p className="text-[10px] md:text-xs text-gray-500 font-medium uppercase tracking-widest">{item.desc}</p>
                </div>
              </div>
            );
          })}

          {/* Background Connecting Circle */}
          <svg className="absolute inset-0 w-full h-full -z-10 opacity-10" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-brand" strokeDasharray="4 2" />
          </svg>
        </div>

        {/* Origin Story Section */}
        <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20 mb-24">
            <div className="w-full md:w-1/2 order-2 md:order-1">
               <div className="relative rounded-3xl overflow-hidden shadow-2xl rotate-2 hover:rotate-0 transition-all duration-700 border-4 border-white">
                  <img 
                    src="https://goodhealth.co.nz/wp-content/uploads/2024/01/shutterstock_2176211479-scaled-1.jpg?q=80&w=2070&auto=format&fit=crop" 
                    alt="Tea Farm" 
                    className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-700" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                  <div className="absolute bottom-6 left-6 text-white font-serif italic text-lg">
                    "Từ đất mẹ, những mầm xanh vươn lên..."
                  </div>
               </div>
            </div>
            <div className="w-full md:w-1/2 order-1 md:order-2">
                <span className="text-brand-accent font-bold tracking-wider uppercase text-sm mb-2 block">Câu Chuyện Khởi Nguồn</span>
                <h3 className="text-3xl md:text-4xl font-serif font-bold text-brand mb-6 leading-tight">Trở Về Với Tự Nhiên, <br/>Trở Về Với Chính Mình</h3>
                <p className="text-gray-600 leading-relaxed mb-6 text-justify">
                    An Lành Farm ra đời không chỉ là một thương hiệu trà, mà là một lời nhắc nhở về lối sống chậm. Giữa nhịp sống hối hả của đô thị, chúng tôi khao khát mang đến những tách trà gói trọn hương vị của đất trời.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="flex items-start gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="bg-green-100 p-2.5 rounded-lg text-green-600 shrink-0"><Sprout size={20}/></div>
                        <div>
                            <h4 className="font-bold text-gray-800 mb-1">100% Thuần Việt</h4>
                            <p className="text-xs text-gray-500">Nguyên liệu bản địa chuẩn người Việt.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="bg-orange-100 p-2.5 rounded-lg text-orange-600 shrink-0"><Heart size={20}/></div>
                        <div>
                            <h4 className="font-bold text-gray-800 mb-1">Tận Tâm Phụng Sự</h4>
                            <p className="text-xs text-gray-500">Đặt sức khỏe làm kim chỉ nam.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Cam Kết Section */}
        <div className="bg-white rounded-[2.5rem] p-8 md:p-16 shadow-xl border border-gray-100 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand to-brand-accent"></div>
             <div className="text-center max-w-3xl mx-auto mb-16 relative z-10">
                <h3 className="text-2xl md:text-4xl font-serif font-bold text-brand mb-4">Cam Kết Từ An Lành Farm</h3>
                <p className="text-gray-500">Chất lượng là hành trình minh bạch từ nông trại đến tách trà.</p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative z-10">
                 <div className="text-center group">
                    <div className="w-20 h-20 mx-auto bg-green-50 rounded-full flex items-center justify-center text-green-600 mb-6 group-hover:bg-green-600 group-hover:text-white transition-all duration-300 shadow-sm">
                        <Leaf size={36} />
                    </div>
                    <h4 className="text-xl font-bold text-gray-800 mb-3">Nguyên Liệu Sạch</h4>
                    <p className="text-gray-500 text-sm px-4">Thảo mộc VietGAP, thu hái đúng thời điểm dược tính cao nhất.</p>
                 </div>

                 <div className="text-center group">
                    <div className="w-20 h-20 mx-auto bg-amber-50 rounded-full flex items-center justify-center text-amber-600 mb-6 group-hover:bg-amber-700 group-hover:text-white transition-all duration-300 shadow-sm">
                        <ShieldCheck size={36} />
                    </div>
                    <h4 className="text-xl font-bold text-gray-800 mb-3">Công Thức Độc Quyền</h4>
                    <p className="text-gray-500 text-sm px-4">Cân bằng âm dương theo triết lý Ngũ Hành y học cổ truyền.</p>
                 </div>

                 <div className="text-center group">
                    <div className="w-20 h-20 mx-auto bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm">
                        <Package size={36} />
                    </div>
                    <h4 className="text-xl font-bold text-gray-800 mb-3">Sản Xuất An Toàn</h4>
                    <p className="text-gray-500 text-sm px-4">Nhà máy ISO 22000, quy trình khép kín giữ nguyên hương vị.</p>
                 </div>
             </div>
        </div>
      </div>
    </section>
  );
};
