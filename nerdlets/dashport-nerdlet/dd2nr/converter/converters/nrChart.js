import { translate } from '../../transpiler';
import {
  DD_DISPLAY_TYPE_TIMESERIES_LINE,
  DD_DISPLAY_TYPE_TIMESERIES_AREA
} from '../constants/dataDog';
import {
  NR_TYPE_FACET_TABLE,
  NR_TYPE_BILLBOARD,
  NR_TYPE_LINE_CHART,
  NR_TYPE_FACET_AREA_CHART,
  NR_TYPE_FACET_BAR_CHART,
  NR_TYPE_HEATMAP,
  NR_TYPE_HISTOGRAM,
  NR_TYPE_BILLBOARD_COMPARISON
} from '../constants/newRelic';

/**
 * Transform Datadog's query table widget to New Relic's query table widget
 *
 * @param {*} widget
 * @return {*}
 */
function ddQueryTableToNRChart(widget) {
  const nrWidget = {
    account_id: null,
    visualization: NR_TYPE_FACET_TABLE,
    layout: {
      width: 1,
      height: 1,
      row: 1,
      column: 1
    },
    data: [{ nrql: null }],
    presentation: { title: '', notes: null }
  };
  const ddQuery = widget.definition.requests[0].q;
  const ddTitle = widget.definition.title;
  try {
    const temTranslate = translate(ddQuery, null); // queryTranslated, getDDTokensMulti2
    nrWidget.data[0].nrql = temTranslate.queryTranslated;
    nrWidget.presentation.title = ddTitle;
    // if (temTranslate.getDDTokensMulti2.length > 0) {
    //   nrWidget.variables = temTranslate.getDDTokensMulti2;
    // }
    return nrWidget;
  } catch (error) {
    nrWidget.presentation.title = ddTitle;
    return nrWidget;
  }
}

/**
 * Transform Datadog's query value widget to New Relic's query value widget
 *
 * @param {*} widget
 * @return {*}
 */
function ddQueryValueToNRChart(widget) {
  const nrWidget = {
    account_id: null,
    visualization: NR_TYPE_BILLBOARD,
    layout: {
      width: 1,
      height: 1,
      row: 1,
      column: 1
    },
    data: [{ nrql: null }],
    presentation: { title: '', notes: null }
  };
  const ddQuery = widget.definition.requests[0].q;
  const ddTitle = widget.definition.title;
  try {
    const temTranslate = translate(ddQuery, null); // queryTranslated, getDDTokensMulti2
    nrWidget.data[0].nrql = temTranslate.queryTranslated;
    nrWidget.presentation.title = ddTitle;
    // if (temTranslate.getDDTokensMulti2.length > 0) {
    //   nrWidget.variables = temTranslate.getDDTokensMulti2;
    // }
    return nrWidget;
  } catch (error) {
    nrWidget.presentation.title = ddTitle;
    return nrWidget;
  }
}

/**
 * Transform Datadog's timeseries widget to New Relic's timeseries widget
 *
 * @param {*} widget
 * @return {*}
 */
function ddTimeseriesToNRChart(widget) {
  let nrWidget = {
    account_id: null,
    visualization: "line_chart",
    layout: {
      width: 1,
      height: 1,
      row: 1,
      column: 1
    },
    data: [{ nrql: null }],
    presentation: { title: '', notes: null }
  };
  if (widget.definition.requests) {
    switch (widget.definition.requests[0].display_type) {
      case DD_DISPLAY_TYPE_TIMESERIES_LINE:
        nrWidget = {
          account_id: null,
          visualization: NR_TYPE_LINE_CHART,
          layout: {
            width: 1,
            height: 1,
            row: 1,
            column: 1
          },
          data: [{ nrql: null }],
          presentation: { title: '', notes: null }
        };
        break;
      case DD_DISPLAY_TYPE_TIMESERIES_AREA:
        nrWidget = {
          account_id: null,
          visualization: NR_TYPE_FACET_AREA_CHART,
          layout: {
            width: 1,
            height: 1,
            row: 1,
            column: 1
          },
          data: [{ nrql: null }],
          presentation: { title: '', notes: null }
        };
        break;
    }
  }
  const ddQuery = widget.definition.requests[0].q;
  const ddTitle = widget.definition.title;
  try {
    let translation = translate(ddQuery, null);
    const temTranslate = [translation.queryTranslated, 'TIMESERIES'].join(' '); //queryTranslated , getDDTokensMulti2
    nrWidget.data[0].nrql = temTranslate;
    nrWidget.presentation.title = ddTitle;
    // if (temTranslate.getDDTokensMulti2.length > 0) {
    //   nrWidget.variables = temTranslate.getDDTokensMulti2;
    // }
    return nrWidget;
  } catch (error) {
    nrWidget.presentation.title = ddTitle;
    return nrWidget;
  }
}

