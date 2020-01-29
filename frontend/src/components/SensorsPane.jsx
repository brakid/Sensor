import React from 'react';
import PropTypes from 'prop-types';
import { SensorType } from '../propy-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import ActiveLink from '../routing/ActiveLink';

const InnerSensorsPane = ({ sensors, selectedSensor }) => {
  console.log(JSON.stringify(sensors));
  return (
    <section className='row grid'>
      <ul className='center selector'>
        <h2 className='center'>Sensors:</h2>
        { sensors && sensors.map(({id, name }, index) => (
          <li key={ index }>
            <ActiveLink to={ `/sensors/${id}` } className='button' activeClass={ selectedSensor && selectedSensor.id === id ? 'active' : '' } >{ name }</ActiveLink>
          </li>
        )) }
      </ul>
    </section>
  );
};

InnerSensorsPane.propTypes = {
  sensors: PropTypes.arrayOf(SensorType),
  selectedSensor: SensorType,
  linkBase: PropTypes.string
};

const mapStateToProps = (state) => ({
  sensors: state.sensors,
  selectedSensor: state.selectedSensor
});

const SensorsPane = withRouter(connect(
  mapStateToProps
)(InnerSensorsPane));

export default SensorsPane;