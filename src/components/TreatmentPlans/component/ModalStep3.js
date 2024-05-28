import React, { useEffect, useState } from "react";
import { Modal, Input, Select, Button, Spin, Row, notification } from 'antd';
import { controller } from '../controller'


const { TextArea } = Input;
const { Option } = Select;


const ModalStep3 = ({ selectedMember, isModalVisible, setIsModalVisible, handleSuccessAddToServer }) => {
    const [treatmentDescription, setTreatmentDescription] = useState('');
    const [note, setNote] = useState('');
    const [procedures, setProcedures] = useState([]);
    const [selectedProcedure, setSelectedProcedure] = useState([]);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState();

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const saveNotesToServer = async () => {
        setLoading(true)
        try {
            await controller.createTreatmentPlans({
                name: treatmentDescription,
                description: note,
                procedure: selectedProcedure,
                patient: data.id
            });
            setIsModalVisible(false)

            // empty form
            setSelectedProcedure([])
            setNote("")
            setTreatmentDescription("")

            handleSuccessAddToServer()

            notification.success({
                message: 'Success',
                description: 'Treatment plan successfully created.',
                placement: 'bottomRight',
            });
        } catch (error) {
            console.error('Error creating treatment plans:', error);
        }
        setLoading(false)
    };

    const GetProcedure = () => {
        controller.getProcedure(0).then(data => {
            if (Array.isArray(data.json)) {
                setProcedures(data.json);
            } else {
                setProcedures([]);
            }
        }).catch(error => {
            console.error('Error fetching procedures:', error);
            setProcedures([]);
        });
    };

    useEffect(() => {
        GetProcedure()
    }, []);

    useEffect(() => {
        if (selectedMember) {
            setData(selectedMember);
        }
    }, [selectedMember]);


    return (
        <>
            <Modal
                title="Add new Treatment "
                open={isModalVisible}
                style={{
                    minWidth: 300,
                    minHeight: 800,
                }}
                footer={null}
                onCancel={handleCancel}
            >
                <div>
                    <div className="div-margin-bottom-top" >
                        <div className="div-margin-bottom-text">
                            Enter Treatment Plan
                        </div>
                        <TextArea
                            className="text-area-custom"
                            rows={4}
                            value={treatmentDescription}
                            onChange={(e) => setTreatmentDescription(e.target.value)}
                            placeholder="Enter Treatment Description"
                        />

                    </div>
                    <div className="div-margin-bottom" >
                        <div className="div-margin-bottom-text">
                            Add Description
                        </div>

                        <TextArea
                            className="text-area-custom2"
                            rows={4}
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Write Note for Treatment..." />
                    </div>
                    <div className="div-margin-bottom" >
                        <div className="div-margin-bottom-text">
                            Select Procedure Code
                        </div>
                        <Select
                            className="select-style1"
                            showSearch
                            placeholder="Select a procedure Code"
                            onChange={(value) => setSelectedProcedure(value)}
                            value={selectedProcedure}
                        >
                            {procedures.map((procedure, index) => (
                                <Option key={procedure.id} value={procedure.id}>
                                    {`Procedure Code: ${procedure.procedure_code ? procedure.procedure_code : "-"}`}
                                </Option>
                            ))}
                        </Select>
                    </div>
                </div>
                <div className="flex-margin-right-15">
                    <Button
                        className="button-primary-fixed-width"
                        type="primary"
                        onClick={saveNotesToServer}
                        loading={loading}
                    >
                        Done
                    </Button>
                </div>
            </Modal >
        </>
    );
};

export default ModalStep3;