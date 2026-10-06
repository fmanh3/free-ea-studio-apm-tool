import ReactDOMServer from "react-dom/server";
import React from "react";
import App from "./src/App.tsx";

try {
  const html = ReactDOMServer.renderToString(React.createElement(App));
  console.log("RENDER SUCCESS! Length of rendered HTML:", html.length);
} catch (err) {
  console.error("RENDER FAILED! Error details:", err);
}
