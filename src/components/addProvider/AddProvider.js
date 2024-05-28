import React, { Component } from "react";
import { connect } from "react-redux";
import { push } from "react-router-redux";
import { Select, Input, Radio } from "antd";
import { notification, DatePicker } from "antd";
import { controller } from "../../controller";
import DashboardLayout from "../../layout/dashboardLayout/DashboardLayout.js";
import { Error } from "../../ErrorHandeling";
import { UserOutlined, HomeOutlined, MailOutlined, EnvironmentOutlined } from "@ant-design/icons";

const { Option } = Select;
const { Search } = Input;

class AddProvider extends Component {
  get_officeservices = async () => {
    const response = await controller.office_services(
      localStorage.getItem("selectedOffice")
    );
    this.setState({ office_services: Object.values(response) });
  };
  handleBirthDateChange(value, dateString) {
    this.setState({
      patient_birth_Date: value,
      birthdate: dateString,
    });
  }
  openNotification = (placement, message, status) => {
    if (status && status.toLowerCase().search("success") != -1) {
      notification.success({
        message: status,
        description: message,
        placement,
      });
    } else if (status && status.toLowerCase().search("error") != -1) {
      notification.error({
        message: status,
        description: message,
        placement,
      });
    } else {
      notification.info({
        message: status,
        description: message,
        placement,
      });
    }
  };
  constructor(props) {
    super(props);

    this.state = {
      serverLogo: "",
      img_preview: "",
      patient_birth_Date: "",
      provider_id: "",
      provider_fullname: "",
      provider_phone: "",
      provider_email: "",
      provider_appt_types: "",
      provider_operatories: "",
      provider_specialty: "",
      provider_image: "",
      address_line1: "",
      birthdate: "",
      city: "",
      appt_types: [],
      appt_types_id: [],
      operatories: [],
      selected_appt_types: "",
      selected_operatories: "",
      office_services: [],
      submitted: false,
      sending_data: false,
      formError: {
        address_line1: {
          massage: "",
          status: true,
        },
        birthdate: {
          massage: "",
          status: true,
        },
        city: {
          massage: "",
          status: true,
        },
        FullName: {
          massage: "",
          status: true,
        },
        Email: {
          massage: "",
          status: true,
        },
        Type: {
          massage: "",
          status: true,
        },
        Specialty: {
          massage: "",
          status: true,
        },
        Image: {
          massage: "",
          status: true,
        },
        Phone: {
          massage: "",
          status: true,
        },
      },
    };
    this.getLogo();
    this.get_officeservices();
    this.getLogo = this.getLogo.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleBirthDateChange = this.handleBirthDateChange.bind(this);
  }
  getLogo = async () => {
    const response = await controller.getLogo();
    this.setState({ serverLogo: response.data.dark });
  };

  goToDashboard = () => {
    this.props.dispatch(push(`/dashboard`));
  };

