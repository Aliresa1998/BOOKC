import { Pagination, Modal, Row, Select, Table, Button } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { push } from "react-router-redux";
import { dashboardActions } from "../../actions";
import { controller } from "../../controller";
import "../app.local.css";
import DashboardLayout from "../../layout/dashboardLayout/DashboardLayout";
import "./style.css";

const { Option } = Select;

class ArDetail extends Component {
  constructor(props) {
    super(props);

    this.state = {
      serverLogo: "",
      ARList: [],
      selectedPayment: [],
      page_size: 0,
      page: 1,
      search_term: "",
      modalTransaction: false,
    };
    this.getLogo();
    this.getData();
    this.getLogo = this.getLogo.bind(this);
    this.getData = this.getData.bind(this);

    this.props.dispatch(dashboardActions.fetchProfileSummary());
    this.props.dispatch(dashboardActions.fetchSummary());
  }

  handlePageChange = async (value) => {
    this.setState({
      page: value,
    });
    const response = await controller.getARDetail(
      window.location.hash.split("/")[
        window.location.hash.split("/").length - 1
      ],
      value
    );
    this.setState({
      ARList: response.results,
      page_size: response.count,
    });
  };

  getData = async () => {
    localStorage.setItem(
      "gurantor.name",
      window.location.href.match(/\/ar-detail\/([^/?]+)/)[1]
    );
    const response = await controller.getARDetail(
      window.location.hash.split("/")[
        window.location.hash.split("/").length - 1
      ],
      this.state.page
    );
    this.setState({
      ARList: response.results,
      page_size: response.count,
    });
  };
  goToCreatePaymentRequest = () => {
    this.props.dispatch(
      push("/paymentrequest/?ARid=" + window.location.href.split("?id=")[1])
    );
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
        title: "Amount",
        dataIndex: "amount",
        key: "amount",
      },
      {
        title: "Appointment Date",
        render: (_, record) => (
          <>
            {record ? (
              record.appointment_date ? (
                <>
                  {new Date(record.appointment_date).toLocaleDateString() +
                    " " +
                    new Date(record.appointment_date).toLocaleTimeString()}
                </>
              ) : (
                ""
              )
            ) : (
              ""
            )}
          </>
        ),
      },
      {
        title: "Created Date",
        render: (_, record) => (
          <>
            {record ? (
              record.created_at ? (
                <>
                  {new Date(record.created_at).toLocaleDateString() +
                    " " +
                    new Date(record.created_at).toLocaleTimeString()}
                </>
              ) : (
                ""
              )
            ) : (
              ""
            )}
          </>
        ),
      },
      {
        title: "Reason",
        render: (_, record) => (
          <>
            {record.reason_text &&
              record.reason_text.length > 0 &&
              record.reason_text.map((item) => (
                <span>{item.reason + ", "}</span>
              ))}
          </>
        ),
      },
      {
        title: "Invoice",
        render: (_, record) => (
          <>
            {record.invoice ? (
              <Button
                style={{ padding: "0" }}
                type="link"
                href={record.invoice}
              >
                Link
              </Button>
            ) : (
              "-"
            )}
          </>
        ),
      },
      {
        title: "Receipt File",
        render: (_, record) => (
          <>
            {record.receipt_file ? (
              <Button
                style={{ padding: "0" }}
                type="link"
                href={record.receipt_file}
              >
                Link
              </Button>
            ) : (
              "-"
            )}
          </>
        ),
      },
      {
        title: "Supporting Document",
        dataIndex: "amount_between_61_90",
        key: "amount_between_61_90",
        render: (_, record) => (
          <>
            {record.supporting_document ? (
              <Button
                style={{ padding: "0" }}
                type="link"
                href={record.supporting_document}
              >
                Link
              </Button>
            ) : (
              "-"
            )}
          </>
        ),
      },
      {
        title: "Paid",
        dataIndex: "paid",
        key: "paid",
      },
      {
        title: "Transactions",
        render: (_, record) => (
          <>
            <Button
              type="link"
              href={record.receipt_file}
              style={{ cursor: "pointer", fontSize: "16px" }}
              onClick={() => {
                this.setState({
                  selectedPayment: record.transactions,
                  modalTransaction: true,
                });
              }}
            >
              {record.transactions ? <EyeOutlined /> : "-"}
            </Button>
          </>
        ),
      },
    ];
    const transactionColumns = [
      {
        title: "Amount",
        dataIndex: "amount_total",
        key: "amount_total",
      },
      {
        title: "Currency",
        render: (_, record) => (
          <>{record.currency ? record.currency.toUpperCase() : ""}</>
        ),
      },
      {
        title: "Date",
        render: (_, record) => (
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
        ),
      },
      {
        title: "Status",
        dataIndex: "payment_status",
        key: "payment_status",
      },
    ];

    return (
      <DashboardLayout
        breadCrumb={false}
        logo={profileSummary && profileSummary.logo ? profileSummary.logo : ""}
        footerLogo={this.state.serverLogo}
      >
        <div className={className}>
          <div className="page-breadcrumb">
            <div className="breadcrumb-part">
              <span
                className="ar_cursor"
                onClick={() => {
                  this.props.history.push("/ar");
                  const url = window.location.href;
                  const match = url.match(/\/ar-detail\/([^/?]+)/);
                  const result = match ? match[1] : null;
                }}
              >
                AR
              </span>{" "}
              / AR Detail /{" "}
              {window.location.href.match(/\/ar-detail\/([^/?]+)/)
                ? window.location.href.match(/\/ar-detail\/([^/?]+)/)[1]
                : null}
            </div>
          </div>
          <div className="paymentContent">
            <Row justify="space-between" type="flex">
              <div className="ar_paymentrequest">Payment Requests</div>
              <div className="ar_paymentrequest-send">
                <Button
                  className="login-btn create-payment-request-btn cw"
                  onClick={this.goToCreatePaymentRequest}
                  size="large"
                >
                  Send Payment Request
                </Button>
              </div>
            </Row>
            <div className="requests">
              <br />
              <Table
                columns={columns}
                dataSource={this.state.ARList}
                pagination={false}
              />
              <Pagination
                current={this.state.page}
                total={this.state.page_size}
                onChange={this.handlePageChange}
                className="paginator"
                size="large"
              />
            </div>
          </div>
        </div>
        <Modal
          className="ar_modal"
          title="Transaction"
          footer={null}
          open={this.state.modalTransaction}
          onCancel={() => {
            this.setState({ modalTransaction: false });
          }}
        >
          <Table
            columns={transactionColumns}
            dataSource={this.state.selectedPayment}
            pagination={false}
          />
        </Modal>
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

const connectedAR = connect(mapStateToProps)(ArDetail);

export default withRouter(connectedAR);
