// utils/validators.js

export const validators = {
  required: (value) => {
    if (!value || String(value).trim() === '') {
      return 'Este campo es requerido'
    }
    return null
  },

  email: (value) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/
    if (!emailRegex.test(value)) {
      return 'Ingresa un correo electrónico válido'
    }
    return null
  },

  password: (value) => {
    if (value.length < 8) {
      return 'La contraseña debe tener al menos 8 caracteres'
    }
    if (!/[A-Z]/.test(value)) {
      return 'La contraseña debe tener al menos una mayúscula'
    }
    if (!/[a-z]/.test(value)) {
      return 'La contraseña debe tener al menos una minúscula'
    }
    if (!/[0-9]/.test(value)) {
      return 'La contraseña debe tener al menos un número'
    }
    return null
  },

  name: (value) => {
    if (value.length < 2) {
      return 'El nombre debe tener al menos 2 caracteres'
    }
    if (value.length > 100) {
      return 'El nombre no puede exceder los 100 caracteres'
    }
    if (!/^[a-zA-ZáéíóúñÁÉÍÓÚÑ\s]+$/.test(value)) {
      return 'El nombre solo puede contener letras y espacios'
    }
    return null
  }
}

export const validateForm = (formData, rules) => {
  const errors = {}
  let isValid = true

  for (const field in rules) {
    const fieldRules = rules[field]
    
    if (!Array.isArray(fieldRules)) {
      console.error(`Las reglas para "${field}" deben ser un array`)
      continue
    }

    for (const rule of fieldRules) {
      if (typeof rule !== 'function') {
        console.error(`La regla para "${field}" no es una función:`, rule)
        continue
      }

      const error = rule(formData[field], formData)
      
      if (error) {
        errors[field] = error
        isValid = false
        break
      }
    }
  }

  return { isValid, errors }
}