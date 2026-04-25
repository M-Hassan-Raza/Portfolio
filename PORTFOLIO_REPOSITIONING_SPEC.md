# Portfolio Repositioning Implementation Spec

## Goal

Reposition the site from a competent theme-based personal portfolio into a high-trust authority site for:

- technical operator / executive-level builder
- senior backend and AI systems engineer
- product-minded engineering leader
- teacher / mentor with real practitioner credibility

The site should stop feeling like "smart generalist with a blog" and start feeling like "serious operator with proof, judgment, and a clear reason to hire or follow."

## Desired Outcome

After the redesign and content pass, a first-time visitor should understand within 10-15 seconds:

1. who Muhammad Hassan Raza is
2. what level he operates at
3. what kinds of systems and decisions he owns
4. why he is credible
5. what they should do next

## Current Diagnosis

### What already works

- The writing is strong and unusually credible for a personal site.
- The project pages show real production depth.
- The About page contains real numbers, leadership scope, and technical substance.
- The stack is fast, simple, and trustworthy.

### What is currently weak

- The homepage is mostly a profile card.
- The positioning is too broad and too generic at the top layer.
- Proof exists, but is buried 2-3 clicks deep.
- The site does not package executive/operator credibility clearly enough.
- The teacher angle exists, but is underused.
- The project archive mixes flagship work with student/learning work.
- CTA language is too generic.
- Technical polish has a few visible credibility leaks.

## Primary Positioning

The site should primarily frame Muhammad Hassan Raza as:

> A technical operator and product leader who builds production AI systems and backend platforms, leads teams and technical decisions, and explains complex systems clearly because he has taught and shipped them.

This is the primary hierarchy:

1. operator / product-technical leadership
2. senior engineer / systems builder
3. teacher / mentor

Not this:

- AI specialist
- generic software engineer
- product developer
- portfolio owner

## Target Audiences

### Primary

- founders who need technical/product leadership with hands-on execution
- engineering leaders evaluating technical depth and judgment
- clients with messy production systems or AI projects that need real architecture

### Secondary

- recruiters hiring for senior/principal/staff/product-technical leadership roles
- students, mentees, and early-career engineers

## Messaging Principles

- Lead with proof before labels.
- Use outcomes before capability buckets.
- Show judgment, not just stack familiarity.
- Curate aggressively. Do not present every project as equally important.
- Private work still needs proof via role, scope, constraints, and outcomes.
- Every major page should have one obvious next step.

## Decision Gates

These need to be resolved before final copy is locked:

1. Teacher status:
   - Is the intended framing `current instructor` or `former instructor / ex-teacher`?
   - Current site content says `Lab Instructor ... Present`.

2. Executive label:
   - Should the site explicitly use `CIO`, or imply that level through `CPO`, `technical operator`, `product and technical leadership`, and proof?
   - Recommendation: imply or use a softer executive-operator framing unless `CIO` is literally accurate and desirable.

3. Private work disclosure:
   - Can specific company names, screenshots, or anonymized metrics be used for private client/commercial work?

4. Services posture:
   - Is this site actively selling consulting/services, or should it primarily position for senior leadership roles and selective advisory work?

## Scope

## In Scope

- homepage repositioning
- navigation and information architecture cleanup
- About rewrite
- Services rewrite
- Projects landing page redesign and curation
- Blog landing page framing
- Book a Call / contact conversion rewrite
- teacher/mentor surface creation or expansion
- metadata/schema/OG cleanup
- repo/publishing hygiene cleanup plan

## Out of Scope

- full migration away from Hugo
- full theme replacement across every page template
- rewriting every blog post body
- rebuilding the entire design system from scratch

## Workstreams

### 1. Homepage Rebuild

#### Objective

Replace the profile-mode splash page with an authored homepage that proves authority immediately.

#### Files

- `layouts/_default/home.html`
- `layouts/partials/index_profile.html`
- `hugo.yaml`
- optionally new homepage partials under `layouts/partials/`
- homepage copy source, likely `content/_index.md` if needed

#### Required changes

- Stop relying on `profileMode` as the primary homepage experience.
- Build a custom homepage with explicit sections.
- Reduce duplication between hero CTAs and top nav.
- Keep the homepage content-first, not social-icon-first.

#### Required homepage sections

1. Hero
   - one sharp positioning line
   - one support paragraph
   - one primary CTA
   - one secondary CTA

