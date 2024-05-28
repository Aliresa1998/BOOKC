import React, { Component } from "react";
import { connect } from "react-redux";
import { push } from "react-router-redux";
import { withRouter } from "react-router-dom";
import { debounce } from "lodash";
import { dashboardActions } from "../../actions";
import { Pagination, Row, Table } from "antd";
import { notification, Menu, Dropdown, Modal, Input, Button } from "antd";
import { EyeOutlined, RedoOutlined, DownOutlined } from "@ant-design/icons";
import "../app.local.css";
import { ReactComponent as Spinner } from "../../assets/img/loading-spinner.svg";
import Axios from "axios";
import config from "../../config";
import { apiService } from "../../_services";
import { controller } from "../../controller";
import DashboardLayout from "../../layout/dashboardLayout/DashboardLayout";
import "./style.css";
import DashboardPagePaymentDetail from "./DashboardPagePaymentDetail";
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
      loadingCancelPayReq: false,
      openCancelPayReq: false,
      idPayReqForCancel: null,
      errorMessage: "",
      serverLogo: "",
      paymentRequests: [],
      page_size: 25,
      page: 1,
      search_term: "",
      totalAr: "",
      loading_update: false,
      openDetailModal: false,
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
    selectediD: 0,
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
    this.setState({
      loadingCancelPayReq: true
    })
    const response = await controller.cancelPayment(id);
    if (response.status < 250) {
      this.openNotification(
        "bottom",
        response && response.json.Detail
          ? "Payment request was canceled successfully."
          : "Done",
        "Successful"
      );
      this.setState({
        openCancelPayReq: false
      })
      this.updateRequestList();
    } else {
      this.openNotification(
        "bottom",
        response.json.Detail ? response.json.Detail : "Error ",
        "Error"
      );
    }
    this.setState({
      loadingCancelPayReq: false
    })
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

  render() {
    const statusDropDown = (payreq_id) => (
      <>
        <Menu
          onClick={(e) => {

            this.setState({
              openCancelPayReq: true,
              idPayReqForCancel: payreq_id
            })
            //this.handleCancel(payreq_id);
          }}
        >
          <Menu.Item>Cancel Request</Menu.Item>
        </Menu>

      </>

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
              <Dropdown overlay={statusDropDown(record.id)}>
                <span className="cg">
                  Active <DownOutlined />
                </span>
              </Dropdown>
            ) : record.status == "pending" ? (
              <>
                <Dropdown overlay={statusDropDown(record.id)}>
                  <span className="pending">
                    Pending <DownOutlined />
                  </span>
                </Dropdown>
              </>
            ) : record.status == "completed" ? (
              <span className="cg">Completed</span>
            ) : record.status == "failed" ? (
              <Dropdown overlay={statusDropDown(record.id)}>
                <span className="cr">
                  Failed <DownOutlined />
                </span>
              </Dropdown>
            ) : (
              ""
            )}
          </>
        ),
      },
      {
        title: "Resend",
        render: (_, record) => (
          <>
            <button className="resend-btn">
              <RedoOutlined />
            </button>
          </>
        ),
      },
      {
        title: "Details",
        render: (_, record) => (
          <>
            <EyeOutlined
              style={{
                fontSize: "18px",
                color: "black",
                cursor: "pointer",
              }}
              onClick={() => {
                this.OpenDetailPaymentModal(record);
              }}
            />
          </>
        ),
      },
      {
        title: "Pay",
        render: (_, record) => (
          <>
            {record.status == "pending" ? (
              <a
                target="_blank"
                href={window.location.origin + "/#/payment/" + record.id}
              >
                Payment
              </a>
            ) : (
              <p className="placeholder-color">Payment</p>
            )}
          </>
        ),
      },
    ];
    return (
      <>
        <Modal
          onCancel={() => {
            this.setState({
              openCancelPayReq: false
            })
          }}
          open={this.state.openCancelPayReq}
          footer={null}
          title="Cancel payment request"
        >
          <p>
            Are you sure you want to cancel this payment request?
          </p>
          <Row justify={"end"}>
            <Button
              type="primary"
              onClick={() => {
                this.setState({
                  openCancelPayReq: false
                })
              }}
              style={{ marginRight: "10px" }}>No</Button>
            <Button loading={this.state.loadingCancelPayReq} onClick={() => { this.handleCancel(this.state.idPayReqForCancel) }}> Yes</Button>
          </Row>
        </Modal>
        <Modal
          className="mwf"
          visible={this.state.openDetailModal}
          title="Plan Details"
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
            <div className="payment_content-container">
              {this.state.width > 440 ? (
                <div className="payment_content-totalBox">
                  <div className="totalBox">
                    <div className="row">
                      <div className="summary-line">
                        <span>Sent</span>
                        <span className="total">
                          {profileSummary &&
                            profileSummary.total &&
                            profileSummary.total != "no data"
                            ? profileSummary.total.toLocaleString()
                            : 0}
                        </span>
                      </div>
                      <span className="totalSeparator"> | </span>
                      <div className="summary-line">
                        <span>Received</span>
                        <span className="paid">
                          {profileSummary &&
                            profileSummary.total_paid &&
                            profileSummary.total_paid != "no data"
                            ? profileSummary.total_paid.toLocaleString()
                            : 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w100p">
                  <div className="payment_content-totalBox">
                    <div className="totalBox">
                      <div>
                        <div className="summary-line seny">
                          <span>Sent</span>
                          <span className="total mla">
                            $
                            {profileSummary &&
                              profileSummary.total &&
                              profileSummary.total != "no data"
                              ? profileSummary.total.toLocaleString()
                              : 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="payment_content-totalBox">
                    <div className="totalBox">
                      <div>
                        <div className="summary-line sent">
                          <span>Received</span>
                          <span className="paid mla">
                            $
                            {profileSummary &&
                              profileSummary.total_paid &&
                              profileSummary.total_paid != "no data"
                              ? profileSummary.total_paid.toLocaleString()
                              : 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div className="payment_content-totalBox mw430">
                <Search
                  name="search_term"
                  placeholder="Search by patient or appointment"
                  onChange={(e) => this.handleSearchChange(e)}
                  style={{ minHeight: "45px" }}
                  className="searchBox"
                  value={this.state.search_term}
                />
              </div>
              <div className="send_btn">
                <Button
                  className="login-btn create-payment-request-btn cw"
                  onClick={this.goToCreatePaymentRequest}
                  size="large"
                >
                  Send Payment Request
                </Button>
              </div>
            </div>
            <div className="loading-spinner">
              <Spinner />
            </div>
            <div className="requests">
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
