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
import SelectPaymentMethod from '../Payment/SelectPaymentMethod';
import CustomCard from '../Payment/Components/CustomCard'
import Payment from '../Payment/Payment';
import PaymentWizardStep2 from '../Payment/PaymentWizardStep2';



//Icons
import user from '../../assets/icons/user.png';
import call from '../../assets/icons/call.png';
import sms from '../../assets/icons/sms.png';
import buliding from '../../assets/icons/buliding.png';
import loc from '../../assets/icons/location.png';
import download from '../../assets/icons/frame.png';

class PaymentFirstPage extends Component {
  getPaymentData = async () => {
    this.setState({
      loading: true
    });
    const paymentId = this.props.selectediD;

    localStorage.setItem("paymentId", paymentId);

    const response = await Paymentcontroller.get_payment_data(paymentId);


    this.setState({
      payment_data: response,
      loading: false
    });
  };

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      stripe_complete: true,
      payment_data: {},
      visibleModal: false,
      openModalMultiFile: false,
      downloadMultiFileTitle: "",
      ModalMultiFileData: [],
      selectedPaymentType: null,
      selectedIntervalId: null
    };
    this.getPaymentData();
    this.handlePayment = this.handlePayment.bind(this);
    this.nextOption = this.nextOption.bind(this);
  }
  nextOption = async () => {
    this.props.onNextStep();
  };

  handleDataFromChild = (data) => {
    this.setState({ childData: data });
  }

  handleSelectPaymentType = (paymentType) => {
    this.setState({ selectedPaymentType: paymentType });
  };


  handleIntervalChange = (intervalId) => {
    console.log("Setting Interval ID:", intervalId); // Confirming the input ID
    this.setState({ selectedIntervalId: intervalId }, () => {
      console.log("Updated Interval ID:", this.state.selectedIntervalId); // Confirm state has updated
    });
  };


  // sendData = () => {
  //   this.props.sendDataToParent(this.childData);
  // }



  componentDidUpdate(prevProps, prevState) {
    if (prevProps.selectediD !== this.props.selectediD) {
      this.getPaymentData();
    }
    // Ensure `selectedIntervalId` changes trigger necessary updates or propogations
    if (prevState.selectedIntervalId !== this.state.selectedIntervalId) {
      console.log("Interval ID has changed:", this.state.selectedIntervalId);
      // Trigger any action that depends on updated interval ID
    }
  }


  componentDidMount() {
    if (this.props.selectediD) {
      this.getPaymentData(this.props.selectediD);
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

      <><><Card style={{ marginTop: 25, marginLeft: 15, marginRight: 15 }}>
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <div style={{ marginRight: 65 }}>
            <div style={{ marginBottom: 20, fontSize: '16px' }}>Patient Information</div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 15 }}>
              <img src={user} alt="" style={{ marginRight: 10 }} />
              <span style={{ fontSize: '13px', fontWeight: '400' }}>
                {this.state.payment_data &&
                  this.state.payment_data.guarantor_firstname &&
                  this.state.payment_data.guarantor_lastname
                  ? this.state.payment_data.guarantor_firstname +
                  " " +
                  this.state.payment_data.guarantor_lastname
                  : "-"}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 15 }}>
              <img src={call} alt="" style={{ marginRight: 10 }} />
              <span style={{ fontSize: '13px' }}>
                {this.state.payment_data.guarantor_phone
                  ? this.state.payment_data.guarantor_phone
                  : "-"}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <img src={sms} alt="" style={{ marginRight: 10 }} />
              <span style={{ fontSize: '13px' }}>
                {this.state.payment_data.guarantor_email
                  ? this.state.payment_data.guarantor_email
                  : "-"}
              </span>
            </div>
          </div>
          <div>
            <div style={{ marginBottom: 20, fontSize: '16px' }}>Clinic Information</div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 15 }}>
              <img src={buliding} alt="" style={{ marginRight: 10 }} />
              <span style={{ fontSize: '13px', fontWeight: '400' }}>
                {this.state.payment_data.office_name
                  ? this.state.payment_data.office_name
                  : "-"}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 15 }}>
              <img src={call} alt="" style={{ marginRight: 10 }} />
              <span style={{ fontSize: '13px' }}>
                {this.state.payment_data.office_phone
                  ? this.state.payment_data.office_phone
                  : "-"}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <img src={loc} alt="" style={{ marginRight: 10 }} />
              <span style={{ fontSize: '13px' }}>
                {this.state.payment_data.office_address
                  ? this.state.payment_data.office_address
                  : "-"}
              </span>
            </div>
          </div>
        </div>
      </Card>
        <div className="flex-row12">
          <p className="reason-color">Reason:</p>
          <span className="reason-span">
            {this.state.payment_data.other_reason ? (
              <span>{this.state.payment_data.other_reason}</span>
            ) : (
              <div className='tag-mr'>
                {this.state.payment_data.reason_data &&
                  this.state.payment_data.reason_data.map((item) => (
                    <Tag className="tag_reason" color="rgba(233, 230, 255, 1)">
                      {item.reason}
                    </Tag>

                  ))}
              </div>
            )}
          </span>
        </div>
        <div className="flex-row123" style={{ marginLeft: 15, marginRight: 15 }}>
          <p>Created Date</p>
          <span className="reason-span">
            {this.state.payment_data.created_at
              ? new Date(this.state.payment_data.created_at)
                .toISOString()
                .replace(/T/, " ")
                .replace(/\.\d+Z$/, "")
              : "-"}
          </span>
        </div><div className="flex-row123" style={{ justifyContent: 'space-between' }}>
          <Card className="card-size11">
            <div className="card-size11">
              <div>Patient Invoice</div>
              <Button
                type="text"
                icon={<img src={download} alt="" />}
                style={{ color: "#979797", marginLeft: 'auto', marginRight: 40 }}
                onClick={() => {
                  if (this.state.payment_data &&
                    this.state.payment_data.invoice &&
                    this.state.payment_data.invoice.length > 0) {
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
                          window.open(config.apiGateway.URL + item.invoice, '_blank')
                        }
                      })
                    }

                  }
                }} />
            </div>
          </Card>
          <Card className="card-size11">
            <div className="card-size11">
              <div style={{ width: '90%' }}>Supporting Document</div>
              <Button
                type="text"
                icon={<img src={download} alt="" />}
                style={{ color: "#979797", marginLeft: 'auto', marginRight: 40 }}
                onClick={() => {
                  if (this.state.payment_data &&
                    this.state.payment_data.supporting_document &&
                    this.state.payment_data.supporting_document.length > 0) {

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
                          window.open(config.apiGateway.URL + item.supporting_document, '_blank')
                        }
                      })
                    }
                  }

                }} />
            </div>
          </Card>
        </div>
        <hr />
        <div className="flex-row123">
          <p className="amount-size-color">Amount Due</p>
          <span className="reason-span1">
            {this.state.payment_data.amount
              ? this.state.payment_data.amount
              : "-"}
          </span>
        </div>
        <SelectPaymentMethod selectedPaymentId={this.props.selectediD} onNextStep={this.nextOption} onSelectPaymentType={this.handleSelectPaymentType} onIntervalSelect={this.handleIntervalChange} />
        {this.state.selectedPaymentType === 'single' ? (
          <Payment onNextStep={this.handleNextStep} selectedId={this.props.selectediD} />
        ) : null}
        {this.state.selectedPaymentType === 'wizard' && (
          <PaymentWizardStep2
            onNextStep={this.nextOption}
            selectediD={this.props.selectediD}
            selectedIntervalId={this.state.selectedIntervalId} // Ensure this is from state, not props
          />
        )}

        {/* <div>
          <SelectPaymentMethod
           selectedPaymentId={this.props.selectediD} onNextStep={this.nextOption} onSelectPaymentType={this.handleSelectPaymentType} 
          />

          {this.state.selectedPaymentType === 'single' && (
            <Payment onNextStep={this.handleNextStep} selectedId={this.props.selectedId} />
          )}

          {this.state.selectedPaymentType === 'wizard' && (
            <PaymentWizardStep2 onNextStep={this.handleNextStep} selectedId={this.props.selectedId} />
          )}
        </div> */}
      </></>
    )
  }
}

PaymentFirstPage.propTypes = {
  classes: PropTypes.object,
}

export default PaymentFirstPage; 
