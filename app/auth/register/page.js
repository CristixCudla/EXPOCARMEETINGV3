'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UserPlus, ArrowLeft, Car } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: ''
  })

  async function handleRegister(e) {
    e.preventDefault()
    setLoading(true)

    if (formData.password !== formData.confirmPassword) {
      toast.error('Parolele nu coincid')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      toast.error('Parola trebuie să aibă minim 6 caractere')
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.full_name
          }
        }
      })

      if (error) throw error

      toast.success('Cont creat cu succes! 🎉')
      router.push('/')
    } catch (error) {
      console.error('Register error:', error)
      toast.error(error.message || 'Eroare la înregistrare')
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
              <div className="rounded-full p-4 bg-gradient-to-br from-pink-500/20 to-orange-500/20">
                <UserPlus className="w-8 h-8 text-pink-400" />
              </div>
            </div>
            <CardTitle className="text-3xl font-black uppercase tracking-tight">
              <span className="italic-subtitle">ÎNREGISTRARE</span>
            </CardTitle>
            <p className="text-white/50 text-sm mt-2">Creează-ți cont pentru Expo Car Meeting 2026</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-white/70 text-sm font-medium">Nume complet</Label>
                <Input
                  id="full_name"
                  type="text"
                  placeholder="Ion Popescu"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/30 focus:border-pink-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/70 text-sm font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@exemplu.ro"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/30 focus:border-pink-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/70 text-sm font-medium">Parolă</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/30 focus:border-pink-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white/70 text-sm font-medium">Confirmă parola</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/30 focus:border-pink-400"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white font-bold py-6"
              >
                {loading ? (
                  'Se înregistrează...'
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    CREEAZĂ CONT
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-white/50">
                Ai deja cont?{' '}
                <Link href="/auth/login" className="text-cyan-400 hover:text-cyan-300 font-semibold">
                  Conectează-te
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
