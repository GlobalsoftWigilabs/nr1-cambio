/* eslint-disable no-unused-vars */
/* eslint-disable react/no-deprecated */
import React from 'react';
import PropTypes from 'prop-types';
import ReactTable from 'react-table-v6';
import * as Yup from 'yup';
import { Formik, Form, Field } from 'formik';
import Pagination from '../components/Pagination/Pagination';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import {
  Spinner,
  Button,
  AutoSizer,
  Toast
} from 'nr1';
import {
  readNerdStorage,
  readNerdStorageOnlyCollection,
  writeNerdStorageReturnData,
  writeNerdStorage
} from '../services/NerdStorage/api';
import {
  searchDashboardApi,
  createDashboardApi,
  validateQuery2,
  validateQuery
} from '../services/Dashboard/api';
import { converterFuction } from '../dd2nr/converter/index';
import { sendLogsSlack } from '../services/Wigilabs/api';

/**
 * Validation schema for the Insights key form
 */
const apiSchema = Yup.object().shape({
  appkey: Yup.string()
    .min(32, 'should be at least 32 characters')
    .max(50, 'should not be more than 50 characters')
    .required('Required')
});

/**
 * Validation schema for the Insights key form
 */
const apiSchemaTemp = Yup.object().shape({
  appkey: Yup.string()
    .max(50, 'should not be more than 50 characters')
    .required('Required')
});

/**
 * Class that renders the Migration Component
 *
 * @export
 * @class Migration
 * @extends {React.Component}
 */
export default class Migration extends React.Component {
  /**
   *Creates an instance of Migration.
   * @param {*} props
   * @memberof Migration
   */
  constructor(props) {
    super(props);
    this.state = {
      page: 1,
      sendingMigration: false,
      dashToMigrate: [],
      loading: false,
      // Pagination
      pagePag: 0,
      pages: 0,
      totalRows: 6,
      // API forms
      appkeyS: '***',
      appkey: '',
      region: false,
      configComplete: false,
      emptyStorage: false,
      // DatadogSetup
      datadogSetup: {},
      logs: [],
      percentageComplete: 0
    };
  }

  /**
   * Method called when the component will be mounted
   *
   * @memberof Migration
   */
  componentWillMount() {
    this.setState({ loading: true });
    this.loadDashboards();
    this.readDocumentSetup();
  }

  /**
   * Method that receives the dashboards from NerdStorage and saves it on state
   *
   * @memberof Migration
   */
  loadDashboards = async () => {
    let { logs } = this.state;
    
    const { accountId } = this.props;
    const datadogSetup = await this.readDatadogSetup();
    const dashToMigrate = [];
    const dashboards = await this.loadNerdData();
    for (const item of dashboards) {
      if (item.wantMigrate) {
        dashToMigrate.push(item);
      }
    }
    let dashboardsWithWigdets = await this.recoveDataDashboards();
    let dd = [];
    for (const dmigrate of dashToMigrate) {
      for (const dwidget of dashboardsWithWigdets) {
        if (dmigrate.id === dwidget.id) {
          dd.push(dwidget);
        }
      }
    }
    let dashboardsValidate = await converterFuction(dd, accountId);
    this.setState({ dashToMigrate: dashboardsValidate, datadogSetup, loading: false });
    this.calcTable();
    await this.sendLogs(logs);
  }

  recoveDataDashboards = async () => {
    const { accountId } = this.props;
    let listDashboard = [];
    let size = await readNerdStorageOnlyCollection(accountId, "Get a Dashboard", this.reportLogFetch);
    for (let i = 0; i < size.length; i++) {
      let temporatyList = [];
      temporatyList = await readNerdStorage(accountId, 'Get a Dashboard', `Get a Dashboard-${i}`, this.reportLogFetch);
      for (const temporatyElement of temporatyList) {
        listDashboard.push(temporatyElement);
      }
    }
    return listDashboard;
  }

