# Hacker News RSC Demo (React on Rails Pro)

This repository is the implementation workspace for:

- [Epic: Hacker News RSC Demo for React on Rails Pro](https://github.com/shakacode/react_on_rails-demos/issues/70)
- [Repo Execution Epic](https://github.com/shakacode/react-on-rails-hn-rsc-demo/issues/14)

## Baseline Setup

Initial app scaffolding was created with:

- `create-react-on-rails-app@16.4.0-rc.4`

Pinned package versions:

- npm:
  - `react@19.0.6`
  - `react-dom@19.0.6`
  - `react-on-rails-pro@17.0.0-rc.0`
  - `react-on-rails-pro-node-renderer@17.0.0-rc.0`
  - `react-on-rails-rsc@19.0.5-rc.3`
  - `shakapacker@10.1.0`
- RubyGems:
  - `react_on_rails_pro@17.0.0.rc.0`
  - `shakapacker@10.1.0`

## Running Locally

This project is configured to use `mise`.

```bash
MISE_TRACK_CONFIG_FILES=0 mise x ruby@3.4.3 node@24.8.0 -- bundle install
MISE_TRACK_CONFIG_FILES=0 mise x ruby@3.4.3 node@24.8.0 -- pnpm install
MISE_TRACK_CONFIG_FILES=0 mise x ruby@3.4.3 node@24.8.0 -- bin/rails db:create
MISE_TRACK_CONFIG_FILES=0 mise x ruby@3.4.3 node@24.8.0 -- bin/dev
```

You can also run static assets mode:

```bash
MISE_TRACK_CONFIG_FILES=0 mise x ruby@3.4.3 node@24.8.0 -- bin/dev static
```

## Deployment

Control Plane review and staging app setup lives in `.controlplane/`, with
GitHub workflow wrappers in `.github/workflows/cpflow-*.yml`. The staging app is
`react-on-rails-hn-rsc-demo-staging`, review apps use the
`react-on-rails-hn-rsc-demo-review-pr` prefix, and the preferred public custom
domain is `hn.reactonrails.com`.

## Notes

- RSC support is enabled in `config/initializers/react_on_rails_pro.rb`.
- Webpack is enabled in `config/shakapacker.yml` because this demo's RSC bundle config is Webpack-shaped.
- Routes implemented:
  - `/` and `/news/:page` for stories
  - `/item/:id` for item detail
  - `/user/:id` for user profile
- `react_on_rails:doctor` still reports a warning about missing `react-on-rails` npm package; this app intentionally uses `react-on-rails-pro` instead.
