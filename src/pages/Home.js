import axios from "axios";
import React, { useEffect, useState } from "react";
import Cookies from "universal-cookie";
import { useNavigate, useLocation } from "react-router-dom";
import jwtDecode from "jwt-decode";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
function Home() {
  const cookies = new Cookies();
  const navigate = useNavigate();
  const { state } = useLocation();
  var token = cookies.get("token");
  const [user, setuser] = useState({});

  const getDataByGoogle = async () => {
    var data = await axios.get(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    setuser(data.data);
  };
  useEffect(() => {
    if (state.loginType && state.loginType === 2) {
      getDataByGoogle();
    }
  }, []);
  const logout = () => {
    cookies.remove("token");
    cookies.remove("expiredEx");
    cookies.remove("thirdAppId");
    navigate("/auth");
  };
  return (
    <div>
      {token && (
        <>
          <Card style={{ width: "18rem" }}>
            <Card.Img variant="top" src={user.picture} />
            <Card.Body>
              <Card.Title>{user.name}</Card.Title>
              <Card.Text>{user.email}</Card.Text>
              <Button onClick={logout} variant="primary">
                logout
              </Button>
            </Card.Body>
          </Card>
        </>
      )}
    </div>
  );
}

export default Home;
