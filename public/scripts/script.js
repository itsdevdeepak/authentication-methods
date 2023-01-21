import { getGoogleAuthURL } from "./utils.js";

const signPage = document.getElementById("form");
const welcomePage = document.getElementById("home");
const welcomeMsgEle = document.getElementById("welcome_msg");
const logoutBtn = document.getElementById("logout_btn");

function setLoggedOut() {
  console.log("asass");
  welcomePage.classList.add("visibility-none");
  signPage.classList.remove("visibility-none");
  document.cookie = "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
  logoutBtn.addEventListener("click", () => {
    setLoggedOut();
  });
}

const setLoggedIn = (username) => {
  welcomePage.classList.remove("visibility-none");
  signPage.classList.add("visibility-none");

  welcomeMsgEle.innerText = "Welcome " + username;
  logoutBtn.addEventListener("click", () => {
    setLoggedOut();
  });
};

const getCookie = (cname) => {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
};

if (getCookie("accessToken")) {
  try {
    const res = await fetch("http://localhost:3000/user", {
      method: "GET",
      headers: {
        // "Content-Type": "application/json",
        Authorization: "Bearer " + getCookie("accessToken"),
      },
    });
    const data = await res.json();
    if (data.name) {
      setLoggedIn(data.name);
    }
  } catch (e) {
    console.log(e);
  }
}

const continueWithGoogleEle = document.getElementById("continue-with-google");
continueWithGoogleEle.href = getGoogleAuthURL();
