import { useGoogleLogin } from "@react-oauth/google";
import { googleLogout } from "@react-oauth/google";
import axios from "axios";
import React, { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import { useNavigate } from "react-router-dom";
import Cookies from "universal-cookie";
//apple
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, OAuthProvider } from "firebase/auth";
import jwtDecode from "jwt-decode";
//apple

export default function (props) {
  //=========================== LOGIN & REGISTER WITH GOOGLE =============================
  const cookies = new Cookies();
  const navigate = useNavigate();
  const [user, setuser] = useState({});
  const [token, settoken] = useState("");
  const [expiredIn, setexpiredIn] = useState("");
  const [credential, setcredential] = useState("");
  const [idToken, setidToken] = useState("");
  const [requestLoginStatus, setrequestLoginStatus] = useState(false);
  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        var data = await axios
          .get("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: {
              Authorization: `Bearer ${response.access_token}`,
            },
          })
          .then((response1) => {
            setrequestLoginStatus(true);
            settoken(response.access_token);
            setexpiredIn(response.expires_in);
            axios
              .post(
                "http://localhost:8000/api/login?type=" +
                  2 +
                  "&email=" +
                  encodeURIComponent(response1.data.email) +
                  "&name=" +
                  encodeURIComponent(
                    response1.data.given_name + " " + response1.data.family_name
                  ) +
                  "&thirdAppId=" +
                  encodeURIComponent(response1.data.sub)
              )
              .then((response2) => {
                console.log("ini response2", response2);
                if (response2.data.type === "login") {
                  cookies.set("token", response.access_token);
                  cookies.set("tokenEx", response.expires_in);
                  navigate("/home", {
                    state: {
                      loginType: 2,
                    },
                  });
                }
                setuser(response1.data);
                setAuthMode(response2.data.type);
                setrequestLoginStatus(false);
              })
              .catch((error) => {
                requestLoginStatus(false);
              });
          });
      } catch (error) {
        console.log(error);
        requestLoginStatus(false);
      }
    },
  });
  const registerWithGoogle = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        var data = await axios
          .get("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: {
              Authorization: `Bearer ${response.access_token}`,
            },
          })
          .then((response1) => {
            setrequestLoginStatus(true);
            settoken(response.access_token);
            setexpiredIn(response.expires_in);
            axios
              .post(
                "http://localhost:8000/api/register?type=" +
                  2 +
                  "&email=" +
                  encodeURIComponent(response1.data.email) +
                  "&name=" +
                  encodeURIComponent(
                    response1.data.given_name + " " + response1.data.family_name
                  ) +
                  "&thirdAppId=" +
                  encodeURIComponent(response1.data.sub)
              )
              .then((response2) => {
                console.log("ini response2", response2);
                if (response2.data.type === "login") {
                  cookies.set("token", response.access_token);
                  cookies.set("tokenEx", response.expires_in);
                  navigate("/home", {
                    state: {
                      loginType: 2,
                    },
                  });
                }
                setuser(response1.data);
                setAuthMode(response2.data.type);
                setrequestLoginStatus(false);
              })
              .catch((error) => {
                console.log(error);
                setrequestLoginStatus(false);
              });
          });
      } catch (error) {
        console.log(error);
        setrequestLoginStatus(false);
      }
    },
  });
  const registerWithThirdApp = async () => {
    setrequestLoginStatus(true);
    await axios
      .post(
        "http://localhost:8000/api/register?type=" +
          3 +
          "&email=" +
          encodeURIComponent(user.email) +
          "&name=" +
          encodeURIComponent(user.given_name + " " + user.family_name) +
          "&thirdAppId=" +
          encodeURIComponent(user.sub)
      )
      .then((response) => {
        cookies.set("token", token);
        cookies.set("tokenEx", expiredIn);
        navigate("/home", {
          state: {
            loginType: 2,
          },
        });
        setrequestLoginStatus(true);
      })
      .catch((error) => {
        console.log(error);
        setrequestLoginStatus(false);
      });
  };
  //=========================== LOGIN & REGISTER WITH GOOGLE =============================

  //=========================== LOGIN & REGISTER DEFAULT =============================
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const [username, setusername] = useState("");
  const [validation, setvalidation] = useState([]);
  const loginDefault = async () => {
    setrequestLoginStatus(true);
    await axios
      .post(
        "http://localhost:8000/api/login?type=" +
          1 +
          "&email=" +
          email +
          "&password=" +
          password
      )
      .then((response) => {
        cookies.set("token", response.data.authorization.token);
        // cookies.set('tokenEx', response.data.authorization.token)
        navigate("/home", { state: { loginType: 1 } });
        setrequestLoginStatus(false);
        setvalidation([]);
      })
      .catch((error) => {
        console.log(error.response.data.message);
        setvalidation(error.response.data.message);
        setrequestLoginStatus(false);
      });
  };
  const registerDefault = async () => {
    setrequestLoginStatus(true);
    await axios
      .post(
        "http://localhost:8000/api/register?type=" +
          1 +
          "&email=" +
          email +
          "&password=" +
          password +
          "&name=" +
          username
      )
      .then((response) => {
        setAuthMode("signin");
        setrequestLoginStatus(false);
      })
      .catch((error) => {
        console.log(error.response.data.message);
        setvalidation(error.response.data.message);
        setrequestLoginStatus(false);
      });
  };
  //=========================== LOGIN & REGISTER DEFAULT =============================

  const logout = () => {
    googleLogout();
    settoken("");
  };
  useEffect(() => {
    console.log("1", credential);
    console.log("2", user);
    console.log("3", token);
    console.log("4", expiredIn);
    console.log("5", idToken);
    console.log("6", authMode);
  }, [user]);

  //=========================== LOGIN WITH APPLE =============================
  const loginapplefbase = () => {
    const provider = new OAuthProvider("apple.com");
    provider.addScope("email name");
    const firebaseConfig = {
      apiKey: "AIzaSyCr03TIL67HVmnQRomysSFtBZDYSnWqA68",
      authDomain: "loginwithapple-bfaad.firebaseapp.com",
      projectId: "loginwithapple",
      storageBucket: "loginwithapple.appspot.com",
      messagingSenderId: "668747678037",
      appId: "1:668747678037:web:fdd068d277595c65ef2fdc",
      measurementId: "G-VH93DG8Y57",
    };
    const app = initializeApp(firebaseConfig);
    // console.log("ini apa si,", app);
    const auth = getAuth(app);
    signInWithPopup(auth, provider)
      .then((result) => {
        // The signed-in user info
        setuser(result.user);
        // Apple credential
        const data = OAuthProvider.credentialFromResult(result);
        setcredential(data);
        settoken(data.accessToken);
        setexpiredIn(result.user.stsTokenManager.expirationTime);
        setidToken(jwtDecode(data.idToken));
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.customData.email;
        // The credential that was used.
        const credential = OAuthProvider.credentialFromError(error);
      });
  };
  //=========================== LOGIN WITH APPLE =============================

  let [authMode, setAuthMode] = useState("signin");

  const changeAuthMode = () => {
    setAuthMode(authMode === "signin" ? "signup" : "signin");
    setuser({});
    setvalidation([]);
  };

  if (authMode === "signin") {
    return (
      <div className="Auth-form-container">
        <form className="Auth-form">
          <div className="Auth-form-content">
            <h3 className="Auth-form-title">Sign In</h3>
            <div className="text-center">
              Not registered yet?{" "}
              <span className="link-primary" onClick={changeAuthMode}>
                Sign Up
              </span>
            </div>
            <div className="form-group mt-3">
              <label>Email address</label>
              <input
                type="email"
                className="form-control mt-1"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setemail(e.target.value)}
              />
              {validation ? (
                <div style={{ color: "red" }}>
                  {validation.message || validation.email}
                </div>
              ) : (
                ""
              )}
            </div>
            <div className="form-group mt-3">
              <label>Password</label>
              <input
                type="password"
                className="form-control mt-1"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setpassword(e.target.value)}
              />
              {validation ? (
                <div style={{ color: "red" }}>
                  {validation.message || validation.password}
                </div>
              ) : (
                ""
              )}
            </div>
            <div className="d-grid gap-2 mt-3">
              {(requestLoginStatus == true && (
                <>
                  <button class="btn btn-primary" type="button" disabled>
                    <span
                      class="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Loading...
                  </button>
                </>
              )) || (
                <>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={loginDefault}
                  >
                    Submit
                  </button>
                </>
              )}
            </div>
            <div className="or-container">
              <div className="line-separator"></div>{" "}
              <div className="text-center mt-2">or</div>
              <div class="line-separator"></div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <div className="text-center mt-2">
                  <button
                    type="button"
                    className="mt-2"
                    onClick={loginWithGoogle}
                  >
                    Login With Google
                  </button>
                  <br></br>
                  <button
                    type="button"
                    className="mt-2"
                    onClick={loginapplefbase}
                  >
                    Login With Apple
                  </button>
                  <br></br>
                </div>
              </div>
            </div>

            <br />
            <p className="text-center mt-2">
              Forgot <a href="#">password?</a>
            </p>
          </div>
        </form>
      </div>
    );
  } else if (authMode === "signup") {
    return (
      <div className="Auth-form-container">
        <form className="Auth-form">
          <div className="Auth-form-content">
            <h3 className="Auth-form-title">Sign Up</h3>
            <div className="text-center">
              Already registered?{" "}
              <span className="link-primary" onClick={changeAuthMode}>
                Sign In
              </span>
            </div>
            <div className="form-group mt-3">
              <label>Full Name</label>
              <input
                type="text"
                className="form-control mt-1"
                placeholder="e.g Jane Doe"
                value={username}
                onChange={(e) => setusername(e.target.value)}
              />
            </div>
            <div className="form-group mt-3">
              <label>Email address</label>
              <input
                type="email"
                className="form-control mt-1"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setemail(e.target.value)}
              />
              {validation ? (
                <div style={{ color: "red" }}>{validation.email}</div>
              ) : (
                ""
              )}
            </div>
            <div className="form-group mt-3">
              <label>Password</label>
              <input
                type="password"
                className="form-control mt-1"
                placeholder="Password"
                value={password}
                onChange={(e) => setpassword(e.target.value)}
              />
              {validation ? (
                <div style={{ color: "red" }}>{validation.password}</div>
              ) : (
                ""
              )}
            </div>
            <div className="d-grid gap-2 mt-3">
              {(requestLoginStatus == true && (
                <>
                  <button class="btn btn-primary" type="button" disabled>
                    <span
                      class="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Loading...
                  </button>
                </>
              )) || (
                <>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={registerDefault}
                  >
                    Register
                  </button>
                </>
              )}
            </div>
            <div className="or-container">
              <div className="line-separator"></div>{" "}
              <div className="text-center mt-2">or</div>
              <div class="line-separator"></div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <div className="text-center mt-2">
                  <button
                    type="button"
                    className="mt-2"
                    onClick={registerWithGoogle}
                  >
                    Register With Google
                  </button>
                  <br></br>
                  <button
                    type="button"
                    className="mt-2"
                    onClick={loginapplefbase}
                  >
                    Register With Apple
                  </button>
                  <br></br>
                </div>
              </div>
            </div>
            <p className="text-center mt-2">
              Forgot <a href="#">password?</a>
            </p>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="Auth-form-container">
      {/* <form className="Auth-form"> */}
      <div className="Auth-form-content">
        <h3 className="Auth-form-title">Sign Up</h3>
        <div className="text-center">
          Already registered?{" "}
          <span className="link-primary" onClick={changeAuthMode}>
            Sign In
          </span>
        </div>
        <div className="form-group mt-3">
          <label>Full Name</label>
          <input
            type="text"
            className="form-control mt-1"
            placeholder="e.g Jane Doe"
            value={
              user.given_name + user.family_name
                ? user.given_name + " " + user.family_name
                : ""
            }
            disabled={true}
          />
        </div>
        <div className="form-group mt-3">
          <label>Email address</label>
          <input
            type="email"
            className="form-control mt-1"
            placeholder="Email Address"
            value={user.email ? user.email : ""}
            disabled={true}
          />
        </div>
        {/* <div className="form-group mt-3">
          <label>Password</label>
          <input
            type="password"
            className="form-control mt-1"
            placeholder="Password"
          />
        </div> */}
        <div className="d-grid gap-2 mt-3">
          {(requestLoginStatus == true && (
            <>
              <button class="btn btn-primary" type="button" disabled>
                <span
                  class="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                ></span>
                Loading...
              </button>
            </>
          )) || (
            <>
              <button
                type="submit"
                className="btn btn-primary"
                onClick={registerWithThirdApp}
              >
                Submit
              </button>
            </>
          )}
        </div>
        <p className="text-center mt-2">
          Forgot <a href="#">password?</a>
        </p>
      </div>
      {/* </form> */}
    </div>
  );
}
