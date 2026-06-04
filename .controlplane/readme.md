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

Review and staging apps use the shared staging Postgres GVC. Each app gets its
own `<app-name>-database` dictionary with demo-safe logical databases for
primary, cache, queue, and cable connections. The review/staging GVCs should
not have a local `postgres` workload.

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

For review apps, GitHub needs these repository secrets:

| Secret | Notes |
| --- | --- |
| `CPLN_TOKEN_STAGING` | Control Plane service-account token for the staging org. |
| `SHARED_POSTGRES_URL_PREFIX` | Optional when `SHARED_POSTGRES_SOURCE_SECRET` points at an existing Control Plane database secret. Shared Postgres connection URL without a database name, for example `postgres://user:password@postgres.staging-shared-postgres.cpln.local:5432`. |

Use a staging/review token that cannot access production Control Plane
resources. In public repositories, review-app deploys skip fork PR heads
because Docker builds and database setup use repository secrets. If a forked
change needs a review app, first move the reviewed change to a trusted branch
in this repository.

Review apps run pull request code. Keep `SHARED_POSTGRES_URL_PREFIX` pointed at
a review-safe database server with no production or customer data, and use
database credentials that are acceptable for demo-safe logical review databases.

`SHARED_POSTGRES_SOURCE_SECRET` can be set as a repository variable when the
prefix should be derived from an existing Control Plane dictionary secret with a
`DATABASE_URL` entry. It defaults to
`react-on-rails-hn-rsc-demo-staging-database`. The local workflow defaults to
`react-on-rails-hn-rsc-demo-review-pr` in `shakacode-open-source-examples-staging`.

For staging auto-deploys, configure:

| Secret or variable | Value |
| --- | --- |
| `CPLN_TOKEN_STAGING` | Same staging Control Plane token used by review apps. |
| `SHARED_POSTGRES_URL_PREFIX` | Optional when the staging database secret already exists in Control Plane. Same shared Postgres URL prefix used by review apps. |
| `SHARED_POSTGRES_SOURCE_SECRET` | Optional existing Control Plane dictionary secret used to derive the shared Postgres URL prefix. Defaults to `react-on-rails-hn-rsc-demo-staging-database`. |
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
self-review. The promotion workflow runs as a normal caller-repo job with
`environment: production`, then checks out the pinned Control Plane Flow release
for shared actions. GitHub injects `CPLN_TOKEN_PRODUCTION` only after the
environment approval gate passes.

## Control Plane Setup

Bootstrap persistent staging once before the first merge-to-main deploy:

```sh
export APP_NAME=react-on-rails-hn-rsc-demo-staging
export CPLN_ORG=shakacode-open-source-examples-staging
export APP_WORKLOADS="rails worker renderer"
export SHARED_POSTGRES_URL_PREFIX="postgres://user:password@postgres.staging-shared-postgres.cpln.local:5432"

cpflow setup-app -a "$APP_NAME" --org "$CPLN_ORG"
script/control-plane/ensure-shared-postgres-secret
cpflow apply-template app -a "$APP_NAME" --org "$CPLN_ORG" --yes
```

Database preparation belongs in `.controlplane/release_script.sh`, which runs
after the Docker image is built. The deploy workflows run
`script/control-plane/ensure-shared-postgres-secret` before `deploy-image` so
new review apps and staging deploys use the shared database before migrations.

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

The deploy workflow creates the database secret dictionary `<app-name>-database`
from `SHARED_POSTGRES_URL_PREFIX`, or derives that prefix from
`SHARED_POSTGRES_SOURCE_SECRET` when the GitHub secret is not set. Database
policies are created per app by `script/control-plane/ensure-shared-postgres-secret`.
Do not add `.controlplane/templates/postgres.yml` or a `postgres` workload for
review/staging apps.

Values mounted through `cpln://secret/...` can be read by application code after
the review app starts. Keep review-app secrets disposable or review-only:
separate renderer credentials, generated `SECRET_KEY_BASE` values, and a Pro
license value that is acceptable for review-app exposure. Do not reuse
production or long-lived staging secret dictionaries for review apps.

## Local Validation

Run:

```sh
bin/test-cpflow-github-flow
node -c client/node-renderer.js
RAILS_ENV=production SECRET_KEY_BASE_DUMMY=1 DATABASE_URL=postgres://postgres:postgres@localhost:5432/hn_rsc_demo_gen_test bin/rails assets:precompile
```

If a workload template changes after the persistent staging app exists, apply
the template once before relying on deploy-image alone:

```sh
cpflow apply-template renderer -a react-on-rails-hn-rsc-demo-staging --org shakacode-open-source-examples-staging --yes
```

If the GVC template changes, also re-apply the shared database template:

```sh
cpflow apply-template app -a react-on-rails-hn-rsc-demo-staging --org shakacode-open-source-examples-staging --yes
```

The renderer workload must expose port `3800` as `http2`, and
`client/node-renderer.js` must bind to `0.0.0.0` in production.
