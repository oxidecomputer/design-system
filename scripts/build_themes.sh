#!/bin/bash
set -e
set -o pipefail

STYLES_PATH=styles/src
TOKENS_PATH=$STYLES_PATH/.tokens

npx token-transformer --preserveRawValue $STYLES_PATH/tokens.json $TOKENS_PATH/main.json global,colors,core,main
npx token-transformer --preserveRawValue $STYLES_PATH/tokens.json $TOKENS_PATH/yellow.json global,colors,core,yellow-accent,main
npx token-transformer --preserveRawValue $STYLES_PATH/tokens.json $TOKENS_PATH/purple.json global,colors,core,purple-accent,main
npx token-transformer --preserveRawValue $STYLES_PATH/tokens.json $TOKENS_PATH/blue.json global,colors,core,blue-accent,main

# To add a new theme use the the template below and replace `<theme>` with your theme name. You'll also
# need to update the `THEMES` config object in `convert-tokens.ts`
#
# npx token-transformer $STYLES_PATH/tokens.json $TOKENS_PATH/<theme>.json colors,<theme>

node -r esbuild-register scripts/convert-tokens
prettier -w $STYLES_PATH
