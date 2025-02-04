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

    return Controller.extend("zcustledgerprint.controller.FirstScreen", {
        onInit() {
            var fnValidator2 = function (args) { 
                var text = args.text;
                return new Token({ key: text, text: text });
            };
            this.getView().byId("idCustomerCodeInput").addValidator(fnValidator2);
            this.getView().byId("idProfitCenterInput").addValidator(fnValidator2);
        },
        onSave: function(oEv){
            alert("dev")
        },
        onExecuteButtonPress() {
            var oBusyDialog = new sap.m.BusyDialog({ title: "Loading", text: "Please wait" });
            var CompanyCode = this.getView().byId("idCompanyCodeInput").getValue();
            var FiscalYear = this.getView().byId("idFiscalYear").getValue();
            var CustomerCode = [];
            this.getView().byId("idCustomerCodeInput").getTokens().map(function (item) { CustomerCode.push((item.getText()).padStart(10, "0")); });
            var ProfitCenter = [];
            this.getView().byId("idProfitCenterInput").getTokens().map(function (item) { ProfitCenter.push((item.getText()).padStart(10, "0")); });
            oBusyDialog.open();
            var FromDate = this.getView().byId("idFromDate").getValue().replace(/-/g, "");
            var ToDate = this.getView().byId("idToDate").getValue().replace(/-/g, "") == "" ? FromDate : this.getView().byId("idToDate").getValue().replace(/-/g, "");
            $.ajax({
                url: "/sap/bc/http/sap/ZCUST_LEDGER_HTTP?sap-client=080" + "&CompanyCode=" + CompanyCode + "&FiscalYear=" + FiscalYear + "&FromDate=" + FromDate + "&ToDate=" + ToDate + "&CustomerCode=" + CustomerCode + "&ProfitCenter=" + ProfitCenter,
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


        onProfitCenterValueHelpRequest: function () { this.byId("idProfitCenterSelectDialog").open(); },
        onProfitCenterSelectDialogSearch: function (oEvent) {
            var sValue = oEvent.getParameter("value");
            var oFilter2 = new sap.ui.model.Filter("Customer", sap.ui.model.FilterOperator.Contains, sValue);
            var oFilter1 = new sap.ui.model.Filter("CustomerName", sap.ui.model.FilterOperator.Contains, sValue);
            var oCombinedFilter = new sap.ui.model.Filter({ filters: [oFilter2, oFilter1], and: false });
            var oBinding = oEvent.getSource().getBinding("items");
            oBinding.filter(oCombinedFilter);
        },
        onProfitCenterSelectDialogConfirm: function (oEvent) {
            var oMultiInput = this.byId("idProfitCenterInput");
            oEvent.getParameter("selectedContexts").forEach(function (oItem) { oMultiInput.addToken(new sap.m.Token({ text: oItem.getObject().ProfitCenter })); });
        },
    });
});