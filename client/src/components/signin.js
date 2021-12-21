import React, { useState, useContext } from "react";
import Account_Manager from "../helpers/account_manager.js";
import context from "../utils/react_context.js";
import "../css/itinerary.css";

const SignIn = () => {
  const authApi = useContext(context);
  const AcctManager = new Account_Manager(authApi)
  const [user, setUser] = useState(Account_Manager.blankUser)
  AcctManager.assignUser(user, setUser)

  return (
    <div className='login'>
      <h1>Login</h1>
      <div>
        <input className="init-input"
          type="text" placeholder="Username" required="required" name="username"
          value={AcctManager.user.username} onChange={AcctManager.handleFieldChange}
        />
        <input className="init-input"
          type="password" placeholder="Password" required="required" name="password" 
          value={AcctManager.user.password} onChange={AcctManager.handleFieldChange}
        />
        <button className="btn btn-primary btn-block btn-large" onClick={AcctManager.handleSignIn}>
          Login
        </button>
        <h5 className="link-descript">Don't have an account yet? <a href="/signup" className="link">Sign Up</a></h5>
        <h5 className="link-descript mtn10">Like the landing page? <a href="/" className="link">Click Here!</a></h5>
      </div>
    </div>
  );
};

export default SignIn;
