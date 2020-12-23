
import React from 'react';

import { Modal } from 'react-bootstrap';

import closeIcon from '../../images/close.svg';

function ModalSetup(props) {
    let { hidden, _onClose } = props;
    return (
        <Modal
            show={hidden}
            onHide={() => _onClose}
            aria-labelledby="contained-modal-title-vcenter"
            dialogClassName="wSetup"
        >
            <Modal.Body>
                <div className="mainModalSetup">
                    <div className="pointer modal__closeIcon" onClick={() => { _onClose() }}>
                        <img
                            style={{
                                width: '26px',
                                height: '26px'
                            }}
                            src={closeIcon}
                        />
                    </div>
                    <div>
                        <div className="question--title">
                            Questions
                        </div>
                        <div className="p20">
                            <span className="question">
                                What is the API key used for?
                            </span>
                            <div className="answer">
                                An API key is required by the Datadog Api to get the elements of your account.
                            </div>
                        </div>
                        <div className="p20">
                            <span className="question">
                                What is the Application Key used for?
                            </span>
                            <div className="answer">
                                An Application key is required by the Datadog Api. It is used to log all requests made to the API
                            </div>
                        </div>
                        <div className="p20">
                            <span className="question">
                                What is the impact of admin vs basic keys?
                            </span>
                            <div className="answer">
                                With the admin key you can get log pipelines and log indexes.
                            </div>
                        </div>
                        <div className="p20">
                            <span className="question">
                                What are these going to be used for?
                            </span>
                            <div className="answer">
                                The keys will be used to read the data and provide visualization of the data that is capturable.
                            </div>
                        </div>
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    )
}


export default ModalSetup;