import React from 'react';
import PropTypes from 'prop-types';
import { UserType } from '../propy-types';
import { login, logout } from '../state/actions';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import LoginForm from './LoginForm.jsx';

const InnerLoginPane = ({ user, login, logout }) => {
  if (!user) {
    return (<LoginForm login={ login } />);
  } else {
    const { username } = user;
    return (
      <div className='row grid space'>
        <div className='left'>
          <span className='login'>Logged in as: { username }</span>
        </div>
        <div className='right'>
          <Link className='link' to='/' onClick={ (e) => logout() }>Logout</Link>
        </div>
      </div>
    );
  }
};

InnerLoginPane.propTypes = {
  user: UserType,
  login: PropTypes.func,
  logout: PropTypes.func
};

const mapStateToProps = (state) => ({
  user: state.user
});

const mapDispatchToProps = (dispatch) => ({
  login: (username, passwordHash) => dispatch(login(username, passwordHash)),
  logout: () => dispatch(logout())
});

const LoginPane = connect(
  mapStateToProps,
  mapDispatchToProps
)(InnerLoginPane);

export default LoginPane;