import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(`${API_URL}/auth/forgot-password`, { email });
      setSent(true);
      toast.success('Solicitud enviada');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al procesar la solicitud');
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
          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-heading font-bold text-slate-900 mb-3">
                Revisa tu correo
              </h2>
              <p className="text-slate-600 mb-6">
                Si el email <strong>{email}</strong> está registrado, recibirás instrucciones para restablecer tu contraseña.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-left">
                <p className="text-sm text-amber-800">
                  <strong>Modo desarrollo:</strong> El token de recuperación se ha mostrado en los logs del servidor backend.
                </p>
              </div>
              <Link 
                to="/login"
                className="inline-flex items-center text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al inicio de sesión
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <Link 
                  to="/login"
                  className="inline-flex items-center text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Volver
                </Link>
                <h2 className="text-3xl font-heading font-bold text-slate-900 mb-2">
                  ¿Olvidaste tu contraseña?
                </h2>
                <p className="text-slate-600">
                  Introduce tu email y te enviaremos instrucciones para restablecerla.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="email" className="text-slate-700 font-medium">
                    Correo Electrónico
                  </Label>
                  <div className="relative mt-1.5">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="email"
                      data-testid="forgot-email-input"
                      type="email"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-slate-50 border-slate-200 focus:border-slate-400 focus:ring-slate-400"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  data-testid="forgot-submit-button"
                  disabled={loading}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white shadow-sm h-11"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    'Enviar instrucciones'
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

export default ForgotPassword;
