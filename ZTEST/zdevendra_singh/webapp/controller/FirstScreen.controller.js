sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";

    return Controller.extend("zdevendrasingh.controller.FirstScreen", {
        onInit() {
            this.getView().byId("id1Avatar").setSrc(sap.ui.require.toUrl("zdevendrasingh/css/profile.jpg"));
            this.getView().byId("id2Avatar").setSrc(sap.ui.require.toUrl("zdevendrasingh/css/profile.jpg"));

        }
    });
});