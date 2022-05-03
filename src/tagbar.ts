import { AddWidget, TagWidget } from '@jupyterlab/celltags';
import { toArray } from '@lumino/algorithm';
import { PanelLayout, Widget } from '@lumino/widgets';
import { TagsModel } from './tagsmodel';

const CELL_TAGS_CLASS = 'jp-enh-cell-tags';
const CELL_CLICKABLE_TAG_CLASS = 'jp-enh-cell-mod-click';

/**
 * A container for cell tags.
 */
export class TagTool extends Widget {
  /**
   * Construct a new tag Tool.
   */
  constructor(model: TagsModel) {
    super();
    this._model = model;
    this.layout = new PanelLayout();
    this.addClass(CELL_TAGS_CLASS);
    this._createTagInput();

    this.onTagsModelChanged();
    this._model.stateChanged.connect(this.onTagsModelChanged, this);
  }

  get model(): TagsModel {
    return this._model;
  }

  dispose(): void {
    if (this.isDisposed) {
      return;
    }

    this._model.stateChanged.disconnect(this.onTagsModelChanged, this);
    super.dispose();
  }

  // addTag, checkApplied and removeTag are needed because the core widget
  // call those methods on their parent widget :-/

  /**
   * Check whether a tag is applied to the current active cell
   *
   * @param name - The name of the tag.
   *
   * @returns A boolean representing whether it is applied.
   */
  checkApplied(name: string): boolean {
    return this._model.checkApplied(name);
  }

  /**
   * Add a tag to the current active cell.
   *
   * @param name - The name of the tag.
   */
  addTag(name: string): void {
    if (!this._model.unlockedTags) {
      // Style toggling is applied on the widget directly => force rerendering
      this._refreshOneTag(name);
    }
    this._model.addTag(name);
  }

  /**
   * Remove a tag from the current active cell.
   *
   * @param name - The name of the tag.
   */
  removeTag(name: string): void {
    if (!this._model.unlockedTags) {
      // Style toggling is applied on the widget directly => force rerendering
      this._refreshOneTag(name);
      return;
    }
    this._model.removeTag(name);
  }

  /**
   * Update the tag widgets for the current cell.
   */
  refreshTags(): void {
    const layout = this.layout as PanelLayout;
    const tags: string[] = [...new Set(toArray(this._model.tags))];
    const allTags = [...tags].sort((a: string, b: string) => (a > b ? 1 : -1));

    // Dispose removed tags
    const toDispose = new Array<Widget>();
    layout.widgets.forEach(widget => {
      if (widget.id !== 'add-tag') {
        const idx = tags.indexOf((widget as TagWidget).name);
        if (idx < 0) {
          toDispose.push(widget);
        } else {
          tags.splice(idx, 1);
        }
      }
    });
    toDispose.forEach(widget => widget.dispose());

    // Insert new tags
    tags.forEach(tag => {
      layout.insertWidget(
        (this.layout as PanelLayout).widgets.length - 1,
        new TagWidget(tag)
      );
    });

    // Sort the widgets in tag alphabetical order
    [...layout.widgets].forEach((widget: Widget, index: number) => {
      let tagIndex = allTags.findIndex(
        tag => (widget as TagWidget).name === tag
      );
      // Handle AddTag widget case
      if (tagIndex === -1) {
        tagIndex = allTags.length;
      }
      if (tagIndex !== index) {
        layout.insertWidget(tagIndex, widget);
      }
    });

    // Update all tags widgets
    layout.widgets.forEach(widget => {
      widget.update();
      if (this._model.unlockedTags) {
        widget.show();
        widget.addClass(CELL_CLICKABLE_TAG_CLASS);
      } else {
        if (
          widget.id === 'add-tag' ||
          !this._model.checkApplied((widget as TagWidget).name)
        ) {
          widget.hide();
        } else {
          widget.show();
          widget.removeClass(CELL_CLICKABLE_TAG_CLASS);
        }
      }
    });
  }

  /**
   * Add an AddWidget input box to the layout.
   */
  protected _createTagInput(): void {
    const layout = this.layout as PanelLayout;
    const input = new AddWidget();
    input.id = 'add-tag';
    layout.addWidget(input);
  }

  /**
   * Force refreshing one tag widget
   *
   * @param name Tag
   */
  protected _refreshOneTag(name: string): void {
    [...(this.layout as PanelLayout).widgets]
      .find(
        widget => widget.id !== 'add-tag' && (widget as TagWidget).name === name
      )
      ?.update();
  }

  /**
   * Listener on shared tag list changes
   */
  protected onTagsModelChanged(): void {
    this.refreshTags();
  }

  private _model: TagsModel;
}
