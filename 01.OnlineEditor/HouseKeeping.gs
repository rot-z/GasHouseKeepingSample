///
/// Entry function
///
/// - Delete file not modified certain period of time under specified folder
/// - Delete empty subfolder
///
function doHouseKeeping() {
  
  // Get root folder id from script property
  var scriptProperty = PropertiesService.getScriptProperties().getProperties();
  var ROOT_FOLDER_ID = scriptProperty.ROOT_FOLDER_ID;
  
  // Generate target date
  var baseDate = new Date();
  baseDate.setDate(baseDate.getDate() - 5);
  //baseDate.setSeconds(baseDate.getSeconds() - 1);  // for Debug.
  
  // Clean up file & folder
  var result = cleanUpFolder(ROOT_FOLDER_ID, baseDate);
  
  // Empty trash.
  // If this code isn't exist, Google drive entity still survived.
  Drive.Files.emptyTrash();
  
  // Report to Stackdriver
  reportToStackdriver(result.removedObjects);
  
}

///
/// Delete file and empty subfolder.
///
function cleanUpFolder(parentFolderId, baseDate){
  
  // Initialization
  var result = {};
  result.isEmpty = false;
  result.removedObjects = new Array();
  
  // Get parent folder id
  var currentFolder = DriveApp.getFolderById(parentFolderId);
  
  // Get all subfolders
  var folderList = new Array();
  var folders = DriveApp.searchFolders("'"+parentFolderId+"' in parents");
  while(folders.hasNext()){
    var folder = folders.next();
    folderList.push(folder);
  }
  
  for(var i = 0; i < folderList.length; i++){
    // Delete files recursively
    var folderResult = cleanUpFolder(folderList[i].getId(), baseDate);
    if (folderResult.isEmpty){
      // Remember deleted file and subfolder names
      Array.prototype.push.apply(result.removedObjects, folderResult.removedObjects);
      // Remember empty subfolder
      result.removedObjects.push(folderList[i].getName());
      // Delete empty subfolder
      currentFolder.removeFolder(folderList[i]);
    }
  }
  
  // Get all files
  var fileList = new Array();
  var files = DriveApp.searchFiles("'"+parentFolderId+"' in parents");
  while(files.hasNext()){
    var file = files.next();
    fileList.push(file);
  }
  
  for(var i = 0; i < fileList.length; i++){
    // Get last updated time
    var targetDate = fileList[i].getLastUpdated();
    if (targetDate.getTime() < baseDate.getTime()){
      // Remember file name to delete
      result.removedObjects.push(fileList[i].getName());
      // Delete file
      fileList[i].setTrashed(true);
    }
  }
  
  // Count files and subfolders
  folders = DriveApp.searchFolders("'"+parentFolderId+"' in parents");
  files = DriveApp.searchFiles("'"+parentFolderId+"' in parents");
  if ((!folders.hasNext()) && (!files.hasNext())){
    // Parent folder is empty
    result.isEmpty = true;
  }
  else {
    // Parent folder is not empty
    result.isEmpty = false;
  }
  
  return result;
  
}

///
/// Report result of housekeeping to Stackdriver 
///
function reportToStackdriver(removedObjects){
  
  if (removedObjects.length < 1) {
    console.info("[HouseKeeping] no objects has deleted.");
  }
  else {
    //console.info("%s Delete objects:", prefix);
    //for (var i in removedObjects) {
    //  rep = rep + "\n  " + removedObjects[i];
    //}
    console.info("[HouseKeeping] DELETE OBJECTS: ", removedObjects);
  }
}
