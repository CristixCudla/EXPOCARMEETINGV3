'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, MapPin, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function ProgramPage() {
  const [eventSchedule, setEventSchedule] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSchedule()
  }, [])

  async function loadSchedule() {
    try {
      const { data, error } = await supabase
        .from('event_schedule')
        .select('*')
        .order('display_order', { ascending: true })
      
      if (error) throw error
      setEventSchedule(data || [])
      setLoading(false)
    } catch (error) {
      console.error('Error loading schedule:', error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-5 md:px-10">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-black to-black"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto">
          <Link href="/">
            <Button variant="ghost" className="text-cyan-400 hover:text-cyan-300 mb-8">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Înapoi la Homepage
            </Button>
          </Link>

          <div className="text-center mb-16">
            <p className="section-label mb-6 text-cyan-400">Eveniment</p>
            <h1 className="display-heading mb-6 text-6xl md:text-8xl">
              PROGRAM
            </h1>
            <p className="text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 mb-8">
              Complet
            </p>
            <p className="text-gray-300 text-lg max-w-3xl mx-auto">
              Vezi toate activitățile planificate pentru cele 2 zile de eveniment — orele exacte, detalii și tot ce trebuie să știi.
            </p>
          </div>

          {/* Informații Eveniment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
            <Card className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 border-pink-500/40 backdrop-blur-xl p-10">
              <div className="flex items-center gap-4 mb-4">
                <Calendar className="w-12 h-12 text-pink-400" />
                <div>
                  <p className="text-sm text-gray-400 uppercase tracking-wide font-semibold mb-1">Data Eveniment</p>
                  <p className="text-4xl font-black text-white">6–7 Iunie 2026</p>
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-500/40 backdrop-blur-xl p-10">
              <div className="flex items-center gap-4 mb-4">
                <MapPin className="w-12 h-12 text-cyan-400" />
                <div>
                  <p className="text-sm text-gray-400 uppercase tracking-wide font-semibold mb-1">Locație</p>
                  <p className="text-4xl font-black text-white">Nada Florilor</p>
                  <p className="text-lg text-cyan-400">Fălticeni</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Program Detaliat */}
          {loading ? (
            <div className="text-center py-20">
              <div className="animate-pulse text-cyan-400 text-xl">Se încarcă programul...</div>
            </div>
          ) : eventSchedule.length > 0 ? (
            <div className="space-y-6 max-w-5xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-8 text-center">
                Program Detaliat
              </h2>
              
              {eventSchedule.map((item) => (
                <Card 
                  key={item.id} 
                  className="bg-gradient-to-br from-white/10 to-white/5 border-white/20 backdrop-blur-xl p-8 hover:border-cyan-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20"
                >
                  <div className="flex flex-col md:flex-row md:items-start gap-6">
                    {/* Data și Ora */}
                    <div className="flex-shrink-0 md:w-48">
                      <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-white border-0 mb-3 px-4 py-2 text-base font-bold">
                        {new Date(item.date).toLocaleDateString('ro-RO', { 
                          weekday: 'long',
                          day: 'numeric', 
                          month: 'long',
                          year: 'numeric'
                        })}
                      </Badge>
                      {item.time && (
                        <div className="flex items-center gap-2 text-cyan-400 font-bold text-lg">
                          <Clock className="w-5 h-5" />
                          <span>{item.time}</span>
                        </div>
                      )}
                    </div>

                    {/* Conținut */}
                    <div className="flex-grow border-l-4 border-cyan-400/30 pl-6">
                      <h3 className="text-2xl md:text-3xl font-black text-white mb-3">
                        {item.title}
                      </h3>
                      <p className="text-gray-300 text-lg leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-gray-400 text-xl mb-4">
                Programul complet va fi anunțat în curând!
              </div>
              <p className="text-gray-500">
                Revino pentru a vedea detaliile complete ale evenimentului.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-5 md:px-10 border-t border-white/10 relative z-10">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-500 text-sm">
            © 2026 Expo Car Meeting. Toate drepturile rezervate.
          </p>
        </div>
      </footer>
    </div>
  )
}
