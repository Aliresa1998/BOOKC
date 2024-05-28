import React, { useEffect, useState } from "react";
import {
  Form,
  Avatar,
  Button,
  Table,
  Space,
  Card,
  notification,
  Input,
} from "antd";
import ModalStep3 from "./ModalStep3";
import { controller } from "../controller";
import edit1 from "../../../assets/icons/edit.png";
import check from "../../../assets/icons/check.png";

const { Meta } = Card;


const ModalStep2 = ({ selectedMember }) => {
  const [tableData, setTableData] = useState([]);
  const [isModalVisible1, setIsModalVisible1] = useState(false);
  const [data, setData] = useState([]);
  const [edit, setEdit] = useState(false);
  const [memberdata, setMemberData] = useState([]);


  const handleReadData = async () => {
    try {
      const response = await controller.getTreatmentModal(0, selectedMember.id);

      if (response.status < 250) {
        setData(response.json);
      }
    } catch (e) {
      notification.error({
        message: "Error",
        description: "Server error.",
        placement: 'bottomRight',
      });
    }
  };

  const showModal = () => {
    setIsModalVisible1(true);
    console.log(isModalVisible1);
  };

  const Tabledata = () => {
    if (
      data &&
      Array.isArray(data) &&
      data.length > 0 &&
      Array.isArray(data[0].treatment_plans)
    ) {
      const mappedData = data[0].treatment_plans.map((plan) => ({
        key: plan.id.toString(),
        treatment: plan.name ? plan.name : "-",
        notes: plan.description || "-",
        procedure: plan.procedure ? plan.procedure.name : "-"
      }));
      setTableData(mappedData);
      // Initialize the edit state with false for each row
      const initialEditState = {};
      mappedData.forEach((row) => {
        initialEditState[row.key] = false;
      });
      setEdit(initialEditState);
    } else {
      setTableData([]);
    }
  };

  const renderEditCell = (record) => {
    const isEditing = edit[record.key];
    console.log(edit);
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

  const handleNoteChange = (e, record) => {
    const updatedTableData = tableData.map((row) => {
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
    await saveNotesToServer(record); // Save notes to server when closing textarea
    setEdit(false);
  };

  const saveNotesToServer = async (record) => {
    try {
      await controller.UpdateTreatmentPlans(record.key, {
        notes: record.notes,
      });
    } catch (error) {
      console.error("Error updating notes:", error);
    }
  };

  useEffect(() => {
    Tabledata();
  }, [data]);


  useEffect(() => {
    if (selectedMember) {
      setMemberData(selectedMember);
    }
  }, [selectedMember]);

  useEffect(() => {
    handleReadData();
    console.log(data);
  }, []);

  const columns3 = [
    {
      title: "Treatment Plan",
      dataIndex: "treatment",
      key: "treatment",
      width: "20%",
    },
    {
      title: "Description",
      dataIndex: "notes",
      key: "notes",
      width: "50%",
      render: (_, record) => renderEditCell(record),
    },
    {
      title: "Procedure",
      dataIndex: "procedure",
      key: "procedure",
      width: "20%",

    },
    {
      title: "Edit",
      key: "edit",
      width: "10%",
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
        selectedMember={memberdata}
      />
      <Form className="modal2-form">
        <div className="modal2-form-div">
          <div className="modal2-form-div2">
            <Avatar
              size={70}
              shape="circle"
              src={
                memberdata.profile_picture
                  ? `${memberdata.profile_picture}`
                  : ""
              }
            />
            <div>
              <Meta
                className="modal-op-meta"
                title={
                  memberdata.first_name && memberdata.last_name
                    ? `${memberdata.first_name} ${memberdata.last_name}`
                    : "-"
                }
              />
              <div className="meta-text">john91</div>
            </div>
          </div>
          <div className="div-table">
            <Table
              dataSource={tableData}
              columns={columns3}
              pagination={false}
            />
            <Button
              className="step2-button2"
              type="default"
              onClick={() => {
                showModal();
              }}
            >
              + Add new Treatment
            </Button>
          </div>
        </div>
      </Form>
    </>
  );
};

export default ModalStep2;
