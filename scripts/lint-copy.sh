#!/usr/bin/env bash
# Flags the stock phrasing that makes writing read as machine-made.
# Checks prose only: fenced code blocks and front matter are skipped.
# Usage: scripts/lint-copy.sh [files...]   (defaults to content/ and data/)
set -uo pipefail

cd "$(dirname "$0")/.."

if [ $# -gt 0 ]; then
  files=("$@")
else
  mapfile -t files < <(find content $( [ -d data ] && echo data ) -type f \( -name '*.md' -o -name '*.yaml' \) | sort)
fi

# "pattern :: message". Matched case-insensitively against prose lines.
rules=(
  "\b(is|was|are|were)(n't| not) [^.!?]{1,80}\. (it|that|this|they)('s| is| was| are| were)\b :: 'not X. It is Y' flip. Say the positive claim once."
  "\bnot (just|only|merely) [^.!?,]{1,60}[,;] (it|but)\b :: 'not just X, but Y' construction."
  "here'?s the (thing|kicker|catch|part) :: Stock setup phrase. Just say it."
  "the uncomfortable truth :: Stock setup phrase."
  "(nobody|no one) (tells|talks about|writes about) :: 'Nobody talks about' opener."
  "\b(delve|tapestry|game[- ]?changer|unlock(s|ed|ing)?|supercharge|seamless(ly)?|robust solution|in today'?s)\b :: Marketing-deck vocabulary."
  "\b(let'?s dive|dive (in|into)|buckle up|spoiler:|no fluff|hot take)\b :: Filler transition."
  "this (isn'?t|is not) a hype piece :: Pre-emptive disclaimer."
  "\bgenuinely\b :: 'genuinely' is almost always filler."
  "^#+ *(what i learned|the meta-lesson|key takeaways?|conclusion|the bottom line|final thoughts)\s*$ :: Boilerplate heading. Name the actual lesson."
  "^[A-Z][a-z']+\. [A-Z][a-z']+\.$ :: Two-word dramatic fragment."
)

errors=0

strip_prose() {
  # Drop front matter and fenced code, keep line numbers.
  awk '
    NR==1 && /^---$/ { fm=1; next }
    fm && /^---$/    { fm=0; next }
    fm               { next }
    /^```/           { code=!code; next }
    code             { next }
    { print NR ":" $0 }
  ' "$1"
}

for f in "${files[@]}"; do
  prose=$(strip_prose "$f")

  for rule in "${rules[@]}"; do
    pattern=${rule%% :: *}
    message=${rule#* :: }
    # Prose lines carry an "N:" prefix, so anchored patterns attach after it.
    if [ "${pattern:0:1}" = "^" ]; then
      match="^[0-9]+:${pattern:1}"
    else
      match="^[0-9]+:.*(${pattern})"
    fi
    while IFS= read -r hit; do
      [ -z "$hit" ] && continue
      echo "$f:${hit%%:*}: $message"
      errors=$((errors + 1))
    done < <(printf '%s\n' "$prose" | grep -iE "$match" | cut -d: -f1)
  done

  dashes=$(printf '%s\n' "$prose" | grep -o '—' | wc -l | tr -d ' ')
  if [ "$dashes" -gt 3 ]; then
    echo "$f: $dashes em dashes. Keep it to 3 or fewer; use commas, colons or full stops."
    errors=$((errors + 1))
  fi

  actually=$(printf '%s\n' "$prose" | grep -oi '\bactually\b' | wc -l | tr -d ' ')
  if [ "$actually" -gt 2 ]; then
    echo "$f: 'actually' used $actually times. Cut all but the one that matters."
    errors=$((errors + 1))
  fi
done

if [ "$errors" -gt 0 ]; then
  echo
  echo "lint-copy: $errors issue(s)."
  exit 1
fi
echo "lint-copy: clean."
