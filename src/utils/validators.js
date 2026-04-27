export const validators = {
  required: (value) => !value || value.trim() === '' ? 'Este campo es requerido' : null,
  email: (value) => {
    if (!value) return null
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return !emailRegex.test(value) ? 'Correo electrónico inválido' : null
  },
  minLength: (min) => (value) => {
    if (!value) return null
    return value.length < min ? `Mínimo ${min} caracteres` : null
  },
  maxLength: (max) => (value) => {
    if (!value) return null
    return value.length > max ? `Máximo ${max} caracteres` : null
  }
}

export const validateForm = (formData, rules) => {
  const errors = {}
  let isValid = true

  for (const [field, fieldRules] of Object.entries(rules)) {
    for (const rule of fieldRules) {
      const error = rule(formData[field])
      if (error) {
        errors[field] = error
        isValid = false
        break
      }
    }
  }

  return { isValid, errors }
}