  handleSubmit = async (e) => {
    e.preventDefault();

    const FullName_validation = await Error.NameHandling(
      this.state.provider_fullname
    );
    const Email_validation = await Error.EmailHandling(
      this.state.provider_email
    );
    const Phone_validation = await Error.PhoneHandling(
      this.state.provider_phone.replace(/ /g, "")
    );
    const Type_validation = await Error.SelectItem(this.state.appt_types);
    const specialty_validation = await Error.SelectItem(
      this.state.provider_specialty
    );
    const Image_validation = await Error.UploadFileIMG(
      this.state.provider_image
    );
    const address_validation = await Error.NameHandling(
      this.state.address_line1
    );
    const birthdate_validation = await Error.BirthDateHandling(
      this.state.birthdate
    );
    const city_validation = await Error.NameHandling(this.state.city);
    this.setState({
      formError: {
        FullName: FullName_validation,
        Email: Email_validation,
        Type: Type_validation,
        Specialty: specialty_validation,
        Image: Image_validation,
        Phone: Phone_validation,
        city: city_validation,
        birthdate: birthdate_validation,
        address_line1: address_validation,
      },
    });
    if (
      FullName_validation.status &&
      Phone_validation.status &&
      Email_validation.status &&
      Type_validation.status &&
      specialty_validation.status &&
      Image_validation.status &&
      address_validation.status &&
      birthdate_validation.status &&
      city_validation.status
    ) {
      this.setState({ submitted: true });
      this.setState({ sending_data: true });

      const data = {
        name: this.state.provider_fullname,
        phone: this.state.provider_phone.replace(/ /g, ""),
        email: this.state.provider_email,
        appointment_type: this.state.appt_types_id,
        office: localStorage.getItem("selectedOffice"),
        specialty: this.state.provider_specialty,
        image: this.state.provider_image,
        address_line1: this.state.address_line1,
        birthdate: this.state.birthdate,
        city: this.state.city,
      };




      var raw = {
        name: data.name,
        phone: data.phone,
        email: data.email,
        appointment_type: data.appointment_type,
        office: data.office,
        specialty: data.specialty,
        address_line1: data.address_line1,
        birthdate: data.birthdate,
        city: data.city,
      };

      if (data.image) {
        raw["image"] = data.image;
      }

      raw = JSON.stringify(raw);

      let formData = new FormData();
      formData.append("name", data.name);
      formData.append("phone", data.phone);
      formData.append("email", data.email);
      if (data.appointment_type) {
        for (var i in data.appointment_type) {
          formData.append("appointmenttype", data.appointment_type[i]);
        }
      }

      formData.append("office", data.office);
      formData.append("specialty", data.specialty);
      formData.append("address_line1", data.address_line1);
      formData.append("birthdate", data.birthdate);
      formData.append("city", data.city);
      if (data.image) {
        formData.append("image", data.image);
      }
      const response = await controller.add_provider(formData);
      if (response.status > 250) {
        this.openNotification(
          "bottom",
          JSON.stringify(response.detail),
          "Error"
        );

        this.setState({
          formError: {
            FullName: {
              status: response.name ? false : true,
              massage: response.name ? response.name : "",
            },
            Email: {
              status: response.email ? false : true,
              massage: response.email ? response.email : "",
            },
            Type: {
              status: response.appointment_type ? false : true,
              massage: response.appointment_type
                ? response.appointment_type
                : "",
            },
            Specialty: {
              status: response.specialty ? false : true,
              massage: response.specialty ? response.specialty : "",
            },
            Image: {
              status: response.image ? false : true,
              massage: response.image ? response.image : "",
            },
            Phone: {
              status: response.phone ? false : true,
              massage: response.phone ? response.phone : "",
            },
            city: {
              status: response.city ? false : true,
              massage: response.city ? response.city : "",
            },
            birthdate: {
              status: response.birthdate ? false : true,
              massage: response.birthdate ? response.birthdate : "",
            },
            address_line1: {
              status: response.address_line1 ? false : true,
              massage: response.address_line1 ? response.address_line1 : "",
            },
          },
        });
      } else {
        this.openNotification(
          "bottom",
          JSON.stringify(response.message),
          "Successful"
        );
        this.setState({
          patient_birth_Date: "",
          provider_fullname: "",
          provider_phone: "",
          provider_email: "",
          appt_types: [],
          provider_specialty: "",
          provider_image: "",
          address_line1: "",
          birthdate: "",
          city: "",
        });
        document.getElementById("inputImageFile").value = "";
      }
    }

    this.setState({ sending_data: false });
  };

  handleChange(e) {
    let { name, value } = e.target;

    if (name == "provider_phone") {
      value = value.replace(/ /g, "");
      if (value.length < 10) {
        if (value.length == 8) {
          value = value.replace(/ /g, "");
          this.setState({
            provider_phone:
              value.slice(0, 3) +
              " " +
              value.slice(3, 6) +
              " " +
              value.slice(6),
          });
        } else {
          value = value
            .replace(/[^\dA-Z]/g, "")
            .replace(/(.{3})/g, "$1 ")
            .trim();
          this.setState({ [name]: value });
        }
      }
      if (value.length == 10) {
        value =
          value.slice(0, 3) + " " + value.slice(3, 6) + " " + value.slice(6);
        this.setState({ [name]: value });
      }
    } else {
      this.setState({ [name]: value });
    }
  }
  handleChangeAppointmentType(e) {
    this.setState({ appt_types: e });
  }

