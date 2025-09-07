import{r as n,R as d,j as e,L as m}from"./app-N-EPihUa.js";import{C as o,a as h}from"./card-CE9XdPvq.js";import{A as p}from"./award-zKThJLLD.js";import"./utils-jAU0Cazi.js";import"./createLucideIcon-BIDvmu9u.js";function N({userName:i,eventTitle:s,eventDate:l,eventDuration:r,certificateCode:c,autoDownload:t}){const[a,x]=n.useState(!1);return d.useEffect(()=>{t&&!a&&setTimeout(()=>{window.print(),x(!0)},1e3)},[t,a]),e.jsxs(e.Fragment,{children:[e.jsx(m,{title:`Certificate - ${s}`}),e.jsx("div",{className:"min-h-screen bg-gray-50 p-4 md:p-6",children:e.jsxs("div",{className:"mx-auto max-w-6xl space-y-6",children:[e.jsxs("div",{className:"text-center print:hidden",children:[e.jsx("h1",{className:"text-2xl font-bold text-gray-900",children:"Certificate of Completion"}),e.jsx("p",{className:"text-gray-600",children:"Your achievement certificate"}),t&&e.jsx("p",{className:"mt-2 text-sm text-blue-600",children:"Certificate will download automatically..."})]}),e.jsx(o,{className:"certificate-container bg-gradient-to-br from-blue-50 to-indigo-100 print:bg-white print:shadow-none",children:e.jsx(h,{className:"p-0",children:e.jsx("div",{className:"certificate-content aspect-[4/3] w-full bg-white p-8 md:p-12 lg:p-16",children:e.jsxs("div",{className:"relative h-full w-full rounded-lg border-8 border-double border-blue-600 bg-gradient-to-br from-blue-50 to-white p-8 md:p-12",children:[e.jsxs("div",{className:"mb-8 text-center",children:[e.jsxs("div",{className:"mb-6 flex items-center justify-center gap-4",children:[e.jsx("img",{src:"/assets/images/Bemsis.jpg",alt:"Barangay Logo",className:"h-20 w-20 object-contain md:h-24 md:w-24"}),e.jsx(p,{className:"h-16 w-16 text-yellow-500 md:h-20 md:w-20"})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx("h1",{className:"text-xl font-bold text-blue-800 md:text-2xl lg:text-3xl",children:"BARANGAY EVENT MANAGEMENT SYSTEM"}),e.jsx("h2",{className:"text-2xl font-bold text-blue-800 md:text-3xl lg:text-4xl",children:"Certificate of Completion"})]}),e.jsx("div",{className:"mx-auto mt-4 h-1 w-32 bg-gradient-to-r from-blue-400 to-blue-600"})]}),e.jsxs("div",{className:"space-y-6 text-center md:space-y-8",children:[e.jsx("p",{className:"text-lg text-gray-700 md:text-xl",children:"This is to certify that"}),e.jsx("div",{className:"mx-auto max-w-md border-b-2 border-blue-600 pb-2",children:e.jsx("h3",{className:"text-2xl font-bold text-blue-800 md:text-3xl lg:text-4xl",children:i})}),e.jsx("p",{className:"text-lg text-gray-700 md:text-xl",children:"has successfully completed the community event"}),e.jsx("div",{className:"mx-auto max-w-2xl",children:e.jsxs("h4",{className:"text-xl font-semibold text-blue-700 md:text-2xl lg:text-3xl",children:['"',s,'"']})}),e.jsxs("div",{className:"flex flex-col items-center gap-4 md:flex-row md:justify-center md:gap-8",children:[e.jsxs("div",{className:"text-center",children:[e.jsx("p",{className:"text-sm font-medium text-gray-600",children:"Date"}),e.jsx("p",{className:"text-lg font-semibold text-blue-700",children:l})]}),e.jsxs("div",{className:"text-center",children:[e.jsx("p",{className:"text-sm font-medium text-gray-600",children:"Duration"}),e.jsx("p",{className:"text-lg font-semibold text-blue-700",children:r})]})]})]}),e.jsxs("div",{className:"absolute right-8 bottom-8 left-8 flex items-end justify-between",children:[e.jsxs("div",{className:"text-left",children:[e.jsxs("div",{className:"mb-2 flex flex-col items-center",children:[e.jsx("div",{className:"font-script mb-1 text-lg text-blue-800",style:{fontFamily:"cursive"},children:"Captain Maria Santos"}),e.jsx("div",{className:"h-px w-32 bg-gray-400"})]}),e.jsx("p",{className:"text-sm font-medium text-gray-600",children:"Barangay Captain"}),e.jsx("p",{className:"text-xs text-gray-500",children:"Authorized Signature"})]}),e.jsxs("div",{className:"text-center",children:[e.jsxs("p",{className:"text-xs text-gray-500",children:["Certificate ID: ",c]}),e.jsxs("p",{className:"text-xs text-gray-500",children:["Issued: ",new Date().toLocaleDateString()]}),e.jsx("p",{className:"mt-1 text-xs text-gray-500",children:"This certificate is digitally verified"})]}),e.jsxs("div",{className:"text-right",children:[e.jsx("div",{className:"mb-2 h-px w-32 bg-gray-400"}),e.jsx("p",{className:"text-sm font-medium text-gray-600",children:"Date Issued"}),e.jsx("p",{className:"text-xs text-gray-500",children:new Date().toLocaleDateString()})]})]})]})})})})]})}),e.jsx("style",{children:`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .certificate-container,
                    .certificate-container * {
                        visibility: visible;
                    }
                    .certificate-container {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        height: 100%;
                        background: white !important;
                    }
                    .print\\:hidden {
                        display: none !important;
                    }
                    .print\\:shadow-none {
                        box-shadow: none !important;
                    }
                    .print\\:bg-white {
                        background: white !important;
                    }
                   @page {
                        size: landscape;
                        margin: 0.5in;
                    }
                    .certificate-content {
                        padding: 2rem !important;
                    }
                    .font-script {
                        font-family: 'Brush Script MT', cursive;
                    }
                }
            `})]})}export{N as default};
