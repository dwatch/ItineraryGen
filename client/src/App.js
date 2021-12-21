import React, { useEffect, useState } from "react";
import { BrowserRouter as Router } from 'react-router-dom';
import context from "./utils/react_context.js";
import AxiosRouter from "./utils/axios_router.js";
import Routes from "./utils/react_router.js";
import Account_Manager from "./helpers/account_manager.js";
import { useLoadScript } from "@react-google-maps/api";

const libraries = ["places"]

function App() {
  const [auth, setAuth] = useState(Account_Manager.blankUser);

  const readSession = async () => {
    const result = await AxiosRouter.signedin();
    console.log(result)
    if (result.data.auth) {
      setAuth(result.data.user);
    }
  }

  useEffect(() => {
    readSession();
  }, []);
  
  console.log(process.env.REACT_APP_GOOGLE_API_KEY)
  const {isLoaded, loadError} = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_API_KEY,
    libraries,
  })

  if (loadError) {
    console.log("Maps loading error")
    return "Error Loading Maps";
  }
  if (!isLoaded) return "Loading Maps";

  return (
    <div className="App">
      <script src={`https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_API_KEY}&libraries=places`}></script>
      <context.Provider value={{auth, setAuth}}>
        <Router>
          <Routes />
        </Router>
      </context.Provider>
    </div>

  );
}

export default App;