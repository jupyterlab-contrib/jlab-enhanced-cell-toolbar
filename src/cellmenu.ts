import { PanelLayout, Widget } from '@lumino/widgets';
import { CommandRegistry } from '@lumino/commands';
import {
  addIcon,
  caretDownIcon,
  caretUpIcon,
  checkIcon,
  closeIcon,
  LabIcon,
  markdownIcon,
  refreshIcon,
  runIcon,
  stopIcon
} from '@jupyterlab/ui-components';
import { ToolbarButton } from '@jupyterlab/apputils';

const CELL_MENU_CLASS = 'jp-enh-cell-menu';

interface ICellMenuItem {
  command: string;
  icon: LabIcon;
  tooltip?: string;
  className?: string;
}

const FOREIGN_COMMANDS: ICellMenuItem[] = [
  // Originate from @jupyterlab/notebook-extension
  { command: 'notebook:run-cell', icon: runIcon },
  { command: 'notebook:interrupt-kernel', icon: stopIcon },
  { command: 'notebook:change-cell-to-code', icon: checkIcon },
  { command: 'notebook:change-cell-to-markdown', icon: markdownIcon },
  { command: 'notebook:move-cell-up', icon: caretUpIcon },
  { command: 'notebook:move-cell-down', icon: caretDownIcon },
  { command: 'notebook:delete-cell', icon: closeIcon },
  { command: 'notebook:insert-cell-below', icon: addIcon },
  // Originate from @ryantam626/jupyterlab_code_formatter
  { command: 'jupyterlab_code_formatter:format', icon: refreshIcon }
];

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
