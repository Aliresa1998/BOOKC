import React from "react";
import { Avatar, Row, Col, Typography, Card } from "antd";
import "./componentStyle.css";

const { Meta } = Card;
const { Text } = Typography;

const ProfileCard = ({ data }) => {
  return (
    <React.Fragment>
        <Card>
          <Col>
            <Row type="flex" justify="center">
              <Row className="db">
                <Col className="tac">
                  <Avatar
                    size={145}
                    src={data.profile_picture}
                    style={{ margin: "0 auto" }}
                  />
                  <Meta
                    title={
                      data.fullname
                        ? data.fullname
                        : data.first_name + " " + data.last_name
                    }
                    description={data.id}
                    style={{ textAlign: "center", marginTop: 25 }}
                  />
                </Col>
                {/* <Col className="tac">
              <Typography.Text strong={true}>
                {data.fullname
                  ? data.fullname
                  : data.first_name + " " + data.last_name}{" "}
              </Typography.Text>
            </Col> */}
              </Row>
            </Row>
            <br />
            <div style={{ marginTop: 18, marginLeft: 10, fontWeight: 400 }}>
              <Row type="flex" justify="space-between">
                {/* <Typography.Text disabled={true}>Email </Typography.Text>
          <Typography.Text>{data.email} </Typography.Text> */}
                <Text style={{ lineHeight: "3.55" }}>
                  <span style={{ color: "#979797" }}>Email:</span>
                  {data.email}
                </Text>
              </Row>
              <Row type="flex" justify="space-between" className="mt5">
                {/* <Typography.Text disabled={true}>Phone </Typography.Text>
          <Typography.Text>{data.phone} </Typography.Text> */}
                <Text style={{ lineHeight: "3.55" }}>
                  <span style={{ color: "#979797" }}>Phone:</span> {data.phone}
                </Text>
              </Row>
              <Row type="flex" justify="space-between" className="mt5">
                {/* <Typography.Text disabled={true}>Birth Date </Typography.Text>
          <Typography.Text>{data.birth_date} </Typography.Text> */}
                <Text style={{ lineHeight: "3.55" }}>
                  <span style={{ color: "#979797" }}>Birth Date:</span>{" "}
                  {data.birth_date}
                </Text>
              </Row>

              <Row type="flex" justify="space-between" className="mt5">
                {/* <Typography.Text disabled={true}>State </Typography.Text>
          <Typography.Text>{data.state} </Typography.Text> */}
                <Text style={{ lineHeight: "3.55" }}>
                  <span style={{ color: "#979797" }}>State:</span> {data.state}
                </Text>
              </Row>
              <Row type="flex" justify="space-between" className="mt5">
                {/* <Typography.Text disabled={true}>City </Typography.Text>
          <Typography.Text>{data.city} </Typography.Text> */}
                <Text style={{ lineHeight: "3.55" }}>
                  <span style={{ color: "#979797" }}>City:</span> {data.city}
                </Text>
              </Row>
              <Row type="flex" justify="space-between" className="mt5">
                {/* <Typography.Text disabled={true}>Address </Typography.Text>
          <Typography.Text>{data.address} </Typography.Text> */}
                <Text style={{ lineHeight: "3.55" }}>
                  <span style={{ color: "#979797" }}>Address:</span>{" "}
                  {data.address}
                </Text>
              </Row>
              <Row type="flex" justify="space-between" className="mt5">
                {/* <Typography.Text disabled={true}>Zip code </Typography.Text>
          <Typography.Text>{data.zip_code} </Typography.Text> */}
                <Text style={{ lineHeight: "3.55" }}>
                  <span style={{ color: "#979797" }}>Zip Code:</span>{" "}
                  {data.zip_code}
                </Text>
              </Row>
            </div>
          </Col>
        </Card>
    </React.Fragment>
  );
};

export default ProfileCard;
