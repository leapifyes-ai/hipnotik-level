import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        toast.success('Bienvenido de nuevo');
      } else {
        await register(formData.email, formData.password, formData.name);
        toast.success('Cuenta creada exitosamente');
      }
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error en la autenticación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Image */}
      <div 
        className="hidden lg:block lg:w-1/2 bg-cover bg-center relative"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1679068008949-12852e5fca5a?crop=entropy&cs=srgb&fm=jpg&q=85)'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 to-slate-800/80"></div>
        <div className="relative h-full flex flex-col justify-center px-12 text-white">
          <h1 className="text-5xl font-heading font-bold mb-4 tracking-tight">HIPNOTIK LEVEL</h1>
          <p className="text-xl text-slate-300 max-w-md leading-relaxed">Gestión profesional de stands de telecomunicaciones</p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
        <Card className="w-full max-w-md p-8 bg-white shadow-sm border-slate-200">
          <div className="mb-8">
            <h2 className="text-3xl font-heading font-bold text-slate-900 mb-2">
              {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </h2>
            <p className="text-slate-600">Accede a tu panel de control</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <Label htmlFor="name" className="text-slate-700 font-medium">Nombre Completo</Label>
                <Input
                  id="name"
                  data-testid="register-name-input"
                  type="text"
                  placeholder="Tu nombre"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1.5 bg-slate-50 border-slate-200 focus:border-slate-400 focus:ring-slate-400"
                  required={!isLogin}
                />
              </div>
            )}

            <div>
              <Label htmlFor="email" className="text-slate-700 font-medium">Correo Electrónico</Label>
              <Input
                id="email"
                data-testid="login-email-input"
                type="email"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1.5 bg-slate-50 border-slate-200 focus:border-slate-400 focus:ring-slate-400"
                required
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-slate-700 font-medium">Contraseña</Label>
              <Input
                id="password"
                data-testid="login-password-input"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="mt-1.5 bg-slate-50 border-slate-200 focus:border-slate-400 focus:ring-slate-400"
                required
              />
            </div>

            <Button
              type="submit"
              data-testid="login-submit-button"
              disabled={loading}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white shadow-sm h-11"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <button
              data-testid="toggle-auth-mode"
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
            >
              {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
            </button>
            {isLogin && (
              <div>
                <Link 
                  to="/forgot-password"
                  className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;
