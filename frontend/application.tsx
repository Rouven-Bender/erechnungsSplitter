import React, {useState} from "react";
import {createRoot} from 'react-dom/client';

import FileTree from "./components/filetree";
import Controls from "./components/controls"
import { Document, Page } from 'react-pdf';

import { pdfjs } from 'react-pdf';

import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';


function Application(){
	return (
		<div className="grid grid-cols-[max-content_1fr] min-h-screen">
            <PDFDisplay/>
			<div className="h-full bg-green-200 p-4"><Controls/></div>
		</div>
	)
}

function PDFDisplay(){
    const [page, setPage] = useState(1)

    function nextPage(){
        setPage(page+1);
    }
    function prevPage(){
        setPage(page-1);
    }

    pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`;
    return (
        <div className="h-full bg-blue-200 p-4">
            <div className="mx-auto">
                <Document file="/pdf">
                    <Page pageNumber={page} />
                </Document>
                <div className="flex flex-row pt-2">
                    <button className="mx-auto" onClick={prevPage}>Vorherige Seite</button>
                    <button className="mx-auto" onClick={nextPage}>Nächste Seite</button>
                </div>
            </div>
        </div>
   )
}

const root = createRoot(document.getElementById('app'));
root.render(<Application/>)