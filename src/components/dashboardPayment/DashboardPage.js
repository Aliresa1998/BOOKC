import React, { Component } from "react";
import { connect } from "react-redux";
import { push } from "react-router-redux";
import { withRouter } from "react-router-dom";
import { debounce } from "lodash";
import { dashboardActions } from "../../actions";
import { Pagination, Table, Card, Space, Tag, notification, Menu, Modal, Input, Button, message } from "antd";
import "../app.local.css";
import { ReactComponent as Spinner } from "../../assets/img/loading-spinner.svg";
import Axios from "axios";
import config from "../../config";
import { apiService } from "../../_services";
import { controller } from "../../controller";
import DashboardLayout from "../../layout/dashboardLayout/DashboardLayout";
import "./style.css";
import DashboardPagePaymentDetail from "./DashboardPagePaymentDetail";
import PaymentFirstPage from '../Payment/PaymentFirstPage';
import PaymentDone from '../Payment/PaymentDone'
import { Paymentcontroller } from "../../Paymentcontroller";
//ICONS
import sent from "../../assets/icons/card-send.png";
import receive from "../../assets/icons/card-receive.png";
import search from '../../assets/icons/search-normal.png';
import eye from '../../assets/icons/eye.png';
import refresh from '../../assets/icons/refresh.png';
import card from '../../assets/icons/card-pos.png';

const Config = {
  headers: {
    Authorization: localStorage.getItem("user")
      ? "Token " + JSON.parse(localStorage.getItem("user")).key
      : "",
  },
};

class PaymentRequestsTable extends Component {
  getData = () => {
    Axios.get(config.apiGateway.URL + `/clinics/selectoffice/`, Config).then(
      (res) => {
        const response = res.data;
        localStorage.setItem("office_ids", JSON.stringify(response));
      }
    );
  };
  updateRequestList = async () => {
    const response = await controller.get_payment_requests(
      this.state.page_size,
      this.state.page,
      this.state.search_term,
      localStorage.getItem("selectedOffice")
    );
    if (response.status < 250) {
      this.setState({ paymentRequests: response });
      this.setState({ loading_update: false });
    } else {
      this.openNotification(
        "bottom",
        response.detail ? response.detail : response.massage,
        "Error"
      );
      if (response.detail) {
        this.setState({
          errorMessage: response.detail,
        });
      }
    }
  };
  constructor(props) {
    super(props);
    this.getLogo();
    this.state = {
      errorMessage: "",
      serverLogo: "",
      paymentRequests: [],
      page_size: 25,
      page: 1,
      search_term: "",
      totalAr: "",
      loading_update: false,
      openPayModal: false,
      openDetailModal: false,
      currentStep: sessionStorage.getItem('currentStep') || 1,  // Retrieve the step from session storage or default to 1
      isChecked: false,
      selectedPaymentId: null,
      paymentType: null
    };
    this.getLogo();
    this.getLogo = this.getLogo.bind(this);
    this.CloseDetailPaymentModal = this.CloseDetailPaymentModal.bind(this);
    this.OpenDetailPaymentModal = this.OpenDetailPaymentModal.bind(this);
    this.updateRequestList();
    this.openNotification = this.openNotification.bind(this);
  }
  state = {
    serverLogo: "",
    resend_status: {},
    cancel_status: {},
    office_id: [],
    show_more: {},
    loading_update: false,
    openDetailModal: false,
    detailModalVisible: false,
    selectedPayment: [],

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
    var id = localStorage.getItem('paymentId');
    if (!id) {
      console.error("No selected ID provided");
      message.error("Payment failed: No selected ID provided.");
      return;
    }

    try {
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipResponse.json();
      const userIp = ipData.ip;

      const response = await Paymentcontroller.helcimPay(id, cardToken, userIp);

      if (response.status < 250) {
        message.success("Payment successful");
        window.history.pushState({}, '', `/payment/${id}`);  // Update the URL without reloading the page
      } else {
        message.error("Payment failed: " + response.error);
      }
    } catch (error) {
      console.error('Error during payment processing:', error);
      message.error("Payment processing error: " + error.message);
    }
  };

