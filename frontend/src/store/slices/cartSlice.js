/**
 * Cart Slice
 * 
 * Worker: Dev - Cart state management with guest cart support
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cartAPI } from '../../services/api';

// LocalStorage helpers for guest cart
const GUEST_CART_KEY = 'nutty_bites_guest_cart';

const loadGuestCart = () => {
    try {
        const cartData = localStorage.getItem(GUEST_CART_KEY);
        return cartData ? JSON.parse(cartData) : null;
    } catch (error) {
        console.error('Error loading guest cart:', error);
        return null;
    }
};

const saveGuestCart = (cart) => {
    try {
        localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
    } catch (error) {
        console.error('Error saving guest cart:', error);
    }
};

const clearGuestCart = () => {
    try {
        localStorage.removeItem(GUEST_CART_KEY);
    } catch (error) {
        console.error('Error clearing guest cart:', error);
    }
};

// Async Thunks
export const fetchCart = createAsyncThunk(
    'cart/fetchCart',
    async (_, { rejectWithValue }) => {
        try {
            const response = await cartAPI.get();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data);
        }
    }
);

export const addToCart = createAsyncThunk(
    'cart/addToCart',
    async ({ productId, quantity = 1 }, { rejectWithValue }) => {
        try {
            const response = await cartAPI.addItem(productId, quantity);
            return response.data.cart;
        } catch (error) {
            return rejectWithValue(error.response?.data);
        }
    }
);

export const updateCartItem = createAsyncThunk(
    'cart/updateItem',
    async ({ itemId, quantity }, { rejectWithValue }) => {
        try {
            const response = await cartAPI.updateItem(itemId, quantity);
            return response.data.cart;
        } catch (error) {
            return rejectWithValue(error.response?.data);
        }
    }
);

export const removeCartItem = createAsyncThunk(
    'cart/removeItem',
    async (itemId, { rejectWithValue }) => {
        try {
            const response = await cartAPI.removeItem(itemId);
            return response.data.cart;
        } catch (error) {
            return rejectWithValue(error.response?.data);
        }
    }
);

export const clearCart = createAsyncThunk(
    'cart/clearCart',
    async (_, { rejectWithValue }) => {
        try {
            await cartAPI.clear();
            clearGuestCart();
            return null;
        } catch (error) {
            return rejectWithValue(error.response?.data);
        }
    }
);

// Sync guest cart with user cart on login
export const syncGuestCart = createAsyncThunk(
    'cart/syncGuestCart',
    async (_, { rejectWithValue }) => {
        try {
            const guestCart = loadGuestCart();
            if (!guestCart || !guestCart.items || guestCart.items.length === 0) {
                // No guest cart, just fetch user cart
                const response = await cartAPI.get();
                clearGuestCart();
                return response.data;
            }

            // Merge guest cart items with user cart
            for (const item of guestCart.items) {
                await cartAPI.addItem(item.product.id, item.quantity);
            }

            // Fetch updated cart and clear guest cart
            const response = await cartAPI.get();
            clearGuestCart();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data);
        }
    }
);

// Initial State
const initialState = {
    items: [],
    subtotal: 0,
    tax: 0,
    shipping: 0,
    total: 0,
    isLoading: false,
    error: null,
};

// Slice
const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        resetCart: () => initialState,

        // Guest cart operations
        addToGuestCart: (state, action) => {
            const { product, quantity = 1 } = action.payload;
            const existingItem = state.items.find(item => item.product.id === product.id);

            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                state.items.push({
                    id: `guest_${Date.now()}_${product.id}`,
                    product,
                    quantity,
                    price: product.price
                });
            }

            // Recalculate totals
            state.subtotal = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            state.total = state.subtotal + state.tax + state.shipping;

            // Save to localStorage
            saveGuestCart(state);
        },

        updateGuestCartItem: (state, action) => {
            const { itemId, quantity } = action.payload;
            const item = state.items.find(i => i.id === itemId);

            if (item) {
                item.quantity = quantity;

                // Recalculate totals
                state.subtotal = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                state.total = state.subtotal + state.tax + state.shipping;

                // Save to localStorage
                saveGuestCart(state);
            }
        },

        removeGuestCartItem: (state, action) => {
            const itemId = action.payload;
            state.items = state.items.filter(item => item.id !== itemId);

            // Recalculate totals
            state.subtotal = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            state.total = state.subtotal + state.tax + state.shipping;

            // Save to localStorage
            saveGuestCart(state);
        },

        loadGuestCartFromStorage: (state) => {
            const guestCart = loadGuestCart();
            if (guestCart) {
                return { ...state, ...guestCart };
            }
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Cart
            .addCase(fetchCart.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchCart.fulfilled, (state, action) => {
                state.isLoading = false;
                if (action.payload) {
                    state.items = action.payload.items || [];
                    state.subtotal = action.payload.subtotal || 0;
                    state.tax = action.payload.tax || 0;
                    state.shipping = action.payload.shipping || 0;
                    state.total = action.payload.total || 0;
                }
            })
            .addCase(fetchCart.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            // Add to Cart
            .addCase(addToCart.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(addToCart.fulfilled, (state, action) => {
                state.isLoading = false;
                if (action.payload) {
                    state.items = action.payload.items || [];
                    state.subtotal = action.payload.subtotal || 0;
                    state.tax = action.payload.tax || 0;
                    state.shipping = action.payload.shipping || 0;
                    state.total = action.payload.total || 0;
                }
            })
            .addCase(addToCart.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            // Update Cart Item
            .addCase(updateCartItem.fulfilled, (state, action) => {
                if (action.payload) {
                    state.items = action.payload.items || [];
                    state.subtotal = action.payload.subtotal || 0;
                    state.tax = action.payload.tax || 0;
                    state.shipping = action.payload.shipping || 0;
                    state.total = action.payload.total || 0;
                }
            })

            // Remove Cart Item
            .addCase(removeCartItem.fulfilled, (state, action) => {
                if (action.payload) {
                    state.items = action.payload.items || [];
                    state.subtotal = action.payload.subtotal || 0;
                    state.tax = action.payload.tax || 0;
                    state.shipping = action.payload.shipping || 0;
                    state.total = action.payload.total || 0;
                }
            })

            // Clear Cart
            .addCase(clearCart.fulfilled, () => initialState)

            // Sync Guest Cart
            .addCase(syncGuestCart.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(syncGuestCart.fulfilled, (state, action) => {
                state.isLoading = false;
                if (action.payload) {
                    state.items = action.payload.items || [];
                    state.subtotal = action.payload.subtotal || 0;
                    state.tax = action.payload.tax || 0;
                    state.shipping = action.payload.shipping || 0;
                    state.total = action.payload.total || 0;
                }
            })
            .addCase(syncGuestCart.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});

export const {
    resetCart,
    addToGuestCart,
    updateGuestCartItem,
    removeGuestCartItem,
    loadGuestCartFromStorage
} = cartSlice.actions;
export default cartSlice.reducer;
