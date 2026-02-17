import React, { ReactNode } from "react";

interface MessageParserProps {
  children: ReactNode;
  actions: {
    handleMessage: (message: string) => Promise<void>;
  };
}

const MessageParser: React.FC<MessageParserProps> = ({ children, actions }) => {
  const parse = (message: string) => {
    actions.handleMessage(message);
  };

  return (
    <div>
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<{ parse?: (msg: string) => void }>, {
              parse,
            })
          : child
      )}
    </div>
  );
};

export default MessageParser;
