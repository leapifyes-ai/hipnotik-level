# HIPNOTIK LEVEL Stand - Product Requirements Document

## Original Problem Statement
Sistema SaaS de gestión para stands de telecomunicaciones (Jazztel, MásMóvil, etc.) que reemplaza el sistema actual basado en papel y Excel. Permite gestionar ventas, clientes, empleados e incidencias de forma profesional.

## User Personas
- **SuperAdmin**: Gerente del stand con acceso total al sistema
- **Empleado**: Vendedor con acceso limitado a sus propias ventas y fichajes

## Core Requirements

### ✅ Implementado (Enero 2026)

#### Autenticación y Roles
- JWT-based authentication
- Roles: SuperAdmin y Empleado
- Control de acceso basado en roles

#### Dashboard
- KPIs: Ventas del día, mes, proyección
- Ranking de empleados
- Distribución por compañía
- **Formulario de venta unificado** (igual que Ventas → Nueva venta)
- **Tarjetas de incidencias clicables**: Abiertas, En Proceso, Cerradas → navega y filtra
- **"Ver todas →"**: Navega a incidencias sin filtro

#### Ventas (CRÍTICO)
- **Registro completo**: Cliente, compañía, pack, fibra, líneas móviles, notas
- **Estados editables**: Registrado → En proceso → Incidencia → Instalado → Modificado → Cancelado → Finalizado
- **Sales Score (0-100)**: Basado en velocidad fibra (max 40pts), líneas móviles (max 30pts), precio (max 20pts), estado (+10/-10pts)
- **Edición de ventas**: Empleados editan sus propias, SuperAdmin edita todas
- Vista detallada con panel lateral (Sheet)

#### Clientes
- **Ficha completa**: Nombre, teléfono, email, DNI, ciudad, dirección
- **Notas internas**: Campo persistente solo visible para admin
- **Historial de ventas**: Con scores individuales y score total del cliente
- **Historial de incidencias**: Vinculado al cliente
- Edición completa con todos los campos

#### Fichajes (Control Horario)
- Fichaje de entrada/salida para empleados
- **Panel Admin**: Lista de empleados con estado (Fichado/No fichado)
- **Horas trabajadas**: Por día y acumulado
- **Historial detallado**: Entrada/salida por día, selección de período (7, 15, 30, 60 días)

#### Tarifas/Packs
- Gestión de tarifas por compañía
- Agrupación por tipo (Fibra, Móvil, Pack)

#### Incidencias
- Creación vinculada a cliente
- Prioridades: Baja, Media, Alta, Crítica
- Estados: Abierta, En Proceso, Cerrada
- **Vista detallada** con panel lateral (Sheet)
- **Edición completa**: título, descripción, tipo, prioridad, estado
- **Asignación** a empleados
- **Notas de resolución** para documentar la solución
- **Comentarios** tipo timeline para seguimiento

#### Calculadora/Configurador
- Wizard de 3 pasos para recomendar tarifas
- Motor de scoring backend

#### Notificaciones
- Sistema de notificaciones en tiempo real
- Badge con contador de no leídas
- Dropdown en header
- Navegación al elemento relacionado

#### Reportes y Analíticas (P1) - Enero 2026
- **Dashboard de Analytics**: Página completa `/reports` solo para SuperAdmin
- **KPIs con tendencias**: Ventas, Ingresos, Score Total, Score Promedio con comparativa vs período anterior
- **Gráfico de líneas**: Ventas e ingresos por día con selector de período (7, 15, 30, 60, 90 días)
- **Gráfico circular**: Distribución de ventas por compañía con detalles de ingresos
- **Gráfico de barras**: Ranking de ventas por empleado con scores
- **Exportación CSV**: Ventas, Clientes e Incidencias
- **Exportación PDF**: Reporte de ventas formateado con reportlab

### 🟡 Pendiente (P2)
- ~~Módulo de comisiones (configuración admin + vista empleado)~~ ✅ COMPLETADO