2. Selected Outcomes
   - 4-6 short proof blocks with hard numbers or concrete scope
   - examples:
     - team led
     - onboarding time reduction
     - query/performance improvement
     - regulated/compliance system
     - large AI agent surface
     - teaching or mentoring footprint

3. Featured Work
   - 2-3 flagship case studies only
   - each should show context, role, system type, constraint, and result

4. Selected Writing
   - 3-4 essays that demonstrate judgment, not just technical syntax
   - recommended themes:
     - production failures
     - AI product judgment
     - architecture taste
     - code review / systems thinking

5. Teaching / Mentoring
   - short section establishing instructor/mentor credibility
   - point to strongest relevant writing or a dedicated page

6. Testimonial / external proof
   - one strong quote only if it materially helps
   - otherwise replace with proof blocks

7. Closing CTA
   - audience-specific and concrete

#### Acceptance criteria

- A visitor can understand level, domain, and trustworthiness without clicking any other page.
- Homepage is not centered-avatar-first.
- Homepage does not feel like stock PaperMod profile mode.

### 2. Navigation and IA Cleanup

#### Objective

Shift the site from utility-first navigation to proof-first navigation.

#### Files

- `hugo.yaml`
- relevant nav partials if needed

#### Required changes

- Reduce top-level nav to the fewest important surfaces.
- Remove `Search` from primary nav.
- Stop repeating the same CTA set in multiple places above the fold.

#### Recommended nav direction

- `Work`
- `Writing`
- `About`
- `Contact`

Optional:

- `Teaching`
- `Services`

#### Acceptance criteria

- Primary nav reflects what matters most for trust and conversion.
- Utility pages are still available, but not treated as core proof surfaces.

### 3. About Page Rewrite

#### Objective

Turn About from a chronological resume dump into a high-signal executive-operator profile.

#### Files

- `content/about/_index.md`

#### Required changes

- Rewrite the opening 2-3 paragraphs.
- Lead with current operating scope and what makes the work high-stakes.
- Pull key outcomes and responsibilities up near the top.
- Resolve the teacher-status contradiction.
- Compress or reduce commodity skill-list emphasis.

#### Recommended structure

1. Positioning intro
2. Selected outcomes / operating scope
3. Work history
4. Teaching / mentoring
5. Featured domains
6. Optional condensed skills/tools
7. CTA

#### Acceptance criteria

- About reads like a leadership profile with deep technical credibility.
- The page does not bury the strongest proof below resume chronology.

### 4. Services Reframe

#### Objective

Move from service categories to outcome-oriented engagement framing.

#### Files

- `content/services/_index.md`

#### Required changes

- Replace generic buckets like `AI Systems / Backend Development / Architecture Consulting` with problem/outcome framing.
- Clarify who should hire him, when, and for what kind of problems.
- Add fit / non-fit guidance.
- Add engagement shape and expected outputs.

#### Recommended service framing

1. Stabilize a production system
2. Design or repair a production AI workflow
3. Audit architecture, product, or platform decisions before they become expensive

#### Add

- who this is for
- example problems
- what the engagement produces
- what a good first call looks like

#### Acceptance criteria

- Services reads like a high-trust operator/advisor page, not a freelancer capability list.

### 5. Projects Curation and Reclassification

#### Objective

Separate flagship authority work from side projects, student work, and experiments.

#### Files

- `content/projects/_index.md`
- project markdown files under `content/projects/`
- possibly template overrides for project listing cards

#### Required changes

- Add narrative framing to the Projects index.
- Split projects into at least two groups:
  - `Featured Work`
  - `Labs / Experiments / Archive`
- Downrank or move weaker-signal projects out of the main flagship lane.

#### Keep in flagship lane

- Polaris
- Obelisk
- Anatomia
- Bonnet
- any other project with strong operator/production relevance

#### Move to secondary lane

- PGM editor
- PixelCryptor
- IoT garbage monitoring
- similar learning/university projects
- the portfolio site itself should not be positioned as flagship proof

#### Case study requirements for flagship pages

- context
- role
- constraints
- hard problems
- outcomes
- screenshots or visual proof where possible
- private-work substitutes when public details are limited

#### Acceptance criteria

- A visitor immediately sees which work is senior/operator-grade.
- Student or hobby work no longer weakens calibration.

### 6. Writing and Teaching Surface

#### Objective

Use the writing to prove judgment and use the teaching background to deepen authority.

#### Files

- `content/blog/_index.md`
- `content/resources.md`
- optionally new `content/teaching/_index.md`

#### Required changes

