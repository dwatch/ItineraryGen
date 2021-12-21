import React, { useContext } from "react";
import { Switch, Route, Redirect } from 'react-router-dom';
import Landing from "../components/landing.js"
import SignIn from "../components/signin.js";
import SignUp from "../components/signup.js";
import UserLists from "../components/userLists.js"
import SpecUserList from "../components/specUserList.js"
import context from "./react_context.js";

function Routes() {
  return (
    <Switch>
      <Landing exact path="/" />
      <RouteRegistration exact path="/signin" component={SignIn} />
      <RouteRegistration exact path="/signup" component={SignUp} />
      <RouteProtected exact path="/:user" component={UserLists} />
      <RouteProtected exact path="/:user/:list" component={SpecUserList} />
    </Switch>
  );
};

const RouteRegistration = ({ component: Component, ...rest }) => {
  const authApi = useContext(context);
  let url = authApi.auth.specList ? ["",authApi.auth.username,authApi.auth.specList].join("/") : "/" + authApi.auth.username;
  return (
    <Route
      {...rest}
      render={(props) =>
        !authApi.auth.auth ? <Component {...props} /> : <Redirect to={url} />
      }
    />
  );
};

const RouteProtected = ({ component: Component, ...rest }) => {
  const authApi = useContext(context);
  return (
    <Route
      {...rest}
      render={(props) =>
        authApi.auth.auth ? <Component {...props} /> : <Redirect to="/signin" />
      }
    />
  );
};

export default Routes;

/*
*/