import React from 'react';
import PropTypes from 'prop-types';
import { PieChart, Pie, ResponsiveContainer, Legend, Cell } from 'recharts';
import { styleCheckedRadio, styleUnChecked } from '../components/Checkbox/Checkbox';
import SearchInput, { createFilter } from 'react-search-input';
import { BsSearch } from 'react-icons/bs';
import ReactTable from 'react-table-v6';

/**
 * Constants of colours
 */
const blueColor = '#0078BF';
const greyColor = '#BDBDBD';
const KEYS_TO_FILTERS = ['name', 'processorModel', 'memory', 'count']

/**
 * Class that render the Infrastructure component
 *
 * @export
 * @class Infrastructure
 * @extends {React.Component}
 */
export default class Infrastructure extends React.Component {
  /**
   * Creates an instance of Infrastructure.
   *
   * @param {*} props
   * @memberof Infrastructure
   */
  constructor(props) {
    super(props);
    this.state = {
      versions: [],
      checkVersionWin: false,
      checkVersionlinux: false,
      searchTermMetrics: ''
    };
  }

  /**
   * Method that populates the pieChart host
   *
   * @returns
   * @memberof Infrastructure
   */
  populatePieChart() {
    const { infrastructureData } = this.props;
    const data = [];
    let systemColor = null;
    for (const system of infrastructureData) {
      if (system.name === 'windows') {
        systemColor = blueColor;
      } else {
        systemColor = greyColor;
      }
      if (system.value !== 0) {
        data.push({
          name: system.name,
          value: system.value,
          color: systemColor
        });
      }
    }
    return data;
  }

  /**
   *Method that calculate percentage y render label
   * @returns
   * @memberof Infrastructure
   */
  renderLabelCustomize = props => {
    const RADIAN = Math.PI / 180;
    const { cx, cy, midAngle, outerRadius, percent, fill } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const mx = cx + outerRadius * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 5;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';
    return (
      <g>
        <text
          x={ex + (cos >= 0 ? 1 : -1)}
          y={ey}
          dy={2}
          textAnchor={textAnchor}
          fill={fill}
        >
          {`(${(percent * 100).toFixed(1)}%)`}
        </text>
      </g>
    );
  };

  /**
   *Method that capture click event in graphic pie
   * @memberof Infrastructure
   */
  componentDidMount() {
    const { infrastructureData } = this.props;
    let dataLinux = [];
    dataLinux = dataLinux.concat(infrastructureData[0].versions);
    for (const iterator of dataLinux) {
      iterator.so = "linux"
    }
    let dataWindows = [];
    dataWindows = dataWindows.concat(infrastructureData[1].versions);
    for (const iterator of dataWindows) {
      iterator.so = "windows";
    }
    let data = [];
    data = data.concat(dataLinux);
    data = data.concat(dataWindows);
    this.setState({ versions: data });
  };

  checkSo = (so) => {
    const { checkVersionlinux, checkVersionWin } = this.state;
    switch (so) {
      case 'linux':
        if (checkVersionlinux) {
          this.setState({ checkVersionlinux: false, checkVersionWin: false });
        } else {
          this.setState({ checkVersionlinux: true, checkVersionWin: false });
        }
        break;
      case 'windows':
        if (checkVersionWin) {
          this.setState({ checkVersionlinux: false, checkVersionWin: false });
        } else {
          this.setState({ checkVersionlinux: false, checkVersionWin: true });
        }
        break;
    }
  }

  /**
   *Method that filter for catalago from select  component
   * @memberof Metrics
   */
  filterCateg = value => {
    const { checkVersionlinux, checkVersionWin } = this.state;
    if (value.so === "linux" && checkVersionlinux) {
      return value;
    } else if (value.so === "windows" && checkVersionWin) {
      return value;
    }
  };

