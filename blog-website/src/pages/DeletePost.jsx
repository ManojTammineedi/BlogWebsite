import React, { useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";

export default function DeletePost() {
  const { id } = useParams();
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [redirect, setRedirect] = useState(false);

  async function deletePost(ev) {
    console.log("hello");
    ev.preventDefault();

    const data = new FormData();
    data.set("id", id);
    console.log(id);
    const response = await fetch(`https://blogwebsite-w8ot.onrender.com:4000/post/${id}`, {
      method: "DELETE",
    });
    if (response.ok) {
      setRedirect(true);
    }
  }

  if (redirect) {
    return <Navigate to="/" />;
  }

  return (
    <>
      <div>Do you want to delete the post?</div>
      <button
        className="delete-btn"
        style={{ marginTop: "5px" }}
        onClick={deletePost}
      >
        Delete Post
      </button>
    </>
  );
}
