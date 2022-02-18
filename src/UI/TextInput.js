import React from 'react';
import { useField } from 'formik';
import styled from 'styled-components';

const StyledErrorMessage = styled.div`
  font-size: 12px;
  color: #e03131;
  margin-bottom: 5px;
  font-weight: 500;
`;

const TextInput = ({ children, ...props }) => {
  const [field, meta] = useField(props);

  return (
    <React.Fragment>
      <input
        className={
          meta.touched && meta.error ? 'login__input invalid' : 'login__input'
        }
        {...field}
        {...props}
      />{' '}
      {meta.touched && meta.error ? (
        <StyledErrorMessage>{meta.error}</StyledErrorMessage>
      ) : null}
    </React.Fragment>
  );
};

export default TextInput;
