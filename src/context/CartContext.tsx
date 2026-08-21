'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { OrderItem } from '@/lib/db';

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
      const savedCart = localStorage.getItem('nfc_cart');
      if (savedCart) {
        try {
          setCart(JSON.parse(savedCart));
        } catch (e) {
          console.error('Error parsing cart from localStorage', e);
        }
      }
      setIsInitialized(true);
    }
  }, []);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    if (isInitialized && typeof window !== 'undefined') {
      localStorage.setItem('nfc_cart', JSON.stringify(cart));
    }
  }, [cart, isInitialized]);

  const addToCart = (newItem: Omit<OrderItem, 'id'>) => {
    setCart((prevCart) => {
      // Verificar si ya existe un item idéntico (mismo producto, color y url inicial)
      const existingItemIndex = prevCart.findIndex(
        (item) =>
          item.product_id === newItem.product_id &&
          item.selected_color === newItem.selected_color &&
          item.initial_redirect_url === newItem.initial_redirect_url
      );

      if (existingItemIndex > -1) {
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity += newItem.quantity;
        return updatedCart;
      }

      // De lo contrario, agregar nuevo
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
    setCart((prevCart) =>
      prevCart.map((item) => (item.id === id ? { ...item, quantity } : item))
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
