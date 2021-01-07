import React from 'react';
import { Spinner, Button, Tooltip } from 'nr1';
import Popup from 'reactjs-popup';
import information from '../../images/information.svg';
import informationMetrics from '../../images/metrics.png';
import PropTypes from 'prop-types';
import SearchInput, { createFilter } from 'react-search-input';
import { BsSearch } from 'react-icons/bs';
import iconDownload from '../../images/download.svg';
import ArrowDown from '../../components/ArrowsTable/ArrowDown';
import ArrowTop from '../../components/ArrowsTable/ArrowTop';
import ReactTable from 'react-table-v6';
import Pagination from '../../components/Pagination/Pagination';
import Bar from '../../components/Bar';
import Select from 'react-select';
import axios from 'axios';
import iconInformation from '../../images/information.svg';
import metricsData from '../../images/metricsData.svg';
import ReactTooltip from 'react-tooltip';
import Modal from './ModalProgressBar';
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

const KEYS_TO_FILTERS = ['name', 'hosts', 'integration', 'type', 'unit', 'aggr'];

const contentStyle = {
  maxWidth: '600px',
  width: '90%'
};

export default class Metrics extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
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
      selectedTag: 'all',
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
        { value: 'CSV', label: 'CSV' },
        { value: 'JSON', label: 'JSON' }
      ],
      selectFormat: { value: 'CSV', label: 'CSV' },
      emptyData: false,
      dataGraph: [],
      rangeSelected: { value: '30 minutes', label: '30 minutes' },
      logs: [],
      loadingTable: false,
      metrics: [],
      metricsTotal: 0,
      keyApi: null,
      keyApp: null,
      finalListRespaldo: [],
      hidden: false,
      viewWarning:false,
      info: {
        name: 'Get All Active Metrics',
        url: 'https://api.datadoghq.{{datadog_site}}/api/v1/metrics?',
        proto: 'https',
        host: 'api.datadoghq.{{datadog_site}}',
        pathname: '/api/v1/metrics?',
        headers: [
          {
            key: 'DD-API-KEY',
            value: '{{datadog_api_key}}'
          },
          {
            key: 'DD-APPLICATION-KEY',
            value: '{{datadog_application_key}}'
          }
        ]
      }
    };
  }

  _onClose = () => {
    if(this.props.completed===100) this.props.updateProgressMetrics(0);
    let actualValue = this.state.hidden;
    this.setState({ hidden: !actualValue });
  };

  _onCloseText = () => {
    let actualValue = this.state.hidden;
    this.setState({ hidden: !actualValue });
  };

  _openPopUp = () => {
    let actualValue = this.state.hidden;
    this.setState({ hidden: !actualValue,viewWarning:true });
  };

  componentDidMount() {
    const { accountId, metrics } = this.props;
    const { searchTermMetric, sortColumn } = this.state;

    const dataGraph = [];
    for (const metric of metrics) {
      metric.type = metric.type ? metric.type : 'unknow';
    }
    // eslint-disable-next-line require-atomic-updates
    for (const metric of metrics) {
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
    this.setState({
      dataGraph: dataGraph,
      metricsTotal: metrics.length,
      metrics: metrics,
      finalListRespaldo: metrics,
      pagePag: 0,
      page: 1
    });

    this.loadData(metrics, searchTermMetric, sortColumn);
    this.calcTable(metrics);
  }

  fetchMetrics = async from => {
    let { appComponent } = this.props;
    await appComponent.updateMetricsSection(from);
  };

  calcTable = finalList => {
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
  };

  loadData = (metrics, searchTerm, sortColumn) => {
    let finalList = metrics;
    const { pagePag, totalRows } = this.state;
    if (searchTerm !== '') {
      let init = pagePag * totalRows;
      let final = (pagePag + 1) * totalRows;
      finalList = finalList.slice(init, final);
      finalList = finalList.filter(createFilter(searchTerm, KEYS_TO_FILTERS));
    }
    finalList = this.sortData(finalList, sortColumn);
    this.calcTable(finalList);
    this.setState({ finalList: finalList });
  };

  sortData = (finalList, { order, column }) => {
    let valueOne = 1;
    let valueTwo = -1;
    if (order === 'descent') {
      valueOne = -1;
      valueTwo = 1;
    }
    switch (column) {
      case 'name':
        // eslint-disable-next-line no-case-declarations
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
        // eslint-disable-next-line no-case-declarations
        const sortHost = finalList.sort(function (a, b) {
          if (a.hosts > b.hosts) {
            return valueOne;
          }
          if (a.hosts < b.hosts) {
            return valueTwo;
          }
          return 0;
        });
        return sortHost;
      case 'integration':
        // eslint-disable-next-line no-case-declarations
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
        // eslint-disable-next-line no-case-declarations
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
        // eslint-disable-next-line no-case-declarations
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
  };

  upPage = async () => {
    const { totalRows, pagePag } = this.state;
    this.setState({ pagePag: pagePag + 1, loadingTable: false });
  };

  changePage = async pagePag => {
    const { totalRows } = this.state;
    this.setState({ pagePag: pagePag - 1, loadingTable: false });
  };

  downPage = async () => {
    const { totalRows, pagePag } = this.state;
    this.setState({ pagePag: pagePag - 1, loadingTable: false });
  };

  searchUpdated = term => {
    const { sortColumn, finalListRespaldo } = this.state;
    this.loadData(finalListRespaldo, term, sortColumn);
    this.setState({ searchTermDashboards: term });
  };

  setSortColumn = column => {
    const { sortColumn, finalList, searchTermMetric } = this.state;
    let order = '';
    if (sortColumn.column === column) {
      if (sortColumn.order === '') {
        order = 'ascendant';
      } else if (sortColumn.order === 'ascendant') {
        order = 'descent';
      } else {
        order = '';
      }
    } else if (sortColumn.column === '' || sortColumn.column !== column) {
      order = 'ascendant';
    }
    if (sortColumn.column === column && sortColumn.order === 'descent') {
      column = '';
    }
    this.loadData(finalList, searchTermMetric, {
      column: column,
      order: order
    });
    this.setState({
      sortColumn: {
        column: column,
        order: order
      }
    });
  };

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
      width: '100%'
    })
  };

  handleRange = value => {
    this.setState({ rangeSelected: value });
  };

  fetchData = async () => {
    const { rangeSelected } = this.state;
    const date = new Date();
    switch (rangeSelected.value) {
      case '30 minutes':
        date.setMinutes(date.getMinutes() - 30);
        break;
      case '60 minutes':
        date.setMinutes(date.getMinutes() - 60);
        break;
      case '3 Hours':
        date.setMinutes(date.getMinutes() - 180);
        break;
      case '6 Hours':
        date.setMinutes(date.getMinutes() - 360);
        break;
    }
    const from = moment(date).unix();
    await this.fetchMetrics(from);
  };

  saveNerdstorage = async metricList => {
    const { accountId } = this.props;
    const pagesMetricsList = this.pagesOfData(metricList);
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
  };

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

  downloadData = async () => {
    const { finalList } = this.state;
    const dataFiltrada = [];
    for (const metric of finalList) {
      dataFiltrada.push({
        NAME: metric.name,
        INTEGRATION: metric.integration ? metric.integration : '-----',
        TYPE: metric.type ? metric.type : '-----',
        HOST: metric.hosts,
        UNIT: metric.unit ? metric.unit : '-----',
        AGNN_TYPE: metric.aggr ? metric.aggr : '-----'
      })
    }
    const date = new Date();
    const zip = new JSZip();
    jsoncsv.json2csv(dataFiltrada, (err, csv) => {
      if (err) {
        throw err;
      }
      zip.file(`Metrics.csv`, csv);
      zip.generateAsync({ type: 'blob' }).then(function (content) {
        // see FileSaver.js
        saveAs(
          content,
          `Datadog ${date.getDate()}-${date.getMonth() +
          1}-${date.getFullYear()}.zip`
        );
      });
    });
  };

  render() {
    const {
      loading,
      pagePag,
      pages,
      totalRows,
      sortColumn,
      finalList,
      dataGraph,
      timeRanges,
      rangeSelected,
      loadingTable,
      metricsTotal,
      hidden,
      viewWarning
    } = this.state;
    const { fetchingMetrics, completed } = this.props;
    return (
      <div className="h100">
        {loading ? (
          <Spinner type={Spinner.TYPE.DOT} />
        ) : (
            <div className="mainContent">
              <div className="mainContent__information">
                <div className="information__box">
                  <span
                    className="box--title box--metrics"
                    style={{
                      color: greenColor,
                      position: 'relative'
                    }}
                  >
                    Active Metrics{' '}
                    <div>
                      <a
                        data-for="custom-class-5"
                        data-tip="hover on me will keep the tooltip"
                      >
                        <img
                          height="10px"
                          src={iconInformation}
                          className="apiKeys--iconInfo"
                        />
                      </a>
                      <ReactTooltip
                        id="custom-class-5"
                        backgroundColor="#333333"
                        className="extraClass"
                        // style={{ width: '380px' }}
                        delayHide={1000}
                        effect="solid"
                        getContent={() => (
                          <div>
                            <div
                              style={{
                                textAlign: 'left',
                                fontSize: '14px',
                                lineHeight: '19px'
                              }}
                            >
                              Metric Data:
                          </div>
                            <div
                              style={{
                                fontSize: '12px',
                                lineHeight: '16px',
                                textAlign: 'left',
                                paddingTop: '5px'
                              }}
                            >
                              <p>
                                Metrics are provided over a set period of time. A
                                30 minute default time range is used. Extend the
                                time range up to 6 hours. Use the Fetch button to
                                recollect the data.
                            </p>
                            </div>
                            <div style={{ width: '340px' }}>
                              <img src={metricsData} />
                            </div>
                            <div
                              style={{
                                textAlign: 'left',
                                fontSize: '14px',
                                lineHeight: '19px'
                              }}
                            >
                              Custom Metrics:
                          </div>
                            <div
                              style={{
                                fontSize: '12px',
                                lineHeight: '16px',
                                textAlign: 'left',
                                paddingTop: '5px'
                              }}
                            >
                              <p>
                                If a metric is not submitted from one of the
                                Datadog integrations it’s considered a custom
                                metric.
                            </p>
                              <b />
                              <p>
                                In general, any metric sent using DogStatsD or
                                through a custom Agent Check is a custom metric.
                            </p>
                            </div>
                          </div>
                        )}
                      />
                    </div>
                  </span>
                  <div>
                    <span
                      className="box--quantity"
                      style={{
                        color: greenColor
                      }}
                    >
                      {metricsTotal}
                    </span>
                  </div>
                </div>
                <div className="box-content">
                  <div
                    className="f14"
                    style={{
                      height: "70%",
                      display: 'grid',
                      gridTemplate: ' 50% 50% / 1fr'
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
                      {completed!==0 && <a onClick={() => this._onCloseText()}>View Fetch Progress </a>}
                    </div>
                    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
                      <span>{dataGraph.length !== 0 && 'Metrics by type'}</span>
                    </div>
                  </div>
                  <div
                    style={{ height: '50%', width: '95%' }}
                    className="graphsBarAlert__containeScroll"
                  >
                    {dataGraph &&
                      dataGraph.map((data, index) => {
                        const { name, uv, pv } = data;
                        const total = (uv * 100) / (uv + pv);
                        return (
                          <div
                            key={index}
                            className="w100"
                            style={{
                              paddingBottom: '4%',
                              paddingTop: '4%',
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
                      })}
                  </div>
                </div>
              </div>
              <div className="mainContent__tableContent">
                <div className="tableContent__filterMetric">
                  <div className="filters__search">
                    <div className="search__content">
                      <BsSearch size="10px" color="#767B7F" />
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
                  <Button
                    onClick={() => this._openPopUp()}
                    type={Button.TYPE.PRIMARY}
                    disabled={fetchingMetrics ? true : false}
                    className="buttonFetchMetric"
                  >
                    Fetch
                  </Button>
                  <div
                    className={
                      finalList.length === 0
                        ? 'pointerBlock flex flexCenterVertical'
                        : 'pointer flex flexCenterVertical'
                    }
                    onClick={() => {
                      if (finalList.length !== 0) this.downloadData();
                    }}
                  >
                    <Tooltip
                      placementType={Tooltip.PLACEMENT_TYPE.BOTTOM}
                      text="Download"
                    >
                      <img
                        src={iconDownload}
                        style={{ marginLeft: '20px' }}
                        height="18px"
                      />
                    </Tooltip>
                  </div>
                  {finalList.length !== 0 && (
                    <Pagination
                      page={pagePag}
                      pages={pages}
                      upPage={this.upPage}
                      goToPage={this.changePage}
                      downPage={this.downPage}
                    />
                  )}
                </div>
                <div className="tableContent__table">
                  <div className="h100">
                    <ReactTable
                      loading={loadingTable}
                      loadingText="Processing..."
                      page={pagePag}
                      showPagination={false}
                      resizable={false}
                      data={finalList}
                      defaultPageSize={totalRows}
                      getTrProps={(state, rowInfo) => {
                        // eslint-disable-next-line no-lone-blocks
                        {
                          if (rowInfo) {
                            return {
                              style: {
                                background:
                                  rowInfo.index % 2 ? '#F7F7F8' : 'white',
                                borderBottom: 'none',
                                display: 'grid',
                                gridTemplate: '1fr/ 35% 15% 10% 15% 15% 10%'
                              }
                            };
                          } else {
                            return {
                              style: {
                                borderBottom: 'none',
                                display: 'grid',
                                gridTemplate: '1fr/ 35% 15% 10% 15% 15% 10%'
                              }
                            };
                          }
                        }
                      }}
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
                            gridTemplate: ' 1fr/ 35% 15% 10% 15% 15% 10%'
                          }
                        };
                      }}
                      columns={[
                        {
                          Header: () => (
                            <div className="table__headerAlignRight">
                              <div
                                className="pointer flex flexCenterHorizontal"
                                style={{ marginLeft: '15px' }}
                                onClick={() => {
                                  this.setSortColumn('name');
                                }}
                              >
                                NAME
                              <div className="flexColumn table__sort">
                                  <ArrowTop
                                    color={
                                      sortColumn.column === 'name' &&
                                        sortColumn.order === 'ascendant'
                                        ? 'black'
                                        : 'gray'
                                    }
                                  />
                                  <ArrowDown
                                    color={
                                      sortColumn.column === 'name' &&
                                        sortColumn.order === 'descent'
                                        ? 'black'
                                        : 'gray'
                                    }
                                  />
                                </div>
                              </div>
                            </div>
                          ),
                          headerClassName: ' w100I',
                          className: '  table__cell h100 w100I',
                          accessor: 'name',
                          sortable: false,
                          Cell: props => {
                            let textName = '-----';
                            if (props.value) {
                              textName = props.value;
                              if (textName.length > 45) {
                                textName = `${textName.substring(
                                  0, 46
                                )}...`;
                              }
                            }
                            return (
                              <div
                                className="h100 flex flexCenterVertical"
                                style={{
                                  background:
                                    props.index % 2 ? '#F7F7F8' : 'white'
                                }}
                              >
                                <span style={{ marginLeft: '15px' }}>
                                  {textName}
                                </span>
                              </div>
                            );
                          }
                        },
                        {
                          Header: () => (
                            <div className="table__headerAlignRight">
                              <div
                                className="pointer flex "
                                onClick={() => {
                                  this.setSortColumn('integration');
                                }}
                              >
                                INTEGRATION
                              <div className="flexColumn table__sort">
                                  <ArrowTop
                                    color={
                                      sortColumn.column === 'integration' &&
                                        sortColumn.order === 'ascendant'
                                        ? 'black'
                                        : 'gray'
                                    }
                                  />
                                  <ArrowDown
                                    color={
                                      sortColumn.column === 'integration' &&
                                        sortColumn.order === 'descent'
                                        ? 'black'
                                        : 'gray'
                                    }
                                  />
                                </div>
                              </div>
                            </div>
                          ),
                          headerClassName: 'w100I',
                          accessor: 'integration',
                          className:
                            'table__cell flex flexCenterVertical h100 w100I',
                          sortable: false,
                          Cell: props => (
                            <div className="h100 flex flexCenterVertical">
                              {props.value ? props.value : '-----'}
                            </div>
                          )
                        },
                        {
                          Header: () => (
                            <div className="table__headerAlignRight">
                              <div
                                className="pointer flex "
                                onClick={() => {
                                  this.setSortColumn('type');
                                }}
                              >
                                TYPE
                              <div className="flexColumn table__sort">
                                  <ArrowTop
                                    color={
                                      sortColumn.column === 'type' &&
                                        sortColumn.order === 'ascendant'
                                        ? 'black'
                                        : 'gray'
                                    }
                                  />
                                  <ArrowDown
                                    color={
                                      sortColumn.column === 'type' &&
                                        sortColumn.order === 'descent'
                                        ? 'black'
                                        : 'gray'
                                    }
                                  />
                                </div>
                              </div>
                            </div>
                          ),
                          headerClassName: 'w100I',
                          accessor: 'type',
                          className:
                            'table__cell flex  flexCenterVertical h100 w100I',
                          sortable: false,
                          Cell: props => (
                            <div className="h100 flex flexCenterVertical ">
                              {props.value ? props.value : '-----'}
                            </div>
                          )
                        },
                        {
                          Header: () => (
                            <div className="table__headerAlignRight">
                              <div
                                className="pointer flex "
                                onClick={() => {
                                  this.setSortColumn('host');
                                }}
                              >
                                HOST
                              <div className="flexColumn table__sort">
                                  <ArrowTop
                                    color={
                                      sortColumn.column === 'host' &&
                                        sortColumn.order === 'ascendant'
                                        ? 'black'
                                        : 'gray'
                                    }
                                  />
                                  <ArrowDown
                                    color={
                                      sortColumn.column === 'host' &&
                                        sortColumn.order === 'descent'
                                        ? 'black'
                                        : 'gray'
                                    }
                                  />
                                </div>
                              </div>
                            </div>
                          ),
                          headerClassName: 'w100I',
                          accessor: 'hosts',
                          className:
                            'table__cell flex  flexCenterVertical h100 w100I ',
                          sortable: false,
                          Cell: props => {
                            let hosts = '';
                            for (const host of props.value) {
                              hosts = `${hosts} ${host} \n`;
                            }
                            return (
                              <div className="h100 flex flexCenterVertical ">
                                {hosts}
                              </div>
                            );
                          }
                        },
                        {
                          Header: () => (
                            <div className="table__headerAlignRight">
                              <div
                                className="pointer flex "
                                onClick={() => {
                                  this.setSortColumn('unit');
                                }}
                              >
                                UNIT
                              <div className="flexColumn table__sort">
                                  <ArrowTop
                                    color={
                                      sortColumn.column === 'unit' &&
                                        sortColumn.order === 'ascendant'
                                        ? 'black'
                                        : 'gray'
                                    }
                                  />
                                  <ArrowDown
                                    color={
                                      sortColumn.column === 'unit' &&
                                        sortColumn.order === 'descent'
                                        ? 'black'
                                        : 'gray'
                                    }
                                  />
                                </div>
                              </div>
                            </div>
                          ),
                          headerClassName: 'w100I',
                          accessor: 'unit',
                          className:
                            'table__cell flex  flexCenterVertical h100 w100I',
                          sortable: false,
                          Cell: props => (
                            <div className="h100 flex flexCenterVertical ">
                              {props.value ? props.value : '-----'}
                            </div>
                          )
                        },
                        {
                          Header: () => (
                            <div className="table__headerAlignRight">
                              <div
                                className="pointer flex "
                                onClick={() => {
                                  this.setSortColumn('aggr');
                                }}
                              >
                                AGNN.TYPE
                              <div className="flexColumn table__sort">
                                  <ArrowTop
                                    color={
                                      sortColumn.column === 'unit' &&
                                        sortColumn.order === 'ascendant'
                                        ? 'black'
                                        : 'gray'
                                    }
                                  />
                                  <ArrowDown
                                    color={
                                      sortColumn.column === 'unit' &&
                                        sortColumn.order === 'descent'
                                        ? 'black'
                                        : 'gray'
                                    }
                                  />
                                </div>
                              </div>
                            </div>
                          ),
                          headerClassName: 'w100I',
                          accessor: 'aggr',
                          className:
                            'table__cell flex  flexCenterVertical h100 w100I',
                          sortable: false,
                          Cell: props => (
                            <div className="h100 flex flexCenterVertical ">
                              {props.value ? props.value : '-----'}
                            </div>
                          )
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
          viewWarning={viewWarning}
          _onClose={this._onClose}
          completed={completed}
          confirmAction={this.fetchData}
          fetchingMetrics={fetchingMetrics}
        />
      </div>
    );
  }
}
Metrics.propTypes = {
  accountId: PropTypes.number.isRequired,
  metrics: PropTypes.array.isRequired,
  metricsTotal: PropTypes.number.isRequired,
  appComponent: PropTypes.object.isRequired
};
