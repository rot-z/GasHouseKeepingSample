///
/// Deploy function
///
/// - Set script property
/// - Set trigger
///
function onDeploy() {
  
  // Settings
  var ROOT_FOLDER_ID = "1B0JY0eT7Kc_JSptEAUODIfXNAOFxZdsZ";
  var FUNCTION_NAME = "doHouseKeeping";

  // Set root folder id
  PropertiesService.getScriptProperties().setProperty("ROOT_FOLDER_ID", ROOT_FOLDER_ID);

  // Delete trigger
  deleteTrigger(FUNCTION_NAME);

  // Set trigger
  ScriptApp.newTrigger(FUNCTION_NAME).timeBased().atHour(12).create();
}

///
/// Delete trigger if exists
///
function deleteTrigger(functonName) {

  var triggers = ScriptApp.getProjectTriggers();
  for(var i=0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() == functonName) {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }

}
