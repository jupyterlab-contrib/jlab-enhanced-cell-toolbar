import { CodeEditor, JSONEditor } from '@jupyterlab/codeeditor';
import { IObservableJSON } from '@jupyterlab/observables';
import { ITranslator, nullTranslator } from '@jupyterlab/translation';
import { PanelLayout, Widget } from '@lumino/widgets';

export class CellMetadataEditor extends Widget {
  constructor(
    metadata: IObservableJSON,
    editorFactory: CodeEditor.Factory,
    translator?: ITranslator
  ) {
    super();
    const trans = (translator ?? nullTranslator).load('cell-toolbar');
    const layout = (this.layout = new PanelLayout());
    const editor = new JSONEditor({ editorFactory, translator });
    editor.source = metadata;
    const node = document.createElement('p');
    node.innerText = trans.__(
      "Manually edit the JSON below to manipulate the metadata for this cell. We recommend putting custom metadata attributes in an appropriately named substructure, so they don't conflict with those of others."
    );
    layout.addWidget(new Widget({ node }));
    layout.addWidget(editor);
  }
}
