import ItineraryDAO from "./fnsDAO.js";
import distance from "google-distance-matrix";

distance.transit_routing_preference('fewer_transfers');
distance.key(process.env.REACT_APP_GOOGLE_API_KEY)

export default class ListController { 
  static async AddList(req, res) {
    console.log("Adding List")
    let user_id = req.session.user_id
    let newListName = req.body.newList
    let oldLists = req.session.lists
    oldLists[newListName] = {}
    const DAOresponse = await ItineraryDAO.changeLists(user_id, oldLists)
    if (DAOresponse.matchedCount) {
      req.session.lists = oldLists
      return res.json({
        message: `${newListName} was added successfully`,
        lists: oldLists
      })
    } else {
      return res.json({
        message: `${newListName} failed to add`,
        lists: null
      })
    }
  }

  static async DelList(req, res) {
    console.log("Deleting List")
    let user_id = req.session.user_id
    let listToDel = req.body.delList
    let oldLists = req.session.lists
    delete oldLists[listToDel]
    const DAOresponse = await ItineraryDAO.changeLists(user_id, oldLists)
    if (DAOresponse.matchedCount) {
      req.session.lists = oldLists
      return res.json({
        message: `${listToDel} was deleted successfully`,
        lists: oldLists
      })
    } else {
      return res.json({
        message: `${listToDel} failed to delete`,
        lists: null
      })
    }
  }

  static SelectList(req, res) {
    req.session.specList = req.body.specList
    console.log(`Selecting existing list: ${req.session.specList}`)
    return res.json({
      message: `${req.body.specList} has been selected`
    })
  }

  static async AddLoc(req, res) {
    let user_id = req.session.user_id
    let lists = req.session.lists
    let {specList, loc} = req.body
    loc.val = parseFloat(loc.val)
    loc.time = parseFloat(loc.time)
    lists[specList][loc.name] = loc
    console.log(`Adding Location: ${loc.name}`)
    const DAOresponse = await ItineraryDAO.changeLists(user_id, lists)
    if (DAOresponse.matchedCount) {
      req.session.lists = lists
      return res.json({
        message: `${loc.name} was added to ${specList} successfully`,
        lists: lists
      })
    } else {
      return res.json({
        message: `${loc.name} failed to add`,
        lists: null
      })
    }
  }

  static async EditLoc(req, res) {
    console.log("Editing an Item")
    let user_id = req.session.user_id
    let lists = req.body.specList
    const DAOresponse = await ItineraryDAO.changeLists(user_id, lists)
    if (DAOresponse.matchedCount) {
      req.session.lists = lists
      return res.json({
        message: `List Edit was successful`,
        lists: lists
      })
    } else {
      return res.json({
        message: `List failed to update`,
        lists: null
      })
    }
  }

  static async DelLoc(req, res) {
    let user_id = req.session.user_id
    let lists = req.session.lists
    let {specList, loc} = req.body
    console.log(`Deleting Location: ${loc}`)
    delete lists[specList][loc]
    const DAOresponse = await ItineraryDAO.changeLists(user_id, lists)
    if (DAOresponse.matchedCount) {
      req.session.lists = lists
      return res.json({
        message: `${loc.name} was added to ${specList} successfully`,
        lists: lists
      })
    } else {
      return res.json({
        message: `${loc.name} failed to add`,
        lists: null
      })
    }
  }
  
  static async DistMatrix(req, res) {
    console.log("Fetching Distance Matrix")
    const origins = req.body.origins
    const destinations = req.body.destinations
    const mode = req.body.mode    
    distance.mode(mode)
    distance.matrix(origins, destinations, mode, function(err, distances) {
      if (!err) {
        res.json(distances.rows)
      } else {
        console.log(err)
      }
    })
  }

  static UpateItinParams(req, res) {
    console.log("Updating Itinerary Parameters")
    req.session.itin_dets = req.body
    return res.json({
      message: `Itinerary Params have been updated`
    })
  }
}