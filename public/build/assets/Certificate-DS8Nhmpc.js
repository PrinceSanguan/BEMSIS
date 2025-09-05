import{r as o,j as e,L as m}from"./app-CMI4-wRO.js";import{B as i}from"./button-CjgRfl2Z.js";import{C as h,a as p}from"./card-BMMac1pu.js";import{c as g}from"./createLucideIcon-B7apOioz.js";import{D as f}from"./download-DUbItnpn.js";import{A as j}from"./award-DeCtfeYx.js";/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const b=[["path",{d:"M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8",key:"1b2hhj"}],["polyline",{points:"16 6 12 2 8 6",key:"m901s6"}],["line",{x1:"12",x2:"12",y1:"2",y2:"15",key:"1p0rca"}]],N=g("Share",b);function S({userName:l,eventTitle:t,eventDate:r,eventDuration:c,certificateCode:n}){const[s,a]=o.useState(!1),d=()=>{a(!0),window.print(),a(!1)},x=()=>{navigator.share?navigator.share({title:"My Certificate",text:`I earned a certificate for completing ${t}`,url:window.location.href}):(navigator.clipboard.writeText(window.location.href),alert("Certificate link copied to clipboard!"))};return e.jsxs(e.Fragment,{children:[e.jsx(m,{title:`Certificate - ${t}`}),e.jsx("div",{className:"min-h-screen bg-gray-50 p-4 md:p-6",children:e.jsxs("div",{className:"mx-auto max-w-6xl space-y-6",children:[e.jsxs("div",{className:"flex items-center justify-between print:hidden",children:[e.jsxs("div",{children:[e.jsx("h1",{className:"text-2xl font-bold text-gray-900",children:"Certificate of Completion"}),e.jsx("p",{className:"text-gray-600",children:"Your achievement certificate"})]}),e.jsxs("div",{className:"flex gap-2",children:[e.jsxs(i,{variant:"outline",onClick:x,className:"gap-2",children:[e.jsx(N,{className:"h-4 w-4"}),"Share"]}),e.jsxs(i,{onClick:d,disabled:s,className:"gap-2",children:[e.jsx(f,{className:"h-4 w-4"}),s?"Downloading...":"Download"]})]})]}),e.jsx(h,{className:"certificate-container bg-gradient-to-br from-blue-50 to-indigo-100 print:bg-white print:shadow-none",children:e.jsx(p,{className:"p-0",children:e.jsx("div",{className:"certificate-content aspect-[4/3] w-full bg-white p-8 md:p-12 lg:p-16",children:e.jsxs("div",{className:"relative h-full w-full rounded-lg border-8 border-double border-blue-600 bg-gradient-to-br from-blue-50 to-white p-8 md:p-12",children:[e.jsxs("div",{className:"mb-8 text-center",children:[e.jsxs("div",{className:"mb-6 flex items-center justify-center gap-4",children:[e.jsx("img",{src:"/assets/images/Bemsis.jpg",alt:"Barangay Logo",className:"h-20 w-20 object-contain md:h-24 md:w-24"}),e.jsx(j,{className:"h-16 w-16 text-yellow-500 md:h-20 md:w-20"})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx("h1",{className:"text-xl font-bold text-blue-800 md:text-2xl lg:text-3xl",children:"BARANGAY EVENT MANAGEMENT SYSTEM"}),e.jsx("h2",{className:"text-2xl font-bold text-blue-800 md:text-3xl lg:text-4xl",children:"Certificate of Completion"})]}),e.jsx("div",{className:"mx-auto mt-4 h-1 w-32 bg-gradient-to-r from-blue-400 to-blue-600"})]}),e.jsxs("div",{className:"space-y-6 text-center md:space-y-8",children:[e.jsx("p",{className:"text-lg text-gray-700 md:text-xl",children:"This is to certify that"}),e.jsx("div",{className:"mx-auto max-w-md border-b-2 border-blue-600 pb-2",children:e.jsx("h3",{className:"text-2xl font-bold text-blue-800 md:text-3xl lg:text-4xl",children:l})}),e.jsx("p",{className:"text-lg text-gray-700 md:text-xl",children:"has successfully completed the community event"}),e.jsx("div",{className:"mx-auto max-w-2xl",children:e.jsxs("h4",{className:"text-xl font-semibold text-blue-700 md:text-2xl lg:text-3xl",children:['"',t,'"']})}),e.jsxs("div",{className:"flex flex-col items-center gap-4 md:flex-row md:justify-center md:gap-8",children:[e.jsxs("div",{className:"text-center",children:[e.jsx("p",{className:"text-sm font-medium text-gray-600",children:"Date"}),e.jsx("p",{className:"text-lg font-semibold text-blue-700",children:r})]}),e.jsxs("div",{className:"text-center",children:[e.jsx("p",{className:"text-sm font-medium text-gray-600",children:"Duration"}),e.jsx("p",{className:"text-lg font-semibold text-blue-700",children:c})]})]})]}),e.jsxs("div",{className:"absolute right-8 bottom-8 left-8 flex items-end justify-between",children:[e.jsxs("div",{className:"text-left",children:[e.jsx("div",{className:"mb-2 h-px w-32 bg-gray-400"}),e.jsx("p",{className:"text-sm font-medium text-gray-600",children:"Barangay Official"}),e.jsx("p",{className:"text-xs text-gray-500",children:"Authorized Signature"})]}),e.jsxs("div",{className:"text-center",children:[e.jsxs("p",{className:"text-xs text-gray-500",children:["Certificate ID: ",n]}),e.jsxs("p",{className:"text-xs text-gray-500",children:["Issued: ",new Date().toLocaleDateString()]}),e.jsx("p",{className:"mt-1 text-xs text-gray-500",children:"This certificate is digitally verified"})]}),e.jsxs("div",{className:"text-right",children:[e.jsx("div",{className:"mb-2 h-px w-32 bg-gray-400"}),e.jsx("p",{className:"text-sm font-medium text-gray-600",children:"Date Issued"}),e.jsx("p",{className:"text-xs text-gray-500",children:new Date().toLocaleDateString()})]})]})]})})})})]})}),e.jsx("style",{children:`
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
                }
            `})]})}export{S as default};
