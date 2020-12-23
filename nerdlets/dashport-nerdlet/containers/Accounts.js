import React from 'react';
import PropTypes from 'prop-types';
import ReactTable from 'react-table-v6';
import Select from 'react-select';
import SearchInput, { createFilter } from 'react-search-input';
import { BsSearch } from 'react-icons/bs';

const KEYS_TO_FILTERS = ['name', 'username'];

/**
 * Class that renders the Accounts component
 *
 * @export
 * @class Accounts
 * @extends {React.Component}
 */
export default class Accounts extends React.Component {
  /**
   * Creates an instance of Accounts
   * @param {*} props
   * @memberof Accounts
   */
  constructor(props) {
    super(props);
    this.state = {
      selectedFilter: 'All',
      searchTermMetrics: ''
    }
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
   *Method that capture filter change of component select
   *
   * @memberof Metrics
   */
  handleChangeFilter = value => {
    this.setState({ selectedFilter: value.value });
  };

  /**
   * Method that filter therms in Metrics View
   *
   * @param {String} term Term to filter
   * @memberof DashscanV1
   */
  searchUpdated = (term) => {
    this.setState({ searchTermMetrics: term });
  }

  /**
   *Method that filter for catalago from select  component
   * @memberof Metrics
   */
  filterCateg = value => {
    const { selectedFilter } = this.state;
    if (value.status.toLowerCase() === selectedFilter.toLowerCase()) {
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
    const { dataTableAccounts } = this.props;
    let filteredAccounts = [];
    if (selectedFilter === 'All') {
      filteredAccounts = dataTableAccounts.filter(createFilter(searchTermMetrics, KEYS_TO_FILTERS));
    } else {
      const categoryFilter = dataTableAccounts.filter(this.filterCateg);
      filteredAccounts = categoryFilter.filter(createFilter(searchTermMetrics, KEYS_TO_FILTERS));
    }
    return filteredAccounts;
  }

  render() {
    const { accountsTotal } = this.props;
    const filteredAccounts = this.mainFiler();
    return (
      <div className="divBoxLogs">
        <div className="mainBoxMetrics">
          <div className="alertTitle">User Quantity</div>
          <div className="boxContentAccount">{accountsTotal}</div>
        </div>
        <div className="containerContentAccounts">
          <div className="containerFilterAccounts">
            <Select
              classNamePrefix="react-select"
              styles={this.customStyles}
              isSearchable={false}
              defaultValue={{ value: 'All', label: 'All' }}
              onChange={this.handleChangeFilter}
              options={[
                { value: 'All', label: 'All' },
                { value: 'active', label: 'Active' },
                { value: 'disabled', label: 'Disabled' }
              ]}
            />
            <div className="searchAccounts" >
              <div className="divSearch">
                <BsSearch size="10px" color={"#767B7F"} />
                <SearchInput
                  className="searchInput"
                  onChange={this.searchUpdated}
                />
              </div>
            </div>
          </div>
          <div className="tableStyleAccount">
            <ReactTable
              pageSize={filteredAccounts.length}
              showPagination={false}
              resizable={false}
              data={filteredAccounts}
              getTrProps={(state, rowInfo) => {
                return {
                  style: {
                    background: rowInfo.index % 2 ? '#F7F7F8' : 'white',
                    borderBottom: 'none',
                    display: 'grid',
                    gridTemplate: '1fr/ 40% 40% 20%'
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
                    gridTemplate: '1fr/ 40% 40% 20%'
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
                    backgroundColor: '#F7F7F8',
                    fontSize: '14px'
                  },
                  className: 'cellDashboard headerCompatibility',
                  Header: 'EMAIL',
                  accessor: 'name',
                  sortable: false,
                  Cell: props => <div className="textTblEmail">{props.value}</div>
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
                  className: 'cellDashboard headerCompatibility',
                  Header: 'USERNAME',
                  accessor: 'username',
                  sortable: false,
                  Cell: props => <div className="textTblUsername headerCompatibility">{props.value}</div>
                },
                {
                  headerClassName: 'headerCompatibility headerAlerts',
                  className: '  cellDashboard headerCompatibility',
                  Header: 'STATUS',
                  accessor: 'status',
                  sortable: false,
                  Cell: props => <div className="textTblStatus headerCompatibility">{props.value}</div>
                }
              ]}
            />
          </div>
        </div>
      </div>
    );
  }
}

Accounts.propTypes = {
  accountsTotal: PropTypes.number.isRequired,
  dataTableAccounts: PropTypes.array.isRequired
};
