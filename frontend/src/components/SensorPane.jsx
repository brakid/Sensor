import React from 'react';
import PropTypes from 'prop-types';
import { UserType, SensorType } from '../propy-types';
import { useQuery } from '@apollo/react-hooks';
import { gql } from 'apollo-boost';
import { useParams, withRouter } from 'react-router-dom';
import { setSelectedSensor } from '../state/actions';
import { connect } from 'react-redux';
import { getAuthorizationContext, getError, getWarning } from '../utils';
import GraphPane from './GraphPane';

const GET_SENSOR = gql`
  query($sensorId: ID!) {
    values(sensorId: $sensorId) {
      type
      timestamp
      value
    }
  }
`;

const InnerSensorPane = ({ user, selectedSensor, selectSensor }) => {
  const { sensorId } = useParams();
  const { loading, error, data } = 
    useQuery(
      GET_SENSOR, 
      { 
        variables: { sensorId },
        ...getAuthorizationContext(user)
      });
  
  if (loading) {
    return (
      <div className='row grid'>
        <div className='loader center' />
      </div>
    );
  }
  if (error) {
    return getError(JSON.stringify(error));
  }

  console.log('Values: ' + JSON.stringify(data));
  const { values } = data;

  if (!selectedSensor || selectedSensor.id !== sensorId) {
    selectSensor(sensorId);
    return getWarning('No sensor found');
  }
  
  const { name, username } = selectedSensor;

  if (username !== user.username) {
    return getWarning('No access: this sensor belongs to another user');
  }

  return (
    <section className='row grid'>
      <div className='center'>
        <h2>Sensor: { name }</h2>
        <GraphPane values={ values } />
      </div>
    </section>
  );
};

InnerSensorPane.propTypes = {
  user: UserType,
  selectedSensor: SensorType,
  selectSensor: PropTypes.func
};

const mapStateToProps = (state) => ({
  user: state.user,
  selectedSensor: state.selectedSensor
});

const mapDispatchToProps = (dispatch) => ({
  selectSensor: (sensorId) => dispatch(setSelectedSensor(sensorId))
});

const SensorPane = withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(InnerSensorPane));

export default SensorPane;