import { auth } from "./firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

async function testLogin() {
  try {
    const cred = await signInWithEmailAndPassword(
      auth,
      "test@gmail.com",
      "Test1234"
    );
    console.log("User logged in:", cred.user);
  } catch (err) {
    console.error("Login failed:", err.message);
  }
}

testLogin();
