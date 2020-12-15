import { PanelLayout, Widget } from '@lumino/widgets';

/**
 * Cell Toolbar Widget
 */
export class CellToolbarWidget extends Widget {
  constructor() {
    super();
    this.layout = new PanelLayout();
  }
}
