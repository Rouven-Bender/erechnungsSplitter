import React, {useState} from "react";
import {createRoot} from 'react-dom/client';

import FileTree from "./components/filetree";
import { Document, Page } from 'react-pdf';

import { pdfjs } from 'react-pdf';


function Application(){
    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
	return (
		<div className="grid grid-cols-2 min-h-screen">
			<div className="h-full bg-blue-500 p-4">
                <Document file="/pdf">
                    <Page pageNumber={1}/>
                </Document>
            </div>
			<div className="h-full bg-green-500 p-4">Right Div</div>
		</div>
	)
}

const root = createRoot(document.getElementById('app'));
root.render(<Application/>)