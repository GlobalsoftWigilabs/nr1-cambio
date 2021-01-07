import React from 'react';
import { Spinner, Tooltip } from 'nr1';
import moment from 'moment';
import SearchInput, { createFilter } from 'react-search-input';
import { BsSearch } from 'react-icons/bs';
import iconDownload from '../../images/download.svg';
import ArrowDown from '../../components/ArrowsTable/ArrowDown';
import ArrowTop from '../../components/ArrowsTable/ArrowTop';
import ModalAlert from './ModalAlert';
import ReactTable from 'react-table-v6';
import Pagination from '../../components/Pagination/Pagination';
import PropTypes from 'prop-types';
import jsoncsv from 'json-2-csv';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import Bar from '../../components/Bar';

const greenColor = '#007E8A';
const KEYS_TO_FILTERS = [
  'NAME',
  'CLASSIFICATION',
  'TYPE',
  'AUTHOR',
  'CREATION_DATE',
  'DATE_LAST_TRIGGERED',
  'OVERALL_STATE',
  'MULTI',
  'PRIORITY'
];

export default class Alerts extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      searchAlerts: '',
      loading: false,
      savingAllChecks: false,
      pagePag: 0,
      pages: 0,
      totalRows: 6,
      sortColumn: {
        column: '',
        order: ''
      },
      hidden: false,
      infoAditional: {}
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
      data.push({
        NAME: element.name,
        CLASSIFICATION: element.classification,
        TYPE: element.type,
        AUTHOR: element.creator.name,
        CREATION_DATE: element.created,
        DATE_LAST_TRIGGERED: element.last_triggered_ts,
        OVERALL_STATE: element.status,
        MULTI: element.multi ? 'yes' : 'no',
        PRIORITY: element.priority ? element.priority : '-----',
        MESSAGE: element.message,
        QUERY: element.query,
        AGGREGATION: element.aggregation ? element.aggregation : '-----',
        EVALUATION_DELAY: element.evaluation_delay ? element.evaluation_delay : '-----',
        FAILURE_DURATION: element.min_failure_duration ? element.min_failure_duration : '-----',
        MIN_LOCATION_FAILED: element.min_location_failed ? element.min_location_failed : '-----',
        HOST_DELAY: element.new_host_delay ? element.new_host_delay : '-----',
        NO_DATA_TIMEFRAME: element.no_data_timeframe ? element.no_data_timeframe : '-----',
        NOTIFY_AUDIT: element.notify_audit ? element.notify_audit : '-----',
        THRESHOLDS: thresholds,
        NOTIFY_NO_DATA: element.notify_no_data ? element.notify_no_data : '-----'



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
    this.setState({ searchAlerts: term });
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
    const { sortColumn, data, searchAlerts } = this.state;
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
    this.loadData(data, searchAlerts, {
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
    const { data } = this.state;
    const date = new Date();
    const zip = new JSZip();
    const dataCsv = [];
    data.forEach(row => {
      dataCsv.push({
        NAME: row.NAME,
        CLASSIFICATION: row.CLASSIFICATION,
        TYPE: row.TYPE,
        AUTHOR: row.AUTHOR,
        CREATION_DATE: row.CREATION_DATE,
        DATE_LAST_TRIGGERED: row.DATE_LAST_TRIGGERED,
        OVERALL_STATE: row.OVERALL_STATE,
        MULTI: row.MULTI,
        PRIORITY: row.PRIORITY
      });
    });

    jsoncsv.json2csv(dataCsv, (err, csv) => {
      if (err) {
        throw err;
      }
      zip.file(`Alerts.csv`, csv);
      zip.generateAsync({ type: 'blob' }).then(function(content) {
        // see FileSaver.js
        saveAs(
          content,
          `Alerts ${date.getDate()}-${date.getMonth() +
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

  loadData = (alerts, searchTerm, sortColumn) => {
    let finalList = alerts;
    if (searchTerm !== '') {
      finalList = finalList.filter(createFilter(searchTerm, KEYS_TO_FILTERS));
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
      case 'NAME':
        // eslint-disable-next-line no-case-declarations
        const sortName = finalList.sort(function(a, b) {
          if (a.NAME > b.NAME) {
            return valueOne;
          }
          if (a.NAME < b.NAME) {
            return valueTwo;
          }
          return 0;
        });
        return sortName;
      case 'CLASSIFICATION':
        // eslint-disable-next-line no-case-declarations
        const sortClassification = finalList.sort(function(a, b) {
          if (a.CLASSIFICATION > b.CLASSIFICATION) {
            return valueOne;
          }
          if (a.CLASSIFICATION < b.CLASSIFICATION) {
            return valueTwo;
          }
          return 0;
        });
        return sortClassification;
      case 'CREATION_DATE':
        // eslint-disable-next-line no-case-declarations
        const sortCreated = finalList.sort(function(a, b) {
          const date1 = new Date(moment(a.CREATION_DATE).format('YYYY-MM-DDTHH:mm'));
          const date2 = new Date(moment(b.CREATION_DATE).format('YYYY-MM-DDTHH:mm'));
          if (date1 > date2) return valueOne;
          if (date1 < date2) return valueTwo;
          return 0;
        });
        return sortCreated;
      case 'DATE_LAST_TRIGGERED':
        // eslint-disable-next-line no-case-declarations
        const sortLast_triggered_ts = finalList.sort(function(a, b) {
          const date1 = new Date(
            moment.unix(a.DATE_LAST_TRIGGERED).format('YYYY-MM-DDTHH:mm')
          );
          const date2 = new Date(
            moment.unix(b.DATE_LAST_TRIGGERED).format('YYYY-MM-DDTHH:mm')
          );
          if (date1 > date2) return valueOne;
          if (date1 < date2) return valueTwo;
          return 0;
        });
        return sortLast_triggered_ts;
      case 'AUTHOR':
        // eslint-disable-next-line no-case-declarations
        const sortAuthor = finalList.sort(function(a, b) {
          if (a.AUTHOR > b.AUTHOR) {
            return valueOne;
          }
          if (a.AUTHOR < b.AUTHOR) {
            return valueTwo;
          }
          return 0;
        });
        return sortAuthor;
      case 'TYPE':
        // eslint-disable-next-line no-case-declarations
        const sortType = finalList.sort(function(a, b) {
          if (a.TYPE > b.TYPE) {
            return valueOne;
          }
          if (a.TYPE < b.TYPE) {
            return valueTwo;
          }
          return 0;
        });
        return sortType;
      case 'OVERALL_STATE':
        // eslint-disable-next-line no-case-declarations
        const sortStatus = finalList.sort(function(a, b) {
          if (a.OVERALL_STATE > b.OVERALL_STATE) {
            return valueOne;
          }
          if (a.OVERALL_STATE < b.OVERALL_STATE) {
            return valueTwo;
          }
          return 0;
        });
        return sortStatus;
      case 'MULTI':
        // eslint-disable-next-line no-case-declarations
        const sortMulti = finalList.sort(function(a, b) {
          if (a.MULTI > b.MULTI) {
            return valueOne;
          }
          if (a.MULTI < b.MULTI) {
            return valueTwo;
          }
          return 0;
        });
        return sortMulti;
      case 'PRIORITY':
        // eslint-disable-next-line no-case-declarations
        const sortPriority = finalList.sort(function(a, b) {
          if (a.PRIORITY > b.PRIORITY) {
            return valueOne;
          }
          if (a.PRIORITY < b.PRIORITY) {
            return valueTwo;
          }
          return 0;
        });
        return sortPriority;
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
    const { alertsData = [], alertsTotal = 0 } = this.props;
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
                  }}
                >
                  Alerts
                </span>
                <div>
                  <span
                    className="box--quantity"
                    style={{
                      color: greenColor
                    }}
                  >
                    {alertsTotal}
                  </span>
                </div>
              </div>
              <div className="box-content">
                <div
                  style={{
                    height: '50%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'flex-end',
                    fontSize: '14px'
                  }}
                >
                  Alerts by type
                </div>
                <div
                  style={{ height: '50%', width: '95%' }}
                  className="graph_bar"
                >
                  {alertsData ? (
                    alertsData.map((data, index) => {
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
                  ) : (
                    <div />
                  )}
                </div>
              </div>
            </div>
            <div className="mainContent__tableContent">
              <div className="tableContent__filter">
                <div className="filters__search">
                  <div className="search__content">
                    <BsSearch size="10px" color="#767B7F" />
                    <SearchInput
                      className="filters--searchInput"
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
                <div style={{ width: '2500px' }} className="h100">
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
                              gridTemplate:
                                '1fr / 16% repeat(3, 14.33%) 8% 9% repeat(3, 8%)'
                            }
                          };
                        } else {
                          return {
                            style: {
                              borderBottom: 'none',
                              display: 'grid',
                              gridTemplate:
                                '1fr / 16% repeat(3, 14.33%) 8% 9% repeat(3, 8%)'
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
                          gridTemplate:
                            '1fr / 16% repeat(3, 14.33%) 8% 9% repeat(3, 8%)'
                        }
                      };
                    }}
                    columns={[
                      {
                        Header: () => (
                          <div className="table__headerSticky">
                            <div
                              className="pointer flex "
                              style={{ marginLeft: '15px' }}
                              onClick={() => {
                                this.setSortColumn('NAME');
                              }}
                            >
                              NAME
                              <div className="flexColumn table__sort">
                                <ArrowTop
                                  color={
                                    sortColumn.column === 'NAME' &&
                                    sortColumn.order === 'ascendant'
                                      ? 'black'
                                      : 'gray'
                                  }
                                />
                                <ArrowDown
                                  color={
                                    sortColumn.column === 'NAME' &&
                                    sortColumn.order === 'descent'
                                      ? 'black'
                                      : 'gray'
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        ),
                        headerClassName: 'stycky w100I',
                        className: ' stycky table__cellSticky h100 w100I',
                        accessor: 'NAME',
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
                                color: '#0078BF'
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
                          <div className="table__header">
                            <div
                              className="pointer flex "
                              onClick={() => {
                                this.setSortColumn('CLASSIFICATION');
                              }}
                            >
                              CLASSIFICATION
                              <div className="flexColumn table__sort">
                                <ArrowTop
                                  color={
                                    sortColumn.column === 'CLASSIFICATION' &&
                                    sortColumn.order === 'ascendant'
                                      ? 'black'
                                      : 'gray'
                                  }
                                />
                                <ArrowDown
                                  color={
                                    sortColumn.column === 'CLASSIFICATION' &&
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
                        accessor: 'CLASSIFICATION',
                        className:
                          'table__cell flex flexCenterVertical h100 w100I',
                        sortable: false,
                        Cell: props => (
                          <div className="h100 flex flexCenterVertical ">
                            {props.value}
                          </div>
                        )
                      },
                      {
                        Header: () => (
                          <div className="table__header">
                            <div
                              className="pointer flex "
                              onClick={() => {
                                this.setSortColumn('TYPE');
                              }}
                            >
                              TYPE
                              <div className="flexColumn table__sort">
                                <ArrowTop
                                  color={
                                    sortColumn.column === 'TYPE' &&
                                    sortColumn.order === 'ascendant'
                                      ? 'black'
                                      : 'gray'
                                  }
                                />
                                <ArrowDown
                                  color={
                                    sortColumn.column === 'TYPE' &&
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
                        accessor: 'TYPE',
                        className:
                          'table__cell flex flexCenterVertical h100 w100I',
                        sortable: false,
                        Cell: props => (
                          <div className="h100 flex flexCenterVertical ">
                            {props.value}
                          </div>
                        )
                      },
                      {
                        Header: () => (
                          <div className="table__header">
                            <div
                              className="pointer flex "
                              onClick={() => {
                                this.setSortColumn('AUTHOR');
                              }}
                            >
                              AUTHOR
                              <div className="flexColumn table__sort">
                                <ArrowTop
                                  color={
                                    sortColumn.column === 'AUTHOR' &&
                                    sortColumn.order === 'ascendant'
                                      ? 'black'
                                      : 'gray'
                                  }
                                />
                                <ArrowDown
                                  color={
                                    sortColumn.column === 'AUTHOR' &&
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
                        accessor: 'AUTHOR',
                        className:
                          'table__cell flex flexCenterVertical h100 w100I',
                        sortable: false,
                        Cell: props => (
                          <div className="h100 flex flexCenterVertical ">
                            {props.value}
                          </div>
                        )
                      },
                      {
                        Header: () => (
                          <div className="table__header">
                            <div
                              className="pointer flex "
                              onClick={() => {
                                this.setSortColumn('CREATION_DATE');
                              }}
                            >
                              CREATION DATE
                              <div className="flexColumn table__sort">
                                <ArrowTop
                                  color={
                                    sortColumn.column === 'CREATION_DATE' &&
                                    sortColumn.order === 'ascendant'
                                      ? 'black'
                                      : 'gray'
                                  }
                                />
                                <ArrowDown
                                  color={
                                    sortColumn.column === 'CREATION_DATE' &&
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
                        accessor: 'CREATION_DATE',
                        className:
                          'table__cell flex flexCenterVertical h100 w100I',
                        sortable: false,
                        Cell: props => (
                          <div className="h100 flex flexCenterVertical ">
                            {moment(props.value).format('MM/DD/YYYY')}
                          </div>
                        )
                      },
                      {
                        Header: () => (
                          <div className="table__header">
                            <div
                              className="pointer flex "
                              onClick={() => {
                                this.setSortColumn('DATE_LAST_TRIGGERED');
                              }}
                            >
                              DATE LAST TRIGGERED
                              <div className="flexColumn table__sort">
                                <ArrowTop
                                  color={
                                    sortColumn.column === 'DATE_LAST_TRIGGERED' &&
                                    sortColumn.order === 'ascendant'
                                      ? 'black'
                                      : 'gray'
                                  }
                                />
                                <ArrowDown
                                  color={
                                    sortColumn.column === 'DATE_LAST_TRIGGERED' &&
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
                        accessor: 'DATE_LAST_TRIGGERED',
                        className:
                          'table__cell flex flexCenterVertical h100 w100I',
                        sortable: false,
                        Cell: props => (
                          <div className="h100 flex flexCenterVertical ">
                            {props.value
                              ? moment.unix(props.value).format('MM/DD/YYYY')
                              : '-----'}
                          </div>
                        )
                      },
                      {
                        Header: () => (
                          <div className="table__header">
                            <div
                              className="pointer flex "
                              onClick={() => {
                                this.setSortColumn('OVERALL_STATE');
                              }}
                            >
                              OVERALL STATE
                              <div className="flexColumn table__sort">
                                <ArrowTop
                                  color={
                                    sortColumn.column === 'OVERALL_STATE' &&
                                    sortColumn.order === 'ascendant'
                                      ? 'black'
                                      : 'gray'
                                  }
                                />
                                <ArrowDown
                                  color={
                                    sortColumn.column === 'OVERALL_STATE' &&
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
                        accessor: 'OVERALL_STATE',
                        className:
                          'table__cell flex flexCenterVertical h100 w100I',
                        sortable: false,
                        Cell: props => (
                          <div className="h100 flex flexCenterVertical ">
                            {props.value}
                          </div>
                        )
                      },
                      {
                        Header: () => (
                          <div className="table__header">
                            <div
                              className="pointer flex "
                              onClick={() => {
                                this.setSortColumn('MULTI');
                              }}
                            >
                              MULTI
                              <div className="flexColumn table__sort">
                                <ArrowTop
                                  color={
                                    sortColumn.column === 'MULTI' &&
                                    sortColumn.order === 'ascendant'
                                      ? 'black'
                                      : 'gray'
                                  }
                                />
                                <ArrowDown
                                  color={
                                    sortColumn.column === 'MULTI' &&
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
                        accessor: 'MULTI',
                        className:
                          'table__cell flex flexCenterVertical h100 w100I',
                        sortable: false,
                        Cell: props => (
                          <div className="h100 flex flexCenterVertical ">
                            {props.value}
                          </div>
                        )
                      },
                      {
                        Header: () => (
                          <div className="table__header">
                            <div
                              className="pointer flex "
                              onClick={() => {
                                this.setSortColumn('PRIORITY');
                              }}
                            >
                              PRIORITY
                              <div className="flexColumn table__sort">
                                <ArrowTop
                                  color={
                                    sortColumn.column === 'PRIORITY' &&
                                    sortColumn.order === 'ascendant'
                                      ? 'black'
                                      : 'gray'
                                  }
                                />
                                <ArrowDown
                                  color={
                                    sortColumn.column === 'PRIORITY' &&
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
                        accessor: 'PRIORITY',
                        className:
                          'table__cell flex flexCenterVertical h100 w100I',
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
          <ModalAlert
            hidden={hidden}
            _onClose={this._onClose}
            infoAditional={infoAditional}
          />
        )}
      </div>
    );
  }
}

Alerts.propTypes = {
  alertsTotal: PropTypes.number.isRequired,
  monitorsData: PropTypes.array.isRequired,
  alertsData: PropTypes.array.isRequired
};
