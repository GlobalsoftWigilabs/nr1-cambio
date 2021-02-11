/* eslint-disable react/no-deprecated */
import React from 'react';
// Containers
import Menu from './Menu/Menu';
import Setup from './SetUp/Setup';
import Dashboard from './Dashboard/Dashboard.js';
import Monitors from './Monitors/Monitors';
import Infrastructure from './Infraestructure/Infrastructure';
import Synthetics from './Synthetics/Synthetics';
import Logs from './Logs/Logs';
import Metrics from './Metrics/Metrics';

// services
import {
  deleteSetup,
  loadAccountId,
  readNerdStorage,
  readNerdStorageOnlyCollection,
  writeNerdStorageReturnData,
  writeNerdStorage,
  writeSecretKey,
  readSingleSecretKey
} from '../services/NerdStorage/api';
import { sendLogsSlack } from '../services/Wigilabs/api';
import * as DD from '../services/Datadog/DD';
import * as DS from '../services/Datadog/DS';
import DatadogClient from '../services/Datadog/DatadogClient';
import DatadogService from '../services/Datadog/DatadogService';
import { Spinner, Toast } from 'nr1';

/**
 * Class that render de content
 *
 * @export
 * @class App
 * @extends {React.PureComponent}
 */
export default class App extends React.PureComponent {
  /**
   * Constructor for the class
   *
   * @param {array} props
   * @memberof App
   */
  constructor(props) {
    super(props);
    this.state = {
      // CONFIGURATION
      accountId: null,
      apiserver: '',
      apikey: '',
      apikeyS: '***',
      appkeyS: '***',
      appkey: '',
      setupComplete: false,
      lastUpdate: '',
      selectedMenu: 0,
      loadingContent: true,
      writingSetup: false,
      fetchingData: false,
      hasErrorFetch: false,
      // DASHBOARDS
      dataDashboards: [],
      emptyData: false,
      // MONITORS
      monitorsTotal: 0,
      monitorsGraph: [
        { name: 'Host', uv: 0, pv: 0 },
        { name: 'Metric', uv: 0, pv: 0 },
        { name: 'Anomaly', uv: 0, pv: 0 },
        { name: 'Outlier', uv: 0, pv: 0 }
      ],
      monitorsData: [],
      // INFRASTRUCTURE
      infrastructureDataGraph: [],
      infraestructureList: [],
      totalActive: 0,
      total: 0,
      // LOGS
      logsData: {
        archives: [],
        pipelines: [],
        metrics: [],
        archivesStatus: 0,
        pipelinesStatus: 0,
        metricsStatus: 0
      },
      // Metrics
      metrics: [],
      fetchingMetrics: false,
      progressMetrics: 0,
      errorMetric: false,
      historyUpdateMetric: null,
      // SYNTHETICS
      testTotal: 0,
      testList: [],
      // LogsDashport
      logs: [],
      completed: 0,
      deleteSetup: false,
      datadogService: null
    };
  }

  /**
   * Method called when the component was mounted
   *
   * @memberof App
   */
  componentWillMount() {
    this.setState({ loadingContent: true });
    this.loadAccount();
  }

  /**
   * Method that changes the selected option in menu
   *
   * @param {number} value
   * @memberof App
   */
  handleChangeMenu = value => {
    const { fetchingData, deleteSetup } = this.state;
    if (fetchingData) {
      Toast.showToast({
        title: 'WAIT..',
        description: 'Please wait until the search is over',
        type: Toast.TYPE.NORMAL
      });
    } else if (deleteSetup) {
      Toast.showToast({
        title: 'WAIT..',
        description: 'Please wait delete data',
        type: Toast.TYPE.NORMAL
      });
    } else {
      this.setState({ selectedMenu: value });
    }
  };

  /**
   * Method that change progress when fetching metrics is active
   *
   * @memberof App
   */
  updateProgressMetrics = value => {
    value = parseInt(value);
    this.setState({ progressMetrics: value });
  };

  /**
   * Method that change the selected menu from other component
   *
   * @param {number} value
   * @memberof App
   */
  ChangeMenuExternal = value => {
    this.setState({ selectedMenu: value });
  };

  /**
   * Method that instance datadog service for fetch metrics
   *
   * @param {*} keyApi
   * @param {*} keyApp
   * @returns
   * @memberof App
   */
  createDatadogServiceInstance(keyApi, keyApp, region) {
    const datadogClient = new DatadogClient(
      keyApi,
      keyApp,
      region,
      this.reportLogFetch
    );
    return new DatadogService(datadogClient);
  }

  /**
   * Method that load from NerdStorage the information from account
   *
   * @memberof App
   */
  async loadAccount() {
    const accountId = await loadAccountId();
    this.setState({ accountId });
    const dataSetup = await readNerdStorage(
      accountId,
      'setup',
      'datadog',
      this.reportLogFetch
    );
    if (dataSetup) {
      let retrys = 0;
      let keyApi = null;
      let keyApp = null;
      const keysName = ['apikey', 'appkey'];
      while (retrys !== 5) {
        if (!keyApi) keyApi = await readSingleSecretKey(keysName[0]);

        if (!keyApp) keyApp = await readSingleSecretKey(keysName[1]);

        if (keyApi && keyApp) {
          retrys = 5;
        } else {
          retrys += 1;
        }
      }
      if (keyApi && keyApp) {
        const datadogService = this.createDatadogServiceInstance(
          keyApi,
          keyApp,
          dataSetup.apiserver
        );

        this.setState({
          setupComplete: true,
          apikey: keyApi,
          apikeyS: dataSetup.apikeyS,
          appkey: keyApp,
          appkeyS: dataSetup.appkeyS,
          apiserver: dataSetup.apiserver,
          datadogService: datadogService
        });
        const dateFetch = await readNerdStorage(
          accountId,
          'ddFetch',
          'dateFetch',
          this.reportLogFetch
        );
        await this.loadViewData();
        if (dateFetch !== null) {
          this.setState({
            lastUpdate: dateFetch.lastUpdate
          });
        } else {
          this.setState({ lastUpdate: 'never' });
        }
      } else {
        this.setState({ selectedMenu: 0 });
      }
    }
    this.setState({ loadingContent: false });
  }

