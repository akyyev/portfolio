import React from "react";
import PropTypes from "prop-types";
import { marked } from "marked";

marked.setOptions({ breaks: true });

const Spinner = () => (
  <>
    <style>
      {`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}
    </style>
    <div style={spinnerWrapperStyle}>
      <div style={spinnerStyle}></div>
    </div>
  </>
);

const MarkdownMessage = ({ message, type, loader }) => {
  const isLoading = loader?._owner?.return?.memoizedProps?.props?.loading;

  const containerStyle = {
    fontFamily: "Arial, sans-serif",
    fontSize: "14px",
    lineHeight: "1.4",
    color: "#131313ff",
    backgroundColor: type === "robot" ? "#e1e9faff" : "#f9f9f9",
    padding: "8px",
    borderRadius: "12px",
    margin: "4px 0",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    wordWrap: "break-word",
    overflowWrap: "break-word",
    maxWidth: "90%",
    boxSizing: "border-box",
    overflowX: "auto",
    alignSelf: "flex-start",
    position: "relative",
  };

  return (
    <div style={containerStyle} className="markdown-message">
      {isLoading ? <Spinner /> : (
        <div dangerouslySetInnerHTML={{ __html: marked(message) }} />
      )}
    </div>
  );
};

const spinnerWrapperStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "40px",
};

const spinnerStyle = {
  width: "24px",
  height: "24px",
  border: "4px solid #ccc",
  borderTop: "4px solid #333",
  borderRadius: "50%",
  animation: "spin 1s linear infinite",
  margin: "auto",
};

MarkdownMessage.propTypes = {
  message: PropTypes.string.isRequired,
  type: PropTypes.string,
  loader: PropTypes.object,
};

export default MarkdownMessage;
