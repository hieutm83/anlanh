import React, { useState, useEffect } from 'react';
import { Header, Footer } from './components/Layout';
import { Hero, BrandStory } from './components/Hero';
import { VoucherSection } from './components/Vouchers';
import { ProductList } from './components/Products';
import { CartSidebar } from './components/Cart';
import { OrderLookup } from './components/OrderLookup';
import { Product, CartItem } from './types';

const App: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLookupOpen, setIsLookupOpen] = useState(false);

  // Load cart from local storage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('anlanh_cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem('anlanh_cart', JSON.stringify(cart));
  }, [cart]);

  // Revised AddToCart to ensure unique IDs for cart items
  const addToCartSafe = (product: Product, quantity: number = 1, variantName?: string, priceOverride?: number) => {
      setCart(prev => {
          const uniqueId = variantName ? `${product.id}-${variantName.replace(/\s+/g, '-').toLowerCase()}` : product.id;
          
          const existing = prev.find(item => item.id === uniqueId);
          
          if (existing) {
              return prev.map(item => item.id === uniqueId ? { ...item, quantity: item.quantity + 1 } : item);
          }
          
          return [...prev, {
              ...product,
              id: uniqueId, // Override ID for cart uniqueness
              quantity,
              variantName,
              price: priceOverride || product.price
          }];
      });
      setIsCartOpen(true);
  }

  const removeUniqueFromCart = (uniqueId: string) => {
      setCart(prev => prev.filter(item => item.id !== uniqueId));
  }
  
  const updateQuantityUnique = (uniqueId: string, delta: number) => {
      setCart(prev => prev.map(item => {
        if (item.id === uniqueId) {
          return { ...item, quantity: Math.max(1, item.quantity + delta) };
        }
        return item;
      }));
  }

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="font-sans antialiased text-gray-800 bg-white">
      <Header 
        cartCount={cartCount} 
        onOpenCart={() => setIsCartOpen(true)}
        onOpenLookup={() => setIsLookupOpen(true)}
      />
      
      <main>
        <Hero />
        <BrandStory />
        <VoucherSection />
        <ProductList onAddToCart={addToCartSafe} />
      </main>

      <Footer />

      <CartSidebar 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        cart={cart}
        onRemove={removeUniqueFromCart}
        onUpdateQuantity={updateQuantityUnique}
        onClearCart={clearCart}
      />

      <OrderLookup 
        isOpen={isLookupOpen}
        onClose={() => setIsLookupOpen(false)}
      />
    </div>
  );
};

export default App;