  /**
   * Method that loads the data from NerdStorage
   * @memberof App
   */
  async loadViewData() {
    const { accountId, fetchingData } = this.state;
    // DASHBOARDS
    try {
      const list = [];
      let emptyData = false;
      const sizeList = await readNerdStorageOnlyCollection(
        accountId,
        'dashboards',
        this.reportLogFetch
      );
      for (let i = 0; i < sizeList.length - 1; i++) {
        const page = await readNerdStorage(
          accountId,
          'dashboards',
          `dashboards-${i}`,
          this.reportLogFetch
        );
        if (page) {
          for (const iterator of page) {
            list.push(iterator);
          }
        }
      }
      const dashboardObj = await readNerdStorage(
        accountId,
        'dashboards',
        `dashboards-obj`,
        this.reportLogFetch
      );
      if (dashboardObj && dashboardObj.status === 'EMPTY') {
        emptyData = true;
      }
      if (fetchingData) {
        this.updateProgressFetch(5);
      }
      this.setState({
        dataDashboards: list,
        emptyData
      });
    } catch (err) {
      const response = {
        message: err.message,
        type: 'Error',
        event: `Recove dashboards data`,
        date: new Date().toLocaleString()
      };
      this.reportLogFetch(response);
    }
    // ALERTS
    try {
      const data = await readNerdStorage(
        accountId,
        'monitors',
        'monitors-obj',
        this.reportLogFetch
      );
      if (data) {
        const sizeMonitors = await readNerdStorageOnlyCollection(
          accountId,
          'monitors-monitors',
          this.reportLogFetch
        );
        const listMonitors = [];
        for (let i = 0; i < sizeMonitors.length; i++) {
          let page = [];
          page = await readNerdStorage(
            accountId,
            'monitors-monitors',
            `monitors-${i}`,
            this.reportLogFetch
          );
          for (const iterator of page) {
            listMonitors.push(iterator);
          }
        }
        const sizeTypes = await readNerdStorageOnlyCollection(
          accountId,
          'monitors-types',
          this.reportLogFetch
        );
        const listTypes = [];
        for (let i = 0; i < sizeTypes.length; i++) {
          let page = [];
          page = await readNerdStorage(
            accountId,
            'monitors-types',
            `monitors-${i}`,
            this.reportLogFetch
          );
          for (const iterator of page) {
            listTypes.push(iterator);
          }
        }
        data.data.type = listTypes;
        data.data.monitors = listMonitors;
        let total = 0;
        for (const iterator of data.data.type) {
          total += iterator.count;
        }
        data.data.total = total;
        const monitorsGraph = [];
        for (const monitor of data.data.monitors) {
          const index = monitorsGraph.findIndex(
            element => element.name === monitor.type
          );
          if (index !== -1) {
            monitorsGraph[index].uv = monitorsGraph[index].uv + 1;
          } else {
            monitorsGraph.push({
              name: monitor.type,
              pv: data.data.monitors.length,
              uv: 1
            });
          }
        }

        this.setState({
          monitorsTotal: data.data.total,
          monitorsGraph: monitorsGraph,
          monitorsData: data.data.monitors
        });
      }
      if (fetchingData) {
        this.updateProgressFetch(5);
      }
    } catch (err) {
      const response = {
        message: err.message,
        type: 'Error',
        event: `Recove alerts data`,
        date: new Date().toLocaleString()
      };
      this.reportLogFetch(response);
    }
    // INFRASTRUCTURE
    try {
      const infraestructureObj = await readNerdStorage(
        accountId,
        'infraestructure',
        'infraestructure-obj',
        this.reportLogFetch
      );
      if (infraestructureObj) {
        const sizeInfraestructure = await readNerdStorageOnlyCollection(
          accountId,
          'infraestructure',
          this.reportLogFetch
        );
        const hostList = [];
        for (let i = 0; i < sizeInfraestructure.length - 1; i++) {
          let page = [];
          page = await readNerdStorage(
            accountId,
            'infraestructure',
            `infraestructure-${i}`,
            this.reportLogFetch
          );
          for (const iterator of page) {
            hostList.push(iterator);
          }
        }
        const sizeTypes = await readNerdStorageOnlyCollection(
          accountId,
          'infraestructure-types',
          this.reportLogFetch
        );
        const types = [];
        for (let i = 0; i < sizeTypes.length; i++) {
          let page = [];
          page = await readNerdStorage(
            accountId,
            'infraestructure-types',
            `infraestructure-types-${i}`,
            this.reportLogFetch
          );
          for (const iterator of page) {
            types.push(iterator);
          }
        }
        const { total, totalActive } = infraestructureObj.data;
        const hostsData = [];
        for (const type of types) {
          hostsData.push({
            name: type.platform,
            uv: Math.abs(type.count),
            pv: Math.abs(total - type.count)
          });
        }
        this.setState({
          infrastructureDataGraph: hostsData,
          infraestructureList: hostList,
          totalActive,
          total
        });
      }
      if (fetchingData) {
        this.updateProgressFetch(5);
      }
    } catch (err) {
      const response = {
        message: err.message,
        type: 'Error',
        event: `Recove infraestructure data`,
        date: new Date().toLocaleString()
      };
      this.reportLogFetch(response);
    }
    // LOGS
    try {
      const archivesStatus = await readNerdStorage(
        accountId,
        'logs',
        'logs-archives-obj',
        this.reportLogFetch
      );
      const sizeArchives = await readNerdStorageOnlyCollection(
        accountId,
        'logs-archives',
        this.reportLogFetch
      );
      const archives = [];
      for (let i = 0; i < sizeArchives.length; i++) {
        let page = [];
        page = await readNerdStorage(
          accountId,
          'logs-archives',
          `logs-archives-${i}`,
          this.reportLogFetch
        );
        for (const iterator of page) {
          archives.push(iterator);
        }
      }
      // metric log
      const metricsStatus = await readNerdStorage(
        accountId,
        'logs',
        'logs-metrics-obj',
        this.reportLogFetch
      );
      const sizeMetricLog = await readNerdStorageOnlyCollection(
        accountId,
        'logs-metrics',
        this.reportLogFetch
      );
      const metricsLogs = [];
      for (let i = 0; i < sizeMetricLog.length; i++) {
        let page = [];
        page = await readNerdStorage(
          accountId,
          'logs-metrics',
          `logs-metrics-${i}`,
          this.reportLogFetch
        );
        for (const iterator of page) {
          metricsLogs.push(iterator);
        }
      }
      // Pipelines
      const pipelinesStatus = await readNerdStorage(
        accountId,
        'logs',
        'logs-pipelines-obj',
        this.reportLogFetch
      );
      const sizePipelines = await readNerdStorageOnlyCollection(
        accountId,
        'logs-pipelines',
        this.reportLogFetch
      );
      const pipelines = [];
      for (let i = 0; i < sizePipelines.length; i++) {
        let page = [];
        page = await readNerdStorage(
          accountId,
          'logs-pipelines',
          `logs-pipelines-${i}`,
          this.reportLogFetch
        );
        for (const iterator of page) {
          pipelines.push(iterator);
        }
      }
      this.setState({
        logsData: {
          metrics: metricsLogs,
          archives: archives,
          pipelines: pipelines,
          archivesStatus,
          pipelinesStatus,
          metricsStatus
        }
      });
      if (fetchingData) {
        this.updateProgressFetch(5);
      }
    } catch (err) {
      const response = {
        message: err.message,
        type: 'Error',
        event: `Recove logs data`,
        date: new Date().toLocaleString()
      };
      this.reportLogFetch(response);
    }
    // METRICS
    try {
      const metrics = await readNerdStorage(
        accountId,
        'metrics',
        'metrics-obj',
        this.reportLogFetch
      );
      if (metrics) {
        const sizeMetrics = await readNerdStorageOnlyCollection(
          accountId,
          'metrics',
          this.reportLogFetch
        );
        const listMetrics = [];
        for (let j = 0; j < sizeMetrics.length - 1; j++) {
          let page = [];
          page = await readNerdStorage(
            accountId,
            'metrics',
            `metrics-${j}`,
            this.reportLogFetch
          );
          for (const iterator of page) {
            listMetrics.push(iterator);
          }
        }
        let historyUpdateMetric = await readNerdStorage(
          accountId,
          'metricsUpdate',
          'metricsUpdate',
          this.reportLogFetch
        );
        if (
          historyUpdateMetric &&
          Object.entries(historyUpdateMetric).length === 0
        )
          historyUpdateMetric = null;
        metrics.data = listMetrics;
        this.setState({
          metrics: metrics.data,
          historyUpdateMetric
        });
      }
      if (fetchingData) {
        this.updateProgressFetch(5);
      }
    } catch (err) {
      const response = {
        message: err.message,
        type: 'Error',
        event: `Recove metrics data`,
        date: new Date().toLocaleString()
      };
      this.reportLogFetch(response);
    }
    // SYNTHETICS
    try {
      const synthetics = await readNerdStorage(
        accountId,
        'synthetics',
        'synthetics-obj',
        this.reportLogFetch
      );
      if (synthetics) {
        const sizeList = await readNerdStorageOnlyCollection(
          accountId,
          'synthetics-list',
          this.reportLogFetch
        );
        const listSynthetics = [];
        for (let i = 0; i < sizeList.length; i++) {
          let page = [];
          page = await readNerdStorage(
            accountId,
            'synthetics-list',
            `synthetics-${i}`,
            this.reportLogFetch
          );
          for (const iterator of page) {
            listSynthetics.push(iterator);
          }
        }
        synthetics.list = listSynthetics;
        if (fetchingData) {
          this.updateProgressFetch(5);
        }
        this.setState({
          testTotal: listSynthetics.length,
          testList: listSynthetics
        });
      }
    } catch (err) {
      const response = {
        message: err.message,
        type: 'Error',
        event: `Recove synthetics data`,
        date: new Date().toLocaleString()
      };
      this.reportLogFetch(response);
    }
    this.sendLogs();
  }

