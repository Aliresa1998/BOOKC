import {
  Col,
  Input,
  Radio,
  Row,
  Select,
  message,
  notification,
  Card,
  Button,
  Avatar,
  Table,
  Tag
} from "antd";
import React, { Component } from "react";
import Chart from "react-apexcharts";
import { connect } from "react-redux";
import { controller } from "../../controller";
import DashboardLayout from "../../layout/dashboardLayout/DashboardLayout";
import BarChart from "./BarChart";
import CustomTable from "./Components/CustomTable";
import DashboardCard from "./Components/DashboardCard";
import { Controller } from "./Controller/Controller";
import "./style.css";
import BlueCard from "./Components/BlueCard";
import BarChartWithLabel from './Components/BarCharWithtLabel';
import DashboardDonut from "./Components/DashboardDonut";
import DonutChart from "../../New/component/DonutChart";
import people from "../../assets/icons/people.png";
import cards from "../../assets/icons/cards.png";
import strongbox from "../../assets/icons/strongbox-2.png";
import image from "../../assets/img/imgo2.jpg";
const { Search } = Input;
const { TextArea } = Input;
const { Option } = Select;
const { Meta } = Card

const BarChartLabel = [
  "Scaling",
  "Root Planing",
  "Polishing",
  "Fluoride Gel",
  "Fluoride Varnish",
  "Oral Hygiene Instructions",
  "Nightguard Maxillary",
  "Nightguard Mandibular",
  "Sealants",
];
const BarChartValue = [9.8, 9.4, 9.0, 8.6, 8.5, 6, 4.5, 4, 2.5];

const BarChartLabel1 = ["Scaling", "Root Planing", "Polishing", "Fluoride Gel"];

const BarChartValue1 = [9.8, 9.4, 9.0, 8.6];

const BarChartLabel2 = [
  "Posterior Composite Restoration",
  "Bicuspid Composite Restoration",
  "Anterior Composite Resortation",
  "Extraction Uncomplicated",
];
const BarChartValue2 = [9.0, 8.4, 7.0, 5.6];

const chartData = [
  {
    data: [6, 9, 5, 4]
  }
];

const chartData2 = [
  {
    data: [4, 9, 8, 6]
  }
];

const chartData3 = [
  {
    data: [40, 90, 80, 60, 40, 55, 72, 65],
  }
];

const chartData4 = [
  {
    data: [40, 90, 80, 60, 40, 55, 72, 65, 90, 73, 54, 69],
  }
];

const categories = ['Scaling', 'Root Planing', 'Fluoride Gel', 'Scaling'];
const categories2 = ['Scaling', 'Root Planing', 'Fluoride Gel', 'Scaling', 'Scaling',
  'Root Planing', 'Fluoride Gel', 'Scaling'];
const categories3 = ['Jan', 'Feb', 'Mar', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'May', 'Apr', 'Jun']

const columns = [
  {
    title: "User Name",
    dataIndex: "username",
    key: "username",
  },
  {
    title: "Subscription Plan",
    dataIndex: "subscription",
    key: "subscription",
  },
  {
    title: "Start Date",
    dataIndex: "startdate",
    key: "startdate",
  },
  {
    title: "Expiry Date",
    dataIndex: "expirydate",
    key: "expirydate",
  },
  {
    title: "Action",
    key: "action",
    render: (_, record) => (
      <span>
        <Button type="link" >
          Notify
        </Button>
      </span>
    ),
  },
];

const data = [
  {
    key: "1",
    username: "John Brown",
    subscription: "Membership Plan",
    startdate: "2023/12/12",
    expirydate: "2024/12/12",
    status: "Active",
  },
  {
    key: "2",
    username: "John Brown",
    subscription: "Membership Plan",
    startdate: "2023/12/12",
    expirydate: "2024/12/12",
    status: "Active",
  },
];

