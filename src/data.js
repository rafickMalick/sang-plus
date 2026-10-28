// Ported from the Sang+ design prototype (DCLogic).

export const REGIONS = [
  { name: 'Cotonou',    pays: 'Bénin', code: 'BJ', donneurs: 3410, langs: ['fon', 'yoruba', 'français'] },
  { name: 'Porto-Novo', pays: 'Bénin', code: 'BJ', donneurs: 1980, langs: ['yoruba', 'fon', 'français'] },
  { name: 'Abomey',     pays: 'Bénin', code: 'BJ', donneurs: 1120, langs: ['fon', 'français'] },
  { name: 'Parakou',    pays: 'Bénin', code: 'BJ', donneurs: 1260, langs: ['dendi', 'fon', 'français'] },
]

export function msg(lang, ville) {
  const M = {
    fon:        `Mi kudo ! Sang+ : don de sang ɖo ${ville}, samedi 14 septembre. Hùn towe sixu hwlɛn gbɛ 3. Yi gbè OUI.`,
    yoruba:     `Ẹ kú ọjọ́ ! Sang+ : ìpolongo ìtọrẹ ẹ̀jẹ̀ ní ${ville}, Sátidé 14 sept. Ẹ̀jẹ̀ yín lè gba ẹ̀mí mẹ́ta là. Fèsì OUI.`,
    dendi:      `Fofo ! Sang+ : campagne don de sang ${ville}, asibiti 14 septembre. Kuri ni ga hin ka fundi hinza faaba. Tuuru OUI.`,
    'français': `Bonjour ! Sang+ : campagne de don de sang à ${ville}, samedi 14 septembre, 8h–16h. Votre don peut sauver 3 vies. Répondez OUI pour vous inscrire.`,
  }
  return M[lang] || M['français']
}

