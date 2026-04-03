'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Trophy, ArrowLeft, Heart, X } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import Image from 'next/image'

export default function MasiniAcceptatePage() {
  const [cars, setCars] = useState([])
  const [selectedCar, setSelectedCar] = useState(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [userVote, setUserVote] = useState(null)

  useEffect(() => {
    // Check if user is logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadUserVote(session.user.id)
      }
    })

    loadCars()
  }, [])

  async function loadCars() {
    try {
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .eq('status', 'accepted')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setCars(data || [])
      setLoading(false)
    } catch (error) {
      console.error('Error loading cars:', error)
      setLoading(false)
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
      setSelectedCar(null)
    } catch (error) {
      console.error('Error voting:', error)
      toast.error('Eroare la votare')
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
            <p className="section-label mb-6 text-cyan-400">Galerie & Mașini</p>
            <h1 className="display-heading mb-6 text-6xl md:text-8xl">
              MAȘINI
            </h1>
            <p className="text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 mb-8">
              Acceptate
            </p>
            <p className="text-gray-300 text-lg max-w-3xl mx-auto">
              Descoperă mașinile confirmate pentru eveniment. Galerie completă cu toate build-urile care vor fi prezente la Nada Florilor în 6–7 Iunie 2026.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-black text-cyan-400 mb-2">{cars.length}</div>
              <div className="text-sm text-gray-400 uppercase tracking-wide">Mașini Acceptate</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-pink-400 mb-2">10+</div>
              <div className="text-sm text-gray-400 uppercase tracking-wide">Categorii</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-purple-400 mb-2">2</div>
              <div className="text-sm text-gray-400 uppercase tracking-wide">Zile Event</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-orange-400 mb-2">5+</div>
              <div className="text-sm text-gray-400 uppercase tracking-wide">Premii</div>
            </div>
          </div>

          {/* Cars Grid */}
          {loading ? (
            <div className="text-center py-20">
              <div className="animate-pulse text-cyan-400 text-xl">Se încarcă mașinile...</div>
            </div>
          ) : cars.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {cars.map((car) => (
                <Card 
                  key={car.id} 
                  className="bg-gradient-to-br from-white/10 to-white/5 border-white/20 backdrop-blur-xl overflow-hidden hover:scale-105 transition-all duration-300 hover:border-cyan-400/50 cursor-pointer group"
                  onClick={() => setSelectedCar(car)}
                >
                  {/* Car Image */}
                  {car.images && car.images[0] ? (
                    <div className="aspect-video relative overflow-hidden">
                      <img 
                        src={car.images[0]} 
                        alt={`${car.make} ${car.model}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      {car.is_best_car_nominee && (
                        <Badge className="absolute top-3 right-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
                          <Trophy className="w-3 h-3 mr-1" />
                          Nominalizat
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                      <Trophy className="w-16 h-16 text-gray-600" />
                    </div>
                  )}

                  <CardContent className="p-6">
                    <h3 className="text-2xl font-black text-white mb-2">
                      {car.make} {car.model}
                    </h3>
                    {car.year && (
                      <Badge variant="outline" className="border-cyan-400 text-cyan-400 mb-3">
                        {car.year}
                      </Badge>
                    )}
                    <p className="text-gray-400 text-sm line-clamp-2 mb-4">
                      {car.description || 'Fără descriere'}
                    </p>
                    
                    <div className="flex gap-3">
                      <Button 
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedCar(car)
                        }}
                        className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 font-bold"
                        size="sm"
                      >
                        Vezi Detalii
                      </Button>
                      
                      {user && !userVote && (
                        <Button 
                          onClick={(e) => {
                            e.stopPropagation()
                            handleVote(car.id)
                          }}
                          size="sm"
                          variant="outline"
                          className="border-pink-500 text-pink-500 hover:bg-pink-500/10"
                        >
                          <Heart className="w-4 h-4" />
                        </Button>
                      )}
                      
                      {userVote?.car_id === car.id && (
                        <Badge className="bg-green-500/20 text-green-400 border-green-400">
                          Votat ✓
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Trophy className="w-24 h-24 text-gray-600 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-400 mb-4">
                Nu sunt mașini acceptate încă
              </h3>
              <p className="text-gray-500">
                Revino mai târziu pentru a vedea mașinile confirmate pentru eveniment!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Modal with Car Details */}
      {selectedCar && (
        <Dialog open={!!selectedCar} onOpenChange={() => setSelectedCar(null)}>
          <DialogContent className="max-w-4xl bg-gradient-to-br from-gray-900 to-black border-white/20 text-white max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-400">
                {selectedCar.make} {selectedCar.model}
              </DialogTitle>
            </DialogHeader>

            {/* Images Gallery */}
            {selectedCar.images && selectedCar.images.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {selectedCar.images.map((img, idx) => (
                  <div key={idx} className="aspect-video relative overflow-hidden rounded-lg">
                    <img 
                      src={img} 
                      alt={`${selectedCar.make} ${selectedCar.model} - Image ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Car Info */}
            <div className="space-y-4 mb-6">
              {selectedCar.year && (
                <div>
                  <h4 className="text-sm text-gray-400 uppercase tracking-wide mb-1">An Fabricație</h4>
                  <p className="text-2xl font-bold text-cyan-400">{selectedCar.year}</p>
                </div>
              )}

              <div>
                <h4 className="text-sm text-gray-400 uppercase tracking-wide mb-2">Descriere</h4>
                <p className="text-gray-300 leading-relaxed">
                  {selectedCar.description || 'Nu există descriere disponibilă pentru această mașină.'}
                </p>
              </div>

              {selectedCar.is_best_car_nominee && (
                <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 text-lg px-4 py-2">
                  <Trophy className="w-5 h-5 mr-2" />
                  Nominalizat Best Car of the Show
                </Badge>
              )}
            </div>

            {/* Vote Button */}
            {user && !userVote && (
              <Button 
                onClick={() => handleVote(selectedCar.id)}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold py-6 text-lg"
                size="lg"
              >
                <Trophy className="w-6 h-6 mr-2" />
                Votează această mașină
              </Button>
            )}

            {userVote?.car_id === selectedCar.id && (
              <div className="bg-green-500/20 border border-green-400 rounded-lg p-4 text-center">
                <p className="text-green-400 font-bold text-lg">
                  ✓ Ai votat pentru această mașină!
                </p>
              </div>
            )}

            {!user && (
              <div className="bg-cyan-500/20 border border-cyan-400 rounded-lg p-4 text-center">
                <p className="text-cyan-400 mb-3">Trebuie să fii autentificat pentru a vota</p>
                <Link href="/auth/login">
                  <Button className="bg-cyan-500 hover:bg-cyan-600">
                    Conectează-te
                  </Button>
                </Link>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}

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
