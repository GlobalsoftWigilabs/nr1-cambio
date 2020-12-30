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
  'name',
  'classification',
  'created',
  'author',
  'last_triggered_ts',
  'type',
  'status',
  'multi',
  'priority'
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
      let thresholds = '--';
      if (element.thresholds) {
        if (element.thresholds.critical) {
          thresholds = `critical: ${element.thresholds.critical}`;
        }
        if (element.thresholds.warning) {
          thresholds = `${thresholds} \n warning: ${element.thresholds.warning}`;
        }
      }
      data.push({
        name: element.name,
        classification: element.classification,
        message: element.message,
        created: element.created,
        author: element.creator.name,
        last_triggered_ts: element.last_triggered_ts,
        type: element.type,
        status: element.status,
        multi: element.multi,
        priority: element.priority,
        query: element.query,
        aggregation: element.aggregation,
        evaluation_delay: element.evaluation_delay,
        new_host_delay: element.new_host_delay,
        no_data_timeframe: element.no_data_timeframe,
        notify_audit: element.notify_audit,
        notify_no_data: element.notify_no_data,
        thresholds: thresholds,
        min_location_failed: element.min_location_failed,
        min_failure_duration: element.min_failure_duration
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
    jsoncsv.json2csv(data, (err, csv) => {
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
      case 'name':
        // eslint-disable-next-line no-case-declarations
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
      case 'classification':
        // eslint-disable-next-line no-case-declarations
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
      case 'created':
        // eslint-disable-next-line no-case-declarations
        const sortCreated = finalList.sort(function(a, b) {
          const date1 = new Date(moment(a.created).format('YYYY-MM-DDTHH:mm'));
          const date2 = new Date(moment(b.created).format('YYYY-MM-DDTHH:mm'));
          if (date1 > date2) return valueOne;
          if (date1 < date2) return valueTwo;
          return 0;
        });
        return sortCreated;
      case 'last_triggered_ts':
        // eslint-disable-next-line no-case-declarations
        const sortLast_triggered_ts = finalList.sort(function(a, b) {
          const date1 = new Date(
            moment.unix(a.last_triggered_ts).format('YYYY-MM-DDTHH:mm')
          );
          const date2 = new Date(
            moment.unix(b.last_triggered_ts).format('YYYY-MM-DDTHH:mm')
          );
          if (date1 > date2) return valueOne;
          if (date1 < date2) return valueTwo;
          return 0;
        });
        return sortLast_triggered_ts;
      case 'author':
        // eslint-disable-next-line no-case-declarations
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
      case 'type':
        // eslint-disable-next-line no-case-declarations
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
      case 'status':
        // eslint-disable-next-line no-case-declarations
        const sortStatus = finalList.sort(function(a, b) {
          if (a.status > b.status) {
            return valueOne;
          }
          if (a.status < b.status) {
            return valueTwo;
          }
          return 0;
        });
        return sortStatus;
      case 'multi':
        // eslint-disable-next-line no-case-declarations
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
      case 'priority':
        // eslint-disable-next-line no-case-declarations
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
                        headerClassName: 'stycky w100I',
                        className: ' stycky table__cellSticky h100 w100I',
                        accessor: 'name',
                        sortable: false,
                        Cell: props => {
                          return (
                            <div
                              onClick={() =>
                                this.saveAction('data', props.original)
                              }
                              className="h100 flex pointer flexCenterVertical flexCenterVertical"
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
                                this.setSortColumn('classification');
                              }}
                            >
                              CLASSIFICATION
                              <div className="flexColumn table__sort">
                                <ArrowTop
                                  color={
                                    sortColumn.column === 'classification' &&
                                    sortColumn.order === 'ascendant'
                                      ? 'black'
                                      : 'gray'
                                  }
                                />
                                <ArrowDown
                                  color={
                                    sortColumn.column === 'classification' &&
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
                        accessor: 'classification',
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
                                this.setSortColumn('author');
                              }}
                            >
                              AUTHOR
                              <div className="flexColumn table__sort">
                                <ArrowTop
                                  color={
                                    sortColumn.column === 'author' &&
                                    sortColumn.order === 'ascendant'
                                      ? 'black'
                                      : 'gray'
                                  }
                                />
                                <ArrowDown
                                  color={
                                    sortColumn.column === 'author' &&
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
                        accessor: 'author',
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
                                this.setSortColumn('created');
                              }}
                            >
                              CREATION DATE
                              <div className="flexColumn table__sort">
                                <ArrowTop
                                  color={
                                    sortColumn.column === 'created' &&
                                    sortColumn.order === 'ascendant'
                                      ? 'black'
                                      : 'gray'
                                  }
                                />
                                <ArrowDown
                                  color={
                                    sortColumn.column === 'created' &&
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
                        accessor: 'created',
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
                                this.setSortColumn('last_triggered_ts');
                              }}
                            >
                              DATE LAST TRIGGERED
                              <div className="flexColumn table__sort">
                                <ArrowTop
                                  color={
                                    sortColumn.column === 'last_triggered_ts' &&
                                    sortColumn.order === 'ascendant'
                                      ? 'black'
                                      : 'gray'
                                  }
                                />
                                <ArrowDown
                                  color={
                                    sortColumn.column === 'last_triggered_ts' &&
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
                        accessor: 'last_triggered_ts',
                        className:
                          'table__cell flex flexCenterVertical h100 w100I',
                        sortable: false,
                        Cell: props => (
                          <div className="h100 flex flexCenterVertical ">
                            {props.value
                              ? moment.unix(props.value).format('MM/DD/YYYY')
                              : '--'}
                          </div>
                        )
                      },
                      {
                        Header: () => (
                          <div className="table__header">
                            <div
                              className="pointer flex "
                              onClick={() => {
                                this.setSortColumn('status');
                              }}
                            >
                              OVERALL STATE
                              <div className="flexColumn table__sort">
                                <ArrowTop
                                  color={
                                    sortColumn.column === 'status' &&
                                    sortColumn.order === 'ascendant'
                                      ? 'black'
                                      : 'gray'
                                  }
                                />
                                <ArrowDown
                                  color={
                                    sortColumn.column === 'status' &&
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
                        accessor: 'status',
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
                                this.setSortColumn('multi');
                              }}
                            >
                              MULTI
                              <div className="flexColumn table__sort">
                                <ArrowTop
                                  color={
                                    sortColumn.column === 'multi' &&
                                    sortColumn.order === 'ascendant'
                                      ? 'black'
                                      : 'gray'
                                  }
                                />
                                <ArrowDown
                                  color={
                                    sortColumn.column === 'multi' &&
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
                        accessor: 'multi',
                        className:
                          'table__cell flex flexCenterVertical h100 w100I',
                        sortable: false,
                        Cell: props => (
                          <div className="h100 flex flexCenterVertical ">
                            {props.value ? 'yes' : 'no'}
                          </div>
                        )
                      },
                      {
                        Header: () => (
                          <div className="table__header">
                            <div
                              className="pointer flex "
                              onClick={() => {
                                this.setSortColumn('priority');
                              }}
                            >
                              PRIORITY
                              <div className="flexColumn table__sort">
                                <ArrowTop
                                  color={
                                    sortColumn.column === 'priority' &&
                                    sortColumn.order === 'ascendant'
                                      ? 'black'
                                      : 'gray'
                                  }
                                />
                                <ArrowDown
                                  color={
                                    sortColumn.column === 'priority' &&
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
                        accessor: 'priority',
                        className:
                          'table__cell flex flexCenterVertical h100 w100I',
                        sortable: false,
                        Cell: props => (
                          <div className="h100 flex flexCenterVertical ">
                            {props.value ? props.value : '--'}
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
