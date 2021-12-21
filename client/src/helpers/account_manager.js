//Imports
import AxiosRouter from "../utils/axios_router.js";

const blankUser = {
  auth: false,
  name: "",
  username: "",
  password: "",
  lists: {},
  specList: "",
  itin_dets: null
}

export default class Acct {
  constructor(context, user = blankUser, setUser = null) {
    this.context = context;
    this.user = user;
    this.setUser = setUser;
  }

  static get blankUser() {
    return blankUser;
  }
  
  assignUser(user, setUser) {
    this.user = user;
    this.setUser = setUser;
  }

  handleFieldChange = (prop) => {
    const {name, value} = prop.target;
    this.setUser({ ...this.user, [name]: value })
  }

  handleSignIn = async (e) => {
    console.log("Logging In")
    console.log(this.user)
    e.preventDefault();
    const res = await AxiosRouter.signin(this.user);
    if (res.data.auth) {
      this.context.setAuth(res.data.user);
    }
  }

  handleSignUp = async (e) => {
    e.preventDefault();
    const userExists = await AxiosRouter.findUser(this.user);
    if (userExists.data.found) {
      window.alert("This username already exists! Please choose another one")
    } else {
      const res = await AxiosRouter.signup(this.user);
      if (res.data.auth) {
        this.context.setAuth(res.data.user);
      }  
    }
  }

  handleSignOut = async () => {
    const res = await AxiosRouter.logout();
    if (res) {
      this.context.setAuth(blankUser);
      this.user = blankUser;
    }
  }
}