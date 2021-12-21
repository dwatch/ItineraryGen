import React, { useState, useContext } from "react";
import {useHistory} from 'react-router-dom';
import context from "../utils/react_context.js";
import Account_Manager from "../helpers/account_manager.js";
import {List_Manager} from "../helpers/list_manager.js";
import "../css/itinerary.css";



function UserLists() {
  //General Create
  const history = useHistory();
  const authApi = useContext(context);
  //AcctManager
  const AcctManager = new Account_Manager(authApi)
  const [user, setUser] = useState(Account_Manager.blankUser)
  AcctManager.assignUser(user, setUser)
  //ListManager
  const [newList, setNewList] = useState("");
  const ListManager = new List_Manager(authApi, history, newList, setNewList);

  return(
    <div className="login mtn20">
      <h1>Welcome back {authApi.auth.name}</h1>
      <h3 className="mtn20">Here are you current lists:</h3>
      <table className="h240p maps-list w70 mtn20 right15">
        <thead>
        <tr>
            <td><input type="text" placeholder="New List Name" value={ListManager.newList} className='mt10 init-input' onChange={ListManager.makeList} /></td>
            <td><button onClick={ListManager.makeList} className="btn btn-add btn-primary btn-block" value="Add List">Create</button></td>
          </tr>
        </thead>
        <tbody>
          {
            Object.keys(authApi.auth.lists).map((key) => (
              <tr key={key}>
                <td><button onClick = {ListManager.selectList} name = {key} className = "btn btn-list btn-block">{key}</button></td>
                <td><button onClick = {ListManager.deleteList} name = {key} className = "btn btn-del">Delete</button></td>
              </tr>
            ))
          }
        </tbody>
      </table>
      <button onClick = {AcctManager.handleSignOut} className = "btn btn-large btn-primary btn-block mt20">Logout</button>
    </div>
  )
}

export default UserLists;