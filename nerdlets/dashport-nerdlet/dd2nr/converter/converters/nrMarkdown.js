import { NR_TYPE_MARKDOWN } from '../constants/newRelic';

/**
 * Transform Datadog's free text table widget to New Relic's free text table widget
 *
 * @param {*} widget
 * @return {*}
 */
function ddFreeTextToNRMarkdown(widget) {
  const nrWidget = {
    account_id: null,
    visualization: NR_TYPE_MARKDOWN,
    layout: { row: 1, column: 1, width: 1, height: 1 },
    data: [{ source: null }],
    presentation: { title: '', notes: null }
  };
  const text = `# ${widget.definition.text}`;
  nrWidget.data[0].source = text;

  return nrWidget;
}

/**
 * Transform Datadog's image table widget to New Relic's image table widget
 *
 * @param {*} widget
 * @return {*}
 */
function ddImageToNRMarkdown(widget) {
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
  const image = `![Add Images](${widget.definition.url})`;
  nrWidget.data[0].source = image;
  // nrWidget.aditions = ['image'];
  return nrWidget;
}

/**
 * Transform Datadog's note table widget to New Relic's note table widget
 *
 * @param {*} widget
 * @return {*}
 */
function ddNoteToNRMarkdown(widget) {
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
  const content = widget.definition.content;
  nrWidget.data[0].source = content;

  return nrWidget;
}

export { ddFreeTextToNRMarkdown, ddImageToNRMarkdown, ddNoteToNRMarkdown };
