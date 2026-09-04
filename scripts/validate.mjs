#!/usr/bin/env node

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const templateDir = path.join(root, "templates");
const cindyProfileDir = path.join(root, "profiles", "cindy");
const errors = [];

function readJson(relativePath) {
	return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function walkMarkdown(directory) {
	return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
		const fullPath = path.join(directory, entry.name);
		if (entry.isDirectory()) return walkMarkdown(fullPath);
		if (!entry.isFile() || !entry.name.endsWith(".md")) return [];
		return [fullPath];
	});
}

function isInside(parent, candidate) {
	const relative = path.relative(parent, candidate);
	return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

try {
	const manifest = readJson("templates/manifest.json");

	assert.equal(manifest.name, "collaboration-experience-kit");
	assert.equal(manifest.usage.copyMode, "whole-directory");
	assert.equal(manifest.usage.replacePlaceholdersBeforeUse, true);
	assert.ok(Array.isArray(manifest.placeholders) && manifest.placeholders.length > 0);
	assert.ok(Array.isArray(manifest.targets) && manifest.targets.length > 0);

	const placeholderNames = manifest.placeholders.map((item) => item.name);
	assert.equal(new Set(placeholderNames).size, placeholderNames.length, "placeholder names must be unique");
	for (const item of manifest.placeholders) {
		assert.equal(typeof item.meaning, "string", "every placeholder needs a meaning");
		assert.ok(item.meaning.trim().length > 0, "placeholder meaning cannot be empty");
	}

	const targetPaths = manifest.targets.map((item) => item.target);
	assert.equal(new Set(targetPaths).size, targetPaths.length, "target destinations must be unique");

	const markdown = walkMarkdown(templateDir).map((filePath) => ({
		filePath,
		text: fs.readFileSync(filePath, "utf8"),
	}));

	for (const placeholder of placeholderNames) {
		if (!markdown.some((file) => file.text.includes(placeholder))) {
			errors.push("Placeholder is documented but absent from templates: " + placeholder.name);
		}
	}

	for (const target of manifest.targets) {
		const sourcePath = path.resolve(templateDir, target.source);
		const destinationPath = path.resolve("/", target.target);

		if (!isInside(templateDir, sourcePath)) {
			errors.push("Source escapes templates directory: " + target.source);
			continue;
		}
		if (!fs.existsSync(sourcePath) || !fs.statSync(sourcePath).isFile()) {
			errors.push("Missing template source: " + target.source);
		}
		if (path.isAbsolute(target.target) || target.target.split(path.sep).includes("..")) {
			errors.push("Unsafe target path: " + target.target);
		}
		if (target.required !== true && target.required !== false) {
			errors.push("Target must explicitly declare required true or false: " + target.target);
		}
		if (destinationPath === path.parse(destinationPath).root) {
			errors.push("Target cannot replace filesystem root: " + target.target);
		}
	}

	const forbidden = /cindy|maker-core|electron|xdt/i;
	for (const file of markdown) {
		if (forbidden.test(file.text)) {
			errors.push("Template is product-specific: " + path.relative(root, file.filePath));
		}
	}

	const profileManifest = readJson("profiles/cindy/manifest.json");
	assert.equal(profileManifest.name, "cindy-reusable-rules");
	assert.equal(profileManifest.source.repository, "https://github.com/makecindy/cindy");
	assert.match(profileManifest.source.commit, /^[0-9a-f]{40}$/);
	assert.equal(profileManifest.source.license, "Apache-2.0");
	assert.equal(profileManifest.destination, "profiles/cindy");
	assert.ok(Array.isArray(profileManifest.included) && profileManifest.included.length > 0);
	assert.ok(Array.isArray(profileManifest.excluded) && profileManifest.excluded.length > 0);

	for (const item of profileManifest.included) {
		assert.equal(typeof item.source, "string", "profile source must be a string");
		assert.equal(typeof item.target, "string", "profile target must be a string");
		assert.equal(typeof item.category, "string", "profile category must be a string");
		const target = path.join(root, profileManifest.destination, item.target);
		const targetIsDirectory = item.target.endsWith("/**");
		const resolvedTarget = targetIsDirectory ? target.slice(0, -3) : target;
		if (!isInside(cindyProfileDir, resolvedTarget)) {
			errors.push("Profile target escapes profile directory: " + item.target);
			continue;
		}
		if (!fs.existsSync(resolvedTarget)) {
			errors.push("Missing profile target: " + item.target);
		} else if (targetIsDirectory && !fs.statSync(resolvedTarget).isDirectory()) {
			errors.push("Profile target must be a directory: " + item.target);
		}
	}

	const requiredProfileFiles = [
		"README.md",
		"manifest.json",
		"LICENSE-APACHE-2.0",
	];
	for (const relativePath of requiredProfileFiles) {
		if (!fs.existsSync(path.join(cindyProfileDir, relativePath))) {
			errors.push("Missing profile metadata: " + relativePath);
		}
	}

	const forbiddenProfilePaths = [
		"docs/product-rules",
		"docs/design-previews",
		"docs/legal/notices",
	];
	for (const relativePath of forbiddenProfilePaths) {
		if (fs.existsSync(path.join(cindyProfileDir, relativePath))) {
			errors.push("Business or generated source was copied into profile: " + relativePath);
		}
	}
} catch (error) {
	errors.push(error.message);
}

if (errors.length > 0) {
	console.error("validation failed:");
	for (const error of errors) console.error("- " + error);
	process.exit(1);
}

console.log("template and Cindy profile manifests valid");
