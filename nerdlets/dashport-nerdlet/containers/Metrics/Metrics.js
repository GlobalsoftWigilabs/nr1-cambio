import React from 'react';
import { Spinner } from 'nr1';
import PropTypes from 'prop-types';
import SearchInput, { createFilter } from 'react-search-input';
import { BsSearch } from 'react-icons/bs';
import iconDownload from '../../images/download.svg';
import ArrowDown from '../../components/ArrowsTable/ArrowDown';
import ArrowTop from '../../components/ArrowsTable/ArrowTop';
import Modal from '../../components/Modal';
import ReactTable from 'react-table-v6';
import Pagination from '../../components/Pagination/Pagination';
import Bar from '../../components/Bar';
import Select from 'react-select';
import axios from 'axios';
import {
  readNerdStorage,
  readSingleSecretKey,
  readNerdStorageOnlyCollection,
  writeNerdStorage
} from '../../services/NerdStorage/api';
import moment from 'moment';
import JSZip from 'jszip';
import jsoncsv from 'json-2-csv';
import { saveAs } from 'file-saver';

const greenColor = '#007E8A';

const KEYS_TO_FILTERS = ['name', 'host', 'integration', 'type', 'unit'];

export default class Metrics extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      allChecked: false,
      all: true,
      favorite: false,
      visited: false,
      complex: '',
      dashboards: [],
      average: 0,
      categorizedList: [],
      avaliableList: [],
      mostVisited: [],
      favoriteDashboards: [],
      savingAllChecks: false,
      logs: [],
      selectedTag: "all",
      timeRanges: [
        { value: '30 minutes', label: '30 minutes' },
        { value: '60 minutes', label: '60 minutes' },
        { value: '3 Hours', label: '3 Hours' },
        { value: '6 Hours', label: '6 Hours' }
      ],
      listChecked: {
        value: 'All',
        label: 'All list',
        id: 0,
        dashboards: []
      },
      listPopUp: [],
      valueListPopUp: {},
      // Pagination
      pagePag: 0,
      pages: 0,
      totalRows: 10,
      page: 1,
      ////////////
      finalList: [],
      textTag: '',
      searchTermMetric: '',
      sortColumn: {
        column: '',
        order: ''
      },
      hidden: false,
      action: '',
      checksDownload: [
        { value: "CSV", label: "CSV" },
        { value: "JSON", label: "JSON" }
      ],
      selectFormat: { value: "CSV", label: "CSV" },
      emptyData: false,
      dataGraph: [],
      rangeSelected: { value: "30 minutes", label: "30 minutes" },
      logs: [],
      loadingTable: false,
      metrics: [],
      metricsTotal: 0,
      keyApi: null,
      keyApp: null
    };
  }

  componentDidMount() {
    this.readMetrics();
  }

  readMetrics = async () => {
    const { accountId } = this.props;
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
    }
    this.setState({
      metricsTotal: metrics.data.length,
      metrics: metrics.data
    });
    await this.loadConfig();
    await this.loadDataApi(0, 10);
  }

  loadConfig = async () => {
    let retrys = 0,
      keyApi = null,
      keyApp = null;
    const keysName = ['apikey', 'appkey'];
    while (retrys !== 10) {
      keyApi = keyApi ? keyApi : await readSingleSecretKey(keysName[0]);
      keyApp = keyApp ? keyApp : await readSingleSecretKey(keysName[1]);
      if (keyApi && keyApp) {
        retrys = 10;
      } else {
        retrys += 1;
      }
    }
    this.setState({
      keyApi,
      keyApp
    });
  }

  loadDataApi = async (init, final) => {
    const { metrics, keyApi, keyApp } = this.state;
    let data = [];
    for (const metric of metrics) {
      data.push({
        name: metric
      })
    }
    const info = {
      headers: [
        {
          key: "DD-API-KEY",
          value: "{{datadog_api_key}}"
        },
        {
          key: "DD-APPLICATION-KEY",
          value: "{{datadog_application_key}}"
        }
      ]
    };
    info.headers = this._setHttpHeaders(info.headers, keyApi, keyApp);
    if (metrics && metrics instanceof Array) {
      var dataLimit = data.slice(init, final);
      for (const metric of dataLimit) {
        const index = data.findIndex(
          element => element.name === metric.name
        );
        const metricDetail = await this.getMetricDetails(info, metric.name);
        if (index !== -1) {
          data[index].integration = metricDetail.data.integration ? metricDetail.data.integration : '___';
          data[index].type = metricDetail.data.type ? metricDetail.data.type : '___';
          data[index].unit = metricDetail.data.unit ? metricDetail.data.unit : '___';
          data[index].host = 'All';
        }
      }
      const { searchTermMetric, sortColumn } = this.state;
      const dataGraph = [];
      for (const metric of data) {
        if (metric.type) {
          const index = dataGraph.findIndex(
            element => element.name === metric.type
          );
          if (index !== -1) {
            dataGraph[index].uv = dataGraph[index].uv + 1;
          } else {

            dataGraph.push({
              name: metric.type,
              pv: metrics.length,
              uv: 1
            });
          }
        }
      }
      this.setState({ dataGraph });
      this.loadData(data, searchTermMetric, sortColumn);
      this.calcTable(data);
    }
    this.setState({ loading: false });
  }

  calcTable = (finalList) => {
    let { totalRows, pagePag } = this.state;
    const aux = finalList.length % totalRows;
    let totalPages = 0;
    if (aux === 0) {
      totalPages = finalList.length / totalRows;
    } else {
      totalPages = Math.trunc(finalList.length / totalRows) + 1;
    }

    let pageNext = 0;
    if (pagePag < totalPages - 1 || pagePag === totalPages - 1) {
      pageNext = pagePag;
    } else if (pagePag > totalPages - 1) {
      pageNext = totalPages <= 0 ? 0 : totalPages - 1;
    }
    this.setState({ pages: totalPages, pagePag: pageNext });
  }

  loadData = (metrics, searchTerm, sortColumn) => {
    let finalList = metrics;
    if (searchTerm !== '') {
      finalList = finalList.filter(createFilter(searchTerm, KEYS_TO_FILTERS));
    }
    finalList = this.sortData(finalList, sortColumn);
    this.calcTable(finalList);
    this.setState({ finalList: finalList });
  }

  sortData = (finalList, { order, column }) => {
    let valueOne = 1;
    let valueTwo = -1;
    if (order === 'descent') {
      valueOne = -1;
      valueTwo = 1;
    }
    switch (column) {
      case 'name':
        const sortName = finalList.sort(function (a, b) {
          if (a.name > b.name) {
            return valueOne;
          }
          if (a.name < b.name) {
            return valueTwo;
          }
          return 0;
        });
        return sortName;
      case 'host':
        const sortHost = finalList.sort(function (a, b) {
          if (a.host > b.host) {
            return valueOne;
          }
          if (a.host < b.host) {
            return valueTwo;
          }
          return 0;
        });
        return sortHost;
      case 'integration':
        const sortIntegration = finalList.sort(function (a, b) {
          if (a.integration > b.integration) {
            return valueOne;
          }
          if (a.integration < b.integration) {
            return valueTwo;
          }
          return 0;
        });
        return sortIntegration;
      case 'type':
        const sortType = finalList.sort(function (a, b) {
          if (a.type > b.type) {
            return valueOne;
          }
          if (a.type < b.type) {
            return valueTwo;
          }
          return 0;
        });
        return sortType;
      case 'unit':
        const sortUnit = finalList.sort(function (a, b) {
          if (a.unit > b.unit) {
            return valueOne;
          }
          if (a.unit < b.unit) {
            return valueTwo;
          }
          return 0;
        });
        return sortUnit;
      default:
        return finalList;
    }
  }


  upPage = async () => {
    const { totalRows, pagePag } = this.state;
    this.setState({ loadingTable: true });
    await this.loadDataApi((pagePag + 1) * totalRows, (pagePag + 2) * totalRows);
    this.setState({ pagePag: pagePag + 1, loadingTable: false });
  };

  changePage = async pagePag => {
    const { totalRows } = this.state;
    this.setState({ loadingTable: true });
    await this.loadDataApi((pagePag - 1) * totalRows, pagePag * totalRows);
    this.setState({ pagePag: pagePag - 1, loadingTable: false });
  };

  downPage = async () => {
    const { totalRows, pagePag } = this.state;
    this.setState({ loadingTable: true });
    await this.loadDataApi((pagePag - 1) * totalRows, ((pagePag - 1) * totalRows) + totalRows);
    this.setState({ pagePag: pagePag - 1, loadingTable: false });
  };

  searchUpdated = (term) => {
    const { sortColumn } = this.state;
    const { metrics } = this.props;
    this.loadData(metrics, term, sortColumn);
    this.setState({ searchTermDashboards: term });
  }

  _onClose = () => {
    let actualValue = this.state.hidden;
    this.setState({ hidden: !actualValue });
  }

  returnActionPopUp = (action) => {
    return (
      <div>CONTENT POPUP BASED ON ACTION</div>
    )
  }

  confirmAction = async (action) => {
    this._onClose();
    //DO ACTION WHEN CLICK CONFIRM BUTTON
  }

  setSortColumn = (column) => {
    const { sortColumn, finalList, searchTermMetric } = this.state;
    let order = "";
    if (sortColumn.column === column) {
      if (sortColumn.order === '') {
        order = "ascendant";
      } else if (sortColumn.order === 'ascendant') {
        order = "descent";
      } else {
        order = '';
      }
    } else if (sortColumn.column === '' || sortColumn.column !== column) {
      order = 'ascendant';
    }
    if (sortColumn.column === column && sortColumn.order === 'descent') {
      column = '';
    }
    this.loadData(finalList, searchTermMetric,
      { column: column, order: order })
    this.setState({
      sortColumn: {
        column: column,
        order: order
      }
    });
  }

  customStyles = {
    option: provided => ({
      ...provided,
      fontSize: 13
    }),
    control: styles => ({
      ...styles,
      backgroundColor: 'white',
      textTransform: 'capitalize',
      fontSize: '12px',
      lineHeight: '16px',
      fontFamily: 'Open Sans'
    }),
    singleValue: (provided, state) => {
      const opacity = state.isDisabled ? 0.5 : 1;
      const transition = 'opacity 300ms';
      return { ...provided, opacity, transition };
    },
    menuList: provided => ({
      ...provided,
      textTransform: 'capitalize'
    }),
    menu: provided => ({
      ...provided,
      textTransform: 'capitalize'
    }),
    container: provided => ({
      ...provided,
      width: "100%"
    })
  };

  handleRange = (value) => {
    this.setState({ rangeSelected: value });
  }

  fetchData = async () => {
    this.setState({ loadingTable: true });
    const { rangeSelected, keyApp, keyApi } = this.state
    const info = {
      name: "Get All Active Metrics",
      url: "https://api.datadoghq.{{datadog_site}}/api/v1/metrics?",
      proto: "https",
      host: "api.datadoghq.{{datadog_site}}",
      pathname: "/api/v1/metrics?",
      headers: [
        {
          key: "DD-API-KEY",
          value: "{{datadog_api_key}}"
        },
        {
          key: "DD-APPLICATION-KEY",
          value: "{{datadog_application_key}}"
        }
      ]
    };
    info.headers = this._setHttpHeaders(info.headers, keyApi, keyApp);
    let date = new Date();
    let end_ts = Math.floor(new Date() / 1000);
    let start_ts = 0;
    switch (rangeSelected.value) {
      case '30 minutes':
        start_ts = end_ts - 60 * 30
        date.setMinutes(date.getMinutes() - 30);
        break;
      case '60 minutes':
        start_ts = end_ts - 60 * 60
        date.setMinutes(date.getMinutes() - 60);
        break;
      case '3 Hours':
        start_ts = end_ts - 60 * 180
        date.setMinutes(date.getMinutes() - 180);
        break;
      case '6 Hours':
        start_ts = end_ts - 60 * 360
        date.setMinutes(date.getMinutes() - 360);
        break;
    }
    const from = moment(date).unix();
    const response = await this.callApiMetric(info, from);
    const metricObj = {};
    metricObj.from = start_ts;
    metricObj.metrics = response.data.metrics;
    await this.saveNerdstorage(metricObj);
    await this.readMetrics();
    this.setState({ loadingTable: false });
  }

  saveNerdstorage = async (data) => {
    const { accountId } = this.props;
    const metricsList = data.metrics;
    data.metrics = [];
    const metricObj = data;
    const pagesMetricsList = this.pagesOfData(metricsList);
    // guardo obj metrics
    await writeNerdStorage(
      accountId,
      'metrics',
      `metrics-obj`,
      metricObj,
      this.reportLogFetch
    );
    // guardo lista de metricas
    for (const keyMetrics in pagesMetricsList) {
      if (pagesMetricsList[keyMetrics]) {
        await writeNerdStorage(
          accountId,
          'metrics',
          `metrics-${keyMetrics}`,
          pagesMetricsList[keyMetrics],
          this.reportLogFetch
        );
      }
    }
  }

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

  _setHttpHeaders = (obj, apiKey, appkey) => {
    const headers = {};
    for (let i = 0; i < obj.length; i++) {
      headers[obj[i].key] = obj[i].value
        .replace('{{datadog_api_key}}', apiKey)
        .replace('{{datadog_application_key}}', appkey);
    }
    return headers;
  };


  callApiMetric = async (info, from) => {
    const proxyUrl = 'https://long-meadow-1713.rsamanez.workers.dev/?';
    let ret = null;
    const options = {
      baseURL: `${proxyUrl + info.proto}://${info.host.replace(
        '{{datadog_site}}',
        'com'
      )}`,
      url:
        info.pathname,
      params: {
        from: from
      },
      headers: info.headers,
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
          await this.reportLogFetch(response);
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
          await this.reportLogFetch(response);
        }
      } else if (error.request) {
        // The request was made but no response was received
      } else {
        // Something happened in setting up the request that triggered an Error
      }
    });
    return ret;
  }

  getMetricDetails = async (info, metricName) => {
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
        'com'
      )}`,
      headers: info.headers,
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
          await this.reportLogFetch(response);
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
          await this.reportLogFetch(response);
        }
      } else if (error.request) {
        // The request was made but no response was received
      } else {
        // Something happened in setting up the request that triggered an Error
      }
    });
    return ret;
  };

  downloadData = async () => {
    const { finalList } = this.state;
    const date = new Date();
    const zip = new JSZip();
    jsoncsv.json2csv(finalList, (err, csv) => {
      if (err) {
        throw err;
      }
      zip.file(`Metrics.csv`, csv);
      zip.generateAsync({ type: 'blob' }).then(function (content) {
        // see FileSaver.js
        saveAs(content, `Datadog ${date.getDate()}-${(date.getMonth() + 1)}-${date.getFullYear()}.zip`);
      });
    });
  }

  render() {
    const {
      loading,
      pagePag,
      pages,
      totalRows,
      hidden,
      sortColumn,
      action,
      finalList,
      dataGraph,
      timeRanges,
      rangeSelected,
      loadingTable,
      metricsTotal
    } = this.state;
    return (
      <div className="h100">
        {loading ? (
          <Spinner type={Spinner.TYPE.DOT} />
        ) : (
            <div className="mainContent">
              <div className="mainContent__information">
                <div className="information__box">
                  <span
                    className="box--title"
                    style={{
                      color: greenColor
                    }}>
                    Active Metrics
                                    </span>
                  <div onClick={() => alert('Action')} className="pointer">
                    <span
                      className="box--quantity"
                      style={{
                        color: greenColor
                      }}>
                      {metricsTotal}
                    </span>
                  </div>
                </div>
                <div className="box-content">
                  <div className="f14" style={{ height: '50%', display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
                    <span>{dataGraph.length !== 0 && ('Metrics by type')}</span>
                  </div>
                  <div
                    style={{ height: '50%', width: '95%' }}
                    className="graphsBarAlert__containeScroll"
                  >
                    {dataGraph && (
                      dataGraph.map((data, index) => {
                        const { name, uv, pv } = data;
                        const total = (uv * 100) / (uv + pv);
                        return (
                          <div
                            key={index}
                            className="w100"
                            style={{
                              paddingBottom: '10px',
                              paddingTop: '10px',
                              width: '94%'
                            }}
                          >
                            <Bar
                              bgColor="#ECEEEE"
                              bgcolorMain="#007E8A"
                              title={name}
                              quantityPercentage={total}
                              quantity={uv}
                            />
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
              <div className="mainContent__tableContent">
                <div className="tableContent__filterMetric">
                  <div className="filters__search">
                    <div className="search__content">
                      <BsSearch size="10px" color={"#767B7F"} />
                      <SearchInput
                        className="filters--searchInput"
                        onChange={this.searchUpdated}
                      />
                    </div>
                  </div>
                  <Select
                    classNamePrefix="react-select"
                    styles={this.customStyles}
                    isSearchable={false}
                    options={timeRanges}
                    onChange={this.handleRange}
                    value={rangeSelected}
                    placeholder="All"
                  />
                  <div className="buttonFetchMetric pointer"
                    onClick={() => this.fetchData()}
                  >Fetch</div>
                  <div className={finalList.length === 0 ? 'pointerBlock flex flexCenterVertical' : 'pointer flex flexCenterVertical'}
                    onClick={() => {
                      if (finalList.length !== 0)
                        this.downloadData()
                    }}
                  >
                    <img src={iconDownload} style={{ marginLeft: "20px" }} height="18px" />
                  </div>
                  {finalList.length !== 0 &&
                    <Pagination
                      page={pagePag}
                      pages={pages}
                      upPage={this.upPage}
                      goToPage={this.changePage}
                      downPage={this.downPage}
                    />}
                </div>
                <div className="tableContent__table">
                  <div className="h100">
                    <ReactTable
                      loading={loadingTable}
                      loadingText={'Processing...'}
                      page={pagePag}
                      showPagination={false}
                      resizable={false}
                      data={finalList}
                      defaultPageSize={totalRows}
                      getTrProps={(state, rowInfo) => {
                        {
                          if (rowInfo) {
                            return {
                              style: {
                                background: rowInfo.index % 2 ? '#F7F7F8' : 'white',
                                borderBottom: 'none',
                                display: 'grid',
                                gridTemplate: '1fr/ 40% repeat(4,15%)'
                              }
                            };
                          } else {
                            return {
                              style: {
                                borderBottom: 'none',
                                display: 'grid',
                                gridTemplate: '1fr/ 40% repeat(4,15%)'
                              }
                            };
                          }
                        }
                      }
                      }
                      getTrGroupProps={() => {
                        return {
                          style: {
                            borderBottom: 'none'
                          }
                        };
                      }}
                      getNoDataProps={() => {
                        return {
                          style: {
                            marginTop: '60px'
                          }
                        };
                      }}
                      getTheadTrProps={() => {
                        return {
                          style: {
                            background: '#F7F7F8',
                            color: '#333333',
                            fontWeight: 'bold',
                            display: 'grid',
                            gridTemplate: '1fr/ 40% repeat(4,15%)'
                          }
                        };
                      }}
                      columns={[
                        {
                          Header: () => (
                            <div className="table__headerAlignRight">
                              <div className="pointer flex flexCenterHorizontal" style={{ marginLeft: "5px" }} onClick={() => { this.setSortColumn('name') }}>
                                NAME
                              <div className="flexColumn table__sort">
                                  <ArrowTop color={sortColumn.column === 'name' && sortColumn.order === 'ascendant' ? "black" : "gray"} />
                                  <ArrowDown color={sortColumn.column === 'name' && sortColumn.order === 'descent' ? "black" : "gray"} />
                                </div>
                              </div>
                            </div>
                          ),
                          headerClassName: ' w100I',
                          className: '  table__cell h100 w100I',
                          accessor: 'name',
                          sortable: false,
                          Cell: props => {
                            return (
                              <div
                                className="h100 flex"
                                style={{
                                  background: props.index % 2 ? "#F7F7F8" : "white"
                                }}>
                                <span style={{ marginLeft: "5px" }}>{props.value ? props.value : '___'}</span>
                              </div>
                            )
                          }
                        },
                        {
                          Header: () => (
                            <div className="table__headerAlignRight">
                              <div className="pointer flex " onClick={() => { this.setSortColumn('integration') }}>
                                INTEGRATION
                              <div className="flexColumn table__sort">
                                  <ArrowTop color={sortColumn.column === 'integration' && sortColumn.order === 'ascendant' ? "black" : "gray"} />
                                  <ArrowDown color={sortColumn.column === 'integration' && sortColumn.order === 'descent' ? "black" : "gray"} />
                                </div>
                              </div>
                            </div>
                          ),
                          headerClassName: 'w100I',
                          accessor: 'integration',
                          className: 'table__cell flex flexCenterVertical h100 w100I',
                          sortable: false,
                          Cell: props => <div className="h100 flex flexCenterVertical">
                            {props.value ? props.value : '___'}
                          </div>
                        },
                        {
                          Header: () => (
                            <div className="table__headerAlignRight">
                              <div className="pointer flex " onClick={() => { this.setSortColumn('type') }}>
                                TYPE
                              <div className="flexColumn table__sort">
                                  <ArrowTop color={sortColumn.column === 'type' && sortColumn.order === 'ascendant' ? "black" : "gray"} />
                                  <ArrowDown color={sortColumn.column === 'type' && sortColumn.order === 'descent' ? "black" : "gray"} />
                                </div>
                              </div>
                            </div>
                          ),
                          headerClassName: 'w100I',
                          accessor: 'type',
                          className: 'table__cell flex  flexCenterVertical h100 w100I',
                          sortable: false,
                          Cell: props => <div className="h100 flex flexCenterVertical ">
                            {props.value ? props.value : '___'}
                          </div>
                        },
                        {
                          Header: () => (
                            <div className="table__headerAlignRight">
                              <div className="pointer flex " onClick={() => { this.setSortColumn('host') }}>
                                HOST
                              <div className="flexColumn table__sort">
                                  <ArrowTop color={sortColumn.column === 'host' && sortColumn.order === 'ascendant' ? "black" : "gray"} />
                                  <ArrowDown color={sortColumn.column === 'host' && sortColumn.order === 'descent' ? "black" : "gray"} />
                                </div>
                              </div>
                            </div>
                          ),
                          headerClassName: 'w100I',
                          accessor: 'host',
                          className: 'table__cell flex  flexCenterVertical h100 w100I',
                          sortable: false,
                          Cell: props => <div className="h100 flex flexCenterVertical ">
                            {props.value ? props.value : '___'}
                          </div>
                        },
                        {
                          Header: () => (
                            <div className="table__headerAlignRight">
                              <div className="pointer flex " onClick={() => { this.setSortColumn('unit') }}>
                                UNIT
                              <div className="flexColumn table__sort">
                                  <ArrowTop color={sortColumn.column === 'unit' && sortColumn.order === 'ascendant' ? "black" : "gray"} />
                                  <ArrowDown color={sortColumn.column === 'unit' && sortColumn.order === 'descent' ? "black" : "gray"} />
                                </div>
                              </div>
                            </div>
                          ),
                          headerClassName: 'w100I',
                          accessor: 'unit',
                          className: 'table__cell flex  flexCenterVertical h100 w100I',
                          sortable: false,
                          Cell: props => <div className="h100 flex flexCenterVertical ">
                            {props.value ? props.value : '___'}
                          </div>
                        }
                      ]}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        <Modal
          hidden={hidden}
          _onClose={this._onClose}
          confirmAction={this.confirmAction}
        >
          {this.returnActionPopUp(action)}
        </Modal>
      </div>
    );
  }
}
Metrics.propTypes = {
  metricsTotal: PropTypes.number.isRequired,
  metrics: PropTypes.array.isRequired
};
