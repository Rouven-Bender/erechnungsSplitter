import React, {useState, useEffect} from "react";

import { Document, Page } from 'react-pdf';
import { pdfjs } from 'react-pdf';
import { InvoiceData } from "../types";

import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import { useParams } from "react-router-dom";

export function PDFDisplay(){
    const { id } = useParams();
    const [page, setPage] = useState(1)
    const [pdfview, enablePdfView] = useState(false); //TODO: change to true later

    const [numberofPDFs, setNumberofPDFs] = useState(0)
    const [invoice, setInvoiceData] = useState<InvoiceData>();


    useEffect(() => {
        try {
            fetch("/ui/numberofPDFs").then(response => {return response.text()}).then(text => {setNumberofPDFs(parseInt(text))})
            fetch("/ui/invoicedata/" + id).then(Response => {return Response.json()}).then(json => {setInvoiceData(json)})
        } catch (err) {
            console.log(err.message)
        }
    }, [id])

    function nextPage(){
        setPage(page+1);
    }

    function prevPage(){
        setPage(page-1);
    }

    function togglePDFView() {
        enablePdfView(!pdfview);
    }

    if (id == undefined || parseInt(id) > numberofPDFs) {
        return;
    }

    pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`;
    if (pdfview || invoice == undefined) {
        return (
            <div className="h-full pt-1.5 pb-1.5 pl-4 pr-4">
                <div className="mx-auto flex flex-col">
                    <div className="mx-auto">
                    {invoice == undefined ? <br /> : <label>
                        <input type="checkbox" name="PDFViewToggle" checked={pdfview} onChange={togglePDFView}></input> PDF Ansicht
                    </label>}
                    </div>
                    <Document file={"/pdf/"+id}>
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
                <p>Rechnungsdatum: <input name="rechungsdatum" type="date" value={invoice.datum?.toString()} disabled={true}/></p>
                <table className="border-1 border-spacing-x-3 border-seperate">
                    <thead>
                    <tr>
                        <th>Produktname</th>
                        <th>Netto</th>
                        <th>Anzahl</th>
                        <th>Gesamt</th>
                    </tr>
                    </thead>
                    <tbody>
                        {invoice?.positions?.map((row, idx)=> {
                            return (
                                <tr key={idx}>
                                    <td>{row.productName}</td>
                                    <td>{row.netto}</td>
                                    <td>{row.quantity}</td>
                                    <td>{row.total}</td>
                                </tr>
                            ) 
                        })}
                    </tbody>
                </table>
                {invoice?.sellerVATID ? <p>Verkäufers VAT ID: {invoice?.sellerVATID}</p> : ""}
                {invoice?.sellerTaxID ? <p>Verkäufers Steuer ID: {invoice?.sellerTaxID}</p> : ""}
                <p>Rechnungsbetrag (Netto): {invoice?.invoiceNetto} {invoice?.currency}</p>
                <p>Rechnungsbetrag: {invoice?.invoiceTotal} {invoice?.currency}</p>
            </div>
            </div>
            </div>
        )
    }
}