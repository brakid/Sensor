import React from 'react';
import { sha256 } from 'js-sha256';

export const getPasswordHash = (password) => {
  return sha256(password);
};

export const getAuthorizationHeader = (token) => {
  return { Authorization: 'Bearer ' + token };
}

export const getAuthorizationContext = (user) => {
  return { context: { headers: getAuthorizationHeader(user.token) } };
}

export const getJsonHeaders = () => {
  return {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };
}

export const getError = (message) => {
  return (
    <div className='row grid'>
      <div className='error center'>
        <b>Error:</b> { message }
      </div>
    </div>
  );
}

export const getWarning = (message) => {
  return (
    <div className='row grid'>
      <div className='warning center'>
        <h2>{ message }</h2>
      </div>
    </div>
  );
}