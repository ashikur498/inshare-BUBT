module.exports = ({ emailFrom, downloadLink, size, expires }) => {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width">
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
            <title>InShare - File Sharing</title>
            <style>
                @media only screen and (max-width: 620px) {
                    table[class=body] h1 {
                        font-size: 28px !important;
                        margin-bottom: 10px !important;
                    }
                    table[class=body] p,
                    table[class=body] ul,
                    table[class=body] ol,
                    table[class=body] td,
                    table[class=body] span,
                    table[class=body] a {
                        font-size: 16px !important;
                    }
                    table[class=body] .wrapper,
                    table[class=body] .article {
                        padding: 10px !important;
                    }
                    table[class=body] .content {
                        padding: 0 !important;
                    }
                    table[class=body] .container {
                        padding: 0 !important;
                        width: 100% !important;
                    }
                    table[class=body] .main {
                        border-left-width: 0 !important;
                        border-radius: 0 !important;
                        border-right-width: 0 !important;
                    }
                }
            </style>
        </head>
        <body>
            <div style="background-color: #f6f6f6; padding: 20px;">
                <div style="background-color: white; padding: 20px; border-radius: 10px;">
                    <h2>File Shared With You</h2>
                    <p>Someone has shared a file with you using InShare</p>
                    <p>Sender: ${emailFrom}</p>
                    <p>File size: ${size}</p>
                    <p>File expires in: ${expires}</p>
                    <div style="margin: 20px 0;">
                        <a href="${downloadLink}" 
                           style="background-color: #0288d1; 
                                  color: white; 
                                  padding: 10px 20px; 
                                  text-decoration: none; 
                                  border-radius: 5px;">
                            Download File
                        </a>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;
};