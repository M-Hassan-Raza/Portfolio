import { redirects as authoredRedirects } from "./catalog"
import { topics } from "./taxonomies"

export const redirects = new Map(authoredRedirects)
for (const topic of topics) redirects.set(`${topic.path}page/1/`, topic.path)
