/**
 * Read DD StorageFiles using an external function,
 * then creates a Summary for App visualizations.
 */

const widget2nerdlet = [
  'alert_graph',
  'change',
  'check_status',
  'event_timeline',
  'group',
  'hostmap',
  'iframe',
  'log_stream',
  'manage_status',
  'scatterplot',
  'slo',
  'servicemap',
  'trace_service'
];

const highComplexityWidgetCount = 10;

const apiDataDigest = async (
  functionReader,
  functionWritter,
  reportLogFetch,
  functionReaderCollection
) => {
  const data = [];
  const collectionNames = [
    'dashboards',
    'monitors',
    'infraestructure',
    'logs',
    // 'metrics',
    'synthetics',
    'accounts'
  ];
  data.push(
    await _parseDashboars(
      functionReader,
      functionReaderCollection,
      reportLogFetch
    )
  );
  data.push(
    await _parseMonitors(
      functionReader,
      functionReaderCollection,
      reportLogFetch
    )
  );
  data.push(
    await _parseInfra(functionReader, functionReaderCollection, reportLogFetch)
  );
  data.push(
    await _parseLogs(functionReader, functionReaderCollection, reportLogFetch)
  );
  // data.push(
  //   await _parseMetrics(
  //     functionReader,
  //     functionReaderCollection,
  //     reportLogFetch
  //   )
  // );
  data.push(
    await _parseSynthetics(
      functionReader,
      functionReaderCollection,
      reportLogFetch
    )
  );
  data.push(
    await _parseAccounts(
      functionReader,
      functionReaderCollection,
      reportLogFetch
    )
  );
  for (const key in collectionNames) {
    if (collectionNames[key]) {
      await functionWritter(collectionNames[key], data[key]);
    }
  }
  return true;
};

const _parseDashboars = async (
  functionReader,
  functionReaderCollection,
  reportLogFetch
) => {
  const obj = {
    view: 'dashboards',
    data: {
      total: 0,
      list: []
    }
  };
  const errors = [];

  try {
    // dashboards Manual
    let data = [];
    let other = [];
    // total count of dashboards
    data = await functionReaderCollection('Get all Dashboards');
    for (let i = 0; i < data.length; i++) {
      let anyt = [];
      anyt = await functionReader(
        'Get all Dashboards',
        `Get all Dashboards-${i}`
      );
      for (const iterator of anyt) {
        other.push(iterator);
      }
    }
    data = other;
    if (data instanceof Array) {
      obj.data.total = data.length;
    }
    // widgets in dashboards
    other = [];
    data = await functionReaderCollection('Get a Dashboard');
    for (let i = 0; i < data.length; i++) {
      let anyt = [];
      anyt = await functionReader('Get a Dashboard', `Get a Dashboard-${i}`);
      for (const iterator of anyt) {
        other.push(iterator);
      }
    }
    data = other;
    if (data && data instanceof Array) {
      for (let i = 0; i < data.length; i++) {
        // new item
        const dbd = {
          id: data[i].id,
          name: data[i].data.title,
          autor: data[i].data.author_name ? data[i].data.author_name : '',
          creation: new Date(data[i].data.created_at),
          modified: new Date(data[i].data.modified_at),
          widgets: data[i].data.widgets,
          templateVariables: data[i].data.template_variables
            ? data[i].data.template_variables
            : [],
          description: data[i].data.description,
          layoutType: data[i].data.layout_type,
          url: `https://app.datadoghq.com${data[i].data.url}`,
          dashboardList: []
        };
        // add item to list
        obj.data.list.push(dbd);
      }
    }
    // popularity
    other = [];
    data = await functionReaderCollection('Get Items of a Dashboard List');
    for (let i = 0; i < data.length; i++) {
      let anyt = [];
      anyt = await functionReader(
        'Get Items of a Dashboard List',
        `Get Items of a Dashboard List-${i}`
      );
      for (const iterator of anyt) {
        other.push(iterator);
      }
    }
    data = other;
    if (data && data instanceof Array) {
      for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < data[i].data.dashboards.length; j++) {
          const dashboard = data[i].data.dashboards[j];
          for (const item of obj.data.list) {
            if (item.id === dashboard.new_id) {
              item.popularity = dashboard.popularity;
            }
          }
        }
      }
    }
    data = [];
    other = [];
    //add dashboard list
    data = await functionReaderCollection('Get Dashboards Manual');
    for (let i = 0; i < data.length; i++) {
      let ddManual = [];
      ddManual = await functionReader(
        'Get Dashboards Manual',
        `Get Dashboards Manual-${i}`
      );
      if (ddManual) {
        for (const iterator of ddManual) {
          other.push(iterator);
        }
      }
    }
    for (const list of other) {
      for (const dd of list.dashboards) {
        for (const ddObj of obj.data.list) {
          if (dd.id === ddObj.id) ddObj.dashboardList.push(list.name);
        }
      }
    }
  } catch (error) {
    const response = {
      message: error.message,
      event: 'Get dashboards data',
      type: 'Error',
      date: new Date().toLocaleString()
    };
    await reportLogFetch(response);
    errors.push(error);
  }
  return obj;
};

