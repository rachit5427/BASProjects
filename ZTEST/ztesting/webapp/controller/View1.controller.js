sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "ztesting/controller/xlsx.min",
], (Controller, MessageBox) => {
    "use strict";

    return Controller.extend("ztesting.controller.View1", {
        onInit() {
            this.getView().setModel(new sap.ui.model.json.JSONModel, "oDataModel");
            this.getView().getModel("oDataModel").setProperty("/aMessage", []);
            this.getView().getModel("oDataModel").setProperty("/aTableData", [{
                Description: "",
                Name: "",
                DeliveryNumber: "wqqqqqqqqqq",
            }]);

            var oChatModel = new sap.ui.model.json.JSONModel({
                messages: []
            });
            this.getView().setModel(oChatModel, "chatModel");
        },
        onCallDeliveryDocumentItem(oEvent) {
            this.getView().byId('idSpreadsheetUploadDialog').open();
        },
        onDialogCancelButtonPress(oEvent) {
            this.getView().byId('idSpreadsheetUploadDialog').close();
        },
        onDialogCancelButtonPress(oEvent) {
            this.getView().byId('idSpreadsheetUploadDialog').close();
        },
        onIconPress: function () {
            var aMessage = this.getView().getModel("oDataModel").getProperty("/aMessage");
            aMessage.push({ "message": this.getView().byId("idTextArea").getValue(), "sender": "User" })
            aMessage.push({ "message": "Received Msg", "sender": "User2" })
            this.getView().byId("idTextArea").setValue();
            this.getView().getModel("oDataModel").setProperty("/aMessage", aMessage);
        },
        openChatDialog: function () {
            if (!this.oChatDialog) {
                this.oChatDialog = this.getView().byId("chatDialog");
            }
            this.oChatDialog.open();
        },
        onSendMessage: function () {
            var oView = this.getView();
            var oChatModel = oView.getModel("chatModel");
            var sMessage = oView.byId("chatInput").getValue();

            if (sMessage.trim() !== "") {
                var aMessages = oChatModel.getProperty("/messages");

                // Add User Message
                aMessages.push({ sender: "User", message: sMessage });
                oChatModel.setProperty("/messages", aMessages);
                oView.byId("chatInput").setValue("");

                // Simulate Reply After 1 Second
                setTimeout(() => {
                    this.receiveMessage("reply.");
                }, 1000);
            }
        },

        receiveMessage: function (sMessage) {
            var oChatModel = this.getView().getModel("chatModel");
            var aMessages = oChatModel.getProperty("/messages");

            // Add Received Message
            aMessages.push({ sender: "Bot", message: sMessage });
            oChatModel.setProperty("/messages", aMessages);
        },
    });
});