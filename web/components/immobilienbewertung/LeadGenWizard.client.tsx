'use client'

/**
 * LeadGenWizardClient (Client)
 * ------------------------------------------------------------
 */

import Image from 'next/image'
import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import PropertyTypeSection from './sections/PropertyType.section'
import HouseTypeSection from './sections/HouseType.section'
import LivingAreaSection from './sections/LivingArea.section'
import LandSizeSection from './sections/LandSize.section'
import YearSection from './sections/Year.section'
import ConditionSection from './sections/Condition.section'
import EnergySection from './sections/Energy.section'
import QualitySection from './sections/Quality.section'
import ExtrasSection from './sections/Extras.section'
import LocationSection from './sections/Location.section'
import ReasonSection from './sections/Reason.section'
import UsageSection from './sections/Usage.section'
import EmailConsentSection from './sections/EmailConsent.section'
import PersonSection from './sections/Person.section'
import ResultSection from './sections/Result.section'
import ThanksSection from './sections/Thanks.section'
import {
  hasLeadSyncCaptureRequirements,
  type LeadSyncPayload,
} from '@/lib/lead-sync'

import LandErschliessungSection from './sections/LandErschliessung.section'
import LandBebaubarkeitSection from './sections/LandBebaubarkeit.section'
import LandBebauungsgebietSection from './sections/LandBebauungsgebiet.section'

const FINALIZE_TIMEOUT_MS = 30000

/* ============================================================
   TYPES
============================================================ */

export type PropertyTypeCore = 'apartment' | 'house' | 'land' | 'commercial' | 'unknown'
export type LeadGenWizardPropertyType = Exclude<PropertyTypeCore, 'commercial' | 'unknown'>

export type LeadGenWizardProps = {
  layout?: 'embedded' | 'page'
  initialPropertyType?: LeadGenWizardPropertyType
  idPrefix?: string
  onReady?: () => void
  onExitToEntry?: () => void
  onCloseToEntry?: () => void
}

type Step01Data = {
  type?: PropertyTypeCore
  propertyType?: unknown
  property_type?: unknown
  category?: unknown
  value?: unknown
}

type Step02HouseTypeData = {
  houseType?: 'single_family' | 'semi_detached' | 'row_mid' | 'row_end' | 'multi_family'
}

type Step03Data = {livingArea?: number; rooms?: number; landSize?: number}
type Step05Data = {yearBuilt?: number}
type Step06Data = {
  energy?: 'unknown' | 'a_b' | 'c_d' | 'e_h' | 'no_data'
  energyClass?: string | null
  energyKnown?: 'unknown' | 'yes' | 'no'
}
type Step07Data = {
  condition?:
    | 'unknown'
    | 'needs_work'
    | 'new_modernized'
    | 'well_kept'
}
type Step08Data = {
  qualityId?: 'simple' | 'medium' | 'high' | 'very_high' | 'unknown'
  qualityLabel?: string
}
type Step09Data = {extras?: string[]; otherExtras?: string; otherExtrasValueEur?: number}
type Step10Data = {reason?: 'sale' | 'buy' | 'rent_out' | 'unknown'}
type Step11Data = {usage?: 'rented' | 'owner_occupied' | 'vacant' | 'unknown'}
type LandErschliessungData = {status?: 'yes' | 'partial' | 'no'}
type LandBebaubarkeitData = {status?: 'short_term' | 'limited' | 'not_buildable' | 'unknown'}
type LandBebauungsgebietData = {status?: 'wohn' | 'gewerbe' | 'misch'}
type Step09LocationData = {
  postalCode?: string
  city?: string
  district?: string
  street?: string
  houseNumber?: string
  regionHint?: 'aurich' | 'ostfriesland' | 'other'
  lat?: number
  lon?: number
  canProceed?: boolean
}
type Step13EmailConsentData = {email?: string; consent?: boolean; captchaToken?: string; __valid?: boolean}
type Step14PersonData = {
  salutation?: 'mrs' | 'mr' | 'none'
  firstName?: string
  lastName?: string
  phone?: string
  notes?: string
  __valid?: boolean
}
type Step15ResultData = {
  status?: 'idle' | 'pending' | 'ready' | 'error'
  animationComplete?: boolean
  emailDispatchStatus?: 'idle' | 'pending' | 'sent' | 'error'
  manualReview?: boolean
  manualReviewReason?: string
  leadId?: string
  reportId?: string
  valueMid?: number
  rangeMin?: number
  rangeMax?: number
  currency?: 'EUR'
  landingUrl?: string
  email?: string
  emailProvider?: string
  emailSentAt?: string
  expiresAt?: string
  error?: string
}
type Step16ThanksData = {closed?: boolean}

type LeadData = {
  step01?: Step01Data

  step02HouseType?: Step02HouseTypeData

  step03?: Step03Data
  step05?: Step05Data
  step06?: Step06Data
  step07?: Step07Data
  step08?: Step08Data
  step09?: Step09Data
  step10?: Step10Data
  step11?: Step11Data

  landErschliessung?: LandErschliessungData
  landBebaubarkeit?: LandBebaubarkeitData
  landBebauungsgebiet?: LandBebauungsgebietData
  step09Location?: Step09LocationData
  step13EmailConsent?: Step13EmailConsentData
  step14Person?: Step14PersonData
  step15Result?: Step15ResultData
  step16Thanks?: Step16ThanksData
}

function emitLeadEvent(detail: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent('frisia:lead', {detail}))
}

/* ============================================================
   HELPERS
============================================================ */

