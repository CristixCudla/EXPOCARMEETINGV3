'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LogIn, ArrowLeft, Car, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      // Get user profile to check role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

      if (profileError) {
        console.error('Profile error:', profileError)
      }

      toast.success('Autentificare reușită! 🎉')

      // Redirect based on role
      if (profile?.role === 'admin' || profile?.role === 'organizer') {
        router.push('/dashboard')
      } else {
        router.push('/')
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error(error.message || 'Eroare la autentificare')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Înapoi la Home
            </Button>
          </Link>
        </div>

        <Card className="neon-card bg-black/40 backdrop-blur-xl border-white/20">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full p-4 bg-gradient-to-br from-cyan-500/20 to-blue-500/20">
                <Car className="w-8 h-8 text-cyan-400" />
              </div>
            </div>
            <CardTitle className="text-3xl font-black uppercase tracking-tight">
              <span className="text-cyan-400">CONECTARE</span>
            </CardTitle>
            <p className="text-white/50 text-sm mt-2">Intră în contul tău Expo Car Meeting</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/70 text-sm font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@exemplu.ro"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/30 focus:border-cyan-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/70 text-sm font-medium">Parolă</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/30 focus:border-cyan-400 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-cyan-400 transition-colors"
                    aria-label={showPassword ? "Ascunde parola" : "Arată parola"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-6"
              >
                {loading ? (
                  'Se conectează...'
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    CONECTARE
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-white/50">
                Nu ai cont?{' '}
                <Link href="/auth/register" className="text-cyan-400 hover:text-cyan-300 font-semibold">
                  Înregistrează-te
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
