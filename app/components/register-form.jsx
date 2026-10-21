'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle } from 'lucide-react'
import { useAuth } from '@/app/hooks/useAuth'

const MIN_PASSWORD_LENGTH = 8

const inputBase =
  'h-10 w-full rounded-lg border bg-black/[0.03] px-3 text-sm text-slate-900 placeholder:text-slate-500 ' +
  'transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2943ca] ' +
  'disabled:cursor-not-allowed disabled:opacity-50'

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function validateField(field, value) {
  switch (field) {
    case 'name':
      if (!value.trim()) return 'Full name is required.'
      if (value.trim().length < 2) return 'Full name must be at least 2 characters.'
      return undefined
    case 'email':
      if (!value.trim()) return 'Email is required.'
      if (!isValidEmail(value.trim())) return 'Enter a valid email address, like name@example.com.'
      return undefined
    case 'password':
      if (!value) return 'Password is required.'
      if (value.length < MIN_PASSWORD_LENGTH) return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`
      return undefined
    default:
      return undefined
  }
}

function validate(values) {
  const errors = {}
  for (const field of ['name', 'email', 'password']) {
    const message = validateField(field, values[field])
    if (message) errors[field] = message
  }
  return errors
}

function Label({ htmlFor, children }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-900">
      {children}
      <span className="ml-1.5 text-red-600" aria-hidden="true">
        *
      </span>
    </label>
  )
}

const fieldClass = (hasError) =>
  `${inputBase} ${hasError ? 'border-red-500 ring-1 ring-red-500' : 'border-black/15'}`

export function RegisterForm() {
  // Assumes useAuth() exposes: register(name, email, password) -> creates the Firebase Auth user
  // and the users/{uid} profile document (FR-01, FR-04). Adjust the call in handleSubmit if yours differs.
  const { register, user: currentUser } = useAuth()
  const router = useRouter()
  const [values, setValues] = useState({ name: '', email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (currentUser) router.replace('/dashboard')
  }, [currentUser, router])

  function setValue(field) {
    return (event) => setValues((prev) => ({ ...prev, [field]: event.target.value }))
  }

  function handleBlur(field) {
    return () => setErrors((prev) => ({ ...prev, [field]: validateField(field, values[field]) }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (isLoading) return

    const nextErrors = validate(values)
    setErrors(nextErrors)
    setFormError(null)
    if (Object.keys(nextErrors).length > 0) return

    setIsLoading(true)
    try {
      await register(values.name.trim(), values.email.trim(), values.password)
      router.push('/dashboard')
    } catch (error) {
      console.error(error)
      if (error.code === 'auth/email-already-in-use') {
        setErrors({ email: 'An account with this email already exists. Try signing in instead.' })
      } else if (error.code === 'auth/invalid-email') {
        setErrors({ email: 'Enter a valid email address, like name@example.com.' })
      } else if (error.code === 'auth/weak-password') {
        setErrors({ password: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` })
      } else {
        setFormError('Failed to create your account. Please check your network connection and try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {formError && (
        <div
          role="alert"
          className="flex gap-2 rounded-lg border border-red-300 bg-red-50 p-3 text-sm font-medium text-red-900"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-600" aria-hidden="true" />
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
        <div className="space-y-1">
          <Label htmlFor="register-name">Full name</Label>
          <input
            id="register-name"
            type="text"
            autoComplete="name"
            required
            disabled={isLoading}
            value={values.name}
            onChange={setValue('name')}
            onBlur={handleBlur('name')}
            aria-invalid={errors.name ? 'true' : undefined}
            aria-describedby={errors.name ? 'register-name-error' : undefined}
            className={fieldClass(errors.name)}
          />
          {errors.name && (
            <p id="register-name-error" className="pt-0.5 text-xs font-medium text-red-600">
              {errors.name}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="register-email">Email</Label>
          <input
            id="register-email"
            type="email"
            autoComplete="email"
            required
            disabled={isLoading}
            value={values.email}
            onChange={setValue('email')}
            onBlur={handleBlur('email')}
            aria-invalid={errors.email ? 'true' : undefined}
            aria-describedby={errors.email ? 'register-email-error' : undefined}
            className={fieldClass(errors.email)}
          />
          {errors.email && (
            <p id="register-email-error" className="pt-0.5 text-xs font-medium text-red-600">
              {errors.email}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="register-password">Password</Label>
          <input
            id="register-password"
            type="password"
            autoComplete="new-password"
            required
            disabled={isLoading}
            value={values.password}
            onChange={setValue('password')}
            onBlur={handleBlur('password')}
            aria-invalid={errors.password ? 'true' : undefined}
            aria-describedby="register-password-hint"
            className={fieldClass(errors.password)}
          />
          {errors.password ? (
            <p id="register-password-hint" className="pt-0.5 text-xs font-medium text-red-600">
              {errors.password}
            </p>
          ) : (
            <p id="register-password-hint" className="pt-0.5 text-xs text-slate-500">
              Use at least {MIN_PASSWORD_LENGTH} characters.
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="mt-1.25 h-9.5 w-full rounded-lg bg-[#2943ca] text-sm font-medium text-white transition-colors hover:bg-[#2339b0] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2943ca] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? 'Creating account...' : 'Create account'}
        </button>
      </form>
    </div>
  )
}
