import { Component } from 'react'
import type { ReactNode } from 'react'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props { children: ReactNode }
interface State { hasError: boolean; message: string }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message ?? 'Error desconocido' }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
          <p className="text-lg font-semibold">Algo salió mal</p>
          <p className="text-sm text-muted-foreground max-w-xs">{this.state.message}</p>
          <Button
            onClick={() => window.location.reload()}
            className="gap-2"
          >
            <RefreshCw className="size-4" />
            Recargar página
          </Button>
        </div>
      )
    }
    return this.props.children
  }
}
