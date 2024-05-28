import React, { Component } from "react";
import { dashboardActions } from "../../actions";
import {
  Popconfirm,
  Button,
  Modal,
  Row,
  DatePicker,
  notification,
  Typography,
  Pagination,
  Divider,
  Table,
} from "antd";
import DashboardLayout from "../../layout/dashboardLayout/DashboardLayout";
import { controller } from "../../controller";
import { connect } from "react-redux";
import moment from "moment";
import dayjs from "dayjs";
import "./style.css";

class Appointments extends Component {
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
    this.getData();
    this.state = {
      currentPage: 1,
      page_size: 1,
      page: 1,
      currentState: "showTable",
      loadingApprove: false,
      loadingDecline: false,
      AppointmentList: [
      ],
    };
    this.getLogo = this.getLogo.bind(this);
    this.getData = this.getData.bind(this);
    this.handleApprove = this.handleApprove.bind(this);
    this.closeModalEditAppointment = this.closeModalEditAppointment.bind(this);
    this.openModalEditAppointment = this.openModalEditAppointment.bind(this);
    this.onSelectTime = this.onSelectTime.bind(this);
    this.ApproveModalEditAppointment =
      this.ApproveModalEditAppointment.bind(this);
    this.DeclineModalEditAppointment =
      this.DeclineModalEditAppointment.bind(this);

    this.props.dispatch(dashboardActions.fetchProfileSummary());
  }

  DeclineModalEditAppointment = async () => {
    this.setState({
      loadingDecline: true,
    });
    const response = await controller.declineAppointment(
      this.state.selectedAppointment.time,
      this.state.selectedAppointment.id,
      true
    );
    if (response.status && response.status < 250) {
      this.openNotification("bottom", response.detail[0], "Successful");
    }
    this.setState({
      loadingDecline: false,
      editAppointment: false,
    });
  };

  ApproveModalEditAppointment = async () => {
    this.setState({
      loadingApprove: true,
    });

    const response = await controller.approveAppointment(
      this.state.selectedAppointment.time,
      this.state.selectedAppointment.id,
      true
    );
    if (response.status && response.status < 250) {
      this.openNotification("bottom", response.detail[0], "Successful");
    }

    this.setState({
      loadingApprove: false,
      editAppointment: false,
    });
  };

  onSelectTime = (value, dateString) => {
    this.setState({
      selectedAppointment: {
        ...this.state.selectedAppointment,
        time: dateString,
      },
    });
  };

  openModalEditAppointment = (time, id) => {
    this.setState({
      editAppointment: true,
      selectedAppointment: {
        id: id,
        time: time.replace("T", " ").replace("Z", " "),
      },
    });
  };

  closeModalEditAppointment = () => {
    this.setState({
      editAppointment: false,
    });
  };

  getData = async () => {
    const response = await controller.unApprovedAppointment("1");
    if (response && response.data) {
      this.setState({
        AppointmentList: response.data.results,
        page: 1,
        currentPage: 1,
        page_size: response.data.count,
      });
    } else this.setState({ AppointmentList: [] });
  };

  handlePageChange = async (page) => {
    this.setState({
      currentPage: page,
    });

    const response = await controller.unApprovedAppointment(page);
    if (response.status < 250) {
      this.setState({
        page: 1,
        page_size: response.data.count,
        AppointmentList: response.data.results,
      });
    }
  };

  getLogo = async () => {
    const response = await controller.getLogo();
    this.setState({ serverLogo: response.data.dark });
  };

  handleApprove = async (time, id) => {
    const response = await controller.approveAppointment(time, id, true);
    this.openNotification("bottom", response.detail[0], "Successful");
    this.getData();
  };

  render() {
    const { profileSummary } = this.props;

    const columns = [
      {
        title: "Patient",
        render: (_, record) => {
          return (
            <>
              {record.patient &&
                record.patient.first_name &&
                record.patient.last_name
                ? record.patient.first_name + " " + record.patient.last_name
                : "-"}
            </>
          );
        },
      },
      {
        title: "Provider",
        render: (_, record) => {
          return (
            <>
              {record.provider && record.provider.name
                ? record.provider.name
                : "-"}
            </>
          );
        },
      },
      {
        title: "Appointment type",
        render: (_, record) => {
          return (
            <>
              {record.appointment_type && record.appointment_type.service
                ? record.appointment_type.service
                : "-"}
            </>
          );
        },
      },
      {
        title: "Amount",
        render: (_, record) => {
          return <>{record.amount}$</>;
        },
      },
      {
        title: "Payment method",
        dataIndex: "payment_method",
        key: "payment_method",
      },
      {
        title: "Date",
        render: (_, record) => {
          return (
            <>
              {record.appointment_datetime
                ? new Date(record.appointment_datetime).toLocaleDateString() +
                " " +
                new Date(record.appointment_datetime).toLocaleTimeString()
                : "-"}
            </>
          );
        },
      },
      {
        title: "Action",
        render: (_, record) => {
          return (
            <>
              <Typography.Text
                className="appointment_edit"
                onClick={() => {
                  this.openModalEditAppointment(
                    record.appointment_datetime,
                    record.id
                  );
                }}
              >
                Edit
              </Typography.Text>
              <Divider type="vertical" />
              <Popconfirm
                title="Are you sure to approve this appointment?"
                onConfirm={() => {
                  this.handleApprove(record.appointment_datetime, record.id);
                }}
              >
                <Typography.Text className="appointment_approve">
                  Approve
                </Typography.Text>
              </Popconfirm>
            </>
          );
        },
      },
    ];
    return (
      <DashboardLayout
        breadCrumb={"Appointments"}
        logo={profileSummary && profileSummary.logo ? profileSummary.logo : ""}
        footerLogo={this.state.serverLogo}
      >
        <div className="paymentRequestContent">
          <Table
            columns={columns}
            dataSource={this.state.AppointmentList}
            style={{ marginTop: "15px" }}
            pagination={false}
          />
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
        <Modal
          footer={[
            <Button
              onClick={this.DeclineModalEditAppointment}
              key="Decline"
              className="mw100"
            >
              {!this.state.loadingDecline ? "Decline" : "Declining..."}
            </Button>,
            <Button
              onClick={this.ApproveModalEditAppointment}
              key="Approve"
              type="primary"
              className="mw120"
            >
              {!this.state.loadingApprove ? "Approve" : "Approving..."}
            </Button>,
          ]}
          title="Edit appointment"
          visible={this.state.editAppointment}
          onCancel={this.closeModalEditAppointment}
        >
          <label className="inputLabel mt0">Appointment time</label>

          <DatePicker
            disabledDate={(current) => {
              return dayjs().subtract(1, "day") >= dayjs(current);
            }}
            onChange={this.onSelectTime}
            defaultValue={
              this.state.selectedAppointment &&
                this.state.selectedAppointment.time
                ? dayjs(this.state.selectedAppointment.time)
                : dayjs("2015-01-01", { format: "YYYY-MM-DD" })
            }
            showTime
            placeholder="Select Time"
            onOk={this.onOk}
            className="w100p"
            size="large"
          />
        </Modal>
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

const connectedAppointment = connect(mapStateToProps)(Appointments);

export default connectedAppointment;
