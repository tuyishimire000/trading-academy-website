import { DynamicLandingPage } from "@/components/landing/dynamic-landing-page"

// Force dynamic rendering to prevent static generation
export const dynamic = 'force-dynamic'

export default function HomePage() {
  return <DynamicLandingPage />
}
