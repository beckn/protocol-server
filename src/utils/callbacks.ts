import axios from "axios";

export async function successCallback(requestBody: any) {
    try {
        await axios.post(process.env.successUrl!, requestBody);
    } catch (error) {
        throw error;
    }
}

export async function failureCallback(requestBody: any) {
    try {
        await axios.post(process.env.failureUrl!, requestBody)
    } catch (error) {
        throw error;
    }
}