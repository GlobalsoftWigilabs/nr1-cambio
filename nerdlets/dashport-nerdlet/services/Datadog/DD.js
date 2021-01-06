import axios from 'axios';

import endpoints from './data/formatted_endpoints.json';
import cpanel from './data/cpanel.json';
import dashboardsList from './data/dashboards.json';
import metrics from './data/metrics.json';

const config = {
  API_KEY: null,
  APP_KEY: null,
  API_SITE: null
};
const ENABLE_LOAD_TEST = false;

const callApis = async (cfg, callbackDataWritter, reportLog, datadogService) => {
  if (ENABLE_LOAD_TEST) {
    const dashboardsData = loadDashboards(6, dashboardsList);
    const metricsData = loadDashboards(6, metrics.metrics);
    let cantidadWidgets = 0;
    for (const iterator of dashboardsData) {
      cantidadWidgets += iterator.data.widgets.length;
    }
    // await callbackDataWritter('Monitors meta', dashboardsList);
  } else {
    try {
      // configuracion de authenticacion
      config.API_KEY = cfg.DD_API_KEY;
      config.APP_KEY = cfg.DD_APP_KEY;
      config.API_SITE = cfg.DD_EU ? 'eu' : 'com';

      const from = Math.floor(new Date() / 1000) - 30 * 60;
      const metrics = await datadogService.fetchMetrics(from, 5,null);
      await callbackDataWritter('Get All Active Metrics', { metrics: metrics });

      const list = _getPartentList(endpoints);
      for (let i = 0; i < list.length; i++) {
        const obj = await _callApi(list[i], reportLog);
        // if obj is different of null
        if (obj) {
          if (list[i].name === 'Get all users') {
            //ROLES
            for (const user of obj.data.data) {             
              user.roles = [];
              for (const rolId of user.relationships.roles.data) {
                const role = obj.data.included.find(rolObj => rolObj.id === rolId.id);
                user.roles.push(role.attributes.name);
              }
              user.organizations = user.relationships.org.data.id;
            }
            //organizacion
            // for (const user of obj.data.data) {
            //   const userOr = await getOrganizationUser(user.id, reportLog);
            //   //obj 
            // }
            await callbackDataWritter(list[i].name, obj.data);
          } else if (list[i].name === 'Get Dashboards Manual') {
            for (let j = 0; j < obj.data.dashboard_lists.length; j++) {
              const response = await getManualDashboard(obj.data.dashboard_lists[j].id, reportLog);
              if (response) {
                obj.data.dashboard_lists[j].dashboards = response.data.dashboards;
              }
            }
            await callbackDataWritter(list[i].name, obj.data);
          } else if (list[i].name === 'Monitor Search') {
            // Ejecutar una serie de consultas para obtener todos los monitores
            const totalMonitors = obj.data.metadata.total_count;
            const monitorsPerPage = obj.data.metadata.per_page;
            if (totalMonitors > monitorsPerPage) {
              let numPages = Math.trunc(totalMonitors / monitorsPerPage) - 1;
              const resto = totalMonitors % monitorsPerPage;
              if (resto > 0) {
                numPages++;
              }
              const countData = {
                metadata: obj.data.metadata,
                countsType: obj.data.counts.type,
                totalPages: numPages
              };
              await callbackDataWritter('Monitors meta', countData);
              const monitors = [];
              for (let pag = 0; pag <= numPages; pag++) {
                const resultado = await getMonitorsPage(list[i], pag, reportLog);
                monitors.push(resultado.data);
              }
              for (const monitor of monitors) {
                const responseDetailsMonitorPages = await getMonitorDetails(monitor.id, reportLog);
                monitor.created = responseDetailsMonitorPages.data.created;
                monitor.aggregation = responseDetailsMonitorPages.data.options.aggregation ? responseDetailsMonitorPages.data.options.aggregation : null;
                monitor.evaluation_delay = responseDetailsMonitorPages.data.options.evaluation_delay ? responseDetailsMonitorPages.data.options.evaluation_delay : null;
                monitor.new_host_delay = responseDetailsMonitorPages.data.options.new_host_delay ? responseDetailsMonitorPages.data.options.new_host_delay : null;
                monitor.no_data_timeframe = responseDetailsMonitorPages.data.options.no_data_timeframe ? responseDetailsMonitorPages.data.options.no_data_timeframe : null;
                monitor.notify_audit = responseDetailsMonitorPages.data.options.notify_audit ? responseDetailsMonitorPages.data.options.notify_audit : null;
                monitor.notify_no_data = responseDetailsMonitorPages.data.options.notify_no_data ? responseDetailsMonitorPages.data.options.notify_no_data : null;
                monitor.thresholds = responseDetailsMonitorPages.data.options.thresholds ? responseDetailsMonitorPages.data.options.thresholds : null;
                monitor.min_location_failed = responseDetailsMonitorPages.data.options.min_location_failed ? responseDetailsMonitorPages.data.options.min_location_failed : null;
                monitor.min_failure_duration = responseDetailsMonitorPages.data.options.min_failure_duration ? responseDetailsMonitorPages.data.options.min_failure_duration : null;
                monitor.message = responseDetailsMonitorPages.data.message;
                monitor.multi = responseDetailsMonitorPages.data.multi;
              }
              await callbackDataWritter(`Monitor Search Pages`, monitors);
            } else {
              const countData = {
                metadata: obj.data.metadata,
                countsType: obj.data.counts.type,
                totalPages: 0
              };
              for (const monitor of obj.data.monitors) {
                const responseDetailsMonitor = await getMonitorDetails(monitor.id, reportLog);
                monitor.created = responseDetailsMonitor.data.created;
                monitor.aggregation = responseDetailsMonitor.data.options.aggregation ? responseDetailsMonitor.data.options.aggregation : null;
                monitor.evaluation_delay = responseDetailsMonitor.data.options.evaluation_delay ? responseDetailsMonitor.data.options.evaluation_delay : null;
                monitor.new_host_delay = responseDetailsMonitor.data.options.new_host_delay ? responseDetailsMonitor.data.options.new_host_delay : null;
                monitor.no_data_timeframe = responseDetailsMonitor.data.options.no_data_timeframe ? responseDetailsMonitor.data.options.no_data_timeframe : null;
                monitor.notify_audit = responseDetailsMonitor.data.options.notify_audit ? responseDetailsMonitor.data.options.notify_audit : null;
                monitor.notify_no_data = responseDetailsMonitor.data.options.notify_no_data ? responseDetailsMonitor.data.options.notify_no_data : null;
                monitor.thresholds = responseDetailsMonitor.data.options.thresholds ? responseDetailsMonitor.data.options.thresholds : null;
                monitor.min_location_failed = responseDetailsMonitor.data.options.min_location_failed ? responseDetailsMonitor.data.options.min_location_failed : null;
                monitor.min_failure_duration = responseDetailsMonitor.data.options.min_failure_duration ? responseDetailsMonitor.data.options.min_failure_duration : null;
                monitor.message = responseDetailsMonitor.data.message;
                monitor.multi = responseDetailsMonitor.data.multi;
              }
              await callbackDataWritter('Monitors meta', countData);
              await callbackDataWritter(
                'Monitor Search Pages',
                obj.data.monitors
              );
            }
          } else if (list[i].name === 'Search hosts') {
            const totalHost = obj.data.total_matching;
            const hostPerPage = 1000;
            let numPagesHost = Math.trunc(totalHost / hostPerPage);
            const restoHost = totalHost % hostPerPage;
            if (restoHost > 0) {
              numPagesHost++;
            }
            const hostList = [];
            let initial = 0;
            for (let pag = 0; pag < numPagesHost; pag++) {
              const resultadoHost = await getHosPage(
                list[i],
                initial,
                1000,
                reportLog
              );
              if (resultadoHost.data) {
                resultadoHost.data.host_list.map(host => hostList.push(host));
              }
              initial += 1000;
            }
            if (obj) {
              obj.data.host_list = hostList;
            }
            await callbackDataWritter(list[i].name, obj.data);
          } else {
            await callbackDataWritter(list[i].name, obj.data);
          }
          const childList = _getChildsApi(endpoints, list[i].name);
          if (childList) {
            for (let i = 0; i < childList.length; i++) {
              const setup = cpanel.find(cp => cp.name === childList[i].name);
              const objList = setup.parent_obj
                ? obj.data[setup.parent_obj]
                : obj.data;
              const childCollection = {
                name: childList[i].name,
                data: []
              };

              for (let j = 0; j < objList.length; j++) {
                const objInfo = {
                  name: childList[i].name,
                  url: childList[i].url,
                  proto: childList[i].proto,
                  host: childList[i].host,
                  pathname: setup.variable
                    ? childList[i].pathname.replace(
                      setup.variable,
                      objList[j][setup.parent_value]
                    )
                    : childList[i].pathname,
                  search: setup.query_filtering
                    ? _filterQueryParams(
                      childList[i].search,
                      setup.query_filtering
                    )
                    : childList[i].search,
                  headers: childList[i].headers
                };

                const objChild = await _callApi(objInfo);

                if (objChild) {
                  childCollection.data.push({
                    id: objList[j][setup.parent_value],
                    data: objChild.data
                  });
                }
              }
              await callbackDataWritter(
                childCollection.name,
                childCollection.data
              );
            }
          }
        }
      }
    } catch (err) {
      const response = {
        message: err,
        type: 'Error',
        event: 'Call apis',
        date: new Date().toLocaleString()
      };
      reportLog(response);
    }
    return new Date();
  }
  return new Date();
};

