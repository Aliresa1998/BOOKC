import {
  Button,
  Card,
  Col,
  Input,
  Modal,
  Row,
  Select,
  Table,
  Typography,
  notification,
  Space,
  Tag,
  Avatar
} from "antd";
import React, { Component } from "react";
import { useState } from "react";
import { connect } from "react-redux";
import { controller } from "../../controller";
import TopBar from "../CommonUi/TopBar";
import Sidebar from "../Sidebar.js";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";

import CustomTable from "./Components/CustomTable";
import GrayCard from "./Components/GrayCard";
import History from "./Components/History";
import ProfileCard from "./Components/ProfileCard";
import DonutChart from "../../New/component/DonutChart";
import BarChart from "./BarChart";

import { Controller } from "./Controller/Controller";

import DashboardCard from "./Components/DashboardCard";
import StackedColumns100Chart from "./StackedColumns100Chart";
import "./style.css";
import DashboardLayout from "../../layout/dashboardLayout/DashboardLayout";
import Pic1 from "../../assets/img/imgo4.jpg";

const { Text, Title } = Typography;
const { Search } = Input;
const { TextArea } = Input;
const { Option } = Select;

const Config = {
  headers: {
    Authorization: localStorage.getItem("user")
      ? "Token " + JSON.parse(localStorage.getItem("user")).key
      : "",
  },
};


const ViewSubscription = ({ row, changeCurrentStateToshowSubscription }) => {
  return (
    <p
      style={{ color: "#0981C8" }}
      onClick={() => {
        changeCurrentStateToshowSubscription(row);
      }}
    >
      View
    </p>
  );
};

const PaymentColumn = [
  {
    title: "Amount",
    dataIndex: "Amount",
    render: (text) => <a>{text}</a>,
  },
  {
    title: "Date",
    render: (record) => {
      return (
        <a>{record.Date ? new Date(record.Date).toLocaleDateString() : "-"}</a>
      );
    },
  },
  {
    title: "Status",
    dataIndex: "Status",
    render: (text) => <a>{text}</a>,
  },
  {
    title: "",
    dataIndex: "Invoice",
    render: (text) => <a>{text}</a>,
  },
];

const columns = [
  {
    title: "Image",
    dataIndex: "image",
    key: "image",
    // render: (text, record) => <Avatar shape="square" src={} />,
  },
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "ID",
    dataIndex: "id",
    key: "id",
  },
  {
    title: "Subscription",
    dataIndex: "subscription",
    key: "subscription",
  },
  {
    title: "Insurance",
    dataIndex: "insurance",
    key: "insurance",
  },
  {
    title: "Treatment Plans",
    dataIndex: "treatmentPlans",
    key: "treatmentPlans",
    render: (text, record) => (
      <span>
        <Text>{record.treatmentPlans.plans} :</Text>
        <Text style={{ marginLeft: 2 }}>
          {record.treatmentPlans.approved} Approved
        </Text>
        <Text style={{ marginLeft: 2, marginRight: 2 }}> + </Text>
        <Text style={{ marginLeft: 2 }}>
          {record.treatmentPlans.unapproved} Unapproved
        </Text>
      </span>
    ),
  },
  {
    title: "Action",
    key: "action",
    // render: (text, record) => (
    //   <Button type="link" onClick={handleClick}>
    //     View
    //   </Button>
    // ),
  },
];

const columns2 = [
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
    sorter: true,
  },
  {
    title: "Start Date",
    dataIndex: "startDate",
    key: "startDate",
    sorter: true,
  },
  {
    title: "Expiry Date",
    dataIndex: "expiryDate",
    key: "expiryDate",
    sorter: true,
  },
  {
    title: "Status",
    key: "status",
    dataIndex: "status",
    render: (status) => (
      <Tag
        color={status === "Active" ? "rgba(35, 208, 32, 0.2)" : "volcano"}
        style={{ borderRadius: "20px", color: "#23D020" }}
      >
        {status.toUpperCase()}
      </Tag>
    ),
  },
  {
    title: "Action",
    key: "action",
    render: (text, record) => (
      <Space size="middle">
        <Button
          type="text"
          icon={<DeleteOutlined />}
          style={{ color: "#979797" }}
        />
        <Button
          type="text"
          icon={<EditOutlined />}
          style={{ color: "#979797" }}
        />
      </Space>
    ),
  },
];

const data2 = [
  {
    key: "1",
    name: "Membership Plan",
    startDate: "2023/12/12",
    expiryDate: "2024/12/12",
    status: "Active",
  },
  {
    key: "2",
    name: "Membership Plan",
    startDate: "2023/12/12",
    expiryDate: "2024/12/12",
    status: "Active",
  },
];

class Members extends Component {



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



