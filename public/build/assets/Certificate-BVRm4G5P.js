import{r as o,R as d,j as e,L as x}from"./app-DEuYqvLG.js";import{A as m}from"./award-DCaWsrMW.js";import"./createLucideIcon-30GYvtU4.js";function h({userName:n,eventTitle:t,eventDate:s,eventDuration:r,certificateCode:c,autoDownload:i}){const[a,l]=o.useState(!1);return d.useEffect(()=>{i&&!a&&setTimeout(()=>{window.print(),l(!0)},1e3)},[i,a]),e.jsxs(e.Fragment,{children:[e.jsx(x,{title:`Certificate - ${t}`}),e.jsx("div",{className:"certificate-page",children:e.jsx("div",{className:"certificate-container",children:e.jsxs("div",{className:"certificate-border",children:[e.jsxs("div",{className:"certificate-header",children:[e.jsxs("div",{className:"header-logos",children:[e.jsx("img",{src:"/assets/images/Bemsis.jpg",alt:"Barangay Logo",className:"barangay-logo"}),e.jsx(m,{className:"award-icon"})]}),e.jsxs("div",{className:"header-text",children:[e.jsx("h1",{className:"system-title",children:"BARANGAY EVENT MANAGEMENT SYSTEM"}),e.jsx("h2",{className:"certificate-title",children:"Certificate of Completion"})]}),e.jsx("div",{className:"header-line"})]}),e.jsxs("div",{className:"certificate-content",children:[e.jsx("p",{className:"intro-text",children:"This is to certify that"}),e.jsxs("div",{className:"recipient-name",children:[e.jsx("h3",{children:n}),e.jsx("div",{className:"name-underline"})]}),e.jsx("p",{className:"completion-text",children:"has successfully completed the community event"}),e.jsx("div",{className:"event-title",children:e.jsxs("h4",{children:['"',t,'"']})}),e.jsxs("div",{className:"event-details",children:[e.jsxs("div",{className:"detail-item",children:[e.jsx("p",{className:"detail-label",children:"Date"}),e.jsx("p",{className:"detail-value",children:s})]}),e.jsxs("div",{className:"detail-item",children:[e.jsx("p",{className:"detail-label",children:"Duration"}),e.jsx("p",{className:"detail-value",children:r})]})]})]}),e.jsxs("div",{className:"certificate-footer",children:[e.jsxs("div",{className:"signature-section",children:[e.jsx("div",{className:"signature-name",children:"Captain Maria Santos"}),e.jsx("div",{className:"signature-line"}),e.jsx("p",{className:"signature-title",children:"Barangay Captain"}),e.jsx("p",{className:"signature-subtitle",children:"Authorized Signature"})]}),e.jsxs("div",{className:"certificate-info",children:[e.jsxs("p",{className:"cert-id",children:["Certificate ID: ",c]}),e.jsxs("p",{className:"issue-date",children:["Issued: ",new Date().toLocaleDateString()]}),e.jsx("p",{className:"verification",children:"This certificate is digitally verified"})]}),e.jsxs("div",{className:"date-section",children:[e.jsx("div",{className:"date-line"}),e.jsx("p",{className:"date-title",children:"Date Issued"}),e.jsx("p",{className:"date-value",children:new Date().toLocaleDateString()})]})]})]})})}),e.jsx("style",{jsx:!0,children:`
                .certificate-page {
                    width: 100vw;
                    height: 100vh;
                    margin: 0;
                    padding: 20px;
                    background: #f5f5f5;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-sizing: border-box;
                }

                .certificate-container {
                    width: 297mm;
                    height: 210mm;
                    background: white;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20mm;
                    box-sizing: border-box;
                }

                .certificate-border {
                    width: 100%;
                    height: 100%;
                    border: 8px double #2563eb;
                    background: linear-gradient(135deg, #eff6ff 0%, #ffffff 100%);
                    padding: 30px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    box-sizing: border-box;
                }

                .certificate-header {
                    text-align: center;
                    margin-bottom: 20px;
                }

                .header-logos {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 30px;
                    margin-bottom: 20px;
                }

                .barangay-logo {
                    width: 80px;
                    height: 80px;
                    object-fit: contain;
                }

                .award-icon {
                    width: 80px;
                    height: 80px;
                    color: #eab308;
                }

                .header-text {
                    margin-bottom: 15px;
                }

                .system-title {
                    font-size: 24px;
                    font-weight: bold;
                    color: #1e40af;
                    margin: 0 0 8px 0;
                    line-height: 1.2;
                }

                .certificate-title {
                    font-size: 32px;
                    font-weight: bold;
                    color: #1e40af;
                    margin: 0;
                }

                .header-line {
                    width: 120px;
                    height: 4px;
                    background: linear-gradient(90deg, #60a5fa 0%, #2563eb 100%);
                    margin: 0 auto;
                }

                .certificate-content {
                    flex-grow: 1;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    text-align: center;
                    gap: 20px;
                }

                .intro-text,
                .completion-text {
                    font-size: 20px;
                    color: #374151;
                    margin: 0;
                }

                .recipient-name {
                    margin: 20px 0;
                }

                .recipient-name h3 {
                    font-size: 36px;
                    font-weight: bold;
                    color: #1e40af;
                    margin: 0 0 8px 0;
                }

                .name-underline {
                    width: 300px;
                    height: 2px;
                    background: #2563eb;
                    margin: 0 auto;
                }

                .event-title h4 {
                    font-size: 24px;
                    font-weight: 600;
                    color: #1d4ed8;
                    margin: 0;
                    font-style: italic;
                }

                .event-details {
                    display: flex;
                    justify-content: center;
                    gap: 80px;
                    margin-top: 20px;
                }

                .detail-item {
                    text-align: center;
                }

                .detail-label {
                    font-size: 14px;
                    font-weight: 600;
                    color: #6b7280;
                    margin: 0 0 5px 0;
                }

                .detail-value {
                    font-size: 18px;
                    font-weight: 600;
                    color: #1d4ed8;
                    margin: 0;
                }

                .certificate-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    margin-top: 20px;
                }

                .signature-section {
                    text-align: center;
                }

                .signature-name {
                    font-size: 18px;
                    color: #1e40af;
                    font-family: cursive;
                    margin-bottom: 8px;
                }

                .signature-line {
                    width: 120px;
                    height: 1px;
                    background: #9ca3af;
                    margin: 0 auto 8px auto;
                }

                .signature-title {
                    font-size: 14px;
                    font-weight: 600;
                    color: #6b7280;
                    margin: 0 0 4px 0;
                }

                .signature-subtitle {
                    font-size: 12px;
                    color: #9ca3af;
                    margin: 0;
                }

                .certificate-info {
                    text-align: center;
                }

                .cert-id,
                .issue-date,
                .verification {
                    font-size: 12px;
                    color: #9ca3af;
                    margin: 0 0 4px 0;
                }

                .date-section {
                    text-align: center;
                }

                .date-line {
                    width: 120px;
                    height: 1px;
                    background: #9ca3af;
                    margin: 0 auto 8px auto;
                }

                .date-title {
                    font-size: 14px;
                    font-weight: 600;
                    color: #6b7280;
                    margin: 0 0 4px 0;
                }

                .date-value {
                    font-size: 12px;
                    color: #9ca3af;
                    margin: 0;
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
                        box-shadow: none;
                    }

                    .certificate-container {
                        width: 100%;
                        height: 100%;
                        box-shadow: none;
                        padding: 15mm;
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

                    .event-details {
                        gap: 40px;
                    }
                }
            `})]})}export{h as default};
