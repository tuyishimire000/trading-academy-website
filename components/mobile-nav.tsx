"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"

export function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" className="md:hidden text-white hover:text-amber-400 hover:bg-gray-800">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] bg-black text-white border-gray-800">
        <div className="flex flex-col space-y-4 mt-8">
          <Link
            href="#about"
            className="text-lg font-medium hover:text-amber-400 transition-colors py-2"
            onClick={() => setOpen(false)}
          >
            About Trading
          </Link>
          <Link
            href="#features"
            className="text-lg font-medium hover:text-amber-400 transition-colors py-2"
            onClick={() => setOpen(false)}
          >
            Features
          </Link>
          <Link
            href="#pricing"
            className="text-lg font-medium hover:text-amber-400 transition-colors py-2"
            onClick={() => setOpen(false)}
          >
            Pricing
          </Link>
          <Link
            href="/login"
            className="text-lg font-medium hover:text-amber-400 transition-colors py-2"
            onClick={() => setOpen(false)}
          >
            Login
          </Link>
          <div className="pt-4">
            <Link href="/signup" onClick={() => setOpen(false)}>
              <Button className="w-full bg-amber-500 hover:bg-amber-600 text-black">Get Started</Button>
            </Link>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
