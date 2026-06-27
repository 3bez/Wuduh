// Card config loader — reads wuduh-cards.json (the source of truth)
// Imported as a static module; never fetched at runtime.
// All filtering and sorting happens here so components stay clean.

import type { CardConfig, SectionConfig, CardsData, Language, Sector } from '@/types/cards'
import rawCards from '../../../wuduh-cards.json'

const data = rawCards as CardsData

/** All cards in sequence order (unfiltered — includes all sectors) */
export const ALL_CARDS: CardConfig[] = data.cards.slice().sort((a, b) => a.order - b.order)

/** All section definitions */
export const SECTIONS: SectionConfig[] = data.sections.slice().sort((a, b) => a.order - b.order)

/** Cards that contribute to completion % (required === true, non-cover, non-setup) */
export const MANDATORY_CARDS = ALL_CARDS.filter(c => c.required && c.section !== 'cover' && c.type !== 'lang' && c.type !== 'sector')

/** Total mandatory count (universal — use getMandatoryCards(sector) for sector-aware count) */
export const MANDATORY_COUNT = MANDATORY_CARDS.length

/** Look up a single card by id */
export function getCard(id: string): CardConfig | undefined {
  return ALL_CARDS.find(c => c.id === id)
}

/** Cards for a given section, in order */
export function getCardsForSection(sectionId: string): CardConfig[] {
  return ALL_CARDS.filter(c => c.section === sectionId)
}

// ── Sector-aware helpers ──────────────────────────────────────────

/** Is a card visible for a given sector? */
function cardVisibleForSector(card: CardConfig, sector: Sector): boolean {
  // No sectors field or "all" → visible in every sector
  if (!card.sectors || card.sectors === 'all') return true
  // Array → must include the sector
  return card.sectors.includes(sector)
}

/** Apply sector overrides (flips, relabels) to a card. Returns a new object. */
function applyOverrides(card: CardConfig, sector: Sector): CardConfig {
  const override = card.overrides?.[sector]
  if (!override) return card
  const merged = { ...card }
  if (override.required !== undefined) merged.required = override.required
  if (override.en) merged.en = { ...merged.en, ...override.en }
  if (override.ar) merged.ar = { ...merged.ar, ...override.ar }
  return merged
}

/** Get all cards visible for a sector, with overrides applied, in order. */
export function getCardsForSector(sector: Sector): CardConfig[] {
  return ALL_CARDS
    .filter(c => cardVisibleForSector(c, sector))
    .map(c => applyOverrides(c, sector))
}

/** Get mandatory cards for a sector (for completion % calculation). */
export function getMandatoryCards(sector: Sector): CardConfig[] {
  return getCardsForSector(sector).filter(c => c.required && c.section !== 'cover' && c.type !== 'lang' && c.type !== 'sector')
}

/** Get cards for a section within a sector. */
export function getSectionCards(sectionId: string, sector: Sector): CardConfig[] {
  return getCardsForSector(sector).filter(c => c.section === sectionId)
}

/** Calculate completion % for a sector-filtered study. */
export function calcCompletionForSector(answeredIds: Set<string>, sector: Sector): number {
  const mandatory = getMandatoryCards(sector)
  if (mandatory.length === 0) return 0
  const done = mandatory.filter(c => answeredIds.has(c.id)).length
  return Math.round((done / mandatory.length) * 100)
}

// ── Legacy helpers (sector-unaware, for backward compatibility) ───

/** Next card in sequence after a given card id.
 *  Accepts an optional card list for sector-filtered navigation. */
export function getNextCard(currentId: string, cards: CardConfig[] = ALL_CARDS): CardConfig | null {
  const idx = cards.findIndex(c => c.id === currentId)
  return idx >= 0 && idx < cards.length - 1 ? cards[idx + 1] : null
}

/** Previous card in sequence before a given card id.
 *  Accepts an optional card list for sector-filtered navigation. */
export function getPrevCard(currentId: string, cards: CardConfig[] = ALL_CARDS): CardConfig | null {
  const idx = cards.findIndex(c => c.id === currentId)
  return idx > 0 ? cards[idx - 1] : null
}

/** Get the localised content for a card */
export function localise(card: CardConfig, lang: Language) {
  return card[lang]
}

/** Section label in the active language */
export function sectionLabel(sectionId: string, lang: Language): string {
  const s = SECTIONS.find(s => s.id === sectionId)
  return s ? s[lang].label : sectionId
}

/** Calculate completion % from a set of answered card IDs (legacy — sector-unaware) */
export function calcCompletion(answeredIds: Set<string>): number {
  if (MANDATORY_COUNT === 0) return 0
  const done = MANDATORY_CARDS.filter(c => answeredIds.has(c.id)).length
  return Math.round((done / MANDATORY_COUNT) * 100)
}
