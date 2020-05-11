/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

const gulp = require('gulp');
const { signAsync } = require('electron-osx-sign');
const util = require('./lib/util');
const path = require('path');

const appRoot = process.env['APP_ROOT'];
const appName = process.env['APP_NAME'];
const appFrameworkPath = process.env['APP_FRAMEWORK_PATH'];
const helperAppBaseName = process.env['HELPER_APP_BASE_NAME'];
const gpuHelperAppName = helperAppBaseName + ' Helper (GPU).app';
const pluginHelperAppName = helperAppBaseName + ' Helper (Plugin).app';
const rendererHelperAppName = helperAppBaseName + ' Helper (Renderer).app';

const defaultOpts = {
	app: path.join(appRoot, appName),
	platform: 'darwin',
	entitlements: path.join(__dirname, 'azure-pipelines', 'darwin', 'app-entitlements.plist'),
	hardenedRuntime: true,
	'pre-auto-entitlements': false,
	'pre-embed-provisioning-profile': false,
	keychain: path.join(buildDir, 'buildagent.keychain'),
	version: util.getElectronVersion(),
	identity: '99FM488X57'
};

const appOpts = Object.assign(defaultOpts, {
	ignore: (filePath) => {
		return filePath.includes(gpuHelperAppName) ||
			filePath.includes(pluginHelperAppName) ||
			filePath.includes(rendererHelperAppName);
	}
});

const gpuHelperOpts = Object.assign(defaultOpts, {
	app: path.join(appFrameworkPath, gpuHelperAppName),
	entitlements: path.join(__dirname, 'azure-pipelines', 'darwin', 'helper-gpu-entitlements.plist'),
	'entitlements-inherit': path.join(__dirname, 'azure-pipelines', 'darwin', 'helper-gpu-entitlements.plist'),
});

const pluginHelperOpts = Object.assign(defaultOpts, {
	app: path.join(appFrameworkPath, pluginHelperAppName),
	entitlements: path.join(__dirname, 'azure-pipelines', 'darwin', 'helper-plugin-entitlements.plist'),
	'entitlements-inherit': path.join(__dirname, 'azure-pipelines', 'darwin', 'helper-plugin-entitlements.plist'),
});

const rendererHelperOpts = Object.assign(defaultOpts, {
	app: path.join(appFrameworkPath, rendererHelperAppName),
	entitlements: path.join(__dirname, 'azure-pipelines', 'darwin', 'helper-renderer-entitlements.plist'),
	'entitlements-inherit': path.join(__dirname, 'azure-pipelines', 'darwin', 'helper-renderer-entitlements.plist'),
});

gulp.task('vscode-codesign', async () => {
	const buildDir = process.env['AGENT_BUILDDIRECTORY'];

	if (!buildDir) {
		throw new Error('$AGENT_BUILDDIRECTORY not set');
	}

	if (process.env.VSCODE_QUALITY !== 'insider' && process.env.VSCODE_QUALITY !== 'stable') {
		return;
	}

	await Promise.all([
		signAsync(appOpts),
		signAsync(gpuHelperOpts),
		signAsync(pluginHelperOpts),
		signAsync(rendererHelperOpts)
	]).catch((err) => {
		throw new Error('Code Signing Failed : ' + err);
	});
});
