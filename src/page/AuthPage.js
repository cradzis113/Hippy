import { Box, Button, TextField, Typography } from '@mui/material';
import React from 'react';
import UseAuth from '../hook/UseAuth';

const AuthPage = () => {
  const {
    email,
    invalidMessage,
    responseStatus,
    filterCodeInput,
    responseMessage,
    filterEmailInput,
    validateAndSetEmail,
    sendVerificationCode,
    isButtonEnabled
  } = UseAuth();
  return (
    <>
      {responseStatus ? (
        <>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: 400 }}>
            <Typography variant='h5' gutterBottom fontWeight='bold'>{email}</Typography>
            <Typography variant='body1' textAlign='center'>{responseMessage}</Typography>
          </Box>
          <TextField
            fullWidth
            error={invalidMessage === 'Invalid code' || invalidMessage === 'No tries left' || invalidMessage === 'code has expired'}
            label={invalidMessage ? invalidMessage : 'code'}
            autoComplete='off'
            slotProps={{
              inputLabel: {
                sx: {
                  '&.Mui-focused': {
                    color: invalidMessage ? 'red' : '#2196f3'
                  },
                  '&:hover': {
                    color: invalidMessage ? 'red' : '#2196f3'
                  }
                }
              },
              input: {
                onInput: filterCodeInput,
              }
            }}
            sx={{
              mt: 5,
              '& .MuiOutlinedInput-root': {
                borderRadius: '10px',
                '&:hover fieldset': {
                  borderColor: invalidMessage ? 'red' : '#2196f3',
                },
                '&.Mui-focused fieldset': {
                  borderColor: invalidMessage ? 'red' : '#2196f3',
                },
              },
            }}
          />
        </>
      ) : (
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column', margin: '100px 0', }}>
            <Box
              component='img'
              height={160}
              src='https://upload.wikimedia.org/wikipedia/commons/8/83/Telegram_2019_Logo.svg'
              alt='Telegram Logo'
            />
            <Typography variant='h4' sx={{ mt: 5, fontWeight: 'bold' }}>
              Sign in to Hippy
            </Typography>
            <Typography variant='body1' textAlign='center' mt={1.5}>
              Please confirm your country code <br />
              and enter your phone number.
            </Typography>
            <TextField
              error={responseStatus === false}
              label={responseMessage || 'Email'}
              autoComplete='off'
              fullWidth
              onChange={validateAndSetEmail}
              slotProps={{
                input: {
                  onInput: filterEmailInput,
                }
              }}
              sx={{
                mt: 5,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                  '&:hover fieldset': {
                    borderColor: responseStatus === false ? 'red' : '#2196f3',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: responseStatus === false ? 'red' : '#2196f3',
                  },
                },
              }}
            />
            {isButtonEnabled && (
              <Button
                variant='contained'
                fullWidth
                sx={{ mt: 5, height: 50, borderRadius: 2, bgcolor: '#2196f3' }}
                onClick={sendVerificationCode}
              >
                Next
              </Button>
            )}
            <Button fullWidth variant='text' sx={{ mt: 4, fontWeight: 500, fontSize: 17 }}>
              LOG IN BY QR CODE
            </Button>
          </Box>
        </Box>
      )}
    </>
  );
};

export default AuthPage;
