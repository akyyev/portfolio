import React from "react";
import chatbotIcon from "./robotAvatar.png";
import userAvatar from "./userAvatar.png";

const CustomBotAvatar = (): React.ReactElement => (
  <div className="custom-avatar">
    <img src={chatbotIcon} alt="Bot Avatar" style={{ width: 40 }} />
  </div>
);

const CustomUserAvatar = (): React.ReactElement => (
  <div className="custom-avatar">
    <img src={userAvatar} alt="User Avatar" style={{ width: 35 }} />
  </div>
);

export { CustomBotAvatar, CustomUserAvatar };
