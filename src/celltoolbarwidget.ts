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
    leftMenuItems: ObservableList<ICellMenuItem>,
    rightMenuItems: ObservableList<ICellMenuItem>
  ) {
    super();
    this.layout = new PanelLayout();
    this.addClass('jp-enh-cell-toolbar');

    (this.layout as PanelLayout).addWidget(
      new CellMenu(commands, leftMenuItems)
    );
    (this.layout as PanelLayout).addWidget(new TagTool(model, tagsList));
    (this.layout as PanelLayout).addWidget(
      new CellMenu(commands, rightMenuItems)
    );
  }
}
