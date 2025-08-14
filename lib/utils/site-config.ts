import { getSiteUrl } from "./env"

export const siteConfig = {
  name: "Prime Aura Trading Academy",
  description: "Master the Art of Trading - Join 500+ successful traders worldwide",
  url: getSiteUrl(),
  ogImage: "/og-image.png",
  links: {
    twitter: "https://twitter.com/primeaura",
    discord: "https://discord.gg/primeaura",
    github: "https://github.com/primeaura/trading-academy",
  },
}

export function getBaseUrl() {
  return getSiteUrl()
}
