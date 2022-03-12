import React, { useEffect, useState } from 'react';
import './Auth.css';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import TextInput from '../UI/TextInput';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Outlet } from 'react-router-dom';
import { login } from '../slices/authThunks';
import { authorizedUser } from '../slices/authSlice';
import LoadingSpinner from '../UI/LoadingSpinner';
import ErrorModal from '../UI/ErrorModal';

const Login = props => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isLoggedIn = useSelector(state => state.auth.isLoggedIn);
  const authUser = useSelector(authorizedUser);
  const status = useSelector(state => state.auth.status);
  const errorMessage = useSelector(state => state.auth.errorMessage);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isLoggedIn) {
      navigate(`${authUser._id}/profile`);
    }
  }, [authUser, isLoggedIn, navigate]);

  const handleError = () => {
    setError(false);
  };

  if (status === 'pending') {
    return <LoadingSpinner asOverlay />;
  }

  if (error) {
    return <ErrorModal error={errorMessage} onClear={handleError} />;
  }

  return (
    <div className="auth">
      <div className="auth__wrapper">
        <div className="auth__left">
          <h3>Mad Chatter</h3>
          <span>Connect. Make Friends. Go Crazy. Be Yourself.</span>
        </div>
        <div className="auth__right">
          <Formik
            initialValues={{
              email: '',
              password: '',
            }}
            validationSchema={Yup.object({
              email: Yup.string()
                .email('Invalid email address')
                .required('Required'),
              password: Yup.string()
                .min(8, 'Password must be at least 8 characters')
                .max(20, 'Password cannot be longer than 20 characters'),
            })}
            onSubmit={async values => {
              await dispatch(login(values))
                .unwrap()
                .then(data => {
                  navigate(`${data.user._id}/profile`, { replace: true });
                })
                .catch(rejectedValue => {
                  console.log(rejectedValue);
                  setError(true);
                });
            }}
          >
            <Form className="auth__form">
              <TextInput
                name="email"
                id="email"
                type="email"
                placeholder="Email"
                autoComplete="email"
              />

              <TextInput
                className="login__input"
                name="password"
                id="password"
                type="password"
                placeholder="Password"
                autoComplete="current-password"
              />

              <button className="btn btn__login" type="submit">
                Login
              </button>
              <button
                onClick={props.onSwitch}
                className="btn btn__login"
                type="button"
              >
                Switch to Signup
              </button>
            </Form>
          </Formik>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default Login;