- Add framing to the blog landing page.
- Create a `Start Here` path for first-time readers.
- Expand or replace `Resources` so it does more than list links.
- Add a dedicated teaching/mentoring page or a stronger homepage section.

#### Recommended blog framing

- production systems
- AI product judgment
- software design and architecture
- open source and codebase thinking
- teaching and mentoring

#### Recommended curated posts

- `war-stories-from-production`
- `llms-cant-save-bad-ux`
- `langgraph-multi-agent-middleware`
- `best-way-to-learn-a-codebase`
- `fyp-guidance`

#### Acceptance criteria

- Writing is clearly presented as proof of judgment, not just personal blogging.
- Teacher/mentor credibility is visible without digging.

### 7. Book a Call / Contact Conversion Rewrite

#### Objective

Make contact flow specific, high-trust, and audience-aware.

#### Files

- `content/book-a-call.md`

#### Required changes

- Replace generic “free consultation” framing with concrete fit guidance.
- Clarify:
  - who should book
  - what the call is for
  - what happens on the call
  - what good-fit work looks like
  - when email is better than a call

- Replace weak testimonials with:
  - stronger quotes
  - better attribution
  - or proof blocks if quotes are not strong enough

#### Acceptance criteria

- Contact page feels selective and high-trust.
- CTA does not sound like generic freelancer lead capture.

### 8. Metadata, Schema, and Publishing Hygiene

#### Objective

Remove visible technical sloppiness that weakens authority.

#### Files

- `hugo.yaml`
- `layouts/partials/extend_head.html`
- `layouts/partials/google_analytics.html`
- `layouts/partials/giscus.html`
- `.gitignore`
- generated output directories and publish hygiene

#### Required changes

- Fix or remove broken Google Analytics output.
- Keep one analytics source of truth.
- Add better schema:
  - `Person` for homepage
  - `WebSite` with search metadata
  - better project/article semantics where feasible
- Ensure top-level pages have strong descriptions.
- Add default social/OG image strategy.
- Improve project/blog social preview consistency.
- Remove tracked or deployable junk:
  - stale render directories
  - published raw source assets
  - leftover generated files not needed in source control
- Review head asset loading for duplication.
- Fix giscus theme sync if theme state target is wrong.

#### Acceptance criteria

- No broken analytics script output in rendered HTML.
- Homepage and major pages share cleanly with strong metadata.
- Repo source tree looks intentional and maintained.

## Design Direction

### High-level direction

The site should feel:

- calm
- editorial
- sharp
- confident
- proof-first

Not:

- playful dev theme
- centered resume splash
- SaaS-template generic
- icon-heavy
- self-consciously “designerly”

### Design requirements

- custom homepage composition
- stronger type hierarchy
- less dependence on rounded-card theme defaults
- fewer decorative icons
- more visual weight on case studies and proof
- remove low-signal footer branding if appropriate

## Content Rules

- Every top-level page needs a deliberate intro.
- Every flagship project needs role + problem + outcome.
- Every CTA must be explicit about audience and next step.
- Skills lists should never carry more weight than proof.
- Use exact numbers where available.
- If specific private data cannot be named, use bounded anonymized proof.

## Recommended Implementation Order

### Phase 1: Positioning and IA

- rewrite hero/meta copy
- redesign homepage structure
- clean nav
- reframe About top section

### Phase 2: Proof and conversion

- rewrite Services
- rewrite Book a Call
- curate Projects
- add featured work and selected writing sections

### Phase 3: Teaching and metadata

- add teaching/mentoring surface
- improve blog/resources framing
- fix schema/OG/analytics
- clean publishing hygiene

### Phase 4: Visual polish

- finalize homepage design language
- remove theme residue
- tighten typography and spacing

## Success Criteria

The implementation is successful if:

- the homepage no longer reads like a theme profile card
- the top message is no longer generic
- flagship work is clearly separated from secondary work
- proof is visible without deep clicking
- teacher/mentor credibility is visible
- the contact path is sharper and more selective
- technical polish issues are removed
- the site feels like an operator-grade authority asset

## Suggested Deliverable for the Next Pass

The next implementation pass should produce:

1. homepage redesign
2. rewritten `About`
3. rewritten `Services`
4. rewritten `Book a Call`
5. curated `Projects` landing page
6. framed `Blog` landing page
7. metadata/schema cleanup
8. repo/publish hygiene cleanup

This pass should prioritize structural and content upgrades first, then visual polish, not the other way around.
