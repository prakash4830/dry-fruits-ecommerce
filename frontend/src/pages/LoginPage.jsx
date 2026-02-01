/**
 * Login Page
 * iOS 26 Liquid Glass design
 * 
 * Worker: Dev - User authentication
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { GlassCard } from '../components/ui/GlassCard';
import { login, clearError } from '../store/slices/authSlice';
import { syncGuestCart } from '../store/slices/cartSlice';

export function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    const { isAuthenticated, isLoading, error } = useSelector((state) => state.auth);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    // Get refund redirect path
    const from = location.search.split('redirect=')[1] || '/';

    useEffect(() => {
        if (isAuthenticated) {
            navigate(from);
        }
        return () => dispatch(clearError());
    }, [isAuthenticated, navigate, from, dispatch]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await dispatch(login(formData));
        if (login.fulfilled.match(result)) {
            dispatch(syncGuestCart());
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="container min-h-[80vh] flex items-center justify-center py-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="text-center mb-8">
                    <span className="text-4xl mb-4 block">👋</span>
                    <h1 className="text-3xl font-bold mb-2 text-slate-900">Welcome Back</h1>
                    <p className="text-slate-500">
                        Sign in to access your account and orders
                    </p>
                </div>

                <GlassCard className="p-8 border-white/20 shadow-2xl bg-white/40 backdrop-blur-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-lg flex items-center gap-3 text-sm">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        <Input
                            name="email"
                            type="email"
                            label="Email Address"
                            icon={<Mail className="w-4 h-4" />}
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />

                        <div>
                            <Input
                                name="password"
                                type="password"
                                label="Password"
                                icon={<Lock className="w-4 h-4" />}
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                            <div className="flex justify-end mt-1">
                                <Link to="/forgot-password" className="text-xs text-amber-600 hover:text-amber-700 font-medium">
                                    Forgot password?
                                </Link>
                            </div>
                        </div>

                        <Button className="w-full py-7 rounded-2xl text-lg shadow-lg shadow-amber-500/10" size="lg" isLoading={isLoading}>
                            Sign In
                            <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                        </Button>

                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200/50" />
                            </div>
                            <div className="relative flex justify-center text-xs">
                                <span className="bg-transparent px-2 text-slate-400 font-bold uppercase tracking-widest">
                                    Trusted Login
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Button type="button" variant="secondary" className="w-full rounded-xl border-slate-200 py-3">
                                Google
                            </Button>
                            <Button type="button" variant="secondary" className="w-full rounded-xl border-slate-200 py-3">
                                Apple ID
                            </Button>
                        </div>
                    </form>
                </GlassCard>

                <p className="text-center mt-6 text-slate-500">
                    Don't have an account?{' '}
                    <Link to={`/register?redirect=${from}`} className="text-amber-600 hover:text-amber-700 font-semibold">
                        Create Account
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}

export default LoginPage;
