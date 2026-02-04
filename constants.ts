import { Product } from './types';

// Helper to construct paths
// Vẫn giữ hàm này cho các ảnh SKU Combo (vì chưa có link online), 
// nhưng các ảnh chính đã được thay bằng link trực tiếp.
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
    video: 'https://down-tx-sg.vod.susercontent.com/api/v4/11110105/mms/vn-11110105-6v8gy-mh2wesvpa2h4ee.16000081763180940.mp4',
    image: 'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mjnn68tjn4zq49.webp',
    gallery: [
      'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mj3ndeivdtzb72.webp', // 2
      'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mj3ndeiv2lflcd.webp', // 3
      'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mj3nf1qeqcjl12.webp', // 4
      'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mj3nf4mikj5ued.webp', // 5
      'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mj3nf7mvft3ad9.webp', // 6
      'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mj3ngcbsao059b.webp', // 7
      'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mj3ngf41w4jo29.webp', // 8
      'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mj3ngi3w9lad8a.webp', // 9
    ],
    skuImages: {
      // Vì bạn chưa gửi link cho ảnh SKU Combo, mình vẫn giữ đường dẫn cũ
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
    video: 'https://down-zl-sg.vod.susercontent.com/api/v4/11110105/mms/vn-11110105-6v8gy-mjpc4thy1a86cd.16000101768897615.mp4',
    image: 'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mjzbhsuihi4n00.webp',
    gallery: [
      'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mjfi5ns2wgzp6f.webp', // 2
      'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mjfi5qg7epl171.webp', // 3
      'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mjfi95dk97utb9.webp', // 4
      'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mjfi98qpp5ad76.webp', // 5
      'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mjfi9b33bmyr1c.webp', // 6
      'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mj3ngcbsao059b.webp', // 7 (dùng chung)
      'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mj3ngf41w4jo29.webp', // 8 (dùng chung)
      'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mj3ngi3w9lad8a.webp', // 9 (dùng chung)
    ],
    skuImages: {
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
    video: '', // Chưa có video
    image: 'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mjtloy00b2875d.webp',
    gallery: [
      'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mj3oz63lkpoj7e.webp', // 2
      'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mj3oz62rx62t82.webp', // 3
      'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mj3oz62sjn5wd2.webp', // 4
      'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mj3oz62zj2tc5a.webp', // 5
      'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mj3oz62rkiyr3b.webp', // 6
      'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mj3ngcbsao059b.webp', // 7 (dùng chung)
      'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mj3ngf41w4jo29.webp', // 8 (dùng chung)
      'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mj3ngi3w9lad8a.webp', // 9 (dùng chung)
    ],
    skuImages: {
      combo2: getPath('an-hoa', 'sku combo 2.png'),
      combo3: getPath('an-hoa', 'sku combo 3.png')
    }
  }
];
