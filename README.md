# Hacker News RSC Demo (React on Rails Pro)

This repository is the implementation workspace for:

- [Epic: Hacker News RSC Demo for React on Rails Pro](https://github.com/shakacode/react_on_rails-demos/issues/70)

## Baseline Setup

Initial app scaffolding was created with:

- `create-react-on-rails-app@16.4.0-rc.4`

Pinned package versions:

- npm:
  - `react-on-rails-pro@16.4.0-rc.4`
  - `react-on-rails-pro-node-renderer@16.4.0-rc.4`
  - `react-on-rails-rsc@19.0.4`
- RubyGems:
  - `react_on_rails@16.4.0.rc.4`
  - `react_on_rails_pro@16.4.0.rc.4`

## Running Locally

This project is configured to use `mise`.

```bash
MISE_TRACK_CONFIG_FILES=0 mise x ruby@3.4.3 node@24.8.0 -- bundle install
MISE_TRACK_CONFIG_FILES=0 mise x ruby@3.4.3 node@24.8.0 -- pnpm install
MISE_TRACK_CONFIG_FILES=0 mise x ruby@3.4.3 node@24.8.0 -- bin/dev
```

You can also run static assets mode:

```bash
MISE_TRACK_CONFIG_FILES=0 mise x ruby@3.4.3 node@24.8.0 -- bin/dev static
```

## Notes

- RSC support is enabled in `config/initializers/react_on_rails_pro.rb`.
- Rspack is enabled in `config/shakapacker.yml`.
- `react_on_rails:doctor` still reports a warning about missing `react-on-rails` npm package; this app intentionally uses `react-on-rails-pro` instead.
