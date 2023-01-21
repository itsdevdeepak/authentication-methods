import { getGoogleAuthToken } from "./util.js";
import jwt from "jsonwebtoken";
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
} from "@simplewebauthn/server";

import { addUser, getUser, updateUser, getUserIdx } from "./db.js";

export const getUserdata = (req, res) => {
  const header = req.headers.authorization;
  if (!header) res.send(401).end();
  const [, token] = header.split(" ");
  if (!token) res.send(401).end();

  const verified = jwt.verify(token, process.env.JWT_SECRET);
  if (!verified) res.send(401).end();

  const user = jwt.decode(token);
  res.status(200).send(user);
};

export const authenticateWithGoogle = async (req, res) => {
  if (!req.query.code) res.status(400).end();

  const code = await getGoogleAuthToken(req.query.code);
  console.log(code.id_token);
  const googleUser = jwt.decode(code.id_token);
  console.log(googleUser);
  if (!googleUser) res.end();

  let user = getUser(googleUser.email);

  if (!user) {
    user = addUser({
      email: googleUser.email,
      name: googleUser.name,
      google: googleUser.aud,
    });
  }
  const accessToken = jwt.sign(
    {
      email: user.email,
      name: user.name,
      id: user.aud,
      google: user.aud,
    },
    process.env.JWT_SECRET
  );

  console.log("accessToken", accessToken);

  res.cookie("accessToken", accessToken);
  res.redirect(301, "/");
};

// == WebAuth Options ==
const rpName = "Authentication Methods";
const rpID = "localhost";
const origin = `http://${rpID}:3000`;

export const getWebAuthnOptions = (req, res) => {
  const email = req.body.email;
  if (!email) res.status(400).end();
  let user = getUser(email);
  if (!user) {
    let name = email.split("@")[0];
    user = addUser({ email, name });
  }

  // Todo: get from data
  const userAuthenticators = null;

  const options = generateRegistrationOptions({
    rpName,
    rpID,
    userID: user.id,
    userName: user.name,
    timeout: 60000,
    attestationType: "none",

    authenticatorSelection: {
      residentKey: "discouraged",
    },
    /**
     * Support the two most common algorithms: ES256, and RS256
     */
    supportedAlgorithmIDs: [-7, -257],
    // Todo: Add Exclude Authenticators
    excludeCredentials: [],
  });

  updateUser(user.id, { challenge: options.challenge });

  res.status(200).send({ data: options });
};

export const verifyWebAuthnOptions = async (req, res) => {
  const { body } = req;

  console.log(body);
  const user = getUser(req.body.email);
  if (!user) res.status(400).end();

  // get Challenge
  const expectedChallenge = user.challenge;

  let verification;
  try {
    verification = await verifyRegistrationResponse({
      response: body,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).send({ error: error.message });
  }

  const { verified } = verification;

  if (verified) {
    const { registrationInfo } = verification;
    const { credentialPublicKey, credentialID, counter } = registrationInfo;

    const newAuthenticator = {
      credentialID,
      credentialPublicKey,
      counter,
    };
    updateUser(user.id, { authenticators: [{ ...newAuthenticator }] });

    const accessToken = jwt.sign(
      {
        email: user.email,
        name: user.name,
        id: user.id,
      },
      process.env.JWT_SECRET
    );

    res.cookie("accessToken", accessToken);
    res.status(200).send({ verified: verified });
  } else {
    res.send(401).end();
  }
};
