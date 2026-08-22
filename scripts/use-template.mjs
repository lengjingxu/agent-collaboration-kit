#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const templateDir = path.join(root, "templates");
const usage = [
	"Usage:",
	"  node scripts/use-template.mjs <target-dir> [--force] [--no-ui] [--set NAME=value]...",
	"",
	"Options:",
	"  --force    Overwrite existing destination files.",
	"  --no-ui    Skip targets marked required=false.",
	"  --set      Replace a placeholder during generation."
].join("\n");

function fail(message) {
	console.error(message);
	process.exit(1);
}

function parseArgs(argv) {
	const options = { target: undefined, force: false, noUi: false, values: new Map() };

	for (let index = 0; index < argv.length; index += 1) {
		const argument = argv[index];
		if (argument === "--force") {
			options.force = true;
		} else if (argument === "--no-ui") {
			options.noUi = true;
		} else if (argument === "--set") {
			const value = argv[++index];
			if (!value || !value.includes("=")) fail("--set requires NAME=value\n\n" + usage);
			const separator = value.indexOf("=");
			options.values.set(value.slice(0, separator), value.slice(separator + 1));
		} else if (argument.startsWith("--set=")) {
			const value = argument.slice(6);
			if (!value.includes("=")) fail("--set requires NAME=value\n\n" + usage);
			const separator = value.indexOf("=");
			options.values.set(value.slice(0, separator), value.slice(separator + 1));
		} else if (argument.startsWith("--")) {
			fail("Unknown option: " + argument + "\n\n" + usage);
		} else if (options.target === undefined) {
			options.target = argument;
		} else {
			fail("Only one target directory can be supplied\n\n" + usage);
		}
	}

	if (!options.target) fail("A target directory is required\n\n" + usage);
	return options;
}

function isInside(parent, candidate) {
	const relative = path.relative(parent, candidate);
	return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

function replacePlaceholders(text, values) {
	let output = text;
	for (const [name, value] of values) output = output.replaceAll(name, value);
	return output;
}

function findPlaceholders(text, names) {
	return names.filter((name) => text.includes(name));
}

const options = parseArgs(process.argv.slice(2));
const targetDir = path.resolve(options.target);
const manifestPath = path.join(templateDir, "manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

fs.mkdirSync(targetDir, { recursive: true });

const planned = [];
for (const item of manifest.targets) {
	if (options.noUi && item.required === false) continue;

	const sourcePath = path.resolve(templateDir, item.source);
	const destinationPath = path.resolve(targetDir, item.target);
	if (!isInside(templateDir, sourcePath)) fail("Refusing unsafe source: " + item.source);
	if (!isInside(targetDir, destinationPath)) fail("Refusing unsafe destination: " + item.target);

	if (!fs.existsSync(sourcePath)) fail("Missing source: " + item.source);
	if (fs.existsSync(destinationPath) && !options.force) {
		fail("Destination already exists: " + destinationPath + "\nUse --force to replace it.");
	}
	planned.push({ sourcePath, destinationPath });
}

for (const item of planned) {
	fs.mkdirSync(path.dirname(item.destinationPath), { recursive: true });
	const sourceText = fs.readFileSync(item.sourcePath, "utf8");
	fs.writeFileSync(item.destinationPath, replacePlaceholders(sourceText, options.values));
	console.log("created " + path.relative(targetDir, item.destinationPath));
}

const knownNames = manifest.placeholders.map((item) => item.name);
const remaining = new Set();
for (const item of planned) {
	const text = fs.readFileSync(item.destinationPath, "utf8");
	for (const name of findPlaceholders(text, knownNames)) remaining.add(name);
}

console.log("\nGenerated " + planned.length + " files in " + targetDir);
if (remaining.size > 0) {
	console.log("Finish these placeholders before use:");
	for (const name of [...remaining].sort()) console.log("- " + name);
} else {
	console.log("All documented placeholders have been replaced.");
}
