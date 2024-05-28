import React, { useEffect, useState } from 'react';
import { Col, Radio, message, Row, Form, Input, Select, Button, Modal } from 'antd';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import PlaceSearch from "./PlaceSearch"
import { controller } from '../controller';
import { useForm } from 'antd/es/form/Form';
const { Option } = Select;

const UpdateOffice = (props) => {
  const [form] = useForm()
  const [openModalSelectOffice, setOpenModalSelectOffice] = useState(false)
  const [lat, setLat] = useState("-1")
  const [long, setLong] = useState("-1")
  const [loading, setLoading] = useState(false);
  const [integratePMS, setIntegratePMS] = React.useState('no');
  const [pmsData, setPmsData] = useState([])
  const [selectedPMS, setSelectedPMS] = useState(-1)
  const handleRadioChange = (e) => {
    setIntegratePMS(e.target.value);
  };

  const handleSubmit = async () => {
    console.log(props)
    var values = form.getFieldValue()
    setLoading(true)
    var myData = {
      claimed_office_id: selectedPMS,
      office: props.officeId
    }
    console.log(myData)
    const res = await controller.sendPMS(myData)
    if (res.status < 250) {
      var myData = {
        ...values,
        latitude: lat,
        longitude: long,
        organization_id: props.practiceId
      }
      console.log(props.officeId)
      const response = await controller.updateOffice(myData, props.officeId)

      if (response.status < 250) {
        props.readOnboardingStatus()
        message.success("Office information updated!")
      } else {
        message.error(response.detail)
      }
    } else {
      message.error("ERROR")
    }

    setLoading(false)
    /*if (selectedPMS == -1) {
      message.error("select office")
    } else {
      var myData = {
        claimed_office_id: selectedPMS,
        office: props.officeId
      }
      const response = await controller.sendPMS(myData)
    }*/
    //
  }

  const onFinish = async (values) => {

    if (integratePMS == "yes") {
      setOpenModalSelectOffice(true)
    } else {
      setLoading(true)
      var myData = {
        ...values,
        latitude: lat,
        longitude: long,
        organization_id: props.practiceId
      }
      console.log(props.officeId)
      const response = await controller.updateOffice(myData, props.officeId)

      if (response.status < 250) {
        props.readOnboardingStatus()
        message.success("Office information updated!")
      } else {
        message.error(response.detail)
      }
      setLoading(false)
    }

  };

  const getLocation = (long, lat) => {
    setLong(long.toString().slice(0, 10))
    setLat(lat.toString().slice(0, 10))
  }

  const handleReadPMSData = async () => {
    const response = await controller.getPMSData();
    console.log(response)
    if (response) {
      setPmsData(response)
    } else {
      setPmsData([])
    }
  }

  useEffect(() => {
    handleReadPMSData()
  }, [])

  return (
    <>
      <p style={{ fontSize: "20px", fontWeight: "500" }}>Basic Information of your Office</p>

      <Form
        form={form}
        name="updatePracticeForm"
        onFinish={onFinish}
      >
        <div className='input-lable'>Country</div>
        <Form.Item
          label=""
          name="country"
          rules={[
            { required: true, message: 'Please select a country!' },
            {
              validator: (_, value) =>
                ['Canada', 'United States of America'].includes(value)
                  ? Promise.resolve()
                  : Promise.reject('Invalid country'),
            },
          ]}
        >
          <Select placeholder="Select a country">
            <Option value="Canada">Canada</Option>
            <Option value="United States of America">United States of America</Option>
          </Select>
        </Form.Item>

        <div className='input-lable'>State</div>
        <Form.Item
          label=""
          name="state"
          rules={[{ required: true, message: 'Please enter the state!' }]}
        >
          <Input placeholder="Enter state" />
        </Form.Item>


        <div className='input-lable'>City</div>
        <Form.Item
          label=""
          name="city"
          rules={[{ required: true, message: 'Please enter the city!' }]}
        >
          <Input placeholder="Enter city" />
        </Form.Item>

        <div className='input-lable'>Postal Code</div>
        <Form.Item
          label=""
          name="zip_code"
          rules={[{ required: true, message: 'Please enter the postal code!' }]}
        >
          <Input placeholder="Enter postal code" />
        </Form.Item>


        <Row justify={""}>
          <div className='input-lable'>Address</div>
          <PlaceSearch getLocation={getLocation} />
        </Row>

        <Col style={{ margin: "20px 0px" }}>
          <label className='input-lable'>Do you want to integrate your PMS?</label>
          <br />
          <Radio.Group onChange={handleRadioChange} value={integratePMS}>
            <Radio value="yes">Yes</Radio>
            <Radio value="no">No</Radio>
          </Radio.Group>

        </Col>

        <Form.Item >
          <Button loading={loading} style={{ marginTop: "25px" }} className='login-button' type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
      <Modal
        onCancel={() => { setOpenModalSelectOffice(false) }}
        open={openModalSelectOffice}
        footer={null}
        title="Find your office"
      >
        <p>
          We found some offices based on your data
        </p>

        <p style={{ color: "#6B43B5", fontSize: "12px" }}>
          Select Your Office
        </p>

        <div>
          {
            pmsData.map((item) => (
              <div
                onClick={() => {
                  setSelectedPMS(item.office_id)
                }}
                className={selectedPMS == item.office_id ? "selected-card-pms" : 'card-pms'}>
                <Row style={{ color: "#6B43B5", fontSize: "16px", fontWeight: "600" }}>
                  {item.office_id + " " + item.practice_name}
                </Row>
                <Row style={{ fontSize: "13px" }}>
                  {item.address + " " + item.state + " " + item.city + " " + item.zip + ", Canada"}
                </Row>
              </div>
            ))
          }
        </div>
        <Button
          loading={loading}
          onClick={handleSubmit}
          style={{ marginTop: "25px" }} className='login-button' type="primary">
          Submit
        </Button>
      </Modal >
    </>
  );
};

export default UpdateOffice;
