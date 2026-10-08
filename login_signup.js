const loginPanel = document.querySelector("#login-panel");
const signupPanel = document.querySelector("#signup-panel");
const supportsPasswordMask = CSS.supports("-webkit-text-security", "disc");

if (supportsPasswordMask) {
    document.querySelectorAll(".password-control input[type='password']").forEach((input) => {
        input.type = "text";
        input.classList.add("password-masked");
    });
}

document.querySelectorAll(".password-control input").forEach((input) => {
    input.addEventListener("copy", (event) => {
        if (!event.clipboardData) {
            return;
        }

        event.clipboardData.setData("text/plain", input.value);
        event.preventDefault();
    });
});

document.querySelectorAll("[data-show]").forEach((link) => {
    link.addEventListener("click", (event) => {
        event.preventDefault();
        showPanel(link.dataset.show);
    });
});

document.querySelectorAll("[data-password-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
        const input = document.getElementById(button.getAttribute("aria-controls"));
        const showPassword = button.getAttribute("aria-pressed") !== "true";

        if (supportsPasswordMask) {
            input.classList.toggle("password-masked", !showPassword);
        } else {
            input.type = showPassword ? "text" : "password";
        }

        button.setAttribute("aria-pressed", String(showPassword));
        button.setAttribute("aria-label", showPassword ? "Hide password" : "Show password");
    });
});

function showPanel(panel, resetPrevious = true) {
    const isSignup = panel === "signup";
    const panelToShow = isSignup ? signupPanel : loginPanel;
    const panelToReset = isSignup ? loginPanel : signupPanel;

    if (panelToShow.hidden && resetPrevious) {
        resetPanelState(panelToReset);
    }

    loginPanel.hidden = isSignup;
    signupPanel.hidden = !isSignup;
    history.replaceState(null, "", isSignup ? "#signup" : "#login");
    document.querySelector(isSignup ? "#signup-name" : "#login-identity").focus();
}

if (window.location.hash === "#signup") {
    showPanel("signup", false);
}

function setFieldError(input, message) {
    const error = document.querySelector(`#${input.id}-error`);
    input.setAttribute("aria-invalid", message ? "true" : "false");
    input.setAttribute("aria-describedby", `${input.id}-error`);
    error.textContent = message;
}

function clearFormState(form) {
    form.querySelectorAll("input:not([type='checkbox'])").forEach((input) => {
        setFieldError(input, "");
    });
}

function resetPanelState(panel) {
    const form = panel.querySelector("form");
    form.reset();
    clearFormState(form);

    form.querySelectorAll("[data-password-toggle]").forEach((button) => {
        const input = document.getElementById(button.getAttribute("aria-controls"));

        if (supportsPasswordMask) {
            input.classList.add("password-masked");
        } else {
            input.type = "password";
        }

        button.setAttribute("aria-pressed", "false");
        button.setAttribute("aria-label", "Show password");
    });
}

const loginForm = document.querySelector("#login-form");
loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    clearFormState(loginForm);

    const identity = loginForm.elements.identity;
    const password = loginForm.elements.password;
    let valid = true;
    const identityValue = identity.value.trim();

    if (!identityValue) {
        setFieldError(identity, "Enter your email address or phone number.");
        valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identityValue) &&
        !/^\+?[\d\s().-]{7,}$/.test(identityValue)) {
        setFieldError(identity, "Enter a valid email address or phone number.");
        valid = false;
    }

    if (!password.value) {
        setFieldError(password, "Enter your password.");
        valid = false;
    }

    if (!valid) {
        loginForm.querySelector('[aria-invalid="true"]').focus();
        return;
    }

});

const signupForm = document.querySelector("#signup-form");
signupForm.addEventListener("submit", (event) => {
    event.preventDefault();
    clearFormState(signupForm);

    const name = signupForm.elements.name;
    const email = signupForm.elements.email;
    const username = signupForm.elements.username;
    const password = signupForm.elements.password;
    const confirmPassword = signupForm.elements.confirmPassword;
    let valid = true;

    if (name.value.trim().length < 2) {
        setFieldError(name, "Enter your full name (at least 2 characters).");
        valid = false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
        setFieldError(email, "Enter a valid email address.");
        valid = false;
    }

    if (!/^[a-zA-Z0-9_.-]{3,20}$/.test(username.value.trim())) {
        setFieldError(username, "Use 3–20 letters, numbers, dots, dashes, or underscores.");
        valid = false;
    }

    if (password.value.length < 8) {
        setFieldError(password, "Use a password with at least 8 characters.");
        valid = false;
    }

    if (!confirmPassword.value) {
        setFieldError(confirmPassword, "Please confirm your password.");
        valid = false;
    } else if (confirmPassword.value !== password.value) {
        setFieldError(confirmPassword, "Passwords do not match.");
        valid = false;
    }

    if (!valid) {
        signupForm.querySelector('[aria-invalid="true"]').focus();
        return;
    }

});

document.querySelector("#forgot-password").addEventListener("click", () => {
    const identity = loginForm.elements.identity;
    const value = identity.value.trim();
    clearFormState(loginForm);

    if (!value) {
        setFieldError(identity, "Enter your email or phone number to request a reset.");
        identity.focus();
        return;
    }

    setFieldError(identity, "Password reset is not connected yet. Please contact the studio for help.");
});
