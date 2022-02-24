import React, { useEffect, useState } from 'react';
import { Form, Formik } from 'formik';
import TextInput from '../UI/TextInput';
import { useSelector, useDispatch } from 'react-redux';
import { register } from '../slices/authThunks';
import * as Yup from 'yup';
import './Auth.css';
import { Outlet, useNavigate } from 'react-router-dom';
import ErrorModal from '../UI/ErrorModal';
import LoadingSpinner from '../UI/LoadingSpinner';

const Register = props => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const authUser = useSelector(state => state.auth.user);
  const { isLoggedIn } = useSelector(state => state.auth);
  const { status } = useSelector(state => state.auth);
  const { errorMessage } = useSelector(state => state.auth);

  const handleError = () => {
    setError(false);
  };

  useEffect(() => {
    if (isLoggedIn) {
      navigate(`${authUser._id}/profile`);
    }
  }, [isLoggedIn, authUser, navigate]);

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
              firstName: '',
              lastName: '',
              email: '',
              password: '',
              passwordConfirm: '',
              city: '',
              state: '',
              zip: '',
              birthYear: '',
            }}
            validationSchema={Yup.object({
              firstName: Yup.string()
                .max(20, 'Must be 20 characters or less')
                .min(2, 'Must be more than 2 characters')
                .required('Required'),
              lastName: Yup.string()
                .max(25, 'Must be 25 characters or less')
                .min(2, 'Must be more than 2 characters')
                .required('Required'),
              email: Yup.string()
                .email('Invalid email address')
                .required('Required'),
              password: Yup.string()
                .required('Password is required')
                .length(8, 'Password must be at least 8 characters'),
              passwordConfirm: Yup.string().oneOf(
                [Yup.ref('password'), null],
                'Passwords must match'
              ),
              city: Yup.string()
                .min(2, 'City must be 2 characters or more')
                .required('A city is required')
                .matches(/[A-Za-z]/g, {
                  message: 'A city can only contain alphabetical characters',
                  excludeEmptyString: true,
                })
                .trim(),
              state: Yup.string()
                .length(2, 'State abbreviations only. Ex: Ohio = "OH"')
                .matches(/[A-Za-z]/g, {
                  message: 'A city can only contain alphabetical characters',
                })
                .trim()
                .uppercase(),
              zip: Yup.number().min(5, 'A zip code must be 5 digits'),

              birthYear: Yup.number().min(4, 'A birthyear must be 4 digits'),
            })}
            onSubmit={async values => {
              await dispatch(register(values))
                .unwrap()
                .then(data => {
                  navigate(`${data.user._id}/profile`);
                })
                .catch(rejectedValue => {
                  console.log(rejectedValue);
                  setError(true);
                });
            }}
          >
            <Form className="auth__form">
              <TextInput
                className="login__input"
                name="firstName"
                id="firstName"
                type="text"
                placeholder="First Name"
                autoComplete="given-name"
              />
              <TextInput
                className="login__input"
                name="lastName"
                id="lastName"
                type="text"
                placeholder="Last Name"
                autoComplete="family-name"
              />

              <TextInput
                className="login__input"
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
                autoComplete="new-password"
              />

              <TextInput
                className="login__input"
                name="passwordConfirm"
                id="passwordConfirm"
                type="password"
                placeholder="Confirm Password"
                autoComplete="new-password"
              />
              <TextInput
                className="login__input"
                id="city"
                name="city"
                type="text"
                placeholder="City"
              />
              <TextInput
                className="login__input"
                id="state"
                name="state"
                type="text"
                placeholder="State"
              />
              <TextInput
                className="login__input"
                id="zip"
                name="zip"
                type="number"
                placeholder="Zip"
              />
              <TextInput
                className="login__input"
                id="birthYear"
                name="birthYear"
                placeholder="Birth Year"
                type="number"
              />

              <button className="btn btn__login" type="submit">
                Sign Up
              </button>
              <button
                onClick={props.onSwitch}
                className="btn btn__login"
                type="button"
              >
                Switch to Login
              </button>
            </Form>
          </Formik>

          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Register;
