import React from "react";

const Footer = () => {
  const date = new Date();
  const year = date.getFullYear();
  return <footer>copyright reserved by Budget @{year}</footer>;
};

export default Footer;
