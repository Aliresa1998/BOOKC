import {
  Card,
  Table,
  Input,
  Col,
  DatePicker,
  Row,
  Select,
  Slider,
  Typography,
  Button,
  Divider,
  Tag
} from "antd";
import dayjs from "dayjs";
import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { dashboardActions } from "../../actions";
import { controller } from "../../controller";
import DashboardLayout from "../../layout/dashboardLayout/DashboardLayout";
import BlueCard from "../Membership/Components/BlueCard";
import card from '../../assets/icons/card-tick.png'
import filter from '../../assets/icons/filter.png';
import calendar from '../../assets/icons/calendar.png';
import arrow from '../../assets/icons/arrow-left.png';

import "../app.local.css";
import "./style.css";
import _ from "lodash";
const { MonthPicker, RangePicker } = DatePicker;
const { Option } = Select;
const { Title } = Typography
const dateFormat = "YYYY/MM/DD";

const onChange = (date, dateString) => {
  console.log(date, dateString);
};
class AR extends Component {

  constructor(props) {
    super(props);

    this.state = {
      showContent: false
    };

    this.state = {
      selectedFilters: [],
    };


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
    this.updateSelectedFilters = this.updateSelectedFilters.bind(this);
    // this.removeFilter = this.removeFilter.bind(this);


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

  updateSelectedFilters = () => {
    const filters = [];
    if (this.state.selectedStartDate) {
      filters.push(`Start Date: ${this.state.selectedStartDate}`);
    }
    if (this.state.selectedEndDate) {
      filters.push(`End Date: ${this.state.selectedEndDate}`);
    }
    if (this.state.selectedDueDates && this.state.selectedDueDates.length > 0) {
      filters.push(`Due Dates: ${this.state.selectedDueDates.join(', ')}`);
    }
    if (this.state.selectedPatient) {
      filters.push(`Patient: ${this.state.selectedPatient}`);
    }
    if (this.state.selectedId) {
      filters.push(`ID: ${this.state.selectedId}`);
    }
    if (this.state.selectedAmountRange && this.state.selectedAmountRange.length === 2) {
      filters.push(`Amount Range: $${this.state.selectedAmountRange[0]} - $${this.state.selectedAmountRange[1]}`);
    }

    this.setState({ selectedFilters: filters });
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
    this.setState({ selectedDueDate: value }, () => {
      this.updateSelectedFilters();
    });
  };

  handleSearchGuarantor = async (value) => {
    const responsegetGuarantor = await controller.searchGuarantor(value);
    this.setState({
      Guarantor: responsegetGuarantor,
    });
  };

  handleStartDateChange = (date, dateString, value) => {
    this.setState({ selectedStartDate: dateString }, () => {
      this.updateSelectedFilters();
      setTimeout(() => {
        this.updateGetAR();
      }, 500);
    });

  };


  handleEndDateChange = (date, dateString, value) => {
    this.setState({ selectedEndDate: dateString }, () => {
      this.updateSelectedFilters();
      setTimeout(() => {
        this.updateGetAR();
      }, 500);
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

  toggleContent = () => {
    this.setState(prevState => ({
      showContent: !prevState.showContent
    }));
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
        sorter: (a, b) => a.id - b.id,
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
        sorter: (a, b) => a.amount_between_0_30 - b.amount_between_0_30,
      },
      {
        title: "AR (30-59 Days)",
        dataIndex: "amount_between_31_60",
        key: "amount_between_31_60",
        sorter: (a, b) => a.amount_between_31_60 - b.amount_between_31_60,
      },
      {
        title: "AR (60-89 Days)",
        dataIndex: "amount_between_61_90",
        key: "amount_between_61_90",
        sorter: (a, b) => a.amount_between_61_90 - b.amount_between_61_90,
      },
      {
        title: "AR (+90)",
        dataIndex: "amount_greater_than_90",
        key: "amount_greater_than_90",
        sorter: (a, b) => a.amount_greater_than_90 - b.amount_greater_than_90,
      },
      {
        title: "Total Amount",
        dataIndex: "total_amount",
        key: "total_amount",
        sorter: (a, b) => a.total_amount - b.total_amount,
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

    const data = [
      {
        id: 1,
        guarantor: {
          firstname: "John",
          lastname: "Doe"
        },
        amount_between_0_30: 1000,
        amount_between_31_60: 500,
        amount_between_61_90: 300,
        amount_greater_than_90: 200,
        total_amount: 2000,
        current_date: "2024-03-24T10:30:00" // Assuming ISO 8601 format for date string
      },
      {
        id: 2,
        guarantor: {
          firstname: "Jane",
          lastname: "Doe"
        },
        amount_between_0_30: 1500,
        amount_between_31_60: 700,
        amount_between_61_90: 400,
        amount_greater_than_90: 100,
        total_amount: 2700,
        current_date: "2024-03-23T15:45:00" // Assuming ISO 8601 format for date string
      },
      // Add more sample data as needed
    ];

    return (
      <DashboardLayout
        breadCrumb={"AR"}
        logo={profileSummary && profileSummary.logo ? profileSummary.logo : ""}
        footerLogo={this.state.serverLogo}
      >
        <div className="paymentRequestContent">
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25, width: '100%' }}>
            <Title level={3}>Accounts Receivable</Title>
            {!this.state.showContent && (
              <Button
                className="details-button-color1"
                type="text"
                onClick={this.toggleContent}
              >
                <span className="size-16" style={{ color: 'black' }}>Filters</span>
                <img src={filter} alt="" style={{ marginLeft: '8px' }} />
              </Button>
            )}
          </div>
          {this.state.showContent && (
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25, width: '100%', alignItems: 'center' }}>
              <Title level={5}>Advanced Filters</Title>
              <Button
                className="details-button-color1"
                type="text"
                onClick={this.toggleContent}
              >
                <img src={filter} alt="" style={{ marginLeft: '8px', bottom: 5, position: 'relative' }} />
              </Button>
            </div>
          )}
          <div className="selected-filters">

            {this.state.selectedFilters && this.state.selectedFilters.map((filter, index) => (
              <>
                <Tag key={index} closable style={{ height: 28, background: '#EEEDFA', borderRadius: '500px', color: '#6B43B5', padding: 3, paddingLeft: 8, paddingRight: 8 }}>
                  {filter}
                </Tag>
              </>
            ))}
          </div>
          {this.state.showContent && (

            <>
              <Row justify="space-between" type="flex" style={{ marginBottom: 23 }}>
                <Col span={8}>
                  <Row>
                    <label>Start Date</label>
                  </Row>
                  <div className="c1">
                    <DatePicker onChange={this.handleStartDateChange} suffixIcon={<img src={calendar} alt="" />} style={{ width: '320px', height: 42, border: '1px solid #6B43B5' }} format={dateFormat} />
                    <Divider type="vertical" className="vertical-divider" />
                  </div>
                </Col>
                <Col span={8}>
                  <Row>
                    <label>End Date</label>
                  </Row>
                  <DatePicker onChange={this.handleEndDateChange} suffixIcon={<img src={calendar} alt="" />} style={{ width: '320px', height: 42, border: '1px solid #6B43B5' }} format={dateFormat} />
                  <Divider type="vertical" className="vertical-divider" />
                </Col>
                <Col span={8} style={{ marginTop: 4 }} >
                  <Row>
                    <label style={{ marginBottom: 15 }}  > Due Date</label>
                  </Row>

                  <Select
                    style={{ width: '320px', height: 42, border: '1px solid #6B43B5', borderRadius: '7px' }}
                    id="due-date-select"
                    mode="multiple"
                    // className="ar_mw100"
                    placeholder="Select due dates"
                    onChange={this.handleChangeDueDate}
                    suffixIcon={<img src={arrow} alt="" />}
                  >
                    <Option value="amount_between_0_30">AR (0-29 Days)</Option>
                    <Option value="amount_between_31_60">AR (30-59 Days)</Option>
                    <Option value="amount_between_61_90">AR (60-89 Days)</Option>
                    <Option value="amount_greater_than_90">AR (+90 Days)</Option>
                  </Select>
                  <Divider type="vertical" className="vertical-divider1" />
                </Col>
                <Col span={24} style={{ display: 'flex', flexDirection: 'row', marginTop: 20 }}>
                  <Col span={8}>
                    <Row>
                      <label>Patient</label>
                    </Row>

                    <Select
                      style={{ width: '320px', height: "42px", border: '1px solid #6B43B5', borderRadius: '7px' }}
                      // className="ar_mw100"
                      placeholder="Patient"
                      suffixIcon={<img src={arrow} alt="" />}
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
                        this.setState({ selectedPatient: e }, () => {
                          this.updateSelectedFilters();
                        });
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
                    <Divider type="vertical" className="vertical-divider" />
                  </Col>

                  <Col span={8}>
                    <Row>
                      <label>ID</label>
                    </Row>
                    <Input
                      style={{ width: '320px', height: 42, border: '1px solid #6B43B5', borderRadius: '8px' }}
                      // className="ar_inputid"
                      placeholder="Entry ID"
                      value={this.state.entryId}
                      onChange={(e) => {
                        this.setState({
                          entryId: e.target.value,
                        });

                        setTimeout(() => {
                          this.updateGetAR();
                        }, 500);
                      }} />
                    <Divider type="vertical" className="vertical-divider" />
                  </Col>
                  <Row >
                    <Col span={8} >
                      <Row>
                        <label>
                          Amount
                          {/* {"($" +
                          this.state.min_amount +
                          " _ $" +
                          this.state.max_amount +
                          ")"} */}
                        </label>
                      </Row>

                      <Slider
                        style={{ width: '310px', height: 42 }}
                        // className="ar_slider"
                        range
                        onChange={(e) => {
                          this.setState({
                            min_amount: e[0],
                            max_amount: e[1],
                          });
                          setTimeout(() => {
                            this.updateGetAR();
                            this.setState({ selectedAmountRange: e }, () => {
                              this.updateSelectedFilters();
                            });
                          }, 500);
                        }}
                        value={[this.state.min_amount, this.state.max_amount]}
                        min={0}
                        max={this.state.maxAr} />
                    </Col>
                  </Row>
                </Col>
              </Row>
              <hr style={{ border: "1px solid #B7B7B7", marginBottom: 40 }} />


            </>
          )}
          <Col xs={24} style={{ marginBottom: 15, marginTop: 20 }} >
            <Card>
              <div className="flex-row-evenly">
                <div style={{ width: 310, height: 108, display: 'flex', alignItems: 'center', flexDirection: 'row', background: 'rgba(223, 218, 255, 0.7)', borderRadius: '8px' }}>
                  <div className='circle' style={{ marginLeft: 15 }}>
                    <img className='icon-center' src={card} alt='' />
                  </div>
                  <div style={{ marginLeft: 20 }}>
                    <div style={{ fontSize: 20, fontWeight: 400, color: '#4D3280', marginBottom: 5 }}>AR <span style={{ fontSize: 16, color: '#5D3B9C' }}>(0-29 Days)</span></div>
                    <div style={{ fontSize: 24, color: "#5D3B9C", fontWeight: 700, }}>${this.state.cardData.total_0_30}.00</div>
                  </div>
                </div>
                <div style={{ width: 310, height: 108, display: 'flex', alignItems: 'center', flexDirection: 'row', background: 'rgba(223, 218, 255, 0.7)', borderRadius: '8px' }}>
                  <div className='circle' style={{ marginLeft: 15 }}>
                    <img className='icon-center' src={card} alt='' />
                  </div>
                  <div style={{ marginLeft: 20 }}>
                    <div style={{ fontSize: 20, fontWeight: 400, color: '#4D3280', marginBottom: 5 }}>AR <span style={{ fontSize: 16, color: '#5D3B9C' }}>(30-59 Days)</span></div>
                    <div style={{ fontSize: 24, color: "#5D3B9C", fontWeight: 700, }}>${this.state.cardData.total_31_60}.00</div>
                  </div>
                </div>
                <div style={{ width: 310, height: 108, display: 'flex', alignItems: 'center', flexDirection: 'row', background: 'rgba(223, 218, 255, 0.7)', borderRadius: '8px' }}>
                  <div className='circle' style={{ marginLeft: 15 }}>
                    <img className='icon-center' src={card} alt='' />
                  </div>
                  <div style={{ marginLeft: 20 }}>
                    <div style={{ fontSize: 20, fontWeight: 400, color: '#4D3280', marginBottom: 5 }}>AR <span style={{ fontSize: 16, color: '#5D3B9C' }}>(60-89 Days)</span></div>
                    <div style={{ fontSize: 24, color: "#5D3B9C", fontWeight: 700, }}>${this.state.cardData.total_61_90}.00</div>
                  </div>
                </div>
                <div style={{ width: 310, height: 108, display: 'flex', alignItems: 'center', flexDirection: 'row', background: 'rgba(223, 218, 255, 0.7)', borderRadius: '8px' }}>
                  <div className='circle' style={{ marginLeft: 15 }}>
                    <img className='icon-center' src={card} alt='' />
                  </div>
                  <div style={{ marginLeft: 20 }}>
                    <div style={{ fontSize: 20, fontWeight: 400, color: '#4D3280', marginBottom: 5 }}>AR <span style={{ fontSize: 16, color: '#5D3B9C' }}>(+90 Days)</span></div>
                    <div style={{ fontSize: 24, color: "#5D3B9C", fontWeight: 700, }}>${this.state.cardData.total_greater_than_90}.00</div>
                  </div>
                </div>
              </div>
            </Card>
          </Col>
          <div className="requests">
            <br />
            <Table
              style={{ borderRadius: 8, boxShadow: ' 0px 0px 10px 0px rgba(0, 0, 0, 0.15)' }}
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
