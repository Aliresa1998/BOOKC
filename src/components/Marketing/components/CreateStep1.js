import React, { useState, useEffect, useRef } from 'react';
import { Card, Input, DatePicker, Form, Row, Col, Divider, Checkbox, Tag, Avatar, Tooltip, Button, Select } from 'antd';
import { controller } from '../controller';
import PatientDetailsDropdown from './PatientDetailsDropdown'
import calendar from '../../../assets/icons/calendar.png';
import union2 from '../../../assets/icons/Union2.png'
import rec2 from '../../../assets/icons/rec22.png';
import { AntDesignOutlined, UserOutlined } from '@ant-design/icons';
import { CloseOutlined, DownOutlined } from '@ant-design/icons';

const { Option } = Select

const criteriaMapping = {
    first_name: "meta_data_character",
    last_name: "meta_data_character",
    date_joined: ["meta_data_datetime_start", "meta_data_datetime_end"],
    age_range: ["meta_data_integer_lower", "meta_data_integer_upper"],
    health_score: ["meta_data_integer_lower", "meta_data_integer_upper", "meta_data_character"],
    date_of_birth: ["meta_data_datetime_start", "meta_data_datetime_end"],
    gender: "meta_data_character",
    country: "meta_data_character",
    city: "meta_data_character",
    zip_code: "meta_data_character",
    treatment_plan: ["meta_data_integer", "meta_data_datetime_start", "meta_data_datetime_end"]
};

function extractValuesByCriteria(type, values) {
    const keys = criteriaMapping[type];
    if (!keys) return null;

    if (Array.isArray(keys)) {
        return keys.map(key => values[key]);
    } else {
        return values[keys];
    }
}