  /**
   * Method that reads the datadog-setup document that contains the API configuration
   *
   * @returns JSON
   * @memberof Migration
   */
  readDatadogSetup = async () => {
    const { accountId } = this.props;
    let result = null;
    await readNerdStorage(accountId, 'setup', 'newrelic', this.reportLogFetch)
      .then(data => {
        if (data) {
          result = data;
        }
      });
    return result;
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
  calcTable() {
    const { dashToMigrate, totalRows } = this.state;
    let totalPages = 0;
    const aux = dashToMigrate.length % totalRows;
    if (aux === 0) {
      totalPages = dashToMigrate.length / totalRows;
    } else {
      totalPages = Math.trunc(dashToMigrate.length / totalRows) + 1;
    }
    this.setState({ pages: totalPages });
  }

  /**
   * Method that reads the Dashboards collection on NerdStorage
   *
   * @returns
   * @memberof Migration
   */
  loadNerdData = async () => {
    const { accountId } = this.props;
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
      for (const iterator of page) {
        list.push(iterator);
      }
    }
    return list;
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

  readDocumentSetup = async () => {
    this.setState({ loadingConfig: true });
    const { accountId } = this.props;
    let { logs } = this.state;
    await readNerdStorage(accountId, 'setup', 'newrelic', this.reportLogFetch)
      .then(data => {
        if (data) {
          this.setState({
            configComplete: true,
            emptyStorage: false,
            appkey: data.appkey,
            appkeyS: data.appkeyS,
            region: data.region
          });
        } else {
          this.setState({ emptyStorage: true });
        }
      });
    this.setState({ loadingConfig: false });
    this.sendLogs(logs, accountId);
  }

  /**
   * Method that simulates a Http request that sends the migration options
   *
   * @memberof Migration
   */
  async saveKeys(values) {
    //Save configuration in nerdstorage
    const { accountId } = this.props;
    const data = {
      appkey: values.appkey,
      region: values.region,
      appkeyS: `${values.appkey.slice(0, 6)}....`
    };
    await writeNerdStorageReturnData(accountId, 'setup', 'newrelic', data, this.reportLogFetch)
      .then(({ data }) => {
        this.setState({
          appkey: data.nerdStorageWriteDocument.appkey,
          appkeyS: `${data.nerdStorageWriteDocument.appkey.slice(0, 6)}....`,
          region: data.nerdStorageWriteDocument.region,
          configComplete: true
        });
      })
  }

  /**
   * Function that send logs to canal of slack
   * @memberof Migration
   */
  sendLogs = async (logs) => {
    const { accountId } = this.props;
    if (logs.length !== 0) {
      sendLogsSlack(logs, accountId);
    }
  }

  /**
   * Validation of api key execute simple query search through of api dashboard 
   * @memberof Migration
   */
  validateKey = async (xApiKey) => {
    let result = await searchDashboardApi("api-key-validation", xApiKey);
    if (result && result.status) {
      return false;
    }
    return true;
  }

  async prepareMigration(values) {
    const { configComplete, dashToMigrate, percentageComplete, logs } = this.state;
    const { goToStatus, accountId } = this.props;
    this.setState({ sendingMigration: true });
    if (configComplete) {
      const { appkey } = this.state;
      let validate = await this.validateKey(appkey);
      if (validate) {
        this.changeToForm(3);
        await this.saveKeys({ appkey: appkey });
        let percentages = [];
        let dashboardsFilter = dashToMigrate.filter(dash => dash.percentage > 0);
        for (const filter of dashboardsFilter) {
          percentages.push(filter.percentage);
        }
        for (const dash of dashboardsFilter) {
          dash.title = `${dash.title}`;
          dash.widgets = this.defineSizeAndPosition(dash.widgets);
          delete dash.percentage;
        }
        let percentageAcum = parseInt(100 / dashboardsFilter.length);
        let results = [];
        for (const dash of dashboardsFilter) {
          results.push(await createDashboardApi(dash, appkey));
          this.setState({ percentageComplete: percentageComplete + percentageAcum });
        }
        let migratedDashboards = [];
        let identifier = 0;
        for (const key in results) {
          if (results[key]) {
            let dashboardMigrate = {};
            if (results[key] && results[key].dashboardFailed) {
              dashboardMigrate = results[key].dashboardFailed;
              dashboardMigrate.status = "error";
              dashboardMigrate.percentage = percentages[key];
              dashboardMigrate.identifier = identifier;
            } else {
              dashboardMigrate = results[key];
              results[key].status = "completed";
              results[key].percentage = percentages[key];
            }
            identifier += 1;
            migratedDashboards.push(dashboardMigrate);
          }
        }
        const pagesMigratedDashboards = this.pagesOfData(migratedDashboards);
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
        this.setState({ sendingMigration: false });
        goToStatus(3);
      } else {
        this.setState({ sendingMigration: false });
        Toast.showToast({
          title: 'Error',
          description: 'Incorrect api key of new relic',
          type: Toast.TYPE.CRITICAL
        });
      }
    } else {
      let validate = await this.validateKey(values.appkey);
      if (validate) {
        this.changeToForm(3);
        await this.saveKeys({ appkey: values.appkey });
        let percentages = [];
        let dashboardsFilter = dashToMigrate.filter(dash => dash.percentage > 0);
        for (const filter of dashboardsFilter) {
          percentages.push(filter.percentage);
        }
        for (const dash of dashboardsFilter) {
          dash.title = `${dash.title}`;
          dash.widgets = this.defineSizeAndPosition(dash.widgets);
          delete dash.percentage;
        }
        let percentageAcum = parseInt(100 / dashboardsFilter.length);
        let results = [];
        for (const dash of dashboardsFilter) {
          results.push(await createDashboardApi(dash, values.appkey));
          this.setState({ percentageComplete: percentageComplete + percentageAcum });
        }
        let migratedDashboards = [];
        for (const key in results) {
          if (results[key]) {
            let dashboardMigrate = {};
            if (results[key] && results[key].dashboardFailed) {
              dashboardMigrate = results[key].dashboardFailed;
              dashboardMigrate.status = "error";
              results[key].percentage = percentages[key];
            } else {
              dashboardMigrate = results[key];
              results[key].status = "completed";
              results[key].percentage = percentages[key];
            }
            migratedDashboards.push(dashboardMigrate);
          }
        }
        const pagesMigratedDashboards = this.pagesOfData(migratedDashboards);
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
        this.setState({ sendingMigration: false });
        goToStatus(3);
      } else {
        this.setState({ sendingMigration: false });
        Toast.showToast({
          title: 'Error',
          description: 'Incorrect api key of new relic',
          type: Toast.TYPE.CRITICAL
        });
      }
    }
    this.sendLogs(logs);
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


  defineSizeAndPosition = (widgets) => {
    //define size
    for (let i = 0; i < widgets.length; i++) {
      widgets[i].layout.width = 3;
      widgets[i].layout.height = 3;
    }
    //define position of column
    let column = 1;
    for (let j = 0; j < widgets.length; j++) {
      widgets[j].layout.column = column;
      if (column === 10) {
        column = 1;
      } else {
        column += 3;
      }
    }
    //define position of row
    let row = 1;
    let quantityRows = 0;
    for (let i = 0; i < widgets.length; i++) {
      widgets[i].layout.row = row;
      quantityRows += 1;
      if (quantityRows === 4) {
        row += 3;
        quantityRows = 0;
      }
    }
    return widgets;
  }

  changeKeys() {
    const { configComplete } = this.state;
    this.setState({ configComplete: !configComplete });
  }

  /**
   * Method that open a "Coming soon" Toast
   *
   * @memberof Migration
   */
  changeToForm(value) {
    this.setState({ page: value });
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

  enableButtonNext = () => {
    const { dashToMigrate } = this.state;
    if (dashToMigrate.length === 0) {
      return true;
    } else {
      let quantityDashboards = dashToMigrate.length;
      let quantityIncompatible = 0;
      for (const dash of dashToMigrate) {
        if (dash.percentage === 0) {
          quantityIncompatible += 1;
        }
      }
      if (quantityDashboards === quantityIncompatible) {
        return true;
      }
    }
    return false;
  }

  /**
   * Methud que return element based on
   * section that is the user
   * @memberof Migration
   */
  returnContent = (page) => {
    const {
      sendingMigration,
      dashToMigrate,
      loading,
      pagePag,
      totalRows,
      pages,
      appkey,
      appkeyS,
      configComplete,
      region,
      loadingConfig,
      emptyStorage,
      percentageComplete
    } = this.state;
    switch (page) {
      case 1:
        return (
          <div className="migrationMain">
            <div className="tableContainer">
              <div className="migrationTable">
                {loading ? (
                  <Spinner type={Spinner.TYPE.DOT} />
                ) : (
                    <div className="divListMigration">
                      <AutoSizer>
                        {({ width }) => (
                          <ReactTable
                            page={pagePag}
                            showPagination={false}
                            defaultPageSize={totalRows}
                            resizable={false}
                            width={width}
                            data={dashToMigrate}
                            getTrProps={(state, rowInfo) => {
                              if (rowInfo) {
                                return {
                                  style: {
                                    background: rowInfo.index % 2 ? '#F7F7F8' : 'white',
                                    borderBottom: 'none',
                                    display: 'grid',
                                    width: "100%",
                                    gridTemplate: '1fr/ 70% 30%'
                                  }
                                };
                              } else {
                                return {
                                  style: {
                                    borderBottom: 'none',
                                    display: 'grid',
                                    width: "100%",
                                    gridTemplate: '1fr/ 70% 30%'
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
                                  gridTemplate: '1fr/ 70% 30%'
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
                              }
                            ]}
                          />
                        )}
                      </AutoSizer>
                    </div>
                  )}
              </div>
            </div>
            <div>
              <Pagination
                page={pagePag}
                pages={pages}
                upPage={this.upPage}
                goToPage={this.changePage}
                downPage={this.downPage}
              />
            </div>
            <div className="buttonContainer">
              <Button
                type={Button.TYPE.PRIMARY}
                disabled={this.enableButtonNext()}
                className="buttonNext"
                onClick={() => this.changeToForm(2)}
              >
                NEXT
              </Button>
            </div>
          </div >
        )
      case 2:
        return (
          <div className="migrationMain">
            {
              loadingConfig ? (
                <Spinner type={Spinner.TYPE.DOT} />
              ) : (
                  <Formik
                    enableReinitialize
                    initialValues={
                      configComplete
                        ? {
                          appkey: appkeyS,
                          region
                        }
                        : {
                          appkey,
                          region
                        }
                    }
                    validationSchema={configComplete ? apiSchemaTemp : apiSchema}
                    onSubmit={values => this.prepareMigration(values)}
                  >
                    {({ errors, touched, submitForm, values, setFieldValue }) => (
                      <div className="fullHeightDiv">
                        <div className="insightsContainer">
                          <div className="migrationInsight">
                            <div className="migrationContent">
                              <div className="divInsightKey">
                                <Form className="migrationSetup" autoComplete="off">
                                  <div className="divTextfieldKeys">
                                    <div className="LabelKey" style={{ fontSize: "18px" }}>
                                      New Relic One Application key
                                </div>
                                    <Field
                                      name="appkey"
                                      disabled={configComplete}
                                    />
                                    {errors.appkey && touched.appkey ? (
                                      <div style={{ color: 'red' }}>
                                        {errors.appkey}
                                      </div>
                                    ) : (
                                        <div style={{ color: 'white' }}>.....</div>
                                      )}
                                  </div>
                                </Form>
                              </div>
                              {!emptyStorage && (
                                <div className="divButtonEdit">
                                  <Button
                                    sizeType={Button.SIZE_TYPE.SMALL}
                                    iconType={
                                      Button.ICON_TYPE
                                        .DATAVIZ__DATAVIZ__CHART__A_EDIT
                                    }
                                    onClick={() => this.changeKeys()}
                                  >
                                    {configComplete ? 'Edit' : 'Cancel'}
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="buttonInsightContainer">
                          <Button
                            className="buttonBack"
                            onClick={() => this.changeToForm(1)}
                          >
                            BACK
                            </Button>
                          <Button
                            onClick={submitForm}
                            type={Button.TYPE.PRIMARY}
                            className="buttonInsight"
                            loading={sendingMigration}
                          >
                            MIGRATION NOW
                          </Button>
                        </div>
                      </div>
                    )}
                  </Formik>
                )
            }
          </div>
        )
      case 3:
        return (
          <div className="containerProgress">
            <div style={{ width: "180px", height: "180px" }}>
              <CircularProgressbar counterClockwise value={percentageComplete} maxValue={100} text={`${percentageComplete}%`}
                styles={buildStyles({
                  textColor: "black",
                  pathColor: "#007E8A",
                  trailColor: "#0CC4D6"
                })} />
              <div style={{ paddingTop: '15px' }}> <span>Migrating Dashboard</span></div>
            </div>
          </div>
        )
    }
  }

  render() {
    const {
      page
    } = this.state;
    return (
      <div className="migrationMain">
        {this.returnContent(page)}
      </div >
    );
  }
}

Migration.propTypes = {
  accountId: PropTypes.number.isRequired,
  goToStatus: PropTypes.func.isRequired
};
