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

const host = "https://inshare-bubt.onrender.com/";
const uploadURL = `${host}api/files`;
const emailURL = `${host}api/files/send`;

const maxAllowedSize = 100 * 1024 * 1024; // 100MB in bytes

dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    if (!dropZone.classList.contains("dragged")) {
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
    if (files.length) {
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

    // Validate file
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

    // Upload progress
    xhr.upload.onprogress = updateProgress;

    // Handle response
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

    // Handle errors
    xhr.onerror = () => {
        showToast("Error uploading file");
        progressContainer.style.display = "none";
    };

    // Send request
    xhr.open("POST", uploadURL);
    
    // Add authorization if user is logged in
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
    progressBar.style.transform = `scaleX(${percent / 100})`;
};

const onUploadSuccess = ({ file: url }) => {
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
    if (!url) {
        showToast("Please upload a file first");
        return;
    }

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

// Check file size before upload
const validateFileSize = (file) => {
    if (file.size > maxAllowedSize) {
        showToast(`File too large. Max allowed size is ${maxAllowedSize / (1024 * 1024)}MB`);
        return false;
    }
    return true;
};

// Reset upload state
const resetUploadState = () => {
    fileInput.value = "";
    progressContainer.style.display = "none";
    sharingContainer.style.display = "none";
    bgProgress.style.width = "0%";
    percentDiv.innerText = "0";
    progressBar.style.transform = "scaleX(0)";
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Reset any existing upload state
    resetUploadState();
    
    // Check authentication status
    const token = localStorage.getItem('token');
    if (token) {
        // Add any authenticated user specific UI changes here
        console.log('User is authenticated');
    }
});

// Handle page visibility change
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
        // Save upload state if needed
    }
});

// Optional: Add drag and drop highlighting
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    document.body.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
    });
});

// Optional: Add file type validation
const validateFileType = (file) => {
    const allowedTypes = ['image/', 'video/', 'application/pdf', 'application/zip'];
    return allowedTypes.some(type => file.type.startsWith(type));
};

// Optional: Add mobile device detection
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
if (isMobile) {
    dropZone.style.display = 'none';
    // Show mobile-friendly upload interface
}