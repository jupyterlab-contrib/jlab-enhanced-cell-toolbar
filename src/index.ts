import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import {
  createToolbarFactory,
  IToolbarWidgetRegistry,
  ToolbarRegistry
} from '@jupyterlab/apputils';
import { Cell } from '@jupyterlab/cells';
import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { ITranslator, nullTranslator } from '@jupyterlab/translation';
import { Widget } from '@lumino/widgets';
import { CellBarExtension } from './celltoolbartracker';
import { EXTENSION_ID, FACTORY_NAME } from './tokens';

/**
 * Export the icons so they got loaded
 */
export { codeIcon, deleteIcon, formatIcon } from './icon';

const defaultToolbar: ISettingRegistry.IToolbarItem[] = [
  {
    name: 'markdown-to-code',
    cellType: 'markdown',
    command: 'notebook:change-cell-to-code',
    icon: '@jlab-enhanced/cell-toolbar:code'
  },
  {
    name: 'code-to-markdown',
    cellType: 'code',
    command: 'notebook:change-cell-to-markdown',
    icon: 'ui-components:markdown'
  },
  // Not available by default
  // {
  //   name: 'format-code',
  //   cellType: 'code',
  //   command: 'jupyterlab_code_formatter:format',
  //   icon: '@jlab-enhanced/cell-toolbar:format',
  //   tooltip: 'Format Cell'
  // },
  {
    name: 'delete-cell',
    command: 'notebook:delete-cell',
    icon: '@jlab-enhanced/cell-toolbar:delete'
  },
  {
    name: 'spacer',
    type: 'spacer'
  }
];

/**
 * Initialization data for the jlab-enhanced-cell-toolbar extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: `${EXTENSION_ID}:plugin`,
  autoStart: true,
  activate: async (
    app: JupyterFrontEnd,
    toolbarRegistry: IToolbarWidgetRegistry,
    settingRegistry: ISettingRegistry | null,
    translator: ITranslator | null
  ) => {
    // Register specific toolbar items
    toolbarRegistry.registerFactory(
      FACTORY_NAME,
      'tags-editor',
      (w: Widget) => new Widget()
    );

    if (settingRegistry) {
      const cellToolbarFactory = createToolbarFactory(
        toolbarRegistry,
        settingRegistry,
        FACTORY_NAME,
        extension.id,
        translator ?? nullTranslator
      );

      settingRegistry
        .load(extension.id)
        .then(settings => {
          app.docRegistry.addWidgetExtension(
            'Notebook',
            new CellBarExtension(app.commands, cellToolbarFactory, settings)
          );
        })
        .catch(reason => {
          console.error(`Failed to load settings for ${extension.id}.`, reason);
        });
    } else {
      app.docRegistry.addWidgetExtension(
        'Notebook',
        new CellBarExtension(
          app.commands,
          (c: Cell): ToolbarRegistry.IToolbarItem[] =>
            defaultToolbar
              .filter(item => !item.cellType || item.cellType === c.model.type)
              .map(item => {
                return {
                  name: item.name,
                  widget: toolbarRegistry.createWidget(FACTORY_NAME, c, item)
                };
              }),
          null
        )
      );
    }
  },
  optional: [ISettingRegistry, ITranslator],
  requires: [IToolbarWidgetRegistry]
};

export default extension;
