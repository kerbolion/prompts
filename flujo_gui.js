// Sistema de Gestión de Proyectos y Versiones
window.proyectos = JSON.parse(localStorage.getItem('ia_proyectos') || '{}');
window.proyectoActual = localStorage.getItem('ia_proyecto_actual') || null;
window.versionActual = null;
window.configuracionModificada = false;

// Sistema de Pestañas
window.pestanaActual = 0;

window.cambiarPestana = function(indice) {
  // Ocultar todas las pestañas
  const tabs = document.querySelectorAll('.tab-content');
  const buttons = document.querySelectorAll('.tab-btn');
  
  tabs.forEach(tab => tab.classList.remove('active'));
  buttons.forEach(btn => btn.classList.remove('active'));
  
  // Mostrar pestaña seleccionada
  document.getElementById(`tab-${indice}`).classList.add('active');
  buttons[indice].classList.add('active');
  
  window.pestanaActual = indice;
};

// Gestión de Proyectos
window.renderProyectos = function() {
  const selector = document.getElementById("selector-proyectos");
  selector.innerHTML = '<option value="">Seleccionar proyecto...</option>';
  
  const proyectosExistentes = Object.keys(window.proyectos);
  
  proyectosExistentes.forEach(nombreProyecto => {
    const option = document.createElement("option");
    option.value = nombreProyecto;
    option.textContent = nombreProyecto;
    option.selected = nombreProyecto === window.proyectoActual;
    selector.appendChild(option);
  });
  
  // Actualizar campo de nombre
  if (window.proyectoActual && window.proyectos[window.proyectoActual]) {
    document.getElementById("nombre-proyecto").value = window.proyectoActual;
    window.renderVersiones();
  } else {
    // Si no hay proyecto actual, limpiar
    document.getElementById("nombre-proyecto").value = "";
    window.proyectoActual = null;
    window.versionActual = null;
    window.renderVersiones();
  }
  
  console.log("Proyectos renderizados. Actual:", window.proyectoActual);
  console.log("Proyectos disponibles:", proyectosExistentes);
};

window.crearProyectoDesdeInput = function() {
  const nombreInput = document.getElementById("nombre-proyecto");
  const nombre = nombreInput.value.trim();
  
  if (!nombre) {
    alert("Por favor, escribe el nombre del proyecto");
    nombreInput.focus();
    return;
  }
  
  if (window.proyectos[nombre]) {
    alert("Ya existe un proyecto con ese nombre");
    return;
  }
  
  window.crearProyecto(nombre);
  alert(`Proyecto "${nombre}" creado exitosamente`);
};

window.renderVersiones = function() {
  const selector = document.getElementById("selector-versiones");
  selector.innerHTML = "";
  
  if (!window.proyectoActual || !window.proyectos[window.proyectoActual]) {
    selector.innerHTML = '<option value="">Sin versiones guardadas</option>';
    return;
  }
  
  const versiones = window.proyectos[window.proyectoActual].versiones || {};
  const versionesOrdenadas = Object.keys(versiones).sort((a, b) => new Date(b) - new Date(a));
  
  if (versionesOrdenadas.length === 0) {
    selector.innerHTML = '<option value="">Sin versiones guardadas</option>';
    return;
  }
  
  versionesOrdenadas.forEach(timestamp => {
    const option = document.createElement("option");
    option.value = timestamp;
    const fecha = new Date(timestamp);
    option.textContent = `${window.proyectoActual} ${fecha.toLocaleDateString()} ${fecha.toLocaleTimeString()}`;
    option.selected = timestamp === window.versionActual;
    selector.appendChild(option);
  });
};

window.cambiarProyecto = function(nombreProyecto) {
  if (!nombreProyecto || nombreProyecto === "") {
    // Si se selecciona la opción vacía, no hacer nada
    return;
  }
  
  if (window.proyectos[nombreProyecto]) {
    window.proyectoActual = nombreProyecto;
    localStorage.setItem('ia_proyecto_actual', nombreProyecto);
    window.versionActual = null;
    window.renderProyectos();
    
    // Cargar la última versión si existe
    const versiones = window.proyectos[nombreProyecto].versiones || {};
    const ultimaVersion = Object.keys(versiones).sort((a, b) => new Date(b) - new Date(a))[0];
    
    if (ultimaVersion) {
      window.cargarVersion(ultimaVersion);
    } else {
      window.limpiarConfiguracion();
      window.actualizarPrompt();
    }
    
    console.log("Proyecto cambiado a:", nombreProyecto);
  }
};

