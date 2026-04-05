import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { supabase } from '@/lib/supabase'
import { sendCarApprovalEmail, sendCarRejectionEmail, sendNewTicketNotification, sendTicketReplyNotification } from '@/lib/resend-emails'

// Helper to get current user
async function getCurrentUser(request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) return null
    
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error) return null
    return user
  } catch {
    return null
  }
}

// Helper to get user profile
async function getUserProfile(userId) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) throw error
  return data
}

export async function POST(request) {
  try {
    const { path, action, ...data } = await request.json()
    
    // ====================
    // AUTH ENDPOINTS
    // ====================
    
    // Login
    if (path === '/auth/login') {
      const { email, password } = data
      
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) throw error
      
      return NextResponse.json({ 
        success: true, 
        user: authData.user,
        session: authData.session
      })
    }
    
    // Register
    if (path === '/auth/register') {
      const { email, password, full_name } = data
      
      const { data: authData, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name
          }
        }
      })
      
      if (error) throw error
      
      // IMPORTANT: Create profile immediately after registration
      if (authData.user) {
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: authData.user.email,
            full_name: full_name || '',
            role: 'user'
          })
        
        if (profileError) {
          console.error('Error creating profile:', profileError)
          // Don't throw error - profile might already exist
        }
      }
      
      return NextResponse.json({ 
        success: true, 
        user: authData.user
      })
    }
    
    // Reset password request
    if (path === '/auth/reset-password') {
      const { email } = data
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/update-password`,
      })
      
      if (error) throw error
      
      return NextResponse.json({ success: true })
    }
    
    // ====================
    // CAR ENDPOINTS
    // ====================
    
    // Register a car
    if (path === '/cars/register') {
      const user = await getCurrentUser(request)
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      
      const { make, model, year, description, images } = data
      
      // Validate images array (max 5)
      if (images && images.length > 5) {
        return NextResponse.json({ error: 'Maximum 5 images allowed' }, { status: 400 })
      }
      
      const { data: carData, error } = await supabaseAdmin
        .from('cars')
        .insert({
          user_id: user.id,
          make,
          model,
          year,
          description,
          images: images || [],
          status: 'pending'
        })
        .select()
        .single()
      
      if (error) throw error
      
      return NextResponse.json({ success: true, car: carData })
    }
    
    // Update car status (Admin only)
    if (path === '/cars/update-status') {
      const user = await getCurrentUser(request)
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      
      const profile = await getUserProfile(user.id)
      if (profile.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      
      const { car_id, status } = data
      
      // Get car details and owner info before updating
      const { data: carData } = await supabaseAdmin
        .from('cars')
        .select('*, profiles!cars_user_id_fkey(email, full_name)')
        .eq('id', car_id)
        .single()
      
      // Update car status
      const { error } = await supabaseAdmin
        .from('cars')
        .update({ status })
        .eq('id', car_id)
      
      if (error) throw error
      
      // Send email notification with new Gmail templates
      if (carData && carData.profiles) {
        const userEmail = carData.profiles.email
        const userDetails = { full_name: carData.profiles.full_name }
        const carDetails = {
          make: carData.make,
          model: carData.model,
          year: carData.year,
          images: carData.images || []
        }
        
        try {
          if (status === 'accepted') {
            await sendCarApprovalEmail(userEmail, userDetails, carDetails)
          } else if (status === 'rejected') {
            await sendCarRejectionEmail(userEmail, userDetails, carDetails)
          }
        } catch (emailError) {
          console.error('Email send error:', emailError)
          // Don't fail the request if email fails
        }
      }
      
      return NextResponse.json({ success: true })
    }
    
    // Toggle best car nominee (Admin only)
    if (path === '/cars/toggle-best-car') {
      const user = await getCurrentUser(request)
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      
      const profile = await getUserProfile(user.id)
      if (profile.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      
      const { car_id, is_best_car_nominee } = data
      
      const { error } = await supabaseAdmin
        .from('cars')
        .update({ is_best_car_nominee })
        .eq('id', car_id)
      
      if (error) throw error
      
      return NextResponse.json({ success: true })
    }
    
    // ====================
    // VOTING ENDPOINTS
    // ====================
    
    // Cast a vote
    if (path === '/votes/cast') {
      const user = await getCurrentUser(request)
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      
      const { car_id } = data
      
      // Check if user has already voted
      const { data: existingVote } = await supabaseAdmin
        .from('votes')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()
      
      if (existingVote) {
        return NextResponse.json({ error: 'Already voted' }, { status: 400 })
      }
      
      const { error } = await supabaseAdmin
        .from('votes')
        .insert({ user_id: user.id, car_id })
      
      if (error) throw error
      
      return NextResponse.json({ success: true })
    }
    
    // ====================
    // TICKET ENDPOINTS
    // ====================
    
    // Create a support ticket
    if (path === '/tickets/create') {
      const user = await getCurrentUser(request)
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      
      const { subject, message } = data
      
      // Create ticket
      const { data: ticketData, error: ticketError } = await supabaseAdmin
        .from('tickets')
        .insert({
          user_id: user.id,
          subject,
          status: 'open'
        })
        .select()
        .single()
      
      if (ticketError) throw ticketError
      
      // Add first message
      const { error: messageError } = await supabaseAdmin
        .from('ticket_messages')
        .insert({
          ticket_id: ticketData.id,
          sender_id: user.id,
          message
        })
      
      if (messageError) throw messageError
      
      // Get user profile for email
      const profile = await getUserProfile(user.id)
      const userName = profile.full_name || 'Utilizator'
      
      // Send notification email to admin
      const adminEmails = [process.env.ADMIN_EMAIL || 'admin@expocarmeeting.ro']
      
      try {
        await sendNewTicketNotification(
          adminEmails,
          { subject, message, id: ticketData.id },
          { full_name: userName, email: user.email }
        )
      } catch (emailError) {
        console.error('Failed to send admin notification:', emailError)
        // Don't fail the request if email fails
      }
      
      return NextResponse.json({ success: true, ticket: ticketData })
    }
    
    // Reply to a ticket
    if (path === '/tickets/reply') {
      const user = await getCurrentUser(request)
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      
      const { ticket_id, message } = data
      
      // Get ticket details
      const { data: ticketData, error: ticketFetchError } = await supabaseAdmin
        .from('tickets')
        .select('*, profiles!tickets_user_id_fkey(email, full_name)')
        .eq('id', ticket_id)
        .single()
      
      if (ticketFetchError) throw ticketFetchError
      
      // Check authorization
      const profile = await getUserProfile(user.id)
      const isOwner = ticketData.user_id === user.id
      const isAdminOrOrganizer = profile.role === 'admin' || profile.role === 'organizer'
      
      if (!isOwner && !isAdminOrOrganizer) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      
      // Add message
      const { error: messageError } = await supabaseAdmin
        .from('ticket_messages')
        .insert({
          ticket_id,
          sender_id: user.id,
          message
        })
      
      if (messageError) throw messageError
      
      // Update ticket status
      await supabaseAdmin
        .from('tickets')
        .update({ status: 'in_progress', updated_at: new Date().toISOString() })
        .eq('id', ticket_id)
      
      // Send email notifications
      try {
        if (isAdminOrOrganizer) {
          // Admin/Organizer replied, notify user
          const userEmail = ticketData.profiles.email
          const userName = ticketData.profiles.full_name || 'Utilizator'
          const senderName = profile.full_name || 'Administrator'
          
          await sendTicketReplyNotification(
            userEmail,
            { subject: ticketData.subject, id: ticket_id },
            message,
            senderName
          )
        } else {
          // User replied, notify admin
          const adminEmail = process.env.ADMIN_EMAIL || 'admin@expocarmeeting.ro'
          const userName = profile.full_name || 'Utilizator'
          const senderName = profile.full_name || 'Utilizator'
          
          await sendTicketReplyNotification(
            adminEmail,
            { subject: ticketData.subject, id: ticket_id },
            message,
            senderName
          )
        }
      } catch (emailError) {
        console.error('Failed to send notification:', emailError)
      }
      
      return NextResponse.json({ success: true })
    }
    
    // ====================
    // EVENT SCHEDULE ENDPOINTS (Admin only)
    // ====================
    
    // Create event schedule item
    if (path === '/schedule/create') {
      const user = await getCurrentUser(request)
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      
      const profile = await getUserProfile(user.id)
      if (profile.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      
      const { date, time, title, description, display_order } = data
      
      const { data: scheduleData, error } = await supabaseAdmin
        .from('event_schedule')
        .insert({ date, time, title, description, display_order })
        .select()
        .single()
      
      if (error) throw error
      
      return NextResponse.json({ success: true, schedule: scheduleData })
    }
    
    // Update event schedule item
    if (path === '/schedule/update') {
      const user = await getCurrentUser(request)
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      
      const profile = await getUserProfile(user.id)
      if (profile.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      
      const { id, date, time, title, description, display_order } = data
      
      const { error } = await supabaseAdmin
        .from('event_schedule')
        .update({ date, time, title, description, display_order })
        .eq('id', id)
      
      if (error) throw error
      
      return NextResponse.json({ success: true })
    }
    
    // Delete event schedule item
    if (path === '/schedule/delete') {
      const user = await getCurrentUser(request)
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      
      const profile = await getUserProfile(user.id)
      if (profile.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      
      const { id } = data
      
      const { error } = await supabaseAdmin
        .from('event_schedule')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      return NextResponse.json({ success: true })
    }
    
    // ====================
    // SPONSOR ENDPOINTS (Admin only)
    // ====================
    
    // Create sponsor
    if (path === '/sponsors/create') {
      const user = await getCurrentUser(request)
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      
      const profile = await getUserProfile(user.id)
      if (profile.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      
      const { name, website_url, logo_url, display_order } = data
      
      const { data: sponsorData, error } = await supabaseAdmin
        .from('sponsors')
        .insert({ name, website_url, logo_url, display_order })
        .select()
        .single()
      
      if (error) throw error
      
      return NextResponse.json({ success: true, sponsor: sponsorData })
    }
    
    // Update sponsor
    if (path === '/sponsors/update') {
      const user = await getCurrentUser(request)
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      
      const profile = await getUserProfile(user.id)
      if (profile.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      
      const { id, name, website_url, logo_url, display_order } = data
      
      const { error } = await supabaseAdmin
        .from('sponsors')
        .update({ name, website_url, logo_url, display_order })
        .eq('id', id)
      
      if (error) throw error
      
      return NextResponse.json({ success: true })
    }
    
    // Delete sponsor
    if (path === '/sponsors/delete') {
      const user = await getCurrentUser(request)
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      
      const profile = await getUserProfile(user.id)
      if (profile.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      
      const { id } = data
      
      const { error } = await supabaseAdmin
        .from('sponsors')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      return NextResponse.json({ success: true })
    }
    
    return NextResponse.json({ error: 'Invalid endpoint' }, { status: 404 })
    
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ 
      error: error.message || 'Internal server error' 
    }, { status: 500 })
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const path = searchParams.get('path')
    
    if (path === '/health') {
      return NextResponse.json({ status: 'ok' })
    }
    
    return NextResponse.json({ error: 'Invalid endpoint' }, { status: 404 })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ 
      error: error.message || 'Internal server error' 
    }, { status: 500 })
  }
}
