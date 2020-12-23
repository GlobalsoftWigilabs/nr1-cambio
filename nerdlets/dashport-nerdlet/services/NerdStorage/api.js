import {
  AccountStorageMutation,
  AccountsQuery,
  AccountStorageQuery,
  NerdGraphQuery,
  NerdGraphMutation
} from 'nr1';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { sendLogsSlack } from '../Wigilabs/api';
import jsoncsv from 'json-2-csv';

/**
 * Function that reads the New Relic account ID
 *
 * @returns {number} account ID
 */
async function loadAccountId() {
  let accountId = null;
  const errors = [];
  await AccountsQuery.query()
    .then(({ data }) => {
      accountId = data[0].id;
    })
    .catch(err => {
      const response = {
        message: err.message,
        event: 'Recover account id',
        type: 'Error',
        date: new Date().toLocaleString()
      };
      sendLogsSlack(response, accountId);
      errors.push(err);
    });
  return accountId;
}

/**
 * Method that reads the dateFetch-ddFetch document that contains the last update date
 * @param {number} accountId New Relic account Id
 * @returns {Objetc} Last update object
 */
async function readDateFetch(accountId) {
  let result = null;
  await AccountStorageQuery.query({
    accountId: accountId,
    collection: 'ddFetch',
    documentId: 'dateFetch'
  })
    .then(({ data }) => {
      result = data;
    })
    .catch(err => {
      const response = {
        message: err.message,
        event: 'Read last update',
        type: 'Error',
        date: new Date().toLocaleString()
      };
      sendLogsSlack(response, accountId);
    });
  return result;
}

/**
 * Method that reads the DashportData-data document that contains the info to display
 * @param {number} accountId New Relic account Id
 * @returns {Object} Data to display on the nerdlet
 */
async function readDashportData(accountId) {
  let result = null;
  await AccountStorageQuery.query({
    accountId: accountId,
    collection: 'DashportData',
    documentId: 'data'
  })
    .then(({ data }) => {
      result = data;
    })
    .catch(err => {
      const response = {
        message: err.message,
        event: 'Read dashport data',
        type: 'Error',
        date: new Date().toLocaleString()
      };
      sendLogsSlack(response, accountId);
    });
  return result;
}

async function readNerdStorageNoLogger(accountId, collection, documentId) {
  let result = null;
  await AccountStorageQuery.query({
    accountId: accountId,
    collection: collection,
    documentId: documentId
  }).then(({ data }) => {
    result = data;
  });
  return result;
}

async function readNerdStorageOnlyCollectionNoLogger(accountId, collection) {
  let result = null;
  await AccountStorageQuery.query({
    accountId: accountId,
    collection: collection
  }).then(({ data }) => {
    result = data;
  });
  return result;
}

/**
 * Method that reads the DashportData-data document that contains the info to display
 * @param {number} accountId New Relic account Id
 * @returns {Object} Data to display on the nerdlet
 */
async function readNerdStorage(
  accountId,
  collection,
  documentId,
  reportLogFetch
) {
  let result = null;
  await AccountStorageQuery.query({
    accountId: accountId,
    collection: collection,
    documentId: documentId
  })
    .then(({ data }) => {
      result = data;
    })
    .catch(err => {
      const response = {
        message: err.message,
        event: `Read collection ${collection} - documentId ${documentId}`,
        type: 'Error',
        date: new Date().toLocaleString()
      };
      reportLogFetch(response);
    });
  return result;
}

/**
 * Method that reads the DashportData-data document that contains the info to display
 * @param {number} accountId New Relic account Id
 * @returns {Object} Data to display on the nerdlet
 */
async function readNerdStorageOnlyCollection(
  accountId,
  collection,
  reportLogFetch
) {
  let result = [];
  await AccountStorageQuery.query({
    accountId: accountId,
    collection: collection
  })
    .then(({ data }) => {
      result = data;
    })
    .catch(err => {
      const response = {
        message: err.message,
        event: `Read collection ${collection}`,
        type: 'Error',
        date: new Date().toLocaleString()
      };
      reportLogFetch(response);
    });
  return result;
}

/**
 * Method that write nerdstorage
 * @param {*} accountId
 * @param {*} collection
 * @param {*} documentId
 * @returns
 */
async function writeNerdStorage(
  accountId,
  collection,
  documentId,
  data,
  reportLogFetch
) {
  await AccountStorageMutation.mutate({
    accountId: accountId,
    actionType: AccountStorageMutation.ACTION_TYPE.WRITE_DOCUMENT,
    collection: collection,
    documentId: documentId,
    document: JSON.stringify(data)
  }).catch(err => {
    const response = {
      message: err.message,
      type: 'Error',
      event: `Write ${documentId}`,
      date: new Date().toLocaleString()
    };
    reportLogFetch(response);
  });
}

/**
 * Method that write nerdstorage
 * @param {*} accountId
 * @param {*} collection
 * @param {*} documentId
 * @returns
 */
async function writeNerdStorageReturnData(
  accountId,
  collection,
  documentId,
  data,
  reportLogFetch
) {
  let result = null;
  await AccountStorageMutation.mutate({
    accountId: accountId,
    actionType: AccountStorageMutation.ACTION_TYPE.WRITE_DOCUMENT,
    collection: collection,
    documentId: `${documentId}`,
    document: JSON.stringify(data)
  })
    .then(data => {
      result = data;
    })
    .catch(err => {
      const response = {
        message: err.message,
        type: 'Error',
        event: `Write ${documentId}`,
        date: new Date().toLocaleString()
      };
      reportLogFetch(response);
    });
  return result;
}

