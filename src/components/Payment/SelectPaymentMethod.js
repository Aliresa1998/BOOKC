import { Input, Modal, notification, Radio, Spin,Button,Card,Row,Col } from 'antd'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import Logo from '../../assets/img/logo-bookc.png'
 import { controller } from '../../controller'
import { Paymentcontroller } from '../../Paymentcontroller'
import '../app.local.css'
import PoweredBy from '../CommonUi/PoweredBy'
import App from "../stripe/App"


const { TextArea } = Input;

const styles = theme => ({
  root: {
    width: '90%',
  },
  iconContainer: {
    background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
    borderRadius: 3,
    border: 0,
    color: 'white',
    height: 48,
    padding: '0 30px',
    boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
  },
  button: {
    marginRight: theme.spacing.unit,
  },
  instructions: {
    marginTop: theme.spacing.unit,
    marginBottom: theme.spacing.unit,
  },
  connectorActive: {
    '& $connectorLine': {
      borderColor: theme.palette.secondary.main,
    },
  },
  connectorCompleted: {
    '& $connectorLine': {
      borderColor: theme.palette.primary.main,
    },
  },
  connectorDisabled: {
    '& $connectorLine': {
      borderColor: theme.palette.grey[100],
    },
  },
  connectorLine: {
    transition: theme.transitions.create('border-color'),
  },
})

class SelectPaymentMethod extends Component {
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
  onChange = (e) => {
    localStorage.setItem("wizard_recurring_interval_count", e.target.value)
    localStorage.setItem("wizard_recurring_interval_count_name", e.target.label)
    this.setState({ value: e.target.value })
  }
  getLogo = async () => {
    if (window.location.href.split("/") &&
      window.location.href.split("/")[window.location.href.split("/").length - 1]
    ) {
      const response = await Paymentcontroller.get_payment_wizard_data(
        window.location.href.split("/")[window.location.href.split("/").length - 1]
      )
      const response_logo = await Paymentcontroller.officeprofile(response.office)
      this.setState({ logo: response_logo.logo })
    }
  }
  handleSubmit = async (e) => {
    if (localStorage.getItem("wizard_recurring_interval_count_name") == "Single Payment") {
      window.location.href = "/#/single-payment/" + window.location.href.split("/")[window.location.href.split("/").length - 1]
    } else {
      window.location.href = "/#/wizard-payment/" + window.location.href.split("/")[window.location.href.split("/").length - 1]
    }
  }
  checkDetail = async () => {
    localStorage.setItem("paymentId",
      window.location.href.split("/")[window.location.href.split("/").length - 1]
    )
    const resp = await Paymentcontroller.checkMultiPaymentDone(
      window.location.href.split("/")[window.location.href.split("/").length - 1]
    )

    if (resp.status1 < 250) {
      if (resp.status) {
        window.location.href = "#/wizard-payment-Done"
      }
    }

    if (window.location.href.split("/") &&
      window.location.href.split("/")[window.location.href.split("/").length - 1]
    ) {
      const response = await Paymentcontroller.payment_detail(
        window.location.href.split("/")[window.location.href.split("/").length - 1]
      )
      if (response.status < 250) {
        if (response) {
          this.setState({ logo: response.office_logo })
        }
        const resp = await Paymentcontroller.checkPayment(
          window.location.href.split("/")[window.location.href.split("/").length - 1]
        )
        if (resp.status < 250) {
          if (resp.is_delete) {
            this.setState({
              isDelete: true
            })
          }
          else if (resp.paid|| resp.status == "subscription") {
            localStorage.setItem("paymentId",
              window.location.href.split("/")[window.location.href.split("/").length - 1]
            )
            localStorage.setItem("Payment-Receipt", true)
            window.location.href = "#/payment-Done"
          }

        }
      }
      setTimeout(() => {
        this.setState({ mainLoading: false })
      }, 100)

    }
  }
  constructor(props) {
    super(props)
    this.state = {
      isDelete: false,
      intervals: [],
      loading: false,
      value: "",
      logo: "",
      mainLoading: true
    }
    this.checkDetail();
    this.getData();
    this.getData = this.getData.bind(this)
    this.onChange = this.onChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  getData = async () => {
    const response = await controller.getIntervalsForPayment(window.location.href.split("/")[window.location.href.split("/").length - 1])
    this.setState({
      intervals: response
    })
  }

  render() {

    return (
      this.state.mainLoading ?

        <div style={{ justifyContent: "center", display: "flex", height: "250px" }}>
          <Spin size="large" style={{ alignSelf: "center" }} />
        </div>
        :
        <div>
          {
            this.state.loading ?
              <div style={{ justifyContent: "center", display: "flex", height: "250px" }}>
                <Spin size="large" style={{ alignSelf: "center" }} />
              </div>
              :
              <>
                <div className='dashboard-container'>
                  <div className="pageBody wizard-page" >
                    <div className="page-header">
                      <div className="title pageHeader">
                        {
                          this.state.logo ?
                            <img className='bookcLogo' src={this.state.logo} alt={Logo} />
                            :
                            <div style={{ height: "80px" }}></div>
                        }

                      </div>

                    </div>
                    <Card style={{  borderTop: "5px solid #a677f6"}} bodyStyle={{padding:'10px'}}>

                       
                              {
                                !this.state.isDelete ?
                                  <React.Fragment>
                                    <div className='header_payment_page_part'>
                                      Account Balance Due
                                    </div>
                                    <span
                                      className='header_payment_page_part sub-header-wizard'

                                    >
                                      Please select your payment method of choice to pay  towards your account balance.
                                    </span>
                                    <hr className='endline_payment' />
                                    <div style={{  padding: "15px", lineHeight: "30px" }} className='main_container_card' >
                                      <Radio.Group onChange={this.onChange} value={this.state.value}>
                                        {
                                          this.state.intervals.map((item) => (
                                            <Radio value={item.id} label={item.name}>{item.name}</Radio>
                                          ))
                                        }


                                      </Radio.Group>
                                    </div>


                                    <div style={{ marginTop: "18px" }}></div>
                                    <Row><Col span={24} style={{display:'flex',justifyContent:'center'}}>
  <Button
                                      disabled={this.state.value ? !this.state.loading ? false : true : true}
                                      onClick={this.handleSubmit} className="login-btn submit-wizard-btn w100p"  type="primary" size='large' >

                                      {this.state.loading ? "Selecting..." : "Select"}

                                      </Button></Col></Row>
                                  </React.Fragment>
                                  :
                                  <React.Fragment>
                                    <div className='header_payment_page_part'>
                                      Deleted
                                    </div>

                                    <hr className='endline_payment' />
                                    <div style={{ padding: "15px", lineHeight: "30px" }} className='main_container_card' >
                                      This payment request expired, and we've sent a new payment request for you.
                                    </div>



                                  </React.Fragment>
                              }

                              <div style={{ height: "15px" }}></div>
 
                    </Card>
                  </div>
                </div>
                <Modal onCancel={() => {
                  this.setState({ visibleModal: false })
                }} footer={null} title="Payment" visible={this.state.visibleModal} >
                  <App />
                </Modal>
                <PoweredBy />
              </>
          }



        </div>


    )
  }
}
function mapStateToProps(state) {
  const { creating, error } = state.paymentRequest
  const { profileSummary } = state.dashboard
  return {
    creating,
    error,
    profileSummary
  }
}

const paywiz = connect(mapStateToProps)(SelectPaymentMethod)

export default paywiz

