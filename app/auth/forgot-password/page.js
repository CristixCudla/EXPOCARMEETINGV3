'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Mail } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  async function handleResetPassword(e) {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) throw error

      toast.success('Email trimis! Verifică inbox-ul.')
      setSent(true)
    } catch (error) {
      console.error('Reset password error:', error)
      toast.error(error.message || 'Eroare la trimitere email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Link href="/auth/login">
            <Button variant="ghost" className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Înapoi la Login
            </Button>
          </Link>
        </div>

        <Card className="neon-card bg-black/40 backdrop-blur-xl border-white/20">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full p-4 bg-gradient-to-br from-cyan-500/20 to-blue-500/20">
                <Mail className="w-8 h-8 text-cyan-400" />
              </div>
            </div>
            <CardTitle className="text-3xl font-black uppercase tracking-tight">
              <span className="text-cyan-400">RESETARE PAROLĂ</span>
            </CardTitle>
            <p className="text-white/50 text-sm mt-2">
              {sent 
                ? 'Email trimis! Verifică inbox-ul și follow link-ul pentru resetare.'
                : 'Introdu email-ul tău și îți trimitem link de resetare parolă'}
            </p>
          </CardHeader>
          <CardContent>
            {!sent ? (
              <form onSubmit={handleResetPassword} className="space-y-4">
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

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-6"
                >
                  {loading ? 'Se trimite...' : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      TRIMITE EMAIL RESETARE
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <div className="text-center space-y-4">
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                  <p className="text-green-400 text-sm">
                    ✅ Email trimis cu succes la <strong>{email}</strong>
                  </p>
                </div>
                <p className="text-white/60 text-sm">
                  Nu ai primit emailul? Verifică folder-ul SPAM sau încearcă din nou.
                </p>
                <Button
                  onClick={() => setSent(false)}
                  variant="outline"
                  className="w-full border-cyan-400 text-cyan-400 hover:bg-cyan-400/10"
                >
                  Trimite din nou
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
