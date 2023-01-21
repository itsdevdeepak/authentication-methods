import { isValidEmail } from "./utils.js";

async function makePostRequest(url = "", data = {}) {
  const response = await fetch(url, {
    method: "POST",
    mode: "same-origin",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(data),
  });
  return response.json();
}

const endPoint = "http://localhost:3000/";

const { startRegistration } = SimpleWebAuthnBrowser;

const register = async (event) => {
  event.preventDefault();
  const errorMsg = document.getElementsByClassName("error")[0];
  const email = document.getElementById("email").value;

  if (!email && !isValidEmail(email)) {
    errorMsg.classList.remove("visibility-none");
    return;
  } else {
    errorMsg.classList.add("visibility-none");
  }

  const authOption = await makePostRequest(endPoint + "register/webauthn", {
    email: email,
  });
  let attResp;
  try {
    attResp = await startRegistration(authOption.data);
  } catch (e) {
    console.log(e);
  }

  console.log(attResp);

  const verificationJSON = await makePostRequest(
    endPoint + "register/verify/webauthn",
    { email: email, ...attResp }
  );

  if (verificationJSON && verificationJSON.verified) {
    window.location.reload();
  }
};

const formEle = document.getElementById("regform");
formEle.addEventListener("submit", register);
