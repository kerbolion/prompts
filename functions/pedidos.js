// Función para registrar pedidos
window.registerFunction('pedidos', {
  label: "Registrar pedido (pedidos)",
  description: "Registra un nuevo pedido en el sistema",
  params: [
    {
      nombre: "nombre", 
      label: "Nombre del cliente",
      tipo: "string",
      requerido: true,
      descripcion: "Nombre completo del cliente"
    },
    {
      nombre: "whatsapp", 
      label: "WhatsApp del cliente",
      tipo: "string",
      requerido: true,
      descripcion: "Número de WhatsApp del cliente (formato: 506XXXXXXXX)"
    },
    {
      nombre: "productos", 
      label: "Productos",
      tipo: "string",
      requerido: true,
      descripcion: "Lista de productos separados por coma"
    },
    {
      nombre: "cantidades", 
      label: "Cantidades",
      tipo: "string",
      requerido: true,
      descripcion: "Cantidades de cada producto separadas por coma"
    },
    {
      nombre: "total", 
      label: "Total a pagar",
      tipo: "number",
      requerido: true,
      descripcion: "Monto total del pedido en colones"
    },
    {
      nombre: "direccion", 
      label: "Dirección de entrega",
      tipo: "string",
      requerido: false,
      descripcion: "Dirección completa para delivery (opcional si es retiro en tienda)"
    },
    {
      nombre: "modalidad", 
      label: "Modalidad de entrega",
      tipo: "select",
      opciones: ["retiro", "delivery"],
      requerido: true,
      descripcion: "Tipo de entrega: retiro en tienda o delivery"
    }
  ],
  validate: function(params) {
    // Validar nombre
    if (!params.nombre || params.nombre.trim() === '') {
      return "El nombre del cliente es requerido";
    }
    
    // Validar WhatsApp
    if (!params.whatsapp || !/^506\d{8}$/.test(params.whatsapp.replace(/\s/g, ''))) {
      return "El número de WhatsApp debe tener formato 506XXXXXXXX";
    }
    
    // Validar productos
    if (!params.productos || params.productos.trim() === '') {
      return "Los productos son requeridos";
    }
    
    // Validar cantidades
    if (!params.cantidades || params.cantidades.trim() === '') {
      return "Las cantidades son requeridas";
    }
    
    // Validar total
    if (!params.total || isNaN(parseFloat(params.total)) || parseFloat(params.total) <= 0) {
      return "El total debe ser un número mayor a 0";
    }
    
    // Validar dirección si es delivery
    if (params.modalidad === 'delivery' && (!params.direccion || params.direccion.trim() === '')) {
      return "La dirección es requerida para delivery";
    }
    
    return null;
  },
  ejemplo: {
    nombre: "Juan Pérez",
    whatsapp: "50612345678",
    productos: "Empanada de Pollo, Bebida de Piña",
    cantidades: "2, 1",
    total: "3300",
    direccion: "San José, 200m norte del parque central",
    modalidad: "delivery"
  }
});