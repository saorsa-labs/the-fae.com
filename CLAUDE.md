# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

The Fae website, built with Jekyll 4.3 and deployed to Firebase Hosting.

## Development Commands

```bash
# Install dependencies
bundle install

# Run local server (http://localhost:4000)
bundle exec jekyll serve

# Build for production
bundle exec jekyll build

# Deploy to Firebase
firebase deploy
```

## Site Structure

- `_posts/` - Blog posts in Markdown with YAML front matter
- `_layouts/` - HTML templates
- `_includes/` - Reusable components
- `assets/` - CSS, images, static assets
- `_config.yml` - Jekyll configuration

## Post Format

Posts follow Jekyll convention: `_posts/YYYY-MM-DD-title.md` with front matter:
```yaml
---
layout: post
title: "Post Title"
date: YYYY-MM-DD
---
```

## Deployment

Site is deployed to Firebase Hosting. Build output (`_site/`) is deployed via `firebase deploy`.
