import { Row, Button, DatePicker, Input, Modal, Radio, Select, Spin, notification, message } from 'antd'
import { QuestionCircleOutlined, DollarOutlined, CloudUploadOutlined, CloseOutlined, UserOutlined, EnvironmentOutlined, HomeOutlined, MailOutlined } from "@ant-design/icons";
import React, { Component } from 'react'
import Dropzone from 'react-dropzone'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import { Error } from '../../ErrorHandeling'
import { dashboardActions } from '../../actions'
import { controller } from '../../controller'
import DashboardLayout from '../../layout/dashboardLayout/DashboardLayout'
import PayByAdmin from "./PayByAdmin"
import "./style.css"
import { Paymentcontroller } from '../../Paymentcontroller';

const { TextArea } = Input;
const { Option } = Select;

class PaymentRequestPage extends Component {


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
    if (responseMessage === 'APPROVED' || responseMessage === 'APPROVAL' ||
      (window.location.href.includes("/?") && !window.location.href.includes("/?ARid"))
    ) {
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


  handleApprovedCardByHelcim = async (cardToken) => {
    console.log(cardToken)
    var paymentId = ""
    if (localStorage.getItem("singlePaymentId")) {
      paymentId = localStorage.getItem("singlePaymentId")

      const userIP = ""
      try {
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        const userIp0 = ipData.ip;
        const response = await Paymentcontroller.helcimPay(
          paymentId,
          cardToken,
          userIp0
        )

        if (response.status < 250) {
          message.success("Payment successful");
          window.location.href = window.location.origin + window.location.pathname +
            "#/payment-requests"
        } else {
          var errors = Object.keys(response)

          errors.map((resp) =>
            resp != "status" ? message.error(response[resp]) : ""
          )
          this.setState({
            loadingHelcimResultCheck: false
          })
          this.setState({
            loadingHelcimResultCheck: false
          })
        }
      } catch (error) {
        console.error('Error fetching IP address:', error);
      }
    }
    else if (localStorage.getItem("multiPaymentId")) {
      paymentId = localStorage.getItem("multiPaymentId")

      const userIP = ""
      try {
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        const userIp0 = ipData.ip;
        const response = await Paymentcontroller.helcimPayMulti(
          paymentId,
          cardToken,
          userIp0
        )

        if (response.status < 250) {
          message.success("Payment successful");
          window.location.href = window.location.origin + window.location.pathname +
            "#/payment-requests"
        } else {
          var errors = Object.keys(response)

          errors.map((resp) =>
            resp != "status" ? message.error(response[resp]) : ""
          )
          this.setState({
            loadingHelcimResultCheck: false
          })
          this.setState({
            loadingHelcimResultCheck: false
          })
        }
      } catch (error) {
        console.error('Error fetching IP address:', error);
      }
    }
    else {
      return
    }

    localStorage.removeItem("singlePaymentId")
    localStorage.removeItem("multiPaymentId")

  }

  get_patient_data = async () => {
    this.setState({
      loadingPatient: true
    })
    const response = await controller.getGuarantor()
    if (response)
      this.setState({
        patient_information: response,
        loadingPatient: false
      })
  }

  handleChangeSelectPatient = (event) => {
    this.setState({ patient_id: event, newPatientID: event })
  }
  handleChangeSelectProvider = (event) => {
    this.setState({ SelectedProvider: event })
  }

  handleShowModalAddPatient = async () => {
    this.setState({ modal_add_patient: true })
    const responseGetProvider = await controller.get_provider(
      localStorage.getItem("selectedOffice"),
      null
    )
    if (responseGetProvider.status < 250) {
      this.setState({ providerList: responseGetProvider.data })
    }
  }

  disabledDate = (current) => {
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + 29);
    const previousDate = new Date(today);
    previousDate.setDate(today.getDate() - 1);
    return current && (current < today || current > futureDate);
  };
  handleDateChange = (date, e) => {
    this.setState({ inputDate: date, inputDateValue: e });
  };
  handleDateChangeDueDate = (date, e) => {
    this.setState({ inputDateDueDate: date, inputDateValueDueDate: e });
  };

  handleCloseModalAddPatient = () => {
    this.setState({
      other_reason: "",
      showReasonTextBox: false,
      SelectedProvider: null,
      patient_birth_Date: null,
      birth_day_preview: "",
      patient_address: "",
      patient_first_name: "",
      patient_last_name: "",
      patient_email_address: "",
      patient_phone_number: "",
      patient_city: "",
      patient_state: "",
      Zipcode: "",
      formErrorsPatient: {
        pState: {
          massage: "",
          status: true
        },
        Zipcode: {
          massage: "",
          status: true
        },
        Address: {
          massage: "",
          status: true
        },
        BirthDate: {
          massage: "",
          status: true
        },
        SelectProvider: {
          massage: "",
          status: true
        },

        FirstName: {
          massage: "",
          status: true
        },
        LastName: {
          massage: "",
          status: true
        },
        Email: {
          massage: "",
          status: true
        },
        Phone: {
          massage: "",
          status: true
        },
        City: {
          massage: "",
          status: true
        },
      },

    })
    this.setState({ modal_add_patient: false })
  }

