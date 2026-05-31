# Control Plane Deployment

This repo uses `cpflow` to generate a Heroku Flow style Control Plane setup:

- review apps for pull requests
- staging deploys from `main`
- manual promotion from staging to production
- nightly cleanup for stale review apps

The app runs three image-backed workloads:

- `rails`: public web workload
- `worker`: Solid Queue worker via `./bin/jobs`
- `renderer`: React on Rails Pro Node renderer on cleartext HTTP/2 port `3800`

PostgreSQL runs as a stateful workload for review and staging demos. Production
should be reviewed before launch; a managed database is usually preferable.

## App Names

| Purpose | Name |
| --- | --- |
| Staging app | `react-on-rails-hn-rsc-demo-staging` |
| Review app prefix | `react-on-rails-hn-rsc-demo-review-pr` |
| Production app | `react-on-rails-hn-rsc-demo-production` |
| Preferred public domain | `hn.reactonrails.com` |

`hn.reactonrails.com` is the recommended custom domain because it is short,
matches the repo name, and avoids making this demo look like an official Hacker
News property.

## GitHub Repository Settings

For review apps, GitHub needs one repository secret:

| Secret | Notes |
| --- | --- |
| `CPLN_TOKEN_STAGING` | Control Plane service-account token for the staging org. |

No GitHub repository variables are required for the normal review-app workflow.
The workflow infers the review app prefix and staging org from
`.controlplane/controlplane.yml` because that file defines exactly one app with
`match_if_app_name_starts_with: true`.

For staging auto-deploys, configure:

| Secret or variable | Value |
| --- | --- |
| `CPLN_TOKEN_STAGING` | Same staging Control Plane token used by review apps. |
| `CPLN_ORG_STAGING` | `shakacode-open-source-examples-staging` |
| `STAGING_APP_NAME` | `react-on-rails-hn-rsc-demo-staging` |

For production promotion later, configure a protected GitHub Environment named
`production`:

| Secret or variable | Value |
| --- | --- |
| `CPLN_TOKEN_PRODUCTION` | Environment secret on `production`, not a repository or organization secret. |
| `CPLN_ORG_PRODUCTION` | Environment variable on `production`: `shakacode-open-source-examples-production` |
| `PRODUCTION_APP_NAME` | Environment variable on `production`: `react-on-rails-hn-rsc-demo-production` |

Protect the `production` environment with required reviewers and prevent
self-review. The generated promotion wrapper passes only the staging token from
repository secrets; GitHub injects `CPLN_TOKEN_PRODUCTION` only after the
environment approval gate passes.

## Control Plane Setup

Bootstrap persistent staging once before the first merge-to-main deploy:

```sh
cpflow setup-app -a react-on-rails-hn-rsc-demo-staging --org shakacode-open-source-examples-staging --skip-post-creation-hook
```

Use `--skip-post-creation-hook` so first-time bootstrap does not try to run
database setup before a Docker image exists. Database preparation belongs in
`.controlplane/release_script.sh`, which runs after the Docker image is built.

Review apps are created on demand by the `+review-app-deploy` workflow and named
`react-on-rails-hn-rsc-demo-review-pr-<PR number>`.

## Control Plane App Secrets

The generated app template expects the app secret dictionary to provide:

- `SECRET_KEY_BASE`
- `RENDERER_PASSWORD`
- `REACT_ON_RAILS_PRO_LICENSE`

Generate values with:

```sh
openssl rand -hex 64 # SECRET_KEY_BASE
openssl rand -hex 32 # RENDERER_PASSWORD
```

The generated PostgreSQL template creates the database secret dictionary
`<app-name>-pg` with the `hn_rsc_demo_gen` username. Replace the placeholder
password before serious staging testing.

## Local Validation

Run:

```sh
bin/test-cpflow-github-flow
node -c client/node-renderer.js
RAILS_ENV=production SECRET_KEY_BASE_DUMMY=1 HN_RSC_DEMO_GEN_DATABASE_PASSWORD=dummy bin/rails assets:precompile
```

If a workload template changes after the persistent staging app exists, apply
the template once before relying on deploy-image alone:

```sh
cpflow apply-template renderer -a react-on-rails-hn-rsc-demo-staging --org shakacode-open-source-examples-staging --yes
```

The renderer workload must expose port `3800` as `http2`, and
`client/node-renderer.js` must bind to `0.0.0.0` in production.
