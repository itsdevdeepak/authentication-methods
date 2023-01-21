import { Router } from "express";
import {
  authenticateWithGoogle,
  getWebAuthnOptions,
  verifyWebAuthnOptions,
  getUserdata,
} from "./controlers.js";

const router = Router();

router.get("/user", getUserdata);
router.get("/oauth/google", authenticateWithGoogle);

router.post("/register/webauthn", getWebAuthnOptions);
router.post("/register/verify/webauthn", verifyWebAuthnOptions);

// TODO: controlers same as registration
router.post("/signin/webauthn", (req, res) => {});
router.post("/signin/verify/webauthn", (req, res) => {});

export default router;
