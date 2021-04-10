import { ICellModel } from '@jupyterlab/cells';
import { ObservableList } from '@jupyterlab/observables';
import { CommandRegistry } from '@lumino/commands';
import { PanelLayout, Widget } from '@lumino/widgets';
import { CellMenu } from './cellmenu';
import { TagTool } from './tagbar';
import { ICellMenuItem } from './tokens';

export const LEFT_SPACER_CLASSNAME = 'jp-enh-cell-left-space';

/**
 * Cell Toolbar Widget
 */
export class CellToolbarWidget extends Widget {
  constructor(
    commands: CommandRegistry,
    model: ICellModel,
    tagsList: ObservableList<string>,
    leftMenuItems: ICellMenuItem[],
    rightMenuItems: ICellMenuItem[],
    leftSpace = 0
  ) {
    super();
    this.layout = new PanelLayout();
    this.addClass('jp-enh-cell-toolbar');

    const leftSpacer = new Widget();
    leftSpacer.addClass(LEFT_SPACER_CLASSNAME);
    leftSpacer.node.style.width = `${leftSpace}px`;
    (this.layout as PanelLayout).addWidget(leftSpacer);
    (this.layout as PanelLayout).addWidget(
      new CellMenu(commands, leftMenuItems)
    );
    (this.layout as PanelLayout).addWidget(new TagTool(model, tagsList));
    (this.layout as PanelLayout).addWidget(
      new CellMenu(commands, rightMenuItems)
    );
  }
}
