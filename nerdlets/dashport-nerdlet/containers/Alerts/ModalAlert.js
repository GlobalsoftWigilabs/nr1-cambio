import React from 'react';
import moment from 'moment';
import { Modal } from 'react-bootstrap';
import closeIcon from '../../images/close.svg';
import PropTypes from 'prop-types';

export default class ModalAlert extends React.Component {
  renderCelll = (cell, content, color) => {
    return (
      <>
        <div style={{ display: 'flex' }}>
          <div
            style={{
              width: '30%',
              color: '#333333',
              fontWeight: 'bold',
              backgroundColor: `${color}`,
              display: 'flex',
              height: '2vw',
              alignItems: 'center',
              fontSize: '0.81vw'
            }}
          >
            <div
              className="flex flexCenterHorizontal"
              style={{ marginLeft: '5px' }}
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
    const { infoAditional, hidden, _onClose } = this.props;
    return (
      <div className="h100">
        <Modal
          show={hidden}
          bsSize="large"
          dialogClassName="w90"
          onHide={() => _onClose}
          aria-labelledby="contained-modal-title-vcenter"
        >
          <Modal.Body>
            <Modal.Header>
              <div className=" modalWidgets__closeIcon">
                <div className="infoAditional--title">{`${infoAditional.name}`}</div>
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
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {this.renderCelll(
                      'MESSAGE',
                      infoAditional.message,
                      '#f7f7f8'
                    )}
                    {this.renderCelll('QUERY', infoAditional.query, 'white')}
                    {this.renderCelll(
                      'AGGREGATION',
                      infoAditional.aggregation
                        ? `metric: ${infoAditional.aggregation.metric}  type: ${infoAditional.aggregation.type}  groupBy: ${infoAditional.aggregation.groupBy}`
                        : '________',
                      'white'
                    )}
                    {this.renderCelll(
                      'EVALUATION DELAY',
                      infoAditional.evaluation_delay
                        ? infoAditional.evaluation_delay
                        : '________',
                      '#f7f7f8'
                    )}
                    {this.renderCelll('FAILURE DURATION', '________', 'white')}
                    {this.renderCelll(
                      'MIN LOCATION FAILED',
                      '________',
                      '#f7f7f8'
                    )}
                    {this.renderCelll(
                      'HOST DELAY',
                      infoAditional.new_host_delay
                        ? infoAditional.new_host_delay
                        : '________',
                      'white'
                    )}
                    {this.renderCelll(
                      'NO DATA TIME FRAME',
                      infoAditional.no_data_timeframe
                        ? infoAditional.no_data_timeframe
                        : '________',
                      '#f7f7f8'
                    )}
                    {this.renderCelll(
                      'NOTIFY AUDIT',
                      `${
                        infoAditional.notify_audit
                          ? infoAditional.notify_audit
                          : '________'
                      }`,
                      'white'
                    )}
                    {this.renderCelll(
                      'THRESHOLDS',
                      infoAditional.thresholds
                        ? `${
                            infoAditional.thresholds.critical
                              ? `critical: ${infoAditional.thresholds.critical}`
                              : ''
                          }  ${
                            infoAditional.thresholds.warning
                              ? `warning: ${infoAditional.thresholds.warning}`
                              : ''
                          }`
                        : '________',
                      'white'
                    )}
                    {this.renderCelll('TAGS', infoAditional.name, '#f7f7f8')}
                    {this.renderCelll(
                      'NOTIFY NO DATA',
                      `${
                        infoAditional.notify_no_data
                          ? infoAditional.notify_no_data
                          : '________'
                      }`,
                      'white'
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

ModalAlert.propTypes = {
  infoAditional: PropTypes.object.isRequired,
  hidden: PropTypes.bool.isRequired,
  _onClose: PropTypes.func.isRequired
};
