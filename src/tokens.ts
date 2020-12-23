import { LabIcon } from '@jupyterlab/ui-components';

export const EXTENSION_ID = '@jlab-enhanced/cell-toolbar';

/**
 * Menu action interface
 */
export interface ICellMenuItem {
  /**
   * Command to be triggered
   */
  command: string;
  /**
   * Icon for the item
   */
  icon: LabIcon;
  /**
   * Icon tooltip
   */
  tooltip?: string;
  /**
   * Item class name
   */
  className?: string;
}