function normalizeType(raw: unknown): PropertyTypeCore {
  const s = String(raw ?? '')
    .trim()
    .toLowerCase()
  if (s === 'house' || s === 'haus') return 'house'
  if (s === 'apartment' || s === 'wohnung') return 'apartment'
  if (s === 'land' || s === 'grundstück' || s === 'grundstueck' || s === 'baugrundstück')
    return 'land'
  if (s === 'commercial' || s === 'gewerbe') return 'commercial'
  return 'unknown'
}

function getSelectedType(step01?: Step01Data): PropertyTypeCore {
  const candidates = [
    step01?.type,
    step01?.propertyType,
    step01?.property_type,
    step01?.category,
    step01?.value,
  ]
  for (const c of candidates) {
    const t = normalizeType(c)
    if (t !== 'unknown') return t
  }
  return 'unknown'
}

function isAllowedToProceedFromStep01(t: PropertyTypeCore) {
  return t === 'house' || t === 'apartment' || t === 'land'
}

function isGermanPlz(plz: unknown) {
  const s = String(plz ?? '').trim()
  return /^\d{5}$/.test(s)
}

function normalizeString(value: unknown) {
  return String(value ?? '').trim()
}

function normalizeOptionalString(value: unknown) {
  const normalized = normalizeString(value)
  return normalized.length > 0 ? normalized : undefined
}

function normalizeOptionalNumber(value: unknown) {
  const numeric = Number(value)
  return Number.isFinite(numeric) && numeric > 0 ? numeric : undefined
}

function isSelectedReason(value: unknown) {
  return value === 'sale' || value === 'buy' || value === 'rent_out'
}

function isSelectedUsage(value: unknown) {
  return value === 'rented' || value === 'owner_occupied' || value === 'vacant'
}

function isValidLeadPhone(value: unknown) {
  const normalized = String(value ?? '').trim()
  if (!normalized) return false
  if (!/^[0-9+()\-/.\s]+$/.test(normalized)) return false
  return normalized.replace(/\D/g, '').length >= 7
}

function getFinalizeValidationError(leadData: LeadData, selectedType: PropertyTypeCore) {
  const email = normalizeOptionalString(leadData.step13EmailConsent?.email)
  const consent = leadData.step13EmailConsent?.consent === true
  const firstName = normalizeOptionalString(leadData.step14Person?.firstName)
  const lastName = normalizeOptionalString(leadData.step14Person?.lastName)
  const phone = normalizeOptionalString(leadData.step14Person?.phone)
  const livingArea = normalizeOptionalNumber(leadData.step03?.livingArea)
  const landSize = normalizeOptionalNumber(leadData.step03?.landSize)
  const rooms = normalizeOptionalNumber(leadData.step03?.rooms)
  const yearBuilt = normalizeOptionalNumber(leadData.step05?.yearBuilt)
  const reason = leadData.step10?.reason
  const usage = leadData.step11?.usage

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return 'Bitte zuerst eine gültige E-Mail-Adresse eingeben.'
  }

  if (!consent) {
    return 'Bitte der Zusendung der Bewertung per E-Mail zustimmen.'
  }

  if (!firstName || !lastName) {
    return 'Bitte Vor- und Nachnamen vervollständigen.'
  }

  if (!phone || !isValidLeadPhone(phone)) {
    return 'Bitte eine gültige Telefonnummer angeben.'
  }

  if (selectedType === 'house' || selectedType === 'apartment') {
    if (!livingArea) return 'Für die Bewertung wird eine Wohnfläche benötigt.'
    if (!yearBuilt) return 'Für die Bewertung wird ein Baujahr benötigt.'
    if (!isSelectedReason(reason)) return 'Bitte den Grund der Anfrage angeben.'
    if (!isSelectedUsage(usage)) return 'Bitte die aktuelle Nutzung der Immobilie angeben.'
  }

  if (selectedType === 'house') {
    if (!landSize) return 'Für Häuser wird eine Grundstücksfläche benötigt.'
    if (!rooms) return 'Für Häuser wird eine Zimmeranzahl benötigt.'
  }

  if (selectedType === 'apartment') {
    if (!rooms) return 'Für Wohnungen wird eine Zimmeranzahl benötigt.'
  }

  if (selectedType === 'land') {
    if (!landSize) return 'Für Grundstücke wird eine Grundstücksfläche benötigt.'
    if (!leadData.landErschliessung?.status) return 'Bitte den Erschließungsstatus angeben.'
    if (!leadData.landBebaubarkeit?.status) return 'Bitte die Bebaubarkeit angeben.'
    if (!leadData.landBebauungsgebiet?.status) return 'Bitte das Bebauungsgebiet angeben.'
  }

  return null
}