  constructor(props) {

    super(props)

    this.state = {
      statement_descriptor: "smilepass",
      payAdminId: -1,
      payStateAdmin: false,
      // payStateAdmin: false,
      payByAdmin: "true",
      inputDate: null,
      inputDateValue: null,
      inputDateDueDate: null,
      inputDateValueDueDate: null,
      loadingPatient: true,
      loadingHelcimResultCheck: true,
      reasons: [],
      available_interval: [],
      birth_day_preview: "",
      loaddingsendPayReq: false,
      patient_id: window.location.href.split("?ARid=")[1] ? localStorage.getItem("guarantor.id") + "" : "",
      patient_name: '',
      patient_email: '',
      patient_phone: '',
      reason: [],
      appointment_datetime: null,
      amount: window.location.href.split("?id=")[1] ?
        eval(localStorage.getItem("totalAmount.id")) : null,
      receipt_file: [],
      supporting_document: [],
      submitted: false,
      collapsed: false,
      patient_information: [],
      modal_add_patient: false,
      newPatientID: window.location.href.split("?ARid=")[1] ? localStorage.getItem("guarantor.id") + "" : "",
      availableIntervals: [],
      providerList: [],
      temp_patient: {},
      temp_flag: false,
      patient_first_name: "",
      patient_last_name: "",
      patient_email_address: "",
      patient_phone_number: "",
      patient_city: "",
      SelectedProvider: "",
      patient_birth_Date: "",
      patient_address: "",
      patient_state: "",
      Zipcode: "",
      formErrorsPayReq: {

        SelectPatient: {
          massage: "",
          status: true
        },
        Reason: {
          massage: "",
          status: true
        },
        AppointmentDate: {
          massage: "",
          status: true
        },
        Amount: {
          massage: "",
          status: true
        },
        StatementDescriptor: {
          massage: "",
          status: true
        },
        InvoicePDF: {
          massage: "",
          status: true
        },
        SupportingPDF: {
          massage: "",
          status: true
        },

      },


      formErrorsPatient: {
        pState: {
          massage: "",
          status: true
        },
        Zipcode: {
          massage: "",
          status: true
        },
        Address: {
          massage: "",
          status: true
        },
        BirthDate: {
          massage: "",
          status: true
        },
        SelectProvider: {
          massage: "",
          status: true
        },
        FirstName: {
          massage: "",
          status: true
        },
        LastName: {
          massage: "",
          status: true
        },
        Email: {
          massage: "",
          status: true
        },
        Phone: {
          massage: "",
          status: true
        },
        City: {
          massage: "",
          status: true
        }
      }


    }

    this.handleChangePaymentTypeAdmin();
    this.getReasons();
    this.handleReadDataIP = this.handleReadDataIP.bind(this);
    this.handleApprovedCardByHelcim = this.handleApprovedCardByHelcim.bind(this)
    this.handleSearchPatient = this.handleSearchPatient.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleDateChange = this.handleDateChange.bind(this)
    this.handleDateChangeDueDate = this.handleDateChangeDueDate.bind(this)
    this.getIntervals = this.getIntervals.bind(this)

    this.handleBirthDateChange = this.handleBirthDateChange.bind(this)
    this.handleMenuClick = this.handleMenuClick.bind(this)
    this.handleUpload = this.handleUpload.bind(this)

    this.props.dispatch(dashboardActions.fetchProfileSummary())
    this.get_patient_data();
    this.getIntervals();

  }


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

  handleChangePaymentTypeAdmin = (e) => {
    if (localStorage.getItem("wizard_recurring_interval_count_name")) {
      localStorage.removeItem("wizard_recurring_interval_count_name")
    }
    if (e && e.target && e.target.value) {
      console.log(e.target.value)
      this.setState({
        payByAdmin: e.target.value == "true" ? "true" : "false"
      })
    }
  }

  handleUpload = e => {
    var files = this.state.receipt_file
    for (var i in e) {
      if (e[i] && e[i].name) {
        files.push(e[i])
        this.setState({ receipt_file: files })
      } else {
        files.push(e.target.files[i])
        this.setState({ receipt_file: files })
      }
    }
  }

  getReasons = async () => {
    const response = await controller.getReasonsList();
    this.setState({
      reasons: response
    })

  }

  getIntervals = async () => {
    const response = await controller.getAvailableIntervals();
    this.setState({
      availableIntervals: response
    })

  }



  goToDashboard = () => {
    this.props.dispatch(push(`/payment-requests`))
  }



