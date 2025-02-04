sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    'sap/m/SearchField',
    "sap/m/Token",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Filter",
], (Controller, UIComponent, Fragment, JSONModel, MessageBox, SearchField, Token, FilterOperator, Filter) => {
    "use strict";

    return Controller.extend("zopensoprint.controller.FirstScreen", {
        onInit() {
            var fnValidator2 = function (args) {
                var text = args.text;
                return new Token({ key: text, text: text });
            };
            this.getView().byId("idCustomerCodeInput").addValidator(fnValidator2);
            this.getView().byId("idHasteCodeInput").addValidator(fnValidator2);
            this.getView().byId("idSalesManCodeInput").addValidator(fnValidator2);
            this.getView().byId("idCatalogueCodeInput").addValidator(fnValidator2);
            this.getView().byId("idDesignCodeInput").addValidator(fnValidator2);
        },
        onExecuteButtonPress1: function () {
            var oView = this.getView(),
                oForm = oView.byId("idFirstSimpleForm"),
                oData = {};
        
            oForm.getContent().forEach(oControl => {
                if (oControl instanceof sap.m.Input || oControl instanceof sap.m.DatePicker) {
                    oData[oControl.getId().split('--id')[1]] = oControl.getValue();
                } else if (oControl instanceof sap.m.ComboBox) {
                    oData[oControl.getId().split('--id')[1]] = oControl.getSelectedKey();
                } else if (oControl instanceof sap.m.MultiInput) {
                    oData[oControl.getId().split('--id')[1]] = oControl.getTokens().map(t => t.getKey() || t.getText());
                }
            });
            console.log(oData);
        },
        onExecuteButtonPress() {
            var oBusyDialog = new sap.m.BusyDialog({ title: "Loading", text: "Please wait" });
            var SalesOffice = this.getView().byId("idSalesOfficeComboBox").getValue();
            var StorageLocation = this.getView().byId("idStorageLocationComboBox").getValue();
            var Division = this.getView().byId("idDivisionComboBox").getValue();
            var SalesDocumentType = this.getView().byId("idSalesDocumentTypeComboBox").getValue();

            var FromSalesOrderNo = this.getView().byId("idFromSalesOrderNoInput").getValue();
            var ToSalesOrderNo = this.getView().byId("idToSalesOrderNoInput").getValue();
            var FromDate = this.getView().byId("idFromDate").getValue().replace(/-/g, "");
            var ToDate = this.getView().byId("idToDate").getValue().replace(/-/g, "") == "" ? FromDate : this.getView().byId("idToDate").getValue().replace(/-/g, "");
            var CustomerCode = [];
            this.getView().byId("idCustomerCodeInput").getTokens().map(function (item) { CustomerCode.push((item.getText()).padStart(10, "0")); });
            var HasteCode = [];
            this.getView().byId("idHasteCodeInput").getTokens().map(function (item) { HasteCode.push((item.getText()).padStart(10, "0")); });
            var SalesManCode = [];
            this.getView().byId("idSalesManCodeInput").getTokens().map(function (item) { SalesManCode.push((item.getText()).padStart(10, "0")); });
            var CatalogueCode = [];
            this.getView().byId("idCatalogueCodeInput").getTokens().map(function (item) { CatalogueCode.push((item.getText()).padStart(10, "0")); });
            var DesignCode = [];
            this.getView().byId("idDesignCodeInput").getTokens().map(function (item) { DesignCode.push((item.getText()).padStart(10, "0")); });
            oBusyDialog.open();
            $.ajax({
                url: "/sap/bc/http/sap/ZOPEN_SO_PRINT_HTTP?sap-client=080" + "&FromSalesOrderNo=" + FromSalesOrderNo + "&ToSalesOrderNo=" + ToSalesOrderNo + "&FromDate=" + FromDate +
                    "&ToDate=" + ToDate + "&CustomerCode=" + CustomerCode + "&HasteCode=" + HasteCode + "&SalesManCode=" + SalesManCode + "&CatalogueCode=" + CatalogueCode +
                    "&DesignCode=" + DesignCode +
                    "&SalesOffice=" + SalesOffice +
                    "&StorageLocation=" + StorageLocation +
                    "&Division=" + Division +
                    "&SalesDocumentType=" + SalesDocumentType,
                type: "GET",
                beforeSend: function (xhr) { xhr.withCredentials = true; },
                success: function (result) {
                    if (result != "") {
                        var decodedPdfContent = atob(result);
                        var byteArray = new Uint8Array(decodedPdfContent.length);
                        for (var i = 0; i < decodedPdfContent.length; i++) { byteArray[i] = decodedPdfContent.charCodeAt(i); }
                        var blob = new Blob([byteArray.buffer], { type: 'application/pdf' });
                        var _pdfurl = URL.createObjectURL(blob);
                        if (!this._PDFViewer) {
                            this._PDFViewer = new sap.m.PDFViewer({
                                width: "auto",
                                source: _pdfurl
                            });
                            jQuery.sap.addUrlWhitelist("blob"); // register blob url as whitelist
                        } else {
                            this._PDFViewer = new sap.m.PDFViewer({
                                width: "auto",
                                source: _pdfurl
                            });
                            jQuery.sap.addUrlWhitelist("blob"); // register blob url as whitelist
                        }
                        this._PDFViewer.open();
                        oBusyDialog.close();
                    } else { oBusyDialog.close(); }
                }.bind(this),
                error() { sap.m.MessageBox.error("Error"); oBusyDialog.close(); }
            });
        },

        onSalesOrderValueHelpRequest: function (oEvent) {
            this.val = oEvent.getSource();
            this.byId("idOrderNumberSelectDialog").open();
        },
        onOrderNumberSelectDialogSearch: function (oEvent) {
            var sValue = oEvent.getParameter("value");
            var oFilter2 = new sap.ui.model.Filter("SalesOrder", sap.ui.model.FilterOperator.Contains, sValue);
            // var oFilter1 = new sap.ui.model.Filter("CustomerName", sap.ui.model.FilterOperator.Contains, sValue);
            var oCombinedFilter = new sap.ui.model.Filter({ filters: [oFilter2], and: false });
            var oBinding = oEvent.getSource().getBinding("items");
            oBinding.filter(oCombinedFilter);
        },
        onOrderNumberSelectDialogConfirm: function (oEvent) {
            var oInput = this.val;
            oInput.setValue(oEvent.getParameter("selectedContexts")[0].getObject().SalesOrder);
        },

        onCustomerCodeValueHelpRequest: function () { this.byId("idCustomerCodeSelectDialog").open(); },
        onCustomerCodeSelectDialogSearch: function (oEvent) {
            var sValue = oEvent.getParameter("value");
            var oFilter2 = new sap.ui.model.Filter("Customer", sap.ui.model.FilterOperator.Contains, sValue);
            var oFilter1 = new sap.ui.model.Filter("CustomerName", sap.ui.model.FilterOperator.Contains, sValue);
            var oCombinedFilter = new sap.ui.model.Filter({ filters: [oFilter2, oFilter1], and: false });
            var oBinding = oEvent.getSource().getBinding("items");
            oBinding.filter(oCombinedFilter);
        },
        onCustomerCodeSelectDialogConfirm: function (oEvent) {
            var oMultiInput = this.byId("idCustomerCodeInput");
            oEvent.getParameter("selectedContexts").forEach(function (oItem) { oMultiInput.addToken(new sap.m.Token({ text: oItem.getObject().Customer })); });
        },


        onHasteCodeValueHelpRequest: function () { this.byId("idHasteCodeSelectDialog").open(); },
        onHasteCodeSelectDialogSearch: function (oEvent) {
            var sValue = oEvent.getParameter("value");
            var oFilter2 = new sap.ui.model.Filter("Customer", sap.ui.model.FilterOperator.Contains, sValue);
            var oFilter1 = new sap.ui.model.Filter("CustomerName", sap.ui.model.FilterOperator.Contains, sValue);
            var oCombinedFilter = new sap.ui.model.Filter({ filters: [oFilter2, oFilter1], and: false });
            var oBinding = oEvent.getSource().getBinding("items");
            oBinding.filter(oCombinedFilter);
        },
        onHasteCodeSelectDialogConfirm: function (oEvent) {
            var oMultiInput = this.byId("idHasteCodeInput");
            oEvent.getParameter("selectedContexts").forEach(function (oItem) { oMultiInput.addToken(new sap.m.Token({ text: oItem.getObject().Customer })); });
        },


        onSalesManCodeValueHelpRequest: function () { this.byId("idSalesManCodeSelectDialog").open(); },
        onSalesManCodeSelectDialogSearch: function (oEvent) {
            var sValue = oEvent.getParameter("value");
            var oFilter2 = new sap.ui.model.Filter("Supplier", sap.ui.model.FilterOperator.Contains, sValue);
            var oFilter1 = new sap.ui.model.Filter("SupplierName", sap.ui.model.FilterOperator.Contains, sValue);
            var oCombinedFilter = new sap.ui.model.Filter({ filters: [oFilter2, oFilter1], and: false });
            var oBinding = oEvent.getSource().getBinding("items");
            oBinding.filter(oCombinedFilter);
        },
        onSalesManCodeSelectDialogConfirm: function (oEvent) {
            var oMultiInput = this.byId("idSalesManCodeInput");
            oEvent.getParameter("selectedContexts").forEach(function (oItem) { oMultiInput.addToken(new sap.m.Token({ text: oItem.getObject().Supplier })); });
        },


        onCatalogueCodeValueHelpRequest: function () { this.byId("idCatalogueCodeSelectDialog").open(); },
        onCatalogueCodeSelectDialogSearch: function (oEvent) {
            var sValue = oEvent.getParameter("value");
            var oFilter2 = new sap.ui.model.Filter("Product", sap.ui.model.FilterOperator.Contains, sValue);
            var oFilter1 = new sap.ui.model.Filter("ProductDescription", sap.ui.model.FilterOperator.Contains, sValue);
            var oCombinedFilter = new sap.ui.model.Filter({ filters: [oFilter2, oFilter1], and: false });
            var oBinding = oEvent.getSource().getBinding("items");
            oBinding.filter(oCombinedFilter);
        },
        onCatalogueCodeSelectDialogConfirm: function (oEvent) {
            var oMultiInput = this.byId("idCatalogueCodeInput");
            oEvent.getParameter("selectedContexts").forEach(function (oItem) { oMultiInput.addToken(new sap.m.Token({ text: oItem.getObject().Product })); });
        },


        onDesignCodeValueHelpRequest: function () { this.byId("idDesignCodeSelectDialog").open(); },
        onDesignCodeSelectDialogSearch: function (oEvent) {
            var sValue = oEvent.getParameter("value");
            var oFilter2 = new sap.ui.model.Filter("Product", sap.ui.model.FilterOperator.Contains, sValue);
            var oFilter1 = new sap.ui.model.Filter("ProductDescription", sap.ui.model.FilterOperator.Contains, sValue);
            var oCombinedFilter = new sap.ui.model.Filter({ filters: [oFilter2, oFilter1], and: false });
            var oBinding = oEvent.getSource().getBinding("items");
            oBinding.filter(oCombinedFilter);
        },
        onDesignCodeSelectDialogConfirm: function (oEvent) {
            var oMultiInput = this.byId("idDesignCodeInput");
            oEvent.getParameter("selectedContexts").forEach(function (oItem) { oMultiInput.addToken(new sap.m.Token({ text: oItem.getObject().Product })); });
        },


    });
});