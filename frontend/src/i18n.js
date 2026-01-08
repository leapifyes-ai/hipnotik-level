import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  es: {
    translation: {
      // Auth
      login: 'Iniciar Sesión',
      register: 'Registrarse',
      email: 'Correo Electrónico',
      password: 'Contraseña',
      name: 'Nombre',
      logout: 'Cerrar Sesión',
      
      // Dashboard
      dashboard: 'Dashboard',
      salesToday: 'Ventas Hoy',
      salesMonth: 'Ventas del Mes',
      objective: 'Objetivo',
      ranking: 'Ranking del Equipo',
      incidents: 'Incidencias',
      
      // Sales
      sales: 'Ventas',
      newSale: 'Nueva Venta',
      quickSale: 'Venta Rápida',
      client: 'Cliente',
      company: 'Compañía',
      packType: 'Tipo de Pack',
      status: 'Estado',
      
      // Clients
      clients: 'Clientes',
      newClient: 'Nuevo Cliente',
      phone: 'Teléfono',
      city: 'Ciudad',
      search: 'Buscar',
      
      // Packs
      packs: 'Tarifas / Packs',
      newPack: 'Nueva Tarifa',
      price: 'Precio',
      features: 'Características',
      active: 'Activa',
      
      // Common
      save: 'Guardar',
      cancel: 'Cancelar',
      delete: 'Eliminar',
      edit: 'Editar',
      view: 'Ver',
      export: 'Exportar',
      actions: 'Acciones',
      close: 'Cerrar'
    }
  },
  ca: {
    translation: {
      login: 'Iniciar Sessió',
      register: 'Registrar-se',
      email: 'Correu Electrònic',
      password: 'Contrasenya',
      name: 'Nom',
      logout: 'Tancar Sessió',
      
      dashboard: 'Tauler',
      salesToday: 'Vendes Avui',
      salesMonth: 'Vendes del Mes',
      objective: 'Objectiu',
      ranking: 'Rànquing de l\'Equip',
      incidents: 'Incidències',
      
      sales: 'Vendes',
      newSale: 'Nova Venda',
      quickSale: 'Venda Ràpida',
      client: 'Client',
      company: 'Companyia',
      packType: 'Tipus de Pack',
      status: 'Estat',
      
      clients: 'Clients',
      newClient: 'Nou Client',
      phone: 'Telèfon',
      city: 'Ciutat',
      search: 'Cercar',
      
      packs: 'Tarifes / Packs',
      newPack: 'Nova Tarifa',
      price: 'Preu',
      features: 'Característiques',
      active: 'Activa',
      
      save: 'Guardar',
      cancel: 'Cancel·lar',
      delete: 'Eliminar',
      edit: 'Editar',
      view: 'Veure',
      export: 'Exportar',
      actions: 'Accions',
      close: 'Tancar'
    }
  },
  en: {
    translation: {
      login: 'Log In',
      register: 'Sign Up',
      email: 'Email',
      password: 'Password',
      name: 'Name',
      logout: 'Log Out',
      
      dashboard: 'Dashboard',
      salesToday: 'Sales Today',
      salesMonth: 'Sales This Month',
      objective: 'Objective',
      ranking: 'Team Ranking',
      incidents: 'Incidents',
      
      sales: 'Sales',
      newSale: 'New Sale',
      quickSale: 'Quick Sale',
      client: 'Client',
      company: 'Company',
      packType: 'Pack Type',
      status: 'Status',
      
      clients: 'Clients',
      newClient: 'New Client',
      phone: 'Phone',
      city: 'City',
      search: 'Search',
      
      packs: 'Plans / Packs',
      newPack: 'New Plan',
      price: 'Price',
      features: 'Features',
      active: 'Active',
      
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      view: 'View',
      export: 'Export',
      actions: 'Actions',
      close: 'Close'
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'es',
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
