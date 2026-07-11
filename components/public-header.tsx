'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function PublicHeader() {
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <span className="font-bold text-primary-foreground">PD</span>
          </div>
          <h1 className="text-xl font-bold text-foreground">Pole Defect Monitor</h1>
        </div>

        <Link href="/sign-in">
          <Button variant="default" size="sm">
            Sign In
          </Button>
        </Link>
      </div>
    </header>
  )
}
