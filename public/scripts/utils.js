import config from "./config.js";

export const isValidEmail = (email) => {
  const emailPattern =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return email.toLowerCase().match(emailPattern);
};

export const getGoogleAuthURL = () => {
  const oauth2Endpoint = "https://accounts.google.com/o/oauth2/v2/auth";
  const options = {
    client_id: config.googleOAuthClientID,
    redirect_uri: config.googleOAuthRedirectURL,
    access_type: "offline",
    response_type: "code",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ].join(" "),
  };

  const qs = new URLSearchParams(options);
  console.log(`${oauth2Endpoint}?${qs.toString()}`);
  return `${oauth2Endpoint}?${qs.toString()}`;
};
