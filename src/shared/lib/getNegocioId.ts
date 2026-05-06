import { useAuthStore } from '@/auth'

/**
 * Returns { userId, negocioId } from the Zustand auth store.
 * Zero DB calls — reads from session already loaded at login.
 * Throws if not authenticated or profile not loaded yet.
 */
export function getAuthContext(): { userId: string; negocioId: string } {
  const { session, profile } = useAuthStore.getState()
  if (!session?.user) throw new Error('No autenticado')
  if (!profile) throw new Error('Sin perfil de negocio. Inicia sesión nuevamente.')
  return { userId: session.user.id, negocioId: profile.negocio_id }
}
