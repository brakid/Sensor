import PropTypes from 'prop-types';

export const SensorType = PropTypes.shape({
  id: PropTypes.string,
  name: PropTypes.string,
  values: PropTypes.array
});

export const SensorValueType = PropTypes.shape({
  timestamp: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired
});

export const UserType = PropTypes.shape({
  id: PropTypes.string,
  name: PropTypes.string,
  passwordHash: PropTypes.string,
  token: PropTypes.string
});