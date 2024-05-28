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
  Tabs,
  Card,
  Typography,
  Space
} from "antd";
import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { dashboardActions } from "../../actions";
import { controller } from "../../controller";
import "../app.local.css";
import _ from "lodash";
import config from "../../config";
import TopBar from "../CommonUi/TopBar";
import Sidebar from "../Sidebar.js";
import "./style.css";

import union from '../../assets/icons/Union.png';
import eye from '../../assets/icons/eye.png';
import user from '../../assets/icons/user.png';
import call from '../../assets/icons/call.png';
import sms from '../../assets/icons/sms.png';
import buliding from '../../assets/icons/buliding.png';
import loc from '../../assets/icons/location.png';
import download from '../../assets/icons/frame.png';


const { Search } = Input;
const { TabPane } = Tabs;
const { Title } = Typography


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

  handleTabChange = async (key) => {
    this.setState({ mode: key, currentPage: 1 }); // Set the current mode and reset page if needed

    // Directly call the method to fetch data based on the selected tab
    // Ensure this method exists and is capable of fetching data for both 'new' and 'archive' modes
    const response = await controller.GetTransaction(key, 1); // Assuming page 1 is a good starting point when switching tabs

    if (response.status < 250) {
      this.setState({
        page: 1, // Consider setting this based on the response if pagination data is available
        page_size: response.data.count,
        transactions: response.data.results,
      });
    }
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
          if (record && record.guarantor_detail) {
            return (
              <>
                {record.guarantor_detail.firstname} {record.guarantor_detail.lastname}
              </>
            );
          }
          return null;
        },
      },
      {
        title: "Email",
        render: (_, record) => {
          if (record && record.guarantor_detail) {
            return <>{record.guarantor_detail.email}</>;
          }
          return null;
        },
      },
      {
        title: "Total",
        dataIndex: "amount_total",
        key: "amount_total",
      },
      {
        title: "Date",
        key: "date",
        render: (_, record) => {
          if (record && record.date) {
            const dateObj = new Date(record.date);
            return <>{dateObj.toLocaleDateString()}</>;
          }
          return null;
        },
      },
      {
        title: "Time",
        key: "time",
        render: (_, record) => {
          if (record && record.date) {
            const dateObj = new Date(record.date);
            return <>{dateObj.toLocaleTimeString()}</>;
          }
          return null;
        },
      },
      {
        title: "Action",
        headerCell: () => {
          return {
            style: {
              textAlign: 'center',
            }
          };
        },
        width: '90px',
        align: 'center',
        render: (_, record) => {
          if (this.state.mode === "new") {
            return (
              <>
                <Space size="middle">
                  <Button
                    type="text"
                    icon={<img src={eye} alt="" />}
                    onClick={() => this.handleShowPaymentReq(record)}
                    style={{ color: "#979797" }} />
                  <Button
                    style={{ width: 75, height: 26, display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: 10 }}
                    type="primary"
                    onClick={() => this.updateToArchive(record.id)}
                  >
                    Record
                  </Button>
                </Space>
              </>
            );
          } else {
            return (
              <Button
                style={{ padding: "0" }}
                type="link"
                onClick={() => this.updateToNew(record.id)}
              >
                Remove Record
              </Button>
            );
          }
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
              <div className={className} style={{ marginTop: 15 }}>
                <div className="paymentContent">
                  <Row type="flex" justify="space-between" style={{ marginBottom: 10 }}>
                    <Title level={3} style={{ marginBottom: 25 }}>Transactions</Title>
                    <div>
                      <Input
                        prefix={<img src={union} alt="" />}
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

                  </Row>

                  <Card>
                    <Tabs defaultActiveKey="new" onChange={this.handleTabChange}>
                      <TabPane tab="New" key="new">
                      </TabPane>
                      <TabPane tab="Recorded" key="archive">
                      </TabPane>
                    </Tabs>


                    <Table
                      className="centerTble-action"
                      columns={columns}
                      dataSource={this.state.transactions}
                      style={{ marginTop: "15px" }}
                      pagination={false}
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
                  </Card>

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
          style={{ minWidth: 568 }}
        >
          <Card style={{ marginTop: 25, marginLeft: 15, marginRight: 15 }}>
            <div style={{ display: 'flex', flexDirection: 'row' }}>
              <div style={{ marginRight: 65 }}>
                <div style={{ marginBottom: 20, fontSize: '16px' }}>Patient Information</div>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 15 }}>
                  <img src={user} alt="" style={{ marginRight: 10 }} />
                  <span style={{ fontSize: '13px', fontWeight: '400' }}>
                    {"(" + this.state.tr_pay_req.guarantor + ")"}
                    {this.state.tr_pay_req.guarantor_firstname +
                      " " +
                      this.state.tr_pay_req.guarantor_firstname}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 15 }}>
                  <img src={call} alt="" style={{ marginRight: 10 }} />
                  <span style={{ fontSize: '13px' }}>
                    {this.state.tr_pay_req.guarantor_phone}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <img src={sms} alt="" style={{ marginRight: 10 }} />
                  <span style={{ fontSize: '13px' }}>
                    {this.state.tr_pay_req.guarantor_email}
                  </span>
                </div>
              </div>
              <div>
                <div style={{ marginBottom: 20, fontSize: '16px' }}>Clinic Information</div>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 15 }}>
                  <img src={buliding} alt="" style={{ marginRight: 10 }} />
                  <span style={{ fontSize: '13px', fontWeight: '400' }}>
                    {this.state.tr_pay_req.office_name
                      ? this.state.tr_pay_req.office_name
                      : "-"}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 15 }}>
                  <img src={call} alt="" style={{ marginRight: 10 }} />
                  <span style={{ fontSize: '13px' }}>
                    {this.state.tr_pay_req.office_phone
                      ? this.state.tr_pay_req.office_phone
                      : "-"}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <img src={loc} alt="" style={{ marginRight: 10 }} />
                  <span style={{ fontSize: '13px' }}>
                    {this.state.tr_pay_req.office_address
                      ? this.state.tr_pay_req.office_address
                      : "-"}
                  </span>
                </div>
              </div>
            </div>
          </Card>
          <div className="flex-row12" >
            <p className="reason-color">Reason:</p>
            <span className="reason-span">
              {this.state.tr_pay_req && ( // Ensure tr_pay_req is defined before accessing its properties
                this.state.tr_pay_req.other_reason ? (
                  <span>{this.state.tr_pay_req.other_reason}</span>
                ) : (
                  <div className='tag-mr'>
                    {this.state.tr_pay_req.reason_data && this.state.tr_pay_req.reason_data.length > 0 &&
                      this.state.tr_pay_req.reason_data.map((item) => (
                        <Tag className="tag_reason" color="rgba(233, 230, 255, 1)">
                          {item.reason}
                        </Tag>
                      ))}
                  </div>
                )
              )}
            </span>
          </div>
          <div className="flex-row123" style={{ marginLeft: 15, marginRight: 15 }}>
            <p>Created Date</p>
            <span className="reason-span">
              {this.state.tr_pay_req.created_at
                ? new Date(this.state.tr_pay_req.created_at)
                  .toISOString()
                  .replace(/T/, " ")
                  .replace(/\.\d+Z$/, "")
                : "-"}
            </span>
          </div>
          <div className="flex-row123" style={{ justifyContent: 'space-between' }}>
            <Card className="card-size11">
              <div className="card-size11">
                <div>Patient Invoice</div>
                <Button
                  type="text"
                  icon={<img src={download} alt="" />}
                  style={{ color: "#979797", marginLeft: 'auto', marginRight: 40 }}
                  onClick={() => {
                    if (this.state.tr_pay_req &&
                      this.state.tr_pay_req.invoice &&
                      this.state.tr_pay_req.invoice.length > 0
                    ) {
                      if (this.state.tr_pay_req.invoice.length > 1) {
                        console.log(this.state.tr_pay_req.invoice)
                        this.setState({
                          openModalMultiFile: true,
                          downloadMultiFileTitle: "Download Invoices Files",
                          ModalMultiFileData: this.state.tr_pay_req.invoice
                        })

                      } else {
                        this.state.tr_pay_req.invoice.forEach(item => {
                          if (item && item.invoice) {
                            window.open(config.apiGateway.URL + item.invoice, '_blank');
                          }
                        })
                      }

                    }
                  }}
                />
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
                      this.state.tr_pay_req.supporting_document &&
                      this.state.tr_pay_req.supporting_document.length > 0
                    ) {

                      if (this.state.tr_pay_req.supporting_document.length > 1) {
                        console.log(this.state.tr_pay_req.supporting_document)
                        this.setState({
                          openModalMultiFile: true,
                          downloadMultiFileTitle: "Download Supporting Document Files",
                          ModalMultiFileData: this.state.tr_pay_req.supporting_document
                        })

                      } else {


                        this.state.tr_pay_req.supporting_document.forEach(item => {
                          if (item && item.supporting_document) {
                            window.open(config.apiGateway.URL + item.supporting_document, '_blank');
                          }
                        })
                      }
                    }

                  }}
                />
              </div>
            </Card>
          </div>

          <hr />
          <div className="flex-row123">
            <p className="amount-size-color">Amount Due</p>
            <span className="reason-span1">
              {this.state.tr_pay_req.amount
                ? this.state.tr_pay_req.amount
                : "-"}
            </span>
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
