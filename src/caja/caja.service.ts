import type { Movimiento, CrearMovimiento } from './caja.types'

export const CajaService = {
  async obtenerMovimientosDia(_fecha: string): Promise<Movimiento[]> {
    throw new Error('not implemented')
  },

  async registrarMovimiento(_datos: CrearMovimiento): Promise<Movimiento> {
    throw new Error('not implemented')
  },

  async obtenerResumenPeriodo(_desde: string, _hasta: string): Promise<Movimiento[]> {
    throw new Error('not implemented')
  },
}
