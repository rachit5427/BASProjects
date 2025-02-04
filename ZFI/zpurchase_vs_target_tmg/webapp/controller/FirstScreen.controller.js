sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox"
], (Controller, MessageBox) => {
    "use strict";

    return Controller.extend("zpurchasevstargettmg.controller.FirstScreen", {
        onInit() {
            this.getView().setModel(new sap.ui.model.json.JSONModel(), "oDataModel");
            this.getView().getModel("oDataModel").setProperty("/aTableData", []);
            this.CallTMGsData();
        },
        CallTMGsData: function (sEntitySet, sModelPath) {
            const oBusyDialog = new sap.m.BusyDialog({ text: "Please Wait" });
            const that = this;
            oBusyDialog.open();
            $.ajax({
                type: "POST",
                url: "/sap/bc/http/sap/ZPURCHASE_VS_TARGET_TMG?sap-client=080&Method=Get",
                data: JSON.stringify({

                }),
                contentType: "application/json; charset=utf-8",
                traditional: true,
                success: function (oresponse) {
                    const oRespo = (JSON.parse(oresponse)).RESULT;
                    const oRespo1 = [];
                    oBusyDialog.close();
                    oRespo.map(function (item) {
                        oRespo1.push({
                            keyFieldEditable: false,
                            BackDataAvl: true,
                            GLCode: item.GLCODE,
                            GLDescription: item.GLDESCRIPTION,
                            StandardPercentage: item.STANDARDPERCENTAGE,
                            FiscalYear: item.FISCALYEAR,
                        })
                    })
                    that.getView().getModel("oDataModel").setProperty("/aTableData", oRespo1);

                }.bind(this),
                error: function (error) {
                    oBusyDialog.close();
                    MessageBox.error(error);
                }
            });
        },
        onAddButtonPress() {
            const fiscalYear = new Date().getMonth() < 3 ? new Date().getFullYear() - 1 : new Date().getFullYear();
            const oDataModel = this.getView().getModel("oDataModel");
            const oDataConfig = {
                path: "/aTableData",
                newEntry: {
                    keyFieldEditable: true,
                    BackDataAvl: false,
                    GLCode: "",
                    GLDescription: "",
                    StandardPercentage: "",
                    FiscalYear: (fiscalYear).toString(),
                },
                requiredFields: ["GLCode", "FiscalYear"],
            };

            if (oDataConfig) {
                const aData = oDataModel.getProperty(oDataConfig.path) || [];
                const isValid = aData.length === 0 ||
                    oDataConfig.requiredFields.every((field) => aData[0][field] !== "");

                if (isValid) {
                    aData.unshift(oDataConfig.newEntry);
                    oDataModel.setProperty(oDataConfig.path, aData);
                }
                oDataModel.refresh("true");
            }
        },

        onSaveButtonPress: async function () {
            const that = this;
            const oDataModel = this.getView().getModel("oDataModel");
            const oBusyDialog = new sap.m.BusyDialog({ text: "Please Wait" });
            const aTableData = oDataModel.getProperty('/aTableData');
            $.ajax({
                type: "POST",
                url: "/sap/bc/http/sap/ZPURCHASE_VS_TARGET_TMG?sap-client=080&Method=Post",
                data: JSON.stringify({
                    aTableData: aTableData,
                }),
                contentType: "application/json; charset=utf-8",
                traditional: true,
                success: function (oresponse) {
                    oBusyDialog.close();
                    MessageBox.success(oresponse);
                }.bind(this),
                error: function (error) {
                    oBusyDialog.close();
                    MessageBox.error(error);
                }
            });
        },
        onDeleteButtonPress: function () {
            const oBusy = new sap.m.BusyDialog({ text: "Please Wait" });
            oBusy.open();
            const oDataModel = this.getView().getModel("oDataModel");
            const that = this;
            const oTable = this.getView().byId('idTable');
            const aSelectedIndices = oTable.getSelectedIndices();
            if (aSelectedIndices.length === 0) {
                oBusy.close();
                MessageBox.error("Please select at least one row");
                return;
            }

            const aTableData = oDataModel.getProperty('/aTableData');
            const aSelectedRows = aSelectedIndices.map(index =>
                parseInt(oTable.getContextByIndex(index).sPath.split("/").pop(), 10)
            );
            const aDeleteData = [];
            aSelectedRows.map(function (item) {
                if (aTableData[item].BackDataAvl == true) {
                    aDeleteData.push(aTableData[item]);
                }
            })
            const updatedData = aTableData.filter((_, index) => !aSelectedRows.includes(index));
            sap.m.MessageBox.warning("Are you sure you want to delete?", {
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                emphasizedAction: MessageBox.Action.YES,
                onClose: async sAction => {
                    if (sAction === MessageBox.Action.YES) {
                        if (aDeleteData.length != 0) {
                            $.ajax({
                                type: "POST",
                                url: "/sap/bc/http/sap/ZPURCHASE_VS_TARGET_TMG?sap-client=080&Method=Delete",
                                data: JSON.stringify({
                                    aTableData: aDeleteData,
                                }),
                                contentType: "application/json; charset=utf-8",
                                traditional: true,
                                success: function (oresponse) {
                                    oBusy.close();
                                    that.getView().getModel("oDataModel").setProperty("/aTableData", updatedData);
                                    MessageBox.success(oresponse);
                                }.bind(this),
                                error: function (error) {
                                    oBusy.close();
                                    MessageBox.error(error);
                                }
                            });
                        } else {
                            oBusy.close();
                            that.getView().getModel("oDataModel").setProperty("/aTableData", updatedData);
                        }
                    } else {
                        oBusy.close();
                    }
                },
            });
        },
        onStandardPercentageLiveChange(oEvent) {
            if (Number(oEvent.getParameter("value")) > 100 || Number(oEvent.getParameter("value")) < 0) {
                oEvent.getSource().setValue();
            }
        },
        onGLCodeValueHelpRequest(oEvent) {
            this.sPath = oEvent.getSource().getBindingContext('oDataModel');
            this.byId("idSelectDialog").open();
        },
        onDialogSearch: function (oEvent) {
            var sValue = oEvent.getParameter("value");
            var oFilter2 = new sap.ui.model.Filter("GLAccount", sap.ui.model.FilterOperator.Contains, sValue);
            var oFilter1 = new sap.ui.model.Filter("GLAccountName", sap.ui.model.FilterOperator.Contains, sValue);
            var oCombinedFilter = new sap.ui.model.Filter({ filters: [oFilter2, oFilter1], and: false });
            var oBinding = oEvent.getSource().getBinding("items");
            oBinding.filter(oCombinedFilter);
        },
        onDialogClose: function (oEvent) {
            var sPath = this.sPath;
            this.getView().getModel('oDataModel').getProperty(sPath.getPath()).GLCode = oEvent.getParameter("selectedContexts")[0].getObject().GLAccount;
            this.getView().getModel('oDataModel').getProperty(sPath.getPath()).GLDescription = oEvent.getParameter("selectedContexts")[0].getObject().GLAccountName;
            this.getView().getModel('oDataModel').setProperty(sPath.getPath(), this.getView().getModel('oDataModel').getProperty(sPath.getPath()));
        },
    });
});