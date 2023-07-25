# @oxide/design-system

Home to the styles, themes, and base components that are shared across Oxide UI clients.

## Installation

```
npm install --save @oxide/design-system
```

## Publishing

This package uses [auto](https://github.com/intuit/auto/) to automatically publish new
changes for any merged pull requests. Version bumps are determined by the GitHub labels
added to the pull request. `major`, `minor`, and `patch` labels bumps the related semver
version when the PR is merged. `documentation` and `internal` can be used instead to
indicate that a version bump shouldn't happen. If you want to indiciate a version bump but
don't want the release to happen yet you can use `major`, `minor`, or `patch` in conjunction
with `skip-release`.

For more information checkout [auto's docs](https://intuit.github.io/auto/docs)

## Syncing with Figma

To ensure consistency between our designs and implementation we use the
[Design Tokens Plugin](https://www.figma.com/community/plugin/888356646278934516/Design-Tokens)
inside of figma to export a [json tokens file](styles/src/tokens.json) to the repo. When
that file is changed the [build-themes](.github/workflows/build-themes.yaml) workflow runs
to generate theme stylesheets, a tailwind token file, and other artifacts in
[dist](styles/dist/).

The design tokens plugin is two way so token changes made in the json file can be synced
back with figma.

## Exporting Icons

Icons are also exported from figma using
[figma export cli](https://figma-export.marcomontalbano.com/). A PR should be opened
automatically for updating icons via the
[update-icons workflow](.github/workflows/update-icons.yaml)
