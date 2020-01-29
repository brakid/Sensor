import React from 'react';
import PropTypes from 'prop-types';
import { useQuery } from '@apollo/react-hooks';
import { gql } from 'apollo-boost';
import { Switch, Route } from 'react-router-dom';
import SensorsPane from './SensorsPane';
import SensorPane from './SensorPane';
import { setSensors } from '../state/actions';
import { connect } from 'react-redux';
import { UserType } from '../propy-types';
import { getAuthorizationContext, getError } from '../utils';

const GET_SENSORS = gql`
  query {
    sensors {
      id: identifier
      name
      username
    }
  }
`;
/*
  query ($userName: String!) {
    sensors(userName: $userName) {
      edges {
        node {
          id
          name
        }
      }
    }
  }
`;*/

const InnerUserPane = ({ user, loadSensors }) => {
  const { username } = user;
  const { loading, error, data } = 
    useQuery(
      GET_SENSORS, 
      { 
        variables: { userName: username }, 
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

  const { sensors } = data;

  loadSensors(sensors);

  return (
    <div>
      <SensorsPane />
      <Switch>
        <Route path='/sensors/:sensorId' component={ SensorPane } />
        <Route path='/' />
      </Switch>
    </div>
  );
};

InnerUserPane.propTypes = {
  user: UserType,
  loadSensors: PropTypes.func
};

const mapStateToProps = (state) => ({
  user: state.user
});

const mapDispatchToProps = (dispatch) => ({
    loadSensors: (sensors) => dispatch(setSensors(sensors))
});

const UserPane = connect(
  mapStateToProps,
  mapDispatchToProps
)(InnerUserPane);

export default UserPane;