const _callApi = async (info, reportLog) => {
  let ret = null;

  const end_ts = Math.floor(new Date() / 1000);
  const start_ts = end_ts - 60 * 60;

  const proxyUrl = 'https://long-meadow-1713.rsamanez.workers.dev/?';
  const options = {
    baseURL: `${proxyUrl + info.proto}://${info.host.replace(
      '{{datadog_site}}',
      config.API_SITE
    )}`,
    url:
      info.pathname +
      info.search.replace('{{from_ts}}', start_ts).replace('{{to_ts}}', end_ts),
    headers: _setHttpHeaders(info.headers),
    method: 'get'
  };
  ret = await axios(options).catch(async error => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      if (error.response.status >= 400 && error.response.status <= 499) {
        const response = {
          message: error.response.data.errors
            ? error.response.data.errors[0]
            : `${error.response.status} - ${info.pathname}`,
          type: 'Warning',
          event: 'Fetch',
          date: new Date().toLocaleString()
        };
        await reportLog(response);
      }
      if (error.response.status >= 500) {
        const response = {
          message: error.response.data.errors
            ? error.response.data.errors[0]
            : `${error.response.status} - ${info.pathname}`,
          type: 'Error',
          event: 'Fetch',
          date: new Date().toLocaleString()
        };
        await reportLog(response);
      }
    } else if (error.request) {
      // The request was made but no response was received
    } else {
      // Something happened in setting up the request that triggered an Error
    }
  });
  return ret;
};

