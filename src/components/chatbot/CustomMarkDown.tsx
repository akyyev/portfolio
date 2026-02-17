import React from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";

marked.setOptions({ breaks: true });

interface MarkdownMessageProps {
  message: string;
  type?: "robot" | "user";
  loader?: React.ReactElement;
}

const Spinner: React.FC = () => (
  <>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
    <div style={spinnerWrapperStyle}>
      <div style={spinnerStyle} />
    </div>
  </>
);

const spinnerWrapperStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "40px",
};

const spinnerStyle: React.CSSProperties = {
  width: "24px",
  height: "24px",
  border: "4px solid #ccc",
  borderTop: "4px solid #333",
  borderRadius: "50%",
  animation: "spin 1s linear infinite",
  margin: "auto",
};

const containerBaseStyle: React.CSSProperties = {
  fontFamily: "Arial, sans-serif",
  fontSize: "14px",
  lineHeight: "1.4",
  color: "#131313ff",
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

const MarkdownMessage: React.FC<MarkdownMessageProps> = ({ message, type, loader }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isLoading = (loader as any)?._owner?.return?.memoizedProps?.props?.loading;

  const containerStyle: React.CSSProperties = {
    ...containerBaseStyle,
    backgroundColor: type === "robot" ? "#e1e9faff" : "#f9f9f9",
  };

  const sanitizedHtml = DOMPurify.sanitize(marked(message) as string);

  return (
    <div style={containerStyle} className="markdown-message">
      {isLoading ? (
        <Spinner />
      ) : (
        <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
      )}
    </div>
  );
};

export default MarkdownMessage;
