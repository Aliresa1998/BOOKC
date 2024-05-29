import { Spin, notification, Modal, Button, Card, Row, Col, message } from "antd";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { Paymentcontroller } from "../../Paymentcontroller";
import PoweredBy from "../CommonUi/PoweredBy";
import "../app.local.css";
import App from "../stripe/App";
import CreateGurantorBillingForm from "./CreateGurantorBillingForm";
import HelcimForm from "./HelcimForm"
class Payment extends Component {
  getPaymentType = async () => {
    const { selectedId } = this.props;  // Use the selectedId from props

    if (selectedId) {
      const response = await Paymentcontroller.getPaymentProvider(selectedId);

      console.log(response.provider);
      this.setState({
        paymentType: response.provider
      });
    } else {
      console.error("No selected ID provided");
    }
  };



  getPaymentData = async () => {
    const { selectedId } = this.props;

    if (selectedId) {
      this.setState({ loading: true });

      try {
        const response = await Paymentcontroller.get_payment_data(selectedId);
        if (response.paid) {
          localStorage.setItem("Payment-Receipt", true);
          window.location.href = "#/payment-Done";
        } else {
          localStorage.setItem("Payment-Receipt", false);
          if (!response.billing_complete) {
            this.setState({ stripe_complete: false });
          }
        }
        this.setState({
          payment_data: response,
          loading: false,
        });
      } catch (error) {
        console.error('Error fetching payment data:', error);
        this.setState({ loading: false });
      }
    }
  };
  constructor(props) {
    super(props);
    this.state = {
      loadingHelcimResultCheck: true,
      loading: true,
      stripe_complete: true,
      payment_data: {},
      visibleModal: false,
      visibleModalHelcim: false,
      visibleModalHelcimOpenModal: false,
      paymentType: null,
      helcimConfig: {
        token: "",
        customerCode: ""
      }
    };
    this.getPaymentData();
    this.getPaymentType();
    this.handlePayment = this.handlePayment.bind(this);
    this.handleApprovedCardByHelcim = this.handleApprovedCardByHelcim.bind(this);
    this.handleReadDataIP = this.handleReadDataIP.bind(this);

  }