  // check submited helcim form
  componentDidMount() {

    // Function to parse URL parameters
    const getUrlParameter = (name, url = window.location.href) => {
      if (!url) return '';
      name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
      const regex = new RegExp('[\\?&]' + name + '=([^&#]*)|(?:#)' + name + '=([^#]*)');
      const results = regex.exec(url);
      return results === null ? '' : (results[1] !== undefined ? decodeURIComponent(results[1].replace(/\+/g, ' ')) : decodeURIComponent(results[2].replace(/\+/g, ' ')));
    };

    // Get the value of responseMessage and cardToken from URL parameters
    const responseMessage = getUrlParameter('responseMessage');
    const cardToken = getUrlParameter('cardToken');

    // Check if responseMessage is "APPROVED" and log cardToken
    if (responseMessage === 'APPROVED' || responseMessage === 'APPROVAL' ||
      (window.location.href.includes("/?") && !window.location.href.includes("/?id="))
    ) {
      console.log(cardToken)
      const userIp = this.handleReadDataIP()
      this.setState({ currentStep: 3, detailModalVisible: true });
      this.handleApprovedCardByHelcim(cardToken)
      console.log('user ip:', userIp);
      console.log('Card Token:', cardToken);
    } else {
      // this.setState({
      //   loadingHelcimResultCheck: false
      // })
    }
  }

  // processUrlParameters = () => {
  //   const params = new URLSearchParams(window.location.search);
  //   const responseMessage = params.get('responseMessage');
  //   const cardToken = params.get('cardToken');

  //   if (responseMessage === 'APPROVED') {
  //     // Assuming step 3 is the confirmation step
  //     this.setState({ currentStep: 3, detailModalVisible: true });
  //     sessionStorage.setItem('currentStep', '3');  // Persist step change across refreshes
  //   }

  //   // Clean up URL parameters to prevent reprocessing
  //   // window.history.replaceState({}, '', window.location.pathname);
  // };

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

  OpenDetailPaymentModal = (pyreq) => {
    this.setState({
      openDetailModal: true,
      selectediD: pyreq.id,
    });
  };
  CloseDetailPaymentModal = () => {
    this.setState({
      openDetailModal: false,
    });
  };

  getLogo = async () => {
    const response = await controller.getLogo();
    this.setState({ serverLogo: response.data.dark });
  };

  componentWillReceiveProps = debounce(async (nextProps) => {
    const { rows_id } = nextProps;
    this.setState({
      resend_status: { ...rows_id },
      cancel_status: { ...rows_id },
    });

    this.setState({ search_term: nextProps.search_term });
    const response = await controller.get_payment_requests(
      this.state.page_size,
      this.state.page,
      nextProps.search_term,
      localStorage.getItem("selectedOffice")
    );
    this.setState({ paymentRequests: response });
  }, 300);

  handleResend = (e) => {
    const id = e.target.name;
    apiService
      .get(`/billpay/payment/${id}/request/`, {})
      .then((response) => {
        let resend_status = { ...this.state.resend_status };
        let id_row = id;
        resend_status[id_row] = 1;
        this.setState({ resend_status });
      })
      .catch((error) => { });
  };


  handleCancel = async (id) => {
    const response = await controller.cancelPayment(id);
    if (response.status < 250) {
      this.openNotification(
        "bottom",
        response && response.json.Detail
          ? "Payment request was canceled successfully."
          : "Done",
        "Successful"
      );
      this.updateRequestList();
    } else {
      this.openNotification(
        "bottom",
        response.json.Detail ? response.json.Detail : "Error ",
        "Error"
      );
    }
  };

  handlePaginatorChange = (page, page_size) => {
    this.setState(
      {
        page,
        page_size,
        loading_update: true,
      },
      () => {
        this.updateRequestList();
      }
    );
  };

  handlePaymentButtonClick1 = (record) => {
    if (record.status === "pending") {
      this.setState({
        detailModalVisible: true,
        selectedPayment: record,
      });
      sessionStorage.setItem('currentStep', '1');  // Start from step 1 when opening the modal

    }
  };

  onPaymentTypeSelected = (paymentType) => {
    this.setState({
      paymentType,
      currentStep: 2
    });
  };


  handleNextStep = () => {
    this.setState(prevState => ({
      currentStep: Number(prevState.currentStep) + 1
    }), () => {
      sessionStorage.setItem('currentStep', this.state.currentStep.toString());  // Persist step change
    });
  };


