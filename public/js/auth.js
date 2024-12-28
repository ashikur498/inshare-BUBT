const loginForm = document.querySelector("#loginForm");
const registerForm = document.querySelector("#registerForm");

const login = async (email, password) => {
    try {
        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (data.token) {
            localStorage.setItem("token", data.token);
            window.location.href = "/";
        }
    } catch (err) {
        console.error(err);
    }
};

const register = async (name, email, password) => {
    try {
        const res = await fetch("/api/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();
        if (data.success) {
            window.location.href = "/login.html";
        }
    } catch (err) {
        console.error(err);
    }
};

if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = loginForm.email.value;
        const password = loginForm.password.value;
        login(email, password);
    });
}

if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = registerForm.name.value;
        const email = registerForm.email.value;
        const password = registerForm.password.value;
        register(name, email, password);
    });
}