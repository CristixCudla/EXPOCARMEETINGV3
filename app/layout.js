import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Expo Car Meeting 2026 - Fălticeni',
  description: 'Eveniment auto spectaculos la Stadionul Nada Florilor, 6-7 Iunie 2026',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ro" className="dark">
      <body className={inter.className}>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