  render() {
    const { currentStep } = this.state;
    const { detailModalVisible, selectedPayment } = this.state;
    const statusDropDown = (payreq_id) => (
      <Menu
        onClick={(e) => {
          this.handleCancel(payreq_id);
        }}
      >
        <Menu.Item>Cancel Request</Menu.Item>
      </Menu>
    );
    const moreReasonBtn = (payreq_id) => (
      <button
        className="more-btn"
        onClick={(e) => {
          let show_more = { ...this.state.show_more };
          show_more[payreq_id] = true;
          this.setState({ show_more });
        }}
      >
        {" "}
        more
      </button>
    );



    const handlePaymentButtonClick1 = (record) => {
      if (record.status === "pending") {
        this.setState({
          detailModalVisible: true,
          selectedPayment: record,
        });
        sessionStorage.setItem('currentStep', '1');  // Start from step 1 when opening the modal

      }
    };



    const handleCloseDetailModal1 = () => {

      this.setState({
        detailModalVisible: false,
        selectedPayment: [],
        currentStep: 1
      })
      sessionStorage.removeItem('currentStep');  // Clear the step from session storage on modal close

    };


    const columns = [
      {
        title: "ID",
        dataIndex: "id",
        key: "id",
      },
      {
        title: "Name",
        render: (_, record) => (
          <>
            {record.guarantor_firstname && record.guarantor_lastname
              ? record.guarantor_firstname + " " + record.guarantor_lastname
              : record.guarantor_firstname
                ? record.guarantor_firstname
                : "_"}
          </>
        ),
      },
      {
        title: "Phone",
        render: (_, record) => (
          <>
            {record.guarantor_phone
              ? record.guarantor_phone.length == 10
                ? "+1-" +
                record.guarantor_phone.slice(0, 3) +
                "-" +
                record.guarantor_phone.slice(3, 6) +
                "-" +
                record.guarantor_phone.slice(6)
                : record.guarantor_phone
              : "_"}
          </>
        ),
      },
      {
        title: "Email",
        dataIndex: "guarantor_email",
        key: "guarantor_email",
      },
      {
        title: "Reason",
        render: (_, record) => (
          <>
            {record.reason_data && record.reason_data.length > 0 ? (
              record.reason_data.map((item) => (
                <span>{item.reason + ", "}</span>
              ))
            ) : record.other_reason ? (
              <span>{record.other_reason}</span>
            ) : (
              <>-</>
            )}
          </>
        ),
      },
      {
        title: "Amount",
        render: (_, record) => <>{record.amount.toLocaleString()}</>,
      },
      {
        title: "Status",
        render: (_, record) => (
          <>
            {record.status == "canceled" ? (
              <span className="cr">Cancelled</span>
            ) : record.status == "subscription" ? (
              <Tag
                color={"rgba(37, 180, 248, 0.12)"}
                style={{ borderRadius: "500px", fontSize: '12px', color: "#5191FF", width: 85, height: 22, textAlign: 'center' }}
              >
                Active
              </Tag>
            ) : record.status === "pending" ? (
              <Tag
                color={"rgba(236, 148, 44, 0.15)"}
                style={{ borderRadius: "500px", fontSize: '12px', color: "rgba(236, 148, 44, 1)", width: 85, height: 22, textAlign: 'center' }}
              >
                Pending
              </Tag>
            ) : record.status === "completed" ? (
              <Tag
                color={"rgba(4, 201, 0, 0.1)"}
                style={{ borderRadius: "500px", fontSize: '12px', color: "rgba(4, 201, 0, 1)", width: 85, height: 22, textAlign: 'center' }}
              >
                Completed
              </Tag>
            ) : record.status === "failed" ? (

              <Tag
                color={"rgba(255, 0, 0, 0.08)"}
                style={{ borderRadius: "500px", fontSize: '12px', color: "rgba(238, 97, 91, 1)", width: 85, height: 22, textAlign: 'center' }}
              >
                Failed
              </Tag>
            ) : (
              ""
            )}
          </>
        ),
      },
      {
        title: "Action",
        key: "action",
        render: (text, record) => (
          <Space size="middle">
            <Button
              type="text"
              icon={<img src={eye} alt="" />}
              style={{ color: "#979797" }}
              onClick={() => {
                this.OpenDetailPaymentModal(record);
              }}
            />
            <Button
              type="text"
              icon={<img src={card} alt="" />}
              style={{ color: "#979797" }}
              onClick={() => handlePaymentButtonClick1(record)}
            />
            <Button
              type="text"
              icon={<img src={refresh} alt="" />}
              style={{ color: "#979797" }}
            />
          </Space>
        ),
      },
    ];
    return (
      <>
        <Modal
          visible={detailModalVisible}
          title="Payment Details"
          onCancel={() => handleCloseDetailModal1()}
          footer={null}  // This line ensures no footer (and thus no buttons) is displayed
          style={{ minWidth: 538 }}
        >
          {selectedPayment && currentStep === 1 ? (
            <>
              <PaymentFirstPage onNextStep={this.handleNextStep} selectediD={selectedPayment.id} onPaymentTypeSelected={this.onPaymentTypeSelected} />
            </>
          ) : null}
          {selectedPayment && currentStep === 3 ? (
            <>
              <PaymentDone onNextStep={this.handleNextStep} selectediD={selectedPayment.id} />
            </>
          ) : null}
        </Modal>
        <Modal
          style={{ minWidth: 538 }}
          // className="mwf"
          visible={this.state.openDetailModal}
          title="Details"
          onCancel={() => {
            this.setState({
              openDetailModal: false,
            });
          }}
          footer={null}
        >
          <DashboardPagePaymentDetail selectediD={this.state.selectediD} />
        </Modal>
        <Pagination
          showSizeChanger={false}
          pageSize={this.state.page_size}
          current={this.state.page}
          total={
            this.state.paymentRequests ? this.state.paymentRequests.count : 0
          }
          onChange={this.handlePaginatorChange}
          className="paginator"
          size="small"
        />
        <Table
          style={{
            border: "1px solid rgba(240, 240, 240, 1)", borderRadius: '8px', boxShadow: "0px 0px 10px 0px rgba(0, 0, 0, 0.15)"

          }}
          columns={columns}
          dataSource={
            this.state.paymentRequests.results
              ? this.state.paymentRequests.results
              : []
          }
          pagination={false}
        />
        {this.state.paymentRequests.results &&
          this.state.paymentRequests.results.length > 0 ? (
          <></>
        ) : (
          <p className="error_message">
            {this.state.errorMessage
              ? this.state.errorMessage
              : "No payment requests created yet"}
          </p>
        )}
      </>
    );
  }
}

