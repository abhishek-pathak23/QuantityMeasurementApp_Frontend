 const BASE_URL = "http://localhost:5263/api";

async function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const errorEl = document.getElementById("error");

  errorEl.innerText = "";

  try {
    const res = await fetch(BASE_URL+"/Auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    let data = null;

    //HANDLE BOTH JSON & EMPTY RESPONSE
    try {
      data = await res.json();
    } catch (e) {
      data = null;
    }

    if (!res.ok) {
      console.log("Error Response:", data);

      errorEl.innerText =
        (data && data.message) ? data.message : "Invalid credentials";

      return;
    }

    // SUCCESS
    if (data && data.token) {
      localStorage.setItem("token", data.token);
      window.location.href = "dashboard.html";
    } else {
      errorEl.innerText = "Login failed (no token)";
    }

  } catch (err) {
    console.error(err);
    errorEl.innerText = "Server error. Try again.";
  }
}

async function signup() {
  const name=document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const res=await fetch(BASE_URL + "/Auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name,email, password })
  });
if(res.ok){
  alert("Signup successful");
  window.location.href = "login.html";}
  else{
    alert("user already exists");
  }

}