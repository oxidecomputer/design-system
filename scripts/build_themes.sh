#!/bin/bash
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, you can obtain one at https://mozilla.org/MPL/2.0/.
#
# Copyright Oxide Computer Company

set -e
set -o pipefail

STYLES_PATH=styles/src
TOKENS_PATH=$STYLES_PATH/.tokens

npx token-transformer --preserveRawValue $STYLES_PATH/tokens.json $TOKENS_PATH/main.json global,colors,core,main
npx token-transformer --preserveRawValue $STYLES_PATH/tokens.json $TOKENS_PATH/green.json global,colors,core,green-accent,main
npx token-transformer --preserveRawValue $STYLES_PATH/tokens.json $TOKENS_PATH/yellow.json global,colors,core,yellow-accent,main
npx token-transformer --preserveRawValue $STYLES_PATH/tokens.json $TOKENS_PATH/purple.json global,colors,core,purple-accent,main
npx token-transformer --preserveRawValue $STYLES_PATH/tokens.json $TOKENS_PATH/blue.json global,colors,core,blue-accent,main
npx token-transformer --preserveRawValue $STYLES_PATH/tokens.json $TOKENS_PATH/red.json global,colors,core,red-accent,main

# To add a new theme use the the template below and replace `<theme>` with your theme name. You'll also
# need to update the `THEMES` config object in `convert-tokens.ts`
#
# npx token-transformer $STYLES_PATH/tokens.json $TOKENS_PATH/<theme>.json colors,<theme>

tsx ./scripts/convert-tokens.ts
cp ./styles/src/tailwind.css ./styles/dist/tailwind.css
cp ./styles/src/preflight.css ./styles/dist/preflight.css
prettier -w styles
