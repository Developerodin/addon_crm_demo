"use client"
import "./globals.scss";
import { Provider } from "react-redux";
import store from "@/shared/redux/store";
import PrelineScript from "./PrelineScript";
import { useState } from "react";
import { Initialload } from "@/shared/contextapi";
import '../public/assets/css/dashboard-styles.css';

const RootLayout = ({children}:any) => {
  const [pageloading, setpageloading] = useState(false);

  return (
    <html lang="en">
      <head>
        <title>Addons</title>
        <meta name="description" content="Addons - Your AI Assistant" />
      </head>
      <body>
        <Provider store={store}>
          <Initialload.Provider value={{ pageloading, setpageloading }}>
            {children}
          </Initialload.Provider>
        </Provider>
        <PrelineScript />
      </body>
    </html>
  );
};

export default RootLayout;