  /**
   * Method that read nerdstorage
   *
   * @memberof App
   */
  readNerdStorage = async (collection, documentId) => {
    let result = null;
    const { accountId } = this.state;
    await readNerdStorage(
      accountId,
      collection,
      documentId,
      this.reportLogFetch
    ).then(data => {
      result = data;
    });
    return result;
  };

  /**
   * Method that reads an document on the nerdStorage
   * @param {String} collection the document id to search
   *
   * @memberof App
   */
  readNerdStorageOnlyCollection = async collection => {
    let result = null;
    const { accountId } = this.state;
    await readNerdStorageOnlyCollection(
      accountId,
      collection,
      this.reportLogFetch
    ).then(data => {
      result = data;
    });
    return result;
  };

  /**
   * Method that save data for parser file
   *
   * @memberof App
   */
  finalDataWriter = async (collectionName, data) => {
    const { accountId, completed } = this.state;
    switch (collectionName) {
      case 'monitors':
        {
          const listMonitors = data.data.monitors;
          const listTypes = data.data.type;
          data.data.monitors = [];
          data.data.type = [];
          const monitorObj = data;
          await writeNerdStorage(
            accountId,
            collectionName,
            `${collectionName}-obj`,
            monitorObj,
            this.reportLogFetch
          ).catch(err => {
            throw err;
          });
          const pagesMonitors = this.pagesOfData(listMonitors);
          for (const keyMonitor in pagesMonitors) {
            if (pagesMonitors[keyMonitor]) {
              await writeNerdStorage(
                accountId,
                `${collectionName}-monitors`,
                `${collectionName}-${keyMonitor}`,
                pagesMonitors[keyMonitor],
                this.reportLogFetch
              ).catch(err => {
                throw err;
              });
            }
          }
          const pagesTypes = this.pagesOfData(listTypes);
          for (const keyTypes in pagesTypes) {
            if (pagesTypes[keyTypes]) {
              await writeNerdStorage(
                accountId,
                `${collectionName}-types`,
                `${collectionName}-${keyTypes}`,
                pagesTypes[keyTypes],
                this.reportLogFetch
              ).catch(err => {
                throw err;
              });
            }
          }
        }
        break;
      case 'dashboards':
        {
          const listDashboards = data.data.list;
          data.data.list = [];
          const dashBoardObj = data.data;
          listDashboards.length > 0
            ? (dashBoardObj.status = 'OK')
            : (dashBoardObj.status = 'EMPTY');
          await writeNerdStorage(
            accountId,
            collectionName,
            `${collectionName}-obj`,
            dashBoardObj,
            this.reportLogFetch
          ).catch(err => {
            throw err;
          });
          const pagesDashboards = this.pagesOfData(listDashboards);
          for (const keyDashboard in pagesDashboards) {
            if (pagesDashboards[keyDashboard]) {
              await writeNerdStorage(
                accountId,
                collectionName,
                `${collectionName}-${keyDashboard}`,
                pagesDashboards[keyDashboard],
                this.reportLogFetch
              ).catch(err => {
                throw err;
              });
            }
          }
        }
        break;
      case 'infraestructure':
        {
          // guardar el objeto
          // guardar la lista
          const pagesHost = this.pagesOfData(data.data.hostList);
          for (const keyHost in pagesHost) {
            if (pagesHost[keyHost]) {
              await writeNerdStorage(
                accountId,
                collectionName,
                `${collectionName}-${keyHost}`,
                pagesHost[keyHost],
                this.reportLogFetch
              ).catch(err => {
                throw err;
              });
            }
          }
          data.data.hostList = [];
          const pagesTypes = this.pagesOfData(data.data.types);
          for (const keyTypes in pagesTypes) {
            if (pagesTypes[keyTypes]) {
              await writeNerdStorage(
                accountId,
                `${collectionName}-types`,
                `${collectionName}-types-${keyTypes}`,
                pagesTypes[keyTypes],
                this.reportLogFetch
              ).catch(err => {
                throw err;
              });
            }
          }
          data.data.types = [];
          await writeNerdStorage(
            accountId,
            collectionName,
            `${collectionName}-obj`,
            data,
            this.reportLogFetch
          ).catch(err => {
            throw err;
          });
        }
        break;
      case 'logs':
        {
          await writeNerdStorage(
            accountId,
            collectionName,
            `${collectionName}-archives-obj`,
            data.data.archivesStatus,
            this.reportLogFetch
          );
          const pagesArchives = this.pagesOfData(data.data.archives);
          for (const keyArchives in pagesArchives) {
            if (pagesArchives[keyArchives]) {
              await writeNerdStorage(
                accountId,
                `${collectionName}-archives`,
                `${collectionName}-archives-${keyArchives}`,
                pagesArchives[keyArchives],
                this.reportLogFetch
              ).catch(err => {
                throw err;
              });
            }
          }
          await writeNerdStorage(
            accountId,
            collectionName,
            `${collectionName}-metrics-obj`,
            data.data.metricsStatus,
            this.reportLogFetch
          ).catch(err => {
            throw err;
          });
          const pagesMetricsLogs = this.pagesOfData(data.data.metricsLogs);
          for (const keyMetricLog in pagesMetricsLogs) {
            if (pagesMetricsLogs[keyMetricLog]) {
              await writeNerdStorage(
                accountId,
                `${collectionName}-metrics`,
                `${collectionName}-metrics-${keyMetricLog}`,
                pagesMetricsLogs[keyMetricLog],
                this.reportLogFetch
              ).catch(err => {
                throw err;
              });
            }
          }
          await writeNerdStorage(
            accountId,
            collectionName,
            `${collectionName}-pipelines-obj`,
            data.data.pipelinesStatus,
            this.reportLogFetch
          ).catch(err => {
            throw err;
          });
          const pagesPipelines = this.pagesOfData(data.data.pipelines);
          for (const keyPipeline in pagesPipelines) {
            if (pagesPipelines[keyPipeline]) {
              await writeNerdStorage(
                accountId,
                `${collectionName}-pipelines`,
                `${collectionName}-pipelines-${keyPipeline}`,
                pagesPipelines[keyPipeline],
                this.reportLogFetch
              ).catch(err => {
                throw err;
              });
            }
          }
        }
        break;
      case 'metrics':
        {
          const listMetrics = data.data;
          data.data = [];
          const metricObj = data;
          await writeNerdStorage(
            accountId,
            collectionName,
            `${collectionName}-obj`,
            metricObj,
            this.reportLogFetch
          ).catch(err => {
            throw err;
          });
          const pagesMetrics = this.pagesOfData(listMetrics);
          for (const keyMetric in pagesMetrics) {
            if (pagesMetrics[keyMetric]) {
              await writeNerdStorage(
                accountId,
                collectionName,
                `${collectionName}-${keyMetric}`,
                pagesMetrics[keyMetric],
                this.reportLogFetch
              ).catch(err => {
                throw err;
              });
            }
          }
        }
        break;
      case 'synthetics':
        {
          const list = data.data.test;
          // const listLocations = data.data.locations;
          data.data.list = [];
          // data.data.locations = [];
          const syntheticObj = data.data;
          await writeNerdStorage(
            accountId,
            collectionName,
            `${collectionName}-obj`,
            syntheticObj,
            this.reportLogFetch
          ).catch(err => {
            throw err;
          });
          const pagesList = this.pagesOfData(list);
          for (const keyList in pagesList) {
            if (pagesList[keyList]) {
              await writeNerdStorage(
                accountId,
                `${collectionName}-list`,
                `${collectionName}-${keyList}`,
                pagesList[keyList],
                this.reportLogFetch
              ).catch(err => {
                throw err;
              });
            }
          }
        }
        break;
      case 'accounts':
        {
          const listUsers = data.data.data;
          data.data.data = [];
          const accountObj = data;
          await writeNerdStorage(
            accountId,
            collectionName,
            `${collectionName}-obj`,
            accountObj,
            this.reportLogFetch
          ).catch(err => {
            throw err;
          });
          const pagesAccounts = this.pagesOfData(listUsers);
          for (const keyAccount in pagesAccounts) {
            if (pagesAccounts[keyAccount]) {
              await writeNerdStorage(
                accountId,
                collectionName,
                `${collectionName}-${keyAccount}`,
                pagesAccounts[keyAccount],
                this.reportLogFetch
              ).catch(err => {
                throw err;
              });
            }
          }
        }
        break;
      default:
        {
          const response = {
            message: 'Collection name not found',
            type: 'Error',
            event: `Write data final`,
            date: new Date().toLocaleString()
          };
          this.reportLogFetch(response);
        }
        break;
    }
    if (completed + 5 <= 70) {
      this.updateProgressFetch(5);
    }
  };

