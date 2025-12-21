import React, { useState } from 'react';
import { Lock, ArrowRight } from 'lucide-react';
import { APP_PASSWORD } from '../data';

interface LoginScreenProps {
    onLogin: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === APP_PASSWORD) {
            onLogin();
        } else {
            setError(true);
            setPassword('');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white max-w-md w-full rounded-2xl border border-slate-100 shadow-xl p-8">
                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
                        <Lock className="text-white" size={24} />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">TaskFlow Restricted</h1>
                    <p className="text-slate-500 mt-2 text-sm">Please enter the access code to view this dashboard.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input
                            type="password"
                            placeholder="Enter Access Code"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setError(false);
                            }}
                            className={`w-full px-4 py-3 rounded-xl border ${error ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:ring-indigo-200'} focus:outline-none focus:ring-4 transition-all text-slate-800 placeholder:text-slate-400`}
                            autoFocus
                        />
                        {error && (
                            <p className="text-red-500 text-xs mt-2 font-medium ml-1">Incorrect access code. Please try again.</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 group"
                    >
                        Access Dashboard
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </form>

                <p className="text-center text-slate-300 text-xs mt-8 font-medium">
                    Protected by TaskFlow Security
                </p>
            </div>
        </div>
    );
};

export default LoginScreen;
