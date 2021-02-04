import React from 'react';
import { Spinner, Tooltip } from 'nr1';
import moment from 'moment';
import SearchInput from 'react-search-input';
import { BsSearch } from 'react-icons/bs';
import iconDownload from '../../images/download.svg';
import ModalMonitor from './ModalMonitor';
import ReactTable from 'react-table-v6';
import Pagination from '../../components/Pagination/Pagination';
import PropTypes from 'prop-types';
import jsoncsv from 'json-2-csv';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import Bar from '../../components/Bar';
import ArrowUnion from '../../components/ArrowsTable/ArrowUnion';

const greenColor = '#007E8A';
const KEYS_TO_FILTERS = [
  'name',
  'classification',
  'type',
  'author',
  'creation_date',
  'date_last_triggered',
  'overall_state',
  'multi',
  'priority'
];

export default class Monitors extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      searchMonitors: '',
      loading: false,
      savingAllChecks: false,
      pagePag: 0,
      pages: 0,
      totalRows: 10,
      sortColumn: {
        column: '',
        order: ''
      },
      hidden: false,
      infoAditional: {},
      dataRespaldo: []
    };
  }

  componentDidMount() {
    const { monitorsData = [] } = this.props;
    const data = [];
    monitorsData.forEach(element => {
      let thresholds = '-----';
      if (element.thresholds) {
        if (element.thresholds.critical) {
          thresholds = `critical: ${element.thresholds.critical}`;
        }
        if (element.thresholds.warning) {
          thresholds = `${thresholds} \n warning: ${element.thresholds.warning}`;
        }
      }
      let aggregation = '-----';
      if (element.aggregation) {
        if (element.aggregation.metric) {
          aggregation = `metric: ${element.aggregation.metric} \n`;
        }
        if (element.aggregation.type) {
          if (aggregation !== '-----') {
            aggregation = `${aggregation} type: ${element.aggregation.type} \n`;
          } else {
            aggregation = `type: ${element.aggregation.type} \n`;
          }
        }
        if (element.aggregation.groupBy) {
          if (aggregation !== '-----') {
            aggregation = `${aggregation} groupBy: ${element.aggregation.groupBy} \n`;
          } else {
            aggregation = `groupBy: ${element.aggregation.groupBy} \n`;
          }
        }
      }
      data.push({
        name: element.name ? element.name : '-----',
        classification: element.classification
          ? element.classification
          : '-----',
        type: element.type ? element.type : '-----',
        author: element.creator.name ? element.creator.name : '-----',
        creation_date: element.created
          ? moment(element.created).format('MM/DD/YYYY')
          : '----',
        date_last_triggered: element.last_triggered_ts
          ? moment.unix(element.last_triggered_ts).format('MM/DD/YYYY')
          : '-----',
        overall_state: element.status ? element.status : '-----',
        multi: element.multi ? 'yes' : 'no',
        priority: element.priority ? element.priority : '-----',
        message: `${element.message ? element.message : '-----'} \n`,
        query: element.query ? element.query : '-----',
        aggregation: aggregation,
        evaluation_delay: element.evaluation_delay
          ? element.evaluation_delay
          : '-----',
        failure_duration: element.min_failure_duration
          ? element.min_failure_duration
          : '-----',
        min_location_failed: element.min_location_failed
          ? element.min_location_failed
          : '-----',
        host_delay: element.new_host_delay ? element.new_host_delay : '-----',
        no_data_timeframe: element.no_data_timeframe
          ? element.no_data_timeframe
          : '-----',
        notify_audit: element.notify_audit ? element.notify_audit : '-----',
        thresholds: thresholds,
        notify_no_data: element.notify_no_data
          ? element.notify_no_data
          : '-----'
      });
    });
    this.calcTable(data);
    this.setState({ data, dataRespaldo: data });
  }

  upPage = () => {
    const { pagePag } = this.state;
    this.setState({ pagePag: pagePag + 1 });
  };

  changePage = pagePag => {
    this.setState({ pagePag: pagePag - 1 });
  };

  downPage = () => {
    const { pagePag } = this.state;
    this.setState({ pagePag: pagePag - 1 });
  };

  searchUpdated = term => {
    const { sortColumn, dataRespaldo } = this.state;
    this.loadData(dataRespaldo, term, sortColumn);
    this.setState({ searchMonitors: term });
  };

  _onClose = () => {
    const actualValue = this.state.hidden;
    this.setState({ hidden: !actualValue });
  };

  saveAction = async (action, infoAditional) => {
    this._onClose();
    this.setState({ infoAditional });
  };

  setSortColumn = column => {
    const { sortColumn, data, searchMonitors } = this.state;
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
    this.loadData(data, searchMonitors, {
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

  downloadData = async () => {
    const { dataRespaldo } = this.state;
    const date = new Date();
    const zip = new JSZip();
    const dataCsv = [];
    dataRespaldo.forEach(row => {
      let thresholds = '-----';
      if (row.thresholds) {
        if (row.thresholds.critical) {
          thresholds = `critical: ${row.thresholds.critical}`;
        }
        if (row.thresholds.warning) {
          thresholds = `${thresholds} \n warning: ${row.thresholds.warning}`;
        }
      }
      dataCsv.push({
        NAME: row.name ? row.name : '-----',
        CLASSIFICATION: row.classification ? row.classification : '-----',
        TYPE: row.type ? row.type : '-----',
        AUTHOR: row.author ? row.author : '-----',
        CREATION_DATE: row.creation_date ? row.creation_date : '----',
        DATE_LAST_TRIGGERED: row.date_last_triggered
          ? row.date_last_triggered
          : '-----',
        OVERALL_STATE: row.overall_state ? row.overall_state : '-----',
        MULTI: row.multi ? row.multi : '-----',
        PRIORITY: row.priority ? row.priority : '-----',
        MESSAGE: `${row.message ? row.message : '-----'}`,
        QUERY: row.query ? row.query : '-----',
        AGGREGATION: row.aggregation ? row.aggregation : '-----',
        EVALUATION_DELAY: row.evaluation_delay ? row.evaluation_delay : '-----',
        FAILURE_DURATION: row.min_failure_duration
          ? row.min_failure_duration
          : '-----',
        MIN_LOCATION_FAILED: row.min_location_failed
          ? row.min_location_failed
          : '-----',
        HOST_DELAY: row.new_host_delay ? row.new_host_delay : '-----',
        NO_DATA_TIMEFRAME: row.no_data_timeframe
          ? row.no_data_timeframe
          : '-----',
        NOTIFY_AUDIT: row.notify_audit ? row.notify_audit : '-----',
        THRESHOLDS: thresholds,
        NOTIFY_NO_DATA: row.notify_no_data ? row.notify_no_data : '-----',
        TAGS: row.name ? row.name : '-----'
      });
    });

    jsoncsv.json2csv(dataCsv, (err, csv) => {
      if (err) {
        throw err;
      }
      zip.file(`Monitors.csv`, csv);
      zip.generateAsync({ type: 'blob' }).then(function(content) {
        // see FileSaver.js
        saveAs(
          content,
          `Monitors ${date.getDate()}-${date.getMonth() +
            1}-${date.getFullYear()}.zip`
        );
      });
    });
  };

  /**
   * method that calculates the total number of pages to show
   *
   * @memberof Migration
   */
  calcTable = finalList => {
    const { totalRows, pagePag } = this.state;
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

  loadData = (monitors, searchTerm, sortColumn) => {
    let finalList = monitors;
    if (searchTerm !== '') {
      const filteredData = finalList.filter(item => {
        return Object.keys(item).some(key => {
          if (KEYS_TO_FILTERS.find(KEY => KEY === key)) {
            return `${item[key]}`
              .toLowerCase()
              .includes(searchTerm.trim().toLowerCase());
          }
          return false;
        });
      });
      finalList = filteredData;
    }
    finalList = this.sortData(finalList, sortColumn);
    this.calcTable(finalList);
    this.setState({ data: finalList });
  };

  sortData = (finalList, { order, column }) => {
    let valueOne = 1;
    let valueTwo = -1;
    if (order === 'descent') {
      valueOne = -1;
      valueTwo = 1;
    }
    switch (column) {
      case 'name': {
        const sortName = finalList.sort(function(a, b) {
          if (a.name > b.name) {
            return valueOne;
          }
          if (a.name < b.name) {
            return valueTwo;
          }
          return 0;
        });
        return sortName;
      }
      case 'classification': {
        const sortClassification = finalList.sort(function(a, b) {
          if (a.classification > b.classification) {
            return valueOne;
          }
          if (a.classification < b.classification) {
            return valueTwo;
          }
          return 0;
        });
        return sortClassification;
      }
      case 'creation_date': {
        const sortCreated = finalList.sort(function(a, b) {
          const date1 = new Date(a.creation_date);
          const date2 = new Date(b.creation_date);
          if (date1 > date2) return valueOne;
          if (date1 < date2) return valueTwo;
          return 0;
        });
        return sortCreated;
      }
      case 'date_last_triggered': {
        const sortLast_triggered_ts = finalList.sort(function(a, b) {
          const date1 = new Date(a.date_last_triggered);
          const date2 = new Date(b.date_last_triggered);
          if (date1 > date2) return valueOne;
          if (date1 < date2) return valueTwo;
          return 0;
        });
        return sortLast_triggered_ts;
      }
      case 'author': {
        const sortAuthor = finalList.sort(function(a, b) {
          if (a.author > b.author) {
            return valueOne;
          }
          if (a.author < b.author) {
            return valueTwo;
          }
          return 0;
        });
        return sortAuthor;
      }
      case 'type': {
        const sortType = finalList.sort(function(a, b) {
          if (a.type > b.type) {
            return valueOne;
          }
          if (a.type < b.type) {
            return valueTwo;
          }
          return 0;
        });
        return sortType;
      }
      case 'overall_state': {
        const sortStatus = finalList.sort(function(a, b) {
          if (a.overall_state > b.overall_state) {
            return valueOne;
          }
          if (a.overall_state < b.overall_state) {
            return valueTwo;
          }
          return 0;
        });
        return sortStatus;
      }
      case 'multi': {
        const sortMulti = finalList.sort(function(a, b) {
          if (a.multi > b.multi) {
            return valueOne;
          }
          if (a.multi < b.multi) {
            return valueTwo;
          }
          return 0;
        });
        return sortMulti;
      }
      case 'priority': {
        const sortPriority = finalList.sort(function(a, b) {
          if (a.priority > b.priority) {
            return valueOne;
          }
          if (a.priority < b.priority) {
            return valueTwo;
          }
          return 0;
        });
        return sortPriority;
      }
      default:
        return finalList;
    }
  };

  render() {
    const {
      loading,
      savingAllChecks,
      pagePag,
      pages,
      totalRows,
      hidden,
      sortColumn,
      data,
      infoAditional
    } = this.state;
    const { monitorsGraph = [], monitorsTotal = 0 } = this.props;
    return (
      <div className="h100">
        {loading ? (
          <Spinner type={Spinner.TYPE.DOT} />
        ) : (
          <div className="mainContent">
            <div className="mainContent__information">
              <div className="information__box">
                <span
                  className=" box--title fontMedium "
                  style={{
                    color: greenColor
                  }}
                >
                  Monitors
                </span>
                <div>
                  <span
                    className="box--quantity fontBigger "
                    style={{
                      color: greenColor
                    }}
                  >
                    {monitorsTotal}
                  </span>
                </div>
              </div>
              <div className="box-content">
                <div
                  className="fontMedium"
                  style={{
                    height: '50%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'flex-end'
                  }}
                >
                  Monitors by type
                </div>
                <div
                  style={{ height: '50%', width: '95%' }}
                  className="graph_bar"
                >
                  {monitorsGraph &&
                    monitorsGraph.map((data, index) => {
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
              <div className="tableContent__filter">
                <div className="filters__search">
                  <div className="search__content">
                    <BsSearch size="10px" color="#767B7F" />
                    <SearchInput
                      className="filters--searchInput fontNormal"
                      onChange={this.searchUpdated}
                    />
                  </div>
                </div>
                <div
                  className={
                    data.length === 0
                      ? 'pointerBlock flex flexCenterVertical'
                      : 'pointer flex flexCenterVertical'
                  }
                  style={{ width: '30%' }}
                  onClick={() => {
                    if (data.length !== 0) this.downloadData();
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
                {data.length !== 0 && (
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
                <div style={{ width: '1700px' }} className="h100">
                  <ReactTable
                    loading={savingAllChecks}
                    loadingText="Processing..."
                    page={pagePag}
                    showPagination={false}
                    resizable={false}
                    data={data}
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
                              gridTemplate: '1fr / 16% repeat(8, 10.5%)'
                            }
                          };
                        } else {
                          return {
                            style: {
                              borderBottom: 'none',
                              display: 'grid',
                              gridTemplate: '1fr / 16% repeat(8, 10.5%)'
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
                          gridTemplate: '1fr / 16% repeat(8, 10.5%)'
                        }
                      };
                    }}
                    columns={[
                      {
                        Header: () => (
                          <div
                            className="table__headerSticky fontSmall"
                            style={{
                              borderRight: '5px solid rgba(208, 208, 209, 0.1)',
                              borderRightStyle: 'groove'
                            }}
                          >
                            <div
                              className="pointer flex "
                              style={{ marginLeft: '15px' }}
                              onClick={() => {
                                this.setSortColumn('name');
                              }}
                            >
                              NAME
                              <div className="flexColumn table__sort">
                                <ArrowUnion
                                  sortColumn={sortColumn}
                                  colorArrowOne={
                                    sortColumn.column === 'name' &&
                                    sortColumn.order === 'descent'
                                      ? 'black'
                                      : 'gray'
                                  }
                                  colorArrowTwo={
                                    sortColumn.column === 'name' &&
                                    sortColumn.order === 'ascendant'
                                      ? 'black'
                                      : 'gray'
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        ),
                        headerClassName: 'stycky w100I',
                        className:
                          ' stycky table__cellSticky fontNormal h100 w100I',
                        accessor: 'name',
                        sortable: false,
                        Cell: props => {
                          return (
                            <div
                              onClick={() =>
                                this.saveAction('data', props.original)
                              }
                              className="h100 flex pointer flexCenterVertical"
                              style={{
                                background:
                                  props.index % 2 ? '#F7F7F8' : 'white',
                                color: '#0078BF',
                                borderRight:
                                  '5px solid rgba(208, 208, 209, 0.1)',
                                borderRightStyle: 'groove'
                              }}
                            >
                              <span style={{ marginLeft: '15px' }}>
                                {`  ${props.value}`}
                              </span>
                            </div>
                          );
                        }
                      },
                      {
                        Header: () => (
                          <div
                            className="table__header fontSmall"
                            style={{ marginLeft: '15px' }}
                          >
                            <div
                              className="pointer flex "
                              onClick={() => {
                                this.setSortColumn('classification');
                              }}
                            >
                              CLASSIFICATION
                              <div className="flexColumn table__sort">
                                <ArrowUnion
                                  sortColumn={sortColumn}
                                  colorArrowOne={
                                    sortColumn.column === 'classification' &&
                                    sortColumn.order === 'descent'
                                      ? 'black'
                                      : 'gray'
                                  }
                                  colorArrowTwo={
                                    sortColumn.column === 'classification' &&
                                    sortColumn.order === 'ascendant'
                                      ? 'black'
                                      : 'gray'
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        ),
                        headerClassName: 'w100I',
                        accessor: 'classification',
                        className:
                          'table__cell fontNormal flex flexCenterVertical h100 w100I',
                        sortable: false,
                        Cell: props => (
                          <div
                            className="h100 flex flexCenterVertical "
                            style={{ marginLeft: '15px' }}
                          >
                            {props.value}
                          </div>
                        )
                      },
                      {
                        Header: () => (
                          <div className="table__header fontSmall">
                            <div
                              className="pointer flex "
                              onClick={() => {
                                this.setSortColumn('type');
                              }}
                            >
                              TYPE
                              <div className="flexColumn table__sort">
                                <ArrowUnion
                                  sortColumn={sortColumn}
                                  colorArrowOne={
                                    sortColumn.column === 'type' &&
                                    sortColumn.order === 'descent'
                                      ? 'black'
                                      : 'gray'
                                  }
                                  colorArrowTwo={
                                    sortColumn.column === 'type' &&
                                    sortColumn.order === 'ascendant'
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
                          'table__cell fontNormal flex flexCenterVertical h100 w100I',
                        sortable: false,
                        Cell: props => (
                          <div className="h100 flex flexCenterVertical ">
                            {props.value}
                          </div>
                        )
                      },
                      {
                        Header: () => (
                          <div className="table__header fontSmall">
                            <div
                              className="pointer flex "
                              onClick={() => {
                                this.setSortColumn('author');
                              }}
                            >
                              AUTHOR
                              <div className="flexColumn table__sort">
                                <ArrowUnion
                                  sortColumn={sortColumn}
                                  colorArrowOne={
                                    sortColumn.column === 'author' &&
                                    sortColumn.order === 'descent'
                                      ? 'black'
                                      : 'gray'
                                  }
                                  colorArrowTwo={
                                    sortColumn.column === 'author' &&
                                    sortColumn.order === 'ascendant'
                                      ? 'black'
                                      : 'gray'
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        ),
                        headerClassName: 'w100I',
                        accessor: 'author',
                        className:
                          'table__cell fontNormal flex flexCenterVertical h100 w100I',
                        sortable: false,
                        Cell: props => (
                          <div className="h100 flex flexCenterVertical ">
                            {props.value}
                          </div>
                        )
                      },
                      {
                        Header: () => (
                          <div className="table__header fontSmall">
                            <div
                              className="pointer flex "
                              onClick={() => {
                                this.setSortColumn('creation_date');
                              }}
                            >
                              CREATION DATE
                              <div className="flexColumn table__sort">
                                <ArrowUnion
                                  sortColumn={sortColumn}
                                  colorArrowOne={
                                    sortColumn.column === 'creation_date' &&
                                    sortColumn.order === 'descent'
                                      ? 'black'
                                      : 'gray'
                                  }
                                  colorArrowTwo={
                                    sortColumn.column === 'creation_date' &&
                                    sortColumn.order === 'ascendant'
                                      ? 'black'
                                      : 'gray'
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        ),
                        headerClassName: 'w100I',
                        accessor: 'creation_date',
                        className:
                          'table__cell fontNormal flex flexCenterVertical h100 w100I',
                        sortable: false,
                        Cell: props => (
                          <div className="h100 flex flexCenterVertical ">
                            {props.value ? props.value : '-----'}
                          </div>
                        )
                      },
                      {
                        Header: () => (
                          <div className="table__header fontSmall">
                            <div
                              className="pointer flex "
                              onClick={() => {
                                this.setSortColumn('date_last_triggered');
                              }}
                            >
                              DATE LAST TRIGGERED
                              <div className="flexColumn table__sort">
                                <ArrowUnion
                                  sortColumn={sortColumn}
                                  colorArrowOne={
                                    sortColumn.column ===
                                      'date_last_triggered' &&
                                    sortColumn.order === 'descent'
                                      ? 'black'
                                      : 'gray'
                                  }
                                  colorArrowTwo={
                                    sortColumn.column ===
                                      'date_last_triggered' &&
                                    sortColumn.order === 'ascendant'
                                      ? 'black'
                                      : 'gray'
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        ),
                        headerClassName: 'w100I',
                        accessor: 'date_last_triggered',
                        className:
                          'table__cell fontNormal flex flexCenterVertical h100 w100I',
                        sortable: false,
                        Cell: props => (
                          <div className="h100 flex flexCenterVertical ">
                            {props.value ? props.value : '-----'}
                          </div>
                        )
                      },
                      {
                        Header: () => (
                          <div className="table__header fontSmall">
                            <div
                              className="pointer flex "
                              onClick={() => {
                                this.setSortColumn('overall_state');
                              }}
                            >
                              OVERALL STATE
                              <div className="flexColumn table__sort">
                                <ArrowUnion
                                  sortColumn={sortColumn}
                                  colorArrowOne={
                                    sortColumn.column === 'overall_state' &&
                                    sortColumn.order === 'descent'
                                      ? 'black'
                                      : 'gray'
                                  }
                                  colorArrowTwo={
                                    sortColumn.column === 'overall_state' &&
                                    sortColumn.order === 'ascendant'
                                      ? 'black'
                                      : 'gray'
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        ),
                        headerClassName: 'w100I',
                        accessor: 'overall_state',
                        className:
                          'table__cell fontNormal flex flexCenterVertical h100 w100I',
                        sortable: false,
                        Cell: props => (
                          <div className="h100 flex flexCenterVertical ">
                            {props.value}
                          </div>
                        )
                      },
                      {
                        Header: () => (
                          <div className="table__header fontSmall">
                            <div
                              className="pointer flex "
                              onClick={() => {
                                this.setSortColumn('multi');
                              }}
                            >
                              MULTI
                              <div className="flexColumn table__sort">
                                <ArrowUnion
                                  sortColumn={sortColumn}
                                  colorArrowOne={
                                    sortColumn.column === 'multi' &&
                                    sortColumn.order === 'descent'
                                      ? 'black'
                                      : 'gray'
                                  }
                                  colorArrowTwo={
                                    sortColumn.column === 'multi' &&
                                    sortColumn.order === 'ascendant'
                                      ? 'black'
                                      : 'gray'
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        ),
                        headerClassName: 'w100I',
                        accessor: 'multi',
                        className:
                          'table__cell fontNormal flex flexCenterVertical h100 w100I',
                        sortable: false,
                        Cell: props => (
                          <div className="h100 flex flexCenterVertical ">
                            {props.value}
                          </div>
                        )
                      },
                      {
                        Header: () => (
                          <div className="table__header fontSmall">
                            <div
                              className="pointer flex "
                              onClick={() => {
                                this.setSortColumn('priority');
                              }}
                            >
                              PRIORITY
                              <div className="flexColumn table__sort">
                                <ArrowUnion
                                  sortColumn={sortColumn}
                                  colorArrowOne={
                                    sortColumn.column === 'priority' &&
                                    sortColumn.order === 'descent'
                                      ? 'black'
                                      : 'gray'
                                  }
                                  colorArrowTwo={
                                    sortColumn.column === 'priority' &&
                                    sortColumn.order === 'ascendant'
                                      ? 'black'
                                      : 'gray'
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        ),
                        headerClassName: 'w100I',
                        accessor: 'priority',
                        className:
                          'table__cell fontNormal flex flexCenterVertical h100 w100I',
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
        {hidden && (
          <ModalMonitor
            hidden={hidden}
            _onClose={this._onClose}
            infoAditional={infoAditional}
          />
        )}
      </div>
    );
  }
}

Monitors.propTypes = {
  monitorsTotal: PropTypes.number.isRequired,
  monitorsData: PropTypes.array.isRequired,
  monitorsGraph: PropTypes.array.isRequired
};
