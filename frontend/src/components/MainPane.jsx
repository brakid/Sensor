import React from 'react';
import UserPane from './UserPane.jsx';
import LoginPane from './LoginPane.jsx';
import { connect } from 'react-redux';
import { UserType } from '../propy-types';
import { getError } from '../utils';

const InnerMainPane = ({ user, error }) => {
  const isLoggedIn = user ? true : false;

  console.log('Is logged in: ' + JSON.stringify(user));

  return (
    <div className='container'>
      { error && getError(error) }
      <LoginPane />
      { isLoggedIn ? <UserPane /> : null }
    </div>
  );
};

InnerMainPane.propTypes = {
  user: UserType
};

const mapStateToProps = (state) => ({
  user: state.user,
  error: state.error
});

const MainPane = connect(
  mapStateToProps
)(InnerMainPane);

export default MainPane;