document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;

    const res = await fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({username, password }),
    });
  
   if(res.ok){
    const data =await res.json();
    window.location.href = data.redirect;
   }else{
    document.getElementById("loginError").textContent = "Login failed";
   }


  });