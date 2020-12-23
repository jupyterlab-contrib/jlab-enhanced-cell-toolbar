import { ICellModel } from '@jupyterlab/cells';
import { ObservableList } from '@jupyterlab/observables';
import { CommandRegistry } from '@lumino/commands';
import { PanelLayout, Widget } from '@lumino/widgets';
import { CellMenu } from './cellmenu';
import { TagTool } from './tagbar';

/**
 * Cell Toolbar Widget
 */
export class CellToolbarWidget extends Widget {
  constructor(
    commands: CommandRegistry,
    model: ICellModel,
    tagsList: ObservableList<string>
  ) {
    super();
    this.layout = new PanelLayout();
    this._create(commands, model, tagsList);
    this.addClass('jp-enh-cell-toolbar');
  }

  private _create(
    commands: CommandRegistry,
    model: ICellModel,
    tagsList: ObservableList<string>
  ): void {
    const layout = this.layout as PanelLayout;
    layout.addWidget(new CellMenu(commands));
    layout.addWidget(new TagTool(model, tagsList));
  }
}
