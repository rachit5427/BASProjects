/*global QUnit*/

sap.ui.define([
	"zcust_ledger_print/controller/FirstScreen.controller"
], function (Controller) {
	"use strict";

	QUnit.module("FirstScreen Controller");

	QUnit.test("I should test the FirstScreen controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
