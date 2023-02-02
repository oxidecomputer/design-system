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

npm run fmt .
