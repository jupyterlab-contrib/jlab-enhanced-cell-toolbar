import { ToolbarRegistry } from '@jupyterlab/apputils';
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
import { each, findIndex, toArray } from '@lumino/algorithm';
import { CommandRegistry } from '@lumino/commands';
import { JSONExt } from '@lumino/coreutils';
import { IDisposable } from '@lumino/disposable';
import { ISignal, Signal } from '@lumino/signaling';
import { PanelLayout, Widget } from '@lumino/widgets';
import { CellToolbar } from './celltoolbarwidget';
import { PositionedButton } from './positionedbutton';
import { TagsModel } from './tagsmodel';
import { CellTypeMapping, ICellMenuItem, ICellToolbarConfig } from './tokens';

const DEFAULT_HELPER_BUTTONS: ICellMenuItem[] = [
  // Originate from @jupyterlab/notebook-extension
  {
    command: 'notebook:run-cell-and-select-next',
    icon: runIcon
  },
  {
    command: 'notebook:move-cell-up',
    icon: caretUpEmptyThinIcon
  },
  {
    command: 'notebook:move-cell-down',
    icon: caretDownEmptyThinIcon
  },
  {
    command: 'notebook:insert-cell-below',
    icon: addIcon
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
    protected panel: NotebookPanel,
    protected commands: CommandRegistry,
    protected cellToolbarFactory: (
      c: Cell
    ) =>
      | IObservableList<ToolbarRegistry.IToolbarItem>
      | ToolbarRegistry.IToolbarItem[],
    configuration: ICellToolbarConfig = {
      defaultTags: [],
      floatPosition: null,
      helperButtons: [
        'insert-cell-below',
        'move-cell-down',
        'move-cell-up',
        'run-cell-and-select-next'
      ],
      leftSpace: 0,
      cellType: {}
    }
  ) {
    this._disposed = new Signal<CellToolbarTracker, void>(this);
    this._config = JSONExt.deepCopy(configuration as any);
    // // Add lock tag button
    // this._unlockTagsButton = new ToggleButton({
    //   className: (): string => 'jp-enh-cell-nb-button',
    //   enabled: (): boolean =>
    //     (!this.panel?.context.model.readOnly &&
    //       this.panel?.context.contentsModel?.writable) ??
    //     false,
    //   icon: (state: boolean): LabIcon =>
    //     state ? lockedTagsIcon : unlockedTagsIcon,
    //   tooltip: (state: boolean): string =>
    //     state ? 'Lock tags' : 'Unlock tags',
    //   onClick: (state: boolean): void => {
    //     for (const id in this._tagsModels) {
    //       this._tagsModels[id].unlockedTags = state;
    //     }
    //   }
    // });

    // let insertionPoint = -1;
    // find(panel.toolbar.children(), (tbb, index) => {
    //   insertionPoint = index; // It will be the last index or the cell type input
    //   return tbb.hasClass('jp-Notebook-toolbarCellType');
    // });
    // panel.toolbar.insertItem(
    //   insertionPoint + 1,
    //   'edit-tags',
    //   this._unlockTagsButton
    // );

    const cells = this.panel.context.model.cells;
    cells.changed.connect(this.updateConnectedCells, this);

    // panel.context.fileChanged.connect(this._onFileChanged, this);
  }

  /**
   * Cell toolbar configuration
   */
  get configuration(): ICellToolbarConfig {
    return JSONExt.deepCopy(this._config as any);
  }
  set configuration(v: ICellToolbarConfig) {
    if (!JSONExt.deepEqual(v as any, this._config as any)) {
      this._config = { ...this._config, ...JSONExt.deepCopy(v as any) };
      this._onConfigChanged();
    }
  }

  /**
   * A signal emitted when the poll is disposed.
   */
  get disposed(): ISignal<CellToolbarTracker, void> {
    return this._disposed;
  }

  /**
   * Test whether the context is disposed.
   */
  get isDisposed(): boolean {
    return this._isDisposed;
  }

  /**
   * Dispose of the resources held by the object.
   */
  dispose(): void {
    if (this.isDisposed) {
      return;
    }
    this._isDisposed = true;

    const cells = this.panel?.context.model.cells;
    if (cells) {
      cells.changed.disconnect(this.updateConnectedCells, this);
      each(cells.iter(), model => this._removeToolbar(model));
    }

    // this.panel?.context.fileChanged.disconnect(this._onFileChanged);
    this._disposed.emit();
    Signal.clearData(this);
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
      const { helperButtons, leftSpace, floatPosition } = this._config;

      // const tagsModel = (this._tagsModels[model.id] = new TagsModel(
      //   model,
      //   this._allTags

      //   // this._unlockTagsButton.toggled
      // ));

      const toolbar = new CellToolbar(leftSpace ?? 0, floatPosition);
      this._setToolbar(cell, toolbar);
      toolbar.addClass(CELL_BAR_CLASS);
      (cell.layout as PanelLayout).insertWidget(0, toolbar);

      DEFAULT_HELPER_BUTTONS.filter(entry =>
        (helperButtons as string[]).includes(entry.command.split(':')[1])
      ).forEach(entry => {
        if (this.commands.hasCommand(entry.command)) {
          const { cellType, command, tooltip, ...others } = entry;
          const shortName = command.split(':')[1];
          const button = new PositionedButton({
            ...others,
            callback: (): void => {
              this.commands.execute(command);
            },
            className: shortName && `jp-enh-cell-${shortName}`,
            tooltip: tooltip || this.commands.label(entry.command)
          });
          button.addClass(CELL_BAR_CLASS);
          button.addClass(`jp-enh-cell-${cellType || 'all'}`);
          (cell.layout as PanelLayout).addWidget(button);
        }
      });
    }
  }

  private _getCell(model: ICellModel): Cell | undefined {
    return this.panel?.content.widgets.find(widget => widget.model === model);
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
      if (this._tagsModels[model.id]) {
        this._tagsModels[model.id].dispose();
        delete this._tagsModels[model.id];
      }
    }
  }

  /**
   * Set the toolbar items of a cell
   */
  private _setToolbar(cell: Cell, toolbar: CellToolbar): void {
    const cellType = cell.model.type;
    const items = this.cellToolbarFactory(cell);

    if (Array.isArray(items)) {
      items.forEach(({ name, widget }) => {
        const itemType = this.configuration.cellType[name];
        if (itemType && itemType !== cellType) {
          widget.hide();
        }
        toolbar.addItem(name, widget);
      });
    } else {
      const updateToolbar = (
        list: IObservableList<ToolbarRegistry.IToolbarItem>,
        changes: IObservableList.IChangedArgs<ToolbarRegistry.IToolbarItem>
      ): void => {
        switch (changes.type) {
          case 'add':
            changes.newValues.forEach((item, index) => {
              const itemType = this.configuration.cellType[item.name];
              if (itemType && itemType !== cellType) {
                item.widget.hide();
              }
              toolbar.insertItem(
                changes.newIndex + index,
                item.name,
                item.widget
              );
            });
            break;
          case 'move':
            changes.oldValues.forEach(item => {
              item.widget.parent = null;
            });
            changes.newValues.forEach((item, index) => {
              toolbar.insertItem(
                changes.newIndex + index,
                item.name,
                item.widget
              );
            });
            break;
          case 'remove':
            changes.oldValues.forEach(item => {
              item.widget.parent = null;
            });
            break;
          case 'set':
            changes.oldValues.forEach(item => {
              item.widget.parent = null;
            });

            changes.newValues.forEach((item, index) => {
              const existingIndex = findIndex(
                toolbar.names(),
                name => item.name === name
              );
              if (existingIndex >= 0) {
                toArray(toolbar.children())[existingIndex].parent = null;
              }

              const itemType = this.configuration.cellType[item.name];
              if (itemType && itemType !== cellType) {
                item.widget.hide();
              }

              toolbar.insertItem(
                changes.newIndex + index,
                item.name,
                item.widget
              );
            });
            break;
        }
      };

      updateToolbar(items, {
        newIndex: 0,
        newValues: toArray(items),
        oldIndex: 0,
        oldValues: [],
        type: 'add'
      });

      items.changed.connect(updateToolbar);
      cell.disposed.connect(() => {
        items.changed.disconnect(updateToolbar);
      });
    }
  }

  /**
   * Callback on file changed
   */
  // private _onFileChanged(): void {
  //   this._unlockTagsButton.update();
  // }

  /**
   * Call back on configuration changes
   */
  private _onConfigChanged(): void {
    // Reset toolbar when settings changes
    if (this.panel?.context.model.cells) {
      each(this.panel?.context.model.cells.iter(), model => {
        this._removeToolbar(model);
        this._addToolbar(model);
      });
    }

    // Update tags
    const newDefaultTags = this._config.defaultTags ?? [];
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

  private _allTags = new ObservableList<string>();
  private _disposed: Signal<CellToolbarTracker, void>;
  private _isDisposed = false;
  private _previousDefaultTags = new Array<string>();
  private _tagsModels: { [id: string]: TagsModel } = {};
  // private _unlockTagsButton: ToggleButton;
  private _config: ICellToolbarConfig;
}

