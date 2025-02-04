/*global QUnit*/

sap.ui.define([
	"zopen_so_print/controller/FirstScreen.controller"
], function (Controller) {
	"use strict";

	QUnit.module("FirstScreen Controller");

	QUnit.test("I should test the FirstScreen controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