const _setHttpHeaders = obj => {
  const headers = {};
  for (let i = 0; i < obj.length; i++) {
    headers[obj[i].key] = obj[i].value
      .replace('{{datadog_api_key}}', config.API_KEY)
      .replace('{{datadog_application_key}}', config.APP_KEY);
  }
  return headers;
};

const _getChildsApi = (list, parentName) => {
  const filteredList = [];

  const childs = cpanel
    .filter(ep => ep.enable && ep.parent === parentName)
    .map(ep => ep.name);

  for (let i = 0; i < list.length; i++) {
    if (childs.indexOf(list[i].name) !== -1) {
      filteredList.push(list[i]);
    }
  }
  return filteredList;
};

const _getPartentList = list => {
  const filteredList = [];

  const parents = cpanel.filter(ep => ep.enable && ep.parent === undefined);

  for (let i = 0; i < list.length; i++) {
    const cfg = parents.find(cfg => cfg.name === list[i].name);
    if (cfg) {
      if (cfg.query_filtering) {
        list[i].search = _filterQueryParams(
          list[i].search,
          cfg.query_filtering
        );
      }
      filteredList.push(list[i]);
    }
  }

  return filteredList;
};

const _filterQueryParams = (queryString, filter) => {
  return queryString.replace(filter, '');
};

