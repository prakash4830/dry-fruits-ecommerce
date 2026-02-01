/**
 * Products Slice
 * 
 * Worker: Dev - Products state management
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { productsAPI } from '../../services/api';

// Async Thunks
export const fetchProducts = createAsyncThunk(
    'products/fetchAll',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await productsAPI.getAll(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data);
        }
    }
);

export const fetchProductBySlug = createAsyncThunk(
    'products/fetchBySlug',
    async (slug, { rejectWithValue }) => {
        try {
            const response = await productsAPI.getBySlug(slug);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data);
        }
    }
);

export const fetchCategories = createAsyncThunk(
    'products/fetchCategories',
    async (_, { rejectWithValue }) => {
        try {
            const response = await productsAPI.getCategories();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data);
        }
    }
);

export const fetchFeaturedProducts = createAsyncThunk(
    'products/fetchFeatured',
    async (_, { rejectWithValue }) => {
        try {
            const response = await productsAPI.getFeatured();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data);
        }
    }
);

export const fetchBestsellers = createAsyncThunk(
    'products/fetchBestsellers',
    async (_, { rejectWithValue }) => {
        try {
            const response = await productsAPI.getBestsellers();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data);
        }
    }
);

// Initial State
const initialState = {
    products: [],
    currentProduct: null,
    categories: [],
    featured: [],
    bestsellers: [],
    isLoading: false,
    error: null,
    pagination: {
        page: 1,
        totalPages: 1,
        totalItems: 0,
    },
    filters: {
        category: null,
        priceMin: null,
        priceMax: null,
        search: '',
        ordering: '-created_at',
    },
};

// Slice
const productsSlice = createSlice({
    name: 'products',
    initialState,
    reducers: {
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        clearFilters: (state) => {
            state.filters = initialState.filters;
        },
        clearCurrentProduct: (state) => {
            state.currentProduct = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Products
            .addCase(fetchProducts.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.isLoading = false;
                state.products = action.payload.results || action.payload;
                if (action.payload.count) {
                    state.pagination.totalItems = action.payload.count;
                    state.pagination.totalPages = Math.ceil(action.payload.count / 12);
                }
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            // Fetch Product by Slug
            .addCase(fetchProductBySlug.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchProductBySlug.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentProduct = action.payload;
            })
            .addCase(fetchProductBySlug.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            // Fetch Categories
            .addCase(fetchCategories.fulfilled, (state, action) => {
                state.categories = action.payload;
            })

            // Fetch Featured
            .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
                state.featured = action.payload;
            })

            // Fetch Bestsellers
            .addCase(fetchBestsellers.fulfilled, (state, action) => {
                state.bestsellers = action.payload;
            });
    },
});

export const { setFilters, clearFilters, clearCurrentProduct } = productsSlice.actions;
export default productsSlice.reducer;
