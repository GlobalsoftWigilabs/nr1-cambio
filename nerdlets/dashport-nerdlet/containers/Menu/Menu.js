import React from 'react';

import PropTypes from 'prop-types';

import { Link } from 'nr1';

import ModalSupport from '../../components/ModalSupport/ModalSupport';

import logo from '../../images/wigilabs.svg';
import setupIcon from '../../images/setup.svg';
import setupIconA from '../../images/setupA.svg';
import ddDashboards from '../../images/ddDashboards.svg';
import ddDashboardsA from '../../images/ddDashboardsA.svg';
import alertsIcon from '../../images/alerts.svg';
import alertsIconA from '../../images/alertsA.svg';
import infrastructureIcon from '../../images/infrastructure.svg';
import infrastructureIconA from '../../images/infrastructureA.svg';
import logsIcon from '../../images/logs.svg';
import logsIconA from '../../images/logsA.svg';
import metricsIcon from '../../images/metrics.svg';
import metricsIconA from '../../images/metricsA.svg';
import syntheticsIcon from '../../images/synthetics.svg';
import syntheticsIconA from '../../images/syntheticsA.svg';
import accountsIcon from '../../images/accounts.svg';
import accountsIconA from '../../images/accountsA.svg';

const ACTIVE_COLOR = '#007E8A';
const INACTIVE_COLOR = '#767B7F';

const ItemDivider = props => {
  const {
    identifier,
    handleChangeMenu,
    selectedMenu,
    text,
    iconActive,
    iconInactive
  } = props;
  return (
    <div
      className="mainMenu__itemDivider fontSmall"
      key={identifier}
      onClick={() => {
        handleChangeMenu(identifier);
      }}
    >
      <div className="itemDivider__content">
        <img
          width="15px"
          height="15px"
          src={selectedMenu === 0 ? iconActive : iconInactive}
        />
        <div
          className="content--text fontSmall"
          style={{
            color: selectedMenu === 0 ? '#000' : INACTIVE_COLOR,
            fontWeight: selectedMenu === 0 ? '600' : 'normal'
          }}
        >
          {text}
        </div>
      </div>
    </div>
  );
};

const Item = props => {
  const {
    identifier,
    handleChangeMenu,
    selectedMenu,
    text,
    iconActive,
    iconInactive
  } = props;
  return (
    <div
      className="mainMenu__item fontSmall"
      key={identifier}
      onClick={() => {
        handleChangeMenu(identifier);
      }}
    >
      <div className="itemDivider__content">
        <img
          width="15px"
          height="15px"
          src={selectedMenu === identifier ? iconActive : iconInactive}
        />
        <div
          className="content--text fontSmall"
          style={{
            color: selectedMenu === identifier ? ACTIVE_COLOR : INACTIVE_COLOR,
            fontWeight: selectedMenu === identifier ? '600' : 'normal'
          }}
        >
          {text}
        </div>
      </div>
    </div>
  );
};

class Menu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hiddenModal: true
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

  render() {
    const { hiddenModal } = this.state;
    const { selectedMenu, handleChangeMenu, lastUpdate } = this.props;
    return (
      <div className="mainMenu">
        <div>
          <ItemDivider
            identifier={0}
            handleChangeMenu={handleChangeMenu}
            selectedMenu={selectedMenu} 
            text="Setup"
            iconActive={setupIconA}
            iconInactive={setupIcon}
          />
          {lastUpdate !== '' && lastUpdate !== 'never' && (
            <>
              <div className="mainMenu__item fontSmall" key={1}>
                <div className="itemDivider__content">
                  <div
                    className="content--text fontSmall"
                    style={{
                      color: selectedMenu !== 0 ? '#000' : INACTIVE_COLOR,
                      fontWeight: selectedMenu !== 0 ? '600' : 'normal'
                    }}
                  >
                    Datadog
                  </div>
                </div>
              </div>
              <Item
                identifier={2}
                handleChangeMenu={handleChangeMenu}
                selectedMenu={selectedMenu}
                text="Dashboards"
                iconActive={ddDashboardsA}
                iconInactive={ddDashboards}
              />
              <Item
                identifier={3}
                handleChangeMenu={handleChangeMenu}
                selectedMenu={selectedMenu}
                text="Alerts"
                iconActive={alertsIconA}
                iconInactive={alertsIcon}
              />
              <Item
                identifier={4}
                handleChangeMenu={handleChangeMenu}
                selectedMenu={selectedMenu}
                text="Infrastructure"
                iconActive={infrastructureIconA}
                iconInactive={infrastructureIcon}
              />
              <Item
                identifier={5}
                handleChangeMenu={handleChangeMenu}
                selectedMenu={selectedMenu}
                text="Logs"
                iconActive={logsIconA}
                iconInactive={logsIcon}
              />
              <Item
                identifier={6}
                handleChangeMenu={handleChangeMenu}
                selectedMenu={selectedMenu}
                text="Metrics"
                iconActive={metricsIconA}
                iconInactive={metricsIcon}
              />
              <Item
                identifier={7}
                handleChangeMenu={handleChangeMenu}
                selectedMenu={selectedMenu}
                text="Synthetics"
                iconActive={syntheticsIconA}
                iconInactive={syntheticsIcon}
              />
            </>
          )}
        </div>
        <div className="mainMenu__support fontSmall">
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
          <div className="support__logoWigi">
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