function getWindowDimensions() {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height,
  };
}
class DashboardPage extends Component {
  componentDidMount() {
    this.updateWindowDimensions();
    window.addEventListener("resize", this.updateWindowDimensions);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateWindowDimensions);
  }

  updateWindowDimensions() {
    this.setState({ width: window.innerWidth, height: window.innerHeight });
  }
  constructor(props) {
    super(props);

    this.state = {
      serverLogo: "",
      width: 0,
      height: 0,
      page_size: 25,
      page: 1,
      search_term: "",
      totalAr: "",
      openDetailModal: false,
    };
    this.getLogo();
    this.getLogo = this.getLogo.bind(this);
    this.props.dispatch(dashboardActions.fetchProfileSummary());
    this.props.dispatch(dashboardActions.fetchSummary());
    // this.handleReadDataIP = this.handleReadDataIP.bind(this);
    this.updateRequestList();
    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
  }

  goToCreatePaymentRequest = () => {
    this.props.dispatch(push(`/paymentrequest`));
  };
  getLogo = async () => {
    const response = await controller.getLogo();
    this.setState({ serverLogo: response.data.dark });
  };
  processRequestsDataIntoRows = (rows) => {
    rows.forEach((payreq) => {
      let date = new Date(payreq.appointment_datetime);
      var options = {
        year: "numeric",
        month: "long",
        day: "numeric",
      };
      payreq.processed_appointment_date = date.toLocaleString("en-GB", options);
      if (payreq.patient_phone) {
        let p = payreq.patient_phone;
        payreq.processed_phone_number = `${p.substr(0, 2)}-${p.substr(
          2,
          3
        )}-${p.substr(5, 3)}-${p.substr(8, 4)}`;
      }
      let max_len = 80;
      if (payreq.reason)
        payreq.short_reason =
          payreq.reason.length > max_len
            ? payreq.reason.substr(0, max_len)
            : null;
    });
    return rows;
  };

  handlePaginatorChange = (page, page_size) => {
    this.setState(
      {
        page,
        page_size,
      },
      () => {
        this.updateRequestList();
      }
    );
  };

  searchDelayTimeout = null;
  handleSearchChange = (e) => {
    const { value } = e.target;
    this.setState({ search_term: value }, function () {
      this.updateRequestList();
    });
  };
  updateRequestList = async () => { };

  render() {
    const {
      loadingSummary,
      summary,
      loadingRequests,
      requests,
      error,
      profileSummary,
    } = this.props;
    const Search = Input.Search;
    const className =
      "dashboard-container" +
      (loadingSummary || loadingRequests ? " is-loading" : "");

    const rows =
      requests && requests.results
        ? this.processRequestsDataIntoRows(requests.results)
        : [];
    let rows_id = {};
    const rows_is_array =
      requests && requests.results
        ? requests.results.map((row) => (rows_id[row.id] = 0))
        : {};

    return (
      <DashboardLayout
        breadCrumb={false}
        logo={profileSummary && profileSummary.logo ? profileSummary.logo : ""}
        footerLogo={this.state.serverLogo}
      >
        <div className={className}>
          {error && error.message && (
            <div className="alert">{error.message}</div>
          )}
          <div className="page-breadcrumb">
            <div className="breadcrumb-part">Payment Management</div>
          </div>
          <div className="paymentContent">
            <Card style={{ width: '100%' }}>
              <div className="flex-row-evenlyy">
                <div style={{ width: 368, height: 121, display: 'flex', alignItems: 'center', flexDirection: 'row', background: 'rgba(223, 218, 255, 0.7)', borderRadius: '8px' }}>
                  <div className='circle' style={{ marginLeft: 15 }}>
                    <img className='icon-center' src={sent} alt='' />
                  </div>
                  <div style={{ marginLeft: 10 }}>
                    <div style={{ fontSize: 18, fontWeight: 400, color: '#4D3280' }}>Sent</div>
                    <div style={{ fontSize: 24, color: "#5D3B9C", fontWeight: 400, }}>
                      {profileSummary &&
                        profileSummary.total &&
                        profileSummary.total !== "no data"
                        ? profileSummary.total.toLocaleString()
                        : 0
                      }
                    </div>
                  </div>
                </div>
                <div style={{ width: 368, height: 121, display: 'flex', alignItems: 'center', flexDirection: 'row', background: 'rgba(223, 218, 255, 0.7)', borderRadius: '8px' }}>
                  <div className='circle' style={{ marginLeft: 15 }}>
                    <img className='icon-center' src={receive} alt='' />
                  </div>
                  <div style={{ marginLeft: 10 }}>
                    <div style={{ fontSize: 18, fontWeight: 400, color: '#5D3B9C' }}>Received</div>
                    <div style={{ fontSize: 24, color: "#5D3B9C", fontWeight: 400, }}>
                      {profileSummary &&
                        profileSummary.total_paid &&
                        profileSummary.total_paid !== "no data"
                        ? profileSummary.total_paid.toLocaleString()
                        : 0}
                    </div>
                  </div>
                </div>
                <div style={{ maxWidth: 368 }} >
                  <Input
                    value={this.state.search_term}
                    onChange={(e) => this.handleSearchChange(e)}
                    size="large"
                    placeholder="Search patient/payment"
                    suffix={<img src={search} alt="" />}
                    style={{ marginBottom: '20px', height: 52 }}
                  />
                  <Button
                    type="primary"
                    size="large"
                    block
                    style={{ height: 52 }}
                    onClick={this.goToCreatePaymentRequest}
                  >
                    Send Payment Request
                  </Button>
                </div>
              </div>
            </Card>
            <div className="loading-spinner">
              <Spinner />
            </div>
            <div style={{ marginTop: 30 }}>
              {
                <div>
                  <PaymentRequestsTable
                    search_term={this.state.search_term}
                    rows={rows}
                    rows_id={rows_id}
                  />
                </div>
              }
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }
}

function mapStateToProps(state) {
  const {
    loadingSummary,
    summary,
    profileSummary,
    loadingRequests,
    requests,
    error,
  } = state.dashboard;
  return {
    loadingSummary,
    summary,
    profileSummary,
    loadingRequests,
    requests,
    error,
    authentication: state.authentication,
  };
}

const connectedDashboardPage = connect(mapStateToProps)(DashboardPage);

export default withRouter(connectedDashboardPage);