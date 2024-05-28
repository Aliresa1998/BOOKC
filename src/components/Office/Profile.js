import React, { useState, useEffect, useRef } from "react";
import {
  notification,
  Button,
  Card,
  Row,
  Input,
  Typography,
  Col,
  Modal,
  Upload,
  Spin,
} from "antd";
import { PlusOutlined, EditOutlined } from "@ant-design/icons";
import { controller } from "../../controller";
import config from "../../config";
import DashboardLayout from "../../layout/dashboardLayout/DashboardLayout";
import "./style.css";
const { Title } = Typography;

const EditOffice = () => {
  const [office, setOffice] = useState({
    name: "",
    state: "",
    city: "",
    address: "",
    email: "",
    latitude: "",
    longitude: "",
    phone: "",
    zip_code: "",
    featured_images: [],
    delete_images: [],
  });
  const [officedf, setOfficedf] = useState({
    name: "",
    state: "",
    city: "",
    address: "",
    email: "",
    latitude: "",
    longitude: "",
    phone: "",
    zip_code: "",
    featured_images: [],
    delete_images: [],
  });
  const [logoFile, setLogoFile] = useState("");
  const [previewVisible, setPreviewVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [previewImage, sePreviewImage] = useState("");
  const [errors, setErrors] = useState({
    name: "",
    state: "",
    city: "",
    address: "",
    email: "",
    latitude: "",
    longitude: "",
    phone: "",
    zip_code: "",
    featured_images: "",
  });
  const [locationValue, setLocationValue] = useState();
  const [fileList, setFileList] = useState([]);
  const [officeFileList, setOfficeFileList] = useState([]);
  const inputRef = useRef();
  const uploadButton = (
    <div>
      <PlusOutlined />
      <div className="ant-upload-text">Upload</div>
    </div>
  );

  const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleChangeFeaturedImage = ({ fileList }) => {
    setFileList(fileList);
  };

  const handleChangeOfficeImage = ({ fileList }) => {
    setOfficeFileList(fileList);
  };

  const handleCancel = () => {
    setPreviewVisible(false);
  };

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewVisible(true);
    sePreviewImage(file.url || file.preview);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setOffice({
      ...office,
      [name]: value,
    });
  };
  const handleDeleteImage = (e) => {
    if (office.delete_images) {
      setOffice({
        ...office,
        delete_images: [...office.delete_images, e.uid],
      });
    } else {
      setOffice({
        ...office,
        delete_images: [e.uid],
      });
    }
  };

  const getOfficeDetail = async () => {
    const response = await controller.getOfficeDetail(office);
    if (response.data) {
      if (response.data.featured_images.length != 0) {
        const updatedData = {
          featured_images: response.data.featured_images.map((imageObj) => ({
            url: config.apiGateway.URL + `${imageObj.image}`,
            uid: imageObj.id,
            name: "",
            status: "done",
          })),
        };
        setFileList(updatedData.featured_images);
      }
      if (response.data.office_images.length != 0) {
        const updatedData = {
          office_images: response.data.office_images.map((imageObj) => ({
            url: config.apiGateway.URL + `${imageObj.image}`,
            uid: imageObj.id,
            name: "",
            status: "done",
          })),
        };
        setOfficeFileList(updatedData.office_images);
      }
    }
  };
  const getOfficeProfile = async () => {
    const response = await controller.getOfficeProfile(office);
    if (response.data) {
      setOffice(response.data);
      setOfficedf(response.data)
      setLogoFile(response.data.logo);
      if (response.data.latitude && response.data.longitude) {
        getGoogleLocation(
          response.data.latitude,
          response.data.longitude,
          response.data,
          true
        );
      }
    }
  };

  const handleEditOffice = async (alert) => {
    setErrors({
      name: "",
      state: "",
      city: "",
      address: "",
      email: "",
      latitude: "",
      longitude: "",
      phone: "",
      zip_code: "",
    });
    try {
      const data = {};
      if (office.city != officedf.city) {
        data["city"] = office.city
      }
      if (office.state != officedf.state) {
        data["state"] = office.state
      }
      if (office.address != officedf.address) {
        data["address"] = office.address
      }
      if (office.email != officedf.email) {
        data["email"] = office.email
      }
      if (office.latitude != officedf.latitude) {
        data["latitude"] = office.latitude
      }
      if (office.longitude != officedf.longitude) {
        data["longitude"] = office.longitude
      }
      if (office.phone != officedf.phone) {
        data["phone"] = office.phone
      }
      if (office.zip_code != officedf.zip_code) {
        data["zip_code"] = office.zip_code
      }
      if (office.name != officedf.name) {
        data["name"] = office.name
      }
      data["delete_images"] = office.delete_images
      data["id"] = office.id

      const response = await controller.EditOfficeProfile(
        //{
        //   city: office.city,
        //   state: office.state,
        //   address: office.address,
        //   email: office.email,
        //   latitude: office.latitude,
        //   longitude: office.longitude,
        //   phone: office.phone,
        //   zip_code: office.zip_code,
        //   name: office.name,
        //   delete_images: office.delete_images,
        //   id: office.id,
        // }
        data
      );

      if (response.status === 400) {
        setErrors(response.json);
        setOffice({ ...office, delete_images: [] });
      } else {
        setOffice({ ...office, delete_images: [] });
        if (alert) {
          notification.success({
            message: "Success",
            description: "Edit Successful",
            placement: "Success",
          });
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getGoogleLocation = async (
    latitude,
    longitude,
    officeData,
    changeValue
  ) => {
    const apiKey = "AIzaSyD656YHmwQkieoKwzJopN31fZmr9Vly7w0";
    const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;
    try {
      const response = await fetch(apiUrl);
      const data = await response.json();
      const name = data.results[0].formatted_address;
      if (data.results.length > 0) {
        setOffice({
          ...officeData,
          longitude: `${longitude}`,
          latitude: `${latitude}`,
        });
        if (changeValue) {
          setLocationValue(name);
        }
      }
    } catch (error) {
      console.error("Error fetching location:", error);
    }
  };

  useEffect(() => {
    getOfficeProfile();
    getOfficeDetail();
  }, []);

  useEffect(() => {
    if (locationValue) handleChangeLocation();
  }, [locationValue]);

  const handleChangeLocation = () => {
    if (
      window.google &&
      window.google.maps &&
      window.google.maps.places &&
      window.google.maps.places.Autocomplete
    ) {
      const autoCompleteOptions = {
        types: ["geocode"],
      };

      const autoComplete = new window.google.maps.places.Autocomplete(
        inputRef.current,
        autoCompleteOptions
      );

      autoComplete.addListener("place_changed", async () => {
        const place = autoComplete.getPlace();

        if (place && place.geometry && place.geometry.location) {
          const latitude = place.geometry.location.lat();
          const longitude = place.geometry.location.lng();
          const locationName = place.name;
          getGoogleLocation(latitude, longitude, office, false);

          setLocationValue(locationName);
        }
      });
    } else {
      console.error("Google Maps objects are not available.");
    }
  };

  const updateOfficeImage = async (e) => {
    setUploading(true);
    try {
      await handleEditOffice(false);
      const formData = new FormData();
      formData.append("office_images", e);

      const myHeaders = Object.assign(controller.authHeader());
      const req = new Request(
        config.apiGateway.URL + `/clinics/update-office-profile/${office.id}/`,
        {
          body: formData,
          method: "PATCH",
          headers: myHeaders,
        }
      );
      const response = await fetch(req);
      setUploading(false);
      getOfficeDetail();
    } catch (error) {
      console.error(error);
      setUploading(false);
    }
  };

  const updateFeaturedImage = async (e) => {
    setUploading(true);
    try {
      await handleEditOffice(false);
      const formData = new FormData();
      formData.append("featured_images", e);

      const myHeaders = Object.assign(controller.authHeader());
      const req = new Request(
        config.apiGateway.URL + `/clinics/update-office-profile/${office.id}/`,
        {
          body: formData,
          method: "PATCH",
          headers: myHeaders,
        }
      );
      const response = await fetch(req);
      setUploading(false);
      getOfficeDetail();
    } catch (error) {
      console.error(error);
      setUploading(false);
    }
  };

  const updateAvatar = async (e) => {
    setLogoFile(URL.createObjectURL(e));
    const formData = new FormData();
    formData.append("logo", e);
    try {
      setUploadingLogo(true);
      const myHeaders = Object.assign(controller.authHeader());
      const req = new Request(
        config.apiGateway.URL + `/clinics/update-office-profile/${office.id}/`,
        {
          body: formData,
          method: "PATCH",
          headers: myHeaders,
        }
      );
      const response = await fetch(req);
      setUploadingLogo(false);
    } catch (error) {
      setUploadingLogo(false);
    }
  };

  const inputStyle = {
    paddingTop: "2px",
    width: "100%",
    padding: "12px 22px",
    fontSize: "16px",
    border: "1px solid #d9d9d9",
    borderRadius: "4px",
    outline: "none",
    transition: "border-color 0.3s",
    borderColor: "#d9d9d9",
  };

  const inputFocusStyle = {
    borderColor: "#1890ff",
  };
  const buttonStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100px",
    height: "100px",
    border: "1px dashed gray",
    borderRadius: "50%",
    cursor: "pointer",
    transition: "border-color 0.3s ease",
    cursor: "pointer",
  };
  return (
    <DashboardLayout breadCrumb={false} logo={""} footerLogo={true}>
      <React.Fragment>
        <Card
          style={{
            minHeight: "300px",
            margin: "40px",
            border: "none",
            borderRadius: "8px",
          }}
          bodyStyle={{ padding: "32px" }}
        >
          <Row>
            <Col xs={24} md={12}>
              <p className="profile_editprofile">Edit Profile</p>
            </Col>
            <Col xs={24} md={12} className="profile_editicon">
              <Title level={2}>
                <EditOutlined />
              </Title>
            </Col>
          </Row>
          <Row gutter={32}>
            <Col span={24} className="profile_upload">
              <Upload
                showUploadList={false}
                beforeUpload={(e) => {
                  updateAvatar(e);
                  return false;
                }}
                className="profile_upload-btn"
                accept="image/*"
                disabled={uploadingLogo}
              >
                {uploadingLogo ? (
                  <Row>
                    <Col
                      span={24}
                      style={{ display: "flex", justifyContent: "center" }}
                    >
                      <Spin />
                    </Col>
                    <Col
                      span={24}
                      style={{ display: "flex", justifyContent: "center" }}
                    >
                      Uploading
                    </Col>
                  </Row>
                ) : (
                  <>
                    {logoFile ? (
                      <img
                        src={logoFile}
                        alt="Logo"
                        className="profile_upload-img"
                        onMouseEnter={(e) => {
                          e.target.style.opacity = 0.5;
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.opacity = 1;
                        }}
                      />
                    ) : (
                      <div style={buttonStyle}>
                        <PlusOutlined style={{ marginRight: "5px" }} />
                        <div>Upload</div>
                      </div>
                    )}
                  </>
                )}
              </Upload>
            </Col>
            <Col xs={24} md={12}>
              <label className="inputLabel">Name</label>
              <Input
                onChange={handleChange}
                className="inputs input_profile"
                name="name"
                placeholder="Name of Your Office"
                value={office.name}
                size="large"
              />
              {errors.name && <p className="red">{errors.name}</p>}
            </Col>
            <Col xs={24} md={12}>
              <label className="inputLabel">Phone</label>
              <Input
                onChange={handleChange}
                className="inputs input_profile"
                name="phone"
                placeholder="Your phone number"
                value={office.phone}
                size="large"
              />
              {errors.phone && <p className="red">{errors.phone}</p>}
            </Col>
            <Col xs={24} md={12}>
              <label className="inputLabel">Email</label>
              <Input
                rows={4}
                type="email"
                onChange={handleChange}
                className="inputs input_profile"
                name="email"
                placeholder="email"
                value={office.email}
                size="large"
              />
              {errors.email && <p className="red">{errors.email}</p>}
            </Col>
            <Col xs={24} md={12}>
              <label className="inputLabel">State</label>
              <Input
                onChange={handleChange}
                className="inputs input_profile"
                name="state"
                placeholder="State"
                value={office.state}
                size="large"
              />
              {errors.state && <p className="red">{errors.state}</p>}
            </Col>
            <Col xs={24} md={12}>
              <label className="inputLabel">City</label>
              <Input
                onChange={handleChange}
                className="inputs input_profile"
                name="city"
                placeholder="City"
                value={office.city}
                size="large"
              />
              {errors.city && <p className="red">{errors.city}</p>}
            </Col>
            <Col xs={24} md={12}>
              <label className="inputLabel">Address</label>
              <Input
                rows={4}
                onChange={handleChange}
                className="inputs input_profile"
                name="address"
                placeholder="address"
                value={office.address}
                size="large"
              />
              {errors.address && <p className="red">{errors.address}</p>}
            </Col>
            <Col xs={24} md={12}>
              <label className="inputLabel">Zip Code</label>
              <Input
                rows={4}
                onChange={handleChange}
                className="inputs input_profile"
                name="zip_code"
                placeholder="Zip Code"
                value={office.zip_code}
                size="large"
              />
              {errors.zip_code && <p className="red">{errors.zip_code}</p>}
            </Col>
            <Col xs={24} md={12}>
              <label className="inputLabel">Location</label>
              <input
                id="locationInput"
                type="text"
                value={locationValue}
                ref={inputRef}
                style={inputStyle}
                placeholder={`Current Location: ${localStorage.getItem("locationData") &&
                  JSON.parse(localStorage.getItem("locationData")).name
                  ? JSON.parse(localStorage.getItem("locationData")).name
                  : ""
                  }`}
                onChange={(e) => {
                  setLocationValue(e.target.value);
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = inputFocusStyle.borderColor;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = inputStyle.borderColor;
                }}
              />
              {errors.longitude && <p className="red">{errors.longitude}</p>}
              {errors.latitude && <p className="red">{errors.latitude}</p>}
            </Col>
          </Row>{" "}
          <Row gutter={32}>
            <Col xs={24} md={12}>
              <label className="inputLabel">
                Office <span>{"(Max 10mb)"}</span>
              </label>
              <div className="clearfix">
                <Upload
                  listType="picture-card"
                  fileList={officeFileList}
                  onPreview={handlePreview}
                  onChange={handleChangeOfficeImage}
                  beforeUpload={(e) => {
                    updateOfficeImage(e);
                    return false;
                  }}
                  onRemove={handleDeleteImage}
                  className="profile_upload-btn"
                  accept="image/*"
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <Spin /> Uploading
                    </>
                  ) : (
                    uploadButton
                  )}
                </Upload>
                <Modal
                  visible={previewVisible}
                  footer={null}
                  onCancel={handleCancel}
                >
                  <img
                    alt="example"
                    style={{ width: "100%" }}
                    src={previewImage}
                  />
                </Modal>
              </div>
              {errors.office_images && (
                <p className="red">{errors.office_images}</p>
              )}
            </Col>
            <Col xs={24} md={12}>
              <label className="inputLabel">
                Featured <span>{"(Max 10mb)"}</span>
              </label>
              <div className="clearfix">
                <Upload
                  fileList={fileList}
                  listType="picture-card"
                  onPreview={handlePreview}
                  onChange={handleChangeFeaturedImage}
                  beforeUpload={(e) => {
                    updateFeaturedImage(e);
                    return false;
                  }}
                  onRemove={handleDeleteImage}
                  className="profile_upload-btn"
                  accept="image/*"
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <Spin /> Uploading
                    </>
                  ) : (
                    uploadButton
                  )}
                </Upload>
                <Modal
                  visible={previewVisible}
                  footer={null}
                  onCancel={handleCancel}
                >
                  <img
                    alt="example"
                    style={{ width: "100%" }}
                    src={previewImage}
                  />
                </Modal>
              </div>
              {errors.featured_images && (
                <p className="red">{errors.featured_images}</p>
              )}
            </Col>
          </Row>
          <Row justifyContent="center" alignItems="center" display="flex">
            <Col sm={24} className="profile_save-btn-container">
              <Button
                onClick={() => handleEditOffice(true)}
                shape="round"
                size={"large"}
                className="profile_save-btn"
              >
                Save
              </Button>
            </Col>
          </Row>
        </Card>
      </React.Fragment>
    </DashboardLayout>
  );
};

export default EditOffice;
