// Card config loader — reads wuduh-cards.json (the source of truth)
// Imported as a static module; never fetched at runtime.
// All filtering and sorting happens here so components stay clean.

import type { CardConfig, SectionConfig, CardsData, Language } from '@/types/cards'
import rawCards from '../../../wuduh-cards.json'

const data = rawCards as CardsData

/** All cards in sequence order */
export const ALL_CARDS: CardConfig[] = data.cards.slice().sort((a, b) => a.order - b.order)

/** All section definitions */
export const SECTIONS: SectionConfig[] = data.sections.slice().sort((a, b) => a.order - b.order)

/** Cards that contribute to completion % (required === true, non-cover) */
export const MANDATORY_CARDS = ALL_CARDS.filter(c => c.required && c.section !== 'cover' && c.type !== 'lang')

/** Total mandatory count */
export const MANDATORY_COUNT = MANDATORY_CARDS.length

/** Look up a single card by id */
export function getCard(id: string): CardConfig | undefined {
  return ALL_CARDS.find(c => c.id === id)
}

/** Cards for a given section, in order */
export function getCardsForSection(sectionId: string): CardConfig[] {
  return ALL_CARDS.filter(c => c.section === sectionId)
}

/** Next card in sequence after a given card id */
export function getNextCard(currentId: string): CardConfig | null {
  const idx = ALL_CARDS.findIndex(c => c.id === currentId)
  return idx >= 0 && idx < ALL_CARDS.length - 1 ? ALL_CARDS[idx + 1] : null
}

/** Previous card in sequence before a given card id */
export function getPrevCard(currentId: string): CardConfig | null {
  const idx = ALL_CARDS.findIndex(c => c.id === currentId)
  return idx > 0 ? ALL_CARDS[idx - 1] : null
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

/** Calculate completion % from a map of { cardId → status } */
export function calcCompletion(answeredIds: Set<string>): number {
  if (MANDATORY_COUNT === 0) return 0
  const done = MANDATORY_CARDS.filter(c => answeredIds.has(c.id)).length
  return Math.round((done / MANDATORY_COUNT) * 100)
}
