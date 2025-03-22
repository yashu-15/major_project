document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");
    const loginMessage = document.getElementById("loginMessage");

    if (!loginForm) {
        console.error("❌ Error: Login form not found!");
        return;
    }

    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = document.getElementById("loginEmail")?.value.trim();
        const password = document.getElementById("loginPassword")?.value.trim();

        if (!email || !password) {
            loginMessage.style.color = "red";
            loginMessage.textContent = "⚠️ Please enter email and password!";
            return;
        }

        try {
            console.log("📤 Sending login request:", { email, password });

            const response = await fetch("http://localhost:5000/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            let data;
            try {
                data = await response.json(); // Ensure JSON is valid
            } catch (jsonError) {
                throw new Error("Invalid JSON response from server!");
            }

            console.log("✅ Server Response:", data);

            if (response.ok) {
                loginMessage.style.color = "green";
                loginMessage.textContent = "✅ Login successful! Redirecting...";

                // ✅ Match the actual response format
                if (data.token && data.userId && data.name) {
                    localStorage.setItem("token", data.token);
                    localStorage.setItem("userId", data.userId);
                    localStorage.setItem("userName", data.name);

                    setTimeout(() => {
                        window.location.href = "dashboard.html"; // Redirect to dashboard
                    }, 2000);
                } else {
                    throw new Error("Missing required fields in response!");
                }
            } else {
                throw new Error(data.message || "Invalid credentials");
            }
        } catch (error) {
            loginMessage.style.color = "red";
            loginMessage.textContent = `❌ ${error.message}`;
            console.error("❌ Login Error:", error);
        }
    });
});
