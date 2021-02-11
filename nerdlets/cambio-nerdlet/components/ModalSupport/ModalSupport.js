import React from 'react';
import PropTypes from 'prop-types';
import { Modal, HeadingText, BlockText, Toast, Button, logger } from 'nr1';
import { Formik, Form, Field } from 'formik';
import { FormControl } from 'react-bootstrap';
import { sendSupportMicrosoftTeams } from '../../services/Wigilabs/api';
import { contactSchema } from '../../constants/ValidationSchemas';

export default class ModalSupport extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      sendingEmail: false
    };
  }

  /**
   * Method that send an Microsoft teams webhook and display a confirmation toast
   *
   * @param {Object} values Form values
   * @param {Object} actions Form actions
   * @memberof ModalSupport
   */
  sendContactEmail = async (values, { resetForm }) => {
    const { close } = this.props;
    // actions.setSubmitting(true);
    this.setState({ sendingEmail: true });
    await sendSupportMicrosoftTeams(values)
      .then(() => {
        resetForm({});
        this.setState({ sendingEmail: false });
        close();
        Toast.showToast({
          title: 'SUCCESS',
          description: 'Thank you, we will contact you shortly',
          type: Toast.TYPE.NORMAL
        });
      })
      .catch(error => {
        logger.error(`${error}`);
        this.setState({ sendingEmail: false });
        close();
        Toast.showToast({
          title: 'FAILED',
          description: 'Sorry, try again later',
          type: Toast.TYPE.NORMAL
        });
      });
  };

  render() {
    const { hidden, close } = this.props;
    const { sendingEmail } = this.state;
    return (
      <Modal
        hidden={hidden}
        onClose={() => {
          close();
        }}
      >
        <HeadingText type={HeadingText.TYPE.HEADING_1}>
          Need support ?
        </HeadingText>
        <BlockText type={BlockText.TYPE.PARAGRAPH}>
          Register your information and we will get in contact you as soon as
          possible
        </BlockText>
        <br />
        <Formik
          validationSchema={contactSchema}
          onSubmit={this.sendContactEmail}
        >
          {({ errors, touched, submitForm, values, setFieldValue,resetForm }) => (
            <Form className="formSetup" autoComplete="off">
              <div className="divTextfieldSupport">
                <Field
                  component={renderTextField}
                  type="text"
                  name="name"
                  value={values.name || ''}
                  onChange={event => setFieldValue('name', event.target.value)}
                  placeholder="Name"
                />
                {errors.name && touched.name ? (
                  <div style={{ color: 'red' }}>{errors.name}</div>
                ) : (
                  <div style={{ color: 'white' }}>.....</div>
                )}
              </div>
              <div className="divTextfieldSupport">
                <Field
                  component={renderTextField}
                  type="email"
                  name="email"
                  value={values.email || ''}
                  onChange={event => setFieldValue('email', event.target.value)}
                  placeholder="Email"
                />
                {errors.email && touched.email ? (
                  <div style={{ color: 'red' }}>{errors.email}</div>
                ) : (
                  <div style={{ color: 'white' }}>.....</div>
                )}
              </div>
              <div className="divTextfieldSupport">
                <Field
                  component={renderAreaField}
                  name="content"
                  placeholder="Description"
                  value={values.content || ''}
                  onChange={event =>
                    setFieldValue('content', event.target.value)
                  }
                />
                {errors.content && touched.content ? (
                  <div style={{ color: 'red' }}>{errors.content}</div>
                ) : (
                  <div style={{ color: 'white' }}>.....</div>
                )}
              </div>
              <div>
                <div className="divButtonSupport">
                  <Button
                    onClick={submitForm}
                    type={Button.TYPE.PRIMARY}
                    loading={sendingEmail}
                  >
                    Send
                  </Button>
                  <Button
                    onClick={() => {
                      close();
                      resetForm({});
                    }}
                    style={{ marginLeft: '10px' }}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </Modal>
    );
  }
}

const renderAreaField = ({ onChange, placeholder, value }) => {
  return (
    <FormControl
      value={value}
      onChange={onChange}
      componentClass="textarea"
      placeholder={placeholder}
    />
  );
};
renderAreaField.propTypes = {
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string.isRequired
};

const renderTextField = ({ onChange, placeholder, type, value }) => {
  return (
    <FormControl
      value={value}
      onChange={onChange}
      type={type}
      placeholder={placeholder}
    />
  );
};

renderTextField.propTypes = {
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired
};

ModalSupport.propTypes = {
  hidden: PropTypes.bool.isRequired,
  close: PropTypes.func.isRequired
};
