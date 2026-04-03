'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Car, Trophy, Users, Ticket, LogIn, UserPlus, LogOut, LayoutDashboard, Calendar, Clock, MapPin } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

export default function HomePage() {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [eventSchedule, setEventSchedule] = useState([])
  const [bestCars, setBestCars] = useState([])
  const [sponsors, setSponsors] = useState([])
  const [userVote, setUserVote] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadUserProfile(session.user.id)
        loadUserVote(session.user.id)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadUserProfile(session.user.id)
        loadUserVote(session.user.id)
      } else {
        setUserProfile(null)
        setUserVote(null)
      }
    })

    loadPublicData()

    return () => subscription.unsubscribe()
  }, [])

  async function loadUserProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (error) throw error
      setUserProfile(data)
    } catch (error) {
      console.error('Error loading profile:', error)
    }
  }

  async function loadUserVote(userId) {
    try {
      const { data, error } = await supabase
        .from('votes')
        .select('car_id')
        .eq('user_id', userId)
        .maybeSingle()
      
      if (error && error.code !== 'PGRST116') throw error
      setUserVote(data)
    } catch (error) {
      console.error('Error loading vote:', error)
    }
  }

  async function loadPublicData() {
    try {
      const { data: scheduleData, error: scheduleError } = await supabase
        .from('event_schedule')
        .select('*')
        .order('display_order', { ascending: true })
      
      if (scheduleError) throw scheduleError
      setEventSchedule(scheduleData || [])

      const { data: carsData, error: carsError } = await supabase
        .from('cars')
        .select('*')
        .eq('is_best_car_nominee', true)
        .eq('status', 'accepted')
        .limit(3)
      
      if (carsError) throw carsError
      
      if (carsData) {
        const carsWithVotes = await Promise.all(
          carsData.map(async (car) => {
            const { count } = await supabase
              .from('votes')
              .select('*', { count: 'exact', head: true })
              .eq('car_id', car.id)
            return { ...car, voteCount: count || 0 }
          })
        )
        setBestCars(carsWithVotes)
      }

      const { data: sponsorsData, error: sponsorsError } = await supabase
        .from('sponsors')
        .select('*')
        .order('display_order', { ascending: true })
      
      if (sponsorsError) throw sponsorsError
      setSponsors(sponsorsData || [])

      setLoading(false)
    } catch (error) {
      console.error('Error loading public data:', error)
      setLoading(false)
    }
  }

  async function handleVote(carId) {
    if (!user) {
      toast.error('Trebuie să fii autentificat pentru a vota')
      return
    }

    if (userVote) {
      toast.error('Ai votat deja!')
      return
    }

    try {
      const { error } = await supabase
        .from('votes')
        .insert({ user_id: user.id, car_id: carId })
      
      if (error) throw error
      
      toast.success('Votul tău a fost înregistrat! 🎉')
      setUserVote({ car_id: carId })
      loadPublicData()
    } catch (error) {
      console.error('Error voting:', error)
      toast.error('Eroare la înregistrarea votului')
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    toast.success('Deconectat cu succes')
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/70 backdrop-blur-md border-b border-white/10">
        <div className="px-5 md:px-10 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span style={{ fontFamily: 'var(--font-orbitron)' }} className="text-xl md:text-2xl font-black tracking-wider">
                <span className="text-[#ec4899]">EXPO</span>
                <span className="text-white"> CAR </span>
                <span className="text-[#06b6d4]">MEETING</span>
              </span>
            </Link>
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  {(userProfile?.role === 'admin' || userProfile?.role === 'organizer') && (
                    <Link href="/dashboard">
                      <Button variant="outline" size="sm" className="border-cyan-400 text-cyan-400">
                        <LayoutDashboard className="w-4 h-4 mr-2" />Dashboard
                      </Button>
                    </Link>
                  )}
                  {userProfile?.role === 'user' && (
                    <Link href="/register-car">
                      <Button size="sm" className="bg-gradient-to-r from-pink-500 to-orange-500">
                        <Car className="w-4 h-4 mr-2" />Mașină
                      </Button>
                    </Link>
                  )}
                  <Button variant="ghost" size="sm" onClick={handleSignOut}>
                    <LogOut className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/auth/login">
                    <Button variant="outline" size="sm" className="border-cyan-400 text-cyan-400">
                      <LogIn className="w-4 h-4 mr-2" />Login
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button size="sm" className="bg-gradient-to-r from-pink-500 to-orange-500">
                      <UserPlus className="w-4 h-4 mr-2" />Register
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <section className="relative h-screen flex items-center justify-center pt-16">
        <div className="relative z-20 text-center px-5 md:px-10 max-w-5xl mx-auto">
          <p className="section-label mb-6">
            <MapPin className="inline w-3 h-3 mr-2" />FĂLTICENI • NADA FLORILOR — 2026
          </p>
          <h1 className="display-heading mb-6">
            UNDE <span className="italic-subtitle">PASIUNEA</span><br />
            &amp; PERFORMANȚA<br />
            SE ÎNTÂLNESC
          </h1>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href={user ? "/register-car" : "/auth/register"}>
              <Button size="lg" className="btn-neon px-8 py-6">ÎNSCRIERE ACUM</Button>
            </Link>
          </div>
        </div>
      </section>

      {bestCars.length > 0 && (
        <section className="relative z-10 py-16 px-5">
          <div className="max-w-5xl mx-auto">
            <p className="section-label text-center mb-8">BEST CAR OF THE SHOW</p>
            <h2 className="text-4xl font-black text-center mb-12 uppercase">
              VOTEAZĂ <span className="italic-subtitle">MAȘINA</span>
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {bestCars.map((car) => (
                <Card key={car.id} className="neon-card overflow-hidden">
                  <div className="relative h-48">
                    {car.images?.[0] ? (
                      <img src={car.images[0]} alt={car.make} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-pink-500/20 to-cyan-500/20 flex items-center justify-center">
                        <Car className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-6">
                    <h4 className="text-2xl font-bold mb-2">{car.make} {car.model}</h4>
                    {car.year && <p className="text-sm text-white/50 mb-4">An: {car.year}</p>}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-white/50">
                        <Trophy className="w-4 h-4 inline mr-1" />{car.voteCount} voturi
                      </span>
                      {userVote?.car_id === car.id && (
                        <Badge className="text-green-400 border-green-400">✓ Ai votat</Badge>
                      )}
                    </div>
                    <Button
                      onClick={() => handleVote(car.id)}
                      disabled={!user || userVote}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
                    >
                      {!user ? 'Autentifică-te' : userVote?.car_id === car.id ? 'Votul tău' : userVote ? 'Ai votat' : 'Votează'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {eventSchedule.length > 0 && (
        <section className="relative z-10 py-16 px-5">
          <div className="max-w-5xl mx-auto">
            <p className="section-label text-center mb-8">EVENIMENT</p>
            <h2 className="text-4xl font-black text-center mb-12 uppercase">
              <span className="italic-subtitle">PROGRAM</span> COMPLET
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {eventSchedule.map((item) => (
                <Card key={item.id} className="neon-card p-6">
                  <Badge className="text-cyan-400 border-cyan-400 mb-2">
                    {new Date(item.date).toLocaleDateString('ro-RO')} • {item.time}
                  </Badge>
                  <h4 className="text-xl font-bold mb-2">{item.title}</h4>
                  {item.description && <p className="text-sm text-white/60">{item.description}</p>}
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {sponsors.length > 0 && (
        <section className="relative z-10 py-16 px-5">
          <div className="max-w-5xl mx-auto">
            <p className="section-label text-center mb-8">PARTENERI</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {sponsors.map((sponsor) => (
                <a key={sponsor.id} href={sponsor.website_url} target="_blank" rel="noopener noreferrer">
                  <Card className="neon-card p-6 hover:border-orange-500/50">
                    <div className="flex flex-col items-center min-h-[120px] justify-center">
                      {sponsor.logo_url ? (
                        <img src={sponsor.logo_url} alt={sponsor.name} className="max-h-16 object-contain mb-3" />
                      ) : (
                        <div className="w-16 h-16 bg-gradient-to-br from-orange-500/20 to-yellow-500/20 rounded-full mb-3" />
                      )}
                      <p className="text-sm font-semibold text-center">{sponsor.name}</p>
                    </div>
                  </Card>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      <footer className="relative z-10 border-t border-white/10 py-8 text-center">
        <span style={{ fontFamily: 'var(--font-orbitron)' }} className="text-xl font-black block mb-4">
          <span className="text-[#ec4899]">EXPO</span>
          <span className="text-white"> CAR </span>
          <span className="text-[#06b6d4]">MEETING</span>
        </span>
        <p className="text-sm text-white/50">© 2026 Expo Car Meeting</p>
      </footer>
    </div>
  )
}