const _parseMonitors = async (
  functionReader,
  functionReaderCollection,
  reportLogFetch
) => {
  const obj = {
    view: 'monitors',
    data: {
      total: 0,
      type: [],
      monitors: []
    }
  };
  const errors = [];
  try {
    const data = await functionReader('Monitors meta', 'Monitors meta-obj');
    const sizeData = await functionReaderCollection('Monitors meta');
    const countsType = [];
    for (let i = 0; i < sizeData.length - 1; i++) {
      let list = [];
      list = await functionReader('Monitors meta', `Monitors meta-${i}`);
      for (const iterator of list) {
        countsType.push(iterator);
      }
    }
    if (data) {
      data.countsType = countsType;
      obj.data.total = data.metadata.total_count;
      obj.data.type = data.countsType;
      const monit = await functionReaderCollection('Monitor Search Pages');
      const monitors = [];
      for (let i = 0; i < monit.length; i++) {
        let listo = [];
        listo = await functionReader(
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
      obj.data.monitors = monitors;
    }
  } catch (error) {
    const response = {
      message: error.message,
      event: 'Get monitors data',
      type: 'Error',
      date: new Date().toLocaleString()
    };
    await reportLogFetch(response);
    errors.push(error);
  }
  return obj;
};

const _parseInfra = async (
  functionReader,
  functionReaderCollection,
  reportLogFetch
) => {
  const obj = {
    view: 'infrastructure',
    data: {
      total: 0,
      hostList: [],
      windowsCount: 0,
      linuxCount: 0
      // cpuCount: 0,
      // platform: {
      //   linux: {
      //     count: 0,
      //     versions: []
      //   },
      //   win: {
      //     count: 0,
      //     versions: []
      //   }
      // }
    }
  };
  const errors = [];
  try {
    const data = await functionReader('Search hosts', 'Search hosts-obj');
    const sizeData = await functionReaderCollection('Search hosts');
    const hostList = [];
    for (let i = 0; i < sizeData.length - 1; i++) {
      let listo = [];
      listo = await functionReader('Search hosts', `Search hosts-${i}`);
      for (const iterator of listo) {
        hostList.push(iterator);
      }
    }
    data.host_list = hostList;
    obj.data.hostList = hostList;
    if (data && data.host_list && data.host_list instanceof Array) {
      for (const host of data.host_list) {
        if (Object.entries(host.meta).length !== 0) {
          obj.data.total++;
          // obj.data.cpuCount += host.meta.cpuCores;
          // let memoryTotal = JSON.parse(host.meta.gohai).memory.total;
          // memoryTotal = memoryTotal.substring(0, memoryTotal.length - 1);
          // memoryTotal = memoryTotal.substring(0, memoryTotal.length - 1);
          // const memoryGB = parseInt(memoryTotal) / 1e+6;
          if (host.meta.platform === 'linux') {
            obj.data.linuxCount++;
            // obj.data.platform.linux.count++;
            // const version = `${host.meta.nixV[0]} ${host.meta.nixV[1]}`;
            // // const RAM=JSON.parse(host.meta.gohai).memory.total;
            // obj.data.platform.linux.versions.push({
            //   name: version,
            //   count: 1,
            //   processorModel: host.meta.processor,
            //   memory: `${memoryGB.toFixed(1)}GB`
            // });
          } else {
            obj.data.windowsCount++;
            // obj.data.platform.win.count++;
            // const version = `${host.meta.nixV[0]} ${host.meta.nixV[1]}`;
            // obj.data.platform.win.versions.push({
            //   name: version,
            //   count: 1,
            //   processorModel: host.meta.processor,
            //   memory: `${memoryGB.toFixed(1)}GB`
            // });
          }
        }
      }
      // obj.data.platform.win.versions = agroupData(
      //   obj.data.platform.win.versions
      // );
      // obj.data.platform.linux.versions = agroupData(
      //   obj.data.platform.linux.versions
      // );
    }
  } catch (error) {
    const response = {
      message: error.message,
      event: 'Get infraestructure data',
      type: 'Error',
      date: new Date().toLocaleString()
    };
    await reportLogFetch(response);
    errors.push(error);
  }
  return obj;
};

function agroupData(dataRepeat) {
  const filtrado = dataRepeat.reduce((acumu, valueActual) => {
    const existElement = acumu.find(
      element => element.name.toLowerCase() === valueActual.name.toLowerCase()
    );
    if (existElement) {
      return acumu.map(element => {
        if (element.name.toLowerCase() === valueActual.name.toLowerCase()) {
          return {
            ...element,
            count: element.count + valueActual.count
          };
        }
        return element;
      });
    }
    return [...acumu, valueActual];
  }, []);
  filtrado.sort(function(a, b) {
    if (a.count < b.count) {
      return 1;
    }
    if (a.count > b.count) {
      return -1;
    }
    // a must be equal to b
    return 0;
  });
  return filtrado;
}

const _parseLogs = async (
  functionReader,
  functionReaderCollection,
  reportLogFetch
) => {
  const obj = {
    view: 'logs',
    data: {
      archives: [],
      pipelines: [],
      metricsLogs: []
    }
  };
  try {
    //Get all archives
    let sizeData = await functionReaderCollection('Get all archives');
    let data = [];
    for (let i = 0; i < sizeData.length; i++) {
      let listo = [];
      listo = await functionReader('Get all archives', `Get all archives-${i}`);
      for (const iterator of listo) {
        data.push(iterator);
      }
    }
    if (data) {
      obj.data.archives = data;
    }
    //Logs based in metrics
    sizeData = await functionReaderCollection('Get all log based metrics');
    data = [];
    for (let i = 0; i < sizeData.length; i++) {
      let listo = [];
      listo = await functionReader(
        'Get all log based metrics',
        `Get all log based metrics-${i}`
      );
      for (const iterator of listo) {
        data.push(iterator);
      }
    }
    if (data) {
      obj.data.metricsLogs = data;
    }
    // let sizeData = await functionReaderCollection('Get all indexes');
    // let data = [];
    // for (let i = 0; i < sizeData.length; i++) {
    //   let listo = [];
    //   listo = await functionReader('Get all indexes', `Get all indexes-${i}`);
    //   for (const iterator of listo) {
    //     data.push(iterator);
    //   }
    // }
    // if (data) {
    //   obj.data.indexes = data.length;
    // }

    //pipelines
    data = [];
    sizeData = await functionReaderCollection('Get all Pipelines');
    for (let i = 0; i < sizeData.length; i++) {
      let listo = [];
      listo = await functionReader(
        'Get all Pipelines',
        `Get all Pipelines-${i}`
      );
      for (const iterator of listo) {
        data.push(iterator);
      }
    }
    if (data) {
      obj.data.pipelines = data;
    }
  } catch (error) {
    const response = {
      message: error.message,
      event: 'Get logs data',
      type: 'Error',
      date: new Date().toLocaleString()
    };
    await reportLogFetch(response);
  }
  return obj;
};

const _parseMetrics = async (
  functionReader,
  functionReaderCollection,
  reportLogFetch
) => {
  const obj = {
    view: 'metrics',
    data: []
  };
  const errors = [];

  try {
    const sizeData = await functionReaderCollection('Get All Active Metrics');
    let data = await functionReader(
      'Get All Active Metrics',
      'Get All Active Metrics-obj'
    );
    const listMetrics = [];
    for (let i = 0; i < sizeData.length - 1; i++) {
      let listo = [];
      listo = await functionReader(
        'Get All Active Metrics',
        `Get All Active Metrics-${i}`
      );
      for (const iterator of listo) {
        listMetrics.push(iterator);
      }
    }
    if (data) {
      data.metrics = listMetrics;
      data = data.metrics;
      obj.data = data;
    }
  } catch (error) {
    const response = {
      message: error.message,
      event: 'Get metrics data',
      type: 'Error',
      date: new Date().toLocaleString()
    };
    await reportLogFetch(response);
    errors.push(error);
  }
  return obj;
};

const _parseSynthetics = async (
  functionReader,
  functionReaderCollection,
  reportLogFetch
) => {
  const obj = {
    view: 'synthetics',
    data: {
      count: 0,
      test: []
    }
  };
  const errors = [];

  try {
    // TEST
    let sizeData = await functionReaderCollection('Get all tests');
    let data = [];
    for (let i = 0; i < sizeData.length; i++) {
      let listo = [];
      listo = await functionReader('Get all tests', `Get all tests-${i}`);
      for (const iterator of listo) {
        data.push(iterator);
      }
    }
    if (data && data instanceof Array) {
      obj.data.count = data.length;
      obj.data.test = data;
    }
    // sizeData = await functionReaderCollection('Get available locations');
    // data = [];
    // for (let i = 0; i < sizeData.length; i++) {
    //   let listo = [];
    //   listo = await functionReader(
    //     'Get available locations',
    //     `Get available locations-${i}`
    //   );
    //   for (const iterator of listo) {
    //     data.push(iterator);
    //   }
    // }
    // debugger
    // if (data && data instanceof Array) {
    //   obj.data.locations = data;
    // }
    // debugger
  } catch (error) {
    const response = {
      message: error.message,
      event: 'Get synthetics data',
      type: 'Error',
      date: new Date().toLocaleString()
    };
    await reportLogFetch(response);
    errors.push(error);
  }
  return obj;
};

const _parseAccounts = async (
  functionReader,
  functionReaderCollection,
  reportLogFetch
) => {
  const obj = {
    view: 'accounts',
    data: {
      total: 0,
      list: []
    }
  };
  const errors = [];
  try {
    let data = await functionReader('Get all users', 'Get all users-obj');
    const sizeDataList = await functionReaderCollection('Get all users-data');
    const dataList = [];
    for (let i = 0; i < sizeDataList.length; i++) {
      let page = [];
      page = await functionReader('Get all users-data', `Get all users-${i}`);
      for (const iterator of page) {
        dataList.push(iterator);
      }
    }
    const sizeIncludedList = await functionReaderCollection(
      'Get all users-included'
    );
    const includeList = [];
    for (let i = 0; i < sizeIncludedList.length; i++) {
      let pageIncluded = [];
      pageIncluded = await functionReader(
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
      data = data.data.map(x => {
        if (x.type === 'users') {
          return {
            name: x.attributes.name,
            email: x.attributes.email,
            verified: x.attributes.verified,
            disabled: x.attributes.disabled,
            status: x.attributes.status,
            created_at: x.attributes.created_at,
            roles: x.roles,
            organizations: x.organizations
          };
        }
        return false;
      });
      obj.data = {
        total: data.length,
        data: data
      };
    }
  } catch (error) {
    const response = {
      message: error.message,
      event: 'Get accounts data',
      type: 'Error',
      date: new Date().toLocaleString()
    };
    await reportLogFetch(response);
    errors.push(error);
  }
  return obj;
};

export { apiDataDigest };
