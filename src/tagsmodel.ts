import { VDomModel } from '@jupyterlab/apputils';
import { ICellModel } from '@jupyterlab/cells';
import {
  IObservableJSON,
  IObservableMap,
  ObservableList
} from '@jupyterlab/observables';
import { ReadonlyPartialJSONValue } from '@lumino/coreutils';

/**
 * Model handling tag lists
 *
 * stateChanged signal is emitted when the tags list or the
 * unlockedTags attributes changes.
 */
export class TagsModel extends VDomModel {
  /**
   * Constructor
   *
   * @param model Cell model
   * @param tagsList Notebook tag list
   * @param unlockedTags Whether the tags are read-only or not
   */
  constructor(
    model: ICellModel,
    tagsList?: ObservableList<string>,
    unlockedTags = true
  ) {
    super();
    this._model = model;
    this._tags = tagsList ?? new ObservableList<string>();
    this._unlockedTags = unlockedTags;

    // Update tag list
    const tags: string[] = (this._model.metadata.get('tags') as string[]) || [];
    if (tags.length > 0) {
      this._tags.pushAll(tags);
    }
    model.metadata.changed.connect(this.onCellMetadataChanged, this);
    this._tags.changed.connect(this._emitStateChange, this);
  }

  /**
   * Notebook tags list
   */
  get tags(): ObservableList<string> {
    return this._tags;
  }
  set tags(l: ObservableList<string>) {
    if (l !== this._tags) {
      this._tags = l;

      // Update tag list
      const tags: string[] =
        (this._model.metadata.get('tags') as string[]) || [];
      if (tags.length > 0) {
        this._tags.pushAll(tags);
      }
      this.stateChanged.emit();
    }
  }

  /**
   * Whether the tags are read-only or not
   */
  get unlockedTags(): boolean {
    return this._unlockedTags;
  }
  set unlockedTags(v: boolean) {
    if (v !== this._unlockedTags) {
      this._unlockedTags = v;
      this.stateChanged.emit();
    }
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
   * Dispose the model.
   */
  dispose(): void {
    if (this.isDisposed) {
      return;
    }

    this._model.metadata.changed.disconnect(this.onCellMetadataChanged, this);
    this._tags.changed.disconnect(this._emitStateChange, this);
    super.dispose();
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
   * Propagate the cell metadata changes to the shared tag list.
   *
   * @param metadata Cell metadata
   * @param changes Metadata changes
   */
  protected onCellMetadataChanged(
    metadata: IObservableJSON,
    changes: IObservableMap.IChangedArgs<ReadonlyPartialJSONValue | undefined>
  ): void {
    if (changes.key === 'tags') {
      const oldTags = [...new Set((changes.oldValue as string[]) || [])];
      const newTags = this._validateTags((changes.newValue as string[]) || []);

      oldTags.forEach(tag => {
        if (!newTags.includes(tag)) {
          this.tags.removeValue(tag);
        }
      });
      this.tags.pushAll(newTags.filter(tag => !oldTags.includes(tag)));
    }
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

  private _emitStateChange(): void {
    this.stateChanged.emit();
  }

  private _model: ICellModel;
  private _tags: ObservableList<string>;
  private _unlockedTags: boolean;
}
