# Review App Commands

These commands are implemented by local GitHub Actions workflows that wrap
[cpflow](https://github.com/shakacode/control-plane-flow). For full setup,
version-pinning, and troubleshooting details, see the upstream
[CI automation guide](https://github.com/shakacode/control-plane-flow/blob/v5.0.4/docs/ci-automation.md).

## Pull Request Commands

Comment with exactly one command, with no surrounding text or trailing spaces.
A single trailing newline from GitHub's comment editor is accepted.

| Command | What it does |
| --- | --- |
| `+review-app-deploy` | Builds the PR image, creates the review app if needed, deploys, and comments with the review URL. |
| `+review-app-delete` | Deletes the review app. This also runs automatically when the PR closes. |
| `+review-app-help` | Posts this help message on the PR. |

## Standard Setup

For this shared-Postgres review-app path, GitHub needs two repository secrets:

| Name | Where | Notes |
| --- | --- | --- |
| `CPLN_TOKEN_STAGING` | Repository secret | Control Plane service-account token for the staging/review org. |
| `SHARED_POSTGRES_URL_PREFIX` | Repository secret | Shared Postgres connection URL without a database name, for example `postgres://user:password@postgres.staging-shared-postgres.cpln.local:5432`. |

Use a staging/review token that cannot access production Control Plane
resources. Review-app deploys skip fork PR heads because Docker builds and
database setup use repository secrets. If a forked change needs a review app,
first move the reviewed change to a trusted branch in this repository.

Review apps run pull request code. Keep `SHARED_POSTGRES_URL_PREFIX` pointed at
a review-safe database server with no production or customer data, and keep
mounted app secrets limited to review-only renderer credentials, generated
`SECRET_KEY_BASE` values, and license values that are acceptable for review-app
exposure.

No repository variables are required for the standard review-app path. The local
workflows default to review app prefix `react-on-rails-hn-rsc-demo-review-pr`,
staging app `react-on-rails-hn-rsc-demo-staging`, staging org
`shakacode-open-source-examples-staging`, and primary workload `rails`.

Optional overrides exist for forks, clones, and unusual apps:

| Name | Notes |
| --- | --- |
| `CPLN_ORG_STAGING` | Override the staging/review Control Plane org inferred from `controlplane.yml`. |
| `REVIEW_APP_PREFIX` | Override the review-app prefix inferred from `controlplane.yml`. |
| `PRIMARY_WORKLOAD` | Public workload used for review URLs and health checks; defaults to `rails`. |

## Staging And Production

Staging deploys use the same `CPLN_TOKEN_STAGING` and
`SHARED_POSTGRES_URL_PREFIX` secrets. `STAGING_APP_NAME` defaults to
`react-on-rails-hn-rsc-demo-staging`.
Before the first staging deploy, bootstrap the persistent staging app once:

```sh
export APP_NAME="${STAGING_APP_NAME:-react-on-rails-hn-rsc-demo-staging}"
export CPLN_ORG="${CPLN_ORG_STAGING:-shakacode-open-source-examples-staging}"
export APP_WORKLOADS="rails worker renderer"
export SHARED_POSTGRES_URL_PREFIX="postgres://user:password@postgres.staging-shared-postgres.cpln.local:5432"

cpflow setup-app -a "$APP_NAME" --org "$CPLN_ORG"
script/control-plane/ensure-shared-postgres-secret
cpflow apply-template app -a "$APP_NAME" --org "$CPLN_ORG" --yes
```

`setup-app` reads `.controlplane/controlplane.yml`'s `setup_app_templates` and
creates the app identity, app secret dictionary, app secret policy, policy
binding, and template resources. The helper script creates the
`<app-name>-database` dictionary secret and gives the app identity `reveal`
permission. For later template updates on an existing persistent app, use
`cpflow apply-template app` and make sure the app identity still
has `reveal` permission on both the app secret and database secret policies.

Review apps are temporary and are created by the `+review-app-deploy` workflow,
but staging and production are persistent apps and should be bootstrapped
explicitly. Review and staging GVCs should not include a local `postgres`
workload.

For an intentional public demo app, set `ALLOW_DEMO_SEED=true` on the app GVC.
The release script will then run `bin/rails db:seed` after migrations. Leave the
flag unset for private staging and real production apps.

Production promotion is part of the generated flow, but keep it protected:

| Name | Where | Notes |
| --- | --- | --- |
| `CPLN_TOKEN_PRODUCTION` | `production` GitHub Environment secret | Do not store this as a repository or organization secret. |
| `CPLN_ORG_PRODUCTION` | Prefer `production` Environment variable | Production Control Plane org. |
| `PRODUCTION_APP_NAME` | Prefer `production` Environment variable | Production app name from `controlplane.yml`. |

Configure the `production` GitHub Environment with required reviewers and
prevent self-review. The generated promotion wrapper passes only the staging
token from repository secrets; GitHub injects `CPLN_TOKEN_PRODUCTION` only after
the environment approval gate passes.

Before the first promotion, bootstrap the production app the same way in the
production org, using production-only secrets and values.

## Version Locking

These local workflows install the pinned `cpflow` gem through
`.github/actions/cpflow-setup-environment/action.yml`. Keep that action's
`cpflow_version` in sync with this app's Control Plane Flow docs and local
validation scripts.

Release tags are the standard path for this demo because they keep stable
upgrades readable. If your security policy requires immutable GitHub Action
refs, pin the wrappers to the full 40-character commit SHA behind the release
tag with `bin/pin-cpflow-github-ref` and keep `CPFLOW_VERSION` unset unless it
exactly matches the same released gem.

Leave `CPFLOW_VERSION` unset so the workflow builds cpflow from the same
checked-out upstream source. If you set `CPFLOW_VERSION`, it must match the
release tag, for example `CPFLOW_VERSION=5.0.4` with a wrapper pinned to
`uses: ...@v5.0.4`.

After updating the `cpflow` gem in this repo, validate the local workflows in
the same PR:

```sh
bin/test-cpflow-github-flow
```

If `cpflow` is bundled by the app, use:

```sh
bin/test-cpflow-github-flow bundle exec cpflow
```

Do not leave downstream apps pinned to a moving branch such as `main`.

## Advanced Variables

Most apps do not need these:

| Name | Notes |
| --- | --- |
| `DOCKER_BUILD_EXTRA_ARGS` | Newline-delimited extra Docker build tokens. |
| `DOCKER_BUILD_SSH_KEY` | Read-only, revocable deploy key for Docker builds that fetch private dependencies. Do not use a personal SSH key. |
| `DOCKER_BUILD_SSH_KNOWN_HOSTS` | SSH known_hosts entries when SSH build hosts are not GitHub.com. |
| `REVIEW_APP_DEPLOYING_ICON_URL` | Cosmetic custom image URL for the animated deploying icon. Set to `none` to use the text fallback icon. |
| `STAGING_APP_BRANCH` | Custom staging branch. The branch must also appear in `cpflow-deploy-staging.yml`'s push filter. |
| `CPLN_CLI_VERSION` | Pin a specific `@controlplane/cli` version; normally leave unset. |

The PR-open help workflow posts a short command reference for configured demo
repos. Forks or clones that copy the workflow before configuring Control Plane
can remove `.github/workflows/cpflow-review-app-help.yml`.
