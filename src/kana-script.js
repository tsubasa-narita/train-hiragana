export function normalizeKanaScript(value) {
  return value === 'katakana' ? 'katakana' : 'hiragana';
}

// Keep train names, answer keys, and audio lookups in their original form.
// Modern hiragana and their katakana equivalents share the same offset.
export function kanaInScript(text, script) {
  return script === 'katakana'
    ? text.replace(/[\u3041-\u3096\u309d-\u309e]/g, kana => String.fromCharCode(kana.charCodeAt(0) + 0x60))
    : text;
}