  getMrr = async () => {
    const response = await Controller.GetMRR();
    this.setState({
      mrr: response.json.results,
    });
  };

  getData = async () => {
    this.getMrr();
    const response = await Controller.TotalMembers();
    this.setState({
      totalMemmber: response.json.Total_Members,
    });
    const members = await Controller.GetCustomers(this.state.page);
    console.table(response);
    const memberData = [];
    this.setState({
      members: members.json.results,
      page_size: members.json.count,
    });
  };



  getPlanData = async (id) => { };

  getMemberData = async (id) => {
    const response = await Controller.GetMemberDetail(id);
    const responseSubscriptions = await Controller.GetSubscriptions(id);

    var tempSub = [];

    for (var i in responseSubscriptions.json.results) {
      var temp = {
        key: i,
        name: responseSubscriptions.json.results[i].plan_name,
        start: responseSubscriptions.json.results[i].start_date
          ? new Date(
            responseSubscriptions.json.results[i].start_date
          ).toLocaleDateString() +
          " " +
          new Date(
            responseSubscriptions.json.results[i].start_date
          ).toLocaleTimeString()
          : "-",
        exp: responseSubscriptions.json.results[i].expiration_date
          ? new Date(
            responseSubscriptions.json.results[i].expiration_date
          ).toLocaleDateString() +
          " " +
          new Date(
            responseSubscriptions.json.results[i].expiration_date
          ).toLocaleTimeString()
          : "-",
        status: responseSubscriptions.json.results[i].status,
        action: (
          <ViewSubscription
            row={responseSubscriptions.json.results[i]}
            changeCurrentStateToshowSubscription={
              this.changeCurrentStateToshowSubscription
            }
          />
        ),
      };
      tempSub.push(temp);
    }

    this.setState({
      memberProfile: response.json,
      subscriptionRows: tempSub,
    });
  };
  getLogo = async () => {
    const response = await controller.getLogo();
    this.setState({ serverLogo: response.data.dark });
  };
  getPlanData = async (planId) => {
    const response = await Controller.GetMemberPayment(
      this.state.selectedMember.id,
      planId
    );
    var tempHis = [];

    for (var i in response.json.results) {
      var payment = {
        Amount: response.json.results[i].amount,
        Status: response.json.results[i].status,
        Date: response.json.results[i].created,
        Invoice: (
          <a
            target="_blank"
            href={"http://" + response.json.results[i].invoice_link}
          >
            Invoice
          </a>
        ),
      };
      tempHis.push(payment);
    }
    this.setState({
      paymentHis: tempHis,
    });
  };

  changeCurrentStateToshowSubscription = (row) => {
    this.getPlanData(row.id);
    this.setState({
      selectedSub: row,
      currentState: "showSubscription",
    });
  };

  // changeCurrentStateToShowMemberDetail = (id) => {
  //   this.getMemberData(id);
  //   this.setState({
  //     selectedMemberId: id, // Set selectedMemberId instead of selectedMember
  //     currentState: "showMemberDetail",
  //   });
  // };

  changeCurrentStateToShowMemberDetail = (row) => {
    this.getMemberData(row.id);
    this.setState({
      selectedMember: row,
      currentState: "showMemberDetail",
    });
  };

  handleChangePage = async (pageNumber) => {
    this.setState({
      page: pageNumber,
    });
    const members = await Controller.GetCustomersSearch(
      pageNumber,
      this.state.searchMember
    );
    this.setState({
      members: members.json.results,
      page_size: members.json.count,
    });
  };

  handleUpdateMember = async () => {
    const members = await Controller.GetCustomersSearch(
      this.state.page,
      this.state.searchMember
    );
    this.setState({
      members: members.json.results,
      page_size: members.json.count,
    });
  };

  componentDidUpdate(prevProps, prevState) {
    if (prevState.searchMember !== this.state.searchMember) {
      this.handleUpdateMember();
    }
  }

  getSubscriptionDetail = async () => {
    const response = await controller.getSubcriptionDetail(
      this.state.selectedSub.id
    );
  };
  componentDidUpdate(prevProps, prevState) {
    if (prevState.currentState !== this.state.currentState) {
      if (this.state.currentState == "showSubscription") {
        this.getSubscriptionDetail();
      }
    }
  }

