import axios from "axios";

export async function clientCallback(requestBody: any, isError: boolean) {
    try {
        if((isError)&&(requestBody.error==null)){
            throw new Error('Error object is missing.');
        }

        await axios.post(process.env.clientUrl!, requestBody);
    } catch (error) {
        throw error;
    }
}
