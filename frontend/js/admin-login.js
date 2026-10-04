// ==========================================
// ADMIN LOGIN
// ==========================================

// Backend API
const API_URL = "https://saikat-my-portfolio.onrender.com";


// ==========================================
// PAGE LOAD
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    console.log("Admin login page loaded.");

    const loginForm =
        document.getElementById("adminLoginForm");

    if (!loginForm) {

        console.error(
            "ERROR: adminLoginForm not found."
        );

        return;
    }


    // ==========================================
    // LOGIN FORM SUBMIT
    // ==========================================

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            console.log("Login button clicked.");


            // ==========================================
            // GET INPUTS
            // ==========================================

            const usernameInput =
                document.getElementById("username");

            const passwordInput =
                document.getElementById("password");

            const messageElement =
                document.getElementById("loginMessage");


            const username =
                usernameInput
                    ? usernameInput.value.trim()
                    : "";

            const password =
                passwordInput
                    ? passwordInput.value
                    : "";


            // ==========================================
            // VALIDATION
            // ==========================================

            if (!username || !password) {

                showMessage(
                    messageElement,
                    "Please enter username and password.",
                    "error"
                );

                return;
            }


            // ==========================================
            // LOGIN BUTTON
            // ==========================================

            const loginButton =
                loginForm.querySelector(
                    'button[type="submit"]'
                );

            if (loginButton) {

                loginButton.disabled = true;

                loginButton.textContent =
                    "Logging in...";
            }


            try {

                console.log(
                    "Sending login request to:",
                    `${API_URL}/api/admin/login`
                );


                // ==========================================
                // SEND LOGIN REQUEST
                // ==========================================

                const response = await fetch(
                    `${API_URL}/api/admin/login`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        credentials: "include",

                        body: JSON.stringify({

                            username: username,

                            password: password

                        })
                    }
                );


                console.log(
                    "Login response status:",
                    response.status
                );


                const result =
                    await response.json();


                console.log(
                    "Login result:",
                    result
                );


                // ==========================================
                // LOGIN FAILED
                // ==========================================

                if (
                    !response.ok ||
                    !result.success
                ) {

                    showMessage(
                        messageElement,

                        result.message ||
                        "Invalid username or password.",

                        "error"
                    );


                    if (loginButton) {

                        loginButton.disabled =
                            false;

                        loginButton.textContent =
                            "Login";
                    }


                    return;
                }


                // ==========================================
                // LOGIN SUCCESS
                // ==========================================

                console.log(
                    "LOGIN SUCCESSFUL"
                );


                showMessage(
                    messageElement,

                    "Login successful. Opening dashboard...",

                    "success"
                );


                // ==========================================
                // SAVE ADMIN INFORMATION
                // ==========================================

                if (result.admin) {

                    localStorage.setItem(
                        "admin_username",

                        result.admin.username || ""
                    );

                    localStorage.setItem(
                        "admin_id",

                        String(
                            result.admin.id || ""
                        )
                    );
                }


                // ==========================================
                // OPEN DASHBOARD
                // ==========================================

                setTimeout(function () {

                    console.log(
                        "Opening admin dashboard..."
                    );


                    /*
                     * admin-login.html
                     * and
                     * admin.html
                     *
                     * are in the SAME folder.
                     *
                     * So this is the correct path.
                     */

                    window.location.href =
                        "admin.html";


                }, 700);


            } catch (error) {

                console.error(
                    "LOGIN ERROR:",
                    error
                );


                showMessage(
                    messageElement,

                    "Unable to connect to the backend server.",

                    "error"
                );


                if (loginButton) {

                    loginButton.disabled =
                        false;

                    loginButton.textContent =
                        "Login";
                }
            }

        }
    );

});


// ==========================================
// SHOW MESSAGE
// ==========================================

function showMessage(
    element,
    message,
    type
) {

    if (!element) {

        alert(message);

        return;
    }


    element.textContent =
        message;


    element.className =
        "login-message " + type;
}