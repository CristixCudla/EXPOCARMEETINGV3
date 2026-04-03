'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  Clock, 
  Car, 
  Trophy, 
  Users, 
  Ticket,
  LogIn,
  UserPlus,
  LogOut,
  LayoutDashboard,
  Mail,
  ExternalLink,
  Sparkles,
  MapPin
} from 'lucide-react'
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
    // Check initial auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadUserProfile(session.user.id)
        loadUserVote(session.user.id)
      }
    })

    // Listen for auth changes
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
      // Load event schedule
      const { data: scheduleData, error: scheduleError } = await supabase
        .from('event_schedule')
        .select('*')
        .order('display_order', { ascending: true })
      
      if (scheduleError) throw scheduleError
      setEventSchedule(scheduleData || [])

      // Load best car nominees
      const { data: carsData, error: carsError } = await supabase
        .from('cars')
        .select('*')
        .eq('is_best_car_nominee', true)
        .eq('status', 'accepted')
        .limit(3)
      
      if (carsError) throw carsError
      
      // Get vote counts for each car
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

      // Load sponsors
      const { data: sponsorsData, error: sponsorsError } = await supabase
        .from('sponsors')
        .select('*')
        .order('display_order', { ascending: true })
      
      if (sponsorsError) throw sponsorsError
      setSponsors(sponsorsData || [])

      setLoading(false)
    } catch (error) {
      console.error('Error loading public data:', error)
      toast.error('Eroare la încărcarea datelor')
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
      loadPublicData() // Reload to update vote counts
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
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e] relative overflow-hidden">
      {/* Animated background particles */}
      <div className="particle-bg">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="relative">
                <motion.div
                  animate={{
                    scale: [1, 1.05, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                  className="glow-box rounded-full p-2 bg-gradient-to-br from-cyan-500 to-pink-500"
                >
                  <Car className="w-6 h-6 text-white" />
                </motion.div>
              </div>
              <div>
                <h1 className="text-2xl font-bold gradient-text glow">
                  EXPO CAR MEETING
                </h1>
                <p className="text-xs text-cyan-400">Fălticeni • 2026</p>
              </div>
            </motion.div>

            <div className="flex items-center gap-3">
              {user ? (
                <>
                  {userProfile && (
                    <Badge variant="outline" className="text-cyan-400 border-cyan-400">
                      <Users className="w-3 h-3 mr-1" />
                      {userProfile.role === 'admin' ? 'Admin' : userProfile.role === 'organizer' ? 'Organizator' : 'User'}
                    </Badge>
                  )}
                  {(userProfile?.role === 'admin' || userProfile?.role === 'organizer') && (
                    <Link href="/dashboard">
                      <Button variant="outline" size="sm" className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10">
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        Dashboard
                      </Button>
                    </Link>
                  )}
                  {userProfile?.role === 'user' && (
                    <Link href="/register-car">
                      <Button size="sm" className="bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600">
                        <Car className="w-4 h-4 mr-2" />
                        Înregistrează Mașina
                      </Button>
                    </Link>
                  )}
                  <Button variant="outline" size="sm" onClick={handleSignOut}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Ieșire
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/auth/login">
                    <Button variant="outline" size="sm" className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10">
                      <LogIn className="w-4 h-4 mr-2" />
                      Conectare
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button size="sm" className="bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Înregistrare
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 py-20 overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              animate={{
                scale: [1, 1.02, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              <h2 className="text-sm md:text-base text-cyan-400 font-semibold mb-4 tracking-widest uppercase">
                FĂLTICENI • NADA FLORILOR — 2026
              </h2>
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="text-white">UNDE </span>
              <span className="gradient-text glow">PASIUNEA</span>
              <br />
              <span className="text-pink-400">&amp; PERFORMANȚA</span>
              <br />
              <span className="text-white">SE ÎNTÂLNESC</span>
            </h1>

            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Un eveniment cu totul special, unde estetica auto întâlnește pasiunea. Te așteaptă două zile de o 
              frumusețe aparte, premii pe măsură și o atmosferă de top pe care nu vrei să o ratezi!
            </p>

            <div className="flex flex-wrap gap-4 justify-center mb-12">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href={user ? "/register-car" : "/auth/register"}>
                  <Button size="lg" className="bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white font-bold px-8 py-6 text-lg">
                    <Sparkles className="w-5 h-5 mr-2" />
                    ÎNSCRIERE ACUM
                  </Button>
                </Link>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button size="lg" variant="outline" className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 font-bold px-8 py-6 text-lg">
                  <Car className="w-5 h-5 mr-2" />
                  VEZI MAȘINILE →
                </Button>
              </motion.div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              {[
                { label: 'MAȘINI ÎNSCRISE', value: '0+', sublabel: 'Build-uri confirmate' },
                { label: 'MAȘINI ACCEPTATE', value: '∞', sublabel: '' },
                { label: 'PASIONAȚI', value: '∞', sublabel: '' },
                { label: 'ZILE PLINE', value: '2', sublabel: '' },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:border-cyan-400/50 transition-all"
                >
                  <div className="text-3xl font-bold gradient-text">{stat.value}</div>
                  <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
                  {stat.sublabel && (
                    <div className="text-[10px] text-pink-400 mt-1">{stat.sublabel}</div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Event Schedule */}
      <section className="relative z-10 py-16 bg-black/20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-sm text-cyan-400 font-semibold mb-3 tracking-widest uppercase">
              EVENIMENT
            </h2>
            <h3 className="text-4xl md:text-5xl font-bold gradient-text mb-4">
              PROGRAM COMPLET
            </h3>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Vezi toate activitățile planificate pentru cele 2 zile de eveniment — orele exacte, detalii și tot ce trebuie să știi.
            </p>
          </motion.div>

          {loading ? (
            <div className="text-center text-gray-400">Se încarcă...</div>
          ) : eventSchedule.length === 0 ? (
            <div className="text-center">
              <Card className="bg-white/5 border-white/10 max-w-md mx-auto">
                <CardContent className="p-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">Programul va fi disponibil în curând</p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {eventSchedule.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-gradient-to-br from-white/5 to-white/0 border-white/10 hover:border-cyan-400/50 transition-all group">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="bg-gradient-to-br from-cyan-500/20 to-pink-500/20 rounded-xl p-3 group-hover:scale-110 transition-transform">
                          <Calendar className="w-6 h-6 text-cyan-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge variant="outline" className="text-cyan-400 border-cyan-400">
                              {new Date(item.date).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long' })}
                            </Badge>
                            <div className="flex items-center text-sm text-gray-400">
                              <Clock className="w-4 h-4 mr-1" />
                              {item.time}
                            </div>
                          </div>
                          <h4 className="text-xl font-bold text-white mb-2">{item.title}</h4>
                          {item.description && (
                            <p className="text-sm text-gray-400">{item.description}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Best Car of the Show */}
      <section className="relative z-10 py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-2 mb-3">
              <Trophy className="w-6 h-6 text-yellow-400" />
              <h2 className="text-sm text-yellow-400 font-semibold tracking-widest uppercase">
                COMUNITATE &amp; PASIUNE
              </h2>
            </div>
            <h3 className="text-4xl md:text-5xl font-bold gradient-text mb-4">
              SHOW AUTO
            </h3>
            <p className="text-gray-400 max-w-2xl mx-auto mb-6">
              Locul unde pasionații auto se întâlnesc, schimbă experiențe și creează amintiri. Intră în comunitate și înscrie-ți mașina.
            </p>
            
            {user && userProfile?.role === 'user' && (
              <div className="flex justify-center gap-4">
                <Link href="/register-car">
                  <Button className="bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600">
                    <Car className="w-4 h-4 mr-2" />
                    Înregistrează-ți Mașina
                  </Button>
                </Link>
                <Link href="/tickets">
                  <Button variant="outline" className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10">
                    <Ticket className="w-4 h-4 mr-2" />
                    Support Tickets
                  </Button>
                </Link>
              </div>
            )}
          </motion.div>

          {loading ? (
            <div className="text-center text-gray-400">Se încarcă...</div>
          ) : bestCars.length === 0 ? (
            <div className="text-center">
              <Card className="bg-white/5 border-white/10 max-w-md mx-auto">
                <CardContent className="p-8">
                  <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">Mașinile pentru votare vor fi anunțate în curând</p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-8">
                {bestCars.map((car, index) => (
                  <motion.div
                    key={car.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.2 }}
                    whileHover={{ y: -10 }}
                  >
                    <Card className="bg-gradient-to-br from-white/5 to-white/0 border-white/10 hover:border-pink-400/50 transition-all overflow-hidden group">
                      <div className="relative h-48 overflow-hidden">
                        {car.images && car.images.length > 0 ? (
                          <img 
                            src={car.images[0]} 
                            alt={`${car.make} ${car.model}`}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-pink-500/20 to-cyan-500/20 flex items-center justify-center">
                            <Car className="w-16 h-16 text-gray-400" />
                          </div>
                        )}
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-gradient-to-r from-pink-500 to-orange-500 text-white border-0">
                            <Trophy className="w-3 h-3 mr-1" />
                            Nominalizat
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="p-6">
                        <h4 className="text-2xl font-bold text-white mb-2">
                          {car.make} {car.model}
                        </h4>
                        {car.year && (
                          <p className="text-sm text-gray-400 mb-2">An: {car.year}</p>
                        )}
                        {car.description && (
                          <p className="text-sm text-gray-300 mb-4 line-clamp-2">{car.description}</p>
                        )}
                        
                        <div className="flex items-center justify-between mb-4">
                          <div className="text-sm text-gray-400">
                            {car.voteCount} {car.voteCount === 1 ? 'vot' : 'voturi'}
                          </div>
                          {userVote && userVote.car_id === car.id && (
                            <Badge variant="outline" className="text-green-400 border-green-400">
                              ✓ Ai votat
                            </Badge>
                          )}
                        </div>

                        <Button
                          onClick={() => handleVote(car.id)}
                          disabled={!user || userVote !== null}
                          className={`w-full ${
                            userVote && userVote.car_id === car.id
                              ? 'bg-green-500 hover:bg-green-600'
                              : 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600'
                          }`}
                        >
                          {!user ? (
                            <>
                              <LogIn className="w-4 h-4 mr-2" />
                              Autentifică-te pentru a vota
                            </>
                          ) : userVote && userVote.car_id === car.id ? (
                            <>
                              <Trophy className="w-4 h-4 mr-2" />
                              Votul tău
                            </>
                          ) : userVote ? (
                            'Ai votat deja'
                          ) : (
                            <>
                              <Trophy className="w-4 h-4 mr-2" />
                              Votează
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {!user && (
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <Card className="bg-gradient-to-r from-cyan-500/10 to-pink-500/10 border-cyan-400/30 max-w-md mx-auto">
                    <CardContent className="p-6">
                      <p className="text-white mb-4">
                        Autentifică-te pentru a vota pentru mașina ta preferată!
                      </p>
                      <Link href="/auth/login">
                        <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600">
                          <LogIn className="w-4 h-4 mr-2" />
                          Conectare
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Sponsors */}
      {sponsors.length > 0 && (
        <section className="relative z-10 py-16 bg-black/20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-sm text-cyan-400 font-semibold mb-3 tracking-widest uppercase">
                PARTENER OFICIAL
              </h2>
              <h3 className="text-4xl md:text-5xl font-bold gradient-text mb-4">
                Sponsori
              </h3>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
              {sponsors.map((sponsor, index) => (
                <motion.a
                  key={sponsor.id}
                  href={sponsor.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="block"
                >
                  <Card className="bg-white/5 border-white/10 hover:border-cyan-400/50 transition-all overflow-hidden group">
                    <CardContent className="p-6 flex flex-col items-center justify-center h-full min-h-[150px]">
                      {sponsor.logo_url ? (
                        <img 
                          src={sponsor.logo_url} 
                          alt={sponsor.name}
                          className="max-w-full max-h-20 object-contain mb-3 group-hover:scale-110 transition-transform"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gradient-to-br from-cyan-500/20 to-pink-500/20 rounded-full flex items-center justify-center mb-3">
                          <ExternalLink className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      <p className="text-sm font-semibold text-white text-center">{sponsor.name}</p>
                      {sponsor.website_url && (
                        <p className="text-xs text-cyan-400 mt-1 flex items-center gap-1">
                          <ExternalLink className="w-3 h-3" />
                          Website
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </motion.a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-black/40 backdrop-blur-xl py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="glow-box rounded-full p-2 bg-gradient-to-br from-cyan-500 to-pink-500">
                <Car className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold gradient-text">EXPO CAR MEETING</h3>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mb-2">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span>Stadionul Nada Florilor, Fălticeni</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mb-4">
              <Calendar className="w-4 h-4 text-pink-400" />
              <span>6-7 Iunie 2026</span>
            </div>
            <p className="text-sm text-gray-500">
              © 2026 Expo Car Meeting. Toate drepturile rezervate.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
