import React, {useState, useEffect, StrictMode} from "react";
import {createRoot} from 'react-dom/client';
import { createBrowserRouter, Navigate, RouterProvider, useParams } from "react-router-dom";

//import FileTree from "./components/filetree";
import { PDFDisplay } from "./components/PDFDisplay";
import { Booker } from "./components/booker";

function Application(){
	return (
		<div className="grid grid-cols-[max-content_1fr] min-h-screen">
            <PDFDisplay/>
            <Booker/>
		</div>
	)
}

const router = createBrowserRouter([
    {path: "/element/:id", element: <Application/>},
    {path: "/", element: <Navigate to={"/element/0"}/>}
]);

createRoot(document.getElementById('app')).render(
    <StrictMode>
        <RouterProvider router={router}/>
    </StrictMode>
);