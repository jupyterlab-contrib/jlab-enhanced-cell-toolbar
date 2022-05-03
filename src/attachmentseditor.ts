import { IAttachmentsModel } from '@jupyterlab/attachments';
import { IAttachmentsCellModel } from '@jupyterlab/cells';
import { NotebookTools } from '@jupyterlab/notebook';
import {
  ITranslator,
  nullTranslator,
  TranslationBundle
} from '@jupyterlab/translation';
import { deleteIcon } from '@jupyterlab/ui-components';
import { Message } from '@lumino/messaging';
import { PanelLayout, Widget } from '@lumino/widgets';

export class AttachmentsEditor extends Widget {
  constructor(
    model: IAttachmentsModel | null = null,
    translator?: ITranslator
  ) {
    super();
    this.addClass('jp-cell-enh-attachment-editor');
    this._model = null;
    this.trans = (translator ?? nullTranslator).load('cell-toolbar');
    this.info = document.createElement('p');
    this.table = document.createElement('table');
    this.node.insertAdjacentElement('beforeend', this.table);
    this.node.insertAdjacentElement('beforeend', this.info);
    // Initialize with the model
    this.model = model;
  }

  /**
   * Attachment model handle by this widget
   */
  get model(): IAttachmentsModel | null {
    return this._model;
  }
  set model(v: IAttachmentsModel | null) {
    if (this._model !== v) {
      if (this._model) {
        this._model.changed.disconnect(this.onModelChanged, this);
      }
      this._model = v;
      if (this._model) {
        this._model.changed.connect(this.onModelChanged, this);
      }
      this._refresh();
    }
  }

  private _refresh(): void {
    this._clearListeners();
    this.info.innerText = '';
    this.table.innerHTML = `<caption>${this.trans.__('Attachments')}</caption>`;
    if (this._model !== null) {
      if (this._model.length > 0) {
        const attachments = this._model.keys.map(k => {
          const types = Object.keys(this._model!.get(k)?.data ?? {});
          return `<tr data-attachment-key="${k}"><td>${k}</td><td>${types.join(
            ';'
          )}</td><td><button title="${this.trans.__(
            'Delete'
          )}"></button></td></tr>`;
        });
        this.node
          .querySelector('table')
          ?.insertAdjacentHTML('beforeend', attachments.join(''));
        this.node.querySelectorAll('button').forEach(button => {
          deleteIcon.element({ container: button });
        });
        this._addListeners();
      } else {
        this.info.innerText = this.trans.__(
          'There are no attachments for this cell.'
        );
      }
    }
  }

  handleEvent(event: Event): void {
    switch (event.type) {
      case 'click':
        {
          event.preventDefault();
          const k = (event.currentTarget as HTMLButtonElement).parentElement?.parentElement?.getAttribute(
            'data-attachment-key'
          );
          if (k) {
            this._model?.remove(k);
          }
        }
        break;
    }
  }

  protected onAfterAttach(msg: Message): void {
    super.onAfterAttach(msg);

    this._addListeners();
  }

  protected onBeforeDetach(msg: Message): void {
    this._clearListeners();
    super.onBeforeDetach(msg);
  }

  protected onModelChanged(): void {
    this._refresh();
  }

  private _addListeners(): void {
    this.table.querySelectorAll('button').forEach(button => {
      button.addEventListener('click', this);
    });
  }
  private _clearListeners(): void {
    this.table.querySelectorAll('button').forEach(button => {
      button.removeEventListener('click', this);
    });
  }

  protected trans: TranslationBundle;
  protected table: HTMLTableElement;
  protected info: HTMLParagraphElement;
  private _model: IAttachmentsModel | null;
}

/**
 * Attachments editor as notebook tool
 */
export class AttachmentsTool extends NotebookTools.Tool {
  constructor(translator?: ITranslator) {
    super();
    this._editor = new AttachmentsEditor(null, translator);
    const layout = (this.layout = new PanelLayout());
    layout.addWidget(this._editor);
  }

  /**
   * Handle a change to the active cell.
   *
   * #### Notes
   * The default implementation is a no-op.
   */
  protected onActiveCellChanged(msg: Message): void {
    if (
      this.notebookTools.activeCell &&
      ['markdown', 'raw'].includes(this.notebookTools.activeCell.model.type)
    ) {
      this._editor.model = (this.notebookTools.activeCell
        .model as IAttachmentsCellModel).attachments;
    } else {
      this._editor.model = null;
    }
  }

  private _editor: AttachmentsEditor;
}
