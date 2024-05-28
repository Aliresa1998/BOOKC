import {
    Divider,
    Modal,
    Pagination,
    Popconfirm,
    Row,
    Table,
    Typography,
    notification
} from "antd";
import React, { Component } from "react";
import { connect } from "react-redux";
import { dashboardActions } from "../../actions";
import { controller } from "../../controller";
import DashboardLayout from "../../layout/dashboardLayout/DashboardLayout";
import CreateNewProcedure from "./CreateNewProcedure";
import "./style.css";
import EditProcedure from "./EditProcedure";


const openNotification = (placement, message, status) => {
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


class Procedures extends Component {
    state = {
        editedRecord: {},
        currentPage: 1,
        page_size: 1,
        page: 1,
        data: [],
        loading: false,
        expandedRowKeys: [],
        visibleNewProcedure: false,
        visibleEditProcedure: false,
    };

    openNotification = (placement, message, status) => {
        if (status && status.toLowerCase().search("success") !== -1) {
            notification.success({
                message: status,
                description: message,
                placement,
            });
        } else if (status && status.toLowerCase().search("error") !== -1) {
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
        this.getLogo = this.getLogo.bind(this);
        this.handleRemove = this.handleRemove.bind(this);
        this.handleOpenEditModalProcedure = this.handleOpenEditModalProcedure.bind(this);
        this.getData = this.getData.bind(this);
        this.props.dispatch(dashboardActions.fetchProfileSummary());
    }

    handleOpenEditModalProcedure = (record) => {
        console.log(record)
        this.setState({
            editedRecord: record,
            visibleEditProcedure: true
        })
    }

    handleRemove = async (id) => {

        const response = await controller.removeProcedure(id);
        if (response.status < 250) {
            openNotification("bottom", "Removed", "Successful")
            this.setState({

                loading: true
            })
            const response = await controller.getProcedureList(this.state.currentPage);

            for (var i in response.json.results) {
                response.json.results[i]["key"] = response.json.results[i]["id"]
            }
            if (response.status < 250) {
                this.setState({
                    page_size: response.json.count,
                    data: response.json.results,
                    loading: false
                });
            }
        } else {
            openNotification("bottom", "Error", "Error");
        }

    }

    getData = async () => {
        this.setState({
            loading: true,
        });
        const response = await controller.getProcedureList(1);
        console.log(response.json);

        for (var i in response.json.results) {
            response.json.results[i]["key"] = response.json.results[i]["id"]
        }

        this.setState({
            data: response.json.results,
            page: 1,
            currentPage: 1,
            loading: false,
            page_size: response.json.count,
            createProcedureRecord: {}
        });
    };

    handleOpenModalNewProcedure = (record) => {
        this.setState({
            visibleNewProcedure: true,
            createProcedureRecord: record
        })
    }

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

    handleRowExpand = (record) => {
        const { expandedRowKeys } = this.state;
        const key = record.key; // Assuming record.key is the unique identifier for the row
        const newExpandedRowKeys = expandedRowKeys.includes(key)
            ? expandedRowKeys.filter((k) => k !== key)
            : [...expandedRowKeys, key];
        this.setState({ expandedRowKeys: newExpandedRowKeys });
    };

    handleEditProcedure = async () => {
        this.setState({
            visibleEditProcedure: false,
            loading: true
        })
        const response = await controller.getProcedureList(this.state.currentPage);
        for (var i in response.json.results) {
            response.json.results[i]["key"] = response.json.results[i]["id"]
        }
        this.setState({
            page_size: response.json.count,
            data: response.json.results,
            loading: false
        });
    }

    handleCreateNewProcedure = async () => {
        this.setState({
            visibleNewProcedure: false,
            loading: true
        })
        const response = await controller.getProcedureList(this.state.currentPage);
        for (var i in response.json.results) {
            response.json.results[i]["key"] = response.json.results[i]["id"]
        }
        this.setState({
            page_size: response.json.count,
            data: response.json.results,
            loading: false
        });
    }

    render() {
        const { profileSummary } = this.props;
        const columns = [
            {
                title: "ID",
                dataIndex: "id",
                key: "id",
            },
            {
                title: "Procedure Code",
                dataIndex: "procedure_code",
                key: "procedure_code",
            },
            {
                title: "Procedure Code Description",
                dataIndex: "procedure_code_description",
                key: "procedure_code_description",
            },
            {
                title: "Action",
                key: "action",
                render: (_, record) => {
                    return (
                        <>
                            <Typography.Text
                                className="appointment_edit"
                                onClick={() => {
                                    this.handleOpenModalNewProcedure(
                                        record
                                    );
                                }}
                            >
                                + Add new impact
                            </Typography.Text>

                        </>
                    );
                },
            },
        ];

        const expandedRowRender = (record) => {
            const impactsColumns = [
                {
                    title: "ID",
                    dataIndex: "id",
                    key: "id",
                },
                {
                    title: "Health Category",
                    dataIndex: "health_category.name",
                    key: "health_category",
                    render: (text, record) =>
                        record.health_category && record.health_category.name,
                },
                {
                    title: "Health Score",
                    dataIndex: "health_score",
                    key: "health_score",
                },
                {
                    title: "Recovery Percent",
                    dataIndex: "recovery_percent",
                    key: "recovery_percent",
                },
                {
                    title: "Recovery Time",
                    dataIndex: "recovery_time",
                    key: "recovery_time",
                },
                {
                    title: "Action",
                    key: "action",
                    render: (_, record) => {
                        return (
                            <>
                                <Typography.Text
                                    className="appointment_edit"
                                    onClick={() => {
                                        this.handleOpenEditModalProcedure(
                                            record
                                        );
                                    }}
                                >
                                    Edit
                                </Typography.Text>
                                <Divider type="vertical" />
                                <Popconfirm
                                    title="Are you sure to remove this procedure impact?"
                                    onConfirm={() => {
                                        this.handleRemove(record.id);
                                    }}
                                >
                                    <Typography.Text className="delete-row">
                                        Delete
                                    </Typography.Text>
                                </Popconfirm>
                            </>
                        );
                    },
                },
            ];

            return (
                <Table
                    columns={impactsColumns}
                    dataSource={record.procedure_impacts}
                    pagination={false}
                />
            );
        };

        return (
            <DashboardLayout
                breadCrumb={"Procedures"}
                logo={profileSummary && profileSummary.logo ? profileSummary.logo : ""}
                footerLogo={this.state.serverLogo}
            >
                <div className="paymentRequestContent">

                    <Table
                        loading={this.state.loading}
                        columns={columns}
                        dataSource={this.state.data}
                        expandable={{
                            expandedRowRender,
                            expandedRowKeys: this.state.expandedRowKeys,
                            onExpand: (expanded, record) => this.handleRowExpand(record),
                        }}
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
                    footer={null}
                    title="Create New Procedure"
                    open={this.state.visibleNewProcedure}
                    onCancel={() => {
                        this.setState({
                            visibleNewProcedure: false,
                        });
                    }}
                >
                    <CreateNewProcedure
                        procedure={this.state.createProcedureRecord}
                        createSuccessFully={this.handleCreateNewProcedure}
                        closeModal={() => {
                            this.setState({
                                visibleNewProcedure: false,
                            });
                        }} />
                </Modal>

                <Modal
                    footer={null}
                    title={
                        this.state.editedRecord.name ?
                            <span>Edit <b>{this.state.editedRecord.name}</b></span>
                            : "Edit "
                    }
                    open={this.state.visibleEditProcedure}
                    onCancel={() => {
                        this.setState({
                            visibleEditProcedure: false,
                        });
                    }}
                >
                    <EditProcedure
                        data={this.state.editedRecord}
                        procedure={this.state.createProcedureRecord}
                        createSuccessFully={this.handleEditProcedure}
                        closeModal={() => {
                            this.setState({
                                visibleEditProcedure: false,
                            });
                        }} />
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

const connectedProcedures = connect(mapStateToProps)(Procedures);

export default connectedProcedures;