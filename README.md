# GrapesJsBlockLoaderBundle

## About the plugin
This is a Mautic-Plugin to load a javascript file with custom block definitions for GrapesJS from the active theme folder. It was shamelessly bootstrapped from the [GrapesJsCustomPluginBundle](https://github.com/mautic/GrapesJsCustomPluginBundle).
The branch `keep-default-blocks` has the option to keep some of the default blocks in addition to your custom blocks. The downside is that empty block categories will remain.

## Usage
Create a folder `blocks` within your theme folder. Add a javascript file `blocks-page.js` respectively `blocks-email.js` to the folder (depending if you want the block to be added to the page builder or the email builder).

Sample content of a `blocks-email.js` file where we will keep the default `dynamic-content` block:

```
// required namespace
window.CustomBlockLoaderNamespace = window.CustomBlockLoaderNamespace || {};

// remove default blocks?
window.CustomBlockLoaderNamespace.removeDefaults = false; // true|false (this has to be false if we want to keep some default blocks)

// blocks to keep
// available default blocks in mautic 5.2.7:
// by id: 'mj-1-column', 'mj-2-columns', 'mj-3-columns', 'mj-text', 'mj-button', 'mj-image', 'mj-divider', 'mj-social-group', 'mj-social-element', 'mj-spacer', 'mj-navbar', 'mj-navbar-link', 'mj-hero', 'mj-37-columns', 'text-sect', 'grid-items', 'list-items', 'dynamic-content'
window.CustomBlockLoaderNamespace.blocksToKeep = ['dynamic-content'];

// add custom blocks, group them by category
window.CustomBlockLoaderNamespace.blocks = {
    'text-element-id': {
        label: 'Text',
        category: 'MyCategory',
        attributes: {
            class: 'fa fa-text-width'
        },
        content: `<mj-text font-size="17px">
            This is a paragraph.
        </mj-text>`,
    },
    'button-element-id': {
        label: 'Button',
        category: 'MyCategory',
        attributes: {
            class: 'fa fa-bold'
        },
        content: `<mj-button>Click me now</mj-button>`,
    },
}
```

Sample content of a `blocks-page.js` file:

```
// required namespace
window.CustomBlockLoaderNamespace = window.CustomBlockLoaderNamespace || {};

// remove default blocks?
window.CustomBlockLoaderNamespace.removeDefaults = true; // true|false

// add custom blocks, group them by category
window.CustomBlockLoaderNamespace.blocks = {
    'text-element-id': {
        label: 'Text',
        category: 'MyCategory',
        attributes: {
            class: 'fa fa-text-width'
        },
        content: `<div>
            <p>
                This is a paragraph.
            </p>
        </div`,
    },
    ...
}
```

## Development
Run `npm i` to install dev dependencies, run `npm run build` to build the js dist file.