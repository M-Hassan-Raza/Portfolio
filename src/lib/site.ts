export const site = {
  url: "https://mhassan.dev",
  description:
    "Muhammad Hassan Raza runs product and engineering at Entropy Labs, builds backend and AI systems that hold up in production, and gets patches merged into open-source tools like kitty, calibre and libtorrent.",
  language: "en-US",
  socialImage: "/assets/social-card.png",
  umami: {
    scriptUrl: "https://cloud.umami.is/script.js",
    websiteId: "30c7d9d6-abac-4c52-b85a-c0234f863d22",
  },
  giscus: {
    repo: "M-Hassan-Raza/Portfolio",
    repoId: "R_kgDON3Oajw",
    category: "General",
    categoryId: "DIC_kwDON3Oaj84Cm3y9",
  },
}
export const mainNavigation = [
  { label: "Work", path: "/projects/" },
  { label: "Writing", path: "/blog/" },
  { label: "Open source", path: "/open-source/" },
  { label: "About", path: "/about/" },
  { label: "Contact", path: "/contact/" },
]
export const footerNavigation = [
  ...mainNavigation.slice(0, 3),
  { label: "Books", path: "/books/" },
  { label: "Teaching", path: "/teaching/" },
  { label: "Resume", path: "/resume/" },
  { label: "Search", path: "/search/" },
  { label: "Archive", path: "/archives/" },
]
