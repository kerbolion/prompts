// Función para buscar productos
window.registerFunction('buscar_productos', {
  label: "Buscar productos (buscar_productos)",
  description: "Permite buscar productos en el inventario por texto",
  params: [
    {
      nombre: "texto_buscado", 
      label: "Texto a buscar",
      tipo: "string",
      requerido: true,
      descripcion: "El texto o término que se va a buscar en los productos"
    }
  ],
  // Función de validación opcional
  validate: function(params) {
    if (!params.texto_buscado || params.texto_buscado.trim() === '') {
      return "El texto a buscar es requerido";
    }
    return null; // null significa que la validación pasó
  },
  // Ejemplo de uso para mostrar en la interfaz
  ejemplo: {
    texto_buscado: "empanada pollo"
  }
});