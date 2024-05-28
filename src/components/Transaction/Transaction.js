import {
  Tag,
  Col,
  Table,
  Button,
  notification,
  Input,
  Layout,
  Pagination,
  Row,
  Modal,
  Radio,
} from "antd";
import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { dashboardActions } from "../../actions";
import { controller } from "../../controller";
import "../app.local.css";
import _ from "lodash";
import TopBar from "../CommonUi/TopBar";
import Sidebar from "../Sidebar.js";
import "./style.css";

const { Search } = Input;

const options = [
  { value: "new", label: "New" },
  { value: "archive", label: "Recorded" },
];

class Transaction extends Component {
  constructor(props) {
    super(props);

    this.state = {
      OpenInstallmentModal: false,
      OpenPayReqModal: false,
      installment: [],
      tr_pay_req: {},
      reloadSidebar: false,
      mode: "new",
      loading: false,
      currentPage: 1,
      page_size: 1,
      page: 1,
      transactions: [],
    };

    this.getLogo();
    this.getData();
    this.getLogo = this.getLogo.bind(this);
    this.handleShowInstallment = this.handleShowInstallment.bind(this);
    this.handleShowPaymentReq = this.handleShowPaymentReq.bind(this);
    this.handleSelectChange = this.handleSelectChange.bind(this);
    this.handlePageChange = this.handlePageChange.bind(this);
    this.updateToArchive = this.updateToArchive.bind(this);
    this.updateToNew = this.updateToNew.bind(this);
    this.handleSearchTransaction = _.debounce(
      this.handleSearchTransaction,
      500
    );
    this.props.dispatch(dashboardActions.fetchProfileSummary());
    this.props.dispatch(dashboardActions.fetchSummary());
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
  updateToArchive = async (id) => {
    const response = await controller.UpdateTransactionState("archive", id);

    if (response.status < 250) {
      const response = await controller.GetTransaction(
        this.state.mode,
        this.state.currentPage
      );
      if (response.status < 250) {
        this.setState({
          reloadSidebar: !this.state.reloadSidebar,
        });
        this.openNotification(
          "bottom",
          response.message
            ? response.message
            : "State changed to New successfully",
          "Successful"
        );
        this.setState({
          page: 1,
          page_size: response.data.count,
          transactions: response.data.results,
        });
      }
    }
  };

  updateToNew = async (id) => {
    const response = await controller.UpdateTransactionState("new", id);

    if (response.status < 250) {
      const response = await controller.GetTransaction(
        this.state.mode,
        this.state.currentPage
      );
      if (response.status < 250) {
        this.setState({
          reloadSidebar: !this.state.reloadSidebar,
        });
        this.openNotification(
          "bottom",
          response.message
            ? response.message
            : "State changed to New successfully",
          "Successful"
        );
        this.setState({
          page: 1,
          page_size: response.data.count,
          transactions: response.data.results,
        });
      }
    }
  };

  getData = async () => {
    const response = await controller.GetTransaction(
      this.state.mode,
      this.state.currentPage
    );
    if (response.status < 250) {
      this.setState({
        page: 1,
        page_size: response.data.count,
        transactions: response.data.results,
      });
    }
  };

  handleSearchTransaction = async (e) => { };

  handleSelectChange = async (e) => {
    const value = e.target.value;
    this.setState({ mode: value });
    const response = await controller.GetTransaction(
      value,
      this.state.currentPage
    );
    if (response.status < 250) {
      this.setState({
        page: 1,
        page_size: response.data.count,
        transactions: response.data.results,
      });
    }
  };

  handleShowInstallment = () => {
    this.setState({
      installment: this.state.tr_pay_req.installment_data,
      OpenInstallmentModal: true,
    });
  };

  handleShowPaymentReq = (data) => {
    this.setState({
      tr_pay_req: data.payment_request,
      OpenPayReqModal: true,
    });
  };

  handlePageChange = async (page) => {
    this.setState({
      currentPage: page,
    });
    this.setState({
      loading: true,
    });
    if (this.state.searchValue != "") {
      const response = await controller.GetTransaction(this.state.mode, page);
      if (response.status < 250) {
        this.setState({
          page: 1,
          page_size: response.data.count,
          transactions: response.data.results,
        });
      }
      this.setState({
        loading: false,
      });
    } else {
      const response = await controller.GetTransaction(
        this.state.searchValue,
        this.state.mode,
        page
      );
      if (response.status < 250) {
        this.setState({
          page: 1,
          page_size: response.data.count,
          transactions: response.data.results,
        });
      }
      this.setState({
        loading: false,
      });
    }
  };

  getLogo = async () => {
    const response = await controller.getLogo();
    this.setState({ serverLogo: response.data.dark });
  };

  render() {
    const { loadingSummary, loadingRequests, profileSummary } = this.props;

    const className =
      "dashboard-container" +
      (loadingSummary || loadingRequests ? " is-loading" : "");
    const columns = [
      {
        title: "Name",
        render: (_, record) => {
          return (
            <>
              {record ? (
                record.guarantor_detail ? (
                  <>
                    {record.guarantor_detail.firstname}{" "}
                    {record.guarantor_detail.lastname}
                  </>
                ) : (
                  ""
                )
              ) : (
                ""
              )}
            </>
          );
        },
      },
      {
        title: "Email",
        render: (_, record) => {
          return (
            <>
              {record ? (
                record.guarantor_detail ? (
                  <>{record.guarantor_detail.email}</>
                ) : (
                  ""
                )
              ) : (
                ""
              )}
            </>
          );
        },
      },
      {
        title: "Total",
        dataIndex: "amount_total",
        key: "amount_total",
      },
      {
        title: "Date",
        render: (_, record) => {
          return (
            <>
              {record ? (
                record.date ? (
                  <>
                    {new Date(record.date).toLocaleDateString() +
                      " " +
                      new Date(record.date).toLocaleTimeString()}
                  </>
                ) : (
                  ""
                )
              ) : (
                ""
              )}
            </>
          );
        },
      },
      {
        title: "Payment",
        render: (_, record) => {
          return (
            <>
              <Button
                style={{ padding: "0" }}
                type="link"
                onClick={(e) => {
                  this.handleShowPaymentReq(record);
                }}
              >
                Show
              </Button>
            </>
          );
        },
      },
      {
        title: "Action",
        render: (_, record) => {
          return (
            <>
              {record ? (
                <>
                  {this.state.mode == "new" ? (
                    <Button
                      style={{ padding: "0" }}
                      type="link"
                      onClick={() => {
                        this.updateToArchive(record.id);
                      }}
                    >
                      Record
                    </Button>
                  ) : (
                    <Button
                      style={{ padding: "0" }}
                      type="link"
                      onClick={() => {
                        this.updateToNew(record.id);
                      }}
                    >
                      Remove Record
                    </Button>
                  )}
                </>
              ) : (
                ""
              )}
            </>
          );
        },
      },
    ];
    const installmentColumns = [
      {
        title: "ID",
        dataIndex: "id",
        key: "id",
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
      },
      {
        title: "Amount",
        dataIndex: "amount",
        key: "amount",
      },
      {
        title: "Due Date",
        dataIndex: "due_date",
        key: "due_date",
      },
    ];

    return (
      <div>
        <div className="mainPart">
          <Layout className="mh100v">
            {this.state.reloadSidebar ? (
              <Sidebar reloadSidebar={this.state.reloadSidebar} />
            ) : (
              <Sidebar reloadSidebar={this.state.reloadSidebar} />
            )}

            <Layout>
              <TopBar
                clinicLogo={
                  profileSummary && profileSummary.logo
                    ? profileSummary.logo
                    : ""
                }
              />
              <div className={className}>
                <div className="page-breadcrumb">
                  <div className="breadcrumb-part">Transaction</div>
                </div>
                <div className="paymentContent">
                  <Row type="flex" justify="space-between">
                    <div>
                      <Search
                        value={this.state.searchValue}
                        placeholder="Search payments"
                        onChange={async (e) => {
                          const value = e.target.value;
                          this.setState({
                            searchValue: value,
                            currentPage: 1,
                          });
                          const response =
                            await controller.GetTransactionSearch(
                              e.target.value,
                              this.state.mode,
                              1
                            );
                          if (response.status < 250) {
                            this.setState({
                              page: 1,
                              page_size: response.data.count,
                              transactions: response.data.results,
                            });
                          }
                        }}
                        className="transaction_mw250"
                      />
                    </div>
                    <Radio.Group
                      value={this.state.mode}
                      onChange={this.handleSelectChange}
                    >
                      {options.map((option) => (
                        <Radio.Button value={option.value}>
                          {option.label}
                        </Radio.Button>
                      ))}
                    </Radio.Group>
                  </Row>

                  <Table
                    pagination={false}
                    columns={columns}
                    dataSource={this.state.transactions}
                    style={{ marginTop: "15px" }}
                  />
                  <Row type="flex" justify="end" className="mt15">
                    <Pagination
                      showSizeChanger={false}
                      hideOnSinglePage={true}
                      disabled={this.state.loading}
                      current={this.state.currentPage}
                      total={this.state.page_size}
                      onChange={this.handlePageChange}
                      className="paginator"
                      size="small"
                    />
                  </Row>
                </div>
              </div>
              <div className="text-muted poweredby">
                &copy; powered by{" "}
                <img
                  className="large-logo smilinLogoPowerdBy w52"
                  src={this.state.serverLogo}
                />
              </div>
              <div className="flex_end"></div>
            </Layout>
          </Layout>
        </div>
        <Modal
          title="Installment"
          onCancel={() => {
            this.setState({
              OpenInstallmentModal: false,
            });
          }}
          open={this.state.OpenInstallmentModal}
          footer={null}
        >
          <div className="transaction_lh35">
            <Table
              columns={installmentColumns}
              dataSource={this.state.installment}
              style={{ marginTop: "15px" }}
            />
          </div>
        </Modal>

        <Modal
          title="Payment Request"
          onCancel={() => {
            this.setState({
              OpenPayReqModal: false,
            });
          }}
          open={this.state.OpenPayReqModal}
          footer={null}
        >
          <div className="transaction_lh35">
            <Row type="flex" justify="space-between">
              <Col>Patient</Col>
              <Col>
                {"(" + this.state.tr_pay_req.guarantor + ")"}
                {this.state.tr_pay_req.guarantor_firstname +
                  " " +
                  this.state.tr_pay_req.guarantor_firstname}
              </Col>
            </Row>

            <Row type="flex" justify="space-between">
              <Col>Phone</Col>
              <Col>{this.state.tr_pay_req.guarantor_phone}</Col>
            </Row>

            <Row type="flex" justify="space-between">
              <Col>Email</Col>
              <Col>{this.state.tr_pay_req.guarantor_email}</Col>
            </Row>

            <Row type="flex" justify="space-between">
              <Col>Amount</Col>
              <Col>{this.state.tr_pay_req.amount}</Col>
            </Row>

            {/* <Row type="flex" justify="space-between">
              <Col>Amount</Col>
              <Col>{this.state.tr_pay_req.amount}</Col>
            </Row> */}

            <Row type="flex" justify="space-between">
              <Col>Reason</Col>
              <Col className="transaction_reason">
                {this.state.tr_pay_req.other_reason ? (
                  <span>{this.state.tr_pay_req.other_reason}</span>
                ) : (
                  this.state.tr_pay_req.reason_data &&
                  this.state.tr_pay_req.reason_data.length > 0 &&
                  this.state.tr_pay_req.reason_data.map((item) => (
                    <Tag className="transaction_tag" color="purple">
                      {item.reason}
                    </Tag>
                  ))
                )}
              </Col>
            </Row>
          </div>
        </Modal>
      </div>
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

const connectedAR = connect(mapStateToProps)(Transaction);

export default withRouter(connectedAR);
