#!/usr/bin/env bash
# Rebuilds data/oss.json from my merged pull requests in public repos I don't own.
# Needs an authenticated gh CLI and jq.
set -euo pipefail

cd "$(dirname "$0")/.."

author="M-Hassan-Raza"

# One-line descriptions I write myself; GitHub's own blurbs are marketing copy.
blurbs='{
  "kovidgoyal/kitty": "GPU-accelerated terminal emulator",
  "kovidgoyal/calibre": "The e-book manager most people use",
  "arvidn/libtorrent": "The BitTorrent library under qBittorrent and Deluge",
  "fallow-rs/fallow": "Dead-code and dependency analysis for TypeScript and JavaScript",
  "ludo-technologies/pyscn": "Code-quality analyzer for Python, written in Go",
  "tw93/Mole": "Command-line cleanup and maintenance tool for macOS",
  "docling-project/docling": "Document conversion for AI pipelines, started at IBM Research",
  "qbittorrent/qBittorrent": "Open-source BitTorrent client"
}'

prs=$(gh search prs --author "$author" --merged --visibility public --limit 1000 \
  --json title,url,closedAt,repository,number)

repos=$(jq -r --arg me "$author" \
  '[.[].repository.nameWithOwner | select(startswith($me + "/") or startswith("recursive-rewind/") | not)] | unique | .[]' <<<"$prs")

meta='[]'
for repo in $repos; do
  info=$(gh api "repos/$repo" --jq '{repo: .full_name, name: .name, url: .html_url, stars: .stargazers_count, language: .language, fork: .fork}')
  meta=$(jq --argjson i "$info" '. + [$i]' <<<"$meta")
done

jq -n \
  --argjson prs "$prs" \
  --argjson meta "$meta" \
  --argjson blurbs "$blurbs" \
  --arg me "$author" \
  --arg generated "$(date -u +%Y-%m-%d)" '
  ($prs | map(select(.repository.nameWithOwner | startswith($me + "/") | not))) as $mine
  | ($meta | map(select(.fork | not)) | map({key: .repo, value: .}) | from_entries) as $m
  | [ $mine | group_by(.repository.nameWithOwner)[]
      | .[0].repository.nameWithOwner as $r
      | select($m[$r])
      | $m[$r] + {
          blurb: ($blurbs[$r] // null),
          merged: length,
          prs: (sort_by(.closedAt) | reverse | map({title, url, number, merged: .closedAt[:10]}))
        }
    ] as $projects
  | {
      generated: $generated,
      merged: ($projects | map(.merged) | add),
      projects: ($projects | sort_by(-.merged))
    }
' > data/oss.json

jq -r '"\(.merged) merged PRs across \(.projects | length) projects (generated \(.generated))"' data/oss.json
