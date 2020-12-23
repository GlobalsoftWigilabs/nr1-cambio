import { NR_TYPE_MARKDOWN } from '../constants/newRelic';

/**
 * Transform Datadog's iframe text table widget to New Relic's iframe text table widget
 *
 * @param {*} widget
 * @return {*}
 */
function ddIframeToNRIframe(widget) {
  const nrWidget = {
    account_id: null,
    visualization: NR_TYPE_MARKDOWN,
    layout: {
      width: 1,
      height: 1,
      row: 1,
      column: 1
    },
    data: [{ source: null }],
    presentation: { title: '', notes: null }
  };
  const iframe = `[Add links](${widget.definition.url})`;
  nrWidget.data[0].source = iframe;
  // nrWidget.aditions = ['iframe'];
  return nrWidget;
}

export { ddIframeToNRIframe };
