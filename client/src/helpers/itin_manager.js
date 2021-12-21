import Math from "math";
import hpr from "./helper_fn.js";
import AxiosRouter from "../utils/axios_router.js";
//Google Maps

export class Itin_Manager {
  constructor(locs, sd, ed, st, et, transMode, anchors = null) {
    //this.service = require("google-distance-matrix");
    //this.service.transit_routing_preference("fewer_transfers");
    //this.service.key(process.env.REACT_APP_GOOGLE_API_KEY)
    this.msecs = 3600 * 24 * 1000;
    this.not_restaurant = ["bakery","cafe"]
    this.locs = this.add_val_efficiency(locs);
    this.meal_hours = [[1100, 1300], [1800, 2000]]
    this.anchors = (anchors === null) ? {"lunch": this.meal_hours[0], "dinner": this.meal_hours[1]} : anchors;
    this.dates = {sd: hpr.toDate(sd), ed: hpr.toDate(ed)};
    this.times = [hpr.toTime(st), hpr.toTime(et)]; //Start/End Times for the days
    this.mode = transMode;
    //Intermediate
    this.nhours = (this.times[1] - this.times[0]) / 100 + ((this.times[1] - this.times[0]) % 100) / 60.0
    this.ndays = (sd === "" || ed === "" || sd > ed) ? 0 : (this.dates.ed.getTime() - this.dates.sd.getTime()) / this.msecs + 1;
    this.days_of_week = (this.ndays === 0) ? [] : [...Array(this.ndays).keys()].map((i) => ((i + this.dates.sd.getDay() - 1) % 7))
    this.dates_of_week = hpr.date_array(this.dates.sd, this.dates.ed)
    //Itinerary
    this.null_rest_name = "[Restaurant]"
    this.wait_name = "[Free Time]"
    this.null_rest_address = ""
    this.wait_address = ""
  }

  //Update and DistMatrix
  updateLocs = (locs) => {
    this.locs = locs
  }
  stripLoc = (loc, day) => {
    if (loc.hours[day]) {
      return {"name": loc.name, "address": loc.address, "hours": loc.hours[day], "val": loc.val, "time": loc.time}
    } else {
      return {"name": loc.name, "address": loc.address, "hours": null, "val": loc.val, "time": loc.time}
    }
  }

