import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { BarChart, Bar, ResponsiveContainer, XAxis } from 'recharts';
import ReactTable from 'react-table-v6';
import Select from 'react-select';
import SearchInput, { createFilter } from 'react-search-input';
import { BsSearch } from 'react-icons/bs';

/**
 * Constants of colours
 */
const blueColor = '#0078bf';
const greyNoneColor = '#ECEEEE';
const KEYS_TO_FILTERS = ['classification', 'type', 'name']

/**
 * Class for render X axis from graph
 * @class CustomizedAxisTick
 * @extends {PureComponent}
 */
class CustomizedAxisTick extends PureComponent {
  render() {
    const { x, y, payload } = this.props;

    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={10}
          y={0}
          dy={5}
          textAnchor="end"
          className="numberGraph"
          fill="#666"
        >
          {payload.value}
        </text>
      </g>
    );
  }
}

CustomizedAxisTick.propTypes = {
  x: PropTypes.number,
  y: PropTypes.number,
  payload: PropTypes.object
};

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
      availableFilterTags: [{ value: 'All', label: 'All' }]
    };
  }

  componentWillMount() {
    this.loadFilters();
    this.loadFilterTags();
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

  loadFilterTags() {
    const { monitorsData } = this.props;
    const filterTags = [{ value: 'All', label: 'All' }];
    for (const item of monitorsData) {
      const length = item.tags.length;
      for (let i = 0; i < length; i++) {
        const category = item.tags[i];
        if (!filterTags.some(element => element.value === category)) {
          filterTags.push({ value: category, label: category });
        }
      }
    }
    this.setState({ availableFilterTags: filterTags });
  }
  /**
   *Method that capture filter change of component select
   *
   * @memberof Metrics
   */
  handleChangeFilter = value => {
    this.setState({ selectedFilter: value.value });
  };
  handleChangeTag = value => {
    this.setState({ selectedTag: value.value });
  };
  /**
   *Method that filter for catalago from select  component
   * @memberof Metrics
   */
  filterCateg = value => {
    const { selectedFilter } = this.state;
    if (value.classification === selectedFilter) {
      return value;
    }
  };

  filterTags = value => {
    const { selectedTag } = this.state;
    const length = value.tags.length;
    for (let i = 0; i < length; i++) {
      if (value.tags[i] === selectedTag) {
        console.log("VALUE");
        console.log(value);
        console.log("VALUE");
        return value;
      }
    }
  };

  /**
   *Method that filter data of metrics
   * @returns
   * @memberof Metrics
   */
  mainFiler() {
    const { selectedTag, selectedFilter, searchTermMetrics } = this.state;
    const { monitorsData } = this.props;
    let filteredAlerts = [];
    if (selectedTag === 'All') {
      if (selectedFilter === 'All') {
        filteredAlerts = monitorsData.filter(createFilter(searchTermMetrics, KEYS_TO_FILTERS));
      } else {
        const categoryFilter = monitorsData.filter(this.filterCateg);
        filteredAlerts = categoryFilter.filter(createFilter(searchTermMetrics, KEYS_TO_FILTERS));
      }
    }
    if (selectedFilter === 'All') {
      if (selectedTag === 'All') {
        filteredAlerts = monitorsData.filter(createFilter(searchTermMetrics, KEYS_TO_FILTERS));
      } else {
        const TagFilter = monitorsData.filter(this.filterTags);
        filteredAlerts = TagFilter.filter(createFilter(searchTermMetrics, KEYS_TO_FILTERS));
      }
    }
    console.log("--------------------------------");
    console.log(filteredAlerts);
    console.log("--------------------------------");
    return filteredAlerts;
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
      width: "226px"
    })
  };

  setNotifications(items) {
    let result = '';
    for (let index = 0; index < items.length; index++) {
      const element = items[index];
      if (index === 0) {
        result = result.concat(element.name);
      } else {
        result = result.concat(`, ${element.name}`);
      }
    }
    return result;
  }

  setMetrics(items) {
    let result = '';
    for (let index = 0; index < items.length; index++) {
      const element = items[index];
      if (index === 0) {
        result = result.concat(element);
      } else {
        result = result.concat(`, ${element}`);
      }
    }
    return result;
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

  render() {
    const { alertsTotal, alertsData, monitorsData } = this.props;
    const { availableFilters } = this.state;
    const { availableFilterTags } = this.state;
    const filteredAlerts = this.mainFiler();
    return (
      <div className="mainAlerts">
        <div className="containFilterAndGraphs">
          <div className="flex">
            <div className="boxMonitors">
              <div className="alertsTotal">
                <div className="alertTitle">Alerts</div>
                <div className="alertContent">
                  <div className="numberTotalAlerts">{alertsTotal}</div>
                </div>
              </div>
            </div>
            <div className="contentAlerts">
              <div className="alertTitle">Alerts by type</div>
              <div className="chartAlertsGraph">
                {alertsData.map((alertData, index) => (
                  <div key={index} className="w100">
                    <div className="flex" style={{ maxWidth: "12vw" }}>
                      <span className="graphsBar--complexityQuantity">{uv}</span>
                      <ResponsiveContainer width="99%" height={70}>
                        <BarChart
                          key={alertData.uv}
                          data={[alertData]}
                          margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5
                          }}
                        >
                          <XAxis
                            orientation="top"
                            tick={<CustomizedAxisTick />}
                            axisLine={false}
                            tickLine={false}
                            dataKey="uv"
                          />
                          <Bar
                            dataKey="uv"
                            stackId="a"
                            barSize={35}
                            fill={blueColor}
                          />
                          <Bar
                            dataKey="pv"
                            stackId="a"
                            barSize={35}
                            fill={greyNoneColor}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", marginLeft: "3%" }}>
            <Select
              classNamePrefix="react-select"
              styles={this.customStyles}
              isSearchable={false}
              defaultValue={{ value: 'types', label: 'Type Alerts' }}
              onChange={this.handleChangeFilter}
              options={availableFilters}
            />
            <Select
              className="containFilterTags"
              classNamePrefix="react-select"
              styles={this.customStyles}
              isSearchable={false}
              defaultValue={{ value: 'types', label: 'Tags' }}
              onChange={this.handleChangeTag}
              options={availableFilterTags}
            />
            <div className="containSearchAlert">
              <div className="searchAlert">
                <div className="divSearch">
                  <BsSearch size="10px" color={"#767B7F"} />
                  <SearchInput
                    className="searchInput"
                    onChange={this.searchUpdated}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="tableAlerts" style={{ width: "700px" }}>
          <ReactTable
            pageSize={filteredAlerts.length}
            showPagination={false}
            resizable={false}
            data={filteredAlerts}
            getTrProps={(state, rowInfo) => {
              return {
                style: {
                  background: rowInfo.index % 2 ? '#F7F7F8' : 'white',
                  borderBottom: 'none',
                  display: 'grid',
                  gridTemplate: '1fr/ 20% 60% 20%'
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
                  paddingTop: '15px',
                  height: '44px',
                  color: '#333333',
                  fontWeight: 'bold',
                  display: 'grid',
                  gridTemplate: '1fr/ 20% 60% 20%'
                }
              };
            }}
            columns={[
              {
                headerStyle: {
                  marginLeft: "15px"
                },
                headerClassName: 'headerAlerts',
                className: 'itemAlerts',
                Header: 'Classification',
                accessor: 'classification',
                sortable: false,
                Cell: props => <div className="textTblClassification">{props.value}</div>
              },
              {
                headerStyle: {
                  background: '#F7F7F8',
                  width: '100%',
                  color: '#333333',
                  fontWeight: 'bold',
                  paddingLeft: '15px',
                  backgroundColor: '#F7F7F8',
                  display: 'flex',
                  justifyContent: "center",
                  fontSize: '14px'
                },
                headerClassName: 'headerCompatibility headerAlerts',
                className: 'itemAlerts',
                Header: 'Name',
                accessor: 'name',
                sortable: false,
                Cell: props => <div className="textTblName headerCompatibility">{props.value}</div>
              },
              {
                headerClassName: 'headerAlerts',
                className: 'itemAlerts',
                Header: 'Type',
                accessor: 'type',
                sortable: false,
                Cell: props => <div className="txtTblType">{props.value}</div>
              }
            ]}
          />
        </div>
      </div>
    );
  }
}

Alerts.propTypes = {
  alertsTotal: PropTypes.number.isRequired,
  alertsData: PropTypes.array.isRequired,
  monitorsData: PropTypes.array.isRequired
};
