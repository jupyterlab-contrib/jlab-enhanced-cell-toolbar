import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import {
  createToolbarFactory,
  Dialog,
  IToolbarWidgetRegistry,
  showDialog,
  ToolbarButton,
  ToolbarRegistry
} from '@jupyterlab/apputils';
import { Cell, IAttachmentsCellModel } from '@jupyterlab/cells';
import { IEditorServices } from '@jupyterlab/codeeditor';
import { INotebookTools, INotebookTracker } from '@jupyterlab/notebook';
import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { ITranslator, nullTranslator } from '@jupyterlab/translation';
import { Widget } from '@lumino/widgets';
import { AttachmentsEditor, AttachmentsTool } from './attachmentseditor';
import { AttributeEditor } from './attributeeditor';
import { CellBarExtension, DEFAULT_TOOLBAR } from './celltoolbartracker';
import { CellMetadataEditor } from './metadataeditor';
import { TagTool } from './tagbar';
import { TagsModel } from './tagsmodel';
import { CellToolbar, EXTENSION_ID, FACTORY_NAME } from './tokens';

const DEFAULT_TOOLBAR_ITEM_RANK = 50;

/**
 * Export the icons so they got loaded
 */
export { formatIcon } from './icon';

namespace CommandIDs {
  /**
   * Toggle cell attachments editor
   */
  export const toggleAttachments = `${EXTENSION_ID}:toggle-attachments`;
  /**
   * Toggle cell metadata editor
   */
  export const toggleMetadata = `${EXTENSION_ID}:toggle-metadata`;
  /**
   * Toggle cell toolbar
   */
  export const toggleToolbar = `${EXTENSION_ID}:toggle-toolbar`;
  /**
   * Toggle cell Raw NBConvert format
   */
  export const toggleRawFormat = `${EXTENSION_ID}:toggle-raw-format`;
  /**
   * Toggle cell slide type
   */
  export const toggleSlideType = `${EXTENSION_ID}:toggle-slide-type`;
  /**
   * Toggle cell tags
   */
  export const toggleTags = `${EXTENSION_ID}:toggle-tags`;
}