window.crearProyecto = function(nombre) {
  if (window.proyectos[nombre]) {
    alert("Ya existe un proyecto con ese nombre");
    window.renderProyectos();
    return;
  }
  
  window.proyectos[nombre] = {
    nombre: nombre,
    creado: new Date().toISOString(),
    versiones: {}
  };
  
  window.proyectoActual = nombre;
  window.versionActual = null;
  window.configuracionModificada = false;
  
  localStorage.setItem('ia_proyectos', JSON.stringify(window.proyectos));
  localStorage.setItem('ia_proyecto_actual', nombre);
  
  // Limpiar configuración actual
  window.limpiarConfiguracion();
  window.renderProyectos();
  
  console.log("Proyecto creado:", nombre);
};

window.actualizarNombreProyecto = function(nuevoNombre) {
  if (!window.proyectoActual || nuevoNombre.trim() === '') return;
  
  const nombreAnterior = window.proyectoActual;
  const nombreNuevo = nuevoNombre.trim();
  
  if (nombreAnterior === nombreNuevo) return;
  
  if (window.proyectos[nombreNuevo]) {
    alert("Ya existe un proyecto con ese nombre");
    document.getElementById("nombre-proyecto").value = nombreAnterior;
    return;
  }
  
  // Renombrar proyecto
  window.proyectos[nombreNuevo] = window.proyectos[nombreAnterior];
  window.proyectos[nombreNuevo].nombre = nombreNuevo;
  delete window.proyectos[nombreAnterior];
  
  window.proyectoActual = nombreNuevo;
  localStorage.setItem('ia_proyectos', JSON.stringify(window.proyectos));
  localStorage.setItem('ia_proyecto_actual', nombreNuevo);
  
  window.renderProyectos();
};

window.guardarVersion = function() {
  if (!window.proyectoActual) {
    alert("Primero crea o selecciona un proyecto");
    return;
  }
  
  const timestamp = new Date().toISOString();
  const configuracion = window.obtenerConfiguracionActual();
  
  if (!window.proyectos[window.proyectoActual].versiones) {
    window.proyectos[window.proyectoActual].versiones = {};
  }
  
  window.proyectos[window.proyectoActual].versiones[timestamp] = configuracion;
  window.versionActual = timestamp;
  window.configuracionModificada = false;
  
  localStorage.setItem('ia_proyectos', JSON.stringify(window.proyectos));
  
  window.renderVersiones();
  
  const fecha = new Date(timestamp);
  alert(`Versión guardada: ${fecha.toLocaleDateString()} ${fecha.toLocaleTimeString()}`);
};

window.cargarVersion = function(timestamp) {
  if (!timestamp || !window.proyectoActual) return;
  
  const version = window.proyectos[window.proyectoActual].versiones[timestamp];
  if (!version) return;
  
  window.versionActual = timestamp;
  window.cargarConfiguracion(version);
  window.configuracionModificada = false;
  
  window.renderFlujos();
  window.actualizarPrompt();
};

window.eliminarProyecto = function() {
  if (!window.proyectoActual) return;
  
  if (confirm(`¿Eliminar el proyecto "${window.proyectoActual}" y todas sus versiones?`)) {
    delete window.proyectos[window.proyectoActual];
    localStorage.setItem('ia_proyectos', JSON.stringify(window.proyectos));
    
    // Seleccionar otro proyecto o limpiar
    const proyectosDisponibles = Object.keys(window.proyectos);
    if (proyectosDisponibles.length > 0) {
      window.proyectoActual = proyectosDisponibles[0];
      localStorage.setItem('ia_proyecto_actual', window.proyectoActual);
    } else {
      window.proyectoActual = null;
      localStorage.removeItem('ia_proyecto_actual');
      window.limpiarConfiguracion();
    }
    
    window.versionActual = null;
    window.renderProyectos();
  }
};