/**
 * Method that validate the keys on Datadog
 *
 * @param {String} apikey API key
 * @param {String} appKey Application key
 * @returns bool
 */
const validateKeys = async (apikey, appkey) => {
  const validation = {
    apikey: false,
    appkey: false
  };
  let options = {
    baseURL:
      'https://long-meadow-1713.rsamanez.workers.dev/?https://api.datadoghq.com',
    headers: {
      'DD-API-KEY': apikey
    },
    method: 'get',
    url: '/api/v1/validate'
  };
  await axios(options)
    .then(() => {
      validation.apikey = true;
    })
    .catch(() => {
      validation.apikey = false;
    });
  options = {
    baseURL:
      'https://long-meadow-1713.rsamanez.workers.dev/?https://api.datadoghq.com',
    headers: {
      'Content-Type': 'application/json',
      'DD-API-KEY': apikey,
      'DD-APPLICATION-KEY': appkey
    },
    method: 'get',
    url: '/api/v1/application_key'
  };
  await axios(options)
    .then(() => {
      validation.appkey = true;
    })
    .catch(() => {
      validation.appkey = false;
    });
  return validation;
};

const getMonitorsPage = async (info, page, reportLog) => {
  const proxyUrl = 'https://long-meadow-1713.rsamanez.workers.dev/?';
  let ret = null;
  const options = {
    baseURL: `${proxyUrl + info.proto}://${info.host.replace(
      '{{datadog_site}}',
      config.API_SITE
    )}`,
    url: `${info.pathname}?`,
    headers: _setHttpHeaders(info.headers),
    method: 'get',
    params: {
      page: page
    }
  };
  ret = await axios(options).catch(async error => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      if (error.response.status >= 400 && error.response.status <= 499) {
        const response = {
          message: error.response.data.errors
            ? error.response.data.errors[0]
            : `${error.response.status} - ${info.pathname}`,
          type: 'Warning',
          event: 'Fetch',
          date: new Date().toLocaleString()
        };
        await reportLog(response);
      }
      if (error.response.status >= 500) {
        const response = {
          message: error.response.data.errors
            ? error.response.data.errors[0]
            : `${error.response.status} - ${info.pathname}`,
          type: 'Error',
          event: 'Fetch',
          date: new Date().toLocaleString()
        };
        await reportLog(response);
      }
    } else if (error.request) {
      // The request was made but no response was received
    } else {
      // Something happened in setting up the request that triggered an Error
    }
  });
  return ret;
};
const getManualDashboard = async (id, reportLog) => {
  const proxyUrl = 'https://long-meadow-1713.rsamanez.workers.dev/?';
  let ret = null;
  let endpoint = "https://api.datadoghq.{{datadog_site}}/api/v2/dashboard/lists/manual/{{id}}/dashboards"
  endpoint = endpoint.replace('{{id}}', id)
  const headers = [
    {
      "key": "Content-Type",
      "value": "application/json"
    },
    {
      "key": "DD-API-KEY",
      "value": "{{datadog_api_key}}"
    },
    {
      "key": "DD-APPLICATION-KEY",
      "value": "{{datadog_application_key}}"
    }
  ]
  const options = {
    baseURL: `${proxyUrl}${endpoint.replace(
      '{{datadog_site}}',
      config.API_SITE
    )}`,
    headers: _setHttpHeaders(headers),
    method: 'get',
  };
  ret = await axios(options).catch(async error => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.log(error.response)
        ; if (error.response.status >= 400 && error.response.status <= 499) {
          const response = {
            message: error.response.data.errors
              ? error.response.data.errors[0]
              : `${error.response.status} - ${info.pathname}`,
            type: 'Warning',
            event: 'Fetch',
            date: new Date().toLocaleString()
          };
          await reportLog(response);
        }
      if (error.response.status >= 500) {
        const response = {
          message: error.response.data.errors
            ? error.response.data.errors[0]
            : `${error.response.status} - ${info.pathname}`,
          type: 'Error',
          event: 'Fetch',
          date: new Date().toLocaleString()
        };
        await reportLog(response);
      }
    } else if (error.request) {
      // The request was made but no response was received
    } else {
      // Something happened in setting up the request that triggered an Error
    }
  });
  return ret;
};

