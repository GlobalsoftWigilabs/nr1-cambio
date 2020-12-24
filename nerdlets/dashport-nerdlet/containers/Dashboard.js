/* eslint-disable react/no-deprecated */
import React from 'react';
import PropTypes from 'prop-types';
import { BarChart, Bar, ResponsiveContainer } from 'recharts';
import { AiOutlineClose } from 'react-icons/ai';
import ReactTable from 'react-table-v6';
import { styleChecked, styleUnChecked } from '../components/Checkbox/Checkbox';
import { Spinner, AutoSizer } from 'nr1';
import {Button, Table, TableHeader, TableHeaderCell, TableRow, TableRowCell} from 'nr1';
import {
  readNerdStorage,
  readNerdStorageOnlyCollection,
  writeNerdStorage
} from '../services/NerdStorage/api';
import { sendLogsSlack } from '../services/Wigilabs/api';

/**
 * Constants of colours
 */
const blueColor = '#0078BF';
const textGray = '#767B7F';
const grayColor = '#ADADAD';
const greyNoneColor = '#ECEEEE';

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
      categorizedList: [],
      mostVisited: [],
      favoriteDashboards: [],
      savingAllChecks: false,
      logs: [],
      listaB: []
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

  /**
   * Method that reads the Dashboards collection on NerdStorage
   *
   * @returns Dashboards array
   * @memberof Dashboard
   */
  async loadNerdData() {
    const error = [];
    let categorizedList = [];
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
      console.log("sizeList=========>", sizeList);

      for (let i = 0; i < sizeList.length - 1; i++) {
        const page = await readNerdStorage(
          accountId,
          'dashboards',
          `dashboards-${i}`,
          this.reportLogFetch
        );

        console.log(page)
        if(page){
          for (const iterator of page) {
            list.push(iterator);
          }
        }
      }

      const categorized = await readNerdStorage(
        accountId,
        'dashboards',
        `dashboards-obj`,
        this.reportLogFetch
      );

      categorizedList = categorized.listCategorized
      console.log(list)
      nerdDashboards = list;
    } catch (err) {
      error.push(err);
    }
    console.log(nerdDashboards);
    return [nerdDashboards, categorizedList];
  }


  pagesOfData = list => {
    const limit = 1000000;
    let page = [];
    const book = [];
    let pageTemporal = [];
    for (const key in list) {
      if (list[key]) {
        pageTemporal = [...page];
        if (page) {
          pageTemporal.push(list[key]);
          if (JSON.stringify(pageTemporal).length >= limit) {
            if (page.length !== 0) {
              book.push(page);
            }
            page = [];
            page.push(list[key]);
          } else {
            page = pageTemporal;
            pageTemporal = [];
          }
          if (parseInt(key) === parseInt(list.length - 1)) {
            book.push(page);
          }
        }
      }
    }
    return book;
  };


  /**
   * Method that change the wantMigrate property for a Dashboard
   *
   * @param {number} id Dashboard id to modify
   * @memberof Dashboard
   */
  async changeCheck(id) {
    const { accountId } = this.props;
    const { dashboards } = this.state;
    for (const item of dashboards) {
      if (item.id === id) {
        item.wantMigrate = !item.wantMigrate
      }
    }
    const pagesTags = this.pagesOfData(dashboards);
    for (const keyTags in pagesTags) {
      if (pagesTags[keyTags]) {
        await writeNerdStorage(
          accountId,
          `dashboards`,
          `dashboards-${keyTags}`,
          pagesTags[keyTags],
          this.reportLogFetch
        );
      }
    }
    await this.sendLogs();
    this.loadDashboards();
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
  enviarLista(data) {
    console.log("comment",data)
    this.setState({listaB: data})
   }

  /**
   * Method that receives the dashboards from NerdStorage and saves it on state
   *
   * @memberof Dashboard
   */
  async loadDashboards() {
    const [dataDashboards, categorizedList] = await this.loadNerdData();
    const dashboards = dataDashboards;
    const mostVisited = [];
    const favoriteDashboards = [];
    let allSelected = true;
    // for (const item of dataDashboards) {
    //   dashboards.push(item.document);
    // }
    for (const item of dataDashboards) {
      if (item.popularity > 0) {
        mostVisited.push(item);
      }
      if (item.isFavorite) {
        favoriteDashboards.push(item);
      }
      if (!item.wantMigrate) {
        allSelected = false;
      }
    }
    this.setState({
      dashboards,
      categorizedList,
      mostVisited,
      favoriteDashboards,
      loading: false,
      allChecked: allSelected,
      savingAllChecks: false
    });
  }

  /**
   * Method that change the wantMigrate property for all the Dashboards
   *
   * @memberof Dashboard
   */
  async selectAllDash() {
    const { allChecked, dashboards } = this.state;
    const { accountId } = this.props;
    if (allChecked) {
      for (const item of dashboards) {
        item.wantMigrate = false;
      }
      const pagesTags = this.pagesOfData(dashboards);
      for (const keyTags in pagesTags) {
        if (pagesTags[keyTags]) {
          await writeNerdStorage(
            accountId,
            `dashboards`,
            `dashboards-${keyTags}`,
            pagesTags[keyTags],
            this.reportLogFetch
          );
        }
      }
    } else {
      for (const item of dashboards) {
        if (!item.wantMigrate) {
          item.wantMigrate = true;
        }
      }
      const pagesTags = this.pagesOfData(dashboards);
      for (const keyTags in pagesTags) {
        if (pagesTags[keyTags]) {
          await writeNerdStorage(
            accountId,
            `dashboards`,
            `dashboards-${keyTags}`,
            pagesTags[keyTags],
            this.reportLogFetch
          );
        }
      }
      this.setState({ savingAllChecks: true });
    }
    this.loadDashboards();
  }

  /**
   * Method that call the NerdStorage mutation for every Dashboards
   *
   * @param {array} dashToModified Dashboards to mutate
   * @memberof Dashboard
   */
  async saveDashboards(dashToModified) {
    this.setState({ savingAllChecks: true });
    for (let i = 0; i < dashToModified.length; i++) {
      await this.saveDashboard(dashToModified[i]);
    }
  }

  /**
   * Method that mutate a Dashboard document
   *
   * @param {Object} item Dashboard to mutate
   * @memberof Dashboard
   */
  async saveDashboard(item) {
    const { accountId } = this.props;
    await writeNerdStorage(
      accountId,
      'ddDashboards',
      item.id,
      item,
      this.reportLogFetch
    );
    this.sendLogs();
  }

  /**
   * Method that change the selected category filter
   * @param {*} value
   * @memberof Dashboard
   */
  changeSelected(value) {
    switch (value) {
      case 1:
        this.setState({
          all: true,
          favorite: false,
          visited: false
        });
        break;
      case 2:
        this.setState({
          all: false,
          favorite: true,
          visited: false
        });
        break;
      case 3:
        this.setState({
          all: false,
          favorite: false,
          visited: true
        });
        break;
      default:
        break;
    }
  }

  /**
   * Method that change the complexity selected filter
   *
   * @param {*} value
   * @memberof Dashboard
   */
  changeSelectedComplex(value) {
    this.setState({ complex: value });
  }

  /**
   * Method that filter the dashboards according to complexity filter
   *
   * @param {*} list
   * @returns
   * @memberof Dashboard
   */
  filterComplexDashboard(list) {
    const { complex } = this.state;
    if (complex !== '') {
      const finalList = [];
      for (const item of list) {
        if (item.complexity === complex) {
          finalList.push(item);
        }
      }
      return finalList;
    } else {
      return list;
    }
  }

  /**
   * Method that populates the complexity graphics from a selected category filter
   *
   * @returns
   * @memberof Dashboard
   */
  setComplexData() {
    const {
      all,
      favorite,
      dashboards,
      favoriteDashboards,
      mostVisited
    } = this.state;
    let nerdlet = 0;
    let high = 0;
    let medium = 0;
    let total = 0;
    let array = [];
    if (all) {
      total = dashboards.length;
      array = dashboards;
    } else if (favorite) {
      total = favoriteDashboards.length;
      array = favoriteDashboards;
    } else {
      total = mostVisited.length;
      array = mostVisited;
    }
    for (const item of array) {
      switch (item.complexity) {
        case 'nerdlet':
          nerdlet += 1;
          break;
        case 'high':
          high += 1;
          break;
        case 'medium':
          medium += 1;
          break;
        default:
          break;
      }
    }
    const complexData = [
      [
        {
          name: 'Nerdlet',
          uv: nerdlet,
          pv: total - nerdlet
        }
      ],
      [
        {
          name: 'High',
          uv: high,
          pv: total - high
        }
      ],
      [
        {
          name: 'Medium',
          uv: medium,
          pv: total - medium
        }
      ]
    ];
    return complexData;
  }

  returnComplex = complex => {
    switch (complex) {
      case 'nerdlet':
        return 'Nerdlet';
      case 'high':
        return 'High complexity';
      case 'medium':
        return 'Medium complexity';
      default:
        return '';
    }
  };

  render() {
    const {
      loading,
      all,
      favorite,
      visited,
      dashboards,
      favoriteDashboards,
      mostVisited,
      complex,
      allChecked,
      savingAllChecks,
      categorizedList,
      listaB,
    } = this.state;
    let list = [];
    let textTag = '';
    if (all) {
      list = dashboards;
      textTag = 'All';
    } else if (favorite) {
      list = favoriteDashboards;
      textTag = 'Favorites';
    } else {
      list = mostVisited;
      textTag = 'Most visited';
    }

    console.log(categorizedList)
    const complexData = this.setComplexData();
    const finalList = this.filterComplexDashboard(list);
    return (
      <div>
        {loading ? (
          <Spinner type={Spinner.TYPE.DOT} />
        ) : (
            <div className="mainDashboard">
              <div className="mainBox">
                <div className="boxTitle">
                  <div
                    style={{
                      color: all ? blueColor : textGray
                    }}
                  >
                    All
                </div>
                </div>
                <div
                  onClick={() => this.changeSelected(1)}
                  className="boxDashboard"
                  style={{ color: all ? blueColor : grayColor }}
                >
                  {dashboards.length}
                </div>
              </div>
              <div className="mainBox">
                <div className="boxTitle">
                  <div style={{ color: favorite ? blueColor : textGray }}>
                    Favorites
                </div>
                </div>
                <div
                  onClick={() => this.changeSelected(2)}
                  className="boxDashboard"
                  style={{ color: favorite ? blueColor : grayColor }}
                >
                  {favoriteDashboards.length}
                </div>
              </div>
              <div className="mainBox">
                <div className="boxTitle">
                  <div style={{ color: visited ? blueColor : textGray }}>
                    Most visited
                </div>
                </div>
                <div
                  onClick={() => this.changeSelected(3)}
                  className="boxDashboard"
                  style={{ color: visited ? blueColor : grayColor }}
                >
                  {mostVisited.length}
                </div>
              </div>
              <div className="mainBox">
                <div className="boxTitle">
                  <div>Complexity</div>
                </div>
                <div className="dashboardData">
                  <div className="divChartData">
                    <div className="numberTotal">{complexData[0][0].uv}</div>
                    <ResponsiveContainer width="100%" height={130}>
                      <BarChart
                        key={complexData[0][0].uv}
                        data={complexData[0]}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 5
                        }}
                      >
                        <Bar
                          className="barSelectable"
                          onClick={() => {
                            this.changeSelectedComplex('nerdlet');
                          }}
                          dataKey="uv"
                          stackId="a"
                          fill={blueColor}
                        />
                        <Bar
                          className="barSelectable"
                          onClick={() => {
                            this.changeSelectedComplex('nerdlet');
                          }}
                          dataKey="pv"
                          stackId="a"
                          fill={greyNoneColor}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="titleChart">{complexData[0][0].name}</div>
                  </div>
                  <div className="divChartData">
                    <div className="numberTotal">{complexData[1][0].uv}</div>
                    <ResponsiveContainer width="100%" height={130}>
                      <BarChart
                        key={complexData[1][0].uv}
                        data={complexData[1]}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 5
                        }}
                      >
                        <Bar
                          className="barSelectable"
                          onClick={() => {
                            this.changeSelectedComplex('high');
                          }}
                          dataKey="uv"
                          stackId="a"
                          fill={blueColor}
                        />
                        <Bar
                          className="barSelectable"
                          onClick={() => {
                            this.changeSelectedComplex('high');
                          }}
                          dataKey="pv"
                          stackId="a"
                          fill={greyNoneColor}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="titleChart">High</div>
                  </div>
                  <div className="divChartData">
                    <div className="numberTotal">{complexData[2][0].uv}</div>
                    <ResponsiveContainer width="100%" height={130}>
                      <BarChart
                        key={complexData[2][0].uv}
                        data={complexData[2]}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 5
                        }}
                      >
                        <Bar
                          className="barSelectable"
                          onClick={() => {
                            this.changeSelectedComplex('medium');
                          }}
                          dataKey="uv"
                          stackId="a"
                          fill={blueColor}
                        />
                        <Bar
                          className="barSelectable"
                          onClick={() => {
                            this.changeSelectedComplex('medium');
                          }}
                          dataKey="pv"
                          stackId="a"
                          fill={greyNoneColor}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="titleChart">Medium</div>
                  </div>
                </div>
              </div>
              {/* Table */}
              <div className="BoxLists">
                <div className="boxTitleList">
                  <div>List</div>
                  <div className="divCheckAll">
                    <input
                      style={allChecked ? styleChecked : styleUnChecked}
                      type="checkbox"
                      checked={allChecked}
                      onChange={() => {
                        this.selectAllDash();
                      }}
                    />
                    <div className="titleCheckAll">Select all</div>
                  </div>
                </div>
                <div className="tagsList">
                  <div className="tagFilter">
                    <div className="nameTag">{textTag}</div>
                    {textTag === 'All' ? (
                      <AiOutlineClose size="15px" />
                    ) : (
                        <AiOutlineClose
                          className="closeTag"
                          onClick={() => this.changeSelected(1)}
                        />
                      )}
                  </div>
                  {complex !== '' ? (
                    <div className="tagFilter">
                      <div className="nameTag">{this.returnComplex(complex)}</div>
                      <AiOutlineClose
                        className="closeTag"
                        onClick={() => this.changeSelectedComplex('')}
                      />
                    </div>
                  ) : null}
                </div>
                <div className="divLists">
                  {savingAllChecks ? (
                    <Spinner type={Spinner.TYPE.DOT} />
                  ) : (
                      <AutoSizer>
                        {({ width }) => (
                          <ReactTable
                            pageSize={finalList.length}
                            showPagination={false}
                            resizable={false}
                            data={finalList}
                            getTrProps={(state, rowInfo) => {
                              return {
                                style: {
                                  background:
                                    rowInfo.index % 2 ? '#F7F7F8' : 'white',
                                  borderBottom: 'none',
                                  fontSize: '14px',
                                  fontFamily: 'Open Sans'
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
                            columns={[
                              {
                                headerStyle: { height: 0 },
                                className: 'cellDashboard',
                                Header: () => null,
                                sortable: false,
                                accessor: 'wantMigrate',
                                width: width * 0.1,
                                Cell: props => (
                                  <div
                                    style={{
                                      display: 'flex',
                                      justifyContent: 'center',
                                      border: 'none'
                                    }}
                                  >
                                    <input
                                      style={
                                        props.value ? styleChecked : styleUnChecked
                                      }
                                      type="checkbox"
                                      checked={props.value}
                                      onChange={() => {
                                        this.changeCheck(props.original.id);
                                      }}
                                    />
                                  </div>
                                )
                              },
                              {
                                headerStyle: { height: 0 },
                                width: width * 0.85,
                                className: 'cellDashboard',
                                Header: () => null,
                                accessor: 'name',
                                sortable: false,
                                Cell: props => <div>{props.value}</div>
                              }
                            ]}
                          />
                        )}
                      </AutoSizer>
                    )}
                </div>
              </div>
              <div className="mainBox">
              <div className="dashboardData">
                {categorizedList.map((data) =>
                  <button style={{marginRight: "2%"}} key={data.id} onClick={() => this.enviarLista(data.dashboards)}>
                    {data.name}         {data.dashboard_count}
                  </button>
                )}
                  </div>
                </div>
                <div className="BoxLists2">
                  {
                  <Table
                  style={{
                      float: "left",
                      marginTop: "10px",
                      width: "740px"
                  }}
                  items={listaB}
              >
                  <TableHeader>
                  <TableHeaderCell
                          width="15%"
                          value={({item}) => item.is_favorite}
                          sortable
                          sortingType={this.state.column_1}
                          sortingOrder={1}
                      >
                          Favorite
                      </TableHeaderCell>
                      <TableHeaderCell
                          width="35%"
                          value={({item}) => item.title}
                          sortable
                          sortingType={this.state.column_0}
                          sortingOrder={1}
                      >
                          Name
                      </TableHeaderCell>
                      <TableHeaderCell
                          width="35%"
                          value={({item}) => item.modified}
                          sortable
                          sortingType={this.state.column_1}
                          sortingOrder={1}
                      >
                          Modified
                      </TableHeaderCell>
                      <TableHeaderCell
                          value={({item}) => item.popularity}
                          sortable
                          sortingType={this.state.column_1}
                          sortingOrder={1}
                      >
                          Popularity
                      </TableHeaderCell>
                  </TableHeader>
                  {({item}) => (
                      <TableRow>
                          <TableRowCell>{item.is_favorite}</TableRowCell>
                          <TableRowCell>{item.title}</TableRowCell>
                          <TableRowCell>{item.modified}</TableRowCell>
                          <TableRowCell>{item.popularity}</TableRowCell>
                      </TableRow>
                  )}

              </Table>
                  }
                </div>
            </div>
          )}
      </div>
    );
  }
}
Dashboard.propTypes = {
  accountId: PropTypes.number.isRequired
};
