import React, { useEffect } from "react";
import { useState } from "react";
import { Radio, Button, Row, Col, Typography, notification, Spin } from "antd";

import DashboardLayout from "../../layout/dashboardLayout/DashboardLayout";
import TreatmentCard from "./component/TreatmentCard";
import ModalComponent from "./component/Modal";
import { controller } from "./controller";
import "./style.css";

const { Title } = Typography;


const options = [
  { value: "not_approved", label: "New" },
  { value: "approved", label: "Approved" },
];


function TreatmentPlans() {
  const [mode, setMode] = useState("not_approved");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState();
  const [data, setData] = useState([]);
  const [prodata, setProData] = useState([]);
  const [list, setList] = useState([]);
  const [filter, setFilter] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSelectChangeMode = async (e) => {
    const value = e.target.value;
    setMode(value)
    setLoading(true);
    try {
      const response = await controller.getTreatmentPlans(0, value);

      if (response.status < 250) {
        setData(response.json);
      }
    } catch (e) {
      // notification.error({
      //   message: "Error",
      //   description: "Server error.",
      //   placement: 'bottomRight',
      // });
    }
    setLoading(false);
  }

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleReadDataNoLoading = async () => {

    try {
      const response = await controller.getTreatmentPlans(0, mode);

      if (response.status < 250) {
        setData(response.json);
      }
    } catch (e) {
      console.log(e)
    }

  };

  const handleReadData = async () => {
    setLoading(true);
    try {
      const response = await controller.getTreatmentPlans(0, mode);

      if (response.status < 250) {
        setData(response.json);
      }
    } catch (e) {
      // notification.error({
      //   message: "Error",
      //   description: "Server error.",
      //   placement: 'bottomRight',
      // });
    }
    setLoading(false);
  };

  const handleReadProcedure = async () => {
    try {
      const response = await controller.getProcedure(0);

      if (response.status < 250) {
        setProData(response.json);
      }
    } catch (e) {
      notification.error({
        message: "Error",
        description: "Server error.",
        placement: 'bottomRight',
      });
    }
  };

  const handleReadMember = async () => {
    try {
      const response = await controller.getMemberList(0);

      if (response.status < 250) {
        setList(response.json);
      }
    } catch (e) {
      // notification.error({
      //   message: "Error",
      //   description: "Server error.",
      //   placement: 'bottomRight',
      // });
    }
  };

  const handlePostNoteAndImage = async (note, imageFile) => {
    try {
      const response = await controller.postNoteAndImage(note, imageFile);
      console.log(response);
    } catch (error) {
      console.error("Error posting note and image:", error);
    }
  };

  const handleReadTreatment = async () => {
    try {
      const [description, procedureCode] = searchQuery.split(",");

      const response = await controller.getTreatmentList(
        0,
        description.trim(),
        procedureCode.trim()
      );

      if (response.status < 250) {
        setFilter(response.json);
      }
    } catch (e) {
      // notification.error({
      //   message: "Error",
      //   description: "Server error.",
      //   placement: 'bottomRight',
      // });
    }
  };

  const updateDataUpdatePriority = () => {
    handleReadDataNoLoading();
  }

  const updateData = () => {
    handleReadDataNoLoading();
    handleReadProcedure();
    handleReadMember();
  }

  useEffect(() => {
    handleReadData();
    console.log(data);
  }, []);

  useEffect(() => {
    handleReadProcedure();
    console.log(prodata);
  }, []);

  useEffect(() => {
    handleReadMember();
    console.log(list);
  }, []);

  useEffect(() => {
    handleReadTreatment();
    console.log(filter);
  }, [searchQuery]);

  return (
    <>
      <ModalComponent
        isModalVisible={isModalVisible}
        setIsModalVisible={setIsModalVisible}
        list={list}
        data1={data}
        filter={filter}
        setSearchQuery={setSearchQuery}
      />
      <DashboardLayout>
        <div className="top-margin-large margin-left-small">
          <div className="flex-row-space-between-marginBottom-20">
            <Title level={4}>Patient's Treatment Plans</Title>
            {
              mode == "not_approved" && (
                <Button
                  className="button-primary-small-width"
                  type="primary"
                  onClick={showModal}
                >

                  Add
                </Button>
              )
            }

          </div>
          <div
            //syle={{justifyContent:"end"}}
            className="flex-row-space-between-marginBottom-20">
            <Radio.Group
              value={mode}
              onChange={handleSelectChangeMode}
            >
              {options.map((option) => (
                <Radio.Button value={option.value}>
                  {option.label}
                </Radio.Button>
              ))}
            </Radio.Group>
          </div>

          <Col xs={24} lg={23.2} md={23.2}>
            {loading ? (
              <Row justify={"center"}>
                <Spin />
              </Row>
            ) : (
              data.map((item) => (
                <div className="mb" key={item._id}>
                <div className="mb" key={item._id}>
                  <TreatmentCard
                    updateData={updateData}
                    updateDataUpdatePriority={updateDataUpdatePriority}
                    data={item}
                    postNoteAndImage={handlePostNoteAndImage}
                  />
                  </div>
                </div>
              ))
            )}
          </Col>
        </div>

      </DashboardLayout>
    </>
  );
}

export default TreatmentPlans;
