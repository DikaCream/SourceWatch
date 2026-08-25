import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { SourceWatchProvider } from "./context/SourceWatchContext";

ReactDOM.createRoot(document.getElementById("root")!).render(<React.StrictMode><BrowserRouter><SourceWatchProvider><App /></SourceWatchProvider></BrowserRouter></React.StrictMode>);
