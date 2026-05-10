import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ResumenGeneralPanel } from './ResumenGeneral'
import { GraficoVentas } from './GraficoVentas'
import { TablaCartera } from './TablaCartera'
import { PanelInventario } from './PanelInventario'

export function ReportesPage() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-xl font-semibold">Reportes</h1>

      <Tabs defaultValue="resumen">
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="resumen">Resumen</TabsTrigger>
          <TabsTrigger value="ventas">Ventas</TabsTrigger>
          <TabsTrigger value="cartera">Cartera</TabsTrigger>
          <TabsTrigger value="inventario">Inventario</TabsTrigger>
        </TabsList>

        <TabsContent value="resumen" className="mt-4">
          <ResumenGeneralPanel />
        </TabsContent>

        <TabsContent value="ventas" className="mt-4">
          <GraficoVentas />
        </TabsContent>

        <TabsContent value="cartera" className="mt-4">
          <TablaCartera />
        </TabsContent>

        <TabsContent value="inventario" className="mt-4">
          <PanelInventario />
        </TabsContent>
      </Tabs>
    </div>
  )
}
