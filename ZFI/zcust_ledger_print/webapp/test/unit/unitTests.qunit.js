/* global QUnit */
// https://api.qunitjs.com/config/autostart/
QUnit.config.autostart = false;

sap.ui.require([
	"zcust_ledger_print/test/unit/AllTests"
], function (Controller) {
	"use strict";
	QUnit.start();
});