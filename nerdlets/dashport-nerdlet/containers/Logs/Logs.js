import React from 'react';
import { Spinner } from 'nr1';
import PropTypes from 'prop-types';
import jsoncsv from 'json-2-csv';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
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
    if (logsData.pipelinesStatus === 403) {
      this._onClose();
    }
    if (logsData.pipelines) {
      const data = [];
      logsData.pipelines.forEach(element => {
        let processors = '';
        if (element.processors) {
          const limitData = element.processors.slice(0, 3);
          for (const processor of limitData) {
            if (processor.name !== '') {
              processors = `${processors} ${processor.name} \n`;
            } else {
              processors = `${processors} ${processor.type} \n`;
            }
          }
          if (limitData.length === 3) {
            processors = `${processors} ...`;
          }
        }
        data.push({
          name: element.name,
          enabled: element.is_enabled,
          type: element.type,
          processors: processors,
          dataProcessors: element.processors
        });
      });
      this.setState({
        dataPipeline: data,
        dataPipelineTotal: logsData.pipelines.length
      });
    }
    if (logsData.archives) {
      const data = [];
      logsData.archives.forEach(element => {
        let tags = '';
        if (element.attributes.rehydration_tags) {
          element.attributes.rehydration_tags.forEach(tag => {
            tags = `${tags} ${tag} \n`;
          });
        }
        if (tags === '') {
          tags = '-----';
        }
        if (element.attributes) {
          data.push({
            name: element.attributes.name ? element.attributes.name : null,
            destination: element.attributes.destination.type
              ? element.attributes.type
              : null,
            query: element.attributes.query ? element.attributes.query : null,
            tags: tags,
            state: element.attributes.state ? element.attributes.state : null
          });
        }
      });
      this.setState({
        dataArchives: data,
        dataArchivesTotal: logsData.archives.length
      });
    }
    if (logsData.metrics) {
      const data = [];
      logsData.metrics.forEach(element => {
        let groupByPath = '';
        if (element.group_by) {
          element.group_by.forEach(group => {
            groupByPath = `${groupByPath} ${group} \n`;
          });
        }
        let tagName = '';
        if (element.group_by) {
          element.group_by.forEach(group => {
            tagName = `${tagName} ${group} \n`;
          });
        }
        data.push({
          id: element.id,
          aggrType: element.attributes.compute.aggregation_type
            ? element.attributes.compute.aggregation_type
            : null,
          path: element.attributes.compute.path
            ? element.attributes.compute.path
            : null,
          filterQuery: element.attributes.filter.query
            ? element.attributes.filter.query
            : null,
          groupByPath: groupByPath,
          tagName: tagName
        });
      });
      this.setState({
        dataMetrics: data,
        dataMetricsTotal: logsData.metrics.length
      });
    }
    this.setState({ loading: false });
  }

  downloadData = async () => {
    try {
      const zip = new JSZip(); // Object that contains the zip files
      const {
        dataArchives = [],
        dataPipeline = [],
        dataMetrics = []
      } = this.state;
      const archives = [];
      if (dataArchives) {
        dataArchives.forEach(element => {
          archives.push({
            NAME: element.name ? element.name : '-----',
            DESTINATION: element.type ? element.type : '-----',
            QUERY_USED: element.query ? element.query : '-----',
            TAGS: element.tags ? element.tags : '-----',
            STATE: element.state ? element.state : '-----'
          });
        });
      }
      // convert JSON array to CSV string
      jsoncsv.json2csv(archives, (err, csv) => {
        if (err) {
          throw err;
        }
        zip.file(`Logs Archives.csv`, csv);
      });
      const metrics = [];
      if (dataMetrics) {
        dataMetrics.forEach(element => {
          metrics.push({
            ID: element.id ? element.id : '-----',
            COMPUTE_AGGT_TYPE: element.aggrType ? element.aggrType : '-----',
            COMPUTE_PATH: element.path ? element.path : '-----',
            FILTER_QUERY: element.filterQuery ? element.filterQuery : '-----',
            GROUP_BY_PATH: element.groupByPath ? element.groupByPath : '-----',
            GROUP_TAG_NAME: element.tagName ? element.tagName : '-----'
          });
        });
      }
      // convert JSON array to CSV string
      jsoncsv.json2csv(metrics, (err, csv) => {
        if (err) {
          throw err;
        }
        zip.file(`Logs Metrics.csv`, csv);
      });
      const pipeline = [];
      if (dataPipeline) {
        for (const element of dataPipeline) {
          let processors = '';
          if (element.dataProcessors) {
            for (const processor of element.dataProcessors) {
              if (processor.name !== '') {
                processors = `${processors} ${processor.name} \n`;
              } else {
                processors = `${processors} ${processor.type} \n`;
              }
            }
          }
          if (processors === '') {
            processors = '-----';
          }
          pipeline.push({
            NAME: element.name ? element.name : '-----',
            ENABLED: element.enabled ? element.enabled : '-----',
            TYPE: element.type ? element.type : '-----',
            ORDER_PROCESSORS: processors
          });
        }
      }
      // convert JSON array to CSV string
      jsoncsv.json2csv(pipeline, (err, csv) => {
        if (err) {
          throw err;
        }
        if (pipeline.length !== 0) zip.file(`Logs Pipeline.csv`, csv);
        zip.generateAsync({ type: 'blob' }).then(function(content) {
          // see FileSaver.js
          saveAs(content, 'Logs.zip');
        });
      });
    } catch (error) {
      console.log(error);
    }
  };

  handleRange = value => {
    const { logsData = [] } = this.props;
    this.setState({ rangeSelected: value });
    if (logsData.pipelinesStatus === 403 && value.value === 'Pipelines') {
      this._onClose();
    }
    if (logsData.metricsStatus === 403 && value.value === 'Metrics') {
      this._onClose();
    }
    if (logsData.archivesStatus === 403 && value.value === 'Archives') {
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
            downloadData={this.downloadData}
            handleRange={this.handleRange}
            rangeSelected={rangeSelected}
            timeRanges={timeRanges}
            dataPipeline={dataPipeline}
          />
        );
      case 'Archives':
        return (
          <TableArchives
            downloadData={this.downloadData}
            rangeSelected={rangeSelected}
            timeRanges={timeRanges}
            handleRange={this.handleRange}
            dataArchives={dataArchives}
          />
        );
      case 'Metrics':
        return (
          <TableMetrics
            downloadData={this.downloadData}
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
      dataPipelineTotal,
      rangeSelected
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
        {hidden && (
          <ModalLog
            hidden={hidden}
            _onClose={this._onClose}
            title={rangeSelected.value}
          />
        )}
      </div>
    );
  }
}

Logs.propTypes = {
  logsData: PropTypes.object.isRequired
};
