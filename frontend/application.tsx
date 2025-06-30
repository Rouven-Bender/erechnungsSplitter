import React, {useState, useEffect} from "react";
import {createRoot} from 'react-dom/client';

//import FileTree from "./components/filetree";
import { PDFDisplay } from "./components/PDFDisplay";

import { ControlData } from "./types";

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

const root = createRoot(document.getElementById('app'));
root.render(<Application/>)