import React from 'react';
import PropTypes from 'prop-types';
import ModalInfrastructure from './ModalInfrastructure';
import { Spinner, Tooltip } from 'nr1';
import SearchInput, { createFilter } from 'react-search-input';
import { BsSearch } from 'react-icons/bs';
import iconDownload from '../../images/download.svg';
import ArrowUnion from '../../components/ArrowsTable/ArrowUnion';
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
  'host_name',
  'aliases',
  'apps',
  'sources',
  'muted',
  'tags_by_source'
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
      totalRows: 10,
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
        for (const key in element.tags_by_source) {
          if (Object.hasOwnProperty.call(element.tags_by_source, key)) {
            const elementKey = element.tags_by_source[key];
            if (tags === '') {
              tags = `${key}:\n`;
            } else {
              tags = `${tags}\n${key}:\n`;
            }
            const limitData = elementKey.slice(0, 3);
            for (const processor of limitData) {
              tags = `${tags}-${processor}\n`;
            }
            if (limitData.length === 3) {
              tags = `${tags}  ...`;
            }
          }
        }
      }
      if (tags === '') {
        tags = '-----';
      }
      let apps = '';
      if (element.apps) {
        element.apps.forEach(app => {
          apps = `${apps} ${app} \n`;
        });
      }
      if (apps === '') {
        apps = '-----';
      }
      let sources = '';
      if (element.sources) {
        element.sources.forEach(source => {
          sources = `${sources} ${source} \n`;
        });
      }
      if (sources === '') {
        sources = '-----';
      }
      let aliases = '';
      if (element.aliases) {
        element.aliases.forEach(alias => {
          aliases = `${aliases} ${alias} \n`;
        });
      }
      if (aliases === '') {
        aliases = '-----';
      }
      data.push({
        host_name: element.host_name ? element.host_name : '-----',
        aliases: aliases,
        apps: apps,
        sources: sources,
        muted: element.is_muted ? element.is_muted : '-----',
        tags_by_source: tags,
        dataTags_by_source: element.tags_by_source
          ? element.tags_by_source
          : [],
        cpu: element.metrics.cpu ? element.metrics.cpu : '-----',
        iowait: element.metrics.iowait ? element.metrics.iowait : '-----',
        load: element.metrics.load ? element.metrics.load : '-----'
      });
    });
    this.calcTable(data);
    this.setState({ data, dataRespaldo: data });
  }

  downloadData = async () => {
    const { dataRespaldo } = this.state; 
    const date = new Date();
    const zip = new JSZip();
    const dataCsv = [];
    dataRespaldo.forEach(row => {
      let tags = '';
      if (row.dataTags_by_source) {
        for (const key in row.dataTags_by_source) {
          if (Object.hasOwnProperty.call(row.dataTags_by_source, key)) {
            const elementKey = row.dataTags_by_source[key];
            if (tags === '') {
              tags = `${key}:\n`;
            } else {
              tags = `${tags}\n${key}:\n`;
            }
            for (const processor of elementKey) {
              tags = `${tags}  -${processor}\n`;
            }
          }
        }
      }
      if (tags === '') {
        tags = '-----';
      }
      dataCsv.push({
        HOST_NAME: row.host_name ? row.host_name : '-----',
        ALIASES: row.aliases ? row.aliases : '-----',
        APPS: row.apps ? row.apps : '-----',
        SOURCES: row.sources ? row.sources : '-----',
        MUTED: row.muted ? row.muted : '-----',
        TAGS_BY_SOURCE: tags,
        CPU: row.cpu ? row.cpu : '-----',
        IOWAIT: row.iowait ? row.iowait : '-----',
        LOAD: row.load ? row.load : '-----'
      });
    });
    jsoncsv.json2csv(dataCsv, (err, csv) => {
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
      case 'host_name':
        // eslint-disable-next-line no-case-declarations
        const sortHostname = finalList.sort(function(a, b) {
          if (a.host_name > b.host_name) {
            return valueOne;
          }
          if (a.host_name < b.host_name) {
            return valueTwo;
          }
          return 0;
        });
        return sortHostname;
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
      case 'tags_by_source':
        // eslint-disable-next-line no-case-declarations
        const sortTags = finalList.sort(function(a, b) {
          if (a.tags_by_source > b.tags_by_source) {
            return valueOne;
          }
          if (a.tags_by_source < b.tags_by_source) {
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
                  className=" box--title fontMedium "
                  style={{
                    color: greenColor
                  }}
                >
                  Total Hosts
                </span>
                <div>
                  <span
                    className="box--quantity fontBigger "
                    style={{
                      color: greenColor
                    }}
                  >
                    {data.length}
                  </span>
                </div>
              </div>
              <div className="information__box">
                <span
                  className=" box--title fontMedium "
                  style={{
                    color: greenColor
                  }}
                >
                  Total Active Hosts
                </span>
                <div>
                  <span
                    className="box--quantity fontBigger "
                    style={{
                      color: greenColor
                    }}
                  >
                    {data.length}
                  </span>
                </div>
              </div>
              <div
                style={{ height: '100%', width: '100%' }}
                className="graph_bar"
              >
                <div
                  style={{ textAlign: 'center', marginTop: '90%' }}
                  className="fontMedium"
                >
                  {data.length !== 0 && 'Platform'}
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
                <div style={{ width: '1338px' }} className="h100">
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
                          <div className="darkLine table__headerSticky fontSmall">
                            <div
                              className="pointer flex"
                              style={{ marginLeft: '15px' }}
                              onClick={() => {
                                this.setSortColumn('host_name');
                              }}
                            >
                              HOST NAME
                              <div className="flexColumn table__sort">
                                <ArrowUnion
                                  sortColumn={sortColumn}
                                  colorArrowOne={
                                    sortColumn.column === 'host_name' &&
                                    sortColumn.order === 'descent'
                                      ? 'black'
                                      : 'gray'
                                  }
                                  colorArrowTwo={
                                    sortColumn.column === 'host_name' &&
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
                        accessor: 'host_name',
                        sortable: false,
                        Cell: props => {
                          return (
                            <div
                              onClick={() =>
                                this.saveAction('data', props.original)
                              }
                              className="darkLine h100 flex flexCenterVertical pointer"
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
                          <div className="table__header fontSmall">
                            <div
                              className="pointer flex"
                              onClick={() => {
                                this.setSortColumn('aliases');
                              }}
                            >
                              ALIASES
                              <div className="flexColumn table__sort">
                                <ArrowUnion
                                  sortColumn={sortColumn}
                                  colorArrowOne={
                                    sortColumn.column === 'aliases' &&
                                    sortColumn.order === 'descent'
                                      ? 'black'
                                      : 'gray'
                                  }
                                  colorArrowTwo={
                                    sortColumn.column === 'aliases' &&
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
                        accessor: 'aliases',
                        className:
                          'table__cell fontNormal flex flexCenterVertical h100 w100I',
                        sortable: false,
                        Cell: props => (
                          <div className="h100 flex flexCenterVertical">
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
                                this.setSortColumn('apps');
                              }}
                            >
                              APPS
                              <div className="flexColumn table__sort">
                                <ArrowUnion
                                  sortColumn={sortColumn}
                                  colorArrowOne={
                                    sortColumn.column === 'apps' &&
                                    sortColumn.order === 'descent'
                                      ? 'black'
                                      : 'gray'
                                  }
                                  colorArrowTwo={
                                    sortColumn.column === 'apps' &&
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
                        accessor: 'apps',
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
                              className="pointer flex"
                              onClick={() => {
                                this.setSortColumn('sources');
                              }}
                            >
                              SOURCES
                              <div className="flexColumn table__sort">
                                <ArrowUnion
                                  sortColumn={sortColumn}
                                  colorArrowOne={
                                    sortColumn.column === 'sources' &&
                                    sortColumn.order === 'descent'
                                      ? 'black'
                                      : 'gray'
                                  }
                                  colorArrowTwo={
                                    sortColumn.column === 'sources' &&
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
                        accessor: 'sources',
                        className:
                          'table__cell fontNormal flex flexCenterVertical h100 w100I',
                        sortable: false,
                        Cell: props => (
                          <div className="h100 flex flexCenterVertical">
                            {props.value ? props.value : '-----'}
                          </div>
                        )
                      },
                      {
                        Header: () => (
                          <div className="table__header fontSmall">
                            <div
                              className="pointer flex"
                              onClick={() => {
                                this.setSortColumn('muted');
                              }}
                            >
                              MUTED
                              <div className="flexColumn table__sort">
                                <ArrowUnion
                                  sortColumn={sortColumn}
                                  colorArrowOne={
                                    sortColumn.column === 'muted' &&
                                    sortColumn.order === 'descent'
                                      ? 'black'
                                      : 'gray'
                                  }
                                  colorArrowTwo={
                                    sortColumn.column === 'muted' &&
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
                        accessor: 'muted',
                        className:
                          'table__cell fontNormal flex flexCenterVertical h100 w100I',
                        sortable: false,
                        Cell: props => (
                          <div className="h100 flex flexCenterVertical">
                            {`${props.value}`}
                          </div>
                        )
                      },
                      {
                        Header: () => (
                          <div className="table__header fontSmall">
                            <div
                              className="pointer flex"
                              onClick={() => {
                                this.setSortColumn('tags_by_source');
                              }}
                            >
                              TAGS BY SOURCE
                              <div className="flexColumn table__sort">
                                <ArrowUnion
                                  sortColumn={sortColumn}
                                  colorArrowOne={
                                    sortColumn.column === 'tags_by_source' &&
                                    sortColumn.order === 'descent'
                                      ? 'black'
                                      : 'gray'
                                  }
                                  colorArrowTwo={
                                    sortColumn.column === 'tags_by_source' &&
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
                        accessor: 'tags_by_source',
                        className:
                          'table__cell fontNormal flex flexCenterVertical h100 w100I',
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
