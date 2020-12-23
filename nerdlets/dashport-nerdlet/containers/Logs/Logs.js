import React from 'react';
import PropTypes from 'prop-types';

export default class Logs extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { logsTotal } = this.props;
    return (
      <div className="mainLogs">
        <div className="mainLogs__filtersOptions">
          <div className="filterOptions__boxLogs">
            <span
              className="boxLogs--title"
              style={{
                color: "#007E8A"
              }}>
              Indexes
            </span>
            <span
              className="boxLogs--quantity"
              style={{
                color: "#007E8A"
              }}>
              {logsTotal.indexes}
            </span>
          </div>
          <div className="filterOptions__boxLogs">
            <span
              className="boxLogs--title"
              style={{
                color: "#007E8A"
              }}>
              Pipelines
            </span>
            <span
              className="boxDashboards--quantity"
              style={{
                color: "#007E8A"
              }}>
              {logsTotal.pipelines}
            </span>
          </div>
        </div>
      </div>
    );
  }
}
Logs.propTypes = {
  logsTotal: PropTypes.object.isRequired
};
