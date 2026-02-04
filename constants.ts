import { Product } from './types';

// Helper to construct paths
// Lưu ý: Đảm bảo bạn đã đổi tên folder trong public/image thành: thu-da, khoi-an, an-hoa
const getPath = (folder: string, file: string) => `/image/${folder}/${file}`;

export const PRODUCTS: Product[] = [
  {
    id: 'thu-da',
    name: 'Trà Thư Dạ',
    slogan: 'Chiếc Chăn Mềm Cho Tâm Trí',
    element: 'Thủy',
    time: 'Buổi tối',
    description: 'Giúp cơ thể thả lỏng, tâm trí dịu lại để giấc ngủ đến tự nhiên. Sự kết hợp hoàn hảo của Lạc tiên, Tâm sen và các thảo mộc dưỡng tâm.',
    ingredients: ['Lạc tiên', 'Lá vông', 'Hoàng cầm', 'Cà gai leo', 'Tâm sen', 'Thảo quyết minh', 'Cỏ ngọt'],
    benefits: ['Thư giãn thần kinh', 'Ngủ sâu, ngon giấc', 'Giảm căng thẳng mệt mỏi'],
    price: 139000,
    colorClass: 'text-indigo-800 bg-indigo-50 border-indigo-200',
    video: '', // Chưa có file video, để trống
    image: getPath('thu-da', '1.jpeg'), // Ảnh đại diện lấy ảnh số 1
    gallery: [
      getPath('thu-da', '1.jpeg'),
      getPath('thu-da', '2.jpeg'),
      getPath('thu-da', '3.jpeg'),
      getPath('thu-da', '4.jpeg'),
      getPath('thu-da', '5.jpeg'),
      getPath('thu-da', '6.jpeg'),
      getPath('thu-da', '7.jpeg'),
      getPath('thu-da', '8.jpeg'),
      getPath('thu-da', '9.jpeg'),
    ],
    skuImages: {
      // Dựa trên file upload: Thư dạ dùng đuôi .png
      combo2: getPath('thu-da', 'sku combo 2.png'),
      combo3: getPath('thu-da', 'sku combo 3.png')
    }
  },
  {
    id: 'khoi-an',
    name: 'Trà Khởi An',
    slogan: 'Khởi đầu an nhiên',
    element: 'Mộc',
    time: 'Buổi sáng',
    description: 'Giúp mát gan, thanh lọc, khơi dậy năng lượng trong lành cho ngày mới. Vị ngọt dịu từ Cỏ ngọt và hương thơm thảo mộc tự nhiên.',
    ingredients: ['Cà gai leo', 'Diệp hạ châu', 'Rau má', 'Lá vằng', 'Thảo quyết minh', 'Cỏ ngọt'],
    benefits: ['Thanh gan, giải độc', 'Giảm nóng trong', 'Khởi đầu nhẹ nhàng', 'Hỗ trợ chức năng gan'],
    price: 139000,
    colorClass: 'text-green-600 bg-green-50 border-green-200',
    video: '',
    image: getPath('khoi-an', '1.jpeg'),
    gallery: [
      getPath('khoi-an', '1.jpeg'), 
      getPath('khoi-an', '2.jpeg'), 
      getPath('khoi-an', '3.jpeg'), 
      getPath('khoi-an', '4.jpeg'), 
      getPath('khoi-an', '5.jpeg'), 
      getPath('khoi-an', '6.jpeg'), 
      getPath('khoi-an', '7.jpeg'),
      getPath('khoi-an', '8.jpeg'),
      getPath('khoi-an', '9.jpeg'),
    ],
    skuImages: {
      // Dựa trên file upload: Khởi an dùng đuôi .jpeg
      combo2: getPath('khoi-an', 'sku combo 2.jpeg'),
      combo3: getPath('khoi-an', 'sku combo 3.jpeg')
    }
  },
  {
    id: 'an-hoa',
    name: 'Trà An Hòa',
    slogan: 'Uống lành, Sống an, Giữ hòa',
    element: 'Thổ',
    time: 'Sau bữa ăn',
    description: 'Trà chuyển hóa & detox, giúp kiểm soát mỡ, cân nặng và hỗ trợ tiêu hóa. Vị thanh dịu, thoáng ngọt nhẹ.',
    ingredients: ['Lá ổi non', 'Lá sen', 'Giảo cổ lam', 'Thảo quyết minh', 'Trần bì', 'Gừng sao', 'Sơn tra', 'Cỏ ngọt'],
    benefits: ['Hỗ trợ giảm mỡ máu', 'Thanh lọc cơ thể', 'Giảm cảm giác nặng bụng', 'Cải thiện vóc dáng'],
    price: 139000,
    colorClass: 'text-lime-600 bg-lime-50 border-lime-200',
    video: '',
    image: getPath('an-hoa', '1.jpeg'),
    gallery: [
      getPath('an-hoa', '1.jpeg'), 
      getPath('an-hoa', '2.jpeg'), 
      getPath('an-hoa', '3.jpeg'), 
      getPath('an-hoa', '4.jpeg'), 
      getPath('an-hoa', '5.jpeg'), 
      getPath('an-hoa', '6.jpeg'), 
      getPath('an-hoa', '7.jpeg'),
      getPath('an-hoa', '8.jpeg'),
      getPath('an-hoa', '9.jpeg'),
    ],
    skuImages: {
      // Dựa trên file upload: An hòa dùng đuôi .png
      combo2: getPath('an-hoa', 'sku combo 2.png'),
      combo3: getPath('an-hoa', 'sku combo 3.png')
    }
  }
];