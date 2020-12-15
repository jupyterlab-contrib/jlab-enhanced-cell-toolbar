import { Cell, ICellModel } from '@jupyterlab/cells';
import { DocumentRegistry } from '@jupyterlab/docregistry';
import { NotebookPanel } from '@jupyterlab/notebook';
import {
  IObservableList,
  IObservableUndoableList,
  ObservableList
} from '@jupyterlab/observables';
import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { CommandRegistry } from '@lumino/commands';
import { IDisposable } from '@lumino/disposable';
import { PanelLayout, Widget } from '@lumino/widgets';
import { CellMenu } from './cellmenu';
import { CellToolbarWidget } from './celltoolbarwidget';
import { TagTool } from './tagbar';

/**
 * Widget cell toolbar class
 */
const CELL_TOOLBAR_CLASS = 'jp-enh-cell-toolbar';

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
      const toolbar = new CellToolbarWidget();
      toolbar.addClass(CELL_TOOLBAR_CLASS);
      const toolbarLayout = toolbar.layout as PanelLayout;
      toolbarLayout.addWidget(new CellMenu(this._commands));
      toolbarLayout.addWidget(new TagTool(model, this._allTags));
      (cell.layout as PanelLayout).insertWidget(0, toolbar);
    }
  }

  private _getCell(model: ICellModel): Cell {
    return this._panel.content.widgets.find(widget => widget.model === model);
  }

  private _findCellHeader(cell: Cell): Widget {
    const widgets = (cell.layout as PanelLayout).widgets;

    // Search for header using the CSS class or use the first one if not found.
    return (
      widgets.find(widget => widget.hasClass(CELL_TOOLBAR_CLASS)) || widgets[0]
    );
  }

  private _removeToolbar(model: ICellModel): void {
    const cell = this._getCell(model);
    if (cell) {
      const toolbar = this._findCellHeader(cell);
      if (toolbar) {
        toolbar.dispose();
      }
    }
  }

  /**
   * Call back on settings changes
   */
  private _onSettingsChanged(): void {
    const newDefaultTags =
      (this._settings.composite['defaultTags'] as string[]) || [];
    // Update default tag in shared tag list
    this._allTags.pushAll(
      newDefaultTags.filter(tag => !this._previousDefaultTags.includes(tag))
    );
    this._previousDefaultTags
      .filter(tag => !newDefaultTags.includes(tag))
      .forEach(tag => this._allTags.removeValue(tag));
    this._previousDefaultTags = newDefaultTags;
  }

  private _allTags: ObservableList<string> = new ObservableList();
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