function buildLeadSyncPayload(leadData: LeadData, selectedType: PropertyTypeCore): LeadSyncPayload {
  return {
    propertyType:
      selectedType === 'house' || selectedType === 'apartment' || selectedType === 'land'
        ? selectedType
        : undefined,
    houseType: leadData.step02HouseType?.houseType,
    email: normalizeOptionalString(leadData.step13EmailConsent?.email)?.toLowerCase(),
    consent: leadData.step13EmailConsent?.consent === true,
    location: {
      postalCode: normalizeOptionalString(leadData.step09Location?.postalCode),
      city: normalizeOptionalString(leadData.step09Location?.city),
      district: normalizeOptionalString(leadData.step09Location?.district),
      street: normalizeOptionalString(leadData.step09Location?.street),
      houseNumber: normalizeOptionalString(leadData.step09Location?.houseNumber),
      regionHint: leadData.step09Location?.regionHint,
      lat:
        typeof leadData.step09Location?.lat === 'number' && Number.isFinite(leadData.step09Location.lat)
          ? leadData.step09Location.lat
          : undefined,
      lon:
        typeof leadData.step09Location?.lon === 'number' && Number.isFinite(leadData.step09Location.lon)
          ? leadData.step09Location.lon
          : undefined,
      canProceed: leadData.step09Location?.canProceed,
    },
    person: {
      salutation: leadData.step14Person?.salutation,
      firstName: normalizeOptionalString(leadData.step14Person?.firstName),
      lastName: normalizeOptionalString(leadData.step14Person?.lastName),
      phone: normalizeOptionalString(leadData.step14Person?.phone),
      notes: normalizeOptionalString(leadData.step14Person?.notes),
    },
    facts: {
      livingArea: normalizeOptionalNumber(leadData.step03?.livingArea),
      landSize: normalizeOptionalNumber(leadData.step03?.landSize),
      rooms: normalizeOptionalNumber(leadData.step03?.rooms),
      yearBuilt: normalizeOptionalNumber(leadData.step05?.yearBuilt),
      energyClass: normalizeOptionalString(leadData.step06?.energyClass) ?? null,
      energyKnown: leadData.step06?.energyKnown,
      condition: leadData.step07?.condition,
      qualityId: leadData.step08?.qualityId,
      extras: Array.isArray(leadData.step09?.extras)
        ? leadData.step09.extras.filter(Boolean)
        : undefined,
      otherExtras: normalizeOptionalString(leadData.step09?.otherExtras),
      otherExtrasValueEur: normalizeOptionalNumber(leadData.step09?.otherExtrasValueEur),
      reason: leadData.step10?.reason,
      usage: leadData.step11?.usage,
      erschliessung: leadData.landErschliessung?.status,
      bebaubarkeit: leadData.landBebaubarkeit?.status,
      bebauungsgebiet: leadData.landBebauungsgebiet?.status,
    },
  }
}

/**
 * Wizard-Step Keys
 */
type StepKey =
  | 'type'
  | 'house_type' // ✅ neu
  | 'living'
  | 'landsize'
  | 'year'
  | 'energy'
  | 'condition'
  | 'quality'
  | 'extras'
  | 'reason'
  | 'usage'
  | 'land_erschliessung'
  | 'land_bebaubarkeit'
  | 'land_bebauungsgebiet'
  | 'location'
  | 'email'
  | 'person'
  | 'result'
  | 'thanks'

/* ============================================================
   COMPONENT
============================================================ */

