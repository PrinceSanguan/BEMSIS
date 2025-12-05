import{r as c,R as o,j as e,L as l}from"./app-DQC4aF59.js";function p({userName:n,eventTitle:i,eventDate:d,eventDuration:x,certificateCode:s,autoDownload:t}){const[a,r]=c.useState(!1);return o.useEffect(()=>{t&&!a&&setTimeout(()=>{window.print(),r(!0)},1e3)},[t,a]),e.jsxs(e.Fragment,{children:[e.jsx(l,{title:`Certificate - ${i}`}),e.jsx("div",{className:"certificate-page",children:e.jsx("div",{className:"certificate-container",children:e.jsxs("div",{className:"certificate-border",children:[e.jsxs("div",{className:"header-section",children:[e.jsx("div",{className:"logo-left",children:e.jsx("img",{src:"/assets/images/virac-logo.png",alt:"Virac Logo",className:"header-logo"})}),e.jsxs("div",{className:"header-text",children:[e.jsx("p",{className:"gov-header",children:"REPUBLIC OF THE PHILIPPINES"}),e.jsx("p",{className:"province-header",children:"PROVINCE OF CATANDUANES"}),e.jsx("p",{className:"municipality-header",children:"MUNICIPALITY OF VIRAC"}),e.jsx("h1",{className:"barangay-header",children:"BARANGAY CALATAGAN TIBANG"})]}),e.jsx("div",{className:"logo-right",children:e.jsx("img",{src:"/assets/images/barangay-logo.jpg",alt:"Barangay Logo",className:"header-logo"})})]}),e.jsx("h2",{className:"certificate-title",children:"Certificate of Completion"}),e.jsx("p",{className:"certificate-subtitle",children:"This Certificate is Proudly Presented To"}),e.jsxs("div",{className:"recipient-section",children:[e.jsx("div",{className:"recipient-name",children:n.toUpperCase()}),e.jsx("div",{className:"name-underline"})]}),e.jsx("p",{className:"completion-text",children:"Has Successfully Completed the Community Event"}),e.jsx("div",{className:"event-title",children:i.toUpperCase()}),e.jsxs("div",{className:"bottom-section",children:[e.jsxs("div",{className:"system-note",children:[e.jsx("p",{className:"note-italic",children:"This certificate is system-generated and"}),e.jsx("p",{className:"note-italic",children:"includes authorized e-signatures from"}),e.jsx("p",{className:"note-italic",children:"Barangay Calatagan Tibang."})]}),e.jsxs("div",{className:"signature-section",children:[e.jsx("div",{className:"signature-placeholder",children:e.jsx("img",{src:"/assets/images/signature.png",alt:"Captain's Signature",className:"signature-image"})}),e.jsx("div",{className:"signature-line"}),e.jsx("p",{className:"captain-name",children:"MARISTELA T. UBALDE"}),e.jsx("p",{className:"captain-title",children:"PUNONG BARANGAY"})]}),e.jsxs("div",{className:"certificate-info",children:[e.jsxs("p",{className:"cert-id",children:["Certificate ID:",s]}),e.jsxs("p",{className:"date-issued",children:["Date Issued: ",new Date().toLocaleDateString("en-US",{month:"numeric",day:"numeric",year:"numeric"})]})]})]})]})})}),e.jsx("style",{jsx:!0,children:`
                .certificate-page {
                    width: 100vw;
                    height: 100vh;
                    margin: 0;
                    padding: 0;
                    background: #f8fafc;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-sizing: border-box;
                    font-family: 'Georgia', 'Times New Roman', serif;
                    overflow: hidden;
                }

                .certificate-container {
                    width: 90vw;
                    height: 90vh;
                    max-width: 1200px;
                    max-height: 850px;
                    background: white;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                    border-radius: 8px;
                    position: relative;
                    overflow: hidden;
                }

                .certificate-border {
                    width: 100%;
                    height: 100%;
                    border: 12px solid #0f4c81;
                    box-sizing: border-box;
                    padding: 40px 60px;
                    display: flex;
                    flex-direction: column;
                    position: relative;
                }

                .header-section {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    gap: 20px;
                    margin-bottom: 30px;
                }

                .logo-left,
                .logo-right {
                    flex-shrink: 0;
                }

                .header-logo {
                    width: 100px;
                    height: 100px;
                    object-fit: contain;
                }

                .header-text {
                    flex: 1;
                    text-align: center;
                }

                .gov-header,
                .province-header,
                .municipality-header {
                    margin: 0;
                    font-size: 14px;
                    font-weight: 700;
                    color: #000;
                    letter-spacing: 1px;
                    line-height: 1.4;
                }

                .barangay-header {
                    margin: 5px 0 0 0;
                    font-size: 18px;
                    font-weight: 700;
                    color: #000;
                    letter-spacing: 2px;
                }

                .certificate-title {
                    text-align: center;
                    font-size: 38px;
                    font-weight: 700;
                    color: #0f4c81;
                    margin: 15px 0 8px 0;
                    letter-spacing: 2px;
                }

                .certificate-subtitle {
                    text-align: center;
                    font-size: 16px;
                    color: #000;
                    margin: 0 0 20px 0;
                    font-weight: 400;
                }

                .recipient-section {
                    text-align: center;
                    margin: 15px 0;
                }

                .recipient-name {
                    font-size: 36px;
                    font-weight: 700;
                    color: #0f4c81;
                    margin: 0 0 5px 0;
                    font-family: 'Georgia', serif;
                }

                .name-underline {
                    width: 600px;
                    height: 3px;
                    background: #000;
                    margin: 0 auto;
                }

                .completion-text {
                    text-align: center;
                    font-size: 16px;
                    color: #000;
                    margin: 20px 0 15px 0;
                    font-weight: 400;
                }

                .event-title {
                    text-align: center;
                    font-size: 28px;
                    font-weight: 700;
                    color: #0f4c81;
                    margin: 15px 0 20px 0;
                    font-family: 'Georgia', serif;
                }

                .bottom-section {
                    position: absolute;
                    bottom: 30px;
                    left: 60px;
                    right: 60px;
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    gap: 20px;
                }

                .system-note {
                    flex: 1;
                    text-align: left;
                }

                .note-italic {
                    font-size: 11px;
                    color: #000;
                    margin: 2px 0;
                    font-style: italic;
                    line-height: 1.4;
                }

                .signature-section {
                    flex: 1;
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: flex-end;
                    margin-bottom: -20px;
                }

                .signature-placeholder {
                    width: 280px;
                    height: 90px;
                    margin-bottom: 3px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .signature-image {
                    max-width: 100%;
                    max-height: 100%;
                    object-fit: contain;
                    margin-bottom: -50px;
                }

                .signature-line {
                    width: 240px;
                    height: 2px;
                    background: #000;
                    margin: 3px 0;
                }

                .captain-name {
                    font-size: 14px;
                    font-weight: 700;
                    color: #000;
                    margin: 5px 0 2px 0;
                    letter-spacing: 1px;
                }

                .captain-title {
                    font-size: 12px;
                    color: #000;
                    margin: 0;
                    font-weight: 600;
                }

                .certificate-info {
                    flex: 1;
                    text-align: right;
                }

                .cert-id,
                .date-issued {
                    font-size: 11px;
                    color: #000;
                    margin: 2px 0;
                    line-height: 1.4;
                }

                @media print {
                    * {
                        -webkit-print-color-adjust: exact !important;
                        color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }

                    body {
                        margin: 0;
                        padding: 0;
                    }

                    .certificate-page {
                        width: 297mm;
                        height: 210mm;
                        padding: 0;
                        background: white;
                        margin: 0;
                    }

                    .certificate-container {
                        width: 100%;
                        height: 100%;
                        box-shadow: none;
                        border-radius: 0;
                    }

                    @page {
                        size: A4 landscape;
                        margin: 0;
                    }
                }

                @media screen and (max-width: 1200px) {
                    .certificate-page {
                        padding: 10px;
                    }

                    .certificate-container {
                        transform: scale(0.8);
                        transform-origin: center;
                    }
                }

                @media screen and (max-width: 768px) {
                    .certificate-container {
                        transform: scale(0.6);
                    }
                }
            `})]})}export{p as default};
