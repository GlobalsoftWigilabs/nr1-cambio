/* eslint-disable react/no-deprecated */
import React from 'react';
import PropTypes from 'prop-types';
import ReactTable from 'react-table-v6';
import { Spinner } from 'nr1';
import {
  readNerdStorage,
  readNerdStorageOnlyCollection,
  recoveDataDashboards
} from '../../services/NerdStorage/api';
import iconDownload from '../../images/download.svg';
import ArrowDown from '../../components/ArrowsTable/ArrowDown';
import ArrowTop from '../../components/ArrowsTable/ArrowTop';
import Modal from './Modal';

import { Tooltip } from 'nr1';
import { sendLogsSlack } from '../../services/Wigilabs/api';
import SearchInput, { createFilter } from 'react-search-input';
import { BsSearch } from 'react-icons/bs';
import Pagination from '../../components/Pagination/Pagination';
import JSZip from 'jszip';
import jsoncsv from 'json-2-csv';
import { saveAs } from 'file-saver';
import { qregExr } from '../../dd2nr/transpiler/regexr';

const KEYS_TO_FILTERS = [
  'name',
  'autor',
  'creation',
  'modified',
  'popularity',
  'description',
  'layoutType',
  'url'
];

/**
 * Class that render the Dashboard Component
 *
 * @export
 * @class Dashboard
 * @extends {React.Component}
 */