export const DONORS = [
  { name: 'Bisola Adéoti',    groupe: 'O+',  commune: 'Cotonou-Fidjrossè', ville: 'Cotonou',    lastDon: 'il y a 4 mois',  lang: 'yoruba', phone: '+229 01 96 12 45 67', status: 'A répondu OUI' },
  { name: 'Kofi Ahouansou',   groupe: 'A−',  commune: 'Cotonou-Akpakpa',   ville: 'Cotonou',    lastDon: 'il y a 7 mois',  lang: 'fon',    phone: '+229 01 97 42 18 30', status: 'Contacté' },
  { name: 'Mariette Tossou',  groupe: 'B+',  commune: 'Abomey-Calavi',     ville: 'Cotonou',    lastDon: 'il y a 3 mois',  lang: 'fon',    phone: '+229 01 66 90 22 14', status: 'À contacter' },
  { name: 'Sègbè Hounkpatin', groupe: 'O−',  commune: 'Cotonou-Cadjèhoun', ville: 'Cotonou',    lastDon: 'il y a 11 mois', lang: 'fon',    phone: '+229 01 66 05 77 91', status: 'À contacter' },
  { name: 'Adjara Boni',      groupe: 'AB+', commune: 'Parakou-Zongo',     ville: 'Parakou',    lastDon: 'il y a 5 mois',  lang: 'dendi',  phone: '+229 01 94 31 60 27', status: 'Contacté' },
  { name: 'Euloge Gbaguidi',  groupe: 'O+',  commune: 'Porto-Novo-Ouando', ville: 'Porto-Novo', lastDon: 'il y a 2 mois',  lang: 'yoruba', phone: '+229 01 95 55 09 83', status: 'A répondu OUI' },
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

// Donneurs de l'Espace d'appel (section #appel).
export const CONTACTS = [
  { name: 'Bisola Adéoti', groupe: 'O+', commune: 'Cotonou-Fidjrossè', ville: 'Cotonou', lang: 'yoruba', phone: '+229 01 96 12 45 67', operator: 'MTN Bénin', dispo: 'dispo', availText: "Disponible · jusqu'à 18h", hours: 'Lun–Sam, 9h–18h', levelName: 'Fidèle', dons: 9, lastDon: 'il y a 4 mois', nextDon: 'Oui', status: 'A répondu OUI',
    seed: [{ dir: 'out', key: 'invit', time: 'Hier 10:12' }, { dir: 'in', text: 'OUI', time: 'Hier 10:40' }],
    hist: [{ t: 'SMS · a répondu OUI', m: 'Hier, 10:40', tone: 'ok' }, { t: 'Don à Cotonou-Fidjrossè', m: 'Juin 2026', tone: 'red' }, { t: 'Appel · 2 min · inscrite', m: 'Juin 2026', tone: 'ok' }] },
  { name: 'Sègbè Hounkpatin', groupe: 'O−', commune: 'Cotonou-Cadjèhoun', ville: 'Cotonou', lang: 'fon', phone: '+229 01 66 05 77 91', operator: 'MTN Bénin', dispo: 'dispo', availText: 'Disponible · toute la journée', hours: 'Tous les jours, 8h–20h', levelName: 'Régulier', dons: 4, lastDon: 'il y a 11 mois', nextDon: 'Oui', status: 'À contacter',
    seed: [], hist: [{ t: 'Don à Cotonou', m: 'Nov. 2025', tone: 'red' }, { t: 'Inscription via campagne radio', m: 'Mars 2024', tone: 'muted' }] },
  { name: 'Adjara Boni', groupe: 'AB+', commune: 'Parakou-Zongo', ville: 'Parakou', lang: 'dendi', phone: '+229 01 94 31 60 27', operator: 'Moov Africa Bénin', dispo: 'dispo', availText: 'Disponible · après 14h', hours: 'Lun–Ven, 14h–19h', levelName: 'Fidèle', dons: 12, lastDon: 'il y a 5 mois', nextDon: 'Oui', status: 'Contacté',
    seed: [{ dir: 'out', key: 'invit', time: 'Lun. 15:02' }], hist: [{ t: 'SMS envoyé · sans réponse', m: 'Lundi, 15:02', tone: 'warn' }, { t: 'Don à Parakou', m: 'Mai 2026', tone: 'red' }] },
  { name: 'Mariette Tossou', groupe: 'B+', commune: 'Abomey-Calavi', ville: 'Cotonou', lang: 'fon', phone: '+229 01 66 90 22 14', operator: 'Moov Africa Bénin', dispo: 'dispo', availText: 'Disponible · matinée', hours: 'Lun–Sam, 8h–12h', levelName: 'Nouveau', dons: 1, lastDon: 'il y a 3 mois', nextDon: 'Oui', status: 'À contacter',
    seed: [], hist: [{ t: 'Premier don à Abomey-Calavi', m: 'Juil. 2026', tone: 'red' }] },
  { name: 'Nafissatou Sanni', groupe: 'A+', commune: 'Porto-Novo-Ouando', ville: 'Porto-Novo', lang: 'yoruba', phone: '+229 01 61 41 28 06', operator: 'MTN Bénin', dispo: 'dispo', availText: "Disponible · jusqu'à 17h", hours: 'Lun–Ven, 10h–17h', levelName: 'Nouveau', dons: 2, lastDon: 'il y a 8 mois', nextDon: 'Oui', status: 'À contacter',
    seed: [], hist: [{ t: 'Don à Porto-Novo', m: 'Févr. 2026', tone: 'red' }] },
  { name: 'Kofi Ahouansou', groupe: 'A−', commune: 'Cotonou-Akpakpa', ville: 'Cotonou', lang: 'fon', phone: '+229 01 97 42 18 30', operator: 'MTN Bénin', dispo: 'occupe', availText: 'Occupé · rappeler après 16h', hours: 'Lun–Ven, après 16h', levelName: 'Régulier', dons: 5, lastDon: 'il y a 7 mois', nextDon: 'Oui', status: 'À rappeler',
    warn: "Kofi a demandé à être rappelé après 16h. Un SMS est préférable pour l'instant.",
    seed: [], hist: [{ t: 'Appel · demande de rappel après 16h', m: "Aujourd'hui, 11:20", tone: 'warn' }, { t: 'Don à Akpakpa', m: 'Mars 2026', tone: 'red' }] },
  { name: 'Rodrigue Agbo', groupe: 'B−', commune: 'Cotonou-Fidjrossè', ville: 'Cotonou', lang: 'fon', phone: '+229 01 61 77 20 45', operator: 'Moov Africa Bénin', dispo: 'occupe', availText: 'Ne pas déranger · 13h–15h', hours: 'Hors 13h–15h', levelName: 'Régulier', dons: 3, lastDon: 'il y a 6 mois', nextDon: 'Oui', status: 'À contacter',
    warn: "Plage « ne pas déranger » de 13h à 15h. Planifiez l'appel plus tard.",
    seed: [], hist: [{ t: 'Don à Fidjrossè', m: 'Avr. 2026', tone: 'red' }] },
  { name: 'Euloge Gbaguidi', groupe: 'O+', commune: 'Parakou-Banikanni', ville: 'Parakou', lang: 'dendi', phone: '+229 01 95 55 09 83', operator: 'Moov Africa Bénin', dispo: 'inelig', availText: "Non éligible · jusqu'au 2 déc.", hours: 'Lun–Sam, 9h–19h', levelName: 'Régulier', dons: 3, lastDon: 'il y a 6 semaines', nextDon: '2 déc.', status: 'A répondu OUI',
    warn: 'Euloge a donné il y a 6 semaines : pas de nouveau don avant le 2 décembre. Envoyez plutôt un message de remerciement.',
    seed: [{ dir: 'out', key: 'merci', time: '6 sept.' }], hist: [{ t: 'Don à Parakou', m: '6 sept. 2026', tone: 'red' }, { t: 'SMS de remerciement', m: '6 sept. 2026', tone: 'ok' }] },
]

export function tplText(key, ct) {
  const first = ct.name.split(' ')[0]
  if (key === 'rappel') return 'Rappel Sang+ : ' + first + ', votre rendez-vous de don est demain à 9h à l’Antenne ANTS de ' + ct.ville + '. Pensez à bien manger avant. Répondez STOP pour annuler.'
  if (key === 'merci') return 'Merci ' + first + " ! Votre don a été transmis à l'hôpital de " + ct.ville + '. Vous pourrez donner à nouveau dans 3 mois. — Sang+'
  return msg(ct.lang, ct.ville)
}
