import axios from "axios";

export async function clientCallback(requestBody: any, isError: boolean) {
    try {
        if(isError){
            if(!requestBody.error){
                throw new Error('Error object is missing.');
            }
        }
        else{
            if(requestBody.error){
                throw new Error("Error object is present even if it's not error callback.");
            }
        }

        await axios.post(process.env.clientUrl!, requestBody);
    } catch (error) {
        throw error;
    }
}
