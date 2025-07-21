rm -rf .next-deploy && npm run build && mkdir -p .next-deploy && cp -R .next/* .next-deploy/ && rm -rf .next-deploy/cache && wrangler pages deploy .next-deploy --project-name=isitvegan-admin

