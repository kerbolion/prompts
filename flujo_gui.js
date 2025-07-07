/**
 * FLUJO GUI - VERSIÓN PROFESIONAL
 * Sistema completo de gestión de flujos conversacionales para IA
 * Arquitectura limpia sin parches ni remiendos
 */

// ============================
// GESTIÓN DE ESTADO GLOBAL
// ============================
class FlujosApp {
  constructor() {
    this.proyectos = JSON.parse(localStorage.getItem('ia_proyectos') || '{}');
    this.proyectoActual = localStorage.getItem('ia_proyecto_actual') || null;
    this.versionActual = null;
    this.configuracionModificada = false;
    this.pestanaActual = 0;
    this.flujos = this.getDefaultFlujos();
    this.flujoActual = 0;
    this.scrollPositions = new Map();
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadInitialData();
    this.setupAutosize();
    this.setupScrollPreservation();
  }

  getDefaultFlujos() {
    return [{
      nombre: "Flujo Principal",
      pasos: [
        { texto: "Saluda al cliente y pregúntale si desea retirar en tienda o envío a domicilio", funciones: [] }, 
        { texto: "Solicita el pedido (productos y cantidades) y, si aplica, la dirección para envío.", funciones: [] }
      ]
    }];
  }

  // ============================
  // SISTEMA DE PESTAÑAS
  // ============================
  cambiarPestana(indice) {
    this.preserveCurrentScroll();
    
    const tabs = document.querySelectorAll('.tab-content');
    const buttons = document.querySelectorAll('.tab-btn');
    
    tabs.forEach(tab => tab.classList.remove('active'));
    buttons.forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(`tab-${indice}`).classList.add('active');
    buttons[indice].classList.add('active');
    
    this.pestanaActual = indice;
    
    // Restaurar scroll para esta pestaña y ajustar autosize
    requestAnimationFrame(() => {
      this.restoreScrollForTab(indice);
      this.adjustAllTextareas();
    });
  }

  // ============================
  // GESTIÓN DE SCROLL PROFESIONAL
  // ============================
  preserveCurrentScroll() {
    const activeTab = document.querySelector('.tab-content.active');
    const scrollContainer = document.querySelector('.formulario');
    
    if (scrollContainer && activeTab) {
      const tabId = activeTab.id;
      this.scrollPositions.set(tabId, scrollContainer.scrollTop);
    }
  }

  restoreScrollForTab(tabIndex) {
    const tabId = `tab-${tabIndex}`;
    const scrollContainer = document.querySelector('.formulario');
    const savedPosition = this.scrollPositions.get(tabId);
    
    if (scrollContainer && savedPosition !== undefined) {
      scrollContainer.scrollTop = savedPosition;
    }
  }

  executeWithScrollPreservation(callback, forceContainer = null) {
    const container = forceContainer || document.querySelector('.formulario') || document.documentElement;
    const currentPosition = container.scrollTop;
    
    try {
      callback();
    } finally {
      requestAnimationFrame(() => {
        container.scrollTop = currentPosition;
        this.adjustAllTextareas();
      });
    }
  }

  setupScrollPreservation() {
    // Interceptar todas las funciones que modifican el DOM
    const originalRenderPasos = this.renderPasos.bind(this);
    this.renderPasos = (...args) => {
      this.executeWithScrollPreservation(() => originalRenderPasos(...args));
    };
  }

  // ============================
  // SISTEMA DE AUTOSIZE PROFESIONAL
  // ============================
  setupAutosize() {
    this.autosizeConfig = {
      maxHeight: 300,
      minHeight: 50,
      lineHeight: 20
    };

    // Configurar autosize global
    document.addEventListener('input', this.handleTextareaInput.bind(this));
    document.addEventListener('DOMContentLoaded', () => {
      this.initializeAllTextareas();
    });
  }

  handleTextareaInput(event) {
    if (event.target.tagName === 'TEXTAREA') {
      this.adjustTextareaHeight(event.target);
    }
  }

  adjustTextareaHeight(textarea) {
    const { maxHeight, minHeight } = this.autosizeConfig;
    
    textarea.style.height = 'auto';
    const newHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight);
    textarea.style.height = newHeight + 'px';
    
