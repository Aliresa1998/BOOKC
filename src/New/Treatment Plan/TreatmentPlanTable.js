import { Table, Typography, ConfigProvider, Popconfirm } from 'antd';
import React, { useEffect, useState } from 'react';
import {
    Row,
    Modal,
    Card,
    Button,
    Col,
    Popover
} from "antd"

// icons
import modalTitleICon from "../assets/icon/radar.png"


const { Text } = Typography;


const VideoPlayer = ({ videoUrl }) => {
    return (
        <div style={{ borderRadius: '8px', overflow: 'hidden', height: "150px" }}>
            <iframe
                title="videoPlayer"
                width="100%"
                src={videoUrl}
                frameBorder="0"
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            ></iframe>
        </div>
    );
};


const TreatmentPlanTable = (props) => {
    const [showModal, setShowModal] = useState(false)
    const [showModalID, setShowModalID] = useState(false)
    const [data, setData] = useState(null)


    const handleShowModal = (record) => {
        console.log(record.key)
        setShowModalID(record.key)
        setShowModal(true)
    }

    useEffect(() => {
        if (props.data) {
            setData(props.data)
        }
    }, [props])

    const columns = [
        {
            title: 'Priority',
            //dataIndex: 'Priority',
            //key: 'Priority',
            sorter: (a, b) => {
                if (a.priority && b.priority) {
                    return a.priority.localeCompare(b.priority);
                } else if (a.priority) {
                    return 1; // a comes after b
                } else if (b.priority) {
                    return -1; // b comes after a
                } else {
                    return 0; // both are null or undefined
                }
            },

            width: 80,
            render: (_, record) => (
                <Row justify={"center"}>{record.priority}</Row>
            ),

        },
        {
            title: 'Treatment Description',
            //dataIndex: 'TreatmentDescription',
            //key: 'TreatmentDescription',
            //sorter: (a, b) => a.TreatmentDescription.localeCompare(b.TreatmentDescription),
            width: 250,
            render: (_, record) => (
                <Row justify={record.name ? "" : "center"}>{record.name ? record.name : "-"}</Row>
            ),
        },
        // {
        //     title: 'Procedure Code',
        //     dataIndex: 'ProcedureCode',
        //     key: 'ProcedureCode',
        //     sorter: (a, b) => a.ProcedureCode - b.ProcedureCode,
        // },
        {
            title: 'Notes',
            dataIndex: 'Notes',
            key: 'Notes',
            //sorter: (a, b) => a.Notes.localeCompare(b.Notes),
            render: (_, record) => (
                <Row justify={record.description ? "" : "center"}>{record.description ? record.description : "-"}</Row>
            ),
        },
        {
            title: 'Patient Education',
            dataIndex: 'PatientEducation',
            key: 'PatientEducation',
            width: 180,
            render: (text, record) =>
                <Popover 
                showArrow={false} 
                placement='bottomRight' 
                content={() => (
                    <div className='card-in-modal'>
                        <div className='insideCardModal'>
                            <Typography style={{ fontSize: "12px", fontWeight: "500" }}>
                                Learn More:
                            </Typography>
                            <br />
                            <Row align={"middle"}>
                                <Col>
                                    <img height={35} width={30} src={modalTitleICon} alt="radar" className='mr10' />
                                </Col>
                                <Col>
                                    <Typography style={{ fontSize: "11px", fontWeight: "500", color: "#6B43B5" }}>
                                        {record.procedure && record.procedure.name}
                                    </Typography>
                                    <Typography style={{ fontSize: "8px", fontWeight: "500", color: "#979797" }}>
                                        Procedure Code:  {record.procedure && record.procedure.procedure_code}
                                    </Typography>
                                </Col>
                            </Row>
                            <br />
                            <Row>
                                <Typography style={{ fontSize: "9px", fontWeight: "400", color: "#979797", textAlign: "justify" }}>
                                    {record.procedure && record.procedure.notes}
                                </Typography>
                            </Row>
                            <br />
                            <div>
                                <VideoPlayer videoUrl={record.video_link} />
                            </div>
                            <br />
                            <div>
                                <Row justify={"center"}>
                                    <Button type="primary" style={{ width: "240px", height: '26px', fontSize: '10px', fontWeight: '400' }}>
                                        <span style={{ fontSize: "12px" }}>
                                            Request Appointment
                                        </span>

                                    </Button>
                                </Row>

                            </div>
                        </div>
                    </div>
                )}  trigger="click">
                    <Text onClick={() => { handleShowModal(record) }} underline style={{ color: '#6B43B5', textDecoration: "underline", cursor: "pointer" }}>Learn More</Text>

                </Popover>

            ,
        },
    ];

    return (
        <ConfigProvider

            theme={{
                token: {
                    colorPrimary: "#983cfc",
                    controlItemBgHover: "#c293ff",
                    colorLink: '#983cfc',
                    // borderRadius: "4px"
                },
                components: {

                    Table: {
                        borderRadius: "8px",
                        borderColor: "#eee",
                    },
                },
            }}
        >

            <Table dataSource={data} columns={columns} bordered pagination={false} />
        </ConfigProvider>
    );
}

export default TreatmentPlanTable;