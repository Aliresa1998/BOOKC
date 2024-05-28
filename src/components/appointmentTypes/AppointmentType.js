import {
    Card,
    Col,
    Row,
    Table,
    Pagination,
    Divider,
    notification,
    Button,
    Modal,
    Popconfirm
} from "antd";
import React, { useEffect, useState } from "react";
import { controller } from "../../controller";
import DashboardLayout from "../../layout/dashboardLayout/DashboardLayout";
import "./style.css";
import CreateAppointment from "./CreateAppointment";
import EditAppointment from "./EditAppointment";


function AppointmentType() {

    const [pageSize, setPageSize] = useState(0)
    const [currentPage, setcurrentPage] = useState(1)
    const [appointmentTypes, setAppointmentTypes] = useState(false)
    const [openCreateModal, setOpenCreateModal] = useState(false)
    const [openEditModal, setOpenEditModal] = useState(false)
    const [editData, setEditData] = useState([])

    const getListOfAppointment = async () => {

        const response = await controller.getListOfAppointmentTypes(currentPage);
        console.log(response.json)
        setAppointmentTypes(response.json.results)
        setPageSize(response.json.count)
    }

    const handlePageChange = async (page) => {
        setcurrentPage(page)


        const response = await controller.getListOfAppointmentTypes(page);
        if (response.status < 250) {
            setAppointmentTypes(response.json)
            setcurrentPage(page)
            setPageSize(response.json.count)
        }
    };

    useEffect(() => {
        getListOfAppointment();
    }, [])

    const handleRemove = async (record) => {
        console.log(record)
        const response = await controller.removeAppointmentType(record.id)

        if (response.status < 250) {
            getListOfAppointment();
            openNotification(
                "bottom",
                response.message ? response.message : "Removed",
                "Successful"
            );
        } else {
            this.openNotification("bottom", response.data.detail ? response.data.detail : "Failed", "Error");
        }
    }

    const handleCloseEditModal = () => {
        setEditData([])
        setOpenEditModal(false)
        getListOfAppointment()
    }

    const handleOpenEdit = (record) => {
        setEditData(record)
        setOpenEditModal(true)
    }

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


    const handleOpenCreateModal = () => {
        setOpenCreateModal(true)
    }

    const handleCloseCreateModal = () => {
        setOpenCreateModal(false)
        getListOfAppointment()
    }

    const appointmentTypesColumn = [
        {
            title: 'Id',
            dataIndex: 'id',
            render: (text, record) => <p>{text}</p>,
        },
        {
            title: 'Service',
            dataIndex: 'service',
            render: (text, record) => <p>{text}</p>,
        },
        {
            title: 'Length',
            dataIndex: 'length',
            render: (text, record) => <p>{text}{" (min)"}</p>,
        },
        {
            title: 'Provider',
            dataIndex: 'provider',
            render: (text, record) => (
                <p>
                    {text && text.map((t) => <span key={t}>{t.name}{","}</span>)}
                </p>
            )
        },
        {
            title: 'Action',
            render: (text, record) => (
                <div>
                    <span className="edit-text" onClick={() => handleOpenEdit(record)}>Edit</span>
                    <Divider type="vertical" />
                    <Popconfirm
                        title="Are you sure to delete this rule?"
                        onConfirm={() => {
                            handleRemove(record)
                        }}
                    >
                        <span className="remove-text" >Remove</span>
                    </Popconfirm>

                </div>
            ),
        },
    ]
    return (
        <DashboardLayout
            breadCrumb={false}
            logo={""}
            footerLogo={true}
        >
            <Card
                className="review_card"
                bodyStyle={{ padding: "32px 40px" }}
            >
                <Row type="flex" justify="space-between">
                    <Col span={12}>
                        <p className="check_review">Appointment Type</p>
                    </Col>
                    <Col>
                        <Button
                            onClick={handleOpenCreateModal}
                            type="primary"
                            className="mb16 new-button"
                        >+ New</Button>
                    </Col>
                </Row>
                <Table pagination={false} dataSource={appointmentTypes} columns={appointmentTypesColumn} />
                <Row type="flex" justify="end" className="mt15">
                    <Pagination
                        current={currentPage}
                        total={pageSize}
                        onChange={handlePageChange}
                        className="paginator"
                        size="small"
                    />
                </Row>
            </Card>

            <Modal
                open={openCreateModal}
                footer={null}
                onCancel={handleCloseCreateModal}
                title={"New Appointment Type"}
            >
                <CreateAppointment open={openCreateModal} closeCreateModal={handleCloseCreateModal} />
            </Modal>

            <Modal
                open={openEditModal}
                footer={null}
                onCancel={handleCloseEditModal}
                title={"Edit Appointment Type"}
            >
                <EditAppointment data={editData} open={openEditModal} closeEditModal={handleCloseEditModal} />
            </Modal>
        </DashboardLayout>
    );
}

export default AppointmentType;