  constructor(props) {
    super(props);
    this.getData();
    this.state = {
      page_size: 0,
      page: 1,
      count: "",
      searchMember: "",
      serverLogo: "",
      paymentHis: [],
      visibleCreateMemberModal: false,
      mrr: "0",
      newMember: {
        first_name: "",
        last_name: "",
        address: "",
        city: "",
        state: "",
        email: "",
        phone: "",
        zip_code: "",
      },
      memberProfile: {
        Avatar:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTWRNwZEk1zhJQtcRlqD4gVVcA3W7zUvbULcCCxuDy7&s",
        name: "alireza sadeqi",
        Phone: "+1 888-232 21 21",
        Email: "alireza@gmail.com",
        Gender: "male",
        Age: "23",
        Country: "Germany",
        City: "Berlin",
        Address: "15 Charles St E, Toronto, ON M4Y 1S1",
      },
      selectedMember: 0,
      selectedSub: 0,
      currentState: "showTable",
      totalMemmber: 8,
      members: [],
      subscriptionRows: [],
    };
    this.getLogo();
    this.getSubscriptionDetail = this.getSubscriptionDetail.bind(this);
    this.getLogo = this.getLogo.bind(this);
    this.handleCreateMember = this.handleCreateMember.bind(this);
    this.getMemberData = this.getMemberData.bind(this);
    this.handleChangePage = this.handleChangePage.bind(this);
    this.handleUpdateMember = this.handleUpdateMember.bind(this);
    this.getPlanData = this.getPlanData.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.changeCurrentStateToShowMemberDetail =
      this.changeCurrentStateToShowMemberDetail.bind(this);
    this.handleCloseAddService = this.handleCloseAddService.bind(this);
    this.getMrr = this.getMrr.bind(this);
    this.changeCurrentStateToshowSubscription =
      this.changeCurrentStateToshowSubscription.bind(this);
  }

  handleCloseAddService = () => {
    this.setState({
      newMember: {
        first_name: "",
        last_name: "",
        address: "",
        city: "",
        state: "",
        email: "",
        phone: "",
        zip_code: "",
      },
      visibleCreateMemberModal: false,
    });
  };

  handleCreateMember = async () => {
    console.table(this.state.newMember);
    const response = await Controller.createNewMember(this.state.newMember);
    if (response.status < 250) {
      this.openNotification("bottom", "Created successfully", "Successful");
      this.getData();
    } else {
      this.openNotification("bottom", "error", "Error");
    }
    this.handleCloseAddService();
  };

  handleChange(e) {
    const { name, value } = e.target;
    this.setState({
      newMember: {
        ...this.state.newMember,
        [name]: value,
      },
    });
  }

  handleDateChange(value, dateString) {
    this.setState({
      ...this.state,
      appointment_datetime: dateString,
    });
  }

  handleMenuClick(e) {
    this.setState({
      ...this.state,
      reason: e.item.props.children[1],
    });
  }



  render() {
    const { profileSummary } = this.props;
    const { members } = this.state; 

    const mappedData = members && members.map(plan => ({
      key: plan.id.toString(),
      image: plan.profile_picture,
      name: plan.first_name + " " + plan.last_name,
      subscription: "Membership Plan",
      insurance: "Membership Plan",
      treatmentPlans: {
        plans: 5,
        approved: 2,
        unapproved: 3,
      },

    }))


    const initialData = [
      {
        key: "1",
        treatment: "Root Canal Tooth 15",
        notes:
          "Tooth 15 is infected and root canal treatment is indicated to clean and seal the infected canals.",
        priority: 1,
      },
      {
        key: "2",
        treatment: "Crown Tooth 15",
        notes:
          "Crown is recommended on Tooth 15 after root canal therapy to provide structural support and prevent tooth fracture.",
        priority: 2,
      },
    ];

    const columns3 = [
      {
        title: "Treatment Description",
        dataIndex: "treatment",
        key: "treatment",
      },
      {
        title: "Notes",
        dataIndex: "notes",
        key: "notes",
      },
      {
        title: "Priority",
        dataIndex: "priority",
        key: "priority",
      },
      {
        title: "Action",
        key: "action",
        render: (_, record) => (
          <span>
            <Space size="middle">
              <Button
                type="text"
                icon={<DeleteOutlined />}
                style={{ color: "#979797" }}
              />
              <Button
                type="text"
                icon={<EditOutlined />}
                style={{ color: "#979797" }}
              />
            </Space>
          </span>
        ),
      },
    ];

    const Rowkeys = () => {
      const [selectedRowKeys, setSelectedRowKeys] = useState([]);

      const onSelectChange = (selectedRowKeys) => {
        setSelectedRowKeys(selectedRowKeys);
      };

      const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
      };
    }

    const handleclick = (row) => {
      this.changeCurrentStateToShowMemberDetail(row);
    }

