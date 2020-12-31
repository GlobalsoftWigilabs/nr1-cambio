import React from 'react';
import PropTypes from 'prop-types';
import ModalInfrastructure from './ModalInfrastructure';
import { Spinner, Tooltip } from 'nr1';
import SearchInput, { createFilter } from 'react-search-input';
import { BsSearch } from 'react-icons/bs';
import iconDownload from '../../images/download.svg';
import ArrowDown from '../../components/ArrowsTable/ArrowDown';
import ArrowTop from '../../components/ArrowsTable/ArrowTop';
import ReactTable from 'react-table-v6';
import Pagination from '../../components/Pagination/Pagination';
import Bar from '../../components/Bar';
import jsoncsv from 'json-2-csv';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

/**
 * Constants of colours
 */
const KEYS_TO_FILTERS = [
  'HOST_NAME',
  'ALIASES',
  'APPS',
  'SOURCES',
  'MUTED',
  'TAGS_BY_SOURCE'
];
const greenColor = '#007E8A';

/**
 * Class that render the Infrastructure component
 *
 * @export
 * @class Infrastructure
 * @extends {React.Component}
 */
export default class Infrastructure extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchHosts: '',
      loading: false,
      data: [],
      savingAllChecks: false,
      pagePag: 0,
      pages: 0,
      totalRows: 6,
      sortColumn: {
        column: '',
        order: ''
      },
      hidden: false
    };
  }

  /**
   * Creates an instance of Infrastructure.
   *
   * @param {*} props
   * @memberof Infrastructure
   */

  componentDidMount() {
    const { infraestructureList = [] } = this.props;
    const data = [];
    infraestructureList.forEach(element => {
      let tags = '';
      if (element.tags_by_source) {
        element.tags_by_source.Datadog.forEach(tag => {
          tags = `${tags} ${tag} \n`;
        });
      }
      let apps = '';
      if (element.apps) {
        element.apps.forEach(app => {
          apps = `${apps} ${app} \n`;
        });
      }
      let sources = '';
      if (element.sources) {
        element.sources.forEach(source => {
          sources = `${sources} ${source} \n`;
        });
      }
      let aliases = '';
      if (element.aliases) {
        element.aliases.forEach(alias => {
          aliases = `${aliases} ${alias} \n`;
        });
      }
      data.push({
        HOST_NAME: element.host_name,
        ALIASES: aliases,
        APPS: apps,
        SOURCES: sources,
        MUTED: element.is_muted,
        TAGS_BY_SOURCE: tags,
        CPU: element.metrics.cpu,
        IOWAIT: element.metrics.iowait,
        LOAD: element.metrics.load,

      });
    });
    this.calcTable(data);
    this.setState({ data, dataRespaldo: data });
  }

  downloadData = async () => {
    const { data } = this.state;
    const date = new Date();
    const zip = new JSZip();
    jsoncsv.json2csv(data, (err, csv) => {
      if (err) {
        throw err;
      }
      zip.file(`Infrastructure.csv`, csv);
      zip.generateAsync({ type: 'blob' }).then(function(content) {
        // see FileSaver.js
        saveAs(
          content,
          `Infrastructure ${date.getDate()}-${date.getMonth() +
            1}-${date.getFullYear()}.zip`
        );
      });
    });
  };

  sortData = (finalList, { order, column }) => {
    let valueOne = 1;
    let valueTwo = -1;
    if (order === 'descent') {
      valueOne = -1;
      valueTwo = 1;
    }
    switch (column) {
      case 'HOST_NAME':
        // eslint-disable-next-line no-case-declarations
        const sortHostname = finalList.sort(function(a, b) {
          if (a.HOST_NAME > b.HOST_NAME) {
            return valueOne;
          }
          if (a.HOST_NAME < b.HOST_NAME) {
            return valueTwo;
          }
          return 0;
        });
        return sortHostname;
      case 'ALIASES':
        // eslint-disable-next-line no-case-declarations
        const sortAliases = finalList.sort(function(a, b) {
          if (a.ALIASES > b.ALIASES) {
            return valueOne;
          }
          if (a.ALIASES < b.ALIASES) {
            return valueTwo;
          }
          return 0;
        });
        return sortAliases;
      case 'APPS':
        // eslint-disable-next-line no-case-declarations
        const sortApps = finalList.sort(function(a, b) {
          if (a.APPS > b.APPS) {
            return valueOne;
          }
          if (a.APPS < b.APPS) {
            return valueTwo;
          }
          return 0;
        });
        return sortApps;
      case 'SOURCES':
        // eslint-disable-next-line no-case-declarations
        const sortSources = finalList.sort(function(a, b) {
          if (a.SOURCES > b.SOURCES) {
            return valueOne;
          }
          if (a.SOURCES < b.SOURCES) {
            return valueTwo;
          }
          return 0;
        });
        return sortSources;
      case 'MUTED':
        // eslint-disable-next-line no-case-declarations
        const sortMuted = finalList.sort(function(a, b) {
          if (a.MUTED > b.MUTED) {
            return valueOne;
          }
          if (a.MUTED < b.MUTED) {
            return valueTwo;
          }
          return 0;
        });
        return sortMuted;
      case 'TAGS_BY_SOURCE':
        // eslint-disable-next-line no-case-declarations
        const sortTags = finalList.sort(function(a, b) {
          if (a.TAGS_BY_SOURCE > b.TAGS_BY_SOURCE) {
            return valueOne;
          }
          if (a.TAGS_BY_SOURCE < b.TAGS_BY_SOURCE) {
            return valueTwo;
          }
          return 0;
        });
        return sortTags;
      default:
        return finalList;
    }
  };

  loadData = (hosts, searchTerm, sortColumn) => {
    let finalList = hosts;
    if (searchTerm !== '') {
      finalList = finalList.filter(createFilter(searchTerm, KEYS_TO_FILTERS));
    }
    finalList = this.sortData(finalList, sortColumn);
    this.calcTable(finalList);
    this.setState({ data: finalList });
  };

  setSortColumn = column => {
    const { sortColumn, data, searchHosts } = this.state;
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
    this.loadData(data, searchHosts, {
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
  };

  _onClose = () => {
    const actualValue = this.state.hidden;
    this.setState({ hidden: !actualValue });
  };

  saveAction = async (action, infoAditional) => {
    this._onClose();
    this.setState({ infoAditional });
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
    const { infrastructureDataGraph = [] } = this.props;
    return (
      <div className="h100">
        {loading ? (
          <Spinner type={Spinner.TYPE.DOT} />
        ) : (
          <div className="mainContent">
            <div className="mainContent__infrastructure">
              <div className="information__box">
                <span
                  className="box--title"
                  style={{
                    color: greenColor
                  }}
                >
                  Total Hosts
                </span>
                <div>
                  <span
                    className="box--quantity"
                    style={{
                      color: greenColor
                    }}
                  >
                    {infrastructureDataGraph.length}
                  </span>
                </div>
              </div>
              <div className="information__box">
                <span
                  className="box--title"
                  style={{
                    color: greenColor
                  }}
                >
                  Total Active Hosts
                </span>
                <div>
                  <span
                    className="box--quantity"
                    style={{
                      color: greenColor
                    }}
                  >
                    {infrastructureDataGraph.length}
                  </span>
                </div>
              </div>
              <div
                style={{ height: '50%', width: '95%' }}
                className="graph_bar"
              >
                <div style={{ textAlign: 'center', marginTop: '90%' }}>
                  {' '}
                  <h3>Platform</h3>
                </div>
                {infrastructureDataGraph ? (
                  infrastructureDataGraph.map((data, index) => {
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
                <div className="h100">
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
                              gridTemplate: '1fr / 20% 30% 10% 10% 10% 20%'
                            }
                          };
                        } else {
                          return {
                            style: {
                              borderBottom: 'none',
                              display: 'grid',
                              gridTemplate: '1fr / 20% 30% 10% 10% 10% 20%'
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
                          gridTemplate: '1fr / 20% 30% 10% 10% 10% 20%'
                        }
                      };
                    }}
                    columns={[
                      {
                        Header: () => (
                          <div className="table__headerSticky">
                            <div
                              className="pointer flex"
                              style={{ marginLeft: '15px' }}
                              onClick={() => {
                                this.setSortColumn('HOST_NAME');
                              }}
                            >
                              HOST NAME
                              <div className="flexColumn table__sort">
                                <ArrowTop
                                  color={
                                    sortColumn.column === 'HOST_NAME' &&
                                    sortColumn.order === 'ascendant'
                                      ? 'black'
                                      : 'gray'
                                  }
                                />
                                <ArrowDown
                                  color={
                                    sortColumn.column === 'HOST_NAME' &&
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
                        accessor: 'HOST_NAME',
                        sortable: false,
                        Cell: props => {
                          return (
                            <div
                              onClick={() =>
                                this.saveAction('data', props.original)
                              }
                              className="h100 flex flexCenterVertical pointer"
                              style={{
                                background:
                                  props.index % 2 ? '#F7F7F8' : 'white',
                                color: '#0078BF'
                              }}
                            >
                              <span style={{ marginLeft: '15px' }}>
                                {props.value}
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
                                this.setSortColumn('ALIASES');
                              }}
                            >
                              ALIASES
                              <div className="flexColumn table__sort">
                                <ArrowTop
                                  color={
                                    sortColumn.column === 'ALIASES' &&
                                    sortColumn.order === 'ascendant'
                                      ? 'black'
                                      : 'gray'
                                  }
                                />
                                <ArrowDown
                                  color={
                                    sortColumn.column === 'ALIASES' &&
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
                        accessor: 'ALIASES',
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
                          <div className="table__header">
                            <div
                              className="pointer flex "
                              onClick={() => {
                                this.setSortColumn('APPS');
                              }}
                            >
                              APPS
                              <div className="flexColumn table__sort ">
                                <ArrowTop
                                  color={
                                    sortColumn.column === 'APPS' &&
                                    sortColumn.order === 'ascendant'
                                      ? 'black'
                                      : 'gray'
                                  }
                                />
                                <ArrowDown
                                  color={
                                    sortColumn.column === 'APPS' &&
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
                        accessor: 'APPS',
                        className:
                          'table__cell flex flexCenterVertical h100 w100I',
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
                              className="pointer flex"
                              onClick={() => {
                                this.setSortColumn('SOURCES');
                              }}
                            >
                              SOURCES
                              <div className="flexColumn table__sort">
                                <ArrowTop
                                  color={
                                    sortColumn.column === 'SOURCES' &&
                                    sortColumn.order === 'ascendant'
                                      ? 'black'
                                      : 'gray'
                                  }
                                />
                                <ArrowDown
                                  color={
                                    sortColumn.column === 'SOURCES' &&
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
                        accessor: 'SOURCES',
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
                          <div className="table__header">
                            <div
                              className="pointer flex"
                              onClick={() => {
                                this.setSortColumn('MUTED');
                              }}
                            >
                              MUTED
                              <div className="flexColumn table__sort">
                                <ArrowTop
                                  color={
                                    sortColumn.column === 'MUTED' &&
                                    sortColumn.order === 'ascendant'
                                      ? 'black'
                                      : 'gray'
                                  }
                                />
                                <ArrowDown
                                  color={
                                    sortColumn.column === 'MUTED' &&
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
                        accessor: 'MUTED',
                        className:
                          'table__cell flex flexCenterVertical h100 w100I',
                        sortable: false,
                        Cell: props => (
                          <div className="h100 flex flexCenterVertical">
                            {`${props.value}`}
                          </div>
                        )
                      },
                      {
                        Header: () => (
                          <div className="table__header">
                            <div
                              className="pointer flex"
                              onClick={() => {
                                this.setSortColumn('TAGS_BY_SOURCE');
                              }}
                            >
                              TAGS BY SOURCE
                              <div className="flexColumn table__sort">
                                <ArrowTop
                                  color={
                                    sortColumn.column === 'TAGS_BY_SOURCE' &&
                                    sortColumn.order === 'ascendant'
                                      ? 'black'
                                      : 'gray'
                                  }
                                />
                                <ArrowDown
                                  color={
                                    sortColumn.column === 'TAGS_BY_SOURCE' &&
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
                        accessor: 'TAGS_BY_SOURCE',
                        className:
                          'table__cell flex flexCenterVertical h100 w100I',
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
            </div>
          </div>
        )}
        {hidden && (
          <ModalInfrastructure
            hidden={hidden}
            _onClose={this._onClose}
            infoAditional={infoAditional}
          />
        )}
      </div>
    );
  }
}

Infrastructure.propTypes = {
  infrastructureDataGraph: PropTypes.array.isRequired,
  infraestructureList: PropTypes.array.isRequired
};
