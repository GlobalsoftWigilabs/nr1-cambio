/* eslint-disable no-nested-ternary */
import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import ArrowDown from '../../components/ArrowsTable/ArrowDown';
import ArrowTop from '../../components/ArrowsTable/ArrowTop';
import ArrowUnion from '../../components/ArrowsTable/ArrowUnion';
import ReactTable from 'react-table-v6';
import { Modal } from 'react-bootstrap';
import closeIcon from '../../images/close.svg';

export default class ModalSynthetics extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dataVariables: [],
      dataAssertions: [],
      dataSteps: [],
      pagePag: 0,
      savingAllChecks: false,
      totalRows: 10,
      sortColumn: {
        column: '',
        order: ''
      },
      timeRanges: [],
      rangeSelected: { value: 'Steps', label: 'Steps' },
      selectedOption: 'REQUEST'
    };
    this.onValueChange = this.onValueChange.bind(this);
  }

  componentDidMount() {
    const timeRanges = [];
    const { infoAditional = {} } = this.props;
    if (infoAditional.variables) {
      this.setState({
        dataVariables: infoAditional.variables
      });
    }
    if (infoAditional.assertions) {
      this.setState({
        dataAssertions: infoAditional.assertions
      });
    }
    if (infoAditional.steps) {
      this.setState({
        dataSteps: infoAditional.steps
      });
    }
    if (
      infoAditional.host !== '-----' ||
      infoAditional.url !== '-----' ||
      infoAditional.method !== '-----' ||
      infoAditional.query !== '-----' ||
      infoAditional.variables.length >= 1 ||
      infoAditional.assertions.length >= 1
    ) {
      timeRanges.push({ value: 'Configuration', label: 'Configuration' });
      this.setState({
        rangeSelected: { value: 'Configuration', label: 'Configuration' }
      });
    }
    if (infoAditional.steps.length >= 1) {
      timeRanges.push({ value: 'Steps', label: 'Steps' });
    }
    this.setState({ timeRanges });
  }

  setSortColumnSteps = column => {
    const { sortColumn, dataSteps } = this.state;
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
    this.loadDataSteps(dataSteps, {
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

  loadDataSteps = (test, sortColumn) => {
    let finalList = test;
    finalList = this.sortDataSteps(finalList, sortColumn);
    this.setState({ dataSteps: finalList });
  };

  sortDataSteps = (finalList, { order, column }) => {
    let valueOne = 1;
    let valueTwo = -1;
    if (order === 'descent') {
      valueOne = -1;
      valueTwo = 1;
    }
    switch (column) {
      case 'params':
        // eslint-disable-next-line no-case-declarations
        const sortName = finalList.sort(function(a, b) {
          if (a.params > b.params) {
            return valueOne;
          }
          if (a.params < b.params) {
            return valueTwo;
          }
          return 0;
        });
        return sortName;
      case 'type':
        // eslint-disable-next-line no-case-declarations
        const sortType = finalList.sort(function(a, b) {
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
  };

  setSortColumnVariables = column => {
    const { sortColumn, dataVariables } = this.state;
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
    this.loadDataVariables(dataVariables, {
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

  loadDataVariables = (test, sortColumn) => {
    let finalList = test;
    finalList = this.sortDataVariables(finalList, sortColumn);
    this.setState({ dataVariables: finalList });
  };

  sortDataVariables = (finalList, { order, column }) => {
    let valueOne = 1;
    let valueTwo = -1;
    if (order === 'descent') {
      valueOne = -1;
      valueTwo = 1;
    }
    switch (column) {
      case 'name':
        // eslint-disable-next-line no-case-declarations
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
      case 'id':
        // eslint-disable-next-line no-case-declarations
        const sortId = finalList.sort(function(a, b) {
          if (a.id > b.id) {
            return valueOne;
          }
          if (a.id < b.id) {
            return valueTwo;
          }
          return 0;
        });
        return sortId;
      case 'description':
        // eslint-disable-next-line no-case-declarations
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
      case 'tags':
        // eslint-disable-next-line no-case-declarations
        const sortTags = finalList.sort(function(a, b) {
          if (a.tags > b.tags) {
            return valueOne;
          }
          if (a.tags < b.tags) {
            return valueTwo;
          }
          return 0;
        });
        return sortTags;
      case 'value':
        // eslint-disable-next-line no-case-declarations
        const sortValue = finalList.sort(function(a, b) {
          if (a.value > b.value) {
            return valueOne;
          }
          if (a.value < b.value) {
            return valueTwo;
          }
          return 0;
        });
        return sortValue;
      case 'secure':
        // eslint-disable-next-line no-case-declarations
        const sortSecure = finalList.sort(function(a, b) {
          if (a.secure > b.secure) {
            return valueOne;
          }
          if (a.secure < b.secure) {
            return valueTwo;
          }
          return 0;
        });
        return sortSecure;
      default:
        return finalList;
    }
  };

  setSortColumnAssertions = column => {
    const { sortColumn, dataAssertions } = this.state;
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
    this.loadDataAssertions(dataAssertions, {
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

  loadDataAssertions = (test, sortColumn) => {
    let finalList = test;
    finalList = this.sortDataAssertions(finalList, sortColumn);
    this.setState({ dataAssertions: finalList });
  };

  sortDataAssertions = (finalList, { order, column }) => {
    let valueOne = 1;
    let valueTwo = -1;
    if (order === 'descent') {
      valueOne = -1;
      valueTwo = 1;
    }
    switch (column) {
      case 'value':
        // eslint-disable-next-line no-case-declarations
        const sortValue = finalList.sort(function(a, b) {
          if (a.value > b.value) {
            return valueOne;
          }
          if (a.value < b.value) {
            return valueTwo;
          }
          return 0;
        });
        return sortValue;
      default:
        return finalList;
    }
  };

  /**
   * Method to change select state
   *
   * @param {object} value
   * @memberof ModalSynthetics
   */
  handleRange = value => {
    this.setState({ rangeSelected: value });
  };

  /**
   * Method to change the state of the radiobutton
   *
   * @param {object} event
   * @memberof ModalSynthetics
   */
  onValueChange(event) {
    this.setState({
      selectedOption: event.target.value
    });
  }

  /**
   * Method to render the cells
   *
   * @param {string} cell
   * @param {string} content
   * @param {string} color
   * @memberof ModalSynthetics
   */
  renderCelll = (cell, content, color) => {
    return (
      <>
        <div
          style={{
            width: '100%',
            backgroundColor: `${color}`,
            padding: '5px',
            minHeight: '3vw',
            alignItems: 'center',
            display: 'flex'
          }}
        >
          <div
            className="fontSmall"
            style={{
              color: '#333333',
              fontWeight: 'bold',
              width: '30%'
            }}
          >
            <div className="flex" style={{ marginLeft: '15px' }}>
              {cell}
            </div>
          </div>
          <div style={{ width: '70%' }} className="fontNormal">
            <div
              style={{ overflow: 'hidden' }}
              className="h100 flex flexCenterVertical"
            >
              {content}
            </div>
          </div>
        </div>
      </>
    );
  };

  /**
   * Method to render the radiobutton group
   *
   * @return {*}
   * @memberof ModalSynthetics
   */
  renderRadioButton() {
    const { infoAditional } = this.props;
    const { dataVariables, dataAssertions } = this.state;
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center'
        }}
      >
        {infoAditional.host !== '-----' ||
        infoAditional.url !== '-----' ||
        infoAditional.method !== '-----' ||
        infoAditional.query !== '-----' ? (
          <div className="radioContent">
            <div>
              <input
                type="radio"
                value="REQUEST"
                name="REQUEST"
                checked={this.state.selectedOption === 'REQUEST'}
                onChange={this.onValueChange}
              />
            </div>
            <div className="radioButtonSynthetics fontSmall">REQUEST</div>
          </div>
        ) : (
          <div />
        )}
        {dataVariables.length >= 1 ? (
          <div className="radioContent">
            <div>
              <input
                type="radio"
                value="VARIABLES"
                name="VARIABLES"
                checked={this.state.selectedOption === 'VARIABLES'}
                onChange={this.onValueChange}
              />
            </div>
            <div className="radioButtonSynthetics fontSmall">VARIABLES</div>
          </div>
        ) : (
          <div />
        )}
        {dataAssertions.length >= 1 ? (
          <div className="radioContent">
            <div>
              <input
                type="radio"
                value="ASSERTIONS"
                name="ASSERTIONS"
                checked={this.state.selectedOption === 'ASSERTIONS'}
                onChange={this.onValueChange}
              />
            </div>
            <div className="radioButtonSynthetics fontSmall">ASSERTIONS</div>
          </div>
        ) : (
          <div />
        )}
      </div>
    );
  }

  /**
   * Method to render request
   *
   * @return {*}
   * @memberof ModalSynthetics
   */
  renderRequest() {
    const { infoAditional } = this.props;
    if (
      infoAditional.host !== '-----' ||
      infoAditional.url !== '-----' ||
      infoAditional.method !== '-----' ||
      infoAditional.query !== '-----'
    ) {
      return (
        <div
          style={{
            height: '500px'
          }}
          className="graph_bar"
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {this.renderCelll('HOST', infoAditional.host, '#f7f7f8')}
            {this.renderCelll('URL', infoAditional.url, 'white')}
            {this.renderCelll('METHOD', infoAditional.method, '#f7f7f8')}
            {this.renderCelll('QUERY', infoAditional.query, 'white')}
          </div>
        </div>
      );
    } else {
      return (
        <div
          style={{
            height: '500px'
          }}
          className="graph_bar"
        />
      );
    }
  }

  /**
   * Method to render variables
   *
   * @return {*}
   * @memberof ModalSynthetics
   */
  renderVariables() {
    const {
      savingAllChecks,
      pagePag,
      totalRows,
      sortColumn,
      dataVariables
    } = this.state;
    if (dataVariables.length >= 1) {
      return (
        <div style={{ height: '500px', width: '1312px' }}>
          <ReactTable
            loading={savingAllChecks}
            loadingText="Processing..."
            page={pagePag}
            showPagination={false}
            resizable={false}
            data={dataVariables}
            defaultPageSize={totalRows}
            getTrProps={(state, rowInfo) => {
              // eslint-disable-next-line no-lone-blocks
              {
                if (rowInfo) {
                  return {
                    style: {
                      background: rowInfo.index % 2 ? '#F7F7F8' : 'white',
                      borderBottom: 'none',
                      display: 'grid',
                      gridTemplate: '1fr / repeat(6, 16.66%)'
                    }
                  };
                } else {
                  return {
                    style: {
                      borderBottom: 'none',
                      display: 'grid',
                      gridTemplate: '1fr / repeat(6, 16.66%)'
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
                  gridTemplate: '1fr / repeat(6, 16.66%)'
                }
              };
            }}
            columns={[
              {
                Header: () => (
                  <div className="darkLine table__headerSticky fontSmall">
                    <div
                      className="pointer flex "
                      style={{ marginLeft: '15px' }}
                      onClick={() => {
                        this.setSortColumnVariables('name');
                      }}
                    >
                      NAME
                      <div className="flexColumn table__sort">
                        <ArrowUnion
                          sortColumn={sortColumn}
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
                headerClassName: 'w100I',
                className: 'table__cellSticky fontNormal h100 w100I',
                accessor: 'name',
                sortable: false,
                Cell: props => {
                  return (
                    <div
                      className="darkLine h100 flex flexCenterVertical"
                      style={{
                        background: props.index % 2 ? '#F7F7F8' : 'white'
                      }}
                    >
                      <span style={{ marginLeft: '15px' }}>
                        {`  ${props.value}`}
                      </span>
                    </div>
                  );
                }
              },
              {
                Header: () => (
                  <div className="table__header fontSmall">
                    <div
                      className="pointer flex "
                      onClick={() => {
                        this.setSortColumnVariables('id');
                      }}
                    >
                      ID
                      <div className="flexColumn table__sort">
                        <ArrowUnion
                          sortColumn={sortColumn}
                          colorArrowOne={
                            sortColumn.column === 'id' &&
                            sortColumn.order === 'descent'
                              ? 'black'
                              : 'gray'
                          }
                          colorArrowTwo={
                            sortColumn.column === 'id' &&
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
                accessor: 'id',
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
                  <div className="table__header fontSmall">
                    <div
                      className="pointer flex "
                      onClick={() => {
                        this.setSortColumnVariables('description');
                      }}
                    >
                      DESCRIPTION
                      <div className="flexColumn table__sort">
                        <ArrowUnion
                          sortColumn={sortColumn}
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
                  <div className="table__header fontSmall">
                    <div
                      className="pointer flex "
                      onClick={() => {
                        this.setSortColumnVariables('secure');
                      }}
                    >
                      SECURE
                      <div className="flexColumn table__sort">
                        <ArrowUnion
                          sortColumn={sortColumn}
                          colorArrowOne={
                            sortColumn.column === 'secure' &&
                            sortColumn.order === 'descent'
                              ? 'black'
                              : 'gray'
                          }
                          colorArrowTwo={
                            sortColumn.column === 'secure' &&
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
                accessor: 'secure',
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
                  <div className="table__header fontSmall">
                    <div
                      className="pointer flex "
                      onClick={() => {
                        this.setSortColumnVariables('value');
                      }}
                    >
                      VALUE
                      <div className="flexColumn table__sort">
                        <ArrowUnion
                          sortColumn={sortColumn}
                          colorArrowOne={
                            sortColumn.column === 'value' &&
                            sortColumn.order === 'descent'
                              ? 'black'
                              : 'gray'
                          }
                          colorArrowTwo={
                            sortColumn.column === 'value' &&
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
                accessor: 'value',
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
                      className="pointer flex "
                      onClick={() => {
                        this.setSortColumnVariables('tags');
                      }}
                    >
                      TAGS
                      <div className="flexColumn table__sort">
                        <ArrowUnion
                          sortColumn={sortColumn}
                          colorArrowOne={
                            sortColumn.column === 'tags' &&
                            sortColumn.order === 'descent'
                              ? 'black'
                              : 'gray'
                          }
                          colorArrowTwo={
                            sortColumn.column === 'tags' &&
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
                accessor: 'tags',
                className:
                  'table__cell fontNormal flex flexCenterVertical h100 w100I',
                sortable: false,
                Cell: props => (
                  <div className="h100 flex flexCenterVertical ">
                    {props.value ? props.value : '-----'}
                  </div>
                )
              }
            ]}
          />
        </div>
      );
    } else {
      return <div style={{ height: '500px' }} />;
    }
  }

  /**
   * Method to render assertions
   *
   * @return {*}
   * @memberof ModalSynthetics
   */
  renderAssertions() {
    const {
      savingAllChecks,
      pagePag,
      totalRows,
      sortColumn,
      dataAssertions
    } = this.state;
    if (dataAssertions.length >= 1) {
      return (
        <div style={{ height: '500px', width: '1312px' }}>
          <ReactTable
            loading={savingAllChecks}
            loadingText="Processing..."
            page={pagePag}
            showPagination={false}
            resizable={false}
            data={dataAssertions}
            defaultPageSize={totalRows}
            getTrProps={(state, rowInfo) => {
              // eslint-disable-next-line no-lone-blocks
              {
                if (rowInfo) {
                  return {
                    style: {
                      background: rowInfo.index % 2 ? '#F7F7F8' : 'white',
                      borderBottom: 'none',
                      display: 'grid',
                      gridTemplate:
                        '1fr / 16% repeat(3, 14.33%) 8% 9% repeat(3, 8%)'
                    }
                  };
                } else {
                  return {
                    style: {
                      borderBottom: 'none',
                      display: 'grid',
                      gridTemplate:
                        '1fr / 16% repeat(3, 14.33%) 8% 9% repeat(3, 8%)'
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
                  gridTemplate:
                    '1fr / 16% repeat(3, 14.33%) 8% 9% repeat(3, 8%)'
                }
              };
            }}
            columns={[
              {
                Header: () => (
                  <div className="darkLine table__headerSticky fontSmall">
                    <div
                      className="pointer flex "
                      style={{ marginLeft: '15px' }}
                      onClick={() => {
                        this.sortDataAssertions('value');
                      }}
                    >
                      VALUE
                      <div className="flexColumn table__sort">
                        <ArrowUnion
                          sortColumn={sortColumn}
                          colorArrowOne={
                            sortColumn.column === 'value' &&
                            sortColumn.order === 'descent'
                              ? 'black'
                              : 'gray'
                          }
                          colorArrowTwo={
                            sortColumn.column === 'value' &&
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
                className: ' stycky table__cellSticky fontNormal h100 w100I',
                accessor: 'value',
                sortable: false,
                Cell: props => {
                  return (
                    <div
                      className="darkLine h100 flex flexCenterVertical"
                      style={{
                        background: props.index % 2 ? '#F7F7F8' : 'white'
                      }}
                    >
                      <span style={{ marginLeft: '15px' }}>
                        {`  ${props.value}`}
                      </span>
                    </div>
                  );
                }
              }
            ]}
          />
        </div>
      );
    } else {
      return <div style={{ height: '500px' }} />;
    }
  }

  /**
   * Method to render steps
   *
   * @return {*}
   * @memberof ModalSynthetics
   */
  renderSteps() {
    const {
      savingAllChecks,
      pagePag,
      totalRows,
      sortColumn,
      dataSteps
    } = this.state;
    if (dataSteps.length >= 1) {
      return (
        <div style={{ height: '500px' }}>
          <ReactTable
            loading={savingAllChecks}
            loadingText="Processing..."
            page={pagePag}
            showPagination={false}
            resizable={false}
            data={dataSteps}
            defaultPageSize={totalRows}
            getTrProps={(state, rowInfo) => {
              // eslint-disable-next-line no-lone-blocks
              {
                if (rowInfo) {
                  return {
                    style: {
                      background: rowInfo.index % 2 ? '#F7F7F8' : 'white',
                      borderBottom: 'none',
                      display: 'grid',
                      gridTemplate: '1fr / 30% 70%'
                    }
                  };
                } else {
                  return {
                    style: {
                      borderBottom: 'none',
                      display: 'grid',
                      gridTemplate: '1fr / 30% 70%'
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
                  gridTemplate: '1fr / 30% 70%'
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
                        this.setSortColumnSteps('params');
                      }}
                    >
                      PARAMETERS
                      <div className="flexColumn table__sort">
                        <ArrowUnion
                          sortColumn={sortColumn}
                          colorArrowOne={
                            sortColumn.column === 'params' &&
                            sortColumn.order === 'descent'
                              ? 'black'
                              : 'gray'
                          }
                          colorArrowTwo={
                            sortColumn.column === 'params' &&
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
                className: ' stycky table__cellSticky fontNormal h100 w100I',
                accessor: 'params',
                sortable: false,
                Cell: props => {
                  return (
                    <div
                      className="h100 flex flexCenterVertical"
                      style={{
                        background: props.index % 2 ? '#F7F7F8' : 'white'
                      }}
                    >
                      <span
                        style={{ marginLeft: '15px' }}
                      >{`${props.value}`}</span>
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
                      className="pointer flex "
                      onClick={() => {
                        this.setSortColumnSteps('type');
                      }}
                    >
                      TYPE
                      <div className="flexColumn table__sort">
                        <ArrowUnion
                          sortColumn={sortColumn}
                          colorArrowOne={
                            sortColumn.column === 'type' &&
                            sortColumn.order === 'descent'
                              ? 'black'
                              : 'gray'
                          }
                          colorArrowTwo={
                            sortColumn.column === 'type' &&
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
                accessor: 'type',
                className:
                  'table__cell fontNormal flex flexCenterVertical h100 w100I',
                sortable: false,
                Cell: props => (
                  <div
                    className="h100 flex flexCenterVertical "
                    style={{ marginLeft: '15px' }}
                  >
                    {props.value ? props.value : '-----'}
                  </div>
                )
              }
            ]}
          />
        </div>
      );
    } else {
      return <div style={{ height: '500px' }} />;
    }
  }

  render() {
    const { infoAditional = {}, hidden, _onClose } = this.props;
    const { timeRanges, rangeSelected, selectedOption } = this.state;
    return (
      <div className="h100">
        <Modal
          show={hidden}
          bsSize="large"
          dialogClassName="w70"
          onHide={() => _onClose}
          aria-labelledby="contained-modal-title-vcenter"
        >
          <Modal.Body>
            <Modal.Header>
              <div className="modalWidgets__closeIconSynthetics">
                <div className="infoAditional--title">
                  {`${infoAditional.name}`}
                </div>
                <div
                  style={{
                    minWidth: '150px',
                    maxWidth: '200px',
                    paddingRight: '5px'
                  }}
                >
                  {timeRanges.length >= 1 ? (
                    <Select
                      classNamePrefix="react-select"
                      isSearchable={false}
                      options={timeRanges}
                      onChange={this.handleRange}
                      value={rangeSelected}
                      placeholder="All"
                    />
                  ) : (
                    <div />
                  )}
                </div>
                {rangeSelected.value === 'Configuration' ? (
                  this.renderRadioButton()
                ) : (
                  <div />
                )}
                <div
                  className="flex"
                  style={{
                    justifyContent: 'space-between'
                  }}
                >
                  <div>&nbsp;</div>
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
            </Modal.Header>
            <div>
              <div className="tableContent__table">
                {rangeSelected.value === 'Steps' ? this.renderSteps() : <div />}
                {rangeSelected.value === 'Configuration' ? (
                  selectedOption === 'REQUEST' ? (
                    this.renderRequest()
                  ) : selectedOption === 'VARIABLES' ? (
                    this.renderVariables()
                  ) : selectedOption === 'ASSERTIONS' ? (
                    this.renderAssertions()
                  ) : (
                    <div />
                  )
                ) : (
                  <div />
                )}
              </div>
            </div>
          </Modal.Body>
        </Modal>
      </div>
    );
  }
}

ModalSynthetics.propTypes = {
  infoAditional: PropTypes.object.isRequired,
  hidden: PropTypes.bool.isRequired,
  _onClose: PropTypes.func.isRequired
};
