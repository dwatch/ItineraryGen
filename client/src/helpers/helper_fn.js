import Math, { ceil, floor, max } from "math";

export default class helper {
  static initLoc = () => {
    let blank_loc = {
      name: "",
      place_id: "",
      address: "",
      types: [],
      hours: {},
      lat: 0,
      lng: 0,
      val: 0,
      time: 0,
    }
    return blank_loc
  }
  
  static dayFromDate = (dt) => {
    const weeks = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    let day = dt.getDay()
    return weeks[day]
  }

  static timeNumToStr = (time) => {
    let time_str = time.toString()
    if (time_str.length < 4) {
      time_str = [...Array(4-time_str.length).fill("0"), time_str].join("")
    }
    return [time_str.slice(0,2), time_str.slice(2)].join(":")
  }
  
  static toDate = (dt) => {
    let dt_arry = dt.split("-")
    let dt_str = [dt_arry[1], dt_arry[2], dt_arry[0]].join("/")
    let new_dt = new Date(dt_str)
    return new_dt
  }

  static toTime = (t) => {
    let t_arr = t.split(":").join("")
    return parseInt(t_arr)
  }

  static overlap = (l1, l2) => {
    return (l1.filter(x => l2.includes(x)).length === 0) ? false : true
  }

  static haverDist = (loc1, loc2) => {
    let hLatM = Math.sin((loc2.lat - loc1.lat)/2)**2
    let hLatP = Math.sin((loc2.lat + loc1.lat)/2)**2
    let hLng = Math.sin((loc2.lng - loc1.lng)/2)**2
    return 2 * Math.asin(Math.sqrt(hLatM + (1 - hLatM - hLatP) * hLng))
  }

  static centroid = (locs) => {
    let c = {"x":0, "y":0, "z":0}
    let len = 0;
    for (let key of Object.keys(locs)) {
      let lat = locs[key].lat * Math.PI / 180
      let lng = locs[key].lng * Math.PI / 180
      c.x += Math.cos(lat) * Math.cos(lng)
      c.y += Math.cos(lat) * Math.sin(lng)
      c.z += Math.sin(lat)
      len += 1
    }
    for (let subcoord of Object.keys(c)) {
      c[subcoord] /= len
    }
    let cLat = Math.atan2(c.z, Math.sqrt(c.x**2 + c.y**2)) * 180 / Math.PI
    let cLng = Math.atan2(c.y, c.x) * 180 / Math.PI
    return {"lat": cLat, "lng": cLng}
  }

  static google_dist_query_to_matrix = (res) => {
    let matrix = []
    res.map(row => {
      let row_arr = []
      row.elements.map(destination => {
        if (destination.duration) {
          row_arr.push(destination.duration.value/3600) //Duration vals are in seconds, convert to hours
        } else {
          row_arr.push(0)
        }
        return null
      })
      matrix.push(row_arr)
      return null
    })
    return matrix
  }

  static covers = (range1, range2) => { // Assumes both are len(2) arrays, or that range2 is a number
    if (typeof(range2) === "number") {
      return (range1[0] <= range2 && range1[1] >= range2)
    } else {
      return (range1[0] <= range2[0] && range1[1] >= range2[1])
    }
  }

  static dict2list = (dict) => {
    let list = []
    Object.keys(dict).map(key=>{
      list.push(dict[key])
      return null
    })
    return list
  }

  static avg = (arr) => {
    return arr.reduce((a,b) => a + b, 0) / arr.length
  }

  static rmv_item = (list, item) => {
    let rm_idx = list.indexOf(item)
    if (rm_idx > -1) {
      list.splice(rm_idx, 1)
    }
    return list
  }

  static roundNearest = (num, minInc) => {
    return ceil(num / minInc) * minInc
  }

  static find_dist = (matrix, locs, start, end) => {
    let start_idx = locs.indexOf(start)
    let end_idx = locs.indexOf(end)
    return matrix[start_idx][end_idx]
  }

  //Assumes increment is in hours
  static addTime = (time, increment, round = 1) => {
    time += floor(increment) * 100
    let minutes = (time % 100) + this.roundNearest((increment % 1) * 60, round)
    if (minutes > 60) {
      minutes = floor(minutes/60) * 100 + (minutes % 60)
    }
    time = floor(time/100)*100 + minutes
    return time
  }

  static date_array = (sd, ed) => {
    let array = []
    let [cur_day, last_day] = [new Date(sd), new Date(ed)]
    while (cur_day <= last_day) {
      array.push(new Date(cur_day))
      cur_day.setDate(cur_day.getDate() + 1)
    }
    return array
  }

  //burn_hours is nhours we must burn each day on account of eating/resting/travelling
  static optimal_ndays = (locs, nhours, burn_hours = 5) => {
    let total_hours = 0
    for(let loc of Object.keys(locs)) {
      total_hours += locs[loc].time
    }
    return ceil(total_hours / max(1, (nhours - burn_hours)))
  }
}
