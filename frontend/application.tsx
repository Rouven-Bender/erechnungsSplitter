import React, {useState, useEffect} from "react";
import {createRoot} from 'react-dom/client';

//import FileTree from "./components/filetree";
import { Document, Page } from 'react-pdf';

import { pdfjs } from 'react-pdf';

import { ControlData, InvoiceData } from "./types";

import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';


function Application(){
    const [data, setData] = useState<ControlData>()
    const [bookFullInvoice, setBookFullInvoice] = useState(true);

    useEffect(() => {
        async function f() {
           try {
                var response = await fetch('/ui')
                setData(await response.json())
           } catch(err) {
                console.log(err.message)
           }
        }
        f();
    }, [])

    function toggleBookFullInvoice() {
        setBookFullInvoice(!bookFullInvoice)
    }

    if (bookFullInvoice) {
        var booker = (
            <div><p>Full invoice booking</p></div>
        )
    } else {
        var booker = (
            <div><p>Invoice splitting</p></div>
        )
    }

	return (
		<div className="grid grid-cols-[max-content_1fr] min-h-screen">
            <PDFDisplay invoice={data?.invoice}/>
			<div className="h-full bg-green-200 p-4">
                <div>
                    <p>PDF: {data?.currentOfPDFS} / {data?.numberOfPDFS}</p>
                    <label><input name="fullBookingToogle"
                        type="checkbox" checked={bookFullInvoice} onChange={toggleBookFullInvoice}></input> Volle Rechnung auf Konto</label>
                    {booker}
                </div>
            </div>
		</div>
	)
}

function PDFDisplay({invoice}: {invoice : InvoiceData | undefined}){
    const [page, setPage] = useState(1)
    const [pdfview, enablePdfView] = useState(false); //TODO: change to true later

    function nextPage(){
        setPage(page+1);
    }
    function prevPage(){
        setPage(page-1);
    }
    function togglePDFView() {
        enablePdfView(!pdfview);
    }

    pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`;
    if (pdfview) {
        return (
            <div className="h-full bg-blue-200 pt-1.5 pb-1.5 pl-4 pr-4">
                <div className="mx-auto flex flex-col">
                    <div className="mx-auto">
                    <label>
                        <input type="checkbox" name="PDFViewToggle" checked={pdfview} onChange={togglePDFView}></input> PDF Ansicht
                    </label>
                    </div>
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
    } else {
        return (
            <div className="min-w-full flex flex-col pt-2">
            <label className="mx-auto"><input type="checkbox" name="PDFViewToggle" onChange={togglePDFView}></input> PDF Ansicht</label>
            <p>Dataview</p>
            <div className="px-4">
            <div className="grid grid-cols-2">
                <p className="px-4">Sender:<br/>
                   {invoice?.sender?.name}<br/> 
                   {invoice?.sender?.street}<br/>
                   {invoice?.sender?.zip}<br/>
                   {invoice?.sender?.location}<br/>
                   {invoice?.sender?.country}<br/>
                </p>
                <p className="px-4">Empfänger:<br/>
                   {invoice?.reciever?.name}<br/>
                   {invoice?.reciever?.street}<br/>
                   {invoice?.reciever?.zip}<br/>
                   {invoice?.reciever?.location}<br/>
                   {invoice?.reciever?.country}<br/>
                </p>
            </div>
            <div className="pt-2 flex flex-col gap-y-2">
                <p>Rechnungsnummer: {invoice?.invoiceNumber}</p>
                {invoice?.sellerVATID ? <p>Verkäufers VAT ID: {invoice?.sellerVATID}</p> : ""}
                {invoice?.sellerTaxID ? <p>Verkäufers Steuer ID: {invoice?.sellerTaxID}</p> : ""}
                <p>Rechnungsbetrag: {invoice?.invoiceTotal} {invoice?.currency}</p>
            </div>
            </div>
            </div>
        )
    }
}

const root = createRoot(document.getElementById('app'));
root.render(<Application/>)