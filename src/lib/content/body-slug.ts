/** The body module name for a path: `/blog/post/` → `blog--post`, `/` → `home`. */
export function bodySlug(path: string) {
  if (path === "/") return "home"
  return path
    .replace(/\.html$/, "")
    .replace(/^\/|\/$/g, "")
    .replaceAll("/", "--")
}
