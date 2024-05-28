import React, { Component } from "react";
import { notification, Modal, Tag, Divider, Row, Col } from "antd";
import { Paymentcontroller } from "../../Paymentcontroller";
import DashboardPagePaymentTransactionDetail from "./DashboardPagePaymentTransactionDetail";
import DashboardPagePaymentFailedDetail from "./DashboardPagePaymentFailedDetail";
import "./style.css";
import config from "../../config";
import buttonSvgrepo from '../../assets/img/download-button-svgrepo-com.svg'
class DashboardPagePaymentDetail extends Component {
  getPaymentData = async (props) => {
    this.setState({
      loading: true,
    });
    if (window.location.href.split("/") && props.selectediD) {
      localStorage.setItem("paymentId", props.selectediD);
      const response = await Paymentcontroller.get_payment_data(
        props.selectediD
      );
      this.setState({
        payment_data: response,
        loading: false,
      });
    }
  };
  constructor(props) {
    super(props);
    this.state = {
      mode: "transaction",
      loading: true,
      stripe_complete: true,
      payment_data: {},
      visibleModal: false,
      openModalMultiFile: false,
      downloadMultiFileTitle: "",
      ModalMultiFileData: []
    };
    this.getPaymentData(props);
    this.handlePayment = this.handlePayment.bind(this);
    this.nextOption = this.nextOption.bind(this);
  }


  nextOption = async () => {
    const response = await Paymentcontroller.get_payment_data(
      window.location.href.split("/")[
      window.location.href.split("/").length - 1
      ]
    );

    if (response.paid || response.status == "subscription") {
      localStorage.setItem("Payment-Receipt", true);
      window.location.href = "#/payment-Done";
    } else {
      localStorage.setItem("Payment-Receipt", false);
      if (!response.billing_complete) {
        this.setState({
          stripe_complete: false,
        });
      } else {
        window.location.href =
          "/#/payment-flow/" +
          window.location.href.split("/")[
          window.location.href.split("/").length - 1
          ];
      }
    }
  };

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
    window.location.href =
      "/#/payment-flow/" +
      window.location.href.split("/")[
      window.location.href.split("/").length - 1
      ];
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

  componentDidUpdate(prevProps) {
    if (prevProps.selectediD !== this.props.selectediD) {
      this.setState({
        payment_data: {},
      });
      this.getPaymentData(this.props);
    }
  }

