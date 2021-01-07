import React from 'react';
import { Spinner } from 'nr1';
import PropTypes from 'prop-types';
import TableArchives from './TableArchives';
import TableMetrics from './TableMetrics';
import TablePipelines from './TablePipelines';
import ModalLog from './ModalLog';

const greenColor = '#007E8A';
export default class Logs extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dataPipeline: [],
      dataPipelineTotal: [],
      dataMetrics: [],
      dataMetricsTotal: 0,
      dataArchives: [],
      dataArchivesTotal: 0,
      timeRanges: [
        { value: 'Pipelines', label: 'Pipelines' },
        { value: 'Archives', label: 'Archives' },
        { value: 'Metrics', label: 'Metrics' }
      ],
      rangeSelected: { value: 'Pipelines', label: 'Pipelines' },
      loading: true
    };
  }

  componentDidMount() {
    const { logsData = [] } = this.props;
    if (logsData.archivesStatus === 403) {
      this._onClose();
    }
    if (logsData.pipelines) {
      this.setState({
        dataPipeline: logsData.pipelines,
        dataPipelineTotal: logsData.pipelines.length
      });
    }
    if (logsData.archives) {
      this.setState({
        dataArchives: logsData.archives,
        dataArchivesTotal: logsData.archives.length
      });
    }
    if (logsData.metrics) {
      this.setState({
        dataMetrics: logsData.metrics,
        dataMetricsTotal: logsData.metrics.length
      });
    }
    this.setState({ loading: false });
  }

  handleRange = value => {
    const { logsData = [] } = this.props;
    this.setState({ rangeSelected: value });
    if (logsData.archivesStatus === 403 && value.value === 'Pipelines') {
      this._onClose();
    }
  };

  _onClose = () => {
    const actualValue = this.state.hidden;
    this.setState({ hidden: !actualValue });
  };

  selectViewLogs = () => {
    const {
      rangeSelected,
      timeRanges,
      dataArchives,
      dataMetrics,
      dataPipeline
    } = this.state;
    switch (rangeSelected.value) {
      case 'Pipelines':
        return (
          <TablePipelines
            handleRange={this.handleRange}
            rangeSelected={rangeSelected}
            timeRanges={timeRanges}
            dataPipeline={dataPipeline}
          />
        );
      case 'Archives':
        return (
          <TableArchives
            rangeSelected={rangeSelected}
            timeRanges={timeRanges}
            handleRange={this.handleRange}
            dataArchives={dataArchives}
          />
        );
      case 'Metrics':
        return (
          <TableMetrics
            rangeSelected={rangeSelected}
            timeRanges={timeRanges}
            handleRange={this.handleRange}
            dataMetrics={dataMetrics}
          />
        );
      default:
        return <div />;
    }
  };

  render() {
    const {
      loading,
      hidden,
      dataArchivesTotal,
      dataMetricsTotal,
      dataPipelineTotal
    } = this.state;
    return (
      <div className="h100">
        {loading ? (
          <Spinner type={Spinner.TYPE.DOT} />
        ) : (
          <div className="mainContent">
            <div className="mainContentLogs__information">
              <div className="information__box">
                <span
                  className="box--title"
                  style={{
                    color: greenColor
                  }}
                >
                  Total Pipelines
                </span>
                <div>
                  <span
                    className="box--quantity"
                    style={{
                      color: greenColor
                    }}
                  >
                    {dataPipelineTotal}
                  </span>
                </div>
              </div>
              <div className="information__box">
                <span
                  className="box--title"
                  style={{
                    color: greenColor
                  }}
                >
                  Total Archives
                </span>
                <div>
                  <span
                    className="box--quantity"
                    style={{
                      color: greenColor
                    }}
                  >
                    {dataArchivesTotal}
                  </span>
                </div>
              </div>
              <div className="information__box">
                <span
                  className="box--title"
                  style={{
                    color: greenColor
                  }}
                >
                  Total Metrics
                </span>
                <div>
                  <span
                    className="box--quantity"
                    style={{
                      color: greenColor
                    }}
                  >
                    {dataMetricsTotal}
                  </span>
                </div>
              </div>
            </div>

            <div className="mainContent__tableContent">
              {this.selectViewLogs()}
            </div>
          </div>
        )}
        {hidden && <ModalLog hidden={hidden} _onClose={this._onClose} />}
      </div>
    );
  }
}

Logs.propTypes = {
  logsData: PropTypes.object.isRequired
};
