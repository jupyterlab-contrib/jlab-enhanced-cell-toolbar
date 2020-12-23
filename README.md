# @jlab-enhanced/cell-toolbar

![Github Actions Status](https://github.com/fcollonval/jlab-enhanced-cell-toolbar/workflows/Build/badge.svg)[![Binder](https://mybinder.org/badge_logo.svg)](https://mybinder.org/v2/gh/fcollonval/jlab-enhanced-cell-toolbar/main?urlpath=lab)[![npm](https://img.shields.io/npm/v/@jlab-enhanced/cell-toolbar)](https://www.npmjs.com/package/@jlab-enhanced/cell-toolbar)

A cell toolbar for JupyterLab.

![Demonstration](./demo_cell_toolbar.gif)

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