  handleUpload = (event) => {
    this.setState({ provider_image: event.target.files[0] });
  };

  render() {
    const { creating, error, profileSummary } = this.props;

    return (
      <DashboardLayout
        logo={profileSummary && profileSummary.logo ? profileSummary.logo : ""}
        footerLogo={this.state.serverLogo}
        breadCrumb={"Create New Provider"}
      >
        <div className="paymentRequestContent">
          <div className="payreq-container">
            <div className="content">
              {this.state.submitted && !creating && error && error.message && (
                <div className="alert">{error.message}</div>
              )}

              <label className="formLabel">Provider Full-Name</label>
              <Input
                onChange={this.handleChange}
                className={
                  this.state.formError &&
                    this.state.formError.FullName &&
                    this.state.formError.FullName.status
                    ? ""
                    : "inputs-error"
                }
                type="text"
                name="provider_fullname"
                placeholder=" provider name"
                value={this.state.provider_fullname}
                prefix={<UserOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
              />
              {this.state.formError &&
                this.state.formError.FullName &&
                this.state.formError.FullName.status ? (
                <></>
              ) : (
                <div className="error-text">
                  {this.state.formError.FullName.massage}
                </div>
              )}
              <label className="formLabel">Provider Phone</label>
              <Input
                onChange={this.handleChange}
                className={
                  this.state.formError &&
                    this.state.formError.Phone &&
                    this.state.formError.Phone.status
                    ? ""
                    : "inputs-error"
                }
                type="text"
                name="provider_phone"
                placeholder="123 456 0789"
                value={this.state.provider_phone}
                prefix={"+1"}
              />
              {this.state.formError &&
                this.state.formError.Phone &&
                this.state.formError.Phone.status ? (
                <></>
              ) : (
                <div className="error-text">
                  {this.state.formError.Phone.massage}
                </div>
              )}
              <label className="formLabel">Provider Address</label>
              <Input
                onChange={this.handleChange}
                className={
                  this.state.formError &&
                    this.state.formError.address_line1 &&
                    this.state.formError.address_line1.status
                    ? ""
                    : "inputs-error"
                }
                type="text"
                name="address_line1"
                placeholder="581 wfi street"
                value={this.state.address_line1}
                prefix={<HomeOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
              />
              {this.state.formError &&
                this.state.formError.address_line1 &&
                this.state.formError.address_line1.status ? (
                <></>
              ) : (
                <div className="error-text">
                  {this.state.formError.address_line1.massage}
                </div>
              )}
              <label className="formLabel">City</label>
              <Input
                onChange={this.handleChange}
                className={
                  this.state.formError &&
                    this.state.formError.city &&
                    this.state.formError.city.status
                    ? ""
                    : "inputs-error"
                }
                type="text"
                name="city"
                placeholder="London"
                value={this.state.city}
                prefix={<EnvironmentOutlined style={{ color: "rgba(0,0,0,.25)" }} />} />
              {this.state.formError &&
                this.state.formError.city &&
                this.state.formError.city.status ? (
                <></>
              ) : (
                <div className="error-text">
                  {this.state.formError.city.massage}
                </div>
              )}
              <label className="formLabel">Birth Date</label>
              <DatePicker
                name="birthdate"
                placeholder="Choose date"
                className={
                  this.state.formError &&
                    this.state.formError.birthdate &&
                    this.state.formError.birthdate.status
                    ? "w100p"
                    : "inputs-error w100p"
                }
                htmlType="submit"
                onChange={this.handleBirthDateChange}
                value={this.state.patient_birth_Date}
              />
              {this.state.formError &&
                this.state.formError.birthdate &&
                this.state.formError.birthdate.status ? (
                <></>
              ) : (
                <div className="error-text">
                  {this.state.formError && this.state.formError.birthdate
                    ? this.state.formError.birthdate.massage
                    : ""}
                </div>
              )}

              <label className="formLabel">Provider Email</label>
              <Input
                onChange={this.handleChange}
                className={
                  this.state.formError &&
                    this.state.formError.Email &&
                    this.state.formError.Email.status
                    ? ""
                    : "inputs-error"
                }
                name="provider_email"
                type="email"
                autoComplete="email"
                placeholder="example@email.com"
                value={this.state.provider_email}
                prefix={<MailOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
              />
              {this.state.formError &&
                this.state.formError.Email &&
                this.state.formError.Email.status ? (
                <></>
              ) : (
                <div className="error-text">
                  {this.state.formError.Email.massage}
                </div>
              )}
              <label className="formLabel">Appointment Type</label>
              {this.state.office_services.length > 0 ? (
                <Select
                  className={
                    this.state.formError &&
                      this.state.formError.Type &&
                      this.state.formError.Type.status
                      ? "inputs w100p"
                      : "inputs-error w100p"
                  }
                  mode="multiple"
                  placeholder="Select Appointment"
                  defaultValue={[]}
                  value={this.state.appt_types}
                  onChange={(event, value) => {
                    var temp = [];
                    for (var i in value) {
                      temp.push(value[i].key);
                    }

                    this.setState({ appt_types_id: temp });

                    this.handleChangeAppointmentType(event);
                  }}
                >
                  {this.state.office_services.length > 0 ? (
                    this.state.office_services.map((service) => (
                      <Option key={service.id} value={service.service}>
                        {service.service}
                      </Option>
                    ))
                  ) : (
                    <Option key={0}></Option>
                  )}
                </Select>
              ) : (
                <p className="cr">
                  *There isn't any appointment type for your office,
                  <br />
                  Please create some appointment type.
                </p>
              )}

              {this.state.formError &&
                this.state.formError.Type &&
                this.state.formError.Type.status ? (
                <></>
              ) : (
                <div className="error-text">
                  {this.state.formError.Type.massage}
                </div>
              )}
              <label className="formLabel">Operatories</label>
              <Select
                mode="multiple"
                className="w100p"
                placeholder="Select Operatories"
                defaultValue={[]}
                onChange={this.handleChange}
                disabled={true}
              >
                {this.state.operatories}
              </Select>

              <label className="formLabel">Provider Specialty</label>
              <Radio.Group
                name="provider_specialty"
                value={this.state.provider_specialty}
                onChange={this.handleChange}
              >
                <Radio value="Dental Hygienist">Dental Hygienist</Radio>
                <Radio value="General Dentist">General Dentist</Radio>
              </Radio.Group>
              {this.state.formError &&
                this.state.formError.Specialty &&
                this.state.formError.Specialty.status ? (
                <></>
              ) : (
                <div className="error-text">
                  {this.state.formError.Specialty.massage}
                </div>
              )}
              <label className="formLabel">Provider Image</label>
              {this.state.formError &&
                this.state.formError.Image &&
                this.state.formError.Image.status ? (
                <></>
              ) : (
                <div className="error-text">
                  {this.state.formError.Image.massage}
                </div>
              )}
              <div
                className={
                  this.state.formError &&
                    this.state.formError.Image &&
                    this.state.formError.Image.status
                    ? "inputs mb50"
                    : "inputs-error mb50"
                }
              >
                <input
                  accept="image/png, image/jpeg"
                  onChange={(e) => this.handleUpload(e)}
                  id="inputImageFile"
                  type="file"
                  name="file"
                />
              </div>
              <div className="tac">
                {this.state.provider_image ? (
                  <img
                    width="150"
                    height="100"
                    alt="avatar"
                    src={URL.createObjectURL(this.state.provider_image)}
                  />
                ) : (
                  <></>
                )}
              </div>

              <div className="btnBox df">
                <button
                  onClick={this.handleSubmit}
                  className="createBtn fullWidth100p"
                  type="submit"
                  disabled={this.state.sending_data}
                >
                  {this.state.sending_data ? "Sending ..." : "Send"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }
}

function mapStateToProps(state) {
  const { creating, error } = state.paymentRequest;
  const { profileSummary } = state.dashboard;
  return {
    creating,
    error,
    profileSummary,
  };
}

const connectedAddProvider = connect(mapStateToProps)(AddProvider);

export default connectedAddProvider;
