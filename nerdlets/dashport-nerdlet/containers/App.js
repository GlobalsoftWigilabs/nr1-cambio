/* eslint-disable react/no-deprecated */
import React from 'react';
// Containers
import Menu from './Menu/Menu';
import Setup from './SetUp/Setup';
import Data from './Data';
import Dashboard from './Dashboard/Dashboard.js';
import Migration from './Migration';
import Status from './Status';
import Alerts from './Alerts/Alerts';
import Sample from './Sample/Sample.js';
import Infrastructure from './Infraestructure/Infrastructure';
import Synthetics from './Synthetics';
import Accounts from './Accounts';
import Logs from './Logs/Logs';
import Metrics from './Metrics/Metrics';
const controller = new AbortController();
const signal = controller.signal;
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
import { Spinner, Toast } from 'nr1';

/**
 * Class that render de dashboard
 *
 * @export
 * @class Dashport
 * @extends {React.Component}
 */
export default class App extends React.Component {
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
      platformSelect: 0,
      apiserver: false,
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
      verticalBarchart: false,
      // ALERTS
      alertsTotal: 0,
      alertsData: [
        { name: 'Host', uv: 0, pv: 0 },
        { name: 'Metric', uv: 0, pv: 0 },
        { name: 'Anomaly', uv: 0, pv: 0 },
        { name: 'Outlier', uv: 0, pv: 0 }
      ],
      monitorsData: [],
      // INFRASTRUCTURE
      infrastructureData: [
        { name: 'Windows', value: 0 },
        { name: 'Linux', value: 0 }
      ],
      infrastructureTotal: {
        totalHosts: 0,
        totalCpu: 0
      },
      // LOGS
      logsTotal: {
        indexes: 0,
        pipelines: 0
      },
      // Metrics
      metricsTotal: 0,
      metrics: [],
      // SYNTHETICS
      syntheticsTotal: 0,
      dataTableUrlService: [],
      availableLocations: [],
      // ACCOUNTS
      accountsTotal: 0,
      dataTableAccounts: [],
      // LogsDashport
      logs: [],
      completed: 0
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
    window.addEventListener('resize', () => {
      this.changeSizeCharts();
    });
  }

  /**
   * Method called when the component will be unmounted
   *
   * @memberof App
   */
  componentWillUnmount() {
    window.removeEventListener('resize', () => {
      this.changeSizeCharts();
    });
  }

  /**
   * Method that changes the X axis Component to render in the Alerts chart
   *
   * @memberof Dashport
   */
  changeSizeCharts() {
    if (window.innerWidth < 1320) {
      this.setState({ verticalBarchart: true });
    } else {
      this.setState({ verticalBarchart: false });
    }
  }

  /**
   * Method that changes the selected option in menu
   *
   * @param {number} value
   * @memberof Dashport
   */
  handleChangeMenu = value => {
    const { fetchingData } = this.state;
    if (fetchingData) {
      Toast.showToast({
        title: 'WAIT..',
        description: 'Please wait until the search is over',
        type: Toast.TYPE.NORMAL
      });
    } else if (
      value === 0 ||
      value === 1 ||
      value === 2 ||
      value === 3 ||
      value === 4 ||
      value === 6
    ) {
      this.setState({ selectedMenu: value });
    } else {
      Toast.showToast({
        title: 'In process',
        description: 'Views are in process develop',
        type: Toast.TYPE.NORMAL
      });
    }
  };

  /**
   * Method that change the selected menu from other component
   *
   * @param {number} value
   * @memberof Dashport
   */
  ChangeMenuExternal = value => {
    this.setState({ selectedMenu: value });
  };

  /**
   * Method that load from NerdStorage the information from account
   *
   * @memberof Dashport
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
    let retrys = 0,
      keyApi = null,
      keyApp = null;
    const keysName = ['apikey', 'appkey'];
    while (retrys !== 10) {
      keyApi = await readSingleSecretKey(keysName[0]);
      keyApp = await readSingleSecretKey(keysName[1]);
      if (keyApi && keyApp) {
        retrys = 10;
      } else {
        retrys += 1;
      }
    }
    if (dataSetup !== null && keyApi && keyApp) {
      this.setState({
        setupComplete: true,
        apikey: keyApi,
        apikeyS: dataSetup.apikeyS,
        appkey: keyApp,
        appkeyS: dataSetup.appkeyS,
        apiserver: dataSetup.apiserver === '.eu'
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
    this.setState({ loadingContent: false });
  }

  cancel = () => {
    console.log('Now aborting');
    // Abort.
    controller.abort();
  };

  /**
   * Method that loads the data from NerdStorage
   * @memberof App
   */
  async loadViewData() {
    const { accountId, fetchingData } = this.state;
    let countColor = 1;
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
        const alertsData = [];
        for (const monitor of data.data.monitors) {
          const index = alertsData.findIndex(
            element => element.name === monitor.type
          );
          if (index !== -1) {
            alertsData[index].uv = alertsData[index].uv + 1;
          } else {
            alertsData.push({
              name: monitor.type,
              pv: data.data.monitors.length,
              uv: 1
            });
          }
        }

        this.setState({
          alertsTotal: data.data.total,
          alertsData: alertsData,
          monitorsData: data.data.monitors
        });
      }
      if (fetchingData) {
        this.setState(prevstate => ({ completed: prevstate.completed + 2 }));
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
      const infraestructure = await readNerdStorage(
        accountId,
        'infraestructure',
        'data',
        this.reportLogFetch
      );
      if (infraestructure) {
        const { platform, total, cpuCount } = infraestructure.data;
        const hostsData = [
          {
            name: 'linux',
            value: platform.linux.count,
            versions: platform.linux.versions,
            processor: platform.linux.versions.processorModel,
            uv: Math.abs(platform.linux.count),
            pv: Math.abs(total - platform.linux.count)
          },
          {
            name: 'windows',
            value: platform.win.count,
            versions: platform.win.versions,
            processor: platform.win.versions.processorModel,
            uv: Math.abs(platform.win.count),
            pv: Math.abs(total - platform.win.count)
          }
        ];
        this.setState({
          infrastructureData: hostsData,
          infrastructureTotal: {
            totalHosts: total,
            totalCpu: cpuCount
          }
        });
      }
      if (fetchingData) {
        this.setState(prevstate => ({ completed: prevstate.completed + 2 }));
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
      const logs = await readNerdStorage(
        accountId,
        'logs',
        'data',
        this.reportLogFetch
      );
      console.log('logs ', logs)
      if (logs) {
        const { indexes, pipelines } = logs.data;
        this.setState({
          logsTotal: {
            indexes: indexes,
            pipelines: pipelines
          }
        });
      }
      if (fetchingData) {
        this.setState(prevstate => ({ completed: prevstate.completed + 2 }));
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
        metrics.data = listMetrics;
        this.setState({
          metricsTotal: metrics.data.length,
          metrics: metrics.data
        });
      }
      if (fetchingData) {
        this.setState(prevstate => ({ completed: prevstate.completed + 2 }));
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
        const sizeLocations = await readNerdStorageOnlyCollection(
          accountId,
          'synthetics-locations',
          this.reportLogFetch
        );
        const listLocations = [];
        for (let i = 0; i < sizeLocations.length; i++) {
          let page = [];
          page = await readNerdStorage(
            accountId,
            'synthetics-locations',
            `synthetics-${i}`,
            this.reportLogFetch
          );
          for (const iterator of page) {
            listLocations.push(iterator);
          }
        }
        synthetics.list = listSynthetics;
        synthetics.locations = listLocations;
        const { list, locations, count } = synthetics;
        const urls = [];
        countColor = 1;
        for (const element of list) {
          if (element.type === 'api') {
            urls.push({
              url: element.url,
              api: true,
              browser: false,
              color: countColor % 2 ? 'white' : '#F7F7F8'
            });
          } else {
            urls.push({
              url: element.url,
              api: false,
              browser: true,
              color: countColor % 2 ? 'white' : '#F7F7F8'
            });
          }
          countColor += 1;
        }
        const locationsArray = [];
        for (const element of locations) {
          locationsArray.push(`${element.id}  /  ${element.name}`);
        }
        this.setState({
          syntheticsTotal: count,
          availableLocations: locationsArray,
          dataTableUrlService: urls
        });
      }
      if (fetchingData) {
        this.setState(prevstate => ({ completed: prevstate.completed + 2 }));
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
    // ACCOUNTS
    try {
      const accounts = await readNerdStorage(
        accountId,
        'accounts',
        'accounts-obj',
        this.reportLogFetch
      );
      if (accounts) {
        const sizeUsers = await readNerdStorageOnlyCollection(
          accountId,
          'accounts',
          this.reportLogFetch
        );
        const listUsers = [];
        for (let k = 0; k < sizeUsers.length - 1; k++) {
          let page = [];
          page = await readNerdStorage(
            accountId,
            'accounts',
            `accounts-${k}`,
            this.reportLogFetch
          );
          for (const iterator of page) {
            listUsers.push(iterator);
          }
        }
        accounts.data.data = listUsers;
        const accountsArray = [];
        countColor = 1;
        for (const account of accounts.data.data) {
          accountsArray.push({
            name: account.email,
            username: account.name,
            status: account.status,
            color: countColor % 2 ? 'white' : '#F7F7F8'
          });
          countColor += 1;
        }
        this.setState({
          accountsTotal: accounts.data.total,
          dataTableAccounts: accountsArray
        });
      }
      if (fetchingData) {
        this.setState(prevstate => ({ completed: prevstate.completed + 2 }));
      }
    } catch (err) {
      const response = {
        message: err.message,
        type: 'Error',
        event: `Recove accounts data`,
        date: new Date().toLocaleString()
      };
      this.reportLogFetch(response);
    }
    this.sendLogs();
  }

  /**
   * Method that reads an document on the nerdStorage
   * @param {String} documentId the document id to search
   *
   * @memberof Dashport
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
   * @param {String} documentId the document id to search
   *
   * @memberof Dashport
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

  finalDataWriter = async (collectionName, data) => {
    const { accountId } = this.state;
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
          );
          const pagesMonitors = this.pagesOfData(listMonitors);
          for (const keyMonitor in pagesMonitors) {
            if (pagesMonitors[keyMonitor]) {
              await writeNerdStorage(
                accountId,
                `${collectionName}-monitors`,
                `${collectionName}-${keyMonitor}`,
                pagesMonitors[keyMonitor],
                this.reportLogFetch
              );
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
              );
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
          );
          const pagesDashboards = this.pagesOfData(listDashboards);
          for (const keyDashboard in pagesDashboards) {
            if (pagesDashboards[keyDashboard]) {
              await writeNerdStorage(
                accountId,
                collectionName,
                `${collectionName}-${keyDashboard}`,
                pagesDashboards[keyDashboard],
                this.reportLogFetch
              );
            }
          }
        }
        break;
      case 'infraestructure':
        await writeNerdStorage(
          accountId,
          collectionName,
          'data',
          data,
          this.reportLogFetch
        );
        break;
      case 'logs':
        await writeNerdStorage(
          accountId,
          collectionName,
          'data',
          data,
          this.reportLogFetch
        );
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
          );
          const pagesMetrics = this.pagesOfData(listMetrics);
          for (const keyMetric in pagesMetrics) {
            if (pagesMetrics[keyMetric]) {
              await writeNerdStorage(
                accountId,
                collectionName,
                `${collectionName}-${keyMetric}`,
                pagesMetrics[keyMetric],
                this.reportLogFetch
              );
            }
          }
        }
        break;
      case 'synthetics':
        {
          const list = data.data.list;
          const listLocations = data.data.locations;
          data.data.list = [];
          data.data.locations = [];
          const syntheticObj = data.data;
          await writeNerdStorage(
            accountId,
            collectionName,
            `${collectionName}-obj`,
            syntheticObj,
            this.reportLogFetch
          );
          const pagesList = this.pagesOfData(list);
          for (const keyList in pagesList) {
            if (pagesList[keyList]) {
              await writeNerdStorage(
                accountId,
                `${collectionName}-list`,
                `${collectionName}-${keyList}`,
                pagesList[keyList],
                this.reportLogFetch
              );
            }
          }
          const pagesLocations = this.pagesOfData(listLocations);
          for (const keyLocation in pagesLocations) {
            if (pagesLocations[keyLocation]) {
              await writeNerdStorage(
                accountId,
                `${collectionName}-locations`,
                `${collectionName}-${keyLocation}`,
                pagesLocations[keyLocation],
                this.reportLogFetch
              );
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
          );
          const pagesAccounts = this.pagesOfData(listUsers);
          for (const keyAccount in pagesAccounts) {
            if (pagesAccounts[keyAccount]) {
              await writeNerdStorage(
                accountId,
                collectionName,
                `${collectionName}-${keyAccount}`,
                pagesAccounts[keyAccount],
                this.reportLogFetch
              );
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
    this.setState(prevstate => {
      if (prevstate.completed === 87) {
        return { completed: prevstate.completed + 1 };
      } else {
        return { completed: prevstate.completed + 3 };
      }
    });
  };

  /**
   * Method that saves a log
   *
   * @param {Object} response Response object, expected: message, event, type, date
   * @memberof Dashport
   */
  reportLogFetch = async response => {
    console.log(response)
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
   * @memberof Dashport
   */
  fetchData = async () => {
    this.setState({ fetchingData: true, completed: 0 });
    const data = {
      lastUpdate: ''
    };
    const { accountId, apikey, apiserver, appkey } = this.state;
    const DDConfig = {
      DD_API_KEY: apikey,
      DD_APP_KEY: appkey,
      DD_EU: apiserver === '.eu',
      DD_SUMMARY: 'DashportData'
    };
    await DD.callApis(DDConfig, this.dataWriter, this.reportLogFetch)
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
        const response = {
          message: err,
          type: 'Error',
          event: 'Call apis',
          date: new Date().toLocaleString()
        };
        this.reportLogFetch(response);
      });
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
        const response = {
          message: err,
          type: 'Error',
          event: 'Format data',
          date: new Date().toLocaleString()
        };
        this.reportLog(response);
      });
    await writeNerdStorageReturnData(
      accountId,
      'ddFetch',
      'dateFetch',
      data,
      this.reportLogFetch
    )
      .then(({ data }) => {
        this.setState({
          lastUpdate: data.nerdStorageWriteDocument.lastUpdate
        });
      })
      .catch(err => {
        const response = {
          message: err,
          type: 'Error',
          event: 'Write dateFetch',
          date: new Date().toLocaleString()
        };
        this.reportLog(response);
      });
    await this.sendLogs();
    await this.loadViewData();
    Toast.showToast({
      title: 'STEPS TO COMPLETE',
      type: Toast.TYPE.NORMAL
    });
    this.setState({
      fetchingData: false
    });
  };

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
      // eslint-disable-next-line no-constant-condition
    } else if ((keyInput = 'appkey')) {
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
   * @memberof Dashport
   */
  dataWriter = async (documentName, documentData) => {
    const { accountId } = this.state;
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
              );
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
              );
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
              );
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
              );
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
              );
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
              );
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
              );
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
          );
          // guardo la lista de host con el for
          for (const keyHostList in pagesHostList) {
            if (pagesHostList[keyHostList]) {
              await writeNerdStorage(
                accountId,
                documentName,
                `${documentName}-${keyHostList}`,
                pagesHostList[keyHostList],
                this.reportLogFetch
              );
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
              );
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
              );
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
              );
            }
          }
        }
        break;
      case 'Get all Pipelines':
        {
          const pagesAllPipeline = this.pagesOfData(documentData);
          for (const keyAllPipeLine in pagesAllPipeline) {
            if (pagesAllPipeline[keyAllPipeLine]) {
              await writeNerdStorage(
                accountId,
                documentName,
                `${documentName}-${keyAllPipeLine}`,
                pagesAllPipeline[keyAllPipeLine],
                this.reportLogFetch
              );
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
          );
          // guardo lista de metricas
          for (const keyMetrics in pagesMetricsList) {
            if (pagesMetricsList[keyMetrics]) {
              await writeNerdStorage(
                accountId,
                documentName,
                `${documentName}-${keyMetrics}`,
                pagesMetricsList[keyMetrics],
                this.reportLogFetch
              );
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
          );
          // guardo lista de metricas
          for (const keyMonitorMeta in pagesCountsTypeList) {
            if (pagesCountsTypeList[keyMonitorMeta]) {
              await writeNerdStorage(
                accountId,
                documentName,
                `${documentName}-${keyMonitorMeta}`,
                pagesCountsTypeList[keyMonitorMeta],
                this.reportLogFetch
              );
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
              );
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
              );
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
              );
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
              );
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
          );
          // guardo la lista de pages data
          for (const keyData in pagesData) {
            if (pagesData[keyData]) {
              await writeNerdStorage(
                accountId,
                `${documentName}-data`,
                `${documentName}-${keyData}`,
                pagesData[keyData],
                this.reportLogFetch
              );
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
              );
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
          );
          // guardo la lista de pages include
          for (const keyIncluded in pagesGroups) {
            if (pagesGroups[keyIncluded]) {
              await writeNerdStorage(
                accountId,
                `${documentName}`,
                `${documentName}-${keyIncluded}`,
                pagesGroups[keyIncluded],
                this.reportLogFetch
              );
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
              );
            }
          }
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
        );
        break;
    }
    this.setState(prevstate => ({ completed: prevstate.completed + 3 }));
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
   * @memberof Dashport
   */
  writeSetup = async values => {
    try {
      this.setState({ writingSetup: true });
      const { accountId } = this.state;
      const { appkey, apikey } = values;
      let region = '.com';
      if (values.apiserver) {
        region = '.eu';
      }
      const data = {
        apiserver: region,
        apikeyS: '*'.repeat(apikey.length),
        appkeyS: '*'.repeat(appkey.length)
      };
      const validKeys = await DD.validateKeys(apikey, appkey);
      if (validKeys.apikey) {
        if (validKeys.appkey) {
          // guardar en el vault
          const saveApiKey = await writeSecretKey('apikey', apikey);
          const saveAppKey = await writeSecretKey('appkey', appkey);
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
              .then(({ data }) => {
                this.setState({
                  writingSetup: false,
                  apikey: apikey,
                  appkey: appkey,
                  apikeyS: '*'.repeat(apikey.length),
                  appkeyS: '*'.repeat(appkey.length),
                  apiserver: data.nerdStorageWriteDocument.apiserver === '.eu',
                  setupComplete: true,
                  lastUpdate: 'never'
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
   * @memberof Dashport
   */
  openToast = () => {
    const { accountId } = this.state;
    Toast.showToast({
      title: 'ALERT',
      description: '¿Are you sure to delete the datadog configuration?',
      actions: [
        {
          label: 'DELETE',
          onClick: () => {
            this.setState({ writingSetup: true });
            deleteSetup(accountId);
            this.setState({
              apikey: '',
              appkey: '',
              apiserver: false,
              lastUpdate: '',
              setupComplete: false,
              writingSetup: false
            });
          }
        }
      ],
      type: Toast.TYPE.NORMAL
    });
  };

  handlePlatformChange = value => {
    this.setState({ platformSelect: value });
  };

  /**
   * Method that changes the component to render according to the selected menu option
   *
   * @returns
   * @memberof Dashport
   */
  renderContent() {
    const {
      selectedMenu,
      accountId,
      alertsData,
      alertsTotal,
      monitorsData,
      infrastructureData,
      infrastructureTotal,
      logsTotal,
      metricsTotal,
      metrics,
      syntheticsTotal,
      availableLocations,
      dataTableUrlService,
      accountsTotal,
      dataTableAccounts,
      fetchingData,
      writingSetup,
      verticalBarchart,
      apikey,
      apikeyS,
      appkey,
      appkeyS,
      apiserver,
      lastUpdate,
      setupComplete,
      platformSelect,
      completed
    } = this.state;
    switch (selectedMenu) {
      case 0:
        return (
          <Setup
            completed={completed}
            platformSelect={platformSelect}
            setupComplete={setupComplete}
            viewKeyAction={this.viewKeyAction}
            apikeyS={apikeyS}
            apiserver={apiserver}
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
            handleChangeMenu={this.handleChangeMenu}
            cancel={this.cancel}
          />
        );
      case 1:
        return <Data />;
      case 2:
        return (
          <Dashboard
            reportLogFetch={this.reportLogFetch}
            handleChangeMenu={this.handleChangeMenu}
            sendLogs={this.sendLogs}
            accountId={accountId}
          />
        );
      case 3:
        return (
          // <Sample />
          <Alerts
            alertsData={alertsData}
            alertsTotal={alertsTotal}
            monitorsData={monitorsData}
          />
        );
      case 4:
        return (
          <Infrastructure
            infrastructureData={infrastructureData}
            infrastructureTotal={infrastructureTotal}
          />
        );
      case 5:
        return <Logs logsTotal={logsTotal} />;
      case 6:
        return <Metrics
          accountId={accountId}
          metrics={metrics}
          metricsTotal={metricsTotal} />;
      case 7:
        return (
          <Synthetics
            syntheticsTotal={syntheticsTotal}
            availableLocations={availableLocations}
            dataTableUrlService={dataTableUrlService}
          />
        );
      case 8:
        <Accounts
          accountsTotal={accountsTotal}
          dataTableAccounts={dataTableAccounts}
        />;
        return;
      case 9:
        return (
          <Migration
            accountId={accountId}
            goToStatus={this.ChangeMenuExternal}
          />
        );
      case 10:
        return <Status accountId={accountId} />;
      default:
        return null;
    }
  }

  render() {
    const { loadingContent, selectedMenu, lastUpdate } = this.state;
    return (
      <div className="Main">
        {loadingContent ? (
          <Spinner type={Spinner.TYPE.DOT} />
        ) : (
            <>
              <div className="sidebar-container">
                <Menu
                  lastUpdate={lastUpdate}
                  selectedMenu={selectedMenu}
                  handleChangeMenu={this.handleChangeMenu}
                />
              </div>
              <div>
                <div
                  style={{
                    paddingTop: '1%',
                    paddingRight: '1%',
                    paddingLeft: '1%',
                    height: '96%'
                  }}
                >
                  {this.renderContent()}
                </div>
              </div>
            </>
          )}
      </div>
    );
  }
}
