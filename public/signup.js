document.getElementById("signupForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = e.target.username.value;
  const password = e.target.password.value; 

  const res = await fetch("/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }) 
  });

  if (res.ok) {
    window.location.href = "login.html";
  } else {
    document.getElementById("signupError").textContent = "Signup failed";
  }
});
