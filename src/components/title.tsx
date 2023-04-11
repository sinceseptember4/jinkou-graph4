import React, { CSSProperties } from "react";
import { Helmet } from "react-helmet";

export const Title = () => {
  const patent: CSSProperties = {
    height: "10em",
    position: "relative",
  };
  const font: CSSProperties = {
    fontFamily: "Kosugi Maru, sans-serif",
    margin: "0",
    background: "yellow",
    position: "absolute",
    top: "50%",
    left: "50%",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
  };
  return (
    <div style={patent}>
      <Helmet>
        <link
          href="https://fonts.googleapis.com/css2?family=Kosugi+Maru&display=swap"
          rel="stylesheet"
        />
      </Helmet>
      <h1 style={font}>RESAS(地域経済分析システム)都道府県別人口グラフ</h1>
    </div>
  );
};