  /**
   * Method that saves a log
   *
   * @param {Object} response Response object, expected: message, event, type, date
   * @memberof App
   */
  reportLogFetch = async response => {
    const { logs } = this.state;
    const arrayLogs = logs;
    arrayLogs.push({
      log: response.message,
      event: response.event,
      type: response.type,
      date: response.date
    });
    this.setState({ logs: arrayLogs });
  };

  /**
   * Method that fetch the data from Datadog
   *
   * @memberof App
   */
  fetchData = async () => {
    this.setState({ fetchingData: true, completed: 0 });
    let error = false;
    const data = {
      lastUpdate: ''
    };
    const { accountId, apikey, apiserver, appkey, datadogService } = this.state;
    const DDConfig = {
      DD_API_KEY: apikey,
      DD_APP_KEY: appkey,
      DD_SITE: apiserver,
      DD_SUMMARY: 'DashportData'
    };
    await DD.callApis(
      DDConfig,
      this.dataWriter,
      this.reportLogFetch,
      datadogService
    )
      .then(res => {
        data.lastUpdate = res.toLocaleString();
        const response = {
          message: 'Call apis finish great',
          type: 'Sucess',
          event: `Call apis`,
          date: new Date().toLocaleString()
        };
        this.reportLogFetch(response);
      })
      .catch(err => {
        error = true;
        const response = {
          message: err,
          type: 'Error',
          event: 'Call apis',
          date: new Date().toLocaleString()
        };
        this.reportLogFetch(response);
      });
    if (!error) {
      await DS.apiDataDigest(
        this.readNerdStorage,
        this.finalDataWriter,
        this.reportLogFetch,
        this.readNerdStorageOnlyCollection
      )
        .then(() => {
          const response = {
            message: 'Call format finish',
            type: 'Sucess',
            event: `Format data`,
            date: new Date().toLocaleString()
          };
          this.reportLogFetch(response);
        })
        .catch(err => {
          error = true;
          const response = {
            message: err,
            type: 'Error',
            event: 'Format data',
            date: new Date().toLocaleString()
          };
          this.reportLogFetch(response);
        });
    }

    if (error) {
      Toast.showToast({
        title: 'FAILED FETCH ELEMENTS',
        description: 'something went wrong please retry',
        type: Toast.TYPE.CRITICAL,
        sticky: true
      });
      if (this.state.lastUpdate !== 'never') {
        this.setState({
          fetchingData: false,
          hasErrorFetch: true
        });
      } else {
        this.setState({
          fetchingData: false,
          lastUpdate: 'never'
        });
      }
    } else {
      let lastUpdate = null;
      await writeNerdStorageReturnData(
        accountId,
        'ddFetch',
        'dateFetch',
        data,
        this.reportLogFetch
      )
        .then(({ data }) => {
          lastUpdate = data.nerdStorageWriteDocument.lastUpdate;
        })
        .catch(err => {
          const response = {
            message: err,
            type: 'Error',
            event: 'Write dateFetch',
            date: new Date().toLocaleString()
          };
          this.reportLogFetch(response);
        });
      await this.sendLogs();
      await this.loadViewData();
      this.setState({
        fetchingData: false,
        lastUpdate
      });
    }
  };

