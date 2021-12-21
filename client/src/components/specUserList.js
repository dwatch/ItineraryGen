import React, { useState, useContext } from "react";
import {useHistory} from 'react-router-dom';
import {Map, Search} from "./maps.js";
import hpr from "../helpers/helper_fn.js";
import ItineraryDay from "./itineraryDay.js"
import context from "../utils/react_context.js";
import AxiosRouter from "../utils/axios_router.js";
import {Itin_Manager} from "../helpers/itin_manager.js";
import Account_Manager from "../helpers/account_manager.js";
import {List_Manager, Location_Manager} from "../helpers/list_manager.js";

function SpecUserList() {
  //General Create
  const history = useHistory();
  const authApi = useContext(context);
  //AcctManager
  const AcctManager = new Account_Manager(authApi)
  const [user, setUser] = useState(Account_Manager.blankUser)
  AcctManager.assignUser(user, setUser)
  //ListManager
  const [newList, setNewList] = useState(authApi.auth.lists[authApi.auth.specList])
  const ListManager = new List_Manager(authApi, history, newList, setNewList)
  //LocManager
  const LocManager = new Location_Manager(authApi, history)
  const [newLoc, setNewLoc] = useState(hpr.initLoc())
  LocManager.assignLoc(newList, setNewList, newLoc, setNewLoc)
  //Itinerary Conditions
  const initItin = (authApi.auth.itin_dets) ? authApi.auth.itin_dets : { tripMode: "driving", sd: "", ed: "", st: "", et: "" }
  const [newItin, setNewItin] = useState(initItin)
  const ItinManager = new Itin_Manager(newList, newItin.sd, newItin.ed, newItin.st, newItin.et, newItin.tripMode)
  //Itinerary Generation and Display
  const [generatedItin, setGeneratedItin] = useState(null)
  const [showItin, setShowItin] = useState(false)
  // Map Icon
  const [newSelect, setNewSelect] = useState(null)

  //Misc Functions
  const handleChange = (prop) => {
    setGeneratedItin(null)
    let {name, value} = prop.target
    let change = true
    if (name === "sd" && (newItin["ed"] && value > newItin["ed"])) {
      newItin["ed"] = ""
    } else if (name === "ed" && (newItin['sd'] && value < newItin["sd"])) {
      change = false
      window.alert("Your trip end date must be after your trip start date")
    } else if (name ==="st" && (newItin["et"] && value > newItin["et"])) {
      newItin['et'] = ""
    } else if (name === "et" && (newItin["st"] && value < newItin["st"])) {
      change = false
      window.alert("Your daily end time must be after your daily staert time")
    }
    if (change) {
      newItin[name] = value
      setNewItin({...newItin, [name]: value}) //Here in order to re-render state
      AxiosRouter.updateItinParams(newItin)  
    }
  }
  const test = async () => {
    setGeneratedItin(null)
    if (Object.values(newItin).some(x => x === null || x === "")) {
      window.alert("You need to fill in all itinerary fields to generate an itinerary!")
    } else {
      //Make Multiday Itinerary
      let sepLocs = ItinManager.separate_restaurants(ItinManager.locs) //Separates the restaurants from locs
      let ndays = Math.min(ItinManager.ndays, hpr.optimal_ndays(sepLocs.not_rests, ItinManager.nhours))
      if (ItinManager.ndays > Object.keys(sepLocs.not_rests).length) {
        window.alert("You don't have enough locations to fill each day! We'll add some break days for you")
      }
      let [groups, centroids] = ItinManager.balanced_k_means(sepLocs.not_rests, ndays, ItinManager.nhours) //Balanced K-means to get groups/centroids
      let rest_groups = ItinManager.restaurant_k_means(sepLocs.rests, centroids) //Groups the restaurants by centroid
      let [locs_by_day, rest_by_day] = ItinManager.sort_groups(groups, rest_groups) //Sorts in order of maximum day value)
      let full_trip = []
      for (let i = 0; i < locs_by_day.length; i++) {
        if (locs_by_day[i]) {
          let meals = ItinManager.choose_meals(rest_by_day[i], ItinManager.days_of_week[i])
          let itinerary = await ItinManager.make_itinerary(locs_by_day[i], meals, ItinManager.days_of_week[i])
          full_trip.push(itinerary)
        } else {
          full_trip.push(null)
        }
      }
      console.log(full_trip)
      setGeneratedItin(full_trip)
    }
  }
  const showItinerary = () => {
    setShowItin(true)
  }
  const showLocations = () => {
    setShowItin(false)
  }

  return(
    <div>
      <div>
        <h1>{authApi.auth.name}, we are on list: {authApi.auth.specList}</h1>
        <h3 className="mtn20">Below are your locations:</h3>
      </div>
      <div className="centered-wide">
        <div className="left-side">
            <div className="tabheader">
                <div onClick = {showLocations} className="btn btn-primary btn-toggle ms5">Locations</div>
                <div onClick = {showItinerary} className="btn btn-primary btn-toggle ms5">Itinerary</div>
            </div>
            { (!showItin) ?
                <div>
                  <table name = "add-locations">
                    <thead>
                      <tr>
                        <th>Location</th>
                        <th>Value</th>
                        <th>Visit Len (hrs)</th>
                        <th>Add Location</th>
                      </tr>
                    </thead>
                    <tfoot>
                      <tr>
                        <td><Search newLoc = {newLoc} setNewLoc = {setNewLoc} className="init-input" /></td>
                        <td><input type="text" name="val" className="init-input" value={newLoc.val} onChange={LocManager.makeLoc} /></td>
                        <td><input type="text" name="time" className="init-input" value={newLoc.time} onChange={LocManager.makeLoc} /></td>
                        <td><input type="submit" value="Add" onClick={LocManager.makeLoc} className="mtn10 btn btn-add btn-primary btn-block"/></td>
                      </tr>
                    </tfoot>
                  </table>
                  <table name = "show-locations" className="h400 maps-list">
                    <tbody>
                      {
                        Object.keys(newList).map((key) => (
                          <tr key = {key}>
                            <td><div className="list-input center white">{newList[key]["name"]}</div></td>
                            <td><input className="list-input" type="text" name={key + "|val"} value={newList[key]["val"]} onChange={LocManager.editListItem} /></td>
                            <td><input className="list-input" type="text" name={key + "|time"} value={newList[key]["time"]} onChange={LocManager.editListItem} /></td>
                            <td><button type="submit" name = "update" onClick={LocManager.updateList} className = "btn btn-update btn-block">Update</button></td>
                            <td><button onClick = {LocManager.deleteLoc} name = {key} className = "btn btn-del btn-block">Delete</button></td>
                          </tr>
                        ))
                      }
                    </tbody>
                  </table>
                </div>
              :
                <div>
                  <table name = "itinerary" className="mt20">
                    <thead>
                      <tr>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Start Time</th>
                        <th>End Time</th>
                        <th>TravelMode</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><input type="date" name="sd" className="list-input" value={newItin.sd} onChange={handleChange}/></td>
                        <td><input type="date" name="ed" className="list-input" value={newItin.ed} onChange={handleChange}/></td>
                        <td><input type="time" name="st" className="list-input" value={newItin.st} onChange={handleChange}/></td>
                        <td><input type="time" name="et" className="list-input" value={newItin.et} onChange={handleChange}/></td>
                        <td>
                          <select name="tripMode" className="list-input" onChange={handleChange}>
                            <option value="Driving">Driving</option>
                            <option value="Transit">Transit</option>
                            <option value="Bicycling">Bicycling</option>
                            <option value="Walking">Walking</option>
                          </select>
                        </td>
                      </tr>
                      <tr>
                        <td colSpan="5"><input type="submit" value="Make Itinerary!" className="btn btn-primary btn-block btn-large" onClick={test}/></td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="h350 maps-list">
                    { (generatedItin) ?
                      [...Array(generatedItin.length).keys()].map((i) => (
                        <ItineraryDay key = {ItinManager.dates_of_week[i]} 
                                      date = {ItinManager.dates_of_week[i]} 
                                      itin = {generatedItin[i]} 
                        />
                      ))
                      :
                      null
                    }
                  </div>
                </div>                
            }
        </div>
        <div className="right-side mt20">
          <Map loc = {newList} newSelect = {newSelect} setNewSelect = {setNewSelect}></Map>
          <div className="map-width">
            <button onClick = {ListManager.leaveSpecList} className="btn btn-specList btn-primary btn-block btn-large">Back to Lists</button>
            <button onClick = {AcctManager.handleSignOut} className="btn btn-specList btn-primary btn-block btn-large">Logout</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SpecUserList;