/**
 * Widget extension that creates a CellToolbarTracker each time a notebook is
 * created.
 */
export class CellBarExtension implements DocumentRegistry.WidgetExtension {
  constructor(
    protected commands: CommandRegistry,
    protected cellToolbarFactory: (
      c: Cell
    ) =>
      | IObservableList<ToolbarRegistry.IToolbarItem>
      | ToolbarRegistry.IToolbarItem[],
    protected settings: ISettingRegistry.ISettings | null
  ) {}

  createNew(panel: NotebookPanel): IDisposable {
    const toolbarTracker = new CellToolbarTracker(
      panel,
      this.commands,
      this.cellToolbarFactory
    );

    if (this.settings) {
      const onSettingsChanged = (
        settings: ISettingRegistry.ISettings
      ): void => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { toolbar, ...config } = settings.composite as {
          toolbar: (ISettingRegistry.IToolbarItem & {
            cellType?: 'code' | 'markdown' | 'raw';
          })[];
          config: any;
        };

        const cellType: CellTypeMapping = {};
        toolbar.forEach(item => {
          cellType[item.name] = item.cellType;
        });

        toolbarTracker.configuration = {
          ...config,
          cellType
        } as any;
      };
      onSettingsChanged(this.settings);
      toolbarTracker.disposed.connect(() => {
        this.settings?.changed.disconnect(onSettingsChanged);
      });
      this.settings?.changed.connect(onSettingsChanged);
    }

    return toolbarTracker;
  }
}
