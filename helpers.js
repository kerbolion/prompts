// helpers generales para la app
window.htmlEncode = str => str.replace(/[<>&"]/g, function (c) {
    return { '<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;' }[c]
});
window.formatNegritas = str => str.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
window.formatPromptSalto = str =>
  str.replace(/\n{3,}/g, '\n\n').replace(/\n\n/g, '<br><br>').replace(/\n/g, '<br>');