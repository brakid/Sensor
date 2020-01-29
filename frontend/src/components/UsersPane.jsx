import React from 'react';
import { useQuery } from '@apollo/react-hooks';
import { gql } from 'apollo-boost';

const GET_USERS = gql`
  query {
    users {
      id
      name
    }
  }
`;

const UsersPane = () => {
  const { loading, error, data } = useQuery(GET_USERS);

  if (loading) {
    return (<p>Loading...</p>);
  }
  if (error) {
    return (<p>Error :(</p>);
  }

  console.log(data);

  return (
    <div>
      Users:
      <ul>
        { data.users.map(({ id, name }, index) => (
          <li key={ index }>
            { id }: { name }
          </li>
        )) }
      </ul>
    </div>
  );
};

export default UsersPane;