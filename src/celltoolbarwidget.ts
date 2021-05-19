import { CommandRegistry } from '@lumino/commands';
import { PanelLayout, Widget } from '@lumino/widgets';
import { CellMenu } from './cellmenu';
import { TagTool } from './tagbar';
import { TagsModel } from './tagsmodel';
import { ICellMenuItem } from './tokens';

export const LEFT_SPACER_CLASSNAME = 'jp-enh-cell-left-space';

/**
 * Cell Toolbar Widget
 */
export class CellToolbarWidget extends Widget {
  constructor(
    commands: CommandRegistry,
    model: TagsModel,
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
    (this.layout as PanelLayout).addWidget(new TagTool(model));
    (this.layout as PanelLayout).addWidget(
      new CellMenu(commands, rightMenuItems)
    );
  }
}
