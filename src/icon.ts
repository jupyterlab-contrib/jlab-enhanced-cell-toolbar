import { LabIcon } from '@jupyterlab/ui-components';
import { EXTENSION_ID } from './tokens';

// icon svg import statements
import codeSvg from '../style/icons/code.svg';
import deleteSvg from '../style/icons/delete.svg';
import formatSvg from '../style/icons/format.svg';

export const codeIcon = new LabIcon({
  name: `${EXTENSION_ID}:code`,
  svgstr: codeSvg
});
export const deleteIcon = new LabIcon({
  name: `${EXTENSION_ID}:delete`,
  svgstr: deleteSvg
});
export const formatIcon = new LabIcon({
  name: `${EXTENSION_ID}:format`,
  svgstr: formatSvg
});
