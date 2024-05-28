import React, { useState, useRef, useEffect } from 'react';
import { Radio, Row, Col, Table, Input, Tag, Button, Modal, Popconfirm, message } from 'antd';
import { controller } from '../controller';

// icon 
import checkIcon from "../assets/icon/check.png"
import trash from "../assets/icon/trash.png"

const InviteUsers = (props) => {
    const [selectedLic, setsSlectedLic] = useState(null)
    const [invitedUserList, setInvitedUserList] = useState([])
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [userEmail, setUserEmail] = useState("");
    const [licenses, setLicenses] = useState([])
    const [loading, setLoading] = useState(false)
    const [openModalDone, setOpenModalDone] = useState(false)
    const [anotherOfficeValue, setAnotherOfficeValue] = useState(false);

    const onChangeRadio = (e) => {
        setAnotherOfficeValue(e.target.value);
    };

    const getListOfLicences = async () => {
        const response = await controller.LicencesList();
        setLicenses(response)
    }

    const handleDelete = async (e) => {
        setLoading(true)
        const response = await controller.deleteInvitedUser(e.id);
        if (response.status < 250) {
            getInvitedUserList()
            message.success("Removed")
        } else {
            message.error("Error during remove invited user")
        }
        setLoading(false)
    }

    const handleSkip = async () => {
        const response = await controller.skipOnBoarding();

        props.readOnboardingStatus();
    };

    const showModal = () => {
        getListOfLicences();
        setIsModalVisible(true);
    };

    const handleDoneModal = async () => {
        const response = await controller.addNewOfficeQuestion(anotherOfficeValue ? "yes" : "no")
        props.readOnboardingStatus()
    }

    const handleInvite = async () => {
        setLoading(true)
        const data = {

            "receiver_email": userEmail,
            "meta_data": {},
            "subscription_tier": selectedLic, // id subscription ke entekhab mikone
            "branch": localStorage.getItem("selectedOffice"),
        }
        const response = await controller.inviteUser(data)

        if (response.status < 250) {
            message.success("user Invited succesfully")
            setIsModalVisible(false);
            setUserEmail("")
            setsSlectedLic(null)
            getInvitedUserList()
        } else {
            message.error(JSON.stringify(response))
        }
        setLoading(false)
    }

    const handleCancel = () => {
        setIsModalVisible(false);
        setUserEmail("")
        setsSlectedLic(null)
    };
    const columns = [
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
            render: (_, record) => {
                return (
                    <>
                        {record.roles[0]}
                    </>
                );
            },
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            render: (_, record) => {
                return (
                    <>
                        {record.receiver_email}
                    </>
                );
            },
        },
        {
            title: 'Subscription',
            dataIndex: 'subscription',
            key: 'subscription',
            render: (_, record) => {
                return (
                    record.subscription_tier ?
                        <div>
                            <Row justify={"space-between"} className='lastAntdTableColumn' style={{ width: record.subscription_tier.title == "Pro" ? "100%" : "max-content" }}>
                                <Tag color="green">
                                    {record.subscription_tier && record.subscription_tier.title}
                                </Tag>

                                <div>
                                    <Popconfirm
                                        title="Are you sure to delete this invites user?"
                                        onConfirm={() => {
                                            handleDelete(record);
                                        }}
                                    >
                                        <img className='trash-action-icon' src={trash} alt="trash" />
                                    </Popconfirm>

                                </div>

                            </Row>
                        </div>

                        :
                        <Row justify={"space-between"}>
                            <div></div>

                            <div>
                                <Popconfirm
                                    title="Are you sure to delete this invites user?"
                                    onConfirm={() => {
                                        handleDelete(record);
                                    }}
                                >
                                    <img className='trash-action-icon' src={trash} alt="trash" />
                                </Popconfirm>

                            </div>
                        </Row>

                );
            },
        },

    ];

    const getInvitedUserList = async () => {
        const response = await controller.invitedUserList();
        console.log(invitedUserList)
        if (response) {
            setInvitedUserList(response.invites)
        }
    }
    useEffect(() => {
        getInvitedUserList()
    }, [])

    const handleDoneInviteUser = async () => {
        // code
        // check open add office 
        const response = await controller.checkIsMultiple()
        if (response.result)
            setOpenModalDone(true)
        else {
            const response0 = await controller.addNewOfficeQuestion("no")
            props.readOnboardingStatus()
        }

    }

    return (
        <>
            <div className="custom-table-container">
                <div className="add-message" onClick={showModal}>Add +</div>
                <div style={{ with: "100%", overflow: "auto" }}>
                    <Table
                        dataSource={invitedUserList}
                        columns={columns}
                        bordered
                        pagination={false}
                        className="custom-table"
                    />
                </div>



            </div>
            <div>
                <Button onClick={handleDoneInviteUser} className='login-button mt15'>
                    Done
                </Button>
                {/* <div className='skip-btn mt5' onClick={handleSkip}>
                    Skip
                </div> */}
            </div>
            <Modal
                title="Want to add another Office?"
                visible={openModalDone}
                onCancel={() => {
                    setOpenModalDone(false)
                }}
                onOk={handleDoneModal}
            >
                <Radio.Group onChange={onChangeRadio} value={anotherOfficeValue}>
                    <Radio value={true}>Yes</Radio>
                    <Radio value={false}>No</Radio>
                </Radio.Group>
            </Modal>
            <Modal
                title="Invite User"
                visible={isModalVisible}
                onCancel={handleCancel}
                footer={[
                    <Button key="back" onClick={handleCancel}>
                        Cancel
                    </Button>,
                    <Button
                        disabled={selectedLic == null}
                        loading={loading} key="submit" type="primary" onClick={handleInvite}>
                        Invite
                    </Button>,
                ]}
            >
                <label className='input-lable'>Email</label>
                <Input
                    onChange={(e) => {
                        setUserEmail(e.target.value)
                    }}
                    name="email" value={userEmail} placeholder='Enter user Email' />

                <div className='mt10'>
                    <label className='input-lable'>License</label>
                </div>
                <div style={{
                    fontWeight: "400",
                    fontSize: "12px",
                    color: "#888"
                }}>Select the license you want for this User</div>

                <br />

                <Row>
                    {
                        licenses && licenses.length > 0 && licenses.map((item, index) => (

                            <Col span={12}>
                                <Row onClick={() => {
                                    console.log(item)
                                    console.log(item.id)
                                    setsSlectedLic(item.id)
                                }} justify={index % 2 == 1 ? "end" : "start"}>
                                    <div className={item.id == selectedLic ? 'card-subscription-onboarding' : "card-subscription-onboarding-white"}>
                                        <Row justify={"space-between"}>
                                            <div style={{ color: "#6B43B5", fontWeight: "bold", fontSize: "14px" }}>
                                                {item.title}
                                            </div>
                                            <div>$ {item.price}</div>


                                        </Row>

                                        <div className='mt5' style={{ color: "#979797", fontSize: "11px" }}>
                                            <img width={10} height={7} src={checkIcon} alt="check" />    {item.description1}
                                        </div>

                                        <div style={{ color: "#979797", fontSize: "11px" }}>
                                            <img width={10} height={7} src={checkIcon} alt="check" />      {item.description2}
                                        </div>

                                        <div style={{ color: "#979797", fontSize: "11px" }}>
                                            <img width={10} height={7} src={checkIcon} alt="check" />       {item.description3}
                                        </div>
                                    </div>
                                </Row>
                            </Col>
                        ))
                    }
                </Row>
            </Modal>
        </>
    );
};

export default InviteUsers;
