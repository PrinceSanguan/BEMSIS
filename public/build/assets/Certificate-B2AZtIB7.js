import{r as s,R as o,j as e,L as c}from"./app-BjnmMTvR.js";function m({userName:n,eventTitle:t,eventDate:l,eventDuration:d,certificateCode:x,autoDownload:i}){const[a,r]=s.useState(!1);return o.useEffect(()=>{i&&!a&&setTimeout(()=>{window.print(),r(!0)},1e3)},[i,a]),e.jsxs(e.Fragment,{children:[e.jsx(c,{title:`Certificate - ${t}`}),e.jsx("div",{className:"certificate-page",children:e.jsx("div",{className:"certificate-container",children:e.jsxs("div",{className:"certificate-border",children:[e.jsxs("div",{className:"header-section",children:[e.jsx("img",{src:"/assets/images/Bemsis.jpg",alt:"Barangay Logo",className:"barangay-logo"}),e.jsx("h1",{className:"system-title",children:"BARANGAY EVENT MANAGEMENT SYSTEM"}),e.jsx("h2",{className:"certificate-title",children:"CERTIFICATE OF COMPLETION"})]}),e.jsxs("div",{className:"content-section",children:[e.jsx("p",{className:"certify-text",children:"This is to certify that"}),e.jsx("div",{className:"recipient-name",children:n}),e.jsx("div",{className:"name-underline"}),e.jsx("p",{className:"completion-text",children:"has successfully completed the community event"}),e.jsxs("div",{className:"event-name",children:['"',t,'"']})]}),e.jsxs("div",{className:"signature-section",children:[e.jsx("div",{className:"signature-placeholder",children:e.jsx("img",{src:"/assets/images/signature.jpg",alt:"Captain's Signature",className:"signature-image"})}),e.jsx("div",{className:"signature-line"}),e.jsx("p",{className:"captain-name",children:"Hon. Maristela Ubalde"}),e.jsx("p",{className:"captain-title",children:"Barangay Captain"})]})]})})}),e.jsx("style",{jsx:!0,children:`
                .certificate-page {
                    width: 100vw;
                    height: 100vh;
                    margin: 0;
                    padding: 20px;
                    background: #f8fafc;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-sizing: border-box;
                    font-family: 'Georgia', 'Times New Roman', serif;
                }

                .certificate-container {
                    width: 297mm;
                    height: 210mm;
                    background: white;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                    border-radius: 8px;
                    position: relative;
                    overflow: hidden;
                }

                .certificate-border {
                    width: 100%;
                    height: 100%;
                    border: 8px solid #1e40af;
                    box-sizing: border-box;
                    padding: 60px;
                    display: flex;
                    flex-direction: column;
                    position: relative;
                }

                .header-section {
                    text-align: center;
                    margin-bottom: 60px;
                }

                .barangay-logo {
                    width: 120px;
                    height: 120px;
                    object-fit: contain;
                    border-radius: 50%;
                    border: 3px solid #1e40af;
                    margin: 0 auto 30px auto;
                    display: block;
                }

                .system-title {
                    font-size: 24px;
                    font-weight: bold;
                    color: #1e40af;
                    margin: 0 0 20px 0;
                    letter-spacing: 1px;
                }

                .certificate-title {
                    font-size: 32px;
                    font-weight: bold;
                    color: #1e40af;
                    margin: 0;
                    letter-spacing: 2px;
                }

                .content-section {
                    text-align: center;
                    flex-grow: 1;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    gap: 30px;
                }

                .certify-text,
                .completion-text {
                    font-size: 20px;
                    color: #374151;
                    margin: 0;
                    font-weight: 400;
                }

                .recipient-name {
                    font-size: 48px;
                    font-weight: bold;
                    color: #1e40af;
                    margin: 20px 0 10px 0;
                    font-family: 'Georgia', serif;
                }

                .name-underline {
                    width: 400px;
                    height: 2px;
                    background: #1e40af;
                    margin: 0 auto 20px auto;
                }

                .event-name {
                    font-size: 32px;
                    font-weight: 600;
                    color: #1d4ed8;
                    margin: 20px 0;
                    font-style: italic;
                }

                .signature-section {
                    position: absolute;
                    bottom: 30px;
                    left: 60px;
                    text-align: center;
                    width: 220px;
                }

                .signature-placeholder {
                    width: 200px;
                    height: 70px;
                    margin: 0 auto 10px auto;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: transparent;
                }

                .signature-image {
                    max-width: 180px;
                    max-height: 60px;
                    object-fit: contain;
                }

                .signature-line {
                    width: 200px;
                    height: 1px;
                    background: #374151;
                    margin: 0 auto 15px auto;
                }

                .captain-name {
                    font-size: 16px;
                    font-weight: bold;
                    color: #1e40af;
                    margin: 0 0 5px 0;
                }

                .captain-title {
                    font-size: 14px;
                    color: #6b7280;
                    margin: 0;
                    font-weight: 600;
                }

                .certificate-footer {
                    position: absolute;
                    bottom: 30px;
                    right: 60px;
                    text-align: right;
                    font-size: 12px;
                    color: #6b7280;
                }

                .cert-id,
                .date-issued {
                    margin: 5px 0;
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
            `})]})}export{m as default};
