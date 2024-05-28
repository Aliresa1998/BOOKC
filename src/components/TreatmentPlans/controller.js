import config from "../../config";
import { statusHandeling } from "../../statusHandeling";

function authHeader() {
    let user = JSON.parse(localStorage.getItem("user"));
    if (user) {
        if (user.key) {
            return { Authorization: "Token  " + user.key };
        } else {
            return {};
        }
    } else {
        return {};
    }
}


const getMemberList = async (page) => {
    const myHeaders = Object.assign(
        { "Content-Type": "application/json" },
        authHeader()
    );

    const req = new Request(
        config.apiGateway.URL + "/clinics/patient-list/?page=" + page + "&office_id=" + localStorage.getItem("selectedOffice"),
        {
            method: "GET",
            headers: myHeaders,
        }

    );
    const response = await fetch(req);
    const json = await response.json();
    const res = {
        json: json,
        status: response.status,
        message: response.message,
    };

    return res;
};







const postNoteAndImage = async (formData) => {
    const myHeaders = {
        ...authHeader(),
    };

    const req = new Request(
        config.apiGateway.URL + "/clinics/treatment-plan-bulk-update/",
        {
            method: "POST",
            headers: myHeaders,
            body: formData
        }
    );

    const response = await fetch(req);
    const json = await response.json();
    return {
        json: json,
        status: response.status,
        message: response.message,
    };
};


const createTreatmentPlans = async (data) => {
    const { name, patient, description, priority, procedure } = data
    const myHeaders = {
        "Content-Type": "application/json",
        ...authHeader()
    };

    const stringifiedFields = JSON.stringify({
        name,
        patient,
        description,
        priority,
    });

    const requestBody = JSON.parse(stringifiedFields);
    requestBody.procedure = procedure;

    const response = await fetch(config.apiGateway.URL + "/clinics/create-treatmentplan/?office_id=" + localStorage.getItem("selectedOffice"), {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify(requestBody)
    });
    const json = await response.json();
    return {
        json: json,
        status: response.status,
        message: "Success"
    };

};


const getTreatmentPlans = async (page, ApprovStatus) => {
    const myHeaders = Object.assign(
        { "Content-Type": "application/json" },
        authHeader()
    );

    const req = new Request(
        config.apiGateway.URL + "/clinics/list-treatmentplan-by-patient/?page=" + page +
        "&filtering=" + ApprovStatus +
        "&office_id=" + localStorage.getItem("selectedOffice"),
        {
            method: "GET",
            headers: myHeaders,
        }

    );
    const response = await fetch(req);
    const json = await response.json();
    const res = {
        json: json,
        status: response.status,
        message: response.message,
    };

    return res;
};


const getTreatmentModal = async (page, patient_id) => {
    const myHeaders = Object.assign(
        { "Content-Type": "application/json" },
        authHeader()
    );

    const req = new Request(
        config.apiGateway.URL + "/clinics/list-treatmentplan-by-patient/?page=" + page + "&patient_id=" + patient_id + "&office_id=" + localStorage.getItem("selectedOffice"),
        {
            method: "GET",
            headers: myHeaders,
        }

    );
    const response = await fetch(req);
    const json = await response.json();
    const res = {
        json: json,
        status: response.status,
        message: response.message,
    };

    return res;
};



const UpdateTreatmentPlans = async (id, data) => {
    const { description, priority } = data
    const myHeaders = Object.assign(
        { "Content-Type": "application/json" },
        authHeader()
    );

    const stringifiedFields = JSON.stringify({
        description,
        priority,
    });

    const requestBody = JSON.parse(stringifiedFields);
    requestBody.procedure = priority;
    const officeId = localStorage.getItem("selectedOffice");
    const req = new Request(
        `${config.apiGateway.URL}/clinics/treatmentplan-rud/${id}/?office_id=${officeId}`,
        {
            body: JSON.stringify(requestBody),
            method: "PATCH",
            headers: myHeaders,
        }
    );

    const response = await fetch(req);
    const json = await response.json();
    const res = {
        json: json,
        status: response.status,
        message: response.message,
    };

    return res;
};


const RemoveTreatmentPlans = async (id) => {
    const myHeaders = Object.assign(authHeader());
    var url = "";
    url =
        config.apiGateway.URL +
        "/clinics/treatmentplan-rud/" +
        id + "/"  + "?office_id=" + localStorage.getItem("selectedOffice") 

    const req = new Request(url, {
        method: "DELETE",
        headers: myHeaders,
    });

    const response = await fetch(req);

    if (response.status > 250) {
        const json = await response.json();
        const res = {
            json: json,
            status: response.status,
            message: response.message,
        };

        statusHandeling.statusCodeHandeling(res.status);
        return res;
    } else {
        const res = {
            json: { message: "succssfull" },
            status: 204,
            message: "Treatment plan deleted successfully",
        };

        statusHandeling.statusCodeHandeling(res.status);
        return res;
    }
};

const getProcedure = async (page, procedureCode) => {
    const myHeaders = Object.assign(
        { "Content-Type": "application/json" },
        authHeader()
    );

    let url = config.apiGateway.URL + "/clinics/procedure-lc/?page=" + page + "&office_id=" + localStorage.getItem("selectedOffice");

    if (procedureCode) {
        url += "&procedure_code=" + procedureCode;
    }

    const req = new Request(
        url,
        {
            method: "GET",
            headers: myHeaders,
        }

    );
    const response = await fetch(req);
    const json = await response.json();
    const res = {
        json: json,
        status: response.status,
        message: response.message,
    };

    return res;
};




export const controller = {
    getTreatmentPlans,
    createTreatmentPlans,
    UpdateTreatmentPlans,
    RemoveTreatmentPlans,
    getProcedure,
    postNoteAndImage,
    getMemberList,
    getTreatmentModal
};
