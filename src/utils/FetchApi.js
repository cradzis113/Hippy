import axios from 'axios';

const fetchAPI = async (url, method = 'GET', data = null, headers = {}, withCredentials = false) => {
    try {
        const options = {
            url,
            method,
            headers,
            withCredentials,
        };

        if (data) {
            options.data = data;
        }

        const response = await axios(options);
        return response;
    } catch (error) {
        throw error;
    }
};

export default fetchAPI;