  handleSubmitPayAdmin = async (e) => {
    e.preventDefault()
    this.setState({ submitted: true, loaddingsendPayReq: true })


    const SelectPatient_validation = await Error.SelectItem(this.state.patient_id)
    const Reason_validation = await Error.SelectItem(this.state.reason)
    const Amount_validation = await Error.AmountHandling(this.state.amount)
    const StatementDescriptor_validation = await Error.StatementHandling(this.state.statement_descriptor)
    this.setState({
      formErrorsPayReq: {
        SelectPatient: SelectPatient_validation,
        Reason: Reason_validation,
        Amount: Amount_validation,
        StatementDescriptor: StatementDescriptor_validation,
      }
    })
    if (
      SelectPatient_validation.status &&
      Amount_validation.status &&
      StatementDescriptor_validation.status
    ) {
      let phone_number = this.state.patient_phone
      if (phone_number.indexOf("+1") != 0) {
        if (phone_number.indexOf("1") == 0) {
          phone_number = "+" + phone_number
        } else {
          phone_number = "+1" + phone_number
        }
      }

      var allIntervals = [];
      this.state.availableIntervals.map((interval) => (
        allIntervals.push(interval.id)
      ))

      const data = {
        available_interval: this.state.payByAdmin == "true" ? allIntervals : this.state.available_interval,
        patient_id: this.state.patient_id,
        office_id: localStorage.getItem("selectedOffice"),
        reason: this.state.reason ? this.state.reason : [],
        other_reason: this.state.other_reason ? this.state.other_reason : "",
        amount: this.state.amount,
        receipt_file: this.state.receipt_file,
        supporting_document: this.state.supporting_document,
        statement_descriptor: this.state.statement_descriptor
      }

      let formData = new FormData();
      data.available_interval.forEach(item => {
        formData.append('available_interval', item);
      });

      if (data.reason && data.reason.length > 0) {

        data.reason.forEach(reason => {
          formData.append('reason_text', reason);
        });
      } else {
        formData.append('other_reason', data.other_reason);
      }

      formData.append('statement_descriptor', data.statement_descriptor);
      formData.append('guarantor', data.patient_id);
      formData.append('office', data.office_id);
      formData.append('amount', data.amount);

      if (data.receipt_file) {
        data.receipt_file.forEach(item => {
          formData.append('invoices', item);
        });
      }

      if (data.supporting_document) {
        data.supporting_document.forEach(item => {
          formData.append('supporting_documents', item);
        });
      }
      if (window.location.href.split("?id=")[1]) {
        formData.append('accounts_receivable', window.location.href.split("?id=")[1])
        localStorage.removeItem("guarantor.id")
      }

      if (
        this.state.inputDate
      ) {
        formData.append('start_date', (this.state.inputDateValue))

      }

      if (
        this.state.inputDateValueDueDate
      ) {
        formData.append('due_date', (this.state.inputDateValueDueDate))

      }
      if (
        this.state.payByAdmin == "true"
      ) {
        formData.append('is_by_admin', true)

      }

      const response =
        window.location.href.split("?id=")[1] ?
          await controller.createPayReqAR(formData)
          :
          await controller.createPayReq(formData)
      if (response.status < 250) {
        this.openNotification('bottom', response.message ? response.message : "", "Successful");
        if (this.state.payByAdmin == "true") {
          localStorage.setItem("payAdminId", response.id)
          this.setState({
            payAdminId: response.id,
            payStateAdmin: true
          })
        }
      } else {
        this.openNotification('bottom', response.detail ? response.detail : response.massage, "Error");
        this.setState({
          formErrorsPayReq: {
            StatementDescriptor_validation: {
              massage: response.statement_descriptor ? response.statement_descriptor[0] : "",
              status: response.statement_descriptor ? false : true
            },
            SelectPatient: {
              massage: response.patient ? response.patient[0] : "",
              status: response.patient ? false : true
            },
            SupportingPDF: {
              massage: response.supporting_document ? response.supporting_document[0] : "",
              status: response.supporting_document ? false : true
            },
            InvoicePDF: {
              massage: response.invoice ? response.invoice[0] : "",
              status: response.invoice ? false : true
            },
            Amount: {
              massage: response.amount ? response.amount[0] : "",
              status: response.amount ? false : true
            },
            Reason: {
              massage: response.reason_text ? response.reason_text[0] : "",
              status: response.reason_text ? false : true
            },
          }
        })
      }
    }
    this.setState({ loaddingsendPayReq: false })
  }

  handleSubmit = async (e) => {
    e.preventDefault()
    this.setState({ submitted: true, loaddingsendPayReq: true })


    const SelectPatient_validation = await Error.SelectItem(this.state.patient_id)
    const Reason_validation = await Error.SelectItem(this.state.reason)
    const Amount_validation = await Error.AmountHandling(this.state.amount)
    const StatementDescriptor_validation = await Error.StatementHandling(this.state.statement_descriptor)

    console.log(StatementDescriptor_validation)

    this.setState({
      formErrorsPayReq: {
        SelectPatient: SelectPatient_validation,
        Reason: Reason_validation,
        Amount: Amount_validation,
        StatementDescriptor: StatementDescriptor_validation,
      }
    })
    if (
      SelectPatient_validation.status &&
      Amount_validation.status &&
      StatementDescriptor_validation.status
    ) {
      let phone_number = this.state.patient_phone
      if (phone_number.indexOf("+1") != 0) {
        if (phone_number.indexOf("1") == 0) {
          phone_number = "+" + phone_number
        } else {
          phone_number = "+1" + phone_number
        }
      }

      var allIntervals = [];
      this.state.availableIntervals.map((interval) => (
        allIntervals.push(interval.id)
      ))

      const data = {
        available_interval: this.state.payByAdmin == "true" ? allIntervals : this.state.available_interval,
        patient_id: this.state.patient_id,
        office_id: localStorage.getItem("selectedOffice"),
        reason: this.state.reason ? this.state.reason : [],
        other_reason: this.state.other_reason ? this.state.other_reason : "",
        amount: this.state.amount,
        receipt_file: this.state.receipt_file,
        supporting_document: this.state.supporting_document,
        statement_descriptor: this.state.statement_descriptor
      }

      let formData = new FormData();
      data.available_interval.forEach(item => {
        formData.append('available_interval', item);
      });

      if (data.reason && data.reason.length > 0) {

        data.reason.forEach(reason => {
          formData.append('reason_text', reason);
        });
      } else {
        formData.append('other_reason', data.other_reason);
      }
      formData.append('statement_descriptor', data.statement_descriptor);
      formData.append('guarantor', data.patient_id);
      formData.append('office', data.office_id);
      formData.append('amount', data.amount);
      // if (data.receipt_file) {
      //   for (var i in data.receipt_file) {
      //     console.log(data.receipt_file[i])
      //     formData.append('invoice', data.receipt_file[i]);
      //   }
      // }

      if (data.receipt_file) {
        data.receipt_file.forEach(item => {
          formData.append('invoices', item);
        });
      }

      if (data.supporting_document) {
        data.supporting_document.forEach(item => {
          formData.append('supporting_documents', item);
        });
      }


      if (window.location.href.split("?id=")[1]) {
        formData.append('accounts_receivable', window.location.href.split("?id=")[1])
        localStorage.removeItem("guarantor.id")
      }

      if (
        this.state.inputDate
      ) {
        formData.append('start_date', (this.state.inputDateValue))

      }

      if (
        this.state.inputDateValueDueDate
      ) {
        formData.append('due_date', (this.state.inputDateValueDueDate))

      }
      const response =
        window.location.href.split("?id=")[1] ?
          await controller.createPayReqAR(formData)
          :
          await controller.createPayReq(formData)
      if (response.status < 250) {
        this.openNotification('bottom', response.message ? response.message : "", "Successful");
        if (this.state.payByAdmin == "true") {
          console.log(response)
          window.location.href = "#/payment/" + response.id
        } else {
          window.location.href = "#/payment-requests"
        }

      } else {
        this.openNotification('bottom', response.detail ? response.detail : response.massage, "Error");
        this.setState({
          formErrorsPayReq: {
            StatementDescriptor_validation: {
              massage: response.statement_descriptor ? response.statement_descriptor[0] : "",
              status: response.statement_descriptor ? false : true
            },
            SelectPatient: {
              massage: response.patient ? response.patient[0] : "",
              status: response.patient ? false : true
            },
            SupportingPDF: {
              massage: response.supporting_document ? response.supporting_document[0] : "",
              status: response.supporting_document ? false : true
            },
            InvoicePDF: {
              massage: response.invoice ? response.invoice[0] : "",
              status: response.invoice ? false : true
            },
            Amount: {
              massage: response.amount ? response.amount[0] : "",
              status: response.amount ? false : true
            },
            Reason: {
              massage: response.reason_text ? response.reason_text[0] : "",
              status: response.reason_text ? false : true
            },
          }
        })
      }
    }
    this.setState({ loaddingsendPayReq: false })
  }

