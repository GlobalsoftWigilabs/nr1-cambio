/* eslint-disable react/no-deprecated */
import React from 'react';
import PropTypes from 'prop-types';
import eyeIcon from '../images/eyeIcon.svg';
import retry from '../images/retry.svg';
import { AutoSizer, AccountStorageQuery, Spinner } from 'nr1';
import ReactTable from 'react-table-v6';
import { readNerdStorageOnlyCollection, readNerdStorage,writeNerdStorage } from '../services/NerdStorage/api';
import { createDashboardApi } from '../services/Dashboard/api';
import Pagination from '../components/Pagination/Pagination';
/**
 * Class that render the Status component
 *
 * @export
 * @class Status
 * @extends {React.Component}
 */
export default class Status extends React.Component {
  /**
   *Creates an instance of Status.
   * @param {*} props
   * @memberof Status
   */
  constructor(props) {
    super(props);
    this.state = {
      dashboards: [],
      loading: false,
      page: 0,
      pages: 0,
      totalRows: 6,
      datadogSetup: {}
    };
  }

  /**
   * Method called when the component will be mounted
   *
   * @memberof Status
   */
  componentWillMount() {
    this.setState({ loading: true });
    this.loadDashboards();
    this.readDatadogSetup();
  }

  /**
   * Method that reads the datadog-setup document that contains the API configuration
   *
   * @returns JSON
   * @memberof Migration
   */
  async readDatadogSetup() {
    const { accountId } = this.props;
    let result = null;
    await readNerdStorage(accountId, 'setup', 'newrelic', this.reportLogFetch)
      .then(data => {
        if (data) {
          result = data;
        }
      });
    this.setState({ datadogSetup: result });
    return result;
  }

  /**
   * method that changes the table to the next page
   *
   * @memberof Status
   */
  upPage = () => {
    const { page } = this.state;
    this.setState({ page: page + 1 });
  };

  /**
   * Method that change the table to the selected page
   *
   * @memberof Status
   * @param {number} page Destination page
   */
  changePage = page => {
    this.setState({ page: page - 1 });
  };

  /**
   * Method that changes the table to the previous page
   *
   * @memberof Status
   */
  downPage = () => {
    const { page } = this.state;
    this.setState({ page: page - 1 });
  };

  /**
   * method that calculates the total number of pages to show
   *
   * @memberof Status
   */
  calcTable() {
    const { dashboards, totalRows } = this.state;
    let totalPages = 0;
    const aux = dashboards.length % totalRows;
    if (aux === 0) {
      totalPages = dashboards.length / totalRows;
    } else {
      totalPages = Math.trunc(dashboards.length / totalRows) + 1;
    }
    this.setState({ pages: totalPages });
  }

