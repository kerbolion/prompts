// Función para gestionar tags de contactos
window.registerFunction('manage_contact_tags', {
  label: "Gestionar tags de contacto (manage_contact_tags)",
  description: "Permite agregar o eliminar tags de contactos",
  params: [
    {
      nombre: "operation", 
      label: "Operación",
      tipo: "select",
      opciones: ["ADD", "DELETE"],
      requerido: true,
      descripcion: "Tipo de operación: ADD para agregar tag, DELETE para eliminar tag"
    },
    {
      nombre: "tagId", 
      label: "ID del Tag",
      tipo: "string",
      requerido: true,
      descripcion: "Identificador del tag a agregar o eliminar (ej: Primera, Tercera)"
    }
  ],
  validate: function(params) {
    // Validar operación
    if (!params.operation || !['ADD', 'DELETE'].includes(params.operation)) {
      return "La operación debe ser ADD o DELETE";
    }
    
    // Validar tagId
    if (!params.tagId || params.tagId.trim() === '') {
      return "El ID del tag es requerido";
    }
    
    return null;
  },
  ejemplo: {
    operation: "ADD",
    tagId: "Primera"
  }
});