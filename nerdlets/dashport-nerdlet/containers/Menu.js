import React from 'react';
import PropTypes from 'prop-types';
import { Link, Tooltip } from 'nr1';
import Select from 'react-select';
import { BLACK_COLOR, BLUE_COLOR, GREY_COLOR } from '../constants/Colors';
import ModalSupport from '../components/ModalSupport/ModalSupport';
import logo from '../images/wigilabs.svg';
import alertsIcon from '../images/alerts.svg';
import alertsIconA from '../images/alertsA.svg';
import ddDashboards from '../images/ddDashboards.svg';
import ddDashboardsA from '../images/ddDashboardsA.svg';
import setupIcon from '../images/setup.svg';
import setupIconA from '../images/setupA.svg';
import dataIcon from "../images/data.svg";
import dataIconA from "../images/dataA.svg";
import accountsIcon from '../images/accounts.svg';
import accountsIconA from '../images/accountsA.svg';
import infrastructureIcon from '../images/infrastructure.svg';
import infrastructureIconA from '../images/infrastructureA.svg';
import logsIcon from '../images/logs.svg';
import logsIconA from '../images/logsA.svg';
import metricsIcon from '../images/metrics.svg';
import metricsIconA from '../images/metricsA.svg';
import migrationIcon from '../images/migration.svg';
import migrationIconA from '../images/migrationA.svg';
import statusIcon from '../images/status.svg';
import statusIconA from '../images/statusA.svg';
import syntheticsIcon from '../images/synthetics.svg';
import syntheticsIconA from '../images/syntheticsA.svg';