/**
 * Function that reads the datadog-setup document that contains the datadog API configuration
 *
 * @param {number} accountId New Relic account Id
 * @returns {Object} API keys and validations
 */
async function readDocumentSetup(accountId) {
  let result = null;
  await AccountStorageQuery.query({
    accountId: accountId,
    collection: 'setup',
    documentId: 'datadog'
  })
    .then(async ({ data }) => {
      result = data;
    })
    .catch(err => {
      const response = {
        message: err.message,
        event: 'Read setup api',
        type: 'Error',
        date: new Date().toLocaleString()
      };
      sendLogsSlack(response, accountId);
    });
  return result;
}

/**
 * Method that deletes the setup, ddFetch,ddDashboards, and DashboardData collections from NerdStorage
 */
async function deleteSetup() {
  const accountId = await loadAccountId();
  // Delete setup
  await AccountStorageMutation.mutate({
    accountId: accountId,
    actionType: AccountStorageMutation.ACTION_TYPE.DELETE_COLLECTION,
    collection: 'setup'
  });
  await deletSecretKey("appkey");
  await deletSecretKey("apikey");
  // Delete date fetch
  await AccountStorageMutation.mutate({
    accountId: accountId,
    actionType: AccountStorageMutation.ACTION_TYPE.DELETE_COLLECTION,
    collection: 'ddFetch'
  });
  // Delete data with format
  const collectionNames = [
    'monitors',
    'monitors-monitors',
    'monitors-types',
    'infraestructure',
    'logs',
    'metrics',
    'synthetics',
    'synthetics-list',
    'synthetics-locations',
    'accounts',
    'dashboards',
    'dashboards-migrated'
  ];
  for (const collectionName of collectionNames) {
    await AccountStorageMutation.mutate({
      accountId: accountId,
      actionType: AccountStorageMutation.ACTION_TYPE.DELETE_COLLECTION,
      collection: collectionName
    });
  }
  // Delete data in crude
  const namesApis = [
    'Get all Dashboards',
    'Get a Dashboard',
    'Get Items of a Dashboard List',
    'Get all Dashboard Lists',
    'Get a Dashboard List',
    'Get all embeddable graphs',
    'Search hosts',
    'Get all indexes',
    'Get indexes order',
    'Get Pipeline Order',
    'Get all Pipelines',
    'Get All Active Metrics',
    'Monitors meta',
    'Monitor Search Pages',
    'Get all tests',
    'Get devices for browser checks',
    'Get available locations',
    'Get all users',
    'Host totals',
    'Get Tags',
    'Monitor Group Search',
    'Get Dashboards Manual'
  ];
  for (const nameApi of namesApis) {
    await AccountStorageMutation.mutate({
      accountId: accountId,
      actionType: AccountStorageMutation.ACTION_TYPE.DELETE_COLLECTION,
      collection: nameApi
    });
  }
  console.log('finish');
}

const recoveDataDashboards = async (accountId) => {
  // widgets in dashboards
  let other = [];
  let data = await readNerdStorageOnlyCollectionNoLogger(
    accountId,
    'Get a Dashboard'
  );
  for (let i = 0; i < data.length; i++) {
    let anyt = [];
    anyt = await readNerdStorageNoLogger(
      accountId,
      'Get a Dashboard',
      `Get a Dashboard-${i}`
    );
    for (const iterator of anyt) {
      other.push(iterator);
    }
  }
  return other;
}

