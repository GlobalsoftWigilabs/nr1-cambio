import React from 'react';
import ArrowUnion from '../../components/ArrowsTable/ArrowUnion';
import ReactTable from 'react-table-v6';
import Pagination from '../../components/Pagination/Pagination';
import closeIcon from '../../images/close.svg';
import { Modal } from 'react-bootstrap';
import { PropTypes } from 'prop-types';

export default class TableVariables extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      // Pagination
      pagePag: 0,
      pages: 0,
      totalRows: 10,
      // //////////
      sortColumn: {
        column: '',
        order: ''
      },
      data: []
    };
  }

  componentDidMount() {
    const { infoAditional } = this.props;
    const data = [];
    for (const iterator of infoAditional.templateVariables) {
      data.push({
        default: iterator.default ? iterator.default : '-----',
        name: iterator.name ? iterator.name : '-----',
        prefix: iterator.prefix ? iterator.prefix : '-----'
      });
    }
    this.setState({ data });
    this.calcTable(data);
  }

  calcTable = finalList => {
    const { totalRows } = this.state;
    const aux = finalList.length % totalRows;
    let totalPages = 0;
    if (aux === 0) {
      totalPages = finalList.length / totalRows;
    } else {
      totalPages = Math.trunc(finalList.length / totalRows) + 1;
    }
    this.setState({ pages: totalPages, pagePag: 0 });
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
    this.filterData(sortColumn);
    this.setState({
      sortColumn: {
        column: column,
        order: order
      }
    });
  };

  filterData = sortColumn => {
    const { data } = this.state;
    const filterData = this.sortData(data, sortColumn);
    this.setState({ data: filterData });
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
      case 'prefix': {
        const sortPrefix = finalList.sort(function(a, b) {
          if (a.prefix > b.prefix) {
            return valueOne;
          }
          if (a.prefix < b.prefix) {
            return valueTwo;
          }
          return 0;
        });
        return sortPrefix;
      }
      case 'default': {
        const sortDefault = finalList.sort(function(a, b) {
          if (a.default > b.default) {
            return valueOne;
          }
          if (a.default < b.default) {
            return valueTwo;
          }
          return 0;
        });
        return sortDefault;
      }
      default:
        return finalList;
    }
  };

  render() {
    const {
      handleCheck,
      infoAditional,
      _onClose,
      checkWidgets,
      checkVariables
    } = this.props;
    const { data, pagePag, pages, totalRows, sortColumn } = this.state;
    return (
      <Modal.Body>
        <Modal.Header>
          <div className=" modalWidgets__closeIcon">
            <div className="infoAditional--title flex flexCenterVertical fontSmall">
              {`${infoAditional.name} `}
              <div className="flex" style={{ marginLeft: '4%' }}>
                <input
                  type="radio"
                  checked={checkWidgets}
                  onChange={() => handleCheck('widgets')}
                  onClick={() => handleCheck('widgets')}
                />
                <div className="titleSo fontSmall">{`Widgets (${infoAditional.widgets.length})`}</div>
              </div>
              <div className="flex" style={{ marginLeft: '4%' }}>
                <input
                  type="radio"
                  checked={checkVariables}
                  onChange={() => handleCheck('variables')}
                  onClick={() => handleCheck('variables')}
                />
                <div className="titleSo fontSmall">{`Variable List (${infoAditional.templateVariables.length})`}</div>
              </div>
            </div>
            <div className="flex" style={{ justifyContent: 'flex-end' }}>
              <Pagination
                page={pagePag}
                pages={pages}
                upPage={this.upPage}
                goToPage={this.changePage}
                downPage={this.downPage}
              />
            </div>
            <div className="flex flexCenterVertical flexCenterHorizontal">
              <div className="flex w100" style={{ justifyContent: 'flex-end' }}>
                <img
                  onClick={() => {
                    _onClose();
                  }}
                  className="pointer"
                  style={{
                    width: '26px',
                    height: '26px'
                  }}
                  src={closeIcon}
                />
              </div>
            </div>
          </div>
        </Modal.Header>
        <div>
          <div className="modal__infoAditional tableContent__table">
            <div
              style={{
                // conditional width: '3000px'
                height: '500px'
              }}
            >
              <ReactTable
                loadingText="Processing..."
                page={pagePag}
                showPagination={false}
                resizable={false}
                data={data}
                defaultPageSize={totalRows}
                getTrProps={(state, rowInfo) => {
                  return {
                    style: {
                      background:
                        rowInfo && rowInfo.index % 2 ? '#F7F7F8' : 'white',
                      borderBottom: 'none',
                      display: 'grid',
                      gridTemplate: '1fr/ 33% 33% 34% '
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
                      gridTemplate: '1fr/ 33% 33% 34%'
                    }
                  };
                }}
                columns={[
                  {
                    Header: () => (
                      <div className="table__headerSticky fontSmall">
                        <div
                          className="pointer flex "
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
                    Cell: props => (
                      <div
                        style={{ marginLeft: '15px' }}
                        className="h100 flex flexCenterVertical "
                      >
                        {props.value}
                      </div>
                    )
                  },
                  {
                    Header: () => (
                      <div className="table__headerAlignRight fontSmall">
                        <div
                          className="pointer flex "
                          onClick={() => {
                            this.setSortColumn('default');
                          }}
                        >
                          DEFAULT
                          <div className="flexColumn table__sort">
                            <ArrowUnion
                              colorArrowOne={
                                sortColumn.column === 'default' &&
                                sortColumn.order === 'descent'
                                  ? 'black'
                                  : 'gray'
                              }
                              colorArrowTwo={
                                sortColumn.column === 'default' &&
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
                    accessor: 'default',
                    className:
                      'table__cell fontNormal flex  flexCenterVertical h100 w100I',
                    sortable: false,
                    Cell: props => (
                      <div className="h100 flex flexCenterVertical ">
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
                            this.setSortColumn('prefix');
                          }}
                        >
                          PREFIX
                          <div className="flexColumn table__sort">
                            <ArrowUnion
                              colorArrowOne={
                                sortColumn.column === 'prefix' &&
                                sortColumn.order === 'descent'
                                  ? 'black'
                                  : 'gray'
                              }
                              colorArrowTwo={
                                sortColumn.column === 'prefix' &&
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
                    accessor: 'prefix',
                    className:
                      'table__cell fontNormal flex  flexCenterVertical h100 w100I',
                    sortable: false,
                    Cell: props => (
                      <div className="h100 flex flexCenterVertical ">
                        {props.value}
                      </div>
                    )
                  }
                ]}
              />
            </div>
          </div>
        </div>
      </Modal.Body>
    );
  }
}
TableVariables.propTypes = {
  infoAditional: PropTypes.object.isRequired,
  handleCheck: PropTypes.func.isRequired,
  _onClose: PropTypes.func.isRequired,
  checkWidgets: PropTypes.bool.isRequired,
  checkVariables: PropTypes.bool.isRequired
};
