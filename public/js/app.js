class FileShare {
    constructor() {
        this.init();
    }

    init() {
        this.bindUIElements();
        this.bindEvents();
        this.checkAuthStatus();
        this.loadTheme();
    }

    bindUIElements() {
        this.dropZone = document.querySelector(".drop-zone");
        this.fileInput = document.querySelector("#fileInput");
        this.progressContainer = document.querySelector(".progress-container");
        this.progressBar = document.querySelector(".progress");
        this.progressText = document.querySelector(".percent");
        this.shareContainer = document.querySelector(".sharing-container");
        this.downloadLinkContainer = document.querySelector(".download-link-container");
        this.copyBtn = document.querySelector("#copyBtn");
        this.themeToggle = document.querySelector("#theme-toggle");
    }

    bindEvents() {
        this.dropZone.addEventListener("dragover", (e) => {
            e.preventDefault();
            if(!this.dropZone.classList.contains("dragged")) {
                this.dropZone.classList.add("dragged");
            }
        });

        this.dropZone.addEventListener("dragleave", () => {
            this.dropZone.classList.remove("dragged");
        });

        this.dropZone.addEventListener("drop", (e) => {
            e.preventDefault();
            this.dropZone.classList.remove("dragged");
            const files = e.dataTransfer.files;
            if(files.length) {
                this.fileInput.files = files;
                this.uploadFile();
            }
        });

        this.fileInput.addEventListener("change", () => {
            this.uploadFile();
        });

        this.copyBtn.addEventListener("click", () => {
            this.copyToClipboard();
        });

        this.themeToggle.addEventListener("click", () => {
            this.toggleTheme();
        });
    }

    async uploadFile() {
        const file = this.fileInput.files[0];
        const formData = new FormData();
        formData.append("myfile", file);
        
        // Add additional options
        formData.append("password", document.querySelector("#password-protect").checked);
        formData.append("encrypt", document.querySelector("#encrypt-file").checked);
        formData.append("expiryDays", document.querySelector("#expiry-days").value);

        this.progressContainer.style.display = "block";

        try {
            const response = await fetch("/api/files", {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`
                },
                body: formData,
                onUploadProgress: this.updateProgress.bind(this)
            });

            const data = await response.json();
            this.showLinkAndQR(data);
        } catch (error) {
            this.showToast("Upload Failed");
        }
    }

    // Add more methods for other functionality...
}

new FileShare();