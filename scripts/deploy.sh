#!/usr/bin/env bash
# Manual deploy path for ropasclisp.kembec.com: the same file runs in GitHub Actions (ubuntu) and by hand.
#
#   scripts/deploy.sh [build|publish|all]   (default: all)
#
# The site is the Cloudflare Pages project `ropasclisp`, connected to this repo: Cloudflare builds
# every push by itself (no GitHub Actions minutes), main as production and any other branch as a
# preview at <branch>.ropasclisp.pages.dev. This script is the fallback when that build is not an
# option, and it keeps the same rule because Pages decides the environment from --branch:
#   main          -> production deployment.
#   other branch  -> preview deployment of that branch; production is never touched.
#
# Needs CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROJECT="ropasclisp"
STAGE="${1:-all}"
BRANCH="${DEPLOY_BRANCH:-${GITHUB_REF_NAME:-$(git -C "$ROOT" branch --show-current)}}"
SHA="$(git -C "$ROOT" rev-parse HEAD)"

[[ -n "$BRANCH" ]] || { echo "deploy: detached HEAD; set DEPLOY_BRANCH" >&2; exit 2; }
TARGET="preview"
[[ "$BRANCH" == "main" ]] && TARGET="production"
echo "deploy: ${TARGET} of ${BRANCH}@${SHA:0:7} to Pages project ${PROJECT}"

build() {
  cd "$ROOT"
  pnpm install --frozen-lockfile
  pnpm run build
}

publish() {
  cd "$ROOT"
  pnpm dlx wrangler@4.59.2 pages deploy dist --project-name "$PROJECT" --branch "$BRANCH" \
    --commit-hash "$SHA" --commit-message "${TARGET} ${BRANCH}@${SHA:0:7}" --commit-dirty=false
}

case "$STAGE" in
  build) build ;;
  publish) publish ;;
  all) build; publish ;;
  *) echo "usage: scripts/deploy.sh [build|publish|all]" >&2; exit 2 ;;
esac
