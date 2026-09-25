'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { dbLocal, OrderItem } from '@/lib/db';
import { track } from '@/lib/fbpixel';
import { trackTikTok } from '@/lib/tiktokpixel';
import { trackGA } from '@/lib/googleanalytics';

interface CartContextType {
  cart: OrderItem[];
  addToCart: (item: Omit<OrderItem, 'id'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Cargar carrito de localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedCart = localStorage.getItem('nfc_cart');
        if (savedCart) {
          setCart(JSON.parse(savedCart));
        }
      } catch (e) {
        console.error('Error parsing cart from localStorage', e);
      }
      setIsInitialized(true);
    }
  }, []);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    if (isInitialized && typeof window !== 'undefined') {
      try {
        localStorage.setItem('nfc_cart', JSON.stringify(cart));
      } catch {
        // Ignorar errores de cuota o modo restringido
      }
    }
  }, [cart, isInitialized]);

  const addToCart = (newItem: Omit<OrderItem, 'id'>) => {
    const availableStock = dbLocal.getProductStock(newItem.product_id);
    if (availableStock <= 0) {
      alert(`Lo sentimos, el producto "${newItem.product_name}" se encuentra AGOTADO (stock 0) y no se puede vender.`);
      return;
    }

    track('AddToCart', {
      content_type: 'product',
      content_ids: [newItem.product_id],
      content_name: newItem.product_name,
      contents: [{ id: newItem.product_id, quantity: newItem.quantity }],
      value: newItem.price * newItem.quantity,
      currency: 'USD',
    });

    trackTikTok('AddToCart', {
      content_type: 'product',
      content_id: newItem.product_id,
      content_name: newItem.product_name,
      quantity: newItem.quantity,
      price: newItem.price,
      value: newItem.price * newItem.quantity,
      currency: 'USD',
    });

    trackGA('add_to_cart', {
      currency: 'USD',
      value: newItem.price * newItem.quantity,
      items: [
        {
          item_id: newItem.product_id,
          item_name: newItem.product_name,
          price: newItem.price,
          quantity: newItem.quantity,
          item_variant: newItem.selected_color || 'Standard',
        },
      ],
    });

    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex(
        (item) =>
          item.product_id === newItem.product_id &&
          item.selected_color === newItem.selected_color &&
          item.initial_redirect_url === newItem.initial_redirect_url
      );

      const existingQty = existingItemIndex > -1 ? prevCart[existingItemIndex].quantity : 0;
      const desiredQty = existingQty + newItem.quantity;

      if (desiredQty > availableStock) {
        alert(`Solo hay ${availableStock} unidad(es) disponible(s) de "${newItem.product_name}". No puedes añadir más al carrito.`);
        return prevCart;
      }

      if (existingItemIndex > -1) {
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity = desiredQty;
        return updatedCart;
      }

      const id = `cart-item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      return [...prevCart, { ...newItem, id } as OrderItem];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }

    const itemToUpdate = cart.find(i => i.id === id);
    if (itemToUpdate) {
      const availableStock = dbLocal.getProductStock(itemToUpdate.product_id);
      if (quantity > availableStock) {
        alert(`Solo hay ${availableStock} unidad(es) disponible(s) en inventario para "${itemToUpdate.product_name}".`);
        return;
      }
    }
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.id !== id) return item;

        // Si es oferta especial de $15, conservar $15
        if (
          item.product_id === 'tarjeta-nfc-bolsillo' &&
          (item.price === 15 || item.product_name?.includes('Oferta Especial'))
        ) {
          return { ...item, quantity, price: 15 };
        }

        // Si tiene precio base, actualizar según la escala de volumen
        if (item.unit_price_base) {
          const extras = (item.logo_price || 0) + (item.qr_price || 0);
          let mult = 1;
          if (quantity >= 10) mult = 0.80;
          else if (quantity >= 5) mult = 0.85;
          else if (quantity >= 3) mult = 0.90;
          return { ...item, quantity, price: (item.unit_price_base + extras) * mult };
        }

        return { ...item, quantity };
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getItemCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