    const ColumnsMem = [
      {
        title: "Image",
        dataIndex: "image",
        key: "image",
        render: (avatar, record) => <Avatar size={41} className="square-avatar" shape="square" src={record.image} />,
      },
      {
        title: "Name",
        dataIndex: "name",
        key: "name",
      },
      {
        title: "ID",
        dataIndex: "id",
        key: "id",
      },
      {
        title: "Subscription",
        dataIndex: "subscription",
        key: "subscription",
      },
      {
        title: "Insurance",
        dataIndex: "insurance",
        key: "insurance",
      },
      {
        title: "Treatment Plans",
        dataIndex: "treatmentPlans",
        key: "treatmentPlans",
        render: (text, record) => (
          <span>
            <Text>{record.treatmentPlans.plans} :</Text>
            <Text style={{ marginLeft: 2 }}>
              {record.treatmentPlans.approved} Approved
            </Text>
            <Text style={{ marginLeft: 2, marginRight: 2 }}> + </Text>
            <Text style={{ marginLeft: 2 }}>
              {record.treatmentPlans.unapproved} Unapproved
            </Text>
          </span>
        ),
      },
      {
        title: "Action",
        key: "action",
        render: (row, index) => (
          <Button type="link"
            onClick={() => {
              this.changeCurrentStateToShowMemberDetail(row);
            }}>
            View
          </Button>
        ),
      },
    ];
    //   const mappedData = props.data.treatment_plans.map(plan => ({
    //     key: plan.id.toString(),
    //     treatment: plan.description || "-",
    //     notes: plan.notes || "-",
    //     priority: plan.priority ? plan.priority.toString() : "-",
    // }));

    //   {
    //     key: 1,
    //     name: "John Bing",
    //     id: "@John91",
    //     image: "path_to_johns_image.jpg",
    //     subscription: "Membership Plan",
    //     insurance: "Membership Plan",
    //     treatmentPlans: {
    //       plans: 5,
    //       approved: 2,
    //       unapproved: 3,
    //     },
    //   },
    //   {
    //     key: 2,
    //     name: "John Bing",
    //     id: "@John91",
    //     image: "path_to_johns_image.jpg",
    //     subscription: "Membership Plan",
    //     insurance: "Membership Plan",
    //     treatmentPlans: {
    //       plans: 7,
    //       approved: 4,
    //       unapproved: 3,
    //     },
    //   },
    // ];

