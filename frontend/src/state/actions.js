import { backendUrl } from '../constants';
import { setToken, unsetToken } from './tokenCache';
import { getAuthorizationHeader, getJsonHeaders } from '../utils';

export const SET_SENSORS = 'SET_USERS';
export const SET_SELECTED_SENSOR = 'SET_SELECTED_SENSOR';

const extractJson = (response) => {
  console.log('Response: ' + JSON.stringify(response));
  if (response.ok) {
    return response.json();
  } else {
    return Promise.reject(response.status + ' : ' + response.statusText);
  }
}

export const setSensors = (sensors) => {
  return (dispatch, getState) => {
    if(getState().sensors !== sensors) {
      console.log('Update sensors: ' + JSON.stringify(sensors));
      dispatch({
        type: SET_SENSORS,
        sensors
      });
    }
  };
};

const getSelectedSensor = (sensors, sensorId) => {
  return sensors.find(sensor => sensor.id === sensorId);
};

export const setSelectedSensor = (sensorId) => {
  return (dispatch, getState) => {
    const selectedSensor = getSelectedSensor(getState().sensors, sensorId);

    if (getState().selectedSensor !== selectedSensor) {
      console.log('Update selected sensor: ' + JSON.stringify(selectedSensor));
      dispatch({
        type: SET_SELECTED_SENSOR,
        selectedSensor
      });
    }
  };
};

export const LOGIN = 'LOGIN';
export const LOGOUT = 'LOGOUT';
export const LOGIN_ERROR = 'LOGIN_ERROR';
export const LOGOUT_ERROR = 'LOGOUT_ERROR';

const getLogin = async (username, passwordHash) => {
  const response = await fetch(
    backendUrl + '/api/v1/login',
    {
      method: 'POST',
      headers: {
        ...getJsonHeaders()
      },
      body: JSON.stringify({ 
        username: username,
        passwordhash: passwordHash
      })
    })
  const data = await extractJson(response);
  
  console.log('Data: ' + JSON.stringify(data));
  const isSuccess = data.status === 'success';
  if (isSuccess) {
    return { 
      username: data.username,
      token: data.token
    };
  } else {
    throw data.message;
  }
}

export const login = (username, passwordHash) => {
  return async (dispatch) => {
    try {
      const login = await getLogin(username, passwordHash);

      if (login) {
        console.log('Success: ' + JSON.stringify(login));
        setToken(login.token);
        dispatch({
          type: LOGIN,
          user: login
        });
      }
    } catch(err) {
      console.log('Error: ' + JSON.stringify(err));
      unsetToken();
      dispatch({
        type: LOGIN_ERROR,
        error: JSON.stringify(err)
      });
    }
  };
};

const getLoginUsingToken = async (token) => {
  const response = await fetch(
    backendUrl + '/api/v1/status',
    {
      method: 'GET',
      headers: {
        ...getJsonHeaders(),
        ...getAuthorizationHeader(token)
      }
    });
  const data = await extractJson(response);
  const isSuccess = data.status === 'success' && data.username && data.token;
  if (isSuccess) {
    return { 
      username: data.username,
      token: data.token
    };
  } else {
    throw data.message;
  }
}

export const loginUsingToken = (token) => {
  return async (dispatch) => {
    try {
      const login = await getLoginUsingToken(token);

      if (login) {
        console.log('Success: ' + JSON.stringify(login));
        setToken(login.token);
        dispatch({
          type: LOGIN,
          user: login
        });
      }
    } catch (err) {
      console.log('Error: ' + JSON.stringify(err));
      unsetToken();
      dispatch({
        type: LOGIN_ERROR,
        error: JSON.stringify(err)
      });
    }
  };
};

export const logout = () => {
  return async (dispatch, getState) => {
    if(getState().user !== null) {
      const user = getState().user;

      try {
        const response = await fetch(
          backendUrl + '/api/v1/logout',
          {
            method: 'GET',
            headers: {
              ...getJsonHeaders(),
              ...getAuthorizationHeader(user.token)
            }
          });
        const data = await extractJson(response);
        
        console.log('Successfully logged out: ' + JSON.stringify(data));
        unsetToken();
        dispatch({
          type: LOGOUT
        });
      } catch(err) {
        console.log('Error: ' + JSON.stringify(err));
        unsetToken();
        dispatch({
          type: LOGOUT_ERROR,
          error: JSON.stringify(err)
        });
      }
    }
  };
};