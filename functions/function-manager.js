// Gestor de funciones - Sistema modular para manejo de funciones
window.funciones = {};

// Función para registrar nuevas funciones
window.registerFunction = function(nombre, definicion) {
  // Validar que la definición tenga los campos requeridos
  if (!definicion.label || !definicion.params || !Array.isArray(definicion.params)) {
    console.error(`Error al registrar función '${nombre}': definición inválida`);
    return false;
  }
  
  // Validar parámetros
  for (let param of definicion.params) {
    if (!param.nombre || !param.label) {
      console.error(`Error al registrar función '${nombre}': parámetro inválido`, param);
      return false;
    }
  }
  
  // Registrar la función
  window.funciones[nombre] = definicion;
  
  // Disparar evento para notificar que se registró una nueva función
  window.dispatchEvent(new CustomEvent('functionRegistered', {
    detail: { nombre, definicion }
  }));
  
  console.log(`Función '${nombre}' registrada exitosamente`);
  return true;
};

// Función para obtener todas las funciones registradas
window.getFunctions = function() {
  return window.funciones;
};

// Función para obtener una función específica
window.getFunction = function(nombre) {
  return window.funciones[nombre] || null;
};

// Función para validar parámetros de una función
window.validateFunctionParams = function(nombreFuncion, params) {
  const funcion = window.getFunction(nombreFuncion);
  if (!funcion) {
    return `Función '${nombreFuncion}' no encontrada`;
  }
  
  // Si la función tiene validador personalizado, usarlo
  if (funcion.validate && typeof funcion.validate === 'function') {
    return funcion.validate(params);
  }
  
  // Validación básica
  for (let paramDef of funcion.params) {
    if (paramDef.requerido && (!params[paramDef.nombre] || params[paramDef.nombre].trim() === '')) {
      return `El parámetro '${paramDef.label}' es requerido`;
    }
  }
  
  return null; // null significa que la validación pasó
};

// Función para desregistrar una función
window.unregisterFunction = function(nombre) {
  if (window.funciones[nombre]) {
    delete window.funciones[nombre];
    window.dispatchEvent(new CustomEvent('functionUnregistered', {
      detail: { nombre }
    }));
    console.log(`Función '${nombre}' desregistrada`);
    return true;
  }
  return false;
};

// Función para cargar funciones desde archivos
window.loadFunctions = function() {
  const funcionesACargar = [
    'functions/formularios.js',
    'functions/send_notification_message.js',
    'functions/send_ai_match_rule_to_user.js',
    'functions/manage_contact_tags.js',
    'functions/pedidos.js'
  ];
  
  funcionesACargar.forEach(archivo => {
    const script = document.createElement('script');
    script.src = archivo;
    script.onload = () => console.log(`Función cargada: ${archivo}`);
    script.onerror = () => console.error(`Error al cargar: ${archivo}`);
    document.head.appendChild(script);
  });
};

// Función para listar funciones disponibles (útil para debug)
window.listFunctions = function() {
  console.log('Funciones disponibles:');
  Object.keys(window.funciones).forEach(nombre => {
    const func = window.funciones[nombre];
    console.log(`- ${nombre}: ${func.label}`);
    console.log(`  Parámetros: ${func.params.map(p => p.nombre).join(', ')}`);
  });
};

// Cargar funciones automáticamente cuando se carga el script
document.addEventListener('DOMContentLoaded', function() {
  window.loadFunctions();
});

// Listener para recargar la UI cuando se registre una nueva función
window.addEventListener('functionRegistered', function(event) {
  if (typeof window.renderPasos === 'function') {
    window.renderPasos();
  }
});