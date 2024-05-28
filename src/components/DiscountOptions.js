import {
  Modal,
  Col,
  Button,
  Switch,
  Spin,
  Input,
  Row,
  notification, Popconfirm,
  InputNumber,
  Tag,
  Table,
} from "antd";
import React, { Component } from "react";
import { connect } from "react-redux";
import { controller } from "../controller";
import DashboardLayout from "../layout/dashboardLayout/DashboardLayout";
import "./app.local.css";
import { controllerBooking } from "./../controllerBooking";
import { Error } from "../ErrorHandeling";


class DiscountOptions extends Component {
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
    this.getLogo();

    this.state = {
      loading: false,
      formError: {
        time_to_appointment: {
          massage: "",
          status: true,
        },
        percentage: {
          massage: "",
          status: true,
        },
      },
      loadingActive: false,
      loadingActiveID: 0,
      loading_update: true,
      serverLogo: "",
      DiscountList: [],
      openNew: false,
      data: {
        percentage: "",
        time_to_appointment: "",
      },
    };

    this.getData();
  }

  getData = async () => {
    const response = await controllerBooking.ListOfDiscount();
    this.setState({
      DiscountList: response.results,
      loading_update: false,
    });
  };

  getLogo = async () => {
    const response = await controller.getLogo();
    this.setState({ serverLogo: response.data.dark });
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

  handleCreateNewRule = async () => {
    this.setState({
      loading: true,
    });
    const timeHandle = await Error.AmountHandling(
      this.state.data.time_to_appointment
    );
    const percentageHandling = await Error.PercentHandling(
      this.state.data.percentage
    );

    this.setState({
      formError: {
        time_to_appointment: timeHandle,
        percentage: percentageHandling,
      },
    });

    if (timeHandle.status && percentageHandling.status) {
      var myData = {
        is_active: true,
        time_to_appointment: this.state.data.time_to_appointment * 60,
        percentage: this.state.data.percentage,
        office: localStorage.getItem("selectedOffice"),
      };

      const response = await controllerBooking.createDiscountRule(myData);

      if (response.status < 250) {
        this.getData();
        this.openNotification(
          "bottom",
          response && response.message ? response.message : "Done",
          "Successful"
        );
        this.setState({
          openNew: false,
          data: {
            time_to_appointment: null,
            percentage: null,
          },
        });
      } else {
        this.openNotification(
          "bottom",
          response.appointment_datetime
            ? JSON.stringify(response.appointment_datetime[0])
            : JSON.stringify(response.detail[0]),
          "Error"
        );
      }
    }

    this.setState({
      loading: false,
    });
  };

  handleUpdate = async (item) => { };

  handleDelete = async (item) => { };

  handleChangeActive = async (item) => {
    this.setState({
      loadingActiveID: item.id,
      loadingActive: true,
    });
    var myItem = {
      ...item,
      is_active: !item.is_active,
    };

    const response = await controllerBooking.UpdateDiscount(myItem);

    if (response.status < 250) {
      this.getData();
    } else {
      this.openNotification(
        "bottom",
        response && response.message ? response.message : "Error",
        "Error"
      );
    }
    setTimeout(() => {
      this.setState({
        loadingActive: false,
      });
    }, 500);
  };


  render() {
    const { profileSummary } = this.props;
    const columns = [
      {
        title: "ID",
        dataIndex: "id",
        key: "id",
      },
      {
        title: "Office",
        render: (_, record) => (
          <>
            {record
              ? record.office
                ? record.office.name
                  ? record.office.name
                  : ""
                : ""
              : ""}
          </>
        ),
      },
      {
        title: "Percentage",
        render: (_, record) => (
          <>{record ? (record.percentage ? record.percentage + "%" : "-") : "-"}</>
        ),
      },
      {
        title: "Time to Appointment",
        key: "time_to_appointment",
        dataIndex: "time_to_appointment",
      },
      {
        title: "Status",
        key: "tags",
        dataIndex: "tags",
        render: (_, record) => (

          this.state.loadingActive && this.state.loadingActiveID == record.id ?
            <Spin />
            :
            <Switch
              checked={record.is_active}
              onChange={() => {
                console.log(record)
                this.handleChangeActive(record);
              }}
            />


        ),
      },
      {
        title: "Action",
        key: "action",
        render: (_, record) => (
          <>
            <Tag
              onClick={() => {
                this.handleUpdate(record);
              }}
              color={"green"}
              style={{ cursor: "pointer" }}
            >
              Update
            </Tag>
            <Popconfirm
              title="Are you sure to delete this rule?"
              onConfirm={() => {
                this.handleDelete(record);
              }}
            >
              <Tag color={"volcano"} style={{ cursor: "pointer" }}>
                Remove
              </Tag>
            </Popconfirm>
          </>
        ),
      },
    ];
    return (
      <DashboardLayout
        breadCrumb={"Discount Options"}
        logo={profileSummary && profileSummary.logo ? profileSummary.logo : ""}
        footerLogo={this.state.serverLogo}
      >
        <div className="paymentRequestContent">
          <Row justify="space-between" type="flex">
            <label className="formLabel">Discount Options</label>
            <Button
              type="primary"
              onClick={() => {
                this.setState({
                  openNew: true,
                });
              }}
              className="mw120"
            >
              + New
            </Button>
          </Row>

          <div className="payreq-container pt10">
            <Row type="flex" justify="space-between">
              <Col span={24}>
                <Table columns={columns} dataSource={this.state.DiscountList} />
              </Col>
            </Row>
          </div>
        </div>
        <Modal
          footer={[
            <Button
              onClick={() => {
                this.setState({
                  data: {
                    time_to_appointment: null,
                    percentage: null,
                  },
                  formError: {
                    time_to_appointment: {
                      massage: "",
                      status: true,
                    },
                    percentage: {
                      massage: "",
                      status: true,
                    },
                  },
                  openNew: false,
                });
              }}
              key="Close"
              className="mw100"
            >
              Close
            </Button>,
            <Button
              disabled={this.state.loading}
              onClick={this.handleCreateNewRule}
              key="Create"
              type="primary"
              className="mw100"
            >
              {this.state.loading ? "Creating..." : "Create"}
            </Button>,
          ]}
          title="Create Rule"
          visible={this.state.openNew}
          onCancel={() => {
            this.setState({
              openNew: false,
            });
          }}
        >
          <label className="inputLabel mt0">Time to Appointment</label>
          <InputNumber
            className={
              this.state.formError &&
                this.state.formError.time_to_appointment &&
                this.state.formError.time_to_appointment.status
                ? "inputs w100p"
                : "inputs-error w100p"
            }
            value={this.state.data.time_to_appointment}
            onChange={(e) => {
              this.setState({
                data: {
                  ...this.state.data,
                  time_to_appointment: e,
                },
              });
            }}
            placeholder="Minute"
          />
          {this.state.formError &&
            this.state.formError.time_to_appointment &&
            this.state.formError.time_to_appointment.status ? (
            <></>
          ) : (
            <div className="error-text">
              {this.state.formError.time_to_appointment.massage}
            </div>
          )}
          <br />
          <label className="inputLabel mt5">Percentage</label>
          <Input
            className={
              this.state.formError &&
                this.state.formError.percentage &&
                this.state.formError.percentage.status
                ? " w100p"
                : "inputs-error w100p"
            }
            prefix="%"
            value={this.state.data.percentage}
            onChange={(e) => {
              this.setState({
                data: {
                  ...this.state.data,
                  percentage: e.target.value,
                },
              });
            }}
            placeholder="0"
          />
          {this.state.formError &&
            this.state.formError.percentage &&
            this.state.formError.percentage.status ? (
            <></>
          ) : (
            <div className="error-text">
              {this.state.formError.percentage.massage}
            </div>
          )}
        </Modal>{" "}
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

const connectedDiscountOptions = connect(mapStateToProps)(DiscountOptions);

export default connectedDiscountOptions;
