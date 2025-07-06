window.actualizarPrompt = function () {
  const data = {
    nombre_negocio: document.getElementById("nombre_negocio").value.trim(),
    mensaje_bienvenida: document.getElementById("mensaje_bienvenida").value.trim(),
    // Configuraciones
    tono: document.getElementById("tono").value.trim(),
    formato_respuesta: document.getElementById("formato_respuesta").value.trim(),
    incluye_saludo: document.getElementById("incluye_saludo").checked,
    incluye_despedida: document.getElementById("incluye_despedida").checked,
    firma_contenido: document.getElementById("firma_contenido").value.trim(),
    firma_posicion: document.getElementById("firma_posicion").value,
    contexto_principal: document.getElementById("contexto_principal").value.trim()
  };
  
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
  
  function formatoPaso(p) {
    let bloque = "- " +(p.texto||"");
    if(p.funciones && p.funciones.length) {
      bloque += p.funciones.map(f=>{
        const fn= window.funciones[f.funcion];
        
        // Para la función formularios, usar el nombre del formulario como nombre de función
        let nombreFuncion = f.funcion;
        if (f.funcion === 'formularios' && f.params && f.params.nombre_formulario) {
          nombreFuncion = f.params.nombre_formulario;
        }
        
        // Obtener parámetros estándar (excepto nombre_formulario para formularios)
        let params = '';
        if (f.funcion === 'formularios') {
          // Para formularios, mostrar los campos dinámicos con sus valores
          if (f.camposDinamicos && f.camposDinamicos.length > 0) {
            params = f.camposDinamicos
              .filter(campo => campo.nombre && campo.nombre.trim() !== '')
              .map(campo => `${campo.nombre}: "${campo.valor || ''}"`)
              .join(', ');
          }
        } else {
          // Para otras funciones, mostrar parámetros normales
          params = fn.params.map(param=>param.nombre+': "'+(f.params[param.nombre]||"")+'"').join(', ');
        }
        
        return `<br>    Ejecuta la función: <strong>${nombreFuncion}({${params}})</strong>`;
      }).join("");
    }
    return bloque;
  }
  
  // Construir contexto principal personalizable
  let contextoPrincipal = data.contexto_principal || `Actúa como el encargado de tomar pedidos para "${data.nombre_negocio||'[Nombre negocio]'}", por WhatsApp. 
Sigue este flujo de conversación usando mensajes concisos, emojis y negritas con asteriscos *texto*. 
Mantente siempre en contexto de pedidos.`;
  
  // Reemplazar [nombre_negocio] en el contexto
  contextoPrincipal = contextoPrincipal.replace(/\[nombre_negocio\]/g, data.nombre_negocio || '[Nombre negocio]');
  
  // Construir sección de instrucciones generales
  let instruccionesGenerales = '';
  if (data.tono || data.formato_respuesta || reglas.length > 0) {
    instruccionesGenerales = `
**Instrucciones Generales:**
${data.tono ? `- Tono: ${data.tono}` : ''}
${data.formato_respuesta ? `- Formato: ${data.formato_respuesta}` : ''}
${data.incluye_saludo ? '- Incluye saludo inicial' : ''}
${data.incluye_despedida ? '- Incluye despedida' : ''}

${reglas.length > 0 ? '**Reglas de comportamiento:**' : ''}
${reglas.map((regla, index) => `${index}. ${regla}`).join('\n')}

---
`;
  }
  
  // Construir sección de firma
  let firmaInstruccion = '';
  if (data.firma_contenido) {
    const posicionTexto = {
      'inicio': 'al inicio de cada respuesta',
      'final': 'al final de cada respuesta', 
      'inicio_salto': 'al inicio de cada respuesta, seguida de un salto de línea',
      'final_salto': 'al final de cada respuesta, precedida de un salto de línea'
    };
    
    firmaInstruccion = `
**Firma de respuesta:**
Contenido: ${data.firma_contenido}
Posición: ${posicionTexto[data.firma_posicion] || 'al inicio de cada respuesta, seguida de un salto de línea'}

---
`;
  }
  
  // Construir sección de FAQ
  let seccionFAQ = '';
  if (faqs.length > 0) {
    seccionFAQ = `
**Preguntas Frecuentes:**
${faqs.map(faq => `- **${faq.pregunta}**\n  ${faq.respuesta}`).join('\n')}

---
`;
  }
  
  const prompt = `
Prompt para Asistente IA – "${data.nombre_negocio||'[Nombre negocio]'}"

${contextoPrincipal}

---

${instruccionesGenerales}${firmaInstruccion}${seccionFAQ}${window.flujos.map((flujo, flujoIdx) => {
  const esUnicoFlujo = window.flujos.length === 1;
  const tituloFlujo = esUnicoFlujo ? "**Flujo principal:**" : `**${flujo.nombre}:**`;
  
  const pasosFlujo = flujo.pasos.map((p, index) => {
    const numeroPaso = esUnicoFlujo ? `${index + 2}. ` : `${index + 1}. `;
    return `${numeroPaso}${formatoPaso(p)}`;
  }).join('<br><br>');
  
  const mensajeBienvenida = esUnicoFlujo ? `1. Mensaje de bienvenida:
${data.mensaje_bienvenida ? '- '+data.mensaje_bienvenida : '- ¡Hola! Bienvenido a *'+(data.nombre_negocio||'[Nombre negocio]')+'* 🥟🥤'}

` : '';
  
  return `${tituloFlujo}

${mensajeBienvenida}${pasosFlujo}`;
}).join('<br><br>---<br><br>')}
  `.trim();
  
  let htmlPrompt = window.formatNegritas(prompt);
  htmlPrompt = window.formatPromptSalto(htmlPrompt);
  document.getElementById("output").innerHTML = htmlPrompt;
}

window.renderFlujos();