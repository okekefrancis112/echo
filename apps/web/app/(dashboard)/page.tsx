import { Button } from "@workspace/ui/components/button"
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";

export default function Page() {
  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-svh">
        <p>apps/web</p>
          <UserButton />
          <OrganizationSwitcher hidePersonal />
          <Button size="sm">Button</Button>
        <div className="max-w-sm w-full mx-auto">
          <h1 className="text-2xl font-bold">Hello World</h1>
        </div>
      </div>
    </>
  )
}