class Menu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hiddenModal: true,
      selectedFilter: 'Datadog',
      availableFilters: [{ value: 'Datadog', label: 'Datadog' }]
    };
  }

  /**
   * Method that open or close the contact modal
   *
   * @memberof Menu
   */
  onCloseSupport() {
    const { hiddenModal } = this.state;
    this.setState({ hiddenModal: !hiddenModal });
  }

  /**
   *Custom stiles of select component
   * @memberof Metrics
   */
  customStyles = {
    container: styles => {
      return {
        ...styles,
        borderBottom: '0.5px solid #adadad',
        padding: '1%'
      };
    },
    control: () => {
      return {
        alignItems: 'center',
        backgroundColor: 'hsl(0, 0%, 100%)',
        boxShadow: null,
        boxSizing: 'border-box',
        cursor: 'pointer',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        label: 'control',
        height: '10%',
        fontSize: '.7vw',
        outline: '0 !important',
        position: 'relative',
        transition: 'all 100ms'
      };
    },
    singleValue: (provided, state) => {
      const opacity = state.isDisabled ? 0.5 : 1;
      const transition = 'opacity 300ms';
      const marginLeft = '35px';
      const fontSize = '.7vw';
      const fontFamily = 'Open Sans';
      return {
        ...provided,
        opacity,
        transition,
        marginLeft,
        fontFamily,
        fontSize
      };
    },
    menuList: provided => ({
      ...provided,
      textTransform: 'capitalize',
      fontSize: '.7vw'
    }),
    menu: provided => ({
      ...provided,
      textTransform: 'capitalize',
      fontSize: '.7vw'
    }),
    option: () => {
      return {
        fontSize: '.7vw',
        background: '#0078BF',
        WebkitTapHighlightColor: 'rgba(0, 0, 0, 0)',
        backgroundColor: '#0078BF',
        boxSizing: 'border-box',
        color: 'hsl(0, 0%, 100%)',
        cursor: 'pointer',
        display: 'block',
        label: 'option',
        padding: '8px 12px',
        userSelect: 'none',
        width: '100%'
      };
    },
    indicatorSeparator: () => {
      return {
        alignSelf: 'stretch',
        backgroundColor: '',
        boxSizing: 'border-box',
        label: '',
        marginBottom: 8,
        marginTop: 8,
        width: 1
      };
    },
    valueContainer: () => {
      return {
        WebkitOverflowScrolling: 'touch',
        alignItems: 'center',
        boxSizing: 'border-box',
        display: 'flex',
        flex: 1,
        flexWrap: 'wrap',
        overflow: 'hidden',
        padding: '2px 8px',
        position: 'relative'
      };
    }
  };

  /**
   *Method that capture filter change of component select
   *
   * @memberof Metrics
   */
  handleChangeFilter = value => {
    const { handleChangeMenu } = this.props;
    if (value.value === 'Add new') {
      handleChangeMenu(0);
      this.setState({ selectedFilter: value.value });
    } else {
      this.setState({ selectedFilter: value.value });
    }
  };

  render() {
    const { hiddenModal, availableFilters, selectedFilter } = this.state;
    const { selectedMenu, handleChangeMenu, lastUpdate } = this.props;
    return (
      <div className="marginMenu">
        <div>
          <li
            className="sidebar-list-divider"
            key={0}
            onClick={() => {
              handleChangeMenu(0);
            }}
          >
            <div className="divMenuLateral">
              <img
                width="15px"
                height="15px"
                src={selectedMenu === 0 ? setupIconA : setupIcon}
                fill={selectedMenu === 0 ? BLACK_COLOR : GREY_COLOR}
              />
              <div
                className="menuText"
                style={{ color: selectedMenu === 0 ? BLACK_COLOR : GREY_COLOR }}
              >
                Setup
              </div>
            </div>
          </li>
          {lastUpdate !== '' && lastUpdate !== 'never' &&
            <>
              <li
                className="sidebar-list-item"
                key={1}
                onClick={() => {
                  handleChangeMenu(1);
                }}
              >
                <div className="divMenuLateral">
                  <div
                    className="menuText"
                    style={{ color: selectedMenu !== 0 ? BLACK_COLOR : GREY_COLOR }}
                  >
                    Datadog
              </div>
                </div>
              </li>
              <li
                className="sidebar-list-item"
                key={2}
                onClick={() => {
                  handleChangeMenu(2);
                }}
              >
                <div className="divMenuLateral">
                  <img
                    width="15px"
                    height="15px"
                    src={selectedMenu === 2 ? ddDashboardsA : ddDashboards}
                    fill={selectedMenu === 2 ? BLACK_COLOR : GREY_COLOR}
                  />
                  <div
                    className="menuText"
                    style={{
                      color: selectedMenu === 2 ? BLACK_COLOR : GREY_COLOR
                    }}
                  >
                    Dashboards
                </div>
                </div>
              </li>
              <li
                className="sidebar-list-item"
                key={3}
                onClick={() => {
                  handleChangeMenu(3);
                }}
              >
                <div className="divMenuLateral">
                  <img
                    width="15px"
                    height="15px"
                    src={selectedMenu === 3 ? alertsIconA : alertsIcon}
                    fill={selectedMenu === 3 ? BLACK_COLOR : GREY_COLOR}
                  />
                  <div
                    className="menuText"
                    style={{
                      color: selectedMenu === 3 ? BLACK_COLOR : GREY_COLOR
                    }}
                  >
                    Alerts
          </div>
                </div>
              </li>
              <li
                className="sidebar-list-item"
                key={4}
                onClick={() => {
                  handleChangeMenu(4);
                }}
              >
                <div className="divMenuLateral">
                  <img
                    width="15px"
                    height="15px"
                    src={
                      selectedMenu === 4
                        ? infrastructureIconA
                        : infrastructureIcon
                    }
                    fill={selectedMenu === 4 ? BLACK_COLOR : GREY_COLOR}
                  />
                  <div
                    className="menuText"
                    style={{
                      color: selectedMenu === 4 ? BLACK_COLOR : GREY_COLOR
                    }}
                  >
                    Infrastructure
          </div>
                </div>
              </li>
              <li
                className="sidebar-list-item"
                key={5}
                onClick={() => {
                  handleChangeMenu(5);
                }}
              >
                <div className="divMenuLateral">
                  <img
                    width="15px"
                    height="15px"
                    src={selectedMenu === 5 ? logsIconA : logsIcon}
                    fill={selectedMenu === 5 ? BLACK_COLOR : GREY_COLOR}
                  />
                  <div
                    className="menuText"
                    style={{
                      color: selectedMenu === 5 ? BLACK_COLOR : GREY_COLOR
                    }}
                  >
                    Logs
          </div>
                </div>
              </li>
              <li
                className="sidebar-list-item"
                key={6}
                onClick={() => {
                  handleChangeMenu(6);
                }}
              >
                <div className="divMenuLateral">
                  <img
                    width="15px"
                    height="15px"
                    src={selectedMenu === 6 ? metricsIconA : metricsIcon}
                    fill={selectedMenu === 6 ? BLACK_COLOR : GREY_COLOR}
                  />
                  <div
                    className="menuText"
                    style={{
                      color: selectedMenu === 6 ? BLACK_COLOR : GREY_COLOR
                    }}
                  >
                    Metrics
          </div>
                </div>
              </li>
              <li
                className="sidebar-list-item"
                key={7}
                onClick={() => {
                  handleChangeMenu(7);
                }}
              >
                <div className="divMenuLateral">
                  <img
                    width="15px"
                    height="15px"
                    src={
                      selectedMenu === 7 ? syntheticsIconA : syntheticsIcon
                    }
                    fill={selectedMenu === 7 ? BLACK_COLOR : GREY_COLOR}
                  />
                  <div
                    className="menuText"
                    style={{
                      color: selectedMenu === 7 ? BLACK_COLOR : GREY_COLOR
                    }}
                  >
                    Synthetics
          </div>
                </div>
              </li>
              <li
                className="sidebar-list-item"
                key={8}
                onClick={() => {
                  handleChangeMenu(8);
                }}
              >
                <div className="divMenuLateral">
                  <img
                    width="15px"
                    height="15px"
                    src={selectedMenu === 8 ? accountsIconA : accountsIcon}
                    fill={selectedMenu === 8 ? BLACK_COLOR : GREY_COLOR}
                  />
                  <div
                    className="menuText"
                    style={{
                      color: selectedMenu === 8 ? BLACK_COLOR : GREY_COLOR
                    }}
                  >
                    Accounts
          </div>
                </div>
              </li>
              {/* <li
                className="sidebar-list-item"
                key={9}
                onClick={() => {
                  handleChangeMenu(9);
                }}
              >
                <div
                  style={{
                    marginLeft: '15%',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <img
                    width="15px"
                    height="15px"
                    src={
                      selectedMenu === 9 ? migrationIconA : migrationIcon
                    }
                    fill={selectedMenu === 9 ? BLACK_COLOR : GREY_COLOR}
                  />
                  <div
                    className="menuText"
                    style={{
                      color: selectedMenu === 9 ? BLACK_COLOR : GREY_COLOR
                    }}
                  >
                    Migration
            </div>
                </div>

              </li> */}
              {/* <li
                className="sidebar-list-item"
                key={10}
                onClick={() => {
                  handleChangeMenu(10);
                }}
              >
                <div
                  style={{
                    marginLeft: '15%',
                    display: 'flex',
                    alignItems: 'center',
                    width: '80%'
                  }}
                >
                  <img
                    width="15px"
                    height="15px"
                    src={selectedMenu === 10 ? statusIconA : statusIcon}
                    fill={selectedMenu === 10 ? BLACK_COLOR : GREY_COLOR}
                  />
                  <div
                    className="menuText"
                    style={{
                      color: selectedMenu === 10 ? BLACK_COLOR : GREY_COLOR
                    }}
                  >
                    Status
            </div>
                </div>
              </li> */}
            </>
          }
        </div>
        <div className="mainMenu__support">
          <div style={{ marginBottom: '10px' }}>
            <li key={11}>
              <Link
                onClick={() => {
                  this.onCloseSupport();
                }}
              >
                Support
              </Link>
            </li>
            <ModalSupport
              close={() => {
                this.onCloseSupport();
              }}
              hidden={hiddenModal}
            />
          </div>
          <div className="logoWigi">
            <img width="125px" height="35px" src={logo} />
          </div>
        </div>
      </div>
    );
  }
}
Menu.propTypes = {
  selectedMenu: PropTypes.number.isRequired,
  handleChangeMenu: PropTypes.func.isRequired,
  lastUpdate: PropTypes.string.isRequired
};

export default Menu;
