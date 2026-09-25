# mhassan.dev

Source for [mhassan.dev](https://mhassan.dev): Hugo with the PaperMod theme, deployed to GitHub Pages on every push to `main`.

## Run it

```sh
git clone --recurse-submodules git@github.com:M-Hassan-Raza/Portfolio.git
cd Portfolio
hugo server
```

Needs Hugo extended 0.166 or newer. CI pins the exact version in `.github/workflows/deploy.yml`.

## Where things live

| Path | What it holds |
| --- | --- |
| `data/profile.yaml` | Roles, dates, proof points. The homepage, About, Contact and Resume all read from here, so update facts once. |
| `data/oss.yaml` | Merged open-source PRs. Generated, do not edit by hand. |
| `content/` | Pages, case studies (`projects/`) and writing (`blog/`). |
| `layouts/` | Overrides and additions on top of PaperMod. |
| `assets/css/extended/` | Design tokens and component styles. |
| `assets/ascii-covers/` | Halftone cover art, generated with the `ascii-cover` skill. |
| `private/` | Local-only source material such as unscrubbed client screenshots. Gitignored. |

## Scripts

- `scripts/oss.sh` refreshes `data/oss.yaml` from GitHub. Needs an authenticated `gh`.
- `scripts/lint-copy.sh` flags stock phrasing in prose. CI runs it on every push.
