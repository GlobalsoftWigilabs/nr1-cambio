import React from 'react';
import PropTypes from 'prop-types';
import { Tooltip, Button } from 'nr1';
import { Formik, Form, Field } from 'formik';
// Schemas
import {
  DatadogTempSchema,
  DatadogSchema
} from '../constants/ValidationSchemas';
// Images
import datadogIcon from '../images/datadog.svg';
import datadogAIcon from '../images/datadogA.svg';
import dinaTrace from '../images/dinaTrace.svg';
import eyeIcon from '../images/eyeIconGray.svg';
import appDynamic from '../images/appDynamic.svg';
import { downloadJSON, downloadCSV } from '../services/NerdStorage/api';
import ProgressBar from '../components/ProgressBar/ProgressBar';
import iconInformation from '../images/information.svg';

const CustomInputComponent = ({
  field,
  viewKeyAction,
  disabled,
  ...props
}) => {
  return (
    <div className="buttonInside">
      <input type="text" {...field} {...props} className="inputApiKey" disabled={disabled} />
      <img src={eyeIcon} className="buttonEye" style={{ visibility: disabled ? "" : "hidden" }} onClick={() => { viewKeyAction(field.name) }} />
    </div>
  );
}

/**
 * Class that render the setup Container
 * @export
 * @class Setup
 * @extends {React.Component}
 */
export default class Setup extends React.Component {
  /**
   * Creates an instance of Setup
   * @param {*} props
   * @memberof Accounts
   */
  constructor(props) {
    super(props);
  }

  state = {
    enableDownload: false
  };

  downloadData = () => {
    this.setState({ enableDownload: true });
    downloadJSON(this.enableButton);
  };

  downloadDataCSV = () => {
    this.setState({ enableDownload: true });
    downloadCSV(this.enableButton);
  };

  enableButton = () => {
    this.setState({ enableDownload: false });
  };

