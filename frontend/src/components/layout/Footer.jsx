/**
 * Footer Component
 * 
 * Worker: Dev - Site footer
 */

import { Link } from 'react-router-dom';
import {
    Mail,
    Phone,
    MapPin,
    Facebook,
    Instagram,
    Twitter
} from 'lucide-react';
import { Logo } from '../ui/Logo';

const SocialIcon = ({ icon: Icon }) => (
    <a href="#" className="p-2 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 hover:text-amber-700 transition-colors">
        <Icon className="w-5 h-5" />
    </a>
);

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="mt-20 border-t border-slate-200 bg-white/40 backdrop-blur-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-dots opacity-20 pointer-events-none" />
            <div className="container relative z-10 pt-20 pb-32">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

                    {/* Brand */}
                    <div className="space-y-6 mt-6">
                        <Link to="/" className="flex items-center">
                            <Logo variant="footer" />
                        </Link>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            Premium dry fruits, exotic nuts, and healthy seeds delivered to your doorstep. Experience the crunch of quality.
                        </p>
                        <div className="flex gap-4">
                            <SocialIcon icon={Facebook} />
                            <SocialIcon icon={Instagram} />
                            <SocialIcon icon={Twitter} />
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="mt-6">
                        <h4 className="font-bold mb-6 text-gray-800">Shop</h4>
                        <ul className="space-y-4 text-sm text-gray-600">
                            <li><Link to="/products" className="hover:text-amber-600 transition-colors">All Products</Link></li>
                            <li><Link to="/products?category=essential" className="hover:text-amber-600 transition-colors">Essential Nuts</Link></li>
                            <li><Link to="/products?category=exotic" className="hover:text-amber-600 transition-colors">Exotic Range</Link></li>
                            <li><Link to="/products?category=berries" className="hover:text-amber-600 transition-colors">Berries</Link></li>
                        </ul>
                    </div>

                    {/* Customer Service */}
                    <div className="mt-6">
                        <h4 className="font-bold mb-6 text-gray-800">Customer Service</h4>
                        <ul className="space-y-4 text-sm text-gray-600">
                            <li><Link to="/track-order" className="hover:text-amber-600 transition-colors">Track Order</Link></li>
                            <li><Link to="/returns" className="hover:text-amber-600 transition-colors">Returns & Refunds</Link></li>
                            <li><Link to="/faqs" className="hover:text-amber-600 transition-colors">FAQs</Link></li>
                            <li><Link to="/privacy" className="hover:text-amber-600 transition-colors">Privacy Policy</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="mt-6">
                        <h4 className="font-bold mb-6 text-gray-800">Contact</h4>
                        <ul className="space-y-4 text-sm text-gray-600">
                            <li className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-amber-600 flex-shrink-0" />
                                <span>123, Mission Street,<br />Heritage Town,<br />Pondicherry, 605001</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-amber-600" />
                                <span>+91 98765 43210</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-amber-600" />
                                <span>hello@nuttybites.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-12 pt-6 border-t border-amber-900/5 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-500 text-sm">
                        © {currentYear} Nutty Bites. All rights reserved.
                    </p>

                    {/* Creator Credit */}
                    <div className="text-center mt-8">
                        <p className="text-xs text-gray-500">
                            Developed by JP Pvt Ltd.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Payment Method Logos */}
                        <div className="flex items-center gap-3">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg" alt="Visa" className="h-5" />
                            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-5" />
                            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b7/MasterCard_Logo.svg" alt="Maestro" className="h-5" />
                            <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="UPI" className="h-5" />
                        </div>
                        <span className="text-xs text-gray-500 text-sm">Secure Payments via Razorpay</span>
                        <img src="https://razorpay.com/assets/razorpay-glyph.svg" alt="Razorpay" className="h-6" />
                    </div>
                </div>

            </div>
        </footer>
    );
}

export default Footer;