const getOrganizationUser = async (id, reportLog) => {
  const proxyUrl = 'https://long-meadow-1713.rsamanez.workers.dev/?';
  let ret = null;
  let endpoint = "https://api.datadoghq.{{datadog_site}}/api/v2/users/{{id}}/orgs"
  endpoint = endpoint.replace('{{id}}', id)
  const headers = [
    {
      "key": "Content-Type",
      "value": "application/json"
    },
    {
      "key": "DD-API-KEY",
      "value": "{{datadog_api_key}}"
    },
    {
      "key": "DD-APPLICATION-KEY",
      "value": "{{datadog_application_key}}"
    }
  ]
  const options = {
    baseURL: `${proxyUrl}${endpoint.replace(
      '{{datadog_site}}',
      config.API_SITE
    )}`,
    headers: _setHttpHeaders(headers),
    method: 'get',
  };
  ret = await axios(options).catch(async error => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.log(error.response)
        ; if (error.response.status >= 400 && error.response.status <= 499) {
          const response = {
            message: error.response.data.errors
              ? error.response.data.errors[0]
              : `${error.response.status} - ${info.pathname}`,
            type: 'Warning',
            event: 'Fetch',
            date: new Date().toLocaleString()
          };
          await reportLog(response);
        }
      if (error.response.status >= 500) {
        const response = {
          message: error.response.data.errors
            ? error.response.data.errors[0]
            : `${error.response.status} - ${info.pathname}`,
          type: 'Error',
          event: 'Fetch',
          date: new Date().toLocaleString()
        };
        await reportLog(response);
      }
    } else if (error.request) {
      // The request was made but no response was received
    } else {
      // Something happened in setting up the request that triggered an Error
    }
  });
  return ret;
};

