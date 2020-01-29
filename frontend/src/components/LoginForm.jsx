import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { getPasswordHash } from '../utils';

const LoginForm = ({ login }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className='row grid'>
      <div className='row center'>
        <label htmlFor='username'>Username:</label>
        <input id='username' type='text' value={ username } onChange={ (event) => setUsername(event.target.value) } />
      </div>
      <div className='row center'>
        <label htmlFor='password'>Password:</label>
        <input id='password' type='password' value={ password } onChange={ (event) => setPassword(event.target.value) } />
      </div>
      <div className='row center'>
        <a href='#' className='button' onClick={ (e) => login(username, getPasswordHash(password)) }>Login</a>
      </div>
    </div>
  );
};

LoginForm.propTypes = {
  login: PropTypes.func
}

export default LoginForm;