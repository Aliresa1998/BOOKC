import React, { useState, useEffect } from "react";
import PaymentAdminFirstPage from "./PaymentByAdmin/PaymentAdminFirstPage"
const PayByAdmin = ({id}) => {
    return (
        <>
            <PaymentAdminFirstPage paymentId={id} />
        </>
    )
}

export default PayByAdmin;