const columns1 = [
  {
    title: "User Name",
    dataIndex: "username",
    key: "username",
  },
  {
    title: "Last Visit",
    dataIndex: "lastvisit",
    key: "lastvisit",
  },
  {
    title: "Subscription",
    dataIndex: "subscription",
    key: "subscription",
    render: (subscription) => (
      <Tag
        color={subscription === "Active" ? "rgba(35, 208, 32, 0.2)" : "volcano"}
        style={{ borderRadius: "20px", color: "#23D020", width: 87, textAlign: 'center' }}
      >
        {subscription}
      </Tag>
    ),
  },
  {
    title: "Action",
    key: "action",
    render: (_, record) => (
      <span>
        <Button type="link" >
          View
        </Button>
      </span>
    ),
  },
];

const data1 = [
  {
    key: "1",
    username: "John Brown",
    lastvisit: "2023/12/12",
    subscription: "Active",

  },
  {
    key: "2",
    username: "John Brown",
    lastvisit: "2023/12/12",
    subscription: "Active",
  },
];


const Config = {
  headers: {
    Authorization: localStorage.getItem("user")
      ? "Token " + JSON.parse(localStorage.getItem("user")).key
      : "",
  },
};

const props = {
  name: "file",
  action: "https://www.mocky.io/v2/5cc8019d300000980a055e76",
  headers: {
    authorization: "authorization-text",
  },
  onChange(info) {
    if (info.file.status === "done") {
      message.success(`${info.file.name} file uploaded successfully`);
    } else if (info.file.status === "error") {
      message.error(`${info.file.name} file upload failed.`);
    }
  },
};

class Dashboard extends Component {
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

  getRecentActiveMember = async () => {
    const response = await Controller.RecentlyActiveMembers();
    this.setState({
      recentActiveMembers: response.json.results,
      recentActiveMembersCount: response.json.count,
    });
  };

  MembershipExpire = async () => {
    const response = await Controller.MembershipExpire();
    this.setState({
      expireSubMembers: response.json.results,
      expireSubMembersCount: response.json.count,
    });
  };

  getMrr = async () => {
    const response = await Controller.GetMRR();
    this.setState({
      mrr: response.json.results,
    });
  };

  getMember = async () => {
    const response = await Controller.TotalMembers();
    this.setState({
      totalMember: response.json.Total_Members,
    });
  };

  getMOM = async () => {
    const response = await Controller.GetMOM();
    this.setState({
      mom: response.json.mom,
    });
  };

  BarChart = async () => {
    const response = await Controller.GetDashboardBarChart();
    var categories = [];
    var data = [];

    for (var i in response.json) {
      categories.push(i);
      data.push(response.json[i]);
    }
    this.setState({
      bar: {
        options: {
          chart: {
            id: "apexchart-example",
          },
          xaxis: {
            categories: categories,
          },
        },
        series: [
          {
            name: "series-1",
            data: data,
          },
        ],
      },
    });
  };

  PyChartType = async (type) => {
    const response = await Controller.GetDashboardPyChart(type);
    var categories = [];
    var data = [];

    for (var i in response.json) {
      categories.push(i);
      data.push(response.json[i]);
    }
    this.setState({
      pie: {
        series: data,
        options: {
          labels: categories,
          chart: {
            type: "donut",
          },
          responsive: [
            {
              breakpoint: 480,
              options: {
                chart: {
                  width: 200,
                },
                legend: {
                  position: "bottom",
                },
              },
            },
          ],
        },
      },
    });
  };

  PyChart = async () => {
    const response = await Controller.GetDashboardPyChart(this.pieChartType);
    var categories = [];
    var data = [];

    for (var i in response.json) {
      categories.push(i);
      data.push(response.json[i]);
    }
    this.setState({
      pie: {
        series: data,
        options: {
          labels: categories,
          chart: {
            type: "donut",
          },
          responsive: [
            {
              breakpoint: 480,
              options: {
                chart: {
                  width: 200,
                },
                legend: {
                  position: "bottom",
                },
              },
            },
          ],
        },
      },
    });
  };

