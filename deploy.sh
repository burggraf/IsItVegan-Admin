#!/bin/bash

# Build the project for Cloudflare Pages
npm run pages:build

# Deploy to Cloudflare Pages
npx wrangler pages deploy out --project-name=iiv-admin
