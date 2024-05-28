import { notification, Modal, Tag, Row, Col, Button, Card } from 'antd'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Paymentcontroller } from '../../Paymentcontroller'
import buttonSvgrepoDisabled from '../../assets/img/download-button-svgrepo-com-disabled.svg'
import buttonSvgrepo from '../../assets/img/download-button-svgrepo-com.svg'
import config from '../../config'
import PoweredBy from '../CommonUi/PoweredBy'
import '../app.local.css'
import App from "../stripe/App"
import PaymentPdfDownloader from "./PaymentPdfDownloader"
import CreateGurantorBillingForm from './CreateGurantorBillingForm'

class PaymentFirstPage extends Component {
  getPaymentData = async () => {
    this.setState({
      loading: true
    })
    if (window.location.href.split("/") &&
      window.location.href.split("/")[window.location.href.split("/").length - 1]
    ) {
      localStorage.setItem("paymentId",
        window.location.href.split("/")[window.location.href.split("/").length - 1]
      )
      const response = await Paymentcontroller.get_payment_data(
        window.location.href.split("/")[window.location.href.split("/").length - 1]
      )
      if (response.paid || response.status == "subscription") {
        localStorage.setItem("Payment-Receipt", true)
        window.location.href = "#/payment-Done"
      } else {
        const respo = await Paymentcontroller.checkMultiPaymentDone(
          localStorage.getItem("paymentId")
        )
        if (respo.status) {
          window.location.href = "#/payment-Done"
        }
        localStorage.setItem("Payment-Receipt", false)
      }
      this.setState({
        payment_data: response,
        loading: false
      })
    }

  }
  constructor(props) {
    super(props)
    this.state = {
      loading: true,
      stripe_complete: true,
      payment_data: {},
      visibleModal: false,
      openModalMultiFile: false,
      downloadMultiFileTitle: "",
      ModalMultiFileData: []
    }
    this.getPaymentData();
    this.handlePayment = this.handlePayment.bind(this)
    this.nextOption = this.nextOption.bind(this)
  }
  nextOption = async () => {
    const response = await Paymentcontroller.get_payment_data(
      window.location.href.split("/")[window.location.href.split("/").length - 1]
    )

    if (response.paid || response.status == "subscription") {
      localStorage.setItem("Payment-Receipt", true)
      window.location.href = "#/payment-Done"
    } else {
      localStorage.setItem("Payment-Receipt", false)
      if (!response.billing_complete) {
        this.setState({
          stripe_complete: false
        })
      } else {
        window.location.href = "/#/payment-flow/" + window.location.href.split("/")[window.location.href.split("/").length - 1]
      }
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
    window.location.href = "/#/payment-flow/" + window.location.href.split("/")[window.location.href.split("/").length - 1]

  }

  handlePayment = async () => {
    if (this.state.payment_data.stripe_complete) {
      const response = await Paymentcontroller.paySinglePayment(
        window.location.href.split("/")[window.location.href.split("/").length - 1]
      )

      if (response.status < 250) {
        localStorage.setItem("Payment-Receipt", true)
        window.location.href = "#/payment-Done"
      } else {
        this.openNotification('bottom', response.error ? response.error : "Error", "Error");
      }
    } else {
      this.setState({ visibleModal: true })
    }
  }
  render() {
    return (
      <div>
        <div className='dashboard-container'>
          <div className="pageBody wizard-page">
            <div className="page-header">
              <div className="title pageHeader">
                {
                  this.state.payment_data && this.state.payment_data.office_logo ?
                    <img className='bookcLogo'
                      src={this.state.payment_data.office_logo + ""}
                      alt="logo"
                    />
                    :
                    <></>
                }

              </div>
              <span className='appointmentStep' style={{ fontWeight: "bold" }}>
                {
                  this.state.loading ? "" :
                    this.state.stripe_complete ? "Payment Page" : "Billing Information"
                }
              </span>
            </div>
            <div>
              <Card style={{ borderTop: "5px solid #a677f6" }} bodyStyle={{ padding: '10px' }}>
                <div className='header_payment_page_part'>
                  {
                    !this.state.loading ? "Billing Information" : ""
                  }
                </div>

                {
                  this.state.loading ?
                    <>Loading...</>
                    :
                    !this.state.stripe_complete ?
                      <>
                        <hr className='endline_payment' />

                        <CreateGurantorBillingForm
                          handleSubmit2={this.handleSubmit2}
                        />
                        <div style={{ height: "15px" }}></div>
                      </>
                      :
                      <>
                        <div className='main_container_card '>
                          <div>
                            <div>Name</div>
                            <div>Email</div>
                            <div>Phone</div>
                            <div>Reason</div>
                          </div>
                          <div className='align_rights_items'
                            style={{
                              maxWidth: "400px",
                              marginLeft: "10%"
                            }}
                          >
                            <div>{this.state.payment_data.guarantor_firstname &&
                              this.state.payment_data.guarantor_lastname ?
                              this.state.payment_data.guarantor_firstname + " " + this.state.payment_data.guarantor_lastname : "-"}</div>
                            <div>{this.state.payment_data.guarantor_email ? this.state.payment_data.guarantor_email : "-"}</div>
                            <div>{this.state.payment_data.guarantor_phone ? this.state.payment_data.guarantor_phone : "-"}</div>
                            <div>
                              {
                                this.state.payment_data.other_reason ?
                                  <span>{this.state.payment_data.other_reason}</span>
                                  :
                                  this.state.payment_data.reason_data && this.state.payment_data.reason_data.map((item) => (
                                    <Tag
                                      style={{ marginRight: "0px", marginLeft: "2px" }}
                                      color="purple">{item.reason}</Tag>
                                  ))
                              }
                            </div>
                          </div>
                        </div>
                        <div className='header_payment_page_part'>
                          Clinic Information
                        </div>
                        <div className='main_container_card '>
                          <div style={{ paddingRight: "50px" }}>
                            <div>Name</div>
                            <div>Phone</div>
                            <div>Address</div>
                          </div>
                          <div className='align_rights_items'>
                            <div>{this.state.payment_data.office_name ? this.state.payment_data.office_name : "-"}</div>
                            <div>{this.state.payment_data.office_phone ? this.state.payment_data.office_phone : "-"}</div>
                            <div>{this.state.payment_data.office_address ? this.state.payment_data.office_address : "-"}</div>
                          </div>
                        </div>
                        {
                          this.state.payment_data.status != "canceled" && (
                            <>
                              <div
                                style={{
                                  marginTop: "15px",
                                }}
                                className='main_container_card'>
                                <div>
                                  <div
                                    style={{
                                      fontWeight: "bold",
                                      align: "left"
                                    }}
                                  >Patient Invoice</div>
                                </div>
                                <div className='align_rights_items'>

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
                                  >{
                                      this.state.payment_data &&
                                        this.state.payment_data.invoice ?
                                        <img style={{ width: "20px", marginTop: "-10px", cursor: "pointer" }} src={buttonSvgrepo} />
                                        :
                                        <PaymentPdfDownloader data={
                                          {
                                            Name: this.state.payment_data.guarantor_firstname &&
                                              this.state.payment_data.guarantor_lastname ?
                                              this.state.payment_data.guarantor_firstname + " " + this.state.payment_data.guarantor_lastname : "-",

                                            Email: this.state.payment_data.guarantor_email ? this.state.payment_data.guarantor_email : "-",
                                            Phone: this.state.payment_data.guarantor_phone ? this.state.payment_data.guarantor_phone : "-",
                                            Reason: this.state.payment_data.other_reason ?

                                              this.state.payment_data.other_reason
                                              :
                                              this.state.payment_data.reason_data ? this.state.payment_data.reason_data
                                                :
                                                "-",
                                            Amount: this.state.payment_data.amount ? this.state.payment_data.amount : "-",
                                            Clinic: this.state.payment_data.office_name ? this.state.payment_data.office_name : "-"
                                          }
                                        } />
                                    }
                                  </div>
                                </div>

                              </div>
                              <div className='main_container_card '>
                                <div
                                  style={{

                                    fontWeight: "bold",
                                    align: "left"
                                  }}
                                >
                                  <div> Supporting Document</div>
                                </div>
                                <div className='align_rights_items'>

                                  <div
                                    style={
                                      this.state.payment_data &&
                                        this.state.payment_data.supporting_document &&
                                        this.state.payment_data.supporting_document.length > 0 ?
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

                                  >{
                                      this.state.payment_data &&
                                        this.state.payment_data.supporting_document &&
                                        this.state.payment_data.supporting_document.length > 0
                                        ?
                                        <img style={{ width: "20px", marginTop: "-10px" }} src={buttonSvgrepo} />
                                        :
                                        <img style={{ width: "20px", marginTop: "-10px" }} src={buttonSvgrepoDisabled} />
                                    }
                                  </div>
                                </div>
                              </div>
                            </>
                          )
                        }


                        <hr className='endline_payment' />
                        <div className='main_container_card ' style={{ paddingTop: "0px", fontWeight: "bold" }}>
                          <div>
                            <div>Amount Due</div>
                          </div>
                          <div className='align_rights_items' s>
                            <div>{this.state.payment_data.amount ? this.state.payment_data.amount : "-"}</div>
                          </div>
                        </div>
                        <div style={{ height: "15px" }}></div>

                        <Row><Col span={24} style={{ display: 'flex', justifyContent: 'center' }}>
                          <Button
                            onClick={() => {
                              if (this.state.payment_data && this.state.payment_data.status != "canceled")
                                this.nextOption()
                              //this.setState({ visibleModal: true })
                            }}
                            disabled={this.state.payment_data && this.state.payment_data.status != "canceled" ? false : true}
                            className="login-btn submit-wizard-btn" type="primary" size='large' >
                            {this.state.payment_data.status != "canceled" ? "Next" : "Canceled"}


                          </Button></Col></Row>
                        <div style={{ height: "15px" }}></div>
                      </>
                }
              </Card>
            </div>
          </div>
        </div>
        <Modal onCancel={() => {
          this.setState({ visibleModal: false })
        }} footer={null} title="Payment" visible={this.state.visibleModal} >
          <App />
        </Modal>
        <PoweredBy />


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


      </div >
    )
  }
}

PaymentFirstPage.propTypes = {
  classes: PropTypes.object,
}

export default PaymentFirstPage; 
