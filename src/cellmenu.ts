import { ToolbarButton } from '@jupyterlab/apputils';
import { markdownIcon } from '@jupyterlab/ui-components';
import { CommandRegistry } from '@lumino/commands';
import { PanelLayout, Widget } from '@lumino/widgets';
import { codeIcon, deleteIcon, formatIcon } from './icon';
import { ICellMenuItem } from './tokens';

const CELL_MENU_CLASS = 'jp-enh-cell-menu';

const FOREIGN_COMMANDS: ICellMenuItem[] = [
  // Originate from @jupyterlab/notebook-extension
  {
    className: 'jp-enh-cell-to-code',
    command: 'notebook:change-cell-to-code',
    icon: codeIcon,
    tooltip: 'Convert to Code Cell'
  },
  {
    className: 'jp-enh-cell-to-md',
    command: 'notebook:change-cell-to-markdown',
    icon: markdownIcon,
    tooltip: 'Convert to Markdown Cell'
  },
  // Originate from @ryantam626/jupyterlab_code_formatter
  {
    className: 'jp-enh-cell-format',
    command: 'jupyterlab_code_formatter:format',
    icon: formatIcon,
    tooltip: 'Format Cell'
  },
  // Originate from @jupyterlab/notebook-extension
  {
    command: 'notebook:delete-cell',
    icon: deleteIcon,
    tooltip: 'Delete Selected Cells'
  }
];

/**
 * Toolbar icon menu container
 */
export class CellMenu extends Widget {
  constructor(commands: CommandRegistry) {
    super();
    this.layout = new PanelLayout();
    this.addClass(CELL_MENU_CLASS);
    this._createMenu(commands);
  }

  private _createMenu(commands: CommandRegistry): void {
    const layout = this.layout as PanelLayout;
    FOREIGN_COMMANDS.forEach(entry => {
      if (commands.hasCommand(entry.command)) {
        layout.addWidget(
          new ToolbarButton({
            ...entry,
            onClick: (): void => {
              commands.execute(entry.command);
            }
          })
        );
      }
    });
  }
}
