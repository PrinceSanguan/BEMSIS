import{r as d,R as c,j as e,L as x}from"./app-DhH_mmqp.js";import{A as p}from"./award-C_R_l3aj.js";import"./createLucideIcon-tyPHq6cK.js";function h({userName:n,eventTitle:i,eventDate:s,eventDuration:r,certificateCode:o,autoDownload:t}){const[a,l]=d.useState(!1);return c.useEffect(()=>{t&&!a&&setTimeout(()=>{window.print(),l(!0)},1e3)},[t,a]),e.jsxs(e.Fragment,{children:[e.jsx(x,{title:`Certificate - ${i}`}),e.jsx("div",{className:"certificate-page",children:e.jsx("div",{className:"certificate-container",children:e.jsxs("div",{className:"certificate-border",children:[e.jsxs("div",{className:"header-section",children:[e.jsxs("div",{className:"logo-container",children:[e.jsx("img",{src:"/assets/images/Bemsis.jpg",alt:"Barangay Logo",className:"barangay-logo"}),e.jsx("div",{className:"award-badge",children:e.jsx(p,{className:"award-icon"})})]}),e.jsxs("div",{className:"title-section",children:[e.jsx("h1",{className:"system-name",children:"BARANGAY EVENT MANAGEMENT SYSTEM"}),e.jsx("div",{className:"divider"}),e.jsx("h2",{className:"certificate-main-title",children:"CERTIFICATE OF COMPLETION"})]})]}),e.jsxs("div",{className:"content-section",children:[e.jsx("p",{className:"certify-text",children:"This is to certify that"}),e.jsxs("div",{className:"recipient-section",children:[e.jsx("h3",{className:"recipient-name",children:n}),e.jsx("div",{className:"name-border"})]}),e.jsx("p",{className:"completion-text",children:"has successfully completed the community event"}),e.jsx("div",{className:"event-section",children:e.jsxs("h4",{className:"event-name",children:['"',i,'"']})}),e.jsxs("div",{className:"event-info",children:[e.jsxs("div",{className:"info-item",children:[e.jsx("span",{className:"info-label",children:"Date:"}),e.jsx("span",{className:"info-value",children:s})]}),e.jsx("div",{className:"info-separator",children:"|"}),e.jsxs("div",{className:"info-item",children:[e.jsx("span",{className:"info-label",children:"Duration:"}),e.jsx("span",{className:"info-value",children:r})]})]})]}),e.jsxs("div",{className:"footer-section",children:[e.jsxs("div",{className:"signature-area",children:[e.jsxs("div",{className:"signature-box",children:[e.jsxs("svg",{className:"signature-svg",viewBox:"0 0 200 60",xmlns:"http://www.w3.org/2000/svg",children:[e.jsx("path",{d:"M10 40 Q 30 20, 50 35 T 90 30 Q 110 25, 130 35 T 170 30 Q 180 35, 190 40",stroke:"#1e40af",strokeWidth:"2",fill:"none",strokeLinecap:"round"}),e.jsx("path",{d:"M15 45 Q 25 35, 35 40 T 55 38 Q 65 36, 75 38 T 95 40",stroke:"#1e40af",strokeWidth:"1.5",fill:"none",strokeLinecap:"round"})]}),e.jsx("div",{className:"signature-line"}),e.jsx("p",{className:"signature-name",children:"Captain Maria Santos"}),e.jsx("p",{className:"signature-title",children:"Barangay Captain"})]}),e.jsx("div",{className:"seal-area",children:e.jsx("div",{className:"official-seal",children:e.jsx("div",{className:"seal-circle",children:e.jsxs("div",{className:"seal-inner",children:[e.jsx("div",{className:"seal-text",children:"OFFICIAL"}),e.jsx("div",{className:"seal-text",children:"SEAL"})]})})})})]}),e.jsxs("div",{className:"certificate-details",children:[e.jsxs("div",{className:"details-left",children:[e.jsxs("p",{className:"detail-line",children:["Certificate ID: ",o]}),e.jsxs("p",{className:"detail-line",children:["Date Issued: ",new Date().toLocaleDateString()]})]}),e.jsxs("div",{className:"details-right",children:[e.jsx("p",{className:"detail-line",children:"This certificate is digitally verified"}),e.jsx("p",{className:"detail-line",children:"Barangay Event Management System"})]})]})]}),e.jsx("div",{className:"decoration decoration-top-left"}),e.jsx("div",{className:"decoration decoration-top-right"}),e.jsx("div",{className:"decoration decoration-bottom-left"}),e.jsx("div",{className:"decoration decoration-bottom-right"})]})})}),e.jsx("style",{jsx:!0,children:`
                .certificate-page {
                    width: 100vw;
                    height: 100vh;
                    margin: 0;
                    padding: 15px;
                    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
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
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                    border-radius: 8px;
                    overflow: hidden;
                    position: relative;
                }

                .certificate-border {
                    width: 100%;
                    height: 100%;
                    border: 12px solid #1e40af;
                    border-image: linear-gradient(45deg, #1e40af, #3b82f6, #1e40af) 1;
                    background: linear-gradient(135deg, #fefbff 0%, #f8fafc 100%);
                    padding: 40px;
                    box-sizing: border-box;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    position: relative;
                }

                .header-section {
                    text-align: center;
                    margin-bottom: 30px;
                }

                .logo-container {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 40px;
                    margin-bottom: 25px;
                }

                .barangay-logo {
                    width: 90px;
                    height: 90px;
                    object-fit: contain;
                    border-radius: 50%;
                    border: 3px solid #1e40af;
                }

                .award-badge {
                    background: linear-gradient(135deg, #fbbf24, #f59e0b);
                    border-radius: 50%;
                    padding: 15px;
                    border: 3px solid #1e40af;
                }

                .award-icon {
                    width: 60px;
                    height: 60px;
                    color: white;
                    filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3));
                }

                .title-section {
                    margin-bottom: 20px;
                }

                .system-name {
                    font-size: 28px;
                    font-weight: bold;
                    color: #1e40af;
                    margin: 0 0 15px 0;
                    letter-spacing: 1px;
                    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
                }

                .divider {
                    width: 150px;
                    height: 3px;
                    background: linear-gradient(90deg, #1e40af, #3b82f6, #1e40af);
                    margin: 0 auto 15px auto;
                    border-radius: 2px;
                }

                .certificate-main-title {
                    font-size: 36px;
                    font-weight: bold;
                    color: #1e40af;
                    margin: 0;
                    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
                    letter-spacing: 2px;
                }

                .content-section {
                    flex-grow: 1;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    text-align: center;
                    gap: 25px;
                    padding: 20px 0;
                }

                .certify-text,
                .completion-text {
                    font-size: 22px;
                    color: #374151;
                    margin: 0;
                    font-weight: 400;
                }

                .recipient-section {
                    margin: 30px 0;
                }

                .recipient-name {
                    font-size: 42px;
                    font-weight: bold;
                    color: #1e40af;
                    margin: 0 0 15px 0;
                    text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.1);
                    font-family: 'Georgia', serif;
                }

                .name-border {
                    width: 400px;
                    height: 3px;
                    background: linear-gradient(90deg, transparent, #1e40af, transparent);
                    margin: 0 auto;
                    border-radius: 2px;
                }

                .event-section {
                    margin: 25px 0;
                }

                .event-name {
                    font-size: 28px;
                    font-weight: 600;
                    color: #1d4ed8;
                    margin: 0;
                    font-style: italic;
                    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
                }

                .event-info {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 30px;
                    margin-top: 25px;
                }

                .info-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 5px;
                }

                .info-label {
                    font-size: 16px;
                    font-weight: 600;
                    color: #6b7280;
                }

                .info-value {
                    font-size: 20px;
                    font-weight: bold;
                    color: #1d4ed8;
                }

                .info-separator {
                    font-size: 24px;
                    color: #9ca3af;
                    font-weight: bold;
                }

                .footer-section {
                    margin-top: 40px;
                }

                .signature-area {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    margin-bottom: 25px;
                    padding: 0 30px;
                }

                .signature-box {
                    text-align: left;
                    min-width: 220px;
                    margin-left: 20px;
                }

                .signature-svg {
                    width: 200px;
                    height: 55px;
                    margin-bottom: 8px;
                    margin-left: 10px;
                }

                .signature-line {
                    width: 200px;
                    height: 2px;
                    background: #374151;
                    margin: 0 0 12px 10px;
                }

                .signature-name {
                    font-size: 18px;
                    font-weight: bold;
                    color: #1e40af;
                    margin: 0 0 5px 10px;
                    text-align: left;
                }

                .signature-title {
                    font-size: 14px;
                    color: #6b7280;
                    margin: 0 0 3px 10px;
                    font-weight: 600;
                    text-align: left;
                }

                .signature-subtitle {
                    font-size: 12px;
                    color: #9ca3af;
                    margin: 0 0 0 10px;
                    text-align: left;
                }

                .seal-area {
                    display: flex;
                    align-items: center;
                }

                .official-seal {
                    position: relative;
                }

                .seal-circle {
                    width: 80px;
                    height: 80px;
                    border: 3px solid #1e40af;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: radial-gradient(circle, #eff6ff, #dbeafe);
                }

                .seal-inner {
                    text-align: center;
                }

                .seal-text {
                    font-size: 10px;
                    font-weight: bold;
                    color: #1e40af;
                    line-height: 1;
                }

                .certificate-details {
                    display: flex;
                    justify-content: space-between;
                    border-top: 2px solid #e5e7eb;
                    padding-top: 15px;
                    font-size: 12px;
                }

                .details-left,
                .details-right {
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                }

                .details-right {
                    text-align: right;
                }

                .detail-line {
                    margin: 0;
                    color: #6b7280;
                    font-weight: 500;
                }

                .decoration {
                    position: absolute;
                    width: 40px;
                    height: 40px;
                    border: 3px solid #1e40af;
                    opacity: 0.3;
                }

                .decoration-top-left {
                    top: 15px;
                    left: 15px;
                    border-right: none;
                    border-bottom: none;
                }

                .decoration-top-right {
                    top: 15px;
                    right: 15px;
                    border-left: none;
                    border-bottom: none;
                }

                .decoration-bottom-left {
                    bottom: 15px;
                    left: 15px;
                    border-right: none;
                    border-top: none;
                }

                .decoration-bottom-right {
                    bottom: 15px;
                    right: 15px;
                    border-left: none;
                    border-top: none;
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
                        transform: scale(0.85);
                        transform-origin: center;
                    }
                }

                @media screen and (max-width: 768px) {
                    .certificate-container {
                        transform: scale(0.65);
                    }

                    .event-info {
                        flex-direction: column;
                        gap: 15px;
                    }

                    .info-separator {
                        display: none;
                    }
                }
            `})]})}export{h as default};
