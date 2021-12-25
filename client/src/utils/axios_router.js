import axios from "axios";

const http = axios.create({
    baseURL: "",
    headers: {
        "Content-type": "application/json"
    }
});

export default class AxiosRouter {
  static async signin(user) {
    const result = await http.post("./auth/signin", user);
    return result;
  }

  static async signup(user) {
    const result = await http.post('./auth/signup', user);
    return result;
  }

  static async signedin() {
    const result = await http.get("./auth/verified");
    return result;
  }

  static async findUser(username) {
    const result = await http.post("./auth/findUser", username);
    return result;
  }

  static async logout() {
    const result = await http.delete("./auth/logout");
    return result;
  }

  static async addList(newList) { //Need input as JSON, newList is a string
    const result = await http.put("./addList", {"newList": newList});
    return result;
  }

  static async delList(listName) { //Need input as JSON, listName is a string
    const result = await http.put("./delList", {"delList": listName});
    return result;
  }

  static async selectList(specList) {
    const result = await http.put("./selectList", {"specList": specList});
    return result;
  }

  static async addLoc(newLoc) {
    const result = await http.put("./addLoc", newLoc);
    return result;
  }

  static async delLoc(delLoc) {
    const result = await http.put("./delLoc", delLoc);
    return result;
  }

  static async editLoc(editLoc) {
    const result = await http.put("./editLoc", editLoc);
    return result;
  }

  static async distMatrix(distParams) {
    const result = await http.post("./distMatrix", distParams);
    return result;
  }

  static updateItinParams(newItin) {
    const result = http.put("./updateItinParams", newItin);
    return result;
  }
}