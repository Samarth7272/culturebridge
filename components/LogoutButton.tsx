"use client";

export default function LogoutButton() {
  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }
  return <button onClick={logout}>Logout</button>;
}