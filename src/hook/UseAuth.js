import { useState } from 'react';
import fetchAPI from '../utils/FetchApi';
import useAuthStore from '../stores/authStore';

const UseAuth = () => {
  const [email, setEmail] = useState('');
  const [responseMessage, setResponseMessage] = useState('');
  const [responseStatus, setResponseStatus] = useState(null);
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const [invalidMessage, setInvalidMessage] = useState('')
  const setIsAuthenticated = useAuthStore(state => state.setIsAuthenticated)

  const sendVerificationCode = async () => {
    const API_BASE = window.location.protocol === "https:"
      ? import.meta.env.VITE_API_URL_TUNNEL
      : `http://${window.location.hostname}:3001`;

    try {
      const response = await fetchAPI(`${API_BASE}/api/getcode`, 'POST', { email });
      setResponseStatus(response.status);
      setResponseMessage(response.data.message);
    } catch (error) {
      setResponseStatus(error.response.data.status);
      setResponseMessage(error.response.data.message);
      console.error('Error in sendVerificationCode:', error);
    }
  };

  const filterEmailInput = (event) => {
    const value = event.target.value;
    event.target.value = value.replace(/[^a-zA-Z0-9@.]/g, '');
  };

  const validateAndSetEmail = (event) => {
    const value = event.target.value;

    const emailPattern = /^[a-zA-Z0-9]+@gmail\.com$/;
    const localPart = value.split('@')[0];
    const hasLetter = /[a-zA-Z]/.test(localPart);
    setIsButtonEnabled(false);

    if (!emailPattern.test(value) || !hasLetter) {
      return;
    }

    setIsButtonEnabled(true);
    setEmail(value);
  };

  const handleCodeSubmission = async (code, email) => {
    const API_BASE = window.location.protocol === "https:"
      ? import.meta.env.VITE_API_URL_TUNNEL
      : `http://${window.location.hostname}:3001`;


    try {
      const response = await fetchAPI(`${API_BASE}/api/auth`, 'POST', { code, email }, null, true);
      if (response.status === 200 || response.status === 201 || response.data.message === 'Login successful') {
        console.log(response.data);
        localStorage.setItem('token', response.data.token);
        setIsAuthenticated(true);
        // setUserData(response.data); // cái này cho khác domain
        window.location.reload();

      }
    } catch (error) {
      console.error('Error submitting code:', error.message);
      setInvalidMessage(error.response.data.message);
    }
  };

  const filterCodeInput = async (event) => {
    const value = event.target.value;
    const filteredValue = value.replace(/[^0-9]/g, '');

    if (filteredValue.length > 6) {
      event.target.value = filteredValue.slice(0, 6);
    } else {
      event.target.value = filteredValue;
    }

    if (filteredValue.length === 6) {
      handleCodeSubmission(filteredValue, email);
    }
  };

  return {
    email,
    invalidMessage,
    sendVerificationCode,
    validateAndSetEmail,
    filterEmailInput,
    isButtonEnabled,
    responseMessage,
    filterCodeInput,
    responseStatus,
  };
};

export default UseAuth;
