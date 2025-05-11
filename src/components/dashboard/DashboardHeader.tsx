"use client";

import { useState } from 'react';
import Link from 'next/link';
import { logout } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface DashboardHeaderProps {
    user: any;
}

export default function DashboardHeader({ user }: DashboardHeaderProps) {
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    return (
        <header className="bg-white shadow-md">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <div className="flex items-center">
                    <span className="text-yellow-400 text-3xl mr-2">🍌</span>
                    <span className="text-xl font-bold text-green-800">Banana Supply Chain</span>
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center space-x-6">
                    <Link href="/dashboard" className="text-green-700 hover:text-green-900">
                        Dashboard
                    </Link>
                    <Link href="/shipments" className="text-green-700 hover:text-green-900">
                        Shipments
                    </Link>
                    <Link href="/profile" className="text-green-700 hover:text-green-900">
                        Profile
                    </Link>
                    <div className="relative">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="flex items-center text-sm focus:outline-none"
                        >
                            <span className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center text-white">
                                {user?.first_name?.[0] || 'U'}{user?.last_name?.[0] || 'S'}
                            </span>
                        </button>

                        {isMenuOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                                <div className="px-4 py-2 text-sm text-gray-700">
                                    <div>{user?.first_name || 'User'} {user?.last_name || ''}</div>
                                    <div className="text-xs text-gray-500">{user?.email || 'No email'}</div>
                                </div>
                                <hr />
                                <button
                                    onClick={handleLogout}
                                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                >
                                    Sign out
                                </button>
                            </div>
                        )}
                    </div>
                </nav>

                {/* Mobile menu button */}
                <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            </div>

            {/* Mobile menu */}
            {isMenuOpen && (
                <nav className="md:hidden bg-white px-4 py-2 shadow-inner">
                    <Link
                        href="/dashboard"
                        className="block py-2 text-green-700 hover:text-green-900"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Dashboard
                    </Link>
                    <Link
                        href="/shipments"
                        className="block py-2 text-green-700 hover:text-green-900"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Shipments
                    </Link>
                    <Link
                        href="/profile"
                        className="block py-2 text-green-700 hover:text-green-900"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Profile
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="block w-full text-left py-2 text-red-600 hover:text-red-800"
                    >
                        Sign out
                    </button>
                </nav>
            )}
        </header>
    );
}