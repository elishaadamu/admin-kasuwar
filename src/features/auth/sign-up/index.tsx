import { Link } from '@tanstack/react-router'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { SignUpForm } from './components/sign-up-form'

export function SignUp() {
  return (
    <div className='container mx-auto flex min-h-screen items-center justify-center py-8'>
      <Card className='w-full max-w-2xl gap-4'>
        <CardHeader>
          <CardTitle className='text-lg tracking-tight'>
            Create an account
          </CardTitle>
          <CardDescription>
            Enter your email and password to create an account. <br />
            Already have an account?{' '}
            <Link
              to='/sign-in'
              className='hover:text-primary underline underline-offset-4'
            >
              Sign In
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignUpForm />
        </CardContent>
      </Card>
    </div>
  )
}
