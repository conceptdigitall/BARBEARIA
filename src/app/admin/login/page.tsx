'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, Mail, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        // Redirect to dashboard on success
        router.push('/admin/dashboard');
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || 'Credenciais inválidas. Tente novamente.');
      }
    } catch (err) {
      console.error(err);
      setError('Erro de conexão. Por favor, tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black flex flex-col justify-center items-center px-6 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gold-accent/5 rounded-full blur-3xl -z-10" />

      {/* Back to Home Button */}
      <Link
        href="/"
        className="absolute top-8 left-8 text-white/50 hover:text-gold-primary transition-colors duration-300 flex items-center gap-2 text-xs uppercase tracking-wider font-semibold"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar ao Site
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="glass-panel p-10 border border-gold-primary/10 flex flex-col items-center">
          
          {/* Logo / Header */}
          <div className="text-center mb-8">
            <span className="text-gold-primary uppercase tracking-[0.3em] text-xs font-semibold block mb-2">
              Acesso Privado
            </span>
            <h2 className="font-serif text-3xl font-black tracking-wide text-white uppercase">
              ALEMÃO <span className="text-gold-primary">777</span>
            </h2>
            <div className="w-12 h-[1px] bg-gold-primary/50 mx-auto mt-4" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="w-full space-y-6 text-sm">
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium text-center"
              >
                {error}
              </motion.div>
            )}

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-white/40">
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-graphite-light border border-graphite-border focus:border-gold-primary text-white outline-none transition-all duration-300 placeholder:text-white/20"
                  placeholder="seu-email@dominio.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-white/40">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-graphite-light border border-graphite-border focus:border-gold-primary text-white outline-none transition-all duration-300 placeholder:text-white/20"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gold-primary hover:bg-gold-hover disabled:bg-gold-primary/30 text-black font-bold text-xs tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                'Entrar no Painel'
              )}
            </button>
          </form>

        </div>
      </motion.div>
    </main>
  );
}
