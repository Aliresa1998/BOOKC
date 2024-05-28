import {
  Input,
  Pagination,
  Row,
  Select,
  notification,
  Table,
  Card,
  Col,
  Tag,
  Typography,
  Space,
  Button
} from "antd";
import React, { Component } from "react";
import { connect } from "react-redux";
import { controller } from "../../controller";
import { Paymentcontroller } from "../../Paymentcontroller";
import DashboardLayout from "../../layout/dashboardLayout/DashboardLayout";

import eye from '../../assets/icons/eye.png';

const { Title } = Typography
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

const FailedPaymentColumn = [
  {
    title: "Payment Type",
    dataIndex: "payment_type",
    render: (text, record) => (
      <a style={record.seen ? {} : { fontWeight: "bold" }}>{text}</a>
    ),
  },
  {
    title: "Created at",
    dataIndex: "created_at",
    render: (text, record) => (
      <a style={record.seen ? {} : { fontWeight: "bold" }}>{text}</a>
    ),
  },
  {
    title: "Paid",
    dataIndex: "paid",
    render: (text, record) => (
      <a style={record.seen ? {} : { fontWeight: "bold" }}>{text + ""}</a>
    ),
  },
  {
    title: "Canceled",
    dataIndex: "canceled",
    render: (text, record) => (
      <a style={record.seen ? {} : { fontWeight: "bold" }}>{text + ""}</a>
    ),
  },
  {
    title: "Subscription Transaction",
    dataIndex: "subscription_transaction",
    render: (subscription) => (
      <Tag
        color={subscription === "Undefined" ? "#E9E6FF" : "volcano"}
        style={{ borderRadius: "20px", color: "#6B43B5", width: 113, textAlign: 'center', border: '1px solid #6B43B5' }}
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
        <Space size="middle">
          <Button
            type="text"
            icon={<img src={eye} alt="" />}
            style={{ color: "#979797" }}
          />
        </Space>
      </span>
    ),
  },
];

const data = [
  {
    key: 1,
    payment_type: "Payment Plan",
    created_at: "2023/12/12 , 05:23:30",
    paid: 'False',
    canceled: 'False',
    subscription_transaction: "Undefined",
  },
  {
    key: 2,
    payment_type: "Payment Plan",
    created_at: "2023/12/12 , 05:23:30",
    paid: 'False',
    canceled: 'False',
    subscription_transaction: "Undefined",
  }
]

class FailedPayments extends Component {
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

  constructor(props) {
    super(props);

    this.state = {
      failedPayments: [],
      currentPage: 1,
      page_size: 1,
      page: 1,
      loading: true,
      payment_data: {},
    };

    this.getData();
  }

  getData = async () => {
    const response = await controller.FailedPayments(this.state.currentPage);
    var data = response.json.results;
    for (var i in data) {
      data[i].created_at = new Date(data[i].created_at)
        .toISOString()
        .replace(/T/, " ")
        .replace(/\.\d+Z$/, "");
    }

    this.setState({
      page: 1,
      currentPage: 1,
      page_size: response.json.count,
      failedPayments: data,
    });
  };

 

  handlePageChange = async (page) => {
    this.setState({
      currentPage: page,
    });

    const response = await controller.FailedPayments(page);
    var data = response.json.results;
    for (var i in data) {
      data[i].created_at = new Date(data[i].created_at)
        .toISOString()
        .replace(/T/, " ")
        .replace(/\.\d+Z$/, "");
    }

    if (response.status < 250) {
      this.setState({
        page: 1,
        page_size: response.json.count,
        failedPayments: data,
      });
    }
  };

  render() {
    const { profileSummary } = this.props;
    return (
      <DashboardLayout
        breadCrumb={"Failed Payments"}
        logo={profileSummary && profileSummary.logo ? profileSummary.logo : ""}
        footerLogo={true}
      >
        <Title level={4} style={{ marginTop: 50, marginBottom: 30, marginLeft: 32 }}>Failed Payments</Title>
        <Row>
          <Col span={24}>


            <div className="payreq-container" style={{ paddingTop: "10px", width: '95%', marginLeft: 32 }}>
              <Row
                type="flex"
                justify="space-between"
                style={{ width: "100%" }}
              >
                <Table
                  style={{ width: "100%" }}
                  columns={FailedPaymentColumn}
                  dataSource={this.state.failedPayments}
                  // dataSource={data}
                  pagination={false}
                />
              </Row>
              <Row type="flex" justify="end" className="mt15">
                <Pagination
                  showSizeChanger={false}
                  hideOnSinglePage={true}
                  current={this.state.currentPage}
                  total={this.state.page_size}
                  onChange={this.handlePageChange}
                  className="paginator"
                  size="small"
                />
              </Row>
            </div>
            {/* </Card> */}
          </Col>
        </Row>
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

const connectedFailedPayments = connect(mapStateToProps)(FailedPayments);

export default connectedFailedPayments;
