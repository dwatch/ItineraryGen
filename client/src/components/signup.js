import React, { useState, useContext } from "react";
import Account_Manager from "../helpers/account_manager.js";
import context from "../utils/react_context.js"
import "../css/itinerary.css";

const SignUp = () => {
  const authApi = useContext(context);
  const AcctManager = new Account_Manager(authApi)
  const [user, setUser] = useState(Account_Manager.blankUser)
  AcctManager.assignUser(user, setUser)

  return (
    <div className="login">
      <h1>Sign Up</h1>
      <input className="init-input"
        type="text" placeholder="Full Name" required="required" name="name"
        value={AcctManager.user.name} onChange={AcctManager.handleFieldChange}
      />
      <input className="init-input"
        type="text" placeholder="Username" required="required" name="username"
        value={AcctManager.user.username} onChange={AcctManager.handleFieldChange}
      />
      <input className="init-input"
        type="password" placeholder="Password" required="required" name="password"
        value={AcctManager.user.password} onChange={AcctManager.handleFieldChange}
      />
      <button onClick={AcctManager.handleSignUp} className="btn btn-primary btn-block btn-large">
        Sign Up
      </button>
      <h5 className="link-descript">Already have an account? <a href="/signin" className="link">Login</a></h5>
      <h5 className="link-descript mtn10">Like the landing page? <a href="/" className="link">Click Here!</a></h5>
    </div>
  );

}

export default SignUp;
