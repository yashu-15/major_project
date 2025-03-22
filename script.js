document.addEventListener("DOMContentLoaded", function () {
    const signupForm = document.getElementById("signupForm");
    const message = document.getElementById("message");

    if (!signupForm) {
        console.error("❌ Error: Signup form not found!");
        return;
    }

    signupForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        // Get form field values
        const name = document.getElementById("signupName")?.value.trim();
        const email = document.getElementById("signupEmail")?.value.trim();
        const password = document.getElementById("signupPassword")?.value.trim();
        const phone = document.getElementById("signupPhone")?.value.trim();

        if (!name || !email || !password || !phone) {
            if (message) {
                message.style.color = "red";
                message.textContent = "⚠️ Please fill in all fields!";
            }
            return;
        }

        try {
            console.log("📤 Sending request:", { name, email, password, phone }); // Debugging

            const response = await fetch("http://localhost:5000/api/auth/signup", { 
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password, phone }),
            });

            const data = await response.json();
            console.log("✅ Server Response:", data); // Debugging

            if (response.ok) {
                if (message) {
                    message.style.color = "green";
                    message.textContent = "✅ Signup successful! Redirecting...";
                }
                setTimeout(() => {
                    window.location.href = "login.html"; 
                }, 2000);
            } else {
                if (message) {
                    message.style.color = "red";
                    message.textContent = `❌ Error: ${data.message || "Signup failed"}`;
                }
            }
        } catch (error) {
            if (message) {
                message.style.color = "red";
                message.textContent = "❌ Something went wrong!";
            }
            console.error("❌ Signup Error:", error);
        }
    });
});
