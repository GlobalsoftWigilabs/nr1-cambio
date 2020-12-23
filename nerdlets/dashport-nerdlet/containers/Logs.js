import React from 'react';
import PropTypes from 'prop-types';

export default class Logs extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { logsTotal } = this.props;
    return (
      <div className="divBoxLogs">
        <div className="mainBox">
          <div className="alertTitle">Indexes</div>
          <div className="boxContent">{logsTotal.indexes}</div>
        </div>
        <div className="mainBox">
          <div className="alertTitle">Pipelines</div>
          <div className="boxContent">{logsTotal.pipelines}</div>
        </div>
      </div>
    );
  }
}
Logs.propTypes = {
  logsTotal: PropTypes.object.isRequired
};
