import React, {useState, useEffect, StrictMode} from "react";
import {createRoot} from 'react-dom/client';
import { createBrowserRouter, Navigate, RouterProvider, useParams } from "react-router-dom";

//import FileTree from "./components/filetree";
import { PDFDisplay } from "./components/PDFDisplay";
import { Booker } from "./components/booker";
import { Management } from "./components/management";
import { AccountEditor } from "./components/AccountEditor";
import { Link } from "react-router-dom";

function Application(){
	return (
        <div className="min-h-screen">
		    <div className="grid grid-cols-[max-content_1fr] divide-x-2 divide-dotted min-h-[97vh]">
                <PDFDisplay/>
                <Booker/>
		    </div>
            <div className="min-h-fit border-t-1">
                <Link className="pl-3 bottom-5 right-5" to={"/management"}>Management</Link>
            </div>
        </div>
	)
}

const router = createBrowserRouter([
    //{path: "/", element: <Navigate to={"/element/0"}/>},
    {path: "/", element: <Navigate to={"/management"}/>},
    {path: "/element/:id", element: <Application/>},
    {path: "/management", element: <Management/>},
    {path: "/management/editAccounts", element: <AccountEditor/>}
]);

createRoot(document.getElementById('app')).render(
    <StrictMode>
        <RouterProvider router={router}/>
    </StrictMode>
);