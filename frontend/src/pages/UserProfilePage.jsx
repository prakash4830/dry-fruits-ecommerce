/**
 * User Profile Page
 * iOS 26 Liquid Glass design
 * 
 * Worker: Dev - User account management
 */

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { User, MapPin, Lock, LogOut, Plus, Trash2, Edit2 } from 'lucide-react';
import { Button, IconButton } from '../components/ui/Button';
import { GlassCard } from '../components/ui/GlassCard';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { addressesAPI, authAPI } from '../services/api';
import { logout, updateProfile } from '../store/slices/authSlice';
import { useNavigate, Link } from 'react-router-dom';

export function UserProfilePage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useSelector((state) => state.auth);

    const [activeTab, setActiveTab] = useState('profile');
    const [addresses, setAddresses] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Profile Form State
    const [profileData, setProfileData] = useState({
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        email: user?.email || '',
        phone_number: user?.phone_number || '',
    });

    // Password Form State
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        confirm_password: '',
    });

    // Address Form State
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);

    useEffect(() => {
        if (isAuthenticated) {
            loadAddresses();
        }
        if (user) {
            setProfileData({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                email: user.email || '',
                phone_number: user.phone_number || '',
            });
        }
    }, [isAuthenticated, user]);

    const loadAddresses = async () => {
        try {
            const response = await addressesAPI.getAll();
            // Handle both paginated (results) and non-paginated (array) responses
            setAddresses(response.data.results || response.data || []);
        } catch (error) {
            console.error('Failed to load addresses:', error);
            // Fallback to empty array to prevent crash
            setAddresses([]);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await dispatch(updateProfile(profileData)).unwrap();
            alert('Profile updated successfully!');
        } catch (error) {
            alert('Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordData.new_password !== passwordData.confirm_password) {
            alert('New passwords do not match');
            return;
        }

        setIsLoading(true);
        try {
            await authAPI.changePassword({
                old_password: passwordData.current_password,
                new_password: passwordData.new_password,
            });
            alert('Password changed successfully!');
            setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
        } catch (error) {
            alert(error.response?.data?.detail || 'Failed to change password');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddressSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        data.country = 'India'; // Default

        setIsLoading(true);
        try {
            if (editingAddress) {
                await addressesAPI.update(editingAddress.id, data);
            } else {
                await addressesAPI.create(data);
            }
            await loadAddresses();
            setShowAddressForm(false);
            setEditingAddress(null);
        } catch (error) {
            console.error('Failed to save address:', error);
            alert(JSON.stringify(error.response?.data || 'Failed to save address'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteAddress = async (id) => {
        if (!window.confirm('Are you sure you want to delete this address?')) return;
        try {
            await addressesAPI.delete(id);
            loadAddresses();
        } catch (error) {
            console.error('Failed to delete address:', error);
        }
    };

    const handleLogout = () => {
        dispatch(logout());
        navigate('/');
    };

    // Show Login/Register for unauthenticated users
    if (!isAuthenticated) {
        return (
            <div className="container py-20">
                <GlassCard className="max-w-2xl mx-auto p-12 text-center bg-white/40 border-white/20 shadow-2xl">
                    <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                        <User className="w-12 h-12 text-white" />
                    </div>
                    <h1 className="text-4xl font-black mb-4 text-slate-800 tracking-tight">Welcome to Your Profile</h1>
                    <p className="text-slate-600 text-lg mb-10 leading-relaxed">
                        Please sign in to access your account, manage addresses, and view your order history.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Link to="/login">
                            <Button size="lg" className="rounded-xl px-10 py-6 text-lg w-40">
                                Sign In
                            </Button>
                        </Link>
                        <Link to="/register">
                            <Button size="lg" variant="secondary" className="rounded-xl px-10 py-6 text-lg w-40">
                                Sign Up
                            </Button>
                        </Link>
                    </div>
                </GlassCard>
            </div>
        );
    }

    const tabs = [
        { id: 'profile', label: 'Profile Settings', icon: User },
        { id: 'addresses', label: 'Addresses', icon: MapPin },
        { id: 'security', label: 'Security', icon: Lock },
    ];

    return (
        <div className="container py-12">
            <h1 className="text-3xl font-bold mb-8">
                Welcome, {user?.first_name || 'User'}!
            </h1>

            <div className="grid lg:grid-cols-4 gap-8">
                {/* Sidebar */}
                <div>
                    <GlassCard className="p-4 space-y-2 border-white/20 shadow-xl bg-white/40">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
                  ${activeTab === tab.id
                                        ? 'bg-amber-100/80 text-amber-700 shadow-sm border border-amber-200/50'
                                        : 'text-slate-600 hover:text-amber-600 hover:bg-white/40'}
                `}
                            >
                                <tab.icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                                <span className="font-bold text-sm tracking-tight">{tab.label}</span>
                            </button>
                        ))}

                        <div className="py-2">
                            <hr className="border-slate-200/50" />
                        </div>

                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all font-bold text-sm tracking-tight"
                        >
                            <LogOut className="w-5 h-5" />
                            <span>Sign Out Account</span>
                        </button>
                    </GlassCard>
                </div>

                {/* Content */}
                <div className="lg:col-span-3">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        {/* Profile Tab */}
                        {activeTab === 'profile' && (
                            <GlassCard className="p-8 bg-white/40 border-white/20 shadow-2xl">
                                <h2 className="text-2xl font-black mb-8 text-slate-800 tracking-tight">Personal Information</h2>
                                <form onSubmit={handleProfileUpdate} className="space-y-6 max-w-lg">
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input
                                            label="First Name"
                                            className="bg-white/50"
                                            value={profileData.first_name}
                                            onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                                        />
                                        <Input
                                            label="Last Name"
                                            className="bg-white/50"
                                            value={profileData.last_name}
                                            onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
                                        />
                                    </div>
                                    <Input
                                        label="Email Address"
                                        value={profileData.email}
                                        disabled
                                        className="opacity-50 cursor-not-allowed bg-slate-50"
                                    />
                                    <Input
                                        label="Phone Number"
                                        type="tel"
                                        className="bg-white/50"
                                        value={profileData.phone_number}
                                        onChange={(e) => setProfileData({ ...profileData, phone_number: e.target.value })}
                                        placeholder="+91 XXXXX XXXXX"
                                    />
                                    <Button isLoading={isLoading} className="rounded-xl px-10 py-6">Save Changes</Button>
                                </form>
                            </GlassCard>
                        )}

                        {/* Addresses Tab */}
                        {activeTab === 'addresses' && (
                            <div className="space-y-6">
                                {!showAddressForm && (
                                    <>
                                        <div className="flex justify-between items-center">
                                            <h2 className="text-xl font-bold text-slate-800">Saved Addresses</h2>
                                            <Button onClick={() => { setEditingAddress(null); setShowAddressForm(true); }}>
                                                <Plus className="w-4 h-4 mr-2" /> Add New
                                            </Button>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4">
                                            {addresses.map((addr) => (
                                                <GlassCard key={addr.id} className="p-6 relative group">
                                                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <IconButton
                                                            size="sm"
                                                            onClick={() => { setEditingAddress(addr); setShowAddressForm(true); }}
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </IconButton>
                                                        <IconButton
                                                            size="sm"
                                                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                            onClick={() => handleDeleteAddress(addr.id)}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </IconButton>
                                                    </div>

                                                    <div className="flex items-center gap-2 mb-3">
                                                        <span className="font-semibold text-slate-800">{addr.full_name}</span>
                                                        <Badge variant="secondary" className="capitalize">
                                                            {addr.address_type}
                                                        </Badge>
                                                        {addr.is_default && (
                                                            <Badge variant="primary" className="text-xs">
                                                                Primary
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-slate-600 text-sm leading-relaxed">
                                                        {addr.address_line1}{addr.address_line2 && `, ${addr.address_line2}`}
                                                        <br />
                                                        {addr.city}, {addr.state} - {addr.pincode}
                                                    </p>
                                                    <p className="text-slate-500 text-sm mt-2">
                                                        {addr.phone}
                                                    </p>
                                                </GlassCard>
                                            ))}
                                        </div>
                                    </>
                                )}

                                {showAddressForm && (
                                    <GlassCard className="p-8 border-white/20 shadow-2xl bg-white/40">
                                        <h2 className="text-2xl font-black mb-8 tracking-tight">
                                            {editingAddress ? 'Edit Address' : 'Add New Address'}
                                        </h2>
                                        <form onSubmit={handleAddressSubmit} className="space-y-6 max-w-2xl">
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <Input
                                                    name="full_name"
                                                    label="Full Name"
                                                    className="bg-white/50"
                                                    defaultValue={editingAddress?.full_name}
                                                    required
                                                />
                                                <Input
                                                    name="phone"
                                                    label="Phone Number"
                                                    className="bg-white/50"
                                                    defaultValue={editingAddress?.phone}
                                                    required
                                                />
                                            </div>
                                            <Input
                                                name="address_line1"
                                                label="Address Line 1"
                                                className="bg-white/50"
                                                defaultValue={editingAddress?.address_line1}
                                                required
                                            />
                                            <Input
                                                name="address_line2"
                                                label="Address Line 2 (Optional)"
                                                className="bg-white/50"
                                                defaultValue={editingAddress?.address_line2}
                                            />
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                <Input
                                                    name="city"
                                                    label="City"
                                                    className="bg-white/50"
                                                    defaultValue={editingAddress?.city}
                                                    required
                                                />
                                                <Input
                                                    name="state"
                                                    label="State"
                                                    className="bg-white/50"
                                                    defaultValue={editingAddress?.state}
                                                    required
                                                />
                                                <Input
                                                    name="pincode"
                                                    label="Pincode"
                                                    className="bg-white/50"
                                                    defaultValue={editingAddress?.pincode}
                                                    required
                                                />
                                            </div>

                                            {/* Address Type */}
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                    Address Type
                                                </label>
                                                <select
                                                    name="address_type"
                                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                                                    defaultValue={editingAddress?.address_type || 'home'}
                                                >
                                                    <option value="home">Home</option>
                                                    <option value="office">Office</option>
                                                    <option value="other">Other</option>
                                                </select>
                                            </div>

                                            {/* Primary Address Checkbox */}
                                            <div className="flex items-center gap-3 p-4 bg-amber-50/50 rounded-xl border border-amber-200/50">
                                                <input
                                                    type="checkbox"
                                                    name="is_default"
                                                    id="is_default"
                                                    className="w-5 h-5 rounded border-amber-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                                                    defaultChecked={editingAddress?.is_default}
                                                />
                                                <label htmlFor="is_default" className="text-sm font-semibold text-slate-700 cursor-pointer">
                                                    Set as Primary Address
                                                </label>
                                            </div>

                                            <div className="flex gap-4 pt-6">
                                                <Button isLoading={isLoading} className="rounded-xl px-10">Save Address</Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    className="rounded-xl"
                                                    onClick={() => setShowAddressForm(false)}
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        </form>
                                    </GlassCard>
                                )}
                            </div>
                        )}

                        {/* Security Tab */}
                        {activeTab === 'security' && (
                            <GlassCard className="p-8 bg-white/40 border-white/20 shadow-2xl">
                                <h2 className="text-2xl font-black mb-8 text-slate-800 tracking-tight">Security & Password</h2>
                                <form onSubmit={handlePasswordChange} className="space-y-6 max-w-lg">
                                    <Input
                                        type="password"
                                        label="Current Password"
                                        className="bg-white/50"
                                        value={passwordData.current_password}
                                        onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                                        required
                                    />
                                    <div className="space-y-6">
                                        <Input
                                            type="password"
                                            label="New Password"
                                            className="bg-white/50"
                                            value={passwordData.new_password}
                                            onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                                            required
                                        />
                                        <Input
                                            type="password"
                                            label="Confirm New Password"
                                            className="bg-white/50"
                                            value={passwordData.confirm_password}
                                            onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <Button isLoading={isLoading} className="rounded-xl px-10 py-6">Update Password</Button>
                                </form>
                            </GlassCard>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

export default UserProfilePage;
