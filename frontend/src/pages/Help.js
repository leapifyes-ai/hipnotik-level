import React, { useState } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { 
  HelpCircle, 
  Search,
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  Users,
  ShoppingBag,
  Package,
  AlertCircle,
  Clock,
  FileText,
  Coins,
  Calculator,
  Settings,
  LogIn,
  Star,
  MessageCircle,
  BookOpen
} from 'lucide-react';

const Help = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSections, setExpandedSections] = useState(['introduccion']);

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const sections = [
    {
      id: 'introduccion',
      title: 'Introducción',
      icon: BookOpen,
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-slate-900 mb-2">¿Qué es HIPNOTIK LEVEL Stand?</h4>
            <p className="text-slate-600">
              HIPNOTIK LEVEL Stand es un sistema SaaS diseñado específicamente para la gestión profesional 
              de stands de telecomunicaciones. Permite gestionar ventas, clientes, empleados, incidencias 
              y comisiones de forma centralizada y eficiente.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Roles de Usuario</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left p-2 font-medium">Rol</th>
                    <th className="text-left p-2 font-medium">Descripción</th>
                    <th className="text-left p-2 font-medium">Acceso</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="p-2"><Badge className="bg-indigo-100 text-indigo-700">SuperAdmin</Badge></td>
                    <td className="p-2 text-slate-600">Gerente o encargado del stand</td>
                    <td className="p-2 text-slate-600">Acceso total a todas las funciones</td>
                  </tr>
                  <tr>
                    <td className="p-2"><Badge variant="outline">Empleado</Badge></td>
                    <td className="p-2 text-slate-600">Vendedor del stand</td>
                    <td className="p-2 text-slate-600">Acceso limitado a sus propias ventas y fichajes</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Compañías Soportadas</h4>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-orange-100 text-orange-700">Jazztel</Badge>
              <Badge className="bg-green-100 text-green-700">MásMóvil</Badge>
              <Badge className="bg-blue-100 text-blue-700">Pepephone</Badge>
              <Badge className="bg-purple-100 text-purple-700">Simyo</Badge>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'acceso',
      title: 'Acceso al Sistema',
      icon: LogIn,
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Iniciar Sesión</h4>
            <ol className="list-decimal list-inside space-y-1 text-slate-600">
              <li>Abre el navegador y accede a la URL del sistema</li>
              <li>Introduce tu <strong>Correo Electrónico</strong></li>
              <li>Introduce tu <strong>Contraseña</strong></li>
              <li>Haz clic en <strong>"Iniciar Sesión"</strong></li>
            </ol>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Registro de Nuevo Usuario</h4>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-2">
              <p className="text-sm text-amber-800">⚠️ El registro de nuevos usuarios puede estar limitado según la configuración del sistema.</p>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-slate-600">
              <li>En la pantalla de login, haz clic en <strong>"¿No tienes cuenta? Regístrate"</strong></li>
              <li>Completa los campos: Nombre, Email, Contraseña</li>
              <li>Haz clic en <strong>"Registrarse"</strong></li>
            </ol>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Cerrar Sesión</h4>
            <p className="text-slate-600">En el menú lateral izquierdo, localiza tu nombre de usuario en la parte inferior y haz clic en <strong>"Cerrar Sesión"</strong>.</p>
          </div>
        </div>
      )
    },
    {
      id: 'dashboard',
      title: 'Dashboard Principal',
      icon: LayoutDashboard,
      content: (
        <div className="space-y-4">
          <p className="text-slate-600">El Dashboard es la pantalla principal que muestra un resumen de la actividad del stand.</p>
          
          <div>
            <h4 className="font-semibold text-slate-900 mb-2">KPIs (Indicadores Clave)</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left p-2 font-medium">KPI</th>
                    <th className="text-left p-2 font-medium">Descripción</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr><td className="p-2 font-medium">Ventas Hoy</td><td className="p-2 text-slate-600">Número de ventas realizadas en el día actual</td></tr>
                  <tr><td className="p-2 font-medium">Ventas del Mes</td><td className="p-2 text-slate-600">Total de ventas del mes en curso</td></tr>
                  <tr><td className="p-2 font-medium">Proyección</td><td className="p-2 text-slate-600">Estimación de ventas para el mes completo</td></tr>
                  <tr><td className="p-2 font-medium">Incidencias Abiertas</td><td className="p-2 text-slate-600">Número de incidencias pendientes de resolver</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Tarjetas Interactivas</h4>
            <p className="text-slate-600">Las tarjetas de incidencias son <strong>clicables</strong>:</p>
            <ul className="list-disc list-inside text-slate-600 mt-1">
              <li><strong>Abiertas:</strong> Te lleva a incidencias filtradas por estado "Abierta"</li>
              <li><strong>En Proceso:</strong> Te lleva a incidencias "En Proceso"</li>
              <li><strong>Cerradas:</strong> Te lleva a incidencias "Cerradas"</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Formulario de Venta Rápida</h4>
            <p className="text-slate-600">En el Dashboard puedes registrar ventas directamente usando el botón "Nueva Venta" o el formulario integrado.</p>
          </div>
        </div>
      )
    },
    {
      id: 'clientes',
      title: 'Gestión de Clientes',
      icon: Users,
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Ver Lista de Clientes</h4>
            <p className="text-slate-600">En el menú lateral, haz clic en <strong>"Clientes"</strong> para ver la tabla con todos los clientes registrados.</p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Crear Nuevo Cliente</h4>
            <ol className="list-decimal list-inside space-y-1 text-slate-600">
              <li>Haz clic en <strong>"+ Nuevo Cliente"</strong></li>
              <li>Completa los campos: Nombre*, Teléfono*, Email, Ciudad, DNI, Dirección</li>
              <li>Haz clic en <strong>"Guardar"</strong></li>
            </ol>
            <p className="text-sm text-slate-500 mt-1">* Campos obligatorios</p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Ver Detalle de un Cliente</h4>
            <p className="text-slate-600">Haz clic en cualquier fila de la tabla. Se abrirá un panel lateral con:</p>
            <ul className="list-disc list-inside text-slate-600 mt-1">
              <li>Información del cliente</li>
              <li>Historial de ventas</li>
              <li>Historial de incidencias</li>
              <li>Notas internas (solo SuperAdmin)</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Notas Internas (Solo SuperAdmin)</h4>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">💡 <strong>Consejo:</strong> Usa las notas internas para registrar información sensible o preferencias del cliente que no deben ser visibles para todos los empleados.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'ventas',
      title: 'Gestión de Ventas',
      icon: ShoppingBag,
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Registrar Nueva Venta</h4>
            <ol className="list-decimal list-inside space-y-1 text-slate-600">
              <li><strong>Cliente:</strong> Busca uno existente por teléfono o crea uno nuevo</li>
              <li><strong>Producto:</strong> Selecciona Compañía y Tipo de Pack</li>
              <li><strong>Detalles:</strong> Completa datos de Fibra y/o Móvil</li>
              <li><strong>Notas:</strong> Añade observaciones relevantes</li>
              <li>Haz clic en <strong>"Registrar Venta"</strong></li>
            </ol>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Estados de Venta</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left p-2 font-medium">Estado</th>
                    <th className="text-left p-2 font-medium">Descripción</th>
                    <th className="text-left p-2 font-medium">Efecto en Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr><td className="p-2">Registrado</td><td className="p-2 text-slate-600">Venta recién creada</td><td className="p-2 text-green-600">+3 puntos</td></tr>
                  <tr><td className="p-2">En proceso</td><td className="p-2 text-slate-600">Tramitación en curso</td><td className="p-2 text-green-600">+5 puntos</td></tr>
                  <tr><td className="p-2">Incidencia</td><td className="p-2 text-slate-600">Problema detectado</td><td className="p-2 text-red-600">-5 puntos</td></tr>
                  <tr><td className="p-2">Instalado</td><td className="p-2 text-slate-600">Servicio instalado</td><td className="p-2 text-green-600">+8 puntos</td></tr>
                  <tr><td className="p-2">Modificado</td><td className="p-2 text-slate-600">Se han hecho cambios</td><td className="p-2 text-green-600">+4 puntos</td></tr>
                  <tr><td className="p-2">Cancelado</td><td className="p-2 text-slate-600">Venta cancelada</td><td className="p-2 text-red-600">-10 puntos</td></tr>
                  <tr><td className="p-2">Finalizado</td><td className="p-2 text-slate-600">Proceso completado</td><td className="p-2 text-green-600">+10 puntos</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Sistema de Score (0-100)</h4>
            <p className="text-slate-600 mb-2">El score se calcula automáticamente:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="font-medium text-slate-900 mb-1">Puntos por Fibra (máx. 40)</p>
                <ul className="text-sm text-slate-600">
                  <li>1000 Mbps = 40 pts</li>
                  <li>600 Mbps = 30 pts</li>
                  <li>300 Mbps = 20 pts</li>
                  <li>100 Mbps = 10 pts</li>
                </ul>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="font-medium text-slate-900 mb-1">Puntos por Móvil (máx. 30)</p>
                <ul className="text-sm text-slate-600">
                  <li>Por líneas: hasta 15 pts (5/línea)</li>
                  <li>Por GB: hasta 15 pts (100+ GB)</li>
                </ul>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="font-medium text-slate-900 mb-1">Puntos por Precio (máx. 20)</p>
                <ul className="text-sm text-slate-600">
                  <li>70€+ = 20 pts</li>
                  <li>50-69€ = 15 pts</li>
                  <li>30-49€ = 10 pts</li>
                </ul>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="font-medium text-slate-900 mb-1">Puntos por Estado</p>
                <p className="text-sm text-slate-600">Ver tabla de estados arriba</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Permisos de Edición</h4>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-sm text-amber-800">⚠️ Los empleados solo pueden editar sus propias ventas. Los SuperAdmin pueden editar todas las ventas.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'tarifas',
      title: 'Tarifas y Packs',
      icon: Package,
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Ver Catálogo de Tarifas</h4>
            <p className="text-slate-600">En el menú lateral, haz clic en <strong>"Tarifas"</strong> para ver todas las tarifas organizadas por compañía.</p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Filtrar Tarifas</h4>
            <ul className="list-disc list-inside text-slate-600">
              <li><strong>Por compañía:</strong> Selecciona la operadora</li>
              <li><strong>Por tipo:</strong> Solo Fibra, Solo Móvil, Pack</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Crear Nueva Tarifa (SuperAdmin)</h4>
            <ol className="list-decimal list-inside space-y-1 text-slate-600">
              <li>Haz clic en <strong>"+ Nueva Tarifa"</strong></li>
              <li>Completa: Compañía, Nombre, Tipo, Precio, Velocidad fibra, GB móviles</li>
              <li>Haz clic en <strong>"Guardar"</strong></li>
            </ol>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Activar/Desactivar Tarifas</h4>
            <p className="text-slate-600">Usa el interruptor de "Activo" en cada tarifa. Las tarifas desactivadas no aparecerán al crear ventas.</p>
          </div>
        </div>
      )
    },
    {
      id: 'incidencias',
      title: 'Incidencias',
      icon: AlertCircle,
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Crear Nueva Incidencia</h4>
            <ol className="list-decimal list-inside space-y-1 text-slate-600">
              <li>Haz clic en <strong>"+ Nueva Incidencia"</strong></li>
              <li>Selecciona el <strong>Cliente</strong> afectado</li>
              <li>Escribe un <strong>Título</strong> descriptivo</li>
              <li>Selecciona <strong>Tipo</strong>: Técnica, Comercial, Administrativa</li>
              <li>Selecciona <strong>Prioridad</strong>: Baja, Media, Alta, Crítica</li>
              <li>Añade una <strong>Descripción</strong> detallada</li>
              <li>Haz clic en <strong>"Crear Incidencia"</strong></li>
            </ol>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Estados de Incidencia</h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="border-red-300 text-red-700">Abierta - Nueva sin atender</Badge>
              <Badge variant="outline" className="border-amber-300 text-amber-700">En Proceso - Trabajando en ella</Badge>
              <Badge variant="outline" className="border-green-300 text-green-700">Cerrada - Resuelta</Badge>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Añadir Comentarios</h4>
            <p className="text-slate-600">Los comentarios funcionan como un timeline de seguimiento:</p>
            <ol className="list-decimal list-inside space-y-1 text-slate-600 mt-1">
              <li>Abre el detalle de la incidencia</li>
              <li>En "Comentarios", escribe tu mensaje</li>
              <li>Haz clic en <strong>"Añadir Comentario"</strong></li>
            </ol>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
              <p className="text-sm text-blue-800">💡 <strong>Consejo:</strong> Usa los comentarios para documentar cada acción tomada. Esto ayuda al seguimiento.</p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Notas de Resolución</h4>
            <p className="text-slate-600">Al cerrar una incidencia, documenta: qué causó el problema, qué solución se aplicó, y acciones preventivas.</p>
          </div>
        </div>
      )
    },
    {
      id: 'fichajes',
      title: 'Control Horario (Fichajes)',
      icon: Clock,
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Fichar Entrada/Salida (Empleados)</h4>
            <ol className="list-decimal list-inside space-y-1 text-slate-600">
              <li>En el menú lateral, haz clic en <strong>"Fichajes"</strong></li>
              <li>Verás un botón grande: <strong>"Fichar Entrada"</strong> o <strong>"Fichar Salida"</strong></li>
              <li>Haz clic en el botón correspondiente</li>
              <li>Se registrará automáticamente la fecha y hora</li>
            </ol>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Ver Tu Historial</h4>
            <p className="text-slate-600">En la misma página verás:</p>
            <ul className="list-disc list-inside text-slate-600">
              <li><strong>Hoy:</strong> Tu fichaje del día actual</li>
              <li><strong>Esta semana:</strong> Resumen de horas trabajadas</li>
              <li><strong>Historial:</strong> Lista de todos tus fichajes</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Panel de Administración (Solo SuperAdmin)</h4>
            <p className="text-slate-600">Como SuperAdmin puedes ver:</p>
            <ul className="list-disc list-inside text-slate-600">
              <li>Empleados fichados vs. no fichados</li>
              <li>Horas totales trabajadas</li>
              <li>Historial detallado por empleado (7, 15, 30, 60 días)</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'calculadora',
      title: 'Calculadora de Tarifas',
      icon: Calculator,
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-slate-900 mb-2">¿Qué es la Calculadora?</h4>
            <p className="text-slate-600">La Calculadora es un asistente que ayuda a recomendar la mejor tarifa según las necesidades del cliente.</p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Cómo Usar la Calculadora</h4>
            <ol className="list-decimal list-inside space-y-2 text-slate-600">
              <li><strong>Paso 1 - Tipo de Servicio:</strong> Selecciona Solo Fibra, Solo Móvil, o Fibra + Móvil</li>
              <li><strong>Paso 2 - Requisitos:</strong> Indica uso, dispositivos, líneas, GB necesarios</li>
              <li><strong>Paso 3 - Resultados:</strong> El sistema mostrará las tarifas recomendadas ordenadas por mejor relación calidad/precio</li>
            </ol>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Crear Venta desde Recomendación</h4>
            <p className="text-slate-600">Tras obtener los resultados, haz clic en <strong>"Crear Venta con esta Tarifa"</strong> para abrir el formulario de venta con la tarifa preseleccionada.</p>
          </div>
        </div>
      )
    },
    {
      id: 'reportes',
      title: 'Reportes y Analíticas',
      icon: FileText,
      badge: 'SuperAdmin',
      content: (
        <div className="space-y-4">
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
            <p className="text-sm text-indigo-800">⚠️ Esta sección solo está disponible para usuarios con rol SuperAdmin.</p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-2">KPIs con Tendencias</h4>
            <p className="text-slate-600">Las tarjetas superiores muestran Ventas, Ingresos, Score Total y Score Promedio, cada una con comparativa vs. el período anterior.</p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Gráficos Disponibles</h4>
            <ul className="list-disc list-inside text-slate-600">
              <li><strong>Ventas por Día:</strong> Gráfico de líneas con ventas e ingresos</li>
              <li><strong>Ventas por Compañía:</strong> Gráfico circular con distribución</li>
              <li><strong>Ventas por Empleado:</strong> Gráfico de barras con ranking</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Exportar Datos</h4>
            <p className="text-slate-600">En la pestaña "Exportar" puedes descargar:</p>
            <ul className="list-disc list-inside text-slate-600">
              <li><strong>Ventas:</strong> CSV o PDF</li>
              <li><strong>Clientes:</strong> CSV</li>
              <li><strong>Incidencias:</strong> CSV</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'comisiones',
      title: 'Comisiones',
      icon: Coins,
      badge: 'SuperAdmin',
      content: (
        <div className="space-y-4">
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
            <p className="text-sm text-indigo-800">⚠️ Esta sección solo está disponible para usuarios con rol SuperAdmin. Los empleados NO pueden ver las reglas ni los cálculos de comisiones.</p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Resumen por Empleado</h4>
            <p className="text-slate-600">Una tabla que muestra por cada empleado: Ventas, Válidas, Umbral alcanzado/no, Comisionables, Comisión total (€).</p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Reglas de Umbral</h4>
            <ul className="list-disc list-inside text-slate-600">
              <li><strong>Umbral Mínimo:</strong> Ventas necesarias antes de empezar a comisionar</li>
              <li><strong>Comisión Retroactiva:</strong> Si se activa, al alcanzar el umbral se comisionan las ventas anteriores</li>
              <li><strong>Retroactividad desde:</strong> Desde qué número de venta aplicar</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Categorías de Comisión</h4>
            <p className="text-slate-600">Cada categoría define cuánto se paga por tipo de venta:</p>
            <ul className="list-disc list-inside text-slate-600 mt-1">
              <li>Venta de Alto Valor: €25 (packs &gt;€60)</li>
              <li>Venta de Valor Medio: €15 (packs €35-60)</li>
              <li>Fibra Suelta: €12</li>
              <li>Móvil Suelto: €8</li>
              <li>Venta de Bajo Valor: €5 (packs &lt;€35)</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Estados que Comisionan</h4>
            <p className="text-slate-600">Solo las ventas en estado <strong>"Instalado"</strong> o <strong>"Finalizado"</strong> generan comisión.</p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Duplicar Configuración</h4>
            <p className="text-slate-600">Usa el botón "Duplicar a otro mes" para copiar la configuración y no empezar desde cero cada mes.</p>
          </div>
        </div>
      )
    },
    {
      id: 'faq',
      title: 'Preguntas Frecuentes',
      icon: MessageCircle,
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="border-b pb-3">
              <p className="font-medium text-slate-900">¿Puedo usar el sistema desde el móvil?</p>
              <p className="text-slate-600 text-sm mt-1">Sí, el sistema es completamente responsive y funciona en móviles y tablets.</p>
            </div>
            
            <div className="border-b pb-3">
              <p className="font-medium text-slate-900">¿Se guardan los datos automáticamente?</p>
              <p className="text-slate-600 text-sm mt-1">La mayoría de acciones requieren hacer clic en "Guardar". Las notas internas de clientes se guardan automáticamente.</p>
            </div>
            
            <div className="border-b pb-3">
              <p className="font-medium text-slate-900">¿Puedo eliminar una venta?</p>
              <p className="text-slate-600 text-sm mt-1">No, las ventas no se pueden eliminar para mantener la integridad de los datos. Puedes cambiar su estado a "Cancelado".</p>
            </div>
            
            <div className="border-b pb-3">
              <p className="font-medium text-slate-900">¿Por qué no puedo editar una venta?</p>
              <p className="text-slate-600 text-sm mt-1">Los empleados solo pueden editar sus propias ventas. Si eres SuperAdmin y no puedes editar, contacta con soporte.</p>
            </div>
            
            <div className="border-b pb-3">
              <p className="font-medium text-slate-900">¿Qué pasa si olvido fichar?</p>
              <p className="text-slate-600 text-sm mt-1">Contacta con tu SuperAdmin para que pueda revisar y ajustar tu registro si es necesario.</p>
            </div>
            
            <div className="border-b pb-3">
              <p className="font-medium text-slate-900">¿Por qué mi venta no aparece como comisionable?</p>
              <p className="text-slate-600 text-sm mt-1">Una venta solo comisiona si: 1) Has alcanzado el umbral mínimo, 2) La venta está en estado "Instalado" o "Finalizado", 3) La venta encaja en alguna categoría de comisión.</p>
            </div>
            
            <div className="border-b pb-3">
              <p className="font-medium text-slate-900">¿Puedo ver mis comisiones como empleado?</p>
              <p className="text-slate-600 text-sm mt-1">No, actualmente las comisiones solo son visibles para SuperAdmin.</p>
            </div>
            
            <div>
              <p className="font-medium text-slate-900">¿Puedo programar envío automático de reportes?</p>
              <p className="text-slate-600 text-sm mt-1">Actualmente no. Los reportes deben descargarse manualmente.</p>
            </div>
          </div>
        </div>
      )
    }
  ];

  const filteredSections = sections.filter(section => 
    section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (typeof section.content === 'string' && section.content.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 space-y-6 pb-24 md:pb-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-slate-900 tracking-tight flex items-center gap-3">
              <HelpCircle className="h-8 w-8 text-blue-500" />
              Centro de Ayuda
            </h1>
            <p className="text-slate-600 mt-1">Manual de usuario y guías de uso</p>
          </div>
        </div>

        {/* Search */}
        <Card className="p-4 bg-white border-slate-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar en el manual..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="help-search"
            />
          </div>
        </Card>

        {/* Sections */}
        <div className="space-y-3">
          {filteredSections.map((section) => {
            const Icon = section.icon;
            const isExpanded = expandedSections.includes(section.id);
            
            return (
              <Card key={section.id} className="bg-white border-slate-200 overflow-hidden">
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                  data-testid={`section-${section.id}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                      <Icon size={20} className="text-slate-600" />
                    </div>
                    <span className="font-semibold text-slate-900">{section.title}</span>
                    {section.badge && (
                      <Badge className="bg-indigo-100 text-indigo-700 text-xs">{section.badge}</Badge>
                    )}
                  </div>
                  {isExpanded ? (
                    <ChevronDown size={20} className="text-slate-400" />
                  ) : (
                    <ChevronRight size={20} className="text-slate-400" />
                  )}
                </button>
                
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-slate-100">
                    <div className="pt-4">
                      {section.content}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Version */}
        <div className="text-center text-sm text-slate-400 pt-4">
          <p>HIPNOTIK LEVEL Stand - Manual de Usuario v1.0</p>
          <p>Última actualización: Enero 2026</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Help;