  /**
   * Method that call function for fetching metrics
   *
   * @memberof App
   */
  updateMetricsSection = async (from, timeRangeMetrics) => {
    this.setState({
      historyUpdateMetric: timeRangeMetrics
    });
    const { datadogService, accountId, historyUpdateMetric } = this.state;
    let error = false;
    this.setState({ fetchingMetrics: true });
    const metrics = await datadogService
      .fetchMetrics(from, null, this.updateProgressMetrics)
      .catch(err => {
        error = true;
        const response = {
          message: err,
          type: 'Error',
          event: 'Format data',
          date: new Date().toLocaleString()
        };
        this.reportLogFetch(response);
      });
    if (error) {
      Toast.showToast({
        title: 'FAILED FETCH UPDATE METRICS',
        description: 'something went wrong please retry',
        type: Toast.TYPE.CRITICAL,
        sticky: true
      });
      this.setState({
        fetchingMetrics: false,
        errorMetric: true,
        historyUpdateMetric
      });
    } else {
      await this.dataWriter('Get All Active Metrics', metrics).catch(err => {
        const response = {
          message: err,
          type: 'Error',
          event: 'Format data',
          date: new Date().toLocaleString()
        };
        this.reportLogFetch(response);
        error = true;
      });
      if (error) {
        Toast.showToast({
          title: 'FAILED FETCH UPDATE METRICS',
          description: 'something went wrong please retry',
          type: Toast.TYPE.CRITICAL,
          sticky: true
        });
        this.setState({
          fetchingMetrics: false,
          errorMetric: true,
          historyUpdateMetric
        });
      } else {
        await this.finalDataWriter('metrics', { data: metrics }).catch(err => {
          const response = {
            message: err,
            type: 'Error',
            event: 'Format data',
            date: new Date().toLocaleString()
          };
          this.reportLogFetch(response);
          error = true;
        });
        if (error) {
          Toast.showToast({
            title: 'FAILED FETCH UPDATE METRICS',
            description: 'something went wrong please retry',
            type: Toast.TYPE.CRITICAL,
            sticky: true
          });
          this.setState({
            fetchingMetrics: false,
            errorMetric: true,
            historyUpdateMetric
          });
        } else {
          // Guardar update
          await writeNerdStorageReturnData(
            accountId,
            'metricsUpdate',
            'metricsUpdate',
            timeRangeMetrics,
            this.reportLogFetch
          );
          this.setState({
            metrics: metrics,
            fetchingMetrics: false,
            progressMetrics: 100,
            historyUpdateMetric: timeRangeMetrics
          });
        }
      }
    }
  };

  /**
   * Method for view keys save for the user
   *
   * @memberof App
   */
  viewKeyAction = async keyInput => {
    const { apikeyS, appkeyS } = this.state;
    if (keyInput === 'apikey') {
      if (apikeyS && apikeyS[0] === '*') {
        const keyRecove = await readSingleSecretKey(keyInput);
        if (keyRecove) {
          this.setState({
            apikeyS: keyRecove
          });
        }
      } else {
        this.setState({
          apikeyS: '*'.repeat(apikeyS.length)
        });
      }
    } else if (keyInput === 'appkey') {
      if (appkeyS && appkeyS[0] === '*') {
        const keyRecove = await readSingleSecretKey(keyInput);
        if (keyRecove) {
          this.setState({
            appkeyS: keyRecove
          });
        }
      } else {
        this.setState({
          appkeyS: '*'.repeat(appkeyS.length)
        });
      }
    }
  };

  /**
   * Method for send logs to channel external
   *
   * @memberof App
   */
  async sendLogs() {
    const { logs, accountId } = this.state;
    if (logs.length !== 0) {
      await sendLogsSlack(logs, accountId);
      this.setState({ logs: [] });
    }
  }