  //Intermediates
  add_val_efficiency = (locs) => {
    for (let key of Object.keys(locs)) {
      locs[key]["val_ratio"] = locs[key]["val"] / locs[key]["time"]
    }
    return(locs)
  }
  separate_restaurants = (locs) => {
    let rest_list = {}
    let not_rest_list = {}
    for (let key of Object.keys(locs)) {
      if( locs[key]["types"].includes("restaurant") && 
          !hpr.overlap(this.not_restaurant, locs[key]["types"])
      ) {
        rest_list[key] = locs[key]
      } else {
        not_rest_list[key] = locs[key]
      }
    }
    return {"rests": rest_list, "not_rests": not_rest_list}
  }
  //Clustering
  //max_time is hours in day allowed
  balanced_k_means = (locs, n, max_time = this.nhours) => {
    let groups = [...Array(n)].map(x=>({}));
    let centroids = [];
    let changed = true;
    let keys = Object.keys(locs);
    let nLocs = keys.length;
    let counter = 1;
    //Pick Init Centroids
    let space = Math.round( nLocs / (n+1) )
    for (let i = 0; i < n; i++) {
      let init = locs[keys[space * (i+1)]]
      centroids[i] = { "lat":init.lat, "lng":init.lng, "time":max_time }
    }
    while (changed && counter < 10) {
      changed = false
      //Clear Groups
      groups = [...Array(n)].map(x=>({}));
      //Find Closest Group for Each Loc
      for (let key of keys) {
        let dist = 10**10;
        let newGroup = 0;
        for ( let j = 0; j < n; j++ ) {
          let tempDist = hpr.haverDist(centroids[j], locs[key])
          if (tempDist <= dist && locs[key]["time"] <= centroids[j]["time"]) {
            dist = tempDist;
            newGroup = j;
          }
        }
        groups[newGroup][key] = locs[key]
        centroids[newGroup]["time"] -= locs[key]["time"]
      }
      //Get new Centroids
      for ( let j = 0; j < n; j++ ) {
        let centroidCoords = hpr.centroid(groups[j])
        if (centroidCoords.lat !== centroids[j].lat || centroidCoords.lng !== centroids[j].lng) {
          changed = true
        }
        centroids[j] = {"lat":centroidCoords.lat, "lng":centroidCoords.lng, "time":max_time}
      }
      counter += 1
    }
    return [groups, centroids]
  }
  restaurant_k_means = (rests, centroids) => {
    let groups = [...Array(centroids.length)].map(x=>({}));
    for ( let key of Object.keys(rests) ) {
      let dist = 10**10
      let newGroup = 0
      for ( let i = 0; i < centroids.length; i++ ) {
        let tempDist = hpr.haverDist(rests[key], centroids[i])
        if (tempDist < dist) {
          dist = tempDist
          newGroup = i
        }
      }
      groups[newGroup][key] = rests[key]
    }
    return groups
  }
  //Itinerary Generation
  max_possible_value = (group, rest_group=[]) => {
    let total = 0;
    let rest_values = [];
    Object.keys(group).map(key=>(
      total += group[key].val
    ));
    Object.keys(rest_group).map(key=>(
      rest_values.push(rest_group[key].val)
    ));
    rest_values.sort(function(a,b) {return b-a});
    if (rest_values.length >= 1) { total += rest_values[0] }
    if (rest_values.length >= 2) { total += rest_values[1] }
    return total
  }
  sort_by_max_val = (groups, rest_groups) => {
    for ( let i = 0; i < groups.length; i++ ) {
      let max_val = this.max_possible_value(groups[i], rest_groups[i])
      groups[i]["max_val"] = max_val
      rest_groups[i]["max_val"] = max_val
    }
    groups.sort(function(a,b) { return b.max_val - a.max_val })
    rest_groups.sort(function(a,b) { return b.max_val - a.max_val })
    for ( let i = 0; i < groups.length; i++ ) {
      delete groups[i]["max_val"]
      delete rest_groups[i]["max_val"]
    }
    return [groups, rest_groups]
  }
  sort_groups = (loc_groups, restaurant_groups) => { 
    //Initializations
    let day_keys = [...Array(this.days_of_week.length).keys()] //Set idxs for each day
    let final_locs = [...Array(day_keys.length)]
    let final_rests = [...Array(day_keys.length)]
    //Sorts by decreasing order of max possible value
    let [groups, rest_groups] = this.sort_by_max_val(loc_groups, restaurant_groups)
    //For each group... create initial sorting idxs
    for ( let i = 0; i < groups.length; i++ ) {
      let idx = null
      let best_val = 0
      //For each day in the trip... see what the total possible value is
      for ( let j = 0; j < day_keys.length; j++ ) { //Need to use index so the sort_idx is in line
        let temp_val = 0
        //Sum values of all open locations
        for (let key of Object.keys(groups[i])) {
          if (this.days_of_week[day_keys[j]] in groups[i][key]["hours"]) {
            temp_val += groups[i][key]["val"]
          }
        }
        //Update the day_of_week of current group
        if ( temp_val > best_val || !idx ) {
          best_val = temp_val
          idx = day_keys[j]
        }
      }
      //Remove that day from existing day_of_week indices to prevent double-assigning groups to a day
      day_keys.splice(idx, 1)
      final_locs[idx] = groups[i]
      final_rests[idx] = rest_groups[i]
    }
    return [final_locs, final_rests]
  }
  get_dist_matrix = async (starts, ends, transMode) => {
    let query = {
      "origins": starts,
      "destinations": ends,
      "mode": transMode.toLowerCase(),
    }
    const res = await AxiosRouter.distMatrix(query);
    let matrix = hpr.google_dist_query_to_matrix(res.data);
    return matrix
  }
  choose_meals = (rest_locs, day) => { //Selects both lunch and dinner
    let meals = [null, null]
    let rest_list = hpr.dict2list(rest_locs)
    rest_list.sort(function(a,b) { return b.val - a.val })
    while((!meals[0] || !meals[1]) && rest_list.length > 0) {
      let cur = rest_list.shift();
      let cur_rest_hours = cur["hours"][day]
      if (!meals[0] && hpr.covers(cur_rest_hours, hpr.avg(this.meal_hours[0]))) { //Lunch
        meals[0] = cur
      } else if (!meals[1] && hpr.covers(cur_rest_hours, hpr.avg(this.meal_hours[1]))) { //Dinner
        meals[1] = cur
      } else { //Hours don't work for unfilled meal
        let [alt_idx, prob_idx] = meals[0] ? [0, 1] : [1, 0]
        let alt_rest_hours = meals[alt_idx]["hours"][day]
        if (hpr.covers(alt_rest_hours, this.meal_hours[prob_idx]) && 
            hpr.covers(cur_rest_hours, this.meal_hours[alt_idx])) {
          meals[prob_idx] = meals[alt_idx]
          meals[alt_idx] = cur  
        }
      }
    }
    return meals
  }
  //Makes a single day itinerary
  make_itinerary = async (loc_list, meals, day, times = this.times, transMode = this.mode) => {
    //Assumed values
    let null_stay_time = 2
    let travel_rounding = 5
    let stay_rounding = 1
    //Free Variable Initializations
    let cur_time = times[0]
    let itinerary = []
    let next_loc = null
    let locs = []
    //Non-Restaurant Locations
    for (let key of Object.keys(loc_list)) { //Fixes hours to specific day, and removes any places not open
      if (loc_list[key].hours[day]) {
        locs.push(this.stripLoc(loc_list[key], day))
      }
    }
    let open_sorted = locs.sort((a,b) => { return a.hours[1] - b.hours[1] || a.hours[0] - b.hours[0] })
    let close_sorted = locs.sort((a,b) => { return a.hours[0] - b.hours[0] || a.hours[1] - b.hours[1] })
    //console.log('other locs')
    //Restaurants
    for (let i = 0; i < meals.length; i++) {
      meals[i] = (meals[i] && meals[i].hours[day]) ? this.stripLoc(meals[i], day) : null //Fixes hours
      if (meals[i]) {
        loc_list[meals[i].name] = meals[i]
      }      
    }
    //console.log("restaurants")
    //Distance Matrix
    let loc_names = Object.keys(loc_list)
    let loc_addresses = loc_names.map(key=>loc_list[key].address)
    let dist_matrix = await this.get_dist_matrix(loc_addresses, loc_addresses, transMode)
    //console.log("dist-matrix")
    //Building the Itinerary
    let idx = 50 //Prevent possible infinite loop
    while ( (open_sorted.length > 0 || close_sorted.length > 0) && cur_time < times[1] && idx > 0) {
      idx -= 1
      //Find the next location (restaurant, icon, or wait)
      if (meals.length > 0 && cur_time >= this.meal_hours[2 - meals.length][0]) {  
        next_loc = meals.shift()
        if (!next_loc) { //Restaurant is null
          next_loc = {name: this.null_rest_name, address: this.null_rest_address}
        }
      } else if (close_sorted.length > 0 && hpr.covers(close_sorted[0].hours, cur_time)) {
        next_loc = close_sorted.shift()
        open_sorted = hpr.rmv_item(open_sorted, next_loc)        
      } else if (open_sorted.length > 0 && hpr.covers(open_sorted[0].hours, cur_time)) {
        next_loc = open_sorted.shift()
        close_sorted = hpr.rmv_item(close_sorted, next_loc)
      } else {
        next_loc = {name: this.wait_name, address: this.wait_address}
      }
      //Add to itinerary, adjust times, etc
      let cur_loc = (itinerary.length > 0) ? itinerary[itinerary.length-1].loc : null
      let [start_time, arrive_time, leave_time] = [cur_time, cur_time, cur_time]
      if (next_loc.name === this.null_rest_name) { //null meal time - assume 0 travel time, stay 2 hours like normal meal
        leave_time = hpr.addTime(leave_time, null_stay_time)
      } else if (next_loc.name === this.wait_name) { //wait - assume 0 travel time, stay until next open location
        let [next_open_time, next_close_time, next_meal_time] = [open_sorted[0].hours[0], close_sorted[0].hours[0], 10e10]
        if (meals.length > 0) {
          next_meal_time = this.meal_hours[(2-meals.length)][0]
          next_meal_time = (meals[0]) ? Math.max(meals[0].hours[0], next_meal_time) : next_meal_time
        }
        leave_time = Math.min(next_open_time, next_close_time, next_meal_time)
      } else { //actual location - add travel time to arrive_time, and stay time on top of that
        let travel_time = (!cur_loc || cur_loc.name === this.null_rest_name || cur_loc.name === this.wait_name) ? 0 : hpr.find_dist(dist_matrix, loc_names, cur_loc.name, next_loc.name)
        arrive_time = hpr.addTime(start_time, travel_time, travel_rounding)
        leave_time = hpr.addTime(arrive_time, next_loc.time, stay_rounding)
      }
      itinerary.push({start:start_time, arrive:arrive_time, leave:leave_time, loc:next_loc})
      cur_time = leave_time
    }
    //console.log("itinerary")
    //If we finish early, account for remaining meals, and add to end of itinerary    
    if (meals.length > 0) {
      for (let i = 0; i < meals.length; i++) {
        let normal_hours = (meals.length === 2 && i === 0) ? this.meal_hours[0] : this.meal_hours[1]
        let stay_time = (meals[i]) ? meals[i].time : null_stay_time
        let start_time = (meals[i]) ? Math.max(normal_hours[0], meals[i].hours[0]) : normal_hours[0]
        if(cur_time <= start_time) {
          let loc = (meals[i]) ? meals[i] : {name: this.null_rest_name, address: this.null_rest_address}
          itinerary.push({start:start_time, arrive:start_time, leave:hpr.addTime(start_time, stay_time, stay_rounding), loc:loc})          
        }
      }
    }
    //console.log("done")
    return itinerary
  }
}