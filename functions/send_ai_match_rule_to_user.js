// Función para enviar regla de coincidencia de IA al usuario
window.registerFunction('send_ai_match_rule_to_user', {
  label: "Enviar regla de IA al usuario (send_ai_match_rule_to_user)",
  description: "Envía una regla de coincidencia específica de IA al usuario",
  params: [
    {
      nombre: "match", 
      label: "Regla de coincidencia",
      tipo: "string",
      requerido: true,
      descripcion: "La regla específica que debe enviarse al usuario (ej: Regla #3)"
    }
  ],
  validate: function(params) {
    // Validar que se proporcione la regla
    if (!params.match || params.match.trim() === '') {
      return "La regla de coincidencia es requerida";
    }
    
    return null;
  },
  ejemplo: {
    match: "Regla #3"
  }
});