async function downloadJSON(enableButton) {
  const accountId = await loadAccountId();
  try {
    const zip = new JSZip(); // Object that contains the zip files
    let data = [];
    let other = [];
    data = await readNerdStorageOnlyCollectionNoLogger(
      accountId,
      'Get all Dashboards'
    );
    for (let i = 0; i < data.length; i++) {
      let anyt = [];
      anyt = await readNerdStorageNoLogger(
        accountId,
        'Get all Dashboards',
        `Get all Dashboards-${i}`
      );
      for (const iterator of anyt) {
        other.push(iterator);
      }
    }
    data = other;
    zip.file(`Get all Dashboards.json`, JSON.stringify(data, null, 2));
    // widgets in dashboards
    other = [];
    data = await readNerdStorageOnlyCollectionNoLogger(
      accountId,
      'Get a Dashboard'
    );
    for (let i = 0; i < data.length; i++) {
      let anyt = [];
      anyt = await readNerdStorageNoLogger(
        accountId,
        'Get a Dashboard',
        `Get a Dashboard-${i}`
      );
      for (const iterator of anyt) {
        other.push(iterator);
      }
    }
    data = other;
    zip.file(`Get a Dashboard.json`, JSON.stringify(data, null, 2));

    // favorites & most viewed dashboards
    other = [];
    data = await readNerdStorageOnlyCollectionNoLogger(
      accountId,
      'Get Items of a Dashboard List'
    );
    for (let i = 0; i < data.length; i++) {
      let anyt = [];
      anyt = await readNerdStorageNoLogger(
        accountId,
        'Get Items of a Dashboard List',
        `Get Items of a Dashboard List-${i}`
      );
      for (const iterator of anyt) {
        other.push(iterator);
      }
    }
    data = other;
    zip.file(
      `Get Items of a Dashboard List.json`,
      JSON.stringify(data, null, 2)
    );
    // MONITORS
    const dataMonitor = await readNerdStorageNoLogger(
      accountId,
      'Monitors meta',
      'Monitors meta-obj'
    );
    const sizeData = await readNerdStorageOnlyCollectionNoLogger(
      accountId,
      'Monitors meta'
    );
    const countsType = [];
    for (let i = 0; i < sizeData.length - 1; i++) {
      let list = [];
      list = await readNerdStorageNoLogger(
        accountId,
        'Monitors meta',
        `Monitors meta-${i}`
      );
      for (const iterator of list) {
        countsType.push(iterator);
      }
    }
    if (dataMonitor) {
      dataMonitor.countsType = countsType;
    }
    zip.file(`Monitors meta.json`, JSON.stringify(dataMonitor, null, 2));

    const monit = await readNerdStorageOnlyCollectionNoLogger(
      accountId,
      'Monitor Search Pages'
    );
    const monitors = [];
    for (let i = 0; i < monit.length; i++) {
      let listo = [];
      listo = await readNerdStorageNoLogger(
        accountId,
        'Monitor Search Pages',
        `Monitor Search Pages-${i}`
      );
      for (const iterator of listo) {
        if (iterator.monitors) {
          iterator.monitors.map(monitor => monitors.push(monitor));
        } else {
          monitors.push(iterator);
        }
      }
    }
    zip.file(`Monitor Search Pages.json`, JSON.stringify(monitors, null, 2));
    // INFRAESTRUCTURE
    const dataInfra = await readNerdStorageNoLogger(
      accountId,
      'Search hosts',
      'Search hosts-obj'
    );
    const sizeDataInfra = await readNerdStorageOnlyCollectionNoLogger(
      accountId,
      'Search hosts'
    );
    const hostList = [];
    for (let i = 0; i < sizeDataInfra.length - 1; i++) {
      let listo = [];
      listo = await readNerdStorageNoLogger(
        accountId,
        'Search hosts',
        `Search hosts-${i}`
      );
      for (const iterator of listo) {
        hostList.push(iterator);
      }
    }
    dataInfra.host_list = hostList;
    zip.file(`Search hosts.json`, JSON.stringify(dataInfra, null, 2));

    // LOGS
    const sizeDataIndexes = await readNerdStorageOnlyCollectionNoLogger(
      accountId,
      'Get all indexes'
    );
    const dataIndexes = [];
    for (let i = 0; i < sizeDataIndexes.length; i++) {
      let listo = [];
      listo = await readNerdStorageNoLogger(
        accountId,
        'Get all indexes',
        `Get all indexes-${i}`
      );
      for (const iterator of listo) {
        dataIndexes.push(iterator);
      }
    }
    zip.file(`Get all indexes.json`, JSON.stringify(dataIndexes, null, 2));

    const dataPipelines = [];
    const sizeDataPipelines = await readNerdStorageOnlyCollectionNoLogger(
      accountId,
      'Get all Pipelines'
    );
    for (let i = 0; i < sizeDataPipelines.length; i++) {
      let listo = [];
      listo = await readNerdStorageNoLogger(
        accountId,
        'Get all Pipelines',
        `Get all Pipelines-${i}`
      );
      for (const iterator of listo) {
        dataPipelines.push(iterator);
      }
    }
    zip.file(`Get all Pipelines.json`, JSON.stringify(dataPipelines, null, 2));
    // METRICS
    const sizeDataMetrics = await readNerdStorageOnlyCollectionNoLogger(
      accountId,
      'Get All Active Metrics'
    );
    const dataMetrics = await readNerdStorageNoLogger(
      accountId,
      'Get All Active Metrics',
      'Get All Active Metrics-obj'
    );
    const listMetrics = [];
    for (let i = 0; i < sizeDataMetrics.length - 1; i++) {
      let listo = [];
      listo = await readNerdStorageNoLogger(
        accountId,
        'Get All Active Metrics',
        `Get All Active Metrics-${i}`
      );
      for (const iterator of listo) {
        listMetrics.push(iterator);
      }
    }
    if (dataMetrics) {
      dataMetrics.metrics = listMetrics;
    }
    zip.file(
      'Get All Active Metrics.json',
      JSON.stringify(dataMetrics, null, 2)
    );

    // SYNTHETICS
    const sizeDataSynthetics = await readNerdStorageOnlyCollectionNoLogger(
      accountId,
      'Get all tests'
    );
    const dataSynthetics = [];
    for (let i = 0; i < sizeDataSynthetics.length; i++) {
      let listo = [];
      listo = await readNerdStorageNoLogger(
        accountId,
        'Get all tests',
        `Get all tests-${i}`
      );
      for (const iterator of listo) {
        dataSynthetics.push(iterator);
      }
    }
    zip.file('Get all tests.json', JSON.stringify(dataSynthetics, null, 2));

    const sizeDataLocations = await readNerdStorageOnlyCollectionNoLogger(
      accountId,
      'Get available locations'
    );
    const dataLocations = [];
    for (let i = 0; i < sizeDataLocations.length; i++) {
      let listo = [];
      listo = await readNerdStorageNoLogger(
        accountId,
        'Get available locations',
        `Get available locations-${i}`
      );
      for (const iterator of listo) {
        dataLocations.push(iterator);
      }
    }
    zip.file(
      'Get available locations.json',
      JSON.stringify(dataLocations, null, 2)
    );

    // ACCOUNTS
    data = await readNerdStorageNoLogger(
      accountId,
      'Get all users',
      'Get all users-obj'
    );
    const sizeDataList = await readNerdStorageOnlyCollectionNoLogger(
      accountId,
      'Get all users-data'
    );
    const dataList = [];
    for (let i = 0; i < sizeDataList.length; i++) {
      let page = [];
      page = await readNerdStorageNoLogger(
        accountId,
        'Get all users-data',
        `Get all users-${i}`
      );
      for (const iterator of page) {
        dataList.push(iterator);
      }
    }
    const sizeIncludedList = await readNerdStorageOnlyCollectionNoLogger(
      accountId,
      'Get all users-included'
    );
    const includeList = [];
    for (let i = 0; i < sizeIncludedList.length; i++) {
      let pageIncluded = [];
      pageIncluded = await readNerdStorageNoLogger(
        accountId,
        'Get all users-included',
        `Get all users-${i}`
      );
      for (const iterator of pageIncluded) {
        includeList.push(iterator);
      }
    }
    if (data) {
      data.data = dataList;
      data.included = includeList;
    }
    zip.file('Get all users.json', JSON.stringify(data, null, 2));
    // Monitor Group Search
    const monitorGroupObj = await readNerdStorageNoLogger(
      accountId,
      'Monitor Group Search',
      'Monitor Group Search-obj'
    );
    const sizeMonitorGroup = await readNerdStorageOnlyCollectionNoLogger(
      accountId,
      'Monitor Group Search'
    );
    const listGroups = [];
    for (let i = 0; i < sizeMonitorGroup.length - 1; i++) {
      let page = [];
      page = await readNerdStorageNoLogger(
        accountId,
        'Monitor Group Search',
        `Monitor Group Search-${i}`
      );
      for (const iterator of page) {
        listGroups.push(iterator);
      }
    }
    if (monitorGroupObj) {
      monitorGroupObj.groups = listGroups;
    }
    zip.file(
      'Monitor Group Search.json',
      JSON.stringify(monitorGroupObj, null, 2)
    );
    // HOST TOTALS
    const hostTotals = await readNerdStorageNoLogger(
      accountId,
      'Host totals',
      `Host totals-obj`
    );
    zip.file('Host totals.json', JSON.stringify(hostTotals, null, 2));

    // TAGS
    const sizeTags = await readNerdStorageOnlyCollectionNoLogger(
      accountId,
      'Get Tags'
    );
    const listTags = [];
    for (let i = 0; i < sizeTags.length; i++) {
      let page = [];
      page = await readNerdStorageNoLogger(
        accountId,
        'Get Tags',
        `Get Tags-${i}`
      );
      for (const iterator of page) {
        listTags.push(iterator);
      }
    }
    zip.file('Get Tags.json', JSON.stringify(listTags, null, 2));
    // PIPELINE ORDER
    const sizePipeline = await readNerdStorageOnlyCollectionNoLogger(
      accountId,
      'Get Pipeline Order'
    );
    const pipelineList = [];
    for (let i = 0; i < sizePipeline.length; i++) {
      let page = [];
      page = await readNerdStorageNoLogger(
        accountId,
        'Get Pipeline Order',
        `Get Pipeline Order-${i}`
      );
      for (const iterator of page) {
        pipelineList.push(iterator);
      }
    }
    const pipeline = { pipeline_ids: pipelineList };
    zip.file('Get Pipeline Order.json', JSON.stringify(pipeline, null, 2));
    // Get indexes order
    const indexesSize = await readNerdStorageOnlyCollectionNoLogger(
      accountId,
      'Get indexes order'
    );
    const indexesList = [];
    for (let i = 0; i < indexesSize.length; i++) {
      let page = [];
      page = await readNerdStorageNoLogger(
        accountId,
        'Get indexes order',
        `Get indexes order-${i}`
      );
      for (const iterator of page) {
        indexesList.push(iterator);
      }
    }
    zip.file('Get indexes order.json', JSON.stringify(indexesList, null, 2));
    // Get devices for browser
    const deviceSize = await readNerdStorageOnlyCollectionNoLogger(
      accountId,
      'Get devices for browser checks'
    );
    const deviceList = [];
    for (let i = 0; i < deviceSize.length; i++) {
      let page = [];
      page = await readNerdStorageNoLogger(
        accountId,
        'Get devices for browser checks',
        `Get devices for browser checks-${i}`
      );
      for (const iterator of page) {
        deviceList.push(iterator);
      }
    }
    zip.file(
      'Get devices for browser checks.json',
      JSON.stringify(deviceList, null, 2)
    );
    // Get all embeddable graphs
    const sizeEmbedable = await readNerdStorageOnlyCollectionNoLogger(
      accountId,
      'Get all embeddable graphs'
    );
    const embedableList = [];
    for (let i = 0; i < sizeEmbedable.length; i++) {
      let page = [];
      page = await readNerdStorageNoLogger(
        accountId,
        'Get all embeddable graphs',
        `Get all embeddable graphs-${i}`
      );
      for (const iterator of page) {
        embedableList.push(iterator);
      }
    }
    zip.file(
      'Get all embeddable graphs.json',
      JSON.stringify(embedableList, null, 2)
    );
    // Get all Dashboard Lists
    const sizeDashboardList = await readNerdStorageOnlyCollectionNoLogger(
      accountId,
      'Get all Dashboard Lists'
    );
    const allDashboardList = [];
    for (let i = 0; i < sizeDashboardList.length; i++) {
      let page = [];
      page = await readNerdStorageNoLogger(
        accountId,
        'Get all Dashboard Lists',
        `Get all Dashboard Lists-${i}`
      );
      for (const iterator of page) {
        allDashboardList.push(iterator);
      }
    }
    zip.file(
      'Get all Dashboard Lists.json',
      JSON.stringify(allDashboardList, null, 2)
    );
    // Get a Dashboard List
    const sizeDashboard = await readNerdStorageOnlyCollectionNoLogger(
      accountId,
      'Get a Dashboard List'
    );
    const dashboardList = [];
    for (let i = 0; i < sizeDashboard.length; i++) {
      let page = [];
      page = await readNerdStorageNoLogger(
        accountId,
        'Get a Dashboard List',
        `Get a Dashboard List-${i}`
      );
      for (const iterator of page) {
        dashboardList.push(iterator);
      }
    }
    zip.file(
      'Get a Dashboard List.json',
      JSON.stringify(dashboardList, null, 2)
    );
    // Date fetch
    const dateFetch = await readNerdStorageNoLogger(
      accountId,
      'ddFetch',
      `dateFetch`
    );
    zip.file('dateFetch.json', JSON.stringify(dateFetch, null, 2));
    zip.generateAsync({ type: 'blob' }).then(function (content) {
      // see FileSaver.js
      saveAs(content, 'Datadog.zip');
    });
    enableButton();
  } catch (err) {
    const response = {
      message: err.message,
      event: 'Download json config',
      type: 'Error',
      date: new Date().toLocaleString()
    };
    sendLogsSlack([response], accountId);
    enableButton();
  }
}