  /**
   * Method that saves the fetch data on the NerdStorage
   *
   * @param {String} documentName Document name
   * @param {Object} documentData Document data
   * @memberof App
   */
  dataWriter = async (documentName, documentData) => {
    const { accountId, completed } = this.state;
    switch (documentName) {
      case 'Get Dashboards Manual':
        {
          const allDashboards = documentData.dashboard_lists;
          const pagesDashboards = this.pagesOfData(allDashboards);
          for (const keyAllDashboard in pagesDashboards) {
            if (pagesDashboards[keyAllDashboard]) {
              await writeNerdStorage(
                accountId,
                documentName,
                `${documentName}-${keyAllDashboard}`,
                pagesDashboards[keyAllDashboard],
                this.reportLogFetch
              ).catch(err => {
                throw err;
              });
            }
          }
        }
        break;
      case 'Get all Dashboards':
        {
          const allDashboards = documentData.dashboards;
          const pagesDashboards = this.pagesOfData(allDashboards);
          for (const keyAllDashboard in pagesDashboards) {
            if (pagesDashboards[keyAllDashboard]) {
              await writeNerdStorage(
                accountId,
                documentName,
                `${documentName}-${keyAllDashboard}`,
                pagesDashboards[keyAllDashboard],
                this.reportLogFetch
              ).catch(err => {
                throw err;
              });
            }
          }
        }
        break;
      case 'Get all archives':
        {
          const archiverList = documentData.data.data;
          const archiveObj = documentData.status;
          const pagesArchives = this.pagesOfData(archiverList);
          // guardo obj metrics
          await writeNerdStorage(
            accountId,
            documentName,
            `${documentName}-obj`,
            archiveObj,
            this.reportLogFetch
          ).catch(err => {
            throw err;
          });
          for (const keyArchives in pagesArchives) {
            if (pagesArchives[keyArchives]) {
              await writeNerdStorage(
                accountId,
                documentName,
                `${documentName}-${keyArchives}`,
                pagesArchives[keyArchives],
                this.reportLogFetch
              ).catch(err => {
                throw err;
              });
            }
          }
        }
        break;
      case 'Get all log based metrics':
        {
          const basedMetrics = documentData.data.data;
          const basedObj = documentData.status;
          const pagesLogsMetrics = this.pagesOfData(basedMetrics);
          // guardo obj metrics
          await writeNerdStorage(
            accountId,
            documentName,
            `${documentName}-obj`,
            basedObj,
            this.reportLogFetch
          ).catch(err => {
            throw err;
          });
          for (const keyLogsMetrics in pagesLogsMetrics) {
            if (pagesLogsMetrics[keyLogsMetrics]) {
              await writeNerdStorage(
                accountId,
                documentName,
                `${documentName}-${keyLogsMetrics}`,
                pagesLogsMetrics[keyLogsMetrics],
                this.reportLogFetch
              ).catch(err => {
                throw err;
              });
            }
          }
        }
        break;
      case 'Get a Dashboard':
        {
          const pagesDashboard = this.pagesOfData(documentData);
          for (const keyDashboard in pagesDashboard) {
            if (pagesDashboard[keyDashboard]) {
              await writeNerdStorage(
                accountId,
                documentName,
                `${documentName}-${keyDashboard}`,
                pagesDashboard[keyDashboard],
                this.reportLogFetch
              ).catch(err => {
                throw err;
              });
            }
          }
        }
        break;
      case 'Get Items of a Dashboard List':
        {
          const pagesDashboardList = this.pagesOfData(documentData);
          for (const keyItemDashboard in pagesDashboardList) {
            if (pagesDashboardList[keyItemDashboard]) {
              await writeNerdStorage(
                accountId,
                documentName,
                `${documentName}-${keyItemDashboard}`,
                pagesDashboardList[keyItemDashboard],
                this.reportLogFetch
              ).catch(err => {
                throw err;
              });
            }
          }
        }
        break;
      case 'Get all Dashboard Lists':
        {
          const dashboards_list = documentData.dashboard_lists;
          const pagesAllDashboardsList = this.pagesOfData(dashboards_list);
          for (const keyAllDashboardList in pagesAllDashboardsList) {
            if (pagesAllDashboardsList[keyAllDashboardList]) {
              await writeNerdStorage(
                accountId,
                documentName,
                `${documentName}-${keyAllDashboardList}`,
                pagesAllDashboardsList[keyAllDashboardList],
                this.reportLogFetch
              ).catch(err => {
                throw err;
              });
            }
          }
        }
        break;
      case 'Get a Dashboard List':
        {
          const pagesDashboardsList = this.pagesOfData(documentData);
          for (const keyDashboardList in pagesDashboardsList) {
            if (pagesDashboardsList[keyDashboardList]) {
              await writeNerdStorage(
                accountId,
                documentName,
                `${documentName}-${keyDashboardList}`,
                pagesDashboardsList[keyDashboardList],
                this.reportLogFetch
              ).catch(err => {
                throw err;
              });
            }
          }
        }
        break;
      case 'Get all embeddable graphs':
        {
          const pagesEmbeddable = this.pagesOfData(documentData);
          for (const keyEmbeddablet in pagesEmbeddable) {
            if (pagesEmbeddable[keyEmbeddablet]) {
              await writeNerdStorage(
                accountId,
                documentName,
                `${documentName}-${keyEmbeddablet}`,
                pagesEmbeddable[keyEmbeddablet],
                this.reportLogFetch
              ).catch(err => {
                throw err;
              });
            }
          }
        }
        break;
      case 'Search hosts':
        {
          const hostList = documentData.host_list;
          documentData.host_list = [];
          const hostObj = documentData;
          const pagesHostList = this.pagesOfData(hostList);
          // guardo el host obj
          await writeNerdStorage(
            accountId,
            documentName,
            `${documentName}-obj`,
            hostObj,
            this.reportLogFetch
          ).catch(err => {
            throw err;
          });
          // guardo la lista de host con el for
          for (const keyHostList in pagesHostList) {
            if (pagesHostList[keyHostList]) {
              await writeNerdStorage(
                accountId,
                documentName,
                `${documentName}-${keyHostList}`,
                pagesHostList[keyHostList],
                this.reportLogFetch
              ).catch(err => {
                throw err;
              });
            }
          }
        }
        break;
      case 'Get all indexes':
        {
          const { indexes } = documentData;
          const pagesIndexes = this.pagesOfData(indexes);
          // Guardo con el for normal
          for (const keyIndexes in pagesIndexes) {
            if (pagesIndexes[keyIndexes]) {
              await writeNerdStorage(
                accountId,
                documentName,
                `${documentName}-${keyIndexes}`,
                pagesIndexes[keyIndexes],
                this.reportLogFetch
              ).catch(err => {
                throw err;
              });
            }
          }
        }
        break;
      case 'Get indexes order':
        {
          const { index_names } = documentData;
          const pagesIndexesNames = this.pagesOfData(index_names);
          for (const keyIndexesNames in pagesIndexesNames) {
            if (pagesIndexesNames[keyIndexesNames]) {
              await writeNerdStorage(
                accountId,
                documentName,
                `${documentName}-${keyIndexesNames}`,
                pagesIndexesNames[keyIndexesNames],
                this.reportLogFetch
              ).catch(err => {
                throw err;
              });
            }
          }
        }
        break;
      case 'Get Pipeline Order':
        {
          const { pipeline_ids } = documentData;
          const pagesPipeline = this.pagesOfData(pipeline_ids);
          for (const keyPipeLine in pagesPipeline) {
            if (pagesPipeline[keyPipeLine]) {
              await writeNerdStorage(
                accountId,
                documentName,
                `${documentName}-${keyPipeLine}`,
                pagesPipeline[keyPipeLine],
                this.reportLogFetch
              ).catch(err => {
                throw err;
              });
            }
          }
        }
        break;
      case 'Get all Pipelines':
        {
          const pipelineList = documentData.data;
          documentData.data = [];
          const pipeObj = documentData.status;
          const pagesAllPipeline = this.pagesOfData(pipelineList);
          // guardo obj metrics
          await writeNerdStorage(
            accountId,
            documentName,
            `${documentName}-obj`,
            pipeObj,
            this.reportLogFetch
          ).catch(err => {
            throw err;
          });
          for (const keyAllPipeLine in pagesAllPipeline) {
            if (pagesAllPipeline[keyAllPipeLine]) {
              await writeNerdStorage(
                accountId,
                documentName,
                `${documentName}-${keyAllPipeLine}`,
                pagesAllPipeline[keyAllPipeLine],
                this.reportLogFetch
              ).catch(err => {
                throw err;
              });
            }
          }
        }
        break;
      case 'Monitors meta':
        {
          const countsTypeList = documentData.countsType;
          documentData.countsType = [];
          const monitorObj = documentData;
          const pagesCountsTypeList = this.pagesOfData(countsTypeList);
          // guardo obj metrics
          await writeNerdStorage(
            accountId,
            documentName,
            `${documentName}-obj`,
            monitorObj,
            this.reportLogFetch
          ).catch(err => {
            throw err;
          });
          // guardo lista de metricas
          for (const keyMonitorMeta in pagesCountsTypeList) {
            if (pagesCountsTypeList[keyMonitorMeta]) {
              await writeNerdStorage(
                accountId,
                documentName,
                `${documentName}-${keyMonitorMeta}`,
                pagesCountsTypeList[keyMonitorMeta],
                this.reportLogFetch
              ).catch(err => {
                throw err;
              });
            }
          }
        }
        break;
      case 'Monitor Search Pages':
        {
          const pagesMonitorsSearch = this.pagesOfData(documentData);
          for (const keyMonitorSearch in pagesMonitorsSearch) {
            if (pagesMonitorsSearch[keyMonitorSearch]) {
              await writeNerdStorage(
                accountId,
                documentName,
                `${documentName}-${keyMonitorSearch}`,
                pagesMonitorsSearch[keyMonitorSearch],
                this.reportLogFetch
              ).catch(err => {
                throw err;
              });
            }
          }
        }
        break;
      case 'Get all tests':
        {
          const testList = documentData.tests;
          const pagesTest = this.pagesOfData(testList);
          for (const keyTest in pagesTest) {
            if (pagesTest[keyTest]) {
              await writeNerdStorage(
                accountId,
                documentName,
                `${documentName}-${keyTest}`,
                pagesTest[keyTest],
                this.reportLogFetch
              ).catch(err => {
                throw err;
              });
            }
          }
        }
        break;
      case 'Get devices for browser checks':
        {
          const devicesList = documentData.devices;
          const pageDevices = this.pagesOfData(devicesList);
          for (const keyDevices in pageDevices) {
            if (pageDevices[keyDevices]) {
              await writeNerdStorage(
                accountId,
                documentName,
                `${documentName}-${keyDevices}`,
                pageDevices[keyDevices],
                this.reportLogFetch
              ).catch(err => {
                throw err;
              });
            }
          }
        }
        break;
      case 'Get available locations':
        {
          const locationsList = documentData.locations;
          const pageLocations = this.pagesOfData(locationsList);
          for (const keyLocations in pageLocations) {
            if (pageLocations[keyLocations]) {
              await writeNerdStorage(
                accountId,
                documentName,
                `${documentName}-${keyLocations}`,
                pageLocations[keyLocations],
                this.reportLogFetch
              ).catch(err => {
                throw err;
              });
            }
          }
        }
        break;
      case 'Get all users':
        {
          const dataList = documentData.data;
          const includedList = documentData.included;
          documentData.data = [];
          documentData.included = [];
          const allUserObj = documentData;
          const pagesData = this.pagesOfData(dataList);
          const pagesIncluded = this.pagesOfData(includedList);
          // Guardo el objeto
          await writeNerdStorage(
            accountId,
            documentName,
            `${documentName}-obj`,
            allUserObj,
            this.reportLogFetch
          ).catch(err => {
            throw err;
          });
          // guardo la lista de pages data
          for (const keyData in pagesData) {
            if (pagesData[keyData]) {
              await writeNerdStorage(
                accountId,
                `${documentName}-data`,
                `${documentName}-${keyData}`,
                pagesData[keyData],
                this.reportLogFetch
              ).catch(err => {
                throw err;
              });
            }
          }
          // guardo la lista de pages include
          for (const keyIncluded in pagesIncluded) {
            if (pagesIncluded[keyIncluded]) {
              await writeNerdStorage(
                accountId,
                `${documentName}-included`,
                `${documentName}-${keyIncluded}`,
                pagesIncluded[keyIncluded],
                this.reportLogFetch
              ).catch(err => {
                throw err;
              });
            }
          }
        }
        break;
      case 'Monitor Group Search':
        {
          const listGroups = documentData.groups;
          documentData.groups = [];
          const monitorSearchObj = documentData;
          const pagesGroups = this.pagesOfData(listGroups);
          await writeNerdStorage(
            accountId,
            documentName,
            `${documentName}-obj`,
            monitorSearchObj,
            this.reportLogFetch
          ).catch(err => {
            throw err;
          });
          // guardo la lista de pages include
          for (const keyIncluded in pagesGroups) {
            if (pagesGroups[keyIncluded]) {
              await writeNerdStorage(
                accountId,
                `${documentName}`,
                `${documentName}-${keyIncluded}`,
                pagesGroups[keyIncluded],
                this.reportLogFetch
              ).catch(err => {
                throw err;
              });
            }
          }
        }
        break;
      case 'Get Tags':
        {
          const keysArr = Object.keys(documentData.tags);
          const valuesArr = Object.values(documentData.tags);
          const tags = [];
          for (const key in keysArr) {
            if (keysArr[key]) {
              tags.push({
                tag: keysArr[key],
                data: valuesArr[key]
              });
            }
          }
          const pagesTags = this.pagesOfData(tags);
          for (const keyTags in pagesTags) {
            if (pagesTags[keyTags]) {
              await writeNerdStorage(
                accountId,
                `${documentName}`,
                `${documentName}-${keyTags}`,
                pagesTags[keyTags],
                this.reportLogFetch
              ).catch(err => {
                throw err;
              });
            }
          }
        }
        break;
      case 'Get All Active Metrics':
        {
          const metricsList = documentData.metrics;
          documentData.metrics = [];
          const metricObj = documentData;
          const pagesMetricsList = this.pagesOfData(metricsList);
          // guardo obj metrics
          await writeNerdStorage(
            accountId,
            documentName,
            `${documentName}-obj`,
            metricObj,
            this.reportLogFetch
          ).catch(err => {
            throw err;
          });
          // guardo lista de metricas
          for (const keyMetrics in pagesMetricsList) {
            if (pagesMetricsList[keyMetrics]) {
              await writeNerdStorage(
                accountId,
                documentName,
                `${documentName}-${keyMetrics}`,
                pagesMetricsList[keyMetrics],
                this.reportLogFetch
              ).catch(err => {
                throw err;
              });
            }
          }
          await writeNerdStorageReturnData(
            accountId,
            'metricsUpdate',
            'metricsUpdate',
            { value: '30 minutes', label: '30 minutes' },
            this.reportLogFetch
          );
        }
        break;
      default:
        // Guardo el get task tal cual
        // Guardo el Host totals tal cual
        await writeNerdStorage(
          accountId,
          documentName,
          `${documentName}-obj`,
          documentData,
          this.reportLogFetch
        ).catch(err => {
          throw err;
        });
        break;
    }
    if (completed <= 50) {
      if (completed + 2 === 48) {
        this.updateProgressFetch(4);
      } else {
        this.updateProgressFetch(2);
      }
    }
  };

