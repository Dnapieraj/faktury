'use client'

import { signInWithDemo } from '@/app/(auth)/actions'
import { SubmitButton } from '@/components/ui/submit-button'

export function DemoLoginButton({ callbackUrl }: { callbackUrl?: string }) {
  return (
    <form action={signInWithDemo.bind(null, callbackUrl)}>
      <SubmitButton variant="outline" size="lg" className="w-full">
        Wypróbuj konto demo
      </SubmitButton>
    </form>
  )
}
