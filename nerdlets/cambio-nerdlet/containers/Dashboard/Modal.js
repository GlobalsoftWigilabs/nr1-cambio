import React from 'react';

import { Modal } from 'react-bootstrap';
import TableWidgets from './TableWidgets';
import TableVariables from './TableVariables';
import { PropTypes } from 'prop-types';

export default class ModalContent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      checkVariables: false,
      checkWidgets: true
    };
  }

  handleCheck = so => {
    const { checkWidgets, checkVariables } = this.state;
    switch (so) {
      case 'widgets':
        if (checkWidgets) {
          this.setState({ checkWidgets: true, checkVariables: false });
        } else {
          this.setState({ checkWidgets: true, checkVariables: false });
        }
        break;
      case 'variables':
        if (checkVariables) {
          this.setState({ checkWidgets: true, checkVariables: false });
        } else {
          this.setState({ checkWidgets: false, checkVariables: true });
        }
        break;
    }
  };

  render() {
    const { infoAditional, hidden, _onClose } = this.props;
    const { checkWidgets, checkVariables } = this.state;
    return (
      <div className="h100">
        <Modal
          show={hidden}
          bsSize="large"
          dialogClassName="w90"
          onHide={() => _onClose}
          aria-labelledby="contained-modal-title-vcenter"
        >
          {checkWidgets ? (
            <TableWidgets
              infoAditional={infoAditional}
              _onClose={_onClose}
              handleCheck={this.handleCheck}
              checkVariables={checkVariables}
              checkWidgets={checkWidgets}
            />
          ) : (
            <TableVariables
              infoAditional={infoAditional}
              _onClose={_onClose}
              handleCheck={this.handleCheck}
              checkVariables={checkVariables}
              checkWidgets={checkWidgets}
            />
          )}
        </Modal>
      </div>
    );
  }
}
ModalContent.propTypes = {
  infoAditional: PropTypes.object.isRequired,
  hidden: PropTypes.bool.isRequired,
  _onClose: PropTypes.func.isRequired
};