const getMonitorDetails = async (id, reportLog) => {
  const proxyUrl = 'https://long-meadow-1713.rsamanez.workers.dev/?';
  let ret = null;
  let endpoint = "https://api.datadoghq.com/api/v1/monitor/{{monitor_id}}"
  endpoint = endpoint.replace('{{monitor_id}}', id);
  const headers = [
    {
      "key": "Content-Type",
      "value": "application/json"
    },
    {
      "key": "DD-API-KEY",
      "value": "{{datadog_api_key}}"
    },
    {
      "key": "DD-APPLICATION-KEY",
      "value": "{{datadog_application_key}}"
    }
  ]
  const options = {
    baseURL: `${proxyUrl}${endpoint.replace(
      '{{datadog_site}}',
      config.API_SITE
    )}`,
    headers: _setHttpHeaders(headers),
    method: 'get'
  };
  ret = await axios(options).catch(async error => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      if (error.response.status >= 400 && error.response.status <= 499) {
        const response = {
          message: error.response.data.errors
            ? error.response.data.errors[0]
            : `${error.response.status} - ${info.pathname}`,
          type: 'Warning',
          event: 'Fetch',
          date: new Date().toLocaleString()
        };
        await reportLog(response);
      }
      if (error.response.status >= 500) {
        const response = {
          message: error.response.data.errors
            ? error.response.data.errors[0]
            : `${error.response.status} - ${info.pathname}`,
          type: 'Error',
          event: 'Fetch',
          date: new Date().toLocaleString()
        };
        await reportLog(response);
      }
    } else if (error.request) {
      // The request was made but no response was received
    } else {
      // Something happened in setting up the request that triggered an Error
    }
  });
  return ret;
};
const getMetricDetails = async (metricName, reportLog) => {
  const proxyUrl = 'https://long-meadow-1713.rsamanez.workers.dev/?';
  let ret = null;
  let endpoint = "https://api.datadoghq.com/api/v1/metrics/{metric_name}"
  endpoint = endpoint.replace('{metric_name}', metricName);
  const headers = [
    {
      "key": "Content-Type",
      "value": "application/json"
    },
    {
      "key": "DD-API-KEY",
      "value": "{{datadog_api_key}}"
    },
    {
      "key": "DD-APPLICATION-KEY",
      "value": "{{datadog_application_key}}"
    }
  ]
  const options = {
    baseURL: `${proxyUrl}${endpoint.replace(
      '{{datadog_site}}',
      config.API_SITE
    )}`,
    headers: _setHttpHeaders(headers),
    method: 'get'
  };
  ret = await axios(options).catch(async error => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      if (error.response.status >= 400 && error.response.status <= 499) {
        const response = {
          message: error.response.data.errors
            ? error.response.data.errors[0]
            : `${error.response.status} - ${info.pathname}`,
          type: 'Warning',
          event: 'Fetch',
          date: new Date().toLocaleString()
        };
        await reportLog(response);
      }
      if (error.response.status >= 500) {
        const response = {
          message: error.response.data.errors
            ? error.response.data.errors[0]
            : `${error.response.status} - ${info.pathname}`,
          type: 'Error',
          event: 'Fetch',
          date: new Date().toLocaleString()
        };
        await reportLog(response);
      }
    } else if (error.request) {
      // The request was made but no response was received
    } else {
      // Something happened in setting up the request that triggered an Error
    }
  });
  return ret;
};

const loadDashboards = (numberRepition, source) => {
  let data = [];
  for (let i = 0; i < numberRepition; i++) {
    data = data.concat(source);
  }
  return data;
}

const getHosPage = async (info, start, count, reportLog) => {
  const proxyUrl = 'https://long-meadow-1713.rsamanez.workers.dev/?';
  let ret = null;
  const options = {
    baseURL: `${proxyUrl + info.proto}://${info.host.replace(
      '{{datadog_site}}',
      config.API_SITE
    )}`,
    url: `${info.pathname}?`,
    headers: _setHttpHeaders(info.headers),
    method: 'get',
    params: {
      start: start,
      count: count
    }
  };
  ret = await axios(options).catch(async error => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      if (error.response.status >= 400 && error.response.status <= 499) {
        const response = {
          message: error.response.data.errors
            ? error.response.data.errors[0]
            : `${error.response.status} - ${info.pathname}`,
          type: 'Warning',
          event: 'Fetch',
          date: new Date().toLocaleString()
        };
        await reportLog(response);
      }
      if (error.response.status >= 500) {
        const response = {
          message: error.response.data.errors
            ? error.response.data.errors[0]
            : `${error.response.status} - ${info.pathname}`,
          type: 'Error',
          event: 'Fetch',
          date: new Date().toLocaleString()
        };
        await reportLog(response);
      }
    } else if (error.request) {
      // The request was made but no response was received
    } else {
      // Something happened in setting up the request that triggered an Error
    }
  });
  return ret;
};

export {
  callApis,
  validateKeys,
  _callApi,
  _setHttpHeaders,
  _getChildsApi,
  _getPartentList,
  _filterQueryParams,
  getMonitorsPage,
  loadDashboards,
  getHosPage
};
