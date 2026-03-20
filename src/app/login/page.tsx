"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, FormEvent, Suspense } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get("redirect") ?? "/";
    const supabase = createClient();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            setError(error.message);
            setIsLoading(false);
        } else {
            router.push(redirect);
            router.refresh();
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#003f7d] via-[#0058a3] to-[#0073cf] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Card */}
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                    {/* IKEA Header */}
                    <div className="bg-[#0058a3] px-8 py-8 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-10 bg-[#fbd914] rounded mb-4">
                            <span className="text-[#0058a3] font-extrabold text-lg tracking-widest">IKEA</span>
                        </div>
                        <h1 className="text-white text-2xl font-bold mt-2">Field Service</h1>
                        <p className="text-blue-200 text-sm mt-1">Operations Platform</p>
                    </div>

                    {/* Form */}
                    <div className="px-8 py-8">
                        <h2 className="text-gray-800 text-lg font-semibold mb-6">Sign in to your account</h2>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-start gap-2">
                                <span className="mt-0.5 flex-shrink-0">⚠️</span>
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="email">
                                    Email address
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="you@ikeaservice.com"
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0058a3] focus:border-transparent placeholder:text-gray-400 transition"
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="password">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        type={showPw ? "text" : "password"}
                                        autoComplete="current-password"
                                        required
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full px-4 py-2.5 pr-11 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0058a3] focus:border-transparent placeholder:text-gray-400 transition"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPw(v => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        tabIndex={-1}
                                    >
                                        {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-[#0058a3] hover:bg-[#004f94] disabled:bg-gray-300 text-white font-semibold py-3 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 mt-2"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Signing in…
                                    </>
                                ) : (
                                    "Sign In"
                                )}
                            </button>
                        </form>

                        {/* Role hints (demo) */}
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Demo Accounts</p>
                                <span className="text-[10px] text-gray-400 font-mono bg-gray-200 px-1.5 py-0.5 rounded">pw: welcome1</span>
                            </div>
                            {[
                                { role: 'Admin',      email: 'admin@ikeaservice.com',      color: 'bg-blue-100 text-blue-700' },
                                { role: 'Dispatcher', email: 'dispatcher@ikeaservice.com', color: 'bg-amber-100 text-amber-700' },
                                { role: 'Assembler',  email: 'assembler@ikeaservice.com',  color: 'bg-green-100 text-green-700' },
                            ].map(a => (
                                <button
                                    key={a.role}
                                    type="button"
                                    onClick={() => { setEmail(a.email); setPassword('welcome1'); }}
                                    className="flex items-center gap-2 w-full text-left py-1.5 hover:opacity-80 transition"
                                >
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${a.color}`}>{a.role}</span>
                                    <span className="text-xs text-gray-500">{a.email}</span>
                                </button>
                            ))}
                            <p className="text-[10px] text-gray-400 mt-1.5">↑ Click to auto-fill credentials</p>
                        </div>
                    </div>
                </div>

                <p className="text-center text-blue-200 text-xs mt-6">
                    IKEA Field Service Platform · Secure Login
                </p>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#0058a3] flex items-center justify-center"><div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" /></div>}>
            <LoginForm />
        </Suspense>
    );
}
