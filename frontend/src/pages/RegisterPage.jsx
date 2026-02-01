/**
 * Register Page
 * iOS 26 Liquid Glass design
 * 
 * Worker: Dev - User registration
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { GlassCard } from '../components/ui/GlassCard';
import { register, clearError, login } from '../store/slices/authSlice';

export function RegisterPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    const { isAuthenticated, isLoading, error } = useSelector((state) => state.auth);

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        confirm_password: '',
    });

    const [validationError, setValidationError] = useState('');

    const from = location.search.split('redirect=')[1] || '/';

    useEffect(() => {
        if (isAuthenticated) {
            navigate(from);
        }
        return () => dispatch(clearError());
    }, [isAuthenticated, navigate, from, dispatch]);

    const isPasswordValid = () => {
        const p = formData.password;
        return (
            p.length >= 8 &&
            p.length <= 16 &&
            /[A-Z]/.test(p) &&
            /[a-z]/.test(p) &&
            /[0-9]/.test(p) &&
            /[!@#$%^&*(),.?":{}|<>]/.test(p)
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setValidationError('');

        if (formData.password !== formData.confirm_password) {
            setValidationError('Passwords do not match');
            return;
        }

        if (!isPasswordValid()) {
            setValidationError('Please meet all password requirements.');
            return;
        }

        // Register
        const resultAction = await dispatch(register({
            first_name: formData.first_name,
            last_name: formData.last_name,
            email: formData.email,
            password: formData.password,
            password_confirm: formData.confirm_password,
        }));

        if (register.fulfilled.match(resultAction)) {
            // Auto login after success
            dispatch(login({
                email: formData.email,
                password: formData.password
            }));
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
                    <h1 className="text-3xl font-bold mb-2 text-slate-900">Create Account</h1>
                    <p className="text-slate-500">
                        Join Nutty Bites for premium dry fruits
                    </p>
                </div>

                <GlassCard className="p-8 border-white/20 shadow-2xl bg-white/40 backdrop-blur-2xl">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {(error || validationError) && (
                            <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-lg flex flex-col gap-1 text-sm">
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                    <span className="font-semibold">Registration Failed</span>
                                </div>
                                <div className="pl-6">
                                    {validationError && <p>{validationError}</p>}
                                    {error && (typeof error === 'string' ? (
                                        <p>{error}</p>
                                    ) : (
                                        <ul className="list-disc pl-2">
                                            {Object.entries(error).map(([key, messages]) => (
                                                <li key={key}>
                                                    <span className="capitalize">{key.replace('_', ' ')}</span>: {' '}
                                                    {Array.isArray(messages) ? messages.join(' ') : messages}
                                                </li>
                                            ))}
                                        </ul>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                name="first_name"
                                label="First Name"
                                value={formData.first_name}
                                onChange={handleChange}
                                required
                            />
                            <Input
                                name="last_name"
                                label="Last Name"
                                value={formData.last_name}
                                onChange={handleChange}
                                required
                            />
                        </div>

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
                            {/* Password Strength Checklist */}
                            {formData.password && (
                                <div className="mt-2 text-xs grid grid-cols-2 gap-x-4 gap-y-1 p-3 bg-white/40 rounded-lg">
                                    <PasswordCriterion met={formData.password.length >= 8 && formData.password.length <= 16} label="8-16 Characters" />
                                    <PasswordCriterion met={/[A-Z]/.test(formData.password)} label="One Uppercase" />
                                    <PasswordCriterion met={/[a-z]/.test(formData.password)} label="One Lowercase" />
                                    <PasswordCriterion met={/[0-9]/.test(formData.password)} label="One Number" />
                                    <PasswordCriterion met={/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)} label="One Special Char" />
                                </div>
                            )}
                        </div>

                        <Input
                            name="confirm_password"
                            type="password"
                            label="Confirm Password"
                            icon={<Lock className="w-4 h-4" />}
                            value={formData.confirm_password}
                            onChange={handleChange}
                            required
                        />

                        <Button
                            className="w-full mt-4 py-7 rounded-2xl text-lg shadow-lg shadow-amber-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                            size="lg"
                            isLoading={isLoading}
                            disabled={!isPasswordValid()}
                        >
                            Create Account
                            <ArrowRight className="w-5 h-5 ml-2" />
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
                    Already have an account?{' '}
                    <Link to={`/login?redirect=${from}`} className="text-amber-600 hover:text-amber-700 font-semibold">
                        Sign In
                    </Link>
                </p>
            </motion.div>
        </div >
    );
}

function PasswordCriterion({ met, label }) {
    return (
        <div className={`flex items-center gap-1.5 transition-colors ${met ? 'text-green-600' : 'text-slate-400'}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${met ? 'bg-green-500' : 'bg-slate-300'}`} />
            <span>{label}</span>
        </div>
    );
}

export default RegisterPage;
