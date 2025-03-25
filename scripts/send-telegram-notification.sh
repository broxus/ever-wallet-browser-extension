#!/bin/bash

tag=$(git describe --tags --abbrev=0 2>/dev/null)

if [ -z "$tag" ]; then
  version=$(jq .version src/manifest/base.json -r)
  tag="sparx-${version}"
fi

additional_commits=$(git rev-list ${tag}..HEAD --count 2>/dev/null || echo "0")
if [[ "$additional_commits" -gt 0 ]]; then
  tag_name="${tag}.${additional_commits}"
else
  tag_name="${tag}"
fi

archive_url="${CI_PROJECT_URL}/-/jobs/${CI_JOB_ID}/artifacts/browse/release/"
commit_message=$(git log -1 --pretty=%B)
commit_url="${CI_PROJECT_URL}/-/commit/${CI_COMMIT_SHA}"
message="<b><a href=\"${archive_url}\">${tag_name}</a></b> — <a href=\"${commit_url}\">${commit_message}</a>"


curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
    -d chat_id="${TELEGRAM_CHAT_ID}" \
    -d parse_mode="HTML" \
    -d text="${message}"
