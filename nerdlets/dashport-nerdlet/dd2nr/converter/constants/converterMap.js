import {
  DD_TYPE_FREE_TEXT,
  DD_TYPE_IMAGE,
  DD_TYPE_NOTE,
  DD_TYPE_TIMESERIES,
  DD_TYPE_QUERY_TABLE,
  DD_TYPE_QUERY_VALUE,
  DD_TYPE_IFRAME,
  DD_TYPE_HEATMAP,
  DD_TYPE_DISTRIBUTION,
  DD_TYPE_TOP_LIST,
  DD_TYPE_CHANGE
  // DD_ATTRIBUTE_VARIABLES
} from './dataDog';

import {
  ddQueryTableToNRChart,
  ddQueryValueToNRChart,
  ddTimeseriesToNRChart,
  ddHeatmapToNRChart,
  ddDistributionToNRChart,
  ddTopListToNRChart,
  ddChangeToNRChart
} from '../converters/nrChart';

import {
  ddFreeTextToNRMarkdown,
  ddImageToNRMarkdown,
  ddNoteToNRMarkdown
} from '../converters/nrMarkdown';

import { ddIframeToNRIframe } from '../converters/nrIframe';

const CONVERTER_MAP = {
  [DD_TYPE_FREE_TEXT]: ddQuery => ddFreeTextToNRMarkdown(ddQuery),
  [DD_TYPE_IMAGE]: ddQuery => ddImageToNRMarkdown(ddQuery),
  [DD_TYPE_NOTE]: ddQuery => ddNoteToNRMarkdown(ddQuery),
  [DD_TYPE_QUERY_TABLE]: ddQuery => ddQueryTableToNRChart(ddQuery),
  [DD_TYPE_QUERY_VALUE]: ddQuery => ddQueryValueToNRChart(ddQuery),
  [DD_TYPE_TIMESERIES]: ddQuery => ddTimeseriesToNRChart(ddQuery),
  [DD_TYPE_IFRAME]: ddQuery => ddIframeToNRIframe(ddQuery),
  [DD_TYPE_HEATMAP]: ddQuery => ddHeatmapToNRChart(ddQuery),
  [DD_TYPE_DISTRIBUTION]: ddQuery => ddDistributionToNRChart(ddQuery),
  [DD_TYPE_TOP_LIST]: ddQuery => ddTopListToNRChart(ddQuery),
  [DD_TYPE_CHANGE]: ddQuery => ddChangeToNRChart(ddQuery)
};

export { CONVERTER_MAP };

// export const DD_ATTRIBUTE_VARIABLES = console.log('DD_ATTRIBUTE_VARIABLES');
