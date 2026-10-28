import type { Role } from '@prisma/client'

// Écran d'accueil de chaque rôle (le front construit la navigation à partir du rôle et du périmètre).
export const ROLE_HOME: Record<Role, string> = {
  SUPER_ADMIN: 'admin',
  PILOTE: 'dashboard',
  OPERATEUR: 'journee',
  DEMANDEUR: 'besoins',
}
