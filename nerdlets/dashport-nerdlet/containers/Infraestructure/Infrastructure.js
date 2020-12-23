import React from 'react';
import PropTypes from 'prop-types';
import { PieChart, Pie, ResponsiveContainer, Legend, Cell } from 'recharts';
import { styleCheckedRadio, styleUnChecked } from '../../components/Checkbox/Checkbox';
import SearchInput, { createFilter } from 'react-search-input';
import { BsSearch } from 'react-icons/bs';
import ReactTable from 'react-table-v6';
import Bar from '../../components/Bar';
import Select from 'react-select';
import { AiOutlineClose } from 'react-icons/ai';
import ArrowDown from '../../components/ArrowsTable/ArrowDown';
import ArrowTop from '../../components/ArrowsTable/ArrowTop';
import iconShare from '../../images/share.svg';
import iconDownload from '../../images/download.svg';
import Pagination from '../../components/Pagination/Pagination';


/**
 * Constants of colours
 */
const blueColor = '#0078BF';
const greyColor = '#BDBDBD';
const KEYS_TO_FILTERS = ['name', 'processorModel', 'memory', 'count']

/**
 * Class that render the Infrastructure component
 *
 * @export
 * @class Infrastructure
 * @extends {React.Component}
 */
export default class Infrastructure extends React.Component {
  /**
   * Creates an instance of Infrastructure.
   *
   * @param {*} props
   * @memberof Infrastructure
   */
  constructor(props) {
    super(props);
    this.state = {
      versions: [],
      checkVersionWin: false,
      checkVersionlinux: false,
      searchTermMetrics: '',
      soSelected: {},
      avaliableSo: [],
      textTag: '',
      complex: '',
      searchTermInfraestructure: '',
      pagePag: 0,
      pages: 0,
      totalRows: 10,
      page: 1,
      sortColumn: {
        column: '',
        order: ''
      }
    };
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
   *Method that capture click event in graphic pie
   * @memberof Infrastructure
   */
  componentDidMount() {
    const { infrastructureData } = this.props;
    let avaliableSo = [];
    let soSelected = {};
    if (infrastructureData.length > 0) {
      avaliableSo.push({ value: 'All', label: 'All' });
      soSelected = { value: 'All', label: 'All' };
    }
    for (const iterator of infrastructureData) {
      avaliableSo.push({ value: iterator.name, label: iterator.name });
    }
    let dataLinux = [];
    dataLinux = dataLinux.concat(infrastructureData[0].versions);
    for (const iterator of dataLinux) {
      iterator.so = "linux"
    }
    let dataWindows = [];
    dataWindows = dataWindows.concat(infrastructureData[1].versions);
    for (const iterator of dataWindows) {
      iterator.so = "windows";
    }
    let data = [];
    data = data.concat(dataLinux);
    data = data.concat(dataWindows);
    this.setState({ versions: data, avaliableSo, soSelected });
  };

  /**
   *Method that filter for catalago from select  component
   * @memberof Metrics
   */
  filterCateg = value => {
    const { checkVersionlinux, checkVersionWin } = this.state;
    if (value.so === "linux" && checkVersionlinux) {
      return value;
    } else if (value.so === "windows" && checkVersionWin) {
      return value;
    }
  };

  /**
   *Method that filter data of metrics
   * @returns
   * @memberof Metrics
   */
  mainFiler() {
    const { checkVersionlinux, checkVersionWin, searchTermMetrics, versions } = this.state;
    let filteredHost = [];
    if (!checkVersionlinux && !checkVersionWin) {
      filteredHost = versions.filter(createFilter(searchTermMetrics, KEYS_TO_FILTERS));
    } else if (checkVersionlinux) {
      const categoryFilterlinux = versions.filter(this.filterCateg);
      filteredHost = categoryFilterlinux.filter(createFilter(searchTermMetrics, KEYS_TO_FILTERS));
    } else if (checkVersionWin) {
      const categoryFilterWin = versions.filter(this.filterCateg);
      filteredHost = categoryFilterWin.filter(createFilter(searchTermMetrics, KEYS_TO_FILTERS));
    }
    return filteredHost;
  }

  /**
   * Method that filter therms in Metrics View
   *
   * @param {String} term Term to filter
   * @memberof DashscanV1
   */
  searchUpdated = (term) => {
    this.setState({ searchTermMetrics: term });
  }

  handleSo = (value) => {
    this.setState({ soSelected: value });
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
    // let { selectedFilter, sortColumn } = this.state;
    // this.mainFiler(selectedFilter, term, sortColumn);
    this.setState({ searchTermInfraestructure: term });
  }

  render() {
    const { infrastructureTotal, infrastructureData } = this.props;
    const { checkVersionWin,versions,sortColumn, checkVersionlinux,pagePag,pages, complex,totalRows, textTag, avaliableSo, soSelected } = this.state;
    const filteredHost = this.mainFiler();
    return (
      <div className="mainInfraestructure">
        <div className="mainInfraestructure__filtersOptions">
          <div className="filterOptions__boxInfraestructure">
            <span className="boxInfraestructure--title">
              Total Host
            </span>
            <span className="boxInfraestructure--quantity">
              {infrastructureTotal.totalHosts}
            </span>
          </div>
          <div className="filterOptions__boxInfraestructure">
            <span className="boxInfraestructure--title">
              CPU's Total
            </span>
            <span className="boxInfraestructure--quantity">
              {infrastructureTotal.totalCpu}
            </span>
          </div>
          <div className="filtersOptions__graphsBar flexColumn">
            <div className="w100">
              <div className="graphsBar__containTitle">
                <span className="graphsBar--title">Platform</span>
              </div>
              {infrastructureData.map((data, index) => {
                const { name, uv, pv } = data;
                const total = (uv * 100) / (uv + pv);
                return (
                  <div key={index} className="w100" style={{ paddingBottom: '10px', paddingTop: '10px', width: '94%' }}>
                    <Bar
                      bgColor="#ECEEEE"
                      bgcolorMain="#007E8A"
                      title={name}
                      quantityPercentage={total}
                      quantity={uv}
                      actionClick={() => { }}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        </div>
        <div className="mainInfraestructure__filterActives">
          <Select
            classNamePrefix="react-select"
            styles={this.customStyles}
            isSearchable={false}
            options={avaliableSo}
            onChange={this.handleSo}
            value={soSelected}
            placeholder="All"
          />
          <div className="filterActives__tags">
            <div className="tags__actived">
              <div className="tags__filter">
                <div className="tags--nameTag">{textTag}</div>
                {textTag === 'All' ? (
                  <AiOutlineClose size="15px" />
                ) : (
                    <AiOutlineClose
                      className="tags--closeTag"
                      onClick={() => this.changeSelected(1)}
                    />
                  )}
              </div>
              {complex !== '' ? (
                <div className="tags__filter" style={{ width: textTag === "Most visited" && this.returnComplex(complex) === "Medium" ? "45%" : "" }}>
                  {/* <div className="tags--nameTag">{this.returnComplex(complex)}</div> */}
                  <AiOutlineClose
                    className="tags--closeTag"
                    onClick={() => this.changeSelectedComplex('')}
                  />
                </div>
              ) : null}
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
                  className={infrastructureData.length === 0 ? 'pointerBlock' : 'pointer'}
                  onClick={() => {
                    if (infrastructureData.length !== 0)
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
                  data={versions}
                  showPagination={false}
                  defaultPageSize={totalRows}
                  getTrProps={(state, rowInfo) => {
                    if (rowInfo) {
                      return {
                        style: {
                          background: rowInfo.index % 2 ? '#F7F7F8' : 'white',
                          borderBottom: 'none',
                          display: 'grid',
                          gridTemplate: '1fr/ 14% 65% 10% 10%'
                        }
                      };
                    } else {
                      return {
                        style: {
                          borderBottom: 'none',
                          display: 'grid',
                          gridTemplate: '1fr/ 14% 65% 10% 10%'
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
                        gridTemplate: '1fr/ 14% 65% 10% 10%'
                      }
                    };
                  }}
                  columns={[
                    {
                      headerClassName: 'w100I',
                      className: 'tableAlert__cellClassification w100I',
                      Header: () => (
                        <div className="tableAlert__headerClassification">
                          <div className="pointer flex w100" style={{ justifyContent: "center" }} onClick={() => { this.setSortColumn('classification') }}>
                            VERSION
                                    <div className="flexColumn table__sort">
                              <ArrowTop color={sortColumn.column === 'classification' && sortColumn.order === 'ascendant' ? "black" : "gray"} />
                              <ArrowDown color={sortColumn.column === 'classification' && sortColumn.order === 'descent' ? "black" : "gray"} />
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
                      className: 'tableAlert__cellName w100I',
                      Header: () => (
                        <div className="tableAlert__headerName">
                          <div className="pointer flex w100" style={{ justifyContent: "center" }} onClick={() => { this.setSortColumn('name') }}>
                          PROCESSOR
                                    <div className="flexColumn table__sort">
                              <ArrowTop color={sortColumn.column === 'name' && sortColumn.order === 'ascendant' ? "black" : "gray"} />
                              <ArrowDown color={sortColumn.column === 'name' && sortColumn.order === 'descent' ? "black" : "gray"} />
                            </div>
                          </div>
                        </div>
                      ),
                      accessor: 'processorModel',
                      sortable: false,
                      Cell: props => <div>{props.value}</div>
                    },
                    {
                      headerClassName: 'w100I',
                      className: 'tableAlert__cellType w100I',
                      Header: () => (
                        <div className="tableAlert__headerType">
                          <div className="pointer flex w100" style={{ justifyContent: "center" }} onClick={() => { this.setSortColumn('type') }}>
                            RAM
                                    <div className="flexColumn table__sort">
                              <ArrowTop color={sortColumn.column === 'type' && sortColumn.order === 'ascendant' ? "black" : "gray"} />
                              <ArrowDown color={sortColumn.column === 'type' && sortColumn.order === 'descent' ? "black" : "gray"} />
                            </div>
                          </div>
                        </div>
                      ),
                      accessor: 'memory',
                      sortable: false,
                      Cell: props => <div>{props.value}</div>
                    },
                    {
                      headerClassName: 'w100I',
                      className: 'tableAlert__cellType w100I',
                      Header: () => (
                        <div className="tableAlert__headerType">
                          <div className="pointer flex w100" style={{ justifyContent: "center" }} onClick={() => { this.setSortColumn('type') }}>
                            COUNT
                                    <div className="flexColumn table__sort">
                              <ArrowTop color={sortColumn.column === 'type' && sortColumn.order === 'ascendant' ? "black" : "gray"} />
                              <ArrowDown color={sortColumn.column === 'type' && sortColumn.order === 'descent' ? "black" : "gray"} />
                            </div>
                          </div>
                        </div>
                      ),
                      accessor: 'count',
                      sortable: false,
                      Cell: props => <div>{props.value}</div>
                    }
                  ]}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Infrastructure.propTypes = {
  infrastructureTotal: PropTypes.object.isRequired,
  infrastructureData: PropTypes.array.isRequired
};
