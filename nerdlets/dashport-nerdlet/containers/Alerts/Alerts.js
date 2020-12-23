import React from 'react';
import PropTypes from 'prop-types';
import Bar from '../../components/Bar';
import ReactTable from 'react-table-v6';
import Select from 'react-select';
import SearchInput, { createFilter } from 'react-search-input';
import { BsSearch } from 'react-icons/bs';
import iconShare from '../../images/share.svg';
import iconDownload from '../../images/download.svg';
import Pagination from '../../components/Pagination/Pagination';
import { AiOutlineClose } from 'react-icons/ai';
import Modal from '../../components/Modal';
import JSZip from 'jszip';
import jsoncsv from 'json-2-csv';
import { saveAs } from 'file-saver';
import ArrowDown from '../../components/ArrowsTable/ArrowDown';
import ArrowTop from '../../components/ArrowsTable/ArrowTop';

// import iconDownload from '../../images/download.svg';

/**
 * Constants of colours
 */
const blueColor = '#0078bf';
const greyNoneColor = '#ECEEEE';
const KEYS_TO_FILTERS = ['classification', 'type', 'name']

/**
 * Class that render the Alerts component
 *
 * @export
 * @class Alerts
 * @extends {React.Component}
 */
export default class Alerts extends React.Component {
  /**
   * Creates an instance of Alerts.
   * @param {*} props
   * @memberof Alerts
   */
  constructor(props) {
    super(props);
    this.state = {
      searchTermMetrics: '',
      selectedFilter: 'All',
      selectedTag: 'All',
      availableFilters: [{ value: 'All', label: 'All' }],
      availableFilterTags: [{ value: 'All', label: 'All' }],
      pagePag: 0,
      pages: 0,
      totalRows: 10,
      page: 1,
      textTag: "All",
      filteredAlerts: [],
      action: '',
      hidden: false,
      checksDownload: [
        { value: "CSV", label: "CSV" },
        { value: "JSON", label: "JSON" }
      ],
      selectFormat: { value: "CSV", label: "CSV" },
      sortColumn: {
        column: '',
        order: ''
      }
    };
  }

  componentWillMount() {
    let { selectedFilter, searchTermMetrics, sortColumn } = this.state;
    this.loadFilters();
    this.mainFiler(selectedFilter, searchTermMetrics, sortColumn);
  }

  loadFilters() {
    const { monitorsData } = this.props;
    const filters = [{ value: 'All', label: 'All' }];
    for (const item of monitorsData) {
      const category = item.classification;
      if (!filters.some(element => element.value === category)) {
        filters.push({ value: category, label: category });
      }
    }
    this.setState({ availableFilters: filters });
  }

  /**
   *Method that capture filter change of component select
   *
   * @memberof Metrics
   */
  handleChangeFilter = value => {
    let { searchTermMetrics, sortColumn } = this.state;
    this.mainFiler(value.value, searchTermMetrics, sortColumn);
    this.setState({ selectedFilter: value.value });
  };

  /**
   *Method that filter for catalago from select  component
   * @memberof Metrics
   */
  filterCateg = (value, selectedFilter) => {
    if (value.classification === selectedFilter) {
      return value;
    }
  };

  /**
   *Method that filter data of metrics
   * @returns
   * @memberof Metrics
   */
  mainFiler(selectedFilter, searchTermMetrics, sortColumn) {
    const { monitorsData } = this.props;
    let filteredAlerts = [];
    if (selectedFilter === 'All') {
      filteredAlerts = monitorsData.filter(createFilter(searchTermMetrics, KEYS_TO_FILTERS));
    } else {
      const categoryFilter = monitorsData.filter(monitor => this.filterCateg(monitor, selectedFilter));
      filteredAlerts = categoryFilter.filter(createFilter(searchTermMetrics, KEYS_TO_FILTERS));
    }
    filteredAlerts = this.sortData(filteredAlerts, sortColumn);
    this.calcTable(filteredAlerts);
    this.setState({ filteredAlerts: filteredAlerts });
  }

