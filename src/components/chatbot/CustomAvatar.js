import chatbotIcon from "./avatar.png";

const CustomAvatar = () => {
  return (
    <div className="custom-avatar">
      <img src={chatbotIcon} alt="Bot Avatar" style={{ width: 45 }} />
    </div>
  );
};

export default CustomAvatar;
