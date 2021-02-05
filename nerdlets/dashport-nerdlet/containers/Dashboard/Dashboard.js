/* eslint-disable react/no-deprecated */
import React from 'react';
import PropTypes from 'prop-types';
import ReactTable from 'react-table-v6';
import { Spinner, Tooltip } from 'nr1';
import iconDownload from '../../images/download.svg';
import interrogationIcon from '../../images/interrogation.svg';
import ArrowUnion from '../../components/ArrowsTable/ArrowUnion';
import Modal from './Modal';

import { sendLogsSlack } from '../../services/Wigilabs/api';
import SearchInput from 'react-search-input';
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
  'url',
  'widgetsCount',
  'dashboardListTxt'
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
      dashboards: [],
      average: 0,
      savingAllChecks: false,
      logs: [],
      // Pagination
      pagePag: 0,
      pages: 0,
      totalRows: 10,
      // //////////
      finalList: [],
      searchTermDashboards: '',
      sortColumn: {
        column: '',
        order: ''
      },
      hidden: false,
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
    const { dataDashboards } = this.props;
    // average widgets
    let quantityTotal = 0;
    for (const dd of dataDashboards) {
      let widgets = [];
      for (const widget of dd.widgets) {
        if (widget.definition.type === 'group') {
          widgets.push(widget);
          widgets = widgets.concat(widget.definition.widgets);
        } else {
          widgets.push(widget);
        }
      }
      dd.widgets = widgets;
      dd.popularity = dd.popularity ? dd.popularity : 0;
      dd.widgetsCount = widgets.length;
      dd.autor = dd.autor !== '' ? dd.autor : '-----';
      dd.description =
        dd.description && dd.description !== '' ? dd.description : '-----';
      let dashboardList = '';
      if (dd.dashboardList) {
        if (dd.dashboardList.length === 0) {
          dashboardList = '-----';
        } else {
          const dataLimit = dd.dashboardList.slice(0, 3);
          for (const list of dataLimit) {
            dashboardList = `${dashboardList} ${list} \n`;
          }
          if (dd.dashboardList.length > 3)
            dashboardList = `${dashboardList} ...`;
        }
      }
      dd.dashboardListTxt = dashboardList;
      quantityTotal += widgets.length;
    }
    this.setState({
      dashboards: dataDashboards,
      loading: false,
      savingAllChecks: false,
      average:
        dataDashboards.length === 0
          ? 0
          : Math.round(quantityTotal / dataDashboards.length)
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

  loadData = (dashboards, searchTerm, sortColumn) => {
    let finalList = dashboards;
    if (searchTerm !== '') {
      const filteredData = finalList.filter(item => {
        return Object.keys(item).some(key => {
          if (KEYS_TO_FILTERS.find(KEY => KEY === key)) {
            if (key === 'creation' || key === 'modified') {
              return `${this.dateToYMD(new Date(item[key]))}`
                .toLowerCase()
                .includes(searchTerm.trim().toLowerCase());
            } else {
              return `${item[key]}`
                .toLowerCase()
                .includes(searchTerm.trim().toLowerCase());
            }
          }
          return false;
        });
      });
      finalList = filteredData;
    }
    finalList = this.sortData(finalList, sortColumn);
    this.calcTable(finalList);
    this.setState({ finalList: finalList });
  };

  searchUpdated = term => {
    const { sortColumn, dashboards } = this.state;
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
      case 'autor': {
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
      }
      case 'creation': {
        const sortCreation = finalList.sort(function(a, b) {
          const date1 = new Date(a.creation);
          const date2 = new Date(b.creation);
          if (date1 > date2) return valueOne;
          if (date1 < date2) return valueTwo;
          return 0;
        });
        return sortCreation;
      }
      case 'modified': {
        const sortModified = finalList.sort(function(a, b) {
          const date1 = new Date(a.modified);
          const date2 = new Date(b.modified);
          if (date1 > date2) return valueOne;
          if (date1 < date2) return valueTwo;
          return 0;
        });
        return sortModified;
      }
      case 'popularity': {
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
      }
      case 'widgets': {
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
      }
      case 'description': {
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
      }
      case 'layoutType': {
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
      }
      case 'url': {
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
      }
      case 'dashboardListTxt': {
        const sortDashboardList = finalList.sort(function(a, b) {
          if (a.dashboardListTxt > b.dashboardListTxt) {
            return valueOne;
          }
          if (a.dashboardListTxt < b.dashboardListTxt) {
            return valueTwo;
          }
          return 0;
        });
        return sortDashboardList;
      }
      default:
        return finalList;
    }
  };

  saveAction = async infoAditional => {
    if (
      infoAditional.widgets.length !== 0 ||
      infoAditional.templateVariables.length !== 0
    ) {
      this._onClose();
      this.setState({ infoAditional });
    }
  };

  returnQuery = definition => {
    let query = '';
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
      if (query === '') query = '-----';
      return query;
    }
    if (query === '') query = '-----';
    return query;
  };

  returnParams = widget => {
    const query = this.returnQuery(widget);
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
  };

  downloadData = async () => {
    const { dashboards } = this.state;
    const date = new Date();
    const zip = new JSZip();
    const dataFiltrada = [];
    for (const dd of dashboards) {
      let dashboardList = '';
      if (dd.dashboardList.length === 0) dashboardList = '-----';
      for (const ddList of dd.dashboardList) {
        dashboardList = `${dashboardList} ${ddList} `;
      }
      for (const widget of dd.widgets) {
        dataFiltrada.push({
          NAME: dd.name,
          AUTHOR: dd.autor,
          CREATION_DATE: this.dateToYMD(new Date(dd.creation)),
          MOD_DATE: this.dateToYMD(new Date(dd.modified)),
          POPULARITY: dd.popularity,
          WIDGETS: dd.widgetsCount,
          DESCRIPTION: dd.description,
          LAYOUT_TYPE: dd.layoutType,
          URL: dd.url,
          DASHBOARD_LIST: dashboardList,
          TITLE_WIDGETS: widget.definition.title
            ? widget.definition.title
            : '-----',
          QUERY_WIDGETS: this.returnQuery(widget.definition),
          TYPE_WIDGET: widget.definition.type,
          QUERY_PARAMETERS_WIDGET: this.returnParams(widget.definition),
          SOURCE_WIDGET: this.returnParams(widget.definition),
          DEFAULT_VARIABLE: '-----',
          NAME_VARIABLE: '-----',
          PREFIX_VARIABLE: '-----'
        });
      }
      for (const variable of dd.templateVariables) {
        dataFiltrada.push({
          NAME: dd.name,
          AUTHOR: dd.autor,
          CREATION_DATE: this.dateToYMD(new Date(dd.creation)),
          MOD_DATE: this.dateToYMD(new Date(dd.modified)),
          POPULARITY: dd.popularity,
          WIDGETS: dd.widgetsCount,
          DESCRIPTION: dd.description,
          LAYOUT_TYPE: dd.layoutType,
          URL: dd.url,
          DASHBOARD_LIST: dashboardList,
          TITLE_WIDGETS: '-----',
          QUERY_WIDGETS: '-----',
          TYPE_WIDGET: '-----',
          QUERY_PARAMETERS_WIDGET: '-----',
          SOURCE_WIDGET: '-----',
          DEFAULT_VARIABLE: variable.default ? variable.default : '-----',
          NAME_VARIABLE: variable.name ? variable.name : '-----',
          PREFIX_VARIABLE: variable.prefix ? variable.prefix : '-----'
        });
      }
      if (dd.templateVariables.length === 0 && dd.widgets.length === 0) {
        dataFiltrada.push({
          NAME: dd.name,
          AUTHOR: dd.autor,
          CREATION_DATE: this.dateToYMD(new Date(dd.creation)),
          MOD_DATE: this.dateToYMD(new Date(dd.modified)),
          POPULARITY: dd.popularity,
          WIDGETS: dd.widgetsCount,
          DESCRIPTION: dd.description,
          LAYOUT_TYPE: dd.layoutType,
          URL: dd.url,
          DASHBOARD_LIST: dashboardList,
          TITLE_WIDGETS: '-----',
          QUERY_WIDGETS: '-----',
          TYPE_WIDGET: '-----',
          QUERY_PARAMETERS_WIDGET: '-----',
          SOURCE_WIDGET: '-----',
          DEFAULT_VARIABLE: '-----',
          NAME_VARIABLE: '-----',
          PREFIX_VARIABLE: '-----'
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
          `Dashboards ${date.getDate()}-${date.getMonth() +
            1}-${date.getFullYear()}.zip`
        );
      });
    });
  };

  _onClose = () => {
    this.setState(prevState => ({ hidden: !prevState.hidden }));
  };

  dateToYMD(date) {
    const d = date.getDate();
    const m = date.getMonth() + 1; // Month from 0 to 11
    const y = date.getFullYear();
    return `${m <= 9 ? `0${m}` : m}/${d <= 9 ? `0${d}` : d}/${y}`;
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
                  className="boxDashboards--title fontMedium"
                  style={{
                    color: '#007E8A'
                  }}
                >
                  All
                </span>
                <div>
                  <span
                    className="boxDashboards--quantity fontBigger"
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
                  className="boxDashboards--title fontMedium"
                  style={{
                    color: '#007E8A'
                  }}
                >
                  Average Number of Widgets
                </span>
                <div>
                  <span
                    className="boxDashboards--quantity fontBigger"
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
                    <BsSearch size="10px" color="#767B7F" />
                    <SearchInput
                      className="options--searchInputDashboards fontNormal"
                      onChange={this.searchUpdated}
                    />
                  </div>
                </div>
                <div
                  className={
                    dashboards.length === 0
                      ? 'pointerBlock flex flexCenterVertical'
                      : 'pointer flex flexCenterVertical'
                  }
                  style={{ width: '30%' }}
                  onClick={() => {
                    if (dashboards.length !== 0) this.downloadData();
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
                    loadingText="Processing..."
                    page={pagePag}
                    showPagination={false}
                    resizable={false}
                    data={finalList}
                    defaultPageSize={totalRows}
                    getTrProps={(state, rowInfo) => {
                      return {
                        style: {
                          background:
                            rowInfo && rowInfo.index % 2 ? '#F7F7F8' : 'white',
                          borderBottom: 'none',
                          display: 'grid',
                          gridTemplate:
                            '1fr/ 12% repeat(3,10%) 8% repeat(5,10%)'
                        }
                      };
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
                            '1fr/ 12% repeat(3,10%) 8% repeat(5,10%)'
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
                              className="pointer flex"
                              style={{ marginLeft: '15px' }}
                              onClick={() => {
                                this.setSortColumn('name');
                              }}
                            >
                              NAME
                              <div className="flexColumn table__sort">
                                <ArrowUnion
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
                              onClick={() => this.saveAction(props.original)}
                              className={
                                props.original.widgets.length !== 0 ||
                                props.original.templateVariables.length !== 0
                                  ? 'h100 flex flexCenterVertical pointer'
                                  : 'h100 flex flexCenterVertical'
                              }
                              style={{
                                background:
                                  props.index % 2 ? '#F7F7F8' : 'white',
                                color:
                                  props.original.widgets.length !== 0 ||
                                  props.original.templateVariables.length !== 0
                                    ? '#0078BF'
                                    : '#333333',
                                borderRight:
                                  '5px solid rgba(208, 208, 209, 0.1)',
                                borderRightStyle: 'groove'
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
                          <div
                            className="table__header fontSmall"
                            style={{ marginLeft: '15px' }}
                          >
                            <div
                              className="pointer flex"
                              onClick={() => {
                                this.setSortColumn('autor');
                              }}
                            >
                              AUTHOR
                              <div className="flexColumn table__sort">
                                <ArrowUnion
                                  colorArrowOne={
                                    sortColumn.column === 'autor' &&
                                    sortColumn.order === 'descent'
                                      ? 'black'
                                      : 'gray'
                                  }
                                  colorArrowTwo={
                                    sortColumn.column === 'autor' &&
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
                        accessor: 'autor',
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
                                this.setSortColumn('creation');
                              }}
                            >
                              CREATION DATE
                              <div className="flexColumn table__sort">
                                <ArrowUnion
                                  colorArrowOne={
                                    sortColumn.column === 'creation' &&
                                    sortColumn.order === 'descent'
                                      ? 'black'
                                      : 'gray'
                                  }
                                  colorArrowTwo={
                                    sortColumn.column === 'creation' &&
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
                        accessor: 'creation',
                        className:
                          'table__cell fontNormal flex flexCenterVertical h100 w100I',
                        sortable: false,
                        Cell: props => (
                          <div className="h100 flex flexCenterVertical ">
                            {this.dateToYMD(new Date(props.value))}
                          </div>
                        )
                      },
                      {
                        Header: () => (
                          <div className="table__header fontSmall">
                            <div
                              className="pointer flex "
                              onClick={() => {
                                this.setSortColumn('modified');
                              }}
                            >
                              MOD DATE
                              <div className="flexColumn table__sort">
                                <ArrowUnion
                                  colorArrowOne={
                                    sortColumn.column === 'modified' &&
                                    sortColumn.order === 'descent'
                                      ? 'black'
                                      : 'gray'
                                  }
                                  colorArrowTwo={
                                    sortColumn.column === 'modified' &&
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
                        accessor: 'modified',
                        className:
                          'table__cell fontNormal flex flexCenterVertical h100 w100I',
                        sortable: false,
                        Cell: props => (
                          <div className="h100 flex flexCenterVertical ">
                            {this.dateToYMD(new Date(props.value))}
                          </div>
                        )
                      },
                      {
                        Header: () => (
                          <div className="table__header fontSmall flexCenterHorizontal">
                            <div
                              className="pointer flex flexCenterVertical"
                              onClick={() => {
                                this.setSortColumn('popularity');
                              }}
                            >
                              POPULARITY
                              <div className="flexColumn table__sort ">
                                <ArrowUnion
                                  colorArrowOne={
                                    sortColumn.column === 'popularity' &&
                                    sortColumn.order === 'descent'
                                      ? 'black'
                                      : 'gray'
                                  }
                                  colorArrowTwo={
                                    sortColumn.column === 'popularity' &&
                                    sortColumn.order === 'ascendant'
                                      ? 'black'
                                      : 'gray'
                                  }
                                />
                              </div>
                            </div>
                            <Tooltip
                              placementType={Tooltip.PLACEMENT_TYPE.BOTTOM}
                              text="Popularity is based on the amount of traffic a dashboard receives. Popularity is updated daily; new dashboards have zero popularity bars for up to 24 hours. The greater number of lines the more popular the dashboard."
                            >
                              <img
                                src={interrogationIcon}
                                style={{
                                  width: '0.8vw',
                                  margin: '5px'
                                }}
                              />
                            </Tooltip>
                          </div>
                        ),
                        headerClassName: 'w100I',
                        accessor: 'popularity',
                        className:
                          'table__cell fontNormal flex flexCenterVertical h100 w100I flexCenterHorizontal',
                        sortable: false,
                        Cell: props => (
                          <div className="h100 flex flexCenterVertical flexCenterHorizontal">
                            <Popularity quantity={props.value} />
                          </div>
                        )
                      },
                      {
                        Header: () => (
                          <div className="table__header fontSmall flexCenterHorizontal">
                            <div
                              className="pointer flex"
                              onClick={() => {
                                this.setSortColumn('widgets');
                              }}
                            >
                              WIDGETS
                              <div className="flexColumn table__sort">
                                <ArrowUnion
                                  colorArrowOne={
                                    sortColumn.column === 'widgets' &&
                                    sortColumn.order === 'descent'
                                      ? 'black'
                                      : 'gray'
                                  }
                                  colorArrowTwo={
                                    sortColumn.column === 'widgets' &&
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
                        accessor: 'widgetsCount',
                        className:
                          'table__cell fontNormal flex flexCenterVertical h100 w100I flexCenterHorizontal',
                        sortable: false,
                        Cell: props => (
                          <div className="h100 flex flexCenterVertical flexCenterHorizontal">
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
                                this.setSortColumn('description');
                              }}
                            >
                              DESCRIPTION
                              <div className="flexColumn table__sort">
                                <ArrowUnion
                                  colorArrowOne={
                                    sortColumn.column === 'description' &&
                                    sortColumn.order === 'descent'
                                      ? 'black'
                                      : 'gray'
                                  }
                                  colorArrowTwo={
                                    sortColumn.column === 'description' &&
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
                        accessor: 'description',
                        className:
                          'table__cellLongText table__cell fontNormal flex flexCenterVertical h100 w100I',
                        sortable: false,
                        Cell: props => {
                          let txtDescription = '-----';
                          if (props.value) {
                            txtDescription = props.value;
                            if (txtDescription.length > 100) {
                              txtDescription = `${txtDescription.substring(
                                0,
                                101
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
                          <div className="table__header fontSmall flexCenterHorizontal">
                            <div
                              className="pointer flex "
                              onClick={() => {
                                this.setSortColumn('layoutType');
                              }}
                            >
                              LAYOUT TYPE
                              <div className="flexColumn table__sort">
                                <ArrowUnion
                                  colorArrowOne={
                                    sortColumn.column === 'layoutType' &&
                                    sortColumn.order === 'descent'
                                      ? 'black'
                                      : 'gray'
                                  }
                                  colorArrowTwo={
                                    sortColumn.column === 'layoutType' &&
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
                        accessor: 'layoutType',
                        className:
                          'table__cell fontNormal flex flexCenterVertical flexCenterHorizontal h100 w100I',
                        sortable: false,
                        Cell: props => (
                          <div className="h100 flex flexCenterHorizontals flexCenterVertical ">
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
                                this.setSortColumn('url');
                              }}
                            >
                              URL
                              <div className="flexColumn table__sort">
                                <ArrowUnion
                                  colorArrowOne={
                                    sortColumn.column === 'url' &&
                                    sortColumn.order === 'descent'
                                      ? 'black'
                                      : 'gray'
                                  }
                                  colorArrowTwo={
                                    sortColumn.column === 'url' &&
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
                        accessor: 'url',
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
                          <div
                            className="table__header fontSmall"
                            style={{ marginLeft: '15px' }}
                          >
                            <div
                              className="pointer flex "
                              onClick={() => {
                                this.setSortColumn('dashboardListTxt');
                              }}
                            >
                              DASHBOARD LIST
                              <div className="flexColumn table__sort">
                                <ArrowUnion
                                  colorArrowOne={
                                    sortColumn.column === 'dashboardListTxt' &&
                                    sortColumn.order === 'descent'
                                      ? 'black'
                                      : 'gray'
                                  }
                                  colorArrowTwo={
                                    sortColumn.column === 'dashboardListTxt' &&
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
                        accessor: 'dashboardListTxt',
                        className:
                          'table__cell fontNormal flex flexCenterVertical h100 w100I',
                        sortable: false,
                        Cell: props => (
                          <div style={{ marginLeft: '15px' }}>
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

/**
 * Function for quantity component
 * @param {Number} quantity
 */
const Popularity = ({ quantity }) => {
  const lines = [];
  for (let i = 0; i < 5; i++) {
    if (i <= parseInt(quantity - 1)) {
      lines.push('filled');
    } else {
      lines.push('empty');
    }
  }
  return (
    <div className="flex">
      {lines.map((value, index) => {
        return (
          <div
            key={index}
            style={{
              marginLeft: index === 0 ? '0px' : '1.5px',
              marginRight: '1.5px',
              background: value === 'empty' ? '#E0E0E0' : '#007E8A',
              width: '5px',
              height: '1.2vw',
              content: ' '
            }}
          />
        );
      })}
    </div>
  );
};
Popularity.propTypes = {
  quantity: PropTypes.number.isRequired
};

Dashboard.propTypes = {
  dataDashboards: PropTypes.array.isRequired
};
