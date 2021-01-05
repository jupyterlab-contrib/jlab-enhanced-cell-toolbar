# jlab-enhanced-cell-toolbar

![Github Actions Status](https://github.com/jupyterlab-contrib/jlab-enhanced-cell-toolbar/workflows/Build/badge.svg) [![Binder](https://mybinder.org/badge_logo.svg)](https://mybinder.org/v2/gh/jupyterlab-contrib/jlab-enhanced-cell-toolbar/main?urlpath=lab) [![npm](https://img.shields.io/npm/v/@jlab-enhanced/cell-toolbar)](https://www.npmjs.com/package/@jlab-enhanced/cell-toolbar) [![PyPI](https://img.shields.io/pypi/v/jlab-enhanced-cell-toolbar)](https://pypi.org/project/jlab-enhanced-cell-toolbar)

A cell toolbar for JupyterLab.

![Demonstration](https://raw.githubusercontent.com/jupyterlab-contrib/jlab-enhanced-cell-toolbar/main/demo_cell_toolbar.gif)

## Requirements

- JupyterLab >= 3.0

## Install

```bash
pip install jlab-enhanced-cell-toolbar
```

or

```bash
conda install -c conda-forge jlab-enhanced-cell-toolbar
```

## Uninstall

```bash
pip uninstall jlab-enhanced-cell-toolbar
```

or

```bash
conda remove -c conda-forge jlab-enhanced-cell-toolbar
```

## Alternatives

Don't like what you see here? Try these other approaches:

- [jupyterlab-show-cell-tags](https://github.com/mje-nz/jupyterlab-show-cell-tags)
- [jupyterlab-colabinspired-codecellbtn](https://github.com/eddienko/jupyterlab-colabinspired-codecellbtn)
- [jupyterlab-codecellbtn](https://github.com/ibqn/jupyterlab-codecellbtn)

## Contributing

### Development install

Note: You will need NodeJS to build the extension package.

The `jlpm` command is JupyterLab's pinned version of
[yarn](https://yarnpkg.com/) that is installed with JupyterLab. You may use
`yarn` or `npm` in lieu of `jlpm` below.

```bash
# Clone the repo to your local environment
# Change directory to the jlab_enhanced_cell_toolbar directory
# Install package in development mode
pip install -e .
# Link your development version of the extension with JupyterLab
jupyter labextension develop . --overwrite
# Rebuild extension Typescript source after making changes
jlpm run build
```

You can watch the source directory and run JupyterLab at the same time in different terminals to watch for changes in the extension's source and automatically rebuild the extension.

```bash
# Watch the source directory in one terminal, automatically rebuilding when needed
jlpm run watch
# Run JupyterLab in another terminal
jupyter lab
```

With the watch command running, every saved change will immediately be built locally and available in your running JupyterLab. Refresh JupyterLab to load the change in your browser (you may need to wait several seconds for the extension to be rebuilt).

By default, the `jlpm run build` command generates the source maps for this extension to make it easier to debug using the browser dev tools. To also generate source maps for the JupyterLab core extensions, you can run the following command:

```bash
jupyter lab build --minimize=False
```
