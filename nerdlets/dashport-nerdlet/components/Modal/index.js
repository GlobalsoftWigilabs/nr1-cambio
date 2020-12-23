
import React from 'react';

import { Modal } from 'react-bootstrap';

import closeIcon from '../../images/close.svg';

function ModalWindow(props) {
    let { hidden, _onClose, children } = props;
    return (
        <Modal
            show={hidden}
            bsSize="small"
            onHide={() => _onClose}
            aria-labelledby="contained-modal-title-vcenter"
        >
            <Modal.Body>
                <div className="mainModal">
                    <div className="pointer modal__closeIcon" onClick={() => { _onClose() }}>
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
    )
}


export default ModalWindow;