# jedlik-nejedlik

[![Netlify Status](https://api.netlify.com/api/v1/badges/db58e9bb-6a29-44cc-bc4c-dbc625f0e105/deploy-status)](https://app.netlify.com/sites/jedlik-nejedlik/deploys)

This is an education site, that I'm building for my wife.

## Planned features

- A website devided into sections based on target audience
- A members section behind auth for bonus content
- A newsletter subscription field
- A contact form with protection against spam
- A workflow for authoring articles, needs dedicated UI but does not need to be
  localized
- An integration with some sort of forms for doing surveys
- A very simple e-shop, checkout workflow
- A simple video course authoring workflow

## Possible technologies and services

- Open props for base styling layer
- HeadlessUI for base components layer
- Postcss for using modern CSS
- Prettier, eslint, stylelint for keeping the codebase in shape
- Nuxt as an application framework
- Directus as a headless CMS
- Mux for video
- Supabase for database and auth
- Mailchimp for email management
- GoPay for payments
- Netlify for hosting
- Sentry for error tracking
- Plausible for analytics

## MCP Integration

Directus supports [Model Context Protocol (MCP)](https://directus.io/docs/guides/ai/mcp) for AI-assisted content management. Example for Claude Code:

```bash
claude mcp add --transport http directus https://<your-domain>/mcp \
  --header "Authorization: Bearer <your-mcp-user-token>"
```
