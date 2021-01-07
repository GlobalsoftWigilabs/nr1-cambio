import React from 'react';
import PropTypes from 'prop-types';
import { Modal, HeadingText, BlockText, Toast, Button } from 'nr1';
import * as Yup from 'yup';
import { Formik, Form, Field } from 'formik';
import axios from 'axios';
import { FormControl } from 'react-bootstrap';
/**
 * Validation Schema for the contact form
 */
const contactSchema = Yup.object().shape({
  name: Yup.string()
    .min(4, 'Name too short')
    .max(50, 'Name too long')
    .required('Required'),
  email: Yup.string()
    .email()
    .required('Required'),
  content: Yup.string().required('Required')
});

export default class ModalSupport extends React.Component {
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
  async sendContactEmail(values, actions) {
    const errors = [];
    const { close } = this.props;
    actions.setSubmitting(true);
    this.setState({ sendingEmail: true });
    const proxyUrl = 'https://long-meadow-1713.rsamanez.workers.dev/?';
    const options = {
      url: `${proxyUrl}https://outlook.office.com/webhook/6aedb4e5-244b-48a4-8d7c-dfd9b829ef0f@c24de5b8-8a13-49ae-ab15-233b27d3d516/IncomingWebhook/f6da09c4bbf347f78b6dc5bcc56c5b76/cfc3f901-519d-4a3a-9540-0d226f1a7edd`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        '@context': 'https://schema.org/extensions',
        '@type': 'MessageCard',
        themeColor: 'FF4000',
        title: `Dashport support for ${values.email}`,
        text: `From **${values.name}**, ${values.content}`
      }
    };
    await axios(options)
      .then(() => {
        this.setState({ sendingEmail: false });
        close();
        Toast.showToast({
          title: 'SUCCESS',
          description: 'Thank you, we will contact you shortly',
          type: Toast.TYPE.NORMAL
        });
        actions.setSubmitting(false);
      })
      .catch(error => {
        errors.push(error);
        this.setState({ sendingEmail: false });
        this.onCloseSupport();
        Toast.showToast({
          title: 'FAILED',
          description: 'Sorry, try again later',
          type: Toast.TYPE.NORMAL
        });
        actions.setSubmitting(false);
      });
  }

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
          initialValues={{
            name: '',
            email: '',
            content: ''
          }}
          validationSchema={contactSchema}
          onSubmit={(values, actions) => this.sendContactEmail(values, actions)}
        >
          {({ errors, touched, submitForm, values, setFieldValue }) => (
            <Form className="formSetup" autoComplete="off">
              <div className="divTextfieldSupport">
                <Field
                  component={renderTextField}
                  type="text"
                  name="name"
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
                  value={values.content}
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

const renderAreaField = ({ onChange, placeholder }) => {
  return (
    <FormControl
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

const renderTextField = ({ onChange, placeholder, type }) => {
  return (
    <FormControl onChange={onChange} type={type} placeholder={placeholder} />
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
