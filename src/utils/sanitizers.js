export const sanitizers = {
  sanitizeEmail: (email) => email.trim().toLowerCase(),
  cleanString: (str) => str.trim(),
  escapeHtml: (str) => {
    return str.replace(/[&<>]/g, (char) => {
      const escapeMap = { '&': '&amp;', '<': '&lt;', '>': '&gt;' }
      return escapeMap[char]
    })
  }
}