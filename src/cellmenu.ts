import { ToolbarButton } from '@jupyterlab/apputils';
import { IObservableList } from '@jupyterlab/observables';
import { LabIcon } from '@jupyterlab/ui-components';
import { each } from '@lumino/algorithm';
import { CommandRegistry } from '@lumino/commands';
import { PanelLayout, Widget } from '@lumino/widgets';
import { ICellMenuItem } from './tokens';

const CELL_MENU_CLASS = 'jp-enh-cell-menu';

/**
 * Toolbar icon menu container
 */
export class CellMenu extends Widget {
  constructor(
    commands: CommandRegistry,
    items: IObservableList<ICellMenuItem>
  ) {
    super();
    this._commands = commands;
    this._items = items;
    this.layout = new PanelLayout();
    this.addClass(CELL_MENU_CLASS);
    this._itemsChanged(items);
    this._items.changed.connect(this._itemsChanged, this);
  }

  dispose(): void {
    if (this.isDisposed) {
      return;
    }
    this._items.changed.disconnect(this._itemsChanged, this);

    super.dispose();
  }

  protected _itemsChanged(
    items: IObservableList<ICellMenuItem>,
    changes?: IObservableList.IChangedArgs<ICellMenuItem>
  ): void {
    each(this.children(), widget => {
      widget.dispose();
    });

    const layout = this.layout as PanelLayout;
    each(items.iter(), entry => {
      if (this._commands.hasCommand(entry.command)) {
        layout.addWidget(
          new ToolbarButton({
            icon: LabIcon.resolve({ icon: entry.icon }),
            className: `jp-enh-cell-${entry.cellType || 'all'}`,
            onClick: (): void => {
              this._commands.execute(entry.command);
            },
            tooltip: entry.tooltip || this._commands.label(entry.command)
          })
        );
      }
    });
  }

  private _commands: CommandRegistry;
  private _items: IObservableList<ICellMenuItem>;
}