// Funciones de exportación
window.exportarPrompt = function() {
  const prompt = document.getElementById("output").innerText;
  const blob = new Blob([prompt], { type: 'text/plain' });
  const url = window.URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `${window.proyectoActual || 'prompt'}_${new Date().toISOString().slice(0,16).replace(/:/g,'-')}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

window.exportarProyecto = function() {
  if (!window.proyectoActual) {
    alert("No hay proyecto seleccionado para exportar");
    return;
  }
  
  const proyecto = window.proyectos[window.proyectoActual];
  const blob = new Blob([JSON.stringify(proyecto, null, 2)], { type: 'application/json' });
  const url = window.URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `${window.proyectoActual}_proyecto.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

window.importarProyecto = function() {
  // Crear input file temporal
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.style.display = 'none';
  
  input.onchange = function(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.name.endsWith('.json')) {
      alert("Por favor selecciona un archivo JSON válido");
      return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const proyectoImportado = JSON.parse(e.target.result);
        
        // Validar estructura del archivo
        if (!proyectoImportado.nombre || !proyectoImportado.versiones) {
          alert("El archivo no tiene la estructura correcta de un proyecto");
          return;
        }
        
        // Obtener nombre del proyecto
        let nombreProyecto = proyectoImportado.nombre;
        
        // Si ya existe, preguntar si sobrescribir o renombrar
        if (window.proyectos[nombreProyecto]) {
          const opcion = confirm(
            `Ya existe un proyecto llamado "${nombreProyecto}".\n\n` +
            "¿Deseas sobrescribirlo?\n\n" +
            "• OK = Sobrescribir proyecto existente\n" +
            "• Cancelar = Crear con nuevo nombre"
          );
          
          if (!opcion) {
            // Crear nombre único
            let contador = 1;
            let nuevoNombre = `${nombreProyecto} (${contador})`;
            while (window.proyectos[nuevoNombre]) {
              contador++;
              nuevoNombre = `${nombreProyecto} (${contador})`;
            }
            nombreProyecto = nuevoNombre;
            proyectoImportado.nombre = nombreProyecto;
          }
        }
        
        // Importar proyecto
        window.proyectos[nombreProyecto] = proyectoImportado;
        localStorage.setItem('ia_proyectos', JSON.stringify(window.proyectos));
        
        // Seleccionar proyecto importado
        window.proyectoActual = nombreProyecto;
        localStorage.setItem('ia_proyecto_actual', nombreProyecto);
        
        // Cargar la última versión
        const versiones = proyectoImportado.versiones || {};
        const ultimaVersion = Object.keys(versiones).sort((a, b) => new Date(b) - new Date(a))[0];
        
        if (ultimaVersion) {
          window.versionActual = ultimaVersion;
          window.cargarVersion(ultimaVersion);
        }
        
        window.renderProyectos();
        
        // Mostrar información del proyecto importado
        const numVersiones = Object.keys(versiones).length;
        alert(
          `✅ Proyecto importado exitosamente!\n\n` +
          `📁 Nombre: ${nombreProyecto}\n` +
          `📅 Versiones: ${numVersiones}\n` +
          `⏰ Creado: ${new Date(proyectoImportado.creado).toLocaleString()}`
        );
        
        console.log("Proyecto importado:", nombreProyecto, proyectoImportado);
        
      } catch (error) {
        console.error("Error al importar proyecto:", error);
        alert("Error al leer el archivo. Asegúrate de que sea un archivo de proyecto válido.");
      }
    };
    
    reader.readAsText(file);
    document.body.removeChild(input);
  };
  
  document.body.appendChild(input);
  input.click();
};

// Funciones auxiliares
window.obtenerConfiguracionActual = function() {
  // Obtener reglas dinámicas
  const reglas = Array.from(document.querySelectorAll('.regla-input'))
    .map(input => input.value.trim())
    .filter(regla => regla !== '');
  
  // Obtener FAQ dinámicas
  const faqs = Array.from(document.querySelectorAll('.faq-item')).map(item => {
    const pregunta = item.querySelector('.faq-pregunta').value.trim();
    const respuesta = item.querySelector('.faq-respuesta').value.trim();
    return { pregunta, respuesta };
  }).filter(faq => faq.pregunta !== '' && faq.respuesta !== '');
  
  return {
    nombre_negocio: document.getElementById("nombre_negocio").value.trim(),
    mensaje_bienvenida: document.getElementById("mensaje_bienvenida").value.trim(),
    tono: document.getElementById("tono").value.trim(),
    formato_respuesta: document.getElementById("formato_respuesta").value.trim(),
    incluye_saludo: document.getElementById("incluye_saludo").checked,
    incluye_despedida: document.getElementById("incluye_despedida").checked,
    firma_contenido: document.getElementById("firma_contenido").value.trim(),
    firma_posicion: document.getElementById("firma_posicion").value,
    contexto_principal: document.getElementById("contexto_principal").value.trim(),
    reglas: reglas,
    faqs: faqs,
    flujos: window.flujos,
    flujoActual: window.flujoActual
  };
};

