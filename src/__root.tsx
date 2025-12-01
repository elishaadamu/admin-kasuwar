import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { type AuthContextType } from '@/context/auth-context'
import { DirectionProvider } from '@/context/direction-provider'
import { FontProvider } from '@/context/font-provider'
import { ThemeProvider } from '@/context/theme-provider'

interface MyRouterContext {
  auth: AuthContextType
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: RootComponent,
})

function RootComponent() {
  return (
    <ThemeProvider>
      <FontProvider>
        <DirectionProvider>
          <Outlet />
          <TanStackRouterDevtools />
        </DirectionProvider>
      </FontProvider>
    </ThemeProvider>
  )
}
