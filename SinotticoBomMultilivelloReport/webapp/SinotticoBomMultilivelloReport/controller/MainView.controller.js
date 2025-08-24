sap.ui.define([
    'jquery.sap.global',
	"sap/dm/dme/podfoundation/controller/PluginViewController",
	"sap/ui/model/json/JSONModel",
    "sap/ui/export/Spreadsheet",
    "sap/m/MessageBox",
    "../utilities/CommonCallManager",
    "./popup/OrderProgressPopup",
], function (jQuery, PluginViewController, JSONModel, Spreadsheet, MessageBox, CommonCallManager, OrderProgressPopup) {
	"use strict";

	return PluginViewController.extend("kpmg.custom.SinotticoBomMultilivelloReport.SinotticoBomMultilivelloReport.SinotticoBomMultilivelloReport.controller.MainView", {
		SinotticoBomModel: new JSONModel(),
        OrderProgressPopup: new OrderProgressPopup(),
        onInit: function () {
			PluginViewController.prototype.onInit.apply(this, arguments);
            this.setInfoModel();
            this.setBasicProperties();
		},
        onAfterRendering: function(){
            var that=this;
            that.populateFilters();
        },
        getI18n: function(token) {
            return this.getView().getModel("i18n").getProperty(token);
        },
		setInfoModel: function() {
            var oModel = new JSONModel();
            //Imposto il mio modello globale -> Sarà accessibile da tutti i controller che ereditano il mio BaseController
            sap.ui.getCore().setModel(oModel, "InfoModel");
        },
        getInfoModel: function(){
            return sap.ui.getCore().getModel("InfoModel");
        },
		setBasicProperties: function(){
            this.getInfoModel().setProperty("/BaseProxyURL",this.getConfiguration().BaseProxyURL);
            this.getInfoModel().setProperty("/plant",this.getConfiguration().Plant);
            this.getInfoModel().setProperty("/user_id",this.getUserId());
            this.getInfoModel().setProperty("/appKey",this.getConfiguration().appKey);
			this.getView().setModel(this.SinotticoBomModel, "SinotticoBomModel");
        },
        showToast: function(sMessage) {
            sap.m.MessageToast.show(sMessage);
        },
        showErrorMessageBox: function(oMessage) {
            MessageBox.error(oMessage, {
                title: "Error", // Titolo della finestra
                actions: [sap.m.MessageBox.Action.CLOSE], // Azione per chiudere il messaggio
                onClose: function (oAction) {
                }
            });
        },
        populateFilters: function(){
            var that=this;
            let BaseProxyURL = that.getInfoModel().getProperty("/BaseProxyURL");
            let pathAPIFilter = "/api/getFilterSinotticoBom";
            let url = BaseProxyURL+pathAPIFilter;
            let plant = that.getInfoModel().getProperty("/plant");
            let params = {
                "plant": plant
            }
            // Callback di successo
            var successCallback = function(response) {
                var oFilterModel = new JSONModel(response);
                oFilterModel.setSizeLimit(10000);
                this.getView().setModel(oFilterModel,"FilterModel");
            };

            // Callback di errore
            var errorCallback = function(error) {
                console.log("Chiamata POST fallita:", error);
            };
            CommonCallManager.callProxy("POST", url, params, true, successCallback, errorCallback, that);

        },
        onGoPress: function(){
			var that=this;
			let BaseProxyURL = that.getInfoModel().getProperty("/BaseProxyURL");
            let pathApi = "/api/getSinotticoBomMultilivelloReport";
            let url = BaseProxyURL+pathApi;
            var treeTable = that.getView().byId("SinotticoTreeTable");
            let plant = that.getInfoModel().getProperty("/plant");
			let projectValue = that.getView().byId("projectInputId").getValue();
			let machineMaterialValue = that.getView().byId("machineMaterialInputId").getValue();

            //treeTable.setBusy(true);
			
            let params = {
                "plant": plant,
				"project":projectValue,
				"machineMaterial":machineMaterialValue,
                "callFrom":"SinotticoReport"
            }
            // Callback di successo
            var successCallback = function(response) {
				that.getView().getModel("SinotticoBomModel").setProperty("/MaterialList",[response]);
                //that.getView().byId("SinotticoTreeTable").setBusy(false);
                //that.goToRuntimeOrder([response]);
            };

            // Callback di errore
            var errorCallback = function(error) {
                //that.getView().byId("SinotticoTreeTable").setBusy(false);
                console.log("Chiamata POST fallita:", error);
            };
            CommonCallManager.callProxy("POST", url, params, true, successCallback, errorCallback, that,false,true);
		},
        // goToRuntimeOrder: function(aNodes){
        //     var that=this;
        //     var oTreeTable = that.getView().byId("SinotticoTreeTable");
        //     let runTimeOrder = that.SinotticoBomModel.getProperty("/RUN_TIME_ORDER");

        //     const oState = this._flattenTreeData(aNodes,runTimeOrder);

        //     if (oState.foundIndex !== -1) {
        //         oTreeTable.expandToLevel(oState.maxDepth);
        //         // Scrolla fino all'ordine di runTime
        //         oTreeTable.setFirstVisibleRow(oState.foundIndex);
        //     }
        // },
        // //Ritorno l'oggetto oState che contiene i livelli espansi per trovare l'ordine e l'indice della riga trovata se trovata altrimenti -1
        // _flattenTreeData: function (aNodes, runTimeOrder, aFlatList = [], iLevel = 0, oState = { maxDepth: 0, foundIndex: -1 }) {
        //     for (let i = 0; i < aNodes.length; i++) {
        //         const oNode = aNodes[i];
        //         oNode._flatIndex = aFlatList.length;
        //         oNode._treeLevel = iLevel;
        //         aFlatList.push(oNode);
        
        //         if (iLevel > oState.maxDepth) {
        //             oState.maxDepth = iLevel;
        //         }
        
        //         if (oNode.Order === runTimeOrder) {
        //             oState.foundIndex = oNode._flatIndex;
        //             return oState;  // nodo trovato, ritorna subito stato
        //         }
        
        //         if (oNode.Children && oNode.Children.length > 0) {
        //             let result = this._flattenTreeData(oNode.Children, runTimeOrder, aFlatList, iLevel + 1, oState);
        //             if (result.foundIndex !== -1) {
        //                 return result; // nodo trovato nei figli, ritorna risultato
        //             }
        //         }
        //     }
        //     return oState; // nodo non trovato in questo ramo, ritorna stato aggiornato
        // },
        // getStatusIcon: function(sfcStatus){
        //     var that=this;
        //     //In Work
        //     if(sfcStatus==="403"){
        //         return "sap-icon://circle-task-2";
        //     //New
        //     } else if (sfcStatus==="401"){
        //         return "sap-icon://rhombus-milestone-2"
        //     //In Queue
        //     } else if (sfcStatus==="402"){
        //         return "sap-icon://color-fill";
        //     //Completed
        //     } else {
        //         return "sap-icon://complete";
        //     }
            
        // },
        // getStatusColor: function(sfcStatus){
        //     var that=this;
        //     if(sfcStatus==="403"){
        //         return "green";
        //     } else if (sfcStatus==="401"){
        //         return "grey"
        //     } else if (sfcStatus==="402"){
        //         return "blue"
        //     } else {
        //         return "green"
        //     }
        // },
        onExpandAll: function() {
            var that=this;
			var oTreeTable = this.byId("SinotticoTreeTable");
			oTreeTable.expandToLevel(4);
		},
        onCollapseAll: function() {
            var that=this;
			var oTreeTable = this.byId("SinotticoTreeTable");
			oTreeTable.collapseAll();
		},
        // rowSelectionChange: function(oEvent){
        //     var that=this;
        //     var oTable = oEvent.getSource();
        //     var selectedIndex = oTable.getSelectedIndex();
        //     if(selectedIndex!==-1){
        //         var selectedObj = oTable.getContextByIndex(selectedIndex).getObject();
        //         that.OrderProgressPopup.open(that.getView(), that,selectedObj);
        //         oTable.setSelectedIndex(-1);
        //     }
            
        // },
		onExit: function () {
			PluginViewController.prototype.onExit.apply(this, arguments);


		}
	});
});