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
    const response = await Paymentcontroller.getPaymentProvider(
      window.location.href.split("/")[
      window.location.href.split("/").length - 1
      ]
    );

    console.log(response.provider)
    this.setState({
      paymentType: response.provider
    })
  }

  getPaymentData = async () => {
    this.setState({
      loading: true,
    });
    if (
      window.location.href.split("/") &&
      window.location.href.split("/")[
      window.location.href.split("/").length - 1
      ]
    ) {
      localStorage.setItem(
        "paymentId",
        window.location.href.split("/")[
        window.location.href.split("/").length - 1
        ]
      );
      const response = await Paymentcontroller.get_payment_data(
        window.location.href.split("/")[
        window.location.href.split("/").length - 1
        ]
      );
      if (response.paid) {
        localStorage.setItem("Payment-Receipt", true);
        window.location.href = "#/payment-Done";
      } else {
        localStorage.setItem("Payment-Receipt", false);
        if (!response.billing_complete) {
          this.setState({
            stripe_complete: false,
          });
        }
      }
      this.setState({
        payment_data: response,
        loading: false,
      });
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
    const response = await Paymentcontroller.getHelcimToken(
      window.location.href.split("/")[
      window.location.href.split("/").length - 1
      ]
    )

    console.log(response)
    this.setState({

      helcimConfig: {
        customerCode: response["customerCode"],
        token: response["helcim js token"]
      },
      visibleModalHelcimOpenModal: true
    })

  }

  componentDidUpdate(prevProps, prevState) {
    // Check if the state value has changed to true
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
    if (this.state.payment_data.stripe_complete) {
      const response = await Paymentcontroller.paySinglePayment(
        window.location.href.split("/")[
        window.location.href.split("/").length - 1
        ]
      );

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
    const userIP = ""
    try {
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipResponse.json();
      const userIp0 = ipData.ip;
      const response = await Paymentcontroller.helcimPay(
        window.location.href.split("/")[
        window.location.href.split("/").length - 1
        ],
        cardToken,
        userIp0
      )

      if (response.status < 250) {
        message.success("Payment successful");

        window.location.href = window.location.origin + window.location.pathname +
          "#/payment/" + window.location.href.split("/")[
          window.location.href.split("/").length - 1
          ]
      } else {
        var errors = Object.keys(response)

        errors.map((resp) =>
          resp != "status" ? message.error(response[resp]) : ""
        )
        this.setState({
          loadingHelcimResultCheck: false
        })

      }
    } catch (error) {
      console.error('Error fetching IP address:', error);
    }
    /*
    }*/
  }

  // check submited helcim form
  componentDidMount() {

    // Function to parse URL parameters
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
        <>
          <Row justify={"center"} className="mt5p">
            <br />
            <br />
            <br />
            <Spin size="large" />

          </Row>
          <Row justify={"center"}>
            <p style={{ marginTop: "15px", color: " #722ed1", fontWeight: "600", fontSize: "15px" }}>Processing Payment</p>
          </Row>
        </>

        :
        <div>
          <div className="dashboard-container">
            <div className="pageBody wizard-page">
              <div className="page-header">
                <div className="title pageHeader">
                  {this.state.payment_data &&
                    this.state.payment_data.office_logo ? (
                    <img
                      className="bookcLogo"
                      src={this.state.payment_data.office_logo + ""}
                      alt="logo"
                    />
                  ) : (
                    <></>
                  )}
                </div>
                <span className="appointmentStep">
                  {this.state.loading
                    ? ""
                    : this.state.stripe_complete
                      ? "Payment Detail"
                      : "Patient Information"}
                </span>
              </div>
              <Card style={{ borderTop: "5px solid #a677f6" }} bodyStyle={{ padding: '10px' }}>
                <div className="header_payment_page_part">
                  {!this.state.loading ? "Payment Details" : ""}
                </div>

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
                    <div
                      className="main_container_card "
                      style={{ paddingTop: "0px", fontWeight: "bold" }}
                    >
                      <div>
                        <div>Amount</div>
                      </div>
                      <div className="align_rights_items" s>
                        <div>
                          {this.state.payment_data.amount
                            ? this.state.payment_data.amount
                            : "-"}
                        </div>
                      </div>
                    </div>
                    <div style={{ height: "15px" }}></div>

                    <Row><Col span={24} style={{ display: 'flex', justifyContent: 'center' }}>
                      <Button
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


                      </Button>
                    </Col>
                    </Row>
                    <div style={{ height: "15px" }}></div>
                  </>
                )}

              </Card>
            </div>
          </div>
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
          >
            <HelcimForm helcimConfig={this.state.helcimConfig} />
          </Modal>
          <PoweredBy />
        </div>
    );
  }
}

Payment.propTypes = {
  classes: PropTypes.object,
};

export default Payment;
