import React, { useEffect, useState } from "react";
import {
    Avatar,
    Button,
    Col,
    Card,
    Table,
    Input,
    Upload,
    Typography,
    Space,
    notification,
    Spin
} from "antd";

// icons
import check from '../../../assets/icons/check.png';
import edit1 from '../../../assets/icons/edit.png';
import up from '../../../assets/icons/arrow-up.png'
import down from '../../../assets/icons/arrow-down.png'
import trash from '../../../assets/icons/trash2.png'
import export1 from '../../../assets/icons/export.png'
import up2 from '../../../assets/icons/Polygon 1.png';
import down2 from '../../../assets/icons/Polygon 2.png';


import "../style.css";
import { controller } from "../controller";
import ModalStep3 from './ModalStep3'

// variables
const { Title } = Typography
const { Meta } = Card;

const TreatmentCard = (props) => {
    const [isExpanded, setisExpanded] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [currentStep, setCurrentStep] = useState(1);
    const [item, setitems] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [note, setNote] = useState("");
    const [imageFile, setImageFile] = useState([]);
    const [selectedTreatmentIds, setSelectedTreatmentIds] = useState([]);
    const [edit, setEdit] = useState(false);
    const [isModalVisible1, setIsModalVisible1] = useState(false);
    const [isloading, setisLoading] = useState(false);
    const [updatingPriority, setUpdatingPriority] = useState(null);

    const props1 = {
        name: 'file',
        action: 'https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188',
        headers: {
            authorization: 'authorization-text',
        },
        onChange(info) {
            if (info.file.status !== 'uploading') {
                console.log(info.file, info.fileList);
            }
            if (info.file.status === 'done') {
                notification.success({
                    message: 'Success',
                    description: 'Your image have been successfully upload.',
                    placement: 'bottomRight',
                });
                setImageFile(prev => [...prev, info.file.originFileObj]);
            } else if (info.file.status === 'error') {
                notification.error({
                    message: 'Error',
                    description: 'File upload failed.',
                    placement: 'bottomRight',
                });
            }
        },
    };

    const getImageUrl = file => URL.createObjectURL(file);



    const handleTextAreaChange = (e) => {
        setNote(e.target.value);
    };


    const handleRemove = () => {
        setImageFile([]);
    };

    const handleSuccessAddToServer = () => {
        props.updateData()
    }

    const showModal = () => {
        setIsModalVisible1(true);
        console.log(isModalVisible1);
    };

    useEffect(() => {
        if (!isExpanded) {
            setNote("");
            setImageFile([]);
        }
    }, [isExpanded]);



    const Priority = ({ loading, initialPriority, onUpdate, record }) => {
        const [count, setCount] = useState(Number(initialPriority));

        const increasePriority = async () => {
            const newPriority = Number(count) + 1;
            setCount(newPriority);
            onUpdate(newPriority, record);
        };

        const decreasePriority = async () => {
            const newPriority = Math.max(Number(count) - 1, 0);
            setCount(newPriority);
            onUpdate(newPriority, record);
        };

        useEffect(() => {
            setCount(initialPriority);
        }, [initialPriority]);


        return (
            <div className="div-prority">
                <Button type="text" icon={<img src={down2} alt="" />} onClick={decreasePriority} />
                {
                    loading ? <Spin size="small" /> :
                        <p className="p-fontSize"> {count} </p>
                }
                <Button type="text" icon={<img src={up2} alt="" />} onClick={increasePriority} />
            </div>
        );
    };

    useEffect(() => {
        if (props.data) {
            setitems(props.data)
            const mappedData = props.data.treatment_plans.map(plan => ({
                key: plan.id.toString(),
                treatment: plan.name ? plan.name : "-",
                notes: plan.description || "-",
                priority: plan.priority ? plan.priority : 0,
                procedure: plan.procedure ? plan.procedure.name : "-"
            }));
            setTableData(mappedData);
            // Initialize the edit state with false for each row
            const initialEditState = {};
            mappedData.forEach(row => {
                initialEditState[row.key] = false;
            });
            setEdit(initialEditState);

        }
    }, [props.data]);



    const handleNoteChange = (e, record) => {
        const updatedTableData = tableData.map(row => {
            if (row.key === record.key) {
                return { ...row, notes: e.target.value };
            }
            return row;
        });
        setTableData(updatedTableData);
    };

    const handleEdit = (record) => {
        const updatedEditState = { ...edit, [record.key]: !edit[record.key] };
        setEdit(updatedEditState);
    };


    const cancelEdit = async (record) => {
        await saveNotesToServer(record);
        setEdit(false);
    };

    const saveNotesToServer = async (record) => {
        try {
            if (!record.notes || record.notes.trim() === '') {
                return;
            }
            await controller.UpdateTreatmentPlans(record.key, { description: record.notes });
            // notification.success({
            //     message: 'Success',
            //     description: 'Your changes have been successfully saved.',
            //     placement: 'bottomRight',
            // });
        } catch (error) {
            console.error("Error updating notes:", error);
        }
    };

    const savePriorityToServer = async (record) => {
        setUpdatingPriority(record.key)
        try {
            await controller.UpdateTreatmentPlans(record.key, {
                priority: record.priority
            });
            props.updateDataUpdatePriority()
            // notification.success({
            //     message: 'Success',
            //     description: 'Your changes have been successfully saved.',
            //     placement: 'bottomRight',
            // });
        } catch (error) {
            console.error("Error updating priority:", error);
        }
        setTimeout(() => {
            setUpdatingPriority(null)
        }, 800)

    };

    const renderEditCell = (record) => {
        const isEditing = edit[record.key];
        return (
            <span>
                {isEditing ? (
                    <Input.TextArea
                        value={record.notes}
                        onChange={(e) => handleNoteChange(e, record)}
                        autoSize={{ minRows: 2, maxRows: 6 }}
                    />
                ) : (
                    <span>{record.notes}</span>
                )}
            </span>
        );

    };


    const onSelectChange = (newSelectedRowKeys, newSelectedRows) => {
        setSelectedRowKeys(newSelectedRowKeys);
        const ids = newSelectedRows.map(row => row.key);
        setSelectedTreatmentIds(ids);
        console.log('Selected Treatment IDs:', ids);
    };

    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
    };

    const handleApprove = async () => {
        setisLoading(true);
        try {
            const formData = new FormData();
            for (var i in selectedTreatmentIds) {
                formData.append('treatment_plan_ids', selectedTreatmentIds[i]);
            }
            formData.append('doctor_note', note);
            imageFile.forEach((file, index) => {
                formData.append(`images`, file);
            });
            const response = await controller.postNoteAndImage(formData);
            if (response.status < 250) {
                notification.success({
                    message: 'Success',
                    description: 'Your Files Successfully Send.',
                    placement: 'bottomRight',
                });
                setisExpanded(false);
                setisLoading(false);
                setCurrentStep(1);
            }
        } catch (error) {
            console.error("Error occurred during upload:", error);
        }
    };


    const nextStep = () => {
        if (selectedRowKeys.length === 0) {
            notification.warning({
                message: 'Warning',
                description: 'Please select one treatment.',
                placement: 'bottomRight',
            });
            return;
        }
        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
        }
    };


    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
            setNote("");
            setImageFile([]);
        }
    };
    const totalSteps = 2;



    const handleClick = () => {
        props.updateData()
        setisExpanded(true);
    };

    const handleClose = () => {
        setisExpanded(false);
        props.updateData()
    };

    const columns3 = [
        {
            title: "Treatment Plan",
            dataIndex: "treatment",
            key: "treatment",
            width: '25%',
            render: (_, record) => (
                <p style={{ fontSize: "16px", fontWeight: "400px" }}>{record.treatment}</p>
            )
        },
        {
            title: "Description",
            dataIndex: "notes",
            key: "notes",
            width: '40%',
            render: (_, record) => renderEditCell(record),
        },
        {
            title: "Procedure",
            dataIndex: "procedure",
            key: "procedure",
            width: "15%",

        },
        {
            title: "Priority",
            dataIndex: "priority",
            key: "priority",
            width: '10%',
            render: (priority, record) => (

                record.key != updatingPriority ?
                    <>

                        <Priority
                            loading={false}
                            initialPriority={priority}
                            onUpdate={(newPriority, record) => {
                                savePriorityToServer({ ...record, priority: newPriority });
                            }}
                            record={record}
                        />
                    </>
                    :
                    <Priority
                        loading={true}
                        initialPriority={priority}
                        onUpdate={(newPriority, record) => {
                            savePriorityToServer({ ...record, priority: newPriority });
                        }}
                        record={record}
                    />

            ),
        },
        {
            title: "Edit",
            key: "edit",
            width: '10%',
            render: (_, record) => (
                <span>
                    <Space size="middle">
                        {edit[record.key] ? (
                            <Button
                                type="text"
                                icon={<img src={check} alt="" />}
                                style={{ color: "#979797" }}
                                onClick={() => cancelEdit(record)}
                            />
                        ) : (
                            <Button
                                type="text"
                                icon={<img src={edit1} alt="" />}
                                style={{ color: "#979797" }}
                                onClick={() => handleEdit(record)}
                            />
                        )}
                    </Space>
                </span>
            ),
        },
    ];


    return (
        <>
            <ModalStep3
                isModalVisible={isModalVisible1}
                setIsModalVisible={setIsModalVisible1}
                selectedMember={item}
                handleSuccessAddToServer={handleSuccessAddToServer}
            />
            <Col xs={24} lg={23.5} md={23.5}>
                <Card className="card-size">
                    <div
                        className="flex-row-space-between"
                    >
                        <div
                            className="avatar-meta-container1"
                        >
                            <div className="avatar-meta-width">
                                <Avatar size={70} shape="circle" src={item.profile_picture} />
                                <Meta
                                    className="meta-align-left"
                                    title={item.first_name + " " + item.last_name}
                                    description="john91"
                                />
                            </div>
                            <div className="meta-width">
                                <Meta
                                    className="meta-card2"
                                    title={`${item.updated_plans} updated Treatment Plans`}
                                    description={item.treatment_plans && item.treatment_plans.name ? item.treatment_plans.name : "-"}
                                />
                            </div>
                        </div>
                        <div
                            className="meta-card"
                        >
                            {isExpanded ? (
                                <Button
                                    className="details-button-color"
                                    type="text"
                                    onClick={handleClose}
                                >
                                    <span className="size-16">Details</span>
                                    <img src={up} alt="" style={{ marginLeft: '8px' }} />
                                </Button>
                            ) : (
                                <Button
                                    className="details-button-color"
                                    type="text"
                                    onClick={handleClick}
                                >
                                    <span className="size-16">Details</span>
                                    <img src={down} alt="" style={{ marginLeft: '8px' }} />
                                </Button>
                            )}
                        </div>
                    </div>
                    {isExpanded && (
                        <>
                            {currentStep === 1 && (
                                <>
                                    <Title
                                        className="step-title"
                                        level={5}
                                    >
                                        Select Treatment Plans you want to apear in Patient
                                        Portal and set priority for each
                                    </Title>
                                    <div className="div-table1">
                                        <Table
                                            dataSource={tableData}
                                            columns={columns3}
                                            pagination={false}
                                            rowSelection={rowSelection}
                                        />
                                    </div>

                                    <Button
                                        className="step1-button"
                                        type="default"
                                        onClick={showModal}

                                    >
                                        Add new Treatment Plan
                                    </Button>
                                </>
                            )}
                            {currentStep === 2 && (
                                <>
                                    <Title
                                        className="step-title"
                                        level={5}
                                    >
                                        Add Doctor Notes and Files
                                    </Title>
                                    <Col xs={24} lg={24} className="col-height">
                                        {imageFile.length > 0 ? (
                                            <div
                                                className="input-div"
                                            >
                                                <Input.TextArea
                                                    className="textarea-shadow-border2"
                                                    value={note}
                                                    onChange={handleTextAreaChange}
                                                    placeholder="Write Doctor’s Note..."
                                                />
                                                <div className="file-upload-container">
                                                    {imageFile.map((file, index) => (
                                                        <div key={index} className="img-size">
                                                            <img src={getImageUrl(file)} alt="" className="img-size" />
                                                            <br />
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="flex-row-shadow-border">
                                                    <Button
                                                        className="button-margin-right-top"
                                                        type="text"
                                                        onClick={handleRemove}
                                                        disabled={!imageFile}
                                                        icon={<img src={trash} alt="" />}
                                                    >
                                                        <span className="size-14-gray"> Remove </span>
                                                    </Button>
                                                    <Upload {...props1}>
                                                        <Button
                                                            className="button-margin-left-top"
                                                            type="text"
                                                        >
                                                            <span className="size-14-purple">Add File</span>
                                                            <img src={export1} alt="" style={{ marginLeft: '10px' }} />
                                                        </Button>
                                                    </Upload>
                                                </div>
                                            </div>
                                        ) : (
                                            <div
                                                className="input-div"
                                            >
                                                <Input.TextArea
                                                    className="textarea-shadow-border"
                                                    value={note}
                                                    onChange={handleTextAreaChange}
                                                    placeholder="Write Doctor’s Note..."
                                                />

                                                <div className="flex-row-shadow-border">
                                                    <Button
                                                        className="button-margin-right-top"
                                                        type="text"
                                                        onClick={handleRemove}
                                                        disabled={true}
                                                        icon={<img src={trash} alt="" />}
                                                    >
                                                        <span className="size-14-gray"> Remove </span>
                                                    </Button>
                                                    <Upload {...props1}>
                                                        <Button
                                                            className="button-margin-left-top"
                                                            type="text"
                                                        >
                                                            <span className="size-14-purple">Add File</span>
                                                            <img src={export1} alt="" style={{ marginLeft: '10px' }} />
                                                        </Button>
                                                    </Upload>
                                                </div>
                                            </div>
                                        )}
                                    </Col>
                                </>
                            )}
                            <div
                                className="step2-div"
                            >
                                {currentStep === 1 && (
                                    <Button
                                        className="render-btn1"
                                        type="default"
                                        onClick={prevStep}
                                        disabled
                                    >
                                        Back
                                    </Button>
                                )}
                                {currentStep > 1 && (
                                    <Button
                                        className="render-btn1"
                                        type="default"
                                        onClick={prevStep}
                                    >
                                        Back
                                    </Button>
                                )}
                                {currentStep < totalSteps && (
                                    <Button
                                        className="render-btn2"
                                        type="primary"
                                        onClick={nextStep}
                                    >
                                        Next
                                    </Button>
                                )}
                                {currentStep === totalSteps && (
                                    <Button
                                        className="render-btn2"
                                        type="primary"
                                        onClick={handleApprove}
                                        loading={isloading}
                                    >
                                        Approve
                                    </Button>
                                )}
                            </div>
                        </>
                    )}
                </Card>
            </Col >
        </>
    )
}

export default TreatmentCard;