  getData = () => {
    this.getMrr();

    this.getMember();

    this.getMOM();

    this.getRecentActiveMember();

    this.MembershipExpire();

    this.BarChart();

    this.PyChartType("year");
  };

  constructor(props) {
    super(props);
    this.getData();

    this.state = {
      width: 0,
      height: 0,
      pieChartType: "year",
      recentActiveMembers: [],
      recentActiveMembersCount: "0",
      recentActiveMembersPage: "0",

      expireSubMembers: [],
      expireSubMembersCount: "0",
      expireSubMembersPage: "0",

      bar: {
        options: {
          chart: {
            id: "apexchart-example",
          },
          xaxis: {
            categories: [1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999],
          },
        },
        series: [
          {
            name: "series-1",
            data: [30, 40, 35, 50, 49, 60, 70, 91, 125],
          },
        ],
      },
      totalMember: "",
      mrr: "",
      mom: 0,
      pie: {
        series: [],
        options: {
          labels: [],
          chart: {
            type: "donut",
          },
          responsive: [
            {
              breakpoint: 480,
              options: {
                chart: {
                  width: 200,
                },
                legend: {
                  position: "bottom",
                },
              },
            },
          ],
        },
      },
    };
    this.handleChangePieChartType = this.handleChangePieChartType.bind(this);
    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
  }
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

  handleChangePieChartType = async (e, value) => {
    this.setState({
      pieChartType: e.target.value,
    });
    this.PyChartType(e.target.value);
  };

  handleChangeCurrentState = (e) => {
    this.setState({ currentState: e.target.value });
  };

  handleChange(e) {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  }

