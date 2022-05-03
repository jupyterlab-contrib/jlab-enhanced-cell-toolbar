import { LabIcon } from '@jupyterlab/ui-components';
import { EXTENSION_ID } from './tokens';

// icon svg import statements
import formatSvg from '../style/icons/format.svg';
import lockedTagsSvg from '../style/icons/lockedtags.svg';
import unlockedTagsSvg from '../style/icons/unlockedtags.svg';

export const formatIcon = new LabIcon({
  name: `${EXTENSION_ID}:format`,
  svgstr: formatSvg
});
export const lockedTagsIcon = new LabIcon({
  name: `${EXTENSION_ID}:lockedtags`,
  svgstr: lockedTagsSvg
});
export const unlockedTagsIcon = new LabIcon({
  name: `${EXTENSION_ID}:unlockedtags`,
  svgstr: unlockedTagsSvg
});
