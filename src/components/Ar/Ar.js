import {
  Card,
  Table,
  Input,
  Col,
  DatePicker,
  Pagination,
  Row,
  Select,
  Slider,
} from "antd";
import dayjs from "dayjs";
import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { dashboardActions } from "../../actions";
import { controller } from "../../controller";
import DashboardLayout from "../../layout/dashboardLayout/DashboardLayout";
import "../app.local.css";
import "./style.css";
import _ from "lodash";
const { MonthPicker, RangePicker } = DatePicker;
const { Option } = Select;
const dateFormat = "YYYY/MM/DD";
class AR extends Component {
  constructor(props) {
    super(props);

    this.state = {
      providers: [],
      entryId: "",
      currentPage: 1,
      maxAr: 0,
      loading: true,
      dueDate: "",
      serverLogo: "",
      ARList: [],
      Guarantor: [],
      Practice: [],
      selectedProvider: null,
      selectedGuarantor: null,
      selectedPractice: null,
      min_date: null,
      max_date: null,
      entry_id: null,
      min_amount: 0,
      max_amount: 100,
      page_size: 1,
      page: 1,
      search_term: "",
      mainloading: false,
      cardData: {
        total_0_30: 0,
        total_31_60: 0,
        total_61_90: 0,
        total_greater_than_90: 0,
      },
    };
    this.getCardData();
    this.getLogo();
    this.getData();
    this.getProviders();
    this.getLogo = this.getLogo.bind(this);
    this.getData = this.getData.bind(this);
    this.handleSearchGuarantor = this.handleSearchGuarantor.bind(this);
    this.updateGetAR = _.debounce(this.updateGetAR, 500);

    this.getProviders = this.getProviders.bind(this);
    this.handleChangeDueDate = this.handleChangeDueDate.bind(this);
    this.handlePageChange = this.handlePageChange.bind(this);

    this.props.dispatch(dashboardActions.fetchProfileSummary());
    this.props.dispatch(dashboardActions.fetchSummary());
  }

  getProviders = async () => {
    const response = await controller.getProviderList();
    this.setState({
      providers: response,
    });
  };

  getCardData = async () => {
    const response = await controller.getCardData();
    this.setState({
      cardData: response,
    });
  };

  handlePageChange = async (page) => {
    this.setState({
      currentPage: page,
    });
    this.setState({
      loading: true,
    });
    const response = await controller.getAR(page);
    const responsegetGuarantor = await controller.getGuarantor();
    const responsegetPracticeOffices = await controller.getPracticeOffices();
    this.setState({
      Practice: responsegetPracticeOffices.data,
      Guarantor: responsegetGuarantor,
      page: 1,
      page_size: response.count,
      ARList: response.results,
      loading: false,
    });
  };

