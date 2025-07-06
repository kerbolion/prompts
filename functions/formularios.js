// Función para manejar formularios dinámicos
window.registerFunction('formularios', {
  label: "Formularios (formularios)",
  description: "Crea un formulario dinámico con campos personalizables",
  params: [
    {
      nombre: "nombre_formulario", 
      label: "Nombre del formulario",
      tipo: "string",
      requerido: true,
      descripcion: "Nombre que identifica el tipo de formulario (ej: pedidos, contacto, suscripcion)"
    }
  ],
  // Esta función tendrá campos dinámicos que se pueden agregar desde la UI
  camposDinamicos: true,
  validate: function(params) {
    // Validar nombre del formulario
    if (!params.nombre_formulario || params.nombre_formulario.trim() === '') {
      return "El nombre del formulario es requerido";
    }
    
    return null;
  },
  ejemplo: {
    nombre_formulario: "pedidos"
  }
});