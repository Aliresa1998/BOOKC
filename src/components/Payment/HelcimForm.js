import React, { useState, useEffect } from 'react';
import { Input, Button } from 'antd';
import config from '../../config';
const helcimResponse = (e) => {
    console.log(e)
    return (
        <>hi</>
    )
}

const PaymentForm = (props) => {
    const [cardToken, setCardToken] = useState('1');
    const [cardNumber, setCardNumber] = useState('');
    const [cardExpiryMonth, setCardExpiryMonth] = useState('');
    const [cardExpiryYear, setCardExpiryYear] = useState('');
    const [cardCVV, setCardCVV] = useState('');
    const [customerCode, setCustomerCode] = useState('');
    const [cardHolderName, setCardHolderName] = useState('');
    const [cardHolderAddress, setCardHolderAddress] = useState('');
    const [cardHolderPostalCode, setCardHolderPostalCode] = useState('');
    const [amount, setAmount] = useState("0.00");
    const [userIp, setUserIp] = useState("")
    const [loading, setLoading] = useState(false)
    const [grecaptcha, setGrecaptcha] = useState("")
    useEffect(() => {
        // console.log(sessionStorage.getItem("GoogleRecaptcha"))
        // if (document.getElementById('g-recaptcha-response')) {
        //     setGrecaptcha(sessionStorage.getItem("GoogleRecaptcha"))
        // }

        const script = document.createElement('script');
        script.src = "https://www.google.com/recaptcha/api.js?render=" + config.googleCaptch.code;
        script.async = true;
        document.body.appendChild(script);

        script.onload = () => {
            window.grecaptcha.ready(() => {
                window.grecaptcha.execute(config.googleCaptch.code, { action: 'helcimJSCheckout' })
                    .then(token => {
                        setGrecaptcha(token);
                    });
            });
        };


        let intervalId;
        intervalId = setInterval(() => {
            const script = document.createElement('script');
            script.src = "https://www.google.com/recaptcha/api.js?render=" + config.googleCaptch.code;
            script.async = true;
            document.body.appendChild(script);

            script.onload = () => {
                window.grecaptcha.ready(() => {
                    window.grecaptcha.execute(config.googleCaptch.code, { action: 'helcimJSCheckout' })
                        .then(token => {
                            setGrecaptcha(token);
                        });
                });
            };

            return () => {
                document.body.removeChild(script);
            };
        }, 20000);

        return () => {
            clearInterval(intervalId);
        };


    }, []);
    const handleProcessClick = async (e) => {
        // Handle the processing logic here
        setLoading(true)
        e.preventDefault();
        console.log(e)
        window.helcimProcess()


        try {
            // Your processing logic goes here

            // Access the result element using the ref
            const resultElement = resultRef.current;

            if (resultElement) {
                // Get the text content from the result element
                const resultText = resultElement.textContent;

                // Log the result text to the console
                console.log('Result Text:', resultText);
            } else {
                console.error('Result element not found');
            }
            setLoading(false)
        } catch (error) {
            console.error('Error processing payment:', error);
            setLoading(false)
        }

    };

    const handleReadDataIP = async () => {

        try {
            const ipResponse = await fetch('https://api.ipify.org?format=json');
            const ipData = await ipResponse.json();
            const userIp0 = ipData.ip;

            console.log(userIp0)
            setUserIp(userIp0)
            // Handle response from your backend

        } catch (error) {
            console.error('Error fetching IP address:', error);
        }
    };

    React.useState(() => {
        handleReadDataIP();
    }, [])

    React.useState(() => {
        handleReadDataIP()
        console.log(props.helcimConfig)
    }, [props.helcimConfig])

    const resultRef = React.useRef();


    const handleSubmit = async (e) => {
        e.preventDefault();
        window.helcimProcess();
        try {
            // Your processing logic goes here

            // Access the result element using the ref
            const resultElement = resultRef.current;

            if (resultElement) {
                // Get the text content from the result element
                const resultText = resultElement.textContent;

                // Log the result text to the console
                console.log('Result Text:', resultText);
            } else {
                console.error('Result element not found');
            }
        } catch (error) {
            console.error('Error processing payment:', error);
        }
    };
    function search(formData) {
        const query = formData.get("query");
        alert(`You searched for '${query}'`);
    }

    return (
        <div className=''>

            <form
                onSubmit={handleProcessClick}
                name="helcimForm"
                id="helcimForm"
                action={helcimResponse}
            >
                <input type="hidden" id="token"
                    value={props.helcimConfig.token}
                />
                <input type="hidden" id="language" value="en" />

                {/*<input type="hidden" id="test" value="1" /> */}

                {/* CARD-INFORMATION */}
                {/*
                    <Input
                    type="hidden"
                    id="cardToken"
                    value={""}
                    onChange={(e) => setCardToken(e.target.value)}
                    placeholder="Card Token"
                /> */}


                <Input
                    id="customerCode"
                    type="hidden"
                    value={props.helcimConfig.customerCode}
                    //onChange={(e) => setCardToken(e.target.value)}
                    placeholder="Card Token"
                />




                <div className='mt8'>
                    <label htmlFor="cardNumber">Credit Card Number:</label>
                    <Input
                        id="cardNumber"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="Credit Card Number"
                    />
                </div>

                <div className='mt8'>
                    <label htmlFor="cardExpiryMonth">Expiry Month:</label>
                    <Input
                        id="cardExpiryMonth"
                        value={cardExpiryMonth}
                        onChange={(e) => setCardExpiryMonth(e.target.value)}
                        placeholder="Expiry Month"
                    />
                </div>

                <div className='mt8'>
                    <label htmlFor="cardExpiryYear">Expiry Year:</label>
                    <Input
                        id="cardExpiryYear"
                        value={cardExpiryYear}
                        onChange={(e) => setCardExpiryYear(e.target.value)}
                        placeholder="Expiry Year"
                    />
                </div>

                <div className='mt8'>
                    <label htmlFor="cardCVV">CVV:</label>
                    <Input
                        id="cardCVV"
                        value={cardCVV}
                        onChange={(e) => setCardCVV(e.target.value)}
                        placeholder="CVV"
                    />
                </div>

                {/* AVS- INFORMATION */}
                <div className='mt8'>
                    <label htmlFor="cardHolderName">Card Holder Name:</label>
                    <Input
                        id="cardHolderName"
                        value={cardHolderName}
                        onChange={(e) => setCardHolderName(e.target.value)}
                        placeholder="Card Holder Name"
                    />
                </div>

                <div className='mt8'>
                    <label htmlFor="cardHolderAddress">Card Holder Address:</label>
                    <Input
                        id="cardHolderAddress"
                        value={cardHolderAddress}
                        onChange={(e) => setCardHolderAddress(e.target.value)}
                        placeholder="Card Holder Address"
                    />
                </div>

                <div className='mt8'>
                    <label htmlFor="cardHolderPostalCode">Card Holder Postal Code:</label>
                    <Input
                        id="cardHolderPostalCode"
                        value={cardHolderPostalCode}
                        onChange={(e) => setCardHolderPostalCode(e.target.value)}
                        placeholder="Card Holder Postal Code"
                    />
                </div>




                <Input
                    type="hidden"
                    id="amount"
                    value={"0.00"}

                    placeholder="Amount"
                />
                <input type="hidden" id="g-recaptcha-response" value={grecaptcha} />

                {/* BUTTON */}
                <div className='mt10'>
                    <Button
                        htmlType="submit"
                        style={{
                            width: "100%",
                            marginTop: "15px"
                        }}
                        type="primary"
                        loading={loading}
                    //onClick={handleProcessClick}
                    >
                        {
                            loading ? "Processing..." : "Process"
                        }

                    </Button>
                </div>

                <div

                    ref={resultRef}
                    id="helcimResults">


                </div>


            </form >

        </div >
        // <>
        //     <Form
        //         layout="vertical"
        //         className="credit-card-form"
        //         onSubmit={handleProcessClick}
        //         action={helcimResponse}
        //     >
        //         <input type="hidden" id="token"
        //             value={props.helcimConfig.token}
        //         />
        //         <input type="hidden" id="language" value="en" />
        //         <input type="hidden" id="test" value="1" />
        //         {/* CARD-INFORMATION */}

        //         <Input
        //             type="hidden"
        //             id="cardToken"
        //             value={""}
        //             onChange={(e) => setCardToken(e.target.value)}
        //             placeholder="Card Token"
        //         />


        //         <Input
        //             id="customerCode"
        //             type="hidden"
        //             value={props.helcimConfig.customerCode}
        //             onChange={(e) => setCardToken(e.target.value)}
        //             placeholder="Card Token"
        //         />
        //         <Row gutter={16}>
        //             <Col span={12}>
        //                 <Form.Item label="Credit Card Number" required>
        //                     <Input
        //                         value={cardNumber}
        //                         onChange={(e) => setCardNumber(e.target.value)}
        //                         style={{ height: 42, border: '1px solid #6B43B5', borderRadius: 8 }}
        //                         placeholder="Enter Credit Card Number"
        //                         suffix={<img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Mastercard-logo.png" alt="MasterCard" style={{ width: '20px' }} />}
        //                     />
        //                 </Form.Item>
        //             </Col>
        //             <Col span={6}>
        //                 <Form.Item label="Expiration" required>
        //                     <Input placeholder="MM / YY" style={{ height: 42, border: '1px solid #6B43B5', borderRadius: 8 }} onChange={(e) => setCardExpiryMonth(e.target.value)} value={cardExpiryMonth} />
        //                 </Form.Item>
        //             </Col>
        //             <Col span={6}>
        //                 <Form.Item label="CVC" required>
        //                     <Input placeholder="Enter CVC" style={{ height: 42, border: '1px solid #6B43B5', borderRadius: 8 }} onChange={(e) => setCardCVV(e.target.value)} value={cardCVV} />
        //                 </Form.Item>
        //             </Col>
        //         </Row>
        //         <Row gutter={16}>
        //             <Col span={12}>
        //                 <Form.Item label="Card Holder Country" required>
        //                     <Select placeholder="Enter Country" style={{ height: 42, border: '1px solid #6B43B5', borderRadius: 6 }}>
        //                         <Option value="usa">USA</Option>
        //                         <Option value="canada">Canada</Option>
        //                         <Option value="uk">UK</Option>
        //                         {/* Add more countries as needed */}
        //                     </Select>
        //                 </Form.Item>
        //             </Col>
        //             <Col span={12}>
        //                 <Form.Item label="Card Holder Postal Code" required>
        //                     <Input placeholder="Enter Postal Code" style={{ height: 42, border: '1px solid #6B43B5', borderRadius: 8 }}
        //                         value={cardHolderPostalCode}
        //                         onChange={(e) => setCardHolderPostalCode(e.target.value)}
        //                     />
        //                 </Form.Item>
        //             </Col>
        //         </Row>
        //     </Form>
        //     <div className='mt10'>
        //         <Button
        //             htmlType="submit"
        //             style={{
        //                 width: "100%",
        //                 marginTop: "15px"
        //             }}
        //             type="primary"
        //             loading={loading}
        //             onClick={handleProcessClick}
        //         >
        //             {
        //                 loading ? "Processing..." : "Pay"
        //             }

        //         </Button>
        //     </div>
        // </>
    );
};

export default PaymentForm;