export default function LeadGenWizardClient(props: LeadGenWizardProps) {
  const {initialPropertyType, onReady, onExitToEntry, onCloseToEntry} = props
  const idPrefix = props.idPrefix ?? 'leadgen'
  const wizardTopRef = useRef<HTMLDivElement | null>(null)
  const didMountRef = useRef(false)
  const lastTrackedStepRef = useRef<string>('')
  const hasCompletedRef = useRef(false)
  const stepStateRef = useRef({
    stepKey: 'type' as StepKey,
    stepNowUI: 1,
    progress: 1,
    selectedType: 'unknown' as PropertyTypeCore,
  })

  useEffect(() => {
    onReady?.()
  }, [onReady])

  const [leadData, setLeadData] = useState<LeadData>(() => ({
    step01: {type: initialPropertyType ?? 'unknown'},
  }))

  const [wizardResetKey, setWizardResetKey] = useState(0)
  const [crmLeadId, setCrmLeadId] = useState<string | null>(null)
  const syncTimerRef = useRef<number | null>(null)
  const lastSuccessfulSyncSignatureRef = useRef<string>('')
  const finalizeAbortRef = useRef<AbortController | null>(null)
  const lastFinalizeSignatureRef = useRef<string>('')

  const selectedType = useMemo(() => getSelectedType(leadData.step01), [leadData.step01])
  const isLand = selectedType === 'land'
  const isHouse = selectedType === 'house'
  const syncPayload = useMemo(() => buildLeadSyncPayload(leadData, selectedType), [leadData, selectedType])
  const syncPayloadSignature = useMemo(() => JSON.stringify(syncPayload), [syncPayload])
  const canBackgroundSync = useMemo(() => hasLeadSyncCaptureRequirements(syncPayload), [syncPayload])
  const finalizeValidationError = useMemo(
    () => getFinalizeValidationError(leadData, selectedType),
    [leadData, selectedType],
  )
  const finalizeSignature = useMemo(
    () =>
      JSON.stringify({
        leadId: crmLeadId,
        payload: syncPayload,
        captchaToken: leadData.step13EmailConsent?.captchaToken,
      }),
    [crmLeadId, syncPayload, leadData.step13EmailConsent?.captchaToken],
  )

  const steps: StepKey[] = useMemo(() => {
    if (isLand) {
      return [
        'type',
        'landsize',
        'land_erschliessung',
        'land_bebaubarkeit',
        'land_bebauungsgebiet',
        'location',
        'email',
        'person',
        'result',
        'thanks',
      ]
    }

    // ✅ Haus: zusätzlicher Haustyp-Step nach "type"
    if (isHouse) {
      return [
        'type',
        'house_type',
        'living',
        'landsize',
        'year',
        'energy',
        'condition',
        'quality',
        'extras',
        'reason',
        'usage',
        'location',
        'email',
        'person',
        'result',
        'thanks',
      ]
    }

    // Wohnung: ohne Haustyp-Step
    return [
      'type',
      'living',
      'landsize',
      'year',
      'energy',
      'condition',
      'quality',
      'extras',
      'reason',
      'usage',
      'location',
      'email',
      'person',
      'result',
      'thanks',
    ]
  }, [isLand, isHouse])

  const TOTAL_STEPS_UI = initialPropertyType ? Math.max(1, steps.length - 1) : steps.length

  const [stepIndex, setStepIndex] = useState<number>(() => (initialPropertyType ? 1 : 0))
  const effectiveStepIndex =
    stepIndex > 0 && !isAllowedToProceedFromStep01(selectedType) ? 0 : stepIndex
  const stepKey = steps[effectiveStepIndex] ?? 'type'
  const closeLabel = 'Schließen'
  const closeAriaLabel = 'Wizard schließen'

  const closeWizard = useCallback(() => {
    // ✅ "Schließen" = kompletter Close nach außen (Entry entscheidet, ob Auswahl bleibt oder reset)
    if (typeof onCloseToEntry === 'function') {
      onCloseToEntry()
      return
    }

    // Fallback (falls Wizard irgendwo ohne Entry genutzt wird)
    setWizardResetKey((k) => k + 1)
    setLeadData({step01: {type: 'unknown'}})
    setStepIndex(0)
    setCrmLeadId(null)
    lastSuccessfulSyncSignatureRef.current = ''
    lastFinalizeSignatureRef.current = ''

    if (finalizeAbortRef.current) {
      finalizeAbortRef.current.abort()
      finalizeAbortRef.current = null
    }

    requestAnimationFrame(() => {
      document.getElementById('bewertung')?.scrollIntoView({behavior: 'smooth', block: 'start'})
    })
  }, [onCloseToEntry])

  const stepNowUI =
    props.initialPropertyType ? Math.max(1, effectiveStepIndex) : effectiveStepIndex + 1
  const progress = Math.max(1, Math.min(100, Math.round((stepNowUI / TOTAL_STEPS_UI) * 100)))

  useEffect(() => {
    const key = `${stepKey}:${stepNowUI}`
    if (lastTrackedStepRef.current === key) return
    lastTrackedStepRef.current = key

    emitLeadEvent({
      event: 'lead_step_view',
      step_key: stepKey,
      step_ui: stepNowUI,
      progress,
      property_type: selectedType,
    })

    if (stepKey === 'thanks') {
      hasCompletedRef.current = true
      emitLeadEvent({
        event: 'lead_submit_success',
        property_type: selectedType,
        total_steps_ui: TOTAL_STEPS_UI,
      })
    }

    stepStateRef.current = {
      stepKey,
      stepNowUI,
      progress,
      selectedType,
    }
  }, [stepKey, stepNowUI, progress, selectedType, TOTAL_STEPS_UI])

  const scrollWizardToTop = useCallback(() => {
    requestAnimationFrame(() => {
      wizardTopRef.current?.scrollIntoView({behavior: 'auto', block: 'start'})
    })
  }, [])

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true
      return
    }
    scrollWizardToTop()
  }, [stepIndex, scrollWizardToTop])

  const canGoBack = effectiveStepIndex > 0

  /* =========================
     SETTERS
  ========================= */

  const setStep01 = useCallback((v: Step01Data) => setLeadData((p) => ({...p, step01: v})), [])
  const setStep02HouseType = useCallback(
    (v: Step02HouseTypeData) => setLeadData((p) => ({...p, step02HouseType: v})),
    [],
  )

  const mergeStep03 = useCallback(
    (v: Step03Data) => setLeadData((p) => ({...p, step03: {...(p.step03 ?? {}), ...(v ?? {})}})),
    [],
  )

  const setStep05 = useCallback((v: Step05Data) => setLeadData((p) => ({...p, step05: v})), [])
  const setStep06 = useCallback((v: Step06Data) => setLeadData((p) => ({...p, step06: v})), [])
  const setStep07 = useCallback((v: Step07Data) => setLeadData((p) => ({...p, step07: v})), [])
  const setStep08 = useCallback((v: Step08Data) => setLeadData((p) => ({...p, step08: v})), [])
  const setStep09 = useCallback((v: Step09Data) => setLeadData((p) => ({...p, step09: v})), [])

  const setStep10 = useCallback((v: Step10Data) => setLeadData((p) => ({...p, step10: v})), [])
  const setStep11 = useCallback((v: Step11Data) => setLeadData((p) => ({...p, step11: v})), [])

  const setStep09Location = useCallback(
    (v: Step09LocationData) => setLeadData((p) => ({...p, step09Location: v})),
    [],
  )

  const setLandErschliessung = useCallback(
    (v: LandErschliessungData) => setLeadData((p) => ({...p, landErschliessung: v})),
    [],
  )
  const setLandBebaubarkeit = useCallback(
    (v: LandBebaubarkeitData) => setLeadData((p) => ({...p, landBebaubarkeit: v})),
    [],
  )
  const setLandBebauungsgebiet = useCallback(
    (v: LandBebauungsgebietData) => setLeadData((p) => ({...p, landBebauungsgebiet: v})),
    [],
  )

  const setStep13EmailConsent = useCallback(
    (v: Step13EmailConsentData) => setLeadData((p) => ({...p, step13EmailConsent: v})),
    [],
  )
  const setStep14Person = useCallback(
    (v: Step14PersonData) => setLeadData((p) => ({...p, step14Person: v})),
    [],
  )
  const setStep15Result = useCallback(
    (v: Step15ResultData) => setLeadData((p) => ({...p, step15Result: v})),
    [],
  )
  const setStep16Thanks = useCallback(
    (v: Step16ThanksData) => setLeadData((p) => ({...p, step16Thanks: v})),
    [],
  )

  /* =========================
     VALIDATION
  ========================= */

  const step13Valid = useMemo(() => {
    const v = leadData.step13EmailConsent?.__valid
    return v === undefined ? false : Boolean(v)
  }, [leadData.step13EmailConsent])

  const step14Valid = useMemo(() => {
    const v = leadData.step14Person?.__valid
    return v === undefined ? false : Boolean(v)
  }, [leadData.step14Person])

  const stepHouseNumberMissing = useMemo(() => {
    if (stepKey !== 'location') return false
    const plzOk = isGermanPlz(leadData.step09Location?.postalCode)
    const cityOk = String(leadData.step09Location?.city ?? '').trim().length >= 2
    const streetOk = String(leadData.step09Location?.street ?? '').trim().length >= 2
    const nr = String(leadData.step09Location?.houseNumber ?? '').trim()
    return plzOk && cityOk && streetOk && nr.length === 0
  }, [stepKey, leadData.step09Location])

  const canGoNext = useMemo(() => {
    if (stepKey === 'type') return isAllowedToProceedFromStep01(selectedType)

    // ✅ neu: Haus-Untertyp muss gewählt sein
    if (stepKey === 'house_type') return Boolean(leadData.step02HouseType?.houseType)

    if (stepKey === 'living') {
      return Number(leadData.step03?.livingArea ?? 0) > 0 && Number(leadData.step03?.rooms ?? 0) > 0
    }

    if (stepKey === 'landsize') {
      const size = Number(leadData.step03?.landSize ?? 0)
      if (selectedType === 'apartment') return size >= 0
      return size > 0
    }

    if (stepKey === 'land_erschliessung') return Boolean(leadData.landErschliessung?.status)
    if (stepKey === 'land_bebaubarkeit') return Boolean(leadData.landBebaubarkeit?.status)
    if (stepKey === 'land_bebauungsgebiet') return Boolean(leadData.landBebauungsgebiet?.status)

    if (stepKey === 'year') return Boolean(leadData.step05)
    if (stepKey === 'energy') return Boolean(leadData.step06)
    if (stepKey === 'condition') return Boolean(leadData.step07)
    if (stepKey === 'quality') return Boolean(leadData.step08)
    if (stepKey === 'extras') return Boolean(leadData.step09)

    if (stepKey === 'reason') return isSelectedReason(leadData.step10?.reason)
    if (stepKey === 'usage') return isSelectedUsage(leadData.step11?.usage)

    if (stepKey === 'location') {
      const plzOk = isGermanPlz(leadData.step09Location?.postalCode)
      const cityOk = String(leadData.step09Location?.city ?? '').trim().length >= 2
      const streetOk = String(leadData.step09Location?.street ?? '').trim().length >= 2
      const nrOk = String(leadData.step09Location?.houseNumber ?? '').trim().length >= 1

      const sectionCanProceed = leadData.step09Location?.canProceed
      if (typeof sectionCanProceed === 'boolean')
        return plzOk && cityOk && streetOk && nrOk && sectionCanProceed

      return plzOk && cityOk && streetOk && nrOk
    }

    if (stepKey === 'email') return step13Valid
    if (stepKey === 'person') return step14Valid

    if (stepKey === 'result')
      return leadData.step15Result?.status === 'ready' && leadData.step15Result?.animationComplete === true
    if (stepKey === 'thanks') return true

    return false
  }, [stepKey, selectedType, leadData, step13Valid, step14Valid])
  const rawFinalEmailStatus = leadData.step15Result?.emailDispatchStatus
  const finalEmailStatus = rawFinalEmailStatus ?? 'pending'
  const canCloseFinalStep = stepKey !== 'thanks' || finalEmailStatus === 'sent' || finalEmailStatus === 'error'

  /* =========================
     NAVIGATION
  ========================= */

  const goNext = useCallback(() => {
    if (!canGoNext) return
    emitLeadEvent({
      event: 'lead_next_click',
      step_key: stepKey,
      step_ui: stepNowUI,
      property_type: selectedType,
    })
    setStepIndex((i) => Math.min(i + 1, steps.length - 1))
  }, [canGoNext, steps.length, stepKey, stepNowUI, selectedType])

  const goBack = useCallback(() => {
    emitLeadEvent({
      event: 'lead_back_click',
      step_key: stepKey,
      step_ui: stepNowUI,
      property_type: selectedType,
    })
    // ✅ Embedded-Flow: Step01 ist im Entry, erster Wizard-Step ist stepIndex === 1
    if (initialPropertyType && stepIndex === 1) {
      onExitToEntry?.()
      return
    }
    if (stepIndex <= 0) return
    setStepIndex((i) => Math.max(i - 1, 0))
  }, [stepIndex, initialPropertyType, onExitToEntry, stepKey, stepNowUI, selectedType])

  useEffect(() => {
    const emitAbandon = () => {
      if (hasCompletedRef.current) return
      const current = stepStateRef.current
      if (current.stepNowUI <= 1) return
      emitLeadEvent({
        event: 'lead_abandon',
        step_key: current.stepKey,
        step_ui: current.stepNowUI,
        progress: current.progress,
        property_type: current.selectedType,
      })
    }

    const onBeforeUnload = () => emitAbandon()
    window.addEventListener('beforeunload', onBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload)
      emitAbandon()
    }
  }, [])

  useEffect(() => {
    if (!canBackgroundSync) return
    if (lastSuccessfulSyncSignatureRef.current === syncPayloadSignature) return

    if (syncTimerRef.current) window.clearTimeout(syncTimerRef.current)

    syncTimerRef.current = window.setTimeout(async () => {
      try {
        const response = await fetch('/api/lead/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            leadId: crmLeadId,
            phase: stepKey,
            payload: syncPayload,
          }),
        })

        const data = (await response.json()) as {
          success?: boolean
          leadId?: string | null
          error?: string
        }

        if (data.leadId) {
          setCrmLeadId(data.leadId)
        }

        if (!response.ok || data.success !== true || !data.leadId) {
          throw new Error(data.error || 'Lead-Sync fehlgeschlagen.')
        }

        setCrmLeadId(data.leadId)
        lastSuccessfulSyncSignatureRef.current = syncPayloadSignature
      } catch (error) {
        console.error('Lead-Sync fehlgeschlagen', error)
      }
    }, 550)

    return () => {
      if (syncTimerRef.current) window.clearTimeout(syncTimerRef.current)
    }
  }, [canBackgroundSync, crmLeadId, stepKey, syncPayload, syncPayloadSignature])

  const finalizeCaptchaToken = leadData.step13EmailConsent?.captchaToken

  const runFinalize = useCallback(
    async (force = false) => {
      if (stepKey !== 'thanks') return

      if (finalizeValidationError) {
        setStep15Result({
          status: 'ready',
          animationComplete: true,
          emailDispatchStatus: 'error',
          error: finalizeValidationError,
        })
        return
      }

      if (!crmLeadId && !canBackgroundSync) {
        setStep15Result({
          status: 'ready',
          animationComplete: true,
          emailDispatchStatus: 'error',
          error: 'Die Bewertungsdaten sind noch nicht vollständig erfasst.',
        })
        return
      }

      if (!force && lastFinalizeSignatureRef.current === finalizeSignature) {
        return
      }

      if (finalizeAbortRef.current) {
        finalizeAbortRef.current.abort()
      }

      const abortController = new AbortController()
      finalizeAbortRef.current = abortController
      lastFinalizeSignatureRef.current = finalizeSignature
      let latestLeadId = crmLeadId ?? undefined
      let didTimeout = false
      const timeoutId = window.setTimeout(() => {
        didTimeout = true
        abortController.abort()
      }, FINALIZE_TIMEOUT_MS)

      setLeadData((prev) => ({
        ...prev,
        step15Result: {
          ...(prev.step15Result ?? {}),
          status: 'ready',
          animationComplete: true,
          emailDispatchStatus: 'pending',
          error: undefined,
        },
      }))

      try {
        const response = await fetch('/api/lead', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            leadId: crmLeadId,
            payload: syncPayload,
            captchaToken: finalizeCaptchaToken,
          }),
          signal: abortController.signal,
        })

        const data = (await response.json()) as {
          success?: boolean
          leadId?: string | null
          leadRequestId?: string | null
          reportId?: string | null
          error?: string
          manualReview?: boolean
          reason?: string
          value?: {
            min?: number
            mid?: number
            max?: number
          }
          landingUrl?: string
          expiresAt?: string
          emailProvider?: string | null
          email?: string
          emailSentAt?: string | null
        }

        const finalizedLeadId = data.leadId || data.leadRequestId || latestLeadId

        if (finalizedLeadId) {
          latestLeadId = finalizedLeadId
          setCrmLeadId(finalizedLeadId)
        }

        if (!response.ok || data.success !== true) {
          throw new Error(data.error || 'Bewertung konnte nicht erstellt werden.')
        }

        if (data.manualReview) {
          const emailFailed =
            data.emailProvider !== 'propstack_message' ||
            data.emailSentAt === null
          emitLeadEvent({
            event: 'lead_manual_review',
            property_type: selectedType,
            reason: data.reason || '',
          })
          setStep15Result({
            status: 'ready',
            animationComplete: true,
            emailDispatchStatus: emailFailed ? 'error' : 'sent',
            manualReview: true,
            manualReviewReason:
              data.reason ||
              'Für diese Immobilie ist eine persönliche Prüfung sinnvoll, damit keine ungenaue automatische Einordnung ausgegeben wird.',
            leadId: finalizedLeadId,
            reportId: data.reportId ?? undefined,
            email: data.email ?? syncPayload.email,
            emailProvider: data.emailProvider ?? undefined,
            emailSentAt: data.emailSentAt ?? undefined,
            error: emailFailed ? 'Die E-Mail konnte nicht versendet werden.' : undefined,
          })
          return
        }

        const emailFailed =
          data.emailProvider !== 'propstack_message' ||
          data.emailSentAt === null
        emitLeadEvent({
          event: 'lead_valuation_ready',
          property_type: selectedType,
        })
        setStep15Result({
          status: 'ready',
          animationComplete: true,
          emailDispatchStatus: emailFailed ? 'error' : 'sent',
          manualReview: false,
          leadId: finalizedLeadId,
          reportId: data.reportId ?? undefined,
          currency: 'EUR',
          email: data.email ?? syncPayload.email,
          emailProvider: data.emailProvider ?? undefined,
          emailSentAt: data.emailSentAt ?? undefined,
          expiresAt: data.expiresAt,
          error: emailFailed ? 'Die E-Mail konnte nicht versendet werden.' : undefined,
        })
      } catch (error) {
        if (abortController.signal.aborted && !didTimeout) return

        lastFinalizeSignatureRef.current = ''
        setStep15Result({
          status: 'ready',
          animationComplete: true,
          emailDispatchStatus: 'error',
          leadId: latestLeadId,
          email: syncPayload.email,
          error: didTimeout
            ? 'Der Versand dauert länger als erwartet. Bitte versuche es erneut.'
            : error instanceof Error
              ? error.message
              : 'Bewertung konnte nicht erstellt werden.',
        })
      } finally {
        window.clearTimeout(timeoutId)
        if (finalizeAbortRef.current === abortController) {
          finalizeAbortRef.current = null
        }
      }
    },
    [
      canBackgroundSync,
      crmLeadId,
      finalizeCaptchaToken,
      finalizeSignature,
      finalizeValidationError,
      selectedType,
      setStep15Result,
      stepKey,
      syncPayload,
    ],
  )

  useEffect(() => {
    if (stepKey !== 'thanks') return
    if (rawFinalEmailStatus === 'pending') {
      if (!finalizeAbortRef.current) void runFinalize(true)
      return
    }
    if (rawFinalEmailStatus === 'sent' || rawFinalEmailStatus === 'error') return
    void runFinalize()
  }, [rawFinalEmailStatus, runFinalize, stepKey])

  useEffect(() => {
    if (stepKey !== 'thanks') return
    return () => {
      if (finalizeAbortRef.current) {
        finalizeAbortRef.current.abort()
        finalizeAbortRef.current = null
      }
    }
  }, [stepKey])

  const context = useMemo(
    () => ({
      brand: {
        name: 'Frisia Immobilien',
        region: 'Regionaler Markt in Aurich und ganz Ostfriesland',
      },
      lead: leadData,
      selectedType,
    }),
    [leadData, selectedType],
  )

  /* =========================
     SECTION RENDERING
  ========================= */

  const CurrentSection = useMemo(() => {
    const shouldRenderTypeStep = stepKey === 'type' && !initialPropertyType

    if (shouldRenderTypeStep) {
      return (
        <PropertyTypeSection
          value={leadData.step01}
          onChange={setStep01}
          onNext={() => setStepIndex(1)}
        />
      )
    }

    // ✅ neu: Haus-Untertyp
    if (stepKey === 'house_type') {
      return <HouseTypeSection value={leadData.step02HouseType} onChange={setStep02HouseType} />
    }

    if (stepKey === 'living')
      return <LivingAreaSection value={leadData.step03} onChange={mergeStep03} context={context} />

    if (stepKey === 'landsize') {
          return (
        <LandSizeSection
          value={leadData.step03}
          onChange={mergeStep03}
          propertyType={selectedType}
        />
      )
    }

    if (stepKey === 'land_erschliessung')
      return (
        <LandErschliessungSection
          value={leadData.landErschliessung}
          onChange={setLandErschliessung}
        />
      )
    if (stepKey === 'land_bebaubarkeit')
      return (
        <LandBebaubarkeitSection value={leadData.landBebaubarkeit} onChange={setLandBebaubarkeit} />
      )
    if (stepKey === 'land_bebauungsgebiet')
      return (
        <LandBebauungsgebietSection
          value={leadData.landBebauungsgebiet}
          onChange={setLandBebauungsgebiet}
        />
      )

    if (stepKey === 'year') return <YearSection value={leadData.step05} onChange={setStep05} />
    if (stepKey === 'energy') return <EnergySection value={leadData.step06} onChange={setStep06} />
    if (stepKey === 'condition')
      return <ConditionSection value={leadData.step07} onChange={setStep07} />
    if (stepKey === 'quality')
      return <QualitySection value={leadData.step08} onChange={setStep08} />
    if (stepKey === 'extras') return <ExtrasSection value={leadData.step09} onChange={setStep09} />

    if (stepKey === 'reason')
      return (
        <ReasonSection
          value={leadData.step10}
          onChange={setStep10}
          onNext={goNext}
          context={context}
        />
      )
    if (stepKey === 'usage')
      return (
        <UsageSection
          value={leadData.step11}
          onChange={setStep11}
          onNext={goNext}
          context={context}
        />
      )

    if (stepKey === 'location') {
      return (
        <LocationSection
          value={leadData.step09Location}
          onChange={setStep09Location}
          onNext={goNext}
          context={context}
        />
      )
    }

    if (stepKey === 'email') {
      return (
        <div className="space-y-8">
          <EmailConsentSection
            value={leadData.step13EmailConsent}
            onChange={setStep13EmailConsent}
            onNext={goNext}
            context={context}
            idPrefix={idPrefix}
          />
        </div>
      )
    }

    if (stepKey === 'person')
      return (
        <PersonSection
          value={leadData.step14Person}
          onChange={setStep14Person}
          onNext={goNext}
          context={context}
        />
      )
    if (stepKey === 'result')
      return (
          <ResultSection
            value={leadData.step15Result}
            onChange={setStep15Result}
            onNext={goNext}
            onRetry={() => {
            lastFinalizeSignatureRef.current = ''
            void runFinalize(true)
          }}
          context={context}
        />
      )

    return (
      <ThanksSection
        value={leadData.step16Thanks}
        onChange={setStep16Thanks}
        onRetry={() => {
          lastFinalizeSignatureRef.current = ''
          void runFinalize(true)
        }}
        onNext={goNext}
        context={context}
      />
    )
  }, [
    stepKey,
    idPrefix,
    initialPropertyType,
    leadData,
    selectedType,
    context,
    goNext,
    mergeStep03,
    setStep01,
    setStep02HouseType,
    setStep05,
    setStep06,
    setStep07,
    setStep08,
    setStep09,
    setStep10,
    setStep11,
    setStep09Location,
    setLandErschliessung,
    setLandBebaubarkeit,
    setLandBebauungsgebiet,
    setStep13EmailConsent,
    setStep14Person,
    setStep15Result,
    setStep16Thanks,
    runFinalize,
  ])

  const showLeftHero = stepIndex === 0 && !props.initialPropertyType && props.layout !== 'embedded'
  const gridCols = showLeftHero ? 'lg:grid-cols-2' : 'lg:grid-cols-1'

  return (
    <section className="w-full">
      <div key={wizardResetKey}>
        <div ref={wizardTopRef} className="scroll-mt-20 lg:scroll-mt-30" />

        <div className="w-full">
          <div className={['grid items-stretch gap-6', gridCols].join(' ')}>
            {showLeftHero ? (
              <aside className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="relative h-[420px] sm:h-[520px] lg:h-full lg:min-h-[680px]">
                  <Image
                    src="/images/kontakt-beratung.webp"
                    alt="Persönliche Beratung zur Immobilienbewertung"
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover object-[70%_center]"
                  />

                  <div className="absolute inset-x-0 bottom-0">
                    <div
                      className="mx-4 mb-4 rounded-2xl p-6 shadow-lg sm:mx-6 sm:mb-6"
                      style={{ backgroundColor: "rgba(27, 48, 64, 0.95)" }}
                    >
                      <div className="text-sm font-semibold tracking-wide text-white/80">
                        PREIS- UND MARKTEINORDNUNG
                      </div>

                      <h2 className="mt-2 font-playfair text-3xl font-semibold tracking-tight text-white">
                        Online-Bewertung: Was ist meine Immobilie wert?
                      </h2>

                      <p className="mt-4 text-base leading-relaxed text-white/85">
                        Frisia Immobilien ordnet deine Immobilie realistisch ein – auf Basis des
                        regionalen Marktes in Aurich und ganz Ostfriesland. Die Bewertung ist
                        kostenfrei, unverbindlich und{' '}
                        <span className="font-semibold text-white">dauert keine 2 Minuten</span>.
                      </p>
                    </div>
                  </div>
                </div>
              </aside>
            ) : null}

            <div className={showLeftHero ? 'flex' : 'w-full'}>
              <div className="flex h-full w-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-slate-600">
                    Schritt {stepNowUI} / {TOTAL_STEPS_UI}
                  </div>
                  <div className="text-sm font-medium text-slate-600">{progress}%</div>
                </div>

                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-[color:var(--color-navy)] transition-all"
                    style={{width: `${progress}%`}}
                  />
                </div>

                <div className="mt-6 flex-1">{CurrentSection}</div>

                {stepKey === 'location' && stepHouseNumberMissing ? (
                  <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                    Für die automatische Bewertung wird die Hausnummer benötigt.
                  </div>
                ) : null}

                <div className="-mx-6 mt-6 border-t border-slate-200/90 bg-white/95 px-6 py-4 flex items-center justify-between gap-3">
                  {stepKey === 'thanks' ? (
                    <div className="flex w-full justify-center">
                      <button
                        type="button"
                        onClick={canCloseFinalStep ? closeWizard : undefined}
                        disabled={!canCloseFinalStep}
                        aria-label={closeAriaLabel}
                        className={[
                          'inline-flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-semibold transition',
                          canCloseFinalStep
                            ? 'bg-[color:var(--color-navy)] text-white hover:bg-[color:var(--color-brackish)]'
                            : 'cursor-not-allowed bg-slate-300 text-white opacity-70',
                        ].join(' ')}
                      >
                        <span>{canCloseFinalStep ? closeLabel : 'E-Mail wird gesendet'}</span>
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={goBack}
                        disabled={!canGoBack}
                        aria-label="Zurück"
                        style={{
                          width: 44,
                          height: 44,
                          minWidth: 44,
                          minHeight: 44,
                          flex: '0 0 auto',
                        }}
                        className={[
                          'inline-flex items-center justify-center rounded-xl',
                          'border shadow-sm transition select-none',
                          canGoBack
                            ? 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200'
                            : 'border-slate-200 bg-slate-100 text-slate-400 opacity-50 cursor-not-allowed',
                        ].join(' ')}
                      >
                        <span className="text-2xl leading-none -translate-x-[1px]">‹</span>
                      </button>

                      {stepKey === 'result' && !canGoNext ? null : (
                        <button
                          type="button"
                          onClick={goNext}
                          disabled={!canGoNext}
                          className={[
                            'ml-auto inline-flex min-w-[148px] shrink-0 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold transition',
                            'h-11',
                            canGoNext
                              ? 'bg-[color:var(--color-navy)] text-white hover:bg-[color:var(--color-brackish)]'
                              : 'bg-slate-300 text-white opacity-60 cursor-not-allowed',
                          ].join(' ')}
                        >
                          <span>
                            {stepKey === 'result'
                              ? 'Fertig'
                              : stepKey === 'type'
                                ? 'Weiter zur Bewertung'
                                : 'Weiter'}
                          </span>
                          {stepKey !== 'type' && stepKey !== 'result' ? (
                            <span aria-hidden className="text-base leading-none">
                              ›
                            </span>
                          ) : null}
                        </button>
                      )}
                    </>
                  )}
                </div>

                {stepKey === 'type' ? (
                  <>
                    <div className="mt-3 text-xs leading-relaxed text-slate-500">
                      Dauer: ca. 1–2 Minuten.
                    </div>
                    <div className="mt-2 text-xs leading-relaxed text-slate-500">
                      Hinweis: Du kannst über den Button „Zurück“ jederzeit zurückgehen. Exakte
                      Details klären wir – wenn du möchtest – persönlich.
                    </div>
                  </>
                ) : (
                  <div className="mt-15 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-left text-xs text-slate-600">
                    <span className="flex items-center gap-2 whitespace-nowrap">
                      <span className="text-brand-navy">✓</span>
                      <span>Kostenfrei</span>
                    </span>

                    <span className="flex items-center gap-2 whitespace-nowrap">
                      <span className="text-brand-navy">✓</span>
                      <span>Unverbindlich</span>
                    </span>

                    <span className="flex items-center gap-2">
                      <span className="text-brand-navy">✓</span>
                      <span>
                        Basierend auf regionaler Marktkenntnis in Aurich &amp; Ostfriesland
                      </span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
