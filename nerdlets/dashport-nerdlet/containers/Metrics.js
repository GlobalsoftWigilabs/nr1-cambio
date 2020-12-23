/* eslint-disable react/no-deprecated */
import React from 'react';
import PropTypes from 'prop-types';
import SearchInput, { createFilter } from 'react-search-input';
import { BsSearch } from 'react-icons/bs';
import Select from 'react-select';

const greyColor = '#767B7F';

export default class Metrics extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchTermMetrics: '',
      selectedFilter: 'All',
      availableFilters: [{ value: 'All', label: 'All' }]
    };
    this.searchUpdated = this.searchUpdated.bind(this);
  }

  componentWillMount() {
    this.loadFilters();
  }

  /**
   * Method that render all metrics
   * @memberof Metrics
   */
  loadFilters() {
    const { metrics } = this.props;
    const filters = [{ value: 'All', label: 'All' }];
    for (const item of metrics) {
      const category = item.split('.', 1);
      if (!filters.some(element => element.value === category[0])) {
        filters.push({ value: category[0], label: category[0] });
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
    this.setState({ selectedFilter: value.value });
  };

  /**
   *Method that filter for catalago from select  component
   * @memberof Metrics
   */
  filterCateg = value => {
    const { selectedFilter } = this.state;
    const categ = value.split('.', 1);
    if (categ[0] === selectedFilter) {
      return value;
    }
  };

  /**
   *Method that filter data of metrics
   * @returns
   * @memberof Metrics
   */
  mainFiler() {
    const { selectedFilter, searchTermMetrics } = this.state;
    const { metrics } = this.props;
    let filteredMetrics = [];
    if (selectedFilter === 'All') {
      filteredMetrics = metrics.filter(createFilter(searchTermMetrics));
    } else {
      const categoryFilter = metrics.filter(this.filterCateg);
      filteredMetrics = categoryFilter.filter(createFilter(searchTermMetrics));
    }
    return filteredMetrics;
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
    })
  };

  /**
   * Method that filter therms in Metrics View
   *
   * @param {String} term Term to filter
   * @memberof DashscanV1
   */
  searchUpdated(term) {
    this.setState({ searchTermMetrics: term });
  }

  render() {
    const { availableFilters } = this.state;
    const { metricsTotal } = this.props;
    const filteredMetrics = this.mainFiler();
    return (
      <div className="divBoxLogs">
        <div className="mainBoxMetrics">
          <div className="alertTitle">Active metrics</div>
          <p>{metricsTotal}</p>
        </div>
        <div className="divMetrics">
          <div className="divFilters">
            {/* <div className="headerSelect">
              
            </div> */}
            <div className="dropDownMetric">
              <Select
                classNamePrefix="react-select"
                styles={this.customStyles}
                isSearchable={false}
                defaultValue={{ value: 'All', label: 'All' }}
                onChange={this.handleChangeFilter}
                options={availableFilters}
              />
            </div>
            <div className="searchMetric">
              <div className="divSearch">
                <BsSearch size="10px" color={greyColor} />
                <SearchInput
                  className="searchInput"
                  onChange={this.searchUpdated}
                />
              </div>
            </div>
          </div>
          <div className="mainBoxMetricsBig">
            <div className="boxContentMetric">
              <div className="contentCateg">
                {filteredMetrics.map(metric => {
                  return (
                    <div key={metric} className="textContent">
                      {metric}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
Metrics.propTypes = {
  metricsTotal: PropTypes.number.isRequired,
  metrics: PropTypes.array.isRequired
};