  updateGetAR = async () => {
    const response = await controller.updateGetAR(
      this.state.selectedProvider,
      this.state.selectedGuarantor,
      this.state.selectedPractice,
      this.state.min_date ? this.state.min_date.replace(/\//g, "-") : "",
      this.state.max_date ? this.state.max_date.replace(/\//g, "-") : "",
      this.state.entryId,
      this.state.min_amount,
      this.state.max_amount
    );
    this.setState({
      page: 1,
      page_size: response.count,
      ARList: response.results,
    });
  };

  handleChangeDueDate = async (value) => {
    var str = "";
    console.log(value);
    for (var i in value) {
      console.log(value[i]);
      if (value[i]) str += value[i] + ",";
    }
    str = str + "";

    console.log(str);
    const response = await controller.updateGetAR2(
      this.state.selectedGuarantor,
      this.state.selectedPractice,
      this.state.min_date && this.state.min_date.replace(/\//g, "-")
        ? this.state.min_date.replace(/\//g, "-")
        : null,
      this.state.max_date && this.state.min_date.replace(/\//g, "-")
        ? this.state.max_date.replace(/\//g, "-")
        : null,
      this.state.entry_id,
      this.state.min_amount,
      this.state.max_amount,
      str.slice(0, str.length - 1),
      1
    );
    this.setState({
      page: 1,
      page_size: response.count,
      ARList: response.results,
    });
  };

  handleSearchGuarantor = async (value) => {
    const responsegetGuarantor = await controller.searchGuarantor(value);
    this.setState({
      Guarantor: responsegetGuarantor,
    });
  };

  getData = async () => {
    this.setState({
      loading: true,
    });
    const response = await controller.getAR(this.state.currentPage);
    const responsegetGuarantor = await controller.getGuarantor();
    const responsegetPracticeOffices = await controller.getPracticeOffices();
    const responseMaxAmountAR = await controller.getMaxAmountAR();
    this.setState({
      Practice: responsegetPracticeOffices.data,
      Guarantor: responsegetGuarantor,
      page: 1,
      page_size: response.count,
      ARList: response.results,
      loading: false,
      maxAr: responseMaxAmountAR.max_value,
      max_amount: responseMaxAmountAR.max_value,
    });
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
        title: "ID",
        dataIndex: "id",
        key: "id",
      },
      {
        title: "Patient",
        render: (_, record) => (
          <>
            {record ? (
              record.guarantor ? (
                <>
                  {record.guarantor.firstname} {record.guarantor.lastname}
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
        title: "AR (0-29 Days)",
        dataIndex: "amount_between_0_30",
        key: "amount_between_0_30",
        render(text, record) {
          return {
            props: {
              style: { background: "#0aaf0a1a" },
            },
            children: <div>{text ? text : ""}</div>,
          };
        },
      },
      {
        title: "AR (30-59 Days)",
        dataIndex: "amount_between_31_60",
        key: "amount_between_31_60",
        render(text, record) {
          return {
            props: {
              style: { background: "#ffff001a" },
            },
            children: <div>{text ? text : ""}</div>,
          };
        },
      },
      {
        title: "AR (60-89 Days)",
        dataIndex: "amount_between_61_90",
        key: "amount_between_61_90",
        render(text, record) {
          return {
            props: {
              style: { background: "#ffa5001a" },
            },
            children: <div>{text ? text : ""}</div>,
          };
        },
      },
      {
        title: "AR (+90)",
        dataIndex: "amount_greater_than_90",
        key: "amount_greater_than_90",
        render(text, record) {
          return {
            props: {
              style: { background: "#ff00001a" },
            },
            children: <div>{text ? text : ""}</div>,
          };
        },
      },
      {
        title: "Total Amount",
        dataIndex: "total_amount",
        key: "total_amount",
      },
      {
        title: "Current Date",
        render: (_, record) => (
          <>
            {record ? (
              record.current_date ? (
                <>
                  {new Date(record.current_date).toLocaleDateString() +
                    " " +
                    new Date(record.current_date).toLocaleTimeString()}
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
    ];

    return (
      <DashboardLayout
        breadCrumb={"AR"}
        logo={profileSummary && profileSummary.logo ? profileSummary.logo : ""}
        footerLogo={this.state.serverLogo}
      >
        <div className="paymentRequestContent">
          <Row justify="space-between" type="flex">
            <Col span={10}>
              <Row>
                <label>Date</label>
              </Row>
              <div className="c1">
                <RangePicker
                  onChange={(e, value) => {
                    this.setState({
                      min_date: value[0],
                      max_date: value[1],
                    });
                    setTimeout(() => {
                      this.updateGetAR();
                    }, 500);
                  }}
                  className="ar_rangepicker"
                  defaultValue={[
                    dayjs("2015/01/01", dateFormat),
                    dayjs("2015/01/01", dateFormat),
                  ]}
                  format={dateFormat}
                />
              </div>
            </Col>

            <Col span={8}>
              <Row>
                <label>Patient</label>
              </Row>

              <Select
                className="ar_mw100"
                placeholder="Patient"
                showSearch
                allowClear
                onSearch={this.handleSearchGuarantor}
                onClear={() => {
                  this.setState({
                    selectedGuarantor: "",
                  });
                  setTimeout(() => {
                    this.updateGetAR();
                  }, 500);
                }}
                filterOption={(input, option) => option.props.children}
                onChange={(e) => {
                  this.setState({
                    selectedGuarantor: e,
                  });
                  setTimeout(() => {
                    this.updateGetAR();
                  }, 500);
                }}
              >
                {this.state.Guarantor && this.state.Guarantor ? (
                  this.state.Guarantor.length > 50 ? (
                    this.state.Guarantor.slice(0, 50).map((person) => (
                      <Option value={person.id}>
                        {person.firstname +
                          " " +
                          (person.middlename ? person.middlename : "") +
                          " " +
                          person.lastname}
                      </Option>
                    ))
                  ) : (
                    this.state.Guarantor.map((person) => (
                      <Option value={person.id}>
                        {person.firstname +
                          " " +
                          (person.middlename ? person.middlename : "") +
                          " " +
                          person.lastname}
                      </Option>
                    ))
                  )
                ) : (
                  <></>
                )}
              </Select>
            </Col>
            <Col span={5}>
              <Row>
                <label>Entry ID</label>
              </Row>
              <Input
                className="ar_inputid"
                placeholder="Entry ID"
                value={this.state.entryId}
                onChange={(e) => {
                  this.setState({
                    entryId: e.target.value,
                  });

                  setTimeout(() => {
                    this.updateGetAR();
                  }, 500);
                }}
              />
            </Col>
          </Row>
          <Row className="ar_duedate" type="flex" justify="space-between">
            <Col span={10}>
              <Row>
                <label htmlFor="due-date-select">By Due Date</label>
              </Row>

              <Select
                id="due-date-select"
                mode="multiple"
                className="ar_mw100"
                placeholder="Select due dates"
                onChange={this.handleChangeDueDate}
              >
                <Option value="amount_between_0_30">AR (0-29 Days)</Option>
                <Option value="amount_between_31_60">AR (30-59 Days)</Option>
                <Option value="amount_between_61_90">AR (60-89 Days)</Option>
                <Option value="amount_greater_than_90">AR (+90 Days)</Option>
              </Select>
            </Col>
            <Col span={13} className="ar_mr15">
              <Row>
                <label>
                  Amount{" "}
                  {"($" +
                    this.state.min_amount +
                    " _ $" +
                    this.state.max_amount +
                    ")"}
                </label>
              </Row>

              <Slider
                className="ar_slider"
                range
                onChange={(e) => {
                  this.setState({
                    min_amount: e[0],
                    max_amount: e[1],
                  });
                  setTimeout(() => {
                    this.updateGetAR();
                  }, 500);
                }}
                value={[this.state.min_amount, this.state.max_amount]}
                min={0}
                max={this.state.maxAr}
              />
            </Col>
          </Row>

          <Row className="ar_mt15">
            <Col span={6}>
              <Card>
                <Row type="flex" justify="space-between">
                  <p> AR (0-29 Days)</p>
                  <p className="cardValue">
                    ${this.state.cardData.total_0_30}.00
                  </p>
                </Row>
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Row type="flex" justify="space-between">
                  <p>AR (30-59 Days)</p>
                  <p className="cardValue">
                    ${this.state.cardData.total_31_60}.00
                  </p>
                </Row>
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Row type="flex" justify="space-between">
                  <p>AR (60-89 Days)</p>
                  <p className="cardValue">
                    ${this.state.cardData.total_61_90}.00
                  </p>
                </Row>
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Row type="flex" justify="space-between" align="middle">
                  <p>AR (+90 Days)</p>
                  <p className="cardValue">
                    ${this.state.cardData.total_greater_than_90}.00
                  </p>
                </Row>
              </Card>
            </Col>
          </Row>
          <div className="requests">
            <br />
            <Table
              style={{ cursor: "pointer" }}
              columns={columns}
              dataSource={this.state.ARList}
              onRow={(record, rowIndex) => {
                return {
                  onClick: (event) => {
                    localStorage.setItem(
                      "totalAmount.id",
                      eval(record.total_amount.split("$")[1].replace(",", ""))
                    );
                    localStorage.setItem("guarantor.id", record.guarantor.id);
                    this.props.history.push(
                      "/ar-detail/" +
                        record.guarantor.firstname +
                        "-" +
                        record.guarantor.lastname +
                        "/?id=" +
                        record.id
                    );
                  },
                };
              }}
              pagination={false}
            /> 
            <Row type="flex" justify="end" className="ar_mt15">
              <Pagination
                disabled={this.state.loading}
                current={this.state.currentPage}
                total={this.state.page_size}
                onChange={this.handlePageChange}
                className="paginator"
                size="large"
              />
            </Row>
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

const connectedAR = connect(mapStateToProps)(AR);

export default withRouter(connectedAR);
