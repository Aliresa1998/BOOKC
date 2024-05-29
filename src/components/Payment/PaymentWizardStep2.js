import React, { Component } from 'react'
import '../app.local.css'
import { connect } from 'react-redux'
import { Row, Spin, notification, Modal, Input, Button, message } from 'antd'
import { Paymentcontroller } from '../../Paymentcontroller'
import App from "../stripeMulti/App"
import HelcimFormMulti from "./HelcimFormMulti"

const { TextArea } = Input;

class PaymentWizardStep2 extends Component {
  getPaymentType = async () => {
    const { selectedIntervalId } = this.props;
    if (selectedIntervalId) {
      const response = await Paymentcontroller.getPaymentProvider(selectedIntervalId);
      console.log('Payment Type for interval ID:', selectedIntervalId, 'is', response.provider);
      this.setState({
        paymentType: response.provider
      });
    } else {
      console.log("No interval ID provided");
    }
  }


  componentDidMount() {
    this.processUrlParameters();
    this.getPaymentType();
    this.getPaymentData();
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.selectedIntervalId !== prevProps.selectedIntervalId) {
      this.getPaymentType();
      this.getPaymentData();
    }
    if (this.props.selectediD !== prevProps.selectediD) {
      this.getPaymentType();
    }
    if (this.state.visibleModalHelcim && !prevState.visibleModalHelcim) {
      this.readHelcimData();
    }
  }
  processUrlParameters = () => {
    const params = new URLSearchParams(window.location.search);
    const responseMessage = params.get('responseMessage');
    const cardToken = params.get('cardToken');

    if (responseMessage === 'APPROVED') {
      this.handleApprovedCardByHelcim(cardToken);
    } else {
      this.setState({ loadingHelcimResultCheck: false });
    }

    // Clear URL parameters after processing without changing the URL
    if (responseMessage || cardToken) {
      const newUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }

    // Prevent URL from changing when payment is approved
    if (responseMessage === 'APPROVED') {
      window.history.pushState({}, '', window.location.href);
    }
  };
  

  readHelcimData = async () => {
    const response = await Paymentcontroller.getHelcimToken(this.props.selectediD);
    this.setState({
      helcimConfig: {
        customerCode: response["customerCode"],
        token: response["helcim js token"]
      },
      visibleModalHelcimOpenModal: true
    });
  }

  openNotification = (placement, message, status) => {
    if (status && status.toLowerCase().search("success") != -1) {
      notification.success({
        message: status,
        description: message,
        placement,
      });
    } else if (status && status.toLowerCase().search("error") != -1) {
      notification.error({
        message: status,
        description: message,
        placement,
      });
    } else {
      notification.info({
        message: status,
        description: message,
        placement,
      });
    }
  };

  handleChange = (e) => {
    let { name, value } = e.target;
    if (name === "card_number") {
      value = value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim();
    }
    if (value.length <= 19) {
      this.setState(prevState => {
        let myObject = Object.assign({}, prevState.payment_data);
        myObject[name] = value;
        return { payment_data: myObject };
      });
    }
  }

  handleSubmit = async (e) => {
    const selectedId = this.props.selectediD;
    if (selectedId) {
      localStorage.setItem("paymentId", selectedId);
      const response = await Paymentcontroller.get_payment_data(selectedId);
      if (response.billing_complete) {
        const recurringIntervalCountName = localStorage.getItem("wizard_recurring_interval_count_name");
        const recurringIntervalCount = recurringIntervalCountName ? recurringIntervalCountName.match(/\d+/g)[0] : "0";

        const responseClinicsSubscription = await Paymentcontroller.createInstallment(
          recurringIntervalCount,
          selectedId,
        );
        this.setState({ loading: false });
        if (responseClinicsSubscription.status < 250) {
          this.props.onNextStep();
        } else {
          this.openNotification('bottom', responseClinicsSubscription.detail ? responseClinicsSubscription.detail : "An error occurred during submit process", "Error");
        }
      } else {
        this.setState({ visibleModal: true, customer_id: response.guarantor, payment_data: response });
      }
    } else {
      console.error("Selected ID is not available");
    }
  }

  submitNewFundingSource = async () => {
    const { selectediD, selectedIntervalId } = this.props;
    if (!selectediD) {
      this.openNotification('bottom', "selectediD is not available", "Error");
      return;
    }

    const responseClinicsSubscription = await Paymentcontroller.createInstallment(selectedIntervalId, selectediD);
    if (responseClinicsSubscription.status < 250) {
      this.props.onNextStep();
    } else {
      const errorDetail = responseClinicsSubscription.detail || "An error occurred during the submit process";
      this.openNotification('bottom', errorDetail, "Error");
    }
  };

  handleSubmitModal = async (e) => {
    this.setState({
      loading: true,
      formError: {
        card_cvc: { massage: "", status: true },
        card_number: { massage: "", status: true },
        card_exp_month: { massage: "", status: true },
        card_exp_year: { massage: "", status: true },
      },
    });

    const { card_cvc, card_number, card_exp_month, card_exp_year } = this.state.payment_data;
    const card_cvc_validation = await Error.BankAccounts(card_cvc);
    const card_number_validation = await Error.BankAccounts(card_number.replace(/ /g, ""));
    const card_exp_month_validation = await Error.BankAccounts(card_exp_month);
    const card_exp_year_validation = await Error.BankAccounts(card_exp_year);

    if (
      card_cvc_validation.status &&
      card_number_validation.status &&
      card_exp_month_validation.status &&
      card_exp_year_validation.status
    ) {
      const response = await Paymentcontroller.send_payment_method(
        card_cvc,
        card_number.replace(/ /g, ""),
        card_exp_month,
        card_exp_year,
        localStorage.getItem("customer_id")
      );
      if (response.status < 250) {
        this.openNotification('bottom', response.message || "Created", "Successful");
        const responseClinicsSubscription = await Paymentcontroller.send_clinics_subscription(
          localStorage.getItem("customer_id"),
          localStorage.getItem("price_id"),
          this.props.selectediD
        );
        this.setState({ loading: false });
        if (responseClinicsSubscription.status < 250) {
          this.props.onNextStep();
        } else {
          this.openNotification('bottom', responseClinicsSubscription.detail || "An error occurred during submit process", "Error");
        }
      } else {
        this.handleResponseError(response);
      }
    } else {
      this.handleValidationErrors(card_cvc_validation, card_number_validation, card_exp_month_validation, card_exp_year_validation);
    }
  }

  handleResponseError = (response) => {
    this.openNotification('bottom', response.detail || "An error occurred during submit process", "Error");
    this.setState({
      loading: false,
      formError: {
        card_cvc: { massage: response.card_cvc || "", status: !response.card_cvc },
        card_number: { massage: response.card_number || "", status: !response.card_number },
        card_exp_month: { massage: response.card_exp_month || "", status: !response.card_exp_month },
        card_exp_year: { massage: response.card_exp_year || "", status: !response.card_exp_year },
      },
    });
  }

  handleValidationErrors = (card_cvc_validation, card_number_validation, card_exp_month_validation, card_exp_year_validation) => {
    this.openNotification('bottom', "An error occurred during submit process", "Error");
    this.setState({
      loading: false,
      formError: {
        card_cvc: { massage: card_cvc_validation.massage, status: card_cvc_validation.status },
        card_number: { massage: card_number_validation.massage, status: card_number_validation.status },
        card_exp_month: { massage: card_exp_month_validation.massage, status: card_exp_month_validation.status },
        card_exp_year: { massage: card_exp_year_validation.massage, status: card_exp_year_validation.status },
      },
    });
  }

  handleCloseModal = () => {
    this.setState({
      visibleModal: false,
      payment_data: {
        card_cvc: "",
        card_number: "",
        card_exp_month: "",
        card_exp_year: "",
      },
    });
  }

  getPaymentData = async () => {
    const { selectediD, selectedIntervalId } = this.props;
    if (selectediD && selectedIntervalId) {
      this.setState({ loadingHelcimResultCheck: true });
      try {
        const response = await Paymentcontroller.get_priceproduct(selectediD, selectedIntervalId);
        if (response && response.hasOwnProperty('recurring_interval_count')) {
          localStorage.setItem("wizard_recurring_interval_count", response.recurring_interval_count);
        }
        this.setState({
          payment_data_price_product: response,
          loadingHelcimResultCheck: false
        });
      } catch (error) {
        console.error("Error fetching payment data:", error);
        this.setState({ loadingHelcimResultCheck: false });
      }
    } else {
      this.setState({ loadingHelcimResultCheck: false });
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      payment_data_price_product: {},
      payment_data: {
        card_cvc: "",
        card_number: "",
        card_exp_month: "",
        card_exp_year: "",
      },
      customer_id: "",
      formError: {
        card_cvc: { massage: "", status: true },
        card_number: { massage: "", status: true },
        card_exp_month: { massage: "", status: true },
        card_exp_year: { massage: "", status: true },
      },
      loadingHelcimResultCheck: true,
      visibleModal: false,
      visibleModalHelcim: false,
      visibleModalHelcimOpenModal: false,
      paymentType: null,
      helcimConfig: {
        token: "",
        customerCode: ""
      }
    }
    this.getPaymentData();
    this.getPaymentType();
    this.handleChange = this.handleChange.bind(this)
    this.submitNewFundingSource = this.submitNewFundingSource.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleSubmitModal = this.handleSubmitModal.bind(this)
    this.handleCloseModal = this.handleCloseModal.bind(this)
    this.handleApprovedCardByHelcim = this.handleApprovedCardByHelcim.bind(this);
  }

  handleApprovedCardByHelcim = async (cardToken) => {
    const { selectediD, onNextStep } = this.props;
    try {
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipResponse.json();
      const userIp0 = ipData.ip;

      const response = await Paymentcontroller.helcimPayMulti(
        selectediD,
        selectediD,
        cardToken,
        userIp0
      );

      if (response.status < 250) {
        onNextStep();  // Call the parent component's method to go to the next step
        sessionStorage.setItem('currentStep', 3);  // Store current step in session storage
      } else {
        Object.keys(response).forEach(resp => {
          if (resp !== "status") message.error(response[resp]);
        });
        this.setState({ loadingHelcimResultCheck: false });
      }
    } catch (error) {
      console.error('Error fetching IP address:', error);
    }
  };

  render() {
    const { payment_data_price_product } = this.state;
    return (
      this.state.loadingHelcimResultCheck ?
        <>
          <Row justify={"center"} className="mt5p">
            <Spin size="large" />
          </Row>
          <Row justify={"center"}>
            <p style={{ marginTop: "15px", color: " #722ed1", fontWeight: "600", fontSize: "15px" }}>Processing Payment</p>
          </Row>
        </>
        :
        <div>
          <div className='dashboard-container' style={{ marginLeft: 15, width: '45%' }}>
            <div className="payment-details">
              <div className="payment-row">
                <div className="payment-label">Monthly Payment</div>
                <div className="payment-value">{payment_data_price_product.recurring_amount || "20.00"}</div>
              </div>
              <div className="payment-row">
                <div className="payment-label">Total</div>
                <div className="payment-value">{payment_data_price_product.total_amount || "240.00"}</div>
              </div>
            </div>
          </div>
          <Button
            style={{ marginLeft: '73%', width: 139, height: 38, background: '#6B43B5', color: 'white' }}
            onClick={() => {
              if (this.state.paymentType !== "helcim") {
                this.setState({ visibleModal: true });
              } else {
                this.setState({ visibleModalHelcim: true });
              }
            }}
          >
            Next
          </Button>

          <Modal onCancel={() => {
            this.setState({ visibleModal: false })
          }} footer={null} title="Payment" visible={this.state.visibleModal} >
            <App />
          </Modal>

          <Modal
            onCancel={() => {
              this.setState({
                visibleModalHelcimOpenModal: false,
                visibleModalHelcim: false
              });
            }}
            footer={null}
            title="Payment"
            open={this.state.visibleModalHelcimOpenModal}
          >
            <HelcimFormMulti helcimConfig={this.state.helcimConfig} selectedId={this.props.selectediD} selectedIntervalId={this.props.selectedIntervalId} />
          </Modal>
        </div>
    )
  }
}

function mapStateToProps(state) {
  const { creating, error } = state.paymentRequest;
  const { profileSummary } = state.dashboard;
  return {
    creating,
    error,
    profileSummary
  }
}

const paywiz2 = connect(mapStateToProps)(PaymentWizardStep2)

export default paywiz2