  render() {
    const {
      handlePlatformChange,
      appkeyS,
      writingSetup,
      platformSelect,
      setupComplete,
      apikeyS,
      apiserver,
      writeSetup,
      openToast,
      fetchData,
      fetchingData,
      apikey,
      appkey,
      lastUpdate,
      completed,
      viewKeyAction,
      cancel
    } = this.props;
    const { enableDownload } = this.state;
    return (
      <div className="containerSetup">
        <div>
          <li
            className="iconOfPlatafform"
            style={{ border: platformSelect === 0 ? '1px solid #007E8A' : '' }}
            key={0}
            onClick={() => {
              handlePlatformChange(0);
            }}
          >
            <div className="divMenu">
              <img
                width="46px"
                height="46px"
                src={setupComplete ? datadogAIcon : datadogIcon}
              />
            </div>
          </li>
        </div>
        <div className="mainBoxSetup">
          <div className="boxTitle" style={{ justifyContent: "normal" }}>
            Datadog API setup
            <Tooltip
              text="API keys are unique to your organization. An API key is required by the Datadog Agent to submit metrics and events to Datadog."
              placementType={Tooltip.PLACEMENT_TYPE.TOP}
            >
              <img src={iconInformation} height="10px" className="graphsBar--iconInfo" />
            </Tooltip>
          </div>
          <div className="boxSetupContent">
            <Formik
              enableReinitialize
              initialValues={
                setupComplete
                  ? {
                    apikey: apikeyS,
                    appkey: appkeyS,
                    apiserver
                  }
                  : {
                    apikey,
                    appkey,
                    apiserver
                  }
              }
              validationSchema={
                setupComplete ? DatadogTempSchema : DatadogSchema
              }
              onSubmit={(values, actions) => writeSetup(values, actions)}
            >
              {({ errors, touched, submitForm, values, setFieldValue }) => (
                <Form className="formSetup" autoComplete="off">
                  <div className="divTextfield">
                    <div className="LabelKey">API key</div>
                    <Field
                      name="apikey"
                      component={CustomInputComponent}
                      viewKeyAction={viewKeyAction}
                      disabled={setupComplete}
                    />
                    {errors.apikey && touched.apikey ? (
                      <div style={{ color: 'red' }}>{errors.apikey}</div>
                    ) : (
                        <div style={{ color: 'white' }}>....</div>
                      )}
                  </div>
                  <div className="divTextfield">
                    <div className="LabelKey">Application key</div>
                    <Field
                      name="appkey"
                      component={CustomInputComponent}
                      viewKeyAction={viewKeyAction}
                      disabled={setupComplete}
                    />
                    {errors.appkey && touched.appkey ? (
                      <div style={{ color: 'red' }}>{errors.appkey}</div>
                    ) : (
                        <div style={{ color: 'white' }}>....</div>
                      )}
                  </div>
                  <div className="divCheckbox">
                    <Field
                      type="checkbox"
                      name="apiserver"
                      onChange={event =>
                        setFieldValue('apiserver', event.target.checked)
                      }
                      checked={values.apiserver}
                      disabled={setupComplete}
                    />
                    {errors.apiserver && touched.apiserver ? (
                      <div style={{ color: 'red' }}>{errors.apiserver}</div>
                    ) : (
                        <div style={{ color: 'white' }}>....</div>
                      )}
                    <label>Check IF you are on the Datadog EU site</label>
                  </div>
                  <div>
                    <div className="buttonSetup">
                      {!setupComplete && (
                        <Button
                          onClick={submitForm}
                          type={Button.TYPE.PRIMARY}
                          iconType={
                            Button.ICON_TYPE
                              .HARDWARE_AND_SOFTWARE__HARDWARE__STORAGE
                          }
                          loading={writingSetup}
                          className="buttonSave"
                        >
                          Save
                        </Button>
                      )}
                      {setupComplete ? (
                        <Button
                          onClick={openToast}
                          type={Button.TYPE.DESTRUCTIVE}
                          iconType={
                            Button.ICON_TYPE
                              .INTERFACE__OPERATIONS__REMOVE__V_ALTERNATE
                          }
                          className="buttonDelete"
                        >
                          Delete config
                        </Button>
                      ) : (
                          <></>
                        )}
                    </div>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
        <div className="mainBoxSetup">
          <div className="boxTitle">Fetch Datadog data</div>
          <Button onClick={() => cancel()}>Cancel</Button>
          <div>
            {fetchingData && (
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <ProgressBar bgcolor="#6a1b9a" completed={completed} />
              </div>
            )}
          </div>
          <div className="boxContentFetch">
            <Tooltip
              text="This button will be available when the Datadog API configuration is complete"
              placementType={Tooltip.PLACEMENT_TYPE.BOTTOM}
            >
              <Button
                onClick={() => {
                  fetchData();
                }}
                type={Button.TYPE.PRIMARY}
                iconType={Button.ICON_TYPE.INTERFACE__OPERATIONS__REFRESH}
                loading={fetchingData}
                className="buttonFetch"
                disabled={!(apikey !== '' && appkey !== '') || enableDownload}
              >
                Fetch data
              </Button>
            </Tooltip>
            <div className="lastUpdate">
              {'Last update: '}
              {lastUpdate}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Setup.propTypes = {
  handlePlatformChange: PropTypes.func.isRequired,
  writeSetup: PropTypes.func.isRequired,
  openToast: PropTypes.func.isRequired,
  fetchData: PropTypes.func.isRequired,
  appkeyS: PropTypes.string.isRequired,
  apikeyS: PropTypes.string.isRequired,
  apikey: PropTypes.string.isRequired,
  appkey: PropTypes.string.isRequired,
  lastUpdate: PropTypes.string.isRequired,
  platformSelect: PropTypes.number,
  setupComplete: PropTypes.bool.isRequired,
  apiserver: PropTypes.bool.isRequired,
  fetchingData: PropTypes.bool.isRequired,
  writingSetup: PropTypes.bool.isRequired,
  completed: PropTypes.number.isRequired
};
