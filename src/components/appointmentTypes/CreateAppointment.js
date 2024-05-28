import React, { useEffect, useState } from 'react';
import { Popconfirm, Form, Input, Select, Button, Row, notification } from 'antd';
import { controller } from '../../controller';
import { useForm } from 'antd';
const { Option } = Select;

const CreateAppointment = (props) => {
    const [form] = Form.useForm();
    const [providers, setProviders] = useState([])

    const handleCloseCreateAppointment = async () => {
        props.form.resetFields();
        props.closeCreateModal(true);
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

    const onFinish = async (values) => {


        console.log('Received values:', values);
        const response = await controller.createNewAppointmentType(values)
        if (response.status < 250) {
            props.closeCreateModal()
            form.resetFields();
            openNotification(
                "bottom",
                response && response.message ? response.message : "Done",
                "Successful"
            );
        } else {
            openNotification(
                "bottom",
                response.detail ? JSON.stringify(response.detail[0]) : "Error",
                "Error"
            );
        }

    };

    const getlistOfProvider = async () => {
        try {
            const response = await controller.listOfProviderForCreateAppointment()
            setProviders(response.json)
        } catch (error) {
            console.error('Error fetching providers:', error);
        }
    }

    useEffect(() => {
        getlistOfProvider()
    }, [])


    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
        >
            <Form.Item label="Service" name="service" rules={[{ required: true, message: 'Please input the service!' }]}>
                <Input placeholder="Service" />
            </Form.Item>

            <Form.Item label="Length" name="length" rules={[{ required: true, message: 'Please input the length!' }]}>
                <Input placeholder="Length (minute)" type="number" />
            </Form.Item>

            <Form.Item
                label="Provider"
                name="provider"
                rules={[{ required: true, message: 'Please select the provider!' }]}
            >
                <Select mode="multiple" placeholder="Select a provider">
                    {providers.map((provider) => (
                        <Option key={provider.id} value={provider.id}>
                            {provider.name}
                        </Option>
                    ))}
                </Select>
            </Form.Item>

            <Row type="flex" justify="end">
                <Form.Item>
                    <Button onClick={handleCloseCreateAppointment} className="mr8 white-btn create-payment-request-btn">
                        Close
                    </Button>
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        Submit
                    </Button>
                </Form.Item>
            </Row>
        </Form>
    );
};

export default CreateAppointment;
