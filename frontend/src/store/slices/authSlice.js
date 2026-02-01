/**
 * Auth Slice
 * 
 * Worker: Dev - Authentication state management
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI, cartAPI } from '../../services/api';

// Async Thunks
export const login = createAsyncThunk(
    'auth/login',
    async ({ email, password }, { rejectWithValue, dispatch }) => {
        try {
            const response = await authAPI.login(email, password);
            const { access, refresh } = response.data;

            // Store tokens
            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);

            // Get user profile
            const profileResponse = await authAPI.getProfile();

            // Merge cart after login
            try {
                await cartAPI.merge();
            } catch { }

            return profileResponse.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.detail || 'Login failed'
            );
        }
    }
);

export const register = createAsyncThunk(
    'auth/register',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await authAPI.register(userData);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data || 'Registration failed'
            );
        }
    }
);

export const fetchProfile = createAsyncThunk(
    'auth/fetchProfile',
    async (_, { rejectWithValue }) => {
        try {
            const response = await authAPI.getProfile();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data);
        }
    }
);

export const updateProfile = createAsyncThunk(
    'auth/updateProfile',
    async (data, { rejectWithValue }) => {
        try {
            const response = await authAPI.updateProfile(data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data);
        }
    }
);

// Initial State
const initialState = {
    user: null,
    isAuthenticated: !!localStorage.getItem('access_token'),
    isLoading: false,
    error: null,
};

// Slice
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.error = null;
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(login.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.user = action.payload;
            })
            .addCase(login.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            // Register
            .addCase(register.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(register.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(register.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            // Fetch Profile
            .addCase(fetchProfile.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchProfile.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
            })
            .addCase(fetchProfile.rejected, (state) => {
                state.isLoading = false;
                state.isAuthenticated = false;
                state.user = null;
            })

            // Update Profile
            .addCase(updateProfile.fulfilled, (state, action) => {
                state.user = action.payload;
            });
    },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
