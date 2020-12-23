import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { CellBarExtension } from './celltoolbartracker';
import { EXTENSION_ID } from './tokens';

/**
 * Initialization data for the jlab-enhanced-cell-toolbar extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: `${EXTENSION_ID}:plugin`,
  autoStart: true,
  activate: async (
    app: JupyterFrontEnd,
    settingRegistry: ISettingRegistry | null
  ) => {
    const settings = await settingRegistry.load(`${EXTENSION_ID}:plugin`);
    app.docRegistry.addWidgetExtension(
      'Notebook',
      new CellBarExtension(app.commands, settings)
    );
  },
  optional: [ISettingRegistry]
};

export default extension;
