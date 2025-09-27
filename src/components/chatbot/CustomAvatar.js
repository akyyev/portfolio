import chatbotIcon from "./robotAvatar.png";
import userAvatar from "./userAvatar.png";

const CustomBotAvatar = () => {
  return (
    <div className="custom-avatar">
      <img src={chatbotIcon} alt="Bot Avatar" style={{ width: 40 }} />
    </div>
  );
};

const CustomUserAvatar = () => {
  return (
    <div className="custom-avatar">
      <img src={userAvatar} alt="User Avatar" style={{ width: 35 }} />
    </div>
  );
};

// Export as named components
export { CustomBotAvatar, CustomUserAvatar };
