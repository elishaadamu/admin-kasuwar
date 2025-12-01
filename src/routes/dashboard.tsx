// @ts-nocheck
import { createFileRoute, redirect } from '@tanstack/react-router'
import { Dashboard } from '@/features/dashboard'

export const Route = createFileRoute('/dashboard')({
  beforeLoad: ({ context }) => {
    // `auth.user` will be defined in the router context
    // If the user is not authenticated, redirect to the login page
    if (!context.auth.user) {
      throw redirect({
        to: '/sign-in',
        search: {
          // Use the current location to redirect back after login
          redirect: location.href,
        },
      })
    }
  },
  component: Dashboard,
})
