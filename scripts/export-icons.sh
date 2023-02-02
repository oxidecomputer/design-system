#!/bin/bash

set -e
set -o pipefail
shopt -s nullglob

ICONS_DIR="icons"

# Parse .dotenv if it exists
export $(egrep -v '^#' .env | xargs)

rm -rf $ICONS_DIR

# This command requires a FIGMA_TOKEN env var with read access to Oxide's DS to be set
npx figma-export use-config

# Replace fills with current color
sed -i 's/fill=".*"/fill="currentColor"/g' icons/*

# Export icons type file
touch icons/icons.ts
echo "export type IconName =" > icons/icons.ts
for icon in icons/*.svg; do
  echo "| \"${icon}\"" >> icons/icons.ts
done

sed -E -i 's|icons/(..*)\.svg|\1|g' icons/icons.ts

npm run fmt .
