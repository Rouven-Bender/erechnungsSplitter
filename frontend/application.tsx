import React from "react";
import {createRoot} from 'react-dom/client';

import FileTree from "./components/filetree";

function Application(){
	return (
		<div>
		<FileTree />
		</div>
	)
}

const root = createRoot(document.getElementById('app'));
root.render(<Application/>)
