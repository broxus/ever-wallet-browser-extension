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

commit_message=$(git log -1 --pretty=%B | tr '\n' ' ')

# Build the HTML caption message using printf
message=$(printf '<b><a href="%s">%s</a></b> — <a href="%s">%s</a>' \
  "${CI_PROJECT_URL}/-/jobs/${CI_JOB_ID}/artifacts/browse/release/" \
  "${tag_name}" \
  "${CI_PROJECT_URL}/-/commit/${CI_COMMIT_SHA}" \
  "${commit_message}"
)

# Get all files from the "release" folder as absolute paths
FILES=( $(find release -type f -exec realpath {} \;) )
if [ ${#FILES[@]} -eq 0 ]; then
  echo "No files found in release/"
  exit 1
fi

# Build the JSON media array using jq.
# The *last* media item will include the caption and parse_mode.
media_array="[]"
last_index=$(( ${#FILES[@]} - 1 ))

for i in "${!FILES[@]}"; do
  if [ "$i" -eq "$last_index" ]; then
    # If this is the last file, attach the caption
    media_array=$(jq --arg idx "doc${i}" --arg msg "$message" \
      '. + [{"type": "document", "media": ("attach://" + $idx), "caption": $msg, "parse_mode": "HTML"}]' <<< "$media_array")
  else
    media_array=$(jq --arg idx "doc${i}" \
      '. + [{"type": "document", "media": ("attach://" + $idx)}]' <<< "$media_array")
  fi
done

# Convert to a compact JSON string
media_json=$(jq -c . <<< "$media_array")

# Read the JSON into a variable for use with --form-string
media_content="$media_json"

# Build the curl command
curl_cmd=(curl -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMediaGroup"
  -F "chat_id=${TELEGRAM_CHAT_ID}"
  --form-string "media=${media_content}"
)

# Attach each file with a unique field name
for i in "${!FILES[@]}"; do
  curl_cmd+=( -F "doc${i}=@${FILES[$i]}" )
done

echo "Executing: ${curl_cmd[*]}"
"${curl_cmd[@]}"