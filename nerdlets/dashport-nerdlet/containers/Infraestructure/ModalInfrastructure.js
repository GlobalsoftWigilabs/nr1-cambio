import React from 'react';
import { Modal } from 'react-bootstrap';
import closeIcon from '../../images/close.svg';
import PropTypes from 'prop-types';

export default class ModalInfrastructure extends React.Component {
  renderCelll = (cell, content, color) => {
    return (
      <>
        <div style={{display: 'flex'}}>
          <div
            style={{
              width: '30%',
              color: '#333333',
              fontWeight: 'bold',
              backgroundColor: `${color}`,
              display: 'flex',
              height: '3vw',
              alignItems: 'center',
              fontSize: '0.81vw'
            }}
          >
            <div
              className="flex flexCenterHorizontal"
              style={{ marginLeft: '5px'}}
            >
              {cell}
            </div>
          </div>
          <div
            style={{
              width: '70%',
              backgroundColor: `${color}`,
              display: 'flex'
            }}
          >
            <div className="h100 flex flexCenterVertical">{content}</div>
          </div>
        </div>
      </>
    );
  };

  render() {
    const {infoAditional, hidden, _onClose} = this.props;
    console.log(infoAditional, "infoAdicional")
    return (
      <div className="h100">
        <Modal
          show={hidden}
          bsSize="large"
          dialogClassName="w70"
          onHide={() => _onClose}
          aria-labelledby="contained-modal-title-vcenter"
        >
          <Modal.Body>
            <Modal.Header>
              <div className=" modalWidgets__closeIcon">
                <div className="infoAditional--title">{`${infoAditional.hostname}`}</div>
                <div className="flex">
                  <img
                    onClick={() => {
                      _onClose();
                    }}
                    className="pointer"
                    style={{
                      width: '26px',
                      height: '26px'
                    }}
                    src={closeIcon}
                  />
                </div>
              </div>
            </Modal.Header>
            <div>
              <div className="tableContent__table">
                <div
                  style={{
                    height: '500px'
                  }}
                  className="graph_bar"
                >
                  <div style={{display: 'flex', flexDirection: 'column'}}>
                    {this.renderCelll(
                      'CPU',
                      infoAditional.metricsCpu,
                      '#f7f7f8'
                    )}
                    {this.renderCelll(
                      'MESSAGE',
                      infoAditional.metricsIowait,
                      'white'
                    )}
                    {this.renderCelll(
                      'MESSAGE',
                      infoAditional.metricsLoad,
                      '#f7f7f8'
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Modal.Body>
        </Modal>
      </div>
    );
  }
}

ModalInfrastructure.propTypes = {
  infoAditional: PropTypes.object.isRequired,
  hidden: PropTypes.bool.isRequired,
  _onClose: PropTypes.func.isRequired
};