export default class Dashboard extends React.Component {
  /**
   * Creates an instance of Dashboard.
   *
   * @param {*} props
   * @memberof Dashboard
   */
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
        { value: 'CSV', label: 'CSV' },
        { value: 'JSON', label: 'JSON' }
      ],
      selectFormat: { value: 'CSV', label: 'CSV' },
      emptyData: false,
      infoAditional: {}
    };
  }

  /**
   * Method called when the component was mounted
   *
   * @memberof Dashboard
   */
  componentWillMount() {
    this.setState({ loading: true });
    this.loadDashboards();
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
      width: '100%'
    })
  };

  /**
   * Method that reads the Dashboards collection on NerdStorage
   *
   * @returns Dashboards array
   * @memberof Dashboard
   */
  async loadNerdData() {
    const error = [];
    let nerdDashboards = [];
    const { accountId } = this.props;
    // Recuperar la lista de dashboards
    try {
      const list = [];
      const sizeList = await readNerdStorageOnlyCollection(
        accountId,
        'dashboards',
        this.reportLogFetch
      );
      for (let i = 0; i < sizeList.length - 1; i++) {
        const page = await readNerdStorage(
          accountId,
          'dashboards',
          `dashboards-${i}`,
          this.reportLogFetch
        );
        if (page) {
          for (const iterator of page) {
            list.push(iterator);
          }
        }
      }
      const dashboardObj = await readNerdStorage(
        accountId,
        'dashboards',
        `dashboards-obj`,
        this.reportLogFetch
      );
      if (dashboardObj.status === 'EMPTY') {
        this.setState({ emptyData: true });
      }
      nerdDashboards = list;
    } catch (err) {
      error.push(err);
    }

    return nerdDashboards;
  }

  reportLogFetch = async response => {
    const { logs } = this.state;
    const arrayLogs = logs;
    arrayLogs.push({
      message: response.message,
      event: response.event,
      type: response.type,
      date: response.date
    });
    this.setState({ logs: arrayLogs });
  };

  async sendLogs(accountId) {
    const { logs } = this.state;
    if (logs.length !== 0) {
      await sendLogsSlack(logs, accountId);
      this.setState({ logs: [] });
    }
  }

  /**
   * Method that receives the dashboards from NerdStorage and saves it on state
   *
   * @memberof Dashboard
   */
  async loadDashboards() {
    const { searchTermDashboards, sortColumn } = this.state;
    const {dataDashboards }=this.props;
    //average widgets
    let quantityTotal = 0;
    for (const dd of dataDashboards) {
      dd.popularity = dd.popularity ? dd.popularity : 0;
      dd.widgetsCount = dd.widgets.length;
      dd.autor=dd.autor!== ''?dd.autor:'-----';
      dd.description=dd.description!== ''?dd.description:'-----';
      let dashboardList='';
      if(dd.dashboardList){
          if(dd.dashboardList.length===0){
            dashboardList='-----';
          }else{
              const dataLimit=dd.dashboardList.slice(0,3);
          for (const list of dataLimit) {
              dashboardList = `${dashboardList} ${list} \n`;
            }
          if(dd.dashboardList.length>3)
            dashboardList = `${dashboardList} ...`;
          }
      }
      dd.dashboardListTxt=dashboardList;
      quantityTotal += dd.widgets.length;
    }
    this.setState({
      dashboards: dataDashboards,
      loading: false,
      savingAllChecks: false,
      average: Math.round(quantityTotal / dataDashboards.length)
    });
    this.loadData(dataDashboards, searchTermDashboards, sortColumn);
  }

  /**
   * method that changes the table to the next page
   *
   * @memberof Migration
   */
  upPage = () => {
    const { pagePag } = this.state;
    this.setState({ pagePag: pagePag + 1 });
  };

  /**
   * Method that change the table to the selected page
   *
   * @memberof Migration
   * @param {number} pagePag Destination page
   */
  changePage = pagePag => {
    this.setState({ pagePag: pagePag - 1 });
  };

  /**
   * Method that changes the table to the previous page
   *
   * @memberof Migration
   */
  downPage = () => {
    const { pagePag } = this.state;
    this.setState({ pagePag: pagePag - 1 });
  };

  /**
   * method that calculates the total number of pages to show
   *
   * @memberof Migration
   */
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

  loadData = (dashboards, searchTerm, sortColumn) => {
    let finalList = dashboards;
    if (searchTerm !== '') {
      finalList = finalList.filter(createFilter(searchTerm, KEYS_TO_FILTERS));
    }
    finalList = this.sortData(finalList, sortColumn);
    this.calcTable(finalList);
    this.setState({ finalList: finalList });
  };

  searchUpdated = term => {
    const { dashboards, sortColumn } = this.state;
    this.loadData(dashboards, term, sortColumn);
    this.setState({ searchTermDashboards: term });
  };

  setSortColumn = column => {
    const { dashboards, sortColumn, searchTermDashboards } = this.state;
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
    this.loadData(dashboards, searchTermDashboards, {
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

  sortData = (finalList, { order, column }) => {
    let valueOne = 1;
    let valueTwo = -1;
    if (order === 'descent') {
      valueOne = -1;
      valueTwo = 1;
    }
    switch (column) {
      case 'name':
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
      case 'autor':
        const sortAutor = finalList.sort(function(a, b) {
          if (a.autor > b.autor) {
            return valueOne;
          }
          if (a.autor < b.autor) {
            return valueTwo;
          }
          return 0;
        });
        return sortAutor;
      case 'creation':
        const sortCreation = finalList.sort(function(a, b) {
          const date1 = new Date(a.creation);
          const date2 = new Date(b.creation);
          if (date1 > date2) return valueOne;
          if (date1 < date2) return valueTwo;
          return 0;
        });
        return sortCreation;
      case 'modified':
        const sortModified = finalList.sort(function(a, b) {
          const date1 = new Date(a.modified);
          const date2 = new Date(b.modified);
          if (date1 > date2) return valueOne;
          if (date1 < date2) return valueTwo;
          return 0;
        });
        return sortModified;
      case 'popularity':
        const sortPopularity = finalList.sort(function(a, b) {
          if (a.popularity > b.popularity) {
            return valueOne;
          }
          if (a.popularity < b.popularity) {
            return valueTwo;
          }
          return 0;
        });
        return sortPopularity;
      case 'widgets':
        const sortWidgets = finalList.sort(function(a, b) {
          if (a.widgetsCount > b.widgetsCount) {
            return valueOne;
          }
          if (a.widgetsCount < b.widgetsCount) {
            return valueTwo;
          }
          return 0;
        });
        return sortWidgets;
      case 'description':
        const sortDescription = finalList.sort(function(a, b) {
          if (a.description > b.description) {
            return valueOne;
          }
          if (a.description < b.description) {
            return valueTwo;
          }
          return 0;
        });
        return sortDescription;
      case 'layoutType':
        const sortLayout = finalList.sort(function(a, b) {
          if (a.layoutType > b.layoutType) {
            return valueOne;
          }
          if (a.layoutType < b.layoutType) {
            return valueTwo;
          }
          return 0;
        });
        return sortLayout;
      case 'url':
        const sortUrl = finalList.sort(function(a, b) {
          if (a.url > b.url) {
            return valueOne;
          }
          if (a.url < b.url) {
            return valueTwo;
          }
          return 0;
        });
        return sortUrl;
      default:
        return finalList;
    }
  };

  saveAction = async (action, infoAditional) => {
    if(infoAditional.widgets.length!==0 || infoAditional.templateVariables.length!==0){
        this._onClose();
        this.setState({ action: action, infoAditional });
    }
  };

  returnActionPopUp = action => {
    const { infoAditional } = this.state;
    switch (action) {
      case 'infoAditional':
        return <Modal infoAditional={infoAditional} />;
    }
  };

  returnQuery = (definition) => {
    let query = "";
    try {
        if (definition.requests) {
            if (definition.requests instanceof Array) {
                for (const iterator of definition.requests) {
                    query += ` ${iterator.q} `;
                }
            } else if (definition.requests.fill) {
                query += `${definition.requests.fill.q}`;
            } else if (definition.requests.fill && definition.requests.size) {
                query += `${definition.requests.fill.q}  ${definition.requests.size.q}`;
            } else if (definition.requests.size) {
                query += ` ${definition.requests.size.q} `;
            }
        } else if (definition.query) {
            query += ` ${definition.query} `;
        }
    } catch (err) {
        if (query === '')
            query = '-----';
        return query;
    }
    if (query === '')
        query = '-----';
    return query;
}

returnParams = (widget) => {
    let query = this.returnQuery(widget);
    const variables = qregExr(query);
    if (variables) {
        if (variables[4]) {
            return variables[4];
        } else {
            return '-----';
        }
    } else {
        return '-----';
    }
}


  downloadData = async () => {
    const { finalList } = this.state;
    const date = new Date();
    const zip = new JSZip();
    let dataFiltrada = [];
    for (const dd of finalList) {
        let dashboardList='';
        if(dd.dashboardList.length===0) dashboardList='-----';
        for (const ddList of dd.dashboardList) {
            dashboardList = `${dashboardList} ${ddList} `;
        }
        for (const widget of dd.widgets) {
            dataFiltrada.push({
                name:dd.name,
                author: dd.autor,
                creationDate: this.dateToYMD(new Date(dd.creation)),
                modDate:this.dateToYMD(new Date(dd.modified)),
                popularity:dd.popularity,
                widgets:dd.widgetsCount,
                description: dd.description,
                layoutType:dd.layoutType,
                url:dd.url,
                dashboardList:dashboardList,
                titleWidget: widget.definition.title ? widget.definition.title : '-----',
                queryWidget:this.returnQuery(widget.definition),
                typeWidget: widget.definition.type,
                queryParametersWidget: this.returnParams(widget.definition),
                sourceWidget: this.returnParams(widget.definition),
                defaultVariable: '',
                nameVariable: '',
                prefixVariable: ''
            });
        }
        for (const variable of dd.templateVariables) {
            dataFiltrada.push({
                name:dd.name,
                author: dd.autor,
                creationDate: this.dateToYMD(new Date(dd.creation)),
                modDate:this.dateToYMD(new Date(dd.modified)),
                popularity:dd.popularity,
                widgets:dd.widgetsCount,
                description: dd.description,
                layoutType:dd.layoutType,
                url:dd.url,
                dashboardList:dashboardList,
                titleWidget: '',
                queryWidget:'',
                typeWidget: '',
                queryParametersWidget: '',
                sourceWidget: '',
                defaultVariable: variable.default ? variable.default : '-----',
                nameVariable: variable.name ? variable.name : '-----',
                prefixVariable: variable.prefix ? variable.prefix : '-----'
            });
        }
        if(dd.templateVariables.length===0&&dd.widgets.length===0){
            dataFiltrada.push({
                name:dd.name,
                author: dd.autor,
                creationDate: this.dateToYMD(new Date(dd.creation)),
                modDate:this.dateToYMD(new Date(dd.modified)),
                popularity:dd.popularity,
                widgets:dd.widgetsCount,
                description: dd.description,
                layoutType:dd.layoutType,
                url:dd.url,
                dashboardList:dashboardList,
                titleWidget: '',
                queryWidget:'',
                typeWidget: '',
                queryParametersWidget: '',
                sourceWidget: '',
                defaultVariable: '',
                nameVariable: '',
                prefixVariable: ''
            });
        }
    }
    jsoncsv.json2csv(dataFiltrada, (err, csv) => {
      if (err) {
        throw err;
      }
      zip.file(`Dashboards.csv`, csv);
      zip.generateAsync({ type: 'blob' }).then(function(content) {
        // see FileSaver.js
        saveAs(
          content,
          `Datadog ${date.getDate()}-${date.getMonth() +
            1}-${date.getFullYear()}.zip`
        );
      });
    });
  };

  _onClose = () => {
    let actualValue = this.state.hidden;
    this.setState({ hidden: !actualValue });
  };

  dateToYMD(date) {
    var d = date.getDate();
    var m = date.getMonth() + 1; //Month from 0 to 11
    var y = date.getFullYear();
    return `${m <= 9 ? '0' + m : m}/${d <= 9 ? '0' + d : d}/${y}`;
  }

  render() {
    const {
      infoAditional,
      loading,
      dashboards,
      savingAllChecks,
      pagePag,
      pages,
      totalRows,
      finalList,
      hidden,
      sortColumn,
      average
    } = this.state;
    return (
      <div className="h100">
        {loading ? (
          <Spinner type={Spinner.TYPE.DOT} />
        ) : (
          <div className="mainDashboard">
            <div className="mainDashboard__filtersOptions">
              <div className="filterOptions__boxDashboards">
                <span
                  className="boxDashboards--title"
                  style={{
                    color: '#007E8A'
                  }}
                >
                  All
                </span>
                <div>
                  <span
                    className="boxDashboards--quantity"
                    style={{
                      color: '#007E8A'
                    }}
                  >
                    {dashboards.length}
                  </span>
                </div>
              </div>
              <div className="filterOptions__boxDashboards">
                <span
                  className="boxDashboards--title"
                  style={{
                    color: '#007E8A'
                  }}
                >
                  Average Number of Widgets
                </span>
                <div>
                  <span
                    className="boxDashboards--quantity"
                    style={{
                      color: '#007E8A'
                    }}
                  >
                    {average}
                  </span>
                </div>
              </div>
            </div>
            <div className="mainDashboard__tableContent">
              <div className="tableContent__options">
                <div className="options__searchDashboards">
                  <div className="options__divSearch">
                    <BsSearch size="10px" color={'#767B7F'} />
                    <SearchInput
                      className="options--searchInputDashboards"
                      onChange={this.searchUpdated}
                    />
                  </div>
                </div>
                <div
                  className={
                    finalList.length === 0
                      ? 'pointerBlock flex flexCenterVertical'
                      : 'pointer flex flexCenterVertical'
                  }
                  style={{ width: '30%' }}
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
                <div style={{ width: '2500px' }} className="h100">
                  <ReactTable
                    loading={savingAllChecks}
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
                              background:
                                rowInfo.index % 2 ? '#F7F7F8' : 'white',
                              borderBottom: 'none',
                              display: 'grid',
                              gridTemplate:
                                '1fr/ 10% 7% 10% repeat(3,7%) 15% 7% 15% 15%'
                            }
                          };
                        } else {
                          return {
                            style: {
                              borderBottom: 'none',
                              display: 'grid',
                              gridTemplate:
                                '1fr/ 10% 7% 10% repeat(3,7%) 15% 7% 15% 15%'
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
                          gridTemplate: '1fr/ 10% 7% 10% repeat(3,7%) 15% 7% 15% 15%'
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
                                this.saveAction('infoAditional', props.original)
                              }
                              className="h100 flex flexCenterVertical pointer"
                              style={{
                                background:
                                  props.index % 2 ? '#F7F7F8' : 'white',
                                color: '#0078BF'
                              }}
                            >
                              <span
                                style={{
                                  marginLeft: '15px'
                                }}
                              >
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
                                this.setSortColumn('autor');
                              }}
                            >
                              AUTHOR
                              <div className="flexColumn table__sort">
                                <ArrowTop
                                  color={
                                    sortColumn.column === 'autor' &&
                                    sortColumn.order === 'ascendant'
                                      ? 'black'
                                      : 'gray'
                                  }
                                />
                                <ArrowDown
                                  color={
                                    sortColumn.column === 'autor' &&
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
                        accessor: 'autor',
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
                                this.setSortColumn('creation');
                              }}
                            >
                              CREATION DATE
                              <div className="flexColumn table__sort">
                                <ArrowTop
                                  color={
                                    sortColumn.column === 'creation' &&
                                    sortColumn.order === 'ascendant'
                                      ? 'black'
                                      : 'gray'
                                  }
                                />
                                <ArrowDown
                                  color={
                                    sortColumn.column === 'creation' &&
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
                        accessor: 'creation',
                        className:
                          'table__cell flex flexCenterVertical h100 w100I',
                        sortable: false,
                        Cell: props => (
                          <div className="h100 flex flexCenterVertical ">
                            {this.dateToYMD(new Date(props.value))}
                          </div>
                        )
                      },
                      {
                        Header: () => (
                          <div className="table__header">
                            <div
                              className="pointer flex "
                              onClick={() => {
                                this.setSortColumn('modified');
                              }}
                            >
                              MOD DATE
                              <div className="flexColumn table__sort">
                                <ArrowTop
                                  color={
                                    sortColumn.column === 'modified' &&
                                    sortColumn.order === 'ascendant'
                                      ? 'black'
                                      : 'gray'
                                  }
                                />
                                <ArrowDown
                                  color={
                                    sortColumn.column === 'modified' &&
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
                        accessor: 'modified',
                        className:
                          'table__cell flex flexCenterVertical h100 w100I',
                        sortable: false,
                        Cell: props => (
                          <div className="h100 flex flexCenterVertical ">
                            {this.dateToYMD(new Date(props.value))}
                          </div>
                        )
                      },
                      {
                        Header: () => (
                          <div className="table__header flexCenterHorizontal">
                            <div
                              className="pointer flex"
                              onClick={() => {
                                this.setSortColumn('popularity');
                              }}
                            >
                              POPULARITY
                              <div className="flexColumn table__sort ">
                                <ArrowTop
                                  color={
                                    sortColumn.column === 'popularity' &&
                                    sortColumn.order === 'ascendant'
                                      ? 'black'
                                      : 'gray'
                                  }
                                />
                                <ArrowDown
                                  color={
                                    sortColumn.column === 'popularity' &&
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
                        accessor: 'popularity',
                        className:
                          'table__cell flex flexCenterVertical h100 w100I flexCenterHorizontal',
                        sortable: false,
                        Cell: props => (
                          <div className="h100 flex flexCenterVertical flexCenterHorizontal">
                            {props.value}
                          </div>
                        )
                      },
                      {
                        Header: () => (
                          <div className="table__header flexCenterHorizontal">
                            <div
                              className="pointer flex"
                              onClick={() => {
                                this.setSortColumn('widgets');
                              }}
                            >
                              WIDGETS
                              <div className="flexColumn table__sort">
                                <ArrowTop
                                  color={
                                    sortColumn.column === 'widgets' &&
                                    sortColumn.order === 'ascendant'
                                      ? 'black'
                                      : 'gray'
                                  }
                                />
                                <ArrowDown
                                  color={
                                    sortColumn.column === 'widgets' &&
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
                        accessor: 'widgetsCount',
                        className:
                          'table__cell flex flexCenterVertical h100 w100I flexCenterHorizontal',
                        sortable: false,
                        Cell: props => (
                          <div className="h100 flex flexCenterVertical flexCenterHorizontal">
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
                                this.setSortColumn('description');
                              }}
                            >
                              DESCRIPTION
                              <div className="flexColumn table__sort">
                                <ArrowTop
                                  color={
                                    sortColumn.column === 'description' &&
                                    sortColumn.order === 'ascendant'
                                      ? 'black'
                                      : 'gray'
                                  }
                                />
                                <ArrowDown
                                  color={
                                    sortColumn.column === 'description' &&
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
                        accessor: 'description',
                        className:
                          'table__cellLongText table__cell flex flexCenterVertical h100 w100I',
                        sortable: false,
                        Cell: props => {
                          let txtDescription = '-----';
                          if (props.value) {
                            txtDescription = props.value;
                            if (txtDescription.length > 100) {
                              txtDescription = `${txtDescription.substring(
                                0,101
                              )}...`;
                            }
                          }
                          return (
                            <div className="h100 flex flexCenterVertical ">
                              {txtDescription}
                            </div>
                          );
                        }
                      },
                      {
                        Header: () => (
                          <div className="table__header flexCenterHorizontal">
                            <div
                              className="pointer flex "
                              onClick={() => {
                                this.setSortColumn('layoutType');
                              }}
                            >
                              LAYOUT TYPE
                              <div className="flexColumn table__sort">
                                <ArrowTop
                                  color={
                                    sortColumn.column === 'layoutType' &&
                                    sortColumn.order === 'ascendant'
                                      ? 'black'
                                      : 'gray'
                                  }
                                />
                                <ArrowDown
                                  color={
                                    sortColumn.column === 'layoutType' &&
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
                        accessor: 'layoutType',
                        className:
                          'table__cell flex flexCenterVertical flexCenterHorizontal h100 w100I',
                        sortable: false,
                        Cell: props => (
                          <div className="h100 flex flexCenterHorizontals flexCenterVertical ">
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
                                this.setSortColumn('url');
                              }}
                            >
                              URL
                              <div className="flexColumn table__sort">
                                <ArrowTop
                                  color={
                                    sortColumn.column === 'url' &&
                                    sortColumn.order === 'ascendant'
                                      ? 'black'
                                      : 'gray'
                                  }
                                />
                                <ArrowDown
                                  color={
                                    sortColumn.column === 'url' &&
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
                        accessor: 'url',
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
                                this.setSortColumn('dashboardList');
                              }}
                            >
                              DASHBOARD LIST
                              <div className="flexColumn table__sort">
                                <ArrowTop
                                  color={
                                    sortColumn.column === 'dashboardList' &&
                                    sortColumn.order === 'ascendant'
                                      ? 'black'
                                      : 'gray'
                                  }
                                />
                                <ArrowDown
                                  color={
                                    sortColumn.column === 'dashboardList' &&
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
                        accessor: 'dashboardListTxt',
                        className:
                          'table__cell flex flexCenterVertical h100 w100I',
                        sortable: false,
                        Cell: props => <div>{props.value}</div>
                      }
                    ]}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        {hidden && (
          <Modal
            hidden={hidden}
            _onClose={this._onClose}
            infoAditional={infoAditional}
          />
        )}
      </div>
    );
  }
}

Dashboard.propTypes = {
  accountId: PropTypes.number.isRequired
};
