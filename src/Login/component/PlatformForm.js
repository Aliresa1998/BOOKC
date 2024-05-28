import React, { useState } from 'react';
import { Row, Form, Input, Button, DatePicker, Select, message } from 'antd';
import moment from 'moment';
import { controller } from '../controller';

const { Option } = Select;

const dateFormat = 'YYYY-MM-DD';

const MyForm = (props) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false)

    const onFinish = async (values) => {
        setLoading(true)
        values["client_name"] = {}
        values["dateOfBirth"] = moment(values["dateOfBirth"]).format("YYYY-MM-DD")

        const response = await controller.createPlatformCustomer(values)
        console.log(response)
        if (response.status < 250) {
            message.success("Customer created!")
            let formData = new FormData();
            for (var i in props.selectedRowKeys) {
                formData.append("invite", props.selectedRowKeys[i]);
            }
            const resp = await controller.inviteMembership(formData)
            if (resp.status < 250)
                props.closeOpenPlatform()
            else
                message.error("error")
        }
        setLoading(false)
    };

    const onReset = () => {
        form.resetFields();
        props.closeOpenPlatform()
    };

    return (
        <Form
            form={form}
            onFinish={onFinish}
            layout="vertical"
            initialValues={{ remember: true }}
        >

            <Form.Item
                name="first_name"
                label="First Name"
                rules={[{ required: true, message: 'Please enter first name' }]}
            >
                <Input placeholder="Enter First Name" />
            </Form.Item>

            <Form.Item
                name="last_name"
                label="Last Name"
                rules={[{ required: true, message: 'Please enter last name' }]}
            >
                <Input placeholder="Enter Last Name" />
            </Form.Item>

            <Form.Item
                name="email"
                label="Email"
                rules={[
                    { required: true, message: 'Please enter email' },
                    { type: 'email', message: 'Please enter a valid email' },
                ]}
            >
                <Input placeholder="Enter Email" />
            </Form.Item>

            <Form.Item
                name="phone"
                label="Phone"
                rules={[{ required: true, message: 'Please enter phone number' }]}
            >
                <Input placeholder="Enter Phone Number" />
            </Form.Item>

            <Form.Item
                name="dateOfBirth"
                label="Date of Birth"
                style={{ width: "100%" }}
                rules={[{ required: true, message: 'Please select date of birth' }]}
            >
                <DatePicker style={{ width: "100%" }} format={dateFormat} placeholder="Select Date of Birth" />
            </Form.Item>

            <Form.Item
                name="address1"
                label="Address"
                rules={[{ required: true, message: 'Please enter address' }]}
            >
                <Input placeholder="Enter Address" />
            </Form.Item>

            <Form.Item
                name="city"
                label="City"
                rules={[{ required: true, message: 'Please enter city' }]}
            >
                <Input placeholder="Enter City" />
            </Form.Item>

            <Form.Item
                name="state"
                label="State"
                rules={[{ required: true, message: 'Please enter state' }]}
            >
                <Input placeholder="Enter State" />
            </Form.Item>

            <Form.Item
                name="postalCode"
                label="Postal Code"
                rules={[{ required: true, message: 'Please enter postal code' }]}
            >
                <Input placeholder="Enter Postal Code" />
            </Form.Item>

            <Form.Item
                name="country"
                label="Country"
                rules={[{ required: true, message: 'Please select country' }]}
            >
                <Select placeholder="Select Country">
                    <Option key="US" value="US">United States of America</Option>
                    <Option key="CA" value="CA">Canada</Option>
                </Select>
            </Form.Item>
            <Row justify={"center"}>
                <Button htmlType="button" onClick={onReset} style={{ marginLeft: '10px' }}>
                    Close
                </Button>
                <Form.Item>
                    <Button loading={loading} type="primary" htmlType="submit" style={{ marginLeft: "10px", minWidth: "120px" }}>
                        Submit
                    </Button>
                </Form.Item>
            </Row>

        </Form>
    );
};

export default MyForm;