const CreateStep1 = ({ providePostCampaignData, sendCampaignId }) => {
    const [patients, setPatient] = useState([]);
    const [selectedPatients, setSelectedPatients] = useState([]);
    const [campaignName, setCampaignName] = useState('');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);



    const handleReadPatient = async () => {
        try {
            const response = await controller.getPatientList();
            if (response.status < 250) {
                const data = await response.json;
                const processedPatients = data.results.map(patient => ({
                    ...patient,
                    identification: patient.identification && patient.identification.filter(id => id.selected_criteria_type).map(id => {
                        const criteriaType = id.selected_criteria_type.name;
                        return {
                            ...id,
                            extractedValues: extractValuesByCriteria(criteriaType, id.selected_criteria_value)
                        };
                    }),
                    location: patient.location && patient.location.filter(loc => loc.selected_criteria_type).map(loc => {
                        const criteriaType = loc.selected_criteria_type.name;
                        return {
                            ...loc,
                            extractedValues: extractValuesByCriteria(criteriaType, loc.selected_criteria_value)
                        };
                    }),
                    treatment_plan: patient.treatment_plan && patient.treatment_plan.filter(treat => treat.selected_criteria_type).map(treat => {
                        const criteriaType = treat.selected_criteria_type.name;
                        return {
                            ...treat,
                            extractedValues: extractValuesByCriteria(criteriaType, treat.selected_criteria_value)
                        };
                    }),
                    health_score: patient.health_score && patient.health_score.filter(score => score.selected_criteria_type).map(score => {
                        const criteriaType = score.selected_criteria_type.name;
                        return {
                            ...score,
                            extractedValues: extractValuesByCriteria(criteriaType, score.selected_criteria_value)
                        };
                    }),
                }));
                setPatient(processedPatients);

            }
        } catch (e) {
            console.error('Failed to fetch patient data:', e);
        }
    };


    const handleCheckboxChange = (id) => {
        setSelectedPatients(prev => {
            if (prev.includes(id)) {
                return prev.filter(patientId => patientId !== id);

            } else {
                return [...prev, id];
            }
        });
    };


    const handleCampaignNameChange = (e) => {
        setCampaignName(e.target.value);
    };

    const handleStartDateChange = (date, dateString) => {
        setStartDate(dateString);
    };

    const handleEndDateChange = (date, dateString) => {
        setEndDate(dateString);
    };

    const postCampaignData = async () => {
        try {
            const response = await controller.createCampaigns({
                campaign_name: campaignName,
                start_date: startDate,
                end_date: endDate,
                patient_selectors: selectedPatients
            });

            if (!response.ok && response.status !== 201) {
                const errorResponse = await response.json;
                console.error('Error details:', errorResponse);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json;
            const campaignId = data.id;
            console.log('Newly created campaign ID:', campaignId);


            console.log(`Campaign created successfully with ID: ${campaignId}`);
            sendCampaignId(campaignId);
        } catch (error) {
            console.error('Error posting campaign data:', error);
        }
    };

    useEffect(() => {
        providePostCampaignData(postCampaignData, { campaignName, startDate, endDate, selectedPatients });
    }, [campaignName, startDate, endDate, selectedPatients]);



    useEffect(() => {
        handleReadPatient();
    }, []);


    const isFirstPatientReady = patients.length > 0 && patients[0].identification && patients[0].identification.length > 0;

    return (
        <>
            <div>
                <Form layout="vertical">
                    <Row justify="space-between" type="flex" style={{ width: '100%', marginBottom: 23, paddingLeft: 20 }} gutter={[0, 75]}>
                        <Col span={8} style={{ display: 'flex', paddingRight: 15 }}>
                            <div style={{ flexGrow: 1 }}>
                                <Row style={{ marginBottom: 5 }}>
                                    <label>Campaign Name</label>
                                </Row>
                                <Input
                                    style={{ width: '100%', height: 42, border: '1px solid #6B43B5', borderRadius: '8px' }}
                                    placeholder="Enter Audience Name"
                                    onChange={handleCampaignNameChange}
                                />
                            </div>
                            <Divider type="vertical" className="vertical-divider" style={{ height: 'auto', marginTop: '20px' }} />
                        </Col>
                        <Col span={16} style={{ display: 'flex', flexDirection: 'row' }}>
                            <Col span={12} style={{ marginTop: 2, paddingRight: 5 }}>
                                <Row style={{ marginBottom: 6 }}>
                                    <label>Campaign Time</label>
                                </Row>
                                <DatePicker
                                    onChange={handleStartDateChange}
                                    suffixIcon={<img src={calendar} alt="" />}
                                    style={{ width: '95%', height: 42, border: '1px solid #6B43B5' }} />
                            </Col>
                            <Col span={12} style={{ marginTop: 37 }}>
                                <DatePicker
                                    onChange={handleEndDateChange}
                                    suffixIcon={<img src={calendar} alt="" />}
                                    style={{ width: '95%', height: 42, border: '1px solid #6B43B5' }} />
                            </Col>
                        </Col>
                    </Row>
                </Form>
            </div>

            <div style={{ marginTop: 55 }}>
                <div style={{ display: 'flex', flexDirection: 'row', marginLeft: 20, marginRight: 20 }}>
                    <p style={{ fontSize: 16 }}>Select the audience group you want this campaign for:</p>
                    <Input
                        size="medium"
                        placeholder="Search Lead Selection "
                        prefix={<img src={union2} alt="" />}
                        style={{ marginBottom: '20px', height: 34, border: '1px solid #6B43B5', width: 206, borderRadius: 30, marginLeft: 'auto' }}
                    />
                </div>
            </div>
            <Row gutter={[16, 16]} style={{ marginBottom: '20px', flexWrap: 'wrap' }}>
                {/* All Patients Card */}
                <Col span={24} md={8} style={{ marginBottom: '35px', display: 'flex', justifyContent: 'center' }}>
                    <Card className="custom-card123">
                        <div style={{ width: '100%' }}>
                            <Checkbox
                                //   onChange={() => this.handleCheckboxChange()}
                                className="custom-checkbox"
                            />
                            <div style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', position: 'absolute' }}>
                                <p style={{ fontSize: 20, fontWeight: '600', color: '#6B43B5' }}>All Patients</p>

                            </div>
                            <div style={{ display: 'flex', flexDirection: 'row', top: '100%', transform: 'translate(0%, -100%)', position: 'absolute', width: '100%' }}>
                                <p style={{ fontSize: 14, color: '#979797' }}>Total:</p>
                                <p style={{ fontSize: 14, color: '#6B43B5', position: 'absolute', left: 200 }}>1234 patients</p>
                            </div>
                        </div>
                    </Card>
                </Col>

                {/* Patient Cards */}
                {patients.map((patient) => (
                    <Col span={24} md={8} key={patient.id} style={{ marginBottom: '35px', display: 'flex', justifyContent: 'center' }}>
                        <Card className="custom-card123" bordered={false} >
                            <div style={{ display: 'flex', flexDirection: 'row', width: '100%', marginBottom: 10 }}>
                                <p style={{ color: '#6B43B5', fontSize: 16, fontWeight: '600', zIndex: 1, position: 'relative', width: '100%' }}> {patient ? patient.title : '-'} </p>
                                <Tag
                                    color={"rgba(35, 208, 32, 0.2)"}
                                    style={{ borderRadius: "20px", color: "rgba(35, 208, 32, 1)", width: 61, height: 22, textAlign: 'center', left: 0 }}
                                >
                                    Include
                                </Tag>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
                                <p style={{ fontSize: 16, zIndex: 1, position: 'relative', width: '100%' }}>Identification</p>
                                {isFirstPatientReady ? (
                                    <PatientDetailsDropdown
                                        identification={patient.identification}
                                    />
                                ) : (
                                    <p>Loading patient details or no data available...</p>
                                )}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
                                <p style={{ fontSize: 16, zIndex: 1, position: 'relative', width: '100%' }}>Location</p>
                                {isFirstPatientReady ? (
                                    <PatientDetailsDropdown
                                        location={patient.location}
                                    />
                                ) : (
                                    <p>Loading patient details or no data available...</p>
                                )}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
                                <p style={{ fontSize: 16, zIndex: 1, position: 'relative', width: '100%' }}>Treatment Plans</p>
                                {isFirstPatientReady ? (
                                    <PatientDetailsDropdown
                                        treatmentPlans={patient.treatment_plans}
                                    />
                                ) : (
                                    <p>Loading patient details or no data available...</p>
                                )}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
                                <p style={{ fontSize: 16, zIndex: 1, position: 'relative', width: '100%' }}>Health Score</p>
                                {isFirstPatientReady ? (
                                    <PatientDetailsDropdown
                                        healthScore={patient.health_score}
                                    />
                                ) : (
                                    <p>Loading patient details or no data available...</p>
                                )}
                            </div>

                            <img src={rec2} alt="" className="image-pay1" />
                            <Checkbox
                                onChange={() => handleCheckboxChange(patient.id)}
                                checked={selectedPatients.includes(patient.id)}
                                className="custom-checkbox"
                            />
                            <Divider type="horizental" style={{ width: '300px' }} />
                            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 25 }}>
                                <p style={{ color: '#848696' }}>Total Patients </p>
                                <Avatar.Group
                                    maxCount={2}
                                    maxStyle={{
                                        color: '#fff',
                                        backgroundColor: '#6B43B5',
                                    }}
                                >
                                    <Avatar src="https://api.dicebear.com/7.x/miniavs/svg?seed=2" />
                                    <Avatar
                                        style={{
                                            backgroundColor: '#E0DDF7',
                                        }}
                                    >
                                        K
                                    </Avatar>
                                    <Tooltip title="Ant User" placement="top">
                                        <Avatar
                                            style={{
                                                backgroundColor: '#9932cc',
                                            }}
                                            icon={<UserOutlined />}
                                        />
                                    </Tooltip>
                                    <Avatar
                                        style={{
                                            backgroundColor: '#6a0dad',
                                        }}
                                        icon={<AntDesignOutlined />}
                                    />
                                </Avatar.Group>

                            </div>
                        </Card>
                    </Col>
                ))}

                {/* Create New Card */}
                <Col span={24} md={8} style={{ marginBottom: '35px', display: 'flex', justifyContent: 'center' }}>
                    <Card className="custom-card123" >
                        <div style={{ width: '100%' }}>
                            <div style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', position: 'absolute' }}>
                                <p style={{ fontSize: 20, fontWeight: '600', color: '#6B43B5' }}>Create New</p>

                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>

        </>
    )
}

export default CreateStep1
