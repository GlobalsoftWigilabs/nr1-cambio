import React from 'react';
import { Modal } from 'react-bootstrap';
import closeIcon from '../../images/close.svg';
import PropTypes from 'prop-types';

export default class ModalAlert extends React.Component {
  renderCelll = (cell, content, color) => {
    return (
      <>
        <div
          style={{
            width: '100%',
            backgroundColor: `${color}`,
            height: '3vw',
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
            <div className="flex" style={{ marginLeft: '15px' }}>
              {cell}
            </div>
          </div>
          <div style={{ width: '70%' }}>
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
          dialogClassName="w70"
          onHide={() => _onClose}
          aria-labelledby="contained-modal-title-vcenter"
        >
          <Modal.Body>
            <Modal.Header>
              <div className=" modalWidgets__closeIcon">
                <div className="infoAditional--title">{`${infoAditional.NAME}`}</div>
                <div
                  className="flex"
                  style={{
                    justifyContent: 'space-between'
                  }}
                >
                  <div>&nbsp;</div>
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
                      infoAditional.MESSAGE,
                      '#f7f7f8'
                    )}
                    {this.renderCelll('QUERY', infoAditional.QUERY, 'white')}

                    <div
                      style={{
                        width: '100%',
                        backgroundColor: '#f7f7f8',
                        height: '3vw',
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
                        <div className="flex " style={{ marginLeft: '15px' }}>
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
                        infoAditional.AGGREGATION
                          ? `metric: ${infoAditional.AGGREGATION.metric}  type: ${infoAditional.AGGREGATION.type}  groupBy: ${infoAditional.AGGREGATION.groupBy}`
                          : '-----',
                        'white'
                      )}
                      {this.renderCelll(
                        'EVALUATION DELAY',
                        infoAditional.EVALUATION_DELAY
                          ? infoAditional.EVALUATION_DELAY
                          : '-----',
                        '#f7f7f8'
                      )}
                      {this.renderCelll(
                        'FAILURE DURATION',
                        infoAditional.FAILURE_DURATION
                          ? infoAditional.FAILURE_DURATION
                          : '-----',
                        'white'
                      )}
                      {this.renderCelll(
                        'MIN LOCATION FAILED',
                        infoAditional.MIN_LOCATION_FAILED
                          ? infoAditional.MIN_LOCATION_FAILED
                          : '-----',
                        '#f7f7f8'
                      )}
                      {this.renderCelll(
                        'HOST DELAY',
                        infoAditional.HOST_DELAY
                          ? infoAditional.HOST_DELAY
                          : '-----',
                        'white'
                      )}
                      {this.renderCelll(
                        'NO DATA TIME FRAME',
                        infoAditional.NO_DATA_TIMEFRAME
                          ? infoAditional.NO_DATA_TIMEFRAME
                          : '-----',
                        '#f7f7f8'
                      )}
                      {this.renderCelll(
                        'NOTIFY AUDIT',
                        `${
                          infoAditional.NOTIFY_AUDIT
                            ? infoAditional.NOTIFY_AUDIT
                            : '-----'
                        }`,
                        'white'
                      )}
                      {this.renderCelll(
                        'THRESHOLDS',
                        infoAditional.THRESHOLDS
                          ? infoAditional.THRESHOLDS
                          : '-----',
                        '#f7f7f8'
                      )}
                      {this.renderCelll(
                        'NOTIFY NO DATA',
                        `${
                          infoAditional.NOTIFY_NO_DATA
                            ? infoAditional.NOTIFY_NO_DATA
                            : '-----'
                        }`,
                        'white'
                      )}{' '}
                    </div>
                    {this.renderCelll('TAGS', infoAditional.NAME, '#f7f7f8')}
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