  /**
   * Method that update progress of fetch principal
   *
   * @memberof App
   */
  updateProgressFetch = value => {
    this.setState(prevState => ({ completed: prevState.completed + value }));
  };

  pagesOfData = list => {
    const limit = 1000000;
    let page = [];
    const book = [];
    let pageTemporal = [];
    for (const key in list) {
      if (list[key]) {
        pageTemporal = [...page];
        if (page) {
          pageTemporal.push(list[key]);
          if (JSON.stringify(pageTemporal).length >= limit) {
            if (page.length !== 0) {
              book.push(page);
            }
            page = [];
            page.push(list[key]);
          } else {
            page = pageTemporal;
            pageTemporal = [];
          }
          if (parseInt(key) === parseInt(list.length - 1)) {
            book.push(page);
          }
        }
      }
    }
    return book;
  };

  /**
   * Method that validate the data and writes the form API into the datadog-setup document on NerdStorage
   *
   * @param {Object} values
   * @memberof App
   */
  writeSetup = async values => {
    try {
      this.setState({ writingSetup: true });
      const { accountId } = this.state;
      const { appkey, apikey } = values;
      let region = 'com';
      let validKeys = await DD.validateKeys(apikey, appkey, 'com');
      if (!validKeys.appkey && !validKeys.apikey) {
        validKeys = await DD.validateKeys(apikey, appkey, 'eu');
        region = 'eu';
      }
      const data = {
        apiserver: region,
        apikeyS: '*'.repeat(apikey.length),
        appkeyS: '*'.repeat(appkey.length)
      };
      if (validKeys.apikey) {
        if (validKeys.appkey) {
          // guardar en el vault
          let saveApiKey = null;
          let saveAppKey = null;
          let retrys = 0;
          while (retrys !== 5) {
            if (!saveApiKey || saveApiKey.status !== 'SUCCESS')
              saveApiKey = await writeSecretKey('apikey', apikey);
            if (!saveAppKey || saveAppKey.status !== 'SUCCESS')
              saveAppKey = await writeSecretKey('appkey', appkey);

            if (
              saveAppKey &&
              saveAppKey.status === 'SUCCESS' &&
              saveAppKey &&
              saveAppKey.status === 'SUCCESS'
            ) {
              retrys = 5;
            } else {
              retrys++;
            }
          }
          if (
            (saveApiKey && saveApiKey.status !== 'SUCCESS') ||
            (saveAppKey && saveAppKey.status !== 'SUCCESS')
          ) {
            Toast.showToast({
              title: 'FAILED',
              description: 'something went wrong please retry',
              type: Toast.TYPE.NORMAL
            });
            this.setState({ writingSetup: false });
          } else {
            await writeNerdStorageReturnData(
              accountId,
              'setup',
              'datadog',
              data,
              this.reportLogFetch
            )
              .then(() => {
                const datadogService = this.createDatadogServiceInstance(
                  apikey,
                  appkey,
                  region
                );

                this.setState({
                  writingSetup: false,
                  apikey: apikey,
                  appkey: appkey,
                  apikeyS: '*'.repeat(apikey.length),
                  appkeyS: '*'.repeat(appkey.length),
                  apiserver: region,
                  setupComplete: true,
                  lastUpdate: 'never',
                  datadogService: datadogService
                });
                Toast.showToast({
                  title: 'VALID KEY',
                  description: 'Valid key and correctly encrypted',
                  type: Toast.TYPE.NORMAL
                });
              })
              .catch(err => {
                const response = {
                  message: err,
                  type: 'Error',
                  event: 'Write setup',
                  date: new Date().toLocaleString()
                };
                this.reportLogFetch(response);
                Toast.showToast({
                  title: 'FAILED',
                  description: 'something went wrong',
                  type: Toast.TYPE.NORMAL
                });
                this.setState({ writingSetup: false });
              });
          }
        } else {
          Toast.showToast({
            title: 'FAILED',
            description: 'The application key is not valid',
            type: Toast.TYPE.NORMAL
          });
          this.setState({ writingSetup: false });
        }
      } else {
        Toast.showToast({
          title: 'FAILED',
          description: 'The API key is not valid',
          type: Toast.TYPE.NORMAL
        });
        this.setState({ writingSetup: false });
      }
    } catch (err) {
      Toast.showToast({
        title: 'FAILED',
        description: 'Something went wrong',
        type: Toast.TYPE.NORMAL
      });
      this.setState({ writingSetup: false });
      const response = {
        message: err,
        type: 'Error',
        event: 'Write setup function',
        date: new Date().toLocaleString()
      };
      this.reportLogFetch(response);
    }
    this.sendLogs();
  };