    // Añadir scroll si excede el máximo
    textarea.style.overflowY = textarea.scrollHeight > maxHeight ? 'scroll' : 'hidden';
  }

  initializeAllTextareas() {
    document.querySelectorAll('textarea').forEach(textarea => {
      this.adjustTextareaHeight(textarea);
      textarea.dataset.autosizeConfigured = 'true';
    });
  }

  adjustAllTextareas() {
    const activeTab = document.querySelector('.tab-content.active');
    if (!activeTab) return;

    const textareas = activeTab.querySelectorAll('textarea');
    textareas.forEach(textarea => this.adjustTextareaHeight(textarea));
  }

  // ============================
  // GESTIÓN DE FLUJOS
  // ============================
  renderFlujos() {
    const selector = document.getElementById("selector-flujos");
    if (!selector) return;

    selector.innerHTML = "";
    
    this.flujos.forEach((flujo, idx) => {
      const option = document.createElement("option");
      option.value = idx;
      option.textContent = flujo.nombre;
      option.selected = idx === this.flujoActual;
      selector.appendChild(option);
    });
    
    const nombreInput = document.getElementById("nombre-flujo-actual");
    if (nombreInput) {
      nombreInput.value = this.flujos[this.flujoActual].nombre;
    }
    
    this.renderPasos();
  }

  cambiarFlujo(indice) {
    this.flujoActual = parseInt(indice);
    this.renderFlujos();
  }

  agregarFlujo() {
    const nombreFlujo = prompt("Nombre del nuevo flujo:", `Flujo ${this.flujos.length + 1}`);
    if (nombreFlujo && nombreFlujo.trim() !== '') {
      this.flujos.push({
        nombre: nombreFlujo.trim(),
        pasos: [{ texto: "", funciones: [] }]
      });
      this.flujoActual = this.flujos.length - 1;
      this.renderFlujos();
      this.marcarComoModificado();
    }
  }

  eliminarFlujo() {
    if (this.flujos.length <= 1) {
      alert("Debe haber al menos un flujo");
      return;
    }
    
    if (confirm(`¿Eliminar el flujo "${this.flujos[this.flujoActual].nombre}"?`)) {
      this.flujos.splice(this.flujoActual, 1);
      this.flujoActual = Math.max(0, this.flujoActual - 1);
      this.renderFlujos();
      this.marcarComoModificado();
    }
  }

  renombrarFlujo(nuevoNombre) {
    if (nuevoNombre && nuevoNombre.trim() !== '') {
      this.flujos[this.flujoActual].nombre = nuevoNombre.trim();
      this.renderFlujos();
      this.marcarComoModificado();
    }
  }

  // ============================
  // GESTIÓN DE PASOS
  // ============================
  renderPasos() {
    const container = document.getElementById("pasos");
    if (!container) return;

    container.innerHTML = "";
    
    const funcionesDisponibles = this.getFunctionsSafely();
    const pasosActuales = this.flujos[this.flujoActual].pasos;
    
    pasosActuales.forEach((paso, idx) => {
      const pasoElement = this.createPasoElement(paso, idx, funcionesDisponibles);
      container.appendChild(pasoElement);
    });
    
    // Configurar autosize para nuevos elementos
    setTimeout(() => {
      this.initializeAllTextareas();
      this.updatePrompt();
    }, 10);
  }

  createPasoElement(paso, idx, funcionesDisponibles) {
    const box = document.createElement("div");
    box.className = "paso-box";
    
    const reorderButtons = this.createReorderButtons(idx);
    const funcionesHTML = this.createFuncionesHTML(paso, idx, funcionesDisponibles);
    const addFunctionButton = Object.keys(funcionesDisponibles).length > 0 
      ? this.createSafeButton('➕ Agregar Función', `app.agregarFuncionPaso(${idx})`)
      : '<div class="no-functions-warning">⚠️ No hay funciones disponibles</div>';

    box.innerHTML = `
      <span class="num-paso">Paso ${idx + 1}</span>
      ${reorderButtons}
      <label>Mensaje a mostrar/enviar:</label>
      <textarea rows="2" 
                oninput="app.editarTextoPaso(${idx}, this.value)" 
                placeholder="Ej. Confirma la dirección y muestra resumen del pedido">${paso.texto || ""}</textarea>
      <div style="margin-bottom:7px;margin-top:9px;font-weight:520">Funciones adicionales opcionales para este paso:</div>
      ${funcionesHTML}
      ${addFunctionButton}
    `;
    
    return box;
  }

  createReorderButtons(idx) {
    const pasosLength = this.flujos[this.flujoActual].pasos.length;
    let buttons = '';
    
    if (idx > 0) {
      buttons += this.createMoveButton('↑', `app.moverPaso(${idx}, -1)`, 'up');
    }
    if (idx < pasosLength - 1) {
      buttons += this.createMoveButton('↓', `app.moverPaso(${idx}, 1)`, 'down');
    }
    
    buttons += `<button type="button" class="del-paso" onclick="app.eliminarPaso(${idx})" title="Eliminar este paso">×</button>`;
    
    return buttons;
  }

  createMoveButton(symbol, onclick, direction) {
    return `<button type="button" class="move-paso ${direction}" onclick="${onclick}" title="${direction === 'up' ? 'Subir' : 'Bajar'}">${symbol}</button>`;
  }

  createSafeButton(text, onclick, className = 'boton-peq') {
    return `<button type="button" class="${className}" onclick="event.preventDefault(); ${onclick}; return false;">${text}</button>`;
  }

  createFuncionesHTML(paso, pasoIdx, funcionesDisponibles) {
    if (!paso.funciones || paso.funciones.length === 0) return '';
    
    return paso.funciones.map((fnObj, fnIdx) => {
      const fn = funcionesDisponibles[fnObj.funcion];
      
      if (!fn) {
        return this.createErrorFunctionHTML(fnObj.funcion, pasoIdx, fnIdx);
      }
      
      return this.createValidFunctionHTML(fn, fnObj, pasoIdx, fnIdx, funcionesDisponibles);
    }).join('');
  }

  createErrorFunctionHTML(funcionName, pasoIdx, fnIdx) {
    return `
      <div class="funcion-box error-box">
        <b>⚠️ Función no encontrada: ${funcionName}</b>
        <button type="button" class="del-funcion" onclick="app.eliminarFuncionPaso(${pasoIdx}, ${fnIdx})" title="Eliminar función">&times;</button>
      </div>
    `;
  }

  createValidFunctionHTML(fn, fnObj, pasoIdx, fnIdx, funcionesDisponibles) {
    const selectorHTML = this.createFunctionSelector(fnObj, pasoIdx, fnIdx, funcionesDisponibles);
    const paramsHTML = this.createParametersHTML(fn, fnObj, pasoIdx, fnIdx);
    const camposDinamicosHTML = fn.camposDinamicos ? this.createCamposDinamicosHTML(fn, fnObj, pasoIdx, fnIdx) : '';
    
    return `
      <div class="funcion-box">
        <b>${fn.label}</b>
        <button type="button" class="del-funcion" onclick="app.eliminarFuncionPaso(${pasoIdx}, ${fnIdx})" title="Eliminar función">&times;</button>
        <div style="margin-top:7px;">
          ${selectorHTML}
          ${paramsHTML}
          ${camposDinamicosHTML}
        </div>
      </div>
    `;
  }

  createFunctionSelector(fnObj, pasoIdx, fnIdx, funcionesDisponibles) {
    const options = Object.keys(funcionesDisponibles).map(fnKey => 
      `<option value="${fnKey}" ${fnObj.funcion === fnKey ? 'selected' : ''}>${funcionesDisponibles[fnKey].label}</option>`
    ).join('');
    
    return `<select class="selector-funcion" onchange="app.cambiarTipoFuncionPaso(${pasoIdx}, ${fnIdx}, this.value)">${options}</select>`;
  }

  createParametersHTML(fn, fnObj, pasoIdx, fnIdx) {
    return fn.params.map(param => {
      const valorActual = (fnObj.params && fnObj.params[param.nombre]) || "";
      const placeholder = param.descripcion || `Ej. ${param.label.toLowerCase()}`;
      const required = param.requerido ? ' *' : '';
      
      if (param.tipo === 'select' && param.opciones) {
        const options = param.opciones.map(opcion => 
          `<option value="${opcion}" ${valorActual === opcion ? 'selected' : ''}>${opcion}</option>`
        ).join('');
        
        return `
          <label style="font-weight:normal">${param.label}${required}:</label>
          <select onchange="app.editarParametroFuncionPaso(${pasoIdx}, ${fnIdx}, '${param.nombre}', this.value)" style="margin-bottom:8px;">
            <option value="">Seleccionar...</option>
            ${options}
          </select>
        `;
      } else {
        return `
          <label style="font-weight:normal">${param.label}${required}:</label>
          <textarea rows="2" style="margin-bottom:8px;resize:vertical"
                    oninput="app.editarParametroFuncionPaso(${pasoIdx}, ${fnIdx}, '${param.nombre}', this.value)"
                    placeholder="${placeholder}">${valorActual}</textarea>
        `;
      }
    }).join('');
  }

  createCamposDinamicosHTML(fn, fnObj, pasoIdx, fnIdx) {
    const camposDinamicos = fnObj.camposDinamicos || [];
    
    const camposHTML = camposDinamicos.map((campo, campoIdx) => `
      <div class="campo-dinamico">
        <div style="display: flex; gap: 8px; align-items: flex-start; margin-bottom: 8px;">
          <div style="flex: 1;">
            <input type="text" placeholder="Nombre del campo" value="${campo.nombre || ''}" 
                   oninput="app.editarCampoDinamico(${pasoIdx}, ${fnIdx}, ${campoIdx}, 'nombre', this.value)"
                   style="margin-bottom: 4px; font-size: 13px; padding: 6px;">
            <textarea placeholder="Valor del campo" rows="1" 
                      oninput="app.editarCampoDinamico(${pasoIdx}, ${fnIdx}, ${campoIdx}, 'valor', this.value)"
                      style="margin-bottom: 0; font-size: 13px; padding: 6px; resize: vertical;">${campo.valor || ''}</textarea>
          </div>
          <button type="button" onclick="app.eliminarCampoDinamico(${pasoIdx}, ${fnIdx}, ${campoIdx})" 
                  style="background: #ff4757; color: white; border: none; border-radius: 4px; padding: 4px 8px; cursor: pointer; font-size: 12px; height: fit-content; margin-top: 2px;">×</button>
        </div>
      </div>
    `).join('');
    
    return `
      <div class="campos-dinamicos">
        <div style="margin: 15px 0 10px 0; font-weight: 600; color: #5a40c6;">Campos personalizados:</div>
        ${camposHTML}
        <button type="button" onclick="app.agregarCampoDinamico(${pasoIdx}, ${fnIdx})" 
               style="background: #7b4de4; color: white; border: none; border-radius: 4px; padding: 6px 12px; cursor: pointer; font-size: 13px; margin-top: 8px;">+ Agregar Campo</button>
      </div>
    `;
  }

  // ============================
  // OPERACIONES DE PASOS
  // ============================
  moverPaso(idx, direction) {
    const pasos = this.flujos[this.flujoActual].pasos;
    const newIdx = idx + direction;
    
    if (newIdx < 0 || newIdx >= pasos.length) return;
    
    [pasos[idx], pasos[newIdx]] = [pasos[newIdx], pasos[idx]];
    this.renderPasos();
    this.marcarComoModificado();
  }

  eliminarPaso(idx) {
    if (confirm("¿Eliminar este paso del flujo?")) {
      this.flujos[this.flujoActual].pasos.splice(idx, 1);
      this.renderPasos();
      this.marcarComoModificado();
    }
  }

  editarTextoPaso(idx, value) {
    this.flujos[this.flujoActual].pasos[idx].texto = value;
    this.updatePrompt();
    this.marcarComoModificado();
  }

  agregarPaso() {
    this.flujos[this.flujoActual].pasos.push({ texto: "", funciones: [] });
    this.renderPasos();
    this.marcarComoModificado();
  }

  // ============================
  // OPERACIONES DE FUNCIONES
  // ============================
  agregarFuncionPaso(idx) {
    const funcionesDisponibles = this.getFunctionsSafely();
    const primeraFuncion = Object.keys(funcionesDisponibles)[0];
    
    if (!primeraFuncion) {
      alert("No hay funciones disponibles");
      return;
    }
    
    const pasos = this.flujos[this.flujoActual].pasos;
    pasos[idx].funciones = pasos[idx].funciones || [];
    pasos[idx].funciones.push({
      funcion: primeraFuncion,
      params: {}
    });
    
    this.renderPasos();
    this.marcarComoModificado();
  }

  eliminarFuncionPaso(pasoIdx, fnIdx) {
    if (confirm("¿Eliminar esta función del paso?")) {
      this.flujos[this.flujoActual].pasos[pasoIdx].funciones.splice(fnIdx, 1);
      this.renderPasos();
      this.marcarComoModificado();
    }
  }

  cambiarTipoFuncionPaso(pasoIdx, fnIdx, nuevaFuncion) {
    const funcionesDisponibles = this.getFunctionsSafely();
    const fn = funcionesDisponibles[nuevaFuncion];
    
    if (!fn) return;
    
    const nuevaFuncionObj = { funcion: nuevaFuncion, params: {} };
    
    // Inicializar parámetros
    fn.params.forEach(param => {
      nuevaFuncionObj.params[param.nombre] = "";
    });
    
    // Inicializar campos dinámicos si es necesario
    if (fn.camposDinamicos) {
      nuevaFuncionObj.camposDinamicos = [];
    }
    
    this.flujos[this.flujoActual].pasos[pasoIdx].funciones[fnIdx] = nuevaFuncionObj;
    this.renderPasos();
    this.marcarComoModificado();
  }

  editarParametroFuncionPaso(pasoIdx, fnIdx, nombreParam, valor) {
    const funcionActual = this.flujos[this.flujoActual].pasos[pasoIdx].funciones[fnIdx];
    if (!funcionActual.params) {
      funcionActual.params = {};
    }
    funcionActual.params[nombreParam] = valor;
    this.updatePrompt();
    this.marcarComoModificado();
  }

  // ============================
  // CAMPOS DINÁMICOS
  // ============================
  agregarCampoDinamico(pasoIdx, fnIdx) {
    const funcionActual = this.flujos[this.flujoActual].pasos[pasoIdx].funciones[fnIdx];
    if (!funcionActual.camposDinamicos) {
      funcionActual.camposDinamicos = [];
    }
    
    funcionActual.camposDinamicos.push({ nombre: '', valor: '' });
    this.renderPasos();
    this.marcarComoModificado();
  }

  editarCampoDinamico(pasoIdx, fnIdx, campoIdx, propiedad, valor) {
    const funcionActual = this.flujos[this.flujoActual].pasos[pasoIdx].funciones[fnIdx];
    if (!funcionActual.camposDinamicos) {
      funcionActual.camposDinamicos = [];
    }
    
    funcionActual.camposDinamicos[campoIdx][propiedad] = valor;
    this.updatePrompt();
    this.marcarComoModificado();
  }

  eliminarCampoDinamico(pasoIdx, fnIdx, campoIdx) {
    if (confirm("¿Eliminar este campo?")) {
      this.flujos[this.flujoActual].pasos[pasoIdx].funciones[fnIdx].camposDinamicos.splice(campoIdx, 1);
      this.renderPasos();
      this.marcarComoModificado();
    }
  }

  // ============================
  // GESTIÓN DE PROYECTOS
  // ============================
  renderProyectos() {
    const selector = document.getElementById("selector-proyectos");
    if (!selector) return;

    selector.innerHTML = '<option value="">Seleccionar proyecto...</option>';
    
    Object.keys(this.proyectos).forEach(nombreProyecto => {
      const option = document.createElement("option");
      option.value = nombreProyecto;
      option.textContent = nombreProyecto;
      option.selected = nombreProyecto === this.proyectoActual;
      selector.appendChild(option);
    });
    
    const nombreInput = document.getElementById("nombre-proyecto");
    if (nombreInput) {
      if (this.proyectoActual && this.proyectos[this.proyectoActual]) {
        nombreInput.value = this.proyectoActual;
        this.renderVersiones();
      } else {
        nombreInput.value = "";
        this.proyectoActual = null;
        this.versionActual = null;
        this.renderVersiones();
      }
    }
  }

  renderVersiones() {
    const selector = document.getElementById("selector-versiones");
    if (!selector) return;

    selector.innerHTML = "";
    
    if (!this.proyectoActual || !this.proyectos[this.proyectoActual]) {
      selector.innerHTML = '<option value="">Sin versiones guardadas</option>';
      return;
    }
    
    const versiones = this.proyectos[this.proyectoActual].versiones || {};
    const versionesOrdenadas = Object.keys(versiones).sort((a, b) => new Date(b) - new Date(a));
    
    if (versionesOrdenadas.length === 0) {
      selector.innerHTML = '<option value="">Sin versiones guardadas</option>';
      return;
    }
    
    versionesOrdenadas.forEach(timestamp => {
      const option = document.createElement("option");
      option.value = timestamp;
      const fecha = new Date(timestamp);
      option.textContent = `${this.proyectoActual} ${fecha.toLocaleDateString()} ${fecha.toLocaleTimeString()}`;
      option.selected = timestamp === this.versionActual;
      selector.appendChild(option);
    });
  }

  cambiarProyecto(nombreProyecto) {
    if (!nombreProyecto || nombreProyecto === "") return;
    
    if (this.proyectos[nombreProyecto]) {
      this.proyectoActual = nombreProyecto;
      localStorage.setItem('ia_proyecto_actual', nombreProyecto);
      this.versionActual = null;
      this.renderProyectos();
      
      const versiones = this.proyectos[nombreProyecto].versiones || {};
      const ultimaVersion = Object.keys(versiones).sort((a, b) => new Date(b) - new Date(a))[0];
      
      if (ultimaVersion) {
        this.cargarVersion(ultimaVersion);
      } else {
        this.limpiarConfiguracion();
        this.updatePrompt();
      }
    }
  }

  crearProyectoDesdeInput() {
    const nombreInput = document.getElementById("nombre-proyecto");
    const nombre = nombreInput.value.trim();
    
    if (!nombre) {
      alert("Por favor, escribe el nombre del proyecto");
      nombreInput.focus();
      return;
    }
    
    if (this.proyectos[nombre]) {
      alert("Ya existe un proyecto con ese nombre");
      return;
    }
    
    this.crearProyecto(nombre);
    alert(`Proyecto "${nombre}" creado exitosamente`);
  }

  crearProyecto(nombre) {
    if (this.proyectos[nombre]) {
      alert("Ya existe un proyecto con ese nombre");
      this.renderProyectos();
      return;
    }
    
    this.proyectos[nombre] = {
      nombre: nombre,
      creado: new Date().toISOString(),
      versiones: {}
    };
    
    this.proyectoActual = nombre;
    this.versionActual = null;
    this.configuracionModificada = false;
    
    localStorage.setItem('ia_proyectos', JSON.stringify(this.proyectos));
    localStorage.setItem('ia_proyecto_actual', nombre);
    
    this.limpiarConfiguracion();
    this.renderProyectos();
  }

  guardarVersion() {
    if (!this.proyectoActual) {
      alert("Primero crea o selecciona un proyecto");
      return;
    }
    
    const timestamp = new Date().toISOString();
    const configuracion = this.obtenerConfiguracionActual();
    
    if (!this.proyectos[this.proyectoActual].versiones) {
      this.proyectos[this.proyectoActual].versiones = {};
    }
    
    this.proyectos[this.proyectoActual].versiones[timestamp] = configuracion;
    this.versionActual = timestamp;
    this.configuracionModificada = false;
    
    localStorage.setItem('ia_proyectos', JSON.stringify(this.proyectos));
    this.renderVersiones();
    
    const fecha = new Date(timestamp);
    alert(`Versión guardada: ${fecha.toLocaleDateString()} ${fecha.toLocaleTimeString()}`);
  }

  cargarVersion(timestamp) {
    if (!timestamp || !this.proyectoActual) return;
    
    const version = this.proyectos[this.proyectoActual].versiones[timestamp];
    if (!version) return;
    
    this.versionActual = timestamp;
    this.cargarConfiguracion(version);
    this.configuracionModificada = false;
    
    this.renderFlujos();
    this.updatePrompt();
  }

  eliminarProyecto() {
    if (!this.proyectoActual) return;
    
    if (confirm(`¿Eliminar el proyecto "${this.proyectoActual}" y todas sus versiones?`)) {
      delete this.proyectos[this.proyectoActual];
      localStorage.setItem('ia_proyectos', JSON.stringify(this.proyectos));
      
      const proyectosDisponibles = Object.keys(this.proyectos);
      if (proyectosDisponibles.length > 0) {
        this.proyectoActual = proyectosDisponibles[0];
        localStorage.setItem('ia_proyecto_actual', this.proyectoActual);
      } else {
        this.proyectoActual = null;
        localStorage.removeItem('ia_proyecto_actual');
        this.limpiarConfiguracion();
      }
      
      this.versionActual = null;
      this.renderProyectos();
    }
  }

  // ============================
  // HELPERS Y UTILIDADES
  // ============================
  getFunctionsSafely() {
    return (window.getFunctions && typeof window.getFunctions === 'function') 
      ? window.getFunctions() 
      : {};
  }

  updatePrompt() {
    if (window.actualizarPrompt && typeof window.actualizarPrompt === 'function') {
      window.actualizarPrompt();
    }
  }

  marcarComoModificado() {
    this.configuracionModificada = true;
  }

  obtenerConfiguracionActual() {
    const reglas = Array.from(document.querySelectorAll('.regla-input'))
      .map(input => input.value.trim())
      .filter(regla => regla !== '');
    
    const faqs = Array.from(document.querySelectorAll('.faq-item')).map(item => {
      const pregunta = item.querySelector('.faq-pregunta').value.trim();
      const respuesta = item.querySelector('.faq-respuesta').value.trim();
      return { pregunta, respuesta };
    }).filter(faq => faq.pregunta !== '' && faq.respuesta !== '');
    
    return {
      nombre_negocio: document.getElementById("nombre_negocio")?.value.trim() || '',
      mensaje_bienvenida: document.getElementById("mensaje_bienvenida")?.value.trim() || '',
      tono: document.getElementById("tono")?.value.trim() || '',
      formato_respuesta: document.getElementById("formato_respuesta")?.value.trim() || '',
      incluye_saludo: document.getElementById("incluye_saludo")?.checked !== false,
      incluye_despedida: document.getElementById("incluye_despedida")?.checked !== false,
      firma_contenido: document.getElementById("firma_contenido")?.value.trim() || '',
      firma_posicion: document.getElementById("firma_posicion")?.value || 'inicio_salto',
      contexto_principal: document.getElementById("contexto_principal")?.value.trim() || '',
      reglas: reglas,
      faqs: faqs,
      flujos: this.flujos,
      flujoActual: this.flujoActual
    };
  }

  cargarConfiguracion(config) {
    // Cargar campos básicos con validación
    this.setElementValue("nombre_negocio", config.nombre_negocio || '');
    this.setElementValue("mensaje_bienvenida", config.mensaje_bienvenida || '');
    this.setElementValue("tono", config.tono || '');
    this.setElementValue("formato_respuesta", config.formato_respuesta || '');
    this.setElementChecked("incluye_saludo", config.incluye_saludo !== false);
    this.setElementChecked("incluye_despedida", config.incluye_despedida !== false);
    this.setElementValue("firma_contenido", config.firma_contenido || '');
    this.setElementValue("firma_posicion", config.firma_posicion || 'inicio_salto');
    this.setElementValue("contexto_principal", config.contexto_principal || '');
    
    // Cargar reglas
    this.loadReglas(config.reglas || []);
    
    // Cargar FAQ
    this.loadFAQs(config.faqs || []);
    
    // Cargar flujos
    if (config.flujos) {
      this.flujos = config.flujos;
      this.flujoActual = config.flujoActual || 0;
    }
  }

  setElementValue(id, value) {
    const element = document.getElementById(id);
    if (element) element.value = value;
  }

  setElementChecked(id, checked) {
    const element = document.getElementById(id);
    if (element) element.checked = checked;
  }

  loadReglas(reglas) {
    const container = document.getElementById('reglas-container');
    if (!container) return;

    container.innerHTML = '';
    reglas.forEach(regla => {
      const reglaItem = document.createElement('div');
      reglaItem.className = 'regla-item';
      reglaItem.innerHTML = `
        <input type="text" class="regla-input" value="${this.escapeHtml(regla)}" oninput="app.updatePrompt(); app.marcarComoModificado();">
        <button type="button" class="del-regla" onclick="app.eliminarRegla(this)">×</button>
      `;
      container.appendChild(reglaItem);
    });
  }

  loadFAQs(faqs) {
    const container = document.getElementById('faq-container');
    if (!container) return;

    container.innerHTML = '';
    faqs.forEach(faq => {
      const faqItem = document.createElement('div');
      faqItem.className = 'faq-item';
      faqItem.innerHTML = `
        <label>Pregunta:</label>
        <input type="text" class="faq-pregunta" value="${this.escapeHtml(faq.pregunta)}" oninput="app.updatePrompt(); app.marcarComoModificado();">
        <label>Respuesta:</label>
        <textarea class="faq-respuesta" rows="2" oninput="app.updatePrompt(); app.marcarComoModificado();">${this.escapeHtml(faq.respuesta)}</textarea>
        <button type="button" class="del-faq" onclick="app.eliminarFAQ(this)">×</button>
      `;
      container.appendChild(faqItem);
    });
  }

  limpiarConfiguracion() {
    // Valores por defecto
    const defaults = {
      nombre_negocio: '',
      mensaje_bienvenida: '',
      tono: 'Profesional, cordial y claro',
      formato_respuesta: 'Respuestas breves, máximo 3 renglones, sin tecnicismos innecesarios',
      incluye_saludo: true,
      incluye_despedida: true,
      firma_contenido: '*Asistente IA*',
      firma_posicion: 'inicio_salto',
      contexto_principal: 'Actúa como el encargado de tomar pedidos para "[nombre_negocio]", por WhatsApp. \nSigue este flujo de conversación usando mensajes concisos, emojis y negritas con asteriscos *texto*. \nMantente siempre en contexto de pedidos.'
    };

    Object.entries(defaults).forEach(([key, value]) => {
      if (typeof value === 'boolean') {
        this.setElementChecked(key, value);
      } else {
        this.setElementValue(key, value);
      }
    });

    // Limpiar contenedores dinámicos
    this.clearContainer('reglas-container');
    this.clearContainer('faq-container');
    
    // Reinicializar flujos
    this.flujos = this.getDefaultFlujos();
    this.flujoActual = 0;
    
    this.renderFlujos();
    this.updatePrompt();
  }

  clearContainer(containerId) {
    const container = document.getElementById(containerId);
    if (container) container.innerHTML = '';
  }

  // ============================
  // GESTIÓN DE REGLAS Y FAQ
  // ============================
  agregarRegla() {
    const container = document.getElementById('reglas-container');
    if (!container) return;

    const reglaItem = document.createElement('div');
    reglaItem.className = 'regla-item';
    reglaItem.innerHTML = `
      <input type="text" class="regla-input" placeholder="Escribe una nueva regla..." oninput="app.updatePrompt(); app.marcarComoModificado();">
      <button type="button" class="del-regla" onclick="app.eliminarRegla(this)">×</button>
    `;
    container.appendChild(reglaItem);
    
    // Enfocar el nuevo input
    const newInput = reglaItem.querySelector('.regla-input');
    if (newInput) newInput.focus();
    
    this.updatePrompt();
    this.marcarComoModificado();
  }

  eliminarRegla(button) {
    if (confirm("¿Eliminar esta regla?")) {
      button.parentElement.remove();
      this.updatePrompt();
      this.marcarComoModificado();
    }
  }

  agregarFAQ() {
    const container = document.getElementById('faq-container');
    if (!container) return;

    const faqItem = document.createElement('div');
    faqItem.className = 'faq-item';
    faqItem.innerHTML = `
      <label>Pregunta:</label>
      <input type="text" class="faq-pregunta" placeholder="Escribe una pregunta frecuente..." oninput="app.updatePrompt(); app.marcarComoModificado();">
      <label>Respuesta:</label>
      <textarea class="faq-respuesta" rows="2" placeholder="Escribe la respuesta..." oninput="app.updatePrompt(); app.marcarComoModificado();"></textarea>
      <button type="button" class="del-faq" onclick="app.eliminarFAQ(this)">×</button>
    `;
    container.appendChild(faqItem);
    
    // Enfocar el nuevo input
    const newInput = faqItem.querySelector('.faq-pregunta');
    if (newInput) newInput.focus();
    
    this.updatePrompt();
    this.marcarComoModificado();
  }

  eliminarFAQ(button) {
    if (confirm("¿Eliminar esta pregunta frecuente?")) {
      button.parentElement.remove();
      this.updatePrompt();
      this.marcarComoModificado();
    }
  }

  // ============================
  // EXPORTACIÓN E IMPORTACIÓN
  // ============================
  exportarPrompt() {
    const outputElement = document.getElementById("output");
    if (!outputElement) return;

    const textoPrompt = outputElement.getAttribute('data-texto-plano') || outputElement.innerText;
    const blob = new Blob([textoPrompt], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.proyectoActual || 'prompt'}_${new Date().toISOString().slice(0,16).replace(/:/g,'-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  exportarProyecto() {
    if (!this.proyectoActual) {
      alert("No hay proyecto seleccionado para exportar");
      return;
    }
    
    const proyecto = this.proyectos[this.proyectoActual];
    const blob = new Blob([JSON.stringify(proyecto, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.proyectoActual}_proyecto.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  importarProyecto() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.style.display = 'none';
    
    input.onchange = (event) => {
      const file = event.target.files[0];
      if (!file) return;
      
      if (!file.name.endsWith('.json')) {
        alert("Por favor selecciona un archivo JSON válido");
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const proyectoImportado = JSON.parse(e.target.result);
          this.procesarProyectoImportado(proyectoImportado);
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
  }

  procesarProyectoImportado(proyectoImportado) {
    if (!proyectoImportado.nombre || !proyectoImportado.versiones) {
      alert("El archivo no tiene la estructura correcta de un proyecto");
      return;
    }
    
    let nombreProyecto = proyectoImportado.nombre;
    
    if (this.proyectos[nombreProyecto]) {
      const sobrescribir = confirm(
        `Ya existe un proyecto llamado "${nombreProyecto}".\n\n` +
        "¿Deseas sobrescribirlo?\n\n" +
        "• OK = Sobrescribir proyecto existente\n" +
        "• Cancelar = Crear con nuevo nombre"
      );
      
      if (!sobrescribir) {
        nombreProyecto = this.generarNombreUnico(nombreProyecto);
        proyectoImportado.nombre = nombreProyecto;
      }
    }
    
    this.proyectos[nombreProyecto] = proyectoImportado;
    localStorage.setItem('ia_proyectos', JSON.stringify(this.proyectos));
    
    this.proyectoActual = nombreProyecto;
    localStorage.setItem('ia_proyecto_actual', nombreProyecto);
    
    const versiones = proyectoImportado.versiones || {};
    const ultimaVersion = Object.keys(versiones).sort((a, b) => new Date(b) - new Date(a))[0];
    
    if (ultimaVersion) {
      this.versionActual = ultimaVersion;
      this.cargarVersion(ultimaVersion);
    }
    
    this.renderProyectos();
    
    const numVersiones = Object.keys(versiones).length;
    alert(
      `✅ Proyecto importado exitosamente!\n\n` +
      `📁 Nombre: ${nombreProyecto}\n` +
      `📅 Versiones: ${numVersiones}\n` +
      `⏰ Creado: ${new Date(proyectoImportado.creado).toLocaleString()}`
    );
  }

  generarNombreUnico(nombre) {
    let contador = 1;
    let nuevoNombre = `${nombre} (${contador})`;
    
    while (this.proyectos[nuevoNombre]) {
      contador++;
      nuevoNombre = `${nombre} (${contador})`;
    }
    
    return nuevoNombre;
  }

  exportarTodosLosProyectos() {
    if (Object.keys(this.proyectos).length === 0) {
      alert("No hay proyectos para exportar");
      return;
    }
    
    const backup = {
      fecha_exportacion: new Date().toISOString(),
      version_app: "2.0",
      proyectos: this.proyectos
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
    
    alert(`Backup creado con ${Object.keys(this.proyectos).length} proyectos`);
  }

  // ============================
  // UTILIDADES Y HELPERS
  // ============================
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  setupEventListeners() {
    // Event delegation para botones dinámicos
    document.addEventListener('click', this.handleGlobalClick.bind(this));
    
    // Listeners para campos de configuración
    document.addEventListener('input', this.handleGlobalInput.bind(this));
    document.addEventListener('change', this.handleGlobalChange.bind(this));
    
    // Listener para detectar cuando se registran nuevas funciones
    window.addEventListener('functionRegistered', () => {
      if (this.pestanaActual === 1) { // Pestaña de flujos
        this.renderPasos();
      }
    });
  }

  handleGlobalClick(event) {
    const { target } = event;
    
    // Prevenir comportamiento por defecto en botones de funciones
    if (target.tagName === 'BUTTON' && (
      target.textContent.includes('➕') ||
      target.classList.contains('del-paso') ||
      target.classList.contains('move-paso') ||
      target.classList.contains('del-funcion') ||
      target.classList.contains('del-regla') ||
      target.classList.contains('del-faq')
    )) {
      event.preventDefault();
    }
  }

  handleGlobalInput(event) {
    const { target } = event;
    
    // Auto-actualizar prompt en campos relevantes
    if (target.matches('#nombre_negocio, #mensaje_bienvenida, #tono, #formato_respuesta, #firma_contenido, #contexto_principal, .regla-input, .faq-pregunta, .faq-respuesta')) {
      this.updatePrompt();
      this.marcarComoModificado();
    }
    
    // Autosize para textareas
    if (target.tagName === 'TEXTAREA') {
      this.adjustTextareaHeight(target);
    }
  }

  handleGlobalChange(event) {
    const { target } = event;
    
    // Checkboxes y selects
    if (target.matches('#incluye_saludo, #incluye_despedida, #firma_posicion')) {
      this.updatePrompt();
      this.marcarComoModificado();
    }
  }

  loadInitialData() {
    this.renderProyectos();
    
    if (this.proyectoActual && this.proyectos[this.proyectoActual]) {
      const versiones = this.proyectos[this.proyectoActual].versiones || {};
      const ultimaVersion = Object.keys(versiones).sort((a, b) => new Date(b) - new Date(a))[0];
      
      if (ultimaVersion) {
        this.cargarVersion(ultimaVersion);
      }
    } else {
      this.renderFlujos();
    }
  }

  // ============================
  // DEBUG Y DESARROLLO
  // ============================
  debug() {
    return {
      proyectos: this.proyectos,
      proyectoActual: this.proyectoActual,
      versionActual: this.versionActual,
      flujos: this.flujos,
      flujoActual: this.flujoActual,
      pestanaActual: this.pestanaActual,
      scrollPositions: Object.fromEntries(this.scrollPositions),
      configuracionModificada: this.configuracionModificada
    };
  }

  limpiarTodo() {
    if (confirm("¿Estás seguro de que quieres eliminar TODOS los proyectos y datos?")) {
      localStorage.removeItem('ia_proyectos');
      localStorage.removeItem('ia_proyecto_actual');
      this.proyectos = {};
      this.proyectoActual = null;
      this.versionActual = null;
      this.scrollPositions.clear();
      this.renderProyectos();
      this.limpiarConfiguracion();
      console.log("Todos los datos han sido eliminados.");
    }
  }
}

// ============================
// INICIALIZACIÓN GLOBAL
// ============================

// Crear instancia global de la aplicación
let app;

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  console.log("Iniciando FlujosApp v2.0...");
  app = new FlujosApp();
  
  // Exponer funciones globales para compatibilidad con HTML
  window.app = app;
  
  // Aliases para funciones llamadas desde HTML
  window.cambiarPestana = (indice) => app.cambiarPestana(indice);
  window.cambiarProyecto = (nombre) => app.cambiarProyecto(nombre);
  window.crearProyectoDesdeInput = () => app.crearProyectoDesdeInput();
  window.guardarVersion = () => app.guardarVersion();
  window.cargarVersion = (timestamp) => app.cargarVersion(timestamp);
  window.eliminarProyecto = () => app.eliminarProyecto();
  window.exportarPrompt = () => app.exportarPrompt();
  window.exportarProyecto = () => app.exportarProyecto();
  window.importarProyecto = () => app.importarProyecto();
  window.exportarTodosLosProyectos = () => app.exportarTodosLosProyectos();
  
  // Funciones de flujos
  window.cambiarFlujo = (indice) => app.cambiarFlujo(indice);
  window.agregarFlujo = () => app.agregarFlujo();
  window.eliminarFlujo = () => app.eliminarFlujo();
  window.renombrarFlujo = (nombre) => app.renombrarFlujo(nombre);
  window.renderFlujos = () => app.renderFlujos();
  window.renderPasos = () => app.renderPasos();
  
  // Funciones de pasos
  window.agregarPaso = () => app.agregarPaso();
  window.moverPaso = (idx, dir) => app.moverPaso(idx, dir);
  window.eliminarPaso = (idx) => app.eliminarPaso(idx);
  window.editarTextoPaso = (idx, value) => app.editarTextoPaso(idx, value);
  
  // Funciones de funciones 😄
  window.agregarFuncionPaso = (idx) => app.agregarFuncionPaso(idx);
  window.eliminarFuncionPaso = (pasoIdx, fnIdx) => app.eliminarFuncionPaso(pasoIdx, fnIdx);
  window.cambiarTipoFuncionPaso = (pasoIdx, fnIdx, tipo) => app.cambiarTipoFuncionPaso(pasoIdx, fnIdx, tipo);
  window.editarParametroFuncionPaso = (pasoIdx, fnIdx, param, value) => app.editarParametroFuncionPaso(pasoIdx, fnIdx, param, value);
  
  // Funciones de campos dinámicos
  window.agregarCampoDinamico = (pasoIdx, fnIdx) => app.agregarCampoDinamico(pasoIdx, fnIdx);
  window.editarCampoDinamico = (pasoIdx, fnIdx, campoIdx, prop, value) => app.editarCampoDinamico(pasoIdx, fnIdx, campoIdx, prop, value);
  window.eliminarCampoDinamico = (pasoIdx, fnIdx, campoIdx) => app.eliminarCampoDinamico(pasoIdx, fnIdx, campoIdx);
  
  // Funciones de reglas y FAQ
  window.agregarRegla = () => app.agregarRegla();
  window.eliminarRegla = (button) => app.eliminarRegla(button);
  window.agregarFAQ = () => app.agregarFAQ();
  window.eliminarFAQ = (button) => app.eliminarFAQ(button);
  
  // Funciones de utilidad
  window.adjustAllTextareas = () => app.adjustAllTextareas();
  window.debugApp = () => app.debug();
  window.limpiarTodo = () => app.limpiarTodo();
  
  console.log("✅ FlujosApp v2.0 inicializada correctamente");
  console.log("📝 Usa window.debugApp() para información de debug");
  console.log("🧹 Usa window.limpiarTodo() para resetear (¡cuidado!)");
});