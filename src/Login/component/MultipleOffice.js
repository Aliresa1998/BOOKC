import React, { useState } from "react";
import {
    Col,
    Row,
    Radio,
    Button,
    message
} from "antd"
import { controller } from "../controller";


const MultipleOffice = (props) => {
    const [value, setValue] = useState(true)
    const [loading, setLoading] = useState(false)
    const handleNext = async () => {
        setLoading(true)
        localStorage.setItem("multipleOffice", value)
        var myData = {
            answer: "no"
        }
        if (value) {
            myData["answer"] = "yes"
        }
        const response = await controller.setMultipleOffice(myData)

        if (response.status < 250) {
            message.success("Done")
            props.readOnboardingStatus()
        }
        setLoading(false)
    }

    const onChange = (e) => {
        setValue(e.target.value);
    }
    return (
        <>
            <p className="login-title">Welcome</p>
            {/* <p>Your Account has been verified.🎉</p> */}

            <p className="question-multiple-office">Do you have multiple Offices?</p>
            <Row justify={"space-between"} style={{ width: "70%" }}>
                <Radio.Group onChange={onChange} value={value}>
                    <Radio value={true}>Yes</Radio>
                    <Radio value={false}>No</Radio>
                </Radio.Group>
            </Row>

            <Row className="mt5p">
                <Button loading={loading} className="login-button" onClick={handleNext}>
                    Next
                </Button>
            </Row>

        </>
    )
}

export default MultipleOffice;