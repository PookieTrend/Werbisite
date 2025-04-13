document.addEventListener("DOMContentLoaded", async function () {
    const supabaseUrl = "https://qonnughbkdvopqwqmxow.supabase.co";
    const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvbm51Z2hia2R2b3Bxd3FteG93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwNTg1NDQsImV4cCI6MjA1NzYzNDU0NH0.MHA50QOAOe9c5DzDl_I4RdBakcbVJEeG0mv3Zkh-0So";
    const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

    const closeForgotPasswordButton = document.getElementById("close-forgot-password-popup");
    const forgotPasswordLink = document.querySelector(".forgot-password a");
    const forgotPasswordPopup = document.getElementById("forgot-password-popup");
    const otpPopup = document.getElementById("otp-popup");
    const sendResetLinkButton = document.getElementById("send-reset-link");
    const verifyOtpButton = document.getElementById("verify-otp");

    let generatedOTP = null;
    let userEmail = null;

    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener("click", function (event) {
            event.preventDefault();
            forgotPasswordPopup.style.display = "block";
        });
    }

    if (sendResetLinkButton) {
        sendResetLinkButton.addEventListener("click", async function () {
            userEmail = document.getElementById("reset-email").value.trim();
            if (!userEmail) {
                alert("Please enter your email.");
                return;
            }

            const { data, error } = await supabase
                .from('users')
                .select('id')
                .eq('email', userEmail)
                .single();

            if (error || !data) {
                alert("No user found with this email.");
                return;
            }

            // Generate OTP
            generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();

            // Store OTP in sessionStorage
            sessionStorage.setItem('otp', generatedOTP);
            sessionStorage.setItem('user_id', data.id);

            // Send OTP via Brevo (Sendinblue)
            fetch("https://api.brevo.com/v3/smtp/email", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "api-key": "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"
                },
                body: JSON.stringify({
                    sender: { name: "Pookie Trend", email: "trendpookie@gmail.com" },
                    to: [{ email: userEmail }],
                    subject: "Password Reset OTP",
                    htmlContent: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f0f0f0; border-radius: 10px; border: 1px solid #ddd;">
                    <div style="text-align: center;">
                        <img src="https://qonnughbkdvopqwqmxow.supabase.co/storage/v1/object/sign/product-images/LOGO4.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJwcm9kdWN0LWltYWdlcy9MT0dPNC5wbmciLCJpYXQiOjE3NDI2ODU5MTIsImV4cCI6MTkwMDM2NTkxMn0.Y2L94dHjbhAE3KCmQnx1V6z4dLfBOOdLkc8Bp9T3dU0" alt="Pookie Trend Logo" width="100" style="margin-bottom: 20px;">
                        <h2 style="color: #C71585;">OTP Verification</h2>
                    </div>
                    <p style="color: #333; line-height: 1.6;">
                        Hello,<br><br>
                        Your One-Time Password (OTP) for verification is:
                    </p>
                    <div style="text-align: center; margin: 20px 0;">
                        <span style="font-size: 24px; font-weight: bold; padding: 10px 20px; background-color: #C71585; color: white; border-radius: 5px;">${generatedOTP}</span>
                    </div>
                    <p style="color: #333; line-height: 1.6;">
                        Please enter this OTP to proceed. This OTP is valid for the next <strong>5 minutes</strong>.<br><br>
                        If you did not request this, you can safely ignore this email.<br><br>
                        Best regards,<br>
                        <strong>Pookie Trend</strong>
                    </p>
                    <div style="text-align: center; margin-top: 30px;">
                        <img src="https://qonnughbkdvopqwqmxow.supabase.co/storage/v1/object/sign/product-images/LOGO4.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJwcm9kdWN0LWltYWdlcy9MT0dPNC5wbmciLCJpYXQiOjE3NDI2ODU5MTIsImV4cCI6MTkwMDM2NTkxMn0.Y2L94dHjbhAE3KCmQnx1V6z4dLfBOOdLkc8Bp9T3dU0" alt="Pookie Trend Logo" width="80">
                    </div>
                </div>`
                })
            }).then(response => {
                if (response.ok) {
                    alert("OTP sent to your email.");
                    forgotPasswordPopup.style.display = "none";
                    otpPopup.style.display = "block";
                } else {
                    alert("Failed to send OTP. Please try again.");
                }
            });
        });
    }

    if (verifyOtpButton) {
        verifyOtpButton.addEventListener("click", function () {
            const enteredOtp = document.getElementById("otp-input").value.trim();
            const storedOtp = sessionStorage.getItem('otp');
            const otpErrorAlert = document.getElementById("otp-error-alert");
            const otpErrorMessage = document.getElementById("otp-error-message");
    
            if (enteredOtp === storedOtp) {
                alert("OTP Verified Successfully.");
                sessionStorage.removeItem('otp');
                window.location.href = "reset-password.html";
            } else {
                otpErrorAlert.style.display = "block";
                otpErrorMessage.textContent = "Invalid OTP. Please try again.";
                setTimeout(() => {
                    otpErrorAlert.style.display = "none";
                }, 3000); // Hide error message after 3 seconds
            }
        });
    }
    


    async function hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener("click", function (event) {
            event.preventDefault();
            forgotPasswordPopup.style.display = "block";
        });
    }

    if (closeForgotPasswordButton) {
        closeForgotPasswordButton.addEventListener("click", function () {
            forgotPasswordPopup.style.display = "none";
        });
    }

    const privacyLink = document.querySelector(".privacy a");
    const privacyPopup = document.getElementById("privacy-popup");
    const closePrivacyButton = document.getElementById("close-privacy-popup");

    if (privacyLink && privacyPopup && closePrivacyButton) {
        privacyLink.addEventListener("click", function (event) {
            event.preventDefault();
            privacyPopup.style.display = "block";
            document.body.style.overflow = "hidden"; // Disable background scrolling
        });

        closePrivacyButton.addEventListener("click", function () {
            privacyPopup.style.display = "none";
            document.body.style.overflow = "auto"; // Enable background scrolling
        });
    }


    const closeBtn = document.getElementById("close-popup");
    const popup = document.getElementById("welcome-popup");

    if (closeBtn && popup) {
        closeBtn.addEventListener("click", function () {
            popup.style.display = "none";
            document.body.style.overflow = "auto"; // Allow scrolling again
        });
    }

    const loginForm = document.querySelector("form");

    const errorAlert = document.getElementById("errorAlert");
    const closeButton = document.getElementById("error-close-btn");

    // Attach the event listener for the close button
    closeButton.addEventListener("click", function () {
        errorAlert.style.display = "none";  // Hide the alert box when the close button is clicked
    });

    // Function to show the error alert
    function showErrorAlert(message) {
        const errorAlert = document.getElementById("errorAlert");
        const errorMessage = document.getElementById("errorMessage");
        errorMessage.textContent = message;
        errorAlert.style.display = "flex";
    }


    // Real-Time Validation Function
    function validateInput(input, regex, warningMessage) {
        if (!regex.test(input.value)) {
            input.style.border = "1px solid red";

            // Display the red alert box when there is an error
            showErrorAlert(warningMessage);
        } else {
            input.style.border = "";
        }
    }

    // Username Validation
    const usernameInput = document.getElementById("username");
    if (usernameInput) {
        usernameInput.addEventListener("input", () => {
            validateInput(usernameInput, /^[a-zA-Z0-9]+$/, "Invalid username! Only alphanumeric characters are allowed.");
        });
    }

    // Password Validation
    const passwordInput = document.getElementById("password");
    if (passwordInput) {
        passwordInput.addEventListener("input", () => {
            validateInput(passwordInput, /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                "Password must be at least 8 characters with letters, numbers, and special characters.");
        });
    }

    // Email Validation (Only for Register Page)
    const emailInput = document.getElementById("email");
    if (emailInput) {
        emailInput.addEventListener("input", () => {
            validateInput(emailInput, /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, "Invalid email format.");
        });
    }

    // Login User
    if (loginForm) {
        loginForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const username = usernameInput.value.trim();
            const password = passwordInput.value.trim();

            if (username === "" || password === "") {
                alert("Please fill all the fields.");
                return;
            }

            const hashedPassword = await hashPassword(password);

            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('username', username)
                .eq('password', hashedPassword)
                .single();

            if (error || !data) {
                alert("Invalid username or password.");
            } else {
                // console.log("User ID fetched: ", data.id);
                localStorage.setItem('user_id', data.id);
                sessionStorage.setItem('user_id', data.id);
                alert("Login successful!");
                window.location.href = "product.html";
            }
        });
    }
});