  readHelcimData = async () => {
    // Ensure that selectedId is being correctly passed and set in the component's state or props.
    const { selectedId } = this.props; // or this.state, depending on where selectedId is stored

    // Use selectedId directly without parsing from URL
    const response = await Paymentcontroller.getHelcimToken(selectedId);

    console.log(response);
    this.setState({
      helcimConfig: {
        customerCode: response["customerCode"],
        token: response["helcim js token"]
      },
      visibleModalHelcimOpenModal: true
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.visibleModalHelcim && !prevState.visibleModalHelcim) {
      this.readHelcimData()
    }
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

  handleSubmit2 = () => {
    window.location.reload();
  };


  handlePayment = async () => {
    const { selectedId } = this.props;

    if (this.state.payment_data.stripe_complete) {
      const response = await Paymentcontroller.paySinglePayment(selectedId);

      if (response.status < 250) {
        localStorage.setItem("Payment-Receipt", true);
        window.location.href = "#/payment-Done";
      } else {
        this.openNotification(
          "bottom",
          response.error ? response.error : "Error",
          "Error"
        );
      }
    } else {
      this.setState({ visibleModal: true });
    }
  };


  handleReadDataIP = async () => {

    try {
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipResponse.json();
      const userIp0 = ipData.ip;
      return userIp0.ip


    } catch (error) {
      console.error('Error fetching IP address:', error);
    }
    return null;
  };

  handleApprovedCardByHelcim = async (cardToken) => {
    const { selectedId } = this.props;  // Ensure selectedId is available in props

    if (!selectedId) {
      console.error("No selected ID provided");
      message.error("Payment failed: No selected ID provided.");
      return;
    }

    try {
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipResponse.json();
      const userIp = ipData.ip;

      const response = await Paymentcontroller.helcimPay(selectedId, cardToken, userIp);

      if (response.status < 250) {
        message.success("Payment successful");
        window.history.pushState({}, '', `/payment/${selectedId}`);  // Update the URL without reloading the page
      } else {
        message.error("Payment failed: " + response.error);
      }
    } catch (error) {
      console.error('Error during payment processing:', error);
      message.error("Payment processing error: " + error.message);
    }
  };


  componentDidMount() {

    const getUrlParameter = (name) => {
      name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
      const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
      const results = regex.exec(window.location.search);
      return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    };

    // Get the value of responseMessage and cardToken from URL parameters
    const responseMessage = getUrlParameter('responseMessage');
    const cardToken = getUrlParameter('cardToken');

    // Check if responseMessage is "APPROVED" and log cardToken
    if (responseMessage === 'APPROVED' || responseMessage === 'APPROVAL' || window.location.href.includes("/?")) {
      const userIp = this.handleReadDataIP()

      this.handleApprovedCardByHelcim(cardToken)
      console.log('user ip:', userIp);
      console.log('Card Token:', cardToken);
    } else {
      this.setState({
        loadingHelcimResultCheck: false
      })
    }


  }


  render() {
    return (
      this.state.loadingHelcimResultCheck ?
        <Row justify={"center"} className="mt5p">
          <br />
          <br />
          <br />
          <Spin size="large" />
        </Row>
        :
        <div>
          {this.state.loading ? (
            <>Loading...</>
          ) : !this.state.stripe_complete ? (
            <>
              <hr className="endline_payment" />

              <CreateGurantorBillingForm
                handleSubmit2={this.handleSubmit2}
              />
              <div style={{ height: "15px" }}></div>
            </>
          ) : (
            <>
              {/* <div
                      className="main_container_card "
                      style={{ paddingTop: "0px", fontWeight: "bold" }}
                    >
                      <div>
                        <div>Total</div>
                      </div>
                      <div className="align_rights_items" s>
                        <div>
                          {this.state.payment_data.amount
                            ? this.state.payment_data.amount
                            : "-"}
                        </div>
                      </div>
                    </div> */}
              <div className='dashboard-container' style={{ marginLeft: "53%", width: '44%' }}>
                {this.state.loadingHelcimResultCheck ? (
                  <Row justify={"center"} >
                    <Spin size="large" />
                  </Row>
                ) : (
                  <div>
                    <div className="payment-details1">
                      <div className="payment-row">
                        <div className="payment-label">Total</div>
                        <div className="payment-value"> {this.state.payment_data.amount
                          ? this.state.payment_data.amount
                          : "-"}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* <Row><Col span={24} style={{ display: 'flex', justifyContent: 'center' }}> */}
              {/* <Button
                  onClick={() => {
                    if (this.state.paymentType != "helcim") {
                      this.setState({ visibleModal: true });
                    }
                    else {
                      this.setState({ visibleModalHelcim: true });
                    }
                  }}
                  className="login-btn  "
                  style={{ width: "92%", alignSelf: "center" }}
                  type="primary" size="large"
                >


                  Payment


                </Button> */}
              <Button
                style={{ marginLeft: '73%', width: 139, height: 38, background: '#6B43B5', color: 'white', marginTop: 15 }}
                onClick={() => {
                  if (this.state.paymentType != "helcim") {
                    this.setState({ visibleModal: true });
                  }
                  else {
                    this.setState({ visibleModalHelcim: true });
                  }
                }}
              // className="login-btn submit-wizard-btn w100p" type="primary" size='large'
              >

                Next

              </Button>
              {/* </Col>
              </Row> */}
            </>
          )}

          <Modal
            onCancel={() => {
              this.setState({ visibleModal: false });
            }}
            footer={null}
            title="Payment"
            open={this.state.visibleModal}
          >
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
            style={{ minWidth: 921 }}
          >
            <HelcimForm helcimConfig={this.state.helcimConfig} />
          </Modal>
        </div>
    );
  }
}

Payment.propTypes = {
  classes: PropTypes.object,
};

export default Payment;
