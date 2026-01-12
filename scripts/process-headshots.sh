#!/usr/bin/env bash
set -euo pipefail

if ! command -v magick >/dev/null 2>&1; then
  echo "Error: ImageMagick 'magick' is required." >&2
  exit 1
fi

size="760x900"
output_name=""
inputs=()

usage() {
  cat <<'EOF'
Usage:
  scripts/process-headshots.sh [--size WxH] [--name output-name] input...

Examples:
  scripts/process-headshots.sh ~/Downloads/jane.png
  scripts/process-headshots.sh --name jane-doe ~/Downloads/jane.png
  scripts/process-headshots.sh --size 1200x1500 ~/Downloads/*.jpg

Outputs are written to public/images/speakers as JPG files.
EOF
}

while [ $# -gt 0 ]; do
  case "$1" in
    --size)
      size="${2:-}"
      shift 2
      ;;
    --name)
      output_name="${2:-}"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      inputs+=("$1")
      shift
      ;;
  esac
done

if [ "${#inputs[@]}" -eq 0 ]; then
  usage
  exit 1
fi

if [ "${#inputs[@]}" -gt 1 ] && [ -n "$output_name" ]; then
  echo "Error: --name can only be used with a single input file." >&2
  exit 1
fi

out_dir="public/images/speakers"
mkdir -p "$out_dir"

process_one() {
  local input="$1"
  local name="$2"

  if [ ! -f "$input" ]; then
    echo "Warning: Skipping missing file: $input" >&2
    return
  fi

  local base="$name"
  if [ -z "$base" ]; then
    base="$(basename "${input%.*}")"
  fi

  local output="${out_dir}/${base}.jpg"

  magick "$input" \
    -auto-orient \
    -resize "${size}^" \
    -gravity center \
    -extent "$size" \
    -strip \
    -quality 82 \
    "$output"

  echo "Wrote ${output}"
}

for input in "${inputs[@]}"; do
  process_one "$input" "$output_name"
  output_name=""
done
