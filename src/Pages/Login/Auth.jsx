import React from "react";
import Header from "../../components/header/DefaultHeader/Header";
import LoadingSpinner from "../../components/UI/LoadingSpinner";
import classes from "./Auth.module.css";
import Button from "../../components/UI/Button";
import { useRef, useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { authActions } from "../../store/index";
import LoadingModal from "../../components/UI/LoadingModal";
import axios from "axios";
import { useCookies } from "react-cookie";
import { FIREBASE_URL } from "../../secret";

const Auth = () => {
  const [cookies, setCookie, removeCookie] = useCookies(["refreshToken"]);
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [formState, setFormState] = useState("login");
  const [enteredId, setEnteredId] = useState("");
  const [enteredPassword, setEnteredPassword] = useState("");
  const [enteredPasswordConfirm, setEnteredPasswordConfirm] = useState("");
  const [idError, setIdError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordConfirmError, setPasswordConfirmError] = useState("");

  const submitHandler = (e) => {
    e.preventDefault();
  };

  const inputCleanUp = () => {
    setEnteredId("");
    setEnteredPassword("");
    setEnteredPasswordConfirm("");
  };

  const errorCleanUp = () => {
    setIdError("");
    setPasswordError("");
    setPasswordConfirmError("");
  };

  const idChangeHandler = (e) => {
    setEnteredId(e.target.value);
    setIdError("");
  };

  const passwordChangeHandler = (e) => {
    setEnteredPassword(e.target.value);
  };

  const passwordConfirmChangeHandler = (e) => {
    setEnteredPasswordConfirm(e.target.value);
  };

  const signupHandler = () => {
    errorCleanUp();
    let isError = false;
    const signup = async () => {
      setIsLoading(true);
      try {
        const response = await axios.post(
          `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_URL}`,
          {
            email: enteredId,
            password: enteredPassword,
            returnSecureToken: true,
          },
          { headers: { "Content-Type": "application/json" } }
        );
        setFormState("signupDone");
      } catch (error) {
        const message = error.response.data.error.message;
        if (message === "EMAIL_EXISTS") {
          setIdError("?????? ???????????? ??????????????????.");
        }
      }
      setIsLoading(false);
    };
    if (enteredId.length === 0) {
      setIdError("???????????? ??????????????????.");
      isError = true;
    }

    let email_format =
      /^([0-9a-zA-Z_\.-]+)@([0-9a-zA-Z_-]+)(\.[0-9a-zA-Z_-]+){1,2}$/;
    if (!email_format.test(enteredId)) {
      setIdError("???????????? ????????? ??????????????? ?????????.");
      isError = true;
    }
    if (enteredPassword.length === 0) {
      setPasswordError("??????????????? ??????????????????.");
      isError = true;
    }
    if (enteredPasswordConfirm.length === 0) {
      setPasswordConfirmError("???????????? ????????? ??????????????????.");
      isError = true;
    }
    if (enteredPassword.length < 6) {
      setPasswordError("??????????????? 6?????? ??????????????? ?????????.");
      isError = true;
    }
    if (enteredPassword !== enteredPasswordConfirm) {
      setPasswordConfirmError("??????????????? ???????????? ????????????.");
      isError = true;
    }

    if (!isError) {
      signup();
    }
  };

  const loginHandler = () => {
    errorCleanUp();
    let isError = false;
    const login = async () => {
      setIsLoading(true);
      try {
        const response = await axios.post(
          `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_URL}`,
          {
            email: enteredId,
            password: enteredPassword,
            returnSecureToken: true,
          },
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        const token = response.data.idToken;
        const refreshToken = response.data.refreshToken;
        // ????????? ?????? ?????? ??????
        setCookie("refreshToken", refreshToken, {
          path: "/",
        });
        localStorage.setItem("token", token);
      } catch (error) {
        const message = error.response.data.error.message;
        if (message === "EMAIL_NOT_FOUND" || message === "INVALID_PASSWORD") {
          setPasswordError("????????? ?????? ???????????????.");
        }
      }
      setIsLoading(false);
    };

    if (enteredId.length === 0) {
      setIdError("???????????? ??????????????????.");
      isError = true;
    }
    let email_format =
      /^([0-9a-zA-Z_\.-]+)@([0-9a-zA-Z_-]+)(\.[0-9a-zA-Z_-]+){1,2}$/;
    if (!email_format.test(enteredId)) {
      setIdError("???????????? ????????? ??????????????? ?????????.");
      isError = true;
    }

    if (enteredPassword.length === 0) {
      setPasswordError("??????????????? ??????????????????.");
      isError = true;
    }

    if (!isError) {
      login();
    }
  };

  const switchFormHandler = () => {
    inputCleanUp();
    errorCleanUp();
    if (formState === "login") {
      setFormState("signup");
    } else {
      setFormState("login");
    }
  };

  let content;

  if (formState === "login") {
    content = (
      <form onSubmit={submitHandler} className={classes.form}>
        <label htmlFor="id">?????????</label>
        <input
          type="email"
          onChange={idChangeHandler}
          value={enteredId}
          placeholder="abc@abc.com"
          className={classes["form__input"]}
          id="id"
        />
        <p className={classes["form__text--error"]}>{idError}</p>

        <label htmlFor="password">????????????</label>
        <input
          type="password"
          onChange={passwordChangeHandler}
          value={enteredPassword}
          className={classes["form__input"]}
          id="password"
        />
        <p className={classes["form__text--error"]}>{passwordError}</p>

        <Button onClick={loginHandler}>?????????</Button>
        <div className={classes["form__gap"]}></div>
        <Button onClick={switchFormHandler}>????????????</Button>
      </form>
    );
  } else if (formState === "signup") {
    content = (
      <form onSubmit={submitHandler} className={classes.form}>
        <label htmlFor="id">?????????</label>
        <input
          type="email"
          placeholder="abc@abc.com"
          onChange={idChangeHandler}
          value={enteredId}
          className={classes["form__input"]}
          id="id"
        />
        <p className={classes["form__text--error"]}>{idError}</p>
        <label htmlFor="password">????????????</label>
        <input
          type="password"
          onChange={passwordChangeHandler}
          value={enteredPassword}
          className={classes["form__input"]}
          id="password"
        />
        <p className={classes["form__text--error"]}>{passwordError}</p>

        <label htmlFor="password">???????????? ??????</label>
        <input
          type="password"
          onChange={passwordConfirmChangeHandler}
          value={enteredPasswordConfirm}
          className={classes["form__input"]}
          id="passwordConfirm"
        />
        <p className={classes["form__text--error"]}>{passwordConfirmError}</p>
        <Button onClick={signupHandler}>????????????</Button>
        <div className={classes["form__gap"]}></div>
        <Button onClick={switchFormHandler}>??????</Button>
      </form>
    );
  } else if (formState === "signupDone") {
    content = (
      <>
        <p>??????????????? ?????????????????????!</p>
        <div className={classes["form__gap"]}></div>
        <Button>?????????</Button>
      </>
    );
  }
  return (
    <>
      {isLoading && <LoadingModal />}
      <Header />
      <article className={classes.content}>{content}</article>
    </>
  );
};

export default Auth;