  sortData = (finalList, { order, column }) => {
    let valueOne = 1;
    let valueTwo = -1;
    if (order === 'descent') {
      valueOne = -1;
      valueTwo = 1;
    }
    switch (column) {
      case 'classification':
        const sortClassification = finalList.sort(function (a, b) {
          if (a.classification > b.classification) {
            return valueOne;
          }
          if (a.classification < b.classification) {
            return valueTwo;
          }
          return 0;
        });
        return sortClassification;
      case 'name':
        const sortName = finalList.sort(function (a, b) {
          if (a.name > b.name) {
            return valueOne;
          }
          if (a.name < b.name) {
            return valueTwo;
          }
          return 0;
        });
        return sortName;
      case 'type':
        const sortType = finalList.sort(function (a, b) {
          if (a.type > b.type) {
            return valueOne;
          }
          if (a.type < b.type) {
            return valueTwo;
          }
          return 0;
        });
        return sortType;
      default:
        return finalList;
    }
  }

  calcTable = (finalList) => {
    let { totalRows } = this.state;
    const aux = finalList.length % totalRows;
    let totalPages = 0;
    if (aux === 0) {
      totalPages = finalList.length / totalRows;
    } else {
      totalPages = Math.trunc(finalList.length / totalRows) + 1;
    }
    this.setState({ pages: totalPages, pagePag: 0 });
  }