  onCollapse = collapsed => {
    this.setState({ collapsed })
  }

  handleSearchPatient = async (e) => {
    const response = await controller.get_guarantor_search(localStorage.getItem("selectedOffice"), e)
    if (response)
      this.setState({ patient_information: response })
  }

  handleChange(e) {
    let { name, value } = e.target


    if (name == "patient_phone_number") {
      value = value.replace(/ /g, "")
      if (value.length < 10) {
        if (value.length == 8) {
          value = value.replace(/ /g, "")
          this.setState({ "patient_phone_number": value.slice(0, 3) + " " + value.slice(3, 6) + " " + value.slice(6,) })
        }
        else {
          value = value.replace(/[^\dA-Z]/g, '').replace(/(.{3})/g, '$1 ').trim();
          this.setState({ [name]: value })
        }
      }
      if (value.length == 10) {


        value = value.slice(0, 3) + " " + value.slice(3, 6) + " " + value.slice(6,)
        this.setState({ [name]: value })
      }
    }

    else {

      this.setState({ [name]: value })
    }
  }
  handleUploadSupportingDocument = e => {
    console.log(e)
    var files = this.state.supporting_document
    for (var i in e) {
      if (e[i] && e[i].name) {
        files.push(e[i])
        this.setState({ supporting_document: files })
      } else {
        files.push(e.target.files[i])
        this.setState({ supporting_document: files })
      }
    }

  }

  handleDateChange(value, dateString) {
    this.setState({
      ...this.state,
      appointment_datetime: dateString
    })
  }
  handleBirthDateChange(value, dateString) {
    this.setState({
      ...this.state,
      birth_day_preview: value,
      patient_birth_Date: dateString
    })

  }

