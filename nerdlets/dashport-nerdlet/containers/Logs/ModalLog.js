import React from 'react';

import { Modal } from 'react-bootstrap';

import closeIcon from '../../images/buttonOk.png';
import pipeline from '../../images/pipelineAlert.png';
import alert from '../../images/logNota.svg';

function ModalLog(props) {
  const { hidden, _onClose, title } = props;
  return (
    <Modal
      show={hidden}
      onHide={() => _onClose}
      aria-labelledby="contained-modal-title-vcenter"
      dialogClassName="wSetup"
      style={{
        marginTop: '5%',
      }}
    >
      <Modal.Body style={{ background: '#333333' }}>
        <div style={{ background: '#333333' }} className="mainModalSetup">
          <div>
            <div style={{ alignContent: 'center' }}>
              <img style={{ marginLeft: '46.5%' }} src={alert} />
            </div>
            <div style={{ textAlign: 'center', color: 'white' }}>
              <h3 style={{ color: 'white' }}>
                <strong>Important Note</strong>
              </h3>
            </div>
            <hr />
            <div className="p20">
              <div
                className="answer"
                style={{ color: 'white', lineHeight: '150%' }}
              >
                <h4 style={{ fontSize: '14px', color: 'white' }}>
                  {`The Logs ${title} section are only available for Datadog Admin
                users. Make sure to use an application key created by an admin.`}
                </h4>
                <a
                  href="https://docs.datadoghq.com/account_management/api-app-keys/"
                  className="apiKeys--learnMore"
                  target="_blank"
                >
                  <h4 style={{ color: '#F2C94C', fontSize: '14px' }}>Learn more</h4>
                </a>
              </div>
            </div>
            <img style={{ marginLeft: '15%', width: '70%', height: 'auto' }} src={pipeline} />
            <div className="p20">
              <div className="answer" style={{ color: 'white' }}>
                <h4 style={{ fontSize: '14px', color: 'white' }}>
                  You can update the Application Key in the Setup.
                </h4>
              </div>
            </div>
            <div
              className="pointer modal__closeIcon"
              onClick={() => {
                _onClose();
              }}
            >
              <img
                style={{
                  width: '120px',
                  height: '40px'
                }}
                src={closeIcon}
              />
            </div>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
}

export default ModalLog;
