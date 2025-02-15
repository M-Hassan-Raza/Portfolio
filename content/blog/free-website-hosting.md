---
title: "How I Built My Portfolio Website with Hugo, GitHub Pages, and Free Tools"
date: 2025-02-15T14:00:00+05:00
description: "A detailed breakdown of how I built my personal portfolio website using Hugo, GitHub Pages, free analytics, and more."
tags: [Hugo, GitHub Pages, Portfolio, Web Development]
---

## Introduction
As a developer, having a portfolio website is crucial for showcasing skills, projects, and expertise. I wanted a fast, minimal, and easily maintainable site, so I chose **Hugo** with the **PaperMod** theme. Best of all, I leveraged free tools for deployment, analytics, and discussions. Here’s how I built my portfolio website, hosted on **GitHub Pages** with a **Porkbun** domain.

## Hugo and PaperMod for a Minimalistic Look
Hugo is a **blazing-fast static site generator**, perfect for a developer portfolio. I picked the **PaperMod** theme because of its:
- Clean and professional design.
- Lightweight and fast performance.
- Easy configuration for dark mode, search, and social links.

## Free Hosting with GitHub Pages
I wanted a **zero-cost, hassle-free** hosting solution, and GitHub Pages was the perfect choice. Here’s what I did:
1. Created a **public GitHub repository**.
2. Configured a **GitHub Actions workflow** for automatic deployment.
3. Set the `gh-pages` branch as the **deployment source** in GitHub Pages settings.

Now, every push to my `main` branch automatically updates my live website. 🚀

## Free Analytics with Umami
Google Analytics is powerful, but I preferred something **privacy-friendly and lightweight**. Umami provides:
- **Self-hosted analytics** with no third-party tracking.
- Simple dashboard with essential metrics.
- **No cookies or GDPR concerns.**

I set up **Umami on a free hosting platform** and integrated it with my site by adding the tracking script to `head.html` in Hugo’s layout.

## Free Comments with Giscus
I wanted a **distraction-free, GitHub-powered** commenting system. Giscus was the perfect choice because:
- It uses **GitHub Discussions**, so no extra accounts are needed.
- It’s **ad-free** and requires no backend setup.
- Users can comment with their **GitHub accounts**, keeping discussions relevant.

Setting it up was simple:
1. Installed the **Giscus GitHub app** on my repository.
2. Added the `<script>` to my site’s `config.toml` file.
3. Enabled discussions in my GitHub repository settings.

Now, visitors can leave comments using GitHub, and I manage them just like regular issues.

## Custom Domain with Porkbun
A great domain adds **credibility** to a portfolio. I registered **mhassan.dev** on **Porkbun**, and here’s why it was a great choice:
- **Affordable pricing** compared to other registrars.
- **Free WHOIS privacy protection**.
- **Easy DNS setup** for GitHub Pages.
- **Automatic SSL** without extra configuration.

After purchasing, I simply updated the **CNAME record** to point to GitHub Pages, and Porkbun handled the **HTTPS setup seamlessly**.

## Final Thoughts
Building a portfolio website doesn’t have to be expensive. By using **Hugo, GitHub Pages, Giscus, Umami, and Porkbun**, I got a **fast, professional, and cost-effective** site with minimal effort. If you’re planning to build your own, these tools are a great starting point!

Check out my portfolio at right here dummy, you're on it already :wink:

