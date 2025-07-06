// Módulo para mantener y actualizar las funciones disponibles en IA.
window.funciones = {
  'buscar_productos': {
    label: "Buscar productos (buscar_productos)",
    params: [{nombre: "texto_buscado", label:"Texto a buscar"}]
  },
  'pedidos': {
    label: "Registrar pedido (pedidos)",
    params: [
      {nombre: "nombre", label:"Nombre"}, {nombre: "whatsapp", label:"WhatsApp"},
      {nombre: "productos", label:"Productos"}, {nombre: "cantidades", label:"Cantidades"},
      {nombre: "total", label:"Total"}, {nombre:"direccion", label:"Dirección"}, {nombre:"modalidad", label:"Modalidad"}
    ]
  },
  'send_notification_message': {
    label: "Enviar notificación (send_notification_message)",
    params: [
      {nombre: "whatsapp", label:"WhatsApp del encargado"}, {nombre: "mensaje", label:"Mensaje"}
    ]
  }
};
// Si quieres permitir edición dinámica de funciones, vuelve esto una clase/módulo exportado.