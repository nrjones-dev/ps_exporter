const { app, constants, core, imaging } = require("photoshop");
const { storage } = require("uxp");

// Helper function to execute photoshop as modal.
function executePhotoshopModal(callback, commandName) {
	return core.executeAsModal(callback, { commandName });
}

// Suffix name constants
const SWIPE = "_SWIPE";
const MERGE = "_MERGE";
const RESOLUTION = [1024, 1267];

// find all relevant layers that are of kind GROUP and ends with SWIPE or MERGE constants
function findLayers(layers) {
	const groupsToMerge = [];
	layers.forEach((layer) => {
		if (layer.layers) {
			const foundLayers = findLayers(layer.layers);
			groupsToMerge.push(...foundLayers);
		}
		if (
			layer.kind === constants.LayerKind.GROUP &&
			(layer.name.endsWith(SWIPE) || layer.name.endsWith(MERGE))
		) {
			groupsToMerge.push(layer);
		}
	});
	return groupsToMerge;
}

// Remove suffix from groups that will be merged, and merges them into a single layer
function mergeGroupLayers(groupsToMerge) {
	executePhotoshopModal(() => {
		groupsToMerge.forEach((layer) => {
			layer.name = layer.name.replace(SWIPE, "").replace(MERGE, "");
		});
		groupsToMerge.forEach((layer) => layer.merge());
	}, "merging layers");
}

// Function that creates layer masks based on layer bounds for each group.
async function createMaskFromBounds(layer) {
	const { width: docWidth, height: docHeight } = app.activeDocument;
	const { left, top, right, bottom } = layer.bounds;

	// Create a full-sized buffer initialized to 0 (black).
	const buffer = new Uint8Array(docWidth * docHeight).fill(0);
	const rowSize = right - left;
	const whiteRow = new Uint8Array(rowSize).fill(255);

	// Fill only the target area with white (255) using a subarray.
	for (let y = top; y < bottom; y++) {
		buffer.set(whiteRow, y * docWidth + left);
	}

	// Create the ImageData object for the entire mask.
	const maskImageData = await imaging.createImageDataFromBuffer(buffer, {
		width: docWidth,
		height: docHeight,
		components: 1,
		colorSpace: "Grayscale",
	});

	// Apply the mask to the current layer group.
	await imaging.putLayerMask({ layerID: layer.id, imageData: maskImageData });
	maskImageData.dispose();
}

// For each group in the list, calls 'CreateMaskFromBounds'.
async function createMasks() {
	const documentLayers = app.activeDocument.layers;
	const groupsToMask = findLayers(documentLayers);

	if (groupsToMask.length === 0) {
		return window.alert("No layers to mask");
	}

	await executePhotoshopModal(async () => {
		await Promise.all(groupsToMask.map(createMaskFromBounds));
	}, "Create Masks");
}

// Main function that calls findLayers and mergeGroupLayers on button press
function flattenGroupsMain() {
	const groupsToMerge = findLayers(app.activeDocument.layers);
	if (groupsToMerge.length === 0) return window.alert("No layers to merge");
	mergeGroupLayers(groupsToMerge);
}

// Resize and Export document as PSD functionality
async function resizeDocument() {
	await executePhotoshopModal(
		() =>
			app.activeDocument.resizeImage(
				RESOLUTION[0],
				RESOLUTION[1],
				undefined,
				constants.ResampleMethod.BILINEAR
			),
		"resizing document"
	);
}

async function saveFile() {
	const fileNameWithoutExt = app.activeDocument.name.replace(/\.[^/.]+$/, "");
	const entry = await storage.localFileSystem.getFileForSaving(
		`${fileNameWithoutExt}_EXPORT.psd`
	);
	await executePhotoshopModal(() => {
		app.activeDocument.saveAs.psd(entry);
	}, "saving psd");
}

async function exportFile() {
	await executePhotoshopModal(async () => {
		await resizeDocument();
		await saveFile();
	}, "Exporting File");
}

// Event listener calls
document.getElementById("createMasks").addEventListener("click", createMasks);
document.getElementById("flattenGroups").addEventListener("click", flattenGroupsMain);
document.getElementById("exportFile").addEventListener("click", exportFile);
