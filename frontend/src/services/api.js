/**
 * API Service
 * Axios instance with interceptors
 * 
 * Worker: Dev - API client configuration
 */

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If 401 and not already retrying
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refresh_token');

                if (refreshToken) {
                    const response = await axios.post(`${API_URL}/auth/refresh/`, {
                        refresh: refreshToken,
                    });

                    const { access } = response.data;
                    localStorage.setItem('access_token', access);

                    originalRequest.headers.Authorization = `Bearer ${access}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                // Refresh failed - logout user
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

export default api;

// Auth API
export const authAPI = {
    login: (email, password) =>
        api.post('/auth/login/', { email, password }),

    register: (data) =>
        api.post('/auth/register/', data),

    getProfile: () =>
        api.get('/auth/me/'),

    updateProfile: (data) =>
        api.put('/auth/me/', data),

    changePassword: (data) =>
        api.post('/auth/password/change/', data),

    resetPassword: (email) =>
        api.post('/auth/password/reset/', { email }),
};

// Products API
export const productsAPI = {
    getAll: (params) =>
        api.get('/products/', { params }),

    getBySlug: (slug) =>
        api.get(`/products/${slug}/`),

    getCategories: () =>
        api.get('/products/categories/'),

    getFeatured: () =>
        api.get('/products/featured/'),

    getBestsellers: () =>
        api.get('/products/bestsellers/'),
};

// Cart API
export const cartAPI = {
    get: () =>
        api.get('/cart/'),

    addItem: (productId, quantity = 1) =>
        api.post('/cart/add/', { product_id: productId, quantity }),

    updateItem: (itemId, quantity) =>
        api.put(`/cart/items/${itemId}/`, { quantity }),

    removeItem: (itemId) =>
        api.delete(`/cart/items/${itemId}/`),

    clear: () =>
        api.delete('/cart/'),

    merge: () =>
        api.post('/cart/merge/'),
};

// Orders API
export const ordersAPI = {
    getAll: () =>
        api.get('/orders/'),

    getById: (id) =>
        api.get(`/orders/${id}/`),

    create: (addressId, billingAddressId, couponCode, customerNotes = '') =>
        api.post('/orders/create/', {
            address_id: addressId,
            billing_address_id: billingAddressId,
            coupon_code: couponCode,
            customer_notes: customerNotes
        }),

    validateCoupon: (code, total) =>
        api.post('/orders/validate-coupon/', { code, total }),

    createPayment: (orderId) =>
        api.post('/orders/payments/create/', { order_id: orderId }),

    verifyPayment: (data) =>
        api.post('/orders/payments/verify/', data),

    downloadInvoice: (id) =>
        api.get(`/orders/${id}/invoice/`, { responseType: 'blob' }),
};

// Addresses API
export const addressesAPI = {
    getAll: () =>
        api.get('/auth/addresses/'),

    create: (data) =>
        api.post('/auth/addresses/', data),

    update: (id, data) =>
        api.put(`/auth/addresses/${id}/`, data),

    delete: (id) =>
        api.delete(`/auth/addresses/${id}/`),
};
