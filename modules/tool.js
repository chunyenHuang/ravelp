function tool(){
  function randomText(length){
    var text = "";
    var paragraph = "";
    var possible = "abcdefghijklmnopqrstuvwxyz";
    var paragraphLength = Math.floor(Math.random() * (length)) + 1;
    for(var x=0; x < paragraphLength; x++){
      text = "";
      var textLength = Math.floor(Math.random() * (10)) + 3;
      for( var i=0; i < textLength; i++ ){
        text += possible.charAt(Math.floor(Math.random() * possible.length));
      }
      paragraph = paragraph + text + " ";
    }
    return paragraph;
  }

  function sessionToken(length){
    var token = "";
    var possible = "abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for(var x=0; x < length; x++){
      token += possible.charAt(Math.floor(Math.random() * possible.length)+1);
    }
    return token;
  }

  function filterInt(value) {
    if (/^(\-|\+)?([0-9]+|Infinity)$/.test(value)){
      return Number(value);
    }
    return NaN;
  }

  return {
    randomText: randomText,
    sessionToken: sessionToken,
    filterInt: filterInt
  }
}

module.exports = tool();