  /**
   * Method that open a Toast notification from confirm delete API setup
   *
   * @memberof App
   */
  openToast = () => {
    const { accountId } = this.state;

    Toast.showToast({
      title: 'ALERT',
      description: 'Are you sure you want to delete the datadog configuration?',
      actions: [
        {
          label: 'DELETE',
          onClick: async () => {
            this.setState({ deleteSetup: true, writingSetup: true });
            await deleteSetup(accountId);
            this.setState({
              apikey: '',
              appkey: '',
              apiserver: '',
              lastUpdate: '',
              setupComplete: false,
              writingSetup: false,
              deleteSetup: false
            });
          }
        }
      ],
      type: Toast.TYPE.NORMAL
    });
  };

  /**
   * Method that changes the component to render according to the selected menu option
   *
   * @returns
   * @memberof App
   */
  renderContent() {
    const {
      selectedMenu,
      monitorsGraph,
      monitorsTotal,
      monitorsData,
      infrastructureDataGraph,
      infraestructureList,
      metrics,
      testTotal,
      testList,
      fetchingData,
      writingSetup,
      logsData,
      apikey,
      apikeyS,
      appkey,
      appkeyS,
      lastUpdate,
      setupComplete,
      completed,
      deleteSetup,
      dataDashboards,
      fetchingMetrics,
      progressMetrics,
      emptyData,
      errorMetric,
      hasErrorFetch,
      historyUpdateMetric,
      total,
      totalActive
    } = this.state;
    switch (selectedMenu) {
      case 0:
        return (
          <Setup
            completed={completed}
            hasErrorFetch={hasErrorFetch}
            setupComplete={setupComplete}
            deleteSetup={deleteSetup}
            viewKeyAction={this.viewKeyAction}
            apikeyS={apikeyS}
            fetchingData={fetchingData}
            apikey={apikey}
            appkey={appkey}
            lastUpdate={lastUpdate}
            writingSetup={writingSetup}
            appkeyS={appkeyS}
            handlePlatformChange={this.handlePlatformChange}
            fetchData={this.fetchData}
            writeSetup={this.writeSetup}
            openToast={this.openToast}
          />
        );
      case 2:
        return (
          <Dashboard dataDashboards={dataDashboards} emptyData={emptyData} />
        );
      case 3:
        return (
          <Monitors
            monitorsGraph={monitorsGraph}
            monitorsTotal={monitorsTotal}
            monitorsData={monitorsData}
          />
        );
      case 4:
        return (
          <Infrastructure
            infrastructureDataGraph={infrastructureDataGraph}
            infraestructureList={infraestructureList}
            total={total}
            totalActive={totalActive}
          />
        );
      case 5:
        return <Logs logsData={logsData} />;
      case 6:
        return (
          <Metrics
            metrics={metrics}
            errorMetric={errorMetric}
            completed={progressMetrics}
            fetchingMetrics={fetchingMetrics}
            historyUpdateMetric={historyUpdateMetric}
            updateMetricsSection={this.updateMetricsSection}
            updateProgressMetrics={this.updateProgressMetrics}
          />
        );
      case 7:
        return <Synthetics testTotal={testTotal} testList={testList} />;
      default:
        return <div />;
    }
  }

  render() {
    const { loadingContent, selectedMenu, lastUpdate } = this.state;
    return (
      <>
        {loadingContent ? (
          <Spinner type={Spinner.TYPE.DOT} />
        ) : (
          <div className="main">
            <>
              <div className="sidebar-container h100">
                <Menu
                  lastUpdate={lastUpdate}
                  selectedMenu={selectedMenu}
                  handleChangeMenu={this.handleChangeMenu}
                />
              </div>
              <div className="h100" style={{ background: '#eceeee' }}>
                <div
                  style={{
                    paddingTop: '1.8%',
                    paddingRight: '1%',
                    paddingLeft: '1.8%',
                    height: '96%'
                  }}
                >
                  {this.renderContent()}
                </div>
              </div>
            </>
          </div>
        )}
      </>
    );
  }
}
