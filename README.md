# @jlab-enhanced/cell-toolbar

![Github Actions Status](https://github.com/jupyterlab-contrib/jlab-enhanced-cell-toolbar/workflows/Build/badge.svg) [![Binder](https://mybinder.org/badge_logo.svg)](https://mybinder.org/v2/gh/jupyterlab-contrib/jlab-enhanced-cell-toolbar/2.x?urlpath=lab) [![npm](https://img.shields.io/npm/v/@jlab-enhanced/cell-toolbar)](https://www.npmjs.com/package/@jlab-enhanced/cell-toolbar)

A cell toolbar for JupyterLab.

![Demonstration](https://raw.githubusercontent.com/jupyterlab-contrib/jlab-enhanced-cell-toolbar/main/docs/default_look.png)

There are some [Settings](#Settings) to tune the available buttons and the look of this extension.

## Requirements

- JupyterLab >= 2.0,<3

## Install

```bash
jupyter labextension install @jlab-enhanced/cell-toolbar
```

## Uninstall

```bash
jupyter labextension uninstall @jlab-enhanced/cell-toolbar
```

## Settings

- _defaultTags_: The list of default available tags. For example, using the following settings:

```json
{
    "defaultTags": ["hide", "slide"]
}
```

![default tags](https://raw.githubusercontent.com/jupyterlab-contrib/jlab-enhanced-cell-toolbar/main/docs/default_tags.png)

- _leftMenu_ and _rightMenu_: The action buttons to be displayed on the left and right of the cell toolbar. For example, using the following settings:

```json
{
    "leftMenu": [
        {
          "command": "notebook:run-cell",
          "icon": "ui-components:run"
        }
    ],
    "rightMenu": [
        {
          "command": "notebook:delete-cell",
          "icon": "@jlab-enhanced/cell-toolbar:delete"
        }
    ]
}
```

![custom actions](https://raw.githubusercontent.com/jupyterlab-contrib/jlab-enhanced-cell-toolbar/main/docs/menus.png)

> The default JupyterLab icon names can be found in the [ui-components](https://github.com/jupyterlab/jupyterlab/blob/master/packages/ui-components/src/icon/iconimports.ts) package.

- _leftSpace_: The left empty white space in pixel. For example, using the following settings:

```json
{
    "leftSpace": 48
}
```

![left_space](https://raw.githubusercontent.com/jupyterlab-contrib/jlab-enhanced-cell-toolbar/main/docs/left_space.png)

## Alternatives

Don't like what you see here? Try these other approaches:

- [jupyterlab-show-cell-tags](https://github.com/mje-nz/jupyterlab-show-cell-tags)
- [jupyterlab-colabinspired-codecellbtn](https://github.com/eddienko/jupyterlab-colabinspired-codecellbtn)
- [jupyterlab-codecellbtn](https://github.com/ibqn/jupyterlab-codecellbtn)

## Contributing

### Development Install

The `jlpm` command is JupyterLab's pinned version of
[yarn](https://yarnpkg.com/) that is installed with JupyterLab. You may use
`yarn` or `npm` in lieu of `jlpm` below.

```bash
# Clone the repo to your local environment
# Move to jlab-enhanced-cell-toolbar directory

# Install dependencies
jlpm
# Build Typescript source
jlpm build
# Link your development version of the extension with JupyterLab
jupyter labextension install .
# Rebuild Typescript source after making changes
jlpm build
# Rebuild JupyterLab after making any changes
jupyter lab build
```

You can watch the source directory and run JupyterLab in watch mode to watch for changes in the extension's source and automatically rebuild the extension and application.

```bash
# Watch the source directory in another terminal tab
jlpm watch
# Run jupyterlab in watch mode in one terminal tab
jupyter lab --watch
```

Now every change will be built locally and bundled into JupyterLab. Be sure to refresh your browser page after saving file changes to reload the extension (note: you'll need to wait for webpack to finish, which can take 10s+ at times).
