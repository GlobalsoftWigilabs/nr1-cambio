import { CONVERTER_MAP } from './constants/converterMap';
import { RECURSIVE_TYPE } from './constants/recursivesTypes';
import { validateQuery } from '../../services/Dashboard/api';

/**
 * Dashboard Convert Function
 *
 * @param {Array} dashboards dashboards from DataDog
 * @param {Number} accountId User account
 * @return {Object}
 */
async function converterFuction(dashboards, accountId) {
  const dashboardsValidate = [];
  if (dashboards && dashboards instanceof Array) {
    for (let i = 0; i < dashboards.length; i++) {
      const widgets = await converterFuctionWidget(dashboards[i].data.widgets, accountId); // nrWidgets, totalWidgets
      const dashboard = {
        title: dashboards[i].data.title,
        grid_column_count: 12,
        percentage: widgets.totalWidgets,
        description: dashboards[i].data.description,
        icon: 'bar-chart',
        visibility: 'all',
        editable: 'editable_by_all',
        metadata: { version: 1 },
        widgets: widgets.nrWidgets
      };
      dashboardsValidate.push(dashboard);
    }
    return dashboardsValidate;
  }
  return dashboardsValidate;
}

async function validateNrql(widget, accountId) {
  if (widget && widget.data) {
    let validation = await validateQuery(accountId, widget.data[0].nrql);
    if (validation) {
      return true;
    }
  }
  return false;
}

/**
 * Widgets Convert Function
 *
 * @param {Array} widgets widgets from DataDog
 * @param {Number} account_id User account
 * @return {Object}
 */
async function converterFuctionWidget(widgets, account_id) {
  let totalWidgets = 0;
  const nrWidgets = [];
  if (widgets) {
    for (const widget of widgets) {
      try {
        if (
          CONVERTER_MAP[widget.definition.type] === undefined &&
          widget.definition.type !== RECURSIVE_TYPE
        ) {
          //In case the widget not have equivalent in new relic 
          const msg = `Can't convert Datadog widget of type ${widget.definition.type} into New Relic widget, it will be lost during this process `;
          throw msg;
        } else if (widget.definition.type === RECURSIVE_TYPE) {
          //In case the widget are grouped
          const nrWidgetsGrup = await converterFuctionWidgetGroup(
            widget.definition.widgets,
            account_id
          ); // nrWidgets, totalWidgets
          nrWidgetsGrup.nrWidgets.forEach(element => {
            nrWidgets.push(element);
          });
          totalWidgets += nrWidgetsGrup.totalWidgets;
        } else {
          //In case the widget can are translated
          const widgetType = CONVERTER_MAP[widget.definition.type];
          const converter = widgetType(widget);
          converter.account_id = account_id;
          totalWidgets++;
          if (converter.data) {
            if (converter.data[0].nrql) {
              if (await validateNrql(converter, account_id)) {
                nrWidgets.push(converter);
              }
            } else if (converter.data[0].source) {
              nrWidgets.push(converter);
            }
          } else {
            nrWidgets.push(converter);
          }
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        // console.log('ERROR', e);
      }
    }
    if (totalWidgets === 0) {
      return { nrWidgets, totalWidgets: 0 };
    } else {
      totalWidgets = (nrWidgets.length / totalWidgets) * 100;
      return { nrWidgets, totalWidgets };
    }
  } else {
    return {};
  }
}

/**
 * Widgets Group Convert Function
 *
 * @param {Array} widgets widgets from DataDog
 * @param {Number} account_id User account
 * @return {Object}
 */
async function converterFuctionWidgetGroup(widgets, account_id) {
  let totalWidgets = 0;
  const nrWidgets = [];
  if (widgets) {
    for (const widget of widgets) {
      try {
        if (
          CONVERTER_MAP[widget.definition.type] === undefined &&
          widget.definition.type !== RECURSIVE_TYPE
        ) {
          const msg = `Can't convert Datadog widget of type ${widget.definition.type} into New Relic widget, it will be lost during this process `;
          throw msg;
        } else {
          const widgetType = CONVERTER_MAP[widget.definition.type];
          const converter = widgetType(widget);
          converter.account_id = account_id;
          totalWidgets++;
          if (converter.data) {
            if (converter.data[0].nrql) {
              if (await validateNrql(converter, account_id)) {
                nrWidgets.push(converter);
              }
            } else if (converter.data[0].source) {
              nrWidgets.push(converter);
            }
          } else {
            nrWidgets.push(converter);
          }
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        // console.log('ERROR', e);
      }
    }
    return { nrWidgets, totalWidgets };
  } else {
    return {};
  }
}

export { converterFuction };