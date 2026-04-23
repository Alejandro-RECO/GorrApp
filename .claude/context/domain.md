# Dominio del negocio — GorrApp
# Este archivo es Nivel 1: se carga en TODAS las sesiones

---

## El negocio
Venta de gorras. Negocio personal, un solo usuario operador.
Todo el flujo actualmente está en Excel. Esta app reemplaza ese Excel.

## Entidades principales

**Cliente**
Persona que compra gorras. Puede comprar contado o fiado.
Tiene nombre y teléfono obligatorios.

**Venta**
Transacción de venta de una o varias gorras a un cliente.
Tipos: contado | fiado_una_cuota | fiado_dos_cuotas

**Cuota**
Parte del pago de una venta fiada.
Una venta fiada de 1 cuota tiene 1 cuota.
Una venta fiada de 2 cuotas tiene 2 cuotas.
Cada cuota tiene: valor, fecha_vencimiento, estado (pendiente|pagada)

**Abono**
Pago parcial o total de una cuota.
Una cuota puede recibir múltiples abonos.
La cuota se marca pagada cuando sum(abonos) >= valor_cuota.

**Movimiento de caja**
Cualquier entrada o salida de dinero.
Tipos: ingreso_venta | ingreso_abono | gasto_operativo | gasto_inversion | compra_mercancia

**Medio de pago**
efectivo | digital (Nequi, Bancolombia, transferencia)
Siempre se registra el medio. La caja lleva saldos separados por medio.

**Producto / Gorra**
Por ahora: referencia simple (nombre/descripción) + precio de venta sugerido.
No hay tallas ni colores en el MVP.

**Compra de mercancía**
Registro de compra al proveedor.
Afecta: inventario (suma stock) + caja (resta gasto_inversion)

## Términos clave

| Término      | Significado en este negocio                              |
|--------------|----------------------------------------------------------|
| Cartera      | Suma total de cuotas pendientes por cobrar               |
| Fiado        | Venta a crédito (1 o 2 cuotas)                          |
| Al día       | Cliente sin cuotas vencidas                             |
| En mora      | Cliente con al menos 1 cuota vencida sin pagar          |
| Caja         | Dinero disponible (efectivo + digital por separado)     |
| Abono        | Pago parcial a una cuota fiada                          |
| Saldo diario | Total ingresos - total egresos del día                  |

## Reglas de negocio críticas

1. Una venta fiada de 2 cuotas divide el total en 2 partes iguales.
2. La primera cuota de una venta fiada vence a los 15 días de la venta.
3. La segunda cuota vence a los 30 días de la venta.
4. Una venta fiada de 1 cuota vence a los 30 días.
5. Un cliente en mora sigue pudiendo comprar (decisión del operador).
6. Los precios de venta los define el operador libremente.
7. El precio de compra de mercancía puede diferir del precio de venta.

---

*domain.md v1.0 — actualizar solo cuando cambie una regla de negocio*