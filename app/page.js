'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Car, Trophy, Users, Calendar, Clock, MapPin, ArrowRight, Infinity, MessageCircle } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import Image from 'next/image'

export default function HomePage() {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [eventSchedule, setEventSchedule] = useState([])
  const [bestCars, setBestCars] = useState([])
  const [sponsors, setSponsors] = useState([])
  const [userVote, setUserVote] = useState(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalCars: 0,
    acceptedCars: 0
  })

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
      // Load stats
      const { data: carsData } = await supabase
        .from('cars')
        .select('*')
      
      const acceptedCars = carsData?.filter(c => c.status === 'accepted') || []
      
      setStats({
        totalCars: carsData?.length || 0,
        acceptedCars: acceptedCars.length
      })

      // Load schedule
      const { data: scheduleData, error: scheduleError } = await supabase
        .from('event_schedule')
        .select('*')
        .order('display_order', { ascending: true })
      
      if (scheduleError) throw scheduleError
      setEventSchedule(scheduleData || [])

      // Load best cars
      const { data: bestCarsData, error: carsError } = await supabase
        .from('cars')
        .select('*')
        .eq('is_best_car_nominee', true)
        .eq('status', 'accepted')
        .limit(6)
      
      if (carsError) throw carsError
      setBestCars(bestCarsData || [])

      // Load sponsors
      const { data: sponsorsData, error: sponsorsError } = await supabase
        .from('sponsors')
        .select('*')
      
      if (sponsorsError) throw sponsorsError
      setSponsors(sponsorsData || [])

      setLoading(false)
    } catch (error) {
      console.error('Error loading data:', error)
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

      setUserVote({ car_id: carId })
      toast.success('Votul tău a fost înregistrat!')
    } catch (error) {
      console.error('Error voting:', error)
      toast.error('Eroare la votare')
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section cu video background */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Video */}
        <div className="absolute inset-0 z-0">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            className="w-full h-full object-cover opacity-50"
          >
            <source src="https://customer-assets.emergentagent.com/job_modernized-webapp/artifacts/7icrftaf_73629-YLUmeRy3zbBqbwnXsGogQbuspj05oZ.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-20 text-center px-5 md:px-10 max-w-5xl mx-auto pt-20">
          <p className="section-label mb-6 text-cyan-400">
            <MapPin className="inline w-3 h-3 mr-2" />FĂLTICENI • NADA FLORILOR — 2026
          </p>
          <h1 className="display-heading mb-8 text-5xl md:text-7xl lg:text-8xl leading-tight">
            UNDE <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400">PASIUNEA</span><br />
            & PERFORMANȚA<br />
            <span className="text-5xl md:text-6xl lg:text-7xl">SE ÎNTÂLNESC</span>
          </h1>
          <div className="flex flex-wrap gap-4 justify-center mt-8">
            <Link href={user ? "/register-car" : "/auth/register"}>
              <Button size="lg" className="btn-neon px-8 py-6 text-lg font-bold">ÎNSCRIERE ACUM</Button>
            </Link>
            <Link href="#best-cars">
              <Button size="lg" variant="outline" className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 px-8 py-6 text-lg font-bold">
                VEZI MAȘINILE <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Secțiune BEST CAR OF THE SHOW - Afișată DOAR când există nominalizați */}
      {bestCars.length > 0 && (
        <section className="py-20 px-5 md:px-10 relative z-10">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="text-center mb-16">
              <div className="inline-block mb-6">
                <Badge className="bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-600 text-black border-0 px-6 py-3 text-lg font-black uppercase tracking-wider">
                  <Trophy className="w-6 h-6 mr-2 inline" />
                  Nominalizați
                </Badge>
              </div>
              <h2 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 mb-6">
                BEST CAR
              </h2>
              <p className="text-4xl md:text-5xl font-black text-white mb-4">
                OF THE SHOW
              </p>
              <p className="text-gray-300 text-lg max-w-3xl mx-auto">
                Mașinile nominalizate pentru premiul suprem! Votează-ți favorita pentru a câștiga "Best Car of the Show 2026"
              </p>
            </div>

            {/* Grid Mașini Nominalizate */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {bestCars.map((car) => (
                <Card 
                  key={car.id} 
                  className="relative overflow-hidden group cursor-pointer"
                  onClick={() => {
                    // Scroll to voting section or open modal
                    const votingSection = document.getElementById('best-cars');
                    if (votingSection) {
                      votingSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  {/* Golden Glow Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/30 via-orange-500/30 to-yellow-600/30 backdrop-blur-sm"></div>
                  
                  {/* Golden Border Animation */}
                  <div className="absolute inset-0 border-4 border-transparent bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute inset-[4px] bg-black"></div>

                  {/* Content */}
                  <div className="relative z-10">
                    {/* Car Image */}
                    {car.images && car.images[0] ? (
                      <div className="aspect-video relative overflow-hidden">
                        <img 
                          src={car.images[0]} 
                          alt={`${car.make} ${car.model}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        {/* Golden Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-yellow-500/20 to-transparent"></div>
                        
                        {/* Trophy Badge */}
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black border-0 font-black">
                            <Trophy className="w-4 h-4 mr-1" />
                            NOMINEE
                          </Badge>
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-video bg-gradient-to-br from-yellow-900/50 to-orange-900/50 flex items-center justify-center">
                        <Trophy className="w-24 h-24 text-yellow-500/50" />
                      </div>
                    )}

                    <CardContent className="p-6 bg-gradient-to-br from-yellow-500/10 to-orange-500/10">
                      <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-2">
                        {car.make} {car.model}
                      </h3>
                      {car.year && (
                        <Badge variant="outline" className="border-yellow-500 text-yellow-500 mb-3">
                          {car.year}
                        </Badge>
                      )}
                      <p className="text-gray-300 text-sm line-clamp-2 mb-4">
                        {car.description || 'Nominalizat pentru Best Car of the Show'}
                      </p>
                      
                      {/* Voting Info */}
                      <div className="flex items-center justify-between">
                        {user && !userVote ? (
                          <Button 
                            onClick={(e) => {
                              e.stopPropagation()
                              handleVote(car.id)
                            }}
                            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-black"
                            size="sm"
                          >
                            <Trophy className="w-4 h-4 mr-2" />
                            VOTEAZĂ
                          </Button>
                        ) : userVote?.car_id === car.id ? (
                          <Badge className="w-full justify-center bg-green-500/20 text-green-400 border-green-400 font-bold">
                            ✓ Votat
                          </Badge>
                        ) : !user ? (
                          <Link href="/auth/login" className="w-full">
                            <Button variant="outline" size="sm" className="w-full border-yellow-500 text-yellow-500 hover:bg-yellow-500/10">
                              Conectează-te pentru a vota
                            </Button>
                          </Link>
                        ) : null}
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>

            {/* CTA Bottom */}
            <div className="text-center mt-12">
              <Link href={user ? "/register-car" : "/auth/register"}>
                <Button size="lg" className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-black px-8 py-6">
                  <Car className="w-5 h-5 mr-2" />
                  ÎNSCRIE MAȘINA TA
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Secțiune Statistici */}
      <section className="py-20 px-5 md:px-10 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-4">
            <span className="deco-symbol">✦ ✦ ✦</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {/* Coloana 1: Mașini */}
            <div className="text-center space-y-4 border-accent-right">
              <div className="space-y-2">
                <div className="text-7xl md:text-8xl font-black text-white">
                  {stats.totalCars}+
                </div>
                <div className="text-sm md:text-base uppercase tracking-wider text-gray-400 font-semibold">
                  Mașini Înscrise
                </div>
              </div>
              <div className="space-y-1 pt-4 border-t border-white/10">
                <div className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 text-sm uppercase tracking-wide font-bold">
                  Build-uri confirmate
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm uppercase tracking-wider text-gray-500">
                  Mașini Acceptate
                </div>
              </div>
            </div>

            {/* Coloana 2: Pasionați */}
            <div className="text-center space-y-4">
              <div className="space-y-2">
                <div className="text-7xl md:text-8xl font-black text-white flex items-center justify-center">
                  <Infinity className="w-24 h-24 md:w-32 md:h-32" />
                </div>
                <div className="text-sm md:text-base uppercase tracking-wider text-gray-400 font-semibold">
                  Pasionați
                </div>
              </div>
            </div>

            {/* Coloana 3: Zile */}
            <div className="text-center space-y-4 border-accent-left">
              <div className="space-y-2">
                <div className="text-7xl md:text-8xl font-black text-white">
                  2
                </div>
                <div className="text-sm md:text-base uppercase tracking-wider text-gray-400 font-semibold">
                  Zile Pline
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Secțiune Despre Eveniment */}
      <section className="py-20 px-5 md:px-10 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="section-label mb-4 text-cyan-400">Despre Eveniment</p>
            <span className="deco-symbol">✦ ✦ ✦</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
            {/* Coloana 1: Show Auto */}
            <div className="space-y-6">
              <div>
                <h2 className="text-5xl md:text-6xl font-black text-white mb-2">
                  SHOW AUTO
                </h2>
                <p className="text-2xl md:text-3xl font-bold italic text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">
                  & Concursuri
                </p>
              </div>
              <p className="text-gray-300 text-lg leading-relaxed">
                Un eveniment cu totul special, unde estetica auto întâlnește pasiunea. Te așteaptă două zile de o frumusețe aparte, premii pe măsură și o atmosferă de top pe care nu vrei să o ratezi!
              </p>
            </div>

            {/* Coloana 2: Comunitate */}
            <div className="space-y-6">
              <div>
                <h2 className="text-5xl md:text-6xl font-black text-white mb-2">
                  COMUNITATE
                </h2>
                <p className="text-2xl md:text-3xl font-bold italic text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">
                  & Pasiune
                </p>
              </div>
              <p className="text-gray-300 text-lg leading-relaxed">
                Locul unde pasionații auto se întâlnesc, schimbă experiențe și creează amintiri. Intră în comunitate și înscrie-ți mașina.
              </p>
              <a 
                href="https://chat.whatsapp.com/Ihk01gdppgY7bXkbfXLZ53" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block"
              >
                <Button 
                  size="lg" 
                  className="bg-[#25D366] hover:bg-[#20BA5A] text-white font-bold px-8 py-6 rounded-full"
                >
                  <MessageCircle className="mr-2 w-5 h-5" />
                  GRUP WHATSAPP
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Secțiune Galerie & Mașini */}
      <section id="best-cars" className="py-20 px-5 md:px-10 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="section-label mb-4 text-cyan-400">Galerie & Mașini</p>
            <h2 className="text-5xl md:text-7xl font-black text-white mb-4">
              TOATE
            </h2>
            <p className="text-3xl md:text-4xl font-bold italic text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 mb-6">
              Mașinile
            </p>
            <p className="text-gray-300 text-lg max-w-3xl mx-auto mb-8">
              Descoperă toate mașinile confirmate pentru eveniment. Vezi galeria completă cu build-urile care vor fi prezente la Nada Florilor în 6–7 Iunie 2026.
            </p>
            <Link href="/masini">
              <Button variant="outline" size="lg" className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 font-bold">
                VEZI TOATE MAȘINILE <ArrowRight className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Secțiune Program */}
      <section className="py-20 px-5 md:px-10 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="section-label mb-4 text-cyan-400">Eveniment</p>
            <h2 className="text-5xl md:text-7xl font-black text-white mb-4">
              PROGRAM
            </h2>
            <p className="text-3xl md:text-4xl font-bold italic text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 mb-6">
              Complet
            </p>
            <p className="text-gray-300 text-lg max-w-3xl mx-auto">
              Vezi toate activitățile planificate pentru cele 2 zile de eveniment — orele exacte, detalii și tot ce trebuie să știi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 border-pink-500/30 backdrop-blur-xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="w-8 h-8 text-pink-400" />
                <div>
                  <p className="text-sm text-gray-400 uppercase tracking-wide">Data</p>
                  <p className="text-2xl font-bold text-white">6–7 Iunie 2026</p>
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/30 backdrop-blur-xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-8 h-8 text-cyan-400" />
                <div>
                  <p className="text-sm text-gray-400 uppercase tracking-wide">Program</p>
                  {eventSchedule.length > 0 ? (
                    <Link href="/program">
                      <Button variant="link" className="text-2xl font-bold text-white hover:text-cyan-400 p-0 h-auto">
                        Vezi Program <ArrowRight className="inline ml-2 w-6 h-6" />
                      </Button>
                    </Link>
                  ) : (
                    <p className="text-2xl font-bold text-white">În Curând</p>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {eventSchedule.length > 0 && eventSchedule.length <= 3 && (
            <div className="mt-12 space-y-4 max-w-4xl mx-auto">
              {eventSchedule.map((item) => (
                <Card key={item.id} className="bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 backdrop-blur-xl p-6 hover:border-cyan-400/50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-400">
                        {new Date(item.date).toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' })}
                      </Badge>
                    </div>
                    <div className="flex-grow">
                      <h4 className="text-lg font-bold text-white mb-1">{item.title}</h4>
                      <p className="text-gray-400 text-sm">{item.description}</p>
                      {item.time && (
                        <p className="text-cyan-400 text-sm mt-2">
                          <Clock className="inline w-4 h-4 mr-1" />
                          {item.time}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
              
              <div className="text-center mt-8">
                <Link href="/program">
                  <Button variant="outline" size="lg" className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 font-bold">
                    VEZI PROGRAMUL COMPLET <ArrowRight className="ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Secțiune Partener Oficial - AUTO MINGIUC */}
      <section className="py-20 px-5 md:px-10 relative z-10 border-b border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="section-label mb-4 text-cyan-400 uppercase tracking-widest">Partener Oficial</p>
          </div>

          <div className="flex flex-col items-center">
            <a 
              href="https://tractarifalticeni.ro"
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <div className="relative w-64 h-64 mx-auto mb-6 transition-transform duration-300 group-hover:scale-110">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 rounded-full blur-3xl"></div>
                <img 
                  src="https://expocarmeeting.ro/images/auto-mingiuc-official.png"
                  alt="Auto Mingiuc"
                  className="relative w-full h-full object-contain"
                />
              </div>
              <h3 className="text-4xl md:text-5xl font-black text-white uppercase tracking-wider text-center group-hover:text-orange-400 transition-colors">
                AUTO MINGIUC
              </h3>
            </a>
            <p className="text-gray-400 text-center mt-4">
              Partener oficial al Expo Car Meeting 2026
            </p>
          </div>
        </div>
      </section>

      {/* Secțiune Sponsori */}
      {sponsors.length > 0 && (
        <section className="py-20 px-5 md:px-10 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-5xl md:text-7xl font-black text-white mb-4">
                SPONSORII
              </h2>
              <p className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 mb-6">
                Noștri
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {sponsors.map((sponsor) => (
                <a
                  key={sponsor.id}
                  href={sponsor.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group"
                >
                  <Card className="bg-gradient-to-br from-white/10 to-white/5 border-white/20 backdrop-blur-xl p-6 hover:scale-105 transition-all duration-300 hover:border-cyan-400/50">
                    {sponsor.logo_url && (
                      <div className="relative w-full aspect-square mb-4">
                        <img 
                          src={sponsor.logo_url}
                          alt={sponsor.name}
                          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <h3 className="text-xl font-bold text-white text-center group-hover:text-cyan-400 transition-colors">
                      {sponsor.name}
                    </h3>
                  </Card>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Secțiune Devii Sponsor */}
      <section className="py-20 px-5 md:px-10 relative z-10 border-t border-white/10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-12">
            <h3 className="text-4xl md:text-5xl font-black text-white mb-6">
              Vrei să devii <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">SPONSOR?</span>
            </h3>
            <p className="text-gray-300 text-lg mb-8">
              Alătură-te evenimentului și crește vizibilitatea brandului tău în comunitatea auto!
            </p>
            <Link href="/devii-sponsor">
              <Button size="lg" className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold px-8 py-6 text-lg">
                CONTACTEAZĂ-NE
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
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
