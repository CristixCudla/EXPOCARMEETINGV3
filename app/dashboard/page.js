'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  LayoutDashboard, 
  Users, 
  Car, 
  Trophy, 
  Calendar, 
  Award,
  Ticket,
  ArrowLeft,
  Check,
  X,
  Star,
  Plus,
  Send,
  MessageSquare,
  Edit,
  Trash2,
  ChevronDown
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  
  // Data states
  const [users, setUsers] = useState([])
  const [cars, setCars] = useState([])
  const [tickets, setTickets] = useState([])
  const [ticketMessages, setTicketMessages] = useState([])
  const [eventSchedule, setEventSchedule] = useState([])
  const [sponsors, setSponsors] = useState([])
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [replyMessage, setReplyMessage] = useState('')

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error('Trebuie să fii autentificat')
      router.push('/auth/login')
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!profile || (profile.role !== 'admin' && profile.role !== 'organizer')) {
      toast.error('Nu ai permisiuni de admin/organizer')
      router.push('/')
      return
    }

    setUser(user)
    setUserProfile(profile)
    loadData(profile.role)
  }

  async function loadData(role) {
    try {
      // Load tickets (all roles)
      const { data: ticketsData } = await supabase
        .from('tickets')
        .select('*, profiles!tickets_user_id_fkey(full_name, email)')
        .order('created_at', { ascending: false })
      setTickets(ticketsData || [])

      // Load additional data for admins only
      if (role === 'admin') {
        const { data: usersData } = await supabase.from('profiles').select('*')
        setUsers(usersData || [])

        const { data: carsData } = await supabase.from('cars').select('*')
        setCars(carsData || [])

        const { data: scheduleData } = await supabase.from('event_schedule').select('*').order('display_order')
        setEventSchedule(scheduleData || [])

        const { data: sponsorsData } = await supabase.from('sponsors').select('*').order('display_order')
        setSponsors(sponsorsData || [])
      }
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Eroare la încărcarea datelor')
    } finally {
      setLoading(false)
    }
  }

  // Setup Realtime subscriptions pentru tickets
  useEffect(() => {
    if (!user || !userProfile) return

    // Subscribe la tickets pentru actualizări live
    const ticketsChannel = supabase
      .channel('tickets-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tickets'
        },
        (payload) => {
          console.log('Tickets change detected:', payload)
          // Reload tickets when any change happens
          loadTickets()
        }
      )
      .subscribe()

    // Subscribe la ticket_messages pentru conversații live
    const messagesChannel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ticket_messages'
        },
        (payload) => {
          console.log('Message change detected:', payload)
          // Reload tickets to update message counts
          loadTickets()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(ticketsChannel)
      supabase.removeChannel(messagesChannel)
    }
  }, [user, userProfile])

  async function loadTickets() {
    try {
      const { data: ticketsData, error: ticketsError } = await supabase
        .from('tickets')
        .select(`
          *,
          profiles!tickets_user_id_fkey (
            full_name,
            email
          ),
          ticket_messages (
            id
          )
        `)
        .order('created_at', { ascending: false })

      if (ticketsError) throw ticketsError
      setTickets(ticketsData || [])
    } catch (error) {
      console.error('Error loading tickets:', error)
    }
  }

  async function updateUserRole(userId, newRole) {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId)

      if (error) throw error

      toast.success(`Rolul a fost actualizat la "${newRole}"!`)
      
      // Reload users
      const { data: usersData } = await supabase.from('profiles').select('*')
      setUsers(usersData || [])
    } catch (error) {
      console.error('Error updating role:', error)
      toast.error('Eroare la actualizare rol')
    }
  }

  async function handleCarStatusUpdate(carId, status) {
    try {
      const { error } = await supabase
        .from('cars')
        .update({ status })
        .eq('id', carId)

      if (error) throw error

      toast.success(`Mașină ${status === 'accepted' ? 'acceptată' : 'respinsă'}!`)
      loadData(userProfile.role)
    } catch (error) {
      console.error('Error updating car:', error)
      toast.error('Eroare la actualizarea mașinii')
    }
  }

  async function handleToggleBestCar(carId, currentStatus) {
    try {
      const { error } = await supabase
        .from('cars')
        .update({ is_best_car_nominee: !currentStatus })
        .eq('id', carId)

      if (error) throw error

      toast.success(currentStatus ? 'Eliminat din Best Car' : 'Adăugat la Best Car!')
      loadData(userProfile.role)
    } catch (error) {
      console.error('Error toggling best car:', error)
      toast.error('Eroare la actualizare')
    }
  }

  async function loadTicketMessages(ticketId) {
    try {
      const { data, error } = await supabase
        .from('ticket_messages')
        .select('*, profiles:sender_id(full_name, role)')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setTicketMessages(data || [])
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  async function handleTicketReply(e) {
    e.preventDefault()
    if (!replyMessage.trim() || !selectedTicket) return

    try {
      const { error } = await supabase
        .from('ticket_messages')
        .insert({
          ticket_id: selectedTicket.id,
          sender_id: user.id,
          message: replyMessage
        })

      if (error) throw error

      toast.success('Răspuns trimis!')
      setReplyMessage('')
      loadTicketMessages(selectedTicket.id)
      
      await supabase
        .from('tickets')
        .update({ status: 'in_progress' })
        .eq('id', selectedTicket.id)
      
      loadData(userProfile.role)
    } catch (error) {
      console.error('Error sending reply:', error)
      toast.error('Eroare la trimiterea răspunsului')
    }
  }

  async function handleCreateSchedule(e) {
    e.preventDefault()
    const formData = new FormData(e.target)
    
    try {
      const { error } = await supabase.from('event_schedule').insert({
        date: formData.get('date'),
        time: formData.get('time'),
        title: formData.get('title'),
        description: formData.get('description'),
        display_order: parseInt(formData.get('display_order') || 0)
      })

      if (error) throw error

      toast.success('Eveniment adăugat!')
      e.target.reset()
      loadData(userProfile.role)
    } catch (error) {
      console.error('Error creating schedule:', error)
      toast.error('Eroare la adăugarea evenimentului')
    }
  }

  async function handleDeleteSchedule(id) {
    try {
      const { error } = await supabase.from('event_schedule').delete().eq('id', id)
      if (error) throw error
      toast.success('Eveniment șters!')
      loadData(userProfile.role)
    } catch (error) {
      toast.error('Eroare la ștergere')
    }
  }

  async function handleCreateSponsor(e) {
    e.preventDefault()
    const formData = new FormData(e.target)
    
    try {
      let logoUrl = ''
      const logoFile = formData.get('logo_file')
      
      // Upload logo to Supabase Storage
      if (logoFile && logoFile.size > 0) {
        const fileExt = logoFile.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `sponsor-logos/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('car-images')
          .upload(filePath, logoFile)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('car-images')
          .getPublicUrl(filePath)

        logoUrl = publicUrl
      }

      const { error } = await supabase.from('sponsors').insert({
        name: formData.get('name'),
        website_url: formData.get('website_url'),
        logo_url: logoUrl,
        display_order: parseInt(formData.get('display_order') || 0)
      })

      if (error) throw error

      toast.success('Sponsor adăugat!')
      e.target.reset()
      loadData(userProfile.role)
    } catch (error) {
      console.error('Error creating sponsor:', error)
      toast.error('Eroare la adăugarea sponsorului')
    }
  }

  async function handleDeleteSponsor(id) {
    try {
      const { error } = await supabase.from('sponsors').delete().eq('id', id)
      if (error) throw error
      toast.success('Sponsor șters!')
      loadData(userProfile.role)
    } catch (error) {
      toast.error('Eroare la ștergere')
    }
  }

  if (loading || !user || !userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e] flex items-center justify-center">
        <div className="text-white">Se încarcă...</div>
      </div>
    )
  }

  const isAdmin = userProfile.role === 'admin'

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e] relative overflow-hidden py-8 px-4">
      <div className="particle-bg">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" className="text-cyan-400 hover:text-cyan-300">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Înapoi la Home
            </Button>
          </Link>
          <Badge variant="outline" className="text-cyan-400 border-cyan-400">
            {isAdmin ? 'Admin' : 'Organizator'}
          </Badge>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-gradient-to-br from-white/10 to-white/5 border-white/20 backdrop-blur-xl mb-6">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="glow-box rounded-full p-3 bg-gradient-to-br from-cyan-500 to-pink-500">
                  <LayoutDashboard className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold gradient-text">Dashboard {isAdmin ? 'Admin' : 'Organizator'}</CardTitle>
                  <CardDescription className="text-gray-400">
                    {isAdmin ? 'Control complet al evenimentului' : 'Gestionează ticket-urile de suport'}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-white/5 border border-white/10">
              {isAdmin && <TabsTrigger value="overview">Overview</TabsTrigger>}
              {isAdmin && <TabsTrigger value="users">Utilizatori</TabsTrigger>}
              {isAdmin && <TabsTrigger value="cars">Mașini</TabsTrigger>}
              {isAdmin && <TabsTrigger value="best-car">Best Car</TabsTrigger>}
              {isAdmin && <TabsTrigger value="schedule">Program</TabsTrigger>}
              {isAdmin && <TabsTrigger value="sponsors">Sponsori</TabsTrigger>}
              <TabsTrigger value="tickets">Support Tickets</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            {isAdmin && (
              <TabsContent value="overview" className="space-y-6">
                <div className="grid md:grid-cols-4 gap-4">
                  <Card className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-400/30">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-400">Total Utilizatori</p>
                          <p className="text-3xl font-bold text-white">{users.length}</p>
                        </div>
                        <Users className="w-12 h-12 text-cyan-400 opacity-50" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-pink-500/20 to-orange-500/20 border-pink-400/30">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-400">Total Mașini</p>
                          <p className="text-3xl font-bold text-white">{cars.length}</p>
                        </div>
                        <Car className="w-12 h-12 text-pink-400 opacity-50" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-400/30">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-400">Mașini Acceptate</p>
                          <p className="text-3xl font-bold text-white">{cars.filter(c => c.status === 'accepted').length}</p>
                        </div>
                        <Trophy className="w-12 h-12 text-yellow-400 opacity-50" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-400/30">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-400">Tickets Deschise</p>
                          <p className="text-3xl font-bold text-white">{tickets.filter(t => t.status === 'open').length}</p>
                        </div>
                        <Ticket className="w-12 h-12 text-purple-400 opacity-50" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            )}

            {/* Users Tab */}
            {isAdmin && (
              <TabsContent value="users">
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Utilizatori Înregistrați</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow className="border-white/10">
                          <TableHead className="text-gray-400">Nume</TableHead>
                          <TableHead className="text-gray-400">Email</TableHead>
                          <TableHead className="text-gray-400">Rol</TableHead>
                          <TableHead className="text-gray-400">Creat la</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.id} className="border-white/10">
                            <TableCell className="text-white">{user.full_name || 'N/A'}</TableCell>
                            <TableCell className="text-gray-400">{user.email}</TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    className={`
                                      ${user.role === 'admin' ? 'border-pink-400 text-pink-400 hover:bg-pink-400/10' :
                                        user.role === 'organizer' ? 'border-yellow-400 text-yellow-400 hover:bg-yellow-400/10' :
                                        'border-cyan-400 text-cyan-400 hover:bg-cyan-400/10'}
                                      font-semibold cursor-pointer
                                    `}
                                  >
                                    {user.role}
                                    <ChevronDown className="ml-2 w-3 h-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="bg-black/95 border-white/20">
                                  <DropdownMenuItem 
                                    onClick={() => updateUserRole(user.id, 'user')}
                                    className="text-cyan-400 hover:bg-cyan-400/10 cursor-pointer"
                                  >
                                    User
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => updateUserRole(user.id, 'organizer')}
                                    className="text-yellow-400 hover:bg-yellow-400/10 cursor-pointer"
                                  >
                                    Organizer
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => updateUserRole(user.id, 'admin')}
                                    className="text-pink-400 hover:bg-pink-400/10 cursor-pointer"
                                  >
                                    Admin
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                            <TableCell className="text-gray-400">
                              {new Date(user.created_at).toLocaleDateString('ro-RO')}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* Cars Tab */}
            {isAdmin && (
              <TabsContent value="cars">
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Gestionare Mașini</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {cars.map((car) => (
                        <Card key={car.id} className="bg-white/5 border-white/10">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                              {car.images && car.images.length > 0 && (
                                <img src={car.images[0]} alt={`${car.make} ${car.model}`} className="w-24 h-24 object-cover rounded-lg" />
                              )}
                              <div className="flex-1">
                                <h4 className="text-lg font-bold text-white">{car.make} {car.model}</h4>
                                {car.year && <p className="text-sm text-gray-400">An: {car.year}</p>}
                                <p className="text-sm text-gray-400 mt-1">{car.description}</p>
                                <div className="flex items-center gap-2 mt-3">
                                  <Badge variant="outline" className={
                                    car.status === 'accepted' ? 'border-green-400 text-green-400' :
                                    car.status === 'rejected' ? 'border-red-400 text-red-400' :
                                    'border-yellow-400 text-yellow-400'
                                  }>
                                    {car.status}
                                  </Badge>
                                  {car.is_best_car_nominee && (
                                    <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500">
                                      <Star className="w-3 h-3 mr-1" />
                                      Best Car Nominee
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="flex flex-col gap-2">
                                {car.status === 'pending' && (
                                  <>
                                    <Button size="sm" onClick={() => handleCarStatusUpdate(car.id, 'accepted')} className="bg-green-500 hover:bg-green-600">
                                      <Check className="w-4 h-4 mr-1" />
                                      Acceptă
                                    </Button>
                                    <Button size="sm" variant="destructive" onClick={() => handleCarStatusUpdate(car.id, 'rejected')}>
                                      <X className="w-4 h-4 mr-1" />
                                      Respinge
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* Best Car Tab */}
            {isAdmin && (
              <TabsContent value="best-car">
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Selectare Best Car of the Show (Max 3)</CardTitle>
                    <CardDescription className="text-gray-400">Selectează exact 3 mașini pentru votare publică</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {cars.filter(c => c.status === 'accepted').map((car) => (
                        <Card key={car.id} className={`bg-white/5 border-white/10 ${car.is_best_car_nominee ? 'border-yellow-400' : ''}`}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                {car.images && car.images.length > 0 && (
                                  <img src={car.images[0]} alt={`${car.make} ${car.model}`} className="w-16 h-16 object-cover rounded-lg" />
                                )}
                                <div>
                                  <h4 className="text-lg font-bold text-white">{car.make} {car.model}</h4>
                                  {car.year && <p className="text-sm text-gray-400">An: {car.year}</p>}
                                </div>
                              </div>
                              <Button
                                onClick={() => handleToggleBestCar(car.id, car.is_best_car_nominee)}
                                variant={car.is_best_car_nominee ? "default" : "outline"}
                                className={car.is_best_car_nominee ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : ''}
                              >
                                <Star className="w-4 h-4 mr-2" />
                                {car.is_best_car_nominee ? 'Eliminat din Best Car' : 'Adaugă la Best Car'}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* Schedule Tab */}
            {isAdmin && (
              <TabsContent value="schedule" className="space-y-6">
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Adaugă Eveniment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCreateSchedule} className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-gray-200">Data</Label>
                          <Input name="date" type="date" required className="bg-white/5 border-white/20 text-white" />
                        </div>
                        <div>
                          <Label className="text-gray-200">Ora</Label>
                          <Input name="time" type="time" required className="bg-white/5 border-white/20 text-white" />
                        </div>
                      </div>
                      <div>
                        <Label className="text-gray-200">Titlu</Label>
                        <Input name="title" required className="bg-white/5 border-white/20 text-white" />
                      </div>
                      <div>
                        <Label className="text-gray-200">Descriere</Label>
                        <Textarea name="description" className="bg-white/5 border-white/20 text-white" />
                      </div>
                      <div>
                        <Label className="text-gray-200">Ordinea afișării</Label>
                        <Input name="display_order" type="number" defaultValue={0} className="bg-white/5 border-white/20 text-white" />
                      </div>
                      <Button type="submit" className="bg-gradient-to-r from-cyan-500 to-blue-500">
                        <Plus className="w-4 h-4 mr-2" />
                        Adaugă Eveniment
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Evenimente Programate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {eventSchedule.map((event) => (
                        <div key={event.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <div>
                            <h4 className="text-white font-semibold">{event.title}</h4>
                            <p className="text-sm text-gray-400">{new Date(event.date).toLocaleDateString('ro-RO')} • {event.time}</p>
                          </div>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteSchedule(event.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* Sponsors Tab */}
            {isAdmin && (
              <TabsContent value="sponsors" className="space-y-6">
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Adaugă Sponsor</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCreateSponsor} className="space-y-4">
                      <div>
                        <Label className="text-gray-200">Nume Sponsor</Label>
                        <Input name="name" required className="bg-white/5 border-white/20 text-white" />
                      </div>
                      <div>
                        <Label className="text-gray-200">Website URL</Label>
                        <Input name="website_url" type="url" className="bg-white/5 border-white/20 text-white" />
                      </div>
                      <div>
                        <Label className="text-gray-200">Logo (Poză)</Label>
                        <Input 
                          name="logo_file" 
                          type="file" 
                          accept="image/*" 
                          required 
                          className="bg-white/5 border-white/20 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-500 file:text-white hover:file:bg-cyan-600" 
                        />
                        <p className="text-xs text-gray-400 mt-1">Acceptă: PNG, JPG, WEBP (max 5MB)</p>
                      </div>
                      <div>
                        <Label className="text-gray-200">Ordinea afișării</Label>
                        <Input name="display_order" type="number" defaultValue={0} className="bg-white/5 border-white/20 text-white" />
                      </div>
                      <Button type="submit" className="bg-gradient-to-r from-pink-500 to-orange-500">
                        <Plus className="w-4 h-4 mr-2" />
                        Adaugă Sponsor
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Sponsori Actuali</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4">
                      {sponsors.map((sponsor) => (
                        <Card key={sponsor.id} className="bg-white/5 border-white/10">
                          <CardContent className="p-4">
                            <div className="text-center">
                              {sponsor.logo_url && (
                                <img src={sponsor.logo_url} alt={sponsor.name} className="h-16 object-contain mx-auto mb-3" />
                              )}
                              <h4 className="text-white font-semibold">{sponsor.name}</h4>
                              {sponsor.website_url && (
                                <a href={sponsor.website_url} target="_blank" rel="noopener noreferrer" className="text-xs text-cyan-400 hover:underline">
                                  {sponsor.website_url}
                                </a>
                              )}
                              <Button size="sm" variant="destructive" onClick={() => handleDeleteSponsor(sponsor.id)} className="mt-3 w-full">
                                <Trash2 className="w-4 h-4 mr-1" />
                                Șterge
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* Tickets Tab */}
            <TabsContent value="tickets">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-1 space-y-3">
                  <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white text-sm">Toate Ticket-urile</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
                      {tickets.map((ticket) => (
                        <Card
                          key={ticket.id}
                          onClick={() => {
                            setSelectedTicket(ticket)
                            loadTicketMessages(ticket.id)
                          }}
                          className={`cursor-pointer bg-white/5 border-white/10 hover:border-cyan-400/50 transition-all ${
                            selectedTicket?.id === ticket.id ? 'border-cyan-400' : ''
                          }`}
                        >
                          <CardContent className="p-3">
                            <h4 className="text-sm font-semibold text-white line-clamp-1">{ticket.subject}</h4>
                            <p className="text-xs text-gray-400 mt-1">De la: {ticket.profiles?.full_name || 'User'}</p>
                            <Badge variant="outline" className="mt-2 text-xs" className={
                              ticket.status === 'open' ? 'border-blue-400 text-blue-400' :
                              ticket.status === 'in_progress' ? 'border-yellow-400 text-yellow-400' :
                              'border-green-400 text-green-400'
                            }>
                              {ticket.status}
                            </Badge>
                          </CardContent>
                        </Card>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                <div className="md:col-span-2">
                  {selectedTicket ? (
                    <Card className="bg-white/5 border-white/10 h-[600px] flex flex-col">
                      <CardHeader className="border-b border-white/10">
                        <CardTitle className="text-white">{selectedTicket.subject}</CardTitle>
                        <CardDescription className="text-gray-400">
                          De la: {selectedTicket.profiles?.email}
                        </CardDescription>
                      </CardHeader>
                      <ScrollArea className="flex-1 p-4">
                        <div className="space-y-4">
                          {ticketMessages.map((msg) => {
                            const isAdmin = msg.profiles?.role === 'admin' || msg.profiles?.role === 'organizer'
                            return (
                              <div key={msg.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] ${
                                  isAdmin 
                                    ? 'bg-gradient-to-br from-pink-500/20 to-orange-500/20 border-pink-400/30' 
                                    : 'bg-white/5 border-white/10'
                                } border rounded-lg p-3`}>
                                  <p className="text-xs font-semibold text-white mb-1">
                                    {msg.profiles?.full_name || 'User'}
                                  </p>
                                  <p className="text-sm text-gray-200 whitespace-pre-wrap">{msg.message}</p>
                                  <p className="text-xs text-gray-400 mt-1">
                                    {new Date(msg.created_at).toLocaleString('ro-RO')}
                                  </p>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </ScrollArea>
                      <form onSubmit={handleTicketReply} className="p-4 border-t border-white/10">
                        <div className="flex gap-2">
                          <Textarea
                            placeholder="Scrie un răspuns..."
                            value={replyMessage}
                            onChange={(e) => setReplyMessage(e.target.value)}
                            rows={2}
                            className="bg-white/5 border-white/20 text-white flex-1"
                          />
                          <Button type="submit" size="icon" className="bg-gradient-to-r from-cyan-500 to-blue-500">
                            <Send className="w-4 h-4" />
                          </Button>
                        </div>
                      </form>
                    </Card>
                  ) : (
                    <Card className="bg-white/5 border-white/10 h-[600px] flex items-center justify-center">
                      <div className="text-center">
                        <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-400">Selectează un ticket pentru a vedea conversația</p>
                      </div>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}
