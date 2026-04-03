'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Car, Upload, X, ArrowLeft, CheckCircle, Image as ImageIcon } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function RegisterCarPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: '',
    description: ''
  })
  const [imageFiles, setImageFiles] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])

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
  }

  function handleImageSelect(e) {
    const files = Array.from(e.target.files)
    
    if (imageFiles.length + files.length > 5) {
      toast.error('Poți încărca maxim 5 imagini')
      return
    }

    const newImages = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} nu este o imagine`)
        return false
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} este prea mare (max 5MB)`)
        return false
      }
      return true
    })

    setImageFiles([...imageFiles, ...newImages.slice(0, 5 - imageFiles.length)])
    
    newImages.slice(0, 5 - imageFiles.length).forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result])
      }
      reader.readAsDataURL(file)
    })
  }

  function removeImage(index) {
    setImageFiles(imageFiles.filter((_, i) => i !== index))
    setImagePreviews(imagePreviews.filter((_, i) => i !== index))
  }

  async function uploadImages() {
    if (imageFiles.length === 0) return []

    setUploading(true)
    const uploadedUrls = []

    try {
      for (const file of imageFiles) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        
        const { data, error } = await supabase.storage
          .from('car-images')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          })

        if (error) throw error

        const { data: { publicUrl } } = supabase.storage
          .from('car-images')
          .getPublicUrl(fileName)

        uploadedUrls.push(publicUrl)
      }

      return uploadedUrls
    } catch (error) {
      console.error('Upload error:', error)
      throw error
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    
    if (!user) {
      toast.error('Trebuie să fii autentificat')
      return
    }

    if (imageFiles.length === 0) {
      toast.error('Te rugăm să adaugi cel puțin o imagine')
      return
    }

    setLoading(true)

    try {
      // Upload images first
      const imageUrls = await uploadImages()

      // Register car
      const { data, error } = await supabase
        .from('cars')
        .insert({
          user_id: user.id,
          make: formData.make,
          model: formData.model,
          year: formData.year ? parseInt(formData.year) : null,
          description: formData.description,
          images: imageUrls,
          status: 'pending'
        })
        .select()
        .single()

      if (error) throw error

      toast.success('Mașina a fost înregistrată cu succes! 🎉', {
        description: 'Vei primi un email când va fi aprobată'
      })
      
      router.push('/')
    } catch (error) {
      console.error('Registration error:', error)
      toast.error(error.message || 'Eroare la înregistrarea mașinii')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e] flex items-center justify-center">
        <div className="text-white">Se încarcă...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e] relative overflow-hidden py-12 px-4">
      {/* Background particles */}
      <div className="particle-bg">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
      </div>

      <div className="relative z-10 max-w-3xl mx-auto">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="text-cyan-400 hover:text-cyan-300">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Înapoi la Home
            </Button>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-gradient-to-br from-white/10 to-white/5 border-white/20 backdrop-blur-xl">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="glow-box rounded-full p-4 bg-gradient-to-br from-pink-500 to-orange-500">
                  <Car className="w-8 h-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold gradient-text">Înregistrează-ți Mașina</CardTitle>
              <CardDescription className="text-gray-400">
                Completează formularul pentru a participa la Expo Car Meeting 2026
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="make" className="text-gray-200">Marcă *</Label>
                    <Input
                      id="make"
                      placeholder="ex: BMW, Audi, Mercedes"
                      value={formData.make}
                      onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                      required
                      className="bg-white/5 border-white/20 text-white placeholder:text-gray-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="model" className="text-gray-200">Model *</Label>
                    <Input
                      id="model"
                      placeholder="ex: M3, RS6, AMG GT"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      required
                      className="bg-white/5 border-white/20 text-white placeholder:text-gray-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="year" className="text-gray-200">An fabricație</Label>
                  <Input
                    id="year"
                    type="number"
                    placeholder="ex: 2023"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    className="bg-white/5 border-white/20 text-white placeholder:text-gray-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-gray-200">Descriere</Label>
                  <Textarea
                    id="description"
                    placeholder="Spune-ne despre mașina ta, modificările, dotările speciale..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="bg-white/5 border-white/20 text-white placeholder:text-gray-500"
                  />
                </div>

                {/* Image upload */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-gray-200">
                      Imagini * (maxim 5)
                    </Label>
                    <span className="text-sm text-gray-400">
                      {imageFiles.length}/5 imagini
                    </span>
                  </div>

                  {imageFiles.length < 5 && (
                    <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-cyan-400/50 transition-colors cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageSelect}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-white mb-2">Încarcă imagini</p>
                        <p className="text-sm text-gray-400">
                          PNG, JPG, WEBP până la 5MB
                        </p>
                      </label>
                    </div>
                  )}

                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {imagePreviews.map((preview, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="relative group"
                        >
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-white/20"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          {index === 0 && (
                            <div className="absolute bottom-2 left-2 bg-cyan-500 text-white text-xs px-2 py-1 rounded">
                              Principală
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-cyan-400 mt-0.5" />
                    <div className="text-sm text-gray-300">
                      <p className="font-semibold text-white mb-1">Procesul de aprobare</p>
                      <p>Mașina ta va fi evaluată de administratori. Vei primi un email cu rezultatul în cel mai scurt timp.</p>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading || uploading}
                  className="w-full bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white font-bold py-6 text-lg"
                >
                  {loading || uploading ? (
                    uploading ? 'Se încarcă imaginile...' : 'Se înregistrează...'
                  ) : (
                    <>
                      <Car className="w-5 h-5 mr-2" />
                      Înregistrează Mașina
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
