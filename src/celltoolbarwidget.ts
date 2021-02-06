import { ICellModel } from '@jupyterlab/cells';
import { ObservableList } from '@jupyterlab/observables';
import { CommandRegistry } from '@lumino/commands';
import { PanelLayout, Widget } from '@lumino/widgets';
import { CellMenu } from './cellmenu';
import { TagTool } from './tagbar';
import { ICellMenuItem } from './tokens';

/**
 * Cell Toolbar Widget
 */
export class CellToolbarWidget extends Widget {
  constructor(
    commands: CommandRegistry,
    model: ICellModel,
    tagsList: ObservableList<string>,
    leftMenuItems?: ObservableList<ICellMenuItem>,
    rightMenuItems?: ObservableList<ICellMenuItem>
  ) {
    super();
    this.layout = new PanelLayout();
    this._create(commands, model, tagsList, leftMenuItems, rightMenuItems);
    this.addClass('jp-enh-cell-toolbar');
  }

  private _create(
    commands: CommandRegistry,
    model: ICellModel,
    tagsList: ObservableList<string>,
    leftMenuItems?: ObservableList<ICellMenuItem>,
    rightMenuItems?: ObservableList<ICellMenuItem>
  ): void {
    const layout = this.layout as PanelLayout;
    if (leftMenuItems?.length > 0) {
      layout.addWidget(new CellMenu(commands, leftMenuItems));
    }
    layout.addWidget(new TagTool(model, tagsList));
    if (rightMenuItems?.length > 0) {
      layout.addWidget(new CellMenu(commands, rightMenuItems));
    }
  }
}
