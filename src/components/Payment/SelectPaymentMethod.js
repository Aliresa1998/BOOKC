import { Input, Modal, notification, Radio, Spin, Button, Card, Row, Col, Checkbox, Select } from 'antd'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import Logo from '../../assets/img/logo-bookc.png'
import { controller } from '../../controller'
import { Paymentcontroller } from '../../Paymentcontroller'
import '../app.local.css'
import PoweredBy from '../CommonUi/PoweredBy'
import App from "../stripe/App"


import rec from '../../assets/icons/Rectangle 7734.png';
import rec2 from '../../assets/icons/Rectangle 7733.png';

const { Option } = Select

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

  // handleSubmit = () => {
  //   const paymentType = localStorage.getItem("wizard_recurring_interval_count_name") === "Single Payment" ? 'single' : 'wizard';
  //   this.props.onSelectPaymentType(paymentType); // This method should be provided by the parent component.
  // };


  checkDetail = async () => {
    const { selectedPaymentId } = this.props;
    localStorage.setItem("paymentId", selectedPaymentId);

    try {
      const resp = await Paymentcontroller.checkMultiPaymentDone(selectedPaymentId);
      if (resp.status1 < 250 && resp.status) {

      } else {
        const response = await Paymentcontroller.payment_detail(selectedPaymentId);
        if (response.status < 250) {
          if (response) {
            this.setState({ logo: response.office_logo });
          }
          const resp = await Paymentcontroller.checkPayment(selectedPaymentId);
          if (resp.status < 250) {
            if (resp.is_delete) {
              this.setState({
                isDelete: true
              });
            } else if (resp.paid || resp.status === "subscription") {
              localStorage.setItem("paymentId", selectedPaymentId);
              localStorage.setItem("Payment-Receipt", true);

            }
          }
        }
      }
    } catch (error) {
      console.error("Error occurred during payment check:", error);
    }

    setTimeout(() => {
      this.setState({ mainLoading: false });
    }, 100);
  }

  constructor(props) {
    super(props)
    this.state = {
      isDelete: false,
      intervals: [
        { id: '1', name: 'Single Payment' },
        { id: '2', name: 'Multiple Payments' }
      ],
      loading: false,
      value: "",
      logo: "",
      mainLoading: true,
      isChecked: false,
      selectedPaymentType: null,
      payment_data: {},
      paymentType: "",
      selectedIntervalId: null, // State to store the selected interval ID
    }
    this.checkDetail();
    this.getData();
    this.getData = this.getData.bind(this)
    this.onChange = this.onChange.bind(this)
    // this.handleSubmit = this.handleSubmit.bind(this)
    this.handleChange = this.handleChange.bind(this);
    this.getPaymentData = this.getPaymentData.bind(this)
    this.handleIntervalChange = this.handleIntervalChange.bind(this);


  }


  handleChange(e) {
    this.setState({ isChecked: e.target.checked });
  }

  getData = async () => {
    console.log(this.props.selectedPaymentId)
    const response = await controller.getIntervalsForPayment(this.props.selectedPaymentId);
    this.setState({
      intervals: response
    });
  };

  getPaymentData = async () => {
    this.setState({
      loading: true
    });

    const selectedPaymentId = this.props.selectedPaymentId;
    localStorage.setItem("paymentId", selectedPaymentId);

    try {
      const response = await Paymentcontroller.get_payment_data(selectedPaymentId);
      console.log("API Response:", response); // Logging the response to debug

      // Check if response is valid and has data you expect
      if (response && response.interval_data) {
        this.setState({
          payment_data: response,
          loading: false
        });
      } else {
        console.error("Received unexpected response structure:", response);
        this.setState({
          payment_data: { interval_data: [] }, // Ensure interval_data is always an array
          loading: false
        });
      }
    } catch (error) {
      console.error("Error fetching payment data:", error); // Error logging
      this.setState({
        payment_data: { interval_data: [] }, // Defaulting to an empty array in case of error
        loading: false
      });
    }
  };




  // handleCheckboxChange = (selectedId) => {
  //   this.setState(prevState => ({
  //     selectedIntervalId: prevState.selectedIntervalId === selectedId ? null : selectedId
  //   }), () => {
  //     const selectedInterval = this.state.intervals.find(interval => interval.id === this.state.selectedIntervalId);
  //     if (selectedInterval) {
  //       localStorage.setItem("wizard_recurring_interval_count", selectedInterval.id);
  //       localStorage.setItem("wizard_recurring_interval_count_name", selectedInterval.name);
  //       const paymentType = selectedInterval.name === "Single Payment" ? 'single' : 'wizard';
  //       this.props.onSelectPaymentType(paymentType);
  //     } else {
  //       localStorage.removeItem("wizard_recurring_interval_count");
  //       localStorage.removeItem("wizard_recurring_interval_count_name");
  //       this.props.onSelectPaymentType(null); // Handle unselecting
  //     }
  //   });
  // };
  handleCheckboxChange = (selectedPaymentType, selectedId) => {
    this.setState(prevState => ({
      selectedPaymentType: prevState.selectedPaymentType === selectedPaymentType ? null : selectedPaymentType
    }), () => {
      this.getPaymentData().then(() => {
        // Use state directly if appropriate, or ensure localStorage is updated correctly
        const effectivePaymentType = this.state.selectedPaymentType === "Single Payment" ? 'single' : 'wizard';

        this.props.onSelectPaymentType(effectivePaymentType);
        console.log('Effective Payment Type:', effectivePaymentType);
      }).catch(error => {
        console.error('Failed to fetch or process payment data', error);
      });
    });
  };

  // In your child component
  handleIntervalChange = (value) => {
    // Update the state with the new selected interval ID
    this.setState({ selectedIntervalId: value }, () => {
      // After state update, send the selectedIntervalId to the parent component
      this.props.onIntervalSelect(value);
      console.log(value)
    });
  };






  render() {
    const { intervals, selectedIntervalId, selectedPaymentType } = this.state
    console.log('aa')
    console.log(this.state.payment_data)
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
                      <div style={{ padding: "15px", lineHeight: "30px" }} className='main_container_card' >

                        {/* <Card
                            
                            className={`custom-card12 ${selectedIntervalId  ? 'selected-card' : 'not-selected-card'}`}
                            bordered={false}
                          >
                            <div
                              style={{ fontSize: 14, fontWeight: '600', color: '#6B43B5', zIndex: 1000, position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', marginTop: 15, left: 0 }}
                            >
                              <p>Recurring Payment</p>
                            </div>
                            
                            {selectedIntervalId  ? (
                              <img src={rec} alt="" className="image-pay" />
                            ) : (
                              <img src={rec2} alt="" className="image-pay" />
                            )}
                            <Checkbox
                              onChange={() => this.handleCheckboxChange()}
                              checked={selectedIntervalId }
                              className="custom-checkbox"
                            />
                          </Card>

                          <Card
                            
                            className={`custom-card12 ${selectedIntervalId  ? 'selected-card' : 'not-selected-card'}`}
                            bordered={false}
                          >
                            <div
                              style={{ fontSize: 14, fontWeight: '600', color: '#6B43B5', zIndex: 1000, position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', marginTop: 15, left: 0 }}
                            >
                              <p>Single Payment</p>
                            </div>
                            
                            {selectedIntervalId  ? (
                              <img src={rec} alt="" className="image-pay" />
                            ) : (
                              <img src={rec2} alt="" className="image-pay" />
                            )}
                            <Checkbox
                              onChange={() => this.handleCheckboxChange()}
                              checked={selectedIntervalId }
                              className="custom-checkbox"
                            />
                          </Card> */}
                        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                          <Card
                            className={`custom-card12 ${selectedPaymentType === 'Recurring Payment' ? 'selected-card' : 'not-selected-card'}`}
                            bordered={false}
                          >
                            <div
                              style={{ fontSize: 14, fontWeight: '600', color: '#6B43B5', zIndex: 1000, position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', marginTop: 15, left: 0 }}
                            >
                              <p>Recurring Payment</p>
                            </div>
                            <Checkbox
                              onChange={() => this.handleCheckboxChange('Recurring Payment')}
                              checked={selectedPaymentType === 'Recurring Payment'}
                              className="custom-checkbox"
                            />
                            {selectedPaymentType === 'Recurring Payment' ? (
                              <img src={rec} alt="Recurring Payment" className="image-pay" />
                            ) : (
                              <img src={rec2} alt="" className="image-pay" />
                            )}
                          </Card>
                          <Card
                            className={`custom-card12 ${selectedPaymentType === 'Single Payment' ? 'selected-card' : 'not-selected-card'}`}
                            bordered={false}
                          >
                            <div
                              style={{ fontSize: 14, fontWeight: '600', color: '#6B43B5', zIndex: 1000, position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', marginTop: 15, left: 0 }}
                            >
                              <p>Single Payment</p>
                            </div>
                            <Checkbox
                              onChange={() => this.handleCheckboxChange('Single Payment')}
                              checked={selectedPaymentType === 'Single Payment'}
                              className="custom-checkbox"
                            />
                            {selectedPaymentType === 'Single Payment' ? (
                              <img src={rec} alt="Single Payment" className="image-pay" />
                            ) : (
                              <img src={rec2} alt="" className="image-pay" />
                            )}
                          </Card>
                        </div>

                        {/* <Radio.Group onChange={this.onChange} value={this.state.value}>
                          {Array.isArray(intervals) && intervals.map((item) => (
                            <Radio key={item.id} value={item.id} label={item.name}>{item.name}</Radio>
                          ))}

                          <Card
                            className={`custom-card12 ${isChecked ? 'selected-card' : 'not-selected-card'}`}
                            bordered={false}
                          >
                            <div
                              style={{ fontSize: 14, fontWeight: '600', color: '#6B43B5', zIndex: 1000, position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', marginTop: 15, left: 0 }}
                            >
                              <p>Single</p>

                            </div>
                            <div className='row-cont'>
                              <div>Amount</div>
                              <div>1000</div>
                            </div>
                            <div className='row-cont'>
                              <div>Total</div>
                              <div>1000</div>
                            </div>
                            {isChecked ? (
                              <img src={rec} alt="" className="image-pay" />
                            ) : (
                              <img src={rec2} alt="" className="image-pay" />
                            )}

                            <Checkbox onChange={this.handleChange} className="custom-checkbox" />


                          </Card>
                        </Radio.Group> */}

                        {/* {Array.isArray(intervals) && intervals.map((item) => (
                          <Card
                            key={item.id}
                            className={`custom-card12 ${selectedIntervalId === item.id ? 'selected-card' : 'not-selected-card'}`}
                            bordered={false}
                          >
                            <div
                              style={{ fontSize: 14, fontWeight: '600', color: '#6B43B5', zIndex: 1000, position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', marginTop: 15, left: 0 }}
                            >
                              <p>{item.name}</p>
                            </div>
                            
                            {selectedIntervalId === item.id ? (
                              <img src={rec} alt="" className="image-pay" />
                            ) : (
                              <img src={rec2} alt="" className="image-pay" />
                            )}
                            <Checkbox
                              onChange={() => this.handleCheckboxChange(item.id, item.name)}
                              checked={selectedIntervalId === item.id}
                              className="custom-checkbox"
                            />
                          </Card>
                        ))} */}
                      </div>
                      {selectedPaymentType && (
                        <div>
                          {selectedPaymentType === 'Single Payment' ? (
                            <></>
                          ) : (
                            <div>
                              <div>
                                <Select
                                  style={{ width: '45%', height: 42, border: '1px solid #6B43B5', borderRadius: '7px', marginLeft: 15 }}
                                  placeholder='Select Months for Payment'
                                  onChange={this.handleIntervalChange}  // Use the handler directly
                                  value={this.state.selectedIntervalId}
                                >
                                  {this.state.payment_data && this.state.payment_data.interval_data &&
                                    this.state.payment_data.interval_data.map(interval => (
                                      <Option key={interval.id} value={interval.id}>
                                        {interval.interval}
                                      </Option>
                                    ))
                                  }
                                </Select>

                              </div>
                            </div>
                          )}
                        </div>
                      )}


                      {/* <Card
                        className={`custom-card12 ${isChecked ? 'selected-card' : 'not-selected-card'}`}
                        bordered={false}
                      >
                        <div
                          style={{ fontSize: 14, fontWeight: '600', color: '#6B43B5', zIndex: 1000, position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', marginTop: 15, left: 0 }}
                        >
                          <p>Single</p>

                        </div>
                        <div className='row-cont'>
                          <div>Amount</div>
                          <div>1000</div>
                        </div>
                        <div className='row-cont'>
                          <div>Total</div>
                          <div>1000</div>
                        </div>
                        {isChecked ? (
                          <img src={rec} alt="" className="image-pay" />
                        ) : (
                          <img src={rec2} alt="" className="image-pay" />
                        )}

                        <Checkbox onChange={this.handleChange} className="custom-checkbox" />


                      </Card> */}

                      {/* <div style={{ marginTop: "18px" }}></div> */}
                      {/* <Row><Col span={24} style={{ display: 'flex', justifyContent: 'center' }}>
                      
                        <Button
                          disabled={!this.state.selectedIntervalId || this.state.loading}
                          onClick={this.handleSubmit}
                          className="login-btn submit-wizard-btn w100p"
                          type="primary"
                          size='large'
                        >
                          {this.state.loading ? "Selecting..." : "Select"}
                        </Button>
                      </Col></Row> */}
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

