import React from "react";
import { useEffect, useState } from "react";
import { Form, Select, Typography, Avatar, Card } from "antd";
import image from "../../../assets/img/imgo2.jpg";

const { Meta } = Card;
const { Title, Text } = Typography;
const { Option } = Select;

function ModalStep1({ item, handleMemberSelect }) {

  const [member, setMembers] = useState([]);

  const handleChange = (value, option) => {
    if (!value) {
      handleMemberSelect(null);
      return;
    }

    const selectedMember = member.find((mem) => mem.id.toString() === value);
    if (selectedMember) {
      handleMemberSelect(selectedMember);
    } else if (option && option.key === "search") {
      const searchValue = option.props.children;
      const searchedMembers = member.filter(mem =>
        mem.first_name && mem.first_name.toLowerCase().includes(searchValue.toLowerCase())
      );
      console.log("Search results:", searchedMembers);
    }
  };


  useEffect(() => {
    if (item) {
      setMembers(item);
    }
  }, [item]);

  return (
    <div className="modal2-form">
      <div className="modal-step1">
        <Title className="modal1-title" level={5}>
          Select Patient
        </Title>
        <Form.Item className="modal1-form1" name="treatment">
          <Text className="modal1-text1">Select Patient</Text>
          <Select
            className="modal1-select"
            placeholder="Enter Treatment Plan"
            onChange={handleChange}
            showSearch
            optionFilterProp="data-label"
            filterOption={(input, option) =>
              option.props['data-label'].toLowerCase().includes(input.toLowerCase())
            }
          >
            {member.map((mem) => (
              <Option
                value={mem.id.toString()}
                key={mem.id}
                data-label={mem.first_name + " " + mem.last_name}
              >
                <div className="modal1-op-head">
                  <Avatar size={30} shape="circle" src={image} />
                  <Meta className="modal-op-meta" title={(mem.first_name ? mem.first_name : "-") + " " + (mem.last_name ? mem.last_name : "")} />
                </div>
              </Option>
            ))}
          </Select>
        </Form.Item>
      </div>
    </div>
  );
}

export default ModalStep1;
