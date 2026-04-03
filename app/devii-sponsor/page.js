'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Phone, Mail, Check, Star, Users, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default function DeviiSponsorPage() {
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
            <p className="section-label mb-6 text-cyan-400">Sponsorship</p>
            <h1 className="display-heading mb-6 text-6xl md:text-8xl">
              DEVINO
            </h1>
            <p className="text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 mb-8">
              Sponsor Oficial
            </p>
            <p className="text-gray-300 text-lg max-w-3xl mx-auto">
              Alătură-te celui mai spectaculos eveniment auto din Fălticeni și crește vizibilitatea brandului tău în comunitatea pasionaților de mașini!
            </p>
          </div>

          {/* De ce să devii sponsor */}
          <div className="mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-white text-center mb-12">
              De ce să devii <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">SPONSOR?</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 border-pink-500/30 backdrop-blur-xl p-8">
                <div className="flex justify-center mb-6">
                  <div className="rounded-full p-4 bg-pink-500/20">
                    <Users className="w-12 h-12 text-pink-400" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white text-center mb-4">
                  Vizibilitate Maximă
                </h3>
                <p className="text-gray-300 text-center">
                  Expunere în fața a sute de pasionați auto și comunitate activă online
                </p>
              </Card>

              <Card className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-500/30 backdrop-blur-xl p-8">
                <div className="flex justify-center mb-6">
                  <div className="rounded-full p-4 bg-cyan-500/20">
                    <TrendingUp className="w-12 h-12 text-cyan-400" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white text-center mb-4">
                  Creștere Brand
                </h3>
                <p className="text-gray-300 text-center">
                  Asociere cu un eveniment de top și creșterea notorietății în comunitate
                </p>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30 backdrop-blur-xl p-8">
                <div className="flex justify-center mb-6">
                  <div className="rounded-full p-4 bg-purple-500/20">
                    <Star className="w-12 h-12 text-purple-400" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white text-center mb-4">
                  Comunitate Targetată
                </h3>
                <p className="text-gray-300 text-center">
                  Acces direct la publicul țintă: pasionați auto, proprietari de mașini custom
                </p>
              </Card>
            </div>
          </div>

          {/* Pachete Sponsorship */}
          <div className="mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-white text-center mb-12">
              Ce primești ca <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-500">SPONSOR</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <Card className="bg-gradient-to-br from-white/10 to-white/5 border-white/20 backdrop-blur-xl p-8">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Check className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                    <p className="text-white">Logo-ul brandului afișat pe site și social media</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                    <p className="text-white">Mențiuni în postările de promovare</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                    <p className="text-white">Stand/Spațiu dedicat la eveniment (opțional)</p>
                  </div>
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-white/10 to-white/5 border-white/20 backdrop-blur-xl p-8">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Check className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                    <p className="text-white">Bannere și materiale publicitare la locație</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                    <p className="text-white">Networking cu comunitatea auto</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                    <p className="text-white">Mențiune în ceremonia de premiere</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Contact Section */}
          <div className="max-w-4xl mx-auto">
            <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30 backdrop-blur-xl p-12">
              <h2 className="text-4xl md:text-5xl font-black text-white text-center mb-8">
                Hai să discutăm!
              </h2>
              <p className="text-gray-300 text-center text-lg mb-12">
                Contactează-ne pentru a afla mai multe despre pachetele de sponsorizare disponibile și cum putem colabora pentru a face acest eveniment un succes!
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Telefon */}
                <a 
                  href="tel:0746225850"
                  className="group"
                >
                  <Card className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-500/30 backdrop-blur-xl p-8 hover:scale-105 transition-all duration-300 hover:border-cyan-400">
                    <div className="flex items-center gap-4">
                      <div className="rounded-full p-4 bg-cyan-500/20 group-hover:bg-cyan-500/30 transition-colors">
                        <Phone className="w-8 h-8 text-cyan-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Sună-ne</p>
                        <p className="text-2xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                          0746 225 850
                        </p>
                      </div>
                    </div>
                  </Card>
                </a>

                {/* Email */}
                <a 
                  href="mailto:expocarmeeting@gmail.com"
                  className="group"
                >
                  <Card className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 border-pink-500/30 backdrop-blur-xl p-8 hover:scale-105 transition-all duration-300 hover:border-pink-400">
                    <div className="flex items-center gap-4">
                      <div className="rounded-full p-4 bg-pink-500/20 group-hover:bg-pink-500/30 transition-colors">
                        <Mail className="w-8 h-8 text-pink-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Email</p>
                        <p className="text-xl font-bold text-white group-hover:text-pink-400 transition-colors break-all">
                          expocarmeeting@gmail.com
                        </p>
                      </div>
                    </div>
                  </Card>
                </a>
              </div>

              <div className="mt-12 text-center">
                <p className="text-gray-400 text-sm">
                  Răspundem în maximum 24h la toate solicitările
                </p>
              </div>
            </Card>
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
