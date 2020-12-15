import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { CellBarExtension } from './celltoolbartracker';

const EXTENSION_ID = '@jlab-enhanced/cell-toolbar:plugin';

/**
 * Initialization data for the jlab-enhanced-cell-toolbar extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: EXTENSION_ID,
  autoStart: true,
  activate: async (
    app: JupyterFrontEnd,
    settingRegistry: ISettingRegistry | null
  ) => {
    const settings = await settingRegistry.load(EXTENSION_ID);
    app.docRegistry.addWidgetExtension(
      'Notebook',
      new CellBarExtension(app.commands, settings)
    );
  },
  optional: [ISettingRegistry]
};

export default extension;
