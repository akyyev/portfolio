import React from "react";
import { Link } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const NotFound: React.FC = () => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "60vh",
      textAlign: "center",
      padding: "2rem",
    }}
  >
    <h1 style={{ fontSize: "4rem", marginBottom: "0.5rem" }}>404</h1>
    <p style={{ fontSize: "1.25rem", marginBottom: "2rem" }}>
      Oops — this page doesn't exist.
    </p>
    <Link
      to="/"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        color: "#5000ca",
        fontSize: "1rem",
        textDecoration: "none",
      }}
    >
      <ArrowBackIcon fontSize="small" /> Back to Home
    </Link>
  </div>
);

export default NotFound;
