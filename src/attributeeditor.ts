import { IObservableJSON, IObservableMap } from '@jupyterlab/observables';
import { Message } from '@lumino/messaging';
import { Widget } from '@lumino/widgets';

/**
 * Attribute editor widget options
 */
export interface IAttributeOptions {
  /**
   * Cell metadata object
   */
  metadata: IObservableJSON;
  /**
   * Metadata key(s) to synchronize
   *
   * #### Notes
   * If it contains '/', the attribute is considered as nested within objects.
   */
  keys: string[];
  /**
   * Attribute label
   */
  label: string;
  /**
   * List of [value, label] options
   */
  values: [string, string][];
  /**
   * The no value display
   */
  noValue?: string;
  /**
   * Is the attribute value editable
   */
  editable?: boolean;
  /**
   * Input placeholder for editable mode
   */
  placeholder?: string;
}

/**
 * Editor for a single cell metadata attribute
 */
export class AttributeEditor extends Widget {
  constructor(options: IAttributeOptions) {
    const { metadata, keys, label, values, noValue, editable, placeholder } = {
      editable: false,
      ...options
    };

    const allValues =
      noValue !== undefined ? [[noValue, noValue]].concat(values) : values;
    const node = document.createElement('div');

    const optionsList = allValues.map(
      v => `<option value="${editable ? v[1] : v[0]}">${v[1]}</option>`
    );
    if (editable) {
      const uuid = Private.getDataListUID();
      node.insertAdjacentHTML(
        'afterbegin',
        `<label>${label}
      <input list="${uuid}" />
      <datalist id="${uuid}">${optionsList.join('')}</datalist>
    </label>`
      );
    } else {
      node.insertAdjacentHTML(
        'afterbegin',
        `<label>${label}
      <select>${optionsList.join('')}</select>
    </label>`
      );
    }
    super({ node });
    this.addClass('jp-enh-attribute-editor');
    this.metadata = metadata;
    this.keys = keys;
    this.noValue = noValue;
    this.editable = editable;
    this.values = allValues as any;
    this.selectNode = node.querySelector<HTMLInputElement | HTMLSelectElement>(
      editable ? 'input' : 'select'
    )!;
    if (editable && placeholder) {
      (this.selectNode as HTMLInputElement).placeholder = placeholder;
    }

    // Break at first found key
    for (const key of this.keys) {
      if (this._getValue(key) !== undefined) {
        this.onMetadataChanged(this.metadata, {
          key,
          newValue: this.metadata.get(key),
          oldValue: undefined,
          type: 'add'
        });
        break;
      }
    }
    this.metadata.changed.connect(this.onMetadataChanged, this);
  }

  /**
   * Dispose widget resources
   */
  dispose(): void {
    if (this.isDisposed) {
      return;
    }

    this.metadata.changed.disconnect(this.onMetadataChanged, this);
    super.dispose();
  }

  /**
   * Handle event on the element
   * @param event Event
   */
  handleEvent(event: Event): void {
    switch (event.type) {
      case 'change':
        {
          const inputValue = (event.target as any).value;
          const newValue =
            inputValue === this.noValue
              ? null
              : this.editable
              ? (this.values.find(([value, label]) => inputValue === label) ??
                  [])[0] ?? inputValue
              : inputValue;
          for (const k of this.keys) {
            const keyPath = k.split('/');

            if (keyPath.length > 1) {
              let value = this.metadata.get(keyPath[0]) as any;
              if (value === undefined) {
                value = {};
                this.metadata.set(keyPath[0], value);
              }
              const topValue = value;
              for (let p = 1; p < keyPath.length - 1; p++) {
                if (value[keyPath[p]] === undefined) {
                  value[keyPath[p]] = {};
                }
                value = value[keyPath[p]];
              }
              if (newValue === null) {
                delete value[keyPath[keyPath.length - 1]];
              } else {
                value[keyPath[keyPath.length - 1]] = newValue;
              }
              this.metadata.set(keyPath[0], topValue);
            } else {
              if (newValue === null) {
                this.metadata.delete(keyPath[0]);
              } else {
                this.metadata.set(keyPath[0], newValue);
              }
            }
          }
        }
        break;
      case 'focusin':
        if (this.editable) {
          this.selectNode.value = '';
        }
        break;
      case 'focusout':
        if (this.editable) {
          for (const key of this.keys) {
            if (this._getValue(key) !== undefined) {
              this.onMetadataChanged(this.metadata, {
                key,
                newValue: this.metadata.get(key),
                oldValue: undefined,
                type: 'change'
              });
              break;
            }
          }
        }
        break;
    }
  }

  protected onAfterAttach(msg: Message): void {
    super.onAfterAttach(msg);
    this.selectNode.addEventListener('change', this);
    if (this.editable) {
      this.selectNode.addEventListener('focusin', this);
      this.selectNode.addEventListener('focusout', this);
    }
  }

  protected onBeforeDetach(msg: Message): void {
    this.selectNode.removeEventListener('change', this);
    if (this.editable) {
      this.selectNode.removeEventListener('focusin', this);
      this.selectNode.removeEventListener('focusout', this);
    }
    super.onBeforeDetach(msg);
  }

  protected onMetadataChanged(
    metadata: IObservableJSON,
    changes: IObservableMap.IChangedArgs<any>
  ): void {
    if (this.keys.includes(changes.key)) {
      const value = this._getValue(changes.key);
      if (value === undefined) {
        this.selectNode.value = this.noValue ? this.noValue : '';
      } else {
        this.selectNode.value = this.editable
          ? (this.values.find(([v, label]) => value === v) ?? [])[1] ?? value
          : value;
      }
    }
  }

  protected editable: boolean;
  protected keys: string[];
  protected metadata: IObservableJSON;
  protected noValue?: string;
  protected selectNode: HTMLInputElement | HTMLSelectElement;
  protected values: [string, string][];

  private _getValue(key: string): any {
    const keyPath = key.split('/');

    let value = this.metadata.get(keyPath[0]) as any;
    for (let p = 1; p < keyPath.length; p++) {
      value = (value ?? {})[keyPath[p]];
    }
    return value;
  }
}

namespace Private {
  let counter = 0;

  export function getDataListUID(): string {
    return `attribute-widget-${counter++}`;
  }
}