  render() {
    return (
      <>
        <div className="header_payment_page_part mt0 pt0">Patient</div>
        <div className="main_container_card ">
          <div>
            <div>Name</div>
            <div>Email</div>
            <div>Phone</div>
            <div>Reason</div>
          </div>
          <div className="align_rights_items payment_data">
            <div>
              {this.state.payment_data &&
                this.state.payment_data.guarantor_firstname &&
                this.state.payment_data.guarantor_lastname
                ? this.state.payment_data.guarantor_firstname +
                " " +
                this.state.payment_data.guarantor_lastname
                : "-"}
            </div>
            <div>
              {this.state.payment_data.guarantor_email
                ? this.state.payment_data.guarantor_email
                : "-"}
            </div>
            <div>
              {this.state.payment_data.guarantor_phone
                ? this.state.payment_data.guarantor_phone
                : "-"}
            </div>
            <div>
              {this.state.payment_data.other_reason ? (
                <span>{this.state.payment_data.other_reason}</span>
              ) : (
                this.state.payment_data.reason_data &&
                this.state.payment_data.reason_data.map((item) => (
                  <Tag className="tag_reason" color="purple">
                    {item.reason}
                  </Tag>
                ))
              )}
            </div>
          </div>
        </div>
        <div className="header_payment_page_part mt0 pt0">
          Clinic Information
        </div>
        <div className="main_container_card ">
          <div>
            <div>Clinic Name</div>
          </div>
          <div className="align_rights_items">
            <div>
              {this.state.payment_data.office_name
                ? this.state.payment_data.office_name
                : "-"}
            </div>
          </div>
        </div>

        <br />
        <div className="main_container_card pt0 fwb">
          <div>
            <div>Created Date</div>
          </div>
          <div className="align_rights_items" s>
            {this.state.payment_data.created_at
              ? new Date(this.state.payment_data.created_at)
                .toISOString()
                .replace(/T/, " ")
                .replace(/\.\d+Z$/, "")
              : "-"}
          </div>
        </div>
        <div className="main_container_card pt0 fwb ">
          <div>
            <div>Invoice File</div>
          </div>
          <div className="align_rights_items" s>
            <div style={
              this.state.payment_data &&
                this.state.payment_data.invoice &&
                this.state.payment_data.invoice.length > 0
                ?
                { cursor: "pointer" } : {}}
              onClick={() => {
                if (this.state.payment_data &&
                  this.state.payment_data.invoice &&
                  this.state.payment_data.invoice.length > 0
                ) {
                  if (this.state.payment_data.invoice.length > 1) {
                    console.log(this.state.payment_data.invoice)
                    this.setState({
                      openModalMultiFile: true,
                      downloadMultiFileTitle: "Download Invoices Files",
                      ModalMultiFileData: this.state.payment_data.invoice
                    })

                  } else {
                    this.state.payment_data.invoice.forEach(item => {
                      if (item && item.invoice) {
                        window.open(config.apiGateway.URL + item.invoice, '_blank');
                      }
                    })
                  }

                }
              }}
            >
              {
                this.state.payment_data &&
                  this.state.payment_data.invoice && this.state.payment_data.invoice.length > 0 ?
                  <img style={{ width: "20px", marginTop: "-10px", cursor: "pointer" }} alt="download" src={buttonSvgrepo} />
                  :
                  "-"
              }


            </div>
          </div>
        </div>
        <div className="main_container_card pt0 fwb ">
          <div>
            <div>Supporting Document</div>
          </div>
          <div className="align_rights_items" s>
            <div style={
              this.state.payment_data &&
                this.state.payment_data.supporting_document &&
                this.state.payment_data.supporting_document.length > 0
                ?
                { cursor: "pointer" } : {}}
              onClick={() => {
                if (this.state.payment_data &&
                  this.state.payment_data.supporting_document &&
                  this.state.payment_data.supporting_document.length > 0
                ) {

                  if (this.state.payment_data.supporting_document.length > 1) {
                    console.log(this.state.payment_data.supporting_document)
                    this.setState({
                      openModalMultiFile: true,
                      downloadMultiFileTitle: "Download Supporting Document Files",
                      ModalMultiFileData: this.state.payment_data.supporting_document
                    })

                  } else {


                    this.state.payment_data.supporting_document.forEach(item => {
                      if (item && item.supporting_document) {
                        window.open(config.apiGateway.URL + item.supporting_document, '_blank');
                      }
                    })
                  }
                }

              }}
            >
              {
                this.state.payment_data &&
                  this.state.payment_data.supporting_document && this.state.payment_data.supporting_document.length > 0 ?
                  <img style={{ width: "20px", marginTop: "-10px", cursor: "pointer" }} src={buttonSvgrepo} />
                  :
                  "-"
              }


            </div>
          </div>
        </div>
        <div className="main_container_card pt0 fwb ">

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
        <hr />
        <div
          className="header_payment_page_part pt0 mt0"
        >
          <span
            onClick={() => {
              this.setState({
                mode: "transaction",
              });
            }}
            style={{
              color: this.state.mode == "transaction" ? "#9340FF" : "",
              cursor: "pointer",
              textDecoration:
                this.state.mode == "transaction" ? "underline" : "",
            }}>Processed Payments</span>

          <Divider type="vertical" />

          <span
            onClick={() => {
              this.setState({
                mode: "failed",
              });
            }}
            style={{
              color: this.state.mode != "transaction" ? "#9340FF" : "",
              cursor: "pointer",
              textDecoration:
                this.state.mode != "transaction" ? "underline" : "",
            }}
          >
            Failed Payments
          </span>
        </div>
        {this.state.mode == "transaction" ? (
          <DashboardPagePaymentTransactionDetail
            selectediD={this.props.selectediD}
          />
        ) : (
          <DashboardPagePaymentFailedDetail
            selectediD={this.props.selectediD}
          />
        )}

        <Modal
          className="mwf"
          visible={this.state.openModalMultiFile}
          title={this.state.downloadMultiFileTitle}
          onCancel={() => {
            this.setState({
              openModalMultiFile: false,
              downloadMultiFileTitle: "",
              ModalMultiFileData: []
            });
          }}
          footer={null}
        >
          {
            this.state.ModalMultiFileData &&
              this.state.ModalMultiFileData.length > 0 ?
              this.state.ModalMultiFileData.map((item) => (
                <Row type="flex" justify="space-between" className="lineHeightModalStyle">
                  <Col>
                    {
                      item.invoice ? item.invoice.split('/').pop() :
                        item.supporting_document ? item.supporting_document.split('/').pop() : ""
                    }
                  </Col>
                  <Col>
                    <img
                      onClick={() => {
                        item.invoice ?
                          window.open(config.apiGateway.URL + item.invoice, '_blank')
                          :
                          window.open(config.apiGateway.URL + item.supporting_document, '_blank')
                      }}
                      alt="download" style={{ width: "20px", marginTop: "-10px", cursor: "pointer" }} src={buttonSvgrepo} />
                  </Col>
                </Row>
              ))
              :
              <></>
          }

        </Modal>

      </>
    );
  }
}

export default DashboardPagePaymentDetail;
