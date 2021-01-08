import React from 'react';
import SearchInput, { createFilter } from 'react-search-input';
import { BsSearch } from 'react-icons/bs';
import iconDownload from '../../images/download.svg';
import ArrowDown from '../../components/ArrowsTable/ArrowDown';
import ArrowTop from '../../components/ArrowsTable/ArrowTop';
import ReactTable from 'react-table-v6';
import Pagination from '../../components/Pagination/Pagination';
import PropTypes from 'prop-types';
import Select from 'react-select';

const KEYS_TO_FILTERS = [
  'id',
  'aggrType',
  'path',
  'filterQuery',
  'groupByPath',
  'tagName'
];

export default class TableMetrics extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      searchAlerts: '',
      savingAllChecks: false,
      pagePag: 0,
      pages: 0,
      totalRows: 10,
      sortColumn: {
        column: '',
        order: ''
      }
    };
  }

  componentDidMount() {
    const { dataMetrics = [] } = this.props;
    this.calcTable(dataMetrics);
    this.setState({ data: dataMetrics, dataRespaldo: dataMetrics });
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
      case 'id':
        // eslint-disable-next-line no-case-declarations
        const sortId = finalList.sort(function(a, b) {
          if (a.id > b.id) {
            return valueOne;
          }
          if (a.id < b.id) {
            return valueTwo;
          }
          return 0;
        });
        return sortId;
      case 'aggrType':
        // eslint-disable-next-line no-case-declarations
        const sortAggrType = finalList.sort(function(a, b) {
          if (a.aggrType > b.aggrType) {
            return valueOne;
          }
          if (a.aggrType < b.aggrType) {
            return valueTwo;
          }
          return 0;
        });
        return sortAggrType;
      case 'path':
        // eslint-disable-next-line no-case-declarations
        const sortPath = finalList.sort(function(a, b) {
          if (a.path > b.path) {
            return valueOne;
          }
          if (a.path < b.path) {
            return valueTwo;
          }
          return 0;
        });
        return sortPath;
      case 'filterQuery':
        // eslint-disable-next-line no-case-declarations
        const sortFilterQuery = finalList.sort(function(a, b) {
          if (a.filterQuery > b.filterQuery) {
            return valueOne;
          }
          if (a.filterQuery < b.filterQuery) {
            return valueTwo;
          }
          return 0;
        });
        return sortFilterQuery;
      case 'groupByPath':
        // eslint-disable-next-line no-case-declarations
        const sortGroupByPath = finalList.sort(function(a, b) {
          if (a.groupByPath > b.groupByPath) {
            return valueOne;
          }
          if (a.groupByPath < b.groupByPath) {
            return valueTwo;
          }
          return 0;
        });
        return sortGroupByPath;
      case 'tagName':
        // eslint-disable-next-line no-case-declarations
        const sortTagName = finalList.sort(function(a, b) {
          if (a.tagName > b.tagName) {
            return valueOne;
          }
          if (a.tagName < b.tagName) {
            return valueTwo;
          }
          return 0;
        });
        return sortTagName;
      default:
        return finalList;
    }
  };

  render() {
    const {
      savingAllChecks,
      pagePag,
      pages,
      totalRows,
      sortColumn,
      data
    } = this.state;
    const { rangeSelected, timeRanges, handleRange, downloadData } = this.props;
    return (
      <>
        <div className="tableContentLogs__filter">
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
            isSearchable={false}
            options={timeRanges}
            onChange={handleRange}
            value={rangeSelected}
            placeholder="All"
          />
          <div
            className={
              data.length === 0
                ? 'pointerBlock flex flexCenterVertical'
                : 'pointer flex flexCenterVertical'
            }
            onClick={() => {
              if (data.length !== 0) {
                // downloadData;
              }
            }}
          >
            <img
              src={iconDownload}
              style={{ marginLeft: '20px' }}
              height="18px"
            />
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
          <div style={{ width: '100%' }} className="h100">
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
                        background: rowInfo.index % 2 ? '#F7F7F8' : 'white',
                        borderBottom: 'none',
                        display: 'grid',
                        gridTemplate: '1fr/ repeat(6,16.66%)'
                      }
                    };
                  } else {
                    return {
                      style: {
                        borderBottom: 'none',
                        display: 'grid',
                        gridTemplate: '1fr/ repeat(6,16.66%)'
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
                    gridTemplate: '1fr/ repeat(6,16.66%)'
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
                          this.setSortColumn('id');
                        }}
                      >
                        ID
                        <div className="flexColumn table__sort">
                          <ArrowTop
                            color={
                              sortColumn.column === 'id' &&
                              sortColumn.order === 'ascendant'
                                ? 'black'
                                : 'gray'
                            }
                          />
                          <ArrowDown
                            color={
                              sortColumn.column === 'id' &&
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
                  accessor: 'id',
                  sortable: false,
                  Cell: props => {
                    return (
                      <div
                        className="h100 flex flexCenterVertical"
                        style={{
                          background: props.index % 2 ? '#F7F7F8' : 'white'
                        }}
                      >
                        <span style={{ marginLeft: '15px' }}>
                          {props.value ? props.value : '-----'}
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
                          this.setSortColumn('aggrType');
                        }}
                      >
                        COMPUTE AGGR TYPE
                        <div className="flexColumn table__sort">
                          <ArrowTop
                            color={
                              sortColumn.column === 'aggrType' &&
                              sortColumn.order === 'ascendant'
                                ? 'black'
                                : 'gray'
                            }
                          />
                          <ArrowDown
                            color={
                              sortColumn.column === 'aggrType' &&
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
                  accessor: 'aggrType',
                  className: 'table__cell flex flexCenterVertical h100 w100I',
                  sortable: false,
                  Cell: props => (
                    <div className="h100 flex flexCenterVertical ">
                      {props.value ? props.value : '-----'}
                    </div>
                  )
                },
                {
                  Header: () => (
                    <div className="table__header">
                      <div
                        className="pointer flex "
                        onClick={() => {
                          this.setSortColumn('path');
                        }}
                      >
                        COMPUTE PATH
                        <div className="flexColumn table__sort">
                          <ArrowTop
                            color={
                              sortColumn.column === 'path' &&
                              sortColumn.order === 'ascendant'
                                ? 'black'
                                : 'gray'
                            }
                          />
                          <ArrowDown
                            color={
                              sortColumn.column === 'path' &&
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
                  accessor: 'path',
                  className: 'table__cell flex flexCenterVertical h100 w100I',
                  sortable: false,
                  Cell: props => (
                    <div className="h100 flex flexCenterVertical ">
                      {props.value ? props.value : '-----'}
                    </div>
                  )
                },
                {
                  Header: () => (
                    <div className="table__header">
                      <div
                        className="pointer flex "
                        onClick={() => {
                          this.setSortColumn('filterQuery');
                        }}
                      >
                        FILTER QUERY
                        <div className="flexColumn table__sort">
                          <ArrowTop
                            color={
                              sortColumn.column === 'filterQuery' &&
                              sortColumn.order === 'ascendant'
                                ? 'black'
                                : 'gray'
                            }
                          />
                          <ArrowDown
                            color={
                              sortColumn.column === 'filterQuery' &&
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
                  accessor: 'filterQuery',
                  className: 'table__cell flex flexCenterVertical h100 w100I',
                  sortable: false,
                  Cell: props => (
                    <div className="h100 flex flexCenterVertical ">
                      {props.value ? props.value : '-----'}
                    </div>
                  )
                },
                {
                  Header: () => (
                    <div className="table__header">
                      <div
                        className="pointer flex "
                        onClick={() => {
                          this.setSortColumn('groupByPath');
                        }}
                      >
                        GROUP BY PATH
                        <div className="flexColumn table__sort">
                          <ArrowTop
                            color={
                              sortColumn.column === 'groupByPath' &&
                              sortColumn.order === 'ascendant'
                                ? 'black'
                                : 'gray'
                            }
                          />
                          <ArrowDown
                            color={
                              sortColumn.column === 'groupByPath' &&
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
                  accessor: 'groupByPath',
                  className: 'table__cell flex flexCenterVertical h100 w100I',
                  sortable: false,
                  Cell: props => (
                    <div className="h100 flex flexCenterVertical ">
                      {props.value ? props.value : '-----'}
                    </div>
                  )
                },
                {
                  Header: () => (
                    <div className="table__header">
                      <div
                        className="pointer flex "
                        onClick={() => {
                          this.setSortColumn('tagName');
                        }}
                      >
                        GROUP TAG NAME
                        <div className="flexColumn table__sort">
                          <ArrowTop
                            color={
                              sortColumn.column === 'tagName' &&
                              sortColumn.order === 'ascendant'
                                ? 'black'
                                : 'gray'
                            }
                          />
                          <ArrowDown
                            color={
                              sortColumn.column === 'tagName' &&
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
                  accessor: 'tagName',
                  className: 'table__cell flex flexCenterVertical h100 w100I',
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
      </>
    );
  }
}
TableMetrics.propTypes = {
  rangeSelected: PropTypes.object.isRequired,
  timeRanges: PropTypes.array.isRequired,
  handleRange: PropTypes.func.isRequired,
  dataMetrics: PropTypes.array.isRequired
};
