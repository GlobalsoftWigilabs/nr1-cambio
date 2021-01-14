import React from 'react';

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

import { BLACK_COLOR, BLUE_COLOR, GREY_COLOR } from '../../constants/Colors';

const ItemDivider = () => {
  const {
    key,
    handleChangeMenu,
    selectedMenu,
    text,
    iconActive,
    iconInactive
  } = props;
  return (
    <div
      className="mainMenu__itemDivider fontSmall"
      key={key}
      onClick={() => {
        handleChangeMenu(key);
      }}
    >
      <div className="itemDivider__content">
        <img
          width="15px"
          height="15px"
          src={selectedMenu === 0 ? iconActive : iconInactive}
          fill={selectedMenu === 0 ? BLACK_COLOR : GREY_COLOR}
        />
        <div
          className="content--text"
          style={{ color: selectedMenu === 0 ? BLACK_COLOR : GREY_COLOR }}
        >
          {text}
        </div>
      </div>
    </div>
  );
};

const Item = () => {
  const {
    key,
    handleChangeMenu,
    selectedMenu,
    text,
    iconActive,
    iconInactive
  } = props;
  return (
    <li
      className="mainMenu__item"
      key={key}
      onClick={() => {
        handleChangeMenu(key);
      }}
    >
      <div className="divMenuLateral">
        <img
          width="15px"
          height="15px"
          src={selectedMenu === 2 ? iconActive : iconInactive}
          fill={selectedMenu === 2 ? BLACK_COLOR : GREY_COLOR}
        />
        <div
          className="menuText"
          style={{
            color: selectedMenu === 2 ? BLACK_COLOR : GREY_COLOR
          }}
        >
          {text}
        </div>
      </div>
    </li>
  );
};

const Menu = props => {
  const { handleChangeMenu, selectedMenu } = props;
  return (
    <div className="mainMenu">
      <div>
        <ItemDivider
          key={0}
          handleChangeMenu={handleChangeMenu}
          selectedMenu={selectedMenu}
          text="Setup"
          iconActive={setupIconA}
          iconInactive={setupIcon}
        />
        <div
          className="mainMenu__item fontSmall"
          key={1}
          onClick={() => {
            handleChangeMenu(1);
          }}
        >
          <div className="itemDivider__content">
            <div
              className="content--text fontSmall"
              style={{ color: selectedMenu !== 0 ? BLACK_COLOR : GREY_COLOR }}
            >
              Datadog
            </div>
          </div>
        </div>
        <Item
          key={2}
          handleChangeMenu={handleChangeMenu}
          selectedMenu={selectedMenu}
          text="Dashboards"
          iconActive={ddDashboardsA}
          iconInactive={ddDashboards}
        />
        <Item
          key={3}
          handleChangeMenu={handleChangeMenu}
          selectedMenu={selectedMenu}
          text="Alerts"
          iconActive={alertsIconA}
          iconInactive={alertsIcon}
        />
        <Item
          key={4}
          handleChangeMenu={handleChangeMenu}
          selectedMenu={selectedMenu}
          text="Infraestructure"
          iconActive={infrastructureIconA}
          iconInactive={infrastructureIcon}
        />
        <Item
          key={5}
          handleChangeMenu={handleChangeMenu}
          selectedMenu={selectedMenu}
          text="Logs"
          iconActive={logsIconA}
          iconInactive={logsIcon}
        />
        <Item
          key={6}
          handleChangeMenu={handleChangeMenu}
          selectedMenu={selectedMenu}
          text="Metrics"
          iconActive={metricsIconA}
          iconInactive={metricsIcon}
        />
        <Item
          key={7}
          handleChangeMenu={handleChangeMenu}
          selectedMenu={selectedMenu}
          text="Synthetics"
          iconActive={syntheticsIconA}
          iconInactive={syntheticsIcon}
        />
        <Item
          key={8}
          handleChangeMenu={handleChangeMenu}
          selectedMenu={selectedMenu}
          text="Accounts"
          iconActive={accountsIconA}
          iconInactive={accountsIcon}
        />
      </div>
      <div>Support</div>
    </div>
  );
};

export default Menu;
