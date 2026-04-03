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
    <div className=\"min-h-screen bg-black text-white\">
      {/* NAVIGATION */}
      <nav className=\"fixed top-0 left-0 right-0 z-50 bg-black/70 backdrop-blur-md border-b border-white/10\">
        <div className=\"px-5 md:px-10 py-4\">
          <div className=\"flex items-center justify-between\">
            <Link href=\"/\" className=\"flex items-center gap-2\">
              <span style={{ fontFamily: 'var(--font-orbitron)' }} className=\"text-xl md:text-2xl font-black tracking-wider whitespace-nowrap\">
                <span className=\"text-[#ec4899] drop-shadow-[0_0_12px_rgba(236,72,153,0.9)] animate-pulse\">EXPO</span>
                <span className=\"text-white\"> CAR </span>
                <span className=\"text-[#06b6d4] drop-shadow-[0_0_12px_rgba(6,182,212,0.9)]\">MEETING</span>
              </span>
            </Link>

            <div className=\"flex items-center gap-3\">
              {user ? (
                <>
                  {userProfile && (
                    <Badge variant=\"outline\" className=\"text-cyan-400 border-cyan-400 hidden md:flex\">
                      <Users className=\"w-3 h-3 mr-1\" />
                      {userProfile.role === 'admin' ? 'Admin' : userProfile.role === 'organizer' ? 'Organizator' : 'User'}
                    </Badge>
                  )}
                  {(userProfile?.role === 'admin' || userProfile?.role === 'organizer') && (
                    <Link href=\"/dashboard\">
                      <Button variant=\"outline\" size=\"sm\" className=\"border-cyan-400 text-cyan-400 hover:bg-cyan-400/10\">
                        <LayoutDashboard className=\"w-4 h-4 mr-2\" />
                        Dashboard
                      </Button>
                    </Link>
                  )}
                  {userProfile?.role === 'user' && (
                    <Link href=\"/register-car\">
                      <Button size=\"sm\" className=\"bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600\">
                        <Car className=\"w-4 h-4 mr-2\" />
                        <span className=\"hidden md:inline\">Înregistrează Mașina</span>
                        <span className=\"md:hidden\">Mașină</span>
                      </Button>
                    </Link>
                  )}
                  <Button variant=\"ghost\" size=\"sm\" onClick={handleSignOut} className=\"text-white/70 hover:text-white\">
                    <LogOut className=\"w-4 h-4\" />
                  </Button>
                </>
              ) : (
                <>
                  <Link href=\"/auth/login\">
                    <Button variant=\"outline\" size=\"sm\" className=\"border-cyan-400 text-cyan-400 hover:bg-cyan-400/10\">
                      <LogIn className=\"w-4 h-4 mr-2\" />
                      <span className=\"hidden md:inline\">Conectare</span>
                    </Button>
                  </Link>
                  <Link href=\"/auth/register\">
                    <Button size=\"sm\" className=\"bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600\">
                      <UserPlus className=\"w-4 h-4 mr-2\" />
                      <span className=\"hidden md:inline\">Înregistrare</span>
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className=\"relative h-screen flex items-center justify-center overflow-hidden\">
        <div className=\"absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/85 z-10\"></div>
        
        <div className=\"relative z-20 text-center px-5 md:px-10 max-w-5xl mx-auto\">
          <p className=\"section-label mb-6 tracking-widest\">
            <MapPin className=\"inline w-3 h-3 mr-2\" />
            FĂLTICENI • NADA FLORILOR — 2026
          </p>

          <h1 className=\"display-heading mb-6\">
            UNDE <span className=\"italic-subtitle\">PASIUNEA</span>
            <br />
            &amp; PERFORMANȚA
            <br />
            SE ÎNTÂLNESC
          </h1>

          <p className=\"text-lg md:text-xl text-white/60 mb-10 max-w-2xl mx-auto font-light\">
            Un eveniment cu totul special, unde estetica auto întâlnește pasiunea. Te așteaptă două zile de o 
            frumusețe aparte, premii pe măsură și o atmosferă de top pe care nu vrei să o ratezi!
          </p>

          <div className=\"flex flex-wrap gap-4 justify-center\">
            <Link href={user ? \"/register-car\" : \"/auth/register\"}>
              <Button size=\"lg\" className=\"btn-neon px-8 py-6 text-base\">
                ÎNSCRIERE ACUM
              </Button>
            </Link>
            
            <Link href=\"/cars\">
              <Button size=\"lg\" variant=\"outline\" className=\"border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 px-8 py-6 text-base\">
                <Car className=\"w-5 h-5 mr-2\" />
                VEZI MAȘINILE →
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className=\"relative z-10 py-16 md:py-24 px-5 md:px-10\">
        <div className=\"max-w-5xl mx-auto\">
          <div className=\"text-center mb-8\">
            <div className=\"deco-symbol mb-4\">✦ ✦ ✦</div>
          </div>

          <div className=\"grid md:grid-cols-3 gap-8 md:gap-12\">
            <div className=\"text-center border-accent-left\">
              <div className=\"stat-number text-5xl md:text-6xl mb-2\">0+</div>
              <div className=\"text-white/50 text-sm tracking-wider uppercase\">Mașini Înscrise</div>
              <div className=\"text-[#ec4899] text-xs mt-1\">Build-uri confirmate</div>
            </div>

            <div className=\"text-center\">
              <div className=\"stat-number text-5xl md:text-6xl mb-2\">∞</div>
              <div className=\"text-white/50 text-sm tracking-wider uppercase\">Mașini Acceptate</div>
            </div>

            <div className=\"text-center border-accent-right\">
              <div className=\"stat-number text-5xl md:text-6xl mb-2\">2</div>
              <div className=\"text-white/50 text-sm tracking-wider uppercase\">Zile Pline</div>
            </div>
          </div>

          <div className=\"divider-curve mt-12\"></div>
        </div>
      </section>

      {/* DESPRE EVENIMENT */}
      <section className=\"relative z-10 py-16 md:py-24 px-5 md:px-10\">
        <div className=\"max-w-5xl mx-auto\">
          <p className=\"section-label text-center mb-8\">DESPRE EVENIMENT</p>
          
          <div className=\"deco-symbol text-center mb-12\">✦ ✦ ✦</div>

          <div className=\"grid md:grid-cols-2 gap-8 md:gap-12\">
            <div className=\"border-accent-left\">
              <h3 className=\"text-3xl font-black mb-4 uppercase tracking-tight\">SHOW AUTO</h3>
              <p className=\"italic-subtitle text-2xl mb-4\">&amp; Concursuri</p>
              <p className=\"text-white/60 leading-relaxed\">
                Un eveniment cu totul special, unde estetica auto întâlnește pasiunea. Te așteaptă două zile de o 
                frumusețe aparte, premii pe măsură și o atmosferă de top pe care nu vrei să o ratezi!
              </p>
            </div>

            <div className=\"border-accent-right\">
              <h3 className=\"text-3xl font-black mb-4 uppercase tracking-tight\">COMUNITATE</h3>
              <p className=\"italic-subtitle text-2xl mb-4\">&amp; Pasiune</p>
              <p className=\"text-white/60 leading-relaxed mb-4\">
                Locul unde pasionații auto se întâlnesc, schimbă experiențe și creează amintiri. Intră în comunitate și 
                înscrie-ți mașina.
              </p>
              <a 
                href=\"https://chat.whatsapp.com/your-group-link\" 
                target=\"_blank\" 
                rel=\"noopener noreferrer\"
                className=\"inline-flex items-center gap-2 text-[#25d366] hover:text-[#20ba5a] transition-colors\"
              >
                <svg className=\"w-5 h-5\" fill=\"currentColor\" viewBox=\"0 0 24 24\">
                  <path d=\"M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z\"/>
                </svg>
                <span className=\"font-bold tracking-wide\">GRUP WHATSAPP</span>
              </a>
            </div>
          </div>

          <div className=\"divider-curve mt-12\"></div>
        </div>
      </section>

      {/* BEST CAR VOTING */}
      {bestCars.length > 0 && (
        <section className=\"relative z-10 py-16 md:py-24 px-5 md:px-10\">
          <div className=\"border-t neon-separator mb-12\"></div>
          
          <div className=\"max-w-5xl mx-auto\">
            <p className=\"section-label text-center mb-8\">BEST CAR OF THE SHOW</p>
            
            <h2 className=\"text-4xl md:text-6xl font-black text-center mb-4 uppercase tracking-tight\">
              VOTEAZĂ MAȘINA
              <br />
              <span className=\"italic-subtitle\">PREFERATĂ</span>
            </h2>

            <div className=\"grid md:grid-cols-3 gap-8 mt-12\">
              {bestCars.map((car, index) => (
                <Card key={car.id} className=\"neon-card overflow-hidden group hover:border-[#a855f7]/50 transition-all\">
                  <div className=\"relative h-48 overflow-hidden\">
                    {car.images && car.images.length > 0 ? (
                      <img 
                        src={car.images[0]} 
                        alt={`${car.make} ${car.model}`}
                        className=\"w-full h-full object-cover group-hover:scale-110 transition-transform duration-500\"
                      />
                    ) : (
                      <div className=\"w-full h-full bg-gradient-to-br from-pink-500/20 to-cyan-500/20 flex items-center justify-center\">
                        <Car className=\"w-16 h-16 text-gray-400\" />
                      </div>
                    )}
                  </div>
                  <CardContent className=\"p-6\">
                    <h4 className=\"text-2xl font-bold text-white mb-2\">
                      {car.make} {car.model}
                    </h4>
                    {car.year && (
                      <p className=\"text-sm text-white/50 mb-2\">An: {car.year}</p>
                    )}
                    {car.description && (
                      <p className=\"text-sm text-white/60 mb-4 line-clamp-2\">{car.description}</p>
                    )}
                    
                    <div className=\"flex items-center justify-between mb-4\">
                      <div className=\"text-sm text-white/50\">
                        <Trophy className=\"w-4 h-4 inline mr-1\" />
                        {car.voteCount} {car.voteCount === 1 ? 'vot' : 'voturi'}
                      </div>
                      {userVote && userVote.car_id === car.id && (
                        <Badge variant=\"outline\" className=\"text-green-400 border-green-400 text-xs\">
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
                          : 'bg-gradient-to-r from-[#a855f7] to-[#ec4899] hover:from-[#a855f7]/90 hover:to-[#ec4899]/90'
                      }`}
                    >
                      {!user ? (
                        <>
                          <LogIn className=\"w-4 h-4 mr-2\" />
                          Autentifică-te
                        </>
                      ) : userVote && userVote.car_id === car.id ? (
                        <>
                          <Trophy className=\"w-4 h-4 mr-2\" />
                          Votul tău
                        </>
                      ) : userVote ? (
                        'Ai votat deja'
                      ) : (
                        <>
                          <Trophy className=\"w-4 h-4 mr-2\" />
                          Votează
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* PROGRAM EVENIMENT */}
      {eventSchedule.length > 0 && (
        <section className=\"relative z-10 py-16 md:py-24 px-5 md:px-10\">
          <div className=\"border-t neon-separator mb-12\"></div>
          
          <div className=\"max-w-5xl mx-auto\">
            <p className=\"section-label text-center mb-8\">EVENIMENT</p>
            
            <h2 className=\"text-4xl md:text-6xl font-black text-center mb-4 uppercase tracking-tight animate-pulse\">
              PROGRAM
              <br />
              <span className=\"italic-subtitle\">Complet</span>
            </h2>

            <p className=\"text-center text-white/60 mb-12 max-w-2xl mx-auto\">
              Vezi toate activitățile planificate pentru cele 2 zile de eveniment — orele exacte, detalii și tot ce trebuie să știi.
            </p>

            <div className=\"grid md:grid-cols-2 gap-6\">
              {eventSchedule.map((item, index) => (
                <Card key={item.id} className=\"neon-card p-6\">
                  <div className=\"flex items-start gap-4\">
                    <div className=\"bg-gradient-to-br from-cyan-500/20 to-pink-500/20 rounded-xl p-3\">
                      <Calendar className=\"w-6 h-6 text-cyan-400\" />
                    </div>
                    <div className=\"flex-1\">
                      <div className=\"flex flex-wrap items-center gap-3 mb-2\">
                        <Badge variant=\"outline\" className=\"text-cyan-400 border-cyan-400 text-xs\">
                          {new Date(item.date).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long' })}
                        </Badge>
                        <div className=\"flex items-center text-sm text-white/50\">
                          <Clock className=\"w-4 h-4 mr-1\" />
                          {item.time}
                        </div>
                      </div>
                      <h4 className=\"text-xl font-bold text-white mb-2\">{item.title}</h4>
                      {item.description && (
                        <p className=\"text-sm text-white/60\">{item.description}</p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SPONSORS */}
      {sponsors.length > 0 && (
        <section className=\"relative z-10 py-16 md:py-24 px-5 md:px-10\">
          <div className=\"border-t neon-separator mb-12\"></div>
          
          <div className=\"max-w-5xl mx-auto\">
            <p className=\"section-label text-center mb-8\">PARTENER OFICIAL</p>
            
            <div className=\"grid grid-cols-2 md:grid-cols-4 gap-8\">
              {sponsors.map((sponsor) => (
                <a
                  key={sponsor.id}
                  href={sponsor.website_url}
                  target=\"_blank\"
                  rel=\"noopener noreferrer\"
                  className=\"block\"
                >
                  <Card className=\"neon-card p-6 hover:border-[#f97316]/50 transition-all group\">
                    <div className=\"flex flex-col items-center justify-center h-full min-h-[120px]\">
                      {sponsor.logo_url ? (
                        <img 
                          src={sponsor.logo_url} 
                          alt={sponsor.name}
                          className=\"max-w-full max-h-16 object-contain mb-3 group-hover:scale-110 transition-transform\"
                        />
                      ) : (
                        <div className=\"w-16 h-16 bg-gradient-to-br from-orange-500/20 to-yellow-500/20 rounded-full flex items-center justify-center mb-3\">
                          <span className=\"text-2xl\">{sponsor.name[0]}</span>
                        </div>
                      )}
                      <p className=\"text-sm font-semibold text-white text-center\">{sponsor.name}</p>
                    </div>
                  </Card>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer className=\"relative z-10 border-t border-white/10 py-8 px-5 md:px-10 text-center\">
        <div className=\"max-w-5xl mx-auto\">
          <span style={{ fontFamily: 'var(--font-orbitron)' }} className=\"text-xl font-black tracking-wider mb-4 block\">
            <span className=\"text-[#ec4899]\">EXPO</span>
            <span className=\"text-white\"> CAR </span>
            <span className=\"text-[#06b6d4]\">MEETING</span>
          </span>
          <p className=\"text-sm text-white/50\">© 2026 Expo Car Meeting. Toate drepturile rezervate.</p>
        </div>
      </footer>
    </div>
  )
}
