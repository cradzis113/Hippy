import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import fetchAPI from '../utils/FetchApi';

const UseAuth = () => {
  const [email, setEmail] = useState('');
  const [responseMessage, setResponseMessage] = useState('');
  const [responseStatus, setResponseStatus] = useState(null);
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const [invalidMessage, setInvalidMessage] = useState('')
  const { login, setUserData } = useAuth()

  const sendVerificationCode = async () => {
    try {
      const response = await fetchAPI('http://localhost:3001/api/getcode', 'POST', { email });
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
    try {
      const response = await fetchAPI('http://localhost:3001/api/auth', 'POST', { code, email }, null, true);
      if (response.status === 201) {
        login();
        window.location.reload();
        // setUserData(response);
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
