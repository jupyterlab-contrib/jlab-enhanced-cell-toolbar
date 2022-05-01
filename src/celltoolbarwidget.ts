import { find, IIterator, map } from '@lumino/algorithm';
import { Message } from '@lumino/messaging';
import { AttachedProperty } from '@lumino/properties';
import { PanelLayout, Widget } from '@lumino/widgets';
import { getCSSVar } from './utils';

/**
 * Cell Toolbar Widget
 */
export class CellToolbar extends Widget {
  constructor(
    leftSpace = 0,
    position: { right: number; top: number } | null = null
  ) {
    super();
    this.layout = new PanelLayout();
    this.addClass('jp-enh-cell-toolbar');

    // Set style
    this.node.style.position = 'absolute';
    if (position) {
      this.node.style.right = `${position.right}px`;
      this.node.style.top = `${position.top}px`;
      this.node.style.justifyContent = 'flex-end';
      this.node.style.width = 'max-content';
      // Set a background if the toolbar overlaps the border
      if (position.top < 22) {
        this.addClass('jp-overlap');
      }
    } else {
      this.node.style.left = `${leftSpace}px`;
      this.node.style.top = '0px';
      this.node.style.width = `calc( 100% - ${leftSpace}px - ${getCSSVar(
        '--jp-cell-collapser-width'
      )} - ${getCSSVar('--jp-cell-prompt-width')} - 2 * ${getCSSVar(
        '--jp-cell-padding'
      )} )`;
    }
  }

  /**
   * Get an iterator over the ordered toolbar item names.
   *
   * @returns An iterator over the toolbar item names.
   */
  names(): IIterator<string> {
    const layout = this.layout as PanelLayout;
    return map(layout.widgets, widget => {
      return Private.nameProperty.get(widget);
    });
  }

  /**
   * Add an item to the end of the toolbar.
   *
   * @param name - The name of the widget to add to the toolbar.
   *
   * @param widget - The widget to add to the toolbar.
   *
   * @param index - The optional name of the item to insert after.
   *
   * @returns Whether the item was added to toolbar.  Returns false if
   *   an item of the same name is already in the toolbar.
   *
   * #### Notes
   * The item can be removed from the toolbar by setting its parent to `null`.
   */
  addItem(name: string, widget: Widget): boolean {
    const layout = this.layout as PanelLayout;
    return this.insertItem(layout.widgets.length, name, widget);
  }

  /**
   * Insert an item into the toolbar at the specified index.
   *
   * @param index - The index at which to insert the item.
   *
   * @param name - The name of the item.
   *
   * @param widget - The widget to add.
   *
   * @returns Whether the item was added to the toolbar. Returns false if
   *   an item of the same name is already in the toolbar.
   *
   * #### Notes
   * The index will be clamped to the bounds of the items.
   * The item can be removed from the toolbar by setting its parent to `null`.
   */
  insertItem(index: number, name: string, widget: Widget): boolean {
    const existing = find(this.names(), value => value === name);
    if (existing) {
      return false;
    }
    const layout = this.layout as PanelLayout;

    const j = Math.max(0, Math.min(index, layout.widgets.length));
    layout.insertWidget(j, widget);

    Private.nameProperty.set(widget, name);
    return true;
  }

  /**
   * Insert an item into the toolbar at the after a target item.
   *
   * @param at - The target item to insert after.
   *
   * @param name - The name of the item.
   *
   * @param widget - The widget to add.
   *
   * @returns Whether the item was added to the toolbar. Returns false if
   *   an item of the same name is already in the toolbar.
   *
   * #### Notes
   * The index will be clamped to the bounds of the items.
   * The item can be removed from the toolbar by setting its parent to `null`.
   */
  insertAfter(at: string, name: string, widget: Widget): boolean {
    return this._insertRelative(at, 1, name, widget);
  }

  /**
   * Insert an item into the toolbar at the before a target item.
   *
   * @param at - The target item to insert before.
   *
   * @param name - The name of the item.
   *
   * @param widget - The widget to add.
   *
   * @returns Whether the item was added to the toolbar. Returns false if
   *   an item of the same name is already in the toolbar.
   *
   * #### Notes
   * The index will be clamped to the bounds of the items.
   * The item can be removed from the toolbar by setting its parent to `null`.
   */
  insertBefore(at: string, name: string, widget: Widget): boolean {
    return this._insertRelative(at, 0, name, widget);
  }

  private _insertRelative(
    at: string,
    offset: number,
    name: string,
    widget: Widget
  ): boolean {
    const nameWithIndex = map(this.names(), (name, i) => {
      return { name: name, index: i };
    });
    const target = find(nameWithIndex, x => x.name === at);
    if (target) {
      return this.insertItem(target.index + offset, name, widget);
    }
    return false;
  }

  /**
   * Handle the DOM events for the widget.
   *
   * @param event - The DOM event sent to the widget.
   *
   * #### Notes
   * This method implements the DOM `EventListener` interface and is
   * called in response to events on the dock panel's node. It should
   * not be called directly by user code.
   */
  handleEvent(event: Event): void {
    switch (event.type) {
      case 'click':
        this.handleClick(event);
        break;
      default:
        break;
    }
  }

  /**
   * Handle a DOM click event.
   */
  protected handleClick(event: Event): void {
    // Stop propagating the click outside the toolbar
    event.stopPropagation();

    // Clicking a label focuses the corresponding control
    // that is linked with `for` attribute, so let it be.
    if (event.target instanceof HTMLLabelElement) {
      const forId = event.target.getAttribute('for');
      if (forId && this.node.querySelector(`#${forId}`)) {
        return;
      }
    }

    // If this click already focused a control, let it be.
    if (this.node.contains(document.activeElement)) {
      return;
    }

    // Otherwise, activate the parent widget, which may take focus if desired.
    if (this.parent) {
      this.parent.activate();
    }
  }

  /**
   * Handle `after-attach` messages for the widget.
   */
  protected onAfterAttach(msg: Message): void {
    this.node.addEventListener('click', this);
  }

  /**
   * Handle `before-detach` messages for the widget.
   */
  protected onBeforeDetach(msg: Message): void {
    this.node.removeEventListener('click', this);
  }
}

namespace Private {
  /**
   * An attached property for the name of a toolbar item.
   */
  export const nameProperty = new AttachedProperty<Widget, string>({
    name: 'name',
    create: () => ''
  });
}
