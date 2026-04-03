'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Ticket, Plus, MessageSquare, Clock, ArrowLeft, Send } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function TicketsPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [tickets, setTickets] = useState([])
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [newTicketOpen, setNewTicketOpen] = useState(false)
  const [replyMessage, setReplyMessage] = useState('')
  const [newTicket, setNewTicket] = useState({ subject: '', message: '' })

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
    setUser(user)
    loadTickets(user.id)
  }

  async function loadTickets(userId) {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setTickets(data || [])
    } catch (error) {
      console.error('Error loading tickets:', error)
      toast.error('Eroare la încărcarea ticket-urilor')
    } finally {
      setLoading(false)
    }
  }

  async function loadMessages(ticketId) {
    try {
      const { data, error } = await supabase
        .from('ticket_messages')
        .select(`
          *,
          profiles:sender_id (full_name, email, role)
        `)
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true })
      
      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error('Error loading messages:', error)
      toast.error('Eroare la încărcarea mesajelor')
    }
  }

  async function handleCreateTicket(e) {
    e.preventDefault()
    
    try {
      const { data: ticketData, error: ticketError } = await supabase
        .from('tickets')
        .insert({
          user_id: user.id,
          subject: newTicket.subject,
          status: 'open'
        })
        .select()
        .single()
      
      if (ticketError) throw ticketError

      const { error: messageError } = await supabase
        .from('ticket_messages')
        .insert({
          ticket_id: ticketData.id,
          sender_id: user.id,
          message: newTicket.message
        })
      
      if (messageError) throw messageError

      toast.success('Ticket creat cu succes! 🎉')
      setNewTicketOpen(false)
      setNewTicket({ subject: '', message: '' })
      loadTickets(user.id)
    } catch (error) {
      console.error('Error creating ticket:', error)
      toast.error('Eroare la crearea ticket-ului')
    }
  }

  async function handleSendReply(e) {
    e.preventDefault()
    
    if (!replyMessage.trim()) return

    try {
      const { error } = await supabase
        .from('ticket_messages')
        .insert({
          ticket_id: selectedTicket.id,
          sender_id: user.id,
          message: replyMessage
        })
      
      if (error) throw error

      toast.success('Mesaj trimis')
      setReplyMessage('')
      loadMessages(selectedTicket.id)
      
      await supabase
        .from('tickets')
        .update({ status: 'in_progress' })
        .eq('id', selectedTicket.id)
    } catch (error) {
      console.error('Error sending reply:', error)
      toast.error('Eroare la trimiterea mesajului')
    }
  }

  function openTicket(ticket) {
    setSelectedTicket(ticket)
    loadMessages(ticket.id)
  }

  const getStatusBadge = (status) => {
    const variants = {
      open: { label: 'Deschis', className: 'bg-blue-500/20 text-blue-400 border-blue-400' },
      in_progress: { label: 'În Progres', className: 'bg-yellow-500/20 text-yellow-400 border-yellow-400' },
      closed: { label: 'Închis', className: 'bg-green-500/20 text-green-400 border-green-400' }
    }
    const variant = variants[status] || variants.open
    return <Badge variant="outline" className={variant.className}>{variant.label}</Badge>
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Se încarcă...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Înapoi la Home
            </Button>
          </Link>
        </div>

        <Card className="neon-card bg-black/40 backdrop-blur-xl border-white/20 mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-full p-3 bg-gradient-to-br from-cyan-500/20 to-blue-500/20">
                  <Ticket className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-black uppercase tracking-tight">
                    <span className="text-cyan-400">SUPPORT TICKETS</span>
                  </CardTitle>
                  <p className="text-white/50 text-sm mt-1">Gestionează cererile tale de suport</p>
                </div>
              </div>
              <Dialog open={newTicketOpen} onOpenChange={setNewTicketOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Ticket Nou
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-black border-white/20 text-white">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-black uppercase text-cyan-400">Creează Ticket Nou</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateTicket} className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-white/70">Subiect</Label>
                      <Input
                        placeholder="Descrie problema pe scurt..."
                        value={newTicket.subject}
                        onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                        required
                        className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/70">Mesaj</Label>
                      <Textarea
                        placeholder="Descrie problema în detaliu..."
                        value={newTicket.message}
                        onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                        required
                        rows={6}
                        className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
                      />
                    </div>
                    <Button type="submit" className="w-full bg-gradient-to-r from-cyan-500 to-blue-500">
                      Creează Ticket
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
        </Card>

        {loading ? (
          <div className="text-center text-white/50 py-12">Se încarcă...</div>
        ) : tickets.length === 0 ? (
          <Card className="neon-card bg-black/40 backdrop-blur-xl border-white/20">
            <CardContent className="p-12 text-center">
              <Ticket className="w-16 h-16 text-white/30 mx-auto mb-4" />
              <p className="text-white/50 mb-4">Nu ai niciun ticket încă</p>
              <Button onClick={() => setNewTicketOpen(true)} variant="outline" className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10">
                <Plus className="w-4 h-4 mr-2" />
                Creează primul ticket
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {/* Tickets List */}
            <div className="md:col-span-1 space-y-3">
              {tickets.map((ticket) => (
                <Card
                  key={ticket.id}
                  onClick={() => openTicket(ticket)}
                  className={`neon-card cursor-pointer transition-all hover:border-cyan-400/50 ${
                    selectedTicket?.id === ticket.id ? 'border-cyan-400 bg-cyan-500/5' : 'bg-black/40'
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-white text-sm line-clamp-1">{ticket.subject}</h4>
                      {getStatusBadge(ticket.status)}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-white/50">
                      <Clock className="w-3 h-3" />
                      {new Date(ticket.created_at).toLocaleDateString('ro-RO')}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Messages */}
            <div className="md:col-span-2">
              {selectedTicket ? (
                <Card className="neon-card bg-black/40 backdrop-blur-xl border-white/20 h-[600px] flex flex-col">
                  <CardHeader className="border-b border-white/10">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl text-white">{selectedTicket.subject}</CardTitle>
                        <p className="text-white/50 text-sm mt-1">
                          Creat la {new Date(selectedTicket.created_at).toLocaleString('ro-RO')}
                        </p>
                      </div>
                      {getStatusBadge(selectedTicket.status)}
                    </div>
                  </CardHeader>
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {messages.map((msg) => {
                        const isOwn = msg.sender_id === user.id
                        const isAdmin = msg.profiles?.role === 'admin' || msg.profiles?.role === 'organizer'
                        
                        return (
                          <div
                            key={msg.id}
                            className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-[80%] ${
                              isOwn 
                                ? 'bg-cyan-500/10 border-cyan-400/30' 
                                : isAdmin
                                ? 'bg-pink-500/10 border-pink-400/30'
                                : 'bg-white/5 border-white/10'
                            } border rounded-lg p-3`}>
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-xs font-semibold text-white">
                                  {isOwn ? 'Tu' : msg.profiles?.full_name || 'Support'}
                                </p>
                                {isAdmin && !isOwn && (
                                  <Badge variant="outline" className="text-[10px] px-1 py-0 border-pink-400 text-pink-400">
                                    {msg.profiles?.role === 'admin' ? 'Admin' : 'Organizator'}
                                  </Badge>
                                )}
                                <p className="text-[10px] text-white/40">
                                  {new Date(msg.created_at).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                              <p className="text-sm text-white/80 whitespace-pre-wrap">{msg.message}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </ScrollArea>
                  <Separator className="bg-white/10" />
                  <form onSubmit={handleSendReply} className="p-4">
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Scrie un răspuns..."
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        rows={2}
                        className="bg-white/5 border-white/20 text-white flex-1 placeholder:text-white/30"
                      />
                      <Button type="submit" size="icon" className="bg-gradient-to-r from-cyan-500 to-blue-500">
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </form>
                </Card>
              ) : (
                <Card className="neon-card bg-black/40 backdrop-blur-xl border-white/20 h-[600px] flex items-center justify-center">
                  <div className="text-center">
                    <MessageSquare className="w-16 h-16 text-white/30 mx-auto mb-4" />
                    <p className="text-white/50">Selectează un ticket pentru a vedea conversația</p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