window.cargarConfiguracion = function(config) {
  // Cargar campos básicos
  document.getElementById("nombre_negocio").value = config.nombre_negocio || '';
  document.getElementById("mensaje_bienvenida").value = config.mensaje_bienvenida || '';
  document.getElementById("tono").value = config.tono || '';
  document.getElementById("formato_respuesta").value = config.formato_respuesta || '';
  document.getElementById("incluye_saludo").checked = config.incluye_saludo !== false;
  document.getElementById("incluye_despedida").checked = config.incluye_despedida !== false;
  document.getElementById("firma_contenido").value = config.firma_contenido || '';
  document.getElementById("firma_posicion").value = config.firma_posicion || 'inicio_salto';
  document.getElementById("contexto_principal").value = config.contexto_principal || '';
  
  // Cargar reglas
  const reglasContainer = document.getElementById('reglas-container');
  reglasContainer.innerHTML = '';
  (config.reglas || []).forEach(regla => {
    const reglaItem = document.createElement('div');
    reglaItem.className = 'regla-item';
    reglaItem.innerHTML = `
      <input type="text" class="regla-input" value="${regla}" oninput="window.actualizarPrompt()">
      <button class="del-regla" onclick="eliminarRegla(this)">×</button>
    `;
    reglasContainer.appendChild(reglaItem);
  });
  
  // Cargar FAQ
  const faqContainer = document.getElementById('faq-container');
  faqContainer.innerHTML = '';
  (config.faqs || []).forEach(faq => {
    const faqItem = document.createElement('div');
    faqItem.className = 'faq-item';
    faqItem.innerHTML = `
      <label>Pregunta:</label>
      <input type="text" class="faq-pregunta" value="${faq.pregunta}" oninput="window.actualizarPrompt()">
      <label>Respuesta:</label>
      <textarea class="faq-respuesta" rows="2" oninput="window.actualizarPrompt()">${faq.respuesta}</textarea>
      <button class="del-faq" onclick="eliminarFAQ(this)">×</button>
    `;
    faqContainer.appendChild(faqItem);
  });
  
  // Cargar flujos
  if (config.flujos) {
    window.flujos = config.flujos;
    window.flujoActual = config.flujoActual || 0;
  }
};

window.limpiarConfiguracion = function() {
  // Limpiar todos los campos
  document.getElementById("nombre_negocio").value = '';
  document.getElementById("mensaje_bienvenida").value = '';
  document.getElementById("tono").value = 'Profesional, cordial y claro';
  document.getElementById("formato_respuesta").value = 'Respuestas breves, máximo 3 renglones, sin tecnicismos innecesarios';
  document.getElementById("incluye_saludo").checked = true;
  document.getElementById("incluye_despedida").checked = true;
  document.getElementById("firma_contenido").value = '*Asistente IA*';
  document.getElementById("firma_posicion").value = 'inicio_salto';
  document.getElementById("contexto_principal").value = 'Actúa como el encargado de tomar pedidos para "[nombre_negocio]", por WhatsApp. \nSigue este flujo de conversación usando mensajes concisos, emojis y negritas con asteriscos *texto*. \nMantente siempre en contexto de pedidos.';
  
  // Limpiar reglas y FAQ
  document.getElementById('reglas-container').innerHTML = '';
  document.getElementById('faq-container').innerHTML = '';
  
  // Reinicializar flujos
  window.flujos = [{
    nombre: "Flujo Principal",
    pasos: [
      { texto: "Saluda al cliente y pregúntale si desea retirar en tienda o envío a domicilio", funciones: [] }, 
      { texto: "Solicita el pedido (productos y cantidades) y, si aplica, la dirección para envío.", funciones: [] }
    ]
  }];
  window.flujoActual = 0;
  
  window.renderFlujos();
  window.actualizarPrompt();
};

// Función de debug (usar desde la consola del navegador)
window.debugProyectos = function() {
  console.log("=== DEBUG PROYECTOS ===");
  console.log("Proyectos:", window.proyectos);
  console.log("Proyecto actual:", window.proyectoActual);
  console.log("Versión actual:", window.versionActual);
  console.log("Configuración modificada:", window.configuracionModificada);
  console.log("localStorage proyectos:", localStorage.getItem('ia_proyectos'));
  console.log("localStorage proyecto actual:", localStorage.getItem('ia_proyecto_actual'));
  
  // Mostrar selector actual
  const selector = document.getElementById("selector-proyectos");
  console.log("Valor del selector:", selector ? selector.value : "Selector no encontrado");
  
  return {
    proyectos: window.proyectos,
    proyectoActual: window.proyectoActual,
    versionActual: window.versionActual,
    selectorValue: selector ? selector.value : null
  };
};

// Función para limpiar todo (usar desde consola si hay problemas)
window.limpiarTodo = function() {
  localStorage.removeItem('ia_proyectos');
  localStorage.removeItem('ia_proyecto_actual');
  window.proyectos = {};
  window.proyectoActual = null;
  window.versionActual = null;
  window.renderProyectos();
  console.log("Todo limpiado. Recarga la página.");
};

