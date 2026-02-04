export interface Product {
  id: string;
  name: string;
  slogan: string;
  element: 'Mộc' | 'Thổ' | 'Kim' | 'Thủy' | 'Hỏa'; // Ngũ hành
  time: string; // Thời điểm dùng
  description: string;
  ingredients: string[];
  benefits: string[];
  price: number;
  colorClass: string; // Tailwind color class for accents
  image: string; // Thumbnail main image
  video?: string; // Video path (1.mp4)
  gallery: string[]; // Additional descriptive images
  skuImages: {
    combo2: string; // Image for 2 box combo
    combo3: string; // Image for 3 box combo
  };
}

export interface CartItem extends Product {
  quantity: number;
  variantName?: string; // e.g., "Combo 2 Hộp"
  originalPrice?: number;
}

export interface OrderForm {
  fullName: string;
  phone: string;
  address: string;
  note?: string;
}

export interface OrderLookupResult {
  id: string;
  status: 'pending' | 'confirmed' | 'shipping' | 'completed' | 'cancelled';
  statusText: string;
  customerName: string;
  total: number;
  createdAt: string;
  items: string[]; // Simplified list of item names
}