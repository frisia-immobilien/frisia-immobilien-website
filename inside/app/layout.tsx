import type {Metadata, Viewport} from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Frisia Inside',
  description: 'Internes Steuerungszentrum fuer Frisia Immobilien.',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  )
}