// Función adicional para exportar todos los proyectos
window.exportarTodosLosProyectos = function() {
  if (Object.keys(window.proyectos).length === 0) {
    alert("No hay proyectos para exportar");
    return;
  }
  
  const backup = {
    fecha_exportacion: new Date().toISOString(),
    version_app: "1.0",
    proyectos: window.proyectos
  };
  
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = window.URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `backup_proyectos_${new Date().toISOString().slice(0,16).replace(/:/g,'-')}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
  
  alert(`Backup creado con ${Object.keys(window.proyectos).length} proyectos`);
};

// Detectar cambios para marcar como modificado
window.marcarComoModificado = function() {
  window.configuracionModificada = true;
};

// Estructura para manejar múltiples flujos
window.flujos = [
  {
    nombre: "Flujo Principal",
    pasos: [
      { texto: "Saluda al cliente y pregúntale si desea retirar en tienda o envío a domicilio", funciones: [] }, 
      { texto: "Solicita el pedido (productos y cantidades) y, si aplica, la dirección para envío.", funciones: [] }
    ]
  }
];

window.flujoActual = 0; // Índice del flujo actualmente seleccionado

window.renderFlujos = function() {
  const selector = document.getElementById("selector-flujos");
  selector.innerHTML = "";
  
  window.flujos.forEach((flujo, idx) => {
    const option = document.createElement("option");
    option.value = idx;
    option.textContent = flujo.nombre;
    option.selected = idx === window.flujoActual;
    selector.appendChild(option);
  });
  
  // Actualizar el nombre del flujo en el campo de texto
  document.getElementById("nombre-flujo-actual").value = window.flujos[window.flujoActual].nombre;
  
  window.renderPasos();
};

window.cambiarFlujo = function(indice) {
  window.flujoActual = parseInt(indice);
  window.renderFlujos();
};

window.agregarFlujo = function() {
  const nombreFlujo = prompt("Nombre del nuevo flujo:", `Flujo ${window.flujos.length + 1}`);
  if (nombreFlujo && nombreFlujo.trim() !== '') {
    window.flujos.push({
      nombre: nombreFlujo.trim(),
      pasos: [{ texto: "", funciones: [] }]
    });
    window.flujoActual = window.flujos.length - 1;
    window.renderFlujos();
  }
};

window.eliminarFlujo = function() {
  if (window.flujos.length <= 1) {
    alert("Debe haber al menos un flujo");
    return;
  }
  
  if (confirm(`¿Eliminar el flujo "${window.flujos[window.flujoActual].nombre}"?`)) {
    window.flujos.splice(window.flujoActual, 1);
    window.flujoActual = Math.max(0, window.flujoActual - 1);
    window.renderFlujos();
  }
};

window.renombrarFlujo = function(nuevoNombre) {
  if (nuevoNombre && nuevoNombre.trim() !== '') {
    window.flujos[window.flujoActual].nombre = nuevoNombre.trim();
    window.renderFlujos();
  }
};

window.renderPasos = function renderPasos() {
  const cont = document.getElementById("pasos");
  cont.innerHTML = "";
  
  // Verificar si hay funciones disponibles
  const funcionesDisponibles = window.getFunctions ? window.getFunctions() : {};
  
  // Obtener pasos del flujo actual
  const pasosActuales = window.flujos[window.flujoActual].pasos;
  
  pasosActuales.forEach((paso, idx) => {
    let box = document.createElement("div");
    box.className = "paso-box";
    
    // Botones de reorden
    let reorderBtns = `
      ${idx > 0 ? `<button class="move-paso up" onclick="moverPaso(${idx}, -1)" title="Subir">&#8593;</button>` : ""}
      ${idx < pasosActuales.length - 1 ? `<button class="move-paso down" onclick="moverPaso(${idx}, 1)" title="Bajar">&#8595;</button>` : ""}
      <button class="del-paso" onclick="eliminarPaso(${idx})" title="Eliminar este paso">×</button>
    `;
    
    let inner = `<span class="num-paso">Paso ${idx+1}</span>${reorderBtns}
    <label>Mensaje a mostrar/enviar:</label>
    <textarea rows="2" oninput="editarTextoPaso(${idx},this.value)" placeholder="Ej. Confirma la dirección y muestra resumen del pedido">${paso.texto||""}</textarea>
    <div style="margin-bottom:7px;margin-top:9px;font-weight:520">Funciones adicionales opcionales para este paso:</div>`;

    // Funciones agregadas en el paso
    (paso.funciones||[]).forEach((fnObj, fnIdx) => {
      const fn = funcionesDisponibles[fnObj.funcion];
      if (!fn) {
        inner += `<div class="funcion-box error-box">
          <b>⚠️ Función no encontrada: ${fnObj.funcion}</b>
          <button class="del-funcion" onclick="eliminarFuncionPaso(${idx}, ${fnIdx})" title="Eliminar función">&times;</button>
        </div>`;
        return;
      }
      
      inner += `<div class="funcion-box">
        <b>${fn.label}</b>
        <button class="del-funcion" onclick="eliminarFuncionPaso(${idx}, ${fnIdx})" title="Eliminar función">&times;</button>
        <div style="margin-top:7px;">
        <select class="selector-funcion" data-pidx="${idx}" data-fidx="${fnIdx}">
          ${Object.keys(funcionesDisponibles).map(fnKey =>
            `<option value="${fnKey}" ${fnObj.funcion===fnKey?'selected':''}>${funcionesDisponibles[fnKey].label}</option>`
          ).join('')}
        </select>`;
        
      // Renderizar parámetros
      fn.params.forEach(param => {
        const valorActual = (fnObj.params && fnObj.params[param.nombre]) || "";
        const placeholder = param.descripcion || `Ej. ${param.label.toLowerCase()}`;
        const required = param.requerido ? ' *' : '';
        
        if (param.tipo === 'select' && param.opciones) {
          inner += `<label style="font-weight:normal">${param.label}${required}:</label>
            <select onchange="editarParametroFuncionPaso(${idx},${fnIdx},'${param.nombre}',this.value)" style="margin-bottom:8px;">
              <option value="">Seleccionar...</option>
              ${param.opciones.map(opcion => 
                `<option value="${opcion}" ${valorActual === opcion ? 'selected' : ''}>${opcion}</option>`
              ).join('')}
            </select>`;
        } else {
          inner += `<label style="font-weight:normal">${param.label}${required}:</label>
            <textarea rows="2" style="margin-bottom:8px;resize:vertical"
            oninput="editarParametroFuncionPaso(${idx},${fnIdx},'${param.nombre}',this.value)"
            placeholder="${placeholder}">${valorActual}</textarea>`;
        }
      });
      
      // Si la función soporta campos dinámicos, mostrar la interfaz para agregarlos
      if (fn.camposDinamicos) {
        inner += `<div class="campos-dinamicos">
          <div style="margin: 15px 0 10px 0; font-weight: 600; color: #5a40c6;">Campos personalizados:</div>`;
        
        // Mostrar campos dinámicos existentes
        const camposDinamicos = fnObj.camposDinamicos || [];
        camposDinamicos.forEach((campo, campoIdx) => {
          inner += `<div class="campo-dinamico">
            <div style="display: flex; gap: 8px; align-items: flex-start; margin-bottom: 8px;">
              <div style="flex: 1;">
                <input type="text" placeholder="Nombre del campo" value="${campo.nombre || ''}" 
                       oninput="editarCampoDinamico(${idx}, ${fnIdx}, ${campoIdx}, 'nombre', this.value)"
                       style="margin-bottom: 4px; font-size: 13px; padding: 6px;">
                <textarea placeholder="Valor del campo" rows="1" 
                          oninput="editarCampoDinamico(${idx}, ${fnIdx}, ${campoIdx}, 'valor', this.value)"
                          style="margin-bottom: 0; font-size: 13px; padding: 6px; resize: vertical;">${campo.valor || ''}</textarea>
              </div>
              <button onclick="eliminarCampoDinamico(${idx}, ${fnIdx}, ${campoIdx})" 
                      style="background: #ff4757; color: white; border: none; border-radius: 4px; padding: 4px 8px; cursor: pointer; font-size: 12px; height: fit-content; margin-top: 2px;">×</button>
            </div>
          </div>`;
        });
        
        inner += `<button onclick="agregarCampoDinamico(${idx}, ${fnIdx})" 
                         style="background: #7b4de4; color: white; border: none; border-radius: 4px; padding: 6px 12px; cursor: pointer; font-size: 13px; margin-top: 8px;">+ Agregar Campo</button>
        </div>`;
      }
      
      inner += `</div></div>`;
    });
    
    // Botón para agregar nueva función solo si hay funciones disponibles
    if (Object.keys(funcionesDisponibles).length > 0) {
      inner += `<button class="boton-peq" onclick="agregarFuncionPaso(${idx})">➕ Agregar Función</button>`;
    } else {
      inner += `<div class="no-functions-warning">⚠️ No hay funciones disponibles. Verifique que los archivos de funciones estén cargados.</div>`;
    }
    
    box.innerHTML = inner;
    cont.appendChild(box);
  });
  
  if (typeof window.actualizarPrompt === 'function') {
    window.actualizarPrompt();
  }
}

// Event handlers actualizados para trabajar con flujos
window.moverPaso = function(idx, dir){
  const pasosActuales = window.flujos[window.flujoActual].pasos;
  if((idx + dir) < 0 || (idx + dir) >= pasosActuales.length) return;
  [pasosActuales[idx], pasosActuales[idx+dir]] = [pasosActuales[idx+dir], pasosActuales[idx]];
  window.renderPasos();
}

window.eliminarPaso = function(idx){ 
  if(confirm("¿Eliminar este paso del flujo?")) { 
    window.flujos[window.flujoActual].pasos.splice(idx,1); 
    window.renderPasos(); 
  } 
}

window.editarTextoPaso = function(idx, value){ 
  window.flujos[window.flujoActual].pasos[idx].texto = value; 
  if (typeof window.actualizarPrompt === 'function') {
    window.actualizarPrompt(); 
  }
  window.marcarComoModificado();
}

window.agregarPaso = function(){ 
  window.flujos[window.flujoActual].pasos.push({ texto: "", funciones: [] }); 
  window.renderPasos(); 
  window.marcarComoModificado();
}

// Funciones para manejo de funciones (actualizadas)
window.agregarFuncionPaso = function(idx){ 
  const pasosActuales = window.flujos[window.flujoActual].pasos;
  pasosActuales[idx].funciones = pasosActuales[idx].funciones || []; 
  
  // Obtener la primera función disponible
  const funcionesDisponibles = window.getFunctions ? window.getFunctions() : {};
  const primeraFuncion = Object.keys(funcionesDisponibles)[0];
  
  if (primeraFuncion) {
    pasosActuales[idx].funciones.push({
      funcion: primeraFuncion, 
      params: {}
    }); 
    window.renderPasos(); 
  }
}

window.editarParametroFuncionPaso = function(idx, fnIdx, nombre, value){ 
  const funcionActual = window.flujos[window.flujoActual].pasos[idx].funciones[fnIdx];
  if (!funcionActual.params) {
    funcionActual.params = {};
  }
  funcionActual.params[nombre] = value; 
  if (typeof window.actualizarPrompt === 'function') {
    window.actualizarPrompt(); 
  }
}

window.eliminarFuncionPaso = function(idx, fnIdx){ 
  if (confirm("¿Eliminar esta función del paso?")) {
    window.flujos[window.flujoActual].pasos[idx].funciones.splice(fnIdx,1); 
    window.renderPasos(); 
  }
}

window.cambiarTipoFuncionPaso = function(idx, fnIdx, value){
  const funcionesDisponibles = window.getFunctions ? window.getFunctions() : {};
  const nuevaFuncion = funcionesDisponibles[value];
  
  if (nuevaFuncion) {
    window.flujos[window.flujoActual].pasos[idx].funciones[fnIdx] = {funcion: value, params: {}};
    
    // Inicializar parámetros con valores por defecto
    nuevaFuncion.params.forEach(param => { 
      window.flujos[window.flujoActual].pasos[idx].funciones[fnIdx].params[param.nombre] = ""; 
    });
    
    // Si la función soporta campos dinámicos, inicializar el array
    if (nuevaFuncion.camposDinamicos) {
      window.flujos[window.flujoActual].pasos[idx].funciones[fnIdx].camposDinamicos = [];
    }
    
    window.renderPasos();
  }
}

// Event listener para cambios en selectores de función
document.addEventListener("change", function(e){
  if(e.target && e.target.classList.contains("selector-funcion")){
    const pidx = parseInt(e.target.dataset.pidx);
    const fidx = parseInt(e.target.dataset.fidx);
    const val = e.target.value;
    window.cambiarTipoFuncionPaso(pidx, fidx, val);
  }
});

// Renderizar pasos cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
  console.log("Iniciando aplicación...");
  console.log("Proyectos en localStorage:", window.proyectos);
  console.log("Proyecto actual en localStorage:", window.proyectoActual);
  
  // Cargar proyectos y configuración guardada
  window.renderProyectos();
  
  // Si hay un proyecto actual, cargar la configuración
  if (window.proyectoActual && window.proyectos[window.proyectoActual]) {
    console.log("Cargando proyecto existente:", window.proyectoActual);
    const versiones = window.proyectos[window.proyectoActual].versiones || {};
    const ultimaVersion = Object.keys(versiones).sort((a, b) => new Date(b) - new Date(a))[0];
    
    if (ultimaVersion) {
      console.log("Cargando última versión:", ultimaVersion);
      window.cargarVersion(ultimaVersion);
    }
  } else {
    console.log("No hay proyecto actual, esperando creación de nuevo proyecto");
  }
  
  // Esperar un poco para que se carguen las funciones
  setTimeout(function() {
    window.renderFlujos();
  }, 100);
});

// Escuchar cuando se registren nuevas funciones
window.addEventListener('functionRegistered', function(event) {
  console.log('Nueva función registrada:', event.detail.nombre);
  window.renderPasos();
});

// Funciones para manejar reglas de comportamiento
window.agregarRegla = function() {
  const container = document.getElementById('reglas-container');
  const reglaItem = document.createElement('div');
  reglaItem.className = 'regla-item';
  reglaItem.innerHTML = `
    <input type="text" class="regla-input" placeholder="Escribe una nueva regla..." oninput="window.actualizarPrompt()">
    <button class="del-regla" onclick="eliminarRegla(this)">×</button>
  `;
  container.appendChild(reglaItem);
  window.actualizarPrompt();
};

window.eliminarRegla = function(button) {
  if (confirm("¿Eliminar esta regla?")) {
    button.parentElement.remove();
    window.actualizarPrompt();
  }
};

// Funciones para manejar preguntas frecuentes (FAQ)
window.agregarFAQ = function() {
  const container = document.getElementById('faq-container');
  const faqItem = document.createElement('div');
  faqItem.className = 'faq-item';
  faqItem.innerHTML = `
    <label>Pregunta:</label>
    <input type="text" class="faq-pregunta" placeholder="Escribe una pregunta frecuente..." oninput="window.actualizarPrompt()">
    <label>Respuesta:</label>
    <textarea class="faq-respuesta" rows="2" placeholder="Escribe la respuesta..." oninput="window.actualizarPrompt()"></textarea>
    <button class="del-faq" onclick="eliminarFAQ(this)">×</button>
  `;
  container.appendChild(faqItem);
  window.actualizarPrompt();
};

window.eliminarFAQ = function(button) {
  if (confirm("¿Eliminar esta pregunta frecuente?")) {
    button.parentElement.remove();
    window.actualizarPrompt();
  }
};

// Actualizar prompt cuando cambien las configuraciones
document.addEventListener('DOMContentLoaded', function() {
  // Agregar listeners a todos los campos de configuración
  const configFields = [
    'tono', 'formato_respuesta', 'incluye_saludo', 'incluye_despedida',
    'firma_contenido', 'firma_posicion', 'contexto_principal', 'nombre_negocio', 'mensaje_bienvenida'
  ];
  
  configFields.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.addEventListener('input', function() {
        window.actualizarPrompt();
        window.marcarComoModificado();
      });
      field.addEventListener('change', function() {
        window.actualizarPrompt();
        window.marcarComoModificado();
      });
    }
  });
  
  // Listener para las reglas y FAQ (delegated event)
  document.addEventListener('input', function(e) {
    if (e.target && (e.target.classList.contains('regla-input') || 
                     e.target.classList.contains('faq-pregunta') || 
                     e.target.classList.contains('faq-respuesta'))) {
      window.actualizarPrompt();
      window.marcarComoModificado();
    }
  });
});

// Funciones para manejar campos dinámicos
window.agregarCampoDinamico = function(idxPaso, idxFuncion) {
  const funcionActual = window.flujos[window.flujoActual].pasos[idxPaso].funciones[idxFuncion];
  if (!funcionActual.camposDinamicos) {
    funcionActual.camposDinamicos = [];
  }
  
  funcionActual.camposDinamicos.push({
    nombre: '',
    valor: ''
  });
  
  window.renderPasos();
};

window.editarCampoDinamico = function(idxPaso, idxFuncion, idxCampo, propiedad, valor) {
  const funcionActual = window.flujos[window.flujoActual].pasos[idxPaso].funciones[idxFuncion];
  if (!funcionActual.camposDinamicos) {
    funcionActual.camposDinamicos = [];
  }
  
  funcionActual.camposDinamicos[idxCampo][propiedad] = valor;
  
  if (typeof window.actualizarPrompt === 'function') {
    window.actualizarPrompt();
  }
};

window.eliminarCampoDinamico = function(idxPaso, idxFuncion, idxCampo) {
  if (confirm("¿Eliminar este campo?")) {
    window.flujos[window.flujoActual].pasos[idxPaso].funciones[idxFuncion].camposDinamicos.splice(idxCampo, 1);
    window.renderPasos();
  }
};