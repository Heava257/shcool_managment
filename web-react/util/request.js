import axios from 'axios'
import config from './config'
import { profileStore } from '../src/store/profileStore'

export const request = (url = "", method = "", data = {}) => {
  let { access_token } = profileStore.getState();
  
  let headers = {
    "Content-Type": "application/json",
  };
  
  if (data instanceof FormData) {
    headers = {
      "Content-Type": "multipart/form-data",
    }
  }
  
  // Only add Authorization header for protected routes (not auth/register, auth/login)
  const isAuthRoute = url.includes('auth/login') || url.includes('auth/register') || url.includes('auth/verify-otp') || url.includes('auth/resend-otp');
  
  const requestConfig = {
    url: config.base_url + url,
    method: method,
    data: data,
    headers: {
      ...headers,
      Accept: "application/json"
    }
  };
  
  // Add Authorization header only for protected routes
  if (!isAuthRoute && access_token) {
    requestConfig.headers.Authorization = "Bearer " + access_token;
  }
  
  return axios(requestConfig)
  .then((res) => { 
    // Laravel returns data in res.data
    return res.data;
  })
  .catch((err) => {
    if (err.response) {
      const status = err.response.status;
      const statusText = err.response.statusText;
      const responseData = err.response.data;
      
      console.error(`API Error [${status}]:`, responseData);
      
      // ✅ For Laravel, don't throw on validation errors, return the error object
      if (status === 422 && responseData.errors) {
        return {
          error: true,
          message: responseData.message || 'Validation error',
          errors: responseData.errors
        };
      }
      
      // ✅ For 401 Unauthorized (Invalid credentials)
      if (status === 401) {
        return {
          error: true,
          message: responseData.message || 'Invalid credentials'
        };
      }
      
      // ✅ For 403 Forbidden (Email verification required)
      if (status === 403) {
        // Laravel returns this for unverified users
        return responseData; // Return full data (includes requires_verification flag)
      }
      
      // ✅ For 400 Bad Request
      if (status === 400) {
        return {
          error: true,
          message: responseData.message || 'Invalid request. Please check your input.'
        };
      }
      
      // ✅ For other errors, throw with message
      const errorMessage = responseData?.message || statusText || `Request failed with status ${status}`;
      
      throw new Error(errorMessage);
      
    } else if (err.request) {
      console.error('No response received:', err.request);
      throw new Error('No response from server. Check your internet connection.');
    } else {
      console.error('Request setup error:', err.message);
      throw new Error('Failed to make request: ' + err.message);
    }
  })
}