//Imports
import AxiosRouter from "../utils/axios_router.js";
import hpr from "./helper_fn.js";

const updateContext = (context, field, value) => {
  let newAuth = context.auth
  newAuth[field] = value
  context.setAuth(newAuth)
}

export class init_loc {
  
}

export class List_Manager {
  constructor(context, history, newList = null, setNewList = null) {
    this.context = context;
    this.newList = newList;
    this.setNewList = setNewList;
    this.history = history;
  }

  addList = (list, setList) => {
    this.newList = list;
    this.setNewList = setList;
  }

  selectList = (prop) => {
    updateContext(this.context, "specList", prop.target.name)
    AxiosRouter.selectList(this.context.auth.specList)
    let specListURL = ["", this.context.auth.username, this.context.auth.specList].join("/")
    this.history.push(specListURL)
  }

  makeList = async (prop) => {
    if (prop.target.value === "Add List") {
      console.log("Sending create list request")
      const res = await AxiosRouter.addList(this.newList);
      console.log(res)
      if (res.data.lists) {
        updateContext(this.context, "lists", res.data.lists)
        this.setNewList("")
      }
    } else {
      this.setNewList(prop.target.value);
    }
  }

  deleteList = async (prop) => {
    const res = await AxiosRouter.delList(prop.target.name);
    (res.data.lists) 
      ? updateContext(this.context, "lists", res.data.lists)
      : console.log("Failed to delete list")
    this.setNewList(this.newList + " ")
  }

  leaveSpecList = () => {
    updateContext(this.context, "specList", "")
    AxiosRouter.selectList(this.context.auth.specList)
    this.history.push("/" + this.context.auth.username)
  }

}

export class Location_Manager {
  constructor(context, history, newList = null, setNewList = null, newLoc = null, setNewLoc = null) {
    this.context = context;
    this.history = history;
    this.newList = newList;
    this.setNewList = setNewList;
    this.newLoc = newLoc;
    this.setNewLoc = setNewLoc;
  }

  assignLoc(list, setList, loc, setLoc) {
    this.newList = list;
    this.setNewList = setList;
    this.newLoc = loc;
    this.setNewLoc = setLoc;
  }

  makeLoc = async (prop) => {
    //console.log(prop.target)
    if (prop.target.value === "Add" && this.newLoc.name && this.newLoc.name !== "" && this.newLoc.time !== 0) {
      let req = {
        specList: this.context.auth.specList,
        loc: this.newLoc
      }
      const res = await AxiosRouter.addLoc(req);
      if (res.data.lists) {
        this.context.auth.lists = res.data.lists;
        this.setNewList(res.data.lists[this.context.auth.specList])
        this.newLoc = hpr.initLoc()
      }
    } else {
      let {name, value} = prop.target
      this.setNewLoc({...this.newLoc, [name]: value})
    }
  }  

  deleteLoc = async (prop) => {
    let req = {
      specList: this.context.auth.specList,
      loc: prop.target.name
    }
    const res = await AxiosRouter.delLoc(req);
    if (res.data.lists) {
      this.context.auth.lists = res.data.lists;
      this.setNewList(res.data.lists[this.context.auth.specList])
      this.setNewLoc(hpr.initLoc());
    }
  }

  editListItem = async (prop) => {
    let value = (prop.target.value === "") ? 0 : prop.target.value;
    let [key, field] = prop.target.name.split('|');
    let data = this.newList[key]
    data[field] = value
    this.setNewList({...this.newList, [key]: data});
  }

  updateList = async () => {
    let req = {
      specList: this.context.auth.lists
    }
    await AxiosRouter.editLoc(req);
  }
}