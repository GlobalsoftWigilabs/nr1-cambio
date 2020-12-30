import React from 'react';
import PropTypes from 'prop-types';

export default class Logs extends React.Component {
  constructor(props) {
    super(props);
  }
  componentDidMount(){
    const { logsData } = this.props;
  }

  render() {
    return (
      <div>Logs</div>
    );
  }
}
Logs.propTypes = {
  logsData: PropTypes.array
};
