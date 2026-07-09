// Ported from the Sang+ design prototype (DCLogic).

export const REGIONS = [
  { name: 'Dakar',   pays: 'Sénégal', code: 'SN', donneurs: 4820, langs: ['wolof', 'pulaar', 'français'] },
  { name: 'Thiès',   pays: 'Sénégal', code: 'SN', donneurs: 1930, langs: ['wolof', 'pulaar', 'français'] },
  { name: 'Cotonou', pays: 'Bénin',   code: 'BJ', donneurs: 3410, langs: ['fon', 'yoruba', 'français'] },
  { name: 'Parakou', pays: 'Bénin',   code: 'BJ', donneurs: 1260, langs: ['dendi', 'fon', 'français'] },
]

export function msg(lang, ville) {
  const M = {
    wolof:      `Jàmm nga am ! Sang+ : kampaañ don de sang bu ${ville}, gaawu 14 septembre, 8h–16h. Sa deret mën na musal 3 bakkan. Tontu OUI ngir bindu.`,
    pulaar:     `Jam waali ! Sang+ : kampaañ dokkal ƴiiƴam to ${ville}, aset 14 septembre. Ƴiiƴam maa ina hisna 3 fittaandu. Jaabo OUI.`,
    fon:        `Mi kudo ! Sang+ : don de sang ɖo ${ville}, samedi 14 septembre. Hùn towe sixu hwlɛn gbɛ 3. Yi gbè OUI.`,
    yoruba:     `Ẹ kú ọjọ́ ! Sang+ : ìpolongo ìtọrẹ ẹ̀jẹ̀ ní ${ville}, Sátidé 14 sept. Ẹ̀jẹ̀ yín lè gba ẹ̀mí mẹ́ta là. Fèsì OUI.`,
    dendi:      `Fofo ! Sang+ : campagne don de sang ${ville}, asibiti 14 septembre. Kuri ni ga hin ka fundi hinza faaba. Tuuru OUI.`,
    'français': `Bonjour ! Sang+ : campagne de don de sang à ${ville}, samedi 14 septembre, 8h–16h. Votre don peut sauver 3 vies. Répondez OUI pour vous inscrire.`,
  }
  return M[lang] || M['français']
}

export const DONORS = [
  { name: 'Awa Diallo',       groupe: 'O+',  commune: 'Dakar-Plateau',     ville: 'Dakar',   lastDon: 'il y a 4 mois',  lang: 'wolof',  phone: '+221 77 123 45 67', status: 'A répondu OUI' },
  { name: 'Kofi Ahouansou',   groupe: 'A−',  commune: 'Cotonou-Akpakpa',   ville: 'Cotonou', lastDon: 'il y a 7 mois',  lang: 'fon',    phone: '+229 97 42 18 30', status: 'Contacté' },
  { name: 'Mariama Sow',      groupe: 'B+',  commune: 'Thiès-Nord',        ville: 'Thiès',   lastDon: 'il y a 3 mois',  lang: 'pulaar', phone: '+221 76 908 22 14', status: 'À contacter' },
  { name: 'Sègbè Hounkpatin', groupe: 'O−',  commune: 'Cotonou-Cadjèhoun', ville: 'Cotonou', lastDon: 'il y a 11 mois', lang: 'fon',    phone: '+229 66 05 77 91', status: 'À contacter' },
  { name: 'Adjara Boni',      groupe: 'AB+', commune: 'Parakou-Zongo',     ville: 'Parakou', lastDon: 'il y a 5 mois',  lang: 'dendi',  phone: '+229 94 31 60 27', status: 'Contacté' },
  { name: 'Yacine Ndiaye',    groupe: 'O+',  commune: 'Dakar-Médina',      ville: 'Dakar',   lastDon: 'il y a 2 mois',  lang: 'wolof',  phone: '+221 78 555 09 83', status: 'A répondu OUI' },
]

export const initials = (n) => n.split(' ').map((w) => w[0]).join('')

export const PILL_ON  = { bg: '#431420', fg: '#f8ddcb', bd: '#431420' }
export const PILL_OFF = { bg: '#ffffff', fg: '#431420', bd: '#d8c3b5' }
export const pill = (active) => (active ? PILL_ON : PILL_OFF)

export const ST_COLORS = {
  'A répondu OUI': { bg: '#e7f2ea', fg: '#2f6e4b' },
  'Contacté':      { bg: '#fdf1dc', fg: '#9a6a1e' },
  'À contacter':   { bg: '#fbe9ec', fg: '#a8283a' },
}
