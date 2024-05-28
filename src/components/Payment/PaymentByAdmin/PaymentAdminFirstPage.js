import { Modal, notification, Radio, Spin ,Button} from 'antd'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { controller } from '../../../controller'
import { Paymentcontroller } from '../../../Paymentcontroller'
import '../../app.local.css' 
import App from "../../stripe/App"
import SinglePaymentAdmin from './SinglePaymentAdmin'
import MultiPayment from './MultiPayment'


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
        const { paymentId } = this.props;


        const response = await Paymentcontroller.get_payment_wizard_data(
            localStorage.getItem("payAdminId")
        )
        const response_logo = await Paymentcontroller.officeprofile(response.office)
        this.setState({ logo: response_logo.logo })

    }

    handleSubmit = async (e) => {
        const { paymentId } = this.props;
        if (localStorage.getItem("wizard_recurring_interval_count_name") == "Single Payment") {
            this.setState({
                paymentMode: "Single Payment"
            })
        } else {
            this.setState({
                paymentMode: "Multi Payment"
            })
        }
    }

    checkDetail = async () => {
        const { paymentId } = this.props;

        localStorage.setItem("paymentId",
            paymentId
        )
        const resp = await Paymentcontroller.checkMultiPaymentDone(
            paymentId
        )

        if (resp.status1 < 250) {
            if (resp.status) {
                window.location.href = "#/wizard-payment-Done"
            }
        }

        const response = await Paymentcontroller.payment_detail(
            paymentId
        )
        if (response.status < 250) {
            if (response) {
                this.setState({ logo: response.office_logo })
            }
            const resp = await Paymentcontroller.checkPayment(
                paymentId
            )
            if (resp.status < 250) {
                if (resp.is_delete) {
                    this.setState({
                        isDelete: true
                    })
                }
                else if (resp.paid || resp.status == "subscription") {
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
    constructor(props) {
        super(props)
        this.state = {
            paymentMode: "loading",
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
        const { paymentId } = this.props;

        const response = await controller.getIntervalsForPayment(paymentId)
        this.setState({
            intervals: response
        })
    }

    render() {
        const { paymentId } = this.props;
        return (
            this.state.paymentMode == "Single Payment" ?
                <SinglePaymentAdmin paymentId={paymentId} />
                :
                this.state.paymentMode == "Multi Payment" ?
                    <MultiPayment paymentId={paymentId} />
                    :
                    this.state.mainLoading ?

                        <div style={{ justifyContent: "center", display: "flex", height: "250px" }}>
                            <Spin size="large" style={{ alignSelf: "center" }} />
                        </div>
                        :
                        <div className='align-center-text'>
                            {
                                this.state.loading ?
                                    <div style={{ justifyContent: "center", display: "flex", height: "250px" }}>
                                        <Spin size="large" style={{ alignSelf: "center" }} />
                                    </div>
                                    :
                                    <>

                                        {
                                            !this.state.isDelete ?
                                                <React.Fragment>
                                                    <div className='header_payment_page_part'>
                                                        Account Balance Due
                                                    </div>
                                                    <span
                                                        className='header_payment_page_part'
                                                        style={{
                                                            fontSize: "12px",
                                                            color: "gray",
                                                            textAlign: "left"
                                                        }}
                                                    >
                                                        Please select your payment method of choice to pay  towards your account balance.
                                                    </span>
                                                    <hr className='endline_payment' />
                                                    <div style={{ display: "table-caption", padding: "15px", lineHeight: "30px", width:"max-content" }} className='main_container_card' >
                                                        <Radio.Group onChange={this.onChange} value={this.state.value}>
                                                            {
                                                                this.state.intervals.map((item) => (
                                                                    <Radio value={item.id} label={item.name}>{item.name}</Radio>
                                                                ))
                                                            }


                                                        </Radio.Group>
                                                    </div>


                                                    <div style={{ marginTop: "18px" }}></div>
                                                    <Button
                                                        disabled={this.state.value ? !this.state.loading ? false : true : true}
                                                        onClick={this.handleSubmit} className="login-btn w100p" style={{ width: "92%" }} type="primary" size='large' >

                                                        {this.state.loading ? "Selecting..." : "Select"}

                                                    </Button>
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


                                        <Modal onCancel={() => {
                                            this.setState({ visibleModal: false })
                                        }} footer={null} title="Payment" visible={this.state.visibleModal} >
                                            <App />
                                        </Modal>
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