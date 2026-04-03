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
      <div className="px-5 md:px-10 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-logo-cyberpunk text-xl md:text-2xl tracking-wider">
              <span className="text-[#ec4899] logo-pulsar">EXPO</span>
              <span className="text-white"> CAR </span>
              <span className="text-[#06b6d4]">MEETING</span>
            </span>
          </Link>
          
          <div className="flex items-center gap-3">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-pink-500 flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="hidden md:inline">{userProfile?.full_name || 'Cont'}</span>
                    <Menu className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-black/95 border-white/20 text-white">
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
                  <Button variant="outline" size="sm" className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10">
                    <LogIn className="w-4 h-4 mr-2" />
                    <span className="hidden md:inline">Login</span>
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm" className="bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600">
                    <UserPlus className="w-4 h-4 mr-2" />
                    <span className="hidden md:inline">Register</span>
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