  render() {
    const { profileSummary } = this.props;
    return (
      <DashboardLayout
        breadCrumb={false}
        logo={profileSummary && profileSummary.logo ? profileSummary.logo : ""}
        footerLogo={true}
      >
        <Row
          type="flex"
          justify="space-between"
          style={{
            margin: "0px 7px 0px 7px",
            paddingTop: "20px",
            paddingBottom: "10px",
          }}
          gutter={[30, 45]}
        >
          <Col xs={24} >
            <Card>
              <div className="flex-row-evenly">
                <BlueCard name={"Total Member"} value={"1300"} icon={people} />
                <BlueCard name={"MRR"} value={"$0.00"} icon={strongbox} />
                <BlueCard name={"MoM Growth"} value={"$0.00"} icon={cards} />
              </div>
            </Card>
          </Col>
          <Col xs={24} md={8} lg={8}>
            <Card className="card-height">
              <p className="card-title">
                Memberships
              </p>
              <DashboardDonut />
            </Card>
          </Col>
          <Col xs={24} md={8} lg={8}>
            <Card>
              <p className="card-title">
                Most Common Treatments
              </p>
              <BarChartWithLabel chartdata={chartData} categories={categories} rotate={-45} />
            </Card>
          </Col>
          <Col xs={24} md={8} lg={8}>
            <Card>
              <p className="card-title2">
                Most Common Preventive Treatments
              </p>
              <BarChartWithLabel chartdata={chartData2} categories={categories} rotate={-45} />
            </Card>
          </Col>
          <Col xs={24} md={16} lg={16} >
            <p className="card-title2">
              Impact of Preventive Treatments
            </p>
            <Card>
              <div className="border-padding">
                <BarChartWithLabel chartdata={chartData3} categories={categories2} rotate={-45} />
              </div>
            </Card>
          </Col>
          <Col xs={24} md={8} lg={8} className="col-margin" >
            <Card>
              <p className="card-title">
                Preventative Core Score
              </p>
              <DonutChart
                fillPercentage={98}
                label="Preventative Core Score"
                Value="9.8"
                height='330px'
                fontSize="22px"
              />
            </Card>
          </Col>
          <Col xs={24} md={16} lg={16} >
            <div
              className="row-flex-space"
            >
              <p className="card-title2">Updated Treatment Plans</p>
              <Button
                className="button-primary"
              >
                Details
              </Button>
            </div>
            <Row gutter={[20, 25]}>
              <Col xs={24} md={24} lg={24}>
                <Card className="radius-card">
                  <div
                    className="space-between"
                  >
                    <div
                      className="avatar"
                    >
                      <Avatar className="align-self" size={70} shape="circle" src={image} />
                      <Meta
                        className="align-left"
                        title="John Bing "
                        description="john91"
                      />
                      <Meta
                        className="card2"
                        title='5 updated Treatment Plans'
                        description='includes: Crown Tooth 15, Root Canal Tooth 15, Night Guard, ...'
                      />
                    </div>
                  </div>
                </Card>
              </Col>
              <Col xs={24} md={24} lg={24}>
                <Card className="radius-card">
                  <div
                    className="space-between"
                  >
                    <div
                      className="avatar"
                    >
                      <Avatar className="align-self" size={70} shape="circle" src={image} />
                      <Meta
                        className="align-left"
                        title="John Bing "
                        description="john91"
                      />
                      <Meta
                        className="card2"
                        title='5 updated Treatment Plans'
                        description='includes: Crown Tooth 15, Root Canal Tooth 15, Night Guard, ...'
                      />
                    </div>
                  </div>
                </Card>
              </Col>
              <Col xs={24} md={24} lg={24}>
                <Card className="radius-card">
                  <div
                    className="space-between"
                  >
                    <div
                      className="avatar"
                    >
                      <Avatar className="align-self" size={70} shape="circle" src={image} />
                      <Meta
                        className="align-left"
                        title="John Bing "
                        description="john91"
                      />
                      <Meta
                        className="card2"
                        title='5 updated Treatment Plans'
                        description='includes: Crown Tooth 15, Root Canal Tooth 15, Night Guard, ...'
                      />
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>
          </Col>
          <Col xs={24} md={8} lg={8} >
            <Card>
              <p className="card-title">
                Treatment Plan Execution Score
              </p>
              <DonutChart
                fillPercentage={69}
                label="Treatment Plan Execution Score"
                Value="6.9"
                height='330px'
                fontSize="22px"
              />
            </Card>
          </Col>
          <Col xs={24} md={14} lg={14}>
            <p className="card-title2">Subcribtion about to expire </p>
            <Table
              className="dashboard-table"
              columns={columns}
              dataSource={data}
              pagination={false}
            />
          </Col>
          <Col xs={24} md={10} lg={10}>
            <p className="card-title2">Recently Active Members</p>
            <Table
              className="dashboard-table"
              columns={columns1}
              dataSource={data1}
              pagination={false}
            />
          </Col>
          <Col xs={24} md={24} lg={24}>
            <p className="card-title2">New Members</p>
            <Card>
              <div className="border-padding">
                <BarChartWithLabel chartdata={chartData4} categories={categories3} />
              </div>
            </Card>
          </Col>
          {/* <Col
            span={this.state.width < 740 ? 24 : 12}
            className="dashboard_card"
            justify="middle"
          >
            <DashboardCard
              name="Treatment Plan Execution Score"
              value={4.8}
              color="red"
            />
            <div className="dashboard_card-preventative">
              <DashboardCard
                name="Preventative Care Score"
                value={6.2}
                color="green"
              />
            </div>
          </Col> */}
          {/* <Col
            span={this.state.width < 740 ? 24 : 12}
            style={
              this.state.width < 740
                ? { marginLeft: "0px" }
                : { margin: "0px", width: "49%" }
            }
          > */}
            {/* <Card>
              <h5> Impact of Preventive Treatments </h5>
              <BarChart
                style={{ position: "inherit" }}
                label={BarChartLabel}
                value={BarChartValue}
                name="Prevention Impact Score"
              />
            </Card>
          </Col> */}
        </Row>
        {/* <Row
          type="flex"
          justify="space-between"
          className="membership_barchart"
        >
          <Col
            span={this.state.width < 1189 ? 24 : null}
            style={
              this.state.width < 1189
                ? { marginLeft: "0px" }
                : { width: "49%", margin: "0px" }
            }
          >
            <Card>
              <h5>Most Common Preventive Treatments</h5>
              <BarChart
                style={{ position: "inherit" }}
                label={BarChartLabel1}
                value={BarChartValue1}
                name="Common Preventative Treatments"
              />
            </Card>
          </Col>

          <Col
            span={this.state.width < 1189 ? 24 : null}
            style={
              this.state.width < 1189
                ? { marginLeft: "0px" }
                : { width: "49%", margin: "0px" }
            }
          >
            <Card>
              <h5>Most Common Treatments</h5>
              <BarChart
                style={{ position: "inherit" }}
                label={BarChartLabel2}
                value={BarChartValue2}
                name="Common Treatments"
              />
            </Card>
          </Col>
        </Row>

        <Row
          type="flex"
          justify="space-between"
          className="membership_barchart"
        >
          <DashboardCard name="Total Member" value={this.state.totalMember} />
          <DashboardCard name="MRR" value={this.state.mrr} />
          <DashboardCard
            name="MoM Growth"
            value={this.state.mom ? this.state.mom : "-"}
          />
        </Row>
        <Row
          type="flex"
          justify="space-between"
          className="membership_barchart"
        >
          <Col
            span={this.state.width < 1189 ? 24 : null}
            style={
              this.state.width < 1189
                ? { marginLeft: "0px" }
                : { width: "49%", margin: "0px" }
            }
          >
            <Card>
              <p className="membership_f16b">New members</p>
              <div className="payreq-container">
                <Chart
                  options={this.state.bar.options}
                  series={this.state.bar.series}
                  type="bar"
                  width={450}
                  height={320}
                />
              </div>
            </Card>
          </Col>
          <Col
            span={this.state.width < 1189 ? 24 : null}
            style={
              this.state.width < 1189
                ? { marginLeft: "0px" }
                : { width: "49%", margin: "0px" }
            }
          >
            <Card bodyStyle={{ paddingBottom: "54px" }}>
              <Row type="flex" justify="space-between">
                <p className="membership_f16b">Memberships</p>

                <Radio.Group
                  value={this.state.pieChartType}
                  onChange={this.handleChangePieChartType}
                >
                  <Radio.Button value="year">Year</Radio.Button>
                  <Radio.Button value="month">Month</Radio.Button>
                  <Radio.Button value="day">Day</Radio.Button>
                </Radio.Group>
              </Row>
              <div className="payreq-container">
                <Chart
                  options={this.state.pie.options}
                  series={this.state.pie.series}
                  type="donut"
                  width={450}
                  height={320}
                />
              </div>
            </Card>
          </Col>
        </Row>
        <Row
          type="flex"
          justify="space-between"
          className="membership_barchart"
        >
          <Col
            span={this.state.width < 1189 ? 24 : null}
            style={
              this.state.width < 1189
                ? { marginLeft: "0px" }
                : { width: "49%", margin: "0px" }
            }
          >
            <Card>
              <p className="membership_f16b">Recently active members</p>
              <div className="payreq-container">
                <CustomTable
                  rows={this.state.recentActiveMembers}
                  type="memberList"
                />
              </div>
            </Card>
          </Col>
          <Col
            span={this.state.width < 1189 ? 24 : null}
            style={
              this.state.width < 1189
                ? { marginLeft: "0px" }
                : { width: "49%", margin: "0px" }
            }
          >
            <Card>
              <p className="membership_f16b">Subcribtion about to expires</p>
              <div className="payreq-container">
                <CustomTable
                  mode="expireSub"
                  rows={this.state.expireSubMembers}
                  type="memberList"
                />
              </div>
            </Card>
          </Col>
        </Row> */}
      </DashboardLayout>
    );
  }
}

function mapStateToProps(state) {
  const { creating, error } = state.paymentRequest;
  const { profileSummary } = state.dashboard;
  return {
    creating,
    error,
    profileSummary,
  };
}

const connectedDashboard = connect(mapStateToProps)(Dashboard);

export default connectedDashboard;