/**
 * Function to download the csv
 *
 * @param {*} enableButton
 */
async function downloadCSV(enableButton) {
  const accountId = await loadAccountId();
  try {
    const zip = new JSZip(); // Object that contains the zip files
    let data = [];
    let other = [];
    data = await readNerdStorageOnlyCollectionNoLogger(
      accountId,
      'Get all Dashboards'
    );
    for (let i = 0; i < data.length; i++) {
      let anyt = [];
      anyt = await readNerdStorageNoLogger(
        accountId,
        'Get all Dashboards',
        `Get all Dashboards-${i}`
      );
      for (const iterator of anyt) {
        other.push(iterator);
      }
    }
    data = other;

    // convert JSON array to CSV string
    jsoncsv.json2csv(data, (err, csv) => {
      if (err) {
        throw err;
      }
      zip.file(`Get all Dashboards.csv`, csv);
    });

    // widgets in dashboards
    other = [];
    data = await readNerdStorageOnlyCollectionNoLogger(
      accountId,
      'Get a Dashboard'
    );
    for (let i = 0; i < data.length; i++) {
      let anyt = [];
      anyt = await readNerdStorageNoLogger(
        accountId,
        'Get a Dashboard',
        `Get a Dashboard-${i}`
      );
      for (const iterator of anyt) {
        other.push(iterator);
      }
    }
    data = other;

    // convert JSON array to CSV string
    jsoncsv.json2csv(data, (err, csv) => {
      if (err) {
        throw err;
      }
      zip.file(`Get a Dashboard.csv`, csv);
    });
    // favorites & most viewed dashboards
    other = [];
    data = await readNerdStorageOnlyCollectionNoLogger(
      accountId,
      'Get Items of a Dashboard List'
    );
    for (let i = 0; i < data.length; i++) {
      let anyt = [];
      anyt = await readNerdStorageNoLogger(
        accountId,
        'Get Items of a Dashboard List',
        `Get Items of a Dashboard List-${i}`
      );
      for (const iterator of anyt) {
        other.push(iterator);
      }
    }
    data = other;

    // convert JSON array to CSV string
    jsoncsv.json2csv(data, (err, csv) => {
      if (err) {
        throw err;
      }
      zip.file(`Get Items of a Dashboard List.csv`, csv);
    });

    // MONITORS
    const dataMonitor = await readNerdStorageNoLogger(
      accountId,
      'Monitors meta',
      'Monitors meta-obj'
    );
    const sizeData = await readNerdStorageOnlyCollectionNoLogger(
      accountId,
      'Monitors meta'
    );
    const countsType = [];
    for (let i = 0; i < sizeData.length - 1; i++) {
      let list = [];
      list = await readNerdStorageNoLogger(
        accountId,
        'Monitors meta',
        `Monitors meta-${i}`
      );
      for (const iterator of list) {
        countsType.push(iterator);
      }
    }
    if (dataMonitor) {
      dataMonitor.countsType = countsType;
    }

    // convert JSON array to CSV string
    jsoncsv.json2csv(dataMonitor, (err, csv) => {
      if (err) {
        throw err;
      }
      zip.file(`Monitors meta.csv`, csv);
    });

    const monit = await readNerdStorageOnlyCollectionNoLogger(
      accountId,
      'Monitor Search Pages'
    );
    const monitors = [];
    for (let i = 0; i < monit.length; i++) {
      let listo = [];
      listo = await readNerdStorageNoLogger(
        accountId,
        'Monitor Search Pages',
        `Monitor Search Pages-${i}`
      );
      for (const iterator of listo) {
        if (iterator.monitors) {
          iterator.monitors.map(monitor => monitors.push(monitor));
        } else {
          monitors.push(iterator);
        }
      }
    }

    // convert JSON array to CSV string
    jsoncsv.json2csv(monitors, (err, csv) => {
      if (err) {
        throw err;
      }
      zip.file(`Monitor Search Pages.csv`, csv);
    });

    // INFRAESTRUCTURE
    const dataInfra = await readNerdStorageNoLogger(
      accountId,
      'Search hosts',
      'Search hosts-obj'
    );
    const sizeDataInfra = await readNerdStorageOnlyCollectionNoLogger(
      accountId,
      'Search hosts'
    );
    const hostList = [];
    for (let i = 0; i < sizeDataInfra.length - 1; i++) {
      let listo = [];
      listo = await readNerdStorageNoLogger(
        accountId,
        'Search hosts',
        `Search hosts-${i}`
      );
      for (const iterator of listo) {
        hostList.push(iterator);
      }
    }
    dataInfra.host_list = hostList;

    // convert JSON array to CSV string
    jsoncsv.json2csv(dataInfra, (err, csv) => {
      if (err) {
        throw err;
      }
      zip.file(`Search hosts.csv`, csv);
    });

    // LOGS
    const sizeDataIndexes = await readNerdStorageOnlyCollectionNoLogger(
      accountId,
      'Get all indexes'
    );
    const dataIndexes = [];
    for (let i = 0; i < sizeDataIndexes.length; i++) {
      let listo = [];
      listo = await readNerdStorageNoLogger(
        accountId,
        'Get all indexes',
        `Get all indexes-${i}`
      );
      for (const iterator of listo) {
        dataIndexes.push(iterator);
      }
    }

    // convert JSON array to CSV string
    jsoncsv.json2csv(dataIndexes, (err, csv) => {
      if (err) {
        throw err;
      }
      zip.file(`Get all indexes.csv`, csv);
    });

    const dataPipelines = [];
    const sizeDataPipelines = await readNerdStorageOnlyCollectionNoLogger(
      accountId,
      'Get all Pipelines'
    );
    for (let i = 0; i < sizeDataPipelines.length; i++) {
      let listo = [];
      listo = await readNerdStorageNoLogger(
        accountId,
        'Get all Pipelines',
        `Get all Pipelines-${i}`
      );
      for (const iterator of listo) {
        dataPipelines.push(iterator);
      }
    }

    // convert JSON array to CSV string
    jsoncsv.json2csv(dataPipelines, (err, csv) => {
      if (err) {
        throw err;
      }
      zip.file(`Get all Pipelines.csv`, csv);
    });

    // METRICS
    const sizeDataMetrics = await readNerdStorageOnlyCollectionNoLogger(
      accountId,
      'Get All Active Metrics'
    );
    const dataMetrics = await readNerdStorageNoLogger(
      accountId,
      'Get All Active Metrics',
      'Get All Active Metrics-obj'
    );
    const listMetrics = [];
    for (let i = 0; i < sizeDataMetrics.length - 1; i++) {
      let listo = [];
      listo = await readNerdStorageNoLogger(
        accountId,
        'Get All Active Metrics',
        `Get All Active Metrics-${i}`
      );
      for (const iterator of listo) {
        listMetrics.push(iterator);
      }
    }
    if (dataMetrics) {
      dataMetrics.metrics = listMetrics;
    }

    // convert JSON array to CSV string
    jsoncsv.json2csv(dataMetrics, (err, csv) => {
      if (err) {
        throw err;
      }
      zip.file(`Get All Active Metrics.csv`, csv);
    });

    // SYNTHETICS
    const sizeDataSynthetics = await readNerdStorageOnlyCollectionNoLogger(
      accountId,
      'Get all tests'
    );
    const dataSynthetics = [];
    for (let i = 0; i < sizeDataSynthetics.length; i++) {
      let listo = [];
      listo = await readNerdStorageNoLogger(
        accountId,
        'Get all tests',
        `Get all tests-${i}`
      );
      for (const iterator of listo) {
        dataSynthetics.push(iterator);
      }
    }

    // convert JSON array to CSV string
    jsoncsv.json2csv(dataSynthetics, (err, csv) => {
      if (err) {
        throw err;
      }
      zip.file(`Get all tests.csv`, csv);
    });

    const sizeDataLocations = await readNerdStorageOnlyCollectionNoLogger(
      accountId,
      'Get available locations'
    );
    const dataLocations = [];
    for (let i = 0; i < sizeDataLocations.length; i++) {
      let listo = [];
      listo = await readNerdStorageNoLogger(
        accountId,
        'Get available locations',
        `Get available locations-${i}`
      );
      for (const iterator of listo) {
        dataLocations.push(iterator);
      }
    }

    // convert JSON array to CSV string
    jsoncsv.json2csv(dataLocations, (err, csv) => {
      if (err) {
        throw err;
      }
      zip.file(`Get available locations.csv`, csv);
    });

    // ACCOUNTS
    data = await readNerdStorageNoLogger(
      accountId,
      'Get all users',
      'Get all users-obj'
    );
    const sizeDataList = await readNerdStorageOnlyCollectionNoLogger(
      accountId,
      'Get all users-data'
    );
    const dataList = [];
    for (let i = 0; i < sizeDataList.length; i++) {
      let page = [];
      page = await readNerdStorageNoLogger(
        accountId,
        'Get all users-data',
        `Get all users-${i}`
      );
      for (const iterator of page) {
        dataList.push(iterator);
      }
    }
    const sizeIncludedList = await readNerdStorageOnlyCollectionNoLogger(
      accountId,
      'Get all users-included'
    );
    const includeList = [];
    for (let i = 0; i < sizeIncludedList.length; i++) {
      let pageIncluded = [];
      pageIncluded = await readNerdStorageNoLogger(
        accountId,
        'Get all users-included',
        `Get all users-${i}`
      );
      for (const iterator of pageIncluded) {
        includeList.push(iterator);
      }
    }
    if (data) {
      data.data = dataList;
      data.included = includeList;
    }

    // convert JSON array to CSV string
    jsoncsv.json2csv(data, (err, csv) => {
      if (err) {
        throw err;
      }
      zip.file(`Get all users.csv`, csv);
    });

    // Monitor Group Search
    const monitorGroupObj = await readNerdStorageNoLogger(
      accountId,
      'Monitor Group Search',
      'Monitor Group Search-obj'
    );
    const sizeMonitorGroup = await readNerdStorageOnlyCollectionNoLogger(
      accountId,
      'Monitor Group Search'
    );
    const listGroups = [];
    for (let i = 0; i < sizeMonitorGroup.length - 1; i++) {
      let page = [];
      page = await readNerdStorageNoLogger(
        accountId,
        'Monitor Group Search',
        `Monitor Group Search-${i}`
      );
      for (const iterator of page) {
        listGroups.push(iterator);
      }
    }
    if (monitorGroupObj) {
      monitorGroupObj.groups = listGroups;
    }

    // convert JSON array to CSV string
    jsoncsv.json2csv(monitorGroupObj, (err, csv) => {
      if (err) {
        throw err;
      }
      zip.file(`Monitor Group Search.csv`, csv);
    });

    // HOST TOTALS
    const hostTotals = await readNerdStorageNoLogger(
      accountId,
      'Host totals',
      `Host totals-obj`
    );

    // convert JSON array to CSV string
    jsoncsv.json2csv(hostTotals, (err, csv) => {
      if (err) {
        throw err;
      }
      zip.file(`Host totals.csv`, csv);
    });

    // TAGS
    const sizeTags = await readNerdStorageOnlyCollectionNoLogger(
      accountId,
      'Get Tags'
    );
    const listTags = [];
    for (let i = 0; i < sizeTags.length; i++) {
      let page = [];
      page = await readNerdStorageNoLogger(
        accountId,
        'Get Tags',
        `Get Tags-${i}`
      );
      for (const iterator of page) {
        listTags.push(iterator);
      }
    }

    // convert JSON array to CSV string
    jsoncsv.json2csv(listTags, (err, csv) => {
      if (err) {
        throw err;
      }
      zip.file(`Get Tags.csv`, csv);
    });

    // PIPELINE ORDER
    const sizePipeline = await readNerdStorageOnlyCollectionNoLogger(
      accountId,
      'Get Pipeline Order'
    );
    const pipelineList = [];
    for (let i = 0; i < sizePipeline.length; i++) {
      let page = [];
      page = await readNerdStorageNoLogger(
        accountId,
        'Get Pipeline Order',
        `Get Pipeline Order-${i}`
      );
      for (const iterator of page) {
        pipelineList.push(iterator);
      }
    }
    const pipeline = { pipeline_ids: pipelineList };

    // convert JSON array to CSV string
    jsoncsv.json2csv(pipeline, (err, csv) => {
      if (err) {
        throw err;
      }
      zip.file(`Get Pipeline Order.csv`, csv);
    });

    // Get indexes order
    const indexesSize = await readNerdStorageOnlyCollectionNoLogger(
      accountId,
      'Get indexes order'
    );
    const indexesList = [];
    for (let i = 0; i < indexesSize.length; i++) {
      let page = [];
      page = await readNerdStorageNoLogger(
        accountId,
        'Get indexes order',
        `Get indexes order-${i}`
      );
      for (const iterator of page) {
        indexesList.push(iterator);
      }
    }

    // convert JSON array to CSV string
    jsoncsv.json2csv(indexesList, (err, csv) => {
      if (err) {
        throw err;
      }
      zip.file(`Get indexes order.csv`, csv);
    });

    // Get devices for browser
    const deviceSize = await readNerdStorageOnlyCollectionNoLogger(
      accountId,
      'Get devices for browser checks'
    );
    const deviceList = [];
    for (let i = 0; i < deviceSize.length; i++) {
      let page = [];
      page = await readNerdStorageNoLogger(
        accountId,
        'Get devices for browser checks',
        `Get devices for browser checks-${i}`
      );
      for (const iterator of page) {
        deviceList.push(iterator);
      }
    }

    // convert JSON array to CSV string
    jsoncsv.json2csv(deviceList, (err, csv) => {
      if (err) {
        throw err;
      }
      zip.file(`Get devices for browser checks.csv`, csv);
    });

    // Get all embeddable graphs
    const sizeEmbedable = await readNerdStorageOnlyCollectionNoLogger(
      accountId,
      'Get all embeddable graphs'
    );
    const embedableList = [];
    for (let i = 0; i < sizeEmbedable.length; i++) {
      let page = [];
      page = await readNerdStorageNoLogger(
        accountId,
        'Get all embeddable graphs',
        `Get all embeddable graphs-${i}`
      );
      for (const iterator of page) {
        embedableList.push(iterator);
      }
    }

    // convert JSON array to CSV string
    jsoncsv.json2csv(embedableList, (err, csv) => {
      if (err) {
        throw err;
      }
      zip.file(`Get all embeddable graphs.csv`, csv);
    });

    // Get all Dashboard Lists
    const sizeDashboardList = await readNerdStorageOnlyCollectionNoLogger(
      accountId,
      'Get all Dashboard Lists'
    );
    const allDashboardList = [];
    for (let i = 0; i < sizeDashboardList.length; i++) {
      let page = [];
      page = await readNerdStorageNoLogger(
        accountId,
        'Get all Dashboard Lists',
        `Get all Dashboard Lists-${i}`
      );
      for (const iterator of page) {
        allDashboardList.push(iterator);
      }
    }

    // convert JSON array to CSV string
    jsoncsv.json2csv(allDashboardList, (err, csv) => {
      if (err) {
        throw err;
      }
      zip.file(`Get all Dashboard Lists.csv`, csv);
    });

    // Get a Dashboard List
    const sizeDashboard = await readNerdStorageOnlyCollectionNoLogger(
      accountId,
      'Get a Dashboard List'
    );
    const dashboardList = [];
    for (let i = 0; i < sizeDashboard.length; i++) {
      let page = [];
      page = await readNerdStorageNoLogger(
        accountId,
        'Get a Dashboard List',
        `Get a Dashboard List-${i}`
      );
      for (const iterator of page) {
        dashboardList.push(iterator);
      }
    }

    // convert JSON array to CSV string
    jsoncsv.json2csv(dashboardList, (err, csv) => {
      if (err) {
        throw err;
      }
      zip.file(`Get a Dashboard List.csv`, csv);
    });

    // Date fetch
    const dateFetch = await readNerdStorageNoLogger(
      accountId,
      'ddFetch',
      `dateFetch`
    );

    // convert JSON array to CSV string
    jsoncsv.json2csv(dateFetch, (err, csv) => {
      if (err) {
        throw err;
      }
      zip.file(`dateFetch.csv`, csv);
      zip.generateAsync({ type: 'blob' }).then(function (content) {
        // see FileSaver.js
        saveAs(content, 'Datadogcsv.zip');
      });
    });

    enableButton();
  } catch (err) {
    const response = {
      message: err.message,
      event: 'Download json config',
      type: 'Error',
      date: new Date().toLocaleString()
    };
    sendLogsSlack([response], accountId);
    enableButton();
  }
}
/**
 * Function that save in nerdstorage vault
 * @param {String} key 
 * @param {String} value 
 */
