import { useState } from "react";

export default function RegisterPage() {
  const [username, setusername] = useState("");
  const [password, setpassword] = useState("");
  async function register(ev) {
    ev.preventDefault();
    const response = await fetch("https://blogwebsite-w8ot.onrender.com/register", {
      method: "POST",
      body: JSON.stringify({ username, password }),
      headers: { "Content-Type": "application/json" },
    });
    if (response.status === 200) {
      alert("registration successful");
    } else {
      alert("registration failed");
    }
  }
  return (
    <>
      <form className="register" onSubmit={register}>
        <h1>Register</h1>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(ev) => setusername(ev.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(ev) => setpassword(ev.target.value)}
        />
        <button type="submit">Register</button>
      </form>
    </>
  );
}
