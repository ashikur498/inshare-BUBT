const dropZone = document.querySelector(".drop-zone");
const fileInput = document.querySelector("#fileInput");
const browseBtn = document.querySelector(".browseBtn");
const progressContainer = document.querySelector(".progress-container");
const bgProgress = document.querySelector(".bg-progress");
const progressBar = document.querySelector(".progress-bar");
const percentDiv = document.querySelector("#percent");
const fileURLInput = document.querySelector("#fileURL");
const sharingContainer = document.querySelector(".sharing-container");
const copyBtn = document.querySelector("#copyBtn");
const emailForm = document.querySelector("#emailForm");
const toast = document.querySelector(".toast");
const loginBtn = document.querySelector("#loginBtn");
const registerBtn = document.querySelector("#registerBtn");

//const host = "http://localhost:3000/";
const host = "https://inshare-bubt.onrender.com/";
const uploadURL = `${host}api/files`;
const emailURL = `${host}api/files/send`;

const maxAllowedSize = 100 * 1024 * 1024; //100mb

dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    if(!dropZone.classList.contains("dragged")) {
        dropZone.classList.add("dragged");
    }
});

dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("dragged");
});

dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragged");
    const files = e.dataTransfer.files;
    if(files.length) {
        fileInput.files = files;
        uploadFile();
    }
});

fileInput.addEventListener("change", () => {
    uploadFile();
});

browseBtn.addEventListener("click", () => {
    fileInput.click();
});

copyBtn.addEventListener("click", () => {
    fileURLInput.select();
    document.execCommand("copy");
    showToast("Link copied");
});

const uploadFile = () => {
    progressContainer.style.display = "block";
    const file = fileInput.files[0];

    if (!file) {
        showToast("Please select a file");
        return;
    }

    if (file.size > maxAllowedSize) {
        showToast("File size too large (max 100MB)");
        return;
    }

    const formData = new FormData();
    formData.append("myfile", file);

    const xhr = new XMLHttpRequest();
    xhr.upload.onprogress = updateProgress;

    xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                try {
                    const response = JSON.parse(xhr.response);
                    onUploadSuccess(response);
                    showToast("File uploaded successfully");
                } catch (error) {
                    showToast("Error processing response");
                }
            } else {
                showToast("Error uploading file");
                progressContainer.style.display = "none";
            }
        }
    };

    xhr.onerror = () => {
        showToast("Error uploading file");
        progressContainer.style.display = "none";
    };

    xhr.open("POST", uploadURL);
    const token = localStorage.getItem('token');
    if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }
    xhr.send(formData);
};

const updateProgress = (e) => {
    const percent = Math.round((e.loaded / e.total) * 100);
    bgProgress.style.width = `${percent}%`;
    percentDiv.innerText = percent;
    progressBar.style.transform = `scaleX(${percent/100})`;
};

const onUploadSuccess = ({file: url}) => {
    console.log(url);
    fileInput.value = ""; // Reset the input
    emailForm[2].removeAttribute("disabled");
    progressContainer.style.display = "none";
    sharingContainer.style.display = "block";
    fileURLInput.value = url;
};

let toastTimer;
const showToast = (msg) => {
    clearTimeout(toastTimer);
    toast.innerText = msg;
    toast.style.transform = "translate(-50%, 0)";
    toastTimer = setTimeout(() => {
        toast.style.transform = "translate(-50%, 60px)";
    }, 2000);
};

emailForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const url = fileURLInput.value;
    const formData = {
        uuid: url.split("/").splice(-1, 1)[0],
        emailTo: emailForm.elements["to-email"].value,
        emailFrom: emailForm.elements["from-email"].value,
    };

    emailForm[2].setAttribute("disabled", "true");

    fetch(emailURL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
    })
        .then((res) => res.json())
        .then(({ success }) => {
            if (success) {
                sharingContainer.style.display = "none";
                showToast("Email Sent");
            }
        })
        .catch(() => {
            showToast("Error sending email");
        })
        .finally(() => {
            emailForm[2].removeAttribute("disabled");
        });
});

// Login Button Handler
loginBtn.addEventListener("click", () => {
    const loginHTML = `
        <div class="auth-modal" id="loginModal">
            <div class="auth-container">
                <h2>Login</h2>
                <form id="loginForm">
                    <div class="form-group">
                        <label for="loginEmail">Email</label>
                        <input type="email" id="loginEmail" required>
                    </div>
                    <div class="form-group">
                        <label for="loginPassword">Password</label>
                        <input type="password" id="loginPassword" required>
                    </div>
                    <button type="submit">Login</button>
                </form>
                <button class="close-modal">×</button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', loginHTML);
    
    const loginModal = document.querySelector('#loginModal');
    const loginForm = document.querySelector('#loginForm');
    const closeBtn = loginModal.querySelector('.close-modal');
    
    closeBtn.addEventListener('click', () => {
        loginModal.remove();
    });

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = loginForm.querySelector('#loginEmail').value;
        const password = loginForm.querySelector('#loginPassword').value;

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('token', data.token);
                showToast('Login successful');
                loginModal.remove();
                updateAuthUI(true);
            } else {
                showToast(data.error || 'Login failed');
            }
        } catch (error) {
            showToast('Login failed');
        }
    });
});

// Register Button Handler
registerBtn.addEventListener("click", () => {
    const registerHTML = `
        <div class="auth-modal" id="registerModal">
            <div class="auth-container">
                <h2>Register</h2>
                <form id="registerForm">
                    <div class="form-group">
                        <label for="registerName">Name</label>
                        <input type="text" id="registerName" required>
                    </div>
                    <div class="form-group">
                        <label for="registerEmail">Email</label>
                        <input type="email" id="registerEmail" required>
                    </div>
                    <div class="form-group">
                        <label for="registerPassword">Password</label>
                        <input type="password" id="registerPassword" required>
                    </div>
                    <button type="submit">Register</button>
                </form>
                <button class="close-modal">×</button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', registerHTML);
    
    const registerModal = document.querySelector('#registerModal');
    const registerForm = document.querySelector('#registerForm');
    const closeBtn = registerModal.querySelector('.close-modal');
    
    closeBtn.addEventListener('click', () => {
        registerModal.remove();
    });

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = registerForm.querySelector('#registerName').value;
        const email = registerForm.querySelector('#registerEmail').value;
        const password = registerForm.querySelector('#registerPassword').value;

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();
            if (response.ok) {
                showToast('Registration successful');
                registerModal.remove();
                loginBtn.click();
            } else {
                showToast(data.error || 'Registration failed');
            }
        } catch (error) {
            showToast('Registration failed');
        }
    });
});

// Update UI based on auth state
const updateAuthUI = (isLoggedIn) => {
    if (isLoggedIn) {
        loginBtn.style.display = 'none';
        registerBtn.style.display = 'none';
        const logoutBtn = document.createElement('button');
        logoutBtn.id = 'logoutBtn';
        logoutBtn.textContent = 'Logout';
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('token');
            updateAuthUI(false);
            showToast('Logged out successfully');
        });
        document.querySelector('.nav-right').appendChild(logoutBtn);
    } else {
        loginBtn.style.display = 'inline-block';
        registerBtn.style.display = 'inline-block';
        const logoutBtn = document.querySelector('#logoutBtn');
        if (logoutBtn) logoutBtn.remove();
    }
};

// Check auth state on page load
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    updateAuthUI(!!token);
});