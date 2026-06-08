import type {Metadata} from 'next'
import {SchaufensterTvDisplay} from './SchaufensterTvDisplay'

export const metadata: Metadata = {
  title: 'Schaufenster TV | Frisia Inside',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
}

export default function SchaufensterTvLivePage() {
  return (
    <>
      <SchaufensterTvDisplay />
      <script src="/schaufenster-tv-live-rescue.js" defer />
    </>
  )
}
