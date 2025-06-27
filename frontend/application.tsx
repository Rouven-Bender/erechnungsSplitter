import React from "react";
import {createRoot} from 'react-dom/client';

import FileTree from "./components/filetree";

function Application(){
	return (
		<div className="grid grid-cols-2 min-h-screen">
			<div className="h-full bg-blue-500 p-4">Left Div</div>
			<div className="h-full bg-green-500 p-4">Right Div</div>
		</div>
	)
}

const root = createRoot(document.getElementById('app'));
root.render(<Application/>)