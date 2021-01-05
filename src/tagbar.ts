import { ICellModel } from '@jupyterlab/cells';
import { AddWidget, TagWidget } from '@jupyterlab/celltags';
import {
  IObservableJSON,
  IObservableList,
  IObservableMap,
  ObservableList
} from '@jupyterlab/observables';
import { toArray } from '@lumino/algorithm';
import { ReadonlyPartialJSONValue } from '@lumino/coreutils';
import { PanelLayout, Widget } from '@lumino/widgets';

const CELL_TAGS_CLASS = 'jp-enh-cell-tags';

/**
 * A container for cell tags.
 */
export class TagTool extends Widget {
  /**
   * Construct a new tag Tool.
   */
  constructor(model: ICellModel, allTags: ObservableList<string>) {
    super();
    this._model = model;
    this._tagList = allTags;
    this.layout = new PanelLayout();
    this.addClass(CELL_TAGS_CLASS);
    this._createTagInput();

    allTags.changed.connect(this.onTagListChanged, this);

    // Update tag list
    const tags: string[] = (model.metadata.get('tags') as string[]) || [];
    if (tags.length > 0) {
      allTags.pushAll(tags); // We don't care about duplicate here so we can remove all occurrences at will
    } else {
      this.refreshTags(); // Force displaying default tags if no tags specified
    }
    model.metadata.changed.connect(this.onCellMetadataChanged, this);
  }

  dispose(): void {
    if (this.isDisposed) {
      return;
    }

    this._model.metadata.changed.disconnect(this.onCellMetadataChanged, this);
    this._tagList.changed.disconnect(this.onTagListChanged, this);
    super.dispose();
  }

  /**
   * Check whether a tag is applied to the current active cell
   *
   * @param name - The name of the tag.
   *
   * @returns A boolean representing whether it is applied.
   */
  checkApplied(name: string): boolean {
    const tags = (this._model.metadata.get('tags') as string[]) || [];

    return tags.some(tag => tag === name);
  }

  /**
   * Add a tag to the current active cell.
   *
   * @param name - The name of the tag.
   */
  addTag(name: string): void {
    const tags = (this._model.metadata.get('tags') as string[]) || [];
    const newTags = name
      .split(/[,\s]+/)
      .filter(tag => tag !== '' && !tags.includes(tag));
    // Update the cell metadata => tagList will be updated in metadata listener
    this._model.metadata.set('tags', [...tags, ...newTags]);
  }

  /**
   * Remove a tag from the current active cell.
   *
   * @param name - The name of the tag.
   */
  removeTag(name: string): void {
    // Need to copy as we splice a mutable otherwise
    const tags = [...((this._model.metadata.get('tags') as string[]) || [])];
    const idx = tags.indexOf(name);
    if (idx > -1) {
      tags.splice(idx, 1);
    }

    // Update the cell metadata => tagList will be update in metadata listener
    if (tags.length === 0) {
      this._model.metadata.delete('tags');
    } else {
      this._model.metadata.set('tags', tags);
    }
  }

  /**
   * Update the tag widgets for the current cell.
   */
  refreshTags(): void {
    const layout = this.layout as PanelLayout;
    const tags: string[] = [...new Set(toArray(this._tagList))];
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

    tags.forEach(tag => {
      layout.insertWidget(
        (this.layout as PanelLayout).widgets.length - 1,
        new TagWidget(tag)
      );
    });

    // Update all tags widgets
    layout.widgets.forEach(widget => {
      widget.update();
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
   * Validate the 'tags' of cell metadata, ensuring it is a list of strings and
   * that each string doesn't include spaces.
   *
   * @param tagList Tags array to be validated
   * @returns Validated tags array
   */
  protected _validateTags(tagList: string[]): string[] {
    const results = new Set<string>();

    tagList
      .filter(tag => typeof tag === 'string' && tag !== '')
      .forEach(tag => {
        tag.split(/[,\s]+/).forEach(subTag => {
          if (subTag !== '') {
            results.add(subTag);
          }
        });
      });

    return [...results];
  }

  /**
   * Propagate the cell metadata changes to the shared tag list.
   *
   * @param metadata Cell metadata
   * @param changes Metadata changes
   */
  protected onCellMetadataChanged(
    metadata: IObservableJSON,
    changes: IObservableMap.IChangedArgs<ReadonlyPartialJSONValue>
  ): void {
    if (changes.key === 'tags') {
      const oldTags = [...new Set((changes.oldValue as string[]) || [])];
      const newTags = this._validateTags((changes.newValue as string[]) || []);

      oldTags.forEach(tag => {
        if (!newTags.includes(tag)) {
          this._tagList.removeValue(tag);
        }
      });
      this._tagList.pushAll(newTags.filter(tag => !oldTags.includes(tag)));
    }
  }

  /**
   * Listener on shared tag list changes
   *
   * @param list Shared tag list
   * @param changes Tag list changes
   */
  protected onTagListChanged(
    list: ObservableList<string>,
    changes: IObservableList.IChangedArgs<string>
  ): void {
    this.refreshTags();
  }

  public _model: ICellModel;
  private _tagList: ObservableList<string>;
}
