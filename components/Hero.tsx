import React from 'react';
import { ArrowDown, Wind, Droplets, Sun, Cloud, Mountain, Hexagon, Sprout, Heart, Leaf, ShieldCheck, Package } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            // Giữ nguyên link ảnh bạn vừa gửi
            backgroundImage: 'url("https://vwu.vn/documents/1809139/0/chauthilan+thuoctam+1.jpg/61ef63ed-9d84-4590-bece-0b39fde524b5?q=80&w=2069&auto=format&fit=crop")',
          }}
        >
          {/* SỬA LẠI LỚP PHỦ: 
              - Thay đổi từ: from-black/30 via-transparent (trong suốt)
              - Thành: from-black/70 via-black/50 (đen mờ)
              -> Giúp ảnh tối đi để chữ trắng nổi bật, dễ đọc hơn.
          */}
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
  const philosophies = [
    { icon: <Wind />, title: 'Mộc', desc: 'Khơi sinh - Thanh lọc', colorClass: 'group-hover:bg-green-600' },
    { icon: <Mountain />, title: 'Thổ', desc: 'Cân bằng - Chuyển hóa', colorClass: 'group-hover:bg-amber-700' },
    { icon: <Hexagon />, title: 'Kim', desc: 'Ổn định - Bền vững', colorClass: 'group-hover:bg-gray-500' },
    { icon: <Droplets />, title: 'Thủy', desc: 'Lắng dịu - Dưỡng tâm', colorClass: 'group-hover:bg-blue-600' },
    { icon: <Sun />, title: 'Hỏa', desc: 'Ấm lành - Năng lượng', colorClass: 'group-hover:bg-red-600' },
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
            Trên những cánh rừng Việt, nơi người nông dân vẫn hái lá thảo mộc vào buổi sớm mai, 
            những cây thảo mộc quen thuộc như lá ổi, lá sen, giảo cổ lam, gừng... 
            được gìn giữ và phối hòa thành tách trà lành của An Lành Farm.
            <br/><br/>
            Chúng tôi tin rằng, trà không chỉ để uống, mà là một cách sống. 
            Mỗi yếu tố trong tự nhiên đều tương ứng với một phần của cơ thể, nuôi dưỡng và chữa lành từ sâu bên trong.
          </p>
        </div>

        {/* 5 Elements Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-24">
          {philosophies.map((item, index) => (
            <div key={index} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 text-center group border border-gray-100 hover:-translate-y-1">
              <div className={`w-14 h-14 bg-brand-bg rounded-full flex items-center justify-center mx-auto mb-4 text-brand group-hover:text-white transition-all duration-300 ${item.colorClass}`}>
                {React.cloneElement(item.icon as React.ReactElement, { size: 28 })}
              </div>
              <h3 className={`text-xl font-serif font-bold text-brand mb-2 transition-colors duration-300`}>{item.title}</h3>
              <p className="text-sm text-gray-500 font-medium">{item.desc}</p>
            </div>
          ))}
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
                    An Lành Farm ra đời không chỉ là một thương hiệu trà, mà là một lời nhắc nhở về lối sống chậm. Giữa nhịp sống hối hả của đô thị, chúng tôi khao khát mang đến những tách trà gói trọn hương vị của đất trời, của sương sớm và nắng ấm.
                </p>
                <p className="text-gray-600 leading-relaxed mb-8 text-justify">
                    Mỗi lá thảo mộc được hái, mỗi mẻ sấy được thực hiện, đều chứa đựng tâm huyết của người nông dân Việt, mong muốn gửi gắm sự an lành đến từng tế bào trong cơ thể bạn.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="flex items-start gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="bg-green-100 p-2.5 rounded-lg text-green-600 shrink-0"><Sprout size={20}/></div>
                        <div>
                            <h4 className="font-bold text-gray-800 mb-1">100% Thuần Việt</h4>
                            <p className="text-xs text-gray-500">Nguyên liệu bản địa, phù hợp thể trạng người Việt.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="bg-orange-100 p-2.5 rounded-lg text-orange-600 shrink-0"><Heart size={20}/></div>
                        <div>
                            <h4 className="font-bold text-gray-800 mb-1">Tận Tâm Phụng Sự</h4>
                            <p className="text-xs text-gray-500">Đặt sức khỏe của khách hàng làm kim chỉ nam.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

         {/* Values / Process Section */}
        <div className="bg-white rounded-[2.5rem] p-8 md:p-16 shadow-xl border border-gray-100 relative overflow-hidden">
             {/* Background Pattern */}
             <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand to-brand-accent"></div>
             
             <div className="text-center max-w-3xl mx-auto mb-16 relative z-10">
                <h3 className="text-2xl md:text-4xl font-serif font-bold text-brand mb-4">Cam Kết Từ An Lành Farm</h3>
                <p className="text-gray-500 text-lg">Chất lượng không chỉ là lời nói, đó là hành trình minh bạch từ nông trại đến tách trà trên tay bạn.</p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative z-10">
                 <div className="text-center group">
                    <div className="w-20 h-20 mx-auto bg-green-50 rounded-full flex items-center justify-center text-green-600 mb-6 group-hover:bg-green-600 group-hover:text-white transition-all duration-300 shadow-sm">
                        <Leaf size={36} />
                    </div>
                    <h4 className="text-xl font-bold text-gray-800 mb-3">Nguyên Liệu Sạch</h4>
                    <p className="text-gray-500 leading-relaxed text-sm px-4">
                        Thảo mộc được tại các vùng nguyên liệu chuẩn VietGAP, thu hái đúng thời điểm để giữ trọn dược tính quý giá.
                    </p>
                 </div>

                 <div className="text-center group">
                     <div className="relative">
                        <div className="w-20 h-20 mx-auto bg-amber-50 rounded-full flex items-center justify-center text-amber-600 mb-6 group-hover:bg-amber-600 group-hover:text-white transition-all duration-300 shadow-sm">
                            <ShieldCheck size={36} />
                        </div>
                     </div>
                    <h4 className="text-xl font-bold text-gray-800 mb-3">Công Thức Độc Quyền</h4>
                    <p className="text-gray-500 leading-relaxed text-sm px-4">
                        Sự kết hợp tinh tế giữa y học cổ truyền và nghiên cứu hiện đại, đảm bảo sự cân bằng âm dương theo triết lý Ngũ Hành.
                    </p>
                 </div>

                 <div className="text-center group">
                    <div className="w-20 h-20 mx-auto bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm">
                        <Package size={36} />
                    </div>
                    <h4 className="text-xl font-bold text-gray-800 mb-3">Sản Xuất An Toàn</h4>
                    <p className="text-gray-500 leading-relaxed text-sm px-4">
                        Nhà máy đạt chuẩn ISO 22000, quy trình khép kín đảm bảo vệ sinh an toàn thực phẩm, giữ nguyên hương vị tự nhiên.
                    </p>
                 </div>
             </div>
        </div>
      </div>
    </section>
  );
};
