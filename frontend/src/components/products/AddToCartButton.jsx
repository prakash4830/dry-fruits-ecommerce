import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Plus, Minus, Check } from 'lucide-react';
import { Button } from '../ui/Button';
import { addToCart, addToGuestCart, updateCartItem, updateGuestCartItem, removeGuestCartItem, removeCartItem } from '../../store/slices/cartSlice';

export function AddToCartButton({ product, className = '' }) {
    const dispatch = useDispatch();
    const buttonRef = useRef(null);
    const [flyingImage, setFlyingImage] = useState(null);

    const { items: cartItems } = useSelector((state) => state.cart);
    const { isAuthenticated } = useSelector((state) => state.auth);

    // Check if product is in cart
    const cartItem = cartItems.find(item => item.product.id === product.id);
    const quantity = cartItem ? cartItem.quantity : 0;
    const isInCart = quantity > 0;

    // Handle Quantity Changes
    const updateQuantity = (newQty) => {
        if (!isAuthenticated) {
            // Guest Logic
            if (newQty <= 0) {
                dispatch(removeGuestCartItem(cartItem.id));
            } else {
                // For guest cart, we set the absolute quantity, not delta
                dispatch(updateGuestCartItem({ itemId: cartItem.id, quantity: newQty }));
            }
        } else {
            // Auth Logic
            if (newQty <= 0) {
                // The exported thunk is removeCartItem, but we also imported something called removeFromCartProp? 
                // Let's check imports. Wait, I added removeFromCartProp in my thought process but not in the code.
                // The slice exports 'removeCartItem'.
                dispatch(removeCartItem(cartItem.id));
            } else {
                dispatch(updateCartItem({ itemId: cartItem.id, quantity: newQty }));
            }
        }
    };

    const handleAddToCart = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Trigger Animation
        triggerFlyingAnimation(e);

        // Add to Cart Logic
        if (!isAuthenticated) {
            dispatch(addToGuestCart({ product, quantity: 1 }));
        } else {
            await dispatch(addToCart({ productId: product.id, quantity: 1 }));
        }
    };

    const triggerFlyingAnimation = (e) => {
        const buttonRect = buttonRef.current.getBoundingClientRect();
        const targetElement = document.getElementById('nav-cart-icon');

        if (!targetElement) return;

        const targetRect = targetElement.getBoundingClientRect();

        // Create animation state
        setFlyingImage({
            startX: buttonRect.left + buttonRect.width / 2,
            startY: buttonRect.top + buttonRect.height / 2,
            targetX: targetRect.left + targetRect.width / 2,
            targetY: targetRect.top + targetRect.height / 2,
            image: product.primary_image || `https://picsum.photos/seed/${product.id}/200/200`
        });

        // Cleanup after animation
        setTimeout(() => {
            setFlyingImage(null);
        }, 1500);
    };

    return (
        <>
            <div ref={buttonRef} className={className}>
                <AnimatePresence mode="wait">
                    {!isInCart ? (
                        <motion.div
                            key="add-button"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.2 }}
                            layout
                        >
                            <Button
                                variant="primary"
                                className="w-full rounded-xl py-6 shadow-amber-500/10 group relative overflow-hidden"
                                disabled={!product.is_in_stock}
                                onClick={handleAddToCart}
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    <ShoppingCart className="w-4 h-4" />
                                    {product.is_in_stock ? 'Add to Cart' : 'Out of Stock'}
                                </span>
                            </Button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="qty-controls"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            layout
                            className="bg-amber-50 border border-amber-200 rounded-xl p-1 flex items-center justify-between shadow-sm"
                        >
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) => {
                                    e.preventDefault();
                                    updateQuantity(quantity - 1);
                                }}
                                className="w-10 h-10 flex items-center justify-center rounded-lg bg-white text-slate-600 hover:bg-amber-100 transition-colors shadow-sm"
                            >
                                <Minus className="w-4 h-4" />
                            </motion.button>

                            <motion.span
                                key={quantity}
                                initial={{ y: -10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="font-bold text-slate-800 w-8 text-center"
                            >
                                {quantity}
                            </motion.span>

                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) => {
                                    e.preventDefault();
                                    updateQuantity(quantity + 1);
                                    triggerFlyingAnimation(e);
                                }}
                                disabled={quantity >= product.stock}
                                className="w-10 h-10 flex items-center justify-center rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Plus className="w-4 h-4" />
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Flying Image Portal */}
            {typeof document !== 'undefined' && createPortal(
                <AnimatePresence>
                    {flyingImage && (
                        <motion.img
                            src={flyingImage.image}
                            initial={{
                                position: 'fixed',
                                left: flyingImage.startX,
                                top: flyingImage.startY,
                                width: 100,
                                height: 100,
                                borderRadius: '50%',
                                zIndex: 9999,
                                opacity: 1,
                                scale: 1,
                                pointerEvents: 'none'
                            }}
                            animate={{
                                left: flyingImage.targetX,
                                top: flyingImage.targetY,
                                width: 30,
                                height: 30,
                                opacity: 0.5,
                                scale: 0.5
                            }}
                            exit={{ opacity: 0 }}
                            transition={{
                                duration: 0.8,
                                ease: [0.2, 0.8, 0.2, 1]
                            }}
                            className="shadow-xl border-4 border-white object-cover"
                        />
                    )}
                </AnimatePresence>,
                document.body
            )}
        </>
    );
}