  /**
   *Custom stiles of select component
   * @memberof Metrics
   */
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
      width: "100%"
    })
  };

  /**
   * Method that filter therms in Metrics View
   *
   * @param {String} term Term to filter
   * @memberof DashscanV1
   */
  searchUpdated = (term) => {
    let { selectedFilter, sortColumn } = this.state;
    this.mainFiler(selectedFilter, term, sortColumn);
    this.setState({ searchTermMetrics: term });
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
  * Method that change the complexity selected filter
  *
  * @param {*} value
  * @memberof Dashboard
  */
  changeSelectedComplex = (value) => {
    let { searchTermMetrics, sortColumn } = this.state;
    this.mainFiler(value, searchTermMetrics, sortColumn);
    this.setState({ selectedFilter: value });
  }

  saveAction = async (action) => {
    this._onClose();
    this.setState({ action: action });
  }

  _onClose = () => {
    let actualValue = this.state.hidden;
    this.setState({ hidden: !actualValue });
  }

  saveTypeDownload = (value) => {
    this.setState({ selectFormat: value });
  }

  returnActionPopUp = (action) => {
    const { checksDownload, selectFormat } = this.state;
    switch (action) {
      case 'downloadInfo':
        return (
          <div className="modal__contentDowload">
            <div className="content__title">Choose the type of download format.</div>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <div style={{ width: "150px" }}>
                <Select
                  classNamePrefix="react-select"
                  styles={this.customStyles}
                  isSearchable={false}
                  options={checksDownload}
                  onChange={this.saveTypeDownload}
                  value={selectFormat}
                  placeholder="All list"
                />
              </div>
            </div>
            <div className="content__buttons">
              <div className="buttons__buttonCancel pointer" onClick={() => this._onClose()}>Cancel</div>
              <div className="buttons__buttonConfirm pointer"
                onClick={() => this.downloadData()}
              >Download</div>
            </div>
          </div>
        );
    }
  }

  downloadData = async () => {
    const { selectFormat, filteredAlerts } = this.state;
    const date = new Date();
    const zip = new JSZip();
    if (selectFormat.value === "JSON") {
      zip.file(`Dashboards.json`, JSON.stringify(filteredAlerts, null, 2));
      zip.generateAsync({ type: 'blob' }).then(function (content) {
        // see FileSaver.js
        saveAs(content, `Datadog ${date.getDate()}-${(date.getMonth() + 1)}-${date.getFullYear()}.zip`);
      });
    } else if (selectFormat.value === "CSV") {
      jsoncsv.json2csv(filteredAlerts, (err, csv) => {
        if (err) {
          throw err;
        }
        zip.file(`Dashboards.csv`, csv);
        zip.generateAsync({ type: 'blob' }).then(function (content) {
          // see FileSaver.js
          saveAs(content, `Datadog ${date.getDate()}-${(date.getMonth() + 1)}-${date.getFullYear()}.zip`);
        });
      });
    }
    this.setState({ selectFormat: { value: "CSV", label: "CSV" } });
    this._onClose();
  }

  confirmAction = async (action) => {
  }

  setSortColumn = (column) => {
    const { selectedFilter, searchTermMetrics, sortColumn } = this.state;
    let order = "";
    if (sortColumn.column === column) {
      if (sortColumn.order === '') {
        order = "ascendant";
      } else if (sortColumn.order === 'ascendant') {
        order = "descent";
      } else {
        order = '';
      }
    } else if (sortColumn.column === '' || sortColumn.column !== column) {
      order = 'ascendant';
    }
    if (sortColumn.column === column && sortColumn.order === 'descent') {
      column = '';
    }

    this.mainFiler(selectedFilter, searchTermMetrics, { column: column, order: order });
    this.setState({
      sortColumn: {
        column: column,
        order: order
      }
    });
  }

  render() {
    const { alertsTotal, alertsData, monitorsData } = this.props;
    const {
      availableFilters,
      pages,
      pagePag,
      totalRows,
      textTag,
      selectedFilter,
      filteredAlerts,
      hidden,
      action,
      sortColumn } = this.state;
    return (
      <div className="mainAlerts h100">
        <div className="mainAlerts__filtersOptions">
          <div className="filterOptions__boxAlerts">
            <span className="boxAlerts--title">
              Alerts
            </span>
            <span className="boxAlerts--quantity">
              {alertsTotal}
            </span>
          </div>
          <div className="filtersOptions__graphsBarAlert flexColumn">
            <div className="w100">
              <div className="graphsBarAlert__containTitle">
                <span className="graphsBarAlert--title">Alerts by type</span>
              </div>
              <div className="graphsBarAlert__containeScroll">
                {alertsData.map((alertData, index) => {
                  const total = (alertData.uv * 100) / (alertData.uv + alertData.pv);
                  return (
                    <div key={index} className="w100" style={{ paddingBottom: '10px', paddingTop: '10px', width: '94%' }}>
                      <Bar
                        bgColor="#ECEEEE"
                        bgcolorMain="#007E8A"
                        title={alertData.name}
                        quantityPercentage={total}
                        quantity={alertData.uv}
                        actionClick={this.changeSelectedComplex}
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
        <div className="mainAlerts__filterActives">
          <Select
            classNamePrefix="react-select"
            styles={this.customStyles}
            isSearchable={false}
            defaultValue={{ value: 'types', label: 'Type Alerts' }}
            onChange={this.handleChangeFilter}
            options={availableFilters}
          />
          <div className="filterActives__tagsAlert">
            <div className="tagsAlert__actived">
              <div className="tagsAlert__filter">
                <div className="tagsAlert--nameTag">{textTag}</div>
                {textTag === 'All' ? (
                  <AiOutlineClose size="15px" />
                ) : (
                    <AiOutlineClose
                      className="tagsAlert--closeTag"
                    />
                  )}
              </div>
              {selectedFilter !== 'All' && (
                <div className="tagsAlert__filter">
                  <div className="tagsAlert--nameTag">{selectedFilter}</div>
                  <AiOutlineClose
                    className="tagsAlert--closeTag"
                    onClick={() => this.changeSelectedComplex('All')}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="mainAlerts__tableContentAlert">
          <div className="tableContentAlert__options">
            <div className="options__searchAlerts">
              <div className="options__divSearchAlert">
                <BsSearch size="10px" color={"#767B7F"} />
                <SearchInput
                  className="options--searchInputAlerts"
                  onChange={this.searchUpdated}
                />
              </div>
            </div>
            <Pagination
              page={pagePag}
              pages={pages}
              upPage={this.upPage}
              goToPage={this.changePage}
              downPage={this.downPage}
            />
          </div>
          <div className="tableContentAlert__tableContainerAlert">
            <div className="tableContentAlert__tableAlert">
              <div className="actions__buttons">
                <div
                  className={filteredAlerts.length === 0 ? 'pointerBlock' : 'pointer'}
                  onClick={() => {
                    if (filteredAlerts.length !== 0)
                      this.saveAction('downloadInfo')
                  }}
                >
                  <img src={iconDownload} style={{ marginLeft: "20px" }} height="18px" />
                </div>
                <div className='pointerBlock'>
                  <img src={iconShare} style={{ marginLeft: "20px" }} height="18px" />
                </div>
              </div>
              <div>
                <ReactTable
                  page={pagePag}
                  resizable={false}
                  data={filteredAlerts}
                  showPagination={false}
                  defaultPageSize={totalRows}
                  getTrProps={(state, rowInfo) => {
                    if (rowInfo) {
                      return {
                        style: {
                          background: rowInfo.index % 2 ? '#F7F7F8' : 'white',
                          borderBottom: 'none',
                          display: 'grid',
                          gridTemplate: '1fr/ 15% 70% 14%'
                        }
                      };
                    } else {
                      return {
                        style: {
                          borderBottom: 'none',
                          display: 'grid',
                          gridTemplate: '1fr/ 15% 70% 14%'
                        }
                      };
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
                        paddingTop: '15px',
                        height: '44px',
                        color: '#333333',
                        fontWeight: 'bold',
                        display: 'grid',
                        gridTemplate: '1fr/ 15% 70% 14%'
                      }
                    };
                  }}
                  columns={[
                    {
                      headerClassName: 'w100I',
                      className: 'tableAlert__cellClassification w100I',
                      Header: () => (
                        <div className="tableAlert__headerClassification">
                          <div className="pointer flex w100" style={{justifyContent:"center"}} onClick={() => { this.setSortColumn('classification') }}>
                            Classification
                                    <div className="flexColumn table__sort">
                              <ArrowTop color={sortColumn.column === 'classification' && sortColumn.order === 'ascendant' ? "black" : "gray"} />
                              <ArrowDown color={sortColumn.column === 'classification' && sortColumn.order === 'descent' ? "black" : "gray"} />
                            </div>
                          </div>
                        </div>
                      ),
                      accessor: 'classification',
                      sortable: false,
                      Cell: props => <div>{props.value}</div>
                    },
                    {
                      headerClassName: 'w100I',
                      className: 'tableAlert__cellName w100I',
                      Header: () => (
                        <div className="tableAlert__headerName">
                          <div className="pointer flex w100" style={{justifyContent:"center"}} onClick={() => { this.setSortColumn('name') }}>
                          Name
                                    <div className="flexColumn table__sort">
                              <ArrowTop color={sortColumn.column === 'name' && sortColumn.order === 'ascendant' ? "black" : "gray"} />
                              <ArrowDown color={sortColumn.column === 'name' && sortColumn.order === 'descent' ? "black" : "gray"} />
                            </div>
                          </div>
                        </div>
                      ),
                      accessor: 'name',
                      sortable: false,
                      Cell: props => <div>{props.value}</div>
                    },
                    {
                      headerClassName: 'w100I',
                      className: 'tableAlert__cellType w100I',
                      Header: 'Type',
                      Header: () => (
                        <div className="tableAlert__headerType">
                          <div className="pointer flex w100" style={{justifyContent:"center"}} onClick={() => { this.setSortColumn('type') }}>
                          Type
                                    <div className="flexColumn table__sort">
                              <ArrowTop color={sortColumn.column === 'type' && sortColumn.order === 'ascendant' ? "black" : "gray"} />
                              <ArrowDown color={sortColumn.column === 'type' && sortColumn.order === 'descent' ? "black" : "gray"} />
                            </div>
                          </div>
                        </div>
                      ),
                      accessor: 'type',
                      sortable: false,
                      Cell: props => <div>{props.value}</div>
                    }
                  ]}
                />
              </div>
            </div>
          </div>
        </div>
        <Modal
          hidden={hidden}
          _onClose={this._onClose}
          confirmAction={this.confirmAction}
        >
          {this.returnActionPopUp(action)}
        </Modal>
      </div >
    );
  }
}

Alerts.propTypes = {
  alertsTotal: PropTypes.number.isRequired,
  alertsData: PropTypes.array.isRequired,
  monitorsData: PropTypes.array.isRequired
};
