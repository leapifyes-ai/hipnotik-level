import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Lock, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (token) {
      verifyToken();
    } else {
      setVerifying(false);
    }
  }, [token]);

  const verifyToken = async () => {
    try {
      const response = await axios.post(`${API_URL}/auth/verify-reset-token`, { token });
      setTokenValid(true);
      setEmail(response.data.email);
    } catch (error) {
      setTokenValid(false);
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    
    if (password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${API_URL}/auth/reset-password`, {
        token,
        new_password: password
      });
      setSuccess(true);
      toast.success('Contraseña actualizada correctamente');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al restablecer la contraseña');
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-slate-600 mx-auto mb-4" />
          <p className="text-slate-600">Verificando token...</p>
        </div>
      </div>
    );
  }

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
          {/* No token provided */}
          {!token && (
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-heading font-bold text-slate-900 mb-3">
                Token no proporcionado
              </h2>
              <p className="text-slate-600 mb-6">
                No se ha proporcionado un token de recuperación válido.
              </p>
              <Link 
                to="/forgot-password"
                className="inline-flex items-center justify-center w-full bg-slate-800 hover:bg-slate-700 text-white h-11 rounded-md transition-colors"
              >
                Solicitar nueva recuperación
              </Link>
            </div>
          )}

          {/* Invalid token */}
          {token && !tokenValid && !verifying && (
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-heading font-bold text-slate-900 mb-3">
                Token inválido o expirado
              </h2>
              <p className="text-slate-600 mb-6">
                El enlace de recuperación no es válido o ha expirado. Por favor, solicita uno nuevo.
              </p>
              <Link 
                to="/forgot-password"
                className="inline-flex items-center justify-center w-full bg-slate-800 hover:bg-slate-700 text-white h-11 rounded-md transition-colors"
              >
                Solicitar nueva recuperación
              </Link>
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-heading font-bold text-slate-900 mb-3">
                ¡Contraseña actualizada!
              </h2>
              <p className="text-slate-600 mb-6">
                Tu contraseña ha sido restablecida correctamente. Ya puedes iniciar sesión con tu nueva contraseña.
              </p>
              <Link 
                to="/login"
                className="inline-flex items-center justify-center w-full bg-slate-800 hover:bg-slate-700 text-white h-11 rounded-md transition-colors"
              >
                Ir a iniciar sesión
              </Link>
            </div>
          )}

          {/* Valid token - Show form */}
          {token && tokenValid && !success && (
            <>
              <div className="mb-8">
                <Link 
                  to="/login"
                  className="inline-flex items-center text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Volver al inicio
                </Link>
                <h2 className="text-3xl font-heading font-bold text-slate-900 mb-2">
                  Nueva contraseña
                </h2>
                <p className="text-slate-600">
                  Introduce tu nueva contraseña para <strong>{email}</strong>
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="password" className="text-slate-700 font-medium">
                    Nueva Contraseña
                  </Label>
                  <div className="relative mt-1.5">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="password"
                      data-testid="reset-password-input"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 bg-slate-50 border-slate-200 focus:border-slate-400 focus:ring-slate-400"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="text-slate-700 font-medium">
                    Confirmar Contraseña
                  </Label>
                  <div className="relative mt-1.5">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="confirmPassword"
                      data-testid="reset-confirm-password-input"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 bg-slate-50 border-slate-200 focus:border-slate-400 focus:ring-slate-400"
                      required
                    />
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">Las contraseñas no coinciden</p>
                  )}
                </div>

                <Button
                  type="submit"
                  data-testid="reset-submit-button"
                  disabled={loading || password !== confirmPassword}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white shadow-sm h-11"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Actualizando...
                    </>
                  ) : (
                    'Restablecer contraseña'
                  )}
                </Button>
              </form>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
