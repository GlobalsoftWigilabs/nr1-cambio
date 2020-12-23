import React from 'react';
import { Spinner } from 'nr1';
import moment from 'moment';
import SearchInput, { createFilter } from 'react-search-input';
import { BsSearch } from 'react-icons/bs';
import iconDownload from '../../images/download.svg';
import ArrowDown from '../../components/ArrowsTable/ArrowDown';
import ArrowTop from '../../components/ArrowsTable/ArrowTop';
import Modal from '../../components/Modal';
import ReactTable from 'react-table-v6';
import Pagination from '../../components/Pagination/Pagination';
import PropTypes from 'prop-types';
import Bar from '../../components/Bar';

const greenColor = '#007E8A';

export default class Alerts extends React.Component {
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
      emptyData: false
    };
  }

  dateToYMD(date) {
    return moment.unix(date).format('MM/DD/YYYY');
  }

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
    this.setState({ searchTermDashboards: term });
  };

  _onClose = () => {
    const actualValue = this.state.hidden;
    this.setState({ hidden: !actualValue });
  };

  returnActionPopUp = action => {
    return <div>CONTENT POPUP BASED ON ACTION</div>;
  };

  confirmAction = async action => {
    this._onClose();
    //DO ACTION WHEN CLICK CONFIRM BUTTON
  };

  setSortColumn = column => {
    const { sortColumn } = this.state;
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
    this.setState({
      sortColumn: {
        column: column,
        order: order
      }
    });
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
      action
    } = this.state;
    const { alertsData, alertsTotal, monitorsData } = this.props;
    console.log(
      'alertsData',
      alertsData,
      'alertsTotal',
      alertsTotal,
      'monitorsData',
      monitorsData
    );
    return (
      <div className="h100">
        {loading ? (
          <Spinner type={Spinner.TYPE.DOT} />
        ) : (
          <div className="mainContent">
            <div className="mainContent__information">
              <div className="information__box">
                <span
                  className="box--title"
                  style={{
                    color: greenColor
                  }}
                >
                  Alerts
                </span>
                <div>
                  <span
                    className="box--quantity"
                    style={{
                      color: greenColor
                    }}
                  >
                    {alertsTotal}
                  </span>
                </div>
              </div>
              <div className="box-content">
                <div style={{ height: '50%' }} />
                <div
                  style={{ height: '50%', width: '95%' }}
                  className="graphsBarAlert__containeScroll"
                >
                  {alertsData ? (
                    alertsData.map((data, index) => {
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
                    monitorsData.length === 0
                      ? 'pointerBlock flex flexCenterVertical'
                      : 'pointer flex flexCenterVertical'
                  }
                  onClick={() => {
                    // eslint-disable-next-line no-alert
                    if (monitorsData.length !== 0) alert('download data...');
                  }}
                >
                  <img
                    src={iconDownload}
                    style={{ marginLeft: '20px' }}
                    height="18px"
                  />
                </div>
                {monitorsData.length !== 0 && (
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
                <div style={{ width: '2000px' }} className="h100">
                  <ReactTable
                    loading={savingAllChecks}
                    loadingText="Processing..."
                    page={pagePag}
                    showPagination={false}
                    resizable={false}
                    data={monitorsData}
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
                              gridTemplate: '1fr/ 20% repeat(8,10%)'
                            }
                          };
                        } else {
                          return {
                            style: {
                              borderBottom: 'none',
                              display: 'grid',
                              gridTemplate: '1fr/ 20% repeat(8,10%)'
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
                          gridTemplate: '1fr/ 20% repeat(8,10%)'
                        }
                      };
                    }}
                    columns={[
                      {
                        Header: () => (
                          <div className="table__headerSticky">
                            <div
                              className="pointer flex flexCenterHorizontal"
                              style={{ marginLeft: '5px' }}
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
                              className="h100 flex flexCenterVertical"
                              style={{
                                background:
                                  props.index % 2 ? '#F7F7F8' : 'white'
                              }}
                            >
                              <span style={{ marginLeft: '5px' }}>
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
                              className="pointer flex flexCenterHorizontal"
                              onClick={() => {
                                this.setSortColumn('age');
                              }}
                            >
                              CLASSIFICATION
                              <div className="flexColumn table__sort">
                                <ArrowTop
                                  color={
                                    sortColumn.column === 'age' &&
                                    sortColumn.order === 'ascendant'
                                      ? 'black'
                                      : 'gray'
                                  }
                                />
                                <ArrowDown
                                  color={
                                    sortColumn.column === 'age' &&
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
                        accessor: 'classification',
                        className:
                          'table__cell flex flexCenterHorizontal flexCenterVertical h100 w100I',
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
                              className="pointer flex flexCenterHorizontal"
                              onClick={() => {
                                this.setSortColumn('job');
                              }}
                            >
                              TYPE
                              <div className="flexColumn table__sort">
                                <ArrowTop
                                  color={
                                    sortColumn.column === 'job' &&
                                    sortColumn.order === 'ascendant'
                                      ? 'black'
                                      : 'gray'
                                  }
                                />
                                <ArrowDown
                                  color={
                                    sortColumn.column === 'job' &&
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
                        accessor: 'type',
                        className:
                          'table__cell flex flexCenterHorizontal flexCenterVertical h100 w100I',
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
                              className="pointer flex flexCenterHorizontal"
                              onClick={() => {
                                this.setSortColumn('job');
                              }}
                            >
                              AUTHOR
                              <div className="flexColumn table__sort">
                                <ArrowTop
                                  color={
                                    sortColumn.column === 'job' &&
                                    sortColumn.order === 'ascendant'
                                      ? 'black'
                                      : 'gray'
                                  }
                                />
                                <ArrowDown
                                  color={
                                    sortColumn.column === 'job' &&
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
                        accessor: 'creator.name',
                        className:
                          'table__cell flex flexCenterHorizontal flexCenterVertical h100 w100I',
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
                              className="pointer flex flexCenterHorizontal"
                              onClick={() => {
                                this.setSortColumn('job');
                              }}
                            >
                              CREATION DATE
                              <div className="flexColumn table__sort">
                                <ArrowTop
                                  color={
                                    sortColumn.column === 'job' &&
                                    sortColumn.order === 'ascendant'
                                      ? 'black'
                                      : 'gray'
                                  }
                                />
                                <ArrowDown
                                  color={
                                    sortColumn.column === 'job' &&
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
                        accessor: 'created',
                        className:
                          'table__cell flex flexCenterHorizontal flexCenterVertical h100 w100I',
                        sortable: false,
                        Cell: props => (
                          <div className="h100 flex flexCenterVertical flexCenterHorizontal">
                            {this.dateToYMD(new Date(props.value))}
                          </div>
                        )
                      },
                      {
                        Header: () => (
                          <div className="table__header">
                            <div
                              className="pointer flex flexCenterHorizontal"
                              onClick={() => {
                                this.setSortColumn('job');
                              }}
                            >
                              DATE LAST TRIGGERED
                              <div className="flexColumn table__sort">
                                <ArrowTop
                                  color={
                                    sortColumn.column === 'job' &&
                                    sortColumn.order === 'ascendant'
                                      ? 'black'
                                      : 'gray'
                                  }
                                />
                                <ArrowDown
                                  color={
                                    sortColumn.column === 'job' &&
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
                        accessor: 'last_triggered_ts',
                        className:
                          'table__cell flex flexCenterHorizontal flexCenterVertical h100 w100I',
                        sortable: false,
                        Cell: props => (
                          <div className="h100 flex flexCenterVertical flexCenterHorizontal">
                            {props.value
                              ? this.dateToYMD(new Date(props.value))
                              : '___'}
                          </div>
                        )
                      },
                      {
                        Header: () => (
                          <div className="table__header">
                            <div
                              className="pointer flex flexCenterHorizontal"
                              onClick={() => {
                                this.setSortColumn('job');
                              }}
                            >
                              OVERALL STATE
                              <div className="flexColumn table__sort">
                                <ArrowTop
                                  color={
                                    sortColumn.column === 'job' &&
                                    sortColumn.order === 'ascendant'
                                      ? 'black'
                                      : 'gray'
                                  }
                                />
                                <ArrowDown
                                  color={
                                    sortColumn.column === 'job' &&
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
                        accessor: 'status',
                        className:
                          'table__cell flex flexCenterHorizontal flexCenterVertical h100 w100I',
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
                              className="pointer flex flexCenterHorizontal"
                              onClick={() => {
                                this.setSortColumn('job');
                              }}
                            >
                              MULTI
                              <div className="flexColumn table__sort">
                                <ArrowTop
                                  color={
                                    sortColumn.column === 'job' &&
                                    sortColumn.order === 'ascendant'
                                      ? 'black'
                                      : 'gray'
                                  }
                                />
                                <ArrowDown
                                  color={
                                    sortColumn.column === 'job' &&
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
                        accessor: 'multi',
                        className:
                          'table__cell flex flexCenterHorizontal flexCenterVertical h100 w100I',
                        sortable: false,
                        Cell: props => (
                          <div className="h100 flex flexCenterVertical flexCenterHorizontal">
                            {props.value ? 'yes' : 'no'}
                          </div>
                        )
                      },
                      {
                        Header: () => (
                          <div className="table__header">
                            <div
                              className="pointer flex flexCenterHorizontal"
                              onClick={() => {
                                this.setSortColumn('job');
                              }}
                            >
                              PRIORITY
                              <div className="flexColumn table__sort">
                                <ArrowTop
                                  color={
                                    sortColumn.column === 'job' &&
                                    sortColumn.order === 'ascendant'
                                      ? 'black'
                                      : 'gray'
                                  }
                                />
                                <ArrowDown
                                  color={
                                    sortColumn.column === 'job' &&
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
                        accessor: 'priority',
                        className:
                          'table__cell flex flexCenterHorizontal flexCenterVertical h100 w100I',
                        sortable: false,
                        Cell: props => (
                          <div className="h100 flex flexCenterVertical flexCenterHorizontal">
                            {props.value ? props.value : '___'}
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
        <Modal
          hidden={hidden}
          _onClose={this._onClose}
          confirmAction={this.confirmAction}
        >
          {this.returnActionPopUp(action)}
        </Modal>
      </div>
    );
  }
}

Alerts.propTypes = {
  alertsTotal: PropTypes.number.isRequired,
  monitorsData: PropTypes.array.isRequired,
  alertsData: PropTypes.array.isRequired
};
