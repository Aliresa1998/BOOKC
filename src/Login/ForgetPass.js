import React, { useState } from 'react';
import { Form, Input, Button, Modal, message } from 'antd';
import { controller } from './controller';

const ForgetPass = (props) => {
    const [form] = Form.useForm();
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)


    const handleBackToLogin = async () => {
        form.resetFields();
        props.goToLoginPage()
    }

    const handleSubmit = async (values) => {
        setLoading(true)


        if (values.email) {
            const response = await controller.forgotPass(values);
            if (response.status < 250) {
                setOpen(true)
                form.resetFields();
                message.success("Recover E-Mail sent successfully!")
            } else {
                message.error("Error")
            }

        }
        setLoading(false)
    };

    const handleCloseModal = () => {
        setOpen(false)
    }

    return (
        <>
            <Modal
                open={open}
                footer={null}
                onCancel={handleCloseModal}
            >
                <p className="modal-titr">Check your Email</p>
                <p className="modal-sub-titr">We have sent a password recover link to your Email.</p>
                <Button className="done-button" onClick={handleBackToLogin} >
                    Back to login page
                </Button>
            </Modal>
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
                <div className="input-lable">Email</div>
                <Form.Item
                    label=""
                    name="email"
                    rules={[
                        {
                            type: 'email',
                            message: 'Please enter a valid email address',
                        },
                        {
                            required: true,
                            message: 'Please enter your email',
                        },
                    ]}
                >
                    <Input placeholder="Enter your email" />
                </Form.Item>
                <Form.Item>
                    <Button loading={loading} className="login-button" type="primary" htmlType="submit">
                        Submit
                    </Button>
                    <p onClick={handleBackToLogin} className="forgotpass-text">Login Page</p>
                </Form.Item>
            </Form>
        </>
    );
};

export default ForgetPass;
