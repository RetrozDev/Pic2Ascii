import React, { useRef, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // N'oubliez pas d'importer les styles

import "./App.css";

const App = () => {
	const canvasRef = useRef(null);
	const asciiRef = useRef(null);
	const fileInputRef = useRef(null);
	const [asciiArt, setAsciiArt] = useState("");

	const maxWidth = 50;
	const maxHeight = 50;
	const brightnessChars = "@%#*+=-:.";
	const brightnessCharsLength = brightnessChars.length;

	const toGrayScale = (r, g, b) => 0.21 * r + 0.72 * g + 0.07 * b;

	const getFontRatio = () => {
		const pre = document.createElement("pre");
		pre.style.display = "inline";
		pre.textContent = " ";

		document.body.appendChild(pre);
		const { width, height } = pre.getBoundingClientRect();
		document.body.removeChild(pre);

		return height / width;
	};

	const fontRatio = getFontRatio();

	const convertToGrayScales = (context, width, height) => {
		const imageData = context.getImageData(0, 0, width, height);

		const grayScales = [];

		for (let i = 0; i < imageData.data.length; i += 4) {
			const r = imageData.data[i];
			const g = imageData.data[i + 1];
			const b = imageData.data[i + 2];

			const grayScale = toGrayScale(r, g, b);
			imageData.data[i] =
				imageData.data[i + 1] =
				imageData.data[i + 2] =
					grayScale;

			grayScales.push(grayScale);
		}

		context.putImageData(imageData, 0, 0);

		return grayScales;
	};

	const clampDimensions = (width, height) => {
		const rectifiedWidth = Math.floor(fontRatio * width);

		if (height > maxHeight) {
			const reducedWidth = Math.floor((rectifiedWidth * maxHeight) / height);
			return [reducedWidth, maxHeight];
		}

		if (width > maxWidth) {
			const reducedHeight = Math.floor((height * maxWidth) / rectifiedWidth);
			return [maxWidth, reducedHeight];
		}

		return [rectifiedWidth, height];
	};

	const getCharacterForGrayScale = (grayScale) =>
		brightnessChars[Math.ceil(((brightnessCharsLength - 1) * grayScale) / 255)];

	const drawAscii = (grayScales, width) => {
		const ascii = grayScales.reduce((asciiImage, grayScale, index) => {
			let nextChars = getCharacterForGrayScale(grayScale);
			if ((index + 1) % width === 0) {
				nextChars += "\n";
			}

			return asciiImage + nextChars;
		}, "");

		setAsciiArt(ascii);
	};

	const handleFileChange = (e) => {
		const file = e.target.files[0];
		const reader = new FileReader();

		reader.onload = (event) => {
			const image = new Image();
			image.onload = () => {
				const [width, height] = clampDimensions(image.width, image.height);

				const canvas = canvasRef.current;
				const context = canvas.getContext("2d");

				canvas.width = width;
				canvas.height = height;

				context.drawImage(image, 0, 0, width, height);
				const grayScales = convertToGrayScales(context, width, height);

				drawAscii(grayScales, width);
			};

			image.src = event.target.result;
		};

		reader.readAsDataURL(file);
	};

	const handleCopy = () => {
		if (asciiArt) {
			navigator.clipboard
				.writeText(asciiArt)
				.then(() => {
					toast.success("ASCII Art copié !"); // Toast success
				})
				.catch((err) => {
					toast.error(`Erreur durant la copie du ASCII Art: ${err}`); // Toast error
				});
		}
	};

	return (
		<div className="App">
			<label for="images">
				<span>Choisir une image</span>
				<input
					type="file"
					ref={fileInputRef}
					onChange={handleFileChange}
					id="images"
				/>
			</label>
			<canvas ref={canvasRef} style={{ display: "none" }} />

			{asciiArt && (
				<pre ref={asciiRef} style={{ whiteSpace: "pre-wrap" }}>
					{asciiArt}
				</pre>
			)}

			{asciiArt && (
				<button onClick={handleCopy} type="button">
					Copier
				</button>
			)}

			{/* Toast Container */}
			<ToastContainer />
			<a href="https://github.com/RetrozDev/Pic2Ascii" target="_blank"> Voir le code source </a>
		</div>
	);
};

export default App;
