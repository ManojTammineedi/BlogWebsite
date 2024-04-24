import "./App.css";
import Post from "./Post";
import Header from "./Header";
import { Route, Routes } from "react-router-dom";
import Layout from "./Layout";
import IndexPage from "../src/pages/IndexPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./RegisterPage";
import { UserContextProvider } from "./UserContext";
import CreatePost from "./pages/CreatePost";
import Postpage from "./pages/Postpages";
import EditPost from "./pages/EditPost";
import DeletePost from "./pages/DeletePost";

function App() {
  return (
    <UserContextProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<IndexPage />} />
          <Route path={"/login"} element={<LoginPage />} />
          <Route path={"/register"} element={<RegisterPage />} />
          <Route path={"/create"} element={<CreatePost />} />
          <Route path={"/post/:id"} element={<Postpage />} />
          <Route path={"/edit/:id"} element={<EditPost />} />
          <Route path={"/delete/:id"} element={<DeletePost />} />
        </Route>
      </Routes>
    </UserContextProvider>
  );
}

export default App;
