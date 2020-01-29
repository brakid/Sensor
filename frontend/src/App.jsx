import React from 'react';
import ApolloClient from 'apollo-boost';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloProvider } from '@apollo/react-hooks';
import { BrowserRouter } from 'react-router-dom';
import MainPane from './components/MainPane.jsx';
import { backendUrl } from './constants';
import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { reducer } from './state/reducer';
import { Provider } from 'react-redux';
import { getToken } from './state/tokenCache';
import { loginUsingToken } from './state/actions';

const store = createStore(reducer, applyMiddleware(thunkMiddleware));

const client = new ApolloClient({
  cache: new InMemoryCache(),
  uri: backendUrl + '/api/v1/graphql'
});

class App extends React.Component {
  componentDidMount() {
    const token = getToken();

    if (token) {
      store.dispatch(loginUsingToken(token));
    }
  }

  render() {
    console.log('Backend URL: ' + backendUrl);

    return (
      <Provider store={ store }>
        <BrowserRouter>
          <ApolloProvider client={ client }>
            <MainPane />
          </ApolloProvider>
        </BrowserRouter>
      </Provider>
    );
  }
};

export default App;