/**
 * JupyterLab enhanced cell toolbar plugin.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: `${EXTENSION_ID}:plugin`,
  autoStart: true,
  optional: [ISettingRegistry, ITranslator, IEditorServices],
  requires: [INotebookTracker, IToolbarWidgetRegistry],
  activate: async (
    app: JupyterFrontEnd,
    notebookTracker: INotebookTracker,
    toolbarRegistry: IToolbarWidgetRegistry,
    settingRegistry: ISettingRegistry | null,
    translator: ITranslator | null,
    editorServices: IEditorServices | null
  ) => {
    const trans = (translator ?? nullTranslator).load('cell-toolbar');

    // Register specific toolbar items
    toolbarRegistry.registerFactory(
      FACTORY_NAME,
      CellToolbar.ViewItems.TAGS,
      (cell: Widget) => {
        const model = new TagsModel((cell as Cell).model);
        const widget = new TagTool(model);
        widget.disposed.connect(() => {
          model.dispose();
        });
        return widget;
      }
    );

    // Extract the list from nbconvert service as in @jupyterlab/notebook-extension
    app.serviceManager.nbconvert
      .getExportFormats()
      .then(response => {
        if (response) {
          const coreTrans = (translator ?? nullTranslator).load('jupyterlab');
          /**
           * The excluded Cell Inspector Raw NbConvert Formats
           * (returned from nbconvert's export list)
           */
          const rawFormatExclude = [
            'pdf',
            'slides',
            'script',
            'notebook',
            'custom' // Exclude this as the input is editable
          ];
          const optionValueArray: [string, string][] = [
            ['pdf', coreTrans.__('PDF')],
            ['slides', coreTrans.__('Slides')],
            ['script', coreTrans.__('Script')],
            ['notebook', coreTrans.__('Notebook')]
          ];

          // convert exportList to palette and menu items
          const formatList = Object.keys(response);
          formatList.forEach(key => {
            if (rawFormatExclude.indexOf(key) === -1) {
              const altOption = coreTrans.__(
                key[0].toUpperCase() + key.slice(1)
              );
              const coreLabel = coreTrans.__(key);
              const option = coreLabel === key ? altOption : coreLabel;
              const mimeTypeValue = response[key].output_mimetype;
              optionValueArray.push([mimeTypeValue, option]);
            }
          });

          toolbarRegistry.registerFactory(
            FACTORY_NAME,
            CellToolbar.ViewItems.RAW_FORMAT,
            (cell: Widget) => {
              if ((cell as Cell).model.type === 'raw') {
                const w = new AttributeEditor({
                  metadata: (cell as Cell).model.metadata,
                  keys: ['raw_mimetype', 'format'],
                  label: trans.__('Raw NBConvert Format'),
                  values: optionValueArray,
                  editable: true,
                  placeholder: trans.__('Click or press 🠗 for suggestions.'),
                  noValue: ''
                });
                w.addClass('jp-enh-cell-raw-format');
                return w;
              } else {
                const widget = new Widget();
                widget.hide();
                return widget;
              }
            }
          );
        } else {
          throw new Error('Fallback to default raw format.');
        }
      })
      .catch(() => {
        toolbarRegistry.registerFactory(
          FACTORY_NAME,
          CellToolbar.ViewItems.RAW_FORMAT,
          (cell: Widget) => {
            if ((cell as Cell).model.type === 'raw') {
              const w = new AttributeEditor({
                metadata: (cell as Cell).model.metadata,
                keys: ['raw_mimetype', 'format'],
                label: trans.__('Raw NBConvert Format'),
                values: [
                  ['text/latex', 'LaTeX'],
                  ['text/restructuredtext', 'ReStructured Text'],
                  ['text/html', 'HTML'],
                  ['text/markdown', 'Markdown'],
                  ['text/x-python', 'Python']
                ],
                editable: true,
                placeholder: trans.__('Click or press 🠗 for suggestions.'),
                noValue: ''
              });
              w.addClass('jp-enh-cell-raw-format');
              return w;
            } else {
              const widget = new Widget();
              widget.hide();
              return widget;
            }
          }
        );
      });

    toolbarRegistry.registerFactory(
      FACTORY_NAME,
      CellToolbar.ViewItems.SLIDESHOW,
      (cell: Widget) => {
        const w = new AttributeEditor({
          metadata: (cell as Cell).model.metadata,
          keys: ['slideshow/slide_type'],
          label: trans.__('Slide Type'),
          values: [
            ['slide', trans.__('Slide')],
            ['subslide', trans.__('Sub-Slide')],
            ['fragment', trans.__('Fragment')],
            ['skip', trans.__('Skip')],
            ['notes', trans.__('Notes')]
          ],
          noValue: '-'
        });
        w.addClass('jp-enh-cell-slide-type');
        return w;
      }
    );

    toolbarRegistry.registerFactory(
      FACTORY_NAME,
      CellToolbar.ViewItems.ATTACHMENTS,
      (cell: Widget) => {
        if (['markdown', 'raw'].includes((cell as Cell).model?.type)) {
          return new ToolbarButton({
            label: trans.__('Edit Attachments…'),
            actualOnClick: true,
            onClick: async (): Promise<void> => {
              await showDialog({
                title: trans.__('Edit Cell Attachments'),
                body: new AttachmentsEditor(
                  ((cell as Cell).model as IAttachmentsCellModel).attachments,
                  translator ?? nullTranslator
                ),
                buttons: [Dialog.okButton({ label: trans.__('Close') })]
              });
            }
          });
        } else {
          return new Widget();
        }
      }
    );

    if (editorServices) {
      toolbarRegistry.registerFactory(
        FACTORY_NAME,
        CellToolbar.ViewItems.METADATA,
        (cell: Widget) =>
          new ToolbarButton({
            label: trans.__('Edit Metadata…'),
            actualOnClick: true,
            onClick: async (): Promise<void> => {
              const body = new CellMetadataEditor(
                (cell as Cell).model.metadata,
                editorServices.factoryService.newInlineEditor,
                translator ?? nullTranslator
              );
              body.addClass('jp-cell-enh-metadata-editor');
              await showDialog({
                title: trans.__('Edit Cell Metadata'),
                body,
                buttons: [Dialog.okButton({ label: trans.__('Close') })]
              });
            }
          })
      );
    }

    // Add the widget extension
    let notebookExtension: CellBarExtension;
    if (settingRegistry) {
      const cellToolbarFactory = createToolbarFactory(
        toolbarRegistry,
        settingRegistry,
        FACTORY_NAME,
        extension.id,
        translator ?? nullTranslator
      );

      settingRegistry
        .load(extension.id)
        .then(async settings => {
          await upgradeSettings(settings);
          notebookExtension = new CellBarExtension(
            app.commands,
            cellToolbarFactory,
            toolbarRegistry,
            settings
          );
          app.docRegistry.addWidgetExtension('Notebook', notebookExtension);
        })
        .catch(reason => {
          console.error(`Failed to load settings for ${extension.id}.`, reason);
        });
    } else {
      notebookExtension = new CellBarExtension(
        app.commands,
        (c: Cell): ToolbarRegistry.IToolbarItem[] =>
          DEFAULT_TOOLBAR.filter(
            item => !item.cellType || item.cellType === c.model.type
          ).map(item => {
            return {
              name: item.name,
              widget: toolbarRegistry.createWidget(FACTORY_NAME, c, item)
            };
          }),
        toolbarRegistry,
        null
      );
      app.docRegistry.addWidgetExtension('Notebook', notebookExtension);
    }

    // Add commands
    app.commands.addCommand(CommandIDs.toggleAttachments, {
      label: trans.__('Show Attachments'),
      execute: () => {
        const nb = notebookTracker.currentWidget;
        if (nb && notebookExtension) {
          const handler = notebookExtension.getToolbarsHandler(nb);
          if (handler) {
            handler.setViewState(
              CellToolbar.ViewItems.ATTACHMENTS,
              !handler.getViewState(CellToolbar.ViewItems.ATTACHMENTS)
            );
          }
        }
      },
      isToggled: () => {
        const nb = notebookTracker.currentWidget;
        if (nb && notebookExtension) {
          const handler = notebookExtension.getToolbarsHandler(nb);
          if (handler) {
            return handler.getViewState(CellToolbar.ViewItems.ATTACHMENTS);
          }
        }
        return false;
      }
    });
    app.commands.addCommand(CommandIDs.toggleMetadata, {
      label: trans.__('Show Metadata'),
      execute: () => {
        const nb = notebookTracker.currentWidget;
        if (nb && notebookExtension) {
          const handler = notebookExtension.getToolbarsHandler(nb);
          if (handler) {
            handler.setViewState(
              CellToolbar.ViewItems.METADATA,
              !handler.getViewState(CellToolbar.ViewItems.METADATA)
            );
          }
        }
      },
      isToggled: () => {
        const nb = notebookTracker.currentWidget;
        if (nb && notebookExtension) {
          const handler = notebookExtension.getToolbarsHandler(nb);
          if (handler) {
            return handler.getViewState(CellToolbar.ViewItems.METADATA);
          }
        }
        return false;
      }
    });
    app.commands.addCommand(CommandIDs.toggleRawFormat, {
      label: trans.__('Show Raw Cell Format'),
      execute: () => {
        const nb = notebookTracker.currentWidget;
        if (nb && notebookExtension) {
          const handler = notebookExtension.getToolbarsHandler(nb);
          if (handler) {
            handler.setViewState(
              CellToolbar.ViewItems.RAW_FORMAT,
              !handler.getViewState(CellToolbar.ViewItems.RAW_FORMAT)
            );
          }
        }
      },
      isToggled: () => {
        const nb = notebookTracker.currentWidget;
        if (nb && notebookExtension) {
          const handler = notebookExtension.getToolbarsHandler(nb);
          if (handler) {
            return handler.getViewState(CellToolbar.ViewItems.RAW_FORMAT);
          }
        }
        return false;
      }
    });
    app.commands.addCommand(CommandIDs.toggleSlideType, {
      label: trans.__('Show Slideshow'),
      execute: () => {
        const nb = notebookTracker.currentWidget;
        if (nb && notebookExtension) {
          const handler = notebookExtension.getToolbarsHandler(nb);
          if (handler) {
            handler.setViewState(
              CellToolbar.ViewItems.SLIDESHOW,
              !handler.getViewState(CellToolbar.ViewItems.SLIDESHOW)
            );
          }
        }
      },
      isToggled: () => {
        const nb = notebookTracker.currentWidget;
        if (nb && notebookExtension) {
          const handler = notebookExtension.getToolbarsHandler(nb);
          if (handler) {
            return handler.getViewState(CellToolbar.ViewItems.SLIDESHOW);
          }
        }
        return false;
      }
    });
    app.commands.addCommand(CommandIDs.toggleTags, {
      label: trans.__('Show Tags'),
      execute: () => {
        const nb = notebookTracker.currentWidget;
        if (nb && notebookExtension) {
          const handler = notebookExtension.getToolbarsHandler(nb);
          if (handler) {
            handler.setViewState(
              CellToolbar.ViewItems.TAGS,
              !handler.getViewState(CellToolbar.ViewItems.TAGS)
            );
          }
        }
      },
      isToggled: () => {
        const nb = notebookTracker.currentWidget;
        if (nb && notebookExtension) {
          const handler = notebookExtension.getToolbarsHandler(nb);
          if (handler) {
            return handler.getViewState(CellToolbar.ViewItems.TAGS);
          }
        }
        return false;
      }
    });
    app.commands.addCommand(CommandIDs.toggleToolbar, {
      label: trans.__('Show Toolbar'),
      execute: () => {
        const nb = notebookTracker.currentWidget;
        if (nb && notebookExtension) {
          const handler = notebookExtension.getToolbarsHandler(nb);
          if (handler) {
            handler.isActive = !handler.isActive;
          }
        }
      },
      isToggled: () => {
        const nb = notebookTracker.currentWidget;
        if (nb && notebookExtension) {
          const handler = notebookExtension.getToolbarsHandler(nb);
          if (handler) {
            return handler.isActive;
          }
        }
        return false;
      }
    });

    /**
     * Upgrade the settings from the old format of v3
     * @param settings Extension settings
     */
    async function upgradeSettings(
      settings: ISettingRegistry.ISettings
    ): Promise<void> {
      const iconsMapping: { [name: string]: string } = {
        '@jlab-enhanced/cell-toolbar:code': 'ui-components:code',
        '@jlab-enhanced/cell-toolbar:delete': 'ui-components:delete'
      };
      const current = settings.composite as any;
      let wasUpgraded = false;
      const toolbarDefinition: ISettingRegistry.IToolbarItem[] = [];
      let rank = 0;
      if (current['leftMenu']) {
        wasUpgraded = true;
        (current['leftMenu'] as CellToolbar.IButton[]).forEach(item => {
          if (app.commands.hasCommand(item.command)) {
            toolbarDefinition.push({
              name: [item.command.split(':')[1], item.cellType].join('-'),
              command: item.command,
              icon: iconsMapping[item.icon as string] ?? item.icon,
              rank: rank++
            });
          }
        });
        await settings.remove('leftMenu');
      }
      rank = Math.max(rank, DEFAULT_TOOLBAR_ITEM_RANK);
      toolbarDefinition.push({ name: 'spacer', type: 'spacer', rank });
      if (current['showTags']) {
        wasUpgraded = true;
        toolbarDefinition.push({
          name: CellToolbar.ViewItems.TAGS,
          rank: rank++
        });
        await settings.remove('showTags');
      }
      if (current['rightMenu']) {
        wasUpgraded = true;
        (current['rightMenu'] as CellToolbar.IButton[]).forEach(item => {
          if (app.commands.hasCommand(item.command)) {
            toolbarDefinition.push({
              name: [item.command.split(':')[1], item.cellType].join('-'),
              command: item.command,
              icon: iconsMapping[item.icon as string] ?? item.icon,
              rank: rank++
            });
          }
        });
        await settings.remove('rightMenu');
      }
      if (wasUpgraded) {
        // Disabled default toolbar items
        const names = toolbarDefinition.map(t => t.name);
        for (const item of DEFAULT_TOOLBAR) {
          if (!names.includes(item.name)) {
            toolbarDefinition.push({ name: item.name, disabled: true });
          }
        }
        await settings.set('toolbar', toolbarDefinition);
        await showDialog({
          title: 'Information',
          body: trans.__(
            'The toolbar extension has been upgraded. You need to refresh the web page to take into account the new configuration.'
          )
        });
      }
    }
  }
};

/**
 * Notebook tools plugin
 */
const nbTools: JupyterFrontEndPlugin<void> = {
  id: `${EXTENSION_ID}:tools`,
  autoStart: true,
  activate: async (
    app: JupyterFrontEnd,
    notebookTools: INotebookTools,
    translator: ITranslator | null
  ) => {
    notebookTools.addItem({
      tool: new AttachmentsTool(translator ?? nullTranslator),
      section: 'common'
    });
  },
  optional: [ITranslator],
  requires: [INotebookTools]
};

export default [extension, nbTools];
