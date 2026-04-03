import { Barlow_Condensed, Inter, Orbitron } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'

// Font configurations
const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700', '800', '900'],
  style: ['normal', 'italic'],
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-orbitron',
  weight: ['400', '500', '600', '700', '800', '900'],
})

export const metadata = {
  title: 'Expo Car Meeting 2026 - Fălticeni',
  description: 'Înscrie-ți mașina la evenimentul auto spectaculos - Stadionul Nada Florilor, 6-7 Iunie 2026',
  generator: 'Next.js',
}

export default function RootLayout({ children }) {
  return (
    <html
      lang="ro"
      className={`${barlowCondensed.variable} ${inter.variable} ${orbitron.variable} dark`}
    >
      <body className="font-sans antialiased relative z-10">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
