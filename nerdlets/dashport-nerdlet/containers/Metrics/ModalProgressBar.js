
import React from 'react';

import { Spinner, Button } from 'nr1';
import warningIcon from '../../images/warning.svg';
import { Modal } from 'react-bootstrap';

import closeIcon from '../../images/close.svg';
import ProgressBar from '../../components/ProgressBar/ProgressBar';

function ModalProgressBar(props) {
    const { hidden, _onClose, completed, fetchingMetrics, confirmAction, viewWarning } = props;
    return (
        <Modal
            show={hidden}
            onHide={() => _onClose}
            dialogClassName="widthModalProgress"
            aria-labelledby="contained-modal-title-vcenter"

        >
            <Modal.Body>
                <Modal.Header>
                    <div className="headerModalProgress fontMedium"> 
                        <span>Fetching Metric Elements</span>
                        <div className="pointer modal__closeIcon" onClick={() => { _onClose() }}>

                            <img
                                style={{
                                    width: '26px',
                                    height: '26px'
                                }}
                                src={closeIcon}
                            />
                        </div>
                    </div>
                </Modal.Header>
                {(completed === 0 && viewWarning) ?
                    <div style={{ height: "200px" }}>
                        <div className="contentFetching__warningInfo">
                            <div>
                                <img
                                    style={{
                                        width: '20px',
                                        height: '20px'
                                    }}
                                    src={warningIcon}
                                />
                                <span className="warningInfo--title fontNormal">Important Information</span>
                            </div>
                            <p className="warningInfo--description fontNormal">
                                <span className="warningInfo--steps">This process may take more than 30 minutes.</span> <br />
                                <span className="warningInfo--steps">This browser tab should not close until the process is complete.</span>  <br />
                                <span className="warningInfo--steps">Your internet connection must be active to complete  the process.</span>
                            </p>
                            <div className="warningInfo__buttons fontNormal">
                                <div />
                                <Button
                                    onClick={() => { confirmAction() }}
                                    type={Button.TYPE.PRIMARY}
                                    loading={fetchingMetrics}
                                >
                                    Confirm
                        </Button>
                                <Button
                                    onClick={() => { _onClose() }}
                                    type={Button.TYPE.NORMAL}
                                >
                                    Cancel
                        </Button>
                            </div>
                        </div>
                    </div>
                    :
                    <div style={{ height: "250px" }} className="contentFetching">
                        <div className="flex flexCenterHorizontal flexCenterVertical">
                            <ProgressBar bgcolor="#007E8A" completed={completed} />
                        </div>
                        <div className="flex flexCenterHorizontal">
                            {
                                completed === 100 ?
                                    <div className="contentFetching__info fontNormal flex flexCenterVertical flexCenterHorizontal">
                                        Process Completed
                                    </div>
                                    :
                                    <div className="contentFetching__info  fontNormal flex flexCenterVertical flexCenterHorizontal">
                                        <div className="info__loading">
                                            <Spinner />
                                            <span>Loading</span>
                                        </div>
                                    </div>
                            }

                        </div>
                    </div>
                }
            </Modal.Body>
        </Modal >
    )
}


export default ModalProgressBar;