#### Módulo de Comisiones (P2) - Enero 2026
- **Acceso restringido**: Solo SuperAdmin/Admin (empleados ven "Acceso Restringido")
- **Configuración mensual**: Crear/editar configuración por año+mes
- **Umbral mínimo**: Ventas necesarias antes de comisionar (ej: 10)
- **Retroactividad**: Comisiones retroactivas activables con número de venta inicial
- **Categorías dinámicas**: 
  - Nombre, descripción, valor (€ fijo o %)
  - Criterios: rango de precio, tipos de pack
  - Estado activo/inactivo
- **Cálculo automático**: Por venta, por empleado, total mensual
- **Estados válidos**: Solo "Instalado" y "Finalizado" comisionan
- **Duplicar configuración**: Copiar config de un mes a otro
- **Resumen por empleado**: Tabla con ventas, válidas, umbral alcanzado/no, comisión total
- **Detalle por empleado**: Desglose venta a venta con razón de no-comisión
- **Categorías por defecto**: Plantilla VEDA (Alto Valor, Medio, Fibra, Móvil, Bajo Valor)

### 🟢 Futuro (P3)
- Pipeline editable (personalizar estados de venta)
- Recuperación de contraseña
- Mejoras adicionales de UX

## Technical Stack
- **Frontend**: React, React Router, TailwindCSS, shadcn/ui, i18next, **recharts** (gráficos)
- **Backend**: FastAPI, Pydantic, JWT, **pandas** (export), **reportlab** (PDF)
- **Database**: MongoDB (NoSQL)

## Key API Endpoints
```
POST /api/auth/login, /api/auth/register
GET /api/dashboard/kpis, /api/dashboard/ranking
GET /api/sales, GET /api/sales/{id}, POST /api/sales
PUT /api/sales/{id}, PATCH /api/sales/{id}/status
GET /api/sales/statuses
GET /api/clients, GET /api/clients/{id}
PUT /api/clients/{id}, GET /api/clients/{id}/sales
GET /api/packs, POST /api/packs
GET /api/incidents, POST /api/incidents
PUT /api/incidents/{id}, POST /api/incidents/{id}/comments
GET /api/fichajes, POST /api/fichajes
GET /api/fichajes/admin, GET /api/fichajes/admin/{user_id}/history
GET /api/notifications, PATCH /api/notifications/{id}/read

# Analytics & Export (P1 - Enero 2026)
GET /api/analytics/sales-by-period?days=30
GET /api/analytics/sales-by-company?days=30
GET /api/analytics/sales-by-employee?days=30
GET /api/analytics/sales-trend?days=30
GET /api/export/sales/csv
GET /api/export/sales/pdf
GET /api/export/clients/csv
GET /api/export/incidents/csv
```

## Database Schema (MongoDB)
- **users**: {id, email, password, role, name}
- **clients**: {id, name, phone, email, city, address, dni, internal_notes, created_by}
- **sales**: {id, client_id, company, pack_type, pack_name, pack_price, fiber, mobile_lines, notes, status, score, created_by}
- **packs**: {id, company, name, type, price, active, fiber_speed_mbps, mobile_gb}
- **incidents**: {id, client_id, title, description, priority, status, created_by}
- **fichajes**: {id, user_id, type, timestamp}
- **notifications**: {id, user_id, title, message, type, related_id, related_type, read}

## Test Credentials
- **SuperAdmin**: test@hipnotik.com / test123
- **Empleados demo**: tai@demo.com, carlos@demo.com, miguel@demo.com

## Score Calculation Formula
```
Score = Fiber Points + Mobile Points + Price Points + Status Points

Fiber (0-40pts):
- 1000 Mbps = 40
- 600 Mbps = 30
- 300 Mbps = 20
- 100 Mbps = 10

Mobile (0-30pts):
- Lines: min(num_lines * 5, 15)
- GB: 100+GB=15, 50-99GB=10, 20-49GB=5

Price (0-20pts):
- 70€+ = 20
- 50-69€ = 15
- 30-49€ = 10
- 15-29€ = 5

Status (+10 to -10pts):
- Finalizado = +10
- Instalado = +8
- En proceso = +5
- Modificado = +4
- Registrado = +3
- Incidencia = -5
- Cancelado = -10
```
