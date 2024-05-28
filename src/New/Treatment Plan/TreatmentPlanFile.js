import { Table, Typography, ConfigProvider } from 'antd';
import React, { useState, useEffect } from 'react';
import {
    Row
} from "antd"
import img1 from "../assets/img/panoramic-x-ray-thegem-blog-default 3 (1).png"
import img2 from "../assets/img/attachment 2.png"
import img3 from "../assets/img/generate-pdf-1 1.png"
import downloadIcon from "../assets/icon/download-icon.png"
import config from '../../config';

const { Text } = Typography;

const DownloadImage = (props) => {
    return (
        <div className='imageFileContainer' >
            <img
                width={200}
                height={130}
                style={{ borderRadius: "8px", border: "1px solid #6B43B5" }}
                alt="file"
                src={props.src}
                className={"mr10"}
            />
            <div className='downloadIconContainer'
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: "5"
                }}
            >
                <a href={props.src} download>
                    <img
                        width={15}
                        height={15}
                        src={downloadIcon}
                        alt="download"
                    />
                </a>
            </div>

        </div>
    )
}

const TreatmentPlanFile = (props) => {

    const [data, setData] = useState(null)

    useEffect(() => {
        if (props.data) {
            setData(props.data)
        }
    }, [props])

    return (
        <ConfigProvider

            theme={{
                token: {
                    colorPrimary: "#983cfc",
                    controlItemBgHover: "#c293ff",
                    colorLink: '#983cfc',
                    borderRadius: "4px"
                },
                components: {

                    Table: {
                        borderRadius: "8px",
                        borderColor: "#eee",
                    },
                },
            }}
        >
            <Typography style={{ fontWeight: 500, fontSize: '16px' }}>
                Files
            </Typography>
            <br />
            <Row>
                {data && data.length > 0 && data.map((item) => (
                    item.images.map((img, index) => (
                        <DownloadImage key={index} src={config.apiGateway.URL + img.image}  />
                    ))
                ))}
            </Row>
        </ConfigProvider>
    );
}

export default TreatmentPlanFile;