  /**
   *Method that filter data of metrics
   * @returns
   * @memberof Metrics
   */
  mainFiler() {
    const { checkVersionlinux, checkVersionWin, searchTermMetrics, versions } = this.state;
    let filteredHost = [];
    if (!checkVersionlinux && !checkVersionWin) {
      filteredHost = versions.filter(createFilter(searchTermMetrics, KEYS_TO_FILTERS));
    } else if (checkVersionlinux) {
      const categoryFilterlinux = versions.filter(this.filterCateg);
      filteredHost = categoryFilterlinux.filter(createFilter(searchTermMetrics, KEYS_TO_FILTERS));
    } else if (checkVersionWin) {
      const categoryFilterWin = versions.filter(this.filterCateg);
      filteredHost = categoryFilterWin.filter(createFilter(searchTermMetrics, KEYS_TO_FILTERS));
    }
    return filteredHost;
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
    const { infrastructureTotal } = this.props;
    const { checkVersionWin, checkVersionlinux } = this.state;
    const pieChartData = this.populatePieChart();
    const filteredHost = this.mainFiler();
    return (
      <div className="divBox">
        <div className="flex">
          <div className="mainBox">
            <div className="alertTitle">Total hosts</div>
            <div className="boxContent">{infrastructureTotal.totalHosts}</div>
          </div>
          <div className="mainBox">
            <div className="alertTitle">CPU's Total</div>
            <div className="boxContent">{infrastructureTotal.totalCpu}</div>
          </div>
          <div className="mainBox">
            <div className="alertTitle">Platform</div>
            <div className="BoxContent">
              <ResponsiveContainer width={180} height={180}>
                <PieChart margin={{ left: 25 }}>
                  <Pie
                    label={this.renderLabelCustomize}
                    data={pieChartData}
                    isAnimationActive={false}
                    dataKey="value"
                    outerRadius={40}
                    labelLine={false}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend iconType="square" verticalAlign="bottom" height={25} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="containFilterHost">
          <div className="containersSoRadios">
            <div className="flex">
              <input
                style={checkVersionlinux ? styleCheckedRadio : styleUnChecked}
                type="radio"
                checked={checkVersionlinux}
                onChange={() => this.checkSo("linux")}
                onClick={() => this.checkSo("linux")}
              />
              <div className="titleSo">Linux</div>
            </div>
            <div className="radioButtonWindows">
              <input
                style={checkVersionWin ? styleCheckedRadio : styleUnChecked}
                type="radio"
                checked={checkVersionWin}
                onChange={() => this.checkSo("windows")}
                onClick={() => this.checkSo("windows")}
              />
              <div className="titleSo" >Windows</div>
            </div>
          </div>
          <div className="searchHostContainer">
            <div className="searchHost">
              <div className="divSearch">
                <BsSearch size="10px" color={"#767B7F"} />
                <SearchInput
                  className="searchInput"
                  onChange={this.searchUpdated}
                />
              </div>
            </div>
          </div>
          <div className="tableHost">
            <ReactTable
              pageSize={filteredHost.length}
              showPagination={false}
              resizable={false}
              data={filteredHost}
              getTrProps={(state, rowInfo) => {
                return {
                  style: {
                    background: rowInfo.index % 2 ? '#F7F7F8' : 'white',
                    borderBottom: 'none',
                    display: 'grid',
                    gridTemplate: '1fr/ 25% 45% 15% 15% '
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
                    gridTemplate: '1fr/ 25% 45% 15% 15% '
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
                    justifyContent: "center",
                    fontSize: '14px'
                  },
                  headerClassName: 'headerCompatibility headerAlerts',
                  className: 'itemAlerts',
                  Header: 'Version',
                  accessor: 'name',
                  sortable: false,
                  Cell: props => <div className="textTblVersion headerCompatibility">{props.value}</div>
                },
                {
                  headerStyle: {
                    display: 'flex',
                    justifyContent: "center",
                  },
                  headerClassName: ' headerCompatibility headerAlerts',
                  className: 'itemAlerts',
                  Header: 'Processor',
                  accessor: 'processorModel',
                  sortable: false,
                  Cell: props => <div className="textTblProcessor headerCompatibility">{props.value}</div>
                },
                {
                  headerStyle: {
                    display: 'flex',
                    justifyContent: "center",
                  },
                  headerClassName: 'headerCompatibility headerAlerts',
                  className: 'itemAlerts',
                  Header: 'RAM',
                  accessor: 'memory',
                  sortable: false,
                  Cell: props => <div className="textTblMemory headerCompatibility">{props.value}</div>
                },
                {
                  headerStyle: {
                    display: 'flex',
                    justifyContent: "center",
                  },
                  headerClassName: 'headerCompatibility headerAlerts',
                  className: 'itemAlerts',
                  Header: 'Count',
                  accessor: 'count',
                  sortable: false,
                  Cell: props => <div className="textTblCount headerCompatibility">{props.value}</div>
                }
              ]}
            />
          </div>
        </div>
      </div>
    );
  }
}

Infrastructure.propTypes = {
  infrastructureTotal: PropTypes.object.isRequired,
  infrastructureData: PropTypes.array.isRequired
};
