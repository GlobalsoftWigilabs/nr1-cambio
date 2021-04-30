import React from 'react';
import { Modal } from 'react-bootstrap';
import closeIcon from '../../images/close.svg';
import PropTypes from 'prop-types';

export default class ModalAlert extends React.PureComponent {
  renderCelll = (cell, content, color) => {
    return (
      <>
        <div
          style={{
            width: '100%',
            backgroundColor: `${color}`,
            padding: '5px',
            minHeight: '3vw',
            alignItems: 'center',
            display: 'flex'
          }}
        >
          <div
            className="fontSmall"
            style={{
              color: '#333333',
              fontWeight: 'bold',
              width: '30%'
            }}
          >
            <div className="flex" style={{ marginLeft: '15px' }}>
              {cell}
            </div>
          </div>
          <div style={{ width: '70%' }} className="fontNormal">
            <div
              style={{ overflow: 'hidden' }}
              className="h100 flex flexCenterVertical"
            >
              {content}
            </div>
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
          dialogClassName="w70"
          onHide={() => _onClose}
          aria-labelledby="contained-modal-title-vcenter"
        >
          <Modal.Body>
            <Modal.Header>
              <div
                className="flex"
                style={{
                  justifyContent: 'space-between'
                }}
              >
                <div className="infoAditional--title">{`${infoAditional.name}`}</div>
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

                    <div
                      style={{
                        width: '100%',
                        backgroundColor: '#f7f7f8',
                        minHeight: '3vw',
                        padding: '5px',
                        alignItems: 'center',
                        display: 'flex'
                      }}
                    >
                      <div
                        style={{
                          color: '#333333',
                          fontWeight: 'bold',
                          fontSize: '0.81vw',
                          width: '30%'
                        }}
                      >
                        <div
                          className="flex fontSmall"
                          style={{ marginLeft: '15px' }}
                        >
                          MONITOR OPTIONS
                        </div>
                      </div>
                      <div style={{ width: '70%' }}>
                        <div className="h100" />
                      </div>
                    </div>
                    <div style={{ paddingLeft: '1%' }}>
                      {' '}
                      {this.renderCelll(
                        'AGGREGATION',
                        infoAditional.aggregation
                          ? infoAditional.aggregation
                          : '-----',
                        'white'
                      )}
                      {this.renderCelll(
                        'EVALUATION DELAY',
                        infoAditional.evaluation_delay
                          ? infoAditional.evaluation_delay
                          : '-----',
                        '#f7f7f8'
                      )}
                      {this.renderCelll(
                        'FAILURE DURATION',
                        infoAditional.failure_duration
                          ? infoAditional.failure_duration
                          : '-----',
                        'white'
                      )}
                      {this.renderCelll(
                        'MIN LOCATION FAILED',
                        infoAditional.min_location_failed
                          ? infoAditional.min_location_failed
                          : '-----',
                        '#f7f7f8'
                      )}
                      {this.renderCelll(
                        'HOST DELAY',
                        infoAditional.host_delay
                          ? infoAditional.host_delay
                          : '-----',
                        'white'
                      )}
                      {this.renderCelll(
                        'NO DATA TIME FRAME',
                        infoAditional.no_data_timeframe
                          ? infoAditional.no_data_timeframe
                          : '-----',
                        '#f7f7f8'
                      )}
                      {this.renderCelll(
                        'NOTIFY AUDIT',
                        `${
                          infoAditional.notify_audit
                            ? infoAditional.notify_audit
                            : '-----'
                        }`,
                        'white'
                      )}
                      {this.renderCelll(
                        'THRESHOLDS',
                        infoAditional.thresholds
                          ? infoAditional.thresholds
                          : '-----',
                        '#f7f7f8'
                      )}
                      {this.renderCelll(
                        'NOTIFY NO DATA',
                        `${
                          infoAditional.notify_no_data
                            ? infoAditional.notify_no_data
                            : '-----'
                        }`,
                        'white'
                      )}{' '}
                    </div>
                    {this.renderCelll('TAGS', infoAditional.name, '#f7f7f8')}
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
