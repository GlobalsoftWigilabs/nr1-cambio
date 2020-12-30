import React from 'react';
import PropTypes from 'prop-types';
import ModalInfrastructure from './ModalInfrastructure';
import { Spinner } from 'nr1';
import SearchInput, { createFilter } from 'react-search-input';
import { BsSearch } from 'react-icons/bs';
import iconDownload from '../../images/download.svg';
import ArrowDown from '../../components/ArrowsTable/ArrowDown';
import ArrowTop from '../../components/ArrowsTable/ArrowTop';
import Modal from '../../components/Modal';
import ReactTable from 'react-table-v6';
import Pagination from '../../components/Pagination/Pagination';
import Bar from "../../components/Bar";
import ModalAlert from "../Alerts/ModalAlert";
import jsoncsv from 'json-2-csv';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
/**
 * Constants of colours
 */
const KEYS_TO_FILTERS = [
  'hostname',
  'aliases',
  'apps',
  'sources',
  'muted',
  'tags'
];
const greenColor = '#007E8A';
const textGray = '#767B7F';
const grayColor = '#ADADAD';
const blueColor = '#0078BF';
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
      allChecked: false,
      all: true,
      favorite: false,
      visited: false,
      complex: '',
      dashboards: [],
      average: 0,
      categorizedList: [],
      data: [],
      avaliableList: [],
      mostVisited: [],
      favoriteDashboards: [],
      hosts: [],
      savingAllChecks: false,
      logs: [],
      selectedTag: "all",
      availableFilters: [
        { value: 'All', label: 'All' },
        { value: 'Favorites', label: 'Favorites' },
        { value: 'MostVisited', label: 'Most visited' }
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
      totalRows: 6,
      page: 1,
      ////////////
      finalList: [],
      textTag: '',
      searchTermDashboards: '',
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
      emptyData: false
    };
  }
  /**
   * Creates an instance of Infrastructure.
   *
   * @param {*} props
   * @memberof Infrastructure
   */

  componentDidMount() {
    const { infrastructureDataGraph, infraestructureList = [] } = this.props;
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
        hostname: element.host_name,
        aliases: aliases,
        apps: apps,
        sources: sources,
        muted: element.is_muted,
        metricsCpu: `${element.metrics.cpu}`,
        metricsIowait: ` ${element.metrics.iowait}`,
        metricsLoad: `${element.metrics.load} `,
        tags: tags
      });
    });
    console.log(infrastructureDataGraph, "DATA")
    console.log(infraestructureList, "LIST")
    this.calcTable(data);
    this.setState({ data, dataRespaldo: data });
  };
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
      case 'hostname':
        // eslint-disable-next-line no-case-declarations
        const sortName = finalList.sort(function(a, b) {
          if (a.hostname > b.hostname) {
            return valueOne;
          }
          if (a.hostname < b.hostname) {
            return valueTwo;
          }
          return 0;
        });
        return sortName;
      case 'aliases':
        // eslint-disable-next-line no-case-declarations
        const sortAliases = finalList.sort(function(a, b) {
          if (a.aliases > b.aliases) {
            return valueOne;
          }
          if (a.aliases < b.aliases) {
            return valueTwo;
          }
          return 0;
        });
        return sortAliases;
      case 'apps':
        // eslint-disable-next-line no-case-declarations
        const sortApps = finalList.sort(function(a, b) {
          if (a.apps > b.apps) {
            return valueOne;
          }
          if (a.apps < b.apps) {
            return valueTwo;
          }
          return 0;
        });
        return sortApps;
      case 'sources':
        // eslint-disable-next-line no-case-declarations
        const sortSources = finalList.sort(function(a, b) {
          if (a.sources > b.sources) {
            return valueOne;
          }
          if (a.sources < b.sources) {
            return valueTwo;
          }
          return 0;
        });
        return sortSources;
      case 'muted':
        // eslint-disable-next-line no-case-declarations
        const sortMuted = finalList.sort(function(a, b) {
          if (a.muted > b.muted) {
            return valueOne;
          }
          if (a.muted < b.muted) {
            return valueTwo;
          }
          return 0;
        });
        return sortMuted;
      case 'tags':
        // eslint-disable-next-line no-case-declarations
        const sortTags = finalList.sort(function(a, b) {
          if (a.tags > b.tags) {
            return valueOne;
          }
          if (a.tags < b.tags) {
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
    this.setState({ searchAlerts: term });
  };

  _onClose = () => {
    const actualValue = this.state.hidden;
    this.setState({ hidden: !actualValue });
  };

  saveAction = async (action, infoAditional) => {
    this._onClose();
    this.setState({ action: action, infoAditional });
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
    const { infrastructureDataGraph  } = this.props;
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
                                      }}>
                                        Total Hosts
                                    </span>
                <div onClick={() => alert('Action')} className="pointer">
                                        <span
                                          className="box--quantity"
                                          style={{
                                            color: greenColor
                                          }}>
                                          {infrastructureDataGraph.length}
                                          </span>
                </div>
              </div>
              <div className="information__box">
                                    <span
                                      className="box--title"
                                      style={{
                                        color: greenColor
                                      }}>
                                        Total Active Hosts
                                    </span>
                <div>
                                        <span
                                          className="box--quantity"
                                          style={{
                                            color: greenColor
                                          }}>
                                          {infrastructureDataGraph.length}
                                        </span>
                </div>
              </div>
              <div
                style={{ height: '50%', width: '95%' }}
                className="graph_bar"
              >
                <div style={{ textAlign: 'center', marginTop: '90%' }}> <h3>Platform</h3></div>
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
                    <BsSearch size="10px" color={"#767B7F"} />
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
                {data.length !== 0 &&
                <Pagination
                  page={pagePag}
                  pages={pages}
                  upPage={this.upPage}
                  goToPage={this.changePage}
                  downPage={this.downPage}
                />}
              </div>
              <div className="tableContent__table">
                <div style={{ width: '3000px' }} className="h100">
                  <ReactTable
                    loading={savingAllChecks}
                    loadingText={'Processing...'}
                    page={pagePag}
                    showPagination={false}
                    resizable={false}
                    data={data}
                    defaultPageSize={totalRows}
                    getTrProps={(state, rowInfo) => {
                      {
                        if (rowInfo) {
                          return {
                            style: {
                              background: rowInfo.index % 2 ? '#F7F7F8' : 'white',
                              borderBottom: 'none',
                              display: 'grid',
                              gridTemplate: '1fr/ repeat(6,7%)'
                            }
                          };
                        } else {
                          return {
                            style: {
                              borderBottom: 'none',
                              display: 'grid',
                              gridTemplate: '1fr/ repeat(6,7%)'
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
                          gridTemplate: '1fr/ repeat(6,7%)'
                        }
                      };
                    }}
                    columns={[
                      {
                        Header: () => (
                          <div className="table__headerSticky">
                            <div className="pointer flex flexCenterHorizontal" style={{ marginLeft: "5px" }} onClick={() => { this.setSortColumn('hostname') }}>
                              HOST NAME
                              <div className="flexColumn table__sort">
                                <ArrowTop color={sortColumn.column === 'hostname' && sortColumn.order === 'ascendant' ? "black" : "gray"} />
                                <ArrowDown color={sortColumn.column === 'hostname' && sortColumn.order === 'descent' ? "black" : "gray"} />
                              </div>
                            </div>
                          </div>
                        ),
                        headerClassName: 'stycky w100I',
                        className: ' stycky table__cellSticky h100 w100I',
                        accessor: 'hostname',
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
                              <span style={{ marginLeft: '5px' }}>
                                {props.value}
                              </span>
                            </div>
                          )
                        }
                      },
                      {
                        Header: () => (
                          <div className="table__header">
                            <div className="pointer flex flexCenterHorizontal" onClick={() => { this.setSortColumn('aliases') }}>
                              ALIASES
                              <div className="flexColumn table__sort">
                                <ArrowTop color={sortColumn.column === 'aliases' && sortColumn.order === 'ascendant' ? "black" : "gray"} />
                                <ArrowDown color={sortColumn.column === 'aliases' && sortColumn.order === 'descent' ? "black" : "gray"} />
                              </div>
                            </div>
                          </div>
                        ),
                        headerClassName: 'w100I',
                        accessor: 'aliases',
                        className: 'table__cell flex flexCenterHorizontal flexCenterVertical h100 w100I',
                        sortable: false,
                        Cell: props => <div className="h100 flex flexCenterVertical flexCenterHorizontal">
                            {props.value ? props.value : '--'}
                        </div>
                      },
                      {
                        Header: () => (
                          <div className="table__header">
                            <div className="pointer flex flexCenterHorizontal" onClick={() => { this.setSortColumn('apps') }}>
                              APPS
                              <div className="flexColumn table__sort">
                                <ArrowTop color={sortColumn.column === 'apps' && sortColumn.order === 'ascendant' ? "black" : "gray"} />
                                <ArrowDown color={sortColumn.column === 'apps' && sortColumn.order === 'descent' ? "black" : "gray"} />
                              </div>
                            </div>
                          </div>
                        ),
                        headerClassName: 'w100I',
                        accessor: 'apps',
                        className: 'table__cell flex flexCenterHorizontal flexCenterVertical h100 w100I',
                        sortable: false,
                        Cell: props => <div className="h100 flex flexCenterVertical flexCenterHorizontal">
                          {props.value ? props.value : '--'}
                        </div>
                      },
                      {
                        Header: () => (
                          <div className="table__header">
                            <div className="pointer flex flexCenterHorizontal" onClick={() => { this.setSortColumn('sources') }}>
                              SOURCES
                              <div className="flexColumn table__sort">
                                <ArrowTop color={sortColumn.column === 'sources' && sortColumn.order === 'ascendant' ? "black" : "gray"} />
                                <ArrowDown color={sortColumn.column === 'sources' && sortColumn.order === 'descent' ? "black" : "gray"} />
                              </div>
                            </div>
                          </div>
                        ),
                        headerClassName: 'w100I',
                        accessor: 'sources',
                        className: 'table__cell flex flexCenterHorizontal flexCenterVertical h100 w100I',
                        sortable: false,
                        Cell: props => <div className="h100 flex flexCenterVertical flexCenterHorizontal">
                          {props.value ? props.value : '--'}
                        </div>
                      },
                      {
                        Header: () => (
                          <div className="table__header">
                            <div className="pointer flex flexCenterHorizontal" onClick={() => { this.setSortColumn('muted') }}>
                              MUTED
                              <div className="flexColumn table__sort">
                                <ArrowTop color={sortColumn.column === 'muted' && sortColumn.order === 'ascendant' ? "black" : "gray"} />
                                <ArrowDown color={sortColumn.column === 'muted' && sortColumn.order === 'descent' ? "black" : "gray"} />
                              </div>
                            </div>
                          </div>
                        ),
                        headerClassName: 'w100I',
                        accessor: 'muted',
                        className: 'table__cell flex flexCenterHorizontal flexCenterVertical h100 w100I',
                        sortable: false,
                        Cell: props => <div className="h100 flex flexCenterVertical flexCenterHorizontal">
                          {`${props.value}`}
                        </div>
                      },
                      {
                        Header: () => (
                          <div className="table__header">
                            <div className="pointer flex flexCenterHorizontal" onClick={() => { this.setSortColumn('tags') }}>
                              TAGS
                              <div className="flexColumn table__sort">
                                <ArrowTop color={sortColumn.column === 'tags' && sortColumn.order === 'ascendant' ? "black" : "gray"} />
                                <ArrowDown color={sortColumn.column === 'tags' && sortColumn.order === 'descent' ? "black" : "gray"} />
                              </div>
                            </div>
                          </div>
                        ),
                        headerClassName: 'w100I',
                        accessor: 'tags',
                        className: 'table__cell flex flexCenterHorizontal flexCenterVertical h100 w100I',
                        sortable: false,
                        Cell: props => <div className="h100 flex flexCenterVertical flexCenterHorizontal">
                          {props.value}
                        </div>
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
    )
  }
}

Infrastructure.propTypes = {
  infrastructureDataGraph: PropTypes.object.isRequired,
  infraestructureList: PropTypes.array.isRequired
};
