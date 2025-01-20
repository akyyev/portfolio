
/*==================== EMAIL FUNCTIONALITY ====================*/
const sendEmailBtn = document.getElementById("sendEmail");
const message = document.getElementById("message");
const userName = document.getElementById("userName");
const email = document.getElementById("email");

sendEmailBtn.addEventListener("click", async () => {
    if(!userName.value || !email.value || !message.value) {
      alert("Please fill in all fields!");
      return;
    }
    const response = await fetch('https://formspree.io/f/xyzzawnd', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json'},
      body: JSON.stringify({
        subject: "Portfolio Contact Form, Email: " + email.value,
        name: userName.value,
        email: email.value,
        message: message.value
      }),
    });

    if(response.ok) {
      alert("Message delivered successfully!");
      message.value = "";
      email.value = "";
      userName.value = "";
    } else {
      const result = await response.json();
      alert("Failed to send message, Error: " + result.errors[0].message);
    }
    
});
