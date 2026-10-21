'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AlertCircle, Info } from 'lucide-react'
import { useAuth } from '@/app/hooks/useAuth'

const DEMO_PASSWORD = 'password123' // must match the demo users created in Firebase Auth

const inputBase =
  'h-10 w-full rounded-lg border bg-black/[0.03] px-3 text-sm text-slate-900 placeholder:text-slate-500 ' +
  'transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2943ca] ' +
  'disabled:cursor-not-allowed disabled:opacity-50'

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function validate(email, password) {
  const errors = {}
  if (!email.trim()) errors.email = 'Email is required.'
  else if (!isValidEmail(email)) errors.email = 'Enter a valid email address, like name@example.com.'
  if (!password) errors.password = 'Password is required.'
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

export function LoginForm() {
  const { login, user: currentUser } = useAuth()
  const router = useRouter()
  const params = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (currentUser) router.replace('/dashboard')
  }, [currentUser, router])

  async function signIn(nextEmail, nextPassword) {
    setFormError(null)
    setIsLoading(true)
    try {
      await login(nextEmail, nextPassword)
      router.push('/dashboard')
    } catch (error) {
      console.error(error)
      if (
        error.code === 'auth/user-not-found' ||
        error.code === 'auth/wrong-password' ||
        error.code === 'auth/invalid-credential'
      ) {
        setFormError('Invalid email or password. Please try again.')
      } else {
        setFormError('Failed to sign in. Please check your network connection.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (isLoading) return

    const nextErrors = validate(email, password)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    signIn(email, password)
  }

  return (
    <div className="space-y-5.5">
      {params?.get('reason') === 'auth' && !formError && (
        <div
          role="status"
          className="flex gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900"
        >
          <Info className="mt-0.5 size-4 shrink-0 text-blue-600" aria-hidden="true" />
          Please sign in to view that page. Visitors cannot access the dashboard or projects.
        </div>
      )}
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
          <Label htmlFor="login-email">Email</Label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            required
            disabled={isLoading}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            onBlur={() => setErrors((prev) => ({ ...prev, email: validate(email, 'x').email }))}
            aria-invalid={errors.email ? 'true' : undefined}
            aria-describedby={errors.email ? 'login-email-error' : undefined}
            className={`${inputBase} ${errors.email ? 'border-red-500 ring-1 ring-red-500' : 'border-black/15'}`}
          />
          {errors.email && (
            <p id="login-email-error" className="text-xs font-medium text-red-600">
              {errors.email}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="login-password">Password</Label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            required
            disabled={isLoading}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-invalid={errors.password ? 'true' : undefined}
            aria-describedby={errors.password ? 'login-password-error' : undefined}
            className={`${inputBase} ${errors.password ? 'border-red-500 ring-1 ring-red-500' : 'border-black/15'}`}
          />
          {errors.password && (
            <p id="login-password-error" className="text-xs font-medium text-red-600">
              {errors.password}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="mt-1.25 h-9.5 w-full rounded-lg bg-[#2943ca] text-sm font-medium text-white transition-colors hover:bg-[#2339b0] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2943ca] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <div className="rounded-lg border border-black/10 bg-white/40 p-3">
        <p className="text-xs font-medium text-slate-900">Demo accounts (password: {DEMO_PASSWORD})</p>
        <div className="mt-1.75 grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            disabled={isLoading}
            onClick={() => signIn('owner@example.test', DEMO_PASSWORD)}
            className="h-9 rounded-lg border border-black/15 bg-white/85 px-3 text-sm font-medium text-slate-900 transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2943ca] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Sign in as Owner
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => signIn('member@example.test', DEMO_PASSWORD)}
            className="h-9 rounded-lg border border-black/15 bg-white/85 px-3 text-sm font-medium text-slate-900 transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2943ca] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Sign in as Member
          </button>
        </div>
      </div>
    </div>
  )
}