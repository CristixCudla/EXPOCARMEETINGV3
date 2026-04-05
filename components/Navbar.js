'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Car, Trophy, Ticket, LogIn, UserPlus, LogOut, LayoutDashboard, User, Menu } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadUserProfile(session.user.id)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadUserProfile(session.user.id)
      } else {
        setUserProfile(null)
      }
    })

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

  async function handleSignOut() {
    await supabase.auth.signOut()
    setUser(null)
    setUserProfile(null)
    router.push('/')
    toast.success('Deconectat cu succes')
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/70 backdrop-blur-md border-b border-white/10">
      <div className="px-4 md:px-5 lg:px-10 py-3 md:py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-logo-cyberpunk text-lg sm:text-xl md:text-2xl lg:text-3xl tracking-wider">
              <span className="text-[#ec4899] logo-pulsar-color" style={{
                textShadow: '0 0 15px rgba(236, 72, 153, 0.8), 0 0 30px rgba(236, 72, 153, 0.5)'
              }}>EXPO</span>
              <span className="text-white" style={{
                textShadow: '0 0 15px rgba(255, 255, 255, 0.8), 0 0 25px rgba(255, 255, 255, 0.4)'
              }}> CAR </span>
              <span className="text-[#06b6d4]" style={{
                textShadow: '0 0 15px rgba(6, 182, 212, 0.8), 0 0 30px rgba(6, 182, 212, 0.5)'
              }}>MEETING</span>
            </span>
          </Link>
          
          <div className="flex items-center gap-2 md:gap-3 relative">
            {user ? (
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 gap-1 md:gap-2 px-2 md:px-3 shrink-0">
                    <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-gradient-to-br from-cyan-500 to-pink-500 flex items-center justify-center">
                      <User className="w-3 h-3 md:w-4 md:h-4 text-white" />
                    </div>
                    <span className="hidden sm:inline text-xs md:text-sm whitespace-nowrap">{userProfile?.full_name || 'Cont'}</span>
                    <Menu className="w-3 h-3 md:w-4 md:h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-56 bg-black/95 border-white/20 text-white"
                  sideOffset={5}
                  collisionPadding={{ right: 10 }}
                  avoidCollisions={true}
                >
                  <DropdownMenuLabel className="text-cyan-400">
                    {userProfile?.email || 'Contul Meu'}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/10" />
                  
                  <DropdownMenuItem asChild className="cursor-pointer hover:bg-white/10">
                    <Link href="/register-car" className="flex items-center gap-2">
                      <Car className="w-4 h-4 text-pink-400" />
                      <span>Înregistrează Mașina</span>
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem asChild className="cursor-pointer hover:bg-white/10">
                    <Link href="/masini" className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-yellow-400" />
                      <span>Vezi Mașinile</span>
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem asChild className="cursor-pointer hover:bg-white/10">
                    <Link href="/tickets" className="flex items-center gap-2">
                      <Ticket className="w-4 h-4 text-cyan-400" />
                      <span>Support Tickets</span>
                    </Link>
                  </DropdownMenuItem>
                  
                  {(userProfile?.role === 'admin' || userProfile?.role === 'organizer') && (
                    <>
                      <DropdownMenuSeparator className="bg-white/10" />
                      <DropdownMenuItem asChild className="cursor-pointer hover:bg-white/10">
                        <Link href="/dashboard" className="flex items-center gap-2">
                          <LayoutDashboard className="w-4 h-4 text-purple-400" />
                          <span className="font-semibold">
                            {userProfile?.role === 'admin' ? 'Admin Panel' : 'Organizator Panel'}
                          </span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  
                  <DropdownMenuSeparator className="bg-white/10" />
                  
                  <DropdownMenuItem 
                    onClick={handleSignOut}
                    className="cursor-pointer hover:bg-red-500/10 text-red-400"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    <span>Deconectare</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="outline" size="sm" className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 px-3 md:px-4 text-xs md:text-sm">
                    <LogIn className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                    <span className="hidden sm:inline">Login</span>
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm" className="bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 px-3 md:px-4 text-xs md:text-sm">
                    <UserPlus className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                    <span className="hidden sm:inline">Register</span>
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
