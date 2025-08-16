"use client";

import { Button } from "@workspace/ui/components/button"
import { SignInButton, UserButton } from "@clerk/nextjs";
import { Authenticated, Unauthenticated } from "convex/react"

export default function Page() {
  return (
    <>
      <Authenticated>
        <div className="flex items-center justify-center min-h-svh">
          <div className="flex flex-col items-center justify-center gap-4">
            <h1 className="text-2xl font-bold">Hello World</h1>
            <UserButton />
            <Button size="sm">Button</Button>
          </div>
        </div>
      </Authenticated>
      <Unauthenticated>
        <p>Must be signed in!</p>
        <SignInButton>Sign in!</SignInButton>
      </Unauthenticated>
    </>
  )
}
