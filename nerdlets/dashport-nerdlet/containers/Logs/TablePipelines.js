import React from 'react';
import SearchInput, { createFilter } from 'react-search-input';
import { BsSearch } from 'react-icons/bs';
import iconDownload from '../../images/download.svg';
import ArrowDown from '../../components/ArrowsTable/ArrowDown';
import ArrowTop from '../../components/ArrowsTable/ArrowTop';
import ReactTable from 'react-table-v6';
import Pagination from '../../components/Pagination/Pagination';
import PropTypes from 'prop-types';
import jsoncsv from 'json-2-csv';
import JSZip from 'jszip';
import Select from 'react-select';
import { saveAs } from 'file-saver';

const KEYS_TO_FILTERS = ['name', 'enabled', 'type', 'processors'];

export default class TablePipelines extends React.Component {
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
    const { dataPipeline = [] } = this.props;
    const data = [];
    dataPipeline.forEach(element => {
      let processors = '';
      if (element.processors) {
        const limitData = element.processors.slice(0, 3);
        for (const processor of limitData) {
          if (processor.name !== '')
            processors = `${processors} ${processor.name} \n`;
        }
      }
      data.push({
        name: element.name,
        enabled: element.is_enabled,
        type: element.type,
        processors: processors
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
      zip.file(`LogsPipeline.csv`, csv);
      zip.generateAsync({ type: 'blob' }).then(function(content) {
        // see FileSaver.js
        saveAs(
          content,
          `LogsPipeline ${date.getDate()}-${date.getMonth() +
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
      case 'enabled':
        // eslint-disable-next-line no-case-declarations
        const sortEnabled = finalList.sort(function(a, b) {
          if (a.enabled > b.enabled) {
            return valueOne;
          }
          if (a.enabled < b.enabled) {
            return valueTwo;
          }
          return 0;
        });
        return sortEnabled;
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
      case 'processors':
        // eslint-disable-next-line no-case-declarations
        const sortProcessors = finalList.sort(function(a, b) {
          if (a.processors > b.processors) {
            return valueOne;
          }
          if (a.processors < b.processors) {
            return valueTwo;
          }
          return 0;
        });
        return sortProcessors;
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
    const { rangeSelected, timeRanges, handleRange } = this.props;
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
            styles={this.customStyles}
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
              if (data.length !== 0) this.downloadData();
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
                        gridTemplate: '1fr/ 40% repeat(3,20%)'
                      }
                    };
                  } else {
                    return {
                      style: {
                        borderBottom: 'none',
                        display: 'grid',
                        gridTemplate: '1fr/ 40% repeat(3,20%)'
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
                    gridTemplate: '1fr/ 40% repeat(3,20%)'
                  }
                };
              }}
              columns={[
                {
                  Header: () => (
                    <div className="table__headerSticky">
                      <div
                        className="pointer flex"
                        style={{ marginLeft: '5px' }}
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
                        className="h100 flex flexCenterVertical"
                        style={{
                          background: props.index % 2 ? '#F7F7F8' : 'white'
                        }}
                      >
                        <span style={{ marginLeft: '5px' }}>
                          {props.value ? props.value : '--'}
                        </span>
                      </div>
                    );
                  }
                },
                {
                  Header: () => (
                    <div className="table__header">
                      <div
                        className="pointer flex"
                        onClick={() => {
                          this.setSortColumn('enabled');
                        }}
                      >
                        ENABLED
                        <div className="flexColumn table__sort">
                          <ArrowTop
                            color={
                              sortColumn.column === 'enabled' &&
                              sortColumn.order === 'ascendant'
                                ? 'black'
                                : 'gray'
                            }
                          />
                          <ArrowDown
                            color={
                              sortColumn.column === 'enabled' &&
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
                  accessor: 'enabled',
                  className: 'table__cell flex flexCenterVertical h100 w100I',
                  sortable: false,
                  Cell: props => (
                    <div className="h100 flex flexCenterVertical">
                      {props.value ? `${props.value}` : '--'}
                    </div>
                  )
                },
                {
                  Header: () => (
                    <div className="table__header">
                      <div
                        className="pointer flex"
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
                  className: 'table__cell flex flexCenterVertical h100 w100I',
                  sortable: false,
                  Cell: props => (
                    <div className="h100 flex flexCenterVertical">
                      {props.value ? props.value : '--'}
                    </div>
                  )
                },
                {
                  Header: () => (
                    <div className="table__header">
                      <div
                        className="pointer flex"
                        onClick={() => {
                          this.setSortColumn('processors');
                        }}
                      >
                        ORDER PROCESSORS
                        <div className="flexColumn table__sort">
                          <ArrowTop
                            color={
                              sortColumn.column === 'processors' &&
                              sortColumn.order === 'ascendant'
                                ? 'black'
                                : 'gray'
                            }
                          />
                          <ArrowDown
                            color={
                              sortColumn.column === 'processors' &&
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
                  accessor: 'processors',
                  className: 'table__cell flex flexCenterVertical h100 w100I',
                  sortable: false,
                  Cell: props => (
                    <div className="h100 flex flexCenterVertical">
                      {props.value}
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
TablePipelines.propTypes = {
  rangeSelected: PropTypes.object.isRequired,
  timeRanges: PropTypes.array.isRequired,
  handleRange: PropTypes.func.isRequired,
  dataPipeline: PropTypes.array.isRequired
};