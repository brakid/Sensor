import { SET_SENSORS, SET_SELECTED_SENSOR, LOGIN, LOGOUT, LOGIN_ERROR, LOGOUT_ERROR } from './actions';

const initialState = {
  user: null,
  sensors: null,
  selectedSensor: null,
  error: null
};

export const reducer = (state = initialState, action) => {
  switch(action.type) {
    case SET_SENSORS:
      return Object.assign({}, state, { sensors: action.sensors });
    case SET_SELECTED_SENSOR:
      return Object.assign({}, state, { selectedSensor: action.selectedSensor });
    case LOGIN:
      return Object.assign({}, state, { user: action.user, error: null });
    case LOGOUT:
      return Object.assign({}, state, { user: null, error: null });
    case LOGIN_ERROR:
    case LOGOUT_ERROR:
      return Object.assign({}, state, { user: null, error: action.error });
    default:
      return state;
  };
};