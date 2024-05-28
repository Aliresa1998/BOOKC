import React from "react";
import {
    Row,
    Col,
    Button,
    Typography
} from "antd"


// import components
import NewDashboardLayout from "../component/NewDashboardLayout"
import TreatmentPlanTable from "./TreatmentPlanTable"
import TreatmentPlanFile from "./TreatmentPlanFile"
import "./style.css"

// import images
import infoCircleIcon from "../assets/icon/info-circle.png"
import ToothImage from "./ToothImage";
import DoctorNote from "./DoctorNote";
import SimulatorTooth from "./SimulatorTooth";
import { controller } from "../controller";
const TreatmentPlan = () => {
    const [data, setData] = React.useState(null)
    const handleGetData = async () => {
        var url = window.location.href
        const urlParams = new URLSearchParams(url.slice(url.indexOf('?')));
        const patientId = urlParams.get('patient_id');
        const response = await controller.getTreatmentPlan(patientId)
        setData(response.json)
    }

    React.useEffect(() => {
        handleGetData()
    }, [])
    return (
        <NewDashboardLayout>
            <Row type="flex" justify={"space-between"}>

                <p className="notice-text-treatment-plan">
                    <img src={infoCircleIcon} alt="info" width={40} />
                    <span className="ml10"> You have three treatments left, please book an appointment as soon as possible.
                        <span className="link-text"> view Details</span>
                    </span>
                </p>

            </Row>

            <Row type="flex" justify={"space-between"} style={{ marginTop: "25px" }} >
                <p className="treatment-title">
                    Treatment Plans
                </p>
                <Button className="request-appointment-btn">
                    Request Appointment
                </Button>
            </Row>
            {
                data && data.length > 0 && (
                    <div className="new-cards mt10 mb10">
                        <div className="inner-border-new-cards">
                            <div style={{ paddingTop: "25px", paddingLeft: "20px" }}>
                                <DoctorNote doctor_note={data && data[0] && data[0].doctor_note} />
                            </div>
                            <Typography style={{ fontWeight: 600, fontSize: '16px', paddingTop: "25px", paddingLeft: "20px" }}>
                                Treatment Simulator
                            </Typography>
                            <div style={{ padding: "25px 50px" }}>
                                <SimulatorTooth />
                            </div>
                            <div style={{ padding: "25px 50px" }}>
                                <TreatmentPlanTable data={data} />
                            </div>
                            <div style={{ padding: "25px 50px" }}>
                                <TreatmentPlanFile data={data} />
                            </div>
                            {/* <div className="tooth-image-container">
                                <ToothImage />
                            </div> */}

                        </div>
                    </div>
                )
            }

        </NewDashboardLayout>
    )
}

export default TreatmentPlan;