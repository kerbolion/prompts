// Función para enviar notificaciones
window.registerFunction('send_notification_message', {
  label: "Enviar notificación (send_notification_message)",
  description: "Envía una notificación por WhatsApp al encargado del negocio",
  params: [
    {
      nombre: "whatsapp", 
      label: "WhatsApp del encargado",
      tipo: "string",
      requerido: true,
      descripcion: "Número de WhatsApp del encargado (formato: 506XXXXXXXX)"
    },
    {
      nombre: "mensaje", 
      label: "Mensaje de notificación",
      tipo: "string",
      requerido: true,
      descripcion: "Mensaje que se enviará al encargado"
    }
  ],
  validate: function(params) {
    // Validar WhatsApp
    if (!params.whatsapp || !/^506\d{8}$/.test(params.whatsapp.replace(/\s/g, ''))) {
      return "El número de WhatsApp debe tener formato 506XXXXXXXX";
    }
    
    // Validar mensaje
    if (!params.mensaje || params.mensaje.trim() === '') {
      return "El mensaje es requerido";
    }
    
    if (params.mensaje.length > 500) {
      return "El mensaje no puede exceder 500 caracteres";
    }
    
    return null;
  },
  ejemplo: {
    whatsapp: "50612345678",
    mensaje: "Nuevo pedido recibido, revisa la app."
  }
});