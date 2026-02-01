import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowRight, User, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { login, register, clearError } from '../../store/slices/authSlice';
import { syncGuestCart } from '../../store/slices/cartSlice';

export function AuthModal({ isOpen, onClose, onSuccess }) {
    const dispatch = useDispatch();
    const { isLoading, error } = useSelector((state) => state.auth);
    const [mode, setMode] = useState('login'); // 'login' | 'register'

    // Form States
    const [loginData, setLoginData] = useState({ email: '', password: '' });
    const [registerData, setRegisterData] = useState({
        first_name: '', last_name: '', email: '', password: '', confirm_password: ''
    });
    const [validationError, setValidationError] = useState('');

    const handleSwitchMode = (newMode) => {
        setMode(newMode);
        setValidationError('');
        dispatch(clearError());
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        const result = await dispatch(login(loginData));
        if (login.fulfilled.match(result)) {
            await dispatch(syncGuestCart());
            onSuccess?.();
            onClose();
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setValidationError('');

        if (registerData.password !== registerData.confirm_password) {
            setValidationError('Passwords do not match');
            return;
        }

        const result = await dispatch(register({
            first_name: registerData.first_name,
            last_name: registerData.last_name,
            email: registerData.email,
            password: registerData.password,
        }));

        if (register.fulfilled.match(result)) {
            // Auto login
            await dispatch(login({
                email: registerData.email,
                password: registerData.password
            }));
            await dispatch(syncGuestCart());
            onSuccess?.();
            onClose();
        }
    };

    const handleInputChange = (e, formSetter, isLogin) => {
        const { name, value } = e.target;
        formSetter(prev => ({ ...prev, [name]: value }));
        // Clear errors if any
        if (validationError) setValidationError('');
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={mode === 'login' ? 'Welcome Back' : 'Create Account'}
        >
            <div className="space-y-6">
                {/* Tabs */}
                <div className="flex p-1 bg-slate-100 rounded-xl">
                    <button
                        onClick={() => handleSwitchMode('login')}
                        className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${mode === 'login' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Sign In
                    </button>
                    <button
                        onClick={() => handleSwitchMode('register')}
                        className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${mode === 'register' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Sign Up
                    </button>
                </div>

                {/* Error Display */}
                {(error || validationError) && (
                    <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-lg flex items-center gap-3 text-sm">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {validationError || error}
                    </div>
                )}

                {/* Forms */}
                <AnimatePresence mode="wait">
                    {mode === 'login' ? (
                        <motion.form
                            key="login"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            onSubmit={handleLoginSubmit}
                            className="space-y-4"
                        >
                            <Input
                                name="email"
                                type="email"
                                label="Email Address"
                                icon={<Mail className="w-4 h-4" />}
                                value={loginData.email}
                                onChange={(e) => handleInputChange(e, setLoginData)}
                                required
                            />
                            <Input
                                name="password"
                                type="password"
                                label="Password"
                                icon={<Lock className="w-4 h-4" />}
                                value={loginData.password}
                                onChange={(e) => handleInputChange(e, setLoginData)}
                                required
                            />

                            <Button className="w-full py-4 rounded-xl shadow-lg shadow-amber-500/10" size="lg" isLoading={isLoading}>
                                Sign In
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                        </motion.form>
                    ) : (
                        <motion.form
                            key="register"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            onSubmit={handleRegisterSubmit}
                            className="space-y-4"
                        >
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    name="first_name"
                                    label="First Name"
                                    placeholder="John"
                                    value={registerData.first_name}
                                    onChange={(e) => handleInputChange(e, setRegisterData)}
                                    required
                                />
                                <Input
                                    name="last_name"
                                    label="Last Name"
                                    placeholder="Doe"
                                    value={registerData.last_name}
                                    onChange={(e) => handleInputChange(e, setRegisterData)}
                                    required
                                />
                            </div>
                            <Input
                                name="email"
                                type="email"
                                label="Email Address"
                                icon={<Mail className="w-4 h-4" />}
                                value={registerData.email}
                                onChange={(e) => handleInputChange(e, setRegisterData)}
                                required
                            />
                            <Input
                                name="password"
                                type="password"
                                label="Password"
                                icon={<Lock className="w-4 h-4" />}
                                value={registerData.password}
                                onChange={(e) => handleInputChange(e, setRegisterData)}
                                required
                            />
                            <Input
                                name="confirm_password"
                                type="password"
                                label="Confirm Password"
                                icon={<Lock className="w-4 h-4" />}
                                value={registerData.confirm_password}
                                onChange={(e) => handleInputChange(e, setRegisterData)}
                                required
                            />

                            <Button className="w-full py-4 rounded-xl shadow-lg shadow-amber-500/10" size="lg" isLoading={isLoading}>
                                Create Account
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                        </motion.form>
                    )}
                </AnimatePresence>

                {/* Social Login */}
                <div className="relative pt-2">
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200/50" />
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="bg-white px-2 text-slate-400 font-bold uppercase tracking-widest">
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
                </div>
            </div>
        </Modal>
    );
}