async function writeSecretKey(key, value) {
  const gql = `
    mutation writeSecret($key: String!, $value: SecureValue!) {
      nerdStorageVaultWriteSecret(
        scope: { actor: CURRENT_USER }
        secret: { key: $key, value: $value }
      ) {
        status
        errors {
          message
          type
        }
      }
    }
  `;

  return NerdGraphMutation.mutate({
    mutation: gql,
    variables: {
      key,
      value
    }
  }).then((response) => {
    return response.data.nerdStorageVaultWriteSecret;
  }).catch(err => {
    return err.message;
  });
}

/**
 * Function that reads nerdstorage vault
 */
async function readSecretKeys() {
  const gql = `
  query {
    actor {
      nerdStorageVault {
        secrets {
          key
          value
        }
      }
    }
  }`;
  const dataInside = await NerdGraphQuery.query({ query: gql }).then((response) => {
    return response.data.actor.nerdStorageVault.secrets;
  }).catch(err => {
    return err.message;
  });
  return dataInside;
}

/**
 * Function that reads nerdstorage vault
 */
async function readSingleSecretKey(key) {
  const gql = `
  query {
    actor {
      nerdStorageVault {
        secret(key: "${key}") {
          key
          value
        }
      }
    }
  }`;
  const dataInside = await NerdGraphQuery.query({ query: gql }).then((response) => {
    return response.data.actor.nerdStorageVault.secret.value;
  }).catch(err => {
    return null;
  });
  return dataInside;
}

/**
 * Function that delete key save in nerdstorage vault
 * @param {String} key 
 */
async function deletSecretKey(key) {
  const gql = `
  mutation writeSecret($key: String!) {
    nerdStorageVaultDeleteSecret(
      scope: { actor: CURRENT_USER }
      key: $key
    ) {
      status
      errors {
        message
        type
      }
    }
  }
`;
  return NerdGraphMutation.mutate({
    mutation: gql,
    variables: {
      key
    }
  }).then((response) => {
    return response;
  }).catch(err => {
    return err.message;
  });
}

export {
  deleteSetup,
  loadAccountId,
  readDocumentSetup,
  readDateFetch,
  readDashportData,
  downloadJSON,
  downloadCSV,
  writeNerdStorage,
  readNerdStorage,
  writeNerdStorageReturnData,
  readNerdStorageOnlyCollection,
  writeSecretKey,
  readSecretKeys,
  deletSecretKey,
  readSingleSecretKey,
  recoveDataDashboards
};
