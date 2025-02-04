/*global QUnit*/

sap.ui.define([
	"zpurchase_vs_target_tmg/controller/FirstScreen.controller"
], function (Controller) {
	"use strict";

	QUnit.module("FirstScreen Controller");

	QUnit.test("I should test the FirstScreen controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
