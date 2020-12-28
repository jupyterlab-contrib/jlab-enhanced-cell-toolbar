import { Cell, ICellModel } from '@jupyterlab/cells';
import { DocumentRegistry } from '@jupyterlab/docregistry';
import { NotebookPanel } from '@jupyterlab/notebook';
import {
  IObservableList,
  IObservableUndoableList,
  ObservableList
} from '@jupyterlab/observables';
import { ISettingRegistry } from '@jupyterlab/settingregistry';
import {
  addIcon,
  caretDownEmptyThinIcon,
  caretUpEmptyThinIcon,
  runIcon
} from '@jupyterlab/ui-components';
import { CommandRegistry } from '@lumino/commands';
import { IDisposable } from '@lumino/disposable';
import { PanelLayout, Widget } from '@lumino/widgets';
import { CellToolbarWidget } from './celltoolbarwidget';
import { PositionedButton } from './positionedbutton';
import { ICellMenuItem } from './tokens';

const FOREIGN_COMMANDS: ICellMenuItem[] = [
  // Originate from @jupyterlab/notebook-extension
  {
    className: 'jp-enh-cell-run',
    command: 'notebook:run-cell',
    icon: runIcon,
    tooltip: 'Run Selected Cells'
  },
  // { className: 'jp-enh-cell-interrupt', command: 'notebook:interrupt-kernel', icon: stopIcon },
  {
    className: 'jp-enh-cell-up',
    command: 'notebook:move-cell-up',
    icon: caretUpEmptyThinIcon,
    tooltip: 'Move Selected Cells Up'
  },
  {
    className: 'jp-enh-cell-down',
    command: 'notebook:move-cell-down',
    icon: caretDownEmptyThinIcon,
    tooltip: 'Move Selected Cells Down'
  },
  {
    className: 'jp-enh-cell-insert',
    command: 'notebook:insert-cell-below',
    icon: addIcon,
    tooltip: 'Insert Cell'
  }
];

/**
 * Widget cell toolbar class
 */
const CELL_BAR_CLASS = 'jp-enh-cell-bar';

/**
 * Watch a notebook, and each time a cell is created add a CellTagsWidget to it.
 */
export class CellToolbarTracker implements IDisposable {
  constructor(
    panel: NotebookPanel,
    commands: CommandRegistry,
    settings: ISettingRegistry.ISettings | null
  ) {
    this._commands = commands;
    this._panel = panel;
    this._settings = settings;

    if (this._settings) {
      this._onSettingsChanged();
      this._settings.changed.connect(this._onSettingsChanged, this);
    }

    const cells = this._panel.context.model.cells;
    cells.changed.connect(this.updateConnectedCells, this);
  }

  get isDisposed(): boolean {
    return this._isDisposed;
  }

  dispose(): void {
    if (this.isDisposed) {
      return;
    }
    this._isDisposed = true;

    if (this._settings) {
      this._settings.changed.disconnect(this._onSettingsChanged, this);
    }

    const cells = this._panel.context.model.cells;
    cells.changed.disconnect(this.updateConnectedCells, this);
    this._panel = null;
  }

  /**
   * Callback to react to cells list changes
   *
   * @param cells List of notebook cells
   * @param changed Modification of the list
   */
  updateConnectedCells(
    cells: IObservableUndoableList<ICellModel>,
    changed: IObservableList.IChangedArgs<ICellModel>
  ): void {
    changed.oldValues.forEach(model => this._removeToolbar(model));
    changed.newValues.forEach(model => this._addToolbar(model));
  }

  private _addToolbar(model: ICellModel): void {
    const cell = this._getCell(model);
    if (cell) {
      const toolbar = new CellToolbarWidget(
        this._commands,
        model,
        this._allTags
      );
      toolbar.addClass(CELL_BAR_CLASS);
      (cell.layout as PanelLayout).insertWidget(0, toolbar);

      FOREIGN_COMMANDS.forEach(entry => {
        if (this._commands.hasCommand(entry.command)) {
          const { className, command, ...others } = entry;
          const button = new PositionedButton({
            ...others,
            callback: (): void => {
              this._commands.execute(command);
            }
          });
          button.addClass(CELL_BAR_CLASS);
          if (className) {
            button.addClass(className);
          }
          (cell.layout as PanelLayout).addWidget(button);
        }
      });
    }
  }

  private _getCell(model: ICellModel): Cell {
    return this._panel.content.widgets.find(widget => widget.model === model);
  }

  private _findToolbarWidgets(cell: Cell): Widget[] {
    const widgets = (cell.layout as PanelLayout).widgets;

    // Search for header using the CSS class or use the first one if not found.
    return widgets.filter(widget => widget.hasClass(CELL_BAR_CLASS)) || [];
  }

  private _removeToolbar(model: ICellModel): void {
    const cell = this._getCell(model);
    if (cell) {
      this._findToolbarWidgets(cell).forEach(widget => widget.dispose());
    }
  }

  /**
   * Call back on settings changes
   */
  private _onSettingsChanged(): void {
    const newDefaultTags =
      (this._settings.composite['defaultTags'] as string[]) || [];
    // Update default tag in shared tag list
    const toAdd = newDefaultTags.filter(
      tag => !this._previousDefaultTags.includes(tag)
    );
    if (toAdd.length > 0) {
      this._allTags.pushAll(toAdd);
    }
    this._previousDefaultTags
      .filter(tag => !newDefaultTags.includes(tag))
      .forEach(tag => this._allTags.removeValue(tag));
    this._previousDefaultTags = newDefaultTags;
  }

  private _allTags: ObservableList<string> = new ObservableList<string>();
  private _commands: CommandRegistry;
  private _isDisposed = false;
  private _previousDefaultTags = new Array<string>();
  private _panel: NotebookPanel;
  private _settings: ISettingRegistry.ISettings | null;
}

/**
 * Widget extension that creates a CellToolbarTracker each time a notebook is
 * created.
 */
export class CellBarExtension implements DocumentRegistry.WidgetExtension {
  constructor(
    commands: CommandRegistry,
    settings: ISettingRegistry.ISettings | null
  ) {
    this._commands = commands;
    this._settings = settings;
  }

  createNew(panel: NotebookPanel): IDisposable {
    return new CellToolbarTracker(panel, this._commands, this._settings);
  }

  private _commands: CommandRegistry;
  private _settings: ISettingRegistry.ISettings | null;
}
