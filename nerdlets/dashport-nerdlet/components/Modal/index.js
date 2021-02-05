import React from 'react';
import PropTypes from 'prop-types';

import { Modal } from 'react-bootstrap';

import closeIcon from '../../images/close.svg';

function ModalWindow(props) {
  const { hidden, _onClose, children } = props;
  return (
    <Modal
      show={hidden}
      bsSize="small"
      onHide={() => _onClose}
      aria-labelledby="contained-modal-title-vcenter"
    >
      <Modal.Body>
        <div className="mainModal">
          <div
            className="pointer modal__closeIcon"
            onClick={() => {
              _onClose();
            }}
          >
            <img
              style={{
                width: '26px',
                height: '26px'
              }}
              src={closeIcon}
            />
          </div>
          {children}
        </div>
      </Modal.Body>
    </Modal>
  );
}

ModalWindow.propTypes = {
  hidden: PropTypes.bool.isRequired,
  _onClose: PropTypes.func.isRequired,
  children: PropTypes.element
};
export default ModalWindow;