/**
 * Transform Datadog's heatmap widget to New Relic's heatmap widget
 *
 * @param {*} widget
 * @return {*}
 */
function ddHeatmapToNRChart(widget) {
  const nrWidget = {
    account_id: null,
    visualization: NR_TYPE_HEATMAP,
    layout: {
      width: 1,
      height: 1,
      row: 1,
      column: 1
    },
    data: [{ nrql: null }],
    presentation: { title: '', notes: null }
  };
  const ddQuery = widget.definition.requests[0].q;
  const ddTitle = widget.definition.title;
  try {
    const temTranslate = translate(ddQuery, null); // queryTranslated, getDDTokensMulti2
    nrWidget.data[0].nrql = temTranslate.queryTranslated;
    nrWidget.presentation.title = ddTitle;
    // if (temTranslate.getDDTokensMulti2.length > 0) {
    //   nrWidget.variables = temTranslate.getDDTokensMulti2;
    // }
    return nrWidget;
  } catch (error) {
    nrWidget.presentation.title = ddTitle;
    return nrWidget;
  }
}

/**
 * Transform Datadog's distribution widget to New Relic's distribution widget
 *
 * @param {*} widget
 * @return {*}
 */
function ddDistributionToNRChart(widget) {
  const nrWidget = {
    account_id: null,
    visualization: NR_TYPE_HISTOGRAM,
    layout: {
      width: 1,
      height: 1,
      row: 1,
      column: 1
    },
    data: [{ nrql: null }],
    presentation: { title: '', notes: null }
  };
  const ddQuery = widget.definition.requests[0].q;
  const ddTitle = widget.definition.title;
  try {
    const temTranslate = translate(ddQuery, null); // queryTranslated, getDDTokensMulti2
    nrWidget.data[0].nrql = temTranslate.queryTranslated;
    nrWidget.presentation.title = ddTitle;
    // if (temTranslate.getDDTokensMulti2.length > 0) {
    //   nrWidget.variables = temTranslate.getDDTokensMulti2;
    // }
    return nrWidget;
  } catch (error) {
    nrWidget.presentation.title = ddTitle;
    return nrWidget;
  }
}

/**
 * Transform Datadog's TopList chart to New Relic's TopList chart.
 *
 * @param {*} widget
 * @return {*}
 */
function ddTopListToNRChart(widget) {
  const nrWidget = {
    account_id: null,
    visualization: NR_TYPE_FACET_BAR_CHART,
    layout: {
      width: 1,
      height: 1,
      row: 1,
      column: 1
    },
    data: [{ nrql: null }],
    presentation: { title: '', notes: null }
  };
  const ddQuery = widget.definition.requests[0].q;
  const ddTitle = widget.definition.title;
  try {
    const temTranslate = translate(ddQuery, null); // queryTranslated, getDDTokensMulti2
    nrWidget.data[0].nrql = temTranslate.queryTranslated;
    nrWidget.presentation.title = ddTitle;
    // if (temTranslate.getDDTokensMulti2.length > 0) {
    //   nrWidget.variables = temTranslate.getDDTokensMulti2;
    // }
    return nrWidget;
  } catch (error) {
    nrWidget.presentation.title = ddTitle;
    return nrWidget;
  }
}

/**
 * Transform Datadog's change widget to New Relic's change widget
 *
 * @param {*} widget
 * @return {*}
 */
function ddChangeToNRChart(widget) {
  const nrWidget = {
    account_id: null,
    visualization: NR_TYPE_BILLBOARD_COMPARISON,
    layout: {
      width: 1,
      height: 1,
      row: 1,
      column: 1
    },
    data: [{ nrql: null }],
    presentation: { title: '', notes: null }
  };
  const ddQuery = widget.definition.requests[0].q;
  const ddTitle = widget.definition.title;
  // const ddCompare = widget.definition.requests[0].compare_to;
  try {
    const temTranslate = translate(ddQuery, null); // queryTranslated, getDDTokensMulti2
    nrWidget.data[0].nrql = temTranslate.queryTranslated;
    // nrWidget.compare_to = ddCompare;
    nrWidget.presentation.title = ddTitle;
    // if (temTranslate.getDDTokensMulti2.length > 0) {
    //   nrWidget.variables = temTranslate.getDDTokensMulti2;
    // }
    return nrWidget;
  } catch (error) {
    nrWidget.presentation.title = ddTitle;
    return nrWidget;
  }
}

export {
  ddQueryTableToNRChart,
  ddQueryValueToNRChart,
  ddTimeseriesToNRChart,
  ddHeatmapToNRChart,
  ddDistributionToNRChart,
  ddTopListToNRChart,
  ddChangeToNRChart
};
