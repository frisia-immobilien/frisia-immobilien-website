'use client'

import Image from 'next/image'
import {useEffect} from 'react'

type ThanksValue = {closed?: boolean}

type Props = {
  value?: ThanksValue
  onChange: (v: ThanksValue) => void
  onNext?: () => void
  context?: unknown
}

export default function Step16ThanksSection({value, onChange}: Props) {
  useEffect(() => {
    onChange({closed: !!value?.closed})
  }, [onChange, value?.closed])

  return (
    <div className="text-center">
      <h2 className="text-xl font-normal tracking-tight text-brand-navy">Vielen Dank!</h2>
      <p className="mt-2 text-neutral-600">
        Wir haben alle Informationen erhalten und werden uns in Kürze bei Dir melden.
      </p>

      <div className="mt-10 mx-auto flex h-60 w-60 items-center justify-center">
        <Image
          src="/immobilienbewertung/icons/immobilienbewertung-danke-aurich.webp"
          alt="Abschluss der Immobilienbewertung"
          width={240}
          height={240}
          sizes="240px"
          className="h-60 w-60 object-contain"
        />
      </div>
    </div>
  )
}
