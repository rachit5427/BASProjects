/* global QUnit */
// https://api.qunitjs.com/config/autostart/
QUnit.config.autostart = false;

sap.ui.require([
	"zpurchase_vs_target_tmg/test/unit/AllTests"
], function (Controller) {
	"use strict";
	QUnit.start();
});