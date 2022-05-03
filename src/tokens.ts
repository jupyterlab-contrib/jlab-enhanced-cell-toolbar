import { LabIcon } from '@jupyterlab/ui-components';

export const EXTENSION_ID = '@jlab-enhanced/cell-toolbar';

export const FACTORY_NAME = 'Cell';

export namespace CellToolbar {
  /**
   * View toggleable items
   */
  export enum ViewItems {
    /**
     * Attachments toolbar item name
     */
    ATTACHMENTS = 'attachments',
    /**
     * Metadata toolbar item name
     */
    METADATA = 'metadata',
    /**
     * Raw format toolbar item name
     */
    RAW_FORMAT = 'raw-format',
    /**
     * Slide type toolbar item name
     */
    SLIDESHOW = 'slide-type',
    /**
     * Tags toolbar item name
     */
    TAGS = 'tags'
  }
  /**
   * Menu action interface
   */
  export interface IButton {
    /**
     * Command to be triggered
     */
    command: string;
    /**
     * Icon for the item
     */
    icon: LabIcon | string;
    /**
     * Icon tooltip
     */
    tooltip?: string;
    /**
     * Type of cell it applies on
     *
     * Undefined if it applies on all cell types
     */
    cellType?: 'code' | 'markdown' | 'raw';
  }

  export interface IConfig {
    /**
     * Default list of tags to always display for quick selection.
     */
    defaultTags: string[];
    /**
     * Place the cell toolbar above the cell. If set, `leftSpace` is ignored.
     */
    floatPosition: { right: number; top: number } | null;
    /**
     * Set the list of visible helper buttons.
     */
    helperButtons:
      | (
          | 'insert-cell-below'
          | 'move-cell-down'
          | 'move-cell-up'
          | 'run-cell-and-select-next'
        )[]
      | null;
    /**
     * Size of the empty space left of the cell toolbar in px. Ignored if `floatPosition` is not null.
     */
    leftSpace: number;
    /**
     * Mapping of the toolbar item name with the cell type they are applied on.
     *
     * null if it applies on all cell types
     */
    cellType: CellTypeMapping;
  }

  /**
   * Mapping of the toolbar item name with the cell type they are applied on.
   *
   * null if it applies on all cell types
   */
  export type CellTypeMapping = {
    [itemName: string]: 'code' | 'markdown' | 'raw' | null;
  };
}