    return (
      <DashboardLayout
        breadcrumb={false}
        logo={"x"}
        footerLogo={this.state.serverLogo}
      >
        <div style={{ marginLeft: 20, marginTop: 40 }}>
          {this.state.currentState === "showTable" ? (
            <React.Fragment>
              {/* <div className="page-breadcrumb">
                <span className="breadcrumb-part">Members</span>
              </div>
              <div className="paymentRequestContent">
                <div className="payreq-container">
                  <CustomTable
                    handleChangePage={this.handleChangePage}
                    count={this.state.count}
                    page={this.state.page}
                    page_size={this.state.page_size}
                    changeCurrentStateToShowMemberDetail={
                      this.changeCurrentStateToShowMemberDetail
                    }
                    columns={columns}
                    rows={this.state.members}
                    type="memberList"
                  />
                </div>
              </div> */}
              <div style={{ marginLeft: 20, marginTop: 30 }}>
                <Title level={3}>Members</Title>
                <Table
                  row={this.state.members}
                  columns={ColumnsMem}
                  dataSource={mappedData}
                  pagination={false}
                  style={{
                    width: "97%",
                    marginTop: 30,
                    borderRadius: "8px",
                    boxShadow: "0px 0px 10px 0px #00000026",
                  }}
                />
              </div>
            </React.Fragment>
          ) : this.state.currentState == "showMemberDetail" ? (
            <React.Fragment>
              <div className="page-breadcrumb">
                <span className="breadcrumb-part">
                  Members {"/"} View member
                </span>
              </div>
              <Row gutter={[30, 30]}>
                <Col xs={24} sm={12} lg={8}>
                  <Card style={{ textAlign: "center" }}>
                    <p
                      style={{
                        fontSize: "20px",
                        color: " #000",
                        fontWeight: 500,
                        marginBottom: 20,
                      }}
                    >
                      Oral Health Score
                    </p>
                    <DonutChart
                      fillPercentage={48}
                      label="Oral Health Score"
                      Value="4.8"
                      width="270px"
                      fontSize="14px"
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={8}>
                  <Card style={{ textAlign: "center" }}>
                    <p
                      style={{
                        fontSize: "20px",
                        color: " #000",
                        fontWeight: 500,
                        marginBottom: 20,
                      }}
                    >
                      Financial Health Score
                    </p>
                    <DonutChart
                      fillPercentage={68}
                      label="
                           Financial Health
                           Score"
                      Value="6.9"
                      width="270px"
                      fontSize="14px"
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={8}>
                  <Card style={{ textAlign: "center" }}>
                    <p
                      style={{
                        fontSize: "20px",
                        color: " #000",
                        fontWeight: 500,
                        marginBottom: 20,
                      }}
                    >
                      Preventative Core Score
                    </p>
                    <DonutChart
                      fillPercentage={98}
                      label="Preventative Core Score"
                      Value="9.8"
                      width="270px"
                      fontSize="14px"
                    />
                  </Card>
                </Col>

                <Col xs={24} lg={8}>
                  <ProfileCard data={this.state.memberProfile} />
                </Col>
                <Col xs={24} lg={16}>
                  <Card style={{ marginBottom: 30 }}>
                    <p
                      style={{
                        fontSize: "20px",
                        color: " #000",
                        fontWeight: 500,
                        marginBottom: 20,
                      }}
                    >Subscription
                    </p>
                    <Table
                      columns={columns2}
                      dataSource={data2}
                      pagination={false}
                    />
                  </Card>
                  <Card>
                    <p
                      style={{
                        fontSize: "20px",
                        color: " #000",
                        fontWeight: 500,
                        marginBottom: 20,
                      }}>
                      Patient Expenditure
                    </p>
                    <BarChart />
                  </Card>
                </Col>
                <Col xs={24}>
                  <Card>
                    <p
                      style={{
                        fontSize: "20px",
                        color: " #000",
                        fontWeight: 500,
                        marginBottom: 20,
                      }}>
                      Members
                    </p>
                    <Table
                      dataSource={initialData}
                      columns={columns3}
                      pagination={false}
                      rowSelection={Rowkeys}
                    />
                    <Button
                      type="default"
                      style={{
                        width: "100%",
                        borderRadius: "8px",
                        border: "1px solid #6B43B5",
                        color: "#6B43B5",
                        height: "70px",
                      }}
                    >
                      Add new Treatment Plan
                    </Button>
                  </Card>
                </Col>
              </Row>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <div className="page-breadcrumb">
                <span className="breadcrumb-part">
                  Members {"/"} View member
                </span>
              </div>

              <Row>
                <Col xs={8}>
                  <div className="paymentRequestContent">
                    <p className="membership_f16b">Subscriptions</p>
                    <div className="payreq-container pt15">
                      <Row type="flex" justify="space-between">
                        <Typography.Text disabled={true}>
                          Monthly amount{" "}
                        </Typography.Text>
                        <Typography.Text>test </Typography.Text>
                      </Row>
                      <Row type="flex" justify="space-between" className="mt5">
                        <Typography.Text disabled={true}>
                          start date{" "}
                        </Typography.Text>
                        <Typography.Text> 12/12/2022 17:00</Typography.Text>
                      </Row>
                      <Row type="flex" justify="space-between" className="mt5">
                        <Typography.Text disabled={true}>
                          Renewal date
                        </Typography.Text>
                        <Typography.Text> 12/12/2022 17:00</Typography.Text>
                      </Row>
                      <Row type="flex" justify="space-between" className="mt5">
                        <Typography.Text disabled={true}>
                          Exp. date
                        </Typography.Text>
                        <Typography.Text> 12/12/2022 17:00</Typography.Text>
                      </Row>
                      <Row type="flex" justify="space-between" className="mt5">
                        <Typography.Text disabled={true}>
                          Billing cycle
                        </Typography.Text>
                        <Typography.Text>1 Month</Typography.Text>
                      </Row>
                    </div>
                  </div>
                </Col>
                <Col xs={16}>
                  <div className="paymentRequestContent">
                    <Typography.Text strong={true} className="mt10">
                      Payment
                    </Typography.Text>
                    <div className="mt5"></div>

                    <Table
                      columns={PaymentColumn}
                      dataSource={this.state.paymentHis}
                    />
                  </div>
                </Col>
              </Row>
              <Row>
                <div className="paymentRequestContent w100p">
                  <Typography.Text strong={true} className="mt10">
                    History
                  </Typography.Text>
                  <History
                    selectedSub={this.state.selectedSub.id}
                    selectedMember={this.state.selectedMember.id}
                  />
                </div>
              </Row>
            </React.Fragment>
          )}
          <Modal
            title="Create Member"
            visible={this.state.visibleCreateMemberModal}
            footer={null}
            onCancel={this.handleCloseAddService}
            width={800}
          >
            <Row type="flex" justify="space-between">
              <Col>
                <label className="formLabel">First Name</label>
                <Input
                  className={"inputs"}
                  onChange={this.handleChange}
                  type="text"
                  name="first_name"
                  placeholder="Alex"
                  value={this.state.newMember.first_name}
                />
              </Col>
              <Col>
                <label className="formLabel">Last Name</label>
                <Input
                  className={"inputs"}
                  onChange={this.handleChange}
                  type="text"
                  name="last_name"
                  placeholder="Doe"
                  value={this.state.newMember.last_name}
                />
              </Col>
            </Row>
            <br />
            <Row type="flex" justify="space-between">
              <Col>
                <label className="formLabel">Phone</label>
                <Input
                  className={"inputs"}
                  onChange={this.handleChange}
                  type="text"
                  name="phone"
                  placeholder="+1 4444 123 12 12"
                  value={this.state.newMember.phone}
                />
              </Col>
              <Col>
                <label className="formLabel">State</label>
                <Input
                  className={"inputs"}
                  onChange={this.handleChange}
                  type="text"
                  name="state"
                  placeholder="Ny"
                  value={this.state.newMember.state}
                />
              </Col>
            </Row>
            <br />
            <Row type="flex" justify="space-between">
              <Col>
                <label className="formLabel">City</label>
                <Input
                  className={"inputs"}
                  onChange={this.handleChange}
                  type="text"
                  name="city"
                  placeholder="New york"
                  value={this.state.newMember.city}
                />
              </Col>
              <Col>
                <label className="formLabel">Email</label>
                <Input
                  className={"inputs"}
                  onChange={this.handleChange}
                  type="text"
                  name="email"
                  placeholder="alex.doe@gmail.com"
                  value={this.state.newMember.email}
                />
              </Col>
            </Row>
            <br />
            <Row type="flex" justify="space-between">
              <Col>
                <label className="formLabel">Address</label>
                <Input
                  className={"inputs"}
                  onChange={this.handleChange}
                  type="text"
                  name="address"
                  placeholder="256 wfi street"
                  value={this.state.newMember.address}
                />
              </Col>
              <Col>
                <label className="formLabel">Zip Code</label>
                <Input
                  className={"inputs"}
                  onChange={this.handleChange}
                  type="text"
                  name="zip_code"
                  placeholder="12345"
                  value={this.state.newMember.zip_code}
                />
              </Col>
            </Row>

            <div className="btnBox dbf-jce">
              <Button
                onClick={this.handleCloseAddService}
                className="white-btn create-payment-request-btn"
              >
                Close
              </Button>
              <Button
                type="primary"
                onClick={this.handleCreateMember}
                className="login-btn create-payment-request-btn ml5"
              >
                Create
              </Button>
            </div>
          </Modal>
        </div>
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

const connectedMembers = connect(mapStateToProps)(Members);

export default connectedMembers;

// import React from "react";
// import { useState } from "react";
// import { Table, Avatar, Button, Row, Col, Card, Space, Tag } from "antd";
// import { Typography } from "antd";
// import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
// import DashboardLayout from "../../layout/dashboardLayout/DashboardLayout";
// import { Component } from "react";
// import { connect } from "react-redux";
// import { controller } from "../../controller";
// import DonutChart from "../../New/component/DonutChart";
// import BarChart from "./BarChart";
// import image from "../../assets/img/imgo2.jpg";

// const { Meta } = Card;
// const { Text, Title } = Typography;

// const initialData = [
//   {
//     key: "1",
//     treatment: "Root Canal Tooth 15",
//     notes:
//       "Tooth 15 is infected and root canal treatment is indicated to clean and seal the infected canals.",
//     priority: 1,
//   },
//   {
//     key: "2",
//     treatment: "Crown Tooth 15",
//     notes:
//       "Crown is recommended on Tooth 15 after root canal therapy to provide structural support and prevent tooth fracture.",
//     priority: 2,
//   },
// ];

// const ViewSubscription = () => {
//   const [isExpanded, setisExpanded] = useState(false);
//   // const [data1, setData1] = useState(initialData);
//   const [selectedRowKeys, setSelectedRowKeys] = useState([]);

//   const onSelectChange = (selectedRowKeys) => {
//     setSelectedRowKeys(selectedRowKeys);
//   };

//   const rowSelection = {
//     selectedRowKeys,
//     onChange: onSelectChange,
//   };

//   // const handleDelete = (key) => {
//   //   const newData = data.filter(item => item.key !== key);
//   //   setData1(newData);
//   // };

//   const handleClick = () => {
//     setisExpanded(true);
//   };

//   const data = [
//     {
//       key: 1,
//       name: "John Bing",
//       id: "@John91",
//       image: "path_to_johns_image.jpg",
//       subscription: "Membership Plan",
//       insurance: "Membership Plan",
//       treatmentPlans: {
//         plans: 5,
//         approved: 2,
//         unapproved: 3,
//       },
//     },
//     {
//       key: 2,
//       name: "John Bing",
//       id: "@John91",
//       image: "path_to_johns_image.jpg",
//       subscription: "Membership Plan",
//       insurance: "Membership Plan",
//       treatmentPlans: {
//         plans: 7,
//         approved: 4,
//         unapproved: 3,
//       },
//     },
//   ];

//   const columns = [
//     {
//       title: "Image",
//       dataIndex: "image",
//       key: "image",
//       render: (text, record) => <Avatar shape="square" src={image} />,
//     },
//     {
//       title: "Name",
//       dataIndex: "name",
//       key: "name",
//     },
//     {
//       title: "ID",
//       dataIndex: "id",
//       key: "id",
//     },
//     {
//       title: "Subscription",
//       dataIndex: "subscription",
//       key: "subscription",
//     },
//     {
//       title: "Insurance",
//       dataIndex: "insurance",
//       key: "insurance",
//     },
//     {
//       title: "Treatment Plans",
//       dataIndex: "treatmentPlans",
//       key: "treatmentPlans",
//       render: (text, record) => (
//         <span>
//           <Text>{record.treatmentPlans.plans} :</Text>
//           <Text style={{ marginLeft: 2 }}>
//             {record.treatmentPlans.approved} Approved
//           </Text>
//           <Text style={{ marginLeft: 2, marginRight: 2 }}> + </Text>
//           <Text style={{ marginLeft: 2 }}>
//             {record.treatmentPlans.unapproved} Unapproved
//           </Text>
//         </span>
//       ),
//     },
//     {
//       title: "Action",
//       key: "action",
//       render: (text, record) => (
//         <Button type="link" onClick={handleClick}>
//           View
//         </Button>
//       ),
//     },
//   ];

//   const columns2 = [
//     {
//       title: "Name",
//       dataIndex: "name",
//       key: "name",
//       sorter: true,
//     },
//     {
//       title: "Start Date",
//       dataIndex: "startDate",
//       key: "startDate",
//       sorter: true,
//     },
//     {
//       title: "Expiry Date",
//       dataIndex: "expiryDate",
//       key: "expiryDate",
//       sorter: true,
//     },
//     {
//       title: "Status",
//       key: "status",
//       dataIndex: "status",
//       render: (status) => (
//         <Tag
//           color={status === "Active" ? "rgba(35, 208, 32, 0.2)" : "volcano"}
//           style={{ borderRadius: "20px", color: "#23D020" }}
//         >
//           {status.toUpperCase()}
//         </Tag>
//       ),
//     },
//     {
//       title: "Action",
//       key: "action",
//       render: (text, record) => (
//         <Space size="middle">
//           <Button
//             type="text"
//             icon={<DeleteOutlined />}
//             style={{ color: "#979797" }}
//           />
//           <Button
//             type="text"
//             icon={<EditOutlined />}
//             style={{ color: "#979797" }}
//           />
//         </Space>
//       ),
//     },
//   ];

//   const data2 = [
//     {
//       key: "1",
//       name: "Membership Plan",
//       startDate: "2023/12/12",
//       expiryDate: "2024/12/12",
//       status: "Active",
//     },
//     {
//       key: "2",
//       name: "Membership Plan",
//       startDate: "2023/12/12",
//       expiryDate: "2024/12/12",
//       status: "Active",
//     },
//   ];

//   const columns3 = [
//     {
//       title: "Treatment Description",
//       dataIndex: "treatment",
//       key: "treatment",
//     },
//     {
//       title: "Notes",
//       dataIndex: "notes",
//       key: "notes",
//     },
//     {
//       title: "Priority",
//       dataIndex: "priority",
//       key: "priority",
//     },
//     {
//       title: "Action",
//       key: "action",
//       render: (_, record) => (
//         <span>
//           <Space size="middle">
//             <Button
//               type="text"
//               icon={<DeleteOutlined />}
//               style={{ color: "#979797" }}
//             />
//             <Button
//               type="text"
//               icon={<EditOutlined />}
//               style={{ color: "#979797" }}
//             />
//           </Space>
//         </span>
//       ),
//     },
//   ];

//   return (
//     <>
//       <DashboardLayout>
//         {isExpanded ? (
//           <div style={{ marginLeft: 20, marginTop: 40 }}>
//             <div className="user-profile">
//               <Row gutter={[16, 16]}>
//                 <Col xs={24} sm={12} lg={8}>
//                   <Card style={{ textAlign: "center" }}>
//                     <p
//                       style={{
//                         fontSize: "16px",
//                         color: " #000",
//                         fontWeight: 600,
//                         marginBottom: 20,
//                       }}
//                     >
//                       Oral Health Score
//                     </p>
//                     <DonutChart
//                       fillPercentage={48}
//                       label="Oral Health Score"
//                       Value="4.8"
//                       width="270px"
//                       fontSize="14px"
//                     />
//                   </Card>
//                 </Col>
//                 <Col xs={24} sm={12} lg={8}>
//                   <Card style={{ textAlign: "center" }}>
//                     <p
//                       style={{
//                         fontSize: "16px",
//                         color: " #000",
//                         fontWeight: 600,
//                         marginBottom: 20,
//                       }}
//                     >
//                       Financial Health Score
//                     </p>
//                     <DonutChart
//                       fillPercentage={68}
//                       label="
//                           Financial Health
//                           Score"
//                       Value="6.9"
//                       width="270px"
//                       fontSize="14px"
//                     />
//                   </Card>
//                 </Col>
//                 <Col xs={24} sm={12} lg={8}>
//                   <Card style={{ textAlign: "center" }}>
//                     <p
//                       style={{
//                         fontSize: "16px",
//                         color: " #000",
//                         fontWeight: 600,
//                         marginBottom: 20,
//                       }}
//                     >
//                       Preventative Core Score
//                     </p>
//                     <DonutChart
//                       fillPercentage={98}
//                       label="Preventative Core Score"
//                       Value="9.8"
//                       width="270px"
//                       fontSize="14px"
//                     />
//                   </Card>
//                 </Col>
//                 <Col xs={24} sm={12} lg={8}>
//                   <Card>
//                     <div
//                       style={{
//                         display: "flex",
//                         justifyContent: "center",
//                         flexDirection: "column",
//                       }}
//                     >
//                       <Avatar size={145} src={image} style={{ margin: "0 auto" }}  />
//                       <Meta
//                         title="John Bing"
//                         description="john91"
//                         style={{ textAlign: "center", marginTop: 25 }}
//                       />
//                     </div>
//                     <div
//                       style={{ marginTop: 30, marginLeft: 10, fontWeight: 400 }}
//                     >
//                       <Text style={{ lineHeight: "3" }}>
//                         <span style={{ color: "#979797" }}>Email:</span> Email:
//                         John91@gmail.com
//                       </Text>
//                       <br />
//                       <Text style={{ lineHeight: "3" }}>
//                         <span style={{ color: "#979797" }}>Phone:</span> +1
//                         23456789
//                       </Text>
//                       <br />
//                       <Text style={{ lineHeight: "3" }}>
//                         <span style={{ color: "#979797" }}>Birth Date:</span>{" "}
//                         1991/10/09
//                       </Text>
//                       <br />
//                       <Text style={{ lineHeight: "3" }}>
//                         <span style={{ color: "#979797" }}>State:</span> Ontario
//                       </Text>
//                       <br />
//                       <Text style={{ lineHeight: "3" }}>
//                         <span style={{ color: "#979797" }}>City:</span> Toronto
//                       </Text>
//                       <br />
//                       <Text style={{ lineHeight: "3" }}>
//                         <span style={{ color: "#979797" }}>Address:</span> 18,
//                         21 Street
//                       </Text>
//                       <br />
//                       <Text style={{ lineHeight: "3" }}>
//                         <span style={{ color: "#979797" }}>Zip Code:</span>{" "}
//                         123456
//                       </Text>
//                     </div>
//                   </Card>
//                 </Col>
//                 <Col xs={24} lg={16}>
//                   <Col xs={24} style={{ marginBottom: 20 }}>
//                     <Card>
//                       <Title level={3}>Members</Title>
//                       <Table
//                         columns={columns2}
//                         dataSource={data2}
//                         pagination={false}
//                         style={{
//                           width: "100%",
//                           marginTop: 10,
//                           borderRadius: "8px",
//                           maxHieght: 200,
//                         }}
//                       />
//                     </Card>
//                   </Col>
//                   <Col xs={24}>
//                     <Card>
//                       <Title level={3}>Members</Title>
//                       <BarChart />
//                     </Card>
//                   </Col>
//                 </Col>
//                 <Col xs={24}>
//                   <Card>
//                     <Table
//                       dataSource={initialData}
//                       columns={columns3}
//                       pagination={false}
//                       rowSelection={rowSelection}
//                     />
//                     <Button
//                       type="default"
//                       style={{
//                         width: "100%",
//                         borderRadius: "8px",
//                         border: "1px solid #6B43B5",
//                         color: "#6B43B5",
//                         height: "70px",
//                       }}
//                     >
//                       Add new Treatment Plan
//                     </Button>
//                   </Card>
//                 </Col>
//               </Row>
//             </div>
//           </div>
//         ) : (
//           <div style={{ marginLeft: 20, marginTop: 40 }}>
//             <Title level={3}>Members</Title>
//             <Table
//               columns={columns}
//               dataSource={data}
//               pagination={false}
//               style={{
//                 width: "97%",
//                 marginTop: 10,
//                 borderRadius: "8px",
//                 boxShadow: "0px 0px 10px 0px #00000026",
//               }}
//             />
//           </div>
//         )}
//       </DashboardLayout>
//     </>
//   );
// };
// export default ViewSubscription;
