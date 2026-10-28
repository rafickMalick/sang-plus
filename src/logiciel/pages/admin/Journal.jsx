import { s } from '../../../style.js'
import { fmtAt } from '../../format.js'
import { useLoad } from '../../useLoad.js'
import { CARD, Empty, Loading, Row, Table, ellipsis } from '../../ui.jsx'

const LABEL = {
  'stock.releve': 'Relevé de stock', 'campagne.alerte': 'Alerte lancée', 'campagne.bascule': 'Sans-réponse transférés', 'rappels.envoi': 'Rappels envoyés',
  'collecte.creation': 'Collecte créée', 'donneur.creation': 'Donneur créé', 'donneur.fusion': 'Fiche complétée', 'donneur.import': 'Import de fichier',
  'appel.resultat': 'Résultat d’appel', 'don.confirmation': 'Don confirmé', 'don.ajournement': 'Donneur ajourné', 'besoin.signalement': 'Besoin signalé',
  'pays.regles': 'Règles modifiées', 'organisation.creation': 'Organisation créée', 'organisation.modification': 'Organisation modifiée',
  'utilisateur.creation': 'Compte créé', 'utilisateur.modification': 'Compte modifié', 'simulateur.reponse': 'Réponse simulée', 'demo.initialisation': 'Données de démo créées',
}

export default function Journal() {
  const { data, error } = useLoad('/admin/audit', { poll: 10000 })
  if (!data) return <Loading error={error} />
  const cols = '1fr 1.2fr 1.3fr 2.5fr'
  return (
    <div style={s(`${CARD}; padding:18px 20px; min-width:0`)}>
      <Table cols={cols} minWidth={760} head={['Quand', 'Qui', 'Action', 'Détails']}>
        {data.map((a) => (
          <Row key={a.id} cols={cols}>
            <span style={s("white-space:nowrap")}>{fmtAt(a.at)}</span>
            <span style={s(`font-weight:600; color:#2b0d15; ${ellipsis}`)}>{a.user}</span>
            <span style={s(ellipsis)}>{LABEL[a.action] ?? a.action}</span>
            <span style={s(`font-size:12px; color:#8a6f76; ${ellipsis}`)} title={JSON.stringify(a.details)}>{Object.entries(a.details ?? {}).map(([k, v]) => k + ' : ' + (typeof v === 'object' ? JSON.stringify(v) : v)).join(' · ')}</span>
          </Row>
        ))}
        {data.length === 0 && <Empty>Aucune action enregistrée.</Empty>}
      </Table>
    </div>
  )
}