  handleMenuClick(e) {
    this.setState({
      ...this.state,
      reason: e.item.props.children[1]
    })
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
  handleSearchOfficeID = (event) => {
  }
  createNewPatient = async () => {
    const patient_first_name_validation = await Error.NameHandling(this.state.patient_first_name)
    const patient_last_name_validation = await Error.NameHandling(this.state.patient_last_name)
    //const patient_email_address_validation = await Error.EmailHandling(this.state.patient_email_address)
    //const patient_phone_number_validation = await Error.PhoneHandling(this.state.patient_phone_number.replace(/ /g, ""))
    const patient_city_validation = await Error.NameHandling(this.state.patient_city)
    //const patient_birth_Date_validation = await Error.BirthDateHandling(this.state.patient_birth_Date)
    const patient_address_validation = await Error.SelectItem(this.state.patient_address)
    const zipcode_validation = await Error.SelectItem(this.state.Zipcode)
    const pstate_validation = await Error.SelectItem(this.state.patient_state)

    const email_or_phone_validation = await Error.EmailOrPhoneHandling(this.state.patient_email_address, this.state.patient_phone_number.replace(/ /g, ""))

    console.log("email_or_phone_validation", email_or_phone_validation)
    if (
      patient_first_name_validation.status &&
      patient_last_name_validation.status &&
      //patient_email_address_validation.status &&
      //patient_phone_number_validation.status &&
      //patient_birth_Date_validation.status &&
      email_or_phone_validation.status &&
      patient_address_validation.status &&
      zipcode_validation.status &&
      pstate_validation.status &&
      patient_city_validation.status
    ) {
      const response = await controller.createGuarantor(
        this.state.patient_first_name,
        this.state.patient_last_name,
        this.state.patient_email_address,
        this.state.patient_phone_number.replace(/ /g, ""),
        this.state.patient_city,
        this.state.patient_birth_Date,
        this.state.patient_address,
        this.state.patient_state,
        this.state.Zipcode,
      )
      if (response.status < 250) {
        this.setState({
          patient_id: response.id,

          formErrorsPatient: {
            Zipcode: {
              massage: "",
              status: true
            },
            pState: {
              massage: "",
              status: true
            },
            Address: {
              massage: "",
              status: true
            },
            BirthDate: {
              massage: "",
              status: true
            },
            SelectProvider: {
              massage: "",
              status: true
            },
            FirstName: {
              massage: "",
              status: true
            },
            LastName: {
              massage: "",
              status: true
            },
            Email: {
              massage: "",
              status: true
            },
            Phone: {
              massage: "",
              status: true
            },
            City: {
              massage: "",
              status: true
            },
          }
        })
        this.openNotification('bottom', response.message, "Successful");

        this.setState({
          patient_first_name: "",
          patient_last_name: "",
          patient_email_address: "",
          patient_phone_number: "",
          patient_city: "",
          SelectedProvider: null,
          patient_birth_Date: null,
          birth_day_preview: "",
          patient_address: "",
          patient_state: "",
          Zipcode: "",

        })
        this.setState({
          modal_add_patient: false,

        })
        const response_get_patient = await controller.getGuarantor()
        this.setState({
          patient_information: response_get_patient,
          newPatientID: response.id + ""
        })
      } else {
        this.openNotification('bottom', response.detail, "Error");
        this.setState({
          formErrorsPatient: {
            pState: {
              massage: response.state ? response.state[0] : "",
              status: response.state ? false : true
            },
            Zipcode: {
              massage: response.zipcode ? response.zipcode[0] : "",
              status: response.zipcode ? false : true
            },
            Address: {
              massage: response.address ? response.address[0] : "",
              status: response.address ? false : true
            },
            BirthDate: {
              massage: response.birth_date ? response.birth_date[0] : "",
              status: response.birth_date ? false : true
            },
            FirstName: {
              massage: response.first_name ? response.first_name[0] : "",
              status: response.first_name ? false : true
            },
            LastName: {
              massage: response.last_name ? response.last_name[0] : "",
              status: response.last_name ? false : true
            },
            Email: {
              massage: response.email ? response.email[0] : "",
              status: response.email ? false : true
            },
            Phone: {
              massage: response.phone ? response.phone[0] : "",
              status: response.phone ? false : true
            },
            City: {
              massage: response.city ? response.city[0] : "",
              status: response.city ? false : true
            },


          }
        })
      }
    } else {
      this.setState({
        formErrorsPatient: {
          Email: email_or_phone_validation.type == "email" ?
            email_or_phone_validation
            :
            {
              massage: '',
              status: true,
            },
          FirstName: patient_first_name_validation,
          LastName: patient_last_name_validation,
          Phone: email_or_phone_validation.type == "phone" ?
            email_or_phone_validation
            :
            {
              massage: '',
              status: true,
            },
          City: patient_city_validation,
          Address: patient_address_validation,
          //BirthDate: patient_birth_Date_validation,
          Zipcode: zipcode_validation,
          pState: pstate_validation,
        }

      })
    }
  }

  render() {

    const { creating, error, profileSummary } = this.props

    const patient_name_error = this.state.submitted && error && error.data && error.data.patient_name
    const patient_phone_error = this.state.submitted && error && error.data && error.data.patient_phone
    const patient_email_error = this.state.submitted && error && error.data && error.data.patient_email
    const datetime_error = this.state.submitted && error && error.data && error.data.appointment_datetime
    const amount_error = this.state.submitted && error && error.data && error.data.amount

    const button_text = this.state.loaddingsendPayReq ? 'Sending ...' : 'Send'

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
        <DashboardLayout
          breadCrumb={'Send Payment Request'}
          logo={(profileSummary && profileSummary.logo) ? profileSummary.logo : ''}
          footerLogo={true}
        >
          <div className="paymentRequestContent">
            <div className="payreq-container">
              {
                this.state.payStateAdmin == true ?
                  <div className="content-payreq">
                    <PayByAdmin id={this.state.payAdminId} />
                    {/* <PayByAdmin id={95} /> */}
                  </div>
                  :

                  <div className="content-payreq">


                    {this.state.submitted && !creating && error && error.message &&
                      <div className="alert">{error.message}</div>
                    }

                    <label className='formLabel'>Type of payment</label>
                    <div style={{ display: 'flex', flexDirection: 'row', width: '450px' }}>
                      <Radio.Group buttonStyle='solid' className='radio-button-group-payreq' size="large" value={this.state.payByAdmin} onChange={this.handleChangePaymentTypeAdmin}>
                        <Radio.Button className='radiobutton-payreq' value={"true"} >
                          <span style={{ color: this.state.payByAdmin == "true" ? "#FFF " : "" }}>
                            In-office Payment
                          </span>
                        </Radio.Button>

                        <Radio.Button className='radiobutton-payreq' value={"false"} >
                          <span style={{ color: this.state.payByAdmin == "false" ? "#FFF " : "" }}>
                            Email/Text Payment
                          </span>
                        </Radio.Button>
                      </Radio.Group>
                    </div>

                    <label className='formLabel'>Patient</label>
                    <div style={{ display: "flex" }}>
                      {
                        window.location.href.split("?id=")[1] ?

                          "(" + localStorage.getItem("guarantor.id") + ") " + localStorage.getItem("gurantor.name")
                          :
                          <>
                            <Select
                              showSearch
                              className={this.state.formErrorsPayReq &&
                                this.state.formErrorsPayReq.SelectPatient &&
                                this.state.formErrorsPayReq.SelectPatient.status ? "inputs" : "inputs-error"}
                              value={this.state.newPatientID ? this.state.newPatientID : undefined}
                              onSearch={(event) => this.handleSearchPatient(event)}
                              mode="single"
                              style={{ width: '100%', height: "fit-content" }}
                              placeholder="Patient"
                              filterOption={(input, option) =>
                                option.props.children
                              }
                              onChange={(event) => this.handleChangeSelectPatient(event)}
                            >
                              {
                                this.state.loadingPatient ?
                                  <Option key="loading...">Loading <Spin /></Option>
                                  :
                                  this.state.patient_information && this.state.patient_information.length > 0 ?
                                    this.state.patient_information.length > 50 ?
                                      this.state.patient_information.slice(0, 50).map((patient) =>
                                        <Option value={patient.id + ""} key={patient.id}>
                                          {"(" + patient.id + ") " + patient.firstname + " " + patient.lastname}
                                        </Option>
                                      )
                                      :
                                      this.state.patient_information.map((patient) =>
                                        <Option value={patient.id + ""} key={patient.id}>
                                          {"(" + patient.id + ") " + patient.firstname + " " + patient.lastname}
                                        </Option>
                                      )
                                    :
                                    <Option disabled key={-2}>empty</Option>
                              }
                            </Select>

                            <Button
                              className='login-btn'
                              onClick={
                                () => this.handleShowModalAddPatient()}
                              style={
                                {
                                  marginLeft: "5px",
                                  backgroundColor: "#47a1b0",
                                  border: "0px"
                                }}
                              type='primary'
                            >
                              Add Patient
                            </Button>
                          </>
                      }


                    </div>

                    {
                      this.state.formErrorsPayReq && this.state.formErrorsPayReq.SelectPatient &&
                        this.state.formErrorsPayReq.SelectPatient.status ?
                        <></>
                        :
                        <div className='error-text'>
                          {this.state.formErrorsPayReq.SelectPatient.massage}
                        </div>
                    }
                    <label className='formLabel'>Reason</label>
                    <div style={{ marginBottom: '10px' }}>

                      <Select
                        mode={this.state.showReasonTextBox ? "single" : "multiple"}
                        style={{ width: '100%' }}
                        placeholder="Select Reasons"
                        name="intervals"
                        value={!this.state.showReasonTextBox ? this.state.reason : "Other"}
                        onChange={(e) => {
                          if (e && e.length > 0 && e.lastIndexOf("Other") != -1) {
                            this.setState({
                              showReasonTextBox: true,
                              reason: []
                            })
                          } else {
                            this.setState({
                              reason: e,
                              other_reason: "",
                              showReasonTextBox: false
                            })
                          }

                        }}
                        optionLabelProp="label"
                      >
                        {
                          this.state.reasons.map((reason) => (
                            <Option value={reason.id} label={reason.reason}>
                              {reason.reason}
                            </Option>
                          ))
                        }
                        <Option value={"Other"} label={"Other"}>
                          Other
                        </Option>

                      </Select>
                    </div>
                    {
                      this.state.showReasonTextBox ?
                        <div className="formInputs">
                          <TextArea
                            rows={4}
                            onChange={this.handleChange}
                            name="other_reason"
                            type="text"
                            placeholder="Reason for appointment"
                            value={this.state.other_reason}
                            prefix={<QuestionCircleOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                          />
                        </div>
                        :
                        <></>
                    }





                    {
                      this.state.payByAdmin == "false" && (
                        <>


                          <label className='formLabel'>Payment Options</label>
                          <div style={{ marginBottom: '10px' }}>
                            <Select
                              mode="multiple"
                              style={{ width: '100%' }}
                              placeholder="Select Payment Options"
                              name="intervals"

                              onChange={(e) => {
                                this.setState({
                                  available_interval: e
                                })
                              }}
                              optionLabelProp="label"
                            >
                              {
                                this.state.availableIntervals.map((interval) => (
                                  <Option value={interval.id} label={interval.name}>
                                    {interval.name}
                                  </Option>
                                ))
                              }
                            </Select>
                          </div>
                        </>
                      )
                    }

                    <label className='formLabel'>Amount</label>
                    <Input
                      onChange={this.handleChange}
                      className={this.state.formErrorsPayReq &&
                        this.state.formErrorsPayReq.Amount &&
                        this.state.formErrorsPayReq.Amount.status ? "" : "inputs-error"}
                      name="amount"
                      type="decimal"
                      placeholder="Enter amount in dollars"
                      value={this.state.amount}
                      prefix={<DollarOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                    />
                    {
                      this.state.formErrorsPayReq && this.state.formErrorsPayReq.Amount &&
                        this.state.formErrorsPayReq.Amount.status ?
                        <></>
                        :
                        <div className='error-text'>
                          {this.state.formErrorsPayReq.Amount.massage}
                        </div>
                    }

                    {/* <label className='formLabel'>Statement Descriptor</label>
                     <Input
                      onChange={this.handleChange}
                      className={this.state.formErrorsPayReq &&
                        this.state.formErrorsPayReq.StatementDescriptor &&
                        this.state.formErrorsPayReq.StatementDescriptor.status ? "inputs" : "inputs-error"}
                      name="statement_descriptor"
                      type="decimal"
                      placeholder="Statement Descriptor"
                      value={this.state.statement_descriptor}
                    /> */}
                    {
                      this.state.formErrorsPayReq && this.state.formErrorsPayReq.StatementDescriptor &&
                        this.state.formErrorsPayReq.StatementDescriptor.status ?
                        <></>
                        :
                        <div className='error-text'>
                          {this.state.formErrorsPayReq.StatementDescriptor.massage}
                        </div>
                    }

                    <label className='formLabel'>Start Date</label>
                    <div style={{ marginBottom: '10px' }}>
                      <DatePicker
                        disabledDate={this.disabledDate}
                        onChange={this.handleDateChange}
                        value={this.state.inputDate}
                        className='w100p'
                      />
                    </div>

                    <label className='formLabel'>Due Date</label>
                    <div style={{ marginBottom: '10px' }}>
                      <DatePicker
                        onChange={this.handleDateChangeDueDate}
                        value={this.state.inputDateDueDate}
                        className='w100p'
                      />
                    </div>

                    <label className='formLabel'>Invoice PDF file</label>
                    <Dropzone
                      multiple={true}
                      accept={{
                        'file/pdf': ['.pdf'],

                      }} onDrop={e => this.handleUpload(e)} onClick={(e) => {
                        e.preventDefault();
                      }}>
                      {({ getRootProps, getInputProps }) => (
                        <section className="container">
                          <div {...getRootProps({ className: 'dropzone' })}>
                            <input {...getInputProps()} />


                            <label className='formLabel '
                              style={{
                                color: "gray",
                                backgroundColor: "#E4DCF5",
                                display: "flex",
                                height: "60px",
                                alignItems: "center",
                                justifyContent: "center",
                                border: "1px dashed #7A08FA",
                                cursor: "pointer",
                                maxWidth: "360px",
                                minWidth: "unset",
                                padding: "15px"
                              }
                              }
                            >
                              <div style={{ marginRight: "8px" }}>
                                <CloudUploadOutlined style={{ fontSize: "25px" }} />
                              </div>
                              <div>Uploading Invoice File</div>
                              <div className="upload-peyment-pdf" style={{ marginBottom: '50px' }}>

                              </div>
                            </label>
                          </div>
                        </section>
                      )}
                    </Dropzone>
                    {
                      this.state.receipt_file && this.state.receipt_file.length > 0 ?
                        this.state.receipt_file.map((file) => (
                          file.name && (
                            <div style={{ display: "flex", justifyContent: "center" }}>
                              <div>
                                <span style={{ fontWeight: "bold" }}> {file.name + " "}</span>
                                selected
                              </div>
                              <div

                                onClick={() => {
                                  var myfiles = this.state.receipt_file
                                  const newArray = myfiles.filter(item => item.name !== file.name);
                                  this.setState({
                                    receipt_file: newArray
                                  })
                                }}
                                style={{ cursor: "pointer", fontSize: "10px" }}
                              >
                                <CloseOutlined />
                              </div>

                            </div>)
                        ))

                        : <></>
                    }

                    <label className='formLabel'>Supporting Document</label>
                    <div style={{ marginBottom: '50px' }}>
                      <Dropzone
                        multiple={true}
                        accept={{
                          'file/pdf': ['.pdf'],

                        }} onDrop={e => this.handleUploadSupportingDocument(e)} onClick={(e) => {
                          e.preventDefault();
                        }}>
                        {({ getRootProps, getInputProps }) => (
                          <section className="container">
                            <div {...getRootProps({ className: 'dropzone' })}>
                              <input {...getInputProps()} />


                              <label className='formLabel '
                                style={{
                                  color: "gray",
                                  backgroundColor: "#E4DCF5",
                                  display: "flex",
                                  height: "60px",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  border: "1px dashed #7A08FA",
                                  cursor: "pointer",
                                  maxWidth: "360px",
                                  minWidth: "unset",
                                  padding: "15px"
                                }
                                }
                              >
                                <div style={{ marginRight: "8px" }}>
                                  <CloudUploadOutlined style={{ fontSize: "25px" }} />
                                </div>
                                <div>Uploading Supporting Document</div>
                                <div className="upload-peyment-pdf" style={{ marginBottom: '50px' }}>

                                </div>
                              </label>
                            </div>
                          </section>
                        )}
                      </Dropzone>
                      {
                        this.state.supporting_document && this.state.supporting_document.length > 0 ?
                          this.state.supporting_document.map((file) => (
                            file.name && (
                              <div style={{ display: "flex", justifyContent: "center" }}>
                                <div>
                                  <span style={{ fontWeight: "bold" }}> {file.name + " "}</span>
                                  selected
                                </div>
                                <div

                                  onClick={() => {
                                    var myfiles = this.state.supporting_document
                                    const newArray = myfiles.filter(item => item.name !== file.name);
                                    this.setState({
                                      supporting_document: newArray
                                    })
                                  }}
                                  style={{ cursor: "pointer", fontSize: "10px" }}
                                >
                                  <CloseOutlined />
                                </div>
                              </div>)
                          ))

                          : <></>
                      }
                    </div>

                    <div className="btnBox" style={{ display: "flex" }}>
                      <button className='whiteBtn cancel-btn' onClick={this.goToDashboard}>Back</button>

                      <button
                        onClick={this.state.payByAdmin == "true" ? this.handleSubmitPayAdmin : this.handleSubmit}
                        className='createBtn login-btn'
                        type="submit"
                        disabled={this.state.loaddingsendPayReq}>
                        {
                          this.state.payByAdmin == "true" ?

                            this.state.loaddingsendPayReq ? "Go to Payment Flow..." : "Pay"
                            :
                            this.state.loaddingsendPayReq ? "Sending..." : "Send"
                        }
                      </button>
                    </div>

                  </div>
              }
            </div>
          </div>
          <Modal title="Add Patient"
            open={this.state.modal_add_patient}
            okText='Create new Patient'
            onOk={() => this.createNewPatient()}
            onCancel={() => this.handleCloseModalAddPatient()}
          >
            <label className='formLabel'>First Name</label>
            <Input
              onChange={this.handleChange}
              className={this.state.formErrorsPatient &&
                this.state.formErrorsPatient.FirstName &&
                this.state.formErrorsPatient.FirstName.massage == '' ? "" : "inputs-error"}
              type="text"
              name="patient_first_name"
              placeholder="John"
              value={this.state.patient_first_name}
              prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}

            />
            {
              this.state.formErrorsPatient && this.state.formErrorsPatient.FirstName && this.state.formErrorsPatient.FirstName.status ?
                <></>
                :
                <div className='error-text'>
                  {this.state.formErrorsPatient.FirstName.massage}

                </div>
            }
            <label className='formLabel'>Last Name</label>
            <Input
              onChange={this.handleChange}
              className={this.state.formErrorsPatient &&
                this.state.formErrorsPatient.LastName &&
                this.state.formErrorsPatient.LastName.massage == '' ? "" : "inputs-error"}
              type="text"
              name="patient_last_name"
              placeholder="Doe"
              value={this.state.patient_last_name}
              prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}

            />
            {
              this.state.formErrorsPatient && this.state.formErrorsPatient.LastName && this.state.formErrorsPatient.LastName.status ?
                <></>
                :
                <div className='error-text'>
                  {this.state.formErrorsPatient.LastName.massage}

                </div>
            }
            <label className='formLabel'>Birth Date</label>
            <DatePicker
              name="birth_date"
              placeholder="Choose date"
              className={this.state.formErrorsPatient &&
                this.state.formErrorsPatient.BirthDate &&
                this.state.formErrorsPatient.BirthDate.status ?
                "inputs" : "inputs"}
              htmlType="submit"
              onChange={this.handleBirthDateChange}
              value={this.state.birth_day_preview}
            />
            {
              this.state.formErrorsPatient && this.state.formErrorsPatient.BirthDate &&
                this.state.formErrorsPatient.BirthDate.status ?
                <></>
                :
                <div className='error-text'>
                  {this.state.formErrorsPatient && this.state.formErrorsPatient.BirthDate ?
                    this.state.formErrorsPatient.BirthDate.massage : ""}
                </div>
            }



            <label className='formLabel'>Patient Email</label>
            <Input
              onChange={this.handleChange}
              className={this.state.formErrorsPatient &&
                this.state.formErrorsPatient.Email &&
                this.state.formErrorsPatient.Email.massage == '' ? "" : "inputs-error"}
              name="patient_email_address"
              type="email"
              autoComplete="email"
              placeholder="example@email.com"
              value={this.state.patient_email_address}
              prefix={<MailOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
            />
            {
              this.state.formErrorsPatient && this.state.formErrorsPatient.Email &&
                this.state.formErrorsPatient.Email.status ?
                <></>
                :
                <div className='error-text'>
                  {this.state.formErrorsPatient.Email.massage}

                </div>
            }


            <label className='formLabel'>Phone</label>
            <Input
              onChange={this.handleChange}
              className={this.state.formErrorsPatient &&
                this.state.formErrorsPatient.Phone &&
                this.state.formErrorsPatient.Phone.massage == '' ? "" : "inputs-error"}
              type="text"
              name="patient_phone_number"
              placeholder="123 456 0789"
              value={this.state.patient_phone_number}
              prefix={"+1"}
            />
            {
              this.state.formErrorsPatient && this.state.formErrorsPatient.Phone &&
                this.state.formErrorsPatient.Phone.status ?
                <></>
                :
                <div className='error-text'>
                  {this.state.formErrorsPatient.Phone.massage}

                </div>
            }



            <label className='formLabel'>Address</label>
            <Input
              onChange={this.handleChange}
              className={this.state.formErrorsPatient &&
                this.state.formErrorsPatient.Address &&
                this.state.formErrorsPatient.Address.massage == '' ? "" : "inputs-error"}
              type="text"
              name="patient_address"
              placeholder="581 Whiff Ann Le"
              value={this.state.patient_address}
              prefix={<HomeOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}

            />
            {
              this.state.formErrorsPatient &&
                this.state.formErrorsPatient.Address &&
                this.state.formErrorsPatient.Address.status ?

                <></>
                :
                <div className='error-text'>
                  {this.state.formErrorsPatient.Address ?
                    this.state.formErrorsPatient.Address.massage : ""}

                </div>
            }



            <label className='formLabel'>City</label>
            <Input
              className={this.state.formErrorsPatient &&
                this.state.formErrorsPatient.City &&
                this.state.formErrorsPatient.City.massage == '' ? "" : "inputs-error"}
              onChange={this.handleChange}
              type="text"
              name="patient_city"
              placeholder="London"
              value={this.state.patient_city}
              prefix={<EnvironmentOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}

            />
            {
              this.state.formErrorsPatient && this.state.formErrorsPatient.City &&
                this.state.formErrorsPatient.City.status ?
                <></>
                :
                <div className='error-text'>
                  {this.state.formErrorsPatient.City.massage}

                </div>
            }

            <label className='formLabel' onClick={() => {
            }}>State</label>
            <Input
              className={this.state.formErrorsPatient &&
                this.state.formErrorsPatient.pState &&
                this.state.formErrorsPatient.pState.massage == '' ? "" : "inputs-error"}
              onChange={this.handleChange}
              type="text"
              name="patient_state"
              placeholder="NY"
              value={this.state.patient_state}
              prefix={<EnvironmentOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}

            />
            {
              this.state.formErrorsPatient && this.state.formErrorsPatient.pState &&
                this.state.formErrorsPatient.pState.status ?
                <></>
                :
                <div className='error-text'>
                  {this.state.formErrorsPatient && this.state.formErrorsPatient.pState ?
                    this.state.formErrorsPatient.pState.massage : ""}

                </div>
            }

            <label className='formLabel'>Zipcode</label>
            <Input
              className={this.state.formErrorsPatient &&
                this.state.formErrorsPatient.Zipcode &&
                this.state.formErrorsPatient.Zipcode.massage == '' ? "" : "inputs-error"}
              onChange={this.handleChange}
              type="text"
              name="Zipcode"
              placeholder="12345"
              value={this.state.Zipcode}
            />
            {
              this.state.formErrorsPatient && this.state.formErrorsPatient.Zipcode &&
                this.state.formErrorsPatient.Zipcode.status ?
                <></>
                :
                <div className='error-text'>
                  {this.state.formErrorsPatient && this.state.formErrorsPatient.Zipcode ?
                    this.state.formErrorsPatient.Zipcode.massage : ""}

                </div>
            }

          </Modal>
        </DashboardLayout>
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

const connectedPaymentRequestPage = connect(mapStateToProps)(PaymentRequestPage)

export default connectedPaymentRequestPage