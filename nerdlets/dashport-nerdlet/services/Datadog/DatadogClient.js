import axios from 'axios';
const queryString = require('query-string');

class DatadogClient {
  constructor(apiKey, applicationKey, site, proxyUrl, reportLog) {
    this.apiKey = apiKey;
    this.applicationKey = applicationKey;
    this.site = site;
    this.proxyUrl = proxyUrl;
    this.reportLog = reportLog;
  }

  makeHeaders() {
    return {
      'Content-Type': 'application/json',
      'DD-API-KEY': this.apiKey,
      'DD-APPLICATION-KEY': this.applicationKey
    };
  }

  async callApi(req, reportLog, event = 'Fetch') {
    let ret = null;

    const options = {
      baseURL: `${this.proxyUrl}?https://api.datadoghq.${this.site}`,
      url: req.pathname,
      headers: this.makeHeaders(),
      method: req.method
    };
    if (req.params !== undefined) {
      options.url = `${options.url}?${queryString.stringify(req.params)}`;
    }

    ret = await axios(options).catch(async error => {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (error.response.status >= 400 && error.response.status <= 499) {
          const response = {
            message: error.response.data.errors
              ? error.response.data.errors[0]
              : `${error.response.status} - ${req.pathname}`,
            type: 'Warning',
            event: event,
            date: new Date().toLocaleString()
          };
          await reportLog(response);
        }
        if (error.response.status >= 500) {
          const response = {
            message: error.response.data.errors
              ? error.response.data.errors[0]
              : `${error.response.status} - ${req.pathname}`,
            type: 'Error',
            event: event,
            date: new Date().toLocaleString()
          };
          await reportLog(response);
          throw error;
        }
      } else if (error.request) {
        // The request was made but no response was received
      } else {
        // Something happened in setting up the request that triggered an Error
      }
    });
    return ret;
  }

  async getActiveMetricList(from, host = null) {
    const request = {
      pathname: '/api/v1/metrics',
      params: {
        from: from,
        host: host
      }
    };
    return this.callApi(request, this.reportLog).catch(err => {
      throw err;
    });
  }

  async getMetricMetadata(metricName) {
    const request = {
      pathname: `/api/v1/metrics/${metricName}`
    };
    return this.callApi(request, this.reportLog).catch(err => {
      throw err;
    });
  }

  async queryTimeSeriesPoints(from, to, query) {
    const request = {
      pathname: `/api/v1/query`,
      params: {
        from: from,
        to: to,
        query: query
      }
    };
    return this.callApi(request, this.reportLog).catch(err => {
      throw err;
    });
  }
}

export default DatadogClient;