  /**
   * Method that receives the dashboards from NerdStorage and saves it on state
   *
   * @memberof Status
   */
  async loadDashboards() {
    const dashboards = [];
    let { accountId } = this.props;
    const sizeData = await readNerdStorageOnlyCollection(accountId, 'dashboards-migrated', this.reportLogFetch);
    for (let i = 0; i < sizeData.length; i++) {
      let list = [];
      list = await readNerdStorage(accountId, 'dashboards-migrated', `dashboards-${i}`, this.reportLogFetch);
      for (const iterator of list) {
        dashboards.push(iterator);
      }
    }
    this.setState({ dashboards, loading: false });
    this.calcTable();
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

  /**
   * Method that reads the Dashboards collection on NerdStorage
   *
   * @returns
   * @memberof Status
   */
  async loadNerdData() {
    const error = [];
    let nerdDashboards = [];
    const { accountId } = this.props;
    try {
      await AccountStorageQuery.query({
        accountId: accountId,
        collection: 'ddDashboards'
      }).then(({ data }) => {
        nerdDashboards = data;
      });
    } catch (err) {
      error.push(err);
    }
    return nerdDashboards;
  }

  /**
   *Method que return color for status
   * @memberof Status
   */
  colorStatusMigration = props => {
    if (props.value === 'Completed') {
      return '#27AE60';
    } else if (props.value === 'Error') {
      return '#FF4D4D';
    } else {
      return 'white';
    }
  };

  /**
   *Method que return color for cell
   * @memberof Status
   */
  colorTypeMigration = props => {
    if (props.value === 'Manual') {
      return 'gray';
    } else if (props.value === 'Automatic') {
      return '#27AE60';
    } else {
      return '#FF4D4D';
    }
  };

  retryCreatedDashboard = async (dashboard) => {
    let { datadogSetup, dashboards } = this.state;
    const { accountId } = this.props;
    let dashboardsAux = JSON.parse(JSON.stringify(dashboards));
    let identifier = dashboard.identifier;
    delete dashboard.percentage;
    //delete dashboard.widgets[0].any; //borrando el error que se ocasiono con intencion
    delete dashboard.identifier;
    delete dashboard.status;
    let result = await createDashboardApi(dashboard, datadogSetup.appkey);
    if (!result.dashboardFailed) {
      let dashboardsMigrated = [];
      result.status = "completed"
      for (const dashboard of dashboardsAux) {
        if (dashboard.identifier === identifier) {
          result.percentage = dashboard.percentage;
          dashboardsMigrated.push(result);
        } else {
          dashboardsMigrated.push(dashboard);
        }
      }
      const pagesMigratedDashboards = this.pagesOfData(dashboardsMigrated);
      for (const keyMigrate in pagesMigratedDashboards) {
        if (pagesMigratedDashboards[keyMigrate]) {
          await writeNerdStorage(
            accountId,
            `dashboards-migrated`,
            `dashboards-${keyMigrate}`,
            pagesMigratedDashboards[keyMigrate],
            this.reportLogFetch
          );
        }
      }
      this.loadDashboards();
    }
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


  actionStatus = (values) => {
    switch (values.value) {
      case 'error':
        return (<div className="containStatus">
          <div className="containActions">
            <div
              className="statusText"
              style={{ background: "#BF0016" }}
            >{`Error`}
            </div>
            <div
              onClick={() => { this.retryCreatedDashboard(values.original) }}
              className="statusAction"
              style={{ background: "#0078BF" }}>
              <img src={retry} />
            </div>
          </div>
        </div>)
      case 'completed':
        return (<div className="containStatus">
          <div className="containActions">
            <div
              className="statusText"
              style={{ background: "#27AE60" }}
            >{`Completed`}
            </div>
            <div
              onClick={() => { window.open(`${values.original.ui_url}`) }}
              className="statusAction"
              style={{ background: "black" }}>
              <img src={eyeIcon} />
            </div>
          </div>
        </div>)
      case 'process':
        return (<div className="containStatus">
          <div className="containActions">
            <div
              className="statusText"
              style={{ color: "#333333" }}
            >{`In process`}
            </div>
            <div
              className="statusAction"
              style={{ background: "#BDBDBD", cursor: "default" }}>
              <img src={eyeIcon} />
            </div>
          </div>
        </div>)
    }
  }

  /**
   * Method that return element based on
   * percentage of compatibility
   * @memberof Migration
   */
  compatibilityPercentage = (percentage) => {
    if (percentage === 0) {
      return (
        <div
          className="compatibilityLevel"
          style={{ color: "#BF0016" }}>
          {`Not compatibility`}
        </div>
      )
    } else if (percentage > 0 && percentage <= 50) {
      return (
        <div
          className="compatibilityLevel"
          style={{ color: "#F2C94C" }}>
          {`${percentage}%`}
        </div>
      )
    } else if (percentage > 50 && percentage <= 100) {
      return (
        <div
          className="compatibilityLevel"
          style={{ color: "#219653" }}>
          {`${percentage}%`}
        </div>
      )
    }
  }

  render() {
    const { dashboards, loading, page, totalRows, pages } = this.state;
    const { accountId } = this.props;
    return (
      <div className="statusMain">
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div style={{ display: "flex", justifyContent: "flex-end", width: "80%", paddingBottom: "10px" }}>
            <div
              // onClick={() => { window.open(`https://insights.newrelic.com/accounts/${accountId}/dashboards?page=1&sort=Name&filterBy=all`) }}
              onClick={() => { window.open(`https://one.newrelic.com/launcher/dashboards.launcher`) }}
              className="viewFull">
              <img src={eyeIcon} style={{ marginRight: "5px" }} />
                View list full
            </div>
          </div>
        </div>
        <div className="tableStatusContainer">
          <div className="statusTable">
            {loading ? (
              <Spinner type={Spinner.TYPE.DOT} />
            ) : (<>
              <div className="divListStatus">
                <AutoSizer>
                  {({ width }) => (
                    <ReactTable
                      page={page}
                      showPagination={false}
                      defaultPageSize={totalRows}
                      resizable={false}
                      data={dashboards}
                      width={width}
                      getTrProps={(state, rowInfo) => {
                        if (rowInfo) {
                          return {
                            style: {
                              background: rowInfo.index % 2 ? '#F7F7F8' : 'white',
                              borderBottom: 'none',
                              display: 'grid',
                              width: "100%",
                              gridTemplate: '1fr/ 33% 33% 33%'
                            }
                          };
                        } else {
                          return {
                            style: {
                              borderBottom: 'none',
                              display: 'grid',
                              width: "100%",
                              gridTemplate: '1fr/ 33% 33% 33%'
                            }
                          };
                        }
                      }}
                      getTrGroupProps={() => {
                        return {
                          style: {
                            borderBottom: 'none',
                          }
                        };
                      }}
                      getNoDataProps={() => {
                        return {
                          style: {
                            marginTop: '0px'
                          }
                        };
                      }}
                      getTheadTrProps={() => {
                        return {
                          style: {
                            background: '#F7F7F8',
                            height: '44px',
                            color: '#333333',
                            fontWeight: 'bold',
                            display: 'grid',
                            width: "100%",
                            gridTemplate: '1fr/ 33% 33% 33%'
                          }
                        };
                      }}
                      columns={[
                        {
                          headerStyle: {
                            background: '#F7F7F8',
                            width: '100%',
                            color: '#333333',
                            fontWeight: 'bold',
                            paddingLeft: '15px',
                            backgroundColor: '#F7F7F8',
                            display: 'flex',
                            alignItems: "center",
                            fontSize: '14px'
                          },
                          headerClassName: 'headerCompatibility',
                          className: 'cellCompability cellDashboard',
                          Header: 'MIGRATIONS',
                          accessor: 'title',
                          sortable: false,
                          Cell: props =>
                            <div>
                              {props.value}
                            </div>
                        },
                        {
                          headerStyle: {
                            background: '#F7F7F8',
                            color: '#333333',
                            fontWeight: 'bold',
                            backgroundColor: '#F7F7F8',
                            paddingLeft: '1%',
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: "center",
                            justifyContent: "center"
                          },
                          headerClassName: 'headerCompatibility',
                          className: 'cellCompability cellDashboard',
                          Header: 'COMPATIBILITY LEVEL',
                          accessor: 'percentage',
                          sortable: false,
                          Cell: props =>
                            this.compatibilityPercentage(parseInt(props.value))
                        },
                        {
                          headerStyle: {
                            background: '#F7F7F8',
                            color: '#333333',
                            fontWeight: 'bold',
                            backgroundColor: '#F7F7F8',
                            paddingLeft: '1%',
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: "center",
                            justifyContent: "center"
                          },
                          headerClassName: 'headerCompatibility',
                          className: 'cellCompability cellDashboard',
                          Header: 'STATUS',
                          accessor: 'status',
                          sortable: false,
                          Cell: props =>
                            this.actionStatus(props)
                        }
                      ]}
                    />
                  )}
                </AutoSizer>
              </div>
            </>
              )}
          </div>
        </div>
        <Pagination
          page={page}
          pages={pages}
          upPage={this.upPage}
          goToPage={this.changePage}
          downPage={this.downPage}
        />
      </div>
    );
  }
}

Status.propTypes = {
  accountId: PropTypes.number.isRequired
};
