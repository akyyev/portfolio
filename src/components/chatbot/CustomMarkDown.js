import React from "react";
import PropTypes from "prop-types";
import { marked } from "marked";

marked.setOptions({ breaks: true });

const styles = {
  container: {
    fontFamily: "Arial, sans-serif",
    fontSize: "14px",
    lineHeight: "1.4",
    color: "#333",
    backgroundColor: "#f9f9f9",
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
  },
  spinnerWrapper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "40px",
  },
  spinner: {
    width: "24px",
    height: "24px",
    border: "4px solid #ccc",
    borderTop: "4px solid #333",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "auto",
  },
};

const MarkdownMessage = ({ message, loader }) => {
  const isLoading =
    loader?._owner?.return?.memoizedProps?.props?.loading ?? true;

  return (
    <div style={styles.container} className="markdown-message">
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      {isLoading ? (
        <div style={styles.spinnerWrapper}>
          <div style={styles.spinner}></div>
        </div>
      ) : (
        <div dangerouslySetInnerHTML={{ __html: marked(message) }} />
      )}
    </div>
  );
};

MarkdownMessage.propTypes = {
  message: PropTypes.string.isRequired,
  loader: PropTypes.object,
};

export default MarkdownMessage;
