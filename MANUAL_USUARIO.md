# 📘 Manual de Usuario - HIPNOTIK LEVEL Stand

## Sistema de Gestión para Stands de Telecomunicaciones

**Versión:** 1.0  
**Última actualización:** Enero 2026

---

## 📑 Índice

1. [Introducción](#1-introducción)
2. [Acceso al Sistema](#2-acceso-al-sistema)
3. [Dashboard Principal](#3-dashboard-principal)
4. [Gestión de Clientes](#4-gestión-de-clientes)
5. [Gestión de Ventas](#5-gestión-de-ventas)
6. [Tarifas y Packs](#6-tarifas-y-packs)
7. [Incidencias](#7-incidencias)
8. [Control Horario (Fichajes)](#8-control-horario-fichajes)
9. [Contactos](#9-contactos)
10. [Calculadora de Tarifas](#10-calculadora-de-tarifas)
11. [Reportes y Analíticas](#11-reportes-y-analíticas-superadmin)
12. [Comisiones](#12-comisiones-superadmin)
13. [Configuración](#13-configuración)
14. [Preguntas Frecuentes (FAQ)](#14-preguntas-frecuentes-faq)
15. [Glosario](#15-glosario)

---

## 1. Introducción

### ¿Qué es HIPNOTIK LEVEL Stand?

HIPNOTIK LEVEL Stand es un sistema SaaS (Software as a Service) diseñado específicamente para la gestión profesional de stands de telecomunicaciones. Permite gestionar ventas, clientes, empleados, incidencias y comisiones de forma centralizada y eficiente.

### Roles de Usuario

El sistema cuenta con dos tipos de usuarios:

| Rol | Descripción | Acceso |
|-----|-------------|--------|
| **SuperAdmin** | Gerente o encargado del stand | Acceso total a todas las funciones |
| **Empleado** | Vendedor del stand | Acceso limitado a sus propias ventas y fichajes |

### Compañías Soportadas

- Jazztel
- MásMóvil
- Pepephone
- Simyo

---

## 2. Acceso al Sistema

### 2.1 Iniciar Sesión

1. Abre el navegador y accede a la URL del sistema
2. Introduce tu **Correo Electrónico**
3. Introduce tu **Contraseña**
4. Haz clic en **"Iniciar Sesión"**

![Login](Se muestra la pantalla de inicio de sesión con el logo de HIPNOTIK LEVEL)

### 2.2 Registro de Nuevo Usuario

> ⚠️ **Nota:** El registro de nuevos usuarios puede estar limitado según la configuración del sistema.

1. En la pantalla de login, haz clic en **"¿No tienes cuenta? Regístrate"**
2. Completa los campos:
   - Nombre completo
   - Correo electrónico
   - Contraseña
3. Haz clic en **"Registrarse"**

### 2.3 Cerrar Sesión

1. En el menú lateral izquierdo, localiza tu nombre de usuario en la parte inferior
2. Haz clic en **"Cerrar Sesión"**

---

## 3. Dashboard Principal

El Dashboard es la pantalla principal que muestra un resumen de la actividad del stand.

### 3.1 KPIs (Indicadores Clave)

En la parte superior verás tarjetas con métricas importantes:

| KPI | Descripción |
|-----|-------------|
| **Ventas Hoy** | Número de ventas realizadas en el día actual |
| **Ventas del Mes** | Total de ventas del mes en curso |
| **Proyección** | Estimación de ventas para el mes completo |
| **Incidencias Abiertas** | Número de incidencias pendientes de resolver |

### 3.2 Tarjetas Interactivas

Las tarjetas de incidencias son **clicables**:
- **Abiertas**: Te lleva a la lista de incidencias filtrada por estado "Abierta"
- **En Proceso**: Te lleva a incidencias "En Proceso"
- **Cerradas**: Te lleva a incidencias "Cerradas"

### 3.3 Formulario de Venta Rápida

En el Dashboard puedes registrar ventas directamente:

1. Haz clic en **"Nueva Venta"** o usa el formulario integrado
2. Selecciona o crea el cliente
3. Elige la compañía (Jazztel, MásMóvil, etc.)
4. Selecciona el tipo de pack
5. Completa los detalles de fibra y/o móvil
6. Haz clic en **"Registrar Venta"**

### 3.4 Ranking de Empleados

Muestra una tabla con los vendedores ordenados por rendimiento:
- Nombre del empleado
- Número de ventas
- Score total acumulado

### 3.5 Distribución por Compañía

Gráfico circular que muestra el porcentaje de ventas por cada operadora.

---

## 4. Gestión de Clientes

### 4.1 Ver Lista de Clientes

1. En el menú lateral, haz clic en **"Clientes"**
2. Verás una tabla con todos los clientes registrados

**Información mostrada:**
- Nombre
- Teléfono
- Email
- Ciudad
- Fecha de alta

### 4.2 Buscar un Cliente

1. Usa la **barra de búsqueda** en la parte superior
2. Escribe el nombre, teléfono o email del cliente
3. La lista se filtrará automáticamente

### 4.3 Crear Nuevo Cliente

1. Haz clic en el botón **"+ Nuevo Cliente"**
2. Completa los campos:
   - **Nombre** (obligatorio)
   - **Teléfono** (obligatorio)
   - **Email** (opcional)
   - **Ciudad** (opcional)
   - **DNI** (opcional)
   - **Dirección** (opcional)
3. Haz clic en **"Guardar"**

### 4.4 Ver Detalle de un Cliente

1. Haz clic en cualquier fila de la tabla de clientes
2. Se abrirá un panel lateral con:
   - **Información del cliente**: Todos sus datos de contacto
   - **Historial de ventas**: Todas las ventas asociadas a este cliente
   - **Historial de incidencias**: Incidencias reportadas por este cliente
   - **Notas internas** (solo SuperAdmin): Campo privado para anotaciones

### 4.5 Editar un Cliente

1. Abre el detalle del cliente
2. Haz clic en el botón **"Editar"** (icono de lápiz)
3. Modifica los campos necesarios
4. Haz clic en **"Guardar Cambios"**

### 4.6 Notas Internas (Solo SuperAdmin)

Las notas internas son un campo privado que solo pueden ver los administradores:

1. Abre el detalle del cliente
2. Ve a la pestaña **"Notas Internas"**
3. Escribe las notas relevantes (ej: "Cliente VIP", "Prefiere contacto por WhatsApp")
4. Las notas se guardan automáticamente

> 💡 **Consejo:** Usa las notas internas para registrar información sensible o preferencias del cliente que no deben ser visibles para todos los empleados.

---

## 5. Gestión de Ventas

### 5.1 Ver Lista de Ventas

1. En el menú lateral, haz clic en **"Ventas"**
2. Verás una tabla con todas las ventas registradas

**Información mostrada:**
- Cliente
- Compañía
- Tipo de pack
- Estado
- Score
- Fecha

### 5.2 Filtrar Ventas

Usa los filtros disponibles:
- **Por compañía**: Jazztel, MásMóvil, Pepephone, Simyo
- **Por estado**: Registrado, En proceso, Instalado, etc.
- **Por fecha**: Rango de fechas

### 5.3 Registrar Nueva Venta

1. Haz clic en **"+ Nueva Venta"**
2. **Paso 1 - Cliente:**
   - Busca un cliente existente por teléfono
   - O crea uno nuevo completando sus datos
3. **Paso 2 - Producto:**
   - Selecciona la **Compañía**
   - Selecciona el **Tipo de Pack**:
     - Solo Móvil
     - Solo Fibra
     - Pack Fibra + Móvil
     - Pack Fibra + Móvil + TV
4. **Paso 3 - Detalles:**
   - **Para Fibra:**
     - Dirección de instalación
     - Velocidad contratada (Mbps)
   - **Para Móvil:**
     - Número de líneas
     - Por cada línea: número, tipo (Postpago/Prepago), GB de datos
5. **Paso 4 - Notas:**
   - Añade cualquier observación relevante
6. Haz clic en **"Registrar Venta"**

### 5.4 Ver Detalle de una Venta

1. Haz clic en cualquier fila de la tabla de ventas
2. Se abrirá un panel lateral con toda la información:
   - Datos del cliente
   - Detalles del pack contratado
   - Líneas móviles (si aplica)
   - Datos de fibra (si aplica)
   - Estado actual
   - Score de la venta
   - Notas

### 5.5 Editar una Venta

> ⚠️ **Permisos:** Los empleados solo pueden editar sus propias ventas. Los SuperAdmin pueden editar todas.

1. Abre el detalle de la venta
2. Haz clic en **"Editar"**
3. Modifica los campos necesarios:
   - Compañía
   - Tipo de pack
   - Precio
   - Detalles de fibra/móvil
   - Notas
4. Haz clic en **"Guardar Cambios"**

### 5.6 Cambiar Estado de una Venta

Los estados disponibles son:

| Estado | Descripción | Efecto en Score |
|--------|-------------|-----------------|
| **Registrado** | Venta recién creada | +3 puntos |
| **En proceso** | Tramitación en curso | +5 puntos |
| **Incidencia** | Problema detectado | -5 puntos |
| **Instalado** | Servicio instalado | +8 puntos |
| **Modificado** | Se han hecho cambios | +4 puntos |
| **Cancelado** | Venta cancelada | -10 puntos |
| **Finalizado** | Proceso completado | +10 puntos |

**Para cambiar el estado:**
1. Abre el detalle de la venta
2. Busca el selector de **"Estado"**
3. Selecciona el nuevo estado
4. El score se recalculará automáticamente

### 5.7 Sistema de Score (Puntuación)

Cada venta tiene un **Score de 0 a 100** que se calcula automáticamente basado en:

**Puntos por Fibra (máx. 40):**
| Velocidad | Puntos |
|-----------|--------|
| 1000 Mbps | 40 |
| 600 Mbps | 30 |
| 300 Mbps | 20 |
| 100 Mbps | 10 |

**Puntos por Móvil (máx. 30):**
- Por número de líneas: hasta 15 puntos (5 pts/línea)
- Por GB de datos: hasta 15 puntos (100+ GB = 15 pts)

**Puntos por Precio (máx. 20):**
| Precio mensual | Puntos |
|----------------|--------|
| 70€+ | 20 |
| 50-69€ | 15 |
| 30-49€ | 10 |
| 15-29€ | 5 |

**Puntos por Estado:** Ver tabla de estados arriba.

---

## 6. Tarifas y Packs

### 6.1 Ver Catálogo de Tarifas

1. En el menú lateral, haz clic en **"Tarifas"**
2. Verás las tarifas organizadas por compañía

### 6.2 Filtrar Tarifas

- **Por compañía**: Selecciona la operadora
- **Por tipo**: Solo Fibra, Solo Móvil, Pack

### 6.3 Crear Nueva Tarifa (SuperAdmin)

1. Haz clic en **"+ Nueva Tarifa"**
2. Completa los campos:
   - Compañía
   - Nombre de la tarifa
   - Tipo (Fibra/Móvil/Pack)
   - Precio mensual
   - Velocidad de fibra (si aplica)
   - GB de datos móviles (si aplica)
3. Haz clic en **"Guardar"**

### 6.4 Activar/Desactivar Tarifas

1. Localiza la tarifa en la lista
2. Usa el interruptor de **"Activo"** para activar o desactivar
3. Las tarifas desactivadas no aparecerán al crear ventas

---

## 7. Incidencias

### 7.1 Ver Lista de Incidencias

1. En el menú lateral, haz clic en **"Incidencias"**
2. Verás una tabla con todas las incidencias

**Información mostrada:**
- Cliente
- Título
- Prioridad
- Estado
- Asignado a
- Fecha

### 7.2 Filtrar Incidencias

- **Por estado**: Abierta, En Proceso, Cerrada
- **Por prioridad**: Baja, Media, Alta, Crítica
- **Por búsqueda**: Nombre del cliente o título

### 7.3 Crear Nueva Incidencia

1. Haz clic en **"+ Nueva Incidencia"**
2. Completa los campos:
   - **Cliente**: Selecciona el cliente afectado
   - **Título**: Descripción breve del problema
   - **Tipo**: Técnica, Comercial, Administrativa
   - **Prioridad**: Baja, Media, Alta, Crítica
   - **Descripción**: Detalle completo del problema
3. Haz clic en **"Crear Incidencia"**

### 7.4 Ver Detalle de una Incidencia

1. Haz clic en cualquier fila de la tabla
2. Se abrirá un panel con:
   - Información del cliente
   - Detalles de la incidencia
   - Timeline de comentarios
   - Notas de resolución

### 7.5 Editar una Incidencia

1. Abre el detalle de la incidencia
2. Haz clic en **"Editar"**
3. Puedes modificar:
   - Título
   - Descripción
   - Tipo
   - Prioridad
   - Estado
   - Asignado a (quién está trabajando en ella)
4. Haz clic en **"Guardar Cambios"**

### 7.6 Cambiar Estado de Incidencia

| Estado | Descripción |
|--------|-------------|
| **Abierta** | Nueva incidencia sin atender |
| **En Proceso** | Se está trabajando en ella |
| **Cerrada** | Resuelta completamente |

### 7.7 Añadir Comentarios

Los comentarios funcionan como un timeline de seguimiento:

1. Abre el detalle de la incidencia
2. En la sección **"Comentarios"**, escribe tu mensaje
3. Haz clic en **"Añadir Comentario"**
4. El comentario aparecerá con tu nombre y la fecha/hora

> 💡 **Consejo:** Usa los comentarios para documentar cada acción tomada. Esto ayuda al seguimiento y a otros compañeros que puedan atender la incidencia.

### 7.8 Notas de Resolución

Cuando cierres una incidencia:

1. Abre el detalle de la incidencia
2. En el campo **"Notas de Resolución"**, documenta:
   - Qué causó el problema
   - Qué solución se aplicó
   - Cualquier acción preventiva
3. Cambia el estado a **"Cerrada"**

---

## 8. Control Horario (Fichajes)

### 8.1 Fichar Entrada/Salida (Empleados)

1. En el menú lateral, haz clic en **"Fichajes"**
2. Verás un botón grande para fichar:
   - **"Fichar Entrada"**: Si aún no has fichado hoy
   - **"Fichar Salida"**: Si ya fichaste entrada
3. Haz clic en el botón correspondiente
4. Se registrará automáticamente la fecha y hora

### 8.2 Ver Tu Historial de Fichajes

En la misma página de Fichajes verás:
- **Hoy**: Tu fichaje del día actual
- **Esta semana**: Resumen de horas trabajadas
- **Historial**: Lista de todos tus fichajes

### 8.3 Panel de Administración (Solo SuperAdmin)

Como SuperAdmin, tienes acceso a una vista completa:

**Resumen de Hoy:**
- Empleados fichados vs. no fichados
- Horas totales trabajadas

**Lista de Empleados:**
Por cada empleado verás:
- Nombre
- Estado actual (Fichado/No fichado)
- Hora de entrada (si fichó)
- Horas trabajadas hoy

**Historial por Empleado:**
1. Haz clic en un empleado de la lista
2. Se desplegará su historial detallado
3. Puedes filtrar por período: 7, 15, 30, 60 días

---

## 9. Contactos

### 9.1 Directorio de Contactos

La sección de Contactos permite gestionar contactos importantes del negocio (proveedores, técnicos, soporte de operadoras, etc.).

1. En el menú lateral, haz clic en **"Contactos"**
2. Verás la lista de contactos guardados

### 9.2 Añadir Contacto

1. Haz clic en **"+ Nuevo Contacto"**
2. Completa los campos:
   - Nombre
   - Empresa/Categoría
   - Teléfono
   - Email
   - Notas
3. Haz clic en **"Guardar"**

---

## 10. Calculadora de Tarifas

### 10.1 ¿Qué es la Calculadora?

La Calculadora es un asistente que ayuda a recomendar la mejor tarifa según las necesidades del cliente.

### 10.2 Cómo Usar la Calculadora

**Paso 1 - Tipo de Servicio:**
- Selecciona qué necesita el cliente:
  - Solo Fibra
  - Solo Móvil
  - Fibra + Móvil

**Paso 2 - Requisitos:**
- **Para Fibra:**
  - ¿Qué uso le dará? (Básico, Normal, Intensivo, Profesional)
  - ¿Cuántos dispositivos conectará?
- **Para Móvil:**
  - ¿Cuántas líneas necesita?
  - ¿Cuántos GB aproximados por línea?

**Paso 3 - Resultados:**
- El sistema mostrará las tarifas recomendadas
- Ordenadas por mejor relación calidad/precio
- Con el score de cada opción

### 10.3 Usar Recomendación para Crear Venta

1. Tras obtener los resultados, haz clic en **"Crear Venta con esta Tarifa"**
2. Se abrirá el formulario de venta con la tarifa preseleccionada

---

## 11. Reportes y Analíticas (SuperAdmin)

> ⚠️ **Acceso:** Esta sección solo está disponible para usuarios con rol SuperAdmin.

### 11.1 Acceder a Reportes

1. En el menú lateral, haz clic en **"Reportes"**
2. Verás el dashboard de analíticas

### 11.2 Selector de Período

En la esquina superior derecha puedes seleccionar el período de análisis:
- 7 días
- 15 días
- 30 días
- 60 días
- 90 días

### 11.3 KPIs con Tendencias

Las tarjetas superiores muestran:

| KPI | Descripción |
|-----|-------------|
| **Ventas** | Total de ventas en el período |
| **Ingresos** | Suma total de precios de packs vendidos |
| **Score Total** | Suma de scores de todas las ventas |
| **Score Promedio** | Media de score por venta |

Cada KPI incluye:
- Valor actual
- Comparativa con el período anterior (% de cambio)
- Indicador visual (flecha verde/roja)

### 11.4 Gráfico: Ventas por Día

Un gráfico de líneas que muestra:
- **Línea azul**: Número de ventas por día
- **Línea verde**: Ingresos por día

**Interacción:**
- Pasa el cursor sobre un punto para ver el detalle
- Haz clic en la leyenda para ocultar/mostrar líneas

### 11.5 Gráfico: Ventas por Compañía

Un gráfico circular (pie chart) que muestra la distribución de ventas:
- Porcentaje por cada operadora
- Número de ventas
- Ingresos generados

### 11.6 Gráfico: Ventas por Empleado

Un gráfico de barras horizontal con el ranking de empleados:
- Nombre del empleado
- Número de ventas
- Score total

### 11.7 Exportar Datos

En la pestaña **"Exportar"** puedes descargar datos en diferentes formatos:

**Ventas:**
- **CSV**: Archivo de Excel con todas las ventas
- **PDF**: Reporte formateado para imprimir

**Clientes:**
- **CSV**: Base de datos de clientes

**Incidencias:**
- **CSV**: Historial de incidencias

**Cómo exportar:**
1. Ve a la pestaña "Exportar"
2. Selecciona el tipo de dato
3. Haz clic en el botón del formato deseado
4. El archivo se descargará automáticamente

---

## 12. Comisiones (SuperAdmin)

> ⚠️ **Acceso:** Esta sección solo está disponible para usuarios con rol SuperAdmin. Los empleados NO pueden ver las reglas ni los cálculos de comisiones.

### 12.1 Acceder a Comisiones

1. En el menú lateral, haz clic en **"Comisiones"**
2. Verás el panel de gestión de comisiones

### 12.2 Selector de Mes/Año

En la esquina superior derecha, selecciona:
- **Mes**: Enero a Diciembre
- **Año**: 2024, 2025, 2026, 2027

### 12.3 KPIs de Comisiones

| KPI | Descripción |
|-----|-------------|
| **Umbral** | Ventas mínimas para empezar a comisionar |
| **Ventas Totales** | Total de ventas del mes |
| **Comisionables** | Ventas que generan comisión |
| **Total a Pagar** | Suma de comisiones del mes (€) |

### 12.4 Pestaña: Resumen por Empleado

Una tabla que muestra por cada empleado:

| Columna | Descripción |
|---------|-------------|
| **Empleado** | Nombre del vendedor |
| **Ventas** | Total de ventas realizadas |
| **Válidas** | Ventas en estado "Instalado" o "Finalizado" |
| **Umbral** | "Alcanzado" o progreso (ej: 5/10) |
| **Comisionables** | Ventas que generaron comisión |
| **Comisión** | Total a pagar al empleado (€) |

**Ver detalle de un empleado:**
1. Haz clic en la fila del empleado
2. Se abrirá un panel con el desglose venta por venta
3. Verás qué ventas comisionaron y cuáles no, con la razón

### 12.5 Pestaña: Configuración

#### Reglas de Umbral

| Campo | Descripción |
|-------|-------------|
| **Umbral Mínimo** | Número de ventas antes de empezar a comisionar |
| **Comisión Retroactiva** | Si se activa, al alcanzar el umbral se comisionan las ventas anteriores |
| **Retroactividad desde** | Desde qué número de venta aplicar la retroactividad |

**Ejemplo:**
- Umbral: 10
- Retroactividad: Activada, desde venta #1
- Resultado: El empleado no gana comisiones hasta su venta #10. Al alcanzarla, recibe comisiones por las ventas 1-10.

#### Categorías de Comisión

Cada categoría define cuánto se paga por tipo de venta:

| Campo | Descripción |
|-------|-------------|
| **Nombre** | Identificador de la categoría |
| **Descripción** | Explicación de qué ventas aplican |
| **Valor** | Cantidad en € o % |
| **Tipo** | Fijo (€) o Porcentaje (%) |
| **Precio Mín/Máx** | Rango de precio del pack para aplicar |
| **Tipos de Pack** | A qué tipos de pack aplica |

**Categorías por defecto disponibles:**
- Venta de Alto Valor: €25 (packs >€60)
- Venta de Valor Medio: €15 (packs €35-60)
- Fibra Suelta: €12
- Móvil Suelto: €8
- Venta de Bajo Valor: €5 (packs <€35)

### 12.6 Editar Configuración

1. Haz clic en el botón **"Editar"**
2. Modifica los valores de umbral y retroactividad
3. Añade, edita o elimina categorías
4. Haz clic en **"Guardar Configuración"**

### 12.7 Añadir Nueva Categoría

1. En modo edición, haz clic en **"+ Añadir Categoría"**
2. Completa los campos:
   - Nombre
   - Descripción
   - Tipo de comisión (Fijo/Porcentaje)
   - Valor
   - Precio mínimo/máximo (opcional)
   - Tipos de pack aplicables
3. Activa/desactiva la categoría
4. Haz clic en **"Añadir"**

### 12.8 Duplicar Configuración

Para copiar la configuración de un mes a otro:

1. Haz clic en **"Duplicar a otro mes"**
2. Selecciona el mes y año destino
3. Haz clic en **"Duplicar"**

> 💡 **Consejo:** Usa esta función para no tener que configurar desde cero cada mes. Duplica el mes anterior y ajusta solo lo necesario.

### 12.9 Cargar Categorías por Defecto

Si empiezas desde cero:
1. En modo edición, haz clic en **"Cargar por defecto"**
2. Se cargarán las categorías estándar basadas en el modelo VEDA

---

## 13. Configuración

### 13.1 Acceder a Configuración

1. En el menú lateral, haz clic en **"Configuración"**

### 13.2 Perfil de Usuario

- Ver y editar tu nombre
- Cambiar tu contraseña
- Seleccionar idioma preferido

### 13.3 Idiomas Disponibles

- Español (Castellano)
- Catalán
- Inglés

---

## 14. Preguntas Frecuentes (FAQ)

### General

**P: ¿Puedo usar el sistema desde el móvil?**
R: Sí, el sistema es completamente responsive y funciona en móviles y tablets.

**P: ¿Se guardan los datos automáticamente?**
R: La mayoría de acciones requieren hacer clic en "Guardar". Las notas internas de clientes se guardan automáticamente.

**P: ¿Puedo trabajar sin conexión a internet?**
R: No, el sistema requiere conexión a internet para funcionar.

### Ventas

**P: ¿Puedo eliminar una venta?**
R: No, las ventas no se pueden eliminar para mantener la integridad de los datos. Puedes cambiar su estado a "Cancelado".

**P: ¿Por qué no puedo editar una venta?**
R: Los empleados solo pueden editar sus propias ventas. Si eres SuperAdmin y no puedes editar, contacta con soporte.

**P: ¿Cómo se calcula el Score?**
R: El score (0-100) se calcula automáticamente basado en: velocidad de fibra, líneas móviles, GB de datos, precio del pack y estado de la venta. Ver sección 5.7 para detalles.

**P: ¿Qué pasa si el cliente ya existe?**
R: Al crear una venta, si introduces un teléfono que ya existe, el sistema recuperará automáticamente los datos del cliente.

### Incidencias

**P: ¿Quién puede ver las incidencias?**
R: Todos los usuarios pueden ver todas las incidencias. Los empleados solo pueden editar las que crearon ellos.

**P: ¿Cómo sé si una incidencia es urgente?**
R: Revisa la columna "Prioridad". Las incidencias "Alta" y "Crítica" deben atenderse prioritariamente.

### Fichajes

**P: ¿Qué pasa si olvido fichar?**
R: Contacta con tu SuperAdmin para que pueda revisar y ajustar tu registro si es necesario.

**P: ¿El sistema detecta si ficho desde fuera del trabajo?**
R: No, el sistema actual no tiene geolocalización.

### Comisiones

**P: ¿Cuándo se pagan las comisiones?**
R: El sistema calcula las comisiones, pero el pago real depende de la política de tu empresa.

**P: ¿Por qué mi venta no aparece como comisionable?**
R: Una venta solo comisiona si:
1. Has alcanzado el umbral mínimo del mes
2. La venta está en estado "Instalado" o "Finalizado"
3. La venta encaja en alguna categoría de comisión configurada

**P: ¿Puedo ver mis comisiones como empleado?**
R: No, actualmente las comisiones solo son visibles para SuperAdmin.

### Reportes

**P: ¿Puedo programar envío automático de reportes?**
R: Actualmente no. Los reportes deben descargarse manualmente.

**P: ¿En qué formato se exporta el PDF?**
R: El PDF se genera en formato A4, optimizado para impresión.

---

## 15. Glosario

| Término | Definición |
|---------|------------|
| **Pack** | Conjunto de servicios contratados (fibra, móvil, TV) |
| **Score** | Puntuación de 0 a 100 que mide la calidad de una venta |
| **Umbral** | Número mínimo de ventas para empezar a comisionar |
| **Retroactividad** | Aplicar comisiones a ventas anteriores al alcanzar el umbral |
| **KPI** | Indicador Clave de Rendimiento (métrica importante) |
| **SuperAdmin** | Usuario con permisos de administración total |
| **Empleado** | Usuario con permisos limitados a sus propias acciones |
| **Fibra** | Servicio de internet por fibra óptica |
| **Portabilidad** | Traer un número de teléfono desde otra compañía |
| **ICCID** | Identificador único de la tarjeta SIM |

---

## 📞 Soporte

Si tienes problemas técnicos o dudas que no se resuelven en este manual:

1. Contacta con tu SuperAdmin
2. Documenta el problema con capturas de pantalla si es posible
3. Indica qué acción intentabas realizar y qué error apareció

---

**© 2026 HIPNOTIK LEVEL Stand - Manual de Usuario v1.0**
