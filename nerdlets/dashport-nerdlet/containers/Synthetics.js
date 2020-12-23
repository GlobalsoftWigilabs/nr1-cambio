import React from 'react';
import PropTypes from 'prop-types';
import ReactTable from 'react-table-v6';
import { FcCheckmark } from 'react-icons/fc';
import SearchInput, { createFilter } from 'react-search-input';
import { BsSearch } from 'react-icons/bs';

/**
 * Class that render the Synthetics component
 *
 * @export
 * @class Synthetics
 * @extends {React.Component}
 */
export default class Synthetics extends React.Component {
  /**
   * Creates an instance of Synthetics.
   * @param {*} props
   * @memberof Synthetics
   */
  constructor(props) {
    super(props);
    this.state = {
      searchTermMetrics: ''
    }
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

  mainFiler() {
    const { availableLocations } = this.props;
    const { searchTermMetrics } = this.state;
    let filteredLocations = [];
    filteredLocations = availableLocations.filter(createFilter(searchTermMetrics));
    return filteredLocations;
  }

  render() {
    const {
      syntheticsTotal,
      dataTableUrlService
    } = this.props;
    const filteredLocations = this.mainFiler();
    return (
      <div className="mainBoxSynthetics">
        <div className="flex">
          <div className="divBoxLogs">
            <div className="mainBoxMetrics">
              <div className="alertTitle">Total tests</div>
              <div className="boxContent">{syntheticsTotal}</div>
            </div>
          </div>
          <div className="tableStyle">
            <ReactTable
              pageSize={dataTableUrlService.length}
              showPagination={false}
              resizable={false}
              data={dataTableUrlService}
              getTrProps={(state, rowInfo) => {
                return {
                  style: {
                    background: rowInfo.index % 2 ? '#F7F7F8' : 'white',
                    borderBottom: 'none',
                    display: 'grid',
                    gridTemplate: '1fr/ 70% 15% 15% '
                  }
                };
              }}
              getTdProps={() => {
                return {
                  style: {
                    overflow: 'visible'
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
                    display: 'grid',
                    gridTemplate: '1fr/ 70% 15% 15%',
                    paddingTop: '15px',
                    paddingLeft: '2%',
                    height: '44px',
                    color: '#333333',
                    fontWeight: 'bold'
                  }
                };
              }}

              columns={[
                {
                  headerStyle: {
                    display: 'flex'
                  },
                  className: 'cellDashboard',
                  Header: 'URL',
                  accessor: 'url',
                  sortable: false,
                  Cell: props => <div className="textUrl headerCompatibility">{props.value}</div>
                },
                {
                  className: 'cellDashbord',
                  Header: 'API',
                  sortable: false,
                  accessor: 'api',
                  Cell: props => {
                    return (
                      <div
                        className="textUrl headerCompatibility"
                        style={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: "center",
                          height: "99%",
                          border: 'none'
                        }}
                      >
                        {props.value ? <FcCheckmark size="15px" /> : null}
                      </div>
                    );
                  }
                },
                {
                  className: 'cellDashbord',
                  Header: 'BROWSER',
                  sortable: false,
                  accessor: 'browser',
                  Cell: props => {
                    return (
                      <div
                        className="textUrl headerCompatibility"
                        style={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: "center",
                          height: "99%",
                          border: 'none'
                        }}
                      >
                        {props.value ? <FcCheckmark size="15px" /> : null}
                      </div>
                    );
                  }
                }
              ]}
            />
          </div>
        </div>
        <div className="divBoxSynthetics">
          <div className="containerSearchLocations">
            <div className="searchLocations">
              <div className="divSearch">
                <BsSearch size="10px" color={"#767B7F"} />
                <SearchInput
                  className="searchInput"
                  onChange={this.searchUpdated}
                />
              </div>
            </div>
            <div className="mainBoxLocations">
              <div className="alertTitle">Available Locations</div>
              <div className="contentCateg">
                {filteredLocations.map(location => {
                  return (
                    <div key={location} className="textContent">
                      {location}
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

Synthetics.propTypes = {
  syntheticsTotal: PropTypes.number.isRequired,
  availableLocations: PropTypes.array.isRequired,
  dataTableUrlService: PropTypes.array